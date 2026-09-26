// scripts/launch-video/session-entry-walks.mjs: the entry walks (task launch-video-capture-2, capture-list item 4).
//
// Beat served: B6 (five contracts, four places in four heartbeats): The Dry Gulch (mesa washes falling toward one
// spring) and Twin Banks (a braided river around two gravel bars, walked toward the west ford), 20 s of walking
// each, HUD off after the contract card.
// STAGED: nothing. Each walk boots Wren's saved ledger (state/wren.json), where both contracts were opened in real
// play: the Dry Gulch opens at wave 10 on the Claim, Twin Banks at the first secured claim
// (assets/contracts/epoch-1-frontier/contracts.json boardRow.unlock; src/meta/ContractUnlock.ts). Launched from the
// town board, plain boot, 1x, no network. The ledger is never saved back: a walk leaves its run unfinished.
//
// Usage, inside the drain lock (see batch.sh):
//   node scripts/launch-video/session-entry-walks.mjs --viewport desktop --take t1 [--maps e1-dry-gulch,e1-twin-banks]

import { parseArgs } from 'node:util';
import {
  CAPTURE_NAME, CAPTURE_TOWN, HUD_OFF_SELECTORS, TakeRecorder, VIEWPORTS, collectErrors, installStopHandler,
  launchCaptureBrowser, loadLineage, log, networkVerdict, newCaptureContext, setHudVisible, sleep, takeName, writeSidecar,
} from './lib/capture.mjs';
import { PILOT_DISCLOSURE, Pilot, readRun } from './lib/pilot.mjs';
import { launchFromBoard, openBoard, waitForTown } from './lib/town.mjs';

const { values: args } = parseArgs({
  options: {
    viewport: { type: 'string', default: 'desktop' },
    take: { type: 'string', default: 't1' },
    maps: { type: 'string', default: 'e1-dry-gulch,e1-twin-banks' },
    lineage: { type: 'string', default: 'wren' },
  },
});
const viewport = args.viewport;
const shape = VIEWPORTS[viewport];
const recorders = [];
installStopHandler(() => recorders);

// Each map's landmark and the walk toward it (world metres; W is -z on screen).
const WALKS = {
  'e1-dry-gulch': { landmark: 'the spring', target: { x: -18, z: -18 }, stopShort: 2.6, then: [{ x: -21, z: -15.6 }] },
  'e1-twin-banks': { landmark: 'the west ford', target: { x: -16, z: -6 }, stopShort: 0.5, then: [{ x: -16, z: -1 }, { x: -16, z: 3.5 }] },
};

const browser = await launchCaptureBrowser();
const summary = { script: 'session-entry-walks', viewport, take: args.take, startedAt: new Date().toISOString(), takes: [] };
try {
  for (const map of args.maps.split(',').map((entry) => entry.trim()).filter(Boolean)) {
    const walk = WALKS[map];
    if (!walk) throw new Error(`no walk for ${map}`);
    const { context, ledger } = await newCaptureContext(browser, viewport, { storageState: loadLineage(args.lineage) });
    const page = await context.newPage();
    const errors = collectErrors(page);
    const pilot = new Pilot(page, { viewport: shape.context.viewport });
    await page.goto('/');
    await page.getByTestId('start-menu-enter-town').click({ timeout: 60_000 });
    await waitForTown(page);
    await openBoard(page);
    const recorder = new TakeRecorder(page, { name: takeName({ beat: 'B6', map, viewport, take: args.take }), frame: shape.frame });
    recorders.push(recorder);
    pilot.recorder = recorder;
    await recorder.start();
    await launchFromBoard(page, map);
    recorder.mark('run-boot');
    await page.getByTestId('contract-briefing').waitFor({ timeout: 30_000 }).catch(() => {});
    await sleep(1300);
    await recorder.still('contract-card');
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible().catch(() => false)) await begin.click();
    await pilot.pointerAway();
    recorder.mark('begin');
    await pilot.wait(3200);
    await setHudVisible(page, false);
    recorder.mark('hud-off');
    const start = await readRun(page);
    const approach = (() => {
      const dx = walk.target.x - start.hero.x;
      const dz = walk.target.z - start.hero.z;
      const length = Math.hypot(dx, dz) || 1;
      const keep = Math.max(0, length - walk.stopShort);
      return { x: start.hero.x + (dx / length) * keep, z: start.hero.z + (dz / length) * keep };
    })();
    const walkStarted = Date.now();
    recorder.mark('walk', { from: start.hero, toward: walk.landmark });
    await recorder.still('walk-start');
    await pilot.walkTo(approach, { tolerance: 0.8, timeoutMs: 20_000 });
    recorder.mark('at-landmark', { landmark: walk.landmark });
    await sleep(600);
    await recorder.still('landmark');
    for (const point of walk.then) await pilot.walkTo(point, { tolerance: 0.8, timeoutMs: 10_000 });
    const remaining = 22_000 - (Date.now() - walkStarted);
    if (remaining > 0) await pilot.wait(remaining);
    recorder.mark('walk-end', { seconds: (Date.now() - walkStarted) / 1000 });
    await recorder.still('walk-end');
    const run = await readRun(page);
    const recording = await recorder.stop();
    const network = networkVerdict(ledger);
    writeSidecar(recorder.name, {
      take: recorder.name, map, beats: ['B6'], landmark: walk.landmark, viewport: shape.id, deviceScaleFactor: shape.context.deviceScaleFactor,
      staged: false, pilot: PILOT_DISCLOSURE, plainBoot: true, capture: { name: CAPTURE_NAME, town: CAPTURE_TOWN },
      hudOffRule: HUD_OFF_SELECTORS, contract: run?.contract, pilotEvents: pilot.events, network, errors, recording,
    });
    summary.takes.push({ name: recorder.name, seconds: recording.seconds, receivedFps: recording.receivedFps, contract: run?.contract, network, errors });
    log(`walk done: ${recorder.name} contract=${run?.contract?.id}`);
    await context.close();
  }
} catch (error) {
  summary.error = String(error?.stack ?? error).slice(0, 2000);
  process.exitCode = 1;
  log(`session failed: ${error?.message}`);
  for (const recorder of recorders) await recorder.stop().catch(() => {});
} finally {
  summary.finishedAt = new Date().toISOString();
  writeSidecar(`session-entry-walks-${viewport}-${args.take}`, summary);
  await browser.close();
}
