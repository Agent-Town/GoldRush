import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-boiler-house');
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&seed=run3d-boiler-house${query}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function placeBoilerHouses(page: Page): Promise<void> {
  for (const [x, z] of [[-4, 12], [0, 12], [4, 12]]) {
    await expect(page.evaluate(([px, pz]) => window.__GR_TEST__?.placeFree('boiler_house', px, pz), [x, z])).resolves.toBe(true);
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

test('LITE keeps the Boiler House sprite shell and requests no GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/run3d\/boiler-house\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&tier=lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 0, 12))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.boiler_house.active)).toBe(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-boiler-house-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('all loads once, mirrors Boiler Houses, and unmounts on demolish', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/run3d\/boiler-house\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await placeBoilerHouses(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('3');
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(24_000);
  expect(requests).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-4, 12));
  await expect(page.evaluate(() => window.__GR_TEST__?.demolish('boiler_house', 0))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('2');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-boiler-house-3d.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('lite and invalid bytes retain the Boiler House sprite fallback', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/run3d\/boiler-house\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=boiler_house&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 0, 12))).resolves.toBe(true);
  expect(requests).toBe(0);

  await page.route(/run3d\/boiler-house\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=boiler_house&tier=full');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('boiler_house', 0, 12))).resolves.toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.boiler_house.active)).toBe(1);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('maximum legal Boiler Houses stay within the 115% frame budget', async ({ page }, testInfo) => {
  let modelRoute: Route | undefined;
  await page.route(/run3d\/boiler-house\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=boiler_house');
  await expect.poll(() => modelRoute).toBeTruthy();
  await placeBoilerHouses(page);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 3, maxInstances: 3 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
});
