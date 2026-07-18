import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const URL = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nowaves&nolevel&nopause&nosteal&nowreck&seed=e6-tile-consumers';

async function open(page: Page, url = URL): Promise<string[]> {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  await page.waitForFunction(() => {
    const state = document.querySelector('canvas')?.dataset;
    return state?.terrain3dPilotState !== 'loading' && state?.run3dPilotState !== 'loading';
  });
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.resetRun();
    window.__GR_TEST__!.setManualSim(true);
  });
  return errors;
}

test('1. authored decay fields fade through three dial stages, breathe independently, and persist their safe phase', async ({ page }) => {
  const errors = await open(page, URL.replace('epoch-6-atomic', 'epoch-7-signal'));
  const blocked = await page.evaluate(() => {
    const target = window.__GR_TEST__!.e6Tiles.diagnostics().puddles.find((puddle) => !puddle.safe)!;
    window.__GR_TEST__!.teleport(target.maxX + 0.5, (target.minZ + target.maxZ) * 0.5);
    return target;
  });
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(false));
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyA');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x))).toBeGreaterThanOrEqual(blocked.maxX);

  const result = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    const start = harness.e6Tiles.diagnostics();
    const target = start.puddles.find((puddle) => !puddle.safe)!;
    harness.teleport(0, 0);
    harness.advanceSim(target.remainingTicks / 60);
    const fading = harness.e6Tiles.diagnostics();
    harness.advanceSim(target.remainingTicks / 60 + 0.2);
    const open = harness.e6Tiles.diagnostics();
    return { start, fading, open, targetId: target.id };
  });

  expect(result.start).toMatchObject({ active: true, storyGate: 'puddles decay to safe on dials; harvest the six-vein ring after dark' });
  expect(result.start.puddles).toHaveLength(2);
  expect(result.start.puddles.find((puddle) => puddle.id === result.targetId)).toMatchObject({ safe: false, stage: 3, visualY: true });
  expect(result.fading.puddles.find((puddle) => puddle.id === result.targetId)?.stage).toBe(2);
  expect(result.open.puddles.find((puddle) => puddle.id === result.targetId)).toMatchObject({ safe: true, stage: 0 });

  await page.evaluate(({ maxX, minZ, maxZ }) => window.__GR_TEST__!.teleport(maxX + 0.5, (minZ + maxZ) * 0.5), blocked);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(false));
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyA');
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x))).toBeLessThan(blocked.maxX);
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  const stored = await page.evaluate(async ({ contractId, entryId }) => {
    const profiles = await Function('return import("/src/game/ProfileStorage.ts")')() as typeof import('../src/game/ProfileStorage');
    const raw = localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
    const snapshot = JSON.parse(raw ?? '{}') as { entries?: Array<{ id?: string; payload?: { safeFields?: string[] } }> };
    return snapshot.entries?.find((entry) => entry.id === entryId)?.payload?.safeFields ?? [];
  }, { contractId: 'e6-glow-mesa', entryId: 'e6-decay-fields-and-night-veins' });
  expect(stored).toContain(result.targetId);
  expect(errors).toEqual([]);
});

test('2. the six-vein ring opens after dark, harvests through Economy, and remembers spent veins', async ({ page }) => {
  const errors = await open(page);
  const result = await page.evaluate(({ daySeconds, harvestSeconds, goldPerVein }) => {
    const harness = window.__GR_TEST__!;
    const before = harness.e6Tiles.diagnostics();
    const node = before.veins.nodes[0]!;
    harness.teleport(node.x, node.z);
    harness.advanceSim(harvestSeconds + 0.1);
    const daylightAttempt = harness.e6Tiles.diagnostics();
    harness.resetRun();
    harness.setManualSim(true);
    harness.teleport(0, 0);
    harness.advanceSim(daySeconds + 0.1);
    const night = harness.e6Tiles.diagnostics();
    harness.teleport(node.x, node.z);
    harness.advanceSim(harvestSeconds + 0.1);
    const harvested = harness.e6Tiles.diagnostics();
    const receipts = harness.economyLog().filter((event) => {
      const receipt = event as { type?: string; nodeId?: string; amount?: number };
      return receipt.type === 'gold_panned' && receipt.nodeId === node.id && receipt.amount === goldPerVein;
    });
    harness.endRunForTest();
    return { before, daylightAttempt, night, harvested, receipts };
  }, {
    daySeconds: Balance.e6Tiles.night.daySeconds,
    harvestSeconds: Balance.e6Tiles.veins.harvestSeconds,
    goldPerVein: Balance.e6Tiles.veins.goldPerVein,
  });

  expect(result.before.veins).toMatchObject({ active: false, harvested: 0, total: 6 });
  expect(result.daylightAttempt.veins).toMatchObject({ active: false, harvested: 0, channelId: null, progress: 0 });
  expect(result.night).toMatchObject({ night: { active: true }, veins: { active: true, harvested: 0 } });
  expect(result.harvested.veins).toMatchObject({ active: true, harvested: 1, payoutGold: Balance.e6Tiles.veins.goldPerVein });
  expect(result.receipts).toEqual([
    expect.objectContaining({ type: 'gold_panned', nodeId: 'night-vein-1', amount: Balance.e6Tiles.veins.goldPerVein, actor: 'player' }),
  ]);

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-glow-mesa');
  const restored = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e6Tiles);
  expect(restored.veins).toMatchObject({ harvested: 1, total: 6 });
  expect(restored.veins.nodes[0]).toMatchObject({ id: 'night-vein-1', harvested: true });
  expect(errors).toEqual([]);
});

test('non-E6 boots leave the consumer and shared decay scheduler inert', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=e6-tile-inert');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(1);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e6Tiles.active)).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.decay)).toEqual({ active: 0, events: [] });
  expect(errors).toEqual([]);
});
