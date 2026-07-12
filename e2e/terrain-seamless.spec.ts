import { expect, test, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

type Errors = { console: string[]; page: string[] };
type Tier = 'full' | 'lite';

const ARTIFACT_DIR = path.resolve('artifacts/terrain-seamless');
const MAPS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e2-hill-mine'] as const;
const SHOT_MAPS = ['the-claim', 'e1-dry-gulch', 'e2-hill-mine'] as const;
const ZOOMS = [
  { id: 'near', y: 22, z: 15 },
  { id: 'gameplay', y: 26.2, z: 18.3 },
  { id: 'wide', y: 34, z: 24 },
] as const;

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function open(page: Page, contract: string, tier: Tier, seamless = true): Promise<void> {
  await page.goto(
    `/?debug&contract=${contract}&performance=${tier}&terrainSeamless=${seamless ? 1 : 0}&nowaves&nokill&nolevel&nopause&nosteal&nowreck&seed=terrain-seamless`,
  );
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.assets['terrain.bank'] === 'loaded');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.lag', 0.001));
}

async function capture(page: Page): Promise<PNG> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.waitForTimeout(220);
    const png = PNG.sync.read(await page.locator('#game-canvas').screenshot());
    if (voidRatio(png) < 0.01) return png;
  }
  throw new Error('Canvas capture contains missing black compositor tiles.');
}

async function seamReport(page: Page, png: PNG): Promise<{ p95: number; max: number; samples: number }> {
  const box = await page.locator('#game-canvas').boundingBox();
  if (!box) throw new Error('Missing canvas bounds.');
  const pairs = await page.evaluate(() => {
    const size = window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.size ?? 64;
    const half = size / 2;
    const seams = [-half / 2, 0, half / 2];
    const along = Array.from({ length: 21 }, (_, index) => ((index - 10) / 12) * half);
    const result: Array<{ a: { x: number; y: number; inView: boolean }; b: { x: number; y: number; inView: boolean } }> = [];
    for (const seam of seams) {
      for (const value of along) {
        const xHeight = window.__GR_TEST__?.terrainVisualY(seam, value) ?? 0;
        const zHeight = window.__GR_TEST__?.terrainVisualY(value, seam) ?? 0;
        const xa = window.__GR_TEST__?.screenPoint(seam - 0.35, value, xHeight);
        const xb = window.__GR_TEST__?.screenPoint(seam + 0.35, value, xHeight);
        const za = window.__GR_TEST__?.screenPoint(value, seam - 0.35, zHeight);
        const zb = window.__GR_TEST__?.screenPoint(value, seam + 0.35, zHeight);
        if (xa && xb) result.push({ a: xa, b: xb });
        if (za && zb) result.push({ a: za, b: zb });
      }
    }
    return result;
  });
  const scaleX = png.width / box.width;
  const scaleY = png.height / box.height;
  const deltas = pairs
    .filter(({ a, b }) => a.inView && b.inView)
    .map(({ a, b }) => pixelDelta(png, Math.round(a.x * scaleX), Math.round(a.y * scaleY), Math.round(b.x * scaleX), Math.round(b.y * scaleY)))
    .filter((delta) => delta <= 120)
    .sort((a, b) => a - b);
  return { p95: percentile(deltas, 0.95), max: deltas[deltas.length - 1] ?? 0, samples: deltas.length };
}

function voidRatio(png: PNG): number {
  let black = 0;
  let total = 0;
  for (let y = Math.floor(png.height * 0.2); y < Math.floor(png.height * 0.9); y += 2) {
    for (let x = Math.floor(png.width * 0.05); x < Math.floor(png.width * 0.95); x += 2) {
      const offset = (y * png.width + x) * 4;
      if (png.data[offset]! <= 2 && png.data[offset + 1]! <= 2 && png.data[offset + 2]! <= 2) black += 1;
      total += 1;
    }
  }
  return black / total;
}

function pixelDelta(png: PNG, ax: number, ay: number, bx: number, by: number): number {
  const a = (Math.max(0, Math.min(png.height - 1, ay)) * png.width + Math.max(0, Math.min(png.width - 1, ax))) * 4;
  const b = (Math.max(0, Math.min(png.height - 1, by)) * png.width + Math.max(0, Math.min(png.width - 1, bx))) * 4;
  return Math.hypot(png.data[a]! - png.data[b]!, png.data[a + 1]! - png.data[b + 1]!, png.data[a + 2]! - png.data[b + 2]!);
}

function percentile(values: number[], ratio: number): number {
  return values[Math.min(values.length - 1, Math.floor(values.length * ratio))] ?? 0;
}

async function fingerprint(page: Page): Promise<string> {
  const payload = await page.evaluate(() => ({
    tile: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams,
    sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
    height: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.probes,
  }));
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

async function perfSample(page: Page): Promise<{ frameMsP95: number; drawCalls: number; groundDrawCalls: number }> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForFunction((frame) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > frame + 60, start);
  return page.evaluate(() => ({
    frameMsP95: window.__THREE_GAME_DIAGNOSTICS__?.frameMs.p95 ?? 0,
    drawCalls: window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 0,
    groundDrawCalls: window.__THREE_GAME_DIAGNOSTICS__?.terrain.ground?.drawCalls ?? 0,
  }));
}

test('all shipped terrain de-tiles deterministically within FULL and LITE budgets', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const errors = collectErrors(page);
  const perf = [];

  for (const tier of ['full', 'lite'] as const) {
    for (const contract of MAPS) {
      await open(page, contract, tier, false);
      const before = await perfSample(page);
      await open(page, contract, tier);
      const after = await perfSample(page);
      perf.push({ contract, tier, before, after, drawCallDelta: after.drawCalls - before.drawCalls });
    }
  }

  const probes = [];
  for (const contract of SHOT_MAPS) {
    await open(page, contract, 'full', false);
    const beforeFingerprint = await fingerprint(page);
    const before = await seamReport(page, await capture(page));
    await open(page, contract, 'full');
    const afterFingerprint = await fingerprint(page);
    const after = await seamReport(page, await capture(page));
    probes.push({ contract, before, after, fingerprintUnchanged: beforeFingerprint === afterFingerprint });
    expect(after.samples).toBeGreaterThan(12);
    expect(after.p95).toBeLessThan(before.p95);
    expect(afterFingerprint).toBe(beforeFingerprint);

    for (const zoom of ZOOMS) {
      for (const seamless of [false, true]) {
        await open(page, contract, 'full', seamless);
        await page.evaluate(({ y, z }) => {
          window.__GR_TEST__?.setBalance('camera.offset.y', y);
          window.__GR_TEST__?.setBalance('camera.offset.z', z);
        }, zoom);
        const png = await capture(page);
        fs.writeFileSync(path.join(ARTIFACT_DIR, `${testInfo.project.name}-${contract}-${zoom.id}-${seamless ? 'after' : 'before'}.png`), PNG.sync.write(png));
      }
    }
  }

  const report = { project: testInfo.project.name, probes, perf };
  fs.writeFileSync(path.join(ARTIFACT_DIR, `${testInfo.project.name}-report.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(perf.every((sample) => sample.after.frameMsP95 > 0 && sample.after.frameMsP95 <= Math.max(60, sample.before.frameMsP95 * 1.15))).toBe(true);
  expect(perf.every((sample) => sample.after.drawCalls <= 200 && sample.after.groundDrawCalls === 1 && Math.abs(sample.drawCallDelta) <= 1)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});
