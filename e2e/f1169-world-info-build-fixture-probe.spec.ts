import { expect, test, type Page } from '@playwright/test';

test.skip(!process.env.GR_F1169_PROBE, 'measurement rig — set GR_F1169_PROBE=1 to run');
test.setTimeout(180_000);

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
type Point = { x: number; z: number };

const CASES: Array<{ id: BuildableId; x: number; z: number }> = [
  { id: 'sentry_beacon', x: -16, z: 14 },
  { id: 'palisade', x: -10, z: 14 },
  { id: 'stockpile', x: 9, z: 13 },
  { id: 'turret', x: 16, z: 14 },
  { id: 'sluice', x: -4, z: 7 },
  { id: 'assay_office', x: 3, z: 7 },
];

async function openGame(page: Page, seed: string): Promise<void> {
  await page.goto(`/?debug&timescale=6&nowaves&nolevel&nokill&nosteal&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  await page.evaluate(() => window.__GR_TEST__?.grantGold(2_000));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0)).toBe(before + 2_000);
}

async function armAt(page: Page, id: BuildableId, target: Point, actorZOffset = 2) {
  await page.evaluate(({ x, z, offset }) => window.__GR_TEST__?.teleport(x, z + offset), { ...target, offset: actorZOffset });
  await page.waitForTimeout(80);
  const selected = await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId) ?? false, id);
  await page.waitForTimeout(34);
  return page.evaluate(({ buildableId, selectionSucceeded }) => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      selected: selectionSucceeded,
      ghostPos: diagnostics.build.ghostPos,
      ghostValid: diagnostics.build.ghostValid,
      ghostFootprint: diagnostics.build.ghostFootprint,
      gold: diagnostics.economy.gold,
      count: diagnostics.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
    };
  }, { buildableId: id, selectionSucceeded: selected });
}

async function sweep(page: Page, id: BuildableId, requested: Point) {
  const valid: Point[] = [];
  for (let dx = -6; dx <= 6; dx += 1) {
    for (let dz = -6; dz <= 6; dz += 1) {
      const point = { x: requested.x + dx, z: requested.z + dz };
      if ((await armAt(page, id, point)).ghostValid) valid.push(point);
    }
  }
  valid.sort(
    (a, b) =>
      Math.hypot(a.x - requested.x, a.z - requested.z) - Math.hypot(b.x - requested.x, b.z - requested.z)
      || a.x - b.x
      || a.z - b.z,
  );
  return { validCount: valid.length, nearest: valid[0] ?? null };
}

test('records all build-note placements and discriminates invalid cells', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one project is sufficient for coordinate diagnosis');
  await openGame(page, 'f1169-sequential');

  const rows = [];
  const invalidCases: Array<{ id: BuildableId; requested: Point; loopSweep: Awaited<ReturnType<typeof sweep>> }> = [];
  for (const item of CASES) {
    const requested = { x: item.x, z: item.z };
    const sample = await armAt(page, item.id, requested);
    const exactActor = await armAt(page, item.id, requested, 0);
    await armAt(page, item.id, requested);
    const placed = sample.ghostValid && Boolean(await page.evaluate(() => window.__GR_TEST__?.confirmBuild()));
    if (!sample.ghostValid) invalidCases.push({ id: item.id, requested, loopSweep: await sweep(page, item.id, requested) });
    await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
    const row = { id: item.id, requested, ...sample, exactActor, placed };
    rows.push(row);
    console.log(`F1169 ROW ${JSON.stringify(row)}`);
  }

  console.log(`F1169 ROWS ${JSON.stringify(rows)}`);
  for (const item of invalidCases) {
    await openGame(page, `f1169-fresh-${item.id}`);
    const freshRequested = await armAt(page, item.id, item.requested);
    const freshSweep = await sweep(page, item.id, item.requested);
    console.log(`F1169 FAILURE ${JSON.stringify({ ...item, freshRequested, freshSweep })}`);
  }
});
