import { expect, test, type Page } from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('a normal enemy crosses the fortified far-bank wall line without stalling', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  await page.goto('/?debug&contract=e1-baron&nowaves&nolevel&nokill&nopause&nosteal&seed=fort-static-routing');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  const run = await page.evaluate(() => {
    const api = window.__GR_TEST__!;
    const target = { x: 0, z: -5.8 };
    api.setManualSim(true);
    api.clearEnemies();
    api.setBalance('enemy.contactDamage', 0);
    api.setBalance('sparkRig.range', 0);
    api.teleport(target.x, target.z);
    if (!api.spawnEnemyAt(0, -14)) throw new Error('Could not spawn the fort route probe.');
    const id = api.enemyPositions()[0]?.id;
    const path: Array<{ x: number; z: number }> = [];
    let ticks = 0;
    api.advanceSim(50, () => {
      ticks += 1;
      const enemy = api.enemyPositions().find((candidate) => candidate.id === id);
      if (!enemy) return;
      path.push({ x: enemy.x, z: enemy.z });
    });
    return { path, target, ticks };
  });

  let stationary = 0;
  let longestStationary = 0;
  for (let index = 1; index < run.path.length; index += 1) {
    const previous = run.path[index - 1];
    const current = run.path[index];
    stationary = Math.hypot(current.x - previous.x, current.z - previous.z) < 0.005 ? stationary + 1 : 0;
    longestStationary = Math.max(longestStationary, stationary);
  }
  const initial = run.path[0];
  const final = run.path.at(-1)!;
  expect(run.ticks).toBeGreaterThan(1_400);
  expect(run.path.some(({ z }) => z > -6.5)).toBe(true);
  expect(Math.hypot(final.x - run.target.x, final.z - run.target.z)).toBeLessThan(
    Math.hypot(initial.x - run.target.x, initial.z - run.target.z) * 0.75,
  );
  expect(longestStationary).toBeLessThan(120);
  expect(errors).toEqual([]);
});
