import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * A8 — THE SEED RUN, in the browser (`specs/agent-play/door-completion-sheet.md:22`, RATIFIED
 * 2026-08-20). Three claims, in the order a player meets them:
 *
 *   1. THE REACH (no `?debug`, Mistake #10): what a real player gets today is The Claim, because
 *      the Seed Run's board row sits behind `secured:e9-dome-basin`. Measured here rather than
 *      assumed, together with the fact that the consumer is correctly ABSENT off its contract and
 *      that nothing is written to a profile by trying (Mistake #7).
 *   2. THE TRADE: standing at a stake while the train stands at the same ground, the ordinary
 *      confirm key plants a vault. The guard drops by the ratified quarter, and NOTHING is
 *      persisted mid-run.
 *   3. THE PERSISTENCE LAW: the write lands at run END and takes effect at the NEXT tile birth —
 *      a permanent no-spawn green, on this profile, on this map, for every run after — plus the
 *      crossing itself, and the authored shape of the road it walks.
 *
 * WHY (2) AND (3) CARRY `?debug` AND (1) DOES NOT. The debug flag here buys the SIM CLOCK
 * (`setManualSim`/`advanceSim`), not the mechanic: the plant runs through `confirmAction`, the
 * same ungated context-action chain that funds a megaproject, and the caravan ticks in the
 * ordinary update. What no flag can buy is a locked board row, which is why (1) measures the
 * refusal instead of pretending past it.
 *
 * THIS IS WHERE A8's PERSISTENCE IS PROVEN AT ALL. `HeadlessContractSim` deliberately hands the
 * caravan a fresh EMPTY tile store so no bench run can inherit a plant, so the headless engine
 * cannot demonstrate the round trip even in principle. The browser can, and does, here.
 *
 * The dry-gulch rehearsal (`e2e/tp02-green-waypoint.spec.ts`) is untouched and still passes: it
 * plants the BARE `green-waypoint` entry id, while this map plants `green-waypoint:<ground>`.
 */

const DEBUG_QUERY = '/?contract=e9-seed-run&nolevel&nopause&seed=sr01&debug';
const CONTRACT_ID = 'e9-seed-run';
const CENTER_GROUND = 'plant-center-waypoint';
const CENTER_STAKE = { x: 0, z: 3 };
const CENTER_ENTRY_ID = 'green-waypoint:plant-center-waypoint';
const GREEN_RADIUS = 3;
const PLANT_COST_HP = 60;
const CARAVAN_MAX_HP = 240;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(240_000);

/**
 * The storage wipe runs ONCE per test, not once per navigation. `addInitScript` fires on every
 * load including `reload()`, so an unguarded `localStorage.clear()` here would erase the very
 * write the persistence test exists to observe. Same sessionStorage latch TP-02 uses.
 */
test.beforeEach(async ({ page }, testInfo) => page.addInitScript((key) => {
  if (!sessionStorage.getItem(key)) {
    localStorage.clear();
    sessionStorage.setItem(key, '1');
  }
}, `e9-seed-run-${testInfo.testId}`));

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function waitForBoot(page: Page, debug: boolean): Promise<void> {
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  if (debug) await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

/** Manual sim + no contact damage: this spec measures the CARAVAN, not the hero's survival. */
async function takeManualControl(page: Page): Promise<void> {
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('enemy.contactDamage', 0);
  });
}

const caravan = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.seedCaravan);
const persistence = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tilePersistence);
const presentation = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.seedCaravanPresentation);

/**
 * A8-LEGIBILITY: the plain-boot door into the Seed Run, WITHOUT `?debug`.
 *
 * The owner's complaint of 2026-08-20 is about what a player sees, so the proof has to run where a
 * player runs. `activeContractSelection` (`ContractFamilies.ts:1322`) honours `?contract=` with no
 * debug flag whenever the id is a STAGED PLAYER LAUNCH, and `reverifyStagedContractLaunch` keeps
 * that launch only while the row is unlocked — so the honest way in is to be a player who has
 * already secured Dome Basin. That is one scoreboard row, written through the app's own
 * profile-scoped storage (`ProfileStorage.installProfileStorageScope` patches `setItem`), and
 * nothing else: no harness, no flag, no private handle.
 */
async function bootPlainAsUnlockedPlayer(page: Page): Promise<void> {
  await page.goto('/?nolevel&nopause');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  await page.evaluate(() => {
    // The two things a player who reached this row actually has: he is IN the Red Fields era
    // (`epochIsActive`, `ContractFamilies.ts:1111`) and he has SECURED Dome Basin
    // (`contractUnlockStatus`'s `secured:` branch, `ContractUnlock.ts:57`). Both are ordinary
    // profile data, written through the app's own patched storage.
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-9-redfields');
    localStorage.setItem('gr.scores.v2', JSON.stringify([{
      waves: 20, kills: 400, gold: 500, timeAlive: 600, at: 1, secured: true, contractId: 'e9-dome-basin',
    }]));
    sessionStorage.setItem('gr.contract.launch.v1', 'e9-seed-run');
  });
  await page.goto('/?contract=e9-seed-run&nolevel&nopause&seed=sr01');
  await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
}

/**
 * Advance in chunks until the predicate holds. `advanceSim` is SYNCHRONOUS, so polling a
 * diagnostic after a single call can only ever see one instant — the clock does not move on its
 * own under manual sim, and a poll that waits for it would hang until the timeout.
 */
async function advanceUntil(page: Page, predicate: (state: NonNullable<Awaited<ReturnType<typeof caravan>>>) => boolean, budgetSeconds = 320): Promise<void> {
  for (let elapsed = 0; elapsed < budgetSeconds; elapsed += 5) {
    const state = await caravan(page);
    if (state && predicate(state)) return;
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(5));
  }
  throw new Error(`caravan never reached the expected state within ${budgetSeconds}s of sim time`);
}

async function tileStateSnapshot(page: Page): Promise<string | null> {
  return page.evaluate(async (contractId) => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    return localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
  }, CONTRACT_ID);
}

/**
 * Evidence that survives the run (Convention 1): the shot lands in `artifacts/e9-seed-run/shots/`
 * under its project name AND is attached to the report, so a reviewer who never opens the trace
 * can still see exactly what a stranger saw at 1280x800 and at 390px.
 */
async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const body = await page.screenshot({
    path: `artifacts/e9-seed-run/shots/${testInfo.project.name}-${name}.png`,
  });
  await testInfo.attach(name, { body, contentType: 'image/png' });
}

/** The ordinary context action — Space, the same key that funds a megaproject or frees a machine. */
async function pressConfirm(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
  });
  // One frame, so the intent edge is consumed before the next assertion reads diagnostics.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
}

test('the board refuses the Seed Run until Dome Basin is secured — the reach, measured', async ({ page }) => {
  const errors = collectErrors(page);
  // NO `?debug` ANYWHERE HERE, which is the point: this is what a real player gets today.
  //
  // `reverifyStagedContractLaunch` (`ContractUnlock.ts:77`) clears a staged launch whose contract
  // is locked, and the Seed Run's row is `unlock: "secured:e9-dome-basin"`. So the honest answer
  // to "where does the PLAYER see this in a plain boot?" (Mistake #10) has two halves, and this is
  // the half that is true right now: the row is BEHIND Dome Basin, and a launch aimed at it lands
  // back on The Claim. Dome Basin is itself admitted and playable, so the gate is a progression
  // step rather than a dead end — filed as F-A8-5 with its own measurement rather than asserted.
  await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'e9-seed-run'));
  await page.goto('/?contract=e9-seed-run&nolevel&nopause&seed=sr01');
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('the-claim');
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Claim');
  // The consumer is correctly ABSENT where the contract is: no twist, no caravan, no leaked field.
  expect(await caravan(page)).toBeNull();
  // And nothing was written to a profile by trying (Mistake #7).
  expect(await tileStateSnapshot(page)).toBeNull();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('planting at the stake spends the guard, lands at run end, and is born as a green next run', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await takeManualControl(page);

  // Walk the train to the centre ground on its own fixed schedule and stop inside the window.
  await advanceUntil(page, (state) => state.atGround === CENTER_GROUND);
  expect((await caravan(page))!.state).toBe('paused');
  // A8-LEGIBILITY: this is the frame the owner never got — the train standing nine wu from the
  // claim, named, guard-barred, on its drawn road, with the county's halt line on the banner. The
  // shot is kept because "the box was grey and nobody knew what it was" is a VISUAL complaint and
  // a visual claim needs a visual receipt.
  await shoot(page, testInfo, 'at-center-ground');
  expect(await presentation(page)).toMatchObject({ tagVisible: true, guardBarVisible: true, guardRatio: 1 });

  // OUT OF REACH IS REFUSED, and the refusal is counted rather than swallowed. The hero starts at
  // (0,12), nine wu from the stake — close enough to see it, too far to plant it.
  await pressConfirm(page);
  expect((await caravan(page))!.refusals.outOfReach).toBeGreaterThan(0);
  expect((await caravan(page))!.plantedThisRun).toEqual([]);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  await pressConfirm(page);
  expect((await caravan(page))!.plantedThisRun).toEqual([CENTER_GROUND]);

  // THE COST: the ratified quarter, off both the pool and the ceiling.
  const spent = await caravan(page);
  expect(spent!.maxHp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);
  expect(spent!.hp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);

  // A8-LEGIBILITY: the county names the vault, and the guard bar reads FULL again at the new,
  // lower ceiling — the trade is "a smaller train", not "a wounded one".
  expect((await presentation(page))!.beatsSaid).toContain('plant:plant-center-waypoint');
  expect((await presentation(page))!.guardRatio).toBe(1);

  // ONE PER GROUND, for the life of the profile.
  await pressConfirm(page);
  expect((await caravan(page))!.refusals.alreadyHeld).toBeGreaterThan(0);
  expect((await caravan(page))!.plantedThisRun).toEqual([CENTER_GROUND]);

  // WRITE-AT-END: staged only. Nothing on disk, and this run's spawn rules are untouched.
  expect(await tileStateSnapshot(page)).toBeNull();
  expect((await persistence(page)).noSpawnZones).toEqual([]);

  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const written = await tileStateSnapshot(page);
  expect(written).not.toBeNull();
  expect(JSON.parse(written!)).toEqual({
    schemaVersion: 1,
    entries: [{
      kind: 'sim',
      id: CENTER_ENTRY_ID,
      payload: { x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS },
      schemaVersion: 1,
    }],
  });

  // NEXT BIRTH: the green is in the tile's own parameters and mounted as a swatch.
  await page.reload();
  await waitForBoot(page, true);
  expect(await persistence(page)).toMatchObject({
    entries: 1,
    greenWaypoint: { x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS },
    greenWaypoints: [{ x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS }],
    noSpawnZones: [{ x: CENTER_STAKE.x, z: CENTER_STAKE.z, radius: GREEN_RADIUS }],
  });
  expect((await caravan(page))!.plantedBefore).toEqual([CENTER_GROUND]);

  // And the ground it holds refuses a second vault forever.
  await takeManualControl(page);
  await advanceUntil(page, (state) => state.atGround === CENTER_GROUND);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  await pressConfirm(page);
  expect((await caravan(page))!.refusals.alreadyHeld).toBeGreaterThan(0);
  expect((await caravan(page))!.plantedThisRun).toEqual([]);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('the caravan reaching the basin is what latches the objective', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await takeManualControl(page);

  // The whole crossing: four legs at 1.6 wu/s plus three 40-second dwells, ~224s of sim.
  await advanceUntil(page, (state) => state.arrived);
  const landed = await caravan(page);
  expect(landed).toMatchObject({ state: 'arrived', arrived: true, progress: 1, atGround: null });
  // THE SHAPE OF THE THING, asserted where the map actually boots. The route is the five authored
  // buildZone centres in authored order - the same five points the mask table publishes as
  // `caravanRoute` and `scripts/e3-mask-tables.test.mjs:352` already pins - and the grounds are the
  // three authored stakes matched to the zones that contain them. Nothing here is a constant in
  // the consumer; all of it is contract data read back out.
  expect(landed!.route).toEqual([
    { x: 0, z: -48 }, { x: -34, z: -21 }, { x: 0, z: 3 }, { x: 34, z: 27 }, { x: 0, z: 48 },
  ]);
  expect(landed!.grounds.map(({ id, zoneId }) => `${id}/${zoneId}`)).toEqual([
    'plant-west-waypoint/west-green-waypoint',
    'plant-center-waypoint/center-green-waypoint',
    'plant-east-waypoint/east-green-waypoint',
  ]);
  expect(landed!.position).toEqual({ x: 0, z: 48 });
  // Arriving with no plant costs nothing: an empty road takes nothing off the guard.
  expect(landed!.maxHp).toBe(CARAVAN_MAX_HP);
  expect(landed!.plantedThisRun).toEqual([]);

  // A landed train persists nothing by landing — only planting writes.
  expect(await tileStateSnapshot(page)).toBeNull();

  // A8-LEGIBILITY: the county said the crossing was made, and the presentation followed the train
  // the whole way. `beatsSaid` is the render-side ledger of what a player was TOLD.
  expect((await presentation(page))!.beatsSaid).toContain('depart');
  expect((await presentation(page))!.beatsSaid).toContain('arrive');
  expect((await presentation(page))!.beatsSaid).toContain('halt:plant-west-waypoint');
  expect((await presentation(page))!.beatsSaid).toContain('halt:plant-center-waypoint');
  expect((await presentation(page))!.beatsSaid).toContain('halt:plant-east-waypoint');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

/**
 * THE OWNER'S OWN TEST, and it is deliberately the harshest one in this file: a stranger boots the
 * map with NO flags and must be able to answer "what is the mission?" from the screen.
 *
 * Owner, 2026-08-20, verbatim: "I was not even aware that there is a caravan to protect or when it
 * moves where. This has to be better explained. I saw a small grey box moving at one point in
 * time, but I was not aware that this is the mission."
 *
 * So this asserts the four surfaces that answer him, in the order he would meet them: the briefing
 * card LEADS with the escort, the box carries its name, it carries a guard bar, and its road is
 * drawn on the ground with a ring on every ground it stops at.
 */
test('a plain boot tells a stranger the caravan IS the mission', async ({ page }, testInfo) => {
  // THE HOUSE WATCH, not this file's own bucket, and for a measured reason: this is the only test
  // here that boots the Seed Run's full landmark set on a shared dev server, so it is the only one
  // that meets the load-sensitive texture-blob transient (F-1304-1 / F-1180-2). `watchErrors`
  // tolerates EXACTLY that one string and nothing else — every other console or page error still
  // fails the test, and the count of what was tolerated is printed.
  const watch = watchErrors(page);
  await bootPlainAsUnlockedPlayer(page);

  // 1. THE BRIEFING LEADS WITH THE ESCORT. Not "cross from the yard to the approach" — escort.
  await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Seed Run');
  const goals = await page.getByTestId('contract-briefing-goals').locator('li').allTextContents();
  expect(goals[0]).toContain('Escort the seed-vault caravan');
  expect(goals[0]).toContain('the crossing is the contract');
  await expect(page.getByTestId('contract-briefing-geography')).toContainText('seed-vault caravan');
  const rules = await page.getByTestId('contract-briefing-rules').locator('li').allTextContents();
  expect(rules.join(' ')).toContain('halts forty seconds at each waypoint ground');
  await shoot(page, testInfo, 'briefing');

  // 2. THE THING ITSELF IS NAMED, GUARDED AND ROADED — with no `?debug` anywhere.
  const shown = await presentation(page);
  expect(shown).not.toBeNull();
  expect(shown).toMatchObject({
    tagVisible: true,
    tagText: 'Seed Caravan',
    guardBarVisible: true,
    guardRatio: 1,
  });
  expect(shown!.roadRuts).toBeGreaterThan(40);
  // Three planting grounds plus the basin the road ends at.
  expect(shown!.waypointRings).toBe(4);

  // 3. THE COUNTY SAYS IT ROLLS — after the briefing card lifts, never behind it.
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.seedCaravanPresentation?.beatsSaid.includes('depart') === true,
    undefined,
    { timeout: 30_000 },
  );
  await expect(page.locator('[data-hud-wave-title]')).toHaveText('THE SEED RUN');
  await expect(page.locator('[data-hud-wave]')).toHaveText('The seed caravan rolls; see it to the basin.');
  await shoot(page, testInfo, 'departure');

  // And the train really is moving while all of that is true.
  expect((await caravan(page))!.progress).toBeGreaterThan(0);
  expectNoConsoleErrors(watch, 'e9-seed-run plain boot');
});
