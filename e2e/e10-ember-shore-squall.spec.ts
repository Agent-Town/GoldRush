import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * E10S-2 — THE STATIC SQUALL, in the browser (`specs/agent-play/e10-ember-shore-preserve.md` §3,
 * §4). Two claims, in the order a player meets them:
 *
 *   1. THE PLAIN BOOT (no `?debug`, Mistake #10): a player who clicks the Ember Shore on the board
 *      arrives on the Ember Shore — not on The Claim — and the squall clock is ALREADY RUNNING
 *      when he gets there, with the wash layer mounted and waiting. Measured at both viewports,
 *      with zero console and page errors. This is the half no flag can buy: `e10-ember-shore`
 *      declares `harvestAnchors: []`, and until the F-E10L-1 cure it fell back to The Claim in 12
 *      of 12 smoke cells, so "the map opened at all" is a real assertion here rather than a
 *      formality.
 *   2. THE CLOCK ITSELF: the browser changes phase on exactly the ticks
 *      `scripts/e10-squall-scheduler.test.mjs` pins for `HeadlessContractSim` — 1801, 2041, 2791,
 *      3031 — and the wash and the mix duck follow the phase. Two engines, one table.
 *
 * WHY (2) CARRIES `?debug` AND (1) DOES NOT. The debug flag buys the SIM CLOCK
 * (`setManualSim`/`advanceSim`), not the mechanic: the scheduler runs in the ordinary update on
 * the ordinary fixed step either way, which is exactly what (1) proves by watching the tick
 * advance under no flag at all. Without the clock this spec would have to spend 101 real seconds
 * per cycle.
 *
 * NOTHING HERE ASSERTS WARMTH, STOKE OR LOSS. They are E10S-3's, and a spec that reached for them
 * would be asserting a mechanic this slice deliberately did not build.
 */

const CONTRACT_ID = 'e10-ember-shore';
const DEBUG_QUERY = `/?contract=${CONTRACT_ID}&nolevel&nopause&seed=squall01&debug`;

/**
 * THE PHASE TABLE, transcribed from `scripts/e10-squall-scheduler.test.mjs` rather than
 * re-derived. Each tick is one fixed step after its authored boundary (60 / 68 / 93 / 101s at
 * 30 ticks per second) because the scheduler counts its tick before it reads its phase. If this
 * table and the guard's ever disagree, the two engines have split — which is the whole point.
 */
const EXPECTED_TRANSITIONS = [
  { from: null, to: 'calm', tick: 0 },
  { from: 'calm', to: 'telegraph', tick: 1801 },
  { from: 'telegraph', to: 'squall', tick: 2041 },
  { from: 'squall', to: 'recover', tick: 2791 },
  { from: 'recover', to: 'calm', tick: 3031 },
];

test.setTimeout(240_000);

test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `e10-ember-shore-squall-${testInfo.testId}`));

const squall = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.squall);
const wash = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.squallPresentation);

async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({ path: `artifacts/e10s-2-squall/shots/${testInfo.project.name}-${name}.png`, scale: 'css' });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

/**
 * THE PLAYER'S OWN DOOR, WITHOUT `?debug`. `e10-ember-shore`'s board row is `unlock: "default"`,
 * so the honest way in is the launch key the board itself writes — no harness, no flag, no private
 * handle. The map is reachable at all only because it declares `twist.harvestFreeObjective`
 * (F-E10L-1); a regression there lands here as a fallback to The Claim.
 */
async function bootPlainFromTheBoard(page: Page): Promise<void> {
  await page.goto('/?nolevel&nopause');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  await page.evaluate(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-10-deepsky');
    sessionStorage.setItem('gr.contract.launch.v1', 'e10-ember-shore');
  });
  await page.goto(`/?contract=${CONTRACT_ID}&nolevel&nopause&seed=squall01`);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
}

test('E10S-2 plain boot: the Ember Shore opens as itself and its squall clock is already running', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await bootPlainFromTheBoard(page);
  await dismissBriefing(page);

  // The map the player clicked, not the fallback. `fallbackReason` is the F-E10L-1 tell.
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  expect(contract.activeId).toBe(CONTRACT_ID);
  expect(contract.fallbackReason).toBeNull();

  const declared = await squall(page);
  expect(declared).not.toBeNull();
  expect(declared!.declared).toBe(true);
  expect({
    calmSeconds: declared!.calmSeconds,
    telegraphSeconds: declared!.telegraphSeconds,
    squallSeconds: declared!.squallSeconds,
    recoverSeconds: declared!.recoverSeconds,
    cycleSeconds: declared!.cycleSeconds,
  }).toEqual({ calmSeconds: 60, telegraphSeconds: 8, squallSeconds: 25, recoverSeconds: 8, cycleSeconds: 101 });
  expect(declared!.phase).toBe('calm');
  expect(declared!.motePressureMultiplier).toBe(2);

  // WHAT THE PLAYER HAS, with no flag at all: a mounted wash layer, clear while the shore is calm.
  const painted = await wash(page);
  expect(painted).not.toBeNull();
  expect(painted!.mounted).toBe(true);
  expect(painted!.intensity).toBe(0);
  expect(painted!.gain).toBe(1);
  await expect(page.getByTestId('e10-squall-wash')).toHaveCount(1);

  // THE CLOCK IS LIVE UNDER NO FLAG. Three real seconds is ~90 fixed steps; the assertion is loose
  // on the count (a browser may drop frames) and exact on the DIRECTION, which is what "running"
  // means. Without this the plain boot would only prove the clock EXISTS.
  const before = declared!;
  await page.waitForTimeout(3_000);
  const after = await squall(page);
  expect(after!.tick).toBeGreaterThan(before.tick);
  expect(after!.elapsedSeconds).toBeGreaterThan(before.elapsedSeconds);
  expect(after!.secondsToNextSquall).toBeLessThan(before.secondsToNextSquall);
  expect(after!.phase).toBe('calm');

  await shoot(page, testInfo, 'plain-boot-calm');
  expectNoConsoleErrors(watch, 'e10-ember-shore plain boot');
});

test('E10S-2 the clock: the browser changes phase on the same ticks the headless engine does', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await page.goto(DEBUG_QUERY);
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await dismissBriefing(page);

  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    // This spec measures the CLOCK, not the hero's survival: a run that ends at wave 4 stops the
    // sim and would red this as a phase failure instead of the roster failure it is.
    harness.setBalance('enemy.contactDamage', 0);
    // RE-POINTED BY E10S-3, WITH THE REASON. Since the preserve consumer landed, an unstoked vent
    // reaches zero on the squall's LAST tick (2790) and ENDS the run — which stopped this spec's
    // clock one transition short of `recover` and two short of the cycle closing. The vent is now
    // a second way for a clock spec to die, so it is answered the same way the roster was: with
    // the run's own purse and the map's own verb, inside the loop below. This buys the ECONOMY the
    // Ember Shore has not been authored yet (`harvestAnchors: []` until E10S-4, F-E10S3-1), not
    // the mechanic — `e2e/e10-ember-shore-preserve.spec.ts` is where the vent itself is measured.
    harness.grantGold(400);
  });

  const start = await squall(page);
  expect(start!.phase).toBe('calm');
  // A handful of fixed steps may have run between boot and the manual takeover; both are the same
  // 1/30s step, so the transition ticks below are unaffected — but say so rather than assume it.
  expect(start!.tick).toBeLessThan(1_801);

  let sawSquallWash = false;
  let duckedGain = 1;
  for (let round = 0; round < 60; round += 1) {
    const state = await squall(page);
    if (state!.phase === 'squall' && !sawSquallWash) {
      const painted = await wash(page);
      expect(painted!.intensity).toBe(1);
      expect(painted!.washOpacity).toBeCloseTo(0.34, 3);
      expect(painted!.desaturation).toBeCloseTo(0.55, 3);
      duckedGain = painted!.gain;
      sawSquallWash = true;
      await shoot(page, testInfo, 'squall-blowing');
    }
    if (state!.transitions.length >= EXPECTED_TRANSITIONS.length) break;
    // E10S-3: keep the vent alight so the CLOCK can finish its cycle. Stoking on the way down is
    // exactly the play the map asks of a player; a clock spec should not be the thing that proves
    // the vent can be kept, so it simply refuses to be killed by it.
    await page.evaluate(() => {
      const vent = window.__GR_TEST__!.vent;
      if (vent.diagnostics().declared && vent.diagnostics().warmth < 60) vent.stoke();
    });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(4));
  }

  const end = await squall(page);
  expect(end!.transitions.map(({ from, to, tick }) => ({ from, to, tick }))).toEqual(EXPECTED_TRANSITIONS);
  expect(end!.squallsStarted).toBe(1);
  expect(end!.squallsCompleted).toBe(1);
  expect(end!.phase).toBe('calm');

  // THE DUCK IS REAL, not a number in a report: the wash's gain is what `syncAudioLoops`
  // multiplies into every ambience loop, so a squall a player cannot hear over is a bug.
  expect(sawSquallWash).toBe(true);
  expect(duckedGain).toBeCloseTo(0.55, 3);

  // …and it is back: nothing stays ducked or washed once the cycle closes.
  const cleared = await wash(page);
  expect(cleared!.intensity).toBe(0);
  expect(cleared!.gain).toBe(1);
  await shoot(page, testInfo, 'cycle-closed-calm');

  expectNoConsoleErrors(watch, 'e10-ember-shore squall clock');
});
