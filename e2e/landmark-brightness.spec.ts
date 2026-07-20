import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';
import { Balance } from '../src/game/Balance';

const ARTIFACT_DIR = path.resolve('artifacts/landmark-brightness');
const ATLAS = path.resolve('assets/pilots/map-rebuild-spike/landmarks/the-claim/the-claim-landmarks-atlas.png');
type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contract: string): Promise<void> {
  await page.goto(`/?debug&autotier&contract=${contract}&nowaves&nolevel&nokill&nopause&seed=landmark-brightness-${contract}&tier=full`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready');
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

function medianLuminance(png: PNG, centerX?: number, centerY?: number): number {
  const values: number[] = [];
  const minX = centerX === undefined ? 0 : centerX - 8;
  const maxX = centerX === undefined ? png.width - 1 : centerX + 8;
  const minY = centerY === undefined ? 0 : centerY - 8;
  const maxY = centerY === undefined ? png.height - 1 : centerY + 8;
  for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
    const offset = (y * png.width + x) * 4;
    values.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  }
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 0;
}

test('The Claim keeps daylight landmarks opaque, lit, and under the frame budget', async ({ page }, testInfo: TestInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await boot(page, 'the-claim');
  await page.evaluate(() => window.__GR_TEST__!.teleport(8, 12));
  await page.waitForTimeout(300);

  const canvas = page.locator('#game-canvas');
  await expect(canvas).toHaveAttribute('data-terrain3d-pilot-night-pools', 'off');
  const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
    id: string; total: number; transparent: number; depthWriteDisabled: number;
  }>;
  expect(materials.find((material) => material.id === 'maintained_claim_house')).toMatchObject({
    total: 1,
    transparent: 0,
    depthWriteDisabled: 0,
  });

  const point = await page.evaluate(() => window.__GR_TEST__!.screenPoint(10.5, 14.5, 4.5));
  expect(point.inView).toBe(true);
  const box = await canvas.boundingBox();
  expect(box).toBeTruthy();
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const shot = await canvas.screenshot({ path: path.join(ARTIFACT_DIR, `after-${testInfo.project.name}.png`) });
  const rendered = PNG.sync.read(shot);
  const renderedLuminance = medianLuminance(
    rendered,
    Math.round(point.x * rendered.width / box!.width),
    Math.round(point.y * rendered.height / box!.height),
  );
  const atlasLuminance = medianLuminance(PNG.sync.read(await readFile(ATLAS)));
  expect(renderedLuminance).toBeGreaterThan(0.06);
  expect(renderedLuminance / atlasLuminance).toBeGreaterThan(0.25);

  expect(await p95(page)).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('Night Shift keeps ground light pools without mutating landmark materials', async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page, 'e1-night-shift');
  await page.evaluate(() => window.__GR_TEST__!.setWave(10));
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return canvas?.dataset.terrain3dPilotNightPools === 'world-shader'
      && Number(canvas.dataset.terrain3dPilotNightPoolSources) > 0;
  });
  const canvas = page.locator('#game-canvas');
  const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
    transparent: number; depthWriteDisabled: number;
  }>;
  expect(materials.length).toBeGreaterThan(0);
  expect(materials.every((material) => material.transparent === 0 && material.depthWriteDisabled === 0)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});
