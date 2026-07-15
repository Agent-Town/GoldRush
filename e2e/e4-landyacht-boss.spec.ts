import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nolevel&nopause&seed=land-yacht';
const ARTIFACT_DIR = path.resolve('artifacts/e4-landyacht-boss');

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-4-motor');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page, watchtower = true): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e4-dust-flats');
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate((placeWatchtower) => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('waves.waveInterval', 0.35);
    test.setBalance('waves.trickleInterval', 999);
    test.setBalance('waves.pulseBase', 0);
    test.setBalance('waves.pulsePerWave', 0);
    test.setBalance('waves.aliveCap', 20);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
    test.setBalance('landYacht.lootIntervalSeconds', 0.3);
    test.setBalance('landYacht.craneGrabCooldownSeconds', 0.1);
    test.grantGold(2_000);
    if (placeWatchtower) test.placeFree('sentry_beacon', 0, 4);
    test.advanceSim(0.2);
  }, watchtower);
  return errors;
}

async function bossWave(page: Page): Promise<number> {
  const wave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.baron?.wave ?? 0);
  expect(wave).toBeGreaterThan(2);
  return wave;
}

async function spawnBoss(page: Page, wave: number): Promise<void> {
  await page.evaluate((boss) => {
    const test = window.__GR_TEST__!;
    test.setWave(boss - 1);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(boss);
    test.advanceSim(0.2);
  }, wave);
  await expect.poll(async () => (await parts(page)).length).toBe(3);
}

async function parts(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'land_yacht'));
}

async function destroyPart(page: Page, componentId: string): Promise<void> {
  const position = await page.evaluate((id) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    const component = snapshot.enemies.active.find((enemy: any) => enemy.variantId === 'land_yacht' && enemy.bossComponentId === id);
    if (!component) return null;
    component.hp = 0.01;
    if (!test.restoreSuspend(snapshot)) return null;
    return test.enemyPositions().find((enemy) => enemy.variantId === 'land_yacht' && enemy.bossComponentId === id) ?? null;
  }, componentId);
  expect(position).not.toBeNull();
  await page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    test.setBalance('blast.damage', 0.02);
    test.launchBlastAt(x, z, 0.05);
    test.advanceSim(0.25);
  }, position!);
  await expect.poll(async () => (await parts(page)).some((enemy) => enemy.bossComponentId === componentId)).toBe(false);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('plays the Land-Yacht acts on the Dust Flats ring road', async ({ page }, testInfo) => {
  const errors = await open(page);
  const wave = await bossWave(page);

  await page.evaluate((boss) => {
    window.__GR_TEST__!.startWaveForTest(boss - 2);
    window.__GR_TEST__!.advanceSim(0.1);
  }, wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 0,
    dreadEvents: 1,
    dreadVisible: true,
  });
  await page.evaluate(() => window.__GR_TEST__!.teleport(-28, 8));
  await shot(page, testInfo, 'act-0-watchtower-dread');

  await spawnBoss(page, wave);
  const before = await parts(page);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.6));
  const after = await parts(page);
  const moved = after.reduce((sum, enemy, index) => sum + Math.hypot(enemy.x - before[index]!.x, enemy.z - before[index]!.z), 0);
  expect(moved).toBeGreaterThan(1);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 1,
    orbiting: true,
  });
  const looting = (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss))!;
  expect(looting.stolenHeads).toBeGreaterThanOrEqual(1);
  expect(looting.escortsFunded).toBe(looting.stolenHeads);
  expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions().some((enemy) => enemy.variantId === 'motor_gang'))).toBe(true);
  const crane = after.find((enemy) => enemy.bossComponentId === 'crane')!;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), crane);
  await shot(page, testInfo, 'act-1-orbit-and-loot');

  const built = await page.evaluate(({ x, z, reach }) => {
    const test = window.__GR_TEST__!;
    test.teleport(x + 2, z);
    return [test.placeFree('turret', x + 2, z), test.placeFree('turret', x + reach + 4, z)];
  }, { x: crane.x, z: crane.z, reach: 6 });
  expect(built).toEqual([true, true]);

  await destroyPart(page, 'wheels');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 2,
    orbiting: false,
    beached: true,
    turretsGrabbed: 1,
  });
  const turretState = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.filter((entry) => entry.id === 'turret'));
  expect(turretState).toHaveLength(2);
  expect(turretState.filter((entry) => entry.wrecked)).toHaveLength(1);
  expect(turretState.filter((entry) => !entry.wrecked)).toHaveLength(1);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), crane);
  await shot(page, testInfo, 'act-2-beached-crane-arc');

  await destroyPart(page, 'crane');
  const wheelhouse = (await parts(page)).find((enemy) => enemy.bossComponentId === 'wheelhouse')!;
  await destroyPart(page, 'wheelhouse');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 3,
    bellTaken: true,
    gangDeparted: true,
    salvageReady: true,
    wreckRemains: true,
  });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), wheelhouse);
  await page.waitForTimeout(500);
  await shot(page, testInfo, 'act-3-gang-quit-salvage');
  expect(errors).toEqual([]);
});

test('arrives without an early warning and holds later acts behind the wheels', async ({ page }) => {
  const errors = await open(page, false);
  const wave = await bossWave(page);
  await page.evaluate((boss) => {
    window.__GR_TEST__!.startWaveForTest(boss - 2);
    window.__GR_TEST__!.advanceSim(0.1);
  }, wave);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({ dreadEvents: 0, dreadVisible: false });

  await spawnBoss(page, wave);
  await destroyPart(page, 'wheelhouse');
  await destroyPart(page, 'crane');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 1,
    beached: false,
    gangDeparted: false,
    salvageReady: false,
  });
  await destroyPart(page, 'wheels');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.landYachtBoss)).toMatchObject({
    act: 3,
    beached: true,
    gangDeparted: true,
    salvageReady: true,
  });
  expect(errors).toEqual([]);
});
