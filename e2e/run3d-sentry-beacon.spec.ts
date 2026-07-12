import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-sentry-beacon');
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&seed=run3d-sentry-beacon${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function placeBeacons(page: Page): Promise<void> {
  for (const [x, z] of [[-3, 8], [-1, 8], [1, 8], [3, 8]]) {
    await expect(page.evaluate(([px, pz]) => window.__GR_TEST__?.placeFree('sentry_beacon', px, pz), [x, z])).resolves.toBe(true);
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

test('flag-off keeps beacon sprites and requests no beacon GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/sentry-beacon[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sentry_beacon', 0, 8))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('off');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons)).toBe(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-sentry-beacon-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('all loads once, mirrors beacons, and unmounts a demolished beacon', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/sentry-beacon[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await placeBeacons(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('4');
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(32_000);
  expect(requests).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-1, 8));
  await expect(page.evaluate(() => window.__GR_TEST__?.demolish('sentry_beacon', 1))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('3');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-sentry-beacon-3d.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('lite and invalid bytes retain beacon sprites', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/sentry-beacon[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sentry_beacon', 0, 8))).resolves.toBe(true);
  expect(requests).toBe(0);

  await page.route(/sentry-beacon[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=sentry_beacon');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sentry_beacon', 0, 8))).resolves.toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons)).toBe(1);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('maximum-capacity beacon pilot stays within the 115% frame budget', async ({ page }, testInfo) => {
  let modelRoute: Route | undefined;
  await page.route(/sentry-beacon[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=sentry_beacon');
  await expect.poll(() => modelRoute).toBeTruthy();
  await placeBeacons(page);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 4, maxInstances: 4 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
});
