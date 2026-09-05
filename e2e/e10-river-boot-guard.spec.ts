import { expect, test, type Page } from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('raw E10 River door opens as The River without errors', async ({ page }) => {
  // Until 2026-09-06 this spec pinned the DEFECT: an empty `harvestAnchors` array (which only means
  // "not admitted to the benchmark") also sent a human to The Claim (F-E10L-1). The River now declares
  // `twist.harvestFreeObjective` and opens as itself; the door refuses only an undeclared seamless map.
  const errors = collectErrors(page);
  await page.goto('/?contract=e10-river&debug&nowaves&seed=e10-river-raw');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  await expect(page.getByTestId('contract-briefing-geography')).not.toContainText('The Claim opened instead');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract)).resolves.toMatchObject({
    activeId: 'e10-river',
    requestedId: 'e10-river',
    fallbackReason: null,
  });
  expect(errors).toEqual([]);
});
