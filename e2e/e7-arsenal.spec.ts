import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const BASE = '?debug&nowaves&nolevel&nopause&seed=e7-arsenal';
// Relay Valley currently has no harvest anchors, so isolate the epoch gate on the stable Claim contract.
const EXPECTED_ITEMS = [
  'playbook-slaved-spark-rig',
  'beam-relay-turret',
  'signal-jammer',
  'report-rocket',
];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

async function open(page: Page, epoch: string, contract: string): Promise<ErrorBucket> {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  await page.goto(`/${BASE}&epoch=${epoch}&contract=${contract}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

test('the four additions are absent before Signal and inherited from epoch 7 onward', async ({ page }) => {
  const errors = await open(page, 'epoch-6-atomic', 'the-claim');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal)).toMatchObject({ enabled: false, items: [] });

  await page.goto(`/${BASE}&epoch=epoch-7-signal&contract=the-claim`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Arsenal.enabled === true);
  const signal = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal);
  expect(signal.items).toEqual(EXPECTED_ITEMS);
  expect(signal.jammerDeployed).toBe(true);
  expect(signal.turretSilhouetteHeight).toBe(Balance.e7Arsenal.beamRelay.silhouetteHeight);

  await page.goto(`/${BASE}&epoch=epoch-8-orbital&contract=the-claim`);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Arsenal.enabled === true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.items)).toEqual(EXPECTED_ITEMS);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('playbook rig, relay, jammer, and report rocket fire through CombatSystem and emit cure outcomes only', async ({ page }) => {
  const errors = await open(page, 'epoch-7-signal', 'the-claim');
  const setup = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    harness.setBalance('sparkRig.damage', 0);
    harness.setBalance('turret.damage', 0);
    const recording = harness.playbook.startRecording({ script: [{ t: 0, mx: 0, my: 0, a: [] }] });
    harness.advanceSim(4);
    const tape = harness.playbook.stopRecording('arsenal tape');
    const replay = harness.playbook.startReplay({ text: tape.text });
    return {
      recording,
      replay,
      turretA: harness.placeFree('turret', -3, 8),
      turretB: harness.placeFree('turret', 3, 8),
    };
  });
  expect(setup).toEqual({
    recording: { ok: true },
    replay: { ok: true },
    turretA: true,
    turretB: true,
  });

  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.spawnPack(6, 5, { speedScale: 0, hpScale: 100, contactDamageScale: 0 });
    harness.spawnPack(6, 7, {
      speedScale: 0,
      hpScale: 100,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
    harness.advanceSim(2);
  });
  const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal);
  expect(active.fires.playbookSparkRig).toBeGreaterThan(0);
  expect(active.fires.beamRelay).toBeGreaterThan(0);
  expect(active.fires.signalJammer).toBeGreaterThan(0);
  expect(active.fires.reportRocket).toBeGreaterThan(0);
  expect(active.relayLinks).toBeGreaterThan(0);
  expect(active.activeRelayTurrets).toBe(2);
  expect(active.playbookSlaved).toBe(true);

  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.clearEnemies();
    harness.setBalance('e7Arsenal.playbookSparkRig.damage', 1_000);
    harness.setBalance('e7Arsenal.beamRelay.damage', 1_000);
    harness.setBalance('e7Arsenal.signalJammer.damage', 1_000);
    harness.setBalance('e7Arsenal.reportRocket.damage', 1_000);
    harness.spawnPack(8, 5, { speedScale: 0, hpScale: 0.1, contactDamageScale: 0 });
    harness.spawnPack(8, 7, {
      speedScale: 0,
      hpScale: 0.1,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
    harness.advanceSim(5);
  });
  const cure = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal);
  expect(cure.cureEvents.some((event) => event.type === 'turned-back')).toBe(true);
  expect(cure.cureEvents.some((event) => event.type === 'powered-down')).toBe(true);
  expect(cure.cureEvents.every((event) => !('death' in event))).toBe(true);
  expect(cure.deathEvents).toBe(0);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
