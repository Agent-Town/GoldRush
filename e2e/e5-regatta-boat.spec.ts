import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
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
