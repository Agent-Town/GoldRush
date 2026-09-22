import { expect, test } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';
import { stableHash } from '../src/mp/LockstepClient';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * E5 REGATTA, SLICE 1 — THE BROWSER HALF OF "ONE BODY, ONE INTENT"
 * (`specs/agent-play/e5-regatta-steerable-boat.md`; owner 2026-09-20: "A14 - do it"; the parity law,
 * 2026-09-07: "no, AI and human users have to have the same options and tools, otherwise it is
 * unfair. fairness is crucial.").
 *
 * Two claims, one per test:
 *
 *   1. A HUMAN SAILS HER, IN A PLAIN BOOT. No `?debug`, no `__GR_TEST__`, no harness: the hero walks
 *      off the deck and back aboard on the keys, and the same keys sail the boat. Asserted on the
 *      render side as well as the sim side — `canvas.dataset.claimBoat` is written by
 *      `ClaimBoatView.update`, so a hull that stopped following the body would show here.
 *   2. A RIDER SAILS THE SAME BOAT TO THE SAME PLACE. The tape pinned in
 *      `artifacts/e5-regatta-boat/boat-tape.json` was minted on the HEADLESS engine by
 *      `scripts/regatta-boat-steer.test.mjs`; this replays it on the BROWSER engine at the same
 *      1/30 fixed step and asserts the identical track and the identical hash. That equality is
 *      the parity claim of the slice.
 *
 * WHY THE RIDER'S HALF GOES THROUGH `__GR_TEST__.claimBoat.steerTo` AND NOT `MOVE_HERO`: ADR-005
 * refuses a rider's `MOVE_HERO` at this door ON PURPOSE — a human pilots this hero, so the order is
 * answered `HERO_NOT_YOURS` and never applied over their input. The seam injects the same steering
 * POINT the verb publishes headlessly into the same `DeepwaterClaimTile.helm` the keys reach. The
 * refusal itself is asserted below, so the law is measured rather than assumed.
 */

type BoatMotion = { x: number; z: number; heading: number; speed: number; aboard: string | null; steerable: boolean };
type BoatWindow = Window & {
  __GR_TEST__?: {
    teleport: (x: number, z: number) => void;
    setManualSim: (enabled: boolean) => boolean;
    advanceSim: (seconds: number) => void;
    claimBoat: {
      snapshot: () => { motion: BoatMotion } | null;
      steerTo: (x: number, z: number) => void;
      clearSteer: () => void;
    };
  };
};

const TAPE = JSON.parse(readFileSync(new URL('../artifacts/e5-regatta-boat/boat-tape.json', import.meta.url), 'utf8')) as {
  stepSeconds: number;
  tape: {
    boarding: { x: number; z: number }[];
    sampleEveryTicks: number;
    legs: { seconds: number; steer: { x: number; z: number } | null }[];
  };
  headless: { hash: string; track: (number | string)[][] };
};

const motion = (page: import('@playwright/test').Page) => page.evaluate(
  () => (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { deepwaterClaim?: { boat: { motion: BoatMotion } } } })
    .__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!.boat.motion,
);

const heroPosition = (page: import('@playwright/test').Page) => page.evaluate(
  () => {
    const hero = (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { heroPos: { x: number; z: number } } }).__THREE_GAME_DIAGNOSTICS__!.heroPos;
    return { x: hero.x, z: hero.z };
  },
);

/**
 * THE PLAYER'S OWN LAUNCH, NOT A SEAM (Mistake #10). `?contract=<id>` alone falls back to The Claim
 * unless the boot also carries `?debug` or the sessionStorage launch key the town board's Launch
 * button leaves behind (`ContractFamilies.activeContractSelection`, `isPlayerContractLaunch`), and
 * a staged launch of a LOCKED contract is thrown away again, so the plain boot arrives as a player
 * who has earned the board. Copied in shape from `e2e/playability-smoke.spec.ts`, which exists to
 * ask exactly this question of every contract without a debug flag.
 */
const PROFILE_ID = 'robin';
function progressedPlayerEntries(): Array<[string, string]> {
  const profile: ProfileState = {
    version: 2,
    activeId: PROFILE_ID,
    profiles: [{ id: PROFILE_ID, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  };
  const meta = JSON.stringify({ version: 1, tracks: { territory: 40, science: 999, hero: 40, agent: 40 } });
  const research = JSON.stringify({ version: 1, steps: 999, taken: [], proposalSalt: 0, pinnedTarget: null, metaScienceCursor: 999 });
  const scores = [{ kills: 40, gold: 400, timeAlive: 600, at: 1, waves: 30, secured: true, contractId: 'e5-deepwater-claim', profileName: 'Robin' }];
  const logical: Array<[string, string]> = [
    [SCOREBOARD_KEY, JSON.stringify(scores)],
    [META_PROGRESS_KEY, meta],
    [TOWN_NAME_KEY, 'Quartz Hill'],
    [ACTIVE_EPOCH_KEY, 'epoch-5-deepwater'],
    [FIRST_CLAIM_DONE_KEY, '1'],
    [TOWN_WELCOME_SEEN_KEY, '1'],
    [STORY_TALES_STORAGE_KEY, '0'],
    ...listEpochs().map((epoch): [string, string] => [researchStateKey(epoch.id), research]),
  ];
  return [
    [PROFILE_KEY, JSON.stringify(profile)],
    ...logical.flatMap(([key, value]): Array<[string, string]> => [[key, value], [profileDataKey(PROFILE_ID, key), value]]),
  ];
}

/** What `ClaimBoatView.update` last drew, straight off the canvas: no debug seam involved. */
const renderedBoat = async (page: import('@playwright/test').Page) => {
  const raw = await page.getAttribute('canvas', 'data-claim-boat');
  expect(raw, 'the Claim-Boat view must publish its rendered hull').not.toBeNull();
  const [x, z, heading, aboard] = raw!.split(',');
  return { x: Number(x), z: Number(z), heading: Number(heading), aboard };
};

test('a human boards the Claim-Boat on the keys and sails her, in a plain boot', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
  // No `?debug`, no `__GR_TEST__`: this is the boot a player gets off the town board.
  await page.addInitScript(({ entries, launchKey, launchValue }) => {
    try {
      localStorage.clear();
      for (const [key, value] of entries) localStorage.setItem(key, value);
    } catch { /* a browser with storage disabled still boots */ }
    try {
      sessionStorage.clear();
      sessionStorage.setItem(launchKey, launchValue);
    } catch { /* ditto */ }
  }, { entries: progressedPlayerEntries(), launchKey: 'gr.contract.launch.v1', launchValue: 'e5-regatta' });
  // `nowaves`/`nopause` are read OUTSIDE the debug gate (`src/core/DebugParams.ts:43-46`; only a
  // RELEASE build ignores them), exactly as `?timescale` is — so the boot stays plain: no `?debug`,
  // no `__GR_TEST__`, nothing a player could not type.
  await page.goto('/?contract=e5-regatta&nowaves&nopause');
  await page.waitForFunction(() => ((window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { frame: number } }).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() => Boolean(
    (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { deepwaterClaim?: unknown } }).__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim,
  ));

  const moored = await motion(page);
  expect(moored.steerable, 'the Regatta must author boat physics').toBe(true);
  expect(moored.aboard, 'a hero that boots standing on the deck has not boarded anything').toBeNull();
  expect(moored.x).toBeCloseTo(-49, 6);
  expect(moored.z).toBeCloseTo(0, 6);

  // Off the stern (the deck reaches 14.25 wu fore and aft), then back aboard over the same rail.
  // Aft rather than abeam because the start-line BUOY stands on the anchor the boat is moored to,
  // and a body cannot walk through a buoy: the boarding lane is along the hull, not across it.
  const start = await heroPosition(page);
  expect(Math.abs(start.x - moored.x), 'the hero boots standing on the deck').toBeLessThan(4.4);
  expect(Math.abs(start.z - moored.z), 'the hero boots standing on the deck').toBeLessThan(14.25);

  // Over the PORT rail and back. Port rather than fore-and-aft because the start-line BUOY stands
  // on the anchor the boat is moored to and a body cannot walk through a buoy — measured on this
  // tree: the hero boots depenetrated a metre north of the stake and southward keys do not move it.
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(2_000);
  await page.keyboard.up('KeyA');
  const ashore = await heroPosition(page);
  expect(ashore.x, 'the keys must walk the hero clear of the deck').toBeLessThan(moored.x - 4.4);
  expect(ashore.x).toBeLessThan(start.x);
  expect((await motion(page)).aboard, 'walking AWAY from the boat boards nothing').toBeNull();

  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await motion(page)).aboard, {
    message: 'walking back onto the deck boards the boat',
    timeout: 20_000,
  }).toBe('hero');
  const boarded = await motion(page);

  // ...and the same key that walked her aboard now sails her: three more seconds on the helm.
  await page.waitForTimeout(3_000);
  await page.keyboard.up('KeyD');
  const sailed = await motion(page);
  expect(sailed.aboard, 'sailing puts nobody overboard').toBe('hero');
  expect(sailed.x, 'the boat must have made real way down the course').toBeGreaterThan(boarded.x + 1);
  expect(sailed.speed, 'the boat must be under way').toBeGreaterThan(0.5);

  // The body rides the deck anchor, and the RENDERED hull is where the sim says it is.
  const hero = await heroPosition(page);
  expect(hero.x).toBeCloseTo(sailed.x, 3);
  expect(hero.z).toBeCloseTo(sailed.z, 3);
  const drawn = await renderedBoat(page);
  expect(drawn.aboard).toBe('hero');
  expect(Math.hypot(drawn.x - sailed.x, drawn.z - sailed.z), 'the drawn hull must follow the body').toBeLessThan(0.75);

  await page.screenshot({ path: `artifacts/e5-regatta-boat/plain-boot-sailing-${testInfo.project.name}.png` });
  expectNoConsoleErrors(watch, 'e5-regatta plain-boot boat');
});

test('a rider steers the same boat to the same place: the tape replays to the headless hash', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e5-regatta&nowaves&nolevel&nopause');
  await page.waitForFunction(() => Boolean(
    (window as unknown as BoatWindow).__GR_TEST__?.claimBoat
    && ((window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { frame: number } }).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
  ));

  // (ADR-005's own clause — that THIS door binds `riderPiloted: false` and refuses a rider's
  // MOVE_HERO with HERO_NOT_YOURS — is asserted at the source in
  // `scripts/regatta-boat-steer.test.mjs`, where `hero-move-verb.test.mjs` already asserts it and
  // where no second ToolSurface has to be installed over the game's own executor to do it.)
  const { boarding, legs, sampleEveryTicks } = TAPE.tape;
  const ticksFor = (seconds: number) => Math.round(seconds / TAPE.stepSeconds);

  await page.evaluate(() => { (window as unknown as BoatWindow).__GR_TEST__!.setManualSim(true); });
  // The boarding half of the tape: off the deck, then onto it. `teleport` is the browser's twin of
  // the headless guard's own `hero.group.position.set` — the same act, stated the same way.
  for (const spot of boarding) {
    await page.evaluate(({ x, z, step }) => {
      const test = (window as unknown as BoatWindow).__GR_TEST__!;
      test.teleport(x, z);
      test.advanceSim(step);
    }, { x: spot.x, z: spot.z, step: TAPE.stepSeconds });
  }
  const moored = await motion(page);
  expect(moored.aboard, 'the tape must start from a boarded boat').toBe('hero');
  expect(moored).toMatchObject({ x: -49, z: 0, heading: 0, speed: 0 });

  // The steered half. THE STEERING POINT TAKES EFFECT ON THE SECOND TICK OF EACH LEG, in both
  // engines and for the same reason: headless, the door publishes a rider's target when the
  // executor ticks, which is LATER in the fixed step than the helm runs, so the helm sees a new
  // target one step after the order (`StandingOrders.heroSteering`'s own note). The seam has no
  // order to spend, so it waits that same step rather than stealing a tick the rider never had.
  const track: (number | string)[][] = [];
  let tick = 0;
  const sample = async () => {
    const m = await motion(page);
    track.push([tick, m.x, m.z, m.heading, m.speed, m.aboard ?? '']);
  };
  const advance = async (ticks: number) => {
    for (let done = 0; done < ticks;) {
      const chunk = Math.min(sampleEveryTicks - (tick % sampleEveryTicks), ticks - done);
      await page.evaluate((seconds) => { (window as unknown as BoatWindow).__GR_TEST__!.advanceSim(seconds); }, chunk * TAPE.stepSeconds);
      tick += chunk;
      done += chunk;
      if (tick % sampleEveryTicks === 0) await sample();
    }
  };
  for (const leg of legs) {
    await advance(1);
    await page.evaluate((steer) => {
      const boat = (window as unknown as BoatWindow).__GR_TEST__!.claimBoat;
      if (steer) boat.steerTo(steer.x, steer.z); else boat.clearSteer();
    }, leg.steer);
    await advance(ticksFor(leg.seconds) - 1);
  }

  expect(track.length, 'the browser must sample the tape the headless engine sampled').toBe(TAPE.headless.track.length);
  expect(track).toEqual(TAPE.headless.track);
  expect(stableHash(track), 'the browser ride must reach the pinned headless tape hash').toBe(TAPE.headless.hash);

  await page.screenshot({ path: `artifacts/e5-regatta-boat/rider-tape-${testInfo.project.name}.png` });
  expectNoConsoleErrors(watch, 'e5-regatta rider tape');
});

/**
 * E5 REGATTA, SLICE 2 — A HUMAN AT THE KEYS WINS THE RACE, IN A PLAIN BOOT.
 *
 * The checkpoint the spec's slice 2 names: "a human wins the race by sailing the five buoys".
 * No `?debug`, no `__GR_TEST__`, no seam — the hero walks aboard on the keys and the same keys
 * sail the whole authored course. `?timescale` is read OUTSIDE the debug gate exactly as
 * `nowaves`/`nopause`/`nolevel` are (`src/core/DebugParams.ts`; only a RELEASE build ignores
 * them), so the boot stays a boot a player could type: the course is 143 s of sim time at the
 * hull's authored top speed, and the clock is the only thing this test speeds up.
 *
 * What it proves that the headless guard cannot: the BROWSER's own helm, driven by real key
 * events through the real input controller, reaches the same finish — and the render side agrees,
 * because `canvas.dataset.regattaBuoys` is written by `RegattaBuoysView` and not by the test.
 */

/** Keys → world direction (`InputController`): A/D are ∓x, W/S are ∓z. Nearest of eight, 22.5°. */
const OCTANT = Math.cos(Math.PI * 3 / 8);
function keysToward(dx: number, dz: number): Set<string> {
  const length = Math.hypot(dx, dz) || 1;
  const ux = dx / length;
  const uz = dz / length;
  const keys = new Set<string>();
  if (ux > OCTANT) keys.add('KeyD'); else if (ux < -OCTANT) keys.add('KeyA');
  if (uz > OCTANT) keys.add('KeyS'); else if (uz < -OCTANT) keys.add('KeyW');
  return keys;
}

/**
 * F-RB2-2 — KEEP THE BOW OFF THE RIM, the one thing a human must learn to finish this course.
 *
 * Slice 1's ratified rule is that a move intent towards standable ground within a plank of the
 * rail is a STEP ASHORE, and `ClaimBoat.gangplankPoint` measures that plank from the HULL CENTRE
 * out through whichever rail the intent leaves by. Over the bow of a 28.5 m hull that probe reaches
 * 16.25 m (14.25 + the 2 m plank); over the beam it reaches only 6.4 m. The Regatta's "shore" is
 * the water beyond the hull's own clamp (±49.75), so a racer holding a PURE NORTH key above
 * z ≈ 33.5 steps off the bow into open water — and after slice 2 that is a forfeit, five metres
 * short of a mark that stands at z = 38. Measured, not deduced: the same drive without this rule
 * forfeits at (−28.8, 34.8) with 4.8 m to run.
 *
 * So the drive does what a racer does after one wet race: it never points the bow at the rim. This
 * replicates the sim's own geometry rather than guessing at it, and it is deliberately CONSERVATIVE
 * (the sim also requires the landing point to be walkable, which this ignores), so the test can
 * only ever steer more carefully than the rule demands.
 */
const DECK_HALF_X = 4.4;
const DECK_HALF_Z = 14.25;
const GANGPLANK = 2;
const HULL_WATER = 49.75;
/** How fast the clock runs, how often the racer glances, and how far the hull runs in between. */
const TIMESCALE = 6;
const GLANCE_MS = 140;
const LOOKAHEAD = (GLANCE_MS / 1_000) * TIMESCALE * 2.475;

function unitFor(keys: Set<string>): { x: number; z: number } | null {
  const ix = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
  const iz = (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0);
  const length = Math.hypot(ix, iz);
  return length === 0 ? null : { x: ix / length, z: iz / length };
}

/**
 * `ClaimBoat.gangplankPoint` + `ClaimBoat.navigable`, from the hull position the racer will be at
 * when they NEXT GLANCE — because a key held for 0.84 s of sim time carries the hull two metres,
 * and a rule checked only where the boat is now is checked a boat-width too late (measured: the
 * same drive without the look-ahead forfeits at (43.9, 10.9) with the bow 0.05 m over the line).
 *
 * Deliberately CONSERVATIVE: the sim also requires the landing point to be WALKABLE, and on the
 * finish line it is not (the finish-line rig shadows it), so this test steers more carefully than
 * the rule demands and never leans on a piece of scenery.
 */
function bowWouldLeaveTheWater(x: number, z: number, keys: Set<string>): boolean {
  const unit = unitFor(keys);
  if (!unit) return false;
  const toRailX = unit.x === 0 ? Number.POSITIVE_INFINITY : DECK_HALF_X / Math.abs(unit.x);
  const toRailZ = unit.z === 0 ? Number.POSITIVE_INFINITY : DECK_HALF_Z / Math.abs(unit.z);
  const reach = Math.min(toRailX, toRailZ) + GANGPLANK + LOOKAHEAD;
  return Math.abs(x + unit.x * reach) > HULL_WATER || Math.abs(z + unit.z * reach) > HULL_WATER;
}

/** The nearest heading to the mark that does not put the bow over the rim: 0°, then ±45°, ±90°, ±135°. */
function steerToward(x: number, z: number, dx: number, dz: number): Set<string> {
  const bearing = Math.atan2(dz, dx);
  for (const turn of [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2, Math.PI * 3 / 4, -Math.PI * 3 / 4]) {
    const keys = keysToward(Math.cos(bearing + turn), Math.sin(bearing + turn));
    if (keys.size > 0 && !bowWouldLeaveTheWater(x, z, keys)) return keys;
  }
  return new Set();
}

type RaceView = {
  nextGate: { id: string; x: number; z: number; radius?: number } | null;
  gatesPassed: { id: string }[];
  finished: boolean;
  forfeited: boolean;
};

const raceState = (page: import('@playwright/test').Page) => page.evaluate(
  () => (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { deepwaterClaim?: { race?: RaceView; boat: { motion: BoatMotion } } } })
    .__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!,
) as Promise<{ race?: RaceView; boat: { motion: BoatMotion } }>;

test('a human at the keys sails the whole authored course and wins the Regatta, in a plain boot', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const watch = watchErrors(page);
  await page.addInitScript(({ entries, launchKey, launchValue }) => {
    try {
      localStorage.clear();
      for (const [key, value] of entries) localStorage.setItem(key, value);
    } catch { /* a browser with storage disabled still boots */ }
    try {
      sessionStorage.clear();
      sessionStorage.setItem(launchKey, launchValue);
    } catch { /* ditto */ }
  }, { entries: progressedPlayerEntries(), launchKey: 'gr.contract.launch.v1', launchValue: 'e5-regatta' });
  await page.goto(`/?contract=e5-regatta&nowaves&nopause&nolevel&timescale=${TIMESCALE}`);
  await page.waitForFunction(() => ((window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { frame: number } }).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() => Boolean(
    (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { deepwaterClaim?: { race?: unknown } } }).__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim?.race,
  ));

  const booted = await raceState(page);
  expect(booted.race!.gatesPassed, 'a boat nobody has boarded has started nothing').toHaveLength(0);
  expect(booted.race!.forfeited).toBe(false);
  expect(booted.boat.motion.aboard).toBeNull();
  // The buoys are drawn before anything is raced, and the start mark is the one to go for.
  expect(await page.getAttribute('canvas', 'data-regatta-buoys')).toBe(
    'start-beacon:next,northwest-checkpoint:ahead,midcourse-checkpoint:ahead,northeast-checkpoint:ahead,finish-beacon:ahead|racing',
  );

  // BOARD HER — over the port rail and back, on the keys (slice 1's own boarding lane: the
  // start-line buoy stands on the boat's mooring, so a body goes over the side, not fore-and-aft).
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(1_200);
  await page.keyboard.up('KeyA');
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await raceState(page)).boat.motion.aboard, {
    message: 'walking back onto the deck boards the boat',
    timeout: 30_000,
  }).toBe('hero');
  await page.keyboard.up('KeyD');
  const started = await raceState(page);
  expect(started.race!.gatesPassed.map(({ id }) => id), 'boarding passes the start mark it is moored on').toEqual(['start-beacon']);

  // SAIL THE COURSE. One poll ≈ one human glance: read where the boat is, read which mark is next,
  // hold the nearest of eight key directions towards it. Nothing here touches the sim.
  const pressed = new Set<string>();
  const hold = async (want: Set<string>) => {
    for (const key of [...pressed]) if (!want.has(key)) { await page.keyboard.up(key); pressed.delete(key); }
    for (const key of want) if (!pressed.has(key)) { await page.keyboard.down(key); pressed.add(key); }
  };
  const closest = new Map<string, number>();
  /** Every glance, so a failure reads as a track and not as a boolean. */
  const trail: string[] = [];
  const deadline = Date.now() + 210_000;
  let state = started;
  while (Date.now() < deadline) {
    const race = state.race!;
    if (race.finished || race.forfeited) break;
    const gate = race.nextGate!;
    const { x, z } = state.boat.motion;
    const gap = Math.hypot(x - gate.x, z - gate.z);
    closest.set(gate.id, Math.min(closest.get(gate.id) ?? Number.POSITIVE_INFINITY, gap));
    const want = steerToward(x, z, gate.x - x, gate.z - z);
    trail.push(`${gate.id}@${x.toFixed(1)},${z.toFixed(1)} d${gap.toFixed(1)} ${[...want].join('+') || '-'} ${state.boat.motion.aboard ?? 'OVERBOARD'}`);
    await hold(want);
    await page.waitForTimeout(GLANCE_MS);
    state = await raceState(page);
  }
  await hold(new Set());

  const track = trail.slice(-14).join(' | ');
  const finished = (await raceState(page)).race!;
  expect(finished.forfeited, `the race must be won, not abandoned — last glances: ${track}`).toBe(false);
  expect(finished.finished, `the course ended ${JSON.stringify(finished)} — last glances: ${track}`).toBe(true);
  expect(finished.gatesPassed.map(({ id }) => id)).toEqual([
    'start-beacon', 'northwest-checkpoint', 'midcourse-checkpoint', 'northeast-checkpoint', 'finish-beacon', 'claim-boat',
  ]);
  expect(finished.nextGate, 'a finished course has no next mark').toBeNull();
  expect((await raceState(page)).boat.motion.aboard, 'the finish requires the boat with the hero aboard').toBe('hero');

  // The RENDER side says the same thing, off the canvas, with no seam in between.
  expect(await page.getAttribute('canvas', 'data-regatta-buoys')).toBe(
    'start-beacon:passed,northwest-checkpoint:passed,midcourse-checkpoint:passed,northeast-checkpoint:passed,finish-beacon:passed|finished',
  );

  // The measured course, for the report: how close a HUMAN AT THE KEYS actually came to each mark.
  mkdirSync('artifacts/e5-regatta-boat-02', { recursive: true });
  writeFileSync(
    `artifacts/e5-regatta-boat-02/plain-boot-course-${testInfo.project.name}.json`,
    `${JSON.stringify({
      project: testInfo.project.name,
      timescale: TIMESCALE,
      closestApproach: Object.fromEntries([...closest].map(([id, gap]) => [id, Number(gap.toFixed(3))])),
      gatesPassed: finished.gatesPassed.map(({ id }) => id),
    }, null, 2)}\n`,
  );
  await page.screenshot({ path: `artifacts/e5-regatta-boat-02/plain-boot-race-won-${testInfo.project.name}.png` });
  expectNoConsoleErrors(watch, 'e5-regatta plain-boot race');
});
