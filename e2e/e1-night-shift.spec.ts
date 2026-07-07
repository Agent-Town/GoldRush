import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const ARTIFACT_DIR = path.resolve('artifacts/e1-night-shift');
const NIGHT_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-shift';

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
  expect(snapshot.registry).toMatchObject({
    name: 'Night Shift',
    tileParams: {
      tileId: 'frontier-river-claim',
      river: true,
      ford: true,
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
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dusk');
  await shot(page, testInfo, 'dusk-wave-5');

  await setWave(page, 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
    phase: 'dark',
    darkness: 1,
  });

  await setWave(page, 25);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dawn');
  await shot(page, testInfo, 'dawn-wave-25');
  await expectClean(errors);
});

test('lantern post is Night Shift gated and creates a true-dark light ring', async ({ page }, testInfo) => {
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
  await grantGold(page, 80);
  await teleport(page, 0, 12);
  await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts ?? 0)).toBe(1);

  await teleport(page, 12, 10);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 10))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(24, 10))).resolves.toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.light ?? 1) ?? []))
    .toEqual(expect.arrayContaining([1, expect.any(Number)]));
  const light = await page.evaluate(() => (window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.light ?? 1) ?? []).sort());
  expect(light[0]).toBeLessThanOrEqual(0.2);
  expect(light.at(-1)).toBeGreaterThanOrEqual(0.98);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemyDimming.sources)).toBeGreaterThanOrEqual(2);
  await shot(page, testInfo, 'true-dark-lantern-ring');

  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('lantern_post', 0))).resolves.toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'lantern_post')?.wrecked))
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => window.__GR_TEST__?.enemyPositions().find((enemy) => Math.abs(enemy.x) < 1)?.light ?? 1),
    )
    .toBeLessThanOrEqual(0.2);
  await expectClean(errors);
});

test('render dimming does not stop turret acquisition or damage', async ({ page }) => {
  const errors = await openGame(
    page,
    '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&nosteal&nowreck&seed=e1-night-combat',
  );
  await setBalance(page, 'enemy.hp', 400);
  await setBalance(page, 'enemy.speed', 0);
  await setWave(page, 10);
  await grantGold(page, 120);
  await teleport(page, 0, 12);
  await expect(selectBuildable(page, 'turret')).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.turrets ?? 0)).toBe(1);
  await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -4))).resolves.toBe(true);

  await expect
    .poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions()[0]?.light ?? 1), { timeout: 8_000 })
    .toBeLessThanOrEqual(0.2);
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
