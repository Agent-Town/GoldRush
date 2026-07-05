import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type HitRun = { hits: number; misses: number; total: number; rate: number };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=task-028');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function runCrosser(page: Page, leading: boolean): Promise<HitRun> {
  const fordSpeed = Balance.enemy.speed * 0.85;
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await setBalance(page, 'sparkRig.leading', leading);
  await setBalance(page, 'sparkRig.missSwitchCount', 99);
  await setBalance(page, 'enemy.hp', 999);
  await setBalance(page, 'enemy.contactDamage', 0);
  await page.evaluate(
    ({ speed }) => {
      window.__GR_TEST__?.teleport(0, 0);
      window.__GR_TEST__?.scriptEnemyAt(-8, 8.8, 10, 8.8, speed);
    },
    { speed: fordSpeed },
  );
  await expect
    .poll(() => page.evaluate(() => {
      const combat = window.__GR_TEST__?.state().combat;
      return (combat?.hits ?? 0) + (combat?.misses ?? 0);
    }), { timeout: 12_000 })
    .toBeGreaterThanOrEqual(8);

  return page.evaluate(() => {
    const combat = window.__GR_TEST__?.state().combat ?? { hits: 0, misses: 0 };
    const total = combat.hits + combat.misses;
    return {
      hits: combat.hits,
      misses: combat.misses,
      total,
      rate: total > 0 ? combat.hits / total : 0,
    };
  });
}

test('Spark Rig leads a ford-speed crosser', async ({ page }) => {
  const errors = await openGame(page);

  const off = await runCrosser(page, false);
  const on = await runCrosser(page, true);
  console.info(`task-028 hit rates OFF=${Math.round(off.rate * 100)}% (${off.hits}/${off.total}) ON=${Math.round(on.rate * 100)}% (${on.hits}/${on.total})`);

  expect(on.rate).toBeGreaterThanOrEqual(0.7);
  expect(on.rate).toBeGreaterThan(off.rate);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('stale target switch drops a runner after N misses', async ({ page }) => {
  const errors = await openGame(page);
  const fordSpeed = Balance.enemy.speed * 0.85;
  await setBalance(page, 'sparkRig.leading', false);
  await setBalance(page, 'sparkRig.missSwitchCount', 2);
  await setBalance(page, 'enemy.contactDamage', 0);
  const decoyHp = Balance.enemy.hp;
  await page.evaluate(
    ({ speed }) => {
      window.__GR_TEST__?.teleport(0, 0);
      window.__GR_TEST__?.scriptEnemyAt(-8, 8.8, 10, 8.8, speed);
    },
    { speed: fordSpeed },
  );
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().combat.misses ?? 0), { timeout: 12_000 }).toBeGreaterThanOrEqual(1);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(4, 4));

  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.state().combat.staleSwitches ?? 0), { timeout: 12_000 })
    .toBeGreaterThanOrEqual(1);
  await expect
    .poll(() => page.evaluate((expectedHp) => {
      const decoy = window.__GR_TEST__?.enemyPositions().find((enemy) => Math.hypot(enemy.x - 4, enemy.z - 4) < 1.5);
      return !decoy || decoy.hp < expectedHp;
    }, decoyHp), { timeout: 12_000 })
    .toBe(true);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
