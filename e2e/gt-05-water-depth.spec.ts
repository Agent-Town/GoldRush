import { expect, test, type Browser, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Position = { x: number; z: number };
type LegacySample = { walkable: boolean; speedMul: number; zone: string };

const ARTIFACT_DIR = path.resolve('artifacts/gt-05');
const DEV_QUERY = '?debug&tile=gt-test-basin&nowaves&nolevel&nokill&nopause&nosteal&nowreck';
const FLAT_WATER_QUERY = '?debug&tile=gt-flat-water&nowaves&nolevel&nokill&nopause&nosteal&nowreck';

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
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
}

async function openDevTile(page: Page, seed: string, extra = ''): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${DEV_QUERY}&seed=${seed}${extra}`);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('gt-test-basin');
  return errors;
}

async function openClassic(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&nosteal&nowreck&seed=${seed}`);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('frontier-river-claim');
  return errors;
}

async function openFlatWaterTile(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`${FLAT_WATER_QUERY}&seed=${seed}`);
  await waitForGame(page);
  await expect(page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor().id)).resolves.toBe('gt-flat-water');
  return errors;
}

async function setSlopeNeutral(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('terrainSim.uphillMin', 1))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('terrainSim.downhillMax', 1))).resolves.toBe(true);
}

async function setBalance(page: Page, pathName: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathName, value] as const)).resolves.toBe(true);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((point) => window.__GR_TEST__?.teleport(point.x, point.z), { x, z });
  await page.waitForTimeout(80);
  const actual = await heroPos(page);
  expect(Math.abs(actual.x - x)).toBeLessThan(0.05);
  expect(Math.abs(actual.z - z)).toBeLessThan(0.05);
}

async function heroPos(page: Page): Promise<Position> {
  return page.evaluate(() => {
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
    return { x: hero.x, z: hero.z };
  });
}

async function waitForAxis(page: Page, axis: 'x' | 'z', target: number, increasing: boolean): Promise<void> {
  await expect
    .poll(() => page.evaluate((key) => window.__THREE_GAME_DIAGNOSTICS__?.heroPos[key] ?? Number.NaN, axis), { timeout: 10_000 })
    [increasing ? 'toBeGreaterThanOrEqual' : 'toBeLessThanOrEqual'](target);
}

async function walkSegment(
  page: Page,
  start: Position,
  measureAt: number,
  endAt: number,
  axis: 'x' | 'z',
  key: string,
): Promise<{ seconds: number; speed: number }> {
  const increasing = endAt > measureAt;
  await teleport(page, start.x, start.z);
  await page.waitForTimeout(80);
  await page.keyboard.down(key);
  try {
    await waitForAxis(page, axis, measureAt, increasing);
    const startSample = await page.evaluate((sampleAxis) => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      value: window.__THREE_GAME_DIAGNOSTICS__?.heroPos[sampleAxis] ?? 0,
    }), axis);
    await waitForAxis(page, axis, endAt, increasing);
    const endSample = await page.evaluate((sampleAxis) => ({
      at: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      value: window.__THREE_GAME_DIAGNOSTICS__?.heroPos[sampleAxis] ?? 0,
    }), axis);
    return {
      seconds: endSample.at - startSample.at,
      speed: Math.abs(endSample.value - startSample.value) / (endSample.at - startSample.at),
    };
  } finally {
    await page.keyboard.up(key);
  }
}

async function startHeroZoneTrack(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __GT05_HERO_TRACK__?: { samples: number; riverSamples: number; zones: string[] } };
    w.__GT05_HERO_TRACK__ = { samples: 0, riverSamples: 0, zones: [] };
    const startedAt = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    const tick = () => {
      const track = w.__GT05_HERO_TRACK__!;
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? startedAt;
      if (hero) {
        const sample = window.__GR_TEST__?.terrainSample(hero.x, hero.z);
        track.samples += 1;
        if (sample?.zone === 'river') track.riverSamples += 1;
        if (sample?.zone && !track.zones.includes(sample.zone)) track.zones.push(sample.zone);
      }
      if (now - startedAt < 3) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function heroZoneTrack(page: Page): Promise<{ samples: number; riverSamples: number; zones: string[] } | undefined> {
  return page.evaluate(() => (window as unknown as { __GT05_HERO_TRACK__?: { samples: number; riverSamples: number; zones: string[] } }).__GT05_HERO_TRACK__);
}

function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

test('depth data declares deep river, wade ford, and measurable ford slowdown', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openDevTile(page, `gt-05-wade-${testInfo.project.name}`);
  await setSlopeNeutral(page);

  const depth = await page.evaluate(() => ({
    tileWater: window.__GR_CONTRACT_REGISTRY__?.activeWaterDescriptor(),
    shader: window.__THREE_GAME_DIAGNOSTICS__?.terrain.water?.depth,
    samples: {
      river: window.__GR_TEST__?.terrainSample(-12, 0),
      ford: window.__GR_TEST__?.terrainSample(0, 0),
      shallows: window.__GR_TEST__?.terrainSample(-12, -5.5),
    },
  }));
  expect(depth.tileWater?.id).toBe('gt-test-basin-water-depth');
  expect(depth.shader).toEqual({ river: 1.25, ford: 0.35, wade: 0.35, deep: 1 });
  expect(depth.samples.river).toMatchObject({ walkable: false, speedMul: 0, zone: 'river', waterDepth: 1.25, waterClass: 'deep' });
  expect(depth.samples.ford).toMatchObject({ walkable: true, speedMul: 0.85, zone: 'ford', waterDepth: 0.35, waterClass: 'wade' });
  expect(depth.samples.shallows).toMatchObject({ walkable: true, speedMul: 0.8, zone: 'shallows', waterDepth: 0.2, waterClass: 'wade' });

  const bank = await walkSegment(page, { x: -14, z: 12 }, -10, -4, 'x', 'KeyD');
  const ford = await walkSegment(page, { x: 0, z: -4.4 }, -2, 3, 'z', 'ArrowDown');
  const report = {
    bank,
    ford,
    ratio: Number((ford.speed / bank.speed).toFixed(3)),
    depth: depth.shader,
  };
  await writeFile(path.join(ARTIFACT_DIR, `wade-speed-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-wade-crossing.png`), fullPage: false });

  expect(report.ratio).toBeGreaterThan(0.65);
  expect(report.ratio).toBeLessThan(0.93);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('deep water blocks hero and enemy through the shared resolver', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openDevTile(page, `gt-05-deep-${testInfo.project.name}`, '&timescale=6');
  await setSlopeNeutral(page);

  await teleport(page, -14, -6.35);
  const heroStart = await heroPos(page);
  await startHeroZoneTrack(page);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowDown');
  const blockedHero = await heroPos(page);
  const blockedTrack = await heroZoneTrack(page);

  expect(blockedTrack?.samples ?? 0).toBeGreaterThan(4);
  expect(blockedTrack?.riverSamples).toBe(0);
  expect(blockedHero.z).toBeGreaterThan(heroStart.z + 0.5);
  expect(blockedHero.z).toBeLessThan(-4.95);

  await teleport(page, -14, -6.35);
  await startHeroZoneTrack(page);
  await page.keyboard.down('KeyD');
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(700);
  await page.keyboard.up('ArrowDown');
  await page.keyboard.up('KeyD');
  const heroEnd = await heroPos(page);
  const slideTrack = await heroZoneTrack(page);
  const heroSample = await page.evaluate(() => ({
    pos: window.__THREE_GAME_DIAGNOSTICS__?.heroPos,
    sample: window.__GR_TEST__?.terrainSample(window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0, window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0),
  }));

  expect(slideTrack?.samples ?? 0).toBeGreaterThan(4);
  expect(slideTrack?.riverSamples).toBe(0);
  expect(heroSample.sample).toMatchObject({ zone: 'ford', waterClass: 'wade' });
  expect(heroEnd.x).toBeGreaterThan(-3.2);

  const enemyTrack = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-14, -6.35, -14, 6, 4);
    const track = { samples: 0, riverSamples: 0, maxZ: -Infinity, maxX: -Infinity, endX: -14, endZ: -6.35 };
    for (let i = 0; i < 900; i += 1) {
      window.__GR_TEST__?.advanceSim(1 / 15);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      if (enemy) {
        track.samples += 1;
        if (enemy.zone === 'river') track.riverSamples += 1;
        track.maxZ = Math.max(track.maxZ, enemy.z);
        track.maxX = Math.max(track.maxX, enemy.x);
        track.endX = enemy.x;
        track.endZ = enemy.z;
      }
      if (track.maxZ > 5.5) break;
    }
    return track;
  });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-deep-slide.png`), fullPage: false });

  expect(enemyTrack.samples).toBeGreaterThan(4);
  expect(enemyTrack.riverSamples).toBe(0);
  expect(enemyTrack.maxX).toBeGreaterThan(-3.5);
  expect(enemyTrack.maxZ).toBeGreaterThan(5.5);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wadeable river depth lets enemies cross without ford routing', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = await openDevTile(page, `gt-05-shallow-river-${testInfo.project.name}`);
  await setSlopeNeutral(page);
  await setBalance(page, 'terrainSim.wadeDepth', 1.3);

  await expect(page.evaluate(() => window.__GR_TEST__?.terrainSample(-14, 0))).resolves.toMatchObject({
    walkable: true,
    speedMul: 0.55,
    zone: 'river',
    waterDepth: 1.25,
  });

  const enemyTrack = await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-14, -6.35, -14, 6, 4);
    const track = { samples: 0, riverSamples: 0, maxZ: -Infinity, minX: Infinity, maxX: -Infinity, endX: -14, endZ: -6.35 };
    for (let i = 0; i < 900; i += 1) {
      window.__GR_TEST__?.advanceSim(1 / 15);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      if (enemy) {
        track.samples += 1;
        if (enemy.zone === 'river') track.riverSamples += 1;
        track.maxZ = Math.max(track.maxZ, enemy.z);
        track.minX = Math.min(track.minX, enemy.x);
        track.maxX = Math.max(track.maxX, enemy.x);
        track.endX = enemy.x;
        track.endZ = enemy.z;
      }
      if (track.maxZ > 5.5) break;
    }
    return track;
  });

  expect(enemyTrack.samples).toBeGreaterThan(4);
  expect(enemyTrack.riverSamples).toBeGreaterThan(4);
  expect(enemyTrack.maxZ).toBeGreaterThan(5.5);
  expect(enemyTrack.minX).toBeGreaterThan(-17);
  expect(enemyTrack.maxX).toBeLessThan(-11);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('flat wadeable river applies enemy water speed', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openFlatWaterTile(page, `gt-05-flat-wade-${testInfo.project.name}`);
  await setBalance(page, 'terrainSim.wadeDepth', 1.3);

  const report = await page.evaluate(() => {
    const runSegment = (startZ: number, targetZ: number) => {
      window.__GR_TEST__?.clearEnemies();
      window.__GR_TEST__?.scriptEnemyAt(-14, startZ, -14, targetZ, 4);
      window.__GR_TEST__?.advanceSim(0.8);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      return {
        startZ,
        endZ: enemy?.z ?? startZ,
        distance: Math.abs((enemy?.z ?? startZ) - startZ),
        zone: enemy?.zone,
        speedMul: enemy?.terrain?.speedMul,
      };
    };
    const bank = runSegment(-14, -8);
    const river = runSegment(-4.8, 4.8);
    return {
      bank,
      river,
      ratio: Number((river.distance / bank.distance).toFixed(3)),
      riverSample: window.__GR_TEST__?.terrainSample(-14, 0),
    };
  });
  await writeFile(path.join(ARTIFACT_DIR, `flat-enemy-wade-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);

  expect(report.riverSample).toMatchObject({ walkable: true, speedMul: 0.55, zone: 'river', waterDepth: 1.25 });
  expect(report.bank.zone).toBe('bank');
  expect(report.river.zone).toBe('river');
  expect(report.river.speedMul).toBe(0.55);
  expect(report.ratio).toBeGreaterThan(0.4);
  expect(report.ratio).toBeLessThan(0.75);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('classic claim keeps deep water impassable while carrying equivalent depth data', async ({ browser, page }, testInfo) => {
  test.setTimeout(45_000);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const errors = await openClassic(page, `gt-05-classic-${testInfo.project.name}`);
  const snapshot = await classicSnapshot(page);
  expect(snapshot.tileParams).toEqual({
    tileId: 'frontier-river-claim',
    biome: 'river-claim',
    river: true,
    ford: true,
    waterSources: [],
    lanes: {
      spawnEdges: ['north', 'south', 'east', 'west'],
      territoryRingBiasWaves: 3,
      territoryRingLaneBias: 0.75,
    },
  });
  expect(snapshot.tileWater).toMatchObject({ id: 'frontier-river-depth', heroCanWadeDeep: false });
  expect(snapshot.legacySamples).toEqual({
    river: { walkable: false, speedMul: 0, zone: 'river' },
    ford: { walkable: true, speedMul: 0.85, zone: 'ford' },
    shallows: { walkable: true, speedMul: 0.8, zone: 'shallows' },
  });
  expect(snapshot.depthSamples.river).toMatchObject({ waterDepth: 1.25, waterClass: 'deep' });
  expect(snapshot.depthSamples.ford).toMatchObject({ waterDepth: 0.35, waterClass: 'wade' });

  const enemySpeed = await page.evaluate(() => {
    const runSegment = (x: number, startZ: number, targetZ: number) => {
      window.__GR_TEST__?.clearEnemies();
      window.__GR_TEST__?.scriptEnemyAt(x, startZ, x, targetZ, 4);
      window.__GR_TEST__?.advanceSim(0.8);
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      return {
        startZ,
        endZ: enemy?.z ?? startZ,
        distance: Math.abs((enemy?.z ?? startZ) - startZ),
        zone: enemy?.zone,
        speedMul: enemy?.terrain?.speedMul,
      };
    };
    const bank = runSegment(-14, -14, -8);
    const ford = runSegment(0, -4.8, 4.8);
    return { bank, ford, ratio: Number((ford.distance / bank.distance).toFixed(3)) };
  });
  expect(enemySpeed.bank.zone).toBe('bank');
  expect(enemySpeed.ford.zone).toBe('ford');
  expect(enemySpeed.ford.speedMul).toBe(0.85);
  expect(enemySpeed.ratio).toBeGreaterThan(0.92);
  expect(enemySpeed.ratio).toBeLessThan(1.08);

  const runA = await classicHash(browser, 'gt-05-classic-hash');
  const runB = await classicHash(browser, 'gt-05-classic-hash');
  await writeFile(path.join(ARTIFACT_DIR, 'classic-claim-hash.json'), `${JSON.stringify({ hashA: runA, hashB: runB }, null, 2)}\n`);
  expect(runB).toBe(runA);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('GT water depth simulation is deterministic', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one deterministic hash proof is enough');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const first = await gtHash(browser, 'gt-05-determinism');
  const second = await gtHash(browser, 'gt-05-determinism');
  await writeFile(path.join(ARTIFACT_DIR, 'determinism-report.json'), `${JSON.stringify({ first, second }, null, 2)}\n`);
  expect(second.hash).toBe(first.hash);
  expect(first.errors.consoleErrors).toEqual([]);
  expect(first.errors.pageErrors).toEqual([]);
  expect(second.errors.consoleErrors).toEqual([]);
  expect(second.errors.pageErrors).toEqual([]);
});

async function classicSnapshot(page: Page): Promise<any> {
  return page.evaluate(() => {
    const river = window.__GR_TEST__?.terrainSample(-12, 0);
    const ford = window.__GR_TEST__?.terrainSample(0, 0);
    const shallows = window.__GR_TEST__?.terrainSample(-12, -5.5);
    return {
      tileParams: window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams,
      tileWater: window.__GR_CONTRACT_REGISTRY__?.activeWaterDescriptor(),
      legacySamples: { river: legacy(river), ford: legacy(ford), shallows: legacy(shallows) },
      depthSamples: { river, ford, shallows },
    };

    function legacy(sample: any): LegacySample {
      return { walkable: sample.walkable, speedMul: sample.speedMul, zone: sample.zone };
    }
  });
}

async function classicHash(browser: Browser, seed: string): Promise<string> {
  const page = await browser.newPage();
  await openClassic(page, seed);
  const payload = await classicSnapshot(page);
  await page.close();
  return hashPayload(payload);
}

async function gtHash(browser: Browser, seed: string): Promise<{ hash: string; errors: ErrorBucket }> {
  const page = await browser.newPage();
  const errors = await openDevTile(page, seed);
  const payload = await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('terrainSim.uphillMin', 1);
    window.__GR_TEST__?.setBalance('terrainSim.downhillMax', 1);
    window.__GR_TEST__?.teleport(-14, -6.35);
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.scriptEnemyAt(-14, -6.35, -14, 6, 4);
    window.__GR_TEST__?.advanceSim(1.2);
    const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, y: 0, z: 0 };
    return {
      tile: window.__GR_CONTRACT_REGISTRY__?.activeTileDescriptor(),
      tileWater: window.__GR_CONTRACT_REGISTRY__?.activeWaterDescriptor(),
      water: window.__THREE_GAME_DIAGNOSTICS__?.terrain.water?.depth,
      hero: { x: Number(hero.x.toFixed(3)), z: Number(hero.z.toFixed(3)) },
      enemy: (window.__GR_TEST__?.enemyPositions() ?? []).map((enemy) => ({
        id: enemy.id,
        x: Number(enemy.x.toFixed(3)),
        z: Number(enemy.z.toFixed(3)),
        zone: enemy.zone,
        terrain: enemy.terrain,
      })),
      samples: {
        river: window.__GR_TEST__?.terrainSample(-12, 0),
        ford: window.__GR_TEST__?.terrainSample(0, 0),
        shallows: window.__GR_TEST__?.terrainSample(-12, -5.5),
      },
    };
  });
  await page.close();
  return { hash: hashPayload(payload), errors };
}
