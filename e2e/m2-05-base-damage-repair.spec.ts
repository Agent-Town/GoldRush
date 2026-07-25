import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Balance } from '../src/game/Balance';

type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret';
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type EconomyEvent = { type: string; sink?: string; amount?: number };
type WallTracker = {
  crossedThrough: boolean;
  reached: boolean;
  done: boolean;
  samples: number;
  last: { x: number; z: number } | null;
};

const shotDir = path.resolve('reviews/shots-m2-05');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-05'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: false });
}

async function setBalance(page: Page, pathKey: string, value: number): Promise<void> {
  await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathKey, value] as const)).resolves.toBe(
    true,
  );
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  await page.waitForTimeout(50);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function economyLog(page: Page): Promise<EconomyEvent[]> {
  return page.evaluate(() => [...(window.__GR_TEST__?.economyLog() ?? [])] as EconomyEvent[]);
}

async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number, rotated = false): Promise<void> {
  await teleport(page, x, z + 2);
  await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  if (rotated) await page.evaluate(() => window.__GR_TEST__?.rotateBuildGhost());
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
}

function repairCost(id: BuildableId): number {
  return Math.ceil(buildBaseCost(id) * Balance.wreck.repairCostFrac);
}

function buildBaseCost(id: BuildableId): number {
  if (id === 'palisade') return Balance.palisade.cost;
  if (id === 'sluice') return Balance.sluice.cost;
  if (id === 'stockpile') return Balance.stockpile.cost;
  if (id === 'turret') return Math.ceil(Balance.turret.costBase / 5) * 5;
  return Math.ceil(Balance.beacon.costBase / 5) * 5;
}

async function waitForSim(page: Page, seconds: number): Promise<void> {
  const start = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForFunction(
    (target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target,
    start + seconds,
    { timeout: 15_000 },
  );
}

async function waitForRendererSettle(page: Page): Promise<void> {
  await waitForSim(page, 0.9);
  await page.waitForFunction(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts === 0
    && window.__THREE_GAME_DIAGNOSTICS__?.agent.embodiment.drifting === false
    && window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.prospector_agent']?.fadeActive !== true,
  );
}

async function hpEntry(page: Page, id: BuildableId, index = 0) {
  return page.evaluate(
    ([family, i]) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === family && entry.index === i),
    [id, index] as const,
  );
}

async function wreck(page: Page, id: BuildableId, index = 0): Promise<void> {
  await expect(page.evaluate(([family, i]) => window.__GR_TEST__?.wreck(family, i), [id, index] as const)).resolves.toBe(true);
  await expect.poll(() => hpEntry(page, id, index).then((entry) => entry?.wrecked ?? false)).toBe(true);
}

test('damage cadence emits building damage and shows damaged-only HP bar', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=m2-05-damage');
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'wreck.damage', 1);
  await setBalance(page, 'wreck.hitCooldown', 2);
  await grantGold(page, 20);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  // Frame the action for the evidence shots: camera follows the hero, and the wall at (0,9) sits
  // ~14 units from the spawn-side teleport — outside the frustum (s25 gate finding). Hero at (0,6)
  // puts wall + swinging wrecker + HP bar in frame without entering repair radius (1.4) or altering
  // wrecker objective (wreckers never retarget the hero — that is test 5's assert).
  await teleport(page, 0, 6);
  await waitForSim(page, 0.5);
  await shot(page, 'wrecker-mid-swing');
  await shot(page, 'damaged-hp-bar');
  // Atomic hp+hits sample in ONE evaluate — separate round-trips straddle a swing at high timescale (s23 lesson).
  const sampleDamage = () =>
    page.evaluate(() => ({
      hp: window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.index === 0)?.hp ?? -1,
      hits: window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? -1,
      bars: window.__THREE_GAME_DIAGNOSTICS__?.build.hpBars ?? -1,
    }));
  const first = await sampleDamage();
  expect(first.hp).toBe(Math.max(0, Balance.wreck.hp.palisade - first.hits));
  expect(first.bars).toBe(1);

  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBeGreaterThan(first.hits);
  const second = await sampleDamage();
  expect(second.hits).toBeGreaterThan(first.hits);
  expect(second.hp).toBe(Math.max(0, Balance.wreck.hp.palisade - second.hits));
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wreck opens a real palisade breach, disables beacon fire, and drops stockpile cap without deleting banked gold', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=m2-05-wreck');
  await setBalance(page, 'enemy.contactDamage', 0);
  await grantGold(page, 120);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await placeBuildableAt(page, 'sentry_beacon', -3, 12);
  await placeBuildableAt(page, 'stockpile', 3, 12);
  await grantGold(page, 500);
  const bankedBeforeWreck = await gold(page);
  expect(bankedBeforeWreck).toBeGreaterThan(Balance.economy.bankCap + Balance.stockpile.capBonus);

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shooterRegistrations ?? 0)).toBe(1);
  await wreck(page, 'palisade');
  await wreck(page, 'sentry_beacon');
  await wreck(page, 'stockpile');
  await shot(page, 'ruin-breach');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.shooterRegistrations ?? -1)).toBe(0);

  const economy = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy);
  expect(economy?.banked).toBe(bankedBeforeWreck);
  expect(economy?.bankCap).toBe(Balance.economy.bankCap);

  await setBalance(page, 'enemy.speed', 1);
  await teleport(page, 0, 12);
  await page.evaluate(() => {
    window.__M2_05_BREACH__ = { crossedThrough: false, reached: false, done: false, samples: 0, last: null };
    const start = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0;
    const tick = () => {
      const tracker = window.__M2_05_BREACH__!;
      const enemy = window.__GR_TEST__?.enemyPositions()[0];
      const now = window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? start;
      if (enemy) {
        const last = tracker.last;
        if (last && last.z <= 9 && enemy.z > 9 && Math.abs(enemy.x) <= 0.85) tracker.crossedThrough = true;
        const dx = enemy.x;
        const dz = enemy.z - 12;
        tracker.reached ||= dx * dx + dz * dz <= 1.4 * 1.4;
        tracker.last = { x: enemy.x, z: enemy.z };
        tracker.samples += 1;
      }
      if (!tracker.reached && now - start < 10) requestAnimationFrame(tick);
      else tracker.done = true;
    };
    requestAnimationFrame(tick);
  });
  await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 5));
  await expect.poll(() => page.evaluate(() => window.__M2_05_BREACH__?.done ?? false), { timeout: 8_000 }).toBe(true);
  const tracker = await page.evaluate(() => window.__M2_05_BREACH__ as WallTracker | undefined);
  expect(tracker?.samples).toBeGreaterThan(0);
  expect(tracker?.crossedThrough).toBe(true);
  expect(tracker?.reached).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('repair dwell spends exact sink, restores function, and keeps replay equal to HUD', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-05-repair');
  await setBalance(page, 'enemy.contactDamage', 0);
  await grantGold(page, 40);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await wreck(page, 'palisade');
  const before = await gold(page);
  const cost = repairCost('palisade');
  await grantGold(page, cost);
  await teleport(page, 0, 9);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 0)).toBeGreaterThan(0);
  await shot(page, 'repair-ring-mid-dwell');

  await expect.poll(() => hpEntry(page, 'palisade').then((entry) => entry?.wrecked ?? true), { timeout: 10_000 }).toBe(false);
  const after = await gold(page);
  expect(after).toBe(before);
  const log = await economyLog(page);
  expect(log.some((event) => event.type === 'gold_spent' && event.sink === 'repair_palisade' && event.amount === cost)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.repairs ?? 0)).toBe(1);
  expect(await hpEntry(page, 'palisade').then((entry) => entry?.hp)).toBe(Balance.wreck.hp.palisade);
  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  expect(diagnostics?.ui?.gold).toBe(diagnostics?.economy.replay.gold);
  await page.setViewportSize({ width: 390, height: 844 });
  await waitForSim(page, 0.2);
  await shot(page, '390px');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('repair interrupt does not debit and no-funds repair shows one blocked float', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-05-repair-blocks');
  await grantGold(page, 10);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await wreck(page, 'palisade');
  await teleport(page, 8, 16);
  await grantGold(page, repairCost('palisade'));
  await teleport(page, 0, 9);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 0)).toBeGreaterThan(0);
  await teleport(page, 8, 16);
  await waitForSim(page, Balance.wreck.repairSeconds + 0.3);
  expect((await economyLog(page)).some((event) => event.sink === 'repair_palisade')).toBe(false);
  expect(await hpEntry(page, 'palisade').then((entry) => entry?.wrecked)).toBe(true);

  await page.evaluate(() => window.__GR_TEST__?.resetRun());
  await grantGold(page, 10);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await wreck(page, 'palisade');
  await teleport(page, 0, 9);
  await waitForSim(page, 0.5);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.blocked ?? false)).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.progress ?? 1)).toBe(0);
  expect((await economyLog(page)).some((event) => event.sink === 'repair_palisade')).toBe(false);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0)).toBeGreaterThan(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wrecker targets nearest buildable and ignores a closer hero', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&nokill&seed=m2-05-targeting');
  await setBalance(page, 'enemy.contactDamage', 0);
  await setBalance(page, 'wreck.damage', 1);
  await setBalance(page, 'wreck.hitCooldown', 2);
  await grantGold(page, 40);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await placeBuildableAt(page, 'palisade', 6, 9);
  await teleport(page, 0, -5);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(true);
  await teleport(page, 0, -2);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);

  const first = await hpEntry(page, 'palisade', 0);
  const second = await hpEntry(page, 'palisade', 1);
  expect(first?.hp).toBeLessThan(Balance.wreck.hp.palisade);
  expect(second?.hp).toBe(Balance.wreck.hp.palisade);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp)).toBe(Balance.hero.maxHp);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('real waves spawn zero wreckers without buildables and nowreck disables them with buildables present', async ({ page }) => {
  let errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&seed=m2-05-neutrality');
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('wreck.minWave', 1);
    window.__GR_TEST__?.setBalance('wreck.pulseEvery', 1);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 2);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 4);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.wreckers ?? -1)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.hitsResolved ?? -1)).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&nowreck&seed=m2-05-nowreck');
  await grantGold(page, 20);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnWrecker('south'))).resolves.toBe(false);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('wreck.minWave', 1);
    window.__GR_TEST__?.setBalance('wreck.pulseEvery', 1);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 2);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 4);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });
  await grantGold(page, 20);
  await placeBuildableAt(page, 'palisade', 0, 9);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wreck.wreckers ?? -1)).toBe(0);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('wreck and repair cycles leave shooter and renderer counts at baseline', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&nopause&seed=m2-05-orphans');
  await page.evaluate(() => window.__GR_TEST__?.warmVfx());
  await grantGold(page, 40);
  await placeBuildableAt(page, 'sentry_beacon', 0, 12);
  await page.waitForFunction(() => ['ready', 'lite', 'failed'].includes(document.querySelector('canvas')?.dataset.run3dPilotState ?? ''));
  for (let i = 0; i < 2; i += 1) {
    await wreck(page, 'sentry_beacon');
    await teleport(page, 8, 16);
    await grantGold(page, repairCost('sentry_beacon'));
    await teleport(page, 0, 12);
    await expect.poll(() => hpEntry(page, 'sentry_beacon').then((entry) => entry?.wrecked ?? true), { timeout: 10_000 }).toBe(false);
  }
  await waitForRendererSettle(page);
  const baseline = await page.evaluate(() => ({
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
    shooters: window.__THREE_GAME_DIAGNOSTICS__?.build.shooterRegistrations,
  }));

  for (let i = 0; i < 3; i += 1) {
    await wreck(page, 'sentry_beacon');
    await teleport(page, 8, 16);
    await grantGold(page, repairCost('sentry_beacon'));
    await teleport(page, 0, 12);
    await expect.poll(() => hpEntry(page, 'sentry_beacon').then((entry) => entry?.wrecked ?? true), { timeout: 10_000 }).toBe(false);
  }

  await waitForRendererSettle(page);
  const after = await page.evaluate(() => ({
    renderer: window.__THREE_GAME_DIAGNOSTICS__?.renderer,
    shooters: window.__THREE_GAME_DIAGNOSTICS__?.build.shooterRegistrations,
  }));
  expect(after.shooters).toBe(baseline.shooters);
  expect(after.renderer?.geometries).toBe(baseline.renderer?.geometries);
  expect(after.renderer?.calls).toBeLessThanOrEqual((baseline.renderer?.calls ?? 0) + 2);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

declare global {
  interface Window {
    __M2_05_BREACH__?: WallTracker;
  }
}
