import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-turret');
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&seed=run3d-turret${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function placeTurrets(page: Page): Promise<void> {
  for (const [x, z] of [[-3, 8], [-1, 8], [1, 8], [3, 8]]) {
    await expect(page.evaluate(([px, pz]) => window.__GR_TEST__?.placeFree('turret', px, pz), [x, z])).resolves.toBe(true);
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

test('LITE keeps the sprite shell and requests no turret GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/turret[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&tier=lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('turret', 0, 8))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.turret.active)).toBe(1);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-turret-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('all loads once, mirrors instances, and unmounts a demolished turret', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/turret[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await placeTurrets(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('4');
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(32_000);
  expect(requests).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-1, 8));
  await expect(page.evaluate(() => window.__GR_TEST__?.demolish('turret', 1))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('3');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-turret-3d.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('lite and invalid bytes retain sprite fallback', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/turret[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=turret&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('turret', 0, 8))).resolves.toBe(true);
  expect(requests).toBe(0);

  await page.route(/turret[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=turret&tier=full');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('turret', 0, 8))).resolves.toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shells.turret.active)).toBe(1);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('maximum-capacity pilot p95 stays within the 115% frame budget', async ({ page }, testInfo) => {
  let modelRoute: Route | undefined;
  await page.route(/turret[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=turret');
  await expect.poll(() => modelRoute).toBeTruthy();
  await placeTurrets(page);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 4, maxInstances: 4 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
});
