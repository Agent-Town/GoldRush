import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type SpriteSnapshot = {
  clip: string;
  frameKey: string;
  loaded: boolean;
  direction?: string;
  mirrored?: boolean;
};

const shotDir = path.resolve('artifacts/lane-c-activations');
const portraitTiles = [
  ['sentry_beacon', 'sentry-beacon'],
  ['palisade', 'palisade'],
  ['sluice', 'sluice-works'],
  ['stockpile', 'stockpile-yard'],
  ['turret', 'signal-turret'],
] as const;
const jumperDirections = [
  ['s', { x: 0, z: -10 }, ['char-jumper-sheet-rotation-r0c0.png', 'char-jumper-sheet-rotation-r0c1.png'], false],
  ['se', { x: -10, z: -10 }, ['char-jumper-sheet-rotation-r0c2.png', 'char-jumper-sheet-rotation-r0c3.png'], false],
  ['e', { x: -10, z: 0 }, ['char-jumper-sheet-rotation-r1c0.png', 'char-jumper-sheet-rotation-r1c1.png'], false],
  ['ne', { x: -10, z: 10 }, ['char-jumper-sheet-rotation-r2c0.png', 'char-jumper-sheet-rotation-r2c1.png'], false],
  ['n', { x: 0, z: 10 }, ['char-jumper-sheet-rotation-r2c2.png'], false],
  ['nw', { x: 10, z: 10 }, ['char-jumper-sheet-rotation-r2c0.png', 'char-jumper-sheet-rotation-r2c1.png'], true],
  ['w', { x: 10, z: 0 }, ['char-jumper-sheet-rotation-r1c2.png', 'char-jumper-sheet-rotation-r1c3.png'], false],
  ['sw', { x: 10, z: -10 }, ['char-jumper-sheet-rotation-r0c2.png', 'char-jumper-sheet-rotation-r0c3.png'], true],
] as const;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=6&nowaves&nolevel&nokill&seed=lane-c-assay'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function selectBuildable(page: Page, id: BuildableId): Promise<void> {
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe(id);
}

async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  return page.evaluate(
    (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    id,
  );
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await teleport(page, x, z + 2);
  await selectBuildable(page, id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  const before = await buildableCount(page, id);
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
}

test('claim jumpers walk through the 8-way rotation matrix', async ({ page }) => {
  const errors = await openGame(page);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.speed', 0.25);
    window.__GR_TEST__?.setBalance('enemy.hp', 999);
  });
  await teleport(page, 0, 0);

  for (const [direction, spawn, frames, mirrored] of jumperDirections) {
    await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
    await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), spawn);
    await page.waitForFunction(
      (expected) => {
        const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper'] as SpriteSnapshot | undefined;
        return snapshot?.loaded === true && snapshot.clip === 'walk' && snapshot.direction === expected;
      },
      direction,
    );
    const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.claim_jumper'] as SpriteSnapshot);
    expect(frames).toContain(snapshot.frameKey);
    expect(snapshot.mirrored).toBe(mirrored);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('build menu shows the five processed building portraits', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=lane-c-portraits');
  await grantGold(page, 1000);
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();

  for (const [id, slug] of portraitTiles) {
    const tile = page.getByTestId(`hud-build-tile-${id}`);
    await expect(tile).toHaveAttribute('data-icon-slug', slug);
    await expect(tile.locator('.hud-build-tile__icon')).toHaveCSS('display', 'block');
  }
  await expect(page.getByTestId('hud-build-tile-assay_office').locator('.hud-build-tile__icon')).toHaveCSS('display', 'none');

  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, 'build-menu-portraits.png'), fullPage: false });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('Assay Office is river-adjacent only and opens the bench on confirm', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&seed=lane-c-assay-office');
  await grantGold(page, 200);

  await teleport(page, 0, 14);
  await selectBuildable(page, 'assay_office');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? true)).toBe(false);
  await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
  await expect.poll(() => buildableCount(page, 'assay_office')).toBe(0);

  await placeBuildableAt(page, 'assay_office', 0, 7);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await teleport(page, 0, 7);
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  // Incumbent bench (m5-04 offline queue, owner decision): no seeded sample order should leak.
  await page.getByTestId('assay-post').click();
  await expect(page.getByTestId('assay-pending-status')).toHaveText('Write an order first');

  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, 'assay-office-bench.png'), fullPage: false });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
