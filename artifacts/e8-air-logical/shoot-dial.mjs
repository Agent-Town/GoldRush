// THE HUMAN'S AIR DIAL, IN A PLAIN BOOT, AT 390 PX (Mistake #10: "where does the PLAYER see this,
// in a plain boot?"). No `?debug`, no harness — the HUD a player gets, on each of the four Orbital
// maps, with the suit reading down from its authored capacity.
//
//   node artifacts/e8-air-logical/shoot-dial.mjs http://127.0.0.1:5308
//
// The profile seeding is `shoot-card.mjs`'s, verbatim and for its reason (the three siblings sit
// behind a secured chain and `reverifyStagedContractLaimport` clears a staged launch of a locked
// contract; `gr.previewUnlockAll.v1` is the product's own switch). What differs is WHEN it shoots:
// the card is transient and this waits PAST it, for the HUD, and then for the dial to have moved
// off its full reading so the shot proves the meter is live rather than merely painted.
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:5308';
const DIR = fileURLToPath(new URL('.', import.meta.url));
const UNLOCKED = ['the-claim', 'e1-dry-gulch', 'e8-mare-claim', 'e8-far-side', 'e8-low-orbit'];
// The Mare Claim and the Eclipse drop their hero at (0, 12), OUTSIDE every dome, so their dial
// falls from the first tick; the Far Side and Low Orbit drop her inside pressurised ground, so
// theirs reads full and names the rectangle she is breathing in. Both are the truth about the map.
const MAPS = ['e8-mare-claim', 'e8-far-side', 'e8-low-orbit', 'e8-eclipse'];

await mkdir(DIR, { recursive: true });
const browser = await chromium.launch();
const failures = [];
for (const id of MAPS) {
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
  }, { contract: id, unlocked: UNLOCKED });
  await page.goto(`${BASE}/?contract=${id}&seed=air-dial`);
  const read = () => page.evaluate(() => {
    const panel = document.querySelector('[data-testid="hud-suit-air"]');
    return {
      present: !!panel,
      visible: !!panel && !panel.hasAttribute('hidden') && panel.getBoundingClientRect().height > 0,
      state: panel?.dataset.state ?? null,
      text: document.querySelector('[data-hud-suit-air]')?.textContent ?? '',
      title: panel?.getAttribute('title') ?? '',
      width: (document.querySelector('[data-hud-suit-air-fill]'))?.style.width ?? '',
    };
  });
  let dial = { present: false, visible: false, state: null, text: '', title: '', width: '' };
  for (let step = 0; step < 600 && !dial.visible; step += 1) {
    dial = await read();
    await page.waitForTimeout(50);
  }
  // AND THEN LET THE RUN BREATHE. The first frame the panel is painted the consumer has not been
  // ticked yet, so every map reads 'draining' at full: the dial's own initial state is 'nowhere',
  // not 'in vacuum'. Six seconds of a plain boot is enough for the two maps that drop their hero
  // outside to have spent air and the two that drop her inside to be naming the rectangle she
  // breathes in, which is the difference the shot exists to show.
  await page.waitForTimeout(6000);
  dial = await read();
  await page.screenshot({ path: `${DIR}/dial-${id}-390.png` });
  console.log(`${id}: visible=${dial.visible} state=${dial.state} text="${dial.text}" fill=${dial.width} consoleErrors=${noise.length}`);
  console.log(`  title: ${dial.title}`);
  if (!dial.visible) failures.push(`${id}: the suit dial is not visible in a plain boot`);
  if (noise.length) failures.push(`${id}: ${noise.join(' | ')}`);
  await context.close();
}
await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
