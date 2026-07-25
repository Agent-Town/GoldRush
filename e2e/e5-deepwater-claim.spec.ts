import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nolevel&nopause&seed=shelf-1';
const ARTIFACT_DIR = 'artifacts/e5-deepwater-claim';
const WAVE_COUNTER_SHOT_DIR = 'reviews/shots-deepwater-wave-counter';

test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  performance.setResourceTimingBufferSize(10_000);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem(key, 'epoch-5-deepwater');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e5-deepwater-claim');
  return errors;
}

async function artifact(testInfo: TestInfo, name: string, value: unknown): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(`${ARTIFACT_DIR}/${testInfo.project.name}-${name}.json`, `${JSON.stringify(value, null, 2)}\n`);
}

test('boots the Deepwater contract with deck pads, depth gates, and a storm-scheduled corsair wave', async ({ page }, testInfo) => {
  const errors = await open(page);
  const state = await page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const terrain = (await Function('return import("/src/world/Terrain.ts")')()) as typeof import('../src/world/Terrain');
    const contract = registry.loadContract('e5-deepwater-claim');
    window.__GR_TEST__!.setManualSim(true);
    const centerLandBuild = window.__GR_TEST__!.placeFree('turret', 0, 0);
    const cornerLandBuild = window.__GR_TEST__!.placeFree('turret', 60, 60);
    const deckBuild = window.__GR_TEST__!.placeBoatBuilding('bow', 'sentry_beacon');
    const duplicateDeckBuild = window.__GR_TEST__!.placeBoatBuilding('bow', 'turret');
    window.__GR_TEST__!.advanceSim(8);
    return {
      contract: {
        id: contract.id,
        epochActive: registry.epochIsActive('epoch-5-deepwater'),
        tileParams: contract.tileParams,
        weather: contract.twist.weather,
        enemyRoster: contract.twist.enemyRoster,
      },
      terrainBuildable: {
        center: terrain.isBuildable(0, 0),
        corner: terrain.isBuildable(60, 60),
      },
      centerLandBuild,
      cornerLandBuild,
      deckBuild,
      duplicateDeckBuild,
      afterStorm: window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!,
      corsairs: window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'corsair_skiff'),
      resources: performance.getEntriesByType('resource').map((entry) => entry.name).filter((name) => /DeepwaterClaimTile/i.test(name)),
    };
  });

  expect(state.contract).toMatchObject({ id: 'e5-deepwater-claim', epochActive: true, tileParams: { size: 128 } });
  expect(state.terrainBuildable).toEqual({ center: false, corner: false });
  expect(state.centerLandBuild).toBe(false);
  expect(state.cornerLandBuild).toBe(false);
  expect(state.deckBuild).toBe(true);
  expect(state.duplicateDeckBuild).toBe(false);
  expect(state.resources).not.toHaveLength(0);
  expect(state.afterStorm.boat.buildings).toEqual([{ buildingId: 'sentry_beacon', padId: 'bow', x: 0, z: 27 }]);
  expect(state.afterStorm.storm.waves).toEqual([{ wave: 1, cycle: 0, scheduledAt: 8, direction: 'west-to-east', fromX: -64, toX: 64 }]);
  expect(state.afterStorm.corsairWaves).toHaveLength(1);
  expect(state.afterStorm.corsairWaves[0]?.enemies).toHaveLength(3);
  expect(state.corsairs).toHaveLength(3);
  expect(state.afterStorm.corsairWaves[0]?.enemies.every((enemy) =>
    enemy.unitClass === 'vehicle'
    && enemy.vehicleChassis === 'e4-hauler'
    && enemy.travelClass === 'boat'
    && enemy.art === 'placeholder'
    && enemy.waterRegionId === 'open-water')).toBe(true);
  expect(state.afterStorm.wrecks.map((wreck) => wreck.era)).toEqual(['E1', 'E2', 'E3', 'E4', 'mystery']);

  const mask = JSON.parse(await readFile('assets/contracts/epoch-5-deepwater/mask-tables/e5-deepwater-claim.json', 'utf8')).maskTruth;
  expect(mask.tileId).toBe('e5-deepwater-claim');
  expect(mask.dimensions).toEqual(state.contract.tileParams.dimensions);
  expect(mask.buildZones).toEqual(state.contract.tileParams.buildZones);
  expect(mask.waterSources).toEqual(state.contract.tileParams.waterSources);
  expect(mask.harvestAnchors).toEqual(state.contract.tileParams.harvestAnchors);
  expect(mask.water).toEqual(state.contract.tileParams.water);
  expect(mask.deepwater).toEqual((state.contract.tileParams as any).deepwater);
  expect(mask.weather).toEqual(state.contract.weather);
  expect(mask.enemyRoster).toEqual(state.contract.enemyRoster);
  expect(mask.lanes).toEqual(state.contract.tileParams.lanes);
  await artifact(testInfo, 'tile-state', state);
  expect(errors).toEqual([]);
});

test('shows the active run wave in Deepwater and WaveSystem contracts', async ({ page }, testInfo) => {
  const errors = await open(page);
  const deepwater = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    game.setManualSim(true);
    for (let second = 0; second < 40 && window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!.corsairWaves.length < 2; second += 1) {
      game.advanceSim(1);
    }
    const corsairWaves = window.__THREE_GAME_DIAGNOSTICS__!.deepwaterClaim!.corsairWaves.length;
    return {
      corsairWaves,
      displayed: document.querySelector<HTMLElement>('[data-hud-wave-number]')?.textContent,
    };
  });
  expect(deepwater.corsairWaves).toBeGreaterThanOrEqual(2);
  expect(deepwater.corsairWaves).toBeGreaterThan(0);
  expect(deepwater.displayed).toBe(String(deepwater.corsairWaves));
  await mkdir(WAVE_COUNTER_SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${WAVE_COUNTER_SHOT_DIR}/${testInfo.project.name}-wave-counter.png` });

  await page.goto('/?debug&epoch=epoch-1-frontier&contract=the-claim&nolevel&nopause&nowaves&seed=wave-counter-control');
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'the-claim');
  await page.evaluate(() => window.__GR_TEST__!.setWave(7));
  await page.waitForFunction(() => {
    const wave = window.__THREE_GAME_DIAGNOSTICS__?.wave;
    return wave === 7 && document.querySelector<HTMLElement>('[data-hud-wave-number]')?.textContent === String(wave);
  });
  const waveSystem = await page.evaluate(() => ({
    wave: window.__THREE_GAME_DIAGNOSTICS__!.wave,
    displayed: document.querySelector<HTMLElement>('[data-hud-wave-number]')?.textContent,
  }));
  expect(waveSystem.wave).toBe(7);
  expect(waveSystem.displayed).toBe(String(waveSystem.wave));
  expect(errors).toEqual([]);
});

test('replays boat placement and two storm cycles deterministically', async ({ page }, testInfo) => {
  const errors = await open(page);
  const replay = await page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    const { DeepwaterClaimTile } = (await Function('return import("/src/world/DeepwaterClaimTile.ts")')()) as typeof import('../src/world/DeepwaterClaimTile');
    const run = () => {
      const tile = new DeepwaterClaimTile(registry.loadContract('e5-deepwater-claim'));
      tile.placeBoatBuilding('port', 'turret');
      tile.reanchor('open-water');
      return tile.advance(32);
    };
    return { first: run(), repeated: run() };
  });
  expect(replay.repeated).toEqual(replay.first);
  expect(replay.first.storm.waves).toHaveLength(2);
  expect(replay.first.corsairWaves).toHaveLength(2);
  expect(replay.first.boat.buildings).toEqual([{ buildingId: 'turret', padId: 'port', x: -27, z: 13 }]);
  await artifact(testInfo, 'determinism', replay.first);
  expect(errors).toEqual([]);
});
