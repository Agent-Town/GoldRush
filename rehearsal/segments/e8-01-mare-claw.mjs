// E8 SEGMENT — the Mare Claim: vacuum physics probed, THE SALVAGE KING'S CLAW
// fought through its descent (crown → winch → anchor-feet → the yard).
// Arrives at wave 8. timescale 4 + setWave(7) cited.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e8-01-mare-claim-and-the-claw', { url: '/?debug&contract=e8-mare-claim&timescale=4&seed=rehearsal-e8' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e8-01-mare-claim-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
console.log('e8 physics:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__?.e8PhysicsProbe?.('e8-mare-claim') ?? null)).slice(0, 300));

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
    return { wave: g.wave, hp: g.hp, state: g.state, claw: g.salvageClawBoss ?? null, upgradeOpen: !!(card && card.getClientRects().length) };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const act = d.claw?.act ?? d.claw?.phase ?? d.claw?.state ?? null;
  if (act !== lastAct) { console.log('claw act:', JSON.stringify(d.claw).slice(0, 300)); lastAct = act; }
  const active = d.claw && (d.claw.active ?? (act && act !== 'idle'));
  if (active && !saw) { saw = true; await shot(page, 'e8-02-claw-descent'); }
  if (saw && ((d.claw?.act ?? 0) >= 3 || d.claw?.carcassPresent || d.claw?.persistentCarcass)) { outcome = 'claw-landed-and-broken'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e8-03-claw-carcass');
console.log('claw end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.salvageClawBoss ?? null)).slice(0, 400));
await finish(`mare claim + salvage claw (${outcome})`);
