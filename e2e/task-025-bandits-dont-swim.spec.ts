import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BuildableId = 'palisade' | 'sluice';

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
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function setBalance(page: Page, path: string, value: number | boolean): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [path, value] as const)).resolves.toBe(
    true,
  );
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target, start + seconds, {
    timeout: 15_000,
  });
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number, rotated = false): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  if (rotated) await page.evaluate(() => window.__GR_TEST__?.rotateBuildGhost());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

async function armPathTracker(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as {
      __task025Path?: { deepSamples: number; fordSamples: number; reached: boolean; samples: number };
    };
    w.__task025Path = { deepSamples: 0, fordSamples: 0, reached: false, samples: 0 };
    const tick = () => {
      const track = w.__task025Path;
      if (!track) return;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
      if (enemy && hero) {
        track.samples += 1;
        if (enemy.zone === 'river') track.deepSamples += 1;
        if (enemy.zone === 'ford') track.fordSamples += 1;
        if (Math.hypot(enemy.x - hero.x, enemy.z - hero.z) < 1.4) track.reached = true;
      }
      if (!track.reached) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function armRiverWatch(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __task025RiverWatch?: { deepSamples: number; samples: number } };
    w.__task025RiverWatch = { deepSamples: 0, samples: 0 };
    const tick = () => {
      const track = w.__task025RiverWatch;
      if (!track) return;
      const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
      track.samples += 1;
      track.deepSamples += enemies.filter((enemy) => enemy.zone === 'river').length;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function armHeroRiverWatch(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as {
      __task025HeroRiver?: { riverSamples: number };
    };
    w.__task025HeroRiver = { riverSamples: 0 };
    const tick = () => {
      const sampler = w.__task025HeroRiver;
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      if (!sampler || !diagnostics) return;
      if (diagnostics.terrain.playerZone === 'river') sampler.riverSamples += 1;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

test('enemy crossing the river reaches the hero through the ford only', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=12&nowaves&nokill&nolevel&nopause&seed=task-025-ford');
  await teleport(page, -12, 12);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-12, -12))).resolves.toBe(true);
  await armPathTracker(page);

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __task025Path?: { reached: boolean } }).__task025Path?.reached ?? false), {
      timeout: 15_000,
    })
    .toBe(true);
  const track = await page.evaluate(() => (window as unknown as { __task025Path?: { deepSamples: number; fordSamples: number } }).__task025Path);
  expect(track?.deepSamples).toBe(0);
  expect(track?.fordSamples ?? 0).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('scheduled waves never place enemies in deep river over three waves', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=20&nokill&nolevel&nopause&seed=task-025-waves');
  await armRiverWatch(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0), { timeout: 15_000 }).toBeGreaterThanOrEqual(3);

  const snapshot = await page.evaluate(() => ({
    watch: (window as unknown as { __task025RiverWatch?: { deepSamples: number; samples: number } }).__task025RiverWatch,
    enemies: window.__GR_TEST__?.enemyPositions() ?? [],
  }));
  expect(snapshot.watch?.samples ?? 0).toBeGreaterThan(0);
  expect(snapshot.watch?.deepSamples).toBe(0);
  expect(snapshot.enemies.filter((enemy) => enemy.zone === 'river')).toHaveLength(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('hero stops in the shallows and keeps weapons armed at the deep channel', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nokill&nolevel&nopause&seed=task-025-wet');
  await setBalance(page, 'enemy.speed', 0);

  await teleport(page, -12, -7);
  await armHeroRiverWatch(page);
  await page.keyboard.down('ArrowDown');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.playerZone), { timeout: 8_000 }).toBe('shallows');
  await page.waitForTimeout(500);
  await page.keyboard.up('ArrowDown');
  const boundary = await page.evaluate(() => ({
    riverSamples: (window as unknown as { __task025HeroRiver?: { riverSamples: number } }).__task025HeroRiver?.riverSamples ?? 0,
    zone: window.__THREE_GAME_DIAGNOSTICS__?.terrain.playerZone,
    deep: window.__GR_TEST__?.terrainSample(-12, 0),
    disarmed: window.__GR_TEST__?.state().arsenal.disarmed,
    reticleDisarmed: document.querySelector('#game-canvas')?.classList.contains('aim-reticle--disarmed') ?? false,
  }));
  expect(boundary.riverSamples).toBe(0);
  expect(boundary.zone).toBe('shallows');
  expect(boundary.deep).toMatchObject({ walkable: false, zone: 'river', waterClass: 'deep' });
  expect(boundary.disarmed).toBe(false);
  expect(boundary.reticleDisarmed).toBe(false);

  await page.evaluate(() => {
    const w = window as unknown as { __task025MaxBolts?: number };
    w.__task025MaxBolts = 0;
    const tick = () => {
      w.__task025MaxBolts = Math.max(w.__task025MaxBolts ?? 0, window.__THREE_GAME_DIAGNOSTICS__?.boltsAlive ?? 0);
      if ((w.__task025MaxBolts ?? 0) <= 0) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-12, -8))).resolves.toBe(true);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __task025MaxBolts?: number }).__task025MaxBolts ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(0);
  await expect(page.evaluate(() => window.__GR_TEST__?.state().arsenal.disarmed)).resolves.toBe(false);
  await expect(page.locator('#game-canvas')).not.toHaveClass(/aim-reticle--disarmed/);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('xp from a residual deep-water death is auto-banked with no mote', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=task-025-xp');
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'pathing.riverBlocksEnemies', false);
  await teleport(page, -12, -6.1);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-12, -4.8))).resolves.toBe(true);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0), { timeout: 10_000 }).toBe(1);
  const xp = await page.evaluate(() => ({
    total: window.__THREE_GAME_DIAGNOSTICS__?.xp ?? 0,
    motesAlive: window.__THREE_GAME_DIAGNOSTICS__?.xpMotesAlive ?? 0,
    audit: window.__THREE_GAME_DIAGNOSTICS__?.xpAudit,
  }));
  expect(xp.total).toBe(Balance.xp.perKill);
  expect(xp.audit?.motesSpawned).toBe(0);
  expect(xp.audit?.overflowBanked).toBe(1);
  expect(xp.motesAlive).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('far-bank sluice stays untouched when the river flank is open', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=10&nowaves&nolevel&nopause&seed=task-025-sluice');
  await setBalance(page, 'sluice.cost', 0);
  await setBalance(page, 'palisade.cost', 0);
  await placeBuildableAt(page, 'sluice', 12, 7);
  for (const [x, z] of [
    [3.5, 6.8],
    [6.5, 6.8],
    [9, 7.5],
  ] as const) {
    await placeBuildableAt(page, 'palisade', x, z, true);
  }
  const beforeHp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'sluice')?.hp ?? 0);

  await teleport(page, 12, 7);
  await armRiverWatch(page);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await waitForSim(page, 8);

  const after = await page.evaluate(() => ({
    hp: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'sluice')?.hp ?? 0,
    watch: (window as unknown as { __task025RiverWatch?: { deepSamples: number } }).__task025RiverWatch,
  }));
  expect(after.hp).toBe(beforeHp);
  expect(after.watch?.deepSamples).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
