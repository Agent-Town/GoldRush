import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// s106 fire: boot probe for the prospector-presence drain. Zero console/page
// errors on a PLAIN boot (no debug), confirm embodiment visible, shots both VP.
test('s106 boot probe: zero errors + prospector visible (plain boot)', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?nowaves&nolevel&seed=s106-probe');
  await page.waitForFunction(
    () => ((window as any).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
    null,
    { timeout: 15000 },
  );
  const vis = await page.evaluate(() => (window as any).__THREE_GAME_DIAGNOSTICS__?.agent?.embodiment?.visible ?? null);

  mkdirSync('reviews/shots-prospector-presence', { recursive: true });
  const proj = testInfo.project.name;
  await page.screenshot({ path: `reviews/shots-prospector-presence/${proj}-plain-boot.png` });

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  expect(vis, 'prospector visible in plain boot').toBe(true);
});
