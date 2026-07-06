import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'sentry_beacon' | 'palisade' | 'turret';
type ShotKind = 'bolt' | 'lob';
type CombatDiagnostics = {
  shots: Record<ShotKind, number>;
  lastShotKind: ShotKind | null;
  lastShotOwnerId: string | null;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string, timescale = 8): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&timescale=${timescale}&nowaves&nolevel&nopause&seed=${seed}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  const before = await page.evaluate((buildableId) => {
    const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.buildables ?? [];
    return entries.find((entry) => entry.id === buildableId)?.count ?? 0;
  }, id);
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect
    .poll(() =>
      page.evaluate(
        (target) => {
          const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
          if (!build?.ghostValid) return false;
          return Math.abs(build.ghostPos.x - target.x) < 0.05 && Math.abs(build.ghostPos.z - target.z) < 0.05;
        },
        { x, z },
      ),
    )
    .toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect
    .poll(() =>
      page.evaluate((buildableId) => {
        const entries = window.__THREE_GAME_DIAGNOSTICS__?.build.buildables ?? [];
        return entries.find((entry) => entry.id === buildableId)?.count ?? 0;
      }, id),
    )
    .toBe(before + 1);
}

async function combat(page: Page): Promise<CombatDiagnostics> {
  return page.evaluate(() => window.__GR_TEST__?.state().combat as unknown as CombatDiagnostics);
}

async function prep(page: Page): Promise<void> {
  await setBalance(page, 'sparkRig.range', 0);
  await setBalance(page, 'enemy.hp', 10);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'palisade.cost', 0);
  await setBalance(page, 'turret.costBase', 0);
  await setBalance(page, 'beacon.costBase', 0);
  await grantGold(page, 50);
}

async function placeFordLine(page: Page): Promise<void> {
  for (const x of [-1, 0, 1]) await placeBuildableAt(page, 'palisade', x, 10);
}

test('turret behind a ford palisade line acquires through the wall and lobs crossing shots', async ({ page }) => {
  const errors = await openGame(page, 'task-041-turret-lob');
  await prep(page);
  await placeFordLine(page);
  await placeBuildableAt(page, 'turret', 0, 13);
  await teleport(page, 22, 22);

  const beforeWall = await combat(page);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 7));
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.turrets ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(0);
  const afterWall = await combat(page);
  expect(afterWall.shots.lob).toBeGreaterThan(beforeWall.shots.lob);
  expect(afterWall.lastShotKind).toBe('lob');
  expect(afterWall.lastShotOwnerId).toBe('turrets');

  const killsAfterWall = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.turrets ?? 0);
  const beforeClear = afterWall.shots.bolt;
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(6, 13));
  await expect
    .poll(() => page.evaluate((kills) => (window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.turrets ?? 0) - kills, killsAfterWall), {
      timeout: 12_000,
    })
    .toBeGreaterThan(0);
  const afterClear = await combat(page);
  expect(afterClear.shots.bolt).toBeGreaterThan(beforeClear);
  expect(afterClear.lastShotKind).toBe('bolt');
  expect(afterClear.lastShotOwnerId).toBe('turrets');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('beacons still fire flat bolts through palisades', async ({ page }) => {
  const errors = await openGame(page, 'task-041-beacon-bolt');
  await prep(page);
  await placeFordLine(page);
  await placeBuildableAt(page, 'sentry_beacon', 0, 13);
  await teleport(page, 22, 22);

  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 7));
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner.beacons ?? 0), { timeout: 12_000 })
    .toBeGreaterThan(0);
  const after = await combat(page);
  expect(after.lastShotKind).toBe('bolt');
  expect(after.lastShotOwnerId).toBe('beacons');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
