// E5 SEGMENT — the Deepwater Claim: the floating base, and the DREDGE-QUEEN
// fought through her acts (race → anchored stand → the sea's tax). She anchors
// from wave 1 on this contract — no wave skip needed. timescale 4 cited.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e5-01-deepwater-and-the-dredge-queen', { url: '/?debug&contract=e5-deepwater-claim&timescale=4&seed=rehearsal-e5' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e5-01-deepwater-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
console.log('deepwater:', JSON.stringify(await page.evaluate(() => {
  const dw = window.__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim ?? null;
  return dw ? Object.keys(dw) : null;
})));

const start = Date.now();
let outcome = 'timeout';
let saw = false;
let ki = 0;
let lastAct = null;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const dw = g.deepwaterClaim ?? null;
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    return {
      wave: g.wave, hp: g.hp, state: g.state,
      queen: dw?.dredgeQueenBoss ?? null,
      upgradeOpen: !!(card && card.getClientRects().length),
    };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const act = d.queen?.act ?? d.queen?.phase ?? d.queen?.state ?? null;
  if (act !== lastAct) { console.log('queen act:', JSON.stringify(d.queen).slice(0, 280)); lastAct = act; }
  const active = d.queen && (d.queen.active ?? (act && act !== 'idle' && act !== 'done' && act !== 'defeated'));
  if (active && !saw) { saw = true; await shot(page, 'e5-02-queen-arrival'); }
  if (saw && (d.queen?.act ?? 0) >= 3) { outcome = 'queen-defeated'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e5-03-queen-defeat');
console.log('queen end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim?.dredgeQueenBoss ?? null)).slice(0, 400));
await finish(`deepwater + dredge queen (${outcome})`);
