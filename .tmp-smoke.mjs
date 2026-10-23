// TEMPORARY smoke test - safe to delete
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TOKEN = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = path.join(os.tmpdir(), 'hrobit-chrome-' + Date.now());
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9223', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--window-size=1400,900', 'about:blank'], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 40; i++) {
  try { targets = await (await fetch('http://127.0.0.1:9223/json/list')).json(); break; }
  catch { await sleep(500); }
}
if (!targets) { console.error('CDP not reachable'); chrome.kill(); process.exit(1); }
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const issues = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === 'Runtime.consoleAPICalled' && (msg.params.type === 'error' || msg.params.type === 'warning')) {
    issues.push(`console.${msg.params.type}: ` + msg.params.args?.map((a) => a.value || a.description).join(' '));
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    issues.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
  }
  if (msg.method === 'Network.loadingFailed') {
    issues.push('NET FAIL: ' + msg.params.errorText);
  }
  if (msg.method === 'Network.responseReceived' && msg.params.response.url.includes('/api/')) {
    issues.push(`API ${msg.params.response.url} -> ${msg.params.response.status}`);
  }
};
const send = (method, params) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => { ws.onopen = r; });
await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');

// 1. No session -> should land on login
await send('Page.navigate', { url: 'http://localhost:4174/' });
await sleep(3000);
let text = (await send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 400)', returnByValue: true })).result.result.value;
console.log('=== NO SESSION (expect login) ===');
console.log(text);

// 2. Set session token -> dashboard should load real data
await send('Runtime.evaluate', { expression: `localStorage.setItem('hrobit-auth-token', ${JSON.stringify(TOKEN)}); localStorage.setItem('hrobit-auth-user', JSON.stringify({ id: 132, name: 'Git Doe' })); 'ok'`, returnByValue: true });
await send('Page.navigate', { url: 'http://localhost:4174/' });
await sleep(12000);
text = (await send('Runtime.evaluate', { expression: 'document.body.innerText', returnByValue: true })).result.result.value;
console.log('=== DASHBOARD (with session) ===');
console.log(text.slice(0, 2500));

// 3. Quick nav to recognition + announcements pages
await send('Page.navigate', { url: 'http://localhost:4174/recognition' });
await sleep(4000);
text = (await send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 800)', returnByValue: true })).result.result.value;
console.log('=== RECOGNITION ===');
console.log(text);

console.log('=== ISSUES ===');
console.log(issues.length ? issues.join('\n') : '(none)');
chrome.kill();
process.exit(0);
