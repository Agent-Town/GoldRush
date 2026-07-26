import { expect, test, type Page } from '@playwright/test';
import { Balance, DIFFICULTY_PRESET_STORAGE_KEY } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

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
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number | string): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function prepBlast(page: Page): Promise<void> {
  await setBalance(page, 'enemy.hp', 999);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.active)).toBe('blast');
}

async function waitForDetonation(page: Page): Promise<{ x: number; z: number }> {
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.lastDetonation), { timeout: 12_000 })
    .not.toBeNull();
  return page.evaluate(() => window.__GR_TEST__?.state().arsenal.lastDetonation ?? { x: 999, z: 999 });
}

function expectNearPoint(actual: { x: number; z: number }, expected: { x: number; z: number }, tolerance = 0.35): void {
  expect(Math.hypot(actual.x - expected.x, actual.z - expected.z)).toBeLessThanOrEqual(tolerance);
}

test('cursor blast lands at the aimed ground point', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nolevel&nopause&seed=task-024-cursor');
  await prepBlast(page);
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ wide_ring: 2 }));
  const upgradedAim = await page.evaluate(() => window.__GR_TEST__?.state().arsenal);
  expect(upgradedAim?.blastRadius).toBeGreaterThan(Balance.blast.radius);
  expect(upgradedAim?.aimReticleRadius).toBeCloseTo(upgradedAim?.blastRadius ?? 0, 3);
  const expected = await page.evaluate(() => window.__GR_TEST__?.setBlastAim(4, 8) ?? { x: 0, z: 0 });
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 10));

  expectNearPoint(await waitForDetonation(page), expected);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('cursor blast clamps an out-of-range aim ray to blast range', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nolevel&nopause&seed=task-024-clamp');
  await prepBlast(page);
  const expected = await page.evaluate(() => window.__GR_TEST__?.setBlastAim(0, -100) ?? { x: 0, z: 0 });
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 10));

  expectNearPoint(await waitForDetonation(page), expected);
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
  expect(Math.hypot(expected.x - hero.x, expected.z - hero.z)).toBeCloseTo(Balance.blast.range, 1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('auto blast mode still lands on the selected enemy position', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nolevel&nopause&seed=task-024-auto');
  await setBalance(page, 'blast.aimMode', 'auto');
  await prepBlast(page);
  await page.evaluate(() => window.__GR_TEST__?.setBlastAim(0, -100));
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-2, 10));

  expectNearPoint(await waitForDetonation(page), { x: -2, z: 10 });
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('difficulty presets apply the hard-mode bundle and persist by profile key', async ({ browser }) => {
  const hardPage = await browser.newPage();
  const hardErrors = await openGame(hardPage, '?debug&nowaves&nolevel&preset=vein-hunter&seed=task-024-hard');
  const hard = await hardPage.evaluate(() => ({
    preset: window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset,
    balance: window.__GR_TEST__?.state().balance,
    xpPerKill: window.__THREE_GAME_DIAGNOSTICS__?.xpAudit.xpPerKill,
    stored: localStorage.getItem('gr.difficultyPreset.v1'),
  }));
  await hardPage.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ double_tap_coil: 5 }));
  expect(await hardPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.stacks.double_tap_coil)).toBe(3);
  expect(hard.preset).toBe('vein-hunter');
  expect(hard.balance?.enemyHp).toBe(28);
  expect(hard.xpPerKill).toBe(3);
  expect(hard.balance?.offerInvestBonus).toBe(0);
  expect(hard.balance?.doubleTapCoilMaxStacks).toBe(3);
  expect(hard.stored).toBe('vein-hunter');
  await hardPage.goto('/?debug&nowaves&nolevel&seed=task-024-sticky');
  await hardPage.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await hardPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset)).toBe('vein-hunter');
  expect(await hardPage.evaluate(() => window.__GR_TEST__?.state().balance.xpPerKill)).toBe(3);
  await hardPage.close();

  const greenPage = await browser.newPage();
  await greenPage.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [DIFFICULTY_PRESET_STORAGE_KEY, 'greenhorn'] as const,
  );
  const greenErrors = await openGame(greenPage, '?debug&nowaves&nolevel&seed=task-024-green');
  const green = await greenPage.evaluate(() => window.__GR_TEST__?.state().balance);
  expect(green?.difficultyPreset).toBe('greenhorn');
  expect(green?.xpPerKill).toBe(4);
  expect(green?.enemyHp).toBe(25.2);
  expect(green?.offerInvestBonus).toBe(0.35);
  await greenPage.close();

  for (const bucket of [hardErrors, greenErrors]) {
    expect(bucket.consoleErrors).toEqual([]);
    expect(bucket.pageErrors).toEqual([]);
  }
});

test('difficulty preset falls back to default when profile storage is blocked', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const blockedStorage = {
      get length() {
        throw new Error('blocked storage');
      },
      key() {
        throw new Error('blocked storage');
      },
      getItem() {
        throw new Error('blocked storage');
      },
      setItem() {
        throw new Error('blocked storage');
      },
      removeItem() {
        throw new Error('blocked storage');
      },
      clear() {
        throw new Error('blocked storage');
      },
    };
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => blockedStorage,
    });
  });
  const page = await context.newPage();
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=task-024-storage-blocked');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset)).toBe('trail');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks)).toBeTruthy();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  await context.close();
});

test('difficulty preset falls back to default when profile storage access is blocked', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError: storage access denied');
      },
    });
  });
  const page = await context.newPage();
  const errors = await openGame(page, '?debug&nowaves&nolevel&seed=task-024-storage-access-blocked');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset)).toBe('trail');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks)).toBeTruthy();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  await context.close();
});
