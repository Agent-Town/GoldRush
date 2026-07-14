import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1';
const ARTIFACT_DIR = 'artifacts/canyon-works';
const PYLONS = [
  [-12, -36], [-24, -20], [-28, 8],
  [12, -36], [24, -20], [28, 8],
] as const;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function open(page: Page): Promise<string[]> {
  const errors = watchErrors(page);
  await page.goto(`/${QUERY}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
}

test('strings the gorge, holds the night, and restores a cut span', async ({ page }, testInfo) => {
  const errors = await open(page);
  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  expect(contract).toMatchObject({
    activeId: 'e3-canyon-works',
    epochId: 'epoch-3-voltage',
    secureWave: 12,
    tileParams: {
      dimensions: { width: 96, height: 112 },
      damChannel: { minX: -48, maxX: 48, minZ: -6.25, maxZ: 6.25 },
    },
    dayNightCycle: { waveSchedule: { duskWave: 4, darkWave: 8 } },
  });

  expect(await page.evaluate((sites) => {
    window.__GR_TEST__!.grantGold(1_000);
    return sites.map(([x, z]) => window.__GR_TEST__!.placeFree('sentry_beacon', x, z));
  }, PYLONS)).toEqual([true, true, true, true, true, true]);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks)).toEqual({
    powered: 2, required: 2, byWave: 6, complete: true, failed: false,
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({
    totalSupplyWatts: 26,
    totalDemandWatts: 28,
    cutWireCount: 0,
    components: [{ state: 'brown', supplyWatts: 26, demandWatts: 28 }],
  });
  await expect(page.getByTestId('hud-power')).toContainText('CONNECT COMPLETE');

  const dayHud = await page.locator('#hud').evaluate((element) => getComputedStyle(element).filter);
  await page.evaluate(() => window.__GR_TEST__!.setWave(6));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift)).toMatchObject({ phase: 'dusk', darkness: 0.5 });
  expect(await page.locator('#hud').evaluate((element) => getComputedStyle(element).filter)).toBe(dayHud);
  await shot(page, testInfo, 'dusk-lit-chain');

  await page.evaluate(() => window.__GR_TEST__!.setWave(8));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift)).toMatchObject({ phase: 'dark', darkness: 1 });
  const lamp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.find((node) => node.id === 'lamp-east'));
  expect(lamp?.state).toBe('powered');
  const full = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32));
  expect(full).toBeGreaterThan(0.95);
  expect(await page.evaluate(() => window.__GR_TEST__!.spawnMoths(1, 30, 32))).toBe(1);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm)).toMatchObject({ alive: 1, attached: 1, sourceId: 'lantern:1' });
  expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeLessThan(full * 0.6);
  await shot(page, testInfo, 'moth-cloud-lamp');
  await page.evaluate(() => {
    window.__GR_TEST__!.setBalance('sparkRig.damage', 100);
    window.__GR_TEST__!.setBalance('sparkRig.fireRate', 20);
    window.__GR_TEST__!.teleport(32, 32);
    window.__GR_TEST__!.advanceSim(2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.alive)).toBe(0);
  expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeGreaterThan(0.95);

  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 4))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks?.powered)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({ cutWireCount: 1 });
  await expect(page.getByTestId('hud-power')).toContainText('CONNECT COMPLETE');
  await shot(page, testInfo, 'brown-out-cut-span');

  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(24, -20);
    window.__GR_TEST__!.grantGold(100);
    window.__GR_TEST__!.repair('sentry_beacon', 4);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks?.complete)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.cutWireCount)).toBe(0);

  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(12);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(true);
  expect(errors).toEqual([]);
});

test('keeps the Voltage era gate and saboteur ledger explicit', async ({ page }) => {
  const errors = await open(page);
  const proof = await page.evaluate(async () => {
    const registry = (await import('../src/meta/ContractFamilies'));
    const contract = registry.loadContract('e3-canyon-works');
    return {
      active: registry.epochIsActive('epoch-3-voltage'),
      unlock: contract.boardRow.unlock,
      saboteur: contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur'),
      masks: {
        build: contract.tileParams.buildZones?.map((zone) => zone.id),
        pylon: contract.tileParams.pylonSites?.map((site) => site.id),
        spawn: contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur')?.spawnGates,
      },
    };
  });
  expect(proof).toMatchObject({
    active: true,
    unlock: 'default',
    saboteur: { label: 'Fevered Saboteur', wrecker: true, tint: '#6f806c' },
  });
  expect(proof.masks.build).toHaveLength(5);
  expect(proof.masks.pylon).toHaveLength(6);
  expect(proof.masks.spawn).toHaveLength(2);
  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(12);
    window.__GR_TEST__!.advanceSim(0.2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks?.failed)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(false);
  expect(errors).toEqual([]);
});
