import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/fix-e2-railcar-read');
const OWNER_ARTIFACT_DIR = path.resolve('artifacts/railcar-reference-art');
const QUERY = '/?debug&contract=e2-hill-mine&nolevel&nopause&nosteal&nowreck&timescale=1&seed=fix-e2-railcar-read';

async function railcars(page: Page) {
  return page.evaluate(() => window.__GR_TEST__?.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar') ?? []);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('armored railcar enters on its wheels as rolling stock', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('sparkRig.range', 0);
    window.__GR_TEST__?.setWave(11);
    window.__GR_TEST__?.advanceSim(0.4);
  });
  await expect.poll(async () => (await railcars(page)).length).toBe(3);

  const approach = await railcars(page);
  expect(approach.every((enemy) => enemy.presentation.mesh)).toBe(true);
  expect(approach.some((enemy) => !enemy.presentation.visible)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.teleport(-42, -2));
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'approach');

  for (const seconds of [2, 8, 12]) {
    await page.evaluate((delta) => window.__GR_TEST__?.advanceSim(delta), seconds);
    const sample = await railcars(page);
    expect(sample).toHaveLength(3);
    for (const component of sample) {
      expect(component.presentation.mesh).toBe(true);
      expect(Math.abs(component.y - component.presentation.railY)).toBeLessThan(0.01);
    }
  }

  const inField = await railcars(page);
  expect(inField.every((enemy) => enemy.presentation.visible)).toBe(true);
  expect(inField.map((enemy) => enemy.presentation.textureKey.replace('-damaged', '')).sort()).toEqual([
    'boss-railcar-boiler',
    'boss-railcar-cabin',
    'boss-railcar-wheels',
  ]);
  for (const component of inField) {
    const expected = Math.atan2(component.vx, component.vz);
    expect(Math.abs(Math.atan2(Math.sin(component.presentation.railRotation - expected), Math.cos(component.presentation.railRotation - expected)))).toBeLessThan(0.12);
  }
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z + 8), {
    x: inField.reduce((sum, enemy) => sum + enemy.x, 0) / inField.length,
    z: inField.reduce((sum, enemy) => sum + enemy.z, 0) / inField.length,
  });
  await page.waitForTimeout(200);
  await shot(page, testInfo, 'in-field');
  await mkdir(OWNER_ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(OWNER_ARTIFACT_DIR, `${testInfo.project.name}-intact.png`) });

  const beforeEnd = inField.reduce((sum, enemy) => sum + enemy.x, 0) / inField.length;
  await page.evaluate(() => window.__GR_TEST__?.advanceSim(26));
  const atEnd = await railcars(page);
  expect(atEnd).toHaveLength(3);
  expect(atEnd.every((enemy) => enemy.presentation.visible)).toBe(true);
  expect(atEnd.reduce((sum, enemy) => sum + enemy.x, 0) / atEnd.length).toBeGreaterThan(beforeEnd + 45);
  expect(await page.evaluate(() => {
    const test = window.__GR_TEST__;
    return !!test && test.restoreSuspend(test.captureSuspend());
  })).toBe(true);
  expect((await railcars(page)).every((enemy) => enemy.presentation.visible)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.advanceSim(4));
  const returning = await railcars(page);
  expect(returning).toHaveLength(3);
  expect(returning.every((enemy) => enemy.presentation.visible && enemy.vx < 0)).toBe(true);
  expect(returning.reduce((sum, enemy) => sum + enemy.x, 0) / returning.length)
    .toBeLessThan(atEnd.reduce((sum, enemy) => sum + enemy.x, 0) / atEnd.length - 3);
  const bar = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar);
  expect(bar).toMatchObject({ visible: true, aliveComponents: 3, groupId: 'e2-hill-mine:wave-12:railcar' });
  await page.evaluate(({ x, z }) => window.__GR_TEST__?.teleport(x, z + 8), {
    x: returning.reduce((sum, enemy) => sum + enemy.x, 0) / returning.length,
    z: returning.reduce((sum, enemy) => sum + enemy.z, 0) / returning.length,
  });
  await page.waitForTimeout(100);
  await shot(page, testInfo, 'patrol-return');

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('sparkRig.range', 300);
    window.__GR_TEST__?.setBalance('sparkRig.fireRate', 8);
    window.__GR_TEST__?.setBalance('sparkRig.damage', 9999);
    window.__GR_TEST__?.setBalance('sparkRig.boltSpeed', 120);
    window.__GR_TEST__?.setUpgradeStacks({});
    window.__GR_TEST__?.advanceSim(12);
  });
  expect(await railcars(page)).toHaveLength(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.readability.bossHpBar.visible)).toBe(false);

  expect(errors).toEqual([]);
});

test('railcar component swaps to its damaged painted state after a hit', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.evaluate(() => {
    window.__GR_TEST__?.setManualSim(true);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('sparkRig.range', 0);
    window.__GR_TEST__?.setWave(11);
    window.__GR_TEST__?.advanceSim(0.4);
  });
  await expect.poll(async () => (await railcars(page)).length).toBe(3);
  const target = (await railcars(page))[0]!;
  await page.evaluate((damage) => {
    window.__GR_TEST__?.teleport(-42, 8);
    window.__GR_TEST__?.setBalance('sparkRig.range', 300);
    window.__GR_TEST__?.setBalance('sparkRig.damage', damage);
    window.__GR_TEST__?.setBalance('sparkRig.fireRate', 0.2);
    window.__GR_TEST__?.setUpgradeStacks({});
  }, target.maxHp * 0.8);
  await page.evaluate(() => { for (let i = 0; i < 120; i += 1) window.__GR_TEST__?.advanceSim(1 / 15); });
  const damaged = await railcars(page);
  expect(damaged.some((enemy) => enemy.presentation.damaged && enemy.presentation.textureKey.endsWith('-damaged'))).toBe(true);
  expect(damaged.find((enemy) => enemy.presentation.damaged)?.presentation.damageThreshold).toBe(0.5);
  await mkdir(OWNER_ARTIFACT_DIR, { recursive: true });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(OWNER_ARTIFACT_DIR, `${testInfo.project.name}-damaged.png`) });
  expect(errors).toEqual([]);
});
