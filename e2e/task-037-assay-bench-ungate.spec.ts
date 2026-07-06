import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Point = { x: number; z: number };
type Rect = { x: number; y: number; width: number; height: number };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function releaseMoveKeys(page: Page): Promise<void> {
  for (const key of ['KeyW', 'KeyA', 'KeyS', 'KeyD']) await page.keyboard.up(key);
}

async function walkTo(page: Page, target: Point, tolerance = 0.75): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 });
    const dx = target.x - hero.x;
    const dz = target.z - hero.z;
    if (dx * dx + dz * dz <= tolerance * tolerance) break;
    await releaseMoveKeys(page);
    if (dx > tolerance * 0.4) await page.keyboard.down('KeyD');
    if (dx < -tolerance * 0.4) await page.keyboard.down('KeyA');
    if (dz > tolerance * 0.4) await page.keyboard.down('KeyS');
    if (dz < -tolerance * 0.4) await page.keyboard.down('KeyW');
    await page.waitForTimeout(80);
  }
  await releaseMoveKeys(page);
}

async function panGold(page: Page, goal: number): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline && (await gold(page)) < goal) {
    const target = await page.evaluate(() => {
      const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? { x: 0, z: 0 };
      const nodes = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.filter((node) => node.active) ?? [];
      nodes.sort((a, b) => {
        const adx = a.position.x - hero.x;
        const adz = a.position.z - hero.z;
        const bdx = b.position.x - hero.x;
        const bdz = b.position.z - hero.z;
        return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
      });
      return nodes[0]?.position ?? null;
    });
    if (!target) {
      await page.waitForTimeout(250);
      continue;
    }
    await walkTo(page, target, 0.7);
    await expect
      .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling ?? false), { timeout: 5_000 })
      .toBe(true);
    await page.waitForFunction((wanted) => (window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0) >= wanted, goal, {
      timeout: 5_000,
    }).catch(() => undefined);
  }
  await expect.poll(() => gold(page), { timeout: 1_000 }).toBeGreaterThanOrEqual(goal);
}

async function gold(page: Page): Promise<number> {
  return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
}

async function buildAssayOfficeWithUi(page: Page): Promise<void> {
  await walkTo(page, { x: 0, z: 9 }, 0.65);
  await page.getByTestId('hud-build').click();
  await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  await page.getByTestId('hud-build-tile-assay_office').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe('assay_office');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.assayOffices ?? 0)).toBe(1);
  await page.keyboard.press('Escape');
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? true)).toBe(false);
}

async function debugPlaceAssayOffice(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.grantGold(120);
    window.__GR_TEST__?.teleport(0, 9);
    window.__GR_TEST__?.selectBuildable('assay_office');
    window.__GR_TEST__?.confirmBuild();
    window.__GR_TEST__?.setBuildMode(false);
    window.__GR_TEST__?.teleport(0, 7);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.assayOffices ?? 0)).toBe(1);
}

function intersects(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return false;
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function cleanupPostedPath(page: Page): Promise<void> {
  const path = await page.getByTestId('assay-pending-path').textContent();
  if (path) await rm(resolve(process.cwd(), path), { force: true });
}

test('normal play shows the Assay Office prompt and opens the bench without debug', async ({ page }, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'normal play keyboard path is covered on desktop; mobile touch has its own test');
  const errors = await openGame(page, '?timescale=8&nowaves&nolevel&nokill&seed=task037-normal');
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  await expect(page.getByTestId('assay-office-prompt')).toBeHidden();

  await panGold(page, 80);
  await buildAssayOfficeWithUi(page);
  await walkTo(page, { x: 0, z: 12 }, 0.75);
  await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  await walkTo(page, { x: 0, z: 7 }, 0.65);
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  await expect(page.getByTestId('assay-office-prompt')).toContainText('Enter - Assay Office');

  await page.keyboard.press('Enter');
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  await page.getByTestId('assay-profile').fill(`task037_${testInfo.project.name}`);
  await page.getByTestId('assay-post').click();
  await expect(page.getByTestId('assay-pending-status')).toHaveText(/Posted|JSON ready/);
  await expect(page.getByTestId('assay-log').locator('li').first()).toContainText(/arrived/);
  await cleanupPostedPath(page);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('prompt hides in build mode and returns after closing the bench', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-hidden');
  await debugPlaceAssayOffice(page);
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();

  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();

  await page.keyboard.press('Enter');
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await expect(page.getByTestId('assay-office-prompt')).toBeHidden();
  await page.getByTestId('assay-close').click();
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  await expect(page.getByTestId('assay-office-prompt')).toBeVisible();

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('mobile touch confirm opens and closes the bench without HUD overlap', async ({ page }, testInfo: TestInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chrome', 'mobile prompt layout is only meaningful on the mobile project');
  const errors = await openGame(page, '?debug&timescale=6&nowaves&nolevel&nokill&seed=task037-mobile');
  await debugPlaceAssayOffice(page);

  const prompt = page.getByTestId('assay-office-prompt');
  await expect(prompt).toBeVisible();
  await expect(prompt.locator('.assay-office-prompt__key')).toBeHidden();
  const promptBox = await prompt.boundingBox();
  expect(intersects(promptBox, await page.locator('#touch-controls').boundingBox())).toBe(false);
  expect(intersects(promptBox, await page.getByTestId('hud-build-panel').boundingBox())).toBe(false);
  expect(intersects(promptBox, await page.getByTestId('hud-xp').boundingBox())).toBe(false);

  await page.locator('#confirm-button').tap();
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  await page.getByTestId('assay-close').tap();
  await expect(page.getByTestId('assay-bench')).toBeHidden();

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
