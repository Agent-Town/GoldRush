import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&seed=crawler-boss';
const ARTIFACT_DIR = path.resolve('artifacts/e3-crawler-boss');
const PYLONS = [
  [-12, -36], [-24, -20], [-28, 8],
  [12, -36], [24, -20], [28, 8],
] as const;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page, placePylons = true): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(({ sites, place }) => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('waves.waveInterval', 0.35);
    test.setBalance('waves.trickleInterval', 999);
    test.setBalance('waves.pulseBase', 0);
    test.setBalance('waves.pulsePerWave', 0);
    test.setBalance('waves.aliveCap', 0);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
    test.grantGold(1_000);
    if (place) for (const [x, z] of sites) test.placeFree('sentry_beacon', x, z);
    test.advanceSim(0.2);
  }, { sites: PYLONS, place: placePylons });
  return errors;
}

async function crawlerParts(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'dynamo_crawler'));
}

async function destroyPart(page: Page, componentId: string): Promise<void> {
  const position = await page.evaluate((id) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    const component = snapshot.enemies.active.find((enemy: any) => enemy.variantId === 'dynamo_crawler' && enemy.bossComponentId === id);
    if (!component) return null;
    component.hp = 0.01;
    if (!test.restoreSuspend(snapshot)) return null;
    return test.enemyPositions().find((enemy) => enemy.variantId === 'dynamo_crawler' && enemy.bossComponentId === id) ?? null;
  }, componentId);
  expect(position).not.toBeNull();
  await page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    test.setBalance('blast.damage', 0.02);
    test.launchBlastAt(x, z, 0.05);
    test.advanceSim(0.25);
  }, position!);
  await expect.poll(async () => (await crawlerParts(page)).some((enemy) => enemy.bossComponentId === componentId)).toBe(false);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('plays the four Crawler acts and leaves the town its wreck', async ({ page }, testInfo) => {
  const errors = await open(page);
  const fullCoverage = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32));
  const waveHornBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.audio.startedBySound['wave-start-horn'] ?? 0);

  await page.evaluate(() => {
    window.__GR_TEST__!.startWaveForTest(12);
    window.__GR_TEST__!.advanceSim(0.1);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 0,
    flickerEvents: 1,
    flickerActive: true,
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift.lampIntensityMult)).toBe(0.08);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.audio.startedBySound['wave-start-horn'] ?? 0)).toBe(waveHornBefore);

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.advanceSim(0.5);
    test.setWave(13);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(14);
  });
  await expect.poll(async () => (await crawlerParts(page)).length).toBe(3);
  const act1Parts = await crawlerParts(page);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), {
    x: act1Parts.reduce((sum, enemy) => sum + enemy.x, 0) / act1Parts.length,
    z: act1Parts.reduce((sum, enemy) => sum + enemy.z, 0) / act1Parts.length,
  });
  await page.waitForTimeout(800);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 1,
    drainActive: true,
    drainWatts: 18,
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({ totalSupplyWatts: 26, totalDemandWatts: 46 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.find((node) => node.id === 'crawler-drain-west-rim'))).toMatchObject({ online: true, allocatedWatts: 18 });
  expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeLessThan(fullCoverage * 0.6);
  await shot(page, testInfo, 'act-1-drain-beam');

  expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 2))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.4));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.drainTarget)).toBe('pylon-west-switch');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.find((node) => node.id === 'crawler-drain-west-switch'))).toMatchObject({ online: true, allocatedWatts: 18 });
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(-28, 8);
    test.grantGold(100);
    test.repair('sentry_beacon', 2);
    test.advanceSim(0.4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.drainTarget)).toBe('pylon-west-rim');

  await destroyPart(page, 'drain_mast');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({ act: 2, drainActive: false, bursts: 0 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.totalDemandWatts)).toBe(28);
  expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeGreaterThan(fullCoverage * 0.9);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(3.1));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.dialVisible)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.bursts)).toBe(0);
  const dialPart = (await crawlerParts(page)).find((enemy) => enemy.bossComponentId === 'capacitor_bank')!;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), dialPart);
  await page.waitForTimeout(800);
  await shot(page, testInfo, 'act-2-visible-dial');
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(40, -40);
    window.__GR_TEST__!.advanceSim(1);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.bursts)).toBe(1);

  await destroyPart(page, 'tracks');
  const pinned = (await crawlerParts(page)).find((enemy) => enemy.bossComponentId === 'capacitor_bank')!;
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  const afterPin = (await crawlerParts(page)).find((enemy) => enemy.bossComponentId === 'capacitor_bank')!;
  expect(Math.hypot(afterPin.x - pinned.x, afterPin.z - pinned.z)).toBeLessThan(0.01);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.tracksPinned)).toBe(true);

  const wreckPosition = (await crawlerParts(page)).find((enemy) => enemy.bossComponentId === 'capacitor_bank')!;
  await destroyPart(page, 'capacitor_bank');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 3,
    overchargeActive: true,
    turretFireRateMult: 2,
    wreckRemains: true,
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift)).toMatchObject({ phase: 'full', darkness: 0 });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), wreckPosition);
  await page.waitForTimeout(800);
  await shot(page, testInfo, 'act-3-gift-back-wreck');

  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.baronCeremony.active)).toBe(false);
  const secured = page.getByTestId('claim-secured');
  if (await secured.isVisible()) await page.getByTestId('stay-for-rush').click();
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(10.1));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    overchargeActive: false,
    turretFireRateMult: 1,
    wreckRemains: true,
  });
  expect(errors).toEqual([]);
});

test('holds later component effects until their preceding acts are complete', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setWave(13);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(14);
  });
  await expect.poll(async () => (await crawlerParts(page)).length).toBe(3);

  await destroyPart(page, 'capacitor_bank');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 1,
    drainActive: true,
    tracksPinned: false,
    overchargeActive: false,
    wreckRemains: false,
  });
  await destroyPart(page, 'tracks');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({ act: 1, tracksPinned: false });
  await destroyPart(page, 'drain_mast');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 3,
    tracksPinned: true,
    overchargeActive: true,
    wreckRemains: true,
  });
  expect(errors).toEqual([]);
});

test('restores crawler act timers without revealing the offstage Baron', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setWave(13);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(14);
    test.advanceSim(0.2);
  });
  await expect.poll(async () => (await crawlerParts(page)).length).toBe(3);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('gr.claimLedger.discovered.v1') ?? '[]'))).not.toContain('baron');

  const act1 = await page.evaluate(() => structuredClone(window.__GR_TEST__!.captureSuspend()));
  await destroyPart(page, 'drain_mast');
  await destroyPart(page, 'tracks');
  await destroyPart(page, 'capacitor_bank');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.act)).toBe(3);

  expect(await page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), act1)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  await expect.poll(async () => (await crawlerParts(page)).length).toBe(3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 1,
    drainActive: true,
    overchargeActive: false,
    wreckRemains: false,
  });

  await destroyPart(page, 'drain_mast');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(3.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.dialVisible)).toBe(true);
  const dial = await page.evaluate(() => structuredClone(window.__GR_TEST__!.captureSuspend()));
  const savedBursts = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss!.bursts);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(1));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss!.bursts)).toBe(savedBursts + 1);
  expect(await page.evaluate((snapshot) => window.__GR_TEST__!.restoreSuspend(snapshot), dial)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.05));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss)).toMatchObject({
    act: 2,
    dialVisible: true,
    bursts: savedBursts,
    overchargeActive: false,
    wreckRemains: false,
  });
  expect(errors).toEqual([]);
});

test('does not turn a failed CONNECT objective into a boss victory', async ({ page }) => {
  const errors = await open(page, false);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.startWaveForTest(12);
    test.setWave(13);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(14);
  });
  await expect.poll(async () => (await crawlerParts(page)).length).toBe(3);
  await destroyPart(page, 'drain_mast');
  await destroyPart(page, 'tracks');
  await destroyPart(page, 'capacitor_bank');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.crawlerBoss?.wreckRemains)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks)).toMatchObject({ complete: false, failed: true });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(false);
  expect(errors).toEqual([]);
});
