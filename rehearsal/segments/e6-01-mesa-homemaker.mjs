// E6 SEGMENT — the Glow Mesa: the HOMEMAKER-9000 fought through its acts
// (the help → the mess → DONE, the chair), plus a wrangle attempt (the era's
// patience verb). It arrives at wave 8. timescale 4 + setWave(7) cited.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e6-01-glow-mesa-and-the-homemaker', { url: '/?debug&contract=e6-glow-mesa&timescale=4&seed=rehearsal-e6' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e6-01-glow-mesa-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
console.log('wrangle:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wrangle ?? null)).slice(0, 200));

await page.evaluate(() => window.__GR_TEST__.setWave(7));
const start = Date.now();
let outcome = 'timeout';
let saw = false;
let ki = 0;
let lastAct = null;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state,
      hm: g.homemakerBoss ?? null,
      upgradeOpen: !!(card && card.getClientRects().length),
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const act = d.hm?.act ?? d.hm?.phase ?? d.hm?.state ?? null;
  if (act !== lastAct) { console.log('homemaker act:', JSON.stringify(d.hm).slice(0, 280)); lastAct = act; }
  const active = d.hm && (d.hm.active ?? (act && act !== 'idle'));
  if (active && !saw) { saw = true; await shot(page, 'e6-02-homemaker-arrival'); }
  if (saw && ((d.hm?.act ?? 0) >= 3 || d.hm?.persistentKept)) { outcome = 'homemaker-done'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2500);
await shot(page, 'e6-03-homemaker-done-the-chair');
console.log('homemaker end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.homemakerBoss ?? null)).slice(0, 400));
await finish(`glow mesa + homemaker (${outcome})`);
