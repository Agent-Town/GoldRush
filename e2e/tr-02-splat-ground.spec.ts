import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type ModeId = 'old-tiles' | 'tr-01-mesh' | 'tr-02-splat';

const ARTIFACT_DIR = path.resolve('artifacts/tr-02');
const ARTIFACT_TEST_TIMEOUT = 180_000;
const MODES: readonly { id: ModeId; query: string }[] = [
  { id: 'old-tiles', query: '' },
  { id: 'tr-01-mesh', query: '&terrainMesh=1' },
  { id: 'tr-02-splat', query: '&terrainMesh=1&terrainSplat=1' },
];
const POSES = [
  { id: 'mid-claim', contract: 'the-claim', x: 0, z: 12 },
  { id: 'river-bank', contract: 'the-claim', x: 12, z: 6.25 },
  { id: 'mesa-arroyo', contract: 'e1-dry-gulch', x: -12, z: -14 },
  { id: 'vista-edge', contract: 'e1-twin-banks', x: 28, z: 28 },
] as const;
const IDENTITY_CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-night-shift'] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openTerrain(page: Page, contract: string, seed: string, mode: ModeId): Promise<void> {
  const extra = MODES.find((entry) => entry.id === mode)?.query ?? '';
  await page.goto(`/?debug&contract=${contract}&nowaves&nokill&nolevel&nopause&nosteal&seed=${seed}${extra}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
}

async function capturePose(page: Page, pose: (typeof POSES)[number], testInfo: TestInfo, mode: ModeId): Promise<Buffer> {
  await openTerrain(page, pose.contract, `tr-02-${pose.id}`, mode);
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), pose);
  await page.waitForTimeout(450);
  const buffer = await page.screenshot({ fullPage: false });
  fs.writeFileSync(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${pose.id}-${mode}.png`), buffer);
  return buffer;
}

test('TR-02 captures old/TR-01/TR-02 triptychs and keeps flags default-off', async ({ page }, testInfo) => {
  test.setTimeout(ARTIFACT_TEST_TIMEOUT);
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);

  for (const pose of POSES) {
    const images: Buffer[] = [];
    for (const mode of MODES) images.push(await capturePose(page, pose, testInfo, mode.id));
    const triptych = stitchHorizontal(images.map((image) => PNG.sync.read(image)));
    const file = path.join(ARTIFACT_DIR, `${testInfo.project.name}-${pose.id}-triptych.png`);
    fs.writeFileSync(file, PNG.sync.write(triptych));
    await testInfo.attach(`${pose.id}-triptych`, { body: PNG.sync.write(triptych), contentType: 'image/png' });
  }

  await openTerrain(page, 'the-claim', 'tr-02-flag-off', 'old-tiles');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground)).toMatchObject({
    enabled: false,
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  });

  await openTerrain(page, 'the-claim', 'tr-02-tr01', 'tr-01-mesh');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground)).toMatchObject({
    enabled: true,
    mode: 'continuous-mesh',
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  });

  await openTerrain(page, 'the-claim', 'tr-02-splat', 'tr-02-splat');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground)).toMatchObject({
    enabled: true,
    mode: 'continuous-mesh',
    textureSource: 'bank-atlas-splat',
    textureSeams: 'per-pixel splat gradients',
  });

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('TR-02 splat is smooth, deterministic, identity-driven, and inside perf envelope', async ({ page }, testInfo) => {
  test.setTimeout(ARTIFACT_TEST_TIMEOUT);
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);

  await openTerrain(page, 'the-claim', 'tr-02-seams', 'tr-02-splat');
  const seamPng = PNG.sync.read(await page.locator('#game-canvas').screenshot());
  const seam = boundaryStepReport(seamPng);
  expect(seam.samples).toBeGreaterThan(40);
  expect(seam.p95).toBeLessThan(72);

  const identities = [];
  for (const contract of IDENTITY_CONTRACTS) {
    await openTerrain(page, contract, `tr-02-identity-${contract}`, 'tr-02-splat');
    const png = PNG.sync.read(await page.locator('#game-canvas').screenshot());
    identities.push({ contract, color: averageTerrainColor(png) });
  }
  const minIdentityDistance = minColorDistance(identities.map((entry) => entry.color));
  expect(minIdentityDistance).toBeGreaterThan(8);

  const runA = await splatFingerprint(page, 'e1-dry-gulch', 'tr-02-determinism');
  const runB = await splatFingerprint(page, 'e1-dry-gulch', 'tr-02-determinism');
  expect(runB.hash).toBe(runA.hash);

  const tr01Perf = await samplePerf(page, 'tr-01-mesh', `tr-02-perf-tr01-${testInfo.project.name}`);
  const tr02Perf = await samplePerf(page, 'tr-02-splat', `tr-02-perf-splat-${testInfo.project.name}`);
  const report = { project: testInfo.project.name, seam, identities, minIdentityDistance, tr01Perf, tr02Perf };
  const body = `${JSON.stringify(report, null, 2)}\n`;
  fs.writeFileSync(path.join(ARTIFACT_DIR, `${testInfo.project.name}-perf-and-splat-report.json`), body);
  await testInfo.attach('tr-02-perf-and-splat-report', { body, contentType: 'application/json' });

  expect(tr02Perf.ground.drawCalls).toBe(1);
  expect(tr02Perf.rendererCalls).toBeLessThanOrEqual(200);
  expect(tr02Perf.frameMsP95).toBeLessThanOrEqual(Math.max(140, tr01Perf.frameMsP95 * 1.85));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

async function splatFingerprint(page: Page, contract: string, seed: string): Promise<{ hash: string; payload: unknown }> {
  await openTerrain(page, contract, seed, 'tr-02-splat');
  const payload = await page.evaluate(() => ({
    ground: window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground,
    tileParams: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams,
    probes: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.probes,
  }));
  return { payload, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex') };
}

async function samplePerf(page: Page, mode: ModeId, seed: string): Promise<{
  ground: NonNullable<ThreeGameDiagnostics['terrain']['ground']>;
  frameMsP95: number;
  rendererCalls: number;
  enemiesAlive: number;
}> {
  await openTerrain(page, 'the-claim', seed, mode);
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 96);
    window.__GR_TEST__?.spawnPack(96, 16, { hpScale: 999, speedScale: 0.25 });
  });
  await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 90);
  const startFrame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction((frame) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > frame + 160, startFrame);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  return {
    ground: diagnostics.terrain.ground!,
    frameMsP95: diagnostics.frameMs.p95,
    rendererCalls: diagnostics.renderer.calls,
    enemiesAlive: diagnostics.enemiesAlive,
  };
}

function stitchHorizontal(images: PNG[]): PNG {
  const gutter = 8;
  const width = images.reduce((sum, image) => sum + image.width, 0) + gutter * (images.length - 1);
  const height = Math.max(...images.map((image) => image.height));
  const output = new PNG({ width, height });
  output.data.fill(232);
  let xOffset = 0;
  for (const image of images) {
    PNG.bitblt(image, output, 0, 0, image.width, image.height, xOffset, 0);
    xOffset += image.width + gutter;
  }
  return output;
}

function boundaryStepReport(png: PNG): { p95: number; max: number; samples: number; rejected: number } {
  const deltas: number[] = [];
  let rejected = 0;
  const xs = [0.25, 0.375, 0.5, 0.625, 0.75].map((ratio) => Math.floor(png.width * ratio));
  const ys = [0.38, 0.5, 0.62, 0.74].map((ratio) => Math.floor(png.height * ratio));
  for (const x of xs) {
    for (let y = Math.floor(png.height * 0.35); y < Math.floor(png.height * 0.78); y += 8) {
      pushGroundDelta(deltas, colorDelta(pixel(png, x - 1, y), pixel(png, x + 1, y))) || (rejected += 1);
    }
  }
  for (const y of ys) {
    for (let x = Math.floor(png.width * 0.18); x < Math.floor(png.width * 0.82); x += 8) {
      pushGroundDelta(deltas, colorDelta(pixel(png, x, y - 1), pixel(png, x, y + 1))) || (rejected += 1);
    }
  }
  deltas.sort((a, b) => a - b);
  return {
    p95: deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * 0.95))] ?? 0,
    max: deltas[deltas.length - 1] ?? 0,
    samples: deltas.length,
    rejected,
  };
}

function pushGroundDelta(deltas: number[], delta: number): boolean {
  if (delta > 120) return false;
  deltas.push(delta);
  return true;
}

function averageTerrainColor(png: PNG): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let y = Math.floor(png.height * 0.42); y < Math.floor(png.height * 0.74); y += 4) {
    for (let x = Math.floor(png.width * 0.2); x < Math.floor(png.width * 0.8); x += 4) {
      const [pr, pg, pb] = pixel(png, x, y);
      r += pr;
      g += pg;
      b += pb;
      count += 1;
    }
  }
  return [r / count, g / count, b / count].map((value) => Number(value.toFixed(2))) as [number, number, number];
}

function minColorDistance(colors: Array<[number, number, number]>): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < colors.length; i += 1) {
    for (let j = i + 1; j < colors.length; j += 1) min = Math.min(min, colorDelta(colors[i]!, colors[j]!));
  }
  return Number(min.toFixed(2));
}

function pixel(png: PNG, x: number, y: number): [number, number, number] {
  const ix = Math.max(0, Math.min(png.width - 1, x));
  const iy = Math.max(0, Math.min(png.height - 1, y));
  const offset = (iy * png.width + ix) * 4;
  return [png.data[offset] ?? 0, png.data[offset + 1] ?? 0, png.data[offset + 2] ?? 0];
}

function colorDelta(a: [number, number, number], b: [number, number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
