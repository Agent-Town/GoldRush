import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed = 'w1-04-detail'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24);
  return errors;
}

async function bootAt(browser: Browser, width: number, height: number): Promise<{ errors: ErrorBucket; detail?: ThreeGameDiagnostics['terrain']['detailScatter'] }> {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width <= 390 ? 2 : 1 });
  const errors = await openGame(page, `w1-04-${width}`);
  const detail = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter);
  await page.close();
  return { errors, detail };
}

test('instanced detail scatter exposes density diagnostics and mobile reduction', async ({ browser, page }) => {
  const errors = await openGame(page);
  const detail = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter);
  const projectMobile = (page.viewportSize()?.width ?? 1280) <= 430;
  const desktop = projectMobile ? await bootAt(browser, 1280, 800) : { errors, detail };
  const mobile = projectMobile ? { errors, detail } : await bootAt(browser, 390, 844);

  expect(desktop.detail?.densityTier).toBe('desktop');
  expect(desktop.detail?.instanceClasses).toBe(5);
  expect(desktop.detail?.instanceClasses ?? 99).toBeLessThanOrEqual(6);
  expect(desktop.detail?.classes.every((entry) => entry.drawCalls === 1)).toBe(true);
  expect(desktop.detail?.totalInstances ?? 0).toBeGreaterThan(100);
  expect(mobile.detail?.densityTier).toBe('mobile-reduced');
  expect(mobile.detail?.totalInstances ?? Number.POSITIVE_INFINITY).toBeLessThan(desktop.detail?.totalInstances ?? 0);
  expect(mobile.detail?.totalInstances ?? 0).toBeGreaterThan(20);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(desktop.errors.consoleErrors).toEqual([]);
  expect(desktop.errors.pageErrors).toEqual([]);
  expect(mobile.errors.consoleErrors).toEqual([]);
  expect(mobile.errors.pageErrors).toEqual([]);
});

test('detail placement keeps build pads, ford water, and routing lanes clear', async ({ page }) => {
  const errors = await openGame(page, 'w1-04-exclusions');
  const detail = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter);

  expect(detail?.probes.buildPad.clear).toBe(true);
  expect(detail?.probes.ford.clear).toBe(true);
  expect(detail?.probes.routingLane.clear).toBe(true);
  expect(detail?.probes.buildPad.nearest ?? 0).toBeGreaterThanOrEqual(Balance.world.detailBuildPadClearRadius);
  expect(detail?.probes.routingLane.nearest ?? 0).toBeGreaterThanOrEqual(Balance.world.detailRoutingLaneClearRadius);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('scatter is seed-stable across boots and varies by seed', async ({ page }) => {
  const errors = await openGame(page, 'w1-04-seed-a');
  const first = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter?.signature);

  await openGame(page, 'w1-04-seed-a');
  const second = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter?.signature);

  await openGame(page, 'w1-04-seed-b');
  const third = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.detailScatter?.signature);

  expect(second).toBe(first);
  expect(third).not.toBe(first);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
