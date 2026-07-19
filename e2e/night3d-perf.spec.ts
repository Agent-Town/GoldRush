import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY } from '../src/game/PerformanceTier';

const ARTIFACT_DIR = path.resolve('artifacts/night3d-perf');
const PERF_CONTRACTS = ['the-claim', 'e5-deepwater-claim', 'e9-dome-basin', 'e1-night-shift'] as const;

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function bootPressure(page: Page, contract: string, terrain2d: boolean, lightCap = 8, autoTier = false): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&seed=night3d-perf-${contract}&tier=full${terrain2d ? '&terrain2d' : ''}${autoTier ? '&autotier' : ''}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.evaluate(({ cap, night }) => {
    const api = window.__GR_TEST__!;
    api.setBalance('render.night.maxDynamicLights', cap);
    api.setBalance('render.night.collapseSeconds', 9999);
    api.setBalance('enemy.contactDamage', 0);
    api.setBalance('waves.aliveCap', 80);
    if (night) {
      api.setWave(10);
      for (let index = 0; index < 7; index += 1) api.repair('lantern_post', index);
    }
    for (const count of [12, 24, 24]) api.spawnPack(count, 22, { speedScale: 0.05, hpScale: 999 });
  }, { cap: lightCap, night: contract === 'e1-night-shift' });
  await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 55);
  if (!terrain2d) {
    await page.waitForFunction(() =>
      document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready' &&
      document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotRenderSource === 'glb');
  }
  if (contract === 'e1-night-shift') {
    await page.waitForFunction((cap) =>
      window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase === 'dark' &&
      window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools === cap,
    lightCap);
  }
  await page.waitForTimeout(350);
}

async function p95(page: Page, frames = 180): Promise<number> {
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

test('daylight matrix and Night Shift pressure stay within the painted 115% p95 gate', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(240_000);
  const errors = collectErrors(page);
  const report: Array<{ contract: string; paintedP95Ms: number; terrain3dP95Ms: number; ratio: number; uncappedP95Ms?: number }> = [];

  for (const contract of PERF_CONTRACTS) {
    await bootPressure(page, contract, true);
    await p95(page, 60);
    await bootPressure(page, contract, false);
    await p95(page, 60);

    await bootPressure(page, contract, true);
    const paintedP95Ms = await p95(page);
    await bootPressure(page, contract, false);
    const terrain3dP95Ms = await p95(page);
    let uncappedP95Ms: number | undefined;
    if (contract === 'e1-night-shift') {
      await bootPressure(page, contract, false, 32);
      uncappedP95Ms = await p95(page);
    }
    const ratio = terrain3dP95Ms / paintedP95Ms;
    expect(ratio).toBeLessThanOrEqual(1.15);
    expect(terrain3dP95Ms).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
    report.push({ contract, paintedP95Ms, terrain3dP95Ms, ratio, ...(uncappedP95Ms === undefined ? {} : { uncappedP95Ms }) });
  }

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(errors).toEqual({ console: [], page: [] });
});

test('Night Shift keeps its lantern read and auto-tiers one sticky step at a time', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await bootPressure(page, 'e1-night-shift', false, 8);

  const lighting = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting);
  expect(lighting).toMatchObject({ nightPools: 8, nightPoolCap: 8, nightShift: { phase: 'dark', darkness: 1 } });
  expect(lighting?.nightPoolSources ?? 0).toBeGreaterThan(8);
  expect(lighting?.enemyLanterns ?? 0).toBeGreaterThan(0);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const shot = await page.locator('#game-canvas').screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-night-lanterns.png`) });
  await testInfo.attach('night-lanterns', { body: shot, contentType: 'image/png' });
  expect(shot.byteLength).toBeGreaterThan(10_000);

  await page.goto('/?debug&autotier&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-autotier&tier=full');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.run3dPilotState === 'ready';
  });

  await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    api.setBalance('render.night.windowFrames', 600);
    api.setBalance('render.night.frameBudgetMs', 0.1);
    api.setBalance('render.night.collapseRatio', 1);
    api.setBalance('render.night.collapseSeconds', 1.5);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 600)).toBeLessThan(600);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  await expect(page.getByText('Dimming the lanterns for smoothness.')).toBeVisible();
  await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 1.5));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(2);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPoolCap)).toBe(4);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 1.5));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier)).toBe('lite');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.postEnabled)).toBe(false);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-run3d-pilot-state', 'lite');

  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}')['e1-night-shift'], RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY)).toBe(3);
  await page.goto('/?debug&autotier&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-sticky&tier=full');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(3);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier)).toBe('lite');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');

  await page.goto('/?tier=full');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  expect(await page.evaluate(async () => {
    const tier = await Function('return import("/src/game/PerformanceTier.ts")')() as typeof import('../src/game/PerformanceTier');
    return tier.performanceTierDiagnostics();
  })).toMatchObject({ tier: 'full', runtimeVerdict: 0 });

  await page.goto('/?debug&contract=the-claim&nowaves&nolevel&nopause&nokill&seed=night3d-map-scope&tier=full');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');

  expect(await page.evaluate(async (key) => {
    const storage = await Function('return import("/src/game/ProfileStorage.ts")')() as typeof import('../src/game/ProfileStorage');
    if (storage.PROFILE_DATA_KEYS.has(key)) return false;
    const profile = storage.createProfile(localStorage, 'Night Perf Other');
    if (!profile) return false;
    storage.bindProfileSession(profile.id);
    return true;
  }, RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY)).toBe(true);
  await page.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-profile-scope&tier=full');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  expect(errors).toEqual({ console: [], page: [] });
});
