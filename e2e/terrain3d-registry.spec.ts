import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';

const ARTIFACT_DIR = path.resolve('artifacts/terrain3d-registry');
const ASSET = /(?:the-claim|dry-gulch|twin-banks|night-shift|baron)-(?:terrain|panorama)(?:-[^/?]+)?\.glb/;
type Errors = { console: string[]; page: string[] };
type Contract = {
  id: string;
  panorama: string;
  assets: [string, string];
  water: Array<{ x: number; z: number; zone: string; source?: string }>;
};

const CONTRACTS: Contract[] = [
  { id: 'the-claim', panorama: 'the-claim-panorama', assets: ['the-claim-panorama.glb', 'the-claim-terrain.glb'], water: [{ x: 0, z: 0, zone: 'ford', source: 'river' }, { x: 12, z: 0, zone: 'river', source: 'river' }, { x: 12, z: 5.5, zone: 'shallows', source: 'river' }] },
  { id: 'e1-dry-gulch', panorama: 'dry-gulch-panorama', assets: ['dry-gulch-panorama.glb', 'dry-gulch-terrain.glb'], water: [{ x: -18, z: -18, zone: 'shallows', source: 'spring_pond' }, { x: 0, z: 0, zone: 'bank' }] },
  { id: 'e1-twin-banks', panorama: 'twin-banks-panorama', assets: ['twin-banks-panorama.glb', 'twin-banks-terrain.glb'], water: [{ x: -16, z: 0, zone: 'ford', source: 'river' }, { x: 16, z: 0, zone: 'ford', source: 'river' }, { x: 0, z: 0, zone: 'river', source: 'river' }] },
  { id: 'e1-night-shift', panorama: 'night-shift-panorama', assets: ['night-shift-panorama.glb', 'night-shift-terrain.glb'], water: [{ x: 0, z: 0, zone: 'ford', source: 'river' }, { x: 12, z: 0, zone: 'river', source: 'river' }] },
  { id: 'e1-baron', panorama: 'baron-panorama', assets: ['baron-panorama.glb', 'baron-terrain.glb'], water: [{ x: 0, z: 0, zone: 'ford', source: 'river' }, { x: 12, z: 0, zone: 'river', source: 'river' }] },
];

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contractId: string, extra = ''): Promise<void> {
  await page.goto(`/?debug&contract=${contractId}&nowaves&nolevel&nokill&nopause&seed=terrain3d-registry-${contractId}${extra}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (await begin.isVisible()) await begin.click();
}

async function p95(page: Page, frames = 120): Promise<number> {
  return page.evaluate(async (count) => {
    const samples: number[] = [];
    let previous = performance.now();
    for (let index = 0; index < count; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      samples.push(now - previous);
      previous = now;
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)] ?? 0;
  }, frames);
}

async function fingerprint(browser: Browser, contractId: string, pilot: boolean): Promise<{ hash: string; payload: unknown; errors: Errors; assetRequests: number }> {
  const page = await browser.newPage();
  const errors = collectErrors(page);
  let assetRequests = 0;
  page.on('request', (request) => { if (ASSET.test(request.url())) assetRequests += 1; });
  await boot(page, contractId, pilot ? '&terrain3dPilot' : '');
  if (pilot) {
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState !== 'loading');
    expect(await page.locator('canvas').getAttribute('data-terrain3d-pilot-state')).toBe('ready');
  }
  const payload = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
    test.setManualSim(true);
    test.clearEnemies();
    test.spawnEnemyAt(-18, -18);
    test.spawnEnemyAt(18, -18);
    test.spawnEnemyAt(0, 22);
    test.advanceSim(1.2);
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
    return {
      contract: { id: diagnostics.contract.activeId, tileParams: diagnostics.contract.tileParams },
      sim: diagnostics.terrain.sim,
      bounds: terrain.bounds,
      spawnEdges: terrain.spawnEdges(),
      river: terrain.riverGeometry(),
      fords: terrain.fordRanges(),
      waterSources: terrain.waterSources(),
      fog: diagnostics.lighting ? { near: diagnostics.lighting.fogNear, far: diagnostics.lighting.fogFar } : null,
      samples: [[0, 12], [0, 0], [12, -18]].map(([x, z]) => test.terrainSample(x!, z!)),
      enemies: test.enemyPositions().map(({ id, x, z, hp, vx, vz, zone }) => ({ id, x, z, hp, vx, vz, zone })),
      economy: test.summarizeLog(test.economyLog()),
    };
  });
  await page.close();
  return { payload, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors, assetRequests };
}

test('all five contracts mount their registered terrain and render-only panorama with matching water', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  const report = [];
  await mkdir(ARTIFACT_DIR, { recursive: true });
  for (const contract of CONTRACTS) {
    const requests: string[] = [];
    const listener = (request: { url(): string }) => { if (ASSET.test(request.url())) requests.push(path.basename(new URL(request.url()).pathname)); };
    page.on('request', listener);
    await boot(page, contract.id, '&terrain3dPilot');
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState !== 'loading');
    const canvas = page.locator('canvas');
    const dataset = await canvas.evaluate((element) => ({ ...element.dataset }));
    expect(dataset, JSON.stringify(dataset)).toMatchObject({ terrain3dPilotState: 'ready' });
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-contract', contract.id);
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-height-source', 'baked-grid');
    await expect(canvas).toHaveAttribute('data-terrain3d-pilot-panorama', contract.panorama);
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-meshes'))).toBe(1);
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-triangles'))).toBe(32_768);
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-materials'))).toBe(1);
    expect(requests.sort()).toEqual([...contract.assets].sort());

    const water = await page.evaluate((probes) => probes.map(({ x, z }) => ({ x, z, ...window.__GR_TEST__!.terrainSample(x, z) })), contract.water);
    for (const [index, expected] of contract.water.entries()) {
      expect(water[index]?.zone).toBe(expected.zone);
      if (expected.source) expect(water[index]?.waterSource).toBe(expected.source);
    }
    const heights = await page.evaluate(() => [[-15, 14], [24, 25], [-13, -10], [18, 11], [0, 12]].map(([x, z]) => window.__GR_TEST__!.terrainVisualY(x!, z!)));
    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(0.25);
    report.push({ contract: contract.id, panorama: contract.panorama, requests, water, heights });

    if (testInfo.project.name === 'desktop-chrome') {
      await page.evaluate(() => document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none'));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `${contract.id}-run-camera.png`) });
    }
    page.off('request', listener);
  }
  await writeFile(path.join(ARTIFACT_DIR, `mount-water-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(errors).toEqual({ console: [], page: [] });
});

test('flag-off and flag-on keep bounds, spawns, fog, masks, and simulation byte-identical per map', async ({ browser }, testInfo) => {
  test.setTimeout(180_000);
  const report = [];
  for (const contract of CONTRACTS) {
    const off = await fingerprint(browser, contract.id, false);
    const on = await fingerprint(browser, contract.id, true);
    expect(on.hash).toBe(off.hash);
    expect(off.assetRequests).toBe(0);
    expect(on.assetRequests).toBe(2);
    expect(off.errors).toEqual({ console: [], page: [] });
    expect(on.errors).toEqual({ console: [], page: [] });
    report.push({ contract: contract.id, off: off.hash, on: on.hash, offAssetRequests: off.assetRequests, onAssetRequests: on.assetRequests, payload: off.payload });
  }
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `fingerprints-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
});

test('all five contracts stay painted in LITE and on invalid terrain bytes', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);
  for (const contract of CONTRACTS) {
    let requests = 0;
    const listener = (request: { url(): string }) => { if (ASSET.test(request.url())) requests += 1; };
    page.on('request', listener);
    await boot(page, contract.id, '&terrain3dPilot&tier=lite');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'lite');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
    expect(requests).toBe(0);
    page.off('request', listener);

    const terrain = new RegExp(`${contract.panorama.replace('-panorama', '-terrain')}(?:-[^/?]+)?\\.glb`);
    await page.route(terrain, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes', contentType: 'model/gltf-binary' }));
    await boot(page, contract.id, '&terrain3dPilot');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'failed');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-panorama', 'off');
    await page.unroute(terrain);
  }

  let devTileRequests = 0;
  page.on('request', (request) => { if (ASSET.test(request.url())) devTileRequests += 1; });
  await page.goto('/?debug&tile=gt-test-basin&terrain3dPilot&nowaves&nolevel&nokill&nopause');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'failed');
  await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  expect(devTileRequests).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('disposing while the peer GLB is delayed releases each decoded model immediately', async ({ page }) => {
  test.setTimeout(60_000);
  const panorama = /the-claim-panorama(?:-[^/?]+)?\.glb/;
  let releasePanorama: (() => Promise<void>) | undefined;
  await page.route(panorama, (route) => { releasePanorama = () => route.continue(); });
  await boot(page, 'the-claim');
  const result = await page.evaluate(async () => {
    const THREE = await Function('return import("/@id/three")')() as typeof import('three');
    const pilot = await Function('return import("/src/world/Terrain3dClaimPilot.ts")')() as typeof import('../src/world/Terrain3dClaimPilot');
    const scene = new THREE.Scene();
    const canvas = document.createElement('canvas');
    canvas.id = 'terrain3d-disposal-harness';
    document.body.append(canvas);
    const dispose = pilot.installTerrain3dClaimPilot({ scene, canvas, contractId: 'the-claim', tileId: 'frontier-river-claim' });
    await new Promise<void>((resolve, reject) => {
      const deadline = performance.now() + 20_000;
      const check = () => {
        if (canvas.dataset.terrain3dPilotTerrainLoadState === 'loaded') resolve();
        else if (performance.now() >= deadline) reject(new Error('terrain did not decode before delayed panorama'));
        else requestAnimationFrame(check);
      };
      check();
    });
    dispose();
    return { state: canvas.dataset.terrain3dPilotTerrainLoadState, children: scene.children.length };
  });
  expect(result).toEqual({ state: 'disposed', children: 0 });
  await releasePanorama!();
  await expect(page.locator('#terrain3d-disposal-harness')).toHaveAttribute('data-terrain3d-pilot-panorama-load-state', 'disposed');
  await page.unroute(panorama);
});

test('each registered terrain and panorama stays inside the 115% p95 budget', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  const report = [];
  for (const contract of CONTRACTS) {
    const terrain = new RegExp(`${contract.panorama.replace('-panorama', '-terrain')}(?:-[^/?]+)?\\.glb`);
    let release: (() => Promise<void>) | undefined;
    await page.route(terrain, (route) => { release = () => route.continue(); });
    await boot(page, contract.id, '&terrain3dPilot');
    await expect.poll(() => release).toBeTruthy();
    const paintedP95Ms = await p95(page);
    await release!();
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState !== 'loading');
    expect(await page.locator('canvas').getAttribute('data-terrain3d-pilot-state')).toBe('ready');
    const pilotP95Ms = await p95(page);
    const ratio = pilotP95Ms / paintedP95Ms;
    expect(pilotP95Ms).toBeLessThanOrEqual(paintedP95Ms * 1.15);
    report.push({ contract: contract.id, paintedP95Ms, pilotP95Ms, ratio });
    await page.unroute(terrain);
  }
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(errors).toEqual({ console: [], page: [] });
});
