// scripts/launch-video/session-baron.mjs: the Claim-Jumper Baron, from the run's start to his ARRIVAL
// (task launch-video-capture-2, capture-list item 5 as the owner re-cut it on 2026-09-26: "C6 - lets keep it as it
// is", so no defeat is filmed; the film cuts on the arrival and the Herald prints the ending).
//
// Beats served: B6 (the Baron's map at entry, HUD off for a short walk), B8 (the taunt cards at waves 5, 12 and 18,
// "The Baron sends his regards. The claim won't hold.", then the twentieth horn and the man himself). HUD on after
// the entry walk, for the taunts and the boss bar. The take runs a few seconds past the arrival as handle; the cut
// point is the `arrival` mark in the sidecar. The pilot plays the turtle that a rider rode to the Baron's twentieth
// horn from an empty profile (artifacts/gauntlet-heat5-20260824/e1-baron/attempt-3-tape.json): pan seam 2, four
// turrets on the home bank, six sentry beacons, two turret upgrades. A watcher beside the pilot reads the HUD every
// 150 ms, so a banner that shows only 3.8 s is marked even while the pilot is mid-walk.
// STAGED: only when --staged-unlock is passed. The Baron opens after Frontier science is complete and two claims are
// secured (src/meta/ContractUnlock.ts 'science-complete+2-secured'). --staged-unlock copies Wren's ledger and grants
// exactly the missing unlock facts (science to 6, a second secured contract); the grant is written into the sidecar
// key by key, and the take is labelled STAGED. Without it the session plays Wren's ledger as earned.
//
// Usage, inside the drain lock (see batch.sh):
//   node scripts/launch-video/session-baron.mjs --take t1 [--staged-unlock | --staged-if-locked] [--plan rider|home]
//     [--handle-seconds 15]

import { parseArgs } from 'node:util';
import {
  CAPTURE_NAME, CAPTURE_TOWN, HUD_OFF_SELECTORS, TakeRecorder, VIEWPORTS, collectErrors, installStopHandler,
  launchCaptureBrowser, loadLineage, log, networkVerdict, newCaptureContext, setHudVisible, sleep, takeName, writeSidecar,
} from './lib/capture.mjs';
import { CENTER_RIVER, PILOT_DISCLOSURE, Pilot, readRun, turtle } from './lib/pilot.mjs';
import { launchFromBoard, openBoard, waitForTown } from './lib/town.mjs';

const { values: args } = parseArgs({
  options: {
    take: { type: 'string', default: 't1' },
    lineage: { type: 'string', default: 'wren' },
    'staged-unlock': { type: 'boolean', default: false },
    'staged-if-locked': { type: 'boolean', default: false },
    'handle-seconds': { type: 'string', default: '15' },
    plan: { type: 'string', default: 'rider' },
  },
});
const viewport = 'desktop';
const shape = VIEWPORTS[viewport];
const recorders = [];
installStopHandler(() => recorders);

const HOME = { x: 0, z: 12 };
// Seams are not fixed: two or three are live at a time, each placed at one of the map's six anchors at random and
// holding 30 gold, and a spent seam comes back at another anchor (src/systems/HarvestSystem.ts activateInitialNodes
// and pickOpenAnchor, Balance.goldSeam), so a plan's reach decides its income. Each take's sidecar names its plan.
const PLANS = {
  // t2 (2026-09-27) rode this and fell at wave 19, one wave short: any live seam before wave 8 and only the home
  // bank's (13 m) after, so from wave 13 the purse stood at 6 gold and the defence stopped at four turrets and one
  // beacon. (t1 had ridden any seam all run with a sluice first, and fell at wave 17 mid-crossing, far from home.)
  home: {
    home: HOME,
    seamAnchor: HOME,
    seamRange: (run) => (run.wave < 8 ? 40 : 13),
    retreatBelow: 0.5,
    builds: [
      { id: 'sluice', at: [{ x: -5.5, z: 6.6 }, { x: 5.5, z: 6.6 }, { x: -4, z: 6.4 }] },
      { id: 'turret', at: [{ x: -2.7, z: 12 }, { x: -3.2, z: 11 }] },
      { id: 'turret', at: [{ x: 2.7, z: 12 }, { x: 3.2, z: 11 }] },
      { id: 'turret', at: [{ x: -5.4, z: 12 }, { x: -6, z: 11 }] },
      { id: 'turret', at: [{ x: 5.4, z: 12 }, { x: 6, z: 11 }] },
      { id: 'sentry_beacon', at: [{ x: 0, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: 0, z: 14.5 }] },
      { upgrade: true, id: 'turret', at: { x: -2.7, z: 12 }, cost: 150 },
      { upgrade: true, id: 'turret', at: { x: 2.7, z: 12 }, cost: 150 },
      { id: 'sentry_beacon', at: [{ x: -2.7, z: 9.5 }, { x: -4.2, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: 2.7, z: 9.5 }, { x: 4.2, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: -1.4, z: 8.2 }, { x: -5.6, z: 9.2 }] },
      { id: 'sentry_beacon', at: [{ x: 1.4, z: 8.2 }, { x: 5.6, z: 9.2 }] },
      { upgrade: true, id: 'turret', at: { x: -5.4, z: 12 }, cost: 150 },
      { upgrade: true, id: 'turret', at: { x: 5.4, z: 12 }, cost: 150 },
    ],
  },
  // The rider's own order, from the tape that reached the twentieth horn at full health
  // (artifacts/gauntlet-heat5-20260824/e1-baron/attempt-3-tape.json, attempt-3.log): no sluice; four turrets on the
  // home bank by about 3:00; six beacons by about 4:30; any live seam in between. Kept from t2: back under the
  // turrets when hurt, and no far seam unless she is above 70 percent health. The two outer beacons aim at z 15.2,
  // because an aim at z 14.5 lands its ghost on z 14, two metres from a turret, where t1 was refused six times.
  rider: {
    home: HOME,
    seamAnchor: HOME,
    seamRange: (run) => (run.maxHp > 0 && run.hp < run.maxHp * 0.7 ? 13 : 40),
    retreatBelow: 0.45,
    builds: [
      { id: 'turret', at: [{ x: -2.7, z: 12 }, { x: -3.2, z: 11 }] },
      { id: 'turret', at: [{ x: 2.7, z: 12 }, { x: 3.2, z: 11 }] },
      { id: 'turret', at: [{ x: -5.4, z: 12 }, { x: -6, z: 11 }] },
      { id: 'turret', at: [{ x: 5.4, z: 12 }, { x: 6, z: 11 }] },
      { id: 'sentry_beacon', at: [{ x: 0, z: 9.5 }, { x: 0.8, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: 0, z: 14.5 }, { x: 0, z: 15.2 }] },
      { id: 'sentry_beacon', at: [{ x: -2.7, z: 9.5 }, { x: -4.2, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: 2.7, z: 9.5 }, { x: 4.2, z: 9.5 }] },
      { id: 'sentry_beacon', at: [{ x: -2.7, z: 15.2 }, { x: -1.4, z: 8.2 }] },
      { id: 'sentry_beacon', at: [{ x: 2.7, z: 15.2 }, { x: 1.4, z: 8.2 }] },
      { upgrade: true, id: 'turret', at: { x: -2.7, z: 12 }, cost: 150 },
      { upgrade: true, id: 'turret', at: { x: 2.7, z: 12 }, cost: 150 },
      { upgrade: true, id: 'turret', at: { x: -5.4, z: 12 }, cost: 150 },
      { upgrade: true, id: 'turret', at: { x: 5.4, z: 12 }, cost: 150 },
    ],
  },
};
const PLAN = PLANS[args.plan];
if (!PLAN) throw new Error(`unknown --plan ${args.plan} (rider or home)`);

/**
 * The STAGED grant: Wren's own ledger plus exactly the facts the Baron's gate reads. Every key it touches is
 * returned with its value before and after, for the sidecar and the edit notes.
 */
function stagedUnlock(state) {
  const grant = [];
  const origin = state.origins?.[0];
  if (!origin) throw new Error('lineage has no origin storage');
  const get = (name) => origin.localStorage.find((item) => item.name === name);
  const set = (name, value) => {
    const item = get(name);
    grant.push({ key: name, before: item?.value ?? null, after: value });
    if (item) item.value = value; else origin.localStorage.push({ name, value });
  };
  const profile = JSON.parse(get('gr.profile.v2')?.value ?? 'null');
  if (!profile) throw new Error('lineage has no profile');
  const prefix = `gr.profile.v2.${profile.activeId}.`;
  const meta = JSON.parse(get(`${prefix}gr.meta.v1`)?.value ?? '{"version":1,"tracks":{"territory":0,"science":0,"hero":0,"agent":0}}');
  meta.tracks.science = Math.max(6, meta.tracks.science);
  set(`${prefix}gr.meta.v1`, JSON.stringify(meta));
  const researchKey = `${prefix}gr.research.epoch-1-frontier.v1`;
  const research = JSON.parse(get(researchKey)?.value ?? 'null');
  if (research?.progress?.tracks) {
    research.progress.tracks.science = Math.max(6, research.progress.tracks.science);
    set(researchKey, JSON.stringify(research));
  }
  const scoresKey = `${prefix}gr.scores.v2`;
  const scores = JSON.parse(get(scoresKey)?.value ?? '[]');
  const secured = new Set(scores.filter((score) => score.secured).map((score) => score.contractId || 'the-claim'));
  if (secured.size < 2) {
    scores.push({ waves: 20, kills: 0, gold: 0, timeAlive: 600, at: Date.now(), secured: true, secureWave: 20, contractId: 'e1-twin-banks', profileName: CAPTURE_NAME });
    set(scoresKey, JSON.stringify(scores));
  }
  return grant;
}

/** The Baron's gate as src/meta/ContractUnlock.ts reads it ('science-complete+2-secured'), on the saved ledger. */
function baronGate(state) {
  const origin = state.origins?.[0];
  const get = (name) => origin?.localStorage.find((item) => item.name === name)?.value ?? null;
  const profile = JSON.parse(get('gr.profile.v2') ?? 'null');
  const prefix = `gr.profile.v2.${profile?.activeId}.`;
  const science = JSON.parse(get(`${prefix}gr.meta.v1`) ?? '{"tracks":{"science":0}}').tracks?.science ?? 0;
  const scores = JSON.parse(get(`${prefix}gr.scores.v2`) ?? '[]');
  const contracts = [...new Set(scores.filter((score) => score.secured).map((score) => score.contractId || 'the-claim'))];
  return { science, securedContracts: contracts, open: science >= 6 && contracts.length >= 2 };
}

// Survival ranks higher on the Baron's faster waves than on the Claim: the plating (+25 health and 25 healed, three
// stacks) second, the field dressing (30 healed) in the middle (src/game/Upgrades.ts).
const BARON_PICKS = [
  'heavy_spark', 'tinkers_plating', 'double_tap_coil', 'split_spark', 'field_dressing', 'long_resonator', 'beacon_dynamo',
  'quick_fuse', 'powder_charge', 'sharpen', 'prospectors_luck',
];

const browser = await launchCaptureBrowser();
const summary = { script: 'session-baron', take: args.take, plan: args.plan, startedAt: new Date().toISOString() };
let watching = false;
try {
  const state = loadLineage(args.lineage);
  // --staged-if-locked: read Wren's ledger against the Baron's gate first (Frontier science complete, two different
  // contracts secured); grant only when she has not earned it, and say so in the sidecar either way.
  const gate = baronGate(state);
  summary.gate = gate;
  const staged = args['staged-unlock'] || (args['staged-if-locked'] && !gate.open);
  const grant = staged ? stagedUnlock(state) : [];
  summary.staged = staged;
  summary.grant = grant;
  const { context, ledger } = await newCaptureContext(browser, viewport, { storageState: state });
  const page = await context.newPage();
  const errors = collectErrors(page);
  const pilot = new Pilot(page, { viewport: shape.context.viewport, river: CENTER_RIVER, picks: BARON_PICKS });
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click({ timeout: 60_000 });
  await waitForTown(page);
  await openBoard(page);
  const recorder = new TakeRecorder(page, { name: takeName({ beat: 'B6-B8', map: 'e1-baron', viewport, take: args.take }), frame: shape.frame });
  recorders.push(recorder);
  pilot.recorder = recorder;
  await recorder.start();
  await launchFromBoard(page, 'e1-baron');
  recorder.mark('run-boot');
  let run = await readRun(page);
  if (run?.contract?.id !== 'e1-baron') throw new Error(`board launched ${run?.contract?.id}, not the Baron (is he unlocked?)`);
  await page.getByTestId('contract-briefing').waitFor({ timeout: 30_000 }).catch(() => {});
  await sleep(1300);
  await recorder.still('contract-card');
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.isVisible().catch(() => false)) await begin.click();
  await pilot.pointerAway();
  recorder.mark('begin');
  await pilot.wait(3200);
  // The Baron is filmed wide: Z is the game's own zoom reset (src/systems/CameraZoomController.ts onKeyDown).
  if (Math.abs(((await readRun(page))?.zoomTarget ?? 1) - 1) > 0.01) {
    await pilot.tap('KeyZ');
    recorder.mark('zoom-reset');
    await pilot.wait(1200);
  }

  // B6: the entry, HUD off, a short walk toward the ford and back to the home bank.
  await setHudVisible(page, false);
  recorder.mark('hud-off-entry');
  await recorder.still('entry');
  await pilot.walkTo({ x: 0, z: 6.5 }, { tolerance: 0.8, timeoutMs: 6000 });
  await pilot.wait(1500);
  await recorder.still('entry-walk');
  await pilot.walkTo(HOME, { tolerance: 0.8, timeoutMs: 6000 });
  await setHudVisible(page, true);
  recorder.mark('hud-on');

  // B8: the taunts, then the twentieth horn. A Baron banner shows for 3.8 s of sim (src/game/Game.ts showBaronBanner)
  // and one of the pilot's walks can last longer, so t1 (2026-09-27) marked the wave-5 taunt and missed wave 12's: the
  // banners are now read by a watcher of their own, every 150 ms, beside the pilot.
  const seen = new Set();
  let arrival = null;
  const handleMs = Number(args['handle-seconds']) * 1000;
  const onTick = async (tick) => {
    if (tick.wave !== summary.lastWave) {
      summary.lastWave = tick.wave;
      recorder.mark(`wave-${tick.wave}`, { hp: tick.hp, gold: tick.gold, alive: tick.enemiesAlive, p95: tick.frameMs?.p95, timeAlive: Number(tick.timeAlive.toFixed(1)) });
    }
    return undefined;
  };
  // The HUD's banner (src/ui/Hud.ts: `[data-hud-wave]` text, `[data-hud-wave-title]` title, and
  // `#hud[data-announcement-kind="baron"]` for his taunts and his arrival), his standard, and his boss bar.
  const lookAtTheHud = () => page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__;
    const hud = document.querySelector('#hud');
    const shown = hud?.classList.contains('hud--announcement-visible') ?? false;
    return {
      wave: d?.wave ?? null,
      timeAlive: d?.timeAlive ?? null,
      hp: d?.hp ?? null,
      standard: d?.baronStandard?.visible ?? false,
      bossBar: document.querySelector('#game-canvas')?.dataset.bossBarVisible === 'true',
      banner: shown ? {
        kind: hud.dataset.announcementKind ?? null,
        title: hud.querySelector('[data-hud-wave-title]')?.textContent?.trim() ?? null,
        text: hud.querySelector('[data-hud-wave]')?.textContent?.trim()?.slice(0, 160) ?? null,
      } : null,
    };
  }).catch(() => null);
  watching = true;
  const watcher = (async () => {
    while (watching && !page.isClosed()) {
      const look = await lookAtTheHud();
      if (look && look.wave !== null) {
        if (look.banner?.kind === 'baron' && look.wave < 20 && !seen.has(`taunt-${look.wave}`)) {
          seen.add(`taunt-${look.wave}`);
          recorder.mark('taunt', { wave: look.wave, timeAlive: Number((look.timeAlive ?? 0).toFixed(1)), banner: look.banner });
          void recorder.still(`taunt-wave-${look.wave}`);
        }
        // The arrival: the twentieth horn's own banner, his standard planted, or his boss bar, whichever shows first.
        const arrivalBanner = look.banner?.kind === 'baron' && look.wave >= 20;
        if (!arrival && look.wave >= 20 && (arrivalBanner || look.standard || look.bossBar)) {
          arrival = recorder.mark('arrival', { cutPoint: true, wave: look.wave, timeAlive: Number((look.timeAlive ?? 0).toFixed(1)), hp: look.hp, by: arrivalBanner ? 'banner' : look.standard ? 'standard' : 'boss-bar', banner: look.banner });
          void recorder.still('arrival');
        }
      }
      await sleep(150);
    }
  })();
  const outcome = await turtle(pilot, PLAN, {
    until: async () => Boolean(arrival) && Date.now() - Date.parse(arrival.wall) >= handleMs,
    timeoutMs: 12 * 60_000,
    onTick,
  });
  watching = false;
  await watcher;
  recorder.mark('take-end', { outcome });
  if (arrival) await recorder.still('arrival-handle-end');
  run = await readRun(page);
  summary.final = run && { wave: run.wave, hp: run.hp, gold: run.gold, kills: run.kills, timeAlive: run.timeAlive, runState: run.runState, baron: run.baron };
  summary.arrival = arrival;
  const recording = await recorder.stop();
  const network = networkVerdict(ledger);
  writeSidecar(recorder.name, {
    take: recorder.name, map: 'e1-baron', beats: ['B6', 'B8'], viewport: shape.id, deviceScaleFactor: shape.context.deviceScaleFactor,
    staged, stagedReason: staged ? `Baron unlock granted on a copy of Wren's ledger (her own: science ${gate.science}, secured ${gate.securedContracts.join(', ')}); the grant adds only what the gate reads; the play itself is real at 1x` : null, gate,
    grant, pilot: PILOT_DISCLOSURE, plainBoot: true, capture: { name: CAPTURE_NAME, town: CAPTURE_TOWN }, hudOffRule: HUD_OFF_SELECTORS,
    plan: args.plan, cutPoint: arrival, outcome, summary, pilotEvents: pilot.events, network, errors, recording,
  });
  summary.take = { name: recorder.name, seconds: recording.seconds, receivedFps: recording.receivedFps, network, errors };
  await context.close();
} catch (error) {
  summary.error = String(error?.stack ?? error).slice(0, 2000);
  process.exitCode = 1;
  log(`session failed: ${error?.message}`);
  for (const recorder of recorders) await recorder.stop().catch(() => {});
} finally {
  watching = false;
  summary.finishedAt = new Date().toISOString();
  writeSidecar(`session-baron-${args.take}`, summary);
  await browser.close();
}
