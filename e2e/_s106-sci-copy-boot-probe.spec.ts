import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// s106 fire: boot probe for the sci-copy-clarity drain (ResearchTree copy +
// DeathOverlay legibility). Zero console/page errors, screenshot both VPs.
test('s106 boot probe: zero errors (sci-copy drain)', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?debug&nowaves&nokill&nolevel&nopause');
  await page.waitForFunction(
    () => (window as any).__GR_TEST__ && ((window as any).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
    null,
    { timeout: 15000 },
  );

  mkdirSync('reviews/shots-sci-copy', { recursive: true });
  const proj = testInfo.project.name;
  await page.screenshot({ path: `reviews/shots-sci-copy/${proj}-boot.png` });

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
