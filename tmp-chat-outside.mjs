/* Temporary verification script (not part of the app). Deleted after the run. */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const APP = 'http://localhost:4173';
const DEBUG_PORT = 9337;
const USER = { id: 1, name: 'Haru Rowland', email: 'hr@simplify3x.com', access_role: 'HR Admin', department: 'People Ops', designation: 'HR Manager' };
const FAQS = [
  { id: 1, category: 'Leave', question: 'How many casual leaves do I get?', answer: 'You get 12 casual leaves per calendar year.' },
  { id: 2, category: 'Payroll', question: 'When is salary credited?', answer: 'Salaries are credited on the last working day of the month.' },
];

const results = [];
const consoleErrors = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function apiBody(url) {
  if (url.includes('/auth/me')) return { user: USER };
  if (url.includes('/faqs')) return { data: FAQS };
  if (url.includes('/dashboard/summary')) return { data: { pulse: { totalMembers: 5, activeMembers: 3, winsCelebrated: 1 } } };
  return { data: [] };
}

const profile = mkdtempSync(join(tmpdir(), 'chat-outside-'));
const chrome = spawn(CHROME, [
  '--headless', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu',
  '--window-size=1400,900', 'about:blank',
], { stdio: 'ignore' });

let ws;
let msgId = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++msgId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});

async function handleEvent(msg) {
  if (msg.method !== 'Fetch.requestPaused') return;
  const { requestId, request } = msg.params;
  try {
    if (!request.url.includes('localhost:3000')) return send('Fetch.continueRequest', { requestId });
    const cors = [
      { name: 'Access-Control-Allow-Origin', value: '*' },
      { name: 'Access-Control-Allow-Headers', value: '*' },
      { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
    ];
    if (request.method === 'OPTIONS') return send('Fetch.fulfillRequest', { requestId, responseCode: 204, responseHeaders: cors, body: '' });
    const body = JSON.stringify(apiBody(request.url));
    return send('Fetch.fulfillRequest', {
      requestId, responseCode: 200,
      responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, ...cors],
      body: Buffer.from(body).toString('base64'),
    });
  } catch (err) { console.error('intercept error', err); }
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'evaluate failed');
  return res.result?.value;
}

async function waitFor(expression, timeout = 15000, label = expression) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const v = await evaluate(expression); if (v) return v; } catch { /* retry */ }
    await sleep(250);
  }
  throw new Error(`timeout waiting for: ${label}`);
}

async function goto(path) {
  await send('Page.navigate', { url: `${APP}${path}` });
  await sleep(1400);
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
}

// Real pointer input via CDP (element.click() would not fire pointerdown).
async function clickAt(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' });
  await sleep(400);
}

async function clickSelector(selector) {
  const rect = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; })()`);
  if (!rect) throw new Error(`missing selector: ${selector}`);
  await clickAt(rect.x, rect.y);
}

const isOpen = () => evaluate(`!!document.querySelector('.chatbot-panel')`);

async function main() {
  let targets = null;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      targets = await res.json();
      if (targets.some((t) => t.type === 'page')) break;
    } catch { /* retry */ }
    await sleep(500);
  }
  const page = targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      if (msg.method === 'Runtime.exceptionThrown') consoleErrors.push(JSON.stringify(msg.params.exceptionDetails?.exception?.description || msg.params).slice(0, 300));
      if (msg.method === 'Log.entryAdded' && msg.params.entry?.level === 'error' && !msg.params.entry.text.includes('404')) consoleErrors.push(msg.params.entry.text.slice(0, 300));
      handleEvent(msg);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*localhost:3000*' }] });

  await goto('/');
  await evaluate(`localStorage.setItem('hrobit-auth-token','e2e-token');
    localStorage.setItem('hrobit-auth-user', ${JSON.stringify(JSON.stringify(USER))});
    localStorage.setItem('hrobit-demo-state-v1', ${JSON.stringify(JSON.stringify({ role: 'HR Admin' }))});`);
  await setViewport(1400, 900);
  await goto('/');
  await waitFor(`!!document.querySelector('.chatbot-launcher')`, 15000, 'launcher');

  // 1. launcher opens the panel
  await clickSelector('.chatbot-launcher');
  ok('launcher opens the assistant', await isOpen());

  // 2. clicking inside the panel keeps it open (input, then thread)
  await clickSelector('.chatbot-input-wrap input');
  const afterInput = await isOpen();
  await clickSelector('.chat-welcome h2');
  const afterInside = await isOpen();
  ok('clicks inside the panel keep it open', afterInput && afterInside, JSON.stringify({ afterInput, afterInside }));

  // 3. a real click anywhere else dismisses it
  await clickSelector('main h1, .page-title h1, main');
  ok('clicking outside closes the assistant', (await isOpen()) === false);

  // 4. dismissing keeps the conversation, and re-opening restores it
  await clickSelector('.chatbot-launcher');
  await waitFor(`!!document.querySelector('.chatbot-panel')`, 8000, 'panel reopened');
  await evaluate(`(() => { const input = document.querySelector('.chatbot-input-wrap input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'When is salary credited?'); input.dispatchEvent(new Event('input', { bubbles: true }));
    input.form.requestSubmit(); return true; })()`);
  await waitFor(`!!document.querySelector('.chat-message.bot:not(.chat-loading) p')`, 8000, 'answer');
  const msgCount = await evaluate(`document.querySelectorAll('.chat-message').length`);
  await clickSelector('.sidebar-nav a[href="/events"]');
  const closedBySidebar = (await isOpen()) === false;
  const pathAfterSidebar = await evaluate(`location.pathname`);
  await sleep(700);
  await clickSelector('.chatbot-launcher');
  await sleep(500);
  const restored = await evaluate(`(() => ({ open: !!document.querySelector('.chatbot-panel'), messages: document.querySelectorAll('.chat-message').length }))()`);
  ok('outside click still navigates the dashboard', closedBySidebar && pathAfterSidebar === '/events', pathAfterSidebar);
  ok('history survives dismissal and reopen', restored.open && restored.messages === msgCount, JSON.stringify({ msgCount, restored }));

  // 5. clicking the launcher while open still toggles closed (not double-handled)
  await clickSelector('.chatbot-launcher');
  ok('launcher click while open closes it', (await isOpen()) === false);

  // 6. Escape still works
  await clickSelector('.chatbot-launcher');
  await waitFor(`!!document.querySelector('.chatbot-panel')`, 8000, 'panel for escape');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(400);
  ok('Escape still closes the assistant', (await isOpen()) === false);

  // 7. custom event from the FAQ page still opens it
  await goto('/faq');
  await waitFor(`!!document.querySelector('.chatbot-launcher')`, 15000, 'launcher on faq');
  await evaluate(`window.dispatchEvent(new CustomEvent('hrobit-open-chat')); true;`);
  await sleep(600);
  ok('HR FAQ page "Open chat assistant" still works', await isOpen());

  // 8. tablet-ish width (floating card): click beside the card closes it
  await setViewport(700, 900);
  await goto('/');
  await waitFor(`!!document.querySelector('.chatbot-launcher')`, 15000, 'launcher 700px');
  await clickSelector('.chatbot-launcher');
  const card700 = await evaluate(`(() => { const r = document.querySelector('.chatbot-panel').getBoundingClientRect();
    return { floating: r.width < window.innerWidth - 40, left: Math.round(r.left), width: Math.round(r.width) }; })()`);
  await clickAt(60, 300);
  ok('700px: floating card, click beside it closes', card700.floating && (await isOpen()) === false, JSON.stringify(card700));

  // 9. mobile: full-screen sheet still opens/closes
  await setViewport(390, 844);
  await goto('/');
  await waitFor(`!!document.querySelector('.chatbot-launcher')`, 15000, 'launcher mobile');
  await clickSelector('.chatbot-launcher');
  const mobileSheet = await evaluate(`(() => { const el = document.querySelector('.chatbot-panel'); const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    let fixedAncestor = null; for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.transform !== 'none' || cs.filter !== 'none' || cs.perspective !== 'none' || cs.willChange.includes('transform')) { fixedAncestor = { cls: n.className, transform: cs.transform }; break; }
    }
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top), vw: window.innerWidth, vh: window.innerHeight,
      position: s.position, cssHeight: s.height, top: s.top, bottom: s.bottom, scrollY: window.scrollY,
      clientW: document.documentElement.clientWidth, clientH: document.documentElement.clientHeight, fixedAncestor }; })()`);
  ok('mobile: launcher opens the full-screen sheet', await isOpen() && mobileSheet.w === mobileSheet.vw && mobileSheet.h === mobileSheet.vh, JSON.stringify(mobileSheet));
  await clickAt(mobileSheet.vw - 20, 200);
  ok('mobile: tap inside the sheet keeps it open', await isOpen());
  await evaluate(`document.querySelector('.chatbot-icon-button[aria-label="Minimize chat"]').click(); true;`);
  await sleep(400);
  ok('mobile: minimize button closes the sheet', (await isOpen()) === false);
  await setViewport(1400, 900);

  ok('no runtime/console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' || ') || 'clean');
}

try {
  await main();
} catch (err) {
  ok('script completed', false, err.message);
} finally {
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  if (consoleErrors.length) console.log('console errors:\n' + consoleErrors.join('\n'));
  try { ws?.close(); } catch {}
  chrome.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
  process.exit(failed ? 1 : 0);
}
