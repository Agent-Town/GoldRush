import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// s99 fire: boot probe for the combat-readability drain. Zero console/page
// errors, confirm the readability diagnostics block is live, screenshot both
// viewports for the review.
test('s99 boot probe: zero errors + readability diagnostics live', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?debug&nowaves&nokill&nolevel&nopause');
  await page.waitForFunction(
    () => (window as any).__GR_TEST__ && ((window as any).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
    null,
    { timeout: 15000 },
  );

  const diag = await page.evaluate(() => (window as any).__THREE_GAME_DIAGNOSTICS__?.readability ?? null);

  mkdirSync('reviews/shots-combat-readability', { recursive: true });
  const proj = testInfo.project.name;
  await page.screenshot({ path: `reviews/shots-combat-readability/${proj}-boot.png` });

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  expect(diag, 'readability diagnostics present').not.toBeNull();
  expect(typeof diag.enemyHitFlashes).toBe('number');
  expect(typeof diag.buildingHpBars).toBe('number');
  expect(typeof diag.turretPulses).toBe('number');
  console.log(`[s99 probe ${proj}] flashes=${diag.enemyHitFlashes} bars=${diag.buildingHpBars} pulses=${diag.turretPulses}`);
});
