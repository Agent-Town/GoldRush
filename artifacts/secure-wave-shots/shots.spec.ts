import { test, expect } from '@playwright/test';

// Scratch capture for the s1068 drain of lane-e1-secure-wave-truth.
// Captures the two briefing cards whose copy the slice changed.
const MAPS = [
  { id: 'e1-dry-gulch', wave: 'wave 20' },
  { id: 'e1-twin-banks', wave: 'wave 20' },
];

for (const map of MAPS) {
  test(`briefing states its win condition: ${map.id}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));

    await page.goto(`/?debug&contract=${map.id}`);
    await page.waitForFunction(() => (window as any).__THREE_GAME_DIAGNOSTICS__?.frame > 12);

    const card = page.getByTestId('contract-briefing');
    await expect(card).toContainText(map.wave);

    const secureWave = await page.evaluate(
      () => (window as any).__THREE_GAME_DIAGNOSTICS__?.contract?.secureWave,
    );
    expect(secureWave).toBe(20);

    await card.screenshot({
      path: `reviews/shots-e1-secure-wave-truth/${testInfo.project.name}-${map.id}.png`,
    });
    expect(errors).toEqual([]);
  });
}
