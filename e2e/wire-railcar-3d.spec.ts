import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/wire-railcar-3d');
const QUERY = '/?debug&contract=e2-hill-mine&nolevel&nopause&nosteal&nowreck&timescale=1&seed=wire-railcar-3d';

async function open(page: Page, suffix = ''): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${QUERY}${suffix}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 16);
  await page.getByTestId('contract-briefing-dismiss').click();
  return errors;
}

async function spawnBoss(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__!.setBalance('waves.trickleInterval', 999);
    window.__GR_TEST__!.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__!.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__!.setBalance('waves.aliveCap', 0);
    window.__GR_TEST__!.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__!.setBalance('sparkRig.range', 0);
    window.__GR_TEST__!.setWave(11);
    window.__GR_TEST__!.advanceSim(0.4);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar').length)).toBe(3);
}

async function railcars(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.eliteKind === 'railcar'));
}

async function damageOnly(page: Page, componentId: string): Promise<void> {
  expect(await page.evaluate((id) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    for (const enemy of snapshot.enemies.active) {
      if (enemy.eliteKind === 'railcar') enemy.hp = enemy.maxHp * (enemy.bossComponentId === id ? 0.49 : 1);
    }
    return test.restoreSuspend(snapshot);
  }, componentId)).toBe(true);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  await expect.poll(() => page.locator('canvas').getAttribute('data-railcar3d-damage-states')).toContain(`"${componentId}":"broken"`);
  const active = await railcars(page);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), {
    x: active.reduce((sum, enemy) => sum + enemy.x, 0) / active.length,
    z: active.reduce((sum, enemy) => sum + enemy.z, 0) / active.length,
  });
  await page.waitForTimeout(1_200);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('GLB rides the rail, exposes all three damage morphs, preserves wreckage, and disposes', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = await open(page);
  await page.evaluate(() => window.__GR_TEST__!.warmVfx());
  await page.waitForTimeout(800);
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  await spawnBoss(page);

  for (const seconds of [2, 8, 12]) await page.evaluate((delta) => window.__GR_TEST__!.advanceSim(delta), seconds);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-mounted', 'true');
  const intact = await railcars(page);
  expect(intact).toHaveLength(3);
  expect(intact.every((enemy) => (enemy.presentation as typeof enemy.presentation & { source: string }).source === 'glb')).toBe(true);
  expect(intact.every((enemy) => enemy.presentation.visible && Math.abs(enemy.y - enemy.presentation.railY) < 0.01)).toBe(true);
  expect(intact.every((enemy) => {
    const presentation = enemy.presentation as typeof enemy.presentation & { bossBarY: number; bossBarScale: number };
    return presentation.bossBarY < 2 && presentation.bossBarScale === 1;
  })).toBe(true);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), {
    x: intact.reduce((sum, enemy) => sum + enemy.x, 0) / intact.length,
    z: intact.reduce((sum, enemy) => sum + enemy.z, 0) / intact.length,
  });
  await shot(page, testInfo, 'intact-on-rail');

  const beforeEnd = intact.reduce((sum, enemy) => sum + enemy.x, 0) / intact.length;
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(26));
  const atEnd = await railcars(page);
  expect(atEnd).toHaveLength(3);
  expect(atEnd.every((enemy) => enemy.presentation.visible)).toBe(true);
  expect(atEnd.reduce((sum, enemy) => sum + enemy.x, 0) / atEnd.length).toBeGreaterThan(beforeEnd + 45);
  expect(await page.evaluate(() => window.__GR_TEST__!.restoreSuspend(window.__GR_TEST__!.captureSuspend()))).toBe(true);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(4));
  const returning = await railcars(page);
  expect(returning).toHaveLength(3);
  expect(returning.every((enemy) => enemy.presentation.visible && enemy.vx < 0)).toBe(true);

  for (const id of ['wheels', 'boiler', 'cabin']) {
    await damageOnly(page, id);
    await shot(page, testInfo, `${id}-broken`);
  }

  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    for (const enemy of snapshot.enemies.active) {
      if (enemy.eliteKind === 'railcar') enemy.hp = enemy.bossComponentId === 'wheels' ? 0.01 : enemy.maxHp;
    }
    test.restoreSuspend(snapshot);
  });
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  const wheels = (await railcars(page)).find((enemy) => enemy.bossComponentId === 'wheels')!;
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__!.setBalance('blast.damage', 0.02);
    window.__GR_TEST__!.launchBlastAt(x, z, 0.05);
    window.__GR_TEST__!.advanceSim(0.2);
  }, wheels);
  await expect.poll(async () => (await railcars(page)).some((enemy) => enemy.bossComponentId === 'wheels')).toBe(false);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-mounted', 'true');
  await expect.poll(() => page.locator('canvas').getAttribute('data-railcar3d-damage-states')).toContain('"wheels":"broken"');

  const loadedCounts = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  await page.evaluate(() => window.__GR_TEST__!.clearEnemies());
  await expect.poll(async () => (await railcars(page)).length).toBe(0);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'disposed');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.geometries)).toBeLessThanOrEqual(loadedCounts.geometries - 3);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.textures)).toBeLessThanOrEqual(loadedCounts.textures - 1);
  const despawnCounts = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);

  await spawnBoss(page);
  for (const seconds of [2, 8, 12]) await page.evaluate((delta) => window.__GR_TEST__!.advanceSim(delta), seconds);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    for (const enemy of snapshot.enemies.active) if (enemy.eliteKind === 'railcar') enemy.hp = 0.01;
    test.restoreSuspend(snapshot);
  });
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  const boiler = (await railcars(page)).find((enemy) => enemy.bossComponentId === 'boiler')!;
  await page.evaluate(({ x, z }) => {
    window.__GR_TEST__!.setBalance('blast.damage', 9999);
    window.__GR_TEST__!.launchBlastAt(x, z, 0.05);
    window.__GR_TEST__!.advanceSim(0.2);
  }, boiler);
  await expect.poll(async () => (await railcars(page)).length).toBe(0);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'disposed');
  const disposedCounts = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  expect(disposedCounts.geometries - baseline.geometries).toBeLessThan(8);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `renderer-counts-${testInfo.project.name}.json`), `${JSON.stringify({
    baseline,
    mounted: loadedCounts,
    despawned: despawnCounts,
    despawnDelta: {
      geometries: despawnCounts.geometries - loadedCounts.geometries,
      textures: despawnCounts.textures - loadedCounts.textures,
    },
    combatDeath: disposedCounts,
  }, null, 2)}\n`);
  await shot(page, testInfo, 'post-kill-baseline');
  expect(errors).toEqual([]);
});

test('LITE keeps the painted billboard and never requests the GLB', async ({ page }) => {
  let requests = 0;
  page.on('request', (request) => { if (request.url().includes('railcar.glb')) requests += 1; });
  await page.addInitScript(() => localStorage.setItem('gr.performance.tier.v1', 'lite'));
  const errors = await open(page);
  await spawnBoss(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'lite');
  expect((await railcars(page)).every((enemy) => (enemy.presentation as typeof enemy.presentation & { source: string }).source === 'billboard')).toBe(true);
  expect(requests).toBe(0);
  expect(errors).toEqual([]);
});

test('a component destroyed during model loading mounts as broken', async ({ page }) => {
  await page.route('**/railcar.glb*', async (route) => {
    const response = await route.fetch();
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.fulfill({ response });
  });
  const errors = await open(page);
  await spawnBoss(page);
  const wheels = (await railcars(page)).find((enemy) => enemy.bossComponentId === 'wheels')!;
  await page.evaluate(({ x, z }) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    const wheel = snapshot.enemies.active.find((enemy: any) => enemy.eliteKind === 'railcar' && enemy.bossComponentId === 'wheels');
    wheel.hp = 0.01;
    test.restoreSuspend(snapshot);
    test.setBalance('blast.damage', 0.02);
    test.launchBlastAt(x, z, 0.05);
    test.advanceSim(0.2);
  }, wheels);
  await expect.poll(async () => (await railcars(page)).length).toBe(2);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'ready', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-damage-states', /"wheels":"broken"/);
  expect(errors).toEqual([]);
});

test('invalid GLB bytes fall back to the painted billboard', async ({ page }) => {
  await page.route('**/railcar.glb*', (route) => route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid' }));
  const errors = await open(page);
  await spawnBoss(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-railcar3d-state', 'failed', { timeout: 15_000 });
  expect((await railcars(page)).every((enemy) => (enemy.presentation as typeof enemy.presentation & { source: string }).source === 'billboard')).toBe(true);
  expect(errors).toEqual([]);
});
