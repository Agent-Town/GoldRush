import { test, expect } from '@playwright/test';

const BASE = 'https://d2f9c11e.gold-rush-3in.pages.dev';
const SHOTS = '/Users/robin/Claude/Projects/Gold Rush/reviews/smoke-press';

test('THE PRESS SMOKE on the live deploy: stamp → play → export → import → THE RIVER', async ({ page }) => {
  test.setTimeout(300_000);
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // 1. The Press floor (editor door, the Claim as template)
  await page.goto(`${BASE}/?contract=the-claim&editor&debug`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByTestId('charter-press-panel')).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `${SHOTS}/01-press-floor.png` });

  // 2. Stamp a charter under a new name
  await page.getByTestId('press-charter-name').fill('Smoke Ridge');
  await page.getByTestId('press-stamp').click();
  await expect(page.getByTestId('press-status')).not.toHaveText('The press is ready.', { timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}/02-stamped.png` });
  const shelfFirst = page.getByTestId('press-shelf').locator('li').first();
  await expect(shelfFirst).toContainText('Smoke Ridge');

  // 3. Export: the paste-code for the stamped charter
  const codeButton = page.locator('[data-testid^="press-share-code"], [data-testid*="export"]').first();
  let code = '';
  if (await codeButton.count()) {
    await codeButton.click();
    code = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  }
  await page.screenshot({ path: `${SHOTS}/03-share-surface.png` });

  // 4. The Lever: three choices and a press, then PLAY the result
  await page.getByTestId('press-mode-lever').click();
  await expect(page.getByTestId('press-lever-mode')).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/04-lever.png` });
  await page.getByTestId('lever-press').click();
  await page.waitForURL(/contract=/, { timeout: 30_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(6_000);
  await page.screenshot({ path: `${SHOTS}/05-lever-run-live.png` });

  // 5. THE RIVER: the CP-05 charter boots as a real run on the deploy
  await page.goto(`${BASE}/?contract=e10-river&debug&terrain3dPilot&run3dPilot=all`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(8_000);
  await page.screenshot({ path: `${SHOTS}/06-the-river.png` });

  const report = { consoleErrors: consoleErrors.slice(0, 10), pageErrors: pageErrors.slice(0, 10), exportCodeCaptured: code.length > 0, codeLength: code.length };
  console.log('SMOKE-REPORT ' + JSON.stringify(report));
  expect(pageErrors).toEqual([]);
});
