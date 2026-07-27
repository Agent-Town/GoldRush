import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/e2-pressure-garden');
const SLUICE_BANK = { x: 18, z: 7 } as const;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function seedTrestleWin(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.epoch, 'epoch-2-steamworks');
      localStorage.setItem(
        keys.scores,
        JSON.stringify([{ waves: 12, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'e2-trestle', profileName: 'Robin' }]),
      );
    },
    {
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        epoch: ACTIVE_EPOCH_KEY,
        scores: profileDataKey('robin', SCOREBOARD_KEY),
      },
    },
  );
  await page.reload();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

test('Pressure Garden unlocks after Trestle and teaches the pressure loop', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  await seedTrestleWin(page);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await page.getByTestId('contract-page-dot-e2-pressure-garden').click();

  const card = page.getByTestId('contract-card-e2-pressure-garden');
  await expect(card).toHaveAttribute('data-contract-locked', 'false');
  // One render path since The Adoption (3a007ea7); per-card art is guarded by board-card-images.spec.ts.
  await expect(page.getByTestId('contract-art-e2-pressure-garden')).toHaveAttribute('data-contract-art-key', 'plate');
  await expect(page.getByTestId('contract-launch-e2-pressure-garden')).toBeEnabled();
  await shot(page, testInfo, 'board');

  await page.getByTestId('contract-launch-e2-pressure-garden').click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e2-pressure-garden' && window.__THREE_GAME_DIAGNOSTICS__?.pressure.enabled === true,
  );
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e2-pressure-garden');
  await page.goto('/?debug&epoch=epoch-2-steamworks&contract=e2-pressure-garden&nolevel&nopause&nosteal&nowreck&seed=e2-pressure-garden-probe');
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.pressure.enabled === true && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const debugBegin = page.getByRole('button', { name: 'Begin' });
  if (await debugBegin.isVisible()) await debugBegin.click();

  const garden = await page.evaluate(async ({ x, z }) => {
    const terrain = (await Function('return import("/src/world/Terrain.ts")')()) as typeof import('../src/world/Terrain');
    const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as typeof import('../src/game/Balance');
    return {
      contract: window.__THREE_GAME_DIAGNOSTICS__?.contract,
      roster: window.__GR_TEST__?.activeContract().twist.enemyRoster,
      pressure: window.__THREE_GAME_DIAGNOSTICS__?.pressure,
      adjacent: terrain.isWaterSourceAdjacent(x, z, Balance.sluice.riverPad),
      sample: { ...terrain.sample(x, z), buildable: terrain.isBuildable(x, z) },
    };
  }, SLUICE_BANK);
  expect(garden.contract).toMatchObject({ activeId: 'e2-pressure-garden', secureWave: 12 });
  expect(garden.roster).toMatchObject([
    { id: 'rail_tough', waveMin: 1, spawnEdges: ['south'], spawnGates: [{ edge: 'south', x: 0, z: -46 }] },
    { id: 'steam_wrecker', waveMin: 1, spawnEdges: ['east', 'west'] },
    { id: 'coal_thief', waveMin: 1, spawnEdges: ['north'], spawnGates: [{ edge: 'north', x: 0, z: 46 }] },
  ]);
  expect(garden.pressure).toMatchObject({ enabled: true, objective: { waves: '8-12' } });
  expect(garden.pressure?.seams.map(({ x, z }) => ({ x, z }))).toEqual([
    { x: -12, z: 39 },
    { x: -5, z: 43 },
    { x: 3, z: 39 },
  ]);
  expect(garden).toMatchObject({ adjacent: true, sample: { zone: 'bank', buildable: true } });
  await expect(page.evaluate(({ x, z }) => window.__GR_TEST__?.placeFree('sluice', x, z), SLUICE_BANK)).resolves.toBe(true);

  await expect(page.evaluate(() => window.__GR_TEST__?.takeResearchNode('pressure_assay'))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.takeResearchNode('coal_survey'))).resolves.toBe(true);
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.teleport(-12, 39);
    window.__GR_TEST__?.advanceSim(1.2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.coal)).toBe(4);
  for (const x of [-8, 0, 8]) {
    await expect(page.evaluate((at) => window.__GR_TEST__?.placeFree('boiler_house', at, 12), x)).resolves.toBe(true);
  }
  await page.evaluate(() => {
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.advanceSim(1.2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.hotBoilers)).toBe(3);
  await shot(page, testInfo, 'boilers-hot');

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('boilerHouse.pressurePerTick', 0);
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setWave(7);
    window.__GR_TEST__?.advanceSim(2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave)).toBeGreaterThanOrEqual(12);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.pressure.objective.complete)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured)).toBe(true);
  expect(errors).toEqual([]);
});
