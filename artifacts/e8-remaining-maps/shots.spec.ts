import { expect, test } from '@playwright/test';

/**
 * WHERE THE PLAYER SEES THIS, IN A PLAIN BOOT (Mistake #10), and the honest answer for this slice.
 *
 * The player sees NOTHING NEW, and that is stated rather than hidden: the browser composes no
 * atmosphere consumer at all (the same limit `reviews/e8-mare-claim-physics.md` recorded as
 * F-E8MC-5), so the suit, the shelters and the shadow bind the DOOR's riders first. These shots
 * exist to prove the other half of the claim: that the three maps still boot clean and unchanged
 * for a human, desktop and 390px, with no console or page errors.
 */
const MAPS = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse'] as const;

for (const contract of MAPS) {
  test(`${contract} boots clean for a player with no debug harness`, async ({ page }, testInfo) => {
    const problems: string[] = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));
    await page.goto(`/?contract=${contract}`);
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(6_000);
    await page.screenshot({ path: `artifacts/e8-remaining-maps/shots/${contract}-${testInfo.project.name}.png` });
    // The test seam stays behind `?debug`, and the era is live for a plain player all the same.
    expect(await page.evaluate(() => window.__GR_TEST__ === undefined)).toBe(true);
    expect(problems).toEqual([]);
  });
}
