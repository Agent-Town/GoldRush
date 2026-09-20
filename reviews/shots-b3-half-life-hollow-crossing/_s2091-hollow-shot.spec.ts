import { expect, test } from '@playwright/test';

// s2091 drain evidence: the Half-Life Hollow crossing renders in a PLAIN boot (no ?debug),
// desktop + 390px mobile. Screenshots land in reviews/shots-b3-half-life-hollow-crossing/.
test('s2091 drain shot — the hollow crossing renders in a plain boot', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-6-atomic');
    sessionStorage.setItem('gr.contract.launch.v1', 'e6-half-life-hollow');
  });
  await page.goto('/?contract=e6-half-life-hollow&nowaves&nolevel&nopause');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-half-life-hollow');
  const crossing = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hollowCrossing);
  expect(crossing).toBeTruthy();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: `reviews/shots-b3-half-life-hollow-crossing/${testInfo.project.name}-plain-boot.png`,
  });
  // dismiss the contract card so the authored crossing itself is visible
  const begin = page.getByRole('button', { name: /begin/i });
  if (await begin.count()) await begin.first().click();
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: `reviews/shots-b3-half-life-hollow-crossing/${testInfo.project.name}-crossing.png`,
  });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
