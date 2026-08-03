import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { onRequest as telemetryRoute } from '../functions/api/telemetry';
import { TELEMETRY_DEV_SEND_STORAGE_KEY } from '../src/telemetry/payload';
import type { RenderDemotionPayload } from '../src/telemetry/runBeacon';

type Errors = { console: string[]; page: string[] };

const PERF_CONTRACTS = [
  'the-claim',
  'e5-deepwater-claim',
  'e9-dome-basin',
] as const;

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contract = 'the-claim', extra = ''): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nokill&nopause&seed=terrain3d-default-${contract}${extra}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function p95(page: Page, frames = 180): Promise<number> {
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

test('3D terrain, landmarks, and building models are the honest defaults', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);

  await boot(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-landmark-load-state', 'mounted');
  expect(Number(await canvas.getAttribute('data-terrain3d-pilot-landmarks'))).toBeGreaterThan(0);
  await expect(canvas).toHaveAttribute('data-run3d-pilot-state', 'ready');
  await expect(page.evaluate(() => window.__GR_TEST__?.placeFree('stockpile', 4, 12))).resolves.toBe(true);
  await expect.poll(() => page.evaluate(() => document.querySelector('canvas')?.dataset.run3dPilotMeshes)).toBe('1');

  await boot(page, 'the-claim', '&tier=lite');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'lite');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  await expect(canvas).toHaveAttribute('data-run3d-pilot-state', 'lite');

  await boot(page, 'the-claim', '&tier=full');
  const unknown = await page.evaluate(async () => {
    const THREE = await Function('return import("/@id/three")')() as typeof import('three');
    const { installTerrain3dClaimPilot } = await Function('return import("/src/world/Terrain3dClaimPilot.ts")')() as typeof import('../src/world/Terrain3dClaimPilot');
    const canvas = document.createElement('canvas');
    const scene = new THREE.Scene();
    installTerrain3dClaimPilot({ scene, canvas, contractId: 'unknown-contract', tileId: 'unknown-tile' });
    return { dataset: { ...canvas.dataset }, sceneChildren: scene.children.length };
  });
  expect(unknown).toMatchObject({
    dataset: { terrain3dPilotState: 'failed', terrain3dPilotRenderSource: 'painted' },
    sceneChildren: 0,
  });

  await boot(page, 'the-claim', '&tier=full&terrain2d');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'off');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  expect(errors).toEqual({ console: [], page: [] });
});

test('failed terrain pilot emits one render demotion beacon and warning', async ({ page }) => {
  const posts: RenderDemotionPayload[] = [];
  const warnings: RenderDemotionPayload[] = [];
  const errors = collectErrors(page);
  page.on('console', (message) => {
    if (message.type() !== 'warning' || !message.text().startsWith('[gold-rush] render demotion')) return;
    const payload = message.args()[1];
    if (payload) void payload.jsonValue().then((value) => warnings.push(value as RenderDemotionPayload));
  });
  await page.route('**/api/telemetry', async (route) => {
    const payload = JSON.parse(route.request().postData() ?? '{}') as RenderDemotionPayload;
    if (payload.event === 'render_demotion') posts.push(payload);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/?debug&tier=full');
  await page.evaluate((key) => localStorage.setItem(key, '1'), TELEMETRY_DEV_SEND_STORAGE_KEY);

  const fallback = await page.evaluate(async () => {
    const THREE = await Function('return import("/@id/three")')() as typeof import('three');
    const { installTerrain3dClaimPilot } = await Function('return import("/src/world/Terrain3dClaimPilot.ts")')() as typeof import('../src/world/Terrain3dClaimPilot');
    const canvas = document.createElement('canvas');
    const scene = new THREE.Scene();
    installTerrain3dClaimPilot({ scene, canvas, contractId: 'unknown-contract', tileId: 'unknown-tile' });
    return { dataset: { ...canvas.dataset }, sceneChildren: scene.children.length };
  });

  await expect.poll(() => posts.length).toBe(1);
  await expect.poll(() => warnings.length).toBe(1);
  expect(fallback).toMatchObject({
    dataset: { terrain3dPilotState: 'failed', terrain3dPilotRenderSource: 'painted' },
    sceneChildren: 0,
  });
  expect(posts[0]).toMatchObject({
    event: 'render_demotion',
    reason: 'pilot-contract-unavailable',
    contractId: 'unknown-contract',
    buildId: 'dev',
    tier: 'FULL',
    dataset: { terrain3dPilotState: 'failed', terrain3dPilotRenderSource: 'painted' },
  });
  expect(warnings[0]).toEqual(posts[0]);
  const stored = new Map<string, string>();
  const response = await telemetryRoute({
    request: new Request('http://127.0.0.1/api/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(posts[0]),
    }),
    env: { TELEMETRY: {
      get: async (key) => stored.get(key) ?? null,
      put: async (key, value) => { stored.set(key, value); },
      list: async () => ({ keys: [], list_complete: true }),
    } },
  });
  expect(response.status).toBe(200);
  expect(stored.get('telemetry:render-demotion:total')).toBe('1');
  expect(JSON.parse(stored.get('telemetry:render-demotion:latest:unknown-contract') ?? '{}')).toMatchObject(posts[0]!);
  console.log(`render-demotion sample ${JSON.stringify(posts[0])}`);
  expect(errors).toEqual({ console: [], page: [] });
});

test('promoted terrain stays inside the 115% p95 budget', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);
  const report = [];
  for (const contract of PERF_CONTRACTS) {
    await boot(page, contract, '&tier=full&terrain2d');
    await expect(page.locator('canvas')).toHaveAttribute('data-run3d-pilot-state', 'ready');
    await page.waitForTimeout(500);
    const paintedP95Ms = await p95(page);
    await boot(page, contract, '&tier=full');
    await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
    await expect(page.locator('canvas')).toHaveAttribute('data-run3d-pilot-state', 'ready');
    await page.waitForTimeout(500);
    const terrain3dP95Ms = await p95(page);
    const ratio = terrain3dP95Ms / paintedP95Ms;
    expect(ratio).toBeLessThanOrEqual(1.15);
    report.push({ contract, paintedP95Ms, terrain3dP95Ms, ratio });
  }
  await mkdir(path.resolve('artifacts/terrain3d-default'), { recursive: true });
  await writeFile(path.resolve(`artifacts/terrain3d-default/p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  expect(errors).toEqual({ console: [], page: [] });
});
