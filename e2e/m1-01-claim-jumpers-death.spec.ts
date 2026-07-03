import { expect, test, type Page } from '@playwright/test';

async function waitForGame(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

function collectPageErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  return { consoleErrors, pageErrors };
}

async function spawnDebugPack(page: Page): Promise<void> {
  await page.keyboard.press('KeyT');
}

async function waitForDeath(page: Page): Promise<void> {
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state), { timeout: 25_000 })
    .toBe('dead');
}

test('T spawns Claim Jumpers, contact kills hero, R restarts in place', async ({ page }) => {
  const errors = collectPageErrors(page);
  await waitForGame(page);

  await spawnDebugPack(page);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(5);

  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 100), { timeout: 10_000 })
    .toBeLessThan(100);

  for (let i = 0; i < 4; i += 1) {
    await spawnDebugPack(page);
  }

  await waitForDeath(page);
  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('stake-again')).toContainText('Stake Again');

  await page.keyboard.press('KeyR');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp)).toBe(100);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('nospawn blocks debug packs', async ({ page }) => {
  await page.goto('/?nospawn');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await spawnDebugPack(page);
  await page.waitForTimeout(250);

  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spawnDisabled)).toBe(true);
  await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
});

test('double restart recycles enemies without geometry growth', async ({ page }) => {
  await waitForGame(page);
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);

  for (let cycle = 0; cycle < 3; cycle += 1) {
    for (let pack = 0; pack < 5; pack += 1) {
      await spawnDebugPack(page);
    }
    await waitForDeath(page);
    await page.keyboard.press('KeyR');
    await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
    await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  }

  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  expect(after).toBe(baseline);
});

test('stress=120 stays within pool and draw-call budget', async ({ page }) => {
  await page.goto('/?stress=120');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);

  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  await page.waitForTimeout(1_000);
  const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  const frames = (snapshot?.frame ?? 0) - before;

  expect(snapshot?.stressCount).toBe(120);
  expect(snapshot?.enemiesAlive).toBe(96);
  expect(snapshot?.renderer.calls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200);
  expect(frames).toBeGreaterThanOrEqual(55);
});
