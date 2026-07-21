import { expect, test, type Page } from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('the family crosses its palisade line while the Fever routes around it', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&nopause&nosteal&nowreck&nokill&seed=friendly-walls');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  expect(await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    return [-3, 0, 3].every((x) => game.placeFree('palisade', x, 8, 1));
  })).toBe(true);

  await page.evaluate(() => window.__GR_TEST__!.teleport(0, 4));
  await page.keyboard.down('KeyS');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.z)).toBeGreaterThan(9);
  await page.keyboard.up('KeyS');

  const route = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    game.setBalance('enemy.contactDamage', 0);
    game.clearEnemies();
    game.teleport(0, 14);
    game.spawnEnemyAt(0, 4);
    const trace: Array<{ x: number; z: number }> = [];
    for (let step = 0; step < 300; step += 1) {
      game.advanceSim(0.05);
      const enemy = game.enemyPositions()[0];
      if (enemy) trace.push({ x: enemy.x, z: enemy.z });
    }
    return {
      crossing: trace.find((point) => point.z > 9),
      final: trace.at(-1),
    };
  });

  expect(route.crossing).toBeDefined();
  expect(Math.abs(route.crossing!.x)).toBeGreaterThan(4.5);
  expect(route.final?.z).toBeGreaterThan(11);
  expect(errors).toEqual([]);
});
