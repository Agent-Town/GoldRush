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
