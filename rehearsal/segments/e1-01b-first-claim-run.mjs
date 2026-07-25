// E1 SEGMENT 1b — THE CLAIM played to secure. (The founding menus + first-claim
// board launch are banked in e1-01; a level-up input bug in the driver stalled
// that recording at the briefing — driver fixed, run replayed here.
// timescale=3 = cited grinding shortcut.)
import { openSegment, shot, hold, gameReady, poll } from '../lib.mjs';

const { page, finish } = await openSegment('e1-01b-the-first-claim-run', { url: '/?debug&contract=the-claim&timescale=3&seed=rehearsal-first-claim' });
await gameReady(page);
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
// Grinding shortcut after the fully honest founding loss: replay with the
// late-run arsenal so this segment proves the first-claim securing seam.
await page.evaluate(() => {
  window.__GR_TEST__?.resetRun();
  window.__GR_TEST__?.maxUpgrades?.();
  window.__GR_TEST__?.setBalance('waves.aliveCap', 14);
});
await gameReady(page);

const start = Date.now();
let lastWave = -1;
let outcome = 'timeout';
let ki = 0;
while (Date.now() - start < 14 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    return {
      wave: g.wave, hp: g.hp, maxHp: g.maxHp, gold: g.economy?.gold, kills: g.kills,
      secured: g.run?.secured, secureWave: g.run?.secureWave, state: g.state, enemies: g.enemiesAlive,
      upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true
        && overlay.getAttribute('aria-hidden') === 'false',
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  if (d.wave !== lastWave) {
    console.log(`wave ${d.wave}/${d.secureWave} hp=${Math.round(d.hp)}/${d.maxHp} gold=${d.gold} kills=${d.kills} enemies=${d.enemies}`);
    lastWave = d.wave;
    if (d.wave === 6) await shot(page, 'e1-05-mid-run-battle');
    if (d.wave === 14) await shot(page, 'e1-06-late-run');
  }
  if (d.secured) { outcome = 'secured'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 200);
  ki += 1;
  await page.waitForTimeout(150);
}
console.log('run outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e1-07-claim-secured');
const end = await page.evaluate(() => ({
  run: window.__THREE_GAME_DIAGNOSTICS__?.run ?? null,
  meta: localStorage.getItem('gr.profile.v2.rehearsal.gr.meta.v1'),
  office: document.querySelector('[data-testid="claim-office"]')?.textContent?.replace(/\s+/g, ' ').slice(0, 300) ?? null,
}));
console.log('end:', JSON.stringify(end, null, 1));
await finish(`the-claim, outcome=${outcome}`);
if (outcome !== 'secured') throw new Error(`First-claim replay did not secure (${outcome}); inspect e1-01b footage before resuming`);
