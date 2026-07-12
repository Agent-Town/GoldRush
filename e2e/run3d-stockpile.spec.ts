import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-stockpile');
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&seed=run3d-stockpile${query}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function placeStockpiles(page: Page): Promise<void> {
  for (const [x, z] of [[-2, 7], [2, 7]]) {
    await expect(page.evaluate(([px, pz]) => window.__GR_TEST__?.placeFree('stockpile', px, pz), [x, z])).resolves.toBe(true);
  }
}

async function p95(page: Page, frames = 180): Promise<number> {
  return page.evaluate(async (count) => {
    for (let i = 0; i < 10; i += 1) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const samples: number[] = [];
    let previous = performance.now();
    for (let i = 0; i < count; i += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  }, frames);
}

test('flag-off keeps the stockpile sprite shell and requests no GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/stockpile[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('stockpile', 0, 7))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('off');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.stockpile.active)).toBe(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-stockpile-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('all loads once, mirrors stockpiles, and unmounts on demolish', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/stockpile[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await placeStockpiles(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('2');
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(16_000);
  expect(requests).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-2, 7));
  await expect(page.evaluate(() => window.__GR_TEST__?.demolish('stockpile', 0))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('1');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-stockpile-3d.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('lite and invalid bytes retain the stockpile sprite fallback', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/stockpile[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=stockpile&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('stockpile', 0, 7))).resolves.toBe(true);
  expect(requests).toBe(0);

  await page.route(/stockpile[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=stockpile');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('stockpile', 0, 7))).resolves.toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.stockpile.active)).toBe(1);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('maximum legal stockpiles stay within the 115% frame budget', async ({ page }, testInfo) => {
  let modelRoute: Route | undefined;
  await page.route(/stockpile[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=stockpile');
  await expect.poll(() => modelRoute).toBeTruthy();
  await placeStockpiles(page);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 2, maxInstances: 2 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
});
