// LOW ORBIT'S PLAIN-BOOT CARD, at 390 px, with the console watched.
//
//   node artifacts/low-orbit-second-build-line/shoot-card.mjs http://127.0.0.1:5313
//
// `artifacts/e8-air-logical/shoot-card.mjs` carried forward and trimmed to the one map this slice
// touches, with the shot written into `reviews/shots-low-orbit-second-build-line/`. The question it
// answers is Mistake #10's — "where does the PLAYER see this, in a plain boot?" — and the answer
// this slice needs is the negative one: the card must be UNCHANGED, because this slice ships no
// contract edit. The three sentences asserted below are the ones `e8-air-logical` pinned.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5313';
const OUT = fileURLToPath(new URL('../../reviews/shots-low-orbit-second-build-line/', import.meta.url));
/** The whole unlock chain, so the map is launchable from a plain board. */
const UNLOCKED = ['the-claim', 'e1-dry-gulch', 'e8-mare-claim', 'e8-far-side', 'e8-low-orbit'];
const MAP = {
  id: 'e8-low-orbit',
  states: [/four separate deck entries/i, /only the carcass yard holds air/i, /five hit points every second/i],
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const failures = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const noise = [];
page.on('console', (message) => { if (message.type() === 'error') noise.push(`console: ${message.text()}`); });
page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`));
await page.addInitScript(({ contract, unlocked }) => {
  try {
    localStorage.clear();
    const profileKey = 'gr.profile.v2';
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(`${profileKey}.robin.gr.town.name.v1`, 'Quartz Hill');
    localStorage.setItem(`${profileKey}.robin.gr.meta.v1`, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
    localStorage.setItem('gr.story.tales.v1', '0');
    localStorage.setItem(`${profileKey}.robin.gr.scores.v2`, JSON.stringify(unlocked.map((contractId, index) => ({
      kills: 0, gold: 0, timeAlive: 600, at: index + 1, profileName: 'Robin', waves: 20, secured: true, contractId,
    }))));
    localStorage.setItem(`${profileKey}.robin.gr.previewUnlockAll.v1`, '1');
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-8-orbital');
  } catch {}
  try { sessionStorage.clear(); sessionStorage.setItem('gr.contract.launch.v1', contract); } catch {}
}, { contract: MAP.id, unlocked: UNLOCKED });
await page.goto(`${BASE}/?contract=${MAP.id}&seed=second-build-line-card`);
// The card is TRANSIENT: it paints early in the boot and the boot's second HUD clears it, well
// inside its own 8 s timer. Poll in 25 ms steps, reload if a boot misses the window.
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
await page.screenshot({ path: `${OUT}${card.visible ? 'card' : 'plain-boot-after-card'}-${MAP.id}-390.png` });
const rules = card.rules.join('\n');
const states = card.visible && MAP.states.every((pattern) => pattern.test(rules));
console.log(`${MAP.id}: card="${card.name}" visible=${card.visible} statesGate=${states} consoleErrors=${noise.length}`);
console.log('GOALS');
console.log(card.goals.map((line) => `  - ${line}`).join('\n'));
console.log('RULES');
console.log(card.rules.map((line) => `  - ${line}`).join('\n'));
if (!states) failures.push(`${MAP.id}: the card does not state its gate and its window`);
if (noise.length) failures.push(`${MAP.id}: ${noise.join(' | ')}`);
await context.close();
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
