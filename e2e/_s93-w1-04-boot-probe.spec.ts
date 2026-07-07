import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// s93 fire: boot probe for the w1-04 scatter graft. Zero console/page errors,
// capture the detailScatter diagnostics signature, screenshot for review.
test('w1-04 boot probe: zero errors + scatter live', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?debug&nowaves&nokill&nolevel&nopause');
  await page.waitForFunction(
    () => (window as any).__GR_TEST__ && ((window as any).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
    null,
    { timeout: 15000 },
  );

  const diag = await page.evaluate(() => (window as any).__THREE_GAME_DIAGNOSTICS__?.terrain?.detailScatter ?? null);

  mkdirSync('reviews/shots-w1-04', { recursive: true });
  const proj = testInfo.project.name;
  await page.screenshot({ path: `reviews/shots-w1-04/${proj}-boot.png` });

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  expect(diag, 'detailScatter diagnostics present').not.toBeNull();
  expect(diag.instanceClasses).toBeGreaterThan(0);
  expect(diag.totalInstances).toBeGreaterThan(0);
  expect(typeof diag.signature).toBe('string');
  console.log(`[s93 probe ${proj}] tier=${diag.densityTier} classes=${diag.instanceClasses} instances=${diag.totalInstances} sig=${diag.signature.slice(0, 24)}`);
});
