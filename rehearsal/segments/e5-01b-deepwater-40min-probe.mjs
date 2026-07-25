// F-REH-05 probe: 40 simulated Deepwater minutes with a moving, damageable
// maxed hero. The tile owns corsair waves; compare those to the generic HUD.
import { openSegment, shot, gameReady } from '../lib.mjs';

const { page, finish } = await openSegment('e5-01b-deepwater-40-sim-minute-probe', {
  url: '/?debug&contract=e5-deepwater-claim&timescale=1&seed=rehearsal-e5-40min',
});
await gameReady(page);
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await page.evaluate(() => {
  window.__GR_TEST__.resetRun();
  window.__GR_TEST__.maxUpgrades();
  window.__GR_TEST__.setManualSim(true);
});
await gameReady(page);
await shot(page, 'e5-03a-40min-probe-start');

for (let step = 0; step < 2_000; step += 1) {
  const state = await page.evaluate((i) => {
    const angle = i * 0.31;
    window.__GR_TEST__.teleport(Math.cos(angle) * 18, -20 + Math.sin(angle) * 18);
    window.__GR_TEST__.advanceSim(10);
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    return { state: g.state, time: g.timeAlive, ceremony: g.baronCeremony?.active === true };
  }, step);
  if (state.state === 'dead') throw new Error(`Deepwater 40-minute probe died at ${Math.round(state.time)}s`);
  if (state.state === 'levelup') await page.keyboard.press(`Digit${(step % 3) + 1}`);
  if (state.ceremony) await page.keyboard.press('Space');
  if (await page.getByTestId('claim-secured').isVisible().catch(() => false)) {
    await page.getByTestId('stay-for-rush').click();
  }
  if (state.time >= 2_400) break;
  if (step % 20 === 0) await page.waitForTimeout(30);
  if (step === 1_999) throw new Error(`Deepwater probe stalled at ${Math.round(state.time)}s`);
}

const result = await page.evaluate(() => {
  const g = window.__THREE_GAME_DIAGNOSTICS__;
  return {
    simSeconds: Math.round(g.timeAlive),
    hudWave: g.wave,
    corsairWaves: g.deepwaterClaim?.corsairWaves?.length ?? null,
    xp: g.xp,
    kills: g.kills,
    enemies: g.enemiesAlive,
    state: g.state,
  };
});
console.log('F-REH-05 40-minute result:', JSON.stringify(result));
await shot(page, 'e5-03b-40min-probe-end');
await finish(`F-REH-05 ${JSON.stringify(result)}`);
