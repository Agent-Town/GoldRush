import { expect, test, type Page } from '@playwright/test';
import { profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';

const E8_RESEARCH = profileDataKey('robin', researchStateKey('epoch-8-orbital'));
const PRE_E8_QUERY = '/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nowaves&nolevel&nopause&seed=e8-arsenal-gate';
const E8_QUERY = '/?debug&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause&seed=e8-arsenal';

async function installResearch(page: Page): Promise<void> {
  await page.addInitScript(({ researchKey }) => {
    localStorage.setItem(researchKey, JSON.stringify({
      version: 1,
      steps: 5,
      taken: ['vacuum_lenses', 'lens_turret', 'breach_seals', 'magnet_grapple'],
      proposalSalt: 0,
      pinnedTarget: null,
    }));
  }, { researchKey: E8_RESEARCH });
}

async function open(page: Page, query: string): Promise<void> {
  await page.goto(query);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(0.1);
  });
}

test('the storybook grid stays absent before E8 and exposes light-only tools at Orbital', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await installResearch(page);

  await open(page, PRE_E8_QUERY);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal)).toMatchObject({
    available: false,
    items: {
      sunlineBeam: false,
      kineticLobber: false,
      magnetGrapple: false,
      lensTurret: false,
      breachPatchSeals: false,
    },
  });

  await open(page, E8_QUERY);
  const orbital = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal);
  expect(orbital).toMatchObject({
    available: true,
    items: {
      sunlineBeam: true,
      kineticLobber: true,
      magnetGrapple: true,
      lensTurret: true,
      breachPatchSeals: true,
    },
    multiplayerPosture: 'single-player-gated',
    lensSilhouette: { base: 1.1, transformed: 1.1 },
    breachSealLimit: 4,
  });
  expect(orbital.vfxClasses).not.toContain('smoke');
  expect(orbital.vfxClasses).not.toContain('flame');

  const seals = await page.evaluate(() => [0, 2, -2, 4, 6].map((x) => window.__GR_TEST__!.placeFree('palisade', x, -32)));
  expect(seals).toEqual([true, true, true, true, false]);
  const turretPlaced = await page.evaluate(() => {
    for (const z of [-36, -28, -24, -20]) {
      for (const x of [-12, -8, 8, 12]) if (window.__GR_TEST__!.placeFree('turret', x, z)) return true;
    }
    return false;
  });
  expect(turretPlaced).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build)).toMatchObject({ breachSeals: 4, lensTurrets: 1 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.ui?.buildables.find((item) => item.id === 'palisade')?.displayName)).toBe('Breach Seal');
  expect(errors).toEqual([]);
});

test('grapple collisions stay nonlethal while beam and lob outcomes use cure-arms presentation', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await installResearch(page);
  await open(page, E8_QUERY);

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.spawnPack(2, 4, { hpScale: 100, speedScale: 0, contactDamageScale: 0 });
    test.advanceSim(6);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal)).toMatchObject({
    grapplePulls: expect.any(Number),
    silentCollisions: expect.any(Number),
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.grapplePulls)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.silentCollisions)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__GR_TEST__!.enemyPositions())).toHaveLength(2);

  const beforeHuman = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.spawnPack(1, 4, { hpScale: 0.05, speedScale: 0, contactDamageScale: 0, variantId: 'fevered_saboteur' });
  });
  await expect.poll(() => page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.2);
    return window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0;
  })).toBeGreaterThan(beforeHuman);

  const beforeMachine = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0);
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.spawnPack(1, 4, {
      hpScale: 0.05,
      speedScale: 0,
      contactDamageScale: 0,
      variantId: 'steam_wrecker',
      variantLabel: 'Steam Wrecker',
      wrecker: true,
    });
  });
  await expect.poll(() => page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.2);
    return window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0;
  })).toBeGreaterThan(beforeMachine);

  const arsenal = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal);
  expect(arsenal.fires.sunlineBeam).toBeGreaterThan(0);
  expect(arsenal.fires.kineticLobber).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
