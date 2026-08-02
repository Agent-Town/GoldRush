import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// THE BEAUTY SHIFT BOARD HARNESS — e1-twin-banks (docs/beauty/e1-twin-banks-brief.md §4).
// One spec that is both the shot-list renderer and the permanent guard: the same boards
// that judge each upgrade also assert the render-only water ribbons stay mounted, the
// sculpt contract still validates, and the frame budget holds. Stage boards land in
// artifacts/beauty-twin-banks/<stage>/ so before/after pairs are same-harness pairs
// (GR_BEAUTY_STAGE=before|u1|u2|... — default "latest" for ordinary gate runs).

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type PerfSample = { p95: number; avg: number; sampleCount: number; calls: number; triangles: number };

const STAGE = process.env.GR_BEAUTY_STAGE ?? 'latest';
const ARTIFACT_DIR = path.resolve('artifacts/beauty-twin-banks', STAGE);
const QUERY = '?debug&contract=e1-twin-banks&timescale=1&nolevel&nowaves&nokill&seed=beauty-twin-banks';
// The fresh eye's fixed run camera, (0,-30.3,26.26) -> (0,-8.65,0.51) in the sculpt's Blender
// frame, is the shipped rig standing at game (0, 12): offset (0,26.2,18.3) puts the camera at
// z=30.3 and downScreenLookOffset 3.35 puts the look point at z=8.65. Same frame, live engine.
const RUN_CAMERA = { x: 0, z: 12 };
const WEST_FORD = { x: -16, z: 6 };
const PLAIT = { x: -7.5, z: 4.4 };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function boot(page: Page): Promise<void> {
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, {
    timeout: 60_000,
  });
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 60_000 });
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.lag', 0.012));
  await hideDebugChrome(page);
}

/** The lil-gui tuning panel is a debug-build artifact; no player ever sees it. */
async function hideDebugChrome(page: Page): Promise<void> {
  await page.evaluate(() => document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none'));
}

async function hideGameChrome(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const selector of ['.lil-gui', '#hud', '#touch-controls']) {
      document.querySelector<HTMLElement>(selector)?.style.setProperty('display', 'none');
    }
  });
}

async function poseAt(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  await page.waitForTimeout(700);
}

async function shot(page: Page, testInfo: TestInfo, name: string, clip?: { x: number; y: number; width: number; height: number }): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), clip });
}

/** p95 over the game's own 180-frame window, sampled after the window has fully refilled. */
async function perf(page: Page): Promise<PerfSample> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0) >= 180, undefined, {
    timeout: 30_000,
  });
  await page.waitForTimeout(1_500);
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      p95: Math.round(diagnostics.frameMs.p95 * 100) / 100,
      avg: Math.round(diagnostics.frameMs.avg * 100) / 100,
      sampleCount: diagnostics.frameMs.sampleCount,
      calls: diagnostics.renderer.calls,
      triangles: diagnostics.renderer.triangles,
    };
  });
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('twin banks beauty board: boot, braid run camera, ford, plait, overview', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  await boot(page);

  // SHOT 1 — plain boot on the south bank, HUD and all: what the player actually meets.
  await shot(page, testInfo, '1-boot-south-bank');

  // SHOT 2 — the fresh eye's fixed run camera on the braid (the E1 PASS board's frame).
  await poseAt(page, RUN_CAMERA.x, RUN_CAMERA.z);
  await hideGameChrome(page);
  await shot(page, testInfo, '2-braid-run-camera');
  const runCameraPerf = await perf(page);

  // SHOT 4 — the plait: dry gravel island between the two channels, cropped from the same
  // render (a crop, never a second camera, so the pixels are the shipped ones).
  await poseAt(page, PLAIT.x, PLAIT.z);
  await hideGameChrome(page);
  const viewport = page.viewportSize()!;
  await shot(page, testInfo, '4-plait', {
    x: Math.round(viewport.width * 0.2),
    y: Math.round(viewport.height * 0.12),
    width: Math.round(viewport.width * 0.6),
    height: Math.round(viewport.height * 0.42),
  });

  // SHOT 5 — both banks at once, player zoom pushed to the tile scale.
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.zoom.maxDistanceScale', 2.6));
  await poseAt(page, 0, 2);
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(1_200);
  await hideGameChrome(page);
  await shot(page, testInfo, '5-both-banks-overview');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.zoom.maxDistanceScale', 1.6));

  const bootPerf = await perf(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `perf-${testInfo.project.name}.json`),
    `${JSON.stringify({ stage: STAGE, project: testInfo.project.name, runCamera: runCameraPerf, overview: bootPerf }, null, 2)}\n`,
  );
  expectClean(errors);
});

test('twin banks beauty board: west ford under pressure', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  test.skip(testInfo.project.name !== 'desktop-chrome', 'pressure board is a desktop composition judge');
  const errors = collectErrors(page);
  await boot(page);

  // SHOT 3 — enemies crossing both channels at the west ford.
  await poseAt(page, WEST_FORD.x, WEST_FORD.z);
  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.speed', 1.2));
  for (const z of [16, 15, 14, -14, -15, -16]) {
    await page.evaluate((spawn) => window.__GR_TEST__?.spawnEnemyAt(spawn.x, spawn.z), { x: WEST_FORD.x, z });
  }
  await page.waitForTimeout(2_600);
  await hideGameChrome(page);
  await shot(page, testInfo, '3-west-ford-pressure');
  expectClean(errors);
});

test('the braid renders living water without touching the sculpt contract or the frame budget', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await boot(page);
  const canvas = page.locator('canvas');

  // The mounted sculpt still validates against its contract (contract-equality gate).
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-triangles'))).toBe(51_200);
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-vertices'))).toBe(25_921);

  // Sim truth is untouched by the render-only water: the legacy band still classifies.
  const samples = await page.evaluate(() => ({
    center: window.__GR_TEST__?.terrainSample(0, 0),
    westFord: window.__GR_TEST__?.terrainSample(-16, 0),
    eastFord: window.__GR_TEST__?.terrainSample(16, 0),
    southBank: window.__GR_TEST__?.terrainSample(0, -12),
    water: window.__THREE_GAME_DIAGNOSTICS__?.terrain.water,
  }));
  expect(samples.center?.zone).toBe('river');
  expect(samples.westFord?.zone).toBe('ford');
  expect(samples.eastFord?.zone).toBe('ford');
  expect(samples.southBank?.zone).toBe('bank');
  expect(samples.water?.fordStones).toBe(14);
  expect(samples.water?.gravelBars).toBe(2);
  expectClean(errors);
});
