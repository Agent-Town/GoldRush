import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-lantern-post');
const FIXTURES = [[0, 16], [-16, 18], [16, 18], [-22, -12], [22, -12], [-10, -24], [10, -24]] as const;
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string): Promise<void> {
  await page.goto(`/?debug&contract=e1-night-shift&nowaves&nolevel&seed=run3d-lantern-post${query}`);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function makeDenseLanternField(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.grantGold(100));
  for (const [index, [x, z]] of FIXTURES.entries()) {
    await page.evaluate(([px, pz]) => window.__GR_TEST__?.teleport(px, pz), [x, z]);
    await page.evaluate((i) => window.__GR_TEST__?.repair('lantern_post', i), index);
  }
  const placed = await page.evaluate(() => {
    let count = 0;
    for (let x = -28; x <= 28 && count < 8; x += 7) if (window.__GR_TEST__?.placeFree('lantern_post', x, 28, count % 4)) count += 1;
    return count;
  });
  expect(placed).toBe(8);
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

test('flag-off keeps lantern sprites and requests no GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/lantern-post[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '');
  await makeDenseLanternField(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('off');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(15);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-lantern-post-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('all loads once, mirrors lanterns, and unmounts a demolished post', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/lantern-post[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=all');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await makeDenseLanternField(page);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('15');
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(120_000);
  expect(requests).toBe(1);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-28, 28));
  await expect(page.evaluate(() => window.__GR_TEST__?.demolish('lantern_post', 7))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('14');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-lantern-post-3d.png`) });
  expect(bucket).toEqual({ console: [], page: [] });
});

test('lite and invalid bytes retain lantern sprite fallback', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/lantern-post[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=lantern_post&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  await makeDenseLanternField(page);
  expect(requests).toBe(0);
  await page.route(/lantern-post[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=lantern_post');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  await makeDenseLanternField(page);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(15);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('15 lanterns stay within the 115% frame budget', async ({ page }, testInfo) => {
  let modelRoute: Route | undefined;
  await page.route(/lantern-post[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=lantern_post');
  await expect.poll(() => modelRoute).toBeTruthy();
  await makeDenseLanternField(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(15);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 15 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
});
