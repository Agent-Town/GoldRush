// PLAIN-BOOT CARD SHOTS, one per sibling map. No `?debug`: the question this answers is Mistake
// #10's — "where does the PLAYER see this, in a plain boot?" — and the answer must be the contract
// card the run opens on, at 390px, stating the map's own gate and its window.
//
//   node artifacts/e8-air-wall-all-maps/shoot-card.mjs http://127.0.0.1:5305
//
// Copied from `artifacts/mare-claim-air-prevalent/shoot-card.mjs` and re-pointed at the three
// siblings and at each one's card sentences; the polling shape and its F-CWBC-2 note are that
// slice's measurement, kept because the card is just as transient here.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5305';
const DIR = fileURLToPath(new URL('.', import.meta.url));
/** The whole unlock chain, so every one of the three is launchable from a plain board. */
const UNLOCKED = ['the-claim', 'e1-dry-gulch', 'e8-mare-claim', 'e8-far-side', 'e8-low-orbit'];
const MAPS = [
  { id: 'e8-far-side', states: [/four separate entries/i, /air still in the suit/i, /one crossing counts in each four-wave window/i] },
  { id: 'e8-low-orbit', states: [/four separate deck entries/i, /air still in the suit/i, /one crossing counts in each four-wave window/i] },
  { id: 'e8-eclipse', states: [/four of the six regolith grounds/i, /air still in the suit/i, /one ground counts in each four-wave window/i] },
];

await mkdir(DIR, { recursive: true });
const browser = await chromium.launch();
const failures = [];
for (const map of MAPS) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const noise = [];
  page.on('console', (message) => { if (message.type() === 'error') noise.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => noise.push(`pageerror: ${error.message}`));
  // A PLAIN BOOT STILL HAS TO BE AN UNLOCKED ONE. These three ride a chain
  // (`e8-mare-claim` -> `e8-far-side` -> `e8-low-orbit` -> `e8-eclipse`, `boardRow.unlock`), and a
  // profile that has secured none of them falls back to The Claim — which is what a first draft of
  // this shooter screenshotted three times over. So the profile is seeded exactly as
  // `e2e/contract-briefings.spec.ts` seeds one, with the chain's own scoreboard rows secured, and
  // the boot itself stays plain: no `?debug`, no harness.
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
      // AND THE GAME'S OWN AFFORDANCE FOR EXACTLY THIS. These three sit behind a secured chain
      // (`e8-mare-claim` -> `e8-far-side` -> `e8-low-orbit` -> `e8-eclipse`), and
      // `reverifyStagedContractLaunch` CLEARS a staged launch of a locked contract — which is why
      // a seeded scoreboard alone was not enough and a first draft screenshotted The Claim three
      // times. `gr.previewUnlockAll.v1` is the product's own profile-scoped "Open every claim"
      // switch (`src/meta/ContractUnlock.ts`), never a URL parameter and never global. The boot
      // stays PLAIN: no `?debug`, no harness, the card a player would read.
      localStorage.setItem(`${profileKey}.robin.gr.previewUnlockAll.v1`, '1');
      localStorage.setItem('gr.activeEpoch.v1', 'epoch-8-orbital');
    } catch {}
    try { sessionStorage.clear(); sessionStorage.setItem('gr.contract.launch.v1', contract); } catch {}
  }, { contract: map.id, unlocked: UNLOCKED });
  await page.goto(`${BASE}/?contract=${map.id}&seed=air-wall-card`);
  // The card is TRANSIENT — it paints early in the boot and `Hud.dispose` clears it on the boot's
  // second HUD, well inside its own 8 s timer. So: poll in 25 ms steps and shoot the FIRST frame
  // it is up, reloading if a boot misses the window.
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
  await page.screenshot({ path: `${DIR}/${card.visible ? 'card' : 'plain-boot-after-card'}-${map.id}-390.png` });
  const rules = card.rules.join('\n');
  const states = card.visible && map.states.every((pattern) => pattern.test(rules));
  console.log(`${map.id}: card="${card.name}" visible=${card.visible} statesGate=${states} consoleErrors=${noise.length}`);
  console.log(card.rules.map((line) => `  - ${line}`).join('\n'));
  if (!states) failures.push(`${map.id}: the card does not state its gate and its window`);
  if (noise.length) failures.push(`${map.id}: ${noise.join(' | ')}`);
  await context.close();
}
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
