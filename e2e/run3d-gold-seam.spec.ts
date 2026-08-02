import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/run3d-gold-seam');
type Errors = { console: string[]; page: string[] };

function errors(page: Page): Errors {
  const bucket: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') bucket.console.push(message.text()); });
  page.on('pageerror', (error) => bucket.page.push(error.message));
  return bucket;
}

async function boot(page: Page, query: string, contract = 'e1-dry-gulch'): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&seed=run3d-gold-seam${query}`);
  const briefing = page.getByTestId('contract-briefing');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
}

async function activateTwelveSeams(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('goldSeam.activeMin', 12);
    window.__GR_TEST__?.setBalance('goldSeam.activeMax', 12);
    window.__GR_TEST__?.setBalance('goldSeam.capacity', 5);
    window.__GR_TEST__?.setBalance('goldSeam.respawnSeconds', 999);
    window.__GR_TEST__?.resetRun();
  });
  await expect.poll(() => page.evaluate(
    () => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active).length,
  )).toBe(12);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
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

test('flag-off boot keeps gold sprites and requests no GLB', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/gold-seam[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('off');
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.find((entry) => entry.active)!);
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x + 2, z + 2), node.position);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assets['node.gold_seam'])).toBe('loaded');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-gold-seam-sprite.png`) });
  expect(requests).toBe(0);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('pilot loads once, mirrors live seams, and unmounts one depleted seam', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/gold-seam[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=gold_seam');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((node) => node.active).length);
  const before = Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes));
  expect(before).toBe(active);
  expect(Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotTriangles))).toBeLessThanOrEqual(before * 8_000);
  expect(requests).toBe(1);
  const node = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.find((entry) => entry.active)!);
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x + 2, z + 2), node.position);
  await page.waitForTimeout(300);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-gold-seam-3d.png`) });
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z), node.position);
  await page.evaluate(() => window.__GR_TEST__?.setBalance('goldSeam.tickSeconds', 0.1));
  await expect.poll(() => page.evaluate(
    (id) => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((node) => node.id === id)?.active,
    node.id,
  ), { timeout: 10_000 }).toBe(false);
  await expect.poll(() => page.evaluate(() => Number(document.querySelector('canvas')?.dataset.run3dPilotMeshes))).toBe(before - 1);
  expect(bucket).toEqual({ console: [], page: [] });
});

test('LITE and invalid bytes retain gold sprite fallback', async ({ page }) => {
  const bucket = errors(page);
  let requests = 0;
  page.on('request', (request) => { if (/gold-seam[^/]*\.glb/.test(request.url())) requests += 1; });
  await boot(page, '&run3dPilot=gold_seam&tier=lite');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('lite');
  expect(requests).toBe(0);

  await page.route(/gold-seam[^/]*\.glb/, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes' }));
  await boot(page, '&run3dPilot=gold_seam&tier=full');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotState)).toBe('failed');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.some((node) => node.active))).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.assets['node.gold_seam'])).toBe('loaded');
  expect(bucket).toEqual({ console: [], page: [] });
});

test('12 gold seams stay within the 115% frame budget', async ({ page }, testInfo) => {
  const bucket = errors(page);
  let modelRoute: Route | undefined;
  await page.route(/gold-seam[^/]*\.glb/, (route) => { modelRoute = route; });
  await boot(page, '&run3dPilot=gold_seam&tier=full', 'e4-dust-flats');
  await expect.poll(() => modelRoute).toBeTruthy();
  await activateTwelveSeams(page);
  const sprite = await p95(page);
  await modelRoute!.continue();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.run3dPilotState === 'ready');
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('12');
  const pilot = await p95(page);
  const evidence = { spriteP95Ms: sprite, pilotP95Ms: pilot, ratio: pilot / sprite, instances: 12 };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  expect(pilot).toBeLessThanOrEqual(sprite * 1.15);
  expect(bucket).toEqual({ console: [], page: [] });
});
