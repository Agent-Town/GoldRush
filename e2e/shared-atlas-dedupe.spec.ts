import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import type * as THREE from 'three';

const OUT = path.resolve('artifacts/shared-atlas-dedupe');
const contracts = ['the-claim', 'e2-hill-mine', 'e8-mare-claim'];
type Runtime = { scene: THREE.Scene; renderer: THREE.WebGLRenderer; dispose: () => void };
// Test-only read access is installed INSIDE Game's existing ?debug guard.
declare global { interface Window { __ATLAS_RUNTIME__?: () => Runtime } }

test.beforeEach(async ({ request }) => {
  const response = await request.get('/@vite/client');
  test.skip(!/javascript/.test(response.headers()['content-type'] ?? ''),
    'Requires Vite source instrumentation; production WebP GLBs are exercised by the dev-host lifecycle fixture.');
});

async function instrument(page: Page, native = false) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/src/game/Game.ts*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    expect(source).toContain('window.__GR_TEST__ = {');
    await route.fulfill({ response, body: source.replace('window.__GR_TEST__ = {', 'window.__ATLAS_RUNTIME__ = () => ({ scene: this.scene, renderer: this.renderer, dispose: () => this.dispose() }); window.__GR_TEST__ = {') });
  });
  if (native) await page.route('**/src/assets/AssetLoading.ts*', async route => {
    const response = await route.fetch();
    const source = await response.text();
    expect(source).toContain('new SharedAtlasPlugin(parser, cache)');
    await route.fulfill({ response, body: source.replace('new SharedAtlasPlugin(parser, cache)', '({ name: "atlas-native-control" })') });
  });
  return errors;
}

async function boot(page: Page, contract: string) {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nokill&nopause&tier=full&seed=shared-atlas`);
  const begin = page.getByRole('button', { name: 'Begin', exact: true });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => window.__GR_TEST__);
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  await page.waitForFunction(() => window.__GR_TEST__ && document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 60_000 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe(contract);
  await page.evaluate(() => { window.__GR_TEST__!.teleport(8, 12); window.__GR_TEST__!.setManualSim(true); });
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-run3d-pilot-state', 'ready', { timeout: 60_000 });
  await page.evaluate(() => window.__GR_TEST__!.warmVfx());
  await page.waitForTimeout(1000);
}

async function snapshot(page: Page) {
  return page.evaluate(async () => {
    const { imageResidency, warmSceneTextures } = await Function('return import("/artifacts/shared-atlas-dedupe/browser-harness.ts")')() as typeof import('../artifacts/shared-atlas-dedupe/browser-harness');
    const { scene, renderer } = window.__ATLAS_RUNTIME__!();
    warmSceneTextures(scene, renderer);
    return { textures: renderer.info.memory.textures, scene: imageResidency(scene), landmarks: imageResidency(scene.getObjectByName('Terrain3dLandmarks')) };
  });
}

for (const contract of contracts) test(`${contract}: identical atlas sources share residency`, async ({ page, context }, info) => {
  test.setTimeout(180_000);
  const errors = await instrument(page);
  await boot(page, contract);
  const after = await snapshot(page);
  await mkdir(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `after-${contract}-${info.project.name}.png`) });
  // Same seed/camera/tier, native loader in an independent page: no production bypass flag.
  await page.close();
  const control = await context.newPage();
  const controlErrors = await instrument(control, true);
  await boot(control, contract);
  const before = await snapshot(control);
  await control.screenshot({ path: path.join(OUT, `before-${contract}-${info.project.name}.png`) });
  await writeFile(path.join(OUT, `${contract}-${info.project.name}.json`), JSON.stringify({ before, after, errors, controlErrors }, null, 2) + '\n');
  expect(after.landmarks.images).toBeLessThan(before.landmarks.images);
  expect(after.landmarks.estimatedBytes).toBeLessThan(before.landmarks.estimatedBytes);
  if (contract === 'the-claim') expect(before.textures - after.textures).toBeGreaterThanOrEqual(4);
  expect(errors).toEqual([]); expect(controlErrors).toEqual([]);
  await control.close();
});

test('production WebP atlas load-dispose-load returns to the renderer baseline', async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors = await instrument(page);
  await boot(page, 'the-claim');
  // Read production names from GLB image census, rather than predicting Vite hashes.
  const census = JSON.parse(await readFile(path.join(OUT, 'census.json'), 'utf8'));
  const group = census.productionBuild.duplicates.find((entry: { images: string[] }) => entry.images.some(file => file.startsWith('active_headframe-')));
  expect(group?.images).toHaveLength(5);
  const files: string[] = group.images.map((file: string) => file.split('#')[0]);
  const available = await readdir('dist/assets');
  expect(files.every(file => available.includes(file))).toBe(true);
  const proof = await page.evaluate(async urls => {
    const { lifecycle } = await Function('return import("/artifacts/shared-atlas-dedupe/browser-harness.ts")')() as typeof import('../artifacts/shared-atlas-dedupe/browser-harness');
    return lifecycle(window.__ATLAS_RUNTIME__!().renderer, urls);
  }, files.map(file => `/dist/assets/${file}`));
  const gameTeardown = await page.evaluate(async () => {
    const { sharedAtlasCacheSize } = await Function('return import("/artifacts/shared-atlas-dedupe/browser-harness.ts")')() as typeof import('../artifacts/shared-atlas-dedupe/browser-harness');
    const runtime = window.__ATLAS_RUNTIME__!();
    const canvas = runtime.renderer.domElement;
    const cachedBefore = sharedAtlasCacheSize(canvas);
    runtime.dispose();
    return { cachedBefore, cachedAfter: sharedAtlasCacheSize(canvas), texturesAfter: runtime.renderer.info.memory.textures };
  });
  await writeFile(path.join(OUT, `lifecycle-${info.project.name}.json`), JSON.stringify({ ...proof, gameTeardown }, null, 2) + '\n');
  expect(gameTeardown.cachedBefore).toBeGreaterThan(0);
  expect(gameTeardown.cachedAfter).toBe(0);
  for (const cycle of proof.cycles) {
    expect(cycle.images).toBe(1);
    expect(cycle.loaded - proof.baseline).toBe(1);
    expect(cycle.disposed).toBe(proof.baseline);
    expect(cycle.cachedAfterDisposal).toBe(0);
  }
  expect(errors).toEqual([]);
});
