import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; consoleWarnings: string[]; pageErrors: string[] };
type BuildableId = 'sluice' | 'stockpile';

const ARTIFACT_DIR = path.resolve('artifacts/e1-twin-banks');
const TWIN_QUERY = '?debug&contract=e1-twin-banks&timescale=8&nolevel&nowaves&nokill&seed=e1-twin-banks';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], consoleWarnings: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
    if (message.type() === 'warning') bucket.consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = TWIN_QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function setBalance(page: Page, pathName: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathName, value] as const)).resolves.toBe(
    true,
  );
}

function expectClean(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
  expect(errors.consoleWarnings.filter((message) => /contract|twin banks/i.test(message))).toEqual([]);
}

test('loads Twin Banks contract with two fords, two build zones, and one loss stake', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const snapshot = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: diagnostics.contract,
      hero: diagnostics.heroPos,
      water: diagnostics.terrain.water,
      samples: {
        center: window.__GR_TEST__?.terrainSample(0, 0),
        westFord: window.__GR_TEST__?.terrainSample(-16, 0),
        eastFord: window.__GR_TEST__?.terrainSample(16, 0),
      },
    };
  });

  expect(snapshot.contract.activeId).toBe('e1-twin-banks');
  expect(snapshot.contract.boardRow).toMatchObject({
    name: 'Twin Banks',
    tags: ['vein-hunter'],
    unlock: 'firstSecuredClaim',
  });
  expect(snapshot.contract.tileParams.fords?.map((ford) => ford.id)).toEqual(['west-ford', 'east-ford']);
  expect(snapshot.contract.tileParams.buildZones?.map((zone) => zone.id)).toEqual(['south-bank', 'north-bank']);
  expect(snapshot.contract.tileParams.stakeMarkers).toEqual([
    { id: 'south-claim-stake', x: 0, z: -12, lossCondition: true },
    { id: 'north-expansion-marker', x: 0, z: 12, lossCondition: false },
  ]);
  expect(snapshot.hero).toMatchObject({ x: 0, z: -12 });
  expect(snapshot.water?.riverPresent).toBe(true);
  expect(snapshot.water?.fordPresent).toBe(true);
  expect(snapshot.water?.fordStones).toBe(14);
  expect(snapshot.samples.center?.zone).toBe('river');
  expect(snapshot.samples.westFord?.zone).toBe('ford');
  expect(snapshot.samples.eastFord?.zone).toBe('ford');
  await shot(page, testInfo, 'both-bank-base');
  expectClean(errors);
});

test('builds sluices and stockpiles on both banks against one gold pool', async ({ page }) => {
  const errors = await openGame(page);
  await grantGold(page, 260);
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap ?? 0);

  await placeBuildableAt(page, 'sluice', -16, 7);
  await placeBuildableAt(page, 'sluice', 16, -7);
  await placeBuildableAt(page, 'stockpile', -16, 10);
  await placeBuildableAt(page, 'stockpile', 16, -10);

  const build = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build);
  expect(build.sluices).toBe(2);
  expect(build.stockpiles).toBe(2);
  expect(build.sluicePositions.map((pos) => Math.sign(pos.z)).sort()).toEqual([-1, 1]);
  expect(build.stockpilePositions.map((pos) => Math.sign(pos.z)).sort()).toEqual([-1, 1]);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap ?? 0)).toBeGreaterThan(before);
  expectClean(errors);
});

test('routes enemies through both west and east fords', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&contract=e1-twin-banks&timescale=12&nowaves&nokill&nolevel&nopause&seed=e1-twin-route');
  await setBalance(page, 'enemy.speed', 3.8);
  await assertFordRoute(page, -16);
  await assertFordRoute(page, 16);
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-16, 14));
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(16, 14));
  await page.waitForTimeout(450);
  await shot(page, testInfo, 'north-plot-skirmish');
  expectClean(errors);
});

test('north marker is not the run loss stake, south overrun still ends the run, and waves use four edges', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-twin-banks&timescale=20&nolevel&nokill&nopause&nosteal&nowreck&seed=e1-twin-spawns',
  );
  const markers = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.stakeMarkers ?? []);
  expect(markers.find((marker) => marker.id === 'north-expansion-marker')?.lossCondition).toBe(false);
  expect(markers.find((marker) => marker.id === 'south-claim-stake')?.lossCondition).toBe(true);

  for (const [key, value] of [
    ['enemy.speed', 0],
    ['waves.graceSeconds', 0.1],
    ['waves.waveInterval', 2],
    ['waves.trickleInterval', 999],
    ['waves.pulseBase', 4],
    ['waves.pulsePerWave', 0],
    ['waves.pulsesPerWave', 1],
    ['waves.edgesPerPulse', 4],
    ['waves.aliveCap', 8],
  ] as const) {
    await setBalance(page, key, value);
  }
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(4);
  const edges = await page.evaluate(() => [...new Set(window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.edge).filter(Boolean))].sort());
  expect(edges).toEqual(['east', 'north', 'south', 'west']);
  expectClean(errors);

  const overrunErrors = await openGame(
    page,
    '?debug&contract=e1-twin-banks&timescale=12&nolevel&nowaves&nopause&nosteal&nowreck&seed=e1-twin-overrun',
  );
  await setBalance(page, 'enemy.contactDamage', 200);
  await setBalance(page, 'enemy.speed', 4);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -10))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('death');
  expectClean(overrunErrors);
});

test('seeded Twin Banks diagnostics are stable', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  const first = await determinismSnapshot(page);
  await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  const second = await determinismSnapshot(page);
  expect(second).toEqual(first);
  expectClean(errors);
});

async function assertFordRoute(page: Page, fordX: number): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await expect(page.evaluate((x) => window.__GR_TEST__?.spawnEnemyAt(x, 14), fordX)).resolves.toBe(true);
  await page.evaluate((x) => {
    const w = window as unknown as {
      __twinRoute?: { deepSamples: number; fordSamples: number; reached: boolean; samples: number };
    };
    w.__twinRoute = { deepSamples: 0, fordSamples: 0, reached: false, samples: 0 };
    const tick = () => {
      const track = w.__twinRoute;
      if (!track) return;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      if (enemy && hero) {
        track.samples += 1;
        if (enemy.zone === 'river') track.deepSamples += 1;
        if (enemy.zone === 'ford' && Math.abs(enemy.x - x) <= 3.2) track.fordSamples += 1;
        if (Math.hypot(enemy.x - hero.x, enemy.z - hero.z) < 1.4) track.reached = true;
      }
      if (!track.reached) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, fordX);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __twinRoute?: { reached: boolean } }).__twinRoute?.reached ?? false), {
      timeout: 15_000,
    })
    .toBe(true);
  const track = await page.evaluate(() => (window as unknown as { __twinRoute?: { deepSamples: number; fordSamples: number } }).__twinRoute);
  expect(track?.deepSamples).toBe(0);
  expect(track?.fordSamples ?? 0).toBeGreaterThan(0);
}

async function determinismSnapshot(page: Page): Promise<unknown> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: diagnostics.contract.activeId,
      hero: diagnostics.heroPos,
      water: diagnostics.terrain.water
        ? {
            foam: diagnostics.terrain.water.foam,
            fordPresent: diagnostics.terrain.water.fordPresent,
            fordStones: diagnostics.terrain.water.fordStones,
            glints: diagnostics.terrain.water.glints,
            material: diagnostics.terrain.water.material,
            mobile: diagnostics.terrain.water.mobile,
            quality: diagnostics.terrain.water.quality,
            riverPresent: diagnostics.terrain.water.riverPresent,
            springPonds: diagnostics.terrain.water.springPonds,
            waterPhaseVariance: diagnostics.terrain.water.waterPhaseVariance,
          }
        : null,
      scatter: diagnostics.terrain.detailScatter?.signature ?? null,
      stakes: diagnostics.contract.tileParams.stakeMarkers,
      fords: diagnostics.contract.tileParams.fords,
      harvest: diagnostics.harvest.activeNodes.map((node) => ({
        active: node.active,
        anchorIndex: node.anchorIndex,
        position: node.position,
        remaining: node.remaining,
      })),
      samples: [
        window.__GR_TEST__?.terrainSample(-16, 0),
        window.__GR_TEST__?.terrainSample(16, 0),
        window.__GR_TEST__?.terrainSample(0, -12),
        window.__GR_TEST__?.terrainSample(0, 12),
      ],
    };
  });
}
