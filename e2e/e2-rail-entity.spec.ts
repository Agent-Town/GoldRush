import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type RendererWindow = { min: number; max: number; samples: number[] };

const ARTIFACT_DIR = path.resolve('artifacts/e2-rail');
const DEV_BASE = '?debug&tile=gt-test-basin&nowaves&nolevel&nokill&nopause&nosteal&nowreck';
const DEV_RAILS = `${DEV_BASE}&rails=dev`;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function waitForGame(page: Page): Promise<void> {
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await waitForGame(page);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function sampleRenderer(page: Page): Promise<RendererWindow> {
  return page.evaluate(
    () =>
      new Promise<RendererWindow>((resolve) => {
        const samples: number[] = [];
        const tick = () => {
          const calls = window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls;
          if (typeof calls === 'number') samples.push(calls);
          if (samples.length >= 24) {
            resolve({ min: Math.min(...samples), max: Math.max(...samples), samples });
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

async function rendererWindow(browser: Browser, query: string): Promise<{ calls: RendererWindow; errors: ErrorBucket }> {
  const page = await browser.newPage();
  const errors = await openGame(page, `${query}&seed=e2-rail-calls`);
  const calls = await sampleRenderer(page);
  await page.close();
  return { calls, errors };
}

async function simHash(browser: Browser, query: string): Promise<{ hash: string; errors: ErrorBucket }> {
  const page = await browser.newPage();
  const errors = await openGame(page, `${query}&seed=e2-rail-determinism`);
  const payload = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnEnemyAt(-8, -20);
    window.__GR_TEST__?.spawnEnemyAt(8, -20);
    window.__GR_TEST__?.spawnEnemyAt(0, 20);
    window.__GR_TEST__?.advanceSim(1.2);
    return {
      sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
      samples: [
        window.__GR_TEST__?.terrainSample(0, 12),
        window.__GR_TEST__?.terrainSample(0, 0),
        window.__GR_TEST__?.terrainSample(12, -18),
      ],
      enemies: (window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => ({
        id: enemy.id,
        x: Number(enemy.x.toFixed(3)),
        y: Number(enemy.y.toFixed(3)),
        z: Number(enemy.z.toFixed(3)),
        terrain: enemy.terrain,
      })),
    };
  });
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors };
}

test('epoch-1 boot renders zero rails', async ({ page }) => {
  const errors = await openGame(page, '?debug&nowaves&nolevel&nokill&nopause&seed=e2-rail-none');
  const state = await page.evaluate(() => ({
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
  }));

  expect(state.tile).toEqual({ id: 'frontier-river-claim', biome: 'river-claim' });
  expect(state.rails).toMatchObject({
    active: false,
    paths: 0,
    points: 0,
    railInstances: 0,
    tieInstances: 0,
    drawCalls: 0,
    renderSlot: 'groundDecals',
  });
  expectClean(errors);
});

test('gt-test-basin rails=dev renders a terrain-conforming rail spine', async ({ page }, testInfo) => {
  const errors = await openGame(page, `${DEV_RAILS}&seed=e2-rail-shape`);
  const state = await page.evaluate(() => ({
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
    groundDecals: window.__THREE_GAME_DIAGNOSTICS__?.renderLayers.groundDecals,
    slopes: (window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails.samples ?? []).map((sample) =>
      window.__GR_TEST__?.terrainSim(sample.x, sample.z).slope,
    ),
  }));

  const rails = state.rails!;
  expect(state.tile?.id).toBe('gt-test-basin');
  expect(state.tile?.rails?.[0]).toMatchObject({
    style: 'steamworks',
    points: expect.arrayContaining([{ x: -18, z: -17.4 }, { x: -12, z: 18 }]),
  });
  expect(rails.active).toBe(true);
  expect(rails.paths).toBe(1);
  expect(rails.renderLayer).toBe(state.groundDecals);
  expect(rails.railInstances).toBeGreaterThan(100);
  expect(rails.tieInstances).toBeGreaterThan(50);
  expect(rails.drawCalls).toBe(2);
  expect(rails.asset).toBe('procedural-placeholder');

  const heightChecks = await page.evaluate((samples) =>
    samples.map((sample) => ({
      ...sample,
      expected: window.__GR_TEST__?.terrainVisualY(sample.x, sample.z, 0.08) ?? Number.NaN,
    })),
  rails.samples);
  for (const sample of heightChecks) expect(Math.abs(sample.y - sample.expected)).toBeLessThan(0.02);
  expect(Math.max(...heightChecks.map((sample) => sample.y)) - Math.min(...heightChecks.map((sample) => sample.y))).toBeGreaterThan(1);
  expect(Math.max(...state.slopes.map((slope) => Math.hypot(slope?.dx ?? 0, slope?.dz ?? 0)))).toBeGreaterThan(0.05);
  expect(heightChecks.some((sample) => sample.x > -16 && sample.x < 20 && sample.z < -16.8 && sample.z > -18)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.teleport(0, -17.4));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'cliff-side-run');
  await page.evaluate(() => window.__GR_TEST__?.teleport(-8, 18));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'basin-ridge');

  expectClean(errors);
});

test('rails do not change sim hash and stay under the draw-call budget', async ({ browser }, testInfo) => {
  const baseHash = await simHash(browser, DEV_BASE);
  const railHash = await simHash(browser, DEV_RAILS);
  const baseCalls = await rendererWindow(browser, DEV_BASE);
  const railCalls = await rendererWindow(browser, DEV_RAILS);
  const delta = railCalls.calls.min - baseCalls.calls.min;
  const report = {
    query: DEV_RAILS,
    renderSlot: 'groundDecals',
    hashWithoutRails: baseHash.hash,
    hashWithRails: railHash.hash,
    drawCallsWithoutRails: baseCalls.calls,
    drawCallsWithRails: railCalls.calls,
    delta,
  };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `${testInfo.project.name}-draw-call-determinism-report.json`), `${JSON.stringify(report, null, 2)}\n`);

  expect(railHash.hash).toBe(baseHash.hash);
  expect(delta).toBeGreaterThanOrEqual(1);
  expect(delta).toBeLessThan(10);
  expectClean(baseHash.errors);
  expectClean(railHash.errors);
  expectClean(baseCalls.errors);
  expectClean(railCalls.errors);
});
