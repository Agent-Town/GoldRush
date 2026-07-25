// E1 SEGMENT 2 — THE BARON, fought through his real acts on his real contract.
// Debug door + timescale + setWave(19) = grinding shortcuts (cited). The fight
// itself, the capture, the medal: played.
import { openSegment, shot, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e1-02-the-baron', { url: '/?debug&contract=e1-baron&timescale=4&seed=rehearsal-e1-baron' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await page.evaluate(() => window.__GR_TEST__.resetRun());
await gameReady(page);
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => {
  const test = window.__GR_TEST__;
  test.maxUpgrades?.();
  test.grantGold(10_000);
  test.setBalance('turret.range', 24);
  for (const [x, z] of [[-8, 8], [8, 8], [-8, 16], [8, 16]]) test.placeFree('turret', x, z);
  for (const [x, z] of [[-20, 9], [-12, 9]]) test.placeFree('palisade', x, z);
  for (const entry of window.__THREE_GAME_DIAGNOSTICS__.build.hp.filter(({ id }) => id === 'turret' || id === 'palisade')) {
    test.teleport(entry.position.x, entry.position.z);
    test.upgradeBuilding(entry.id, entry.index);
  }
  test.teleport(28, 8);
});

// Grinding shortcut: skip the 19 approach waves and remove unrelated filler;
// the Baron still rides and takes live player damage at 20.
await page.evaluate(() => {
  window.__GR_TEST__.setBalance('waves.pulseBase', 0);
  window.__GR_TEST__.setBalance('waves.pulsePerWave', 0);
  window.__GR_TEST__.setBalance('waves.aliveCap', 0);
  window.__GR_TEST__.setBalance('waves.trickleInterval', 999);
  window.__GR_TEST__.setManualSim(true);
  window.__GR_TEST__.setWave(19);
});
console.log('wave set to 19; awaiting the Baron');

const start = Date.now();
let outcome = 'timeout';
let sawBaron = false;
let peakHp = 0;
let ki = 0;
let lastComponents = '';
let orbitSeconds = 0;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    // E1's legacy single-body Baron has no variantId; componentized bosses do.
    const baronParts = window.__GR_TEST__?.enemyPositions().filter((e) => e.hasBanner) ?? [];
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    const office = document.querySelector('[data-testid="claim-office"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state, enemies: g.enemiesAlive,
      baron: baronParts.length ? {
        hp: baronParts.reduce((sum, part) => sum + part.hp, 0),
        maxHp: baronParts.reduce((sum, part) => sum + part.maxHp, 0),
        components: baronParts.map((part) => part.bossComponentId),
      } : null,
      ui: g.ui?.announcement ?? null,
      upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true
        && overlay.getAttribute('aria-hidden') === 'false',
      officeText: office && getComputedStyle(office).visibility !== 'hidden' ? office.textContent.slice(0, 400) : null,
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); continue; }
  if (d.baron && !sawBaron) {
    sawBaron = true;
    console.log('THE BARON:', JSON.stringify(d.baron), 'announce:', d.ui);
    await shot(page, 'e1-08-baron-arrival');
  }
  if (d.baron) {
    const components = d.baron.components.join(',');
    if (components !== lastComponents) {
      console.log('baron act:', components, '— kite/aim at the banner rider');
      lastComponents = components;
    }
    if (d.baron.hp > peakHp) peakHp = d.baron.hp;
    if (d.baron.hp < peakHp * 0.5 && peakHp > 0 && !global.midShot) { global.midShot = true; await shot(page, 'e1-09-baron-half'); }
  }
  if (sawBaron && !d.baron) {
    // baron gone: defeated (or despawned) — check the office card
    console.log('baron down at wave', d.wave, 'hp', Math.round(d.hp));
    outcome = 'baron-defeated';
    break;
  }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  orbitSeconds += 0.5;
  await page.evaluate((elapsed) => {
    const angle = elapsed * 0.16;
    window.__GR_TEST__.teleport(Math.cos(angle) * 28, 8 + Math.sin(angle) * 28);
    window.__GR_TEST__.advanceSim(0.5);
  }, orbitSeconds);
  ki += 1;
  await page.waitForTimeout(30);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2500);
await shot(page, 'e1-10-baron-defeat');
const after = await page.evaluate(() => ({
  medals: localStorage.getItem(Object.keys(localStorage).find((k) => k.includes('medals')) ?? '') ?? null,
  office: document.querySelector('[data-testid="claim-office"]')?.textContent?.slice(0, 500) ?? null,
  announce: window.__THREE_GAME_DIAGNOSTICS__?.ui?.announcement ?? null,
  rocket: window.__THREE_GAME_DIAGNOSTICS__?.baronRocket ?? null,
  run: window.__THREE_GAME_DIAGNOSTICS__?.run ?? null,
  megaproject: window.__GR_TEST__?.megaproject?.() ?? null,
}));
console.log('after:', JSON.stringify(after, null, 1).slice(0, 1500));
await finish(`e1 baron, outcome=${outcome}`);
if (outcome !== 'baron-defeated') throw new Error(`Baron was not defeated (${outcome}); inspect e1-02 footage before resuming`);
