import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';

const SHOT_DIR = path.resolve('reviews/shots-wreck-visibility');
const BARON_SLOPE = { x: -12, z: -16 };

type Errors = { console: string[]; page: string[] };
type RuinDetail = {
  id: string;
  index: number;
  terrainMaxY: number;
  baseY: number;
  topY: number;
  markerVisible: boolean;
  markerY: number;
};

test('Baron slope wreck clears the footprint and keeps its repair marker above the mound', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await boot(page, 'e1-baron');
  await expect(page.evaluate(() => window.__GR_TEST__!.setBalance('wreck.repairSeconds', 99))).resolves.toBe(true);
  await expect(page.evaluate(({ x, z }) => window.__GR_TEST__!.placeFree('palisade', x, z), BARON_SLOPE)).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__!.wreck('palisade', 0))).resolves.toBe(true);
  await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x + 1.2, z), BARON_SLOPE);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.active)).toBe(true);

  const result = await page.evaluate(({ x, z }) => {
    const terrain = window.__GR_TEST__!.terrainVisualY;
    const oldRadius = 1.5 * 0.65;
    const oldPaddedY = (
      terrain(x, z) * 2 +
      terrain(x - oldRadius, z) +
      terrain(x + oldRadius, z) +
      terrain(x, z - oldRadius) +
      terrain(x, z + oldRadius)
    ) / 6;
    const ruins = (window.__THREE_GAME_DIAGNOSTICS__?.build as unknown as { ruinDetails: RuinDetail[] }).ruinDetails;
    return { oldTopY: oldPaddedY + 0.08 + 0.14 * 0.5, ruin: ruins[0] };
  }, BARON_SLOPE);

  expect(result.ruin).toMatchObject({ id: 'palisade', index: 0, markerVisible: true });
  expect(result.oldTopY).toBeLessThan(result.ruin.terrainMaxY);
  expect(result.ruin.baseY).toBeGreaterThan(result.ruin.terrainMaxY);
  expect(result.ruin.topY).toBeGreaterThan(result.ruin.terrainMaxY);
  expect(result.ruin.markerY).toBeGreaterThan(result.ruin.topY);

  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-after.png`) });

  await page.evaluate(() => window.__GR_TEST__!.grantGold(100));
  await expect(page.evaluate(() => window.__GR_TEST__!.repair('palisade', 0))).resolves.toBeTruthy();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ruins)).toBe(0);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp[0])).toMatchObject({ wrecked: false, hp: Balance.wreck.hp.palisade });
  expect(errors).toEqual({ console: [], page: [] });
});

test('terrain2d fallback keeps wreck and repair behavior', async ({ page }) => {
  const errors = collectErrors(page);
  await boot(page, 'e1-baron', '&terrain2d');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'off');
  await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('palisade', 0, 12))).resolves.toBe(true);
  await expect(page.evaluate(() => window.__GR_TEST__!.wreck('palisade', 0))).resolves.toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.teleport(0, 13));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.repair.active)).toBe(true);
  await page.evaluate(() => window.__GR_TEST__!.grantGold(100));
  await expect(page.evaluate(() => window.__GR_TEST__!.repair('palisade', 0))).resolves.toBeTruthy();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ruins)).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function boot(page: Page, contract: string, extra = ''): Promise<void> {
  await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nokill&nopause&seed=wreck-visibility${extra}`);
  const begin = page.getByRole('button', { name: 'Begin' });
  if (await begin.isVisible()) await begin.click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  if (!extra.includes('terrain2d')) await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready');
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
}
