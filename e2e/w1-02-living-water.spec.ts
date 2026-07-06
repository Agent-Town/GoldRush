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

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  // s63 merge corrective: task 036 made the Assay Bench mount HIDDEN on plain
  // ?debug (opens only for ?profile/?queueNow or Enter near an office), so the
  // pre-036 assay-close step is gone. Just wait for the canvas + a few frames.
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  return errors;
}

async function bootAt(browser: Browser, width: number, height: number): Promise<{ errors: ErrorBucket; water: ThreeGameDiagnostics['terrain']['water'] }> {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width <= 390 ? 2 : 1 });
  const errors = await openGame(page, `w1-02-${width}`);
  const water = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water);
  await page.close();
  return { errors, water };
}

test('living water shader animates and keeps a mobile quality knob', async ({ browser, page }) => {
  const errors = await openGame(page, 'w1-02-water');
  const first = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water);

  expect(first?.material).toBe('LivingWaterShader');
  expect(first?.foam).toBe(true);
  expect(first?.glints).toBeGreaterThanOrEqual(6);
  expect(first?.fordStones).toBeGreaterThanOrEqual(7);
  expect(first?.quality).toBe(first?.mobile ? Balance.world.waterMobileQuality : Balance.world.waterQuality);

  await page.waitForFunction(
    (time) => (window.__THREE_GAME_DIAGNOSTICS__?.terrain.water?.riverTime ?? 0) > time + 0.02,
    first?.riverTime ?? 0,
  );
  const second = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water);
  expect(second?.riverTime ?? 0).toBeGreaterThan(first?.riverTime ?? 0);
  expect(second?.fordTime ?? 0).toBeGreaterThan(first?.fordTime ?? 0);

  const mobile = await bootAt(browser, 390, 844);
  expect(mobile.water?.mobile).toBe(true);
  expect(mobile.water?.quality).toBe(Balance.world.waterMobileQuality);
  expect(mobile.water?.quality ?? 1).toBeLessThan(Balance.world.waterQuality);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(mobile.errors.consoleErrors).toEqual([]);
  expect(mobile.errors.pageErrors).toEqual([]);
});
