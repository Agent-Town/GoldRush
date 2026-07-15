import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-blackout-ridge&nowaves&nospawn&nolevel&nopause&seed=stored-breath-1';
const ARTIFACT_DIR = 'artifacts/blackout-ridge';

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) {
    await page.evaluate(() => document.querySelector<HTMLButtonElement>('[data-testid="contract-briefing-dismiss"]')?.click());
  }
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('banks stored breath through a trunk cut, then recharges on repair', async ({ page }, testInfo) => {
  const errors = await open(page);
  expect(await page.evaluate(() => window.__GR_TEST__!.activeContract())).toMatchObject({
    id: 'e3-blackout-ridge',
    tileParams: {
      dimensions: { width: 80, height: 96 },
      ridgeGlow: { x: -38, z: -44, color: '#79c8bd', intensity: 1.35 },
    },
    twist: { secureWave: 12 },
    boardRow: { unlock: 'secured:e3-canyon-works' },
  });

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({
    totalSupplyWatts: 36,
    totalDemandWatts: 12,
    cutWireCount: 0,
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter((entry) => entry.id === 'sentry_beacon'))).toHaveLength(3);

  expect(await page.evaluate(() => [
    window.__GR_TEST__!.placeFree('capacitor_bank', 6, 4),
    window.__GR_TEST__!.placeFree('capacitor_bank', 16, 4),
  ])).toEqual([true, true]);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(17.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes
    .filter((node) => node.kind === 'storage').map((node) => node.storedWh))).toEqual([0.05, 0.05]);

  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 1))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(10));
  const breathing = await page.evaluate(() => {
    const power = window.__THREE_GAME_DIAGNOSTICS__!.power;
    return {
      lamps: power.nodes.filter((node) => node.kind === 'consumer').map((node) => node.state),
      storedWh: power.nodes.filter((node) => node.kind === 'storage').reduce((sum, node) => sum + (node.storedWh ?? 0), 0),
      dischargeWatts: power.components.reduce((sum, component) => sum + (component.storageDischargeWatts ?? 0), 0),
    };
  });
  expect(breathing.lamps).toEqual(['powered', 'powered']);
  expect(breathing.storedWh).toBeGreaterThan(0.06);
  expect(breathing.storedWh).toBeLessThan(0.07);
  expect(Math.abs((0.1 - breathing.storedWh) - 10 * 12 / 3600)).toBeLessThan(0.003);
  expect(breathing.dischargeWatts).toBe(12);
  if (await page.getByTestId('story-beat-card').isVisible()) await page.mouse.click(6, 6);
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(12, 15);
    document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none');
  });
  await shot(page, testInfo, 'stored-breath-cut-10s');

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(20.2));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes
    .filter((node) => node.kind === 'consumer').map((node) => node.state))).toEqual(['dark', 'dark']);

  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(-18, -18);
    window.__GR_TEST__!.grantGold(100);
    window.__GR_TEST__!.repair('sentry_beacon', 1);
    window.__GR_TEST__!.advanceSim(0.5);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.cutWireCount)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes
    .filter((node) => node.kind === 'storage').some((node) => (node.chargeWatts ?? 0) > 0))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(17.5));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes
    .filter((node) => node.kind === 'storage').map((node) => node.storedWh))).toEqual([0.05, 0.05]);

  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(12));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(true);
  expect(errors).toEqual([]);
});

test('publishes masks first and keeps the trunk target explicit', async ({ page }) => {
  const errors = await open(page);
  const masks = await page.evaluate(() => {
    const contract = window.__GR_TEST__!.activeContract();
    const saboteur = contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur');
    return {
      build: contract.tileParams.buildZones?.map((zone) => zone.id),
      trunk: contract.tileParams.pylonSites?.map((site) => site.id),
      capacitor: contract.tileParams.capacitorSites?.map((site) => site.id),
      spawn: saboteur?.spawnGates,
      saboteur,
    };
  });
  expect(masks.build).toHaveLength(3);
  expect(masks.trunk).toHaveLength(3);
  expect(masks.capacitor).toHaveLength(2);
  expect(masks.spawn).toHaveLength(2);
  expect(masks.saboteur).toMatchObject({ label: 'Trunk Saboteur', wrecker: true, tint: '#6f806c' });
  expect(errors).toEqual([]);
});
