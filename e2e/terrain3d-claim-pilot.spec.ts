import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const ARTIFACT_DIR = path.resolve('artifacts/terrain3d-claim-pilot');
const MODEL = /the-claim-terrain(?:-[^/?]+)?\.glb/;
type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, extra = ''): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&seed=terrain3d-claim${extra}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function p95(page: Page, frames = 120): Promise<number> {
  return page.evaluate(async (count) => {
    const samples: number[] = [];
    let previous = performance.now();
    for (let index = 0; index < count; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  }, frames);
}

async function simFingerprint(browser: Browser, pilot: boolean): Promise<{ hash: string; payload: unknown; errors: Errors }> {
  const page = await browser.newPage();
  const errors = collectErrors(page);
  await boot(page, pilot ? '&terrain3dPilot' : '');
  if (pilot) await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  const payload = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.clearEnemies();
    test.spawnEnemyAt(-18, -18);
    test.spawnEnemyAt(18, -18);
    test.spawnEnemyAt(0, 22);
    test.advanceSim(1.2);
    return {
      sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
      samples: [[0, 12], [0, 0], [12, -18]].map(([x, z]) => test.terrainSample(x!, z!)),
      enemies: test.enemyPositions().map(({ id, x, z, hp, vx, vz, zone }) => ({ id, x, z, hp, vx, vz, zone })),
      economy: test.summarizeLog(test.economyLog()),
    };
  });
  await page.close();
  return { payload, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors };
}

test('flag-off is byte-lazy and keeps the painted Claim', async ({ page }) => {
  const errors = collectErrors(page);
  let requests = 0;
  page.on('request', (request) => { if (MODEL.test(request.url())) requests += 1; });
  await boot(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'off');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  expect(requests).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('contract-valid GLB feeds every visualY consumer and keeps the water agreement', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await boot(page, '&terrain3dPilot');
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-height-source', 'baked-grid');
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-meshes'))).toBe(1);
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-triangles'))).toBe(32_768);
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-materials'))).toBe(1);

  const samplePoints = [[-15, 14], [24, 25], [-13, -10], [18, 11], [0, 12]] as const;
  const table = [];
  for (const [x, z] of samplePoints) {
    await page.evaluate(([px, pz]) => window.__GR_TEST__?.teleport(px, pz), [x, z]);
    await page.waitForFunction(([px, pz]) => {
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      return hero != null && Math.abs(hero.x - px) < 0.01 && Math.abs(hero.z - pz) < 0.01;
    }, [x, z]);
    const sample = await page.evaluate(([px, pz]) => ({
      height: window.__GR_TEST__!.terrainVisualY(px, pz),
      padded: window.__GR_TEST__!.terrainVisualY(px, pz, 0, 1.1),
      heroY: window.__THREE_GAME_DIAGNOSTICS__!.heroPos.y,
    }), [x, z]);
    expect(sample.heroY).toBeCloseTo(sample.height + 0.06, 2);
    table.push({ x, z, ...sample });
  }
  expect(Math.max(...table.map((entry) => entry.height)) - Math.min(...table.map((entry) => entry.height))).toBeGreaterThan(0.35);

  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.spawnEnemyAt(-20, 14);
    window.__GR_TEST__!.advanceSim(0.05);
  });
  const enemy = await page.evaluate(() => window.__GR_TEST__!.enemyPositions()[0]);
  expect(enemy?.y).toBeCloseTo(await page.evaluate(([x, z, base]) => window.__GR_TEST__!.terrainVisualY(x!, z!, base), [enemy!.x, enemy!.z, Balance.enemy.groundY]), 2);

  await page.evaluate(() => window.__GR_TEST__!.teleport(20, 20));
  await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('stockpile', 4, 12))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('sluice', 0, 7))).resolves.toBe(true);
  const banks = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return [-24, -12, 0, 12, 24, 30].map((x) => ({
      x,
      z: 6,
      adjacent: terrain.isWaterSourceAdjacent(x, 6, 1),
      zone: window.__GR_TEST__!.terrainSample(x, 6).zone,
      height: window.__GR_TEST__!.terrainVisualY(x, 6),
    }));
  });
  expect(banks.every((bank) => bank.adjacent && bank.zone === 'shallows')).toBe(true);

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `sample-points-${testInfo.project.name}.json`), `${JSON.stringify({ method: 'baked-grid', samples: table, waterBanks: banks }, null, 2)}\n`);
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(2, 13);
    document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none');
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-claim-with-base.png`) });
  expect(errors).toEqual({ console: [], page: [] });
});

test('the terrain pilot leaves the planar simulation fingerprint unchanged', async ({ browser }, testInfo) => {
  test.setTimeout(60_000);
  const off = await simFingerprint(browser, false);
  const on = await simFingerprint(browser, true);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `sim-fingerprint-${testInfo.project.name}.json`), `${JSON.stringify({ off: off.hash, on: on.hash, payload: off.payload }, null, 2)}\n`);
  expect(on.hash).toBe(off.hash);
  expect(off.errors).toEqual({ console: [], page: [] });
  expect(on.errors).toEqual({ console: [], page: [] });
});

test('LITE and invalid bytes retain the painted fallback', async ({ page }) => {
  const errors = collectErrors(page);
  let requests = 0;
  page.on('request', (request) => { if (MODEL.test(request.url())) requests += 1; });
  await boot(page, '&terrain3dPilot&tier=lite');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'lite');
  expect(requests).toBe(0);

  await page.route(MODEL, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes', contentType: 'model/gltf-binary' }));
  await boot(page, '&terrain3dPilot');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'failed');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  expect(errors).toEqual({ console: [], page: [] });
});

test('the mounted terrain stays inside the 115% p95 budget', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(60_000);
  let release: (() => Promise<void>) | undefined;
  await page.route(MODEL, (route) => { release = () => route.continue(); });
  await boot(page, '&terrain3dPilot');
  await expect.poll(() => release).toBeTruthy();
  const paintedP95Ms = await p95(page);
  await release!();
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  const pilotP95Ms = await p95(page);
  const report = { paintedP95Ms, pilotP95Ms, ratio: pilotP95Ms / paintedP95Ms };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(pilotP95Ms).toBeLessThanOrEqual(paintedP95Ms * 1.15);
});
