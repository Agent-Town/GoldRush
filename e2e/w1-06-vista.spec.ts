import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const RECORDED_W1_01_HEIGHT_PROBES = {
  heroStart: 0.1037994959281516,
  river: -0.13640923580690872,
  ford: -0.15538053712954125,
  nearBank: -0.18,
  farBank: 0.3169621691339781,
} as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed = 'w1-06-vista'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  return errors;
}

async function bootAt(browser: Browser, width: number, height: number): Promise<{ errors: ErrorBucket; vista?: ThreeGameDiagnostics['terrain']['vista'] }> {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width <= 390 ? 2 : 1 });
  const errors = await openGame(page, `w1-06-${width}`);
  const vista = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.vista);
  await page.close();
  return { errors, vista };
}

test('vista diagnostics expose a low-res radius-90 terrain ring', async ({ browser, page }) => {
  const errors = await openGame(page);
  const vista = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.vista);
  const height = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height);

  expect(vista?.present).toBe(true);
  expect(vista?.radius).toBe(90);
  expect(vista?.segments).toBe((page.viewportSize()?.width ?? 1280) <= 430 ? Balance.world.vistaMobileSegments : Balance.world.vistaSegments);
  expect(vista?.vertices ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual((height?.segments ?? 0) ** 2);

  const mobile = await bootAt(browser, 390, 844);
  expect(mobile.vista?.segments).toBe(Balance.world.vistaMobileSegments);
  expect(mobile.vista?.segments ?? Balance.world.vistaSegments).toBeLessThan(Balance.world.vistaSegments);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(mobile.errors.consoleErrors).toEqual([]);
  expect(mobile.errors.pageErrors).toEqual([]);
});

test('vista seam and W1-01 in-bounds height probes stay stable', async ({ page }) => {
  const errors = await openGame(page);
  const terrain = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain);

  expect(terrain?.vista.seamMaxDelta).toBe(0);
  for (const sample of terrain?.vista.seam ?? []) {
    expect(sample.unclamped).toBe(sample.clamped);
    expect(sample.delta).toBe(0);
  }

  for (const [key, expected] of Object.entries(RECORDED_W1_01_HEIGHT_PROBES)) {
    expect(terrain?.height.probes[key] ?? Number.NaN).toBe(expected);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
