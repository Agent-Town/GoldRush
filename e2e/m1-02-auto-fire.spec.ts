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

test('Spark Rig clears a debug pack and motes grant XP with zero input', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3');

  await page.evaluate(() => window.__GR_TEST__?.spawnPack(5, 3));
  await expect.poll(async () => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBeGreaterThan(0);
  await expect
    .poll(async () => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? -1), { timeout: 15_000 })
    .toBe(0);
  await expect
    .poll(async () => page.evaluate(() => window.__GR_TEST__?.state().xp ?? 0), { timeout: 5_000 })
    .toBeGreaterThan(0);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('stress pack never exceeds the bolt pool and logs no console errors', async ({ page }) => {
  const errors = await openGame(page, '?stress=120&timescale=3');
  let maxBolts = 0;

  for (let i = 0; i < 20; i += 1) {
    await page.waitForTimeout(250);
    const bolts = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.boltsAlive ?? 0);
    maxBolts = Math.max(maxBolts, bolts);
  }

  expect(maxBolts).toBeGreaterThan(0);
  expect(maxBolts).toBeLessThanOrEqual(128);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('run reset recycles combat pools without renderer memory growth', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3');
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.evaluate(() => window.__GR_TEST__?.spawnPack(5, 3));
    await expect
      .poll(async () => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? -1), { timeout: 15_000 })
      .toBe(0);
    await expect.poll(async () => page.evaluate(() => window.__GR_TEST__?.state().xp ?? 0), { timeout: 5_000 }).toBeGreaterThan(0);
    await page.evaluate(() => window.__GR_TEST__?.resetRun());
    await expect.poll(async () => page.evaluate(() => window.__GR_TEST__?.state().xp ?? -1)).toBe(0);
    await expect.poll(async () => page.evaluate(() => window.__GR_TEST__?.state().boltsAlive ?? -1)).toBe(0);
  }

  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer);
  expect(after?.geometries).toBe(baseline?.geometries);
  expect(after?.textures).toBe(baseline?.textures);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
