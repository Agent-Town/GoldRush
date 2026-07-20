import { expect, test, type Page } from '@playwright/test';
import { profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';

const ECLIPSE = '/?debug&epoch=epoch-8-orbital&contract=e8-eclipse&nowaves&nolevel&nopause&seed=e8-physics-eclipse';
const E8_RESEARCH = profileDataKey('robin', researchStateKey('epoch-8-orbital'));

async function open(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ researchKey }) => {
    localStorage.setItem(researchKey, JSON.stringify({
      version: 1,
      steps: 5,
      taken: ['vacuum_lenses', 'lens_turret', 'breach_seals', 'magnet_grapple'],
      proposalSalt: 0,
      pinnedTarget: null,
    }));
  }, { researchKey: E8_RESEARCH });
  await page.goto(query);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('contract gravity flags select Eclipse low-g and Low Orbit free-fall profiles', async ({ page }) => {
  const errors = await open(page, ECLIPSE);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Physics)).toMatchObject({
    active: true,
    contractId: 'e8-eclipse',
    source: 'gravity',
    movement: 'floaty',
    feelG: 0.6,
    lobArcDistanceMultiplier: 2.4,
    lobAirTimeMultiplier: 2.4,
    knockbackScale: 1.3,
    orbitalReturn: false,
    vacuum: true,
    fixedTimestepOnly: true,
    adaptedLobs: [{ resumeKey: 'orbital:kineticLobber', range: 36, airTime: 4.032 }],
  });

  expect(await page.evaluate(() => window.__GR_TEST__!.e8PhysicsProfile('e8-low-orbit'))).toMatchObject({
    active: true,
    contractId: 'e8-low-orbit',
    source: 'zero-gravity',
    movement: 'free-fall',
    feelG: 0,
    lobArcDistanceMultiplier: 4.8,
    lobAirTimeMultiplier: 4.8,
    knockbackScale: 1.75,
    orbitalReturn: true,
    vacuum: true,
    fixedTimestepOnly: true,
  });

  await page.evaluate(() => {
    window.__GR_TEST__!.toggleWeapon();
    window.__GR_TEST__!.advanceSim(0.1);
  });
  const leadAim = await page.evaluate(() => ({
    hero: window.__THREE_GAME_DIAGNOSTICS__!.heroPos,
    aim: window.__GR_TEST__!.state().arsenal.aimTarget,
  }));
  expect(Math.hypot(leadAim.aim.x - leadAim.hero.x, leadAim.aim.z - leadAim.hero.z)).toBeCloseTo(24 * 0.72, 2);
  expect(errors).toEqual([]);
});

test('fixed-tick filtering keeps deterministic floaty and free-fall drift after thrust ends', async ({ page }) => {
  const errors = await open(page, ECLIPSE);

  const run = async () => {
    await page.evaluate(() => window.__GR_TEST__!.teleport(0, 0));
    await page.keyboard.down('KeyD');
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
    await page.keyboard.up('KeyD');
    const releasedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x);
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
    return page.evaluate((start) => ({
      position: window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x,
      drift: window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x - start,
      filtered: window.__THREE_GAME_DIAGNOSTICS__!.e8Physics.filteredMovement.x,
    }), releasedAt);
  };

  const first = await run();
  const second = await run();
  expect(first.drift).toBeGreaterThan(0.1);
  expect(first.filtered).toBeGreaterThan(0.1);
  expect(second.position).toBeCloseTo(first.position, 10);
  expect(second.drift).toBeCloseTo(first.drift, 10);

  await page.evaluate(() => window.__GR_TEST__!.teleport(0, 0));
  await page.keyboard.down('KeyD');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  await page.keyboard.up('KeyD');
  const snapshot = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const uninterrupted = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x);
  expect(await page.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x)).toBeCloseTo(uninterrupted, 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.simulation)).toMatchObject({ fixed: true, stepSeconds: 1 / 30 });

  const freeFall = await page.evaluate(() => [
    window.__GR_TEST__!.e8PhysicsProbe('e8-low-orbit'),
    window.__GR_TEST__!.e8PhysicsProbe('e8-low-orbit'),
  ]);
  expect(freeFall[1]).toEqual(freeFall[0]);
  expect(freeFall[0]!.driftDistance).toBeGreaterThan(0.1);
  expect(freeFall[0]).toMatchObject({ lobAirTime: 4.8, knockback: 3.5 });
  expect(errors).toEqual([]);
});

test('lob reach and airtime follow each contract while vacuum arsenal classes stay light-law clean', async ({ page }) => {
  const errors = await open(page, ECLIPSE);
  const eclipse = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(0, 0);
    const aim = test.setBlastAim(60, 0);
    const launched = test.launchBlastAt(aim.x, aim.z, 1);
    test.advanceSim(2.3);
    const before = window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive;
    test.advanceSim(0.2);
    return {
      aim,
      launched,
      before,
      after: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive,
      vfxClasses: window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.vfxClasses,
    };
  });
  expect(eclipse).toMatchObject({ aim: { x: 24, z: 0 }, launched: true, before: 1, after: 0 });
  expect(eclipse.vfxClasses).toEqual(['light', 'kinetic', 'magnetic']);

  const grapple = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.spawnPack(2, 4, { hpScale: 100, speedScale: 0.001, contactDamageScale: 0 });
    const before = test.enemyPositions();
    test.advanceSim(0.1);
    const after = test.enemyPositions();
    return {
      pulls: window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.grapplePulls,
      before: Math.hypot(before[0]!.x - before[1]!.x, before[0]!.z - before[1]!.z),
      after: Math.hypot(after[0]!.x - after[1]!.x, after[0]!.z - after[1]!.z),
    };
  });
  expect(grapple.pulls).toBe(1);
  expect(grapple.before - grapple.after).toBeCloseTo(2 * 2.2 * 1.3, 1);
  expect(errors).toEqual([]);

  expect(await page.evaluate(() => window.__GR_TEST__!.e8PhysicsProbe('e8-low-orbit'))).toMatchObject({
    profile: { lobArcDistanceMultiplier: 4.8, orbitalReturn: true },
    lobAirTime: 4.8,
  });
});
