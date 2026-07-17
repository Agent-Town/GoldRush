import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&seed=homemaker-9000';
const SHOT_DIR = path.resolve('reviews/shots-homemaker');

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ epochKey }) => {
  if (!sessionStorage.getItem('homemaker-test')) {
    localStorage.clear();
    sessionStorage.setItem('homemaker-test', '1');
  }
  localStorage.setItem(epochKey, 'epoch-6-atomic');
}, { epochKey: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  await dismissBriefing(page);
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('waves.waveInterval', 0.35);
    harness.setBalance('waves.trickleInterval', 999);
    harness.setBalance('waves.pulseBase', 0);
    harness.setBalance('waves.pulsePerWave', 0);
    harness.setBalance('waves.aliveCap', 20);
    harness.setBalance('enemy.contactDamage', 0);
    harness.setBalance('sparkRig.range', 0);
    harness.setBalance('homemaker.arrivalSpeed', 40);
    harness.setBalance('homemaker.unbuildIntervalSeconds', 0.6);
    harness.setBalance('homemaker.rackIntervalSeconds', 0.55);
    harness.setBalance('homemaker.rackTelegraphSeconds', 0.15);
    harness.setBalance('homemaker.rackDamage', 4);
    harness.setBalance('homemaker.pileSpeed', 30);
    harness.setBalance('stockpile.capBonus', 5_000);
    harness.grantGold(2_000);
  });
  return errors;
}

async function dismissBriefing(page: Page): Promise<void> {
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
}

async function homemaker(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.homemakerBoss!);
}

async function components(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'homemaker_9000'));
}

async function placePaid(page: Page, id: 'stockpile' | 'palisade', x: number, z: number): Promise<void> {
  expect(await page.evaluate(({ buildable, px, pz }) => window.__GR_TEST__!.placeFree(buildable, px, pz), { buildable: id, px: x, pz: z })).toBe(true);
  expect(await page.evaluate(({ buildable, cost }) => {
    const harness = window.__GR_TEST__!;
    const snapshot = structuredClone(harness.captureSuspend()) as any;
    const building = [...snapshot.buildings].reverse().find((entry: any) => entry.id === buildable);
    if (!building) return false;
    building.buildCost = cost;
    return harness.restoreSuspend(snapshot);
  }, { buildable: id, cost: id === 'stockpile' ? 60 : 10 })).toBe(true);
}

async function spawnBoss(page: Page, wave: number): Promise<void> {
  await page.evaluate((bossWave) => {
    const harness = window.__GR_TEST__!;
    harness.setWave(bossWave - 1);
    harness.advanceSim(0.4);
    harness.setBalance('waves.waveInterval', 999);
    harness.setWave(bossWave);
    harness.advanceSim(0.35);
  }, wave);
  await expect.poll(async () => (await components(page)).map((part) => part.bossComponentId).sort()).toEqual(['rack', 'vac']);
  await expect.poll(() => homemaker(page)).toMatchObject({ act: 1, active: true, liveComponents: ['vac', 'rack'] });
}

async function destroyComponent(page: Page, componentId: 'vac' | 'core'): Promise<void> {
  const target = await page.evaluate((id) => {
    const harness = window.__GR_TEST__!;
    const snapshot = structuredClone(harness.captureSuspend()) as any;
    const component = snapshot.enemies.active.find((enemy: any) => enemy.variantId === 'homemaker_9000' && enemy.bossComponentId === id);
    if (!component) return null;
    component.hp = 0.01;
    if (!harness.restoreSuspend(snapshot)) return null;
    return harness.enemyPositions().find((enemy) => enemy.variantId === 'homemaker_9000' && enemy.bossComponentId === id) ?? null;
  }, componentId);
  expect(target).not.toBeNull();
  await page.evaluate(({ x, z }) => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('blast.damage', 1);
    harness.launchBlastAt(x, z, 0.05);
    harness.advanceSim(0.3);
  }, target!);
  await expect.poll(async () => (await components(page)).some((part) => part.bossComponentId === componentId)).toBe(false);
}

async function screenshot(page: Page, testInfo: TestInfo, name: 'act1-unbuild' | 'act3-chair'): Promise<void> {
  if (testInfo.project.name !== 'desktop-chrome') return;
  await mkdir(SHOT_DIR, { recursive: true });
  const storyBeat = page.getByTestId('story-beat-card');
  if (await storyBeat.isVisible()) {
    await page.mouse.click(6, 6);
    await expect(storyBeat).toBeHidden();
  }
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`) });
}

async function skipCeremony(page: Page): Promise<void> {
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.baronCeremony.active)).toBe(false);
  const secured = page.getByTestId('claim-secured');
  if (await secured.isVisible()) {
    await page.getByTestId('stay-for-rush').click();
    await expect(secured).toBeHidden();
  }
}

test('unbuilds, tidies, makes one chair, and remains kept without ever hurting the player', async ({ page }, testInfo) => {
  const errors = await open(page);
  await placePaid(page, 'stockpile', 0, -13);
  await placePaid(page, 'stockpile', 8, -13);
  await placePaid(page, 'palisade', -5, -16);
  await placePaid(page, 'palisade', 5, -16);
  const wave = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.baron?.wave ?? 0);
  expect(wave).toBeGreaterThan(2);

  await page.evaluate((bossWave) => window.__GR_TEST__!.startWaveForTest(bossWave - 2), wave);
  await expect.poll(() => homemaker(page)).toMatchObject({ act: 0, tidiedMarkers: 1 });
  await page.evaluate((bossWave) => window.__GR_TEST__!.startWaveForTest(bossWave - 1), wave);
  await expect.poll(() => homemaker(page)).toMatchObject({ act: 0, tidiedMarkers: 2 });

  const playerHp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp);
  await spawnBoss(page, wave);
  expect(Object.fromEntries((await components(page)).map((part) => [part.bossComponentId, [part.hp, part.maxHp]]))).toEqual({
    vac: [100, 100],
    rack: [90, 90],
  });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.3));
  await expect.poll(() => homemaker(page)).toMatchObject({ act: 1, unbuilds: 1, partsStackPickups: 1 });
  expect((await homemaker(page)).unbuildOrder[0]).toMatch(/^stockpile:/);
  expect((await page.evaluate(() => window.__GR_TEST__!.goldPickups().filter((pickup) => pickup.active))).length).toBeGreaterThanOrEqual(1);
  const anchor = (await homemaker(page)).position;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 9), anchor);
  await expect(page.locator('canvas')).toHaveAttribute('data-homemaker3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-homemaker3d-mounted', 'true');
  await screenshot(page, testInfo, 'act1-unbuild');

  const refund = await page.evaluate(() => window.__GR_TEST__!.goldPickups().find((pickup) => pickup.active && pickup.source === 'demolish'));
  expect(refund).toMatchObject({ amount: 30, source: 'demolish' });
  const refundBefore = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
    reclaimed: window.__THREE_GAME_DIAGNOSTICS__!.economy.summary.reclaimed,
  }));
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__!.teleport(x, z);
    window.__GR_TEST__!.advanceSim(0.1);
  }, refund!.position);
  expect(await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
    reclaimed: window.__THREE_GAME_DIAGNOSTICS__!.economy.summary.reclaimed,
  }))).toEqual({ gold: refundBefore.gold + 30, reclaimed: refundBefore.reclaimed });
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 9), anchor);

  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.7));
  const act1 = await homemaker(page);
  expect(act1.rackArcs).toBeGreaterThan(0);
  expect(act1.structureDamageEvents).toBeGreaterThan(0);
  expect(act1.playerDamageEvents).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBe(playerHp);

  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.spawnGoldPickup(-18, -2, 3);
    harness.spawnGoldPickup(18, -2, 4);
    harness.spawnGoldPickup(-16, 8, 5);
    harness.spawnGoldPickup(16, 8, 6);
  });
  const beforePiles = await page.evaluate(() => window.__GR_TEST__!.goldPickups().filter((pickup) => pickup.active).map((pickup) => pickup.position));
  await destroyComponent(page, 'vac');
  await expect.poll(() => homemaker(page)).toMatchObject({ act: 2, pictogram: 'broom' });
  await expect.poll(async () => {
    const core = (await components(page)).find((part) => part.bossComponentId === 'core');
    return core ? [core.hp, core.maxHp] : null;
  }).toEqual([160, 160]);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.8));
  const act2 = await homemaker(page);
  expect(act2.pickupsCurated).toBeGreaterThanOrEqual(4);
  expect(act2.rackArcs).toBeGreaterThan(act1.rackArcs);
  const afterPiles = await page.evaluate(() => window.__GR_TEST__!.goldPickups().filter((pickup) => pickup.active).map((pickup) => pickup.position));
  const distanceToPiles = (point: { x: number; z: number }) => Math.min(...act2.pileCenters.map((center) => Math.hypot(point.x - center.x, point.z - center.z)));
  expect(Math.min(...afterPiles.map(distanceToPiles))).toBeLessThan(Math.min(...beforePiles.map(distanceToPiles)));

  await destroyComponent(page, 'core');
  await expect.poll(() => homemaker(page)).toMatchObject({
    act: 3,
    pictogram: 'DONE',
    chairPlaced: true,
    poweredDown: true,
    nonHostile: true,
    kept: true,
    persistentKept: false,
  });
  expect((await homemaker(page)).playerDamageEvents).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.hp)).toBe(playerHp);
  const finishedAt = (await homemaker(page)).position;
  await expect.poll(() => page.evaluate(() => {
    const standard = window.__THREE_GAME_DIAGNOSTICS__!.baronStandard;
    return { x: standard.x, z: standard.z };
  })).toEqual(finishedAt);
  await skipCeremony(page);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(8));
  const chair = (await homemaker(page)).position;
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 9), chair);
  await expect(page.locator('canvas')).toHaveAttribute('data-homemaker3d-presentation', 'chair');
  await expect(page.locator('canvas')).toHaveAttribute('data-homemaker3d-damage-states', /"core":"broken"/);
  await screenshot(page, testInfo, 'act3-chair');

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  await dismissBriefing(page);
  await expect.poll(() => homemaker(page)).toMatchObject({
    active: false,
    act: 3,
    chairPlaced: true,
    poweredDown: true,
    nonHostile: true,
    kept: true,
    persistentKept: true,
  });
  expect((await homemaker(page)).position).toEqual(chair);
  const keptSpawnImpulses = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.baronSpawnImpulses);
  await page.evaluate((bossWave) => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('waves.waveInterval', 0.25);
    harness.setWave(bossWave - 1);
    harness.advanceSim(0.4);
  }, wave);
  await expect.poll(async () => (await components(page)).length).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.baronSpawnImpulses)).toBe(keptSpawnImpulses);
  expect(errors).toEqual([]);
});
