import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target, seconds, {
    timeout: 15_000,
  });
}

test('grace holds pressure until sim-t 5, then first trickle arrives', async ({ page }) => {
  const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-grace&nokill');

  await waitForSim(page, 4.8);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0);

  await waitForSim(page, 8);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBeGreaterThan(0);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wave banner and diagnostics advance on the 30s cadence', async ({ page }) => {
  const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-banner&nokill');
  const banner = page.getByTestId('hud-wave');

  await waitForSim(page, 30);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(1);
  await expect(banner).not.toContainText('Stake your claim.');

  await waitForSim(page, 60);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(2);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('spawn accounting reaches trickle plus first two wave pulses by sim-t 60', async ({ page }) => {
  const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-accounting&nokill');

  await waitForSim(page, 60);
  const total = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0);

  // Implemented math at sim-t 60: roughly 20-24 trickles plus wave pulses 6 + 9.
  expect(total).toBeGreaterThanOrEqual(28);
  expect(total).toBeLessThanOrEqual(47);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('alive cap holds under no-kill pressure', async ({ page }) => {
  const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-cap&nokill');
  let maxAlive = 0;

  while ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0)) < 92) {
    await page.waitForTimeout(300);
    const alive = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0);
    maxAlive = Math.max(maxAlive, alive);
    expect(alive).toBeLessThanOrEqual(60);
  }

  expect(maxAlive).toBeGreaterThan(50);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('resetRun mid-wave clears wave pressure and opens with the claim banner', async ({ page }) => {
  const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-reset&nokill');

  await waitForSim(page, 40);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(1);

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1)).toBe(0);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? -1)).toBe(0);
  await expect(page.getByTestId('hud-wave')).toContainText('Stake your claim.');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
