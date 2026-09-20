import { expect, test } from '@playwright/test';

/**
 * PLAIN-BOOT PROBE for the E2 pressure-arsenal socket (2026-08-20). Not part of the standing suite —
 * it is drain evidence, kept beside the prover it belongs to. Two boots per project: the default
 * claim (which must be untouched by this slice) and `?contract=e2-hill-mine`, the contract that left
 * the exemption table. No `?debug`: the question is what a PLAYER sees on a plain boot (Mistake #10).
 */
for (const [label, query] of [['default claim', ''], ['hill mine', '?contract=e2-hill-mine']] as const) {
  test(`plain boot is clean — ${label}`, async ({ page }) => {
    test.setTimeout(90_000);
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') problems.push(`${message.type()}: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
    await page.goto(`/${query}`);
    await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(4_000);
    expect(problems).toEqual([]);
  });
}
