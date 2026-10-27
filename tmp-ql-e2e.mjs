/* Temporary verification script (not part of the app). Deleted after the run. */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const APP = 'http://localhost:4173';
const DEBUG_PORT = 9333;

const LINKS = [
  { id: 1, title: 'Leave & attendance', description: 'Plan time off and log your daily attendance.', category: 'HR', url: '/events', icon: 'CalendarDays', placeholder: false },
  { id: 2, title: 'Learning portal', description: 'Browse assigned courses and see what is new this month for the whole team.', category: 'Learning', url: '/learning', icon: 'BookOpen', placeholder: false },
  { id: 3, title: 'Payroll portal', description: 'View monthly payslips and tax documents.', category: 'Benefits', url: 'https://payroll.example.com', icon: 'Gift', placeholder: false },
  { id: 4, title: 'IT help desk', description: '', category: 'Support', url: '#placeholder-helpdesk', icon: 'LifeBuoy', placeholder: true },
  { id: 5, title: 'Company intranet', description: 'Everything team related in one spot.', category: 'Tools', url: 'https://intranet.example.com', icon: 'Link2', placeholder: false },
];

let emptyMode = false;
const HR_USER = { id: 1, name: 'Haru Rowland', email: 'hr@simplify3x.com', access_role: 'HR Admin', department: 'People Ops', designation: 'HR Manager' };

const results = [];
const consoleErrors = [];
const ok = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function apiBody(url, method) {
  if (method === 'POST' || method === 'PUT' || method === 'DELETE') return { success: true, data: [] };
  if (url.includes('/auth/me')) return { user: HR_USER };
  if (url.includes('/quick-links')) return { data: emptyMode ? [] : LINKS };
  if (url.includes('/dashboard/summary')) return { data: { pulse: { totalMembers: 5, activeMembers: 3, winsCelebrated: 1 } } };
  return { data: [] };
}

const profile = mkdtempSync(join(tmpdir(), 'ql-e2e-'));
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
  if (msg.method === 'Fetch.requestPaused') {
    const { requestId, request } = msg.params;
    try {
      if (!request.url.includes('localhost:3000')) return send('Fetch.continueRequest', { requestId });
      const cors = [
        { name: 'Access-Control-Allow-Origin', value: '*' },
        { name: 'Access-Control-Allow-Headers', value: '*' },
        { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      ];
      if (request.method === 'OPTIONS') {
        return send('Fetch.fulfillRequest', { requestId, responseCode: 204, responseHeaders: cors, body: '' });
      }
      const body = JSON.stringify(apiBody(request.url, request.method));
      return send('Fetch.fulfillRequest', {
        requestId, responseCode: 200,
        responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, ...cors],
        body: Buffer.from(body).toString('base64'),
      });
    } catch (err) { console.error('intercept error', err); }
  }
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
  await sleep(1200);
}

async function setViewport(width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 500 });
  await sleep(400);
}

async function main() {
  // wait for chrome debug endpoint
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
      if (msg.method === 'Network.responseReceived' && msg.params.response?.status === 404 && !msg.params.response.url.includes('favicon')) consoleErrors.push('404: ' + msg.params.response.url);
      handleEvent(msg);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*localhost:3000*' }] });

  // 1. seed session on the origin
  await goto('/');
  await evaluate(`localStorage.setItem('hrobit-auth-token','e2e-token');
    localStorage.setItem('hrobit-auth-user', ${JSON.stringify(JSON.stringify(HR_USER))});
    localStorage.setItem('hrobit-demo-state-v1', ${JSON.stringify(JSON.stringify({ role: 'HR Admin' }))});`);
  await setViewport(1400, 900);
  await goto('/quick-links');

  // 2. cards render with data-driven content
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, '5 quick link cards');
  const cards = await evaluate(`document.querySelectorAll('.quicklink-card').length`);
  ok('renders one card per quick link', cards === 5, `${cards} cards`);

  const titles = await evaluate(`[...document.querySelectorAll('.quicklink-card h3')].map(e=>e.textContent)`);
  ok('card titles from API data', JSON.stringify(titles) === JSON.stringify(LINKS.map((l) => l.title)), titles.join(' | '));

  const icons = await evaluate(`[...document.querySelectorAll('.quicklink-big-icon svg')].length`);
  ok('every card has an icon', icons === 5, `${icons} icons`);

  const styles = await evaluate(`(() => { const c = document.querySelector('.quicklink-card'); const s = getComputedStyle(c);
    return { display: s.display, direction: s.flexDirection, cursor: s.cursor, radius: s.borderRadius, icon: !!document.querySelector('.quicklink-big-icon') }; })()`);
  ok('card is a flex-column clickable card', styles.display === 'flex' && styles.direction === 'column' && styles.cursor === 'pointer', JSON.stringify(styles));

  const equalHeights = await evaluate(`(() => { const els = [...document.querySelectorAll('.quicklink-card')]; const h = els.map(e=>Math.round(e.getBoundingClientRect().height));
    const rows = [...document.querySelectorAll('.quicklinks-page-grid')].map(g=>getComputedStyle(g).gridTemplateRows);
    return { n: els.length, h, rows, same: new Set(h).size === 1 }; })()`);
  ok('cards share consistent height', equalHeights.n === 5 && equalHeights.same, JSON.stringify(equalHeights));

  const hoverRules = await evaluate(`(() => { let css=''; for (const sheet of document.styleSheets) { try { for (const r of sheet.cssRules) css += r.cssText + '\\n'; } catch {} }
    return { hover: css.includes('.quicklink-card:hover') && css.includes('translateY(-3px)'), active: css.includes('.quicklink-card:active'), focus: css.includes('.quicklink-card:focus-visible'), grid: css.includes('.quicklinks-page-grid'), responsive: css.includes('@media (max-width: 640px)') }; })()`);
  ok('hover/active/focus + responsive rules compiled', hoverRules.hover && hoverRules.active && hoverRules.focus && hoverRules.grid && hoverRules.responsive, JSON.stringify(hoverRules));

  // 3. real hover moves the card
  // force the :hover pseudo-state through CDP (deterministic, no pointer-coordinate flakiness)
  await send('DOM.enable');
  await send('CSS.enable');
  const doc = await send('DOM.getDocument', { depth: 1 });
  const cardNode = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '.quicklink-card' });
  const beforeHover = await evaluate(`getComputedStyle(document.querySelector('.quicklink-card')).transform`);
  await send('CSS.forcePseudoState', { nodeId: cardNode.nodeId, forcedPseudoClasses: ['hover'] });
  await sleep(400);
  const hoveredTransform = await evaluate(`getComputedStyle(document.querySelector('.quicklink-card')).transform`);
  const hoverCta = await evaluate(`(() => { const b = document.querySelector('.quicklink-open'); const s = getComputedStyle(b); return { bg: s.backgroundColor, color: s.color }; })()`);
  ok('hover lifts the card + highlights CTA', beforeHover !== hoveredTransform && String(hoveredTransform).includes('-3') && hoverCta.bg === 'rgb(37, 99, 235)', JSON.stringify({ beforeHover, hoveredTransform, hoverCta }));
  await send('CSS.forcePseudoState', { nodeId: cardNode.nodeId, forcedPseudoClasses: [] });
  await sleep(300);
  ok('card returns to rest after hover', (await evaluate(`getComputedStyle(document.querySelector('.quicklink-card')).transform`)) !== hoveredTransform);

  // real pointer attempt as a secondary signal
  await send('Page.bringToFront');
  const rect = await evaluate(`(() => { const r = document.querySelector('.quicklink-card').getBoundingClientRect(); return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) }; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y, button: 'none', buttons: 0 });
  await sleep(400);
  const pointerHover = await evaluate(`document.querySelectorAll('.quicklink-card:hover').length`);
  console.log('  [debug] pointer hover count:', pointerHover);

  // 4. desktop grid is multi-column
  const cols = await evaluate(`getComputedStyle(document.querySelector('.quicklinks-page-grid')).gridTemplateColumns.split(' ').length`);
  ok('desktop grid is multi-column', cols >= 2, `${cols} columns @1400px`);

  // probe: does grid-auto-rows equalise rows on an auto-height grid?
  const rowsProbe = await evaluate(`(() => { const g = document.querySelector('.quicklinks-page-grid');
    const before = { rows: getComputedStyle(g).gridTemplateRows, hs: [...document.querySelectorAll('.quicklink-card')].map(e => Math.round(e.getBoundingClientRect().height)) };
    g.style.gridAutoRows = '1fr';
    const rows = getComputedStyle(g).gridTemplateRows;
    const cards = [...document.querySelectorAll('.quicklink-card')].map(e => ({ h: Math.round(e.getBoundingClientRect().height), clip: e.scrollHeight - e.clientHeight, pClip: e.querySelector('p') ? e.querySelector('p').scrollHeight - e.querySelector('p').clientHeight : 0 }));
    g.style.gridAutoRows = ''; return { before, rows, cards }; })()`);
  console.log('  [debug] grid-auto-rows:1fr probe:', JSON.stringify(rowsProbe));

  // 5. amber placeholder tag styling
  const tagBg = await evaluate(`(() => { const t = document.querySelector('.quicklink-card .tag'); return t ? getComputedStyle(t).backgroundColor : null; })()`);
  ok('placeholder tag styled (tag-amber)', tagBg === 'rgb(255, 251, 235)', String(tagBg));

  // 6. internal link navigates with react-router
  await evaluate(`document.querySelectorAll('.quicklink-card')[0].click()`);
  await sleep(700);
  const pathAfterInternal = await evaluate(`location.pathname`);
  ok('internal link navigates to destination', pathAfterInternal === '/events', pathAfterInternal);

  // 7. external link opens correctly; placeholder shows toast
  await goto('/quick-links');
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, 'cards after back nav');
  await evaluate(`window.open = (u) => { window.__opened = u; return null; }; document.querySelectorAll('.quicklink-card')[2].click(); true;`);
  await sleep(300);
  const opened = await evaluate(`window.__opened || null`);
  ok('external link opens its real destination', String(opened).startsWith('https://payroll.example.com'), String(opened));

  await evaluate(`document.querySelectorAll('.quicklink-card')[3].click(); true;`);
  await sleep(600);
  const toast = await evaluate(`(() => { const t = document.querySelector('.toast-message'); return t ? t.textContent : null; })()`);
  ok('placeholder link shows explanatory toast', Boolean(toast && toast.toLowerCase().includes('placeholder')), String(toast));

  // 8. search filters + "no results" empty state
  await goto('/quick-links');
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, 'cards for search test');
  await evaluate(`(() => { const input = document.querySelector('.links-toolbar input');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'zzzz-not-a-link'); input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  await sleep(500);
  const noResults = await evaluate(`(() => { const e = document.querySelector('.quicklink-empty h3'); return e ? e.textContent : null; })()`);
  ok('no-results empty state when search misses', noResults === 'No links found', String(noResults));

  // 9. responsive: mobile single column
  await setViewport(375, 812);
  await goto('/quick-links');
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, 'cards mobile');
  const mobile = await evaluate(`(() => ({ cols: getComputedStyle(document.querySelector('.quicklinks-page-grid')).gridTemplateColumns.split(' ').length,
    toolbar: getComputedStyle(document.querySelector('.links-toolbar')).flexDirection,
    hero: getComputedStyle(document.querySelector('.quicklinks-hero')).flexDirection }))()`);
  ok('mobile: single-column grid, stacked toolbar + hero', mobile.cols === 1 && mobile.toolbar === 'column' && mobile.hero === 'column', JSON.stringify(mobile));
  await setViewport(1400, 900);

  // 10. HR admin management
  await goto('/quick-links');
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, 'cards before manage');
  const hasManage = await evaluate(`(() => { const b = [...document.querySelectorAll('.page-title-actions button')].find(b => b.textContent.includes('Manage links')); if (b) { b.click(); return true; } return false; })()`);
  ok('HR Admin sees Manage links', Boolean(hasManage));
  await waitFor(`!!document.querySelector('.managed-list')`, 10000, 'managed list');
  const manage = await evaluate(`(() => ({ rows: document.querySelectorAll('.managed-row').length,
    actions: document.querySelectorAll('.managed-actions button').length,
    add: [...document.querySelectorAll('.page-title-actions button')].some(b => b.textContent.includes('Add quick link')),
    back: [...document.querySelectorAll('.back-to-feed button')].some(b => b.textContent.includes('Back to Quick Links')) }))()`);
  ok('admin manage view keeps add/edit/delete', manage.rows === 5 && manage.actions === 10 && manage.add && manage.back, JSON.stringify(manage));
  await evaluate(`(() => { const b = [...document.querySelectorAll('.back-to-feed button')].find(b => b.textContent.includes('Back')); if (b) b.click(); return true; })()`);
  await sleep(700);
  const backToCards = await evaluate(`document.querySelectorAll('.quicklink-card').length`);
  ok('back button returns to the cards', backToCards === 5, `${backToCards} cards`);

  // 11. configured-empty state
  emptyMode = true;
  await goto('/quick-links');
  await waitFor(`!!document.querySelector('.quicklink-empty h3')`, 10000, 'empty state');
  const emptyText = await evaluate(`(() => { const e = document.querySelector('.quicklink-empty h3'); return e ? e.textContent : null; })()`);
  ok('empty state when no links configured', emptyText === 'No quick links configured', String(emptyText));
  emptyMode = false;

  // 12. employee mode cannot manage
  await evaluate(`localStorage.setItem('hrobit-demo-state-v1', ${JSON.stringify(JSON.stringify({ role: 'Employee' }))}); true;`);
  await goto('/quick-links');
  await waitFor(`document.querySelectorAll('.quicklink-card').length === 5`, 15000, 'employee mode cards');
  const employeeManage = await evaluate(`[...document.querySelectorAll('.page-title-actions button')].some(b => b.textContent.includes('Manage links'))`);
  ok('employee mode hides Manage links', employeeManage === false, String(employeeManage));

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
