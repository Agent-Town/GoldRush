import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';
import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SavedNightSuspend = {
  wave: number;
  buildings: {
    id: string;
    index: number;
    wrecked: boolean;
    repairCostOverride?: number;
    position: { x: number; z: number };
    rotationSteps: number;
  }[];
};

const ARTIFACT_DIR = path.resolve('artifacts/night-bite');
const NIGHT_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-shift';
const RELIGHT_COST = Math.ceil(Balance.lanternPost.cost / 2);
const COLD_LANTERNS = [
  { id: 'lantern_post', x: 0, z: 16, rotationSteps: 0, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -16, z: 18, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 16, z: 18, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -22, z: -12, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 22, z: -12, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: -10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
  { id: 'lantern_post', x: 10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
] as const;
const COLD_LANTERN_POSITIONS = COLD_LANTERNS.map(({ x, z }) => ({ x, z }));
const VISIBLE_LIGHT = 0.35;
const DARK_LIGHT = 0.06;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = NIGHT_QUERY): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await gotoGame(page, query);
  return errors;
}

async function gotoGame(page: Page, query: string): Promise<void> {
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissBriefing(page);
}

async function dismissBriefing(page: Page): Promise<void> {
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  await expect(
    page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const),
  ).resolves.toBe(true);
}

async function setWave(page: Page, wave: number): Promise<void> {
  await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(wave);
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

async function teleport(page: Page, x: number, z: number): Promise<void> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
}

async function selectBuildable(page: Page, id: string): Promise<boolean> {
  return page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId) ?? false, id);
}

async function lanternHp(page: Page) {
  return page.evaluate(() =>
    window.__THREE_GAME_DIAGNOSTICS__?.build.hp
      .filter((entry) => entry.id === 'lantern_post')
      .map((entry) => ({
        index: entry.index,
        hp: entry.hp,
        maxHp: entry.maxHp,
        wrecked: entry.wrecked,
        repairCost: entry.repairCost,
        position: entry.position,
      })) ?? [],
  );
}

async function relightLantern(page: Page, index = 0): Promise<unknown> {
  const target = COLD_LANTERN_POSITIONS[index]!;
  await grantGold(page, 20);
  await teleport(page, target.x, target.z);
  const result = await page.evaluate((targetIndex) => window.__GR_TEST__?.repair('lantern_post', targetIndex), index);
  await expect.poll(() => lanternHp(page).then((entries) => entries[index]?.wrecked)).toBe(false);
  return result;
}

async function spawnAssault(page: Page): Promise<void> {
  const lantern = COLD_LANTERN_POSITIONS[0]!;
  for (const point of [
    { x: lantern.x - 2, z: lantern.z },
    { x: lantern.x, z: lantern.z + 2 },
    { x: lantern.x + 4, z: lantern.z },
    { x: lantern.x + 9, z: lantern.z },
  ]) {
    await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), point)).resolves.toBe(true);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(4);
}

async function enemyLights(page: Page): Promise<number[]> {
  return page.evaluate(() => window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.light ?? 1).sort((a, b) => a - b) ?? []);
}

async function waitForSavedNightWave(page: Page, wave: number): Promise<SavedNightSuspend> {
  await page.waitForFunction(
    ([key, wanted]) => {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      try {
        return (JSON.parse(raw) as { wave?: number }).wave === wanted;
      } catch {
        return false;
      }
    },
    [RUN_SUSPEND_KEY, wave] as const,
    { timeout: 15_000 },
  );
  const raw = await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY);
  expect(raw).toBeTruthy();
  return JSON.parse(raw!) as SavedNightSuspend;
}

async function enemyLightNear(page: Page, point: { x: number; z: number }): Promise<number> {
  const light = await page.evaluate((target) => {
    const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
    let best = null as { distanceSq: number; light: number } | null;
    for (const enemy of enemies) {
      const dx = enemy.x - target.x;
      const dz = enemy.z - target.z;
      const distanceSq = dx * dx + dz * dz;
      if (!best || distanceSq < best.distanceSq) best = { distanceSq, light: enemy.light ?? 1 };
    }
    return best;
  }, point);
  expect(light).toBeTruthy();
  expect(light!.distanceSq).toBeLessThan(1);
  return light!.light;
}

async function spriteLuminance(page: Page, point: { x: number; z: number }): Promise<number> {
  const screen = await page.evaluate((pos) => window.__GR_TEST__?.screenPoint(pos.x, pos.z, 1.25) ?? null, point);
  expect(screen).toBeTruthy();
  expect(screen!.inView).toBe(true);

  const canvas = page.locator('#game-canvas');
  const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  expect(box).toBeTruthy();
  const png = PNG.sync.read(buffer);
  const scaleX = png.width / box!.width;
  const scaleY = png.height / box!.height;
  const centerX = Math.round(screen!.x * scaleX);
  const centerY = Math.round(screen!.y * scaleY);
  const samples: number[] = [];

  for (let y = centerY - 8; y <= centerY + 8; y += 1) {
    if (y < 0 || y >= png.height) continue;
    for (let x = centerX - 6; x <= centerX + 6; x += 1) {
      if (x < 0 || x >= png.width) continue;
      const offset = (y * png.width + x) * 4;
      if (png.data[offset + 3] < 64) continue;
      const r = png.data[offset] / 255;
      const g = png.data[offset + 1] / 255;
      const b = png.data[offset + 2] / 255;
      samples.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
    }
  }

  expect(samples.length).toBeGreaterThan(0);
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length * 0.95)] ?? 0;
}

function visibleThreats(lights: readonly number[]): number {
  return lights.filter((light) => light >= VISIBLE_LIGHT).length;
}

async function expectClean(errors: ErrorBucket): Promise<void> {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('loads Night Shift contract data and ramps full, dusk, dark, dawn lighting', async ({ page }, testInfo) => {
  const errors = await openGame(page);
  const snapshot = await page.evaluate(() => ({
    diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract,
    registry: window.__GR_CONTRACT_REGISTRY__?.loadContract('e1-night-shift'),
    active: window.__GR_TEST__?.activeContract(),
    simTile: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.tile,
    menuIds: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id),
    lighting: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift,
  }));

  expect(snapshot.diagnostics?.activeId).toBe('e1-night-shift');
  expect(snapshot.active?.id).toBe('e1-night-shift');
  expect(snapshot.simTile).toBe('frontier-river-claim');
  expect(snapshot.menuIds).toContain('lantern_post');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(COLD_LANTERNS.length);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPostPositions)).toEqual(COLD_LANTERN_POSITIONS);
  expect(await lanternHp(page)).toEqual(
    COLD_LANTERNS.map(({ x, z }, index) => ({
      index,
      hp: 0,
      maxHp: 35,
      wrecked: true,
      repairCost: RELIGHT_COST,
      position: { x, z },
    })),
  );
  expect(snapshot.registry).toMatchObject({
    name: 'Night Shift',
    tileParams: {
      tileId: 'frontier-river-claim',
      river: true,
      ford: true,
      prePlacedBuildables: COLD_LANTERNS,
    },
    twist: {
      secureWave: 25,
      lightRamp: { duskWave: 5, darkWave: 10, dawnWave: 25 },
    },
    boardRow: {
      name: 'Night Shift',
      tags: ['vein-hunter'],
      unlock: 'science≥3',
    },
  });
  expect(snapshot.diagnostics?.secureWave).toBe(25);
  expect(snapshot.lighting).toMatchObject({ enabled: true, phase: 'full', darkness: 0 });

  await setWave(page, 5);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dusk',
    darkness: 0.62,
  });
  await shot(page, testInfo, 'cold-camp-dusk');

  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dark',
    darkness: 1,
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting)).toMatchObject({
    fogNear: 18,
    fogFar: 42,
  });

  await setWave(page, 25);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dawn');
  await shot(page, testInfo, 'dawn-wave-25');
  await expectClean(errors);
});

test('lantern post is Night Shift gated and relights a true-dark light ring', async ({ page }, testInfo) => {
  const defaultErrors = await openGame(page, '?debug&timescale=3&nolevel&nowaves&seed=e1-night-default');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id))).not.toContain(
    'lantern_post',
  );
  await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(false);
  await expectClean(defaultErrors);

  const errors = await openGame(page);
  await setBalance(page, 'enemy.hp', 500);
  await setBalance(page, 'enemy.speed', 0);
  await setWave(page, 10);
  await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  const repair = await relightLantern(page, 0);
  expect(repair).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });

  const lantern = COLD_LANTERN_POSITIONS[0]!;
  const inRadius = { x: lantern.x + 4, z: lantern.z };
  const outOfRadius = { x: lantern.x + 12, z: lantern.z };
  await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), inRadius)).resolves.toBe(true);
  await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), outOfRadius)).resolves.toBe(true);
  await expect
    .poll(() => enemyLights(page))
    .toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number)]));
  const light = await enemyLights(page);
  expect(light[0]).toBeLessThanOrEqual(DARK_LIGHT);
  expect(light.at(-1)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);

  await teleport(page, (inRadius.x + outOfRadius.x) / 2, lantern.z + 8);
  await page.waitForTimeout(180);
  expect(await enemyLightNear(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
  expect(await enemyLightNear(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  expect(await spriteLuminance(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
  expect(await spriteLuminance(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemyDimming.sources)).toBeGreaterThanOrEqual(2);
  await shot(page, testInfo, 'true-dark-lantern-ring');

  await expectClean(errors);
});

test('lantern coverage is necessary for threat visibility', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-necessity');
  await setBalance(page, 'enemy.hp', 500);
  await setBalance(page, 'enemy.speed', 0);
  await setWave(page, 10);
  await teleport(page, 28, -28);
  await spawnAssault(page);
  const coldLights = await enemyLights(page);
  const coldVisible = visibleThreats(coldLights);
  expect(Math.max(...coldLights)).toBeLessThanOrEqual(DARK_LIGHT);

  await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  await relightLantern(page, 0);
  await teleport(page, 28, -28);
  await spawnAssault(page);
  const litLights = await enemyLights(page);
  const litVisible = visibleThreats(litLights);
  expect(litVisible - coldVisible).toBeGreaterThanOrEqual(3);
  expect(litVisible).toBeGreaterThanOrEqual(3);
  await expectClean(errors);
});

test('cold lantern relight costs survive run suspend and continue', async ({ page, context }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=40&nokill&nolevel&nosteal&nowreck&seed=e1-night-suspend');
  const saved = await waitForSavedNightWave(page, 1);
  expect(
    saved.buildings
      .filter((entry) => entry.id === 'lantern_post')
      .map((entry) => ({
        index: entry.index,
        wrecked: entry.wrecked,
        repairCostOverride: entry.repairCostOverride,
        position: entry.position,
        rotationSteps: entry.rotationSteps,
      })),
  ).toEqual(
    COLD_LANTERNS.map(({ x, z, rotationSteps }, index) => ({
      index,
      wrecked: true,
      repairCostOverride: RELIGHT_COST,
      position: { x, z },
      rotationSteps,
    })),
  );
  await expectClean(errors);
  await page.close();

  const restoredPage = await context.newPage();
  const restoredErrors = await openGame(
    restoredPage,
    '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-suspend',
  );
  await restoredPage.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  await expect(restoredPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave)).resolves.toBe(1);
  await expect(
    restoredPage.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.build as unknown as { lanternPostRotations: number[] }).lanternPostRotations),
  ).resolves.toEqual(COLD_LANTERNS.map(({ rotationSteps }) => rotationSteps));
  await shot(restoredPage, test.info(), 'authored-lantern-rotations-after-restore');
  await expect.poll(() => lanternHp(restoredPage).then((entries) => entries[0]?.repairCost)).toBe(RELIGHT_COST);
  expect(await relightLantern(restoredPage, 0)).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });
  await expectClean(restoredErrors);
  await restoredPage.close();
});

test('pre-placed lanterns leave the full player build cap available', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-player-cap');
  const placed = await page.evaluate((maxCount) => {
    const game = window.__GR_TEST__!;
    let count = 0;
    for (let x = -28; x <= 28 && count < maxCount; x += 7) {
      if (game.placeFree('lantern_post', x, 28)) count += 1;
    }
    return count;
  }, Balance.lanternPost.maxCount);

  expect(placed).toBe(Balance.lanternPost.maxCount);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(
    COLD_LANTERNS.length + Balance.lanternPost.maxCount,
  );
  expect(
    await page.evaluate(() =>
      window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.find((entry) => entry.id === 'lantern_post')?.count,
    ),
  ).toBe(Balance.lanternPost.maxCount);
  const ownership = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    const snapshot = game.captureSuspend();
    const before = snapshot.buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
    const restored = game.restoreSuspend(snapshot);
    const after = game.captureSuspend().buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
    return { before, restored, after };
  });
  expect(ownership.restored).toBe(true);
  expect(ownership.before).toEqual([...Array(COLD_LANTERNS.length).fill(true), ...Array(Balance.lanternPost.maxCount).fill(false)]);
  expect(ownership.after).toEqual(ownership.before);
  await shot(page, testInfo, 'full-player-lantern-cap');
  await expectClean(errors);
});

test('render dimming does not stop turret acquisition or damage', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=e1-night-combat',
  );
  await setBalance(page, 'enemy.hp', 400);
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'turret.range', 20);
  await setWave(page, 10);
  await grantGold(page, 120);
  await teleport(page, 4, 12);
  await expect(selectBuildable(page, 'turret')).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.turrets ?? 0)).toBe(1);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -4))).resolves.toBe(true);

  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.light ?? 1), { timeout: 8_000 })
    .toBeLessThanOrEqual(DARK_LIGHT);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.damageByOwner.turrets ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(1);
  await expectClean(errors);
});

test('wave 25 secures the claim through the dawn victory path', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-night-shift&timescale=20&nolevel&nokill&nosteal&nowreck&seed=e1-night-victory',
  );
  await setBalance(page, 'enemy.speed', 0);
  await setBalance(page, 'waves.graceSeconds', 0.05);
  await setBalance(page, 'waves.waveInterval', 0.25);
  await setBalance(page, 'waves.trickleInterval', 999);
  await setBalance(page, 'waves.pulseBase', 0);
  await setBalance(page, 'waves.pulsePerWave', 0);
  await setBalance(page, 'waves.pulsesPerWave', 1);
  await page.evaluate(() => window.__GR_TEST__?.setWave(24));

  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
          secured: window.__THREE_GAME_DIAGNOSTICS__?.run.secured ?? false,
          phase: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase,
        })),
      { timeout: 10_000 },
    )
    .toMatchObject({ wave: 25, secured: true, phase: 'dawn' });
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  await expectClean(errors);
});

test('seeded Night Shift diagnostics and dark render budget are stable', async ({ page }) => {
  const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-stable');
  await setWave(page, 10);
  const first = await determinismSnapshot(page);
  await gotoGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-stable');
  await setWave(page, 10);
  const second = await determinismSnapshot(page);
  expect(second).toEqual(first);

  await gotoGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&stress=80&seed=e1-night-perf');
  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 0)).toBeGreaterThan(60);
  const perf = await page.evaluate(() => ({
    p95: window.__THREE_GAME_DIAGNOSTICS__?.frameMs.p95 ?? 0,
    calls: window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? 0,
  }));
  expect(perf.p95).toBeLessThanOrEqual(140);
  expect(perf.calls).toBeLessThanOrEqual(220);
  await expectClean(errors);
});

async function determinismSnapshot(page: Page): Promise<unknown> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: diagnostics.contract.activeId,
      secureWave: diagnostics.contract.secureWave,
      lightRamp: diagnostics.contract.lightRamp,
      nightShift: diagnostics.lighting?.nightShift,
      tile: diagnostics.terrain.sim.tile,
      water: diagnostics.terrain.water
        ? {
            material: diagnostics.terrain.water.material,
            riverPresent: diagnostics.terrain.water.riverPresent,
            fordPresent: diagnostics.terrain.water.fordPresent,
            quality: diagnostics.terrain.water.quality,
            mobile: diagnostics.terrain.water.mobile,
            foam: diagnostics.terrain.water.foam,
            glints: diagnostics.terrain.water.glints,
            fordStones: diagnostics.terrain.water.fordStones,
            springPonds: diagnostics.terrain.water.springPonds,
            waterPhaseVariance: diagnostics.terrain.water.waterPhaseVariance,
          }
        : null,
      height: diagnostics.terrain.height.probes,
      scatter: diagnostics.terrain.detailScatter?.signature ?? null,
      harvest: diagnostics.harvest.activeNodes.map((node) => ({
        active: node.active,
        anchorIndex: node.anchorIndex,
        position: node.position,
        remaining: node.remaining,
      })),
      samples: [
        window.__GR_TEST__?.terrainSample(0, 0),
        window.__GR_TEST__?.terrainSample(-12, 0),
        window.__GR_TEST__?.terrainSample(12, 12),
      ],
    };
  });
}
