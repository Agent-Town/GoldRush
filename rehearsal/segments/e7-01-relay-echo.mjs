// E7 SEGMENT — the Relay Valley: THE ECHO fought through its acts (the mirror
// of your own base; novelty as the counter; the jar). Arrives at wave 12.
// timescale 4 + setWave(11) cited. Also probes the e7 signal exit beat.
import { openSegment, shot, hold, poll, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e7-01-relay-valley-and-the-echo', { url: '/?debug&contract=e7-relay-valley&timescale=4&seed=rehearsal-e7' });
await gameReady(page);
await poll(() => page.evaluate(() => !!window.__GR_TEST__), { label: 'seam' });
console.log('contract:', await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId));
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await shot(page, 'e7-01-relay-valley-boot');
// GRINDING SHORTCUT (cited): a player reaches the boss fully leveled — max the arsenal.
await page.evaluate(() => { window.__GR_TEST__.maxUpgrades?.(); });
console.log('e7signal:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__?.e7Signal?.diagnostics() ?? null)).slice(0, 300));
// give the Echo something to mirror
await page.evaluate(() => { window.__GR_TEST__.grantGold(150); const h = window.__THREE_GAME_DIAGNOSTICS__.heroPos; window.__GR_TEST__.placeFree('sentry_beacon', h.x + 2, h.z + 2); });

await page.evaluate(() => window.__GR_TEST__.setWave(11));
const start = Date.now();
let outcome = 'timeout';
let saw = false;
let ki = 0;
let lastPhase = null;
while (Date.now() - start < 10 * 60_000) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const card = document.querySelector('[data-testid="upgrade-card-0"]');
    return { wave: g.wave, hp: g.hp, state: g.state, echo: g.echoBoss ?? null, upgradeOpen: !!(card && card.getClientRects().length) };
  });
  if (!d) break;
  if (d.upgradeOpen) { await page.keyboard.press(`Digit${(ki % 3) + 1}`); ki += 1; continue; }
  const phase = d.echo?.phase ?? d.echo?.act ?? d.echo?.state ?? null;
  if (phase !== lastPhase) { console.log('echo phase:', JSON.stringify(d.echo).slice(0, 300)); lastPhase = phase; }
  const active = d.echo && (d.echo.active ?? (phase && phase !== 'idle'));
  if (active && !saw) { saw = true; await shot(page, 'e7-02-echo-mirror'); }
  if (saw && ((d.echo?.act ?? 0) >= 3 || d.echo?.captured || d.echo?.jarred)) { outcome = 'echo-jarred'; break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; break; }
  await hold(page, ['KeyW', 'KeyD', 'KeyS', 'KeyA'][ki % 4], 180);
  ki += 1;
  await page.waitForTimeout(120);
}
console.log('fight outcome:', outcome);
await page.waitForTimeout(2000);
await shot(page, 'e7-03-echo-jar');
console.log('echo end:', JSON.stringify(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.echoBoss ?? null)).slice(0, 400));
// the exit-beat gate that E7→E8's hardcoded seam checks:
console.log('e7 exit-beat milestones:', JSON.stringify(await page.evaluate(() => window.__GR_TEST__?.e7Signal?.diagnostics() ?? null)).slice(0, 400));
await finish(`relay valley + echo (${outcome})`);
