import { expect, test, type Page } from '@playwright/test';
import { profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';

const E2_URL = '/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&seed=e9-arsenal-gate';
const E9_URL = '/?debug&epoch=epoch-9-redfields&contract=e9-dome-basin&nowaves&nolevel&nopause&nosteal&nowreck&seed=e9-arsenal';

async function open(page: Page, url: string, contractId: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      steps: 4,
      taken: ['storm_draw', 'storm_lance', 'storm_fence', 'terraform_cannon'],
      proposalSalt: 0,
      pinnedTarget: null,
    }));
  }, profileDataKey('robin', researchStateKey('epoch-9-redfields')));
  await page.goto(url);
  await page.waitForFunction((id) => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, contractId);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('E9 arsenal is absent before the Red Fields epoch and present at epoch 9', async ({ page }) => {
  const errors = await open(page, E2_URL, 'e2-hill-mine');
  const before = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__!.e9Arsenal,
    deployed: window.__GR_TEST__!.e9Arsenal.deployFence(),
  }));
  expect(before.diagnostics).toMatchObject({ eraActive: false, items: [] });
  expect(before.deployed).toBe(false);

  await page.goto(E9_URL);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  const redFields = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e9Arsenal);
  expect(redFields.eraActive).toBe(true);
  expect(redFields.items).toEqual(['stormDraw', 'stormLance', 'stormFence', 'terraformCannon']);
  expect(errors).toEqual([]);
});

test('Storm-Draw charges from weather, Storm-Lance holds height, Storm Fence denies, and the cannon throws map', async ({ page }) => {
  const errors = await open(page, E9_URL, 'e9-dome-basin');
  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.teleport(-35, -5);
    const turretPlaced = harness.placeFree('turret', -35, -1);
    const fenceDeployed = harness.e9Arsenal.deployFence();
    harness.spawnPack(6, 2, { hpScale: 20, speedScale: 0.01 });
    harness.advanceSim(0.2);
    const earth = harness.e9Arsenal.diagnostics().presentation.terraformCannon;
    harness.advanceSim(3.6);
    return { turretPlaced, fenceDeployed, earth, arsenal: harness.e9Arsenal.diagnostics() };
  });

  expect(result.turretPlaced).toBe(true);
  expect(result.fenceDeployed).toBe(true);
  expect(result.earth).toEqual({ visible: true, ammunition: 'map' });
  expect(result.arsenal.weather.phase).toBe('storm');
  expect(result.arsenal.fires.stormDraw).toBeGreaterThan(0);
  expect(result.arsenal.fires.stormLance).toBeGreaterThan(0);
  expect(result.arsenal.fires.terraformCannon).toBeGreaterThan(0);
  expect(result.arsenal.presentation.stormLance).toMatchObject({ active: 1, tracking: 1 });
  expect(result.arsenal.presentation.stormLance.silhouetteHeight).toBe(result.arsenal.presentation.stormLance.previousTurretSilhouetteHeight);
  expect(result.arsenal.presentation.stormFence.active).toBeGreaterThan(0);
  expect(result.arsenal.denialTicks).toBeGreaterThan(0);
  expect(result.arsenal.pushedDistance).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Cure-Arms free people and power fevered machines down without death events', async ({ page }) => {
  const errors = await open(page, E9_URL, 'e9-dome-basin');
  const outcomes = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.toggleWeapon();
    harness.setBalance('blast.damage', 0);
    harness.setBalance('e9Arsenal.stormDraw.damage', 0);
    harness.setBalance('e9Arsenal.terraformCannon.damage', 200);
    harness.spawnPack(1, 4, { hpScale: 0.2, speedScale: 0.01 });
    harness.advanceSim(1.1);
    harness.spawnPack(1, 4, { hpScale: 0.2, speedScale: 0.01, wrecker: true, variantId: 'steam_wrecker' });
    harness.advanceSim(2.7);
    return harness.e9Arsenal.diagnostics().outcomes;
  });

  expect(outcomes).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'freed_turned_back', lethal: false }),
    expect.objectContaining({ type: 'fevered_machine_powered_down', variantId: 'steam_wrecker', lethal: false }),
  ]));
  expect(outcomes.some((event) => (event.type as string).includes('death'))).toBe(false);
  expect(errors).toEqual([]);
});
