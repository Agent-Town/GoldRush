import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

type ErrorBucket = {
  consoleErrors: string[];
  pageErrors: string[];
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&seed=${seed}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.assets['terrain.bank'] === 'loaded');
  await page.evaluate(() => window.__GR_TEST__?.setBalance('camera.lag', 0.001));
  return errors;
}

async function groundScreenshot(page: Page, x: number, z: number): Promise<{ png: PNG; calls: number }> {
  await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  await expect
    .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? Number.NaN))
    .toBeCloseTo(x, 2);
  await page.waitForTimeout(120);
  const buffer = await page.locator('#game-canvas').screenshot();
  const calls = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.calls ?? -1);
  return { png: PNG.sync.read(buffer), calls };
}

function meanPixelDelta(a: PNG, b: PNG): number {
  expect(a.width).toBe(b.width);
  expect(a.height).toBe(b.height);
  let total = 0;
  let count = 0;
  for (let y = Math.floor(a.height * 0.58); y < Math.floor(a.height * 0.84); y += 1) {
    for (let x = Math.floor(a.width * 0.58); x < Math.floor(a.width * 0.84); x += 1) {
      const offset = (y * a.width + x) * 4;
      total +=
        Math.abs(a.data[offset] - b.data[offset]) +
        Math.abs(a.data[offset + 1] - b.data[offset + 1]) +
        Math.abs(a.data[offset + 2] - b.data[offset + 2]);
      count += 3;
    }
  }
  return total / count;
}

test('distant bank ground varies without adding draw calls', async ({ page }) => {
  const errors = await openGame(page, 'vp-03-variety');
  const west = await groundScreenshot(page, -20, 18);
  const westAgain = await groundScreenshot(page, -20, 18);
  const east = await groundScreenshot(page, 20, 18);

  expect(meanPixelDelta(west.png, east.png)).toBeGreaterThan(1.25);
  expect(westAgain.calls).toBe(west.calls);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('same seed renders deterministic bank ground', async ({ browser }) => {
  const pageA = await browser.newPage();
  const pageB = await browser.newPage();
  const errorsA = await openGame(pageA, 'vp-03-determinism');
  const errorsB = await openGame(pageB, 'vp-03-determinism');
  const shotA = await groundScreenshot(pageA, 20, 18);
  const shotB = await groundScreenshot(pageB, 20, 18);

  expect(meanPixelDelta(shotA.png, shotB.png)).toBeLessThan(0.01);
  expect(shotB.calls).toBe(shotA.calls);
  expect(errorsA.consoleErrors).toEqual([]);
  expect(errorsA.pageErrors).toEqual([]);
  expect(errorsB.consoleErrors).toEqual([]);
  expect(errorsB.pageErrors).toEqual([]);
  await pageA.close();
  await pageB.close();
});
