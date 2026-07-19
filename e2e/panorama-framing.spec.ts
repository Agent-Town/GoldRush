import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

const SHOT_DIR = path.resolve('reviews/shots-panorama');
const ASPECTS = [
  { width: 1200, height: 800, label: '1.5' },
  { width: 1440, height: 800, label: '1.8' },
  { width: 1760, height: 800, label: '2.2' },
] as const;
const MATRIX_CONTRACTS = ['the-claim', 'e1-night-shift', 'e4-gusher-county'] as const;
const PROOF_CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e4-gusher-county'] as const;

type Errors = { console: string[]; page: string[] };

for (const contract of MATRIX_CONTRACTS) {
  test(`${contract} keeps its panorama in world framing across the wide aspect matrix`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    for (const viewport of ASPECTS) {
      await page.setViewportSize(viewport);
      await bootRun(page, contract, `matrix-${viewport.label}`);
      const canvas = page.locator('#game-canvas');
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-panorama-framing', 'world-projected-horizon');
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-panorama-fog', 'excluded');
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-continuation', /^(sculpt-edge|panorama-owned)-continuation$/);
      await expect.poll(() => cameraAspectError(page)).toBeLessThanOrEqual(0.01);
      expectUpperRowsToHaveWorldDetail(await page.screenshot(), `${contract} at ${viewport.label}:1`);
    }
    expect(errors).toEqual({ console: [], page: [] });
  });
}

test('legacy painted ground stays hidden while sculpt landmarks remain mounted', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 1760, height: 800 });
  for (const contract of PROOF_CONTRACTS) {
    await bootRun(page, contract, `ground-${contract}`);
    const canvas = page.locator('#game-canvas');
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-hidden-relief')), contract).toBeGreaterThanOrEqual(3);
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-landmarks')), contract)
      .toBe(Number(await canvas.getAttribute('data-terrain3d-pilot-landmark-expected')));
    expect(Number(await canvas.getAttribute('data-terrain3d-pilot-landmark-skipped')), contract).toBe(0);
    if (contract === 'e1-dry-gulch') {
      await expect(canvas).toHaveAttribute('data-terrain3d-pilot-hidden-ground-layers', /SpringPonds/);
    }
  }
  expect(errors).toEqual({ console: [], page: [] });
});

test('wide win return reaches a clean town frame', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 2000, height: 1000 });
  await bootRun(page, 'the-claim', 'win-return');
  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await page.getByTestId('stake-again').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => cameraAspectError(page)).toBeLessThanOrEqual(0.01);
  expectUpperRowsToHaveWorldDetail(await page.screenshot(), 'town after win return');
  expect(errors).toEqual({ console: [], page: [] });
});

test('write the three 2000x1000 run-camera proof shots', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome');
  test.setTimeout(90_000);
  await mkdir(SHOT_DIR, { recursive: true });
  await page.setViewportSize({ width: 2000, height: 1000 });
  for (const contract of PROOF_CONTRACTS) {
    await bootRun(page, contract, `proof-${contract}`);
    await page.screenshot({ path: path.join(SHOT_DIR, `after-${contract}-2000x1000.png`) });
  }
});

async function bootRun(page: Page, contract: string, seed: string): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nokill&nopause&tier=full&seed=panorama-${seed}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
}

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function cameraAspectError(page: Page): Promise<number> {
  return page.locator('#game-canvas').evaluate((canvas) => {
    const camera = Number((canvas as HTMLCanvasElement).dataset.cameraAspect);
    const css = Number((canvas as HTMLCanvasElement).dataset.cssAspect);
    return Number.isFinite(camera) && Number.isFinite(css) ? Math.abs(camera - css) : Number.POSITIVE_INFINITY;
  });
}

function expectUpperRowsToHaveWorldDetail(buffer: Buffer, label: string): void {
  const png = PNG.sync.read(buffer);
  for (const ratio of [0.12]) {
    const y = Math.floor(png.height * ratio);
    const values: number[] = [];
    const buckets = new Set<number>();
    for (let x = Math.floor(png.width * 0.2); x < png.width * 0.8; x += 4) {
      const offset = (y * png.width + x) * 4;
      const red = png.data[offset]!;
      const green = png.data[offset + 1]!;
      const blue = png.data[offset + 2]!;
      values.push(red * 0.2126 + green * 0.7152 + blue * 0.0722);
      buckets.add((red >> 4) << 8 | (green >> 4) << 4 | (blue >> 4));
    }
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
    expect(deviation, `${label}: flat stripe signature at y=${ratio}`).toBeGreaterThan(4);
    expect(buckets.size, `${label}: smeared stripe signature at y=${ratio}`).toBeGreaterThan(4);
  }
}
