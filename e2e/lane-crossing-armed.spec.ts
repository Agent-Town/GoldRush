import { expect, test, type Page } from '@playwright/test';

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), { x, z });
}

test('Twin Banks crossings stay armed while open deep water disarms readably', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&contract=e1-twin-banks&nowaves&nolevel&nopause&seed=crossing-armed');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (const [x, z] of [[-16, 0], [16, 0], [-7.5, 0.2], [7.4, -0.25]]) {
    await teleport(page, x, z);
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.disarmed)).toBe(false);
    const shots = await page.evaluate(() => window.__GR_TEST__?.state().combat.shots.bolt ?? 0);
    await expect(page.evaluate(({ enemyX, enemyZ }) => window.__GR_TEST__?.spawnEnemyAt(enemyX, enemyZ + 3), {
      enemyX: x,
      enemyZ: z,
    })).resolves.toBe(true);
    await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().combat.shots.bolt ?? 0)).toBeGreaterThan(shots);
  }

  await teleport(page, 0, 2);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.disarmed)).toBe(true);
  await expect(page.getByTestId('hud-weapon')).toHaveClass(/hud-panel--disarmed/);
  await expect(page.getByTestId('hud-weapon-reason')).toHaveText('Hands full of river.');

  await teleport(page, 0, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.disarmed)).toBe(false);
  await expect(page.getByTestId('hud-weapon')).not.toHaveClass(/hud-panel--disarmed/);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.lastFloatText?.text)).toBe('Armed again');
  expect(errors).toEqual([]);
});
