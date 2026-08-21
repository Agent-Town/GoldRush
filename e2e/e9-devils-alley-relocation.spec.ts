import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * A9 — THE WIND REPLANS, in the browser (`specs/agent-play/door-completion-sheet.md:24`,
 * RATIFIED 2026-08-20). Two claims, in the order a player meets them:
 *
 *   1. THE PLAIN BOOT (no `?debug`, Mistake #10): a player who has secured the Seed Run can open
 *      Devil's Alley from the board, and what he SEES on arrival is the three anchor holds drawn
 *      on the ground — because a rider cannot choose safe ground it cannot see. Measured at both
 *      viewports, with zero console and page errors.
 *   2. THE WIND ITSELF: a work standing inside the centre corridor and OUTSIDE the anchor's hold
 *      is lifted by the centre sweep, carried, and set down at the sweep's authored end point
 *      ALIVE; a work inside the hold in the same corridor is never touched. The column is
 *      visible while it carries, which is the "played for laughs" half made watchable.
 *
 * WHY (2) CARRIES `?debug` AND (1) DOES NOT. The debug flag here buys the SIM CLOCK
 * (`setManualSim`/`advanceSim`) and a free placement, not the mechanic: the sweep runs in the
 * ordinary update on the ordinary wave counter, exactly as `HeadlessContractSim` runs it. What no
 * flag can buy is a board row a player has not unlocked, which is why (1) measures the real door.
 */

const CONTRACT_ID = 'e9-devils-alley';
const DEBUG_QUERY = `/?contract=${CONTRACT_ID}&nolevel&nopause&seed=da01&debug`;

/** Inside `center-anchor-bay` (x -10..10, z -8..8) and inside the centre sweep (z -8..8) … */
const EXPOSED_PAD = { x: 9, z: 0 };
/**
 * … and inside the SAME column reach, but inside `anchor-center`'s 8wu hold. z = 3 is deliberate:
 * the column's radius is 4, so a pad at z = 6 would never be a candidate at all and the run would
 * report zero anchored refusals for the boring reason instead of the interesting one.
 */
const SHELTERED_PAD = { x: 0, z: 3 };
/** The authored end point of `center-devil-sweep` (`lanes.patrolRoutes`, east -> west). */
const CENTRE_DROP_X = -52;

test.setTimeout(240_000);

test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `e9-devils-alley-${testInfo.testId}`));

const wind = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.devilsAlley);
const shown = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.devilsAlleyPresentation);
const turrets = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.turretPositions);
const beacons = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.beaconPositions);

async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({ path: `artifacts/e9-devils-alley/shots/${testInfo.project.name}-${name}.png` });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

/**
 * THE PLAIN-BOOT DOOR, WITHOUT `?debug`. `e9-devils-alley`'s board row is
 * `unlock: "secured:e9-seed-run"`, so the honest way in is to BE a player who has secured the
 * Seed Run: one scoreboard row and one active-epoch key, written through the app's own
 * profile-scoped storage. No harness, no flag, no private handle.
 */
async function bootPlainAsUnlockedPlayer(page: Page): Promise<void> {
  await page.goto('/?nolevel&nopause');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  await page.evaluate(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-9-redfields');
    localStorage.setItem('gr.scores.v2', JSON.stringify([{
      waves: 20, kills: 900, gold: 200, timeAlive: 600, at: 1, secured: true, contractId: 'e9-seed-run',
    }]));
    sessionStorage.setItem('gr.contract.launch.v1', 'e9-devils-alley');
  });
  await page.goto(`/?contract=${CONTRACT_ID}&nolevel&nopause&seed=da01`);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

test('A9 plain boot: the alley opens from the board and the anchor holds are drawn', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await bootPlainAsUnlockedPlayer(page);
  await dismissBriefing(page);

  const declared = await wind(page);
  expect(declared).not.toBeNull();
  expect(declared!.declared).toBe(true);
  expect(declared!.routes.map(({ id }) => id)).toEqual([
    'south-devil-sweep', 'center-devil-sweep', 'north-devil-sweep',
  ]);
  // The hold is DERIVED from the bay it is inscribed in, not authored — all three bays are 20x16.
  expect(declared!.anchors.map(({ id, holdRadius }) => [id, holdRadius])).toEqual([
    ['anchor-west', 8], ['anchor-center', 8], ['anchor-east', 8],
  ]);

  // WHAT THE PLAYER SEES, with no flag at all: one ring per anchor, on the ground, always.
  const presentation = await shown(page);
  expect(presentation).not.toBeNull();
  expect(presentation!.anchorRings).toBe(3);

  await shoot(page, testInfo, 'plain-boot');
  expectNoConsoleErrors(watch, 'e9-devils-alley plain boot');
});

test('A9 the wind: an unanchored work is carried to the sweep end and set down alive', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto(DEBUG_QUERY);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await dismissBriefing(page);

  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    // This spec measures the WIND, not the hero's survival or a drone's appetite for timber.
    harness.setBalance('enemy.contactDamage', 0);
  });

  const placed = await page.evaluate(([exposed, sheltered]) => [
    window.__GR_TEST__!.placeFree('turret', exposed.x, exposed.z),
    window.__GR_TEST__!.placeFree('sentry_beacon', sheltered.x, sheltered.z),
  ], [EXPOSED_PAD, SHELTERED_PAD] as const);
  expect(placed).toEqual([true, true]);
  expect(await turrets(page)).toEqual([{ x: EXPOSED_PAD.x, z: EXPOSED_PAD.z }]);

  // One step, so the consumer has seen the new works: under manual sim the ordinary update runs
  // only when `advanceSim` says so, and the per-building anchored table is rebuilt from the live
  // register on each tick rather than kept as a subscription.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));

  // BOTH are legal placements inside the same bay and the same corridor; only one is held.
  const before = await wind(page);
  expect(before!.works).toEqual([
    { family: 'sentry_beacon', index: 0, anchored: true, carried: false },
    { family: 'turret', index: 0, anchored: false, carried: false },
  ]);

  // Advance in chunks until the CENTRE sweep (wave 2's route) has lifted it. Wave 1 sweeps the
  // south corridor at z -26, which is 26 world units from anything placed above.
  let sawColumn = false;
  let sawCarry = false;
  for (let elapsed = 0; elapsed < 220; elapsed += 2) {
    const state = await wind(page);
    if (state && state.carried.length > 0) {
      sawCarry = true;
      const drawn = await shown(page);
      if (drawn?.columnVisible) sawColumn = true;
    }
    if (state && state.relocations > 0) break;
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  }

  const after = await wind(page);
  expect(after!.relocations).toBeGreaterThan(0);
  expect(after!.lastRelocation).toMatchObject({
    family: 'turret',
    index: 0,
    routeId: 'center-devil-sweep',
    from: { x: EXPOSED_PAD.x, z: EXPOSED_PAD.z },
  });
  expect(after!.lastRelocation!.to.x).toBe(CENTRE_DROP_X);
  // THE ANCHOR HELD, and the run counted every time the wind was refused by it.
  expect(after!.refusals.anchored).toBeGreaterThan(0);
  expect(sawCarry).toBe(true);
  expect(sawColumn).toBe(true);

  // The turret is somewhere else and STILL STANDING — relocation never damages (ratified).
  const movedTurrets = await turrets(page);
  expect(movedTurrets).toHaveLength(1);
  expect(Math.round(movedTurrets[0]!.x)).toBe(CENTRE_DROP_X);
  // The sheltered beacon never left the hold.
  expect(await beacons(page)).toEqual([{ x: SHELTERED_PAD.x, z: SHELTERED_PAD.z }]);
  // …and it is back online: nothing stays suspended by a sweep that ended.
  expect((await wind(page))!.carried).toEqual([]);

  expectNoConsoleErrors(watch, 'e9-devils-alley wind');
});
