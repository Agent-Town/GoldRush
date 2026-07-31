import { expect, test } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const LONG_FLOAT = 'Stockpile Yard II - the yard holds more gold';

test('long and reused short floats report legible rendered bounds', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  const webGlWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning' && message.text().includes('GL_INVALID_VALUE')) webGlWarnings.push(message.text());
  });
  await page.goto('/?debug=1');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.vfx));
  await page.getByRole('button', { name: 'Begin' }).click();
  await page.evaluate(() => window.__GR_TEST__!.warmVfx());

  const placed = await page.evaluate(() => {
    const { x, z } = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
    return window.__GR_TEST__!.placeFree('stockpile', x - 1.5, z - 1);
  });
  expect(placed).toBe(true);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.build.stockpiles === 1);
  const upgraded = await page.evaluate(() => {
    window.__GR_TEST__!.grantGold(1_000);
    return window.__GR_TEST__!.upgradeBuilding('stockpile', 0);
  });
  expect(upgraded).toBe(true);
  await page.waitForFunction((text) => window.__THREE_GAME_DIAGNOSTICS__?.vfx.lastFloatText?.text === text, LONG_FLOAT);

  const long = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vfx.lastFloatText!);
  expect(long.renderedWidthPx).toBeLessThanOrEqual(long.canvasWidthPx - 20);
  expect(long.fontPx).toBeGreaterThanOrEqual(32);
  await page.screenshot({
    path: `artifacts/f1316-1-float-legibility/${testInfo.project.name}.png`,
    animations: 'disabled',
  });

  await page.evaluate(() => window.__GR_TEST__!.warmVfx());
  const short = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.vfx.lastFloatText!);
  expect(short.canvasWidthPx).toBe(192);
  expect(short.fontPx).toBe(64);
  expect(webGlWarnings).toEqual([]);
  expectNoConsoleErrors(errors, testInfo.project.name);
});
