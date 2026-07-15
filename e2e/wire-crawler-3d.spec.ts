import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const QUERY = '/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nolevel&nopause&seed=wire-crawler-3d';
const ARTIFACT_DIR = path.resolve('artifacts/wire-crawler-3d');
const COMPONENTS = ['drain_mast', 'tracks', 'capacitor_bank'] as const;
const WRECK_GEOMETRIES = 12;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  localStorage.clear();
  localStorage.setItem(key, 'epoch-3-voltage');
}, { key: ACTIVE_EPOCH_KEY }));

async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(QUERY);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setManualSim(true);
    test.setBalance('waves.waveInterval', 0.35);
    test.setBalance('waves.trickleInterval', 999);
    test.setBalance('waves.pulseBase', 0);
    test.setBalance('waves.pulsePerWave', 0);
    test.setBalance('waves.aliveCap', 0);
    test.setBalance('enemy.contactDamage', 0);
    test.setBalance('sparkRig.range', 0);
  });
  return errors;
}

async function spawnCrawler(page: Page): Promise<void> {
  await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.setWave(13);
    test.advanceSim(0.4);
    test.setBalance('waves.waveInterval', 999);
    test.setWave(14);
  });
  await expect.poll(() => crawlerParts(page).then((parts) => parts.length)).toBe(3);
}

async function crawlerParts(page: Page) {
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => enemy.variantId === 'dynamo_crawler'));
}

async function awaitMounted(page: Page): Promise<void> {
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-state', 'ready', { timeout: 15_000 });
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-mounted', 'true');
}

async function setOnlyComponentHp(page: Page, componentId: string, ratio: number): Promise<void> {
  expect(await page.evaluate(({ id, hpRatio }) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    for (const enemy of snapshot.enemies.active) {
      if (enemy.variantId === 'dynamo_crawler') enemy.hp = enemy.maxHp * (enemy.bossComponentId === id ? hpRatio : 1);
    }
    return test.restoreSuspend(snapshot);
  }, { id: componentId, hpRatio: ratio })).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
}

async function destroyComponent(page: Page, componentId: string) {
  expect(await page.evaluate((id) => {
    const test = window.__GR_TEST__!;
    const snapshot = structuredClone(test.captureSuspend()) as any;
    let found = false;
    for (const enemy of snapshot.enemies.active) {
      if (enemy.variantId !== 'dynamo_crawler') continue;
      enemy.hp = enemy.maxHp * (enemy.bossComponentId === id ? 0.49 : 1);
      found ||= enemy.bossComponentId === id;
    }
    return found && test.restoreSuspend(snapshot);
  }, componentId)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.1));
  await awaitMounted(page);
  const loaded = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  const target = (await crawlerParts(page)).find((enemy) => enemy.bossComponentId === componentId) ?? null;
  expect(target).not.toBeNull();
  await page.evaluate(({ x, z, maxHp }) => {
    const test = window.__GR_TEST__!;
    test.setBalance('blast.damage', maxHp * 0.52);
    test.launchBlastAt(x, z, 0.05);
    test.advanceSim(0.25);
  }, target!);
  await expect.poll(() => crawlerParts(page).then((parts) => parts.some((enemy) => enemy.bossComponentId === componentId))).toBe(false);
  return loaded;
}

async function frameCrawler(page: Page): Promise<void> {
  const parts = await crawlerParts(page);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z + 8), {
    x: parts.reduce((sum, enemy) => sum + enemy.x, 0) / parts.length,
    z: parts.reduce((sum, enemy) => sum + enemy.z, 0) / parts.length,
  });
  await page.waitForTimeout(800);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

test('mounts the Crawler GLB, flips all three damage morphs, and disposes on kill', async ({ page }, testInfo) => {
  const errors = await open(page);
  await page.evaluate(() => window.__GR_TEST__!.warmVfx());
  await page.waitForTimeout(800);
  const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  await spawnCrawler(page);
  await awaitMounted(page);
  await frameCrawler(page);
  await shot(page, testInfo, 'intact');

  const mounted = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  expect(mounted.geometries - baseline.geometries).toBeGreaterThanOrEqual(3);
  expect(mounted.textures - baseline.textures).toBeGreaterThanOrEqual(1);

  for (const componentId of COMPONENTS) {
    await setOnlyComponentHp(page, componentId, 0.49);
    await awaitMounted(page);
    await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-damage-states', new RegExp(`"${componentId}":"broken"`));
    await frameCrawler(page);
    await shot(page, testInfo, `${componentId}-broken`);
  }

  let loadedBeforeKill = mounted;
  for (const componentId of COMPONENTS) loadedBeforeKill = await destroyComponent(page, componentId);
  const presentationBaseline = {
    geometries: loadedBeforeKill.geometries + WRECK_GEOMETRIES - 3,
    textures: loadedBeforeKill.textures - 1,
  };
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-state', 'disposed');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.geometries)).toBe(presentationBaseline.geometries);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.textures)).toBeLessThanOrEqual(presentationBaseline.textures);
  const disposed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer);
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `renderer-counts-${testInfo.project.name}.json`), `${JSON.stringify({ coldBaseline: baseline, mounted, loadedBeforeKill, presentationBaseline, disposed }, null, 2)}\n`);
  await shot(page, testInfo, 'post-kill-baseline');
  expect(errors).toEqual([]);
});

test('LITE keeps the placeholder and never requests the Crawler GLB', async ({ page }) => {
  let requests = 0;
  page.on('request', (request) => { if (request.url().includes('crawler.glb')) requests += 1; });
  await page.addInitScript(() => localStorage.setItem('gr.performance.tier.v1', 'lite'));
  const errors = await open(page);
  await spawnCrawler(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-state', 'lite');
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-source', 'placeholder');
  expect(requests).toBe(0);
  expect(errors).toEqual([]);
});

test('invalid Crawler GLB bytes keep the placeholder presentation', async ({ page }) => {
  await page.route('**/crawler.glb*', (route) => route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid' }));
  const errors = await open(page);
  await spawnCrawler(page);
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-state', 'failed', { timeout: 15_000 });
  await expect(page.locator('canvas')).toHaveAttribute('data-crawler3d-source', 'placeholder');
  expect(errors).toEqual([]);
});
