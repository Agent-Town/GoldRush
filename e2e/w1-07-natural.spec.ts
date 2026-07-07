import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TerrainHeightDiagnostics = {
  min: number;
  max: number;
  segments: number;
  natural: {
    range: number;
    fordApproachDelta: number;
    routingFeatureMax: number;
    probes: Record<'gully' | 'shelf' | 'bluff' | 'pocket', number>;
    features: Record<'gully' | 'shelf' | 'bluff' | 'pocket', { gully: number; shelf: number; bluff: number; pocket: number; heightOffset: number }>;
  };
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed = 'w1-07-natural'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nokill&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  return errors;
}

async function bootAt(
  browser: Browser,
  width: number,
  height: number,
): Promise<{ errors: ErrorBucket; terrain: TerrainHeightDiagnostics | undefined }> {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: width <= 390 ? 2 : 1 });
  const errors = await openGame(page, `w1-07-${width}`);
  const terrain = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height as TerrainHeightDiagnostics | undefined);
  await page.close();
  return { errors, terrain };
}

test('natural claim relief exposes gullies, shelves, bluffs, and pockets', async ({ browser, page }) => {
  const errors = await openGame(page);
  const terrain = (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.height)) as TerrainHeightDiagnostics | undefined;
  const projectMobile = (page.viewportSize()?.width ?? 1280) <= 430;
  const desktop = projectMobile ? await bootAt(browser, 1280, 800) : { errors, terrain };
  const mobile = projectMobile ? { errors, terrain } : await bootAt(browser, 390, 844);

  expect(desktop.terrain?.segments).toBe(Balance.world.terrainSegments);
  expect(desktop.terrain?.natural.range ?? 0).toBeGreaterThan(1.1);
  expect((desktop.terrain?.max ?? 0) - (desktop.terrain?.min ?? 0)).toBeGreaterThan(1.1);
  expect(desktop.terrain?.natural.features.gully.gully ?? 0).toBeGreaterThan(0.7);
  expect(desktop.terrain?.natural.features.shelf.shelf ?? 0).toBeGreaterThan(0.8);
  expect(desktop.terrain?.natural.features.bluff.bluff ?? 0).toBeGreaterThan(0.55);
  expect(desktop.terrain?.natural.features.pocket.pocket ?? 0).toBeGreaterThan(0.75);
  expect((desktop.terrain?.natural.probes.shelf ?? 0) - (desktop.terrain?.natural.probes.gully ?? 0)).toBeGreaterThan(0.7);
  expect((desktop.terrain?.natural.probes.bluff ?? 0) - (desktop.terrain?.natural.probes.pocket ?? 0)).toBeGreaterThan(0.45);

  expect(mobile.terrain?.segments).toBe(Balance.world.terrainMobileSegments);
  expect(mobile.terrain?.natural.range ?? 0).toBeGreaterThan(0.9);
  expect(mobile.terrain?.natural.range ?? Number.POSITIVE_INFINITY).toBeLessThan(desktop.terrain?.natural.range ?? 0);
  expect(desktop.errors.consoleErrors).toEqual([]);
  expect(desktop.errors.pageErrors).toEqual([]);
  expect(mobile.errors.consoleErrors).toEqual([]);
  expect(mobile.errors.pageErrors).toEqual([]);
});

test('ford approach and sim lanes stay visually calm while the sim remains planar', async ({ page }) => {
  const errors = await openGame(page, 'w1-07-legibility');
  const terrain = (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain)) as
    | {
        height: TerrainHeightDiagnostics;
        sim: { flat: boolean; probes: Record<string, { height: number; slope: { dx: number; dz: number } }> };
      }
    | undefined;

  expect(terrain?.height.natural.fordApproachDelta ?? Number.POSITIVE_INFINITY).toBeLessThan(0.12);
  expect(terrain?.height.natural.routingFeatureMax ?? Number.POSITIVE_INFINITY).toBeLessThan(0.02);
  expect(terrain?.sim.flat).toBe(true);
  expect(Object.values(terrain?.sim.probes ?? {}).every((probe) => probe.height === 0 && probe.slope.dx === 0 && probe.slope.dz === 0)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.teleport(14, -14));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0), { timeout: 8_000 }).toBeCloseTo(14, 2);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(14, -14))).resolves.toBe(true);
  const enemy = await page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]);
  expect(enemy?.x).toBeCloseTo(14, 2);
  expect(enemy?.z).toBeCloseTo(-14, 2);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
