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
type Walk8Contract = {
  frameCount?: number;
  grid: { file: string; cols: number; rowDirections: string[] };
  aliases: Record<string, string>;
  directions?: Record<string, { row?: number; frames?: { files?: string[] } }>;
};

const shotDir = path.resolve('artifacts/lane-c-activations');
const portraitTiles = [
  ['sentry_beacon', 'sentry-beacon'],
  ['palisade', 'palisade'],
  ['sluice', 'sluice-works'],
  ['stockpile', 'stockpile-yard'],
  ['turret', 'signal-turret'],
  ['assay_office', 'claim-office'],
] as const;
const directionSpawns = [
  ['s', { x: 0, z: -10 }],
  ['se', { x: -10, z: -10 }],
  ['e', { x: -10, z: 0 }],
  ['ne', { x: -10, z: 10 }],
  ['n', { x: 0, z: 10 }],
  ['nw', { x: 10, z: 10 }],
  ['w', { x: 10, z: 0 }],
  ['sw', { x: 10, z: -10 }],
] as const;
const characterContract = JSON.parse(
  fs.readFileSync(path.resolve('assets/layer-contracts/characters.v2.json'), 'utf8'),
) as { slots: Array<{ slot: string; walk8?: Walk8Contract }> };
const banditWalk8 = characterContract.slots.find(({ slot }) => slot === 'char.bandit_base')?.walk8;
if (!banditWalk8) throw new Error('characters.v2.json is missing char.bandit_base.walk8');
const frameStem = path.basename(banditWalk8.grid.file, path.extname(banditWalk8.grid.file));
const jumperDirections = directionSpawns.map(([direction, spawn]) => {
  const rowDirection = (banditWalk8.aliases[direction] ?? direction).toLowerCase();
  // s1185: since c3d8470e the diagonals are explicit-FILE direction entries on a separate
  // walkdiag8 sheet (aliases emptied), so they carry no grid row. Prefer the declared files;
  // the row path below still guards the cardinal rows and still fails loudly on a bad contract.
  const explicitFiles = banditWalk8.directions?.[rowDirection]?.frames?.files;
  if (explicitFiles?.length) return [direction, spawn, explicitFiles] as const;
  const row = banditWalk8.directions?.[rowDirection]?.row
    ?? banditWalk8.grid.rowDirections.findIndex((candidate) => candidate.toLowerCase() === rowDirection);
  // Runtime returns null here; the test throws so a malformed contract fails loudly at collection.
  if (row < 0) throw new Error(`char.bandit_base.walk8 has no row for ${direction} (${rowDirection})`);
  const frameCount = Math.max(1, banditWalk8.frameCount ?? banditWalk8.grid.cols ?? 1);
  const frames = Array.from({ length: frameCount }, (_, col) => `${frameStem}-r${row}c${col}.png`);
  return [direction, spawn, frames] as const;
});

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

  for (const [direction, spawn, frames] of jumperDirections) {
    await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
    await page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), spawn);
    await page.waitForFunction(
      (expected) => {
        const snapshot = window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base'] as SpriteSnapshot | undefined;
        return snapshot?.loaded === true && snapshot.clip === 'walk' && snapshot.direction === expected;
      },
      direction,
    );
    const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.bandit_base'] as SpriteSnapshot);
    expect(frames).toContain(snapshot.frameKey);
    // Every alias in this contract resolves to an explicit row, so none should mirror.
    expect(snapshot.mirrored).toBe(false);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('build menu shows the six processed building portraits', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&seed=lane-c-portraits');
  await grantGold(page, 1000);
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();

  for (const [id, slug] of portraitTiles) {
    const tile = page.getByTestId(`hud-build-tile-${id}`);
    await expect(tile).toHaveAttribute('data-icon-slug', slug);
    await expect(tile).toHaveAttribute('data-asset-state', 'ready');
    await expect(tile.locator('.hud-build-tile__icon')).toHaveCSS('display', 'block');
  }

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
