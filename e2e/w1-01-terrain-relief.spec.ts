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

async function openGame(page: Page, seed = 'w1-01-relief'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  return errors;
}

async function bootAt(browser: Browser, width: number, height: number): Promise<{ errors: ErrorBucket; segments: number }> {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width <= 390 ? 2 : 1 });
  const errors = await openGame(page, `w1-01-${width}`);
  const segments = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.segments ?? 0);
  await page.close();
  return { errors, segments };
}

test('terrain mesh has seeded relief and mobile density knob', async ({ browser, page }) => {
  const errors = await openGame(page);
  const terrain = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height);
  const width = page.viewportSize()?.width ?? 1280;

  expect(terrain?.segments).toBe(width <= 430 ? Balance.world.terrainMobileSegments : Balance.world.terrainSegments);
  expect((terrain?.max ?? 0) - (terrain?.min ?? 0)).toBeGreaterThan(0.3);
  expect(terrain?.probes.river ?? 1).toBeLessThan(terrain?.probes.farBank ?? 0);

  const mobile = await bootAt(browser, 390, 844);
  expect(mobile.segments).toBe(Balance.world.terrainMobileSegments);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(mobile.errors.consoleErrors).toEqual([]);
  expect(mobile.errors.pageErrors).toEqual([]);
});

test('hero and enemy visual Y track terrain while XZ stays planar', async ({ page }) => {
  const errors = await openGame(page, 'w1-01-y');

  await page.evaluate(() => window.__GR_TEST__?.teleport(12, -18));
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0), { timeout: 8_000 })
    .toBeCloseTo(-18, 2);
  const hero = await page.evaluate(() => ({
    pos: window.__THREE_GAME_DIAGNOSTICS__?.heroPos,
    terrain: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height,
  }));
  expect(hero.pos?.x).toBeCloseTo(12, 2);
  expect(hero.pos?.z).toBeCloseTo(-18, 2);
  expect(hero.pos?.y ?? 0).toBeCloseTo((hero.terrain?.heroGround ?? 0) + 0.06, 2);

  await page.evaluate(() => window.__GR_TEST__?.setBalance('enemy.speed', 0));
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(12, -18))).resolves.toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.x ?? 0), { timeout: 8_000 })
    .toBeCloseTo(12, 2);
  const enemy = await page.evaluate(() => ({
    first: window.__GR_TEST__?.enemyPositions()[0],
    farBank: window.__THREE_GAME_DIAGNOSTICS__?.terrain.height.probes.farBank ?? 0,
  }));
  expect(enemy.first?.z).toBeCloseTo(-18, 2);
  expect(enemy.first?.y ?? 0).toBeCloseTo(enemy.farBank + Balance.enemy.groundY, 2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
