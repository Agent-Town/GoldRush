import { expect, test, type Page } from '@playwright/test';

const E4 = '/?debug&epoch=epoch-4-motor&contract=e4-dust-flats&nowaves&nolevel&nopause&seed=e5-arsenal-gate';
const E5 = '/?debug&epoch=epoch-5-deepwater&contract=e5-deepwater-claim&nowaves&nolevel&nopause&seed=e5-arsenal';

async function open(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(query);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('era-gates the storybook grid and keeps both schools on one depth-charge stock', async ({ page }) => {
  const errors = await open(page, E4);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.deepwaterArsenal)).toMatchObject({ active: false, items: [] });

  await page.goto(E5);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.deepwaterArsenal.active === true);
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.placeBoatBuilding('port', 'turret');
    window.__GR_TEST__!.placeBoatBuilding('starboard', 'sentry_beacon');
    window.__GR_TEST__!.advanceSim(0.1);
  });

  const state = await page.evaluate(async () => {
    const modulePath = '/src/game/Balance.ts';
    const { Balance } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/game/Balance');
    return { diagnostics: window.__THREE_GAME_DIAGNOSTICS__!.deepwaterArsenal, balance: Balance.e5Arsenal };
  });
  expect(state.diagnostics.items).toEqual([
    { id: 'pressureSealed', line: 'fire', munitionId: null },
    { id: 'harpoonBallista', line: 'watch', munitionId: null },
    { id: 'depthChargeRack', line: 'watch', munitionId: 'depth_charge' },
    { id: 'depthChargeLobber', line: 'powder', munitionId: 'depth_charge' },
  ]);
  expect(state.diagnostics.sharedMunition).toMatchObject({ id: state.balance.depthChargeMunition.id, capacity: 12, stock: 12 });
  expect(state.diagnostics.silhouette.harpoonBallista).toBe(state.diagnostics.silhouette.priorTurret);
  expect(state.diagnostics.visuals).toEqual({ harpoonBallista: true, depthChargeRack: true, depthChargeLobber: true });
  expect(errors).toEqual([]);
});

test('pressure-seals the rig and records cure-arm outcomes through the existing resolver', async ({ page }) => {
  const errors = await open(page, E5);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(0, -22);
    test.advanceSim(0.1);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.deepwaterArsenal.pressureSealed)).toEqual({ active: true, inDiveZone: true });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.arsenal.disarmed)).toBe(false);
  await page.evaluate(() => window.__GR_TEST__!.toggleWeapon());
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.arsenal.disarmed)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.toggleWeapon());
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.arsenal.disarmed)).toBe(false);

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.spawnPack(1, 5, { hpScale: 10, speedScale: 0.01 });
    test.advanceSim(1.2);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.damageByOwner.hero ?? 0)).toBeGreaterThan(0);

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.resetRun();
    test.setManualSim(true);
    test.placeBoatBuilding('port', 'turret');
    test.placeBoatBuilding('starboard', 'sentry_beacon');
    test.teleport(0, 27);
    test.toggleWeapon();
    test.spawnPack(1, 5, { hpScale: 10, speedScale: 0.01 });
    test.advanceSim(1.2);
  });
  const human = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.deepwaterArsenal);
  expect(human.fires.harpoonBallista).toBeGreaterThan(0);
  expect(human.fires.depthChargeRack).toBeGreaterThan(0);
  expect(human.fires.depthChargeLobber).toBeGreaterThan(0);
  expect(human.sharedMunition.spentBy.depthChargeRack).toBeGreaterThan(0);
  expect(human.sharedMunition.spentBy.depthChargeLobber).toBeGreaterThan(0);
  expect(human.sharedMunition.stock).toBe(human.sharedMunition.capacity - human.sharedMunition.spentBy.depthChargeRack - human.sharedMunition.spentBy.depthChargeLobber);
  expect(human.treatmentEvents.map((event) => event.outcome)).toContain('freed');

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.resetRun();
    test.setManualSim(true);
    test.teleport(0, 27);
    test.toggleWeapon();
    test.spawnPack(1, 5, { variantId: 'steam_wrecker', hpScale: 10, speedScale: 0.01 });
    test.advanceSim(1.4);
  });
  const machineEvents = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.deepwaterArsenal.treatmentEvents);
  expect(machineEvents.map((event) => event.outcome)).toContain('powered-down');
  expect(machineEvents.map((event) => event.outcome)).not.toContain('death' as never);
  expect(errors).toEqual([]);
});
