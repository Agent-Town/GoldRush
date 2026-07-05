import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; amount?: number };
type PickupSnapshot = { active: boolean; amount: number; position: { x: number; z: number } };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__GR_TEST__?.state().economy.banked ?? window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
}

async function placeBuildableAt(page: Page, id: 'stockpile' | 'palisade', x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function placeStockpile(page: Page, x = 3, z = 12): Promise<void> {
  await setBalance(page, 'stockpile.cost', 0);
  await placeBuildableAt(page, 'stockpile', x, z);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().buildables.find((b) => b.id === 'stockpile')?.count ?? 0)).toBe(
    1,
  );
}

async function spawnNorthThief(page: Page, heroX = 3, heroZ = -5): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x: heroX, z: heroZ });
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);
}

async function activePickup(page: Page): Promise<PickupSnapshot> {
  return page.evaluate(() => {
    const pickup = window.__GR_TEST__?.goldPickups().find((entry) => entry.active);
    if (!pickup) throw new Error('No active gold pickup');
    return pickup;
  });
}

async function waitForSteal(page: Page, expectedGold: number): Promise<void> {
  await expect.poll(() => gold(page), { timeout: 10_000 }).toBe(expectedGold);
  await expect
    .poll(() => economyLog(page).then((log) => log.filter((event) => event.type === 'gold_stolen').length))
    .toBeGreaterThan(0);
}

async function followCarrierFromBehind(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __m204FollowCarrier?: boolean };
    w.__m204FollowCarrier = true;
    const tick = () => {
      if (!w.__m204FollowCarrier) return;
      const carrier = window.__GR_TEST__?.enemyPositions().find((enemy) => (enemy.carried ?? 0) > 0);
      if (carrier) window.__GR_TEST__?.teleport(carrier.x, carrier.z - 5);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function stopFollowingCarrier(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __m204FollowCarrier?: boolean }).__m204FollowCarrier = false;
  });
}

async function createDroppedPickup(page: Page, banked = 120): Promise<PickupSnapshot> {
  await placeStockpile(page);
  await grantGold(page, banked);
  await spawnNorthThief(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.fleeing ?? 0), { timeout: 10_000 }).toBe(1);
  await followCarrierFromBehind(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.pickups ?? 0), { timeout: 10_000 }).toBe(1);
  await stopFollowingCarrier(page);
  return activePickup(page);
}

function reclaimAmount(amount: number): number {
  return Math.ceil(amount * (1 + Balance.steal.reclaimStockpileBonus));
}

test('steal debits bank through gold_stolen and shows a float', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&seed=m2-04-steal');
  await placeStockpile(page);
  await grantGold(page, 100);

  const before = await gold(page);
  await spawnNorthThief(page);
  await waitForSteal(page, before - Balance.steal.grabAmount);

  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  const log = await economyLog(page);
  expect(log.some((event) => event.type === 'gold_stolen' && event.amount === Balance.steal.grabAmount)).toBe(true);
  expect(diagnostics?.economy.replay.gold).toBe(diagnostics?.economy.gold);
  expect(diagnostics?.steal.stolenTotal).toBe(Balance.steal.grabAmount);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0)).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('fleeing carrier moves toward its own spawn edge and despawns', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nokill&nolevel&seed=m2-04-flee');
  await placeStockpile(page);
  await grantGold(page, 100);
  await page.evaluate(() => {
    const w = window as unknown as {
      __m204FleeTrack: { samples: number; maxIncrease: number; last: number | null; sawFlee: boolean; despawned: boolean };
    };
    w.__m204FleeTrack = { samples: 0, maxIncrease: 0, last: null, sawFlee: false, despawned: false };
    const tick = () => {
      const thief = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.thief);
      const track = w.__m204FleeTrack;
      if (thief?.state === 'fleeing') {
        const distance = 37.5 - thief.z;
        if (track.last !== null) track.maxIncrease = Math.max(track.maxIncrease, distance - track.last);
        track.last = distance;
        track.samples += 1;
        track.sawFlee = true;
      } else if (!thief && track.sawFlee) {
        track.despawned = true;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await spawnNorthThief(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.fleeing ?? 0), { timeout: 10_000 }).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? -1), { timeout: 10_000 }).toBe(0);

  const track = await page.evaluate(() => (window as unknown as { __m204FleeTrack: { samples: number; maxIncrease: number; despawned: boolean } }).__m204FleeTrack);
  expect(track.samples).toBeGreaterThan(2);
  expect(track.maxIncrease).toBeLessThan(1.25);
  expect(track.despawned).toBe(true);
  expect((await economyLog(page)).filter((event) => event.type === 'gold_stolen')).toHaveLength(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('killed carrier drops reclaimable gold pickup', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m2-04-reclaim');
  const pickup = await createDroppedPickup(page, 120);
  const before = await gold(page);

  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), pickup.position);
  await expect
    .poll(() => economyLog(page).then((log) => log.filter((event) => event.type === 'gold_reclaimed').length), {
      timeout: 10_000,
    })
    .toBe(1);
  expect(await gold(page)).toBe(before + reclaimAmount(pickup.amount));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.pickups ?? -1)).toBe(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0)).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('bank cap blocks pickup reclaim until room exists', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m2-04-cap');
  const pickup = await createDroppedPickup(page, 120);
  const cap = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap ?? 0);
  await grantGold(page, cap - (await gold(page)));

  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), pickup.position);
  await expect
    .poll(() => economyLog(page).then((log) => log.some((event) => event.type === 'gold_capped' && event.amount === 0)))
    .toBe(true);
  expect(await gold(page)).toBe(cap);
  expect((await activePickup(page)).amount).toBe(pickup.amount);

  const reclaimed = reclaimAmount(pickup.amount);
  await setBalance(page, 'palisade.cost', reclaimed);
  await placeBuildableAt(page, 'palisade', 7, 12);
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), pickup.position);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.pickups ?? -1), { timeout: 10_000 }).toBe(0);
  expect(await gold(page)).toBe(cap);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('thief routes around a finite palisade line to steal', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nokill&nolevel&seed=m2-04-walls');
  await setBalance(page, 'palisade.cost', 0);
  for (const x of [-2, -1, 0, 1, 2]) await placeBuildableAt(page, 'palisade', x, 9);
  await placeStockpile(page, 0, 13);
  await grantGold(page, 100);

  await page.evaluate(() => window.__GR_TEST__?.teleport(0, 12));
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('south'))).resolves.toBe(true);
  // s23 gate fix: measure the thief's journey in sim time from spawn — absolute timeAlive
  // includes the timescale-inflated setup frames on slow VMs (delta-assert lesson).
  const spawnedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await expect.poll(() => economyLog(page).then((log) => log.some((event) => event.type === 'gold_stolen')), { timeout: 20_000 }).toBe(
    true,
  );
  expect((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 99)) - spawnedAt).toBeLessThan(20);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('real waves spawn no thieves without a stockpile', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&seed=m2-04-neutrality');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('steal.minWave', 1);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 2);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 4);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().steal.thieves ?? -1)).toBe(0);
  expect((await economyLog(page)).some((event) => event.type === 'gold_stolen')).toBe(false);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('loose pickup can be re-stolen without another Economy event', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=m2-04-resteal');
  const pickup = await createDroppedPickup(page, Balance.steal.grabAmount);
  const stolenBefore = (await economyLog(page)).filter((event) => event.type === 'gold_stolen').length;

  await page.evaluate((pos) => {
    window.__GR_TEST__?.teleport(pos.x, pos.z - 14);
    window.__GR_TEST__?.spawnThief('north');
    window.__GR_TEST__?.teleport(pos.x + 20, pos.z + 20);
  }, pickup.position);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.carriedTotal ?? 0), { timeout: 10_000 }).toBe(
    pickup.amount,
  );
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().steal.pickups ?? -1)).toBe(0);

  const log = await economyLog(page);
  expect(log.filter((event) => event.type === 'gold_stolen')).toHaveLength(stolenBefore);
  expect(log.some((event) => event.type === 'gold_reclaimed')).toBe(false);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
