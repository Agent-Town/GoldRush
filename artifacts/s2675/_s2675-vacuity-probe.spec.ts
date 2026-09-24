import { expect, test } from '@playwright/test';

/**
 * s2675 SENSITIVITY CONTROL for F-UX1-1 — EVIDENCE, not a suite member. Kept out of the merge and
 * copied to `artifacts/s2675/` instead, because it asserts a defect's shape rather than a product
 * rule, and a suite row that passes when the product breaks is the very thing F-UX1-1 named.
 *
 * THE CLAIM UNDER TEST: `expect(getByTestId('start-menu-enter-town')).toHaveCount(0)` — the old
 * `:18` assertion, kept verbatim by the report's proposed four-line cure — cannot tell a launched
 * run from the start menu, while `start-menu` count 0 can. Both halves are measured HERE on the one
 * state that discriminates them: a fresh store with NO staged launch, where the router is SUPPOSED
 * to show the menu. If this test is green, then on that state:
 *   · `start-menu` IS visible          → `toHaveCount(0)` on it would RED. The new assertion has teeth.
 *   · `start-menu-enter-town` is absent → `toHaveCount(0)` on it PASSES. The old assertion is blind,
 *     and pasting the report's cure would have carried the vacuity forward under a new name.
 */
test('a fresh ?contract= with no staged launch shows the menu, and only `start-menu` can see it', async ({ page }) => {
  await page.goto('/?contract=the-claim');

  // The naming form, inside the menu container: this is the state the old assertion could not see.
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('profile-title')).toContainText("Who's prospecting?");

  // The old assertion's subject, on a tree where NO run launched: absent, so the old row passed.
  await expect(page.getByTestId('start-menu-enter-town')).toHaveCount(0);
});
