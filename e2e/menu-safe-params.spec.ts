import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY } from '../src/game/ProfileStorage';

/**
 * Owner hit /?town3dPilot=all → launched straight into The Claim: the boot router
 * treated ANY query as a contract launch. Pilot/visual flags must land on the menu.
 *
 * RE-PINNED by the s2675 fire for F-UX1-5 and F-UX1-1 (`reviews/ux-entry-robustness-1.md`), after
 * UX-1 inverted the router to a run-route allowlist. Two measured facts decide every assertion
 * below, and neither is assumed:
 *
 *  1. ON A FRESH STORE THE START MENU RENDERS ITS NAMING FORM, and that form carries no
 *     `start-menu-enter-town` button. So the old `toBeVisible()` on that button went red for a
 *     reason with nothing to do with routing (F-UX1-5: red on clean main both projects since the
 *     first-boot beat `9336b269c`), and the old `toHaveCount(0)` on it PASSED whether a run
 *     launched or the menu appeared — the vacuity F-UX1-1 named. The menu's own container
 *     `start-menu` is the honest subject for "no menu": the naming form is INSIDE it, so count 0
 *     means no menu of any kind rendered. `?town3dPilot=all` is asserted on BOTH store states,
 *     because the routing rule and the pilot flag answer to different ones.
 *
 *  2. A `?contract=` LAUNCHES A RUN ONLY ON DURABLE PROOF — a staged launch, `?debug`, an
 *     onboarded store, or a suspend naming that same contract (`contractParamNamesARun`,
 *     `src/main.ts`). The staged marker is the one a board click leaves, so it is the one this
 *     file pins, on a FRESH store: that keeps the arm distinct from `entry-params.spec.ts`, which
 *     pins the staged launch on an ONBOARDED store.
 */

/** An onboarded store, so a test about routing is not stopped by the naming form. */
async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(
      profileKey,
      JSON.stringify({
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      }),
    );
  }, PROFILE_KEY);
}

test('?town3dPilot=all boots the start menu on a fresh store, not a run', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?town3dPilot=all');

  // The menu, exactly as `/` renders it for a first-time player: its naming form, and no run.
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('profile-title')).toContainText("Who's prospecting?");
  expect(errors).toEqual([]);
});

test('?town3dPilot=all keeps the pilot flag when an onboarded player enters town', async ({ page }) => {
  // The other half of the owner's incident: landing on the menu must not cost the flag its effect.
  // An onboarded store is what puts the menu's own `enter-town` button on screen at all (fact 1).
  await seedProfile(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?town3dPilot=all');

  await expect(page.getByTestId('start-menu-enter-town')).toBeVisible();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect
    .poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.town3dPilotState), { timeout: 30_000 })
    .not.toBe('off');
  expect(errors).toEqual([]);
});

test('a staged contract launch still launches the run path', async ({ page }) => {
  // Fresh store, so the ONLY proof of a launch is the staged marker a board click leaves. Without
  // it this URL is a share link and the naming form renders — which is what makes `start-menu`
  // count 0 a real assertion here, and the frame counter its positive half.
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'the-claim'));
  await page.goto('/?contract=the-claim');

  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5, undefined, { timeout: 60_000 });
});
