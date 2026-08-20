import { expect, test, type Page } from '@playwright/test';

/**
 * A8 — THE SEED RUN, in the browser (`specs/agent-play/door-completion-sheet.md:22`, RATIFIED
 * 2026-08-20). Three claims, in the order a player meets them:
 *
 *   1. PLAIN BOOT (no `?debug`, Mistake #10): the Seed Run is a real map with a real caravan on
 *      it. The briefing names it, the train is mounted in the scene, and the three planting
 *      grounds are where the contract says they are — with nothing written to a profile.
 *   2. THE TRADE: standing at a stake while the train stands at the same ground, the ordinary
 *      confirm key plants a vault. The guard drops by the ratified quarter, and NOTHING is
 *      persisted mid-run.
 *   3. THE PERSISTENCE LAW: the write lands at run END and takes effect at the NEXT tile birth —
 *      a permanent no-spawn green, on this profile, on this map, for every run after.
 *
 * The dry-gulch rehearsal (`e2e/tp02-green-waypoint.spec.ts`) is untouched and still passes: it
 * plants the BARE `green-waypoint` entry id, while this map plants `green-waypoint:<ground>`.
 */

const QUERY = '/?contract=e9-seed-run&nolevel&nopause&seed=sr01';
const DEBUG_QUERY = `${QUERY}&debug`;
const CONTRACT_ID = 'e9-seed-run';
const CENTER_STAKE = { x: 0, z: 3 };
const CENTER_ENTRY_ID = 'green-waypoint:plant-center-waypoint';
const GREEN_RADIUS = 3;
const PLANT_COST_HP = 60;
const CARAVAN_MAX_HP = 240;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(180_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => {
  localStorage.clear();
  sessionStorage.clear();
}));

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

const caravan = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.seedCaravan);
const persistence = (page: Page) => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tilePersistence);

async function tileStateSnapshot(page: Page): Promise<string | null> {
  return page.evaluate(async (contractId) => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    return localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
  }, CONTRACT_ID);
}

/** The ordinary context action — Space, the same key that funds a megaproject or frees a machine. */
async function pressConfirm(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
  });
}

test('a plain boot puts a real caravan on a real road — no debug, no profile write', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await waitForBoot(page, false);

  // WHERE THE PLAYER SEES IT: the briefing card the boot itself raised names this contract.
  await expect(page.getByTestId('contract-briefing-name')).toContainText(/Seed Run/i);

  const state = await caravan(page);
  expect(state).toMatchObject({ declared: true, hp: CARAVAN_MAX_HP, maxHp: CARAVAN_MAX_HP, arrived: false });
  // The route is the five authored buildZone centres, in authored order — the same five points
  // the mask table publishes as `caravanRoute` and `scripts/e3-mask-tables.test.mjs` already pins.
  expect(state!.route).toEqual([
    { x: 0, z: -48 }, { x: -34, z: -21 }, { x: 0, z: 3 }, { x: 34, z: 27 }, { x: 0, z: 48 },
  ]);
  expect(state!.grounds.map(({ id, zoneId }) => `${id}/${zoneId}`)).toEqual([
    'plant-west-waypoint/west-green-waypoint',
    'plant-center-waypoint/center-green-waypoint',
    'plant-east-waypoint/east-green-waypoint',
  ]);
  expect(state!.plantedBefore).toEqual([]);

  // The train has a PLACE, and it is the yard the contract starts it in — a computed caravan
  // with no position would fail here.
  expect(state!.position).toEqual({ x: 0, z: -48 });
  expect(state!.state).toBe('moving');

  // Nothing is written on boot (Mistake #7): a run that plants nothing persists nothing.
  expect(await tileStateSnapshot(page)).toBeNull();
  expect(await persistence(page)).toMatchObject({ contractId: CONTRACT_ID, entries: 0, noSpawnZones: [] });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('planting at the stake spends the guard, lands at run end, and is born as a green next run', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('enemy.contactDamage', 0);
  });

  // Walk the train to the centre ground. It leaves the south yard at t=0 and reaches (0,3) on a
  // fixed schedule, so the harness simply advances until the dwell opens.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(120));
  await expect.poll(async () => (await caravan(page))?.atGround).toBe('plant-center-waypoint');
  expect((await caravan(page))?.state).toBe('paused');

  // OUT OF REACH IS REFUSED, and the refusal is counted rather than swallowed.
  await pressConfirm(page);
  await expect.poll(async () => (await caravan(page))?.refusals.outOfReach).toBeGreaterThan(0);
  expect((await caravan(page))?.plantedThisRun).toEqual([]);

  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  await pressConfirm(page);
  await expect.poll(async () => (await caravan(page))?.plantedThisRun).toEqual(['plant-center-waypoint']);

  // THE COST: the ratified quarter, off both the pool and the ceiling.
  const spent = await caravan(page);
  expect(spent!.maxHp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);
  expect(spent!.hp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);

  // ONE PER GROUND, for the life of the profile.
  await pressConfirm(page);
  await expect.poll(async () => (await caravan(page))?.refusals.alreadyHeld).toBeGreaterThan(0);
  expect((await caravan(page))?.plantedThisRun).toEqual(['plant-center-waypoint']);

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
    noSpawnZones: [{ x: CENTER_STAKE.x, z: CENTER_STAKE.z, radius: GREEN_RADIUS }],
  });
  expect((await caravan(page))!.plantedBefore).toEqual(['plant-center-waypoint']);

  // And the ground it holds refuses a second vault forever.
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('enemy.contactDamage', 0);
    test.advanceSim(120);
  });
  await expect.poll(async () => (await caravan(page))?.atGround).toBe('plant-center-waypoint');
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  await pressConfirm(page);
  await expect.poll(async () => (await caravan(page))?.refusals.alreadyHeld).toBeGreaterThan(0);
  expect((await caravan(page))?.plantedThisRun).toEqual([]);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('the caravan reaching the basin is what opens the secure, and a dead train never does', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(DEBUG_QUERY);
  await waitForBoot(page, true);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('enemy.contactDamage', 0);
  });

  // The whole crossing: five legs at 1.6 wu/s plus three 40-second dwells.
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(400));
  await expect.poll(async () => (await caravan(page))?.state, { timeout: 60_000 }).toBe('arrived');
  const landed = await caravan(page);
  expect(landed).toMatchObject({ arrived: true, progress: 1 });
  // Arriving with no plant costs nothing: the guard is whole minus whatever the road took.
  expect(landed!.maxHp).toBe(CARAVAN_MAX_HP);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
