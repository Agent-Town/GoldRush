import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-rail-elements');
type Errors = { console: string[]; page: string[] };
type RailTie = { x: number; y: number; z: number; yaw: number };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&contract=e2-hill-mine&nowaves&nolevel&seed=run3d-rail-elements${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
}

async function rails(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails as unknown as {
    active: boolean;
    asset: 'procedural-placeholder';
    ties: RailTie[];
  });
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

test('flag-off boot keeps procedural rails and requests no rail-element GLB', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/rail-element[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('ready');
  expect(await rails(page)).toMatchObject({ active: true, asset: 'procedural-placeholder' });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('pilot loads once and instances one rail element per tie', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/rail-element[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=rail_element');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const tieCount = (await rails(page)).ties.length;
  const instanceCount = Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes));
  expect(instanceCount).toBe(tieCount);
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(tieCount * 800);
  expect(requests).toBe(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `instances-${testInfo.project.name}.json`), `${JSON.stringify({ tieCount, instanceCount, layerDrawCalls: 1 }, null, 2)}\n`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-rail-elements.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('LITE keeps procedural rails and requests no rail-element GLB', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/rail-element[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=rail_element&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  expect(await rails(page)).toMatchObject({ active: true, asset: 'procedural-placeholder' });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('invalid bytes fail closed to procedural rails', async ({ page }) => {
  const bucket = errors(page);
  await page.route(/rail-element[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=rail_element&tier=full');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  expect(await rails(page)).toMatchObject({ active: true, asset: 'procedural-placeholder' });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('rail-element pilot stays within the 115% procedural frame budget', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let modelRoute: Route | undefined;
  await page.route(/rail-element[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=rail_element&tier=full');
  await expect.poll(() => modelRoute).toBeTruthy();
  const procedural = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const tieCount = (await rails(page)).ties.length;
  const pilot = await p95(page);
  const evidence = { proceduralP95Ms: procedural, pilotP95Ms: pilot, ratio: pilot / procedural, instances: tieCount };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(procedural * 1.15);
  expect(bucket).toEqual({ console: [], page: [] });
});
