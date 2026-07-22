// E1 SEGMENT 2 — THE BARON, fought through his real acts on his real contract.
// Debug door + timescale + setWave(19) = grinding shortcuts (cited). The fight
// itself, the capture, the medal: played.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e1-02-the-baron', { url: '/?debug&contract=e1-baron&timescale=4&seed=rehearsal-e1-baron' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});

// Grinding shortcut: skip the 19 approach waves; the Baron rides at 20.
await page.evaluate(() => window.__GR_TEST__.setWave(19));
console.log('wave set to 19; awaiting the Baron');

const start = Date.now();
let outcome = 'timeout';
let sawBaron = false;
let peakHp = 0;
const keys = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
let ki = 0;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const baron = window.__GR_TEST__?.enemyPositions().find((e) => e.eliteKind === 'baron') ?? null;
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    const office = document.querySelector('[data-testid="claim-office"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state, enemies: g.enemiesAlive,
      baron: baron ? { hp: baron.hp, maxHp: baron.maxHp, scale: baron.scale, banner: baron.hasBanner } : null,
      ui: g.ui?.announcement ?? null,
      upgradeOpen: !!(card && card.getClientRects().length),
      officeText: office && office.getClientRects().length ? office.textContent.slice(0, 400) : null,
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
  await hold(page, keys[ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
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
