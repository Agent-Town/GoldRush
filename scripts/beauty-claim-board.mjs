// THE CLAIM BEAUTY BOARD — the judge for docs/beauty/the-claim-brief.md §4.
//
// Renders the brief's six shot-list moments plus the metrics the shift is gated
// on (frame p95 desktop + 390px mobile, draw calls, triangles, water/landmark
// diagnostics, console+page errors), into reviews/shots-beauty-claim/<phase>-*.
// One phase per upgrade so every keep/revert decision is judged on renders, not
// intentions.
//
//   node_modules/.bin/vite --host 127.0.0.1 --port 5247 --strictPort &
//   BEAUTY_BASE=http://127.0.0.1:5247 node scripts/beauty-claim-board.mjs before
//
// Shot 2 reproduces the fixed fresh-eye run camera EXACTLY: the sculpt recipe
// (build_the_claim_terrain.py main()) documents it as "hero target (0,.06,12),
// offset (0,26.2,18.3), look target z -= 3.35, fov 42", i.e. the shipped
// gameplay camera with the hero standing at game (0, 12). We teleport there and
// let the camera lag settle rather than posing a private camera.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveBase } from '../rehearsal/base-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-beauty-claim');
const PHASE = process.argv[2] ?? 'before';
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null;
const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };
const WIDE = { width: 1600, height: 800 };
const DEBUG_QUERY = 'debug&contract=the-claim&nolevel&nokill&nopause&nosteal&nowreck&tier=full';

const base = resolveBase('BEAUTY_BASE', { root: ROOT });
mkdirSync(SHOT_DIR, { recursive: true });

// Partial runs (`… before 4,5`) must not erase the shots an earlier partial wrote.
const METRICS_FILE = path.join(SHOT_DIR, `metrics-${PHASE}.json`);
const previous = existsSync(METRICS_FILE) ? JSON.parse(readFileSync(METRICS_FILE, 'utf8')) : { shots: {}, errors: {} };
const metrics = { phase: PHASE, at: new Date().toISOString(), shots: { ...previous.shots }, errors: { ...previous.errors } };

const browser = await chromium.launch({ channel: 'chromium', headless: true });

async function open(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = { console: [], page: [] };
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() !== 'error') return;
    if (text.includes(base) || text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED') return;
    errors.console.push(text);
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return { context, page, errors };
}

const visible = async (page, id) => {
  const locator = page.getByTestId(id);
  return (await locator.count()) > 0 && locator.first().isVisible().catch(() => false);
};
const townFrames = (page) => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.frame ?? -1);
const gameFrames = (page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? -1);

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function dismissBeats(page) {
  for (let index = 0; index < 20; index += 1) {
    if (!(await visible(page, 'story-beat-card'))) return;
    await page.mouse.click(6, 6);
    await page.waitForTimeout(220);
  }
}

/**
 * The honest plain boot: start menu -> ledger -> town -> contract board -> launch.
 * No `?debug`, no query flags at all — the Mistake #10 shape is only caught by
 * booting the way a player boots. Condensed from rehearsal/r2-loop.mjs.
 */
async function plainBootTheClaim(page) {
  await page.goto(`${base}/`);
  for (let step = 0; step < 120; step += 1) {
    if ((await gameFrames(page)) > 10) break;
    if ((await townFrames(page)) > 10) {
      const nameInput = page.getByTestId('town-name-input');
      if ((await visible(page, 'town-name-input')) && (await nameInput.first().isEnabled())) {
        await nameInput.first().fill('VeinCreek');
        await page.getByTestId('town-name-submit').click();
        await page.waitForTimeout(1500);
        continue;
      }
      await dismissBeats(page);
      if (!(await visible(page, 'contract-board'))) {
        await hold(page, 'KeyA', 850);
        await hold(page, 'KeyW', 850);
        await page.waitForTimeout(250);
        const prompt = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null);
        if (prompt === 'tavern') {
          await page.getByTestId('town-open-board').click();
          await page.waitForTimeout(700);
        } else {
          await hold(page, 'KeyD', 400);
          await hold(page, 'KeyS', 400);
        }
        continue;
      }
      const launch = page.getByTestId('contract-launch-the-claim');
      if ((await launch.count()) === 0) throw new Error('the-claim has no launch button on the board');
      await launch.first().click();
      await page.waitForTimeout(1200);
      continue;
    }
    if ((await visible(page, 'profile-create-form')) && !(await visible(page, 'profile-difficulty'))) {
      await page.getByTestId('profile-name-input').first().fill('robin');
      await page.getByTestId('profile-create').click();
      await page.waitForTimeout(1200);
      continue;
    }
    if (await visible(page, 'profile-start')) {
      await page.getByTestId('profile-start').first().click();
      await page.waitForTimeout(1200);
      continue;
    }
    await page.waitForTimeout(350);
  }
  if ((await gameFrames(page)) <= 10) throw new Error('plain boot never reached the-claim');
  for (let index = 0; index < 12; index += 1) {
    if (await visible(page, 'contract-briefing-dismiss')) {
      await page.getByTestId('contract-briefing-dismiss').click();
      await page.waitForTimeout(300);
      break;
    }
    await page.waitForTimeout(250);
  }
  await dismissBeats(page);
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId);
  if (contract !== 'the-claim') throw new Error(`plain boot landed on ${contract}`);
}

async function ready(page, { debug }) {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20, null, { timeout: 45_000 });
  if (debug) await page.waitForFunction(() => Boolean(window.__GR_TEST__), null, { timeout: 20_000 });
  await page.waitForFunction(
    () => document.querySelector('canvas')?.dataset.terrain3dPilotState !== 'loading',
    null,
    { timeout: 45_000 },
  );
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await dismissBeats(page);
}

async function hideOverlays(page) {
  await dismissBeats(page);
  await page.evaluate(() => {
    for (const selector of ['.lil-gui', '#hud', '#touch-controls', '.gr-hud', '#ui-root']) {
      document.querySelector(selector)?.style.setProperty('display', 'none');
    }
  });
}

/** Frame p95 two ways: the game's own frame clock, and raw rAF deltas. */
async function measure(page, frames = 180) {
  return page.evaluate(async (count) => {
    const samples = [];
    let previous = performance.now();
    for (let index = 0; index < count; index += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const round = (value) => Math.round(value * 100) / 100;
    return {
      rafP95Ms: round(samples[Math.floor(samples.length * 0.95)] ?? 0),
      rafMedianMs: round(samples[Math.floor(samples.length * 0.5)] ?? 0),
      gameP95Ms: round(diagnostics?.frameMs.p95 ?? 0),
      gameAvgMs: round(diagnostics?.frameMs.avg ?? 0),
      drawCalls: diagnostics?.renderer.calls ?? 0,
      triangles: diagnostics?.renderer.triangles ?? 0,
      textures: diagnostics?.renderer.textures ?? 0,
      geometries: diagnostics?.renderer.geometries ?? 0,
    };
  }, frames);
}

async function pilotState(page) {
  return page.evaluate(() => {
    const dataset = document.querySelector('canvas')?.dataset ?? {};
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      state: dataset.terrain3dPilotState,
      renderSource: dataset.terrain3dPilotRenderSource,
      meshes: dataset.terrain3dPilotMeshes,
      triangles: dataset.terrain3dPilotTriangles,
      materials: dataset.terrain3dPilotMaterials,
      vertices: dataset.terrain3dPilotVertices,
      landmarks: dataset.terrain3dPilotLandmarks,
      landmarkSkipped: dataset.terrain3dPilotLandmarkSkipped,
      hiddenRelief: dataset.terrain3dPilotHiddenRelief,
      hiddenLayers: dataset.terrain3dPilotHiddenGroundLayers,
      sculptWater: dataset.terrain3dPilotSculptWater ?? 'absent',
      motes: dataset.terrain3dPilotMotes ?? 'absent',
      contact: dataset.terrain3dPilotContactShadows ?? 'absent',
      landmarkEmissive: dataset.terrain3dPilotLandmarkEmissive ?? 'absent',
      water: diagnostics?.terrain.water ?? null,
      contract: diagnostics?.contract.activeId,
      performanceTier: diagnostics?.performance.tier,
    };
  });
}

/**
 * The perf law, measured so the box cannot fake it. Both arms run in the SAME
 * browser within seconds of each other: ?nobeauty holds the shift's additions back
 * while everything else boots identically, so the delta is the additions and not
 * the machine's load (F-1113-4: a control must share the treatment's conditions).
 */
async function perfAb(page, query, settle) {
  const arms = {};
  for (const arm of ['nobeauty', 'beauty']) {
    await page.goto(`${base}/?${query}${arm === 'nobeauty' ? '&nobeauty' : ''}`);
    await ready(page, { debug: true });
    await settle(page);
    await hideOverlays(page);
    await page.waitForTimeout(600);
    arms[arm] = { ...(await measure(page)), pilot: (await pilotState(page)).sculptWater };
  }
  const ratio = arms.nobeauty.rafP95Ms > 0 ? arms.beauty.rafP95Ms / arms.nobeauty.rafP95Ms : null;
  return { ...arms, ratioP95: ratio === null ? null : Number(ratio.toFixed(3)), loadAverage: loadAverage() };
}

function loadAverage() {
  return os.loadavg().map((value) => Number(value.toFixed(2)));
}

async function shoot(page, name) {
  const file = path.join(SHOT_DIR, `${PHASE}-${name}.png`);
  await page.screenshot({ path: file });
  return path.relative(ROOT, file);
}

function wanted(id) {
  return !ONLY || ONLY.has(id);
}

// ---------------------------------------------------------------- shot 1 + 2 + 6
if (wanted('1') || wanted('2') || wanted('6')) {
  const { context, page, errors } = await open(DESKTOP);
  if (wanted('1')) {
    // Plain boot: no ?debug at all — the standing-orders framing (Mistake #10).
    await plainBootTheClaim(page);
    await ready(page, { debug: false });
    await page.waitForTimeout(1500);
    metrics.shots.boot = { file: await shoot(page, 'boot-desktop'), pilot: await pilotState(page) };
  }
  if (wanted('2') || wanted('6')) {
    await page.goto(`${base}/?${DEBUG_QUERY}&nowaves&seed=beauty-run-camera`);
    await ready(page, { debug: true });
    await page.evaluate(() => window.__GR_TEST__.teleport(0, 12));
    await page.waitForTimeout(2500);
    if (wanted('2')) {
      await hideOverlays(page);
      await page.waitForTimeout(400);
      metrics.shots.runCamera = {
        file: await shoot(page, 'run-camera'),
        camera: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera),
        pilot: await pilotState(page),
        perf: await measure(page),
        perfAb: await perfAb(page, `${DEBUG_QUERY}&nowaves&seed=beauty-run-camera`, async (target) => {
          await target.evaluate(() => window.__GR_TEST__.teleport(0, 12));
          await target.waitForTimeout(2500);
        }),
      };
      // perfAb reloaded the page; restore the judged pose before the HUD frame.
      await page.goto(`${base}/?${DEBUG_QUERY}&nowaves&seed=beauty-run-camera`);
      await ready(page, { debug: true });
      await page.evaluate(() => window.__GR_TEST__.teleport(0, 12));
      await page.waitForTimeout(2500);
      // Same pose, HUD on — what a player actually sees at the readability judge.
      metrics.shots.runCameraHud = { file: await shoot(page, 'run-camera-hud') };
    }
  }
  if (wanted('6')) {
    // Max zoom-out at ~2:1 — panorama story, zero backplate band (MQ-2).
    await page.setViewportSize(WIDE);
    await page.waitForTimeout(600);
    await page.mouse.move(WIDE.width / 2, WIDE.height / 2);
    for (let index = 0; index < 40; index += 1) await page.mouse.wheel(0, 240);
    await page.waitForTimeout(1600);
    await hideOverlays(page);
    await page.waitForTimeout(300);
    metrics.shots.wideZoomOut = {
      file: await shoot(page, 'wide-zoomout'),
      camera: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.camera),
    };
  }
  metrics.errors.desktop = errors;
  await context.close();
}

// ---------------------------------------------------------------- shot 3
if (wanted('3')) {
  const { context, page, errors } = await open(DESKTOP);
  await page.goto(`${base}/?${DEBUG_QUERY}&nowaves&seed=beauty-ford`);
  await ready(page, { debug: true });
  await page.evaluate(() => {
    const test = window.__GR_TEST__;
    test.teleport(0, 9);
    test.clearEnemies();
    for (const [x, z] of [[-1.6, -3.2], [1.4, -1.4], [-0.6, 0.6], [1.9, 2.4], [-2.2, 4.1]]) test.scriptEnemyAt(x, z, x * 0.4, 14, 1.1);
  });
  await page.waitForTimeout(1400);
  await page.mouse.move(DESKTOP.width / 2, DESKTOP.height / 2);
  for (let index = 0; index < 24; index += 1) await page.mouse.wheel(0, -240);
  await page.waitForTimeout(1800);
  await hideOverlays(page);
  await page.waitForTimeout(300);
  metrics.shots.ford = {
    file: await shoot(page, 'ford-crossing'),
    water: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water),
    perf: await measure(page),
  };
  metrics.errors.ford = errors;
  await context.close();
}

// ---------------------------------------------------------------- shot 4
if (wanted('4')) {
  const { context, page, errors } = await open(DESKTOP);
  // NO `nopause` here: RunManager:314 skips the secured overlay entirely when pause
  // is disabled and jumps straight into the Rush, so the choice would never render.
  await page.goto(`${base}/?debug&contract=the-claim&nolevel&nokill&nosteal&nowreck&tier=full&nowaves&seed=beauty-rush`);
  await ready(page, { debug: true });
  await page.evaluate(() => {
    const test = window.__GR_TEST__;
    test.grantGold(4000);
    test.teleport(0, 8);
    // Sluices ride the river line, wide enough apart to clear the secured panel;
    // the stockpile and a beacon sit back on the near bank beside them.
    test.placeFree('sluice', -12, 5.4);
    test.placeFree('sluice', 12, 5.4);
    test.placeFree('stockpile', -16, 9.5);
    test.placeFree('sentry_beacon', 15, 10);
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.__GR_TEST__.startWaveForTest(10));
  await page.getByTestId('claim-secured').waitFor({ timeout: 15_000 });
  await page.waitForTimeout(900);
  metrics.shots.secured = { file: await shoot(page, 'wave10-secured-rush-choice') };
  await page.getByTestId('stay-for-rush').click();
  await page.waitForTimeout(2200);
  metrics.shots.rushActive = {
    file: await shoot(page, 'rush-active'),
    run: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run),
    pilot: await pilotState(page),
  };
  metrics.errors.rush = errors;
  await context.close();
}

// ---------------------------------------------------------------- shot 5
if (wanted('5')) {
  const { context, page, errors } = await open(MOBILE);
  await plainBootTheClaim(page);
  await ready(page, { debug: false });
  await page.waitForTimeout(1500);
  metrics.shots.bootMobile = { file: await shoot(page, 'boot-mobile'), pilot: await pilotState(page) };
  await page.goto(`${base}/?${DEBUG_QUERY}&nowaves&seed=beauty-mobile`);
  await ready(page, { debug: true });
  await page.evaluate(() => window.__GR_TEST__.teleport(0, 12));
  await page.waitForTimeout(2200);
  metrics.shots.runCameraMobile = {
    file: await shoot(page, 'run-camera-mobile'),
    pilot: await pilotState(page),
    perf: await measure(page),
    perfAb: await perfAb(page, `${DEBUG_QUERY}&nowaves&seed=beauty-mobile`, async (target) => {
      await target.evaluate(() => window.__GR_TEST__.teleport(0, 12));
      await target.waitForTimeout(2200);
    }),
  };
  metrics.errors.mobile = errors;
  await context.close();
}

await browser.close();

writeFileSync(METRICS_FILE, `${JSON.stringify(metrics, null, 2)}\n`);
for (const [name, shot] of Object.entries(metrics.shots)) {
  const perf = shot.perf ? ` p95=${shot.perf.rafP95Ms}ms calls=${shot.perf.drawCalls} tris=${shot.perf.triangles}` : '';
  console.log(`${name.padEnd(16)} ${shot.file}${perf}`);
}
console.log(JSON.stringify(metrics.errors));
console.log(`wrote ${path.relative(ROOT, METRICS_FILE)}`);
