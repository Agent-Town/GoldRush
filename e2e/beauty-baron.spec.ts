/**
 * beauty-baron — the shot board + perf evidence for the e1-baron beauty shift.
 *
 * docs/beauty/e1-baron-brief.md §4 names six frames; this spec renders them and
 * measures the mid-volley p95 that the brief calls "first-class evidence". It is
 * deliberately SEPARATE from e2e/e1-baron.spec.ts — that file IS the "Baron 22/22"
 * launch gate (specs/release-e1/README.md:26) and must stay untouched.
 *
 * Stage the output with GR_BEAUTY_STAGE so a before/after pair survives:
 *   GR_BEAUTY_STAGE=before npx playwright test e2e/beauty-baron.spec.ts --workers=1
 *
 * Every frame first proves the map is really rendering from the GLB
 * (terrain3dPilotState=ready + RenderSource=glb) — the contract-equality gate.
 * A silent painted fallback (Mistake #10) would otherwise let a broken re-export
 * ship a screenshot that looks fine.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type PerfSample = { p95Ms: number; medianMs: number; frames: number; drawCalls: number; peakDrawCalls: number; triangles: number; volleys: number; windows?: number[] };

const STAGE = process.env.GR_BEAUTY_STAGE ?? 'current';
const ARTIFACT_DIR = path.resolve('artifacts/beauty-baron', STAGE);

// The brief's fixed fresh-eye run camera: Blender eye (0,-30.3,26.26) -> target
// (0,-8.65,0.51) at 42 deg. Blender y = -game_z, so the target sits at game z=+8.65
// and the eye 21.65 further back and 25.75 higher. Balance.camera.fov is already 42.
const FRESH_EYE = { heroZ: 8.65, offsetY: 25.75, offsetZ: 21.65 } as const;
const PERF_FRAMES = 180;

// The baron terrain GLB carries a 2048² embedded atlas (~7.8 MB); a cold decode
// plus five landmark bodies regularly outruns the 30 s default on a loaded box,
// and a shot board that flakes is not evidence.
test.beforeEach(({}, testInfo) => testInfo.setTimeout(120_000));

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error' && !isDevServerTransportError(message.text())) bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function isDevServerTransportError(text: string): boolean {
  return text.includes("WebSocket connection to 'ws://127.0.0.1:5188/") || text === 'Failed to load resource: net::ERR_CONNECTION_REFUSED';
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

/** The contract-equality gate: the GLB terrain really mounted, no painted fallback. */
async function expectGlbTerrain(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotState ?? null), { timeout: 60_000 })
    .toBe('ready');
  await expect(page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotRenderSource ?? null)).resolves.toBe('glb');
  await expect(page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotLandmarks ?? null)).resolves.toBe('5');
  await expect(page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkSkipped ?? null)).resolves.toBe('0');
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function setBalance(page: Page, key: string, value: number | boolean | string): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function setBalances(page: Page, values: Record<string, number | boolean | string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) await setBalance(page, key, value);
}

/** Clear the briefing card — a world shot judged through a UI panel judges the panel. */
async function clearBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  await page.waitForTimeout(200);
}

/** Pin the follow camera into a fixed pose so two stages frame the same ground. */
async function pinCamera(page: Page, heroZ: number, offsetY: number, offsetZ: number): Promise<void> {
  await setBalances(page, {
    'camera.lag': 0.001,
    'camera.lookAhead': 0,
    'camera.downScreenLookOffset': 0,
    'camera.offset.y': offsetY,
    'camera.offset.z': offsetZ,
  });
  await page.evaluate((z) => window.__GR_TEST__?.teleport(0, z), heroZ);
  await page.waitForTimeout(450);
}

async function advance(page: Page, seconds: number): Promise<void> {
  await page.evaluate((duration) => window.__GR_TEST__?.advanceSim(duration), seconds);
}

async function advanceUntil(page: Page, pass: (value: { blastsAlive: number; telegraphActive: boolean }) => boolean, seconds = 6): Promise<void> {
  const stepSeconds = 1 / 15;
  const steps = Math.ceil(seconds / stepSeconds);
  for (let index = 0; index < steps; index += 1) {
    await advance(page, stepSeconds);
    const value = await page.evaluate(() => {
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
      return { blastsAlive: diagnostics.arsenal.blastsAlive, telegraphActive: diagnostics.baronRocket.telegraphActive };
    });
    if (pass(value)) return;
  }
  throw new Error('condition did not become true during manual sim advance');
}

/**
 * The 057 kited-Baron drive, reused verbatim in shape: manual sim, a target the
 * volley can chew on, and a Baron parked at range so the cadence keeps firing.
 * Render-only: nothing here edits the shipped manifest on disk.
 */
async function prepareKitedBaron(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = await openGame(page, `?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nosteal&nowreck&tier=full&seed=${seed}`);
  await expectGlbTerrain(page);
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(true))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await setBalances(page, { 'sparkRig.damage': 0, 'sparkRig.range': 0, 'enemy.contactDamage': 0 });
  await page.evaluate(() => {
    const rocket = window.__GR_TEST__?.activeContract().twist.baron?.rocketVolley;
    if (!rocket) throw new Error('missing Baron rocket volley manifest');
    Object.assign(rocket, { damage: 11, radius: 3, cadenceSeconds: 2, telegraphSeconds: 0.25, airTime: 0.35, spreadRadius: 0.08 });
    window.__GR_TEST__?.teleport(0, 12);
    if (!window.__GR_TEST__?.placeFree('palisade', 0.8, 12, 0)) throw new Error('failed to place rocket damage target');
    window.__GR_TEST__?.spawnPack(1, 12, {
      eliteKind: 'baron',
      hpScale: 4,
      speedScale: 0.001,
      visualScale: 4,
      banner: true,
      heroPursuitRange: 45,
      buildingDamageScale: 12,
      supportBuildingDamageScale: 8,
    });
  });
  await advance(page, 0.05);
  return errors;
}

/**
 * Sample real RAF deltas with the sim LIVE. setManualSim only gates the sim
 * (Game.ts:2438 et al), so sampling under manual sim measures a frozen scene —
 * the volley must actually be firing for this number to mean anything.
 */
async function sampleLivePerf(page: Page, frames: number): Promise<PerfSample> {
  // Three independent windows, median-of-p95. A single 180-frame window on a
  // shared dev server swings 2.5x run to run (measured: 26.5 ms vs 10.2 ms for
  // the SAME scene) — reporting one of those as a delta would be a lie with a
  // decimal point on it. Draw calls are sampled per frame too, because the
  // count moves with how many rockets happen to be in the air.
  const windows: PerfSample[] = [];
  for (let round = 0; round < 3; round += 1) {
    windows.push(
      await page.evaluate(async (sampleFrames) => {
        const warmup = 45;
        const deltas: number[] = [];
        const calls: number[] = [];
        const tris: number[] = [];
        await new Promise<void>((resolve) => {
          let previous = performance.now();
          let seen = 0;
          const step = () => {
            const now = performance.now();
            seen += 1;
            if (seen > warmup) {
              deltas.push(now - previous);
              const info = window.__THREE_GAME_DIAGNOSTICS__!.renderer;
              calls.push(info.calls);
              tris.push(info.triangles);
            }
            previous = now;
            if (deltas.length >= sampleFrames) resolve();
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
        const at = (values: number[], quantile: number) => {
          const sorted = [...values].sort((a, b) => a - b);
          return Math.round((sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * quantile))] ?? 0) * 100) / 100;
        };
        return {
          p95Ms: at(deltas, 0.95),
          medianMs: at(deltas, 0.5),
          frames: deltas.length,
          drawCalls: at(calls, 0.5),
          peakDrawCalls: at(calls, 1),
          triangles: at(tris, 0.5),
          volleys: window.__THREE_GAME_DIAGNOSTICS__!.baronRocket.volleys,
        };
      }, frames),
    );
  }
  const median = (pick: (sample: PerfSample) => number) => [...windows].map(pick).sort((a, b) => a - b)[1]!;
  return {
    p95Ms: median((sample) => sample.p95Ms),
    medianMs: median((sample) => sample.medianMs),
    frames: windows[0]!.frames,
    drawCalls: median((sample) => sample.drawCalls),
    peakDrawCalls: median((sample) => sample.peakDrawCalls),
    triangles: median((sample) => sample.triangles),
    volleys: windows[windows.length - 1]!.volleys,
    windows: windows.map((sample) => sample.p95Ms),
  };
}

async function volleyVfx(page: Page): Promise<ThreeGameDiagnostics['vfx']['baronVolley']> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vfx.baronVolley);
}

async function writeMetrics(testInfo: TestInfo, name: string, payload: unknown): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

test('shot 1 — arrival boot: the taunt-banner moment over the fought-over ground', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nokill&nosteal&nowreck&tier=full&seed=e1-baron-spawn');
  await expectGlbTerrain(page);
  await setBalances(page, {
    'waves.waveInterval': 3.6,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 80,
  });
  await page.evaluate(() => window.__GR_TEST__?.setWave(19));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(19);
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron') ?? null), { timeout: 15_000 })
    .not.toBeNull();
  await page.waitForTimeout(400);
  await shot(page, testInfo, 'arrival');
  assertNoErrors(errors);
});

test('shot 2 — fixed fresh-eye run camera: warm home bank against cold company iron', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&tier=full&seed=e1-baron-fresh-eye');
  await expectGlbTerrain(page);
  await clearBriefing(page);
  await pinCamera(page, FRESH_EYE.heroZ, FRESH_EYE.offsetY, FRESH_EYE.offsetZ);
  await shot(page, testInfo, 'fresh-eye');
  assertNoErrors(errors);
});

test('shot 3 — MID-VOLLEY: tracers, impact rings, embers, and the p95 evidence frame', async ({ page }, testInfo) => {
  const errors = await prepareKitedBaron(page, 'beauty-baron-volley');
  await clearBriefing(page);
  await advanceUntil(page, (value) => value.telegraphActive);
  await advanceUntil(page, (value) => value.blastsAlive >= 3);
  // Read the pools BEFORE the screenshot round-trip: a 0.2 s tracer can expire
  // inside the capture, so the diagnostic is the proof and the frame is the
  // illustration. Never claim a VFX shipped because a screenshot looked busy.
  // Shoot first, read second: the tracer lives 0.2 s and any evaluate in front
  // of the capture spends that budget. The monotonic spawn counters are what
  // PROVES the beat fired; `active` only proves the caps hold.
  await shot(page, testInfo, 'mid-volley-arcs');
  const airborne = await volleyVfx(page);
  await advance(page, 0.42);
  await shot(page, testInfo, 'mid-volley-impact');
  const landed = await volleyVfx(page);
  expect(airborne.tracers.spawned).toBeGreaterThan(0);
  expect(airborne.tracers.active).toBeLessThanOrEqual(airborne.tracers.capacity);
  expect(landed.rings.spawned).toBeGreaterThan(0);
  expect(landed.rings.active).toBeLessThanOrEqual(landed.rings.capacity);
  expect(landed.wisps.spawned).toBeGreaterThan(0);
  expect(landed.wisps.active).toBeLessThanOrEqual(landed.wisps.capacity);
  // U3's whole design is "zero new dynamic lights": impacts borrow the existing
  // six-spotlight muzzle-flash pool. If that ever stops being true this fails.
  const lighting = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting);
  expect(lighting?.muzzleFlashes ?? 0).toBeLessThanOrEqual(6);
  expect(lighting?.muzzleFlashCount ?? 0).toBeGreaterThan(0);

  // Hand the clock back so the 2 s cadence keeps firing while RAF is sampled.
  await expect(page.evaluate(() => window.__GR_TEST__?.setManualSim(false))).resolves.toBe(false);
  await page.waitForTimeout(600);
  const perf = await sampleLivePerf(page, PERF_FRAMES);
  await shot(page, testInfo, 'mid-volley-live');
  await writeMetrics(testInfo, 'mid-volley-perf', {
    stage: STAGE,
    viewport: page.viewportSize(),
    ...perf,
    volleyVfx: { airborne, landed, live: await volleyVfx(page) },
    muzzleFlashPool: { live: lighting?.muzzleFlashes ?? 0, fired: lighting?.muzzleFlashCount ?? 0, cap: 6 },
  });

  expect(perf.frames).toBe(PERF_FRAMES);
  expect(perf.volleys).toBeGreaterThan(0);
  expect(perf.drawCalls).toBeGreaterThan(0);
  assertNoErrors(errors);
});

test('shot 4 — siege-line close-up: banners, wreck margin, scorch pads', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&tier=full&seed=e1-baron-siege-line');
  await expectGlbTerrain(page);
  await clearBriefing(page);
  await pinCamera(page, 2.5, 13.5, 13.0);
  await shot(page, testInfo, 'siege-line');
  assertNoErrors(errors);
});

test('shot 5 — victory over the battle-scarred field', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-baron&timescale=8&nolevel&nowaves&nosteal&nowreck&tier=full&seed=e1-baron-victory');
  await expectGlbTerrain(page);
  await setBalances(page, {
    'waves.waveInterval': 0.45,
    'waves.trickleInterval': 999,
    'waves.pulseBase': 0,
    'waves.pulsePerWave': 0,
    'waves.pulsesPerWave': 1,
    'waves.edgesPerPulse': 1,
    'waves.aliveCap': 80,
    'enemy.hp': 1,
    'sparkRig.damage': 9999,
    'sparkRig.fireRate': 60,
    'sparkRig.range': 300,
    'sparkRig.boltRadius': 5,
    'sparkRig.boltSpeed': 12,
    'sparkRig.boltLife': 3,
  });
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({}));
  await page.evaluate(() => window.__GR_TEST__?.setWave(20));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThanOrEqual(20);
  await page.evaluate(() => {
    window.__GR_TEST__?.spawnPack(1, 4, { eliteKind: 'baron', hpScale: 160, speedScale: 0, visualScale: 4, banner: true });
  });
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false), { timeout: 25_000 })
    .toBe(true);
  await page.waitForTimeout(600);
  await shot(page, testInfo, 'victory');
  assertNoErrors(errors);
});
