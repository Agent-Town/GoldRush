import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

type Errors = { console: string[]; page: string[] };
type Point = { x: number; y: number };

const ARTIFACT_DIR = path.resolve('artifacts/run3d-interaction');

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, terrain2d = false): Promise<void> {
  await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&tier=full&seed=run3d-interaction${terrain2d ? '&terrain2d' : ''}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible()) await briefing.click();
  if (!terrain2d) await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
}

async function armSluice(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__!.grantGold(200);
    window.__GR_TEST__!.teleport(0, 9);
    window.__GR_TEST__!.selectBuildable('sluice');
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe('sluice');
}

async function planePoint(page: Page, x: number, z: number): Promise<Point> {
  const point = await page.evaluate(([worldX, worldZ]) => window.__GR_TEST__!.screenPoint(worldX!, worldZ!, 0), [x, z]);
  const box = await page.locator('#game-canvas').boundingBox();
  expect(box).not.toBeNull();
  return { x: box!.x + point.x, y: box!.y + point.y };
}

async function clickWithoutHover(page: Page, point: Point): Promise<{ x: number; z: number }> {
  await page.locator('#game-canvas').dispatchEvent('click', { clientX: point.x, clientY: point.y });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluices)).toBe(1);
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.sluicePositions[0]!);
}

test('the same canvas click resolves to the same planar bank point in 3D and terrain2d', async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page, true);
  await armSluice(page);
  const click = await planePoint(page, 0, 7);
  const flat = await clickWithoutHover(page, click);

  await boot(page);
  await armSluice(page);
  const sculpted = await clickWithoutHover(page, click);

  expect(flat).toEqual({ x: 0, z: 7 });
  expect(sculpted).toEqual(flat);
  expect(errors).toEqual({ console: [], page: [] });
});

test('default 3D shows valid and invalid terrain-riding previews, then places the sluice through the real click path', async ({ page }, testInfo: TestInfo) => {
  const errors = collectErrors(page);
  await boot(page);
  await armSluice(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const validPoint = await planePoint(page, 0, 7);
  await page.mouse.move(validPoint.x, validPoint.y);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos)).toEqual({ x: 0, z: 7 });
  const valid = await page.evaluate(() => ({
    build: window.__THREE_GAME_DIAGNOSTICS__!.build,
    visualY: window.__GR_TEST__!.terrainVisualY(0, 7, 0, 1),
  }));
  expect(valid.build.ghostVisible).toBe(true);
  expect(valid.build.ghostValid).toBe(true);
  expect(valid.build.ghostY).toBeCloseTo(valid.visualY, 4);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-valid-preview.png`) });

  const invalidPoint = await planePoint(page, 0, 14);
  await page.mouse.move(invalidPoint.x, invalidPoint.y);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos)).toEqual({ x: 0, z: 14 });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid)).toBe(false);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-invalid-preview.png`) });

  await page.mouse.click(validPoint.x, validPoint.y);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.sluices)).toBe(1);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.sluicePositions[0])).toEqual({ x: 0, z: 7 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-placed-sluice.png`) });
  expect(errors).toEqual({ console: [], page: [] });
});
