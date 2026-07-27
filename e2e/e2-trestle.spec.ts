import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/e2-trestle');
const SLUICE_BANK = { x: 12, z: -7 } as const;

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

async function seedHillMineWin(page: Page): Promise<void> {
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
        JSON.stringify([{ waves: 12, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'e2-hill-mine', profileName: 'Robin' }]),
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

test('The Trestle unlocks after Hill Mine and runs the shipped crossing systems', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  await seedHillMineWin(page);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  // Chapter tabs since 6822607f; chapter derived from the manifest so no literal can freeze again.
  await goToContractPage(page, 'e2-trestle');

  const card = page.getByTestId('contract-card-e2-trestle');
  await expect(card).toHaveAttribute('data-contract-locked', 'false');
  // One render path since The Adoption (3a007ea7); per-card art is guarded by board-card-images.spec.ts.
  await expect(page.getByTestId('contract-art-e2-trestle')).toHaveAttribute('data-contract-art-key', 'plate');
  await expect(page.getByTestId('contract-launch-e2-trestle')).toBeEnabled();
  await shot(page, testInfo, 'board');

  await page.getByTestId('contract-launch-e2-trestle').click();
  await page.waitForFunction(
    () => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e2-trestle' && window.__THREE_GAME_DIAGNOSTICS__?.escort.enabled === true,
  );
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();

  const crossing = await page.evaluate(() => ({
    contract: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    rails: window.__THREE_GAME_DIAGNOSTICS__?.terrain.rails,
    cart: window.__THREE_GAME_DIAGNOSTICS__?.escort,
  }));
  expect(crossing.contract?.activeId).toBe('e2-trestle');
  expect(crossing.contract?.secureWave).toBe(12);
  expect(crossing.rails).toMatchObject({ active: true, paths: 2, style: 'steamworks' });
  expect(crossing.cart).toMatchObject({ enabled: true, state: 'moving', required: 1, objectiveLost: false, x: 0 });
  if (crossing.cart?.enabled) expect(crossing.cart.z).toBeLessThan(-40);

  await page.waitForTimeout(200);
  await shot(page, testInfo, 'crossing');
  await page.goto('/?debug&epoch=epoch-2-steamworks&contract=e2-trestle&mode=escort&nolevel&nopause&nosteal&nowreck&seed=e2-trestle-probe');
  await page.waitForFunction(() => window.__GR_TEST__?.escort().enabled === true && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);

  const bank = await page.evaluate(async ({ x, z }) => {
    const terrain = (await Function('return import("/src/world/Terrain.ts")')()) as typeof import('../src/world/Terrain');
    const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as typeof import('../src/game/Balance');
    return {
      adjacent: terrain.isWaterSourceAdjacent(x, z, Balance.sluice.riverPad),
      sample: { ...terrain.sample(x, z), buildable: terrain.isBuildable(x, z) },
    };
  }, SLUICE_BANK);
  expect(bank).toMatchObject({ adjacent: true, sample: { zone: 'bank', buildable: true } });
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
  expect(bossWindow.railcars.every((enemy) => enemy.bossGroupId === 'e2-trestle:wave-12:railcar')).toBe(true);
  expect(errors).toEqual([]);
});
