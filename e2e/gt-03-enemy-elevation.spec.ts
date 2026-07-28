import { expect, test, type Browser, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EnemyTerrain = {
  grounded: boolean;
  slope: { dx: number; dz: number };
  traversable: boolean;
  speedMul: number;
};
type EnemySnapshot = {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  terrain?: EnemyTerrain;
};
type RouteProbe = {
  done: boolean;
  reached: boolean;
  samples: number;
  cliffSamples: number;
  crossedThroughCliff: boolean;
  passSide: 'east' | 'west' | 'cliff' | null;
  last: { x: number; z: number } | null;
};

declare global {
  interface Window {
    __GT03_ROUTE__?: RouteProbe;
  }
}

const ARTIFACT_DIR = path.resolve('artifacts/gt-03');
const DEV_QUERY = '?debug&tile=gt-test-basin&nowaves&nolevel&nokill&nopause&nosteal&nowreck';
const CLIFF = { minX: -18, maxX: 22, minZ: -16, maxZ: -13 };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function waitForGame(page: Page): Promise<void> {
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
}

async function openDevTile(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${DEV_QUERY}&seed=${seed}${extra}`);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('gt-test-basin');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.flat)).resolves.toBe(false);
  return errors;
}

async function setTerrainSim(page: Page, uphillMin: number, downhillMax: number): Promise<void> {
  await expect(page.evaluate((value) => window.__GR_TEST__?.setBalance('terrainSim.uphillMin', value), uphillMin)).resolves.toBe(true);
  await expect(page.evaluate((value) => window.__GR_TEST__?.setBalance('terrainSim.downhillMax', value), downhillMax)).resolves.toBe(true);
}

async function setBalance(page: Page, pathName: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathName, value] as const)).resolves.toBe(true);
}

async function scriptEnemy(page: Page, x: number, z: number, targetX: number, targetZ: number, speed: number): Promise<void> {
  await expect(page.evaluate((args) => window.__GR_TEST__?.scriptEnemyAt(args.x, args.z, args.targetX, args.targetZ, args.speed), { x, z, targetX, targetZ, speed })).resolves.toBe(true);
}

async function waitForEnemyX(page: Page, x: number, increasing: boolean): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.x ?? Number.NaN), { timeout: 10_000 })
    [increasing ? 'toBeGreaterThanOrEqual' : 'toBeLessThanOrEqual'](increasing ? x - 0.05 : x + 0.05);
}

async function enemyXSegment(page: Page, warmStartX: number, z: number, measureStartX: number, targetX: number): Promise<{ seconds: number; speed: number; terrain?: EnemyTerrain }> {
  const increasing = targetX > warmStartX;
  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await scriptEnemy(page, warmStartX, z, targetX, z, 4);
  await waitForEnemyX(page, measureStartX, increasing);
  const start = await page.evaluate(() => {
    const enemy = window.__GR_TEST__?.enemyPositions()[0] as EnemySnapshot | undefined;
    return { at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0, x: enemy?.x ?? 0, terrain: enemy?.terrain };
  });
  await waitForEnemyX(page, targetX, increasing);
  const end = await page.evaluate(() => ({
    at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
    x: window.__GR_TEST__?.enemyPositions()[0]?.x ?? 0,
  }));
  const seconds = end.at - start.at;
  return { seconds, speed: Math.abs(end.x - start.x) / seconds, terrain: start.terrain };
}

async function determinismHash(browser: Browser, seed: string): Promise<{ hash: string; errors: ErrorBucket }> {
  const page = await browser.newPage();
  const errors = await openDevTile(page, seed);
  const payload = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnEnemyAt(-8, -20);
    window.__GR_TEST__?.spawnEnemyAt(8, -20);
    window.__GR_TEST__?.spawnEnemyAt(0, 20);
    return {
      tile: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.tile,
      enemies: (window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => ({
        id: enemy.id,
        x: Number(enemy.x.toFixed(3)),
        y: Number(enemy.y.toFixed(3)),
        z: Number(enemy.z.toFixed(3)),
        terrain: enemy.terrain,
      })),
    };
  });
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors };
}

test('enemies slow on slopes and expose grounded terrain diagnostics', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openDevTile(page, `gt-03-slope-${testInfo.project.name}`, '&timescale=4');
  await setBalance(page, 'enemy.formationSpreadWidth', 0);

  await setTerrainSim(page, 1, 1);
  const flat = await enemyXSegment(page, -14, 12, -12, -4);
  await setTerrainSim(page, 0.6, 1.1);
  const uphill = await enemyXSegment(page, -14, 12, -12, -4);
  const downhill = await enemyXSegment(page, -4, 12, -6, -14);
  const report = {
    flat,
    uphill,
    downhill,
    uphillVsFlatTime: Number((uphill.seconds / flat.seconds).toFixed(3)),
    uphillVsFlatSpeed: Number((uphill.speed / flat.speed).toFixed(3)),
    downhillVsFlatSpeed: Number((downhill.speed / flat.speed).toFixed(3)),
  };
  await writeFile(path.join(ARTIFACT_DIR, `slope-report-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);

  expect(report.uphillVsFlatSpeed).toBeLessThan(0.85);
  expect(report.downhillVsFlatSpeed).toBeGreaterThanOrEqual(0.98);
  expect(uphill.terrain?.grounded).toBe(true);
  expect(uphill.terrain?.traversable).toBe(true);
  expect(uphill.terrain?.speedMul ?? 1).toBeLessThan(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('cliff blocks enemies and local routing sends them around the ridge', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openDevTile(page, `gt-03-route-${testInfo.project.name}`, '&timescale=8');

  await page.evaluate(({ cliff }) => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.teleport(-30, 12);
    window.__GT03_ROUTE__ = {
      done: false,
      reached: false,
      samples: 0,
      cliffSamples: 0,
      crossedThroughCliff: false,
      passSide: null,
      last: null,
    };
    const start = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    const target = { x: -30, z: 12 };
    const tick = () => {
      const probe = window.__GT03_ROUTE__!;
      const enemy = window.__GR_TEST__?.enemyPositions()[0] as EnemySnapshot | undefined;
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start;
      if (enemy) {
        const inCliffX = enemy.x >= cliff.minX && enemy.x <= cliff.maxX;
        const inCliffZ = enemy.z >= cliff.minZ && enemy.z <= cliff.maxZ;
        if (inCliffX && inCliffZ) probe.cliffSamples += 1;
        if (probe.last && probe.last.z <= cliff.maxZ && enemy.z > cliff.maxZ) {
          const side = enemy.x < cliff.minX ? 'west' : enemy.x > cliff.maxX ? 'east' : 'cliff';
          probe.passSide = side;
          probe.crossedThroughCliff ||= side === 'cliff';
        }
        probe.reached ||= Math.hypot(enemy.x - target.x, enemy.z - target.z) <= 1.8;
        probe.last = { x: enemy.x, z: enemy.z };
        probe.samples += 1;
      }
      if (!probe.reached && now - start < 35) requestAnimationFrame(tick);
      else probe.done = true;
    };
    requestAnimationFrame(tick);
  }, { cliff: CLIFF });
  await scriptEnemy(page, 0, -20, -30, 12, 6);

  await expect.poll(() => page.evaluate(() => window.__GT03_ROUTE__?.done ?? false), { timeout: 15_000 }).toBe(true);
  const probe = await page.evaluate(() => window.__GT03_ROUTE__ as RouteProbe | undefined);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `ridge-route-${testInfo.project.name}.png`), fullPage: false });
  expect(probe?.samples ?? 0).toBeGreaterThan(5);
  expect(probe?.reached).toBe(true);
  expect(probe?.cliffSamples).toBe(0);
  expect(probe?.crossedThroughCliff).toBe(false);
  expect(probe?.passSide).toBe('west');

  await page.goto('?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nokill&nopause&nosteal&nowreck&seed=gt-03-goal-side');
  await waitForGame(page);
  const goalSideRows = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    const cases = [
      { startX: -38, targetX: -46, expectedPassSide: 'west', polarity: 'same' },
      { startX: -38, targetX: -28, expectedPassSide: 'east', polarity: 'opposite' },
      { startX: 38, targetX: 46, expectedPassSide: 'east', polarity: 'same' },
      { startX: 38, targetX: 28, expectedPassSide: 'west', polarity: 'opposite' },
    ] as const;
    return cases.map((scenario) => {
      harness.clearEnemies();
      harness.scriptEnemyAt(scenario.startX, 32, scenario.targetX, 8, 8);
      let passSide: 'east' | 'west' | null = null;
      let samples = 0;
      for (; samples < 80 && passSide === null; samples += 1) {
        harness.advanceSim(0.05);
        const slideSide = harness.captureSuspend().enemies.active[0]?.terrainSlideSide ?? 0;
        if (slideSide !== 0) passSide = slideSide > 0 ? 'east' : 'west';
      }
      return { ...scenario, samples, passSide };
    });
  });
  await writeFile(path.join(ARTIFACT_DIR, `goal-side-report-${testInfo.project.name}.json`), `${JSON.stringify(goalSideRows, null, 2)}\n`);
  for (const row of goalSideRows) {
    expect(row.samples, `${row.polarity}: ${row.startX} → ${row.targetX}`).toBeGreaterThan(5);
    expect(row.passSide, `${row.polarity}: ${row.startX} → ${row.targetX}`).toBe(row.expectedPassSide);
  }
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('seeded basin diagnostics include hash-identical enemy positions', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one deterministic hash proof is enough');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const runA = await determinismHash(browser, 'gt-03-determinism');
  const runB = await determinismHash(browser, 'gt-03-determinism');
  const report = { hashA: runA.hash, hashB: runB.hash };
  await writeFile(path.join(ARTIFACT_DIR, 'determinism-report.json'), `${JSON.stringify(report, null, 2)}\n`);
  expect(runB.hash).toBe(runA.hash);
  expect(runA.errors.consoleErrors).toEqual([]);
  expect(runA.errors.pageErrors).toEqual([]);
  expect(runB.errors.consoleErrors).toEqual([]);
  expect(runB.errors.pageErrors).toEqual([]);
});

test('basin stress stays in frame envelope while the flat claim remains neutral', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'stress proof is desktop-only');
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openDevTile(page, 'gt-03-stress', '&timescale=3&stress=200');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0), { timeout: 12_000 }).toBeGreaterThan(60);
  const basin = await page.evaluate(() => ({
    stressCount: window.__THREE_GAME_DIAGNOSTICS__?.stressCount ?? 0,
    enemiesAlive: window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0,
    frameMs: window.__THREE_GAME_DIAGNOSTICS__?.frameMs,
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
  }));

  await page.goto('/?debug&nowaves&nolevel&nokill&nopause&nosteal&nowreck&timescale=3&stress=200&seed=gt-03-flat');
  await waitForGame(page);
  const flat = await page.evaluate(() => ({
    sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
    enemies: (window.__GR_TEST__?.enemyPositions() ?? []).slice(0, 8).map((enemy) => enemy.terrain),
  }));
  const report = { basin, flat };
  await writeFile(path.join(ARTIFACT_DIR, 'stress-fast-path-report.json'), `${JSON.stringify(report, null, 2)}\n`);

  expect(basin.stressCount).toBe(200);
  expect(basin.enemiesAlive).toBeGreaterThan(0);
  expect(basin.frameMs?.p95 ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(80);
  expect(flat.sim?.flat).toBe(true);
  expect(flat.enemies.every((terrain) => terrain?.grounded && terrain.traversable && terrain.speedMul === 1)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
