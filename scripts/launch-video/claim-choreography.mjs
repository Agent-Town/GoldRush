// scripts/launch-video/claim-choreography.mjs: the Claim, played for the camera (task launch-video-capture-2).
// Shared by session-first-claim.mjs and session-claim-again.mjs. Beats: B4 (stake it: the pan at the ford seam,
// a sluice by the water, a sentry beacon at the ford), B5 (the cure: walkers wade the ford and are FREED), B9 (her
// deputy: G opens the Prospector's charter, a click on a seam sends it panning, with the HUD chip in frame).
// Real play at 1x on the plain seed, from a board launch. HUD on for the opening (the contract card, the
// Tavernkeeper's first-boot card, the Prospector toast) and for B9 and the secure; off for the world in between.

import { log, setHudVisible, sleep } from './lib/capture.mjs';
import { chooseSeam, turtle } from './lib/pilot.mjs';

// The river runs east-west through z 0 (half-width 5), the centre ford spans x -3..3
// (assets/contracts/epoch-1-frontier/contracts.json, the-claim tileParams); the home bank is the south side.
const FORD = { x: 0, z: 0 };
const SOUTH_OF_FORD = { x: 0, z: 7.2 };
const SLUICE_SPOTS = [{ x: -4, z: 6.4 }, { x: 4, z: 6.4 }, { x: -5.5, z: 6.6 }, { x: 5.5, z: 6.6 }, { x: -4, z: -6.4 }];
const FORD_BEACON_SPOTS = [{ x: 1.5, z: 7.6 }, { x: -1.5, z: 7.6 }, { x: 2.5, z: 8.5 }];
const DEFENCE = [
  { id: 'turret', at: [{ x: -2.7, z: 11 }, { x: -3.5, z: 12 }] },
  { id: 'turret', at: [{ x: 2.7, z: 11 }, { x: 3.5, z: 12 }] },
  { id: 'sentry_beacon', at: [{ x: 0, z: 10.5 }, { x: 1, z: 10 }] },
  { id: 'turret', at: [{ x: -5.4, z: 12 }, { x: -6, z: 11 }] },
  { id: 'turret', at: [{ x: 5.4, z: 12 }, { x: 6, z: 11 }] },
  { id: 'sentry_beacon', at: [{ x: -2.7, z: 8.8 }] },
  { id: 'sentry_beacon', at: [{ x: 2.7, z: 8.8 }] },
];

async function waitFor(pilot, predicate, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const run = await pilot.run();
    if (run && (await predicate(run))) return run;
    await pilot.service();
    await sleep(150);
  }
  return null;
}

/**
 * Plays one Claim from the first frame of the run to the Claim Secured choice. `recorder` marks and stills the
 * named moments; `zoom` (0.7 is the floor) is wheeled in after the opening for the close takes.
 */
export async function playClaim({ page, pilot, recorder, zoom = null, prospectorOrder = true, hudOffWorld = true }) {
  const result = { freed: 0, pans: 0, events: [] };
  const mark = (name, extra) => recorder.mark(name, extra);
  const markFreed = (tick) => {
    const spawned = tick?.freed?.spawned ?? 0;
    while (result.freed < spawned) {
      result.freed += 1;
      const labelled = result.freed <= 4;
      mark(labelled ? 'freed-labelled' : 'freed', { n: result.freed, wave: tick.wave, walkers: tick.freed.at });
      if (labelled) void recorder.still(`freed-${result.freed}`);
    }
  };
  pilot.onService = async () => { markFreed(await pilot.run()); };

  // The opening: the contract card for its first second, then Begin (a player's click).
  await page.getByTestId('contract-briefing').waitFor({ timeout: 30_000 }).catch(() => {});
  mark('contract-card');
  await sleep(1400);
  await recorder.still('contract-card');
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await pilot.pointerAway();
  mark('begin');
  // The entry glance and, on a profile's second boot, the Tavernkeeper's first-boot card (src/story/beats.ts:46).
  const card = await waitFor(pilot, async () => (await page.getByTestId('story-beat-card').count()) > 0, 9_000);
  if (card) {
    const beat = await page.getByTestId('story-beat-card').getAttribute('data-beat-id');
    mark('story-card', { beat });
    await sleep(1800);
    await recorder.still(beat === 'first-boot' ? 'tavernkeeper-card' : `story-${beat}`);
    await pilot.wait(3500);
  } else {
    await pilot.wait(2000);
  }
  await recorder.still('prospector-toast');
  if (zoom) await pilot.zoomTo(zoom);

  if (hudOffWorld) {
    await setHudVisible(page, false);
    mark('hud-off');
  }

  // B4: the pan at the seam nearest the ford.
  let run = await pilot.run();
  const fordSeam = chooseSeam(run, FORD, { maxDistance: 14 });
  if (fordSeam) {
    mark('walk-to-ford-seam', { seam: fordSeam.id, x: fordSeam.x, z: fordSeam.z });
    const side = fordSeam.z < 0 ? { x: fordSeam.x, z: fordSeam.z + 0.9 } : { x: fordSeam.x, z: fordSeam.z + 0.9 };
    await pilot.walkTo(side, { tolerance: 0.6, timeoutMs: 15_000 });
    const panning = await waitFor(pilot, (r) => r.channeling, 5_000);
    if (panning) {
      mark('pan', { seam: fordSeam.id, gold: panning.gold });
      await sleep(900);
      await recorder.still('pan');
      result.pans += 1;
    }
    await waitFor(pilot, (r) => !r.channeling, 12_000);
  }

  // B4: a sluice by the water and a sentry beacon at the ford, as soon as the purse allows.
  const economy = { home: SOUTH_OF_FORD, seamAnchor: FORD, seamRange: 18, builds: [] };
  await turtle(pilot, economy, { until: (r) => r.gold >= 65, timeoutMs: 90_000 });
  run = await pilot.run();
  if (run.gold >= 40) {
    const ok = await pilot.build('sluice', SLUICE_SPOTS);
    if (ok) { mark('sluice'); await sleep(700); await recorder.still('sluice'); }
  }
  await turtle(pilot, economy, { until: (r) => r.gold >= 25, timeoutMs: 60_000 });
  const beacon = await pilot.build('sentry_beacon', FORD_BEACON_SPOTS);
  if (beacon) { mark('ford-beacon'); await sleep(700); await recorder.still('ford-beacon'); }

  // B9: the Prospector sent panning, HUD on so its chip and toast are in frame.
  if (prospectorOrder) {
    if (hudOffWorld) { await setHudVisible(page, true); mark('hud-on-b9'); }
    await pilot.settleCamera(600);
    run = await pilot.run();
    const other = await pilot.orderableSeam();
    mark('order-target', { seam: other && { id: other.id, x: other.x, z: other.z, screen: other.screen } });
    if (other) {
      await recorder.still('before-order');
      const before = run.prospector;
      await pilot.sendProspectorTo(other, { charterMs: 2800, onCharterOpen: async () => { mark('charter'); await recorder.still('charter'); } });
      mark('prospector-ordered', { seam: other.id });
      const moving = await waitFor(pilot, (r) => r.prospector && (r.prospector.working || r.prospector.moving
        || Math.hypot((r.prospector.target?.x ?? 0) - (before?.target?.x ?? 0), (r.prospector.target?.z ?? 0) - (before?.target?.z ?? 0)) > 1), 6_000);
      mark(moving ? 'prospector-going' : 'prospector-did-not-go', { prospector: (await pilot.run()).prospector });
      await pilot.wait(3500);
      await recorder.still('prospector-at-work');
    }
    if (hudOffWorld) { await setHudVisible(page, false); mark('hud-off-after-b9'); }
  }

  // B5 and the hold: pan near the ford, raise the home defence as gold allows, mark every freed walker. The first
  // four freed in a run float the word FREED (Balance.legibility.freedFloatLimit); those are B5's labelled frames.
  let hudBack = false;
  const plan = { home: SOUTH_OF_FORD, seamAnchor: FORD, seamRange: 12, builds: DEFENCE };
  const outcome = await turtle(pilot, plan, {
    timeoutMs: 8 * 60_000,
    onTick: async (tick) => {
      markFreed(tick);
      if (tick.wave !== result.lastWave) {
        result.lastWave = tick.wave;
        mark(`wave-${tick.wave}`, { hp: tick.hp, gold: tick.gold, alive: tick.enemiesAlive, p95: tick.frameMs?.p95 });
      }
      if (!hudBack && hudOffWorld && tick.wave >= (tick.contract?.secureWave ?? 10) - 1 && tick.waveState === 'active') {
        hudBack = true;
        await setHudVisible(page, true);
        mark('hud-on-for-secure');
      }
      return undefined;
    },
  });
  result.outcome = outcome;
  run = await pilot.run();
  result.final = run && { wave: run.wave, hp: run.hp, gold: run.gold, kills: run.kills, secured: run.secured, timeAlive: run.timeAlive, runState: run.runState };
  log(`claim outcome: ${outcome} ${JSON.stringify(result.final)}`);
  return result;
}
