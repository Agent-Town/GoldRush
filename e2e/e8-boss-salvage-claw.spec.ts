import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '/?debug&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause&seed=salvage-claw';
const SHOT_DIR = path.resolve('reviews/shots-claw');

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ epochKey }) => {
  if (!sessionStorage.getItem('salvage-claw-test')) {
    localStorage.clear();
    sessionStorage.setItem('salvage-claw-test', '1');
  }
  localStorage.setItem(epochKey, 'epoch-8-orbital');
}, { epochKey: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e8-mare-claim');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('salvageClaw.arriveWave', 4);
    harness.setBalance('salvageClaw.dreadWaves', 2);
    harness.setBalance('salvageClaw.theftIntervalSeconds', 0.5);
    harness.setBalance('salvageClaw.debrisIntervalSeconds', 4);
    harness.setBalance('salvageClaw.debrisTelegraphSeconds', 2);
    harness.setBalance('salvageClaw.debrisDamage', 1);
    harness.setBalance('salvageClaw.descentSeconds', 0.5);
    harness.setBalance('salvageClaw.liftSeconds', 2);
    harness.setBalance('salvageClaw.liftCooldownSeconds', 0.25);
    harness.setBalance('salvageClaw.crewQuitSeconds', 0.5);
    harness.setBalance('enemy.contactDamage', 0);
    harness.setBalance('sparkRig.range', 0);
  });
  return errors;
}

async function claw(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.salvageClawBoss!);
}

async function placePalisade(page: Page): Promise<number> {
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.grantGold(100);
    harness.teleport(0, -32);
    harness.selectBuildable('palisade');
    harness.advanceSim(0.05);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.ghostValid)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__!.confirmBuild())).resolves.toBe(true);
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find((entry) => entry.id === 'palisade' && !entry.wrecked)?.index ?? -1);
}

async function damagePart(page: Page, componentId: string): Promise<void> {
  const target = await page.evaluate((id) => {
    const harness = window.__GR_TEST__!;
    const snapshot = structuredClone(harness.captureSuspend()) as any;
    const component = snapshot.enemies.active.find((enemy: any) => enemy.variantId === 'salvage_claw' && enemy.bossComponentId === id);
    if (!component) return null;
    component.hp = 0.01;
    if (!harness.restoreSuspend(snapshot)) return null;
    return harness.enemyPositions().find((enemy) => enemy.variantId === 'salvage_claw' && enemy.bossComponentId === id) ?? null;
  }, componentId);
  expect(target).not.toBeNull();
  await page.evaluate((position) => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('blast.damage', 2);
    harness.launchBlastAt(position!.x, position!.z, 0.05);
    harness.advanceSim(0.25);
  }, target);
  await expect.poll(() => page.evaluate((id) => window.__GR_TEST__!.enemyPositions().some(
    (enemy) => enemy.variantId === 'salvage_claw' && enemy.bossComponentId === id,
  ), componentId)).toBe(false);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  if (testInfo.project.name !== 'desktop-chrome') return;
  await mkdir(SHOT_DIR, { recursive: true });
  const storyBeat = page.getByTestId('story-beat-card');
  if (await storyBeat.isVisible()) await page.mouse.click(6, 6);
  await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`) });
}

async function reachAct2(page: Page): Promise<void> {
  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(4));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await expect.poll(() => claw(page)).toMatchObject({ act: 1, crown: 'orbit', grappleAnchors: 2, grappleLines: 2, corsairsRappelled: 3 });
  await damagePart(page, 'grapple_port');
  expect(await claw(page)).toMatchObject({ act: 1, grappleAnchors: 1 });
  await damagePart(page, 'grapple_starboard');
  await expect.poll(() => claw(page)).toMatchObject({ act: 2, crown: 'descending', winch: 'intact' });
}

test('descends by component state, drops a lifted building savable, and persists the yard', async ({ page }, testInfo) => {
  const errors = await open(page);
  const palisade = await placePalisade(page);
  expect(palisade).toBeGreaterThanOrEqual(0);
  const goldBeforeTheft = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold);
  await expect(page.evaluate(() => window.__GR_TEST__!.spawnGoldPickup(4, 4, 7))).resolves.toBe(true);

  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(2));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.6));
  await expect.poll(() => claw(page)).toMatchObject({ act: 0, crown: 'hidden', theftTicks: 1, stolenPickups: 1, stolenGold: 7, tagMarkers: 1 });
  await expect(page.locator('canvas')).toHaveAttribute('data-salvage-claw3d-mounted', 'false');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold)).toBe(goldBeforeTheft);
  expect(await page.evaluate(() => window.__GR_TEST__!.goldPickups().filter((pickup) => pickup.active))).toHaveLength(0);

  await page.evaluate(() => window.__GR_TEST__!.startWaveForTest(4));
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await expect.poll(() => claw(page)).toMatchObject({ act: 1, debrisTelegraphed: true, clawPlayerTargets: 0 });
  await shot(page, testInfo, 'act1-rain');
  await damagePart(page, 'grapple_port');
  await damagePart(page, 'grapple_starboard');
  await expect.poll(() => claw(page)).toMatchObject({ act: 2, winch: 'intact' });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await expect.poll(() => claw(page)).toMatchObject({ act: 2, lift: { family: 'palisade', index: palisade } });
  const hpBeforeDrop = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find(
    (entry) => entry.id === 'palisade' && entry.index === index,
  )!.hp, palisade);
  await shot(page, testInfo, 'act2-lift');

  await damagePart(page, 'winch');
  await expect.poll(() => claw(page)).toMatchObject({ act: 3, crown: 'dark', winch: 'broken', anchorFeet: 'intact', buildingsDropped: 1, lift: null });
  const dropped = await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find(
    (entry) => entry.id === 'palisade' && entry.index === index,
  ), palisade);
  expect(dropped).toMatchObject({ wrecked: false });
  expect(dropped!.hp).toBeGreaterThan(0);
  expect(dropped!.hp).toBeLessThan(hpBeforeDrop);
  await shot(page, testInfo, 'act3-landed');

  await damagePart(page, 'anchor_feet');
  await expect.poll(() => claw(page)).toMatchObject({ act: 3, carcassPresent: true, persistentCarcass: false, clawPlayerTargets: 0 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.6));
  await expect.poll(() => claw(page)).toMatchObject({ crewDescending: false, crewDescended: 3, boltTaken: true });
  expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'scrap_corsair'))).toHaveLength(0);
  expect((await claw(page)).ledgerEvents).toContain('one-bolt:for-the-ledger');
  await expect(page.locator('canvas')).toHaveAttribute('data-salvage-claw3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-salvage-claw3d-presentation', 'yard');

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e8-mare-claim');
  await expect.poll(() => claw(page)).toMatchObject({ active: false, act: 3, carcassPresent: true, persistentCarcass: true, boltTaken: true });
  expect(errors).toEqual([]);
});

test('a completed lift removes through demolition and leaves a salvage-tag ledger event', async ({ page }) => {
  const errors = await open(page);
  const palisade = await placePalisade(page);
  await page.evaluate(() => window.__GR_TEST__!.setBalance('salvageClaw.liftSeconds', 0.5));
  const goldBeforeLift = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold);
  await reachAct2(page);
  const suspended = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  expect((suspended as any).enemies.active.map((enemy: any) => enemy.bossComponentId)).toContain('winch');
  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e8-mare-claim');
  const restored = await page.evaluate((snapshot) => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('salvageClaw.liftSeconds', 0.5);
    const ok = harness.restoreSuspend(snapshot);
    harness.advanceSim(0.05);
    return {
      ok,
      parts: harness.enemyPositions().filter((enemy) => enemy.variantId === 'salvage_claw').map((enemy) => enemy.bossComponentId),
    };
  }, suspended);
  expect(restored.ok).toBe(true);
  expect(restored.parts).toContain('winch');
  await expect.poll(() => claw(page)).toMatchObject({ active: true, act: 2, winch: 'intact' });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.7));
  await expect.poll(() => claw(page)).toMatchObject({ buildingsLiftedAway: 1, lift: null });
  expect((await claw(page)).ledgerEvents).toContain(`salvage-tag:palisade:${palisade}`);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.economy.gold)).toBe(goldBeforeLift);
  expect(await page.evaluate((index) => window.__THREE_GAME_DIAGNOSTICS__!.build.hp.find(
    (entry) => entry.id === 'palisade' && entry.index === index,
  ), palisade)).toBeUndefined();
  expect(errors).toEqual([]);
});
