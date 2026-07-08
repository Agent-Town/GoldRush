import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };

const ARTIFACT_DIR = path.resolve('artifacts/e2-hill-mine');
const QUERY = '?debug&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck';
const T2_TURRET = { x: 24, z: 25 };
const VALLEY_TARGET = { x: 24, z: 5.6 };
const WEST_FACE = { x: -24, z: 22 };
const EAST_FACE = { x: 24, z: 22 };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openHillMine(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${QUERY}&seed=${seed}${extra}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_CONTRACT_REGISTRY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).resolves.toBe('e2-hill-mine');
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('e2-hill-mine');
  await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.flat)).resolves.toBe(false);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function setBalance(page: Page, key: string, value: number): Promise<void> {
  await expect(page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const)).resolves.toBe(true);
}

async function easyTargets(page: Page): Promise<void> {
  await setBalance(page, 'enemy.hp', 20);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'sparkRig.range', 0);
}

async function placeTurret(page: Page, point: Point): Promise<void> {
  await expect(page.evaluate((pos) => window.__GR_TEST__?.placeFree('turret', pos.x, pos.z), point)).resolves.toBe(true);
}

async function spawnEnemy(page: Page, point: Point): Promise<void> {
  await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), point)).resolves.toBe(true);
}

async function parkHero(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__?.teleport(42, -42));
}

async function shots(page: Page): Promise<number> {
  return page.evaluate(() => window.__GR_TEST__?.state().combat.shots.bolt ?? 0);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('loads the locked Steamworks poster contract and ships the Hill Mine elevation table', async ({ page }, testInfo) => {
  const errors = await openHillMine(page, `hillmine-table-${testInfo.project.name}`);
  const snapshot = await page.evaluate(() => ({
    contract: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
    water: window.__GR_CONTRACT_REGISTRY__?.activeWaterDescriptor(),
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
    bounds: {
      creek: window.__GR_TEST__?.terrainSim(0, -18),
      railCut: window.__GR_TEST__?.terrainSim(-24, 0),
      trestle: window.__GR_TEST__?.terrainSample(0, 0),
      gallery: window.__GR_TEST__?.terrainSample(-12, 0),
      t1: window.__GR_TEST__?.terrainSim(0, 14),
      t2: window.__GR_TEST__?.terrainSim(24, 26),
      t3: window.__GR_TEST__?.terrainSim(28, 40),
      mineMouth: window.__GR_TEST__?.terrainSim(-6, 41),
      cliffFace: window.__GR_TEST__?.terrainSim(0, 20),
    },
  }));

  expect(snapshot.contract?.boardRow).toMatchObject({
    name: 'The Hill Mine',
    unlock: 'epoch-2-steamworks',
  });
  expect(snapshot.contract?.tileParams).toMatchObject({
    tileId: 'e2-hill-mine',
    biome: 'steamworks-hill-mine',
    size: 96,
    river: true,
    ford: true,
  });
  expect(snapshot.tile?.elevation?.analytic).toMatchObject({
    hillMine: 1,
    creekHeight: -0.5,
    railHeight: 0,
    t1Height: 1.5,
    t2Height: 3,
    t3Height: 4.5,
  });
  expect(snapshot.water).toMatchObject({ id: 'hill-mine-flooded-gallery' });
  expect(snapshot.rails).toMatchObject({ active: true, paths: 3, style: 'steamworks', asset: 'procedural-placeholder' });
  expect(snapshot.bounds.creek?.height).toBeCloseTo(-0.5, 1);
  expect(snapshot.bounds.railCut?.height).toBeCloseTo(0, 1);
  expect(snapshot.bounds.t1?.height).toBeCloseTo(1.5, 1);
  expect(snapshot.bounds.t2?.height).toBeCloseTo(3, 1);
  expect(snapshot.bounds.t3?.height).toBeCloseTo(4.5, 1);
  expect(snapshot.bounds.mineMouth?.height ?? 0).toBeGreaterThan(4.5);
  expect(snapshot.bounds.cliffFace?.traversable).toBe(false);
  expect(snapshot.bounds.gallery).toMatchObject({ walkable: false, zone: 'river', waterClass: 'deep' });
  expect(snapshot.bounds.trestle).toMatchObject({ walkable: true, zone: 'ford', waterClass: 'wade' });

  await page.evaluate(() => window.__GR_TEST__?.teleport(-6, 41));
  await shot(page, testInfo, 'mine-mouth');
  assertNoErrors(errors);
});

test('T2 high ground out-ranges the rail cut while the terrace face blocks bolts both ways', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openHillMine(page, `hillmine-los-${testInfo.project.name}`, '&timescale=8&nokill');
  await easyTargets(page);
  await setBalance(page, 'turret.range', 16);
  await setBalance(page, 'turret.fireRate', 4);
  await setBalance(page, 'gt.highGroundRangeBonus', 0);
  await placeTurret(page, T2_TURRET);
  await parkHero(page);
  await spawnEnemy(page, VALLEY_TARGET);
  await page.waitForTimeout(700);
  expect(await shots(page)).toBe(0);

  await setBalance(page, 'gt.highGroundRangeBonus', 1.5);
  await expect.poll(() => shots(page), { timeout: 10_000 }).toBeGreaterThan(0);
  const highGround = await page.evaluate(
    ([turret, target]) => ({
      distance: Math.hypot(target.x - turret.x, target.z - turret.z),
      turret: window.__GR_TEST__?.terrainSim(turret.x, turret.z),
      target: window.__GR_TEST__?.terrainSample(target.x, target.z),
      combat: window.__GR_TEST__?.state().combat,
    }),
    [T2_TURRET, VALLEY_TARGET] as const,
  );
  expect(highGround.distance).toBeGreaterThan(16);
  expect(highGround.turret?.height ?? 0).toBeGreaterThan(2.8);
  expect(highGround.target).toMatchObject({ waterClass: 'wade' });
  await shot(page, testInfo, 'high-turret-firing-long');

  await page.goto(`${QUERY}&seed=hillmine-los-west-${testInfo.project.name}&timescale=8&nokill`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await easyTargets(page);
  await setBalance(page, 'turret.range', 60);
  await setBalance(page, 'turret.fireRate', 4);
  await placeTurret(page, WEST_FACE);
  await parkHero(page);
  await spawnEnemy(page, EAST_FACE);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos.blockedAt !== null), { timeout: 8_000 }).toBe(true);
  await page.waitForTimeout(500);
  const westBlock = await page.evaluate(() => ({
    shots: window.__GR_TEST__?.state().combat.shots,
    los: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos,
  }));
  expect(westBlock.shots).toEqual({ bolt: 0, lob: 0 });
  expect(westBlock.los?.clear).toBe(false);
  await shot(page, testInfo, 'terrace-face-blocks-west');

  await page.goto(`${QUERY}&seed=hillmine-los-east-${testInfo.project.name}&timescale=8&nokill`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await easyTargets(page);
  await setBalance(page, 'turret.range', 60);
  await setBalance(page, 'turret.fireRate', 4);
  await placeTurret(page, EAST_FACE);
  await parkHero(page);
  await spawnEnemy(page, WEST_FACE);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos.blockedAt !== null), { timeout: 8_000 }).toBe(true);
  await page.waitForTimeout(500);
  const eastBlock = await page.evaluate(() => ({
    shots: window.__GR_TEST__?.state().combat.shots,
    los: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.lastLos,
  }));
  expect(eastBlock.shots).toEqual({ bolt: 0, lob: 0 });
  expect(eastBlock.los?.clear).toBe(false);
  assertNoErrors(errors);
});

test('bandits route switchbacks and flooded gallery depth blocks deep water but allows edge wading', async ({ page }, testInfo) => {
  test.setTimeout(55_000);
  const errors = await openHillMine(page, `hillmine-water-route-${testInfo.project.name}`, '&timescale=1');
  await parkHero(page);
  await setBalance(page, 'enemy.contactDamage', 0);

  const route = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(0, 6.6, 0, 34, 5);
    const track = { samples: 0, faceSamples: 0, minX: Infinity, maxZ: -Infinity, endX: 0, endZ: 6.6 };
    for (let i = 0; i < 1200; i += 1) {
      window.__GR_TEST__?.advanceSim(1 / 30, 1 / 30);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      if (!enemy) break;
      track.samples += 1;
      track.minX = Math.min(track.minX, enemy.x);
      track.maxZ = Math.max(track.maxZ, enemy.z);
      track.endX = enemy.x;
      track.endZ = enemy.z;
      if (enemy.x > -16 && enemy.x < 16 && enemy.z > 18 && enemy.z < 23) track.faceSamples += 1;
      if (enemy.z > 31) break;
    }
    return track;
  });
  expect(route.samples).toBeGreaterThan(10);
  expect(route.faceSamples).toBe(0);
  expect(route.minX).toBeLessThan(-4);
  expect(route.maxZ).toBeGreaterThan(31);

  const water = await page.evaluate(() => ({
    deep: window.__GR_TEST__?.terrainSample(-12, 0),
    trestle: window.__GR_TEST__?.terrainSample(0, 0),
    edge: window.__GR_TEST__?.terrainSample(-12, 5.8),
  }));
  expect(water.deep).toMatchObject({ walkable: false, zone: 'river', waterClass: 'deep', waterDepth: 1.25 });
  expect(water.trestle).toMatchObject({ walkable: true, zone: 'ford', waterClass: 'wade', speedMul: 0.8 });
  expect(water.edge).toMatchObject({ walkable: true, zone: 'shallows', waterClass: 'wade', speedMul: 0.72 });

  const enemyWaterTrack = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-14, -6.35, -14, 6, 4);
    const track = { samples: 0, riverSamples: 0, maxX: -Infinity, maxZ: -Infinity };
    for (let i = 0; i < 900; i += 1) {
      window.__GR_TEST__?.advanceSim(1 / 15, 1 / 15);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      if (!enemy) break;
      track.samples += 1;
      if (enemy.zone === 'river') track.riverSamples += 1;
      track.maxX = Math.max(track.maxX, enemy.x);
      track.maxZ = Math.max(track.maxZ, enemy.z);
      if (track.maxZ > 5.5) break;
    }
    return track;
  });
  expect(enemyWaterTrack.samples).toBeGreaterThan(4);
  expect(enemyWaterTrack.riverSamples).toBe(0);
  expect(enemyWaterTrack.maxX).toBeGreaterThan(-3.5);
  expect(enemyWaterTrack.maxZ).toBeGreaterThan(5.5);

  const speed = await wadeSpeed(page);
  expect(speed.ratio).toBeGreaterThan(0.55);
  expect(speed.ratio).toBeLessThan(0.85);

  await page.evaluate(() => window.__GR_TEST__?.teleport(-12, 0));
  await shot(page, testInfo, 'flooded-gallery');
  assertNoErrors(errors);
});

test('Hill Mine terrain simulation is deterministic for a seeded route', async ({ browser }) => {
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const first = await hillMineHash(browser, 'hillmine-determinism');
  const second = await hillMineHash(browser, 'hillmine-determinism');
  expect(second.hash).toBe(first.hash);
  expect(first.errors.consoleErrors).toEqual([]);
  expect(first.errors.pageErrors).toEqual([]);
  expect(second.errors.consoleErrors).toEqual([]);
  expect(second.errors.pageErrors).toEqual([]);
});

test('Hill Mine 200-enemy stress stays inside envelope', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one desktop stress proof is enough');
  test.setTimeout(60_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openHillMine(page, 'hillmine-stress', '&timescale=3&stress=200&nokill');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0), { timeout: 12_000 }).toBeGreaterThan(60);
  const stress = await page.evaluate(() => ({
    stressCount: window.__THREE_GAME_DIAGNOSTICS__?.stressCount ?? 0,
    enemiesAlive: window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0,
    frameMs: window.__THREE_GAME_DIAGNOSTICS__?.frameMs,
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
  }));
  await writeFile(path.join(ARTIFACT_DIR, 'stress-report.json'), `${JSON.stringify(stress, null, 2)}\n`);
  expect(stress.stressCount).toBe(200);
  expect(stress.enemiesAlive).toBeGreaterThan(0);
  expect(stress.frameMs?.p95 ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(100);
  expect(stress.rails?.drawCalls ?? 99).toBeLessThanOrEqual(2);
  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 24));
  await shot(page, testInfo, 'terraces-wide');
  assertNoErrors(errors);
});

async function wadeSpeed(page: Page): Promise<{ bank: number; edge: number; ratio: number }> {
  const bank = await walkSegment(page, { x: -24, z: 10 }, -22, -16, 'x', 'KeyD');
  const edge = await walkSegment(page, { x: -24, z: 5.8 }, -22, -16, 'x', 'KeyD');
  return { bank, edge, ratio: Number((edge / bank).toFixed(3)) };
}

async function walkSegment(page: Page, start: Point, measureAt: number, endAt: number, axis: 'x' | 'z', key: string): Promise<number> {
  const increasing = endAt > measureAt;
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), start);
  await page.waitForTimeout(80);
  await page.keyboard.down(key);
  try {
    await waitForAxis(page, axis, measureAt, increasing);
    const first = await page.evaluate((sampleAxis) => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      value: window.__THREE_GAME_DIAGNOSTICS__?.heroPos[sampleAxis] ?? 0,
    }), axis);
    await waitForAxis(page, axis, endAt, increasing);
    const second = await page.evaluate((sampleAxis) => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      value: window.__THREE_GAME_DIAGNOSTICS__?.heroPos[sampleAxis] ?? 0,
    }), axis);
    return Math.abs(second.value - first.value) / (second.at - first.at);
  } finally {
    await page.keyboard.up(key);
  }
}

async function waitForAxis(page: Page, axis: 'x' | 'z', target: number, increasing: boolean): Promise<void> {
  await expect
    .poll(() => page.evaluate((key) => window.__THREE_GAME_DIAGNOSTICS__?.heroPos[key] ?? Number.NaN, axis), { timeout: 10_000 })
    [increasing ? 'toBeGreaterThanOrEqual' : 'toBeLessThanOrEqual'](target);
}

async function hillMineHash(browser: Browser, seed: string): Promise<{ hash: string; payload: unknown; errors: ErrorBucket }> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = await openHillMine(page, seed, '&timescale=8&nokill');
  const payload = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(0, 6.6, 0, 34, 5);
    window.__GR_TEST__?.advanceSim(1.5, 1 / 30);
    return {
      contract: window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId,
      tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
      water: window.__GR_CONTRACT_REGISTRY__?.activeWaterDescriptor(),
      rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
      samples: {
        creek: window.__GR_TEST__?.terrainSim(0, -18),
        t1: window.__GR_TEST__?.terrainSim(0, 14),
        t2: window.__GR_TEST__?.terrainSim(24, 26),
        t3: window.__GR_TEST__?.terrainSim(28, 40),
        cliff: window.__GR_TEST__?.terrainSim(0, 20),
        deep: window.__GR_TEST__?.terrainSample(-12, 0),
        edge: window.__GR_TEST__?.terrainSample(-12, 5.8),
      },
      enemy: (window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => ({
        x: Number(enemy.x.toFixed(3)),
        z: Number(enemy.z.toFixed(3)),
        zone: enemy.zone,
      })),
    };
  });
  await page.close();
  return { hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, errors };
}
