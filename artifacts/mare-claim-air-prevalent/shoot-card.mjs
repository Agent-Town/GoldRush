// PLAIN-BOOT CARD SHOTS. No `?debug`: the question this answers is Mistake #10's — "where does
// the PLAYER see this, in a plain boot?" — and the answer must be the contract card the run opens
// on, at desktop and at 390px. Drives chromium directly rather than adding an e2e spec, because
// this task's firewall keeps `e2e/` to
// re-points with a cited reason.
//
//   node artifacts/mare-claim-air-prevalent/shoot-card.mjs http://127.0.0.1:5308
//
// Copied from `artifacts/canyon-works-second-lever/shoot-card.mjs` and re-pointed at this
// contract and at this slice's two card sentences; the polling shape and its F-CWBC-2 note are
// that slice's measurement, kept because the card is just as transient here.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5308';
const DIR = fileURLToPath(new URL('.', import.meta.url));
const CONTRACT = 'e8-mare-claim';
const SIZES = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
];

await mkdir(DIR, { recursive: true });
const browser = await chromium.launch();
const failures = [];
for (const size of SIZES) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
  const page = await context.newPage();
  const noise = [];
  page.on('console', (message) => { if (message.type() === 'error') noise.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`));
  await page.addInitScript(({ contract }) => {
    try { localStorage.clear(); localStorage.setItem('gr.activeEpoch.v1', 'epoch-8-orbital'); } catch {}
    try { sessionStorage.clear(); sessionStorage.setItem('gr.contract.launch.v1', contract); } catch {}
  }, { contract: CONTRACT });
  await page.goto(`${BASE}/?contract=${CONTRACT}&seed=air-prevalent-card`);
  // The card is TRANSIENT on this tree — at 1280x800 it paints at ~250 ms and is gone by ~750 ms
  // (`Hud.dispose` clears it on the boot's second HUD), well inside its own 8 s timer. So: poll in
  // 25 ms steps and shoot the FIRST frame it is up, reloading if a boot misses the window.
  const read = () => page.evaluate(() => {
    const el = document.querySelector('[data-testid="contract-briefing"]');
    return {
      visible: !!el && !el.hasAttribute('hidden') && el.getBoundingClientRect().height > 0,
      name: document.querySelector('[data-testid="contract-briefing-name"]')?.textContent ?? '',
      rules: [...document.querySelectorAll('[data-testid="contract-briefing-rules"] li')].map((li) => li.textContent.trim()),
      goals: [...document.querySelectorAll('[data-testid="contract-briefing-goals"] li')].map((li) => li.textContent.trim()),
    };
  });
  let card = { visible: false, name: '', rules: [], goals: [] };
  for (let attempt = 0; attempt < 6 && !card.visible; attempt += 1) {
    if (attempt > 0) await page.reload();
    for (let step = 0; step < 400; step += 1) {
      card = await read();
      if (card.visible) break;
      await page.waitForTimeout(25);
    }
  }
  // On desktop the card is gone before a screenshot round trip completes (~1.6 s on this Mac vs a
  // sub-second card), so the desktop PNG is the boot frame just AFTER the card, and the desktop
  // evidence for the purse rule is the DOM read above. See F-CWBC-2 in the proof note.
  await page.screenshot({ path: `${DIR}/${card.visible ? 'card' : 'plain-boot-after-card'}-${size.name}.png` });
  const rules = card.rules.join('\n');
  const name = card.name;
  const states = card.visible && /four of the six regolith grounds/i.test(rules) && /air still in the suit/i.test(rules) && /one ground counts in each four-wave window/i.test(rules);
  console.log(`${size.name}: card="${name}" visible=${card.visible} statesGate=${states} consoleErrors=${noise.length}`);
  console.log(card.goals.map((line) => `  goal: ${line}`).join('\n'));
  console.log(card.rules.map((line) => `  - ${line}`).join('\n'));
  if (!states) failures.push(`${size.name}: the card does not state the four-ground gate and the four-wave window`);
  if (noise.length) failures.push(`${size.name}: ${noise.join(' | ')}`);
  await context.close();
}
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
