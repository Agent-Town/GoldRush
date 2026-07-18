import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

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
