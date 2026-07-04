import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type OwnerKills = Record<string, number | undefined>;
type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-06'): Promise<ErrorBucket> {
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

async function easyEnemies(page: Page, hp = 10): Promise<void> {
  await setBalance(page, 'enemy.hp', hp);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'enemy.contactDamage', 0);
}

async function ownerKills(page: Page): Promise<OwnerKills> {
  return page.evaluate(() => ({ ...(window.__THREE_GAME_DIAGNOSTICS__?.build.killsByOwner ?? {}) }));
}

async function toggleBlast(page: Page): Promise<void> {
  await expect(page.evaluate(() => window.__GR_TEST__?.toggleWeapon())).resolves.toBe('blast');
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.active)).toBe('blast');
}

async function spawnFrozenPack(page: Page, count: number, radius: number): Promise<void> {
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0);
  await page.evaluate(([n, r]) => window.__GR_TEST__?.spawnPack(n, r, { speedScale: 0 }), [count, radius] as const);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0))
    .toBeGreaterThanOrEqual(before + count);
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

test('toggle defaults to rig, then blast kills while rig owner stops', async ({ page }) => {
  const errors = await openGame(page);
  await easyEnemies(page, 24);
  await spawnFrozenPack(page, 1, 2);
  await expect.poll(() => ownerKills(page).then((kills) => kills.hero ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  expect((await ownerKills(page)).hero_blast ?? 0).toBe(0);
  expect((await ownerKills(page)).turrets ?? 0).toBe(0);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  const rigKills = (await ownerKills(page)).hero ?? 0;
  await easyEnemies(page, 10);
  await toggleBlast(page);
  await spawnFrozenPack(page, 1, 2);

  await expect.poll(() => ownerKills(page).then((kills) => kills.hero_blast ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  expect((await ownerKills(page)).hero ?? 0).toBe(rigKills);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('one blast detonation kills a frozen cluster once through hero_blast', async ({ page }) => {
  const errors = await openGame(page);
  await easyEnemies(page, 10);
  await toggleBlast(page);
  await spawnFrozenPack(page, 4, 0.35);

  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBe(1);
  await expect.poll(() => ownerKills(page).then((kills) => kills.hero_blast ?? 0)).toBe(4);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? -1)).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('blast friendly fire leaves hero and buildables intact, beacon still fires', async ({ page }) => {
  const errors = await openGame(page);
  await easyEnemies(page, 10);
  await setBalance(page, 'beacon.costBase', 0);
  await setBalance(page, 'palisade.cost', 0);
  await grantGold(page, 10);
  await placeBuildableAt(page, 'sentry_beacon', -2, 12);
  await placeBuildableAt(page, 'palisade', 1, 11);
  const hpBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0);

  await toggleBlast(page);
  await spawnFrozenPack(page, 1, 2);
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0)).toBe(hpBefore);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0)).toBe(1);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await page.evaluate(() => window.__GR_TEST__?.teleport(20, 20));
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-2, 10));
  await expect.poll(() => ownerKills(page).then((kills) => kills.beacons ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('turret line of sight ignores blocked nearest and shoots clear second target', async ({ page }) => {
  const errors = await openGame(page);
  await easyEnemies(page, 10);
  await setBalance(page, 'palisade.cost', 0);
  await setBalance(page, 'turret.costBase', 0);
  await grantGold(page, 10);
  await placeBuildableAt(page, 'palisade', 0, 10);
  await placeBuildableAt(page, 'turret', 0, 12);
  await page.evaluate(() => window.__GR_TEST__?.teleport(20, 20));

  await page.evaluate(() => {
    const w = window as unknown as { __m206TurretTrack: { samples: number; maxKills: number } };
    w.__m206TurretTrack = { samples: 0, maxKills: 0 };
    const tick = () => {
      const track = w.__m206TurretTrack;
      track.samples += 1;
      track.maxKills = Math.max(track.maxKills, window.__GR_TEST__?.state().arsenal.turretKills ?? 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 8));
  await page.waitForTimeout(2200);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0)).toBe(0);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);

  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(6, 12));
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0), { timeout: 12_000 }).toBe(1);
  const track = await page.evaluate(() => (window as unknown as { __m206TurretTrack: { samples: number; maxKills: number } }).__m206TurretTrack);
  expect(track.samples).toBeGreaterThan(2);
  expect(track.maxKills).toBe(1);
  expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('slot 5 selects turret, spends once, and HUD gold matches replay', async ({ page }) => {
  const errors = await openGame(page);
  await grantGold(page, 75);
  await page.keyboard.press('KeyB');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? false)).toBe(true);
  await expect(page.locator('[data-testid="hud-build-tile-turret"]')).toBeVisible();
  await page.keyboard.press('Digit5');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe('turret');
  await page.keyboard.press('Enter');

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.turrets ?? 0)).toBe(1);
  const spent = await page.evaluate(() =>
    (window.__GR_TEST__?.economyLog() ?? []).filter((event) => (event as { sink?: string }).sink === 'build_turret').length,
  );
  expect(spent).toBe(1);
  const diag = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  expect(diag?.ui?.gold).toBe(diag?.economy.replay.gold);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('real waves stay neutral without toggling or turrets', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&seed=m2-06-neutral');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('waves.waveInterval', 2);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 3);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  const state = await page.evaluate(() => window.__GR_TEST__?.state().arsenal);
  expect(state?.active).toBe('rig');
  expect(state?.detonations).toBe(0);
  const kills = await ownerKills(page);
  expect(kills.hero_blast ?? 0).toBe(0);
  expect(kills.turrets ?? 0).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('stress blast pool never exceeds cap', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nolevel&nopause&stress=60&seed=m2-06-stress');
  await easyEnemies(page, 10);
  await toggleBlast(page);
  await page.evaluate(() => {
    const w = window as unknown as { __m206BlastTrack: { samples: number; maxAlive: number } };
    w.__m206BlastTrack = { samples: 0, maxAlive: 0 };
    const tick = () => {
      const track = w.__m206BlastTrack;
      track.samples += 1;
      track.maxAlive = Math.max(track.maxAlive, window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
  const track = await page.evaluate(() => (window as unknown as { __m206BlastTrack: { samples: number; maxAlive: number } }).__m206BlastTrack);
  expect(track.samples).toBeGreaterThan(2);
  expect(track.maxAlive).toBeGreaterThan(0);
  expect(track.maxAlive).toBeLessThanOrEqual(Balance.blast.pool);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
