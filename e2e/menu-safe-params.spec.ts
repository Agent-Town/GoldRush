import { expect, test } from '@playwright/test';

// Owner hit /?town3dPilot=all → launched straight into The Claim: the boot router
// treated ANY query as a contract launch. Pilot/visual flags must land on the menu.
test('?town3dPilot=all boots the start menu, not a run', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?town3dPilot=all');
  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect
    .poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.town3dPilotState), { timeout: 30_000 })
    .not.toBe('off');
  expect(errors).toEqual([]);
});

test('a contract param still launches the run path', async ({ page }) => {
  await page.goto('/?contract=the-claim');
  await expect(page.getByTestId('start-menu-enter-town')).toHaveCount(0);
});
