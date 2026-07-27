import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

const SLUICE_BANK = { x: 24, z: 7 } as const;

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedPressureGardenWin(page: Page): Promise<void> {
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
        JSON.stringify([{ waves: 12, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'e2-pressure-garden', profileName: 'Robin' }]),
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

async function goToContractPage(page: Page, id: string): Promise<void> {
  const chapter = listEpochs().find((epoch) => loadEpoch(epoch.id).contracts.some((contract) => contract.id === id));
  if (!chapter) throw new Error(`Missing chapter for ${id}`);
  await page.getByTestId(`contract-chapter-tab-${chapter.id}`).click();
  await expect(page.getByTestId(`contract-card-${id}`)).toBeVisible();
}

test('The Incline boots shipped data: upper cart, lower boss rail, and legal sluice bank', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  await seedPressureGardenWin(page);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  // Chapter tabs since 6822607f; chapter derived from the manifest so no literal can freeze again.
  await goToContractPage(page, 'e2-incline');

  const card = page.getByTestId('contract-card-e2-incline');
  await expect(card).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-launch-e2-incline')).toBeEnabled();
  await page.getByTestId('contract-launch-e2-incline').click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e2-incline' && window.__THREE_GAME_DIAGNOSTICS__?.escort.enabled === true,
  );
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();

  const launch = await page.evaluate(() => ({
    contract: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
    cart: window.__THREE_GAME_DIAGNOSTICS__?.escort,
  }));
  expect(launch.contract).toMatchObject({ activeId: 'e2-incline', secureWave: 12 });
  expect(launch.rails).toMatchObject({ active: true, paths: 2, style: 'steamworks' });
  expect(launch.cart).toMatchObject({ enabled: true, state: 'moving', required: 1, objectiveLost: false, x: 12 });

  await page.goto('/?debug&epoch=epoch-2-steamworks&contract=e2-incline&mode=escort&nolevel&nopause&nosteal&nowreck&seed=e2-incline-probe');
  await page.waitForFunction(() => window.__GR_TEST__?.escort().enabled === true && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  const debugBegin = page.getByRole('button', { name: 'Begin' });
  if (await debugBegin.isVisible()) await debugBegin.click();

  const bank = await page.evaluate(async ({ x, z }) => {
    const terrain = (await Function('return import("/src/world/Terrain.ts")')()) as typeof import('../src/world/Terrain');
    const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as typeof import('../src/game/Balance');
    return {
      adjacent: terrain.isWaterSourceAdjacent(x, z, Balance.sluice.riverPad),
      sample: { ...terrain.sample(x, z), buildable: terrain.isBuildable(x, z) },
      escortRoute: window.__GR_TEST__?.activeContract().modes?.[0].railRouteIndex,
      bossRoute: window.__GR_TEST__?.activeContract().twist.baron?.railRouteIndex,
    };
  }, SLUICE_BANK);
  expect(bank).toMatchObject({ adjacent: true, sample: { zone: 'bank', buildable: true }, escortRoute: 1, bossRoute: 0 });
  await expect(page.evaluate(({ x, z }) => window.__GR_TEST__?.placeFree('sluice', x, z), SLUICE_BANK)).resolves.toBe(true);

  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setWave(11);
    window.__GR_TEST__?.advanceSim(1.2);
  });
  const bossWindow = await page.evaluate(() => ({
    wave: window.__THREE_GAME_DIAGNOSTICS__?.wave,
    railcars: window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar') ?? [],
  }));
  expect(bossWindow.wave).toBeGreaterThanOrEqual(12);
  expect(bossWindow.railcars).toHaveLength(3);
  expect(bossWindow.railcars.every((enemy) => enemy.bossGroupId === 'e2-incline:wave-12:railcar')).toBe(true);
  expect(bossWindow.railcars.every((enemy) => enemy.x > -13 && enemy.x < -11 && enemy.z < -40)).toBe(true);
  expect(errors).toEqual([]);
});
