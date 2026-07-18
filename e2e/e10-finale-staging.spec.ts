import { expect, test, type Page } from '@playwright/test';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.stack ?? error.message));
  return errors;
}

test('E10 closes on the Ark, re-inks, and offers THE RIVER through the Press', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);

  await page.goto('/?debug&e10finale&nowaves&nolevel&nokill&nopause&terrain2d&seed=e10-finale');
  await page.waitForFunction(
    () => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
    undefined,
    { timeout: 20_000 },
  ).catch(() => {
    throw new Error(`E10 staging boot failed: ${JSON.stringify(errors)}`);
  });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();

  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.e10Finale.diagnostics().ark.loadState)).toBe('ready');
  const staged = await page.evaluate(() => window.__GR_TEST__!.e10Finale.diagnostics());
  expect(staged).toMatchObject({
    enabled: true,
    ark: {
      sceneClass: 'deepsky-ark-deck',
      tileId: 'ark-plaza-e10',
      deckCount: 10,
      loadState: 'ready',
      models: ['E10ArkPlaza', 'E10ArkDeckDressing'],
      renderOnly: true,
      visualY: true,
    },
    reink: { state: 'idle', progress: 0, renderOnly: true },
    riverOffer: { offered: false, charterName: 'The River', launchTemplate: 'the-claim' },
  });

  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('e10Finale.reinkSeconds', 0.5))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('e10Finale.offerDelaySeconds', 0))).resolves.toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.e10Finale.close())).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__!.e10Finale.close())).toBe(false);
  await expect(page.getByTestId('e10-finale-layer')).toContainText('THE RE-INKING');
  await expect(page.getByTestId('e10-river-lever')).toBeVisible();

  const offered = await page.evaluate(() => window.__GR_TEST__!.e10Finale.diagnostics());
  expect(offered.reink).toMatchObject({ state: 'offered', progress: 1, renderOnly: true });
  expect(offered.riverOffer.offered).toBe(true);
  expect(await page.locator('canvas').evaluate((canvas) => ({ filter: canvas.style.filter, transition: canvas.style.transition }))).toEqual({
    filter: 'grayscale(0)',
    transition: 'filter 0.5s ease-out',
  });

  await page.getByTestId('e10-river-lever').click();
  await page.waitForURL((url) => url.searchParams.get('contract') === 'the-claim' && url.searchParams.has('nowaves') && !url.searchParams.has('editor'));
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The River');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('the-claim');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
