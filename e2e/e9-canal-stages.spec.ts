import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const URL = '/?debug&epoch=epoch-9-redfields&contract=e9-dome-basin&nowaves&nolevel&nopause&nosteal&nowreck&seed=e9-canal-stages';

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('1. C1-C3 hold in order, contest under attack, persist, pay, and wet the canal at C3', async ({ page }) => {
  const errors = await open(page);
  const result = await page.evaluate(({ holdSeconds, payouts }) => {
    const harness = window.__GR_TEST__!;
    const gates = harness.e9Canal.diagnostics().gates;
    harness.setBalance('enemy.contactDamage', 0);
    harness.setBalance('sparkRig.damage', 0);

    harness.teleport(gates[0]!.x, gates[0]!.z);
    harness.spawnPack(1, 0.2, { hpScale: 100, speedScale: 0.01 });
    harness.advanceSim(holdSeconds + 0.25);
    const contested = harness.e9Canal.diagnostics();

    harness.resetRun();
    harness.setManualSim(true);
    harness.teleport(gates[1]!.x, gates[1]!.z);
    harness.advanceSim(holdSeconds + 0.25);
    const skipped = harness.e9Canal.diagnostics();

    const stages = [];
    for (const gate of gates) {
      harness.teleport(gate.x, gate.z);
      harness.advanceSim(holdSeconds + 0.25);
      stages.push(harness.e9Canal.diagnostics());
    }
    const economy = harness.economyLog().filter((event: any) => event.type === 'gold_granted' && event.source === 'escort' && payouts.includes(event.amount));
    harness.endRunForTest();
    return { contested, skipped, stages, economy };
  }, { holdSeconds: Balance.e9Canal.stage.holdSeconds, payouts: [...Balance.e9Canal.stage.payouts] });

  expect(result.contested).toMatchObject({ stage: 0, contested: true });
  expect(result.skipped).toMatchObject({ stage: 0, activeGateId: 'canal-stage-c1' });
  expect(result.stages.map((stage) => stage.stage)).toEqual([1, 2, 3]);
  expect(result.stages.at(-1)?.canal).toMatchObject({ wet: true, renderOnly: true, visualY: true, segments: 5 });
  expect(result.economy.map((event: any) => event.amount)).toEqual([...Balance.e9Canal.stage.payouts]);

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e9Canal)).toMatchObject({ stage: 3, activeGateId: null, canal: { wet: true } });
  expect(errors).toEqual([]);
});

test('2. the north-scarp ice band uses harvest dwell and restores its Economy receipt', async ({ page }) => {
  const errors = await open(page);
  const result = await page.evaluate(({ harvestSeconds, payout }) => {
    const harness = window.__GR_TEST__!;
    const before = harness.e9Canal.diagnostics();
    const node = before.quarry.nodes[0]!;
    harness.teleport(node.x, node.z);
    harness.advanceSim(harvestSeconds + 0.2);
    const after = harness.e9Canal.diagnostics();
    const payouts = harness.economyLog().filter((event: any) => event.type === 'gold_granted' && event.source === 'escort' && event.amount === payout);
    harness.startWaveForTest(2);
    return { before, after, payouts };
  }, { harvestSeconds: Balance.e9Canal.quarry.harvestSeconds, payout: Balance.e9Canal.quarry.payout });

  expect(result.before.quarry).toMatchObject({ bandId: 'ice-quarry-scarp-north-h4', harvested: 0, total: Balance.e9Canal.quarry.nodeCount });
  expect(result.before.quarry.nodes.every((node) => node.x >= -54 && node.x <= -18 && node.z >= 42 && node.z <= 54)).toBe(true);
  expect(result.after.quarry).toMatchObject({ harvested: 1, payoutGold: Balance.e9Canal.quarry.payout, channelNodeId: null, progress: 0 });
  expect(result.payouts).toHaveLength(1);

  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e9-dome-basin');
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(0.05);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e9Canal.quarry.harvested)).toBe(1);
  expect((await page.evaluate(() => window.__GR_TEST__!.economyLog())).filter((event: any) => event.id === 'e9-canal-quarry-payout-ice-pack-1')).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('3. the dust devil telegraphs, follows its authored lane, and shoves without chasing or damage', async ({ page }) => {
  const errors = await open(page);
  const result = await page.evaluate(({ clearSeconds, telegraphSeconds }) => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('enemy.contactDamage', 0);
    harness.advanceSim(clearSeconds + 0.2);
    const warning = harness.e9Canal.diagnostics().dustDevil;
    harness.advanceSim(telegraphSeconds);
    const storm = harness.e9Canal.diagnostics().dustDevil;
    harness.teleport(storm.position!.x, storm.position!.z);
    harness.advanceSim(0.15);
    const shoved = harness.e9Canal.diagnostics().dustDevil;
    harness.teleport(50, 50);
    harness.advanceSim(0.25);
    const farAway = harness.e9Canal.diagnostics().dustDevil;
    return { warning, storm, shoved, farAway, hp: window.__THREE_GAME_DIAGNOSTICS__!.hp };
  }, {
    clearSeconds: Balance.e9Canal.dustDevil.weather.clearSeconds,
    telegraphSeconds: Balance.e9Canal.dustDevil.weather.telegraphSeconds,
  });

  expect(result.warning).toMatchObject({ phase: 'telegraph', warning: true, mode: 'wander-lane', targeting: 'none', laneId: 'dust-devil-wander' });
  expect(result.storm.phase).toBe('storm');
  expect(result.shoved.shoves).toBeGreaterThan(0);
  expect(result.shoved.pushedDistance).toBeGreaterThan(0);
  expect(result.farAway.laneProgress).toBeGreaterThan(result.shoved.laneProgress);
  expect(result.farAway.targeting).toBe('none');
  expect(result.hp).toBe(Balance.hero.maxHp);
  expect(errors).toEqual([]);
});
