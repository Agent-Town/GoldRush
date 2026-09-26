// scripts/launch-video/session-night-shift.mjs: Night Shift, played for the camera (task launch-video-capture-2).
//
// Capture-list item 3 (and item 10's night stills). Beats served: B1 (the hook: a cold lantern relit in the dark
// and the Fevered at the rim of its light), B6 (Night Shift turning golden), B7 (golden, dusk, dark on one patch of
// claim; the heroine's warm light and the Prospector's teal one together once).
// The runbook's plan, as written: build two turrets on the home bank before wave 8; at wave 10 (the dark, about
// 5:00) walk to a cold post and relight it (the real action: stand by it with 8 gold, src/systems/BuildSystem.ts
// updateRepairs); record the run in one take, HUD hidden. The pilot keeps clear of every cold post until then.
// STAGED: nothing. Wren's saved ledger (state/wren.json), where Night Shift was opened in real play (science >= 3
// from secured claims: assets/contracts/epoch-1-frontier/contracts.json "science≥3"). Board launch, plain seed, 1x.
//
// Usage, inside the drain lock (see batch.sh):
//   node scripts/launch-video/session-night-shift.mjs --viewport desktop --take t1 [--until-seconds 345] [--dawn] [--save-lineage wren]

import { parseArgs } from 'node:util';
import {
  CAPTURE_NAME, CAPTURE_TOWN, HUD_OFF_SELECTORS, TakeRecorder, VIEWPORTS, collectErrors, installStopHandler,
  launchCaptureBrowser, loadLineage, log, networkVerdict, newCaptureContext, saveLineage, setHudVisible, sleep, takeName, writeSidecar,
} from './lib/capture.mjs';
import { PILOT_DISCLOSURE, Pilot, bankSecuredClaim, readRun, turtle } from './lib/pilot.mjs';
import { launchFromBoard, openBoard, waitForTown } from './lib/town.mjs';

const { values: args } = parseArgs({
  options: {
    viewport: { type: 'string', default: 'desktop' },
    take: { type: 'string', default: 't1' },
    lineage: { type: 'string', default: 'wren' },
    'until-seconds': { type: 'string', default: '345' },
    dawn: { type: 'boolean', default: false },
    'save-lineage': { type: 'string' },
  },
});
const viewport = args.viewport;
const shape = VIEWPORTS[viewport];
const untilSeconds = Number(args['until-seconds']);
const recorders = [];
installStopHandler(() => recorders);

// The seven cold posts (e1-night-shift tileParams.prePlacedBuildables, all wrecked, relightCost 8).
const COLD_POSTS = [[0, 16], [-16, 18], [16, 18], [-22, -12], [22, -12], [-10, -24], [10, -24]].map(([x, z]) => ({ x, z, r: 2.2 }));
const RELIGHT = { post: { x: 0, z: 16 }, stand: { x: 0, z: 14.9 } };
const HOME = { x: 0, z: 11.5 };
const PLAN = {
  home: HOME,
  seamAnchor: { x: 0, z: 8 },
  seamRange: 16,
  builds: [
    { id: 'turret', at: [{ x: -2.7, z: 11 }, { x: -3.5, z: 12 }], reserve: 0 },
    { id: 'turret', at: [{ x: 2.7, z: 11 }, { x: 3.5, z: 12 }], reserve: 0 },
    { id: 'sentry_beacon', at: [{ x: 0, z: 9 }, { x: 1, z: 9 }], reserve: 10 },
    { id: 'turret', at: [{ x: -5.4, z: 12 }, { x: -6, z: 11 }], reserve: 10 },
    { id: 'turret', at: [{ x: 5.4, z: 12 }, { x: 6, z: 11 }], reserve: 10 },
    { id: 'sentry_beacon', at: [{ x: -2.7, z: 8.6 }], reserve: 10 },
    { id: 'sentry_beacon', at: [{ x: 2.7, z: 8.6 }], reserve: 10 },
    { id: 'sentry_beacon', at: [{ x: -4.5, z: 14 }], reserve: 10 },
    { id: 'sentry_beacon', at: [{ x: 4.5, z: 14 }], reserve: 10 },
  ],
};

const browser = await launchCaptureBrowser();
const summary = { script: 'session-night-shift', viewport, take: args.take, startedAt: new Date().toISOString() };
try {
  const { context, ledger } = await newCaptureContext(browser, viewport, { storageState: loadLineage(args.lineage) });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const pilot = new Pilot(page, { viewport: shape.context.viewport, avoid: COLD_POSTS });
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click({ timeout: 60_000 });
  await waitForTown(page);
  await openBoard(page);
  const recorder = new TakeRecorder(page, { name: takeName({ beat: 'B1-B6-B7', map: 'e1-night-shift', viewport, take: args.take }), frame: shape.frame });
  recorders.push(recorder);
  pilot.recorder = recorder;
  await recorder.start();
  await launchFromBoard(page, 'e1-night-shift');
  recorder.mark('run-boot');
  let run = await readRun(page);
  if (run?.contract?.id !== 'e1-night-shift') throw new Error(`board launched ${run?.contract?.id}, not Night Shift`);
  await page.getByTestId('contract-briefing').waitFor({ timeout: 30_000 }).catch(() => {});
  await sleep(1300);
  await recorder.still('contract-card');
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await pilot.pointerAway();
  recorder.mark('begin');
  await pilot.wait(3200);
  // The runbook's camera: wheeled in to the 0.7 floor (a profile keeps its zoom, so this is usually a no-op).
  if (Math.abs(((await readRun(page))?.zoomTarget ?? 1) - 0.7) > 0.01) await pilot.zoomTo(0.7);
  await setHudVisible(page, false);
  recorder.mark('hud-off');

  const stills = new Set();
  const lightMarks = async (tick) => {
    const at = tick.timeAlive;
    // The light keyframes by wave (golden 6.5, dusk 8, dark 10) and the runbook's clock (3:15, 4:00, 5:00).
    for (const [name, seconds] of [['golden', 195], ['dusk', 240], ['dark', 300]]) {
      if (!stills.has(name) && at >= seconds) {
        stills.add(name);
        recorder.mark(`light-${name}`, { wave: tick.wave, timeAlive: Number(at.toFixed(1)), lighting: tick.lighting });
        void recorder.still(`${name}-${Math.floor(seconds / 60)}m${String(seconds % 60).padStart(2, '0')}`);
      }
    }
    if (tick.wave !== summary.lastWave) {
      summary.lastWave = tick.wave;
      recorder.mark(`wave-${tick.wave}`, { hp: tick.hp, gold: tick.gold, alive: tick.enemiesAlive, p95: tick.frameMs?.p95, timeAlive: Number(tick.timeAlive.toFixed(1)) });
    }
    return undefined;
  };

  // Waves 0 to 9: pan, raise the home bank's works, never within reach of a cold post.
  const before = await turtle(pilot, PLAN, { until: (tick) => tick.wave >= 10 || tick.timeAlive >= 300, timeoutMs: 7 * 60_000, onTick: lightMarks });
  recorder.mark('dark-reached', { outcome: before });
  run = await readRun(page);
  summary.beforeRelight = { outcome: before, wave: run?.wave, hp: run?.hp, gold: run?.gold, timeAlive: run?.timeAlive };

  // B1: the relight. Stand by the post with the relight's gold; the ring fills in 1.2 s.
  let relit = false;
  if (run && run.runState !== 'dead' && before !== 'dead') {
    if (run.gold < 8) await turtle(pilot, { ...PLAN, builds: [] }, { until: (tick) => tick.gold >= 12, timeoutMs: 45_000, onTick: lightMarks });
    pilot.avoid = COLD_POSTS.filter((post) => post.x !== RELIGHT.post.x || post.z !== RELIGHT.post.z);
    recorder.mark('walk-to-cold-post', { post: RELIGHT.post });
    await pilot.walkTo(RELIGHT.stand, { tolerance: 0.35, timeoutMs: 15_000 });
    const lit = await (async () => {
      const started = Date.now();
      while (Date.now() - started < 8000) {
        const tick = await readRun(page);
        const post = tick?.build.entries.find((entry) => entry.id === 'lantern_post' && Math.hypot(entry.x - RELIGHT.post.x, entry.z - RELIGHT.post.z) < 0.5);
        if (post && !post.wrecked) return tick;
        await pilot.service();
        await sleep(100);
      }
      return null;
    })();
    relit = Boolean(lit);
    recorder.mark(relit ? 'relit' : 'relight-failed', { gold: lit?.gold });
    if (relit) {
      await sleep(400);
      await recorder.still('relit');
      await pilot.wait(4000);
      await recorder.still('pool');
      await pilot.wait(6000);
      await recorder.still('rim');
      await recorder.still('two-lights');
    }
  }
  summary.relit = relit;

  // Hold the light to the take's end (the runbook records to 5:30), or on to dawn when asked.
  const home = relit ? RELIGHT.stand : HOME;
  const hold = await turtle(pilot, { ...PLAN, home, seamAnchor: home, seamRange: 10 }, {
    until: (tick) => (args.dawn ? false : tick.timeAlive >= untilSeconds),
    timeoutMs: args.dawn ? 12 * 60_000 : 4 * 60_000,
    onTick: lightMarks,
  });
  recorder.mark('hold-end', { outcome: hold });
  run = await readRun(page);
  summary.final = run && { wave: run.wave, hp: run.hp, gold: run.gold, kills: run.kills, timeAlive: run.timeAlive, runState: run.runState, secured: run.secured };
  let banked = null;
  if (await page.getByTestId('claim-secured').isVisible().catch(() => false)) {
    await setHudVisible(page, true);
    recorder.mark('claim-secured');
    await sleep(2000);
    await recorder.still('dawn-secured');
    banked = await bankSecuredClaim(page);
    await waitForTown(page).catch(() => {});
  }
  const recording = await recorder.stop();
  const network = networkVerdict(ledger);
  writeSidecar(recorder.name, {
    take: recorder.name, map: 'e1-night-shift', beats: ['B1', 'B6', 'B7'], viewport: shape.id, deviceScaleFactor: shape.context.deviceScaleFactor,
    staged: false, pilot: PILOT_DISCLOSURE, plainBoot: true, capture: { name: CAPTURE_NAME, town: CAPTURE_TOWN }, hudOffRule: HUD_OFF_SELECTORS,
    relight: RELIGHT, relit, banked, summary, pilotEvents: pilot.events, network, errors, recording,
  });
  summary.take = { name: recorder.name, seconds: recording.seconds, receivedFps: recording.receivedFps, network, errors };
  if (args['save-lineage'] && banked) summary.lineage = await saveLineage(context, args['save-lineage']);
  await context.close();
} catch (error) {
  summary.error = String(error?.stack ?? error).slice(0, 2000);
  process.exitCode = 1;
  log(`session failed: ${error?.message}`);
  for (const recorder of recorders) await recorder.stop().catch(() => {});
} finally {
  summary.finishedAt = new Date().toISOString();
  writeSidecar(`session-night-shift-${viewport}-${args.take}`, summary);
  await browser.close();
}
