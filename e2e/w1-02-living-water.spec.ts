import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/night-shift-river');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

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

test('living water shader animates and keeps a mobile quality knob', async ({ page }) => {
  test.setTimeout(60_000);
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

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileErrors = await openGame(page, 'w1-02-390');
  const mobileWater = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.water);
  expect(mobileWater?.mobile).toBe(true);
  expect(mobileWater?.quality).toBe(Balance.world.waterMobileQuality);
  expect(mobileWater?.quality ?? 1).toBeLessThan(Balance.world.waterQuality);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(mobileErrors.consoleErrors).toEqual([]);
  expect(mobileErrors.pageErrors).toEqual([]);
});

test('watered E1 tiles carry the river past both map edges into the vista', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  for (const contract of ['the-claim', 'e1-night-shift', 'e1-twin-banks'] as const) {
    const errors = collectErrors(page);
    await page.goto(`/?debug&contract=${contract}&nowaves&nokill&nolevel&nopause&nosteal&seed=w1-02-${contract}`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
    await page.evaluate(() => window.__GR_TEST__?.teleport(-29, 0));
    await page.waitForTimeout(400);

    const terrain = await page.evaluate(() => ({
      tileSize: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.size ?? 64,
      vistaRiver: window.__THREE_GAME_DIAGNOSTICS__?.terrain.vista.river,
      water: window.__THREE_GAME_DIAGNOSTICS__?.terrain.water,
    }));
    expect(terrain.water?.riverPresent).toBe(true);
    if (!terrain.vistaRiver) throw new Error(`Missing vista river diagnostics for ${contract}.`);
    expect(terrain.vistaRiver.present).toBe(true);
    expect(terrain.vistaRiver.radius).toBeGreaterThan(terrain.tileSize / 2);
    expect(terrain.vistaRiver.fadeStart).toBeGreaterThan(terrain.tileSize / 2);
    expect(terrain.vistaRiver.vertices).toBeGreaterThan(20);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${contract}-west-corner.png`),
      fullPage: false,
    });
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  }
});
