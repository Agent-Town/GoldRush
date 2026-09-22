import { expect, test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { META_PROGRESS_KEY } from '../../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs } from '../../src/meta/ContractFamilies';
import { researchStateKey } from '../../src/meta/ResearchTree';
import { STORY_TALES_STORAGE_KEY } from '../../src/story/settings';
import { expectNoConsoleErrors, watchErrors } from '../../e2e/support/console-watch';

/**
 * F-RB2-2 (a) — THE TWO DISEMBARK CASES, IN A PLAIN BOOT, AT BOTH VIEWPORTS.
 * Owner 2026-09-22, verbatim: "F-RB2-2: gangway-reach only".
 *
 * Evidence for `artifacts/f-rb2-2-gangway-reach/report.md`, not a gate: the rule is pinned
 * headlessly by `scripts/regatta-boat-steer.test.mjs` ("F-RB2-2 (a) — the gangway reach…") and the
 * plain-boot ride by `e2e/e5-regatta-boat.spec.ts`. What these two tests add is the PICTURE of each
 * case with the numbers that make it a case:
 *
 *   KEEL-WARD (no disembark): the boat is driven at the north rim with the key HELD. The hull clamps
 *     and her crew stays aboard. The same drive under slice 1's probe stepped the body 16.25 m over
 *     the bow onto the rim and forfeited the race, which is asserted here as arithmetic on the
 *     measured hull position rather than as a claim.
 *   BEAM-WARD (disembark): the same body leaves her over the SIDE the moment standable ground comes
 *     inside the gangway's reach, and stands exactly where the probe put it.
 *
 * No `?debug`, no `__GR_TEST__`: `nowaves`, `nopause`, `nolevel` and `timescale` are read outside the
 * debug gate (`src/core/DebugParams.ts`), so this is the boot a player gets off the town board.
 */

type BoatMotion = { x: number; z: number; heading: number; speed: number; aboard: string | null; steerable: boolean };

const HULL_CLAMP = 49.75;
const DECK_HALF_X = 4.4;
const DECK_HALF_Z = 14.25;
const GANGPLANK = 2;
/** Slice 1's bow probe, the hazard the ruling removes: the deck exit plus one plank. */
const SLICE1_BOW_REACH = DECK_HALF_Z + GANGPLANK;
/** The ruling's reach, the same in every direction, measured from the deck anchor. */
const GANGWAY_REACH = DECK_HALF_X + GANGPLANK;
/** Terrain bounds (+/-64) inset by the hero radius: beyond this nothing is standable. */
const WALKABLE_LIMIT = 63.5;

const OUT = 'artifacts/f-rb2-2-gangway-reach';

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

async function bootAndBoard(page: import('@playwright/test').Page): Promise<BoatMotion> {
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
  await page.goto('/?contract=e5-regatta&nowaves&nopause&nolevel&timescale=2');
  await page.waitForFunction(() => ((window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { frame: number } }).__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() => Boolean(
    (window as unknown as { __THREE_GAME_DIAGNOSTICS__?: { deepwaterClaim?: unknown } }).__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim,
  ));
  const moored = await motion(page);
  expect(moored.steerable, 'the Regatta must author boat physics').toBe(true);
  expect(moored.aboard, 'a hero that boots standing on the deck has not boarded anything').toBeNull();

  // Slice 1's own boarding lane: over the PORT rail and back, because the start-line buoy stands on
  // the boat's mooring and a body cannot walk through a buoy.
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(1_200);
  await page.keyboard.up('KeyA');
  await page.keyboard.down('KeyD');
  await expect.poll(async () => (await motion(page)).aboard, {
    message: 'walking back onto the deck boards the boat',
    timeout: 30_000,
  }).toBe('hero');
  await page.keyboard.up('KeyD');
  return motion(page);
}

/**
 * SLICE 1'S OVERBOARD BAND, measured rather than assumed: a pure-north key put the body ashore
 * wherever the old 16.25 m bow probe cleared the hull's clamp (z > 33.5) AND still landed inside the
 * terrain, which is standable everywhere on this map (z + 16.25 < 63.5, so z < 47.25). North of
 * 47.25 the old probe fell off the world and stepped nobody either — so the case worth photographing
 * is INSIDE the band, where a racer lost the race to a held key.
 */
const BAND_MIN = HULL_CLAMP - SLICE1_BOW_REACH;
const BAND_MAX = WALKABLE_LIMIT - SLICE1_BOW_REACH;

test('CASE 1 (keel-ward): the key held through slice 1 overboard band keeps her crew aboard', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await bootAndBoard(page);

  // North (+z) is where the course's marks are, and KeyS is the key that drives there.
  await page.keyboard.down('KeyS');
  let inBand: BoatMotion | null = null;
  let last = await motion(page);
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    last = await motion(page);
    if (last.aboard === null) break;
    if (inBand === null && last.z > BAND_MIN + 1 && last.z < BAND_MAX) inBand = last;
    if (last.z > HULL_CLAMP - 0.2) break;
    await page.waitForTimeout(50);
  }

  // THE RULING, in the browser: the key was held straight through the band and nobody stepped off.
  expect(inBand, `no sample landed inside slice 1's overboard band (${BAND_MIN}..${BAND_MAX})`).not.toBeNull();
  expect(inBand!.aboard, 'a keel-ward key inside the old overboard band must step nobody ashore').toBe('hero');
  const slice1Probe = inBand!.z + SLICE1_BOW_REACH;
  expect(slice1Probe, "slice 1 probed past the hull clamp: not water the hull can use").toBeGreaterThan(HULL_CLAMP);
  expect(slice1Probe, 'and inside the terrain, so a body could stand there and slice 1 put it there').toBeLessThan(WALKABLE_LIMIT);
  expect(inBand!.z + GANGWAY_REACH, "the ruling's probe stays inside her own deck, so the hull clamps instead")
    .toBeLessThan(inBand!.z + DECK_HALF_Z);

  // The picture: still under way, still crewed, inside the band that used to unload her.
  await page.screenshot({ path: `${OUT}/keel-no-disembark-${testInfo.project.name}.png` });

  // ...and the drive ends aground on her own clamp with the key still down, nobody overboard. Hull
  // and body are read as one pair AFTER the key is released, so the 50 ms sampling gap above cannot
  // make the rider look adrift from the deck it is standing on.
  await page.keyboard.up('KeyS');
  void last;
  const aground = await motion(page);
  const hero = await heroPosition(page);
  expect(aground.aboard, 'she runs aground crewed').toBe('hero');
  expect(aground.z, 'the hull sits on its own clamp, aground, as the ruling asks').toBeLessThanOrEqual(HULL_CLAMP + 1e-6);
  expect(Math.hypot(hero.x - aground.x, hero.z - aground.z), 'and the body still rides the deck anchor').toBeLessThan(0.05);

  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/keel-no-disembark-${testInfo.project.name}.json`, `${JSON.stringify({
    case: 'keel-ward key held through slice 1 overboard band',
    viewport: testInfo.project.use.viewport,
    slice1OverboardBand: [BAND_MIN, BAND_MAX],
    inBand: { x: Number(inBand!.x.toFixed(3)), z: Number(inBand!.z.toFixed(3)), speed: Number(inBand!.speed.toFixed(3)), aboard: inBand!.aboard },
    slice1ProbeZ: Number(slice1Probe.toFixed(3)),
    gangwayProbeZ: Number((inBand!.z + GANGWAY_REACH).toFixed(3)),
    aground: { x: Number(aground.x.toFixed(3)), z: Number(aground.z.toFixed(3)), speed: Number(aground.speed.toFixed(3)), aboard: aground.aboard },
    hero: { x: Number(hero.x.toFixed(3)), z: Number(hero.z.toFixed(3)) },
    hullClamp: HULL_CLAMP,
  }, null, 2)}\n`);
  expectNoConsoleErrors(watch, 'f-rb2-2 keel-ward case');
});

test('CASE 2 (beam-ward): the same body leaves her over the side, onto ground inside the gangway reach', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  const boarded = await bootAndBoard(page);
  expect(boarded.aboard).toBe('hero');

  // Port (-x). The rim west of the hull's clamp is the shore; the body leaves her the moment that
  // ground comes inside the gangway's reach of the deck anchor. Sampled by hand rather than through
  // `expect.poll` so the hull position AT THE STEP is recorded: the key stays down afterwards and a
  // body ashore keeps walking, so a distance read later measures the walk, not the rule.
  await page.keyboard.down('KeyA');
  let aboardSample = boarded;
  let left: BoatMotion | null = null;
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const sample = await motion(page);
    if (sample.aboard === null) { left = sample; break; }
    aboardSample = sample;
    await page.waitForTimeout(50);
  }
  await page.keyboard.up('KeyA');
  const hero = await heroPosition(page);

  expect(left, 'a beam-ward key onto standable ground within the gangway reach must step her crew ashore').not.toBeNull();
  expect(left!.speed, 'a boat nobody is aboard is not under way').toBe(0);
  expect(hero.x, 'the body stands off the PORT rail, not on the deck').toBeLessThan(left!.x - DECK_HALF_X);
  expect(hero.x, 'and beyond the hull clamp, which on this course is the shore').toBeLessThan(-HULL_CLAMP);
  // THE RULE, as the browser applied it: the step fired only once the probe — one gangway reach off
  // the anchor — had crossed the clamp onto ground. Within one sample (50 ms) of the crossing.
  const probeAtStep = aboardSample.x - GANGWAY_REACH;
  expect(probeAtStep, 'the last sample still aboard had its port probe at or past the rim').toBeLessThan(-HULL_CLAMP + 1);

  await page.screenshot({ path: `${OUT}/beam-disembark-${testInfo.project.name}.png` });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/beam-disembark-${testInfo.project.name}.json`, `${JSON.stringify({
    case: 'beam-ward key onto ground inside the gangway reach',
    viewport: testInfo.project.use.viewport,
    lastSampleAboard: { x: Number(aboardSample.x.toFixed(3)), z: Number(aboardSample.z.toFixed(3)), aboard: aboardSample.aboard },
    portProbeAtStep: Number(probeAtStep.toFixed(3)),
    hull: { x: Number(left!.x.toFixed(3)), z: Number(left!.z.toFixed(3)), speed: Number(left!.speed.toFixed(3)) },
    hero: { x: Number(hero.x.toFixed(3)), z: Number(hero.z.toFixed(3)) },
    aboard: left!.aboard,
    heroFromHull: Number(Math.hypot(hero.x - left!.x, hero.z - left!.z).toFixed(3)),
    gangwayReach: GANGWAY_REACH,
    hullClamp: HULL_CLAMP,
  }, null, 2)}\n`);
  expectNoConsoleErrors(watch, 'f-rb2-2 beam-ward case');
});
