import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, query: string): Promise<Errors> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&seed=water-mask-engine${query}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

test('the Claim keeps its legacy water contract byte-for-byte when no mask is authored', async ({ page }) => {
  const errors = await boot(page, '');
  const snapshot = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    return {
      mask: terrain.waterMask() ?? null,
      samples: [
        terrain.sample(0, 0),
        terrain.sample(-12, 0),
        terrain.sample(-12, 5.5),
        terrain.sample(-12, 7),
      ],
      adjacent: [terrain.isWaterSourceAdjacent(0, 7, 2), terrain.isWaterSourceAdjacent(0, 8.26, 2)],
    };
  });

  expect(snapshot).toEqual({
    mask: null,
    samples: [
      { walkable: true, speedMul: 0.85, zone: 'ford', waterSource: 'river', waterDepth: 0.35, waterClass: 'wade' },
      { walkable: true, speedMul: 0.55, zone: 'river', waterSource: 'river', waterDepth: 1.25, waterClass: 'deep' },
      { walkable: true, speedMul: 0.8, zone: 'shallows', waterSource: 'river', waterDepth: 0.2, waterClass: 'wade' },
      { walkable: true, speedMul: 1, zone: 'bank' },
    ],
    adjacent: [true, false],
  });
  expect(errors).toEqual({ console: [], page: [] });
});

test('the scratch braid places sluices on both channels and keeps enemies out of both cuts', async ({ page }) => {
  const published = JSON.parse(
    await readFile(path.resolve('assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json'), 'utf8'),
  ).maskTruth.waterMask;
  const errors = await boot(page, '&tile=gt-water-mask-braid');

  const contract = await page.evaluate(async () => {
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    const { activeTileDescriptor } = await Function('return import("/src/meta/ContractFamilies.ts")')() as typeof import('../src/meta/ContractFamilies');
    return {
      mask: activeTileDescriptor().waterMask,
      terrainMask: terrain.waterMask(),
      samples: {
        rect: terrain.sample(-28, 0).zone,
        westFord: terrain.sample(-16, 0).zone,
        eastFord: terrain.sample(16, 0).zone,
        north: terrain.sample(-8, 3.1).zone,
        island: terrain.sample(0, 0).zone,
        south: terrain.sample(8, -3.1).zone,
      },
      sluiceBanks: [
        terrain.isWaterSourceAdjacent(-22, 5.2, 2),
        terrain.isWaterSourceAdjacent(22, -5.2, 2),
      ],
      legacyLeak: terrain.isWaterSourceAdjacent(0, 7, 2),
    };
  });
  expect(contract.mask).toEqual(published);
  expect(contract.terrainMask).toEqual(published);
  expect(contract.samples).toEqual({ rect: 'river', westFord: 'ford', eastFord: 'ford', north: 'river', island: 'bank', south: 'river' });
  expect(contract.sluiceBanks).toEqual([true, true]);
  expect(contract.legacyLeak).toBe(false);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sluice', -22, 5.2))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('sluice', 22, -5.2))).resolves.toBe(true);

  const traces = await page.evaluate(() => {
    const testApi = window.__GR_TEST__!;
    const traceEnemy = (hero: [number, number], spawn: [number, number]) => {
      testApi.clearEnemies();
      testApi.teleport(...hero);
      testApi.spawnEnemyAt(...spawn);
      const trace = [];
      for (let step = 0; step < 60; step += 1) {
        testApi.advanceSim(0.05);
        const enemy = testApi.enemyPositions()[0]!;
        trace.push({ x: enemy.x, z: enemy.z, zone: testApi.terrainSample(enemy.x, enemy.z).zone });
      }
      return trace;
    };
    testApi.setManualSim(true);
    testApi.setBalance('enemy.speed', 4);
    return {
      north: traceEnemy([-8, 0], [-8, 8]),
      south: traceEnemy([8, -9], [8, 0]),
    };
  });
  expect(traces.north.every(({ zone }) => zone !== 'river')).toBe(true);
  expect(Math.hypot(traces.north.at(-1)!.x + 8, traces.north.at(-1)!.z - 8)).toBeGreaterThan(3);
  expect(traces.south.every(({ zone }) => zone !== 'river')).toBe(true);
  expect(Math.hypot(traces.south.at(-1)!.x - 8, traces.south.at(-1)!.z)).toBeGreaterThan(3);
  expect(errors).toEqual({ console: [], page: [] });
});

test('contract documents reject malformed authored water masks', async ({ page }) => {
  const errors = await boot(page, '');
  const rejected = await page.evaluate(async () => {
    const contracts = await Function('return import("/src/meta/ContractFamilies.ts")')() as typeof import('../src/meta/ContractFamilies');
    const template = structuredClone(contracts.activeContract());
    template.tileParams.waterMask = {
      id: 'editor-water-mask',
      regions: [
        { id: 'channel', kind: 'polyline_band', zone: 'river', halfWidth: 1, points: [{ x: 0, z: 0 }, { x: 1, z: 0 }] },
        { id: 'ford', kind: 'rect', zone: 'ford', minX: -1, maxX: 1, minZ: -1, maxZ: 1 },
      ],
    };
    const parse = (mutate: (candidate: Record<string, any>) => void) => {
      const candidate = structuredClone(template) as unknown as Record<string, any>;
      mutate(candidate);
      return contracts.parseContractDescriptor(JSON.stringify(candidate), template);
    };
    return {
      unknownZone: parse((candidate) => { candidate.tileParams.waterMask.regions[0].zone = 'lava'; }).ok,
      degenerateBand: parse((candidate) => { candidate.tileParams.waterMask.regions[0].points[1] = { x: 0, z: 0 }; }).ok,
      duplicateIds: parse((candidate) => { candidate.tileParams.waterMask.regions[1].id = 'channel'; }).ok,
    };
  });
  expect(rejected).toEqual({ unknownZone: false, degenerateBand: false, duplicateIds: false });
  expect(errors).toEqual({ console: [], page: [] });
});
