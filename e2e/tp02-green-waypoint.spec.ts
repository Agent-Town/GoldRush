import { expect, test, type Page } from '@playwright/test';

const QUERY = '/?debug&contract=e1-dry-gulch&nolevel&nopause&seed=tp02';
const CONTRACT_ID = 'e1-dry-gulch';
const PLANT_AT = { x: 6, z: -10 };
const ZONE_SEED = { x: -26, z: 0, r: 3 };
const E1_RIVERBANK_GREEN = '#848c6c';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.setTimeout(120_000);
test.beforeEach(async ({ page }) => page.addInitScript(() => {
  if (!sessionStorage.getItem('tp02-green-waypoint-test')) {
    localStorage.clear();
    sessionStorage.setItem('tp02-green-waypoint-test', '1');
  }
}));

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function waitForBoot(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e1-dry-gulch');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('enemy.contactDamage', 0);
  });
}

async function persistenceDiag(page: Page) {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.tilePersistence);
}

/**
 * The plant action is the KeyG debug binding. This sandbox's full-binary
 * headless build drops letter-key CDP input (arrows/Space deliver; letters do
 * not — probed 2026-07-17), so the spec dispatches the same KeyboardEvent the
 * browser would: it still exercises InputController → intent edge → plant.
 */
async function pressPlantKey(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyG', key: 'g', bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyG', key: 'g', bubbles: true }));
  });
}

async function tileStateKeys(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key): key is string =>
      Boolean(key?.includes('.tilestate.')),
    ),
  );
}

async function readSnapshotRaw(page: Page): Promise<string | null> {
  return page.evaluate(async (contractId) => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    return localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
  }, CONTRACT_ID);
}

async function seedSnapshot(page: Page, zone: { x: number; z: number; r: number } | null): Promise<void> {
  await page.evaluate(async ({ contractId, seeded }) => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    const key = profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId);
    if (!seeded) localStorage.removeItem(key);
    else {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 1,
        entries: [{ kind: 'sim', id: 'green-waypoint', payload: seeded, schemaVersion: 1 }],
      }));
    }
  }, { contractId: CONTRACT_ID, seeded: zone });
}

/** Fixed-angle debug pack at the zone center: any spawn landing inside the disc must be pushed to the rim. */
async function spawnProbe(page: Page, center: { x: number; z: number }): Promise<Array<{ x: number; z: number }>> {
  return page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    test.teleport(x, z);
    test.spawnPack(6, 1.5);
    return test.enemyPositions().map((enemy) => ({ x: enemy.x, z: enemy.z }));
  }, center);
}

test('a ?debug plant stages once, lands at run end, and is born as sim + render next run — same profile only', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await waitForBoot(page);

  expect(await persistenceDiag(page)).toMatchObject({
    contractId: CONTRACT_ID,
    entries: 0,
    greenWaypoint: null,
    greenWaypointStaged: false,
    noSpawnZones: [],
  });

  // The ?debug plant action: G at the hero's feet.
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), PLANT_AT);
  await pressPlantKey(page);
  await expect.poll(async () => (await persistenceDiag(page)).greenWaypointStaged).toBe(true);

  // Write-at-end law: staged, but nothing persisted mid-run.
  expect(await tileStateKeys(page)).toEqual([]);

  // Persistence never reaches the live sim: this run's tileParams stay untouched.
  expect((await persistenceDiag(page)).noSpawnZones).toEqual([]);

  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  const written = await readSnapshotRaw(page);
  expect(written).not.toBeNull();
  expect(JSON.parse(written!)).toEqual({
    schemaVersion: 1,
    entries: [{ kind: 'sim', id: 'green-waypoint', payload: { x: PLANT_AT.x, z: PLANT_AT.z, r: 3 }, schemaVersion: 1 }],
  });

  // Next tile birth: the sim entry transforms tileParams and mounts the swatch — the hex law holds.
  await page.reload();
  await waitForBoot(page);
  expect(await persistenceDiag(page)).toMatchObject({
    entries: 1,
    greenWaypoint: { x: PLANT_AT.x, z: PLANT_AT.z, r: 3 },
    swatchColor: E1_RIVERBANK_GREEN,
    noSpawnZones: [{ x: PLANT_AT.x, z: PLANT_AT.z, radius: 3 }],
  });

  // The no-spawn zone deflects spawns to the rim, deterministically.
  const probed = await spawnProbe(page, PLANT_AT);
  expect(probed.length).toBeGreaterThanOrEqual(6);
  for (const enemy of probed) {
    expect(Math.hypot(enemy.x - PLANT_AT.x, enemy.z - PLANT_AT.z)).toBeGreaterThanOrEqual(3);
  }

  // Plants ONCE: a second G on a held tile changes nothing, and a run end rewrites nothing.
  const beforeReplant = await readSnapshotRaw(page);
  await pressPlantKey(page);
  await page.waitForTimeout(250);
  expect((await persistenceDiag(page)).greenWaypointStaged).toBe(false);
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  expect(await readSnapshotRaw(page)).toBe(beforeReplant);

  // Another profile is untouched: the green belongs to the one who planted it.
  await page.evaluate(async () => {
    const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
    profiles.createProfile(localStorage, 'Fresh Planter');
  });
  await page.reload();
  await waitForBoot(page);
  expect(await persistenceDiag(page)).toMatchObject({ entries: 0, greenWaypoint: null, noSpawnZones: [] });

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('same seed + same snapshot = identical event logs; the waypoint diverges at tick 0 only and deterministically', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(QUERY);
  await waitForBoot(page);

  const run = async (zone: typeof ZONE_SEED | null) => {
    await seedSnapshot(page, zone);
    await page.reload();
    await waitForBoot(page);
    const tileParamsAtBirth = await page.evaluate(() =>
      JSON.parse(JSON.stringify(window.__THREE_GAME_DIAGNOSTICS__!.contract.tileParams)) as Record<string, unknown>);
    // resetRun zeroes the sim clock: the frames rendered before manual-sim engaged vary per boot.
    const logStart = await page.evaluate(() => {
      const test = window.__GR_TEST__!;
      test.resetRun();
      return test.economyLog().length;
    });
    await page.evaluate(() => window.__GR_TEST__!.advanceSim(40));
    const semanticLog = await page.evaluate((start) =>
      window.__GR_TEST__!.economyLog().slice(start).map((value) => {
        const { id: _id, ...event } = value as Record<string, unknown>;
        return event;
      }), logStart);
    const enemies = await page.evaluate(() =>
      window.__GR_TEST__!.enemyPositions().map((enemy) => ({ x: enemy.x, z: enemy.z, variantId: enemy.variantId })));
    return { tileParamsAtBirth, semanticLog, enemies };
  };

  const bare = await run(null);
  const zonedFirst = await run(ZONE_SEED);
  const zonedSecond = await run(ZONE_SEED);

  // Same seed + same snapshot → the whole run replays exactly (log and end-state).
  expect(zonedSecond.semanticLog).toEqual(zonedFirst.semanticLog);
  expect(zonedSecond.enemies).toEqual(zonedFirst.enemies);

  // The divergence exists AT tick 0 and is exactly the spawn-zone delta, nothing else.
  expect(zonedFirst.tileParamsAtBirth.noSpawnZones).toEqual([{ x: ZONE_SEED.x, z: ZONE_SEED.z, radius: ZONE_SEED.r }]);
  expect(bare.tileParamsAtBirth.noSpawnZones).toBeUndefined();
  const { noSpawnZones: _zones, ...zonedRest } = zonedFirst.tileParamsAtBirth;
  const { noSpawnZones: _none, ...bareRest } = bare.tileParamsAtBirth;
  expect(zonedRest).toEqual(bareRest);

  // And the zone's own effect is deterministic: the fixed-angle probe lands identically across zoned births.
  const probeRun = async () => {
    await seedSnapshot(page, ZONE_SEED);
    await page.reload();
    await waitForBoot(page);
    await page.evaluate(() => window.__GR_TEST__!.resetRun());
    return spawnProbe(page, { x: ZONE_SEED.x, z: ZONE_SEED.z });
  };
  const probeA = await probeRun();
  const probeB = await probeRun();
  expect(probeB).toEqual(probeA);
  for (const enemy of probeA) {
    expect(Math.hypot(enemy.x - ZONE_SEED.x, enemy.z - ZONE_SEED.z)).toBeGreaterThanOrEqual(ZONE_SEED.r);
  }

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('plain boot stays inert: no tile-state keys, no persistence surface', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/');
  await expect(page.getByTestId('profile-title')).toBeVisible();
  expect(await tileStateKeys(page)).toEqual([]);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
