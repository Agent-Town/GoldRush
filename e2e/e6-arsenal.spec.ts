import { expect, test, type Page } from '@playwright/test';
import { profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';

const E2_URL = '/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&nosteal&nowreck&seed=e6-arsenal-gate';
const E6_URL = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nowaves&nolevel&nopause&nosteal&nowreck&seed=e6-arsenal';

async function open(page: Page, url: string, contractId: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      version: 1,
      steps: 3,
      taken: ['sunline_beam', 'half_life_caltrops', 'sunline_mount'],
      proposalSalt: 0,
      pinnedTarget: null,
    }));
  }, profileDataKey('robin', researchStateKey('epoch-6-atomic')));
  await page.goto(url);
  await page.waitForFunction((id) => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, contractId);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('E6 arsenal is absent before the Atomic epoch and present at epoch 6', async ({ page }) => {
  const errors = await open(page, E2_URL, 'e2-hill-mine');
  const before = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__!.e6Arsenal,
    deployed: window.__GR_TEST__!.e6Arsenal.deployCaltrops(),
  }));
  expect(before.diagnostics).toMatchObject({ eraActive: false, items: [] });
  expect(before.deployed).toBe(false);

  await page.goto(E6_URL);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  const atomic = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e6Arsenal);
  expect(atomic.eraActive).toBe(true);
  expect(atomic.items).toEqual(['sunlineBeam', 'sunlineMount', 'halfLifeCaltrops', 'tongsThrown']);
  expect(errors).toEqual([]);
});

test('the four Atomic additions fire, track, deny, and expire on a visible dial', async ({ page }) => {
  const errors = await open(page, E6_URL, 'e6-glow-mesa');
  const active = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.teleport(0, -24);
    const turretPlaced = harness.placeFree('turret', 0, -20);
    harness.spawnPack(6, 2, { hpScale: 20, speedScale: 0.01 });
    harness.advanceSim(0.1);
    return { turretPlaced, arsenal: harness.e6Arsenal.diagnostics() };
  });

  expect(active.turretPlaced).toBe(true);
  expect(active.arsenal.fires).toMatchObject({ sunlineBeam: expect.any(Number), sunlineMount: expect.any(Number), tongsThrown: expect.any(Number) });
  expect(active.arsenal.fires.sunlineBeam).toBeGreaterThan(0);
  expect(active.arsenal.fires.sunlineMount).toBeGreaterThan(0);
  expect(active.arsenal.fires.tongsThrown).toBeGreaterThan(0);
  expect(active.arsenal.presentation.beam).toEqual({ visible: true, smoke: false });
  expect(active.arsenal.presentation.mount).toMatchObject({ active: 1, tracking: 1 });
  expect(active.arsenal.presentation.mount.silhouetteHeight).toBe(active.arsenal.presentation.mount.previousTurretSilhouetteHeight);
  expect(active.arsenal.presentation.caltrops.active).toBe(1);
  expect(active.arsenal.presentation.caltrops.visibleDials).toBe(1);
  expect(active.arsenal.denialTicks).toBeGreaterThan(0);
  expect(active.arsenal.presentation.tongs).toEqual({ visible: true, delivery: 'underhand-arc' });

  const expired = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.resetRun();
    harness.setManualSim(true);
    harness.setBalance('e6Arsenal.halfLifeCaltrops.durationTicks', 4);
    const deployed = harness.e6Arsenal.deployCaltrops();
    const initial = harness.e6Arsenal.diagnostics().presentation.caltrops;
    harness.advanceSim(0.2);
    return { deployed, initial, final: harness.e6Arsenal.diagnostics().presentation.caltrops };
  });
  expect(expired.deployed).toBe(true);
  expect(expired.initial).toMatchObject({ active: 1, visibleDials: 1 });
  expect(expired.final).toMatchObject({ active: 0, visibleDials: 0 });
  expect(errors).toEqual([]);
});

test('Cure-Arms turn people back and power fevered machines down without death outcomes', async ({ page }) => {
  const errors = await open(page, E6_URL, 'e6-glow-mesa');
  const outcomes = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('e6Arsenal.sunlineBeam.damage', 200);
    harness.spawnPack(1, 4, { hpScale: 0.2, speedScale: 0.01 });
    harness.advanceSim(0.35);
    harness.advanceSim(0.8);
    harness.spawnPack(1, 4, { hpScale: 0.2, speedScale: 0.01, wrecker: true, variantId: 'steam_wrecker' });
    harness.advanceSim(0.35);
    return harness.e6Arsenal.diagnostics().outcomes;
  });

  expect(outcomes).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'freed_turned_back', lethal: false }),
    expect.objectContaining({ type: 'fevered_machine_powered_down', variantId: 'steam_wrecker', lethal: false }),
  ]));
  expect(outcomes.some((event) => (event.type as string).includes('death'))).toBe(false);
  expect(errors).toEqual([]);
});
