import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';

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
const WEST_END = { x: -25, z: 0 };
const EAST_END = { x: 25, z: 0 };
const WEST_END_PROBE = { x: -29, z: 6 };
const EAST_END_PROBE = { x: 29, z: 6 };

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

async function boot(page: Page, extra = ''): Promise<void> {
  await page.goto(`/${QUERY}${extra}`);
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

  // SHOT 5 — both banks at once. This is the composition judge, so the harness pushes the
  // player zoom past its shipped 1.6x ceiling AND holds the distance fog off: at 2.6x the
  // camera stands 68 m out, where the shipped fog (near 42, far 88) erases the tile into a
  // cream sheet and judges nothing. Documented harness settings, not a render change — the
  // fresh eye's own overview pass hid the panorama for exactly this reason.
  for (const [key, value] of [
    ['camera.zoom.maxDistanceScale', 2.6],
    ['world.fogNear', 400],
    ['world.fogFar', 900],
  ] as const) {
    await page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path as string, next as number), [key, value]);
  }
  await poseAt(page, 0, 2);
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(1_200);
  await hideGameChrome(page);
  // Cropped to the tile: above the shipped zoom ceiling the panorama ring — which is authored
  // fog-exempt on purpose — reads as a flat cream band across the far edge. That is this
  // harness leaving the shipped envelope, not a defect a player can reach (at 1.6x with fog on
  // it is invisible), and it is the same trap the fresh eye's own sweep hit and corrected for.
  await shot(page, testInfo, '5-both-banks-overview', {
    x: Math.round(viewport.width * 0.08),
    y: Math.round(viewport.height * 0.19),
    width: Math.round(viewport.width * 0.84),
    height: Math.round(viewport.height * 0.72),
  });
  for (const [key, value] of [
    ['camera.zoom.maxDistanceScale', 1.6],
    ['world.fogNear', 42],
    ['world.fogFar', 88],
  ] as const) {
    await page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path as string, next as number), [key, value]);
  }

  // SHOT 6 — the wide-aspect join. U5's standing check (MQ-2 matrix, aspect > 1.8:1): the pale
  // sculpt corners meet the panorama differently on a wide monitor than on 16:10, and a visible
  // band there is what makes a 64 m tile read as a tray instead of a valley.
  // Scroll the zoom back to the shipped framing first: the ceiling was lowered again above, but
  // the controller keeps whatever target it already holds until the next wheel event.
  await page.mouse.wheel(0, -4_000);
  await page.waitForTimeout(900);
  await page.setViewportSize({ width: 1600, height: 800 });
  await poseAt(page, 0, 6);
  await hideGameChrome(page);
  await shot(page, testInfo, '6-wide-aspect-join');
  await page.setViewportSize(viewport);
  await page.waitForTimeout(400);

  // SHOTS 7/8 — both places where the braid leaves the tile. These used to be triangular dead
  // stops surrounded by the near-black sculpt bed; the shipped camera must read a continuing
  // channel at desktop and 390px, not a river cut off by the map boundary.
  await poseAt(page, WEST_END.x, WEST_END.z);
  await shot(page, testInfo, '7-west-end');
  await poseAt(page, EAST_END.x, EAST_END.z);
  await shot(page, testInfo, '8-east-end');

  const bootPerf = await perf(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `perf-${testInfo.project.name}.json`),
    `${JSON.stringify({ stage: STAGE, project: testInfo.project.name, runCamera: runCameraPerf, overview: bootPerf }, null, 2)}\n`,
  );
  expectClean(errors);
});

test('the beauty pass pays its frame budget, measured against its own build', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  // Both arms are the SAME build at the SAME camera in the SAME session: `?nochannelwater`
  // withholds only the dressing. That removes machine drift from the +15% law, which a
  // before-commit/after-commit comparison cannot do.
  const arms: Record<string, PerfSample> = {};
  for (const [arm, extra] of [['without', '&nochannelwater'], ['with', '']] as const) {
    await boot(page, extra);
    await poseAt(page, RUN_CAMERA.x, RUN_CAMERA.z);
    await hideGameChrome(page);
    arms[arm] = await perf(page);
  }
  const [without, withWater] = [arms.without!, arms.with!];
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `perf-ab-${testInfo.project.name}.json`),
    `${JSON.stringify({ stage: STAGE, project: testInfo.project.name, without, with: withWater }, null, 2)}\n`,
  );
  // Exact and deterministic: two channel ribbons, one shared confluence, and one ford sheet.
  expect(withWater.calls - without.calls).toBe(4);
  expect(withWater.triangles).toBeGreaterThan(without.triangles);
  // p95 is a worst-5%-of-180-frames sample and swings several ms between identical runs, so the
  // spec guards a generous ceiling and the review reports the measured pair.
  expect(withWater.avg).toBeLessThan(without.avg * 1.25 + 1);
  expectClean(errors);
});

test('the reed field is alive in a still frame', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one viewport is enough to prove motion');
  const errors = collectErrors(page);
  await boot(page);
  await poseAt(page, RUN_CAMERA.x, RUN_CAMERA.z);
  await hideGameChrome(page);
  // A vertex sway cannot be photographed, so it is measured: two frames 600 ms apart, counted
  // over the near bank only (below the braid, away from hero and companion idle animation).
  const first = PNG.sync.read(await page.screenshot());
  await page.waitForTimeout(600);
  const second = PNG.sync.read(await page.screenshot());
  const viewport = page.viewportSize()!;
  const heroBox = { x0: viewport.width * 0.4, x1: viewport.width * 0.6, y0: viewport.height * 0.45, y1: viewport.height * 0.72 };
  let moved = 0;
  for (let y = Math.round(first.height * 0.45); y < first.height; y += 1) {
    for (let x = 0; x < first.width; x += 1) {
      const inViewportX = (x * viewport.width) / first.width;
      const inViewportY = (y * viewport.height) / first.height;
      if (inViewportX > heroBox.x0 && inViewportX < heroBox.x1 && inViewportY > heroBox.y0 && inViewportY < heroBox.y1) continue;
      const offset = (y * first.width + x) * 4;
      const delta =
        Math.abs(first.data[offset]! - second.data[offset]!) +
        Math.abs(first.data[offset + 1]! - second.data[offset + 1]!) +
        Math.abs(first.data[offset + 2]! - second.data[offset + 2]!);
      if (delta > 18) moved += 1;
    }
  }
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, 'reed-motion.json'), `${JSON.stringify({ stage: STAGE, movedPixels: moved }, null, 2)}\n`);
  expect(moved, 'the reed sway should move pixels on the dry bank between two frames').toBeGreaterThan(60);
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

  // The crossing has to READ wet, not merely be classified wet: the pan is the one place a player
  // decides to step or not, and it is where the sim and the render used to disagree on sight.
  expect(await page.locator('canvas').getAttribute('data-terrain3d-pilot-ford-water')).toBe('1');
  const fordProbe = await page.evaluate(() => ({
    zone: window.__GR_TEST__!.terrainSample(-16, 0).zone,
    pan: window.__GR_TEST__!.screenPoint(-16, 0, 0.037),
    bank: window.__GR_TEST__!.screenPoint(-16, 9, window.__GR_TEST__!.terrainVisualY(-16, 9)),
  }));
  expect(fordProbe.zone).toBe('ford');
  const image = PNG.sync.read(await page.screenshot());
  const viewport = page.viewportSize()!;
  const read = (point: { x: number; y: number; inView: boolean }): number[] => {
    expect(point.inView).toBe(true);
    const offset =
      (Math.round((point.y * image.height) / viewport.height) * image.width +
        Math.round((point.x * image.width) / viewport.width)) * 4;
    return [image.data[offset]!, image.data[offset + 1]!, image.data[offset + 2]!];
  };
  // A ford is pale on purpose (the shipped shader tints it toward wet gravel, not deep teal), so
  // the honest test is not "is it green" but "is it cooler than the dry bank nine metres away".
  const pan = read(fordProbe.pan);
  const bank = read(fordProbe.bank);
  expect(pan[2] / pan[0], `pan ${pan.join(',')} vs bank ${bank.join(',')}`).toBeGreaterThan((bank[2] / bank[0]) * 1.3);
  expectClean(errors);
});

test('the braid renders living water without touching the sculpt contract or the frame budget', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await boot(page);
  const canvas = page.locator('canvas');

  // The mounted sculpt still validates against its contract (contract-equality gate).
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-triangles'))).toBe(51_200);
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-vertices'))).toBe(25_921);

  // HM-06: the production mask owns both channels, the dry plait, and the shallow fords.
  const samples = await page.evaluate(() => ({
    center: window.__GR_TEST__?.terrainSample(0, 0),
    northChannel: window.__GR_TEST__?.terrainSample(0, 2),
    southChannel: window.__GR_TEST__?.terrainSample(0, -2),
    sourcePool: window.__GR_TEST__?.terrainSample(-28, 0),
    westFord: window.__GR_TEST__?.terrainSample(-16, 0),
    eastFord: window.__GR_TEST__?.terrainSample(16, 0),
    southBank: window.__GR_TEST__?.terrainSample(0, -12),
    water: window.__THREE_GAME_DIAGNOSTICS__?.terrain.water,
  }));
  expect(samples.center).toMatchObject({ zone: 'bank', walkable: true });
  expect(samples.northChannel).toMatchObject({ zone: 'river', walkable: false });
  expect(samples.southChannel).toMatchObject({ zone: 'river', walkable: false });
  expect(samples.sourcePool).toMatchObject({ zone: 'river', walkable: false });
  expect(samples.westFord?.zone).toBe('ford');
  expect(samples.eastFord?.zone).toBe('ford');
  expect(samples.southBank?.zone).toBe('bank');
  expect(samples.water?.fordStones).toBe(14);
  expect(samples.water?.gravelBars).toBe(2);

  // The dressing is hung on the channel the contract says it is. waterTruth calls the NORTH
  // channel the deep one (0.48 against the south's 0.35) and the plait dry; the deep channel
  // carries the gold glints and the dark bed, so a mirrored re-export would silently teach the
  // player the wrong crossing. Measured on the mounted sculpt, in game coordinates.
  const beds = await page.evaluate(() => ({
    north: window.__GR_TEST__!.terrainVisualY(0, 2),
    south: window.__GR_TEST__!.terrainVisualY(0, -2),
    plait: window.__GR_TEST__!.terrainVisualY(-7.5, 0.2),
  }));
  expect(beds.north, JSON.stringify(beds)).toBeLessThan(beds.south);
  expect(beds.plait, JSON.stringify(beds)).toBeGreaterThan(0.4);

  // Both channels carry a mounted ribbon...
  expect(await canvas.getAttribute('data-terrain3d-pilot-channel-water')).toBe('2');
  expect(await canvas.getAttribute('data-terrain3d-pilot-water-mask')).toBe('twin-banks-true-braid-dev');
  expect(JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-channel-water-half-widths'))!)).toEqual([1.5, 1.5]);
  expect(JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-water-pools'))!)).toEqual([
    { id: 'west-source-box', kind: 'rect', zone: 'river', minX: -30, maxX: -26, minZ: -2, maxZ: 2 },
  ]);
  // ...and the ribbons put WATER ON THE SCREEN. A mesh count is a claim, pixels are the fact:
  // the first cut of this shift shipped two ribbons of zero width that passed every count.
  await poseAt(page, RUN_CAMERA.x, RUN_CAMERA.z);
  await hideGameChrome(page);
  const probes = await page.evaluate(() =>
    // Kept inside the 390px frame: the braid spans the whole tile, but mobile only sees the
    // middle few metres of it at the run camera.
    [{ x: -3, z: 2.43 }, { x: 0, z: 2 }, { x: 3, z: 2.43 }, { x: -3, z: -2.43 }, { x: 0, z: -2 }, { x: 3, z: -2.43 }].map((point) => ({
      ...point,
      screen: window.__GR_TEST__!.screenPoint(point.x, point.z, 0.037),
    })),
  );
  const image = PNG.sync.read(await page.screenshot());
  const viewport = page.viewportSize()!;
  const readings = probes.map((probe) => {
    const x = Math.round((probe.screen.x * image.width) / viewport.width);
    const y = Math.round((probe.screen.y * image.height) / viewport.height);
    const offset = (y * image.width + x) * 4;
    return { ...probe, rgb: [image.data[offset]!, image.data[offset + 1]!, image.data[offset + 2]!] as const };
  });
  for (const reading of readings) {
    expect(reading.screen.inView, JSON.stringify(reading)).toBe(true);
    // Water is cool: green leads and blue is not crushed. The dry braid bed measured
    // 33,21,10 and 17,13,8 at these very points on the BEFORE board.
    expect(reading.rgb[1], JSON.stringify(reading)).toBeGreaterThan(reading.rgb[0]);
    expect(reading.rgb[2] * 2, JSON.stringify(reading)).toBeGreaterThan(reading.rgb[0]);
  }

  // The original six points catch a zero-width ribbon, but not the defects the owner saw at the
  // tile edges: both branches ended in a mitred wedge and left the black sculpt bed exposed. Probe
  // each shared mouth, its continuation, and both former void flanks from an end-local camera.
  const endReadings: Array<{ label: string; x: number; z: number; rgb: [number, number, number] }> = [];
  for (const end of [
    {
      camera: WEST_END_PROBE,
      probes: [
        { label: 'west-junction', x: -27, z: 0 },
        { label: 'west-continuation', x: -31, z: 0 },
        { label: 'west-void-north', x: -29, z: 1.1 },
        { label: 'west-void-south', x: -29, z: -1.1 },
      ],
    },
    {
      camera: EAST_END_PROBE,
      probes: [
        { label: 'east-junction', x: 27, z: 0 },
        { label: 'east-continuation', x: 31, z: 0 },
        { label: 'east-void-north', x: 29, z: 1.1 },
        { label: 'east-void-south', x: 29, z: -1.1 },
      ],
    },
  ] as const) {
    await poseAt(page, end.camera.x, end.camera.z);
    const projected = await page.evaluate((points) => points.map((point) => ({
      ...point,
      screen: window.__GR_TEST__!.screenPoint(point.x, point.z, 0.037),
    })), end.probes);
    const endImage = PNG.sync.read(await page.screenshot());
    for (const probe of projected) {
      expect(probe.screen.inView, JSON.stringify(probe)).toBe(true);
      const centerX = Math.round((probe.screen.x * endImage.width) / viewport.width);
      const centerY = Math.round((probe.screen.y * endImage.height) / viewport.height);
      const rgb: [number, number, number] = [0, 0, 0];
      for (let y = centerY - 1; y <= centerY + 1; y += 1) {
        for (let x = centerX - 1; x <= centerX + 1; x += 1) {
          const offset = (y * endImage.width + x) * 4;
          rgb[0] += endImage.data[offset]! / 9;
          rgb[1] += endImage.data[offset + 1]! / 9;
          rgb[2] += endImage.data[offset + 2]! / 9;
        }
      }
      endReadings.push({ label: probe.label, x: probe.x, z: probe.z, rgb: rgb.map(Math.round) as [number, number, number] });
    }
  }
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(
    path.join(ARTIFACT_DIR, `water-probes-${testInfo.project.name}.json`),
    `${JSON.stringify({ stage: STAGE, center: readings, ends: endReadings }, null, 2)}\n`,
  );
  for (const reading of endReadings) {
    expect(reading.rgb[0] + reading.rgb[1] + reading.rgb[2], JSON.stringify(reading)).toBeGreaterThan(115);
    expect(reading.rgb[1], JSON.stringify(reading)).toBeGreaterThan(reading.rgb[0]);
    expect(reading.rgb[2] * 2, JSON.stringify(reading)).toBeGreaterThan(reading.rgb[0]);
  }
  expectClean(errors);
});
