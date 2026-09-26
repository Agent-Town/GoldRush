// scripts/launch-video/session-first-claim.mjs: a new player's first session, filmed (task launch-video-capture-2).
//
// Capture-list items 1 (the menu, fresh profile), 2 (the Claim) and 9 (a secured Claim ride recorded on the day
// and replayed in the Lantern Show), per docs/marketing/launch-video/treatment.md "Capture runbook".
// Beats served: B3 (the menu and the typed name), B4 (issue No. 1's NEW HANDS, WELCOME; the pan; the sluice; the
// ford beacon), B2 (the Tavernkeeper's own first-boot card, "What is a claim?"), B5 (FREED at the ford), B9 (the
// Prospector sent panning), B10 (the Lantern Show from the local tape shelf).
// STAGED: nothing. A fresh store, the capture name typed on the menu, telemetry opted out, the plain seed, a board
// launch (a bare `?contract=` URL falls back to the Claim in a plain boot: src/meta/ContractFamilies.ts
// activeContractSelection, fallbackReason 'debug-disabled'), 1x, no network.
//
// Usage, inside the drain lock (see batch.sh):
//   node scripts/launch-video/session-first-claim.mjs --viewport desktop --take t1 [--lantern] [--no-claim]
//     [--claim-from-lineage wren] [--save-lineage wren] [--zoom 0.7]
// --claim-from-lineage skips the menu and plays the Claim on Wren's saved ledger (a later session of the same
// player); --zoom wheels the camera in after the opening (0.7 is the game's floor, Balance.camera.zoom).
// Writes takes to ~/.goldrush/launch-video/ and the player's lineage to ~/.goldrush/launch-video/state/wren.json.

import { parseArgs } from 'node:util';
import {
  CAPTURE_NAME, CAPTURE_TOWN, TakeRecorder, VIEWPORTS, collectErrors, installStopHandler, launchCaptureBrowser, log,
  loadLineage, networkVerdict, newCaptureContext, saveLineage, setHudVisible, sleep, takeName, writeSidecar, HUD_OFF_SELECTORS,
} from './lib/capture.mjs';
import { PILOT_DISCLOSURE, Pilot, bankSecuredClaim, readRun } from './lib/pilot.mjs';
import { onboard, openBoard, launchFromBoard, waitForTown, walkToBuilding } from './lib/town.mjs';
import { playClaim } from './claim-choreography.mjs';

const { values: args } = parseArgs({
  options: {
    viewport: { type: 'string', default: 'desktop' },
    take: { type: 'string', default: 't1' },
    lantern: { type: 'boolean', default: false },
    'no-claim': { type: 'boolean', default: false },
    'claim-from-lineage': { type: 'string' },
    'save-lineage': { type: 'string' },
    zoom: { type: 'string' },
  },
});
const zoom = args.zoom ? Number(args.zoom) : null;
const viewport = args.viewport;
const shape = VIEWPORTS[viewport];
const recorders = [];
installStopHandler(() => recorders);

const browser = await launchCaptureBrowser();
const summary = { script: 'session-first-claim', viewport, take: args.take, startedAt: new Date().toISOString(), takes: [] };

async function finishTake(recorder, extra) {
  const recording = await recorder.stop();
  const sidecar = { take: recorder.name, viewport: shape.id, deviceScaleFactor: shape.context.deviceScaleFactor, staged: false, pilot: PILOT_DISCLOSURE, plainBoot: true, capture: { name: CAPTURE_NAME, town: CAPTURE_TOWN }, hudOffRule: HUD_OFF_SELECTORS, ...extra, recording };
  writeSidecar(recorder.name, sidecar);
  summary.takes.push({ name: recorder.name, seconds: recording.seconds, receivedFps: recording.receivedFps, frameSize: recording.frameSize, network: extra.network, errors: extra.errors });
  return recording;
}

try {
  // ---- the menu, on a fresh store (item 1, B3) and the arrival (B4's issue No. 1) ----------------------------
  const fresh = !args['claim-from-lineage'];
  const { context, ledger } = await newCaptureContext(browser, viewport, fresh ? {} : { storageState: loadLineage(args['claim-from-lineage']) });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const pilot = new Pilot(page, { viewport: shape.context.viewport });

  if (fresh) {
    await page.goto('about:blank');
    const menu = new TakeRecorder(page, { name: takeName({ beat: 'B3', map: 'menu', viewport, take: args.take }), frame: shape.frame });
    recorders.push(menu);
    await menu.start();
    await page.goto('/');
    await page.getByTestId('profile-title').waitFor({ timeout: 60_000 });
    menu.mark('menu');
    await sleep(2500);
    await menu.still('menu');
    const arrival = await onboard(page, {
      onNameTyped: async () => { menu.mark('name-typed'); await menu.still('name-typed'); },
      onPaper: async () => { menu.mark('issue-1'); await sleep(2200); await menu.still('issue-1'); await sleep(2500); },
    });
    menu.mark('town-ready', arrival);
    await sleep(2500);
    await finishTake(menu, { beats: ['B3', 'B4'], map: 'menu', network: networkVerdict(ledger), errors: { ...errors } });
  } else {
    await page.goto('/');
    await page.getByTestId('start-menu').waitFor({ timeout: 60_000 });
    await page.getByTestId('start-menu-enter-town').click();
    await waitForTown(page);
  }

  // ---- the Claim (item 2: B4, B5, B9) ----------------------------------------------------------------------
  if (!args['no-claim']) {
    await openBoard(page);
    const claim = new TakeRecorder(page, { name: takeName({ beat: 'B4-B5-B9', map: 'the-claim', viewport, take: args.take }), frame: shape.frame });
    recorders.push(claim);
    pilot.recorder = claim;
    await claim.start();
    claim.mark('board');
    await sleep(1200);
    await launchFromBoard(page, 'the-claim');
    claim.mark('run-boot');
    const played = await playClaim({ page, pilot, recorder: claim, zoom });
    let banked = null;
    const secured = await page.getByTestId('claim-secured').isVisible().catch(() => false);
    if (secured) {
      await setHudVisible(page, true);
      claim.mark('claim-secured');
      await sleep(2500);
      await claim.still('claim-secured');
      banked = await bankSecuredClaim(page, { onSummary: async () => { claim.mark('run-summary'); await sleep(1500); await claim.still('run-summary'); } });
      claim.mark('return-to-town', banked);
      await waitForTown(page);
      await sleep(2000);
    }
    const run = await readRun(page).catch(() => null);
    await finishTake(claim, {
      beats: ['B4', 'B5', 'B9', 'B2'], map: 'the-claim', played, banked, secured,
      pilotEvents: pilot.events, finalRun: run, network: networkVerdict(ledger), errors: { ...errors },
    });
  }

  // ---- the Lantern Show from the local tape shelf (item 9, B10) --------------------------------------------
  if (args.lantern) {
    const show = new TakeRecorder(page, { name: takeName({ beat: 'B10', map: 'lantern-show', viewport, take: args.take }), frame: shape.frame });
    recorders.push(show);
    const board = page.getByTestId('contract-board');
    if (await board.isVisible().catch(() => false)) {
      const close = page.locator('[data-testid="contract-board-close"]:visible, [data-town-board-close]:visible').first();
      if (await close.count()) await close.click(); else await page.keyboard.press('Escape');
      await sleep(800);
    }
    await walkToBuilding(page, 'schoolhouse');
    await show.start();
    await page.getByTestId('town-open-schoolhouse').click();
    await page.getByTestId('schoolhouse-open-tapes').click();
    await page.getByTestId('tape-shelf').waitFor({ timeout: 15_000 });
    show.mark('tape-shelf');
    await sleep(2000);
    await show.still('tape-shelf');
    await page.getByTestId('watch-run-tape').first().click();
    show.mark('watch');
    // Story cards (a ledger page earned in the run) can land over the show; the capture hides only their layer.
    await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 30_000 }).catch(() => {});
    await page.getByTestId('lantern-show').waitFor({ timeout: 90_000 });
    const playing = await page.waitForFunction(() => document.querySelector('[data-testid="lantern-show"]')?.dataset.playback === 'playing', null, { timeout: 90_000 }).then(() => true).catch(() => false);
    await setHudVisible(page, false, { only: ['[data-testid="story-beat-layer"]'] });
    show.mark('playing', { playing, hidden: 'story layer only' });
    for (const at of [3, 15, 30, 45]) {
      await sleep(at === 3 ? 3000 : 12_000);
      await show.still(`lantern-${String(at).padStart(2, '0')}s`);
    }
    const state = await page.evaluate(() => {
      const element = document.querySelector('[data-testid="lantern-show"]');
      return element ? {
        playback: element.dataset.playback, tick: element.dataset.tick, boot: element.dataset.boot,
        honesty: document.querySelector('[data-testid="lantern-agent-honesty"]')?.textContent ?? null,
        intertitle: document.querySelector('[data-testid="lantern-intertitle"]')?.textContent ?? null,
        url: location.href,
      } : null;
    });
    show.mark('lantern-state', state);
    // The show isolates the store while it plays (src/ui/LanternShow.ts isolateReplayStorage); its own close
    // restores it and returns to town before anything is saved.
    const close = page.getByTestId('lantern-close');
    if (await close.isVisible().catch(() => false)) await close.click();
    await waitForTown(page).catch(() => {});
    show.mark('closed');
    await sleep(1500);
    await finishTake(show, { beats: ['B10'], map: 'lantern-show', lantern: state, network: networkVerdict(ledger), errors: { ...errors } });
  }

  if (args['save-lineage']) {
    summary.lineage = await saveLineage(context, args['save-lineage']);
  }
  summary.network = networkVerdict(ledger);
  summary.errors = errors;
  await context.close();
} catch (error) {
  summary.error = String(error?.stack ?? error).slice(0, 2000);
  process.exitCode = 1;
  log(`session failed: ${error?.message}`);
  for (const recorder of recorders) await recorder.stop().catch(() => {});
} finally {
  summary.finishedAt = new Date().toISOString();
  const part = args['no-claim'] ? '-menu' : args['claim-from-lineage'] ? '-claim' : '';
  writeSidecar(`session-first-claim-${viewport}-${args.take}${part}`, summary);
  await browser.close();
}
