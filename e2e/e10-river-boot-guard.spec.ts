import { expect, test, type Page } from '@playwright/test';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('raw E10 River door declines to The Claim without errors', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?contract=e10-river&debug&nowaves&seed=e10-river-raw');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Claim');
  await expect(page.getByTestId('contract-briefing-geography')).toHaveText(
    'The River is not ready for a direct claim; The Claim opened instead.',
  );
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract)).resolves.toMatchObject({
    activeId: 'the-claim',
    requestedId: 'e10-river',
    fallbackReason: 'unavailable-contract',
  });
  expect(errors).toEqual([]);
});
