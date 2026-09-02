import { expect, test } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const objective = 'Keep the last warm vent alight through wave 8.';

test.setTimeout(90_000);

test('a plain Last Claim boot shows the warm vent preserve objective', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await page.goto('/?contract=e10-last-claim&nolevel&nopause&terrain2d&seed=e10-preserve-gate');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');

  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Last Claim');
  await expect(page.getByTestId('contract-briefing-goals')).toContainText(objective);
  expect(await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ as typeof window.__THREE_GAME_DIAGNOSTICS__ & {
    preserve: { hp: number; maxHp: number; alive: boolean };
  }).preserve)).toEqual({
    hp: 360,
    maxHp: 360,
    alive: true,
  });
  await page.screenshot({ path: `reviews/shots-e10-preserve-objective/${testInfo.project.name}-briefing.png` });

  await page.getByTestId('contract-briefing-dismiss').evaluate((button: HTMLButtonElement) => button.click());
  await page.screenshot({ path: `reviews/shots-e10-preserve-objective/${testInfo.project.name}-preserve.png` });
  expectNoConsoleErrors(watch, 'e10 preserve plain boot');
});

test('the browser uses the same seeded preserve-fell terminal rule', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e10-last-claim&nolevel&nopause&terrain2d&seed=e10-preserve-gate');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e10-last-claim');
  await page.getByTestId('contract-briefing-dismiss').evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setBalance('wreck.damage', 1_000);
    window.__GR_TEST__!.advanceSim(70);
  });
  expect(await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__ as typeof window.__THREE_GAME_DIAGNOSTICS__ & {
      preserve: { hp: number; maxHp: number; alive: boolean };
    };
    return { preserve: diagnostics.preserve, reason: diagnostics.run.lastRunEndedReason };
  })).toEqual({ preserve: { hp: 0, maxHp: 360, alive: false }, reason: 'preserve_fell' });
  expectNoConsoleErrors(watch, 'e10 preserve terminal parity');
});
