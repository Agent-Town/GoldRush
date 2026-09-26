import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

// canyon-works-traversal-1 (F-PP2-2, Astra's native play run, 2026-09-25). The Canyon Works blended
// its works-side bench (creekHeight 0.5) down to the channel floor (railHeight -1) across two metres,
// z -8..-6: simSlope read 1.03 at z -7 against Balance.terrainSim.slopeMax 0.35, isTraversable has no
// x term, and every approach on foot (the works bridge at x 0, the flanks at x -24/24/-44/44) stopped
// at z -7.88. The contract now blends the same 1.5 m over eight metres, z -14..-6 (peak |simSlope|
// 0.2798 at z -10). This spec walks the hero across that bank with the real movement code, holding
// the move key under the manual sim, at the bridge x and at both flank x's.
const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-traversal';
const START_Z = -16; // the works-side bench, south of the widened bank
const PAST_Z = -6; // the gallery side of the bank: the shallows begin at z -6.25
const STOP_Z = -5.5; // far enough past PAST_Z to prove the crossing; the flanks meet deep water at z -5
const STEP_S = 0.25;
const BUDGET_S = 6; // an 8 m bank plus 2 m of bench at walking pace is about 2.5 s of sim
const APPROACHES = [
  { id: 'works-bridge', x: 0 },
  { id: 'west-flank', x: -24 },
  { id: 'east-flank', x: 24 },
] as const;

type Point = { x: number; z: number };

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

async function heroPos(page: Page): Promise<Point> {
  return page.evaluate(() => {
    const pos = window.__THREE_GAME_DIAGNOSTICS__!.heroPos;
    return { x: pos.x, z: pos.z };
  });
}

test('the hero walks down the works bank past z -6 at the bridge and both flanks', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e3-canyon-works');

  const rows: Array<Record<string, unknown>> = [];
  for (const approach of APPROACHES) {
    // The sim first: the whole bank is legal ground at this x, and the creek is still 1.5 m down.
    const band = await page.evaluate(({ x }) => {
      const points: Array<{ z: number; height: number; slope: number; traversable: boolean }> = [];
      for (let z = -16; z <= -5.5 + 1e-9; z += 0.25) {
        const sample = window.__GR_TEST__!.terrainSim(x, z);
        points.push({ z, height: sample.height, slope: Math.hypot(sample.slope.dx, sample.slope.dz), traversable: sample.traversable });
      }
      return points;
    }, { x: approach.x });
    expect(band.filter((point) => !point.traversable), `${approach.id}: refused points on the bank`).toEqual([]);
    const peak = Math.max(...band.map((point) => point.slope));
    expect(peak, `${approach.id}: peak |simSlope| on the bank`).toBeLessThanOrEqual(Balance.terrainSim.slopeMax);
    expect(band[0]!.height, `${approach.id}: the works bench`).toBeCloseTo(0.5, 3);
    expect(band.at(-1)!.height, `${approach.id}: the channel floor`).toBeCloseTo(-1, 3);

    // Then the hero: teleport onto the bench and hold moveDown (+z, toward the channel and galleries).
    await page.evaluate(({ x, z }) => {
      window.__GR_TEST__!.teleport(x, z);
      window.__GR_TEST__!.advanceSim(0.1);
    }, { x: approach.x, z: START_Z });
    const start = await heroPos(page);
    expect(Math.hypot(start.x - approach.x, start.z - START_Z), `${approach.id}: teleport landed`).toBeLessThan(0.1);

    const path: Point[] = [start];
    let elapsed = 0;
    await page.keyboard.down('KeyS');
    try {
      while (elapsed < BUDGET_S && path.at(-1)!.z <= STOP_Z) {
        await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), STEP_S);
        elapsed += STEP_S;
        path.push(await heroPos(page));
      }
    } finally {
      await page.keyboard.up('KeyS');
    }
    const end = path.at(-1)!;
    const crossedAt = path.findIndex((point) => point.z > PAST_Z) * STEP_S;
    const stalls = path.slice(1).filter((point, index) => point.z <= PAST_Z && point.z - path[index]!.z < 0.2).length;
    rows.push({ approach: approach.id, x: approach.x, peakSlope: Number(peak.toFixed(4)), start, end, crossedAtSimSeconds: crossedAt, stalls });
    expect(end.z, `${approach.id}: progress past z ${PAST_Z} within ${BUDGET_S}s of sim`).toBeGreaterThan(PAST_Z);
    expect(stalls, `${approach.id}: steps that made under 0.2 m of progress on the bank`).toBe(0);
    expect(Math.abs(end.x - approach.x), `${approach.id}: walked straight down the bank`).toBeLessThan(0.5);
  }

  await testInfo.attach('canyon-traversal.json', { body: JSON.stringify(rows, null, 2), contentType: 'application/json' });
  console.log(`[canyon-traversal] ${testInfo.project.name} ${JSON.stringify(rows)}`);
  expectNoConsoleErrors(watch);
});

// canyon-works-traversal-2 (F-CW1-1, measured 2026-09-25 and 2026-09-26). The second wall was the t2 ramp: 4 m (t1Height 0.5
// to t2Height 4.5) over z 18..28, a smoothstep peak |simSlope| of 0.598, so isTraversable refused z 19.8..26.2 at every x and
// no seam, gallery, lamp or turret above it could be reached on foot (Astra's acceptance stopped at z 19.8 with gold 0). The
// contract now runs the same 4 m over z 14..32: peak 0.333, a margin of 0.017 under slopeMax, the narrowest window with a
// margin of at least 0.015 (artifacts/canyon-works-traversal-2/slope-t2.txt). The scripted cliff (x -12..12, z 18..26, 2.2 m)
// is unchanged, so the route goes round it. This row walks the hero from the works bridge to the first gallery target of that
// acceptance run, seam anchor-0 at (-34, 30) beside the west gallery, one held key per leg, under the manual sim.
const T2_START = { x: 0, z: -5 }; // on the works bridge, where the acceptance run stands once it has crossed the bank
const T2_TARGET = { x: -34, z: 30 }; // seam anchor-0, the acceptance run's first gallery target
const T2_RAMP_X = -28; // the west gallery's column (gallery-west stands at -28, 28): clear of the cliff, the steepest line up
const T2_MARGIN = 0.015; // the margin under slopeMax the ramp window was chosen for
const T2_STEP_S = 0.125;
const T2_MIN_STEP = 0.1; // the bank row's pace floor (0.2 m per 0.25 s) at this step
const T2_LEGS = [
  { id: 'bridge-to-bench', key: 'KeyS', axis: 'z', sign: 1, to: 12, budgetS: 8 }, // over the bridge and up the t1 ramp
  { id: 'bench-west', key: 'KeyA', axis: 'x', sign: -1, to: T2_RAMP_X, budgetS: 10 }, // along the bench, south of the cliff
  { id: 't2-ramp', key: 'KeyS', axis: 'z', sign: 1, to: 30, budgetS: 10 }, // straight up the t2 ramp to the gallery shelf
  { id: 'gallery-shelf', key: 'KeyA', axis: 'x', sign: -1, to: T2_TARGET.x, budgetS: 4 }, // along the shelf to the seam
] as const;

test('the hero walks from the works bridge up the t2 ramp to the first gallery target, round the cliff', async ({ page }, testInfo) => {
  const watch = watchErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('e3-canyon-works');

  // The sim first: the t2 ramp is legal ground at the gallery column with the chosen margin, it still climbs its 4 m, and
  // the scripted cliff is still a cliff.
  const sim = await page.evaluate(({ x }) => {
    const ramp: Array<{ z: number; height: number; slope: number; traversable: boolean }> = [];
    for (let z = 14; z <= 32 + 1e-9; z += 0.25) {
      const sample = window.__GR_TEST__!.terrainSim(x, z);
      ramp.push({ z, height: sample.height, slope: Math.hypot(sample.slope.dx, sample.slope.dz), traversable: sample.traversable });
    }
    const cliff: Array<{ z: number; traversable: boolean }> = [];
    for (let z = 18; z <= 26 + 1e-9; z += 0.5) cliff.push({ z, traversable: window.__GR_TEST__!.terrainSim(0, z).traversable });
    return { ramp, cliff };
  }, { x: T2_RAMP_X });
  const peak = Math.max(...sim.ramp.map((point) => point.slope));
  expect(sim.ramp.filter((point) => !point.traversable), 't2: refused points on the ramp at the gallery column').toEqual([]);
  expect(peak, 't2: peak |simSlope| on the ramp, with the margin the window was chosen for').toBeLessThanOrEqual(Balance.terrainSim.slopeMax - T2_MARGIN);
  expect(sim.ramp.at(-1)!.height - sim.ramp[0]!.height, 't2: the ramp still rises t1Height 0.5 to t2Height 4.5').toBeCloseTo(4, 3);
  expect(sim.cliff.filter((point) => point.traversable), 't2: the scripted cliff at x 0 stays refused').toEqual([]);

  // Then the hero: teleport onto the bridge and walk the four legs, one held key each.
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__!.teleport(x, z);
    window.__GR_TEST__!.advanceSim(0.1);
  }, T2_START);
  const start = await heroPos(page);
  expect(Math.hypot(start.x - T2_START.x, start.z - T2_START.z), 't2: teleport landed on the bridge').toBeLessThan(0.1);

  const path: Point[] = [start];
  const legs: Array<Record<string, unknown>> = [];
  for (const leg of T2_LEGS) {
    const from = path.at(-1)!;
    const along = (point: Point) => (leg.axis === 'z' ? point.z : point.x) * leg.sign;
    const goal = leg.to * leg.sign;
    let elapsed = 0;
    let stalls = 0;
    await page.keyboard.down(leg.key);
    try {
      while (elapsed < leg.budgetS && along(path.at(-1)!) < goal) {
        await page.evaluate((seconds) => window.__GR_TEST__!.advanceSim(seconds), T2_STEP_S);
        elapsed += T2_STEP_S;
        const next = await heroPos(page);
        if (along(next) < goal && along(next) - along(path.at(-1)!) < T2_MIN_STEP) stalls += 1;
        path.push(next);
      }
    } finally {
      await page.keyboard.up(leg.key);
    }
    const end = path.at(-1)!;
    const drift = leg.axis === 'z' ? Math.abs(end.x - from.x) : Math.abs(end.z - from.z);
    legs.push({ leg: leg.id, from, end, simSeconds: elapsed, stalls, drift: Number(drift.toFixed(3)) });
    expect(along(end), `t2 ${leg.id}: reached ${leg.axis} ${leg.to} within ${leg.budgetS}s of sim`).toBeGreaterThanOrEqual(goal);
    expect(stalls, `t2 ${leg.id}: steps that made under ${T2_MIN_STEP} m of progress in ${T2_STEP_S}s`).toBe(0);
    expect(drift, `t2 ${leg.id}: walked straight`).toBeLessThan(0.5);
  }

  const closest = Math.min(...path.map((point) => Math.hypot(point.x - T2_TARGET.x, point.z - T2_TARGET.z)));
  const end = path.at(-1)!;
  const shelf = await page.evaluate(({ x, z }) => window.__GR_TEST__!.terrainSim(x, z).height, end);
  const row = { approach: 'bridge-to-first-gallery-target', peakSlope: Number(peak.toFixed(4)), start, end, closestToTarget: Number(closest.toFixed(3)), shelfHeight: Number(shelf.toFixed(3)), legs };
  await testInfo.attach('canyon-traversal-t2.json', { body: JSON.stringify(row, null, 2), contentType: 'application/json' });
  console.log(`[canyon-traversal-t2] ${testInfo.project.name} ${JSON.stringify(row)}`);
  expect(closest, 't2: the hero reached the first gallery target (the acceptance run arrives within 1.2 m of a seam)').toBeLessThanOrEqual(1.2);
  expect(shelf, 't2: the hero stands on the gallery shelf').toBeGreaterThan(4);
  expectNoConsoleErrors(watch);
});
