import { mkdir } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test('town grows, both scenes zoom without moving HUD or planar door picking, and zoom persists', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  if (testInfo.project.name === 'desktop-chrome') await page.setViewportSize({ width: 1440, height: 900 });
  await seedProfile(page);
  const errors = collectErrors(page);

  await page.goto('/?tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  await waitForTown(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.camera.heroRenderedHeight ?? 0)).toBeGreaterThanOrEqual(90);
  await expectCameraTruth(page);

  if (testInfo.project.name === 'desktop-chrome') {
    await dismissStoryCard(page);
    await mkdir('artifacts/town-scale-zoom', { recursive: true });
    await page.screenshot({ path: 'artifacts/town-scale-zoom/town-after-1440x900.png', fullPage: true });
  }

  const canvas = page.locator('#game-canvas');
  const townBaseDistance = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.baseDistance);
  await canvas.dispatchEvent('wheel', { deltaY: -800, deltaMode: 0 });
  await expectZoom(page, 'town', 0.7);
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.targetDistance)).toBeCloseTo(townBaseDistance * 0.7, 5);

  await openTavernBoard(page);
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await canvas.dispatchEvent('wheel', { deltaY: 2_000, deltaMode: 0 });
  await expectZoom(page, 'town', 1.6);
  await expectCameraAtTarget(page, 'town');
  await canvas.dispatchEvent('wheel', { deltaY: -2_000, deltaMode: 0 });
  await expectZoom(page, 'town', 0.7);
  await expectCameraAtTarget(page, 'town');
  await page.getByTestId('contract-board-close').click();

  await page.evaluate(() => history.replaceState({ goldRushScene: 'town' }, '', location.href));
  await page.reload();
  await waitForTown(page);
  await expectZoom(page, 'town', 0.7);

  await page.keyboard.press('KeyZ');
  await expectZoom(page, 'town', 1);
  await pinchIn(page.locator('#game-canvas'));
  await expectZoom(page, 'town', 0.7);
  await doubleTap(page.locator('#game-canvas'));
  await expectZoom(page, 'town', 1);

  await openTavernBoard(page);
  await page.getByTestId('contract-launch-the-claim').click();
  await waitForRun(page);
  await expectCameraTruth(page);
  const hudBefore = await hudRect(page);
  const runBaseDistance = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.camera.baseDistance);

  await page.locator('#game-canvas').dispatchEvent('wheel', { deltaY: 800, deltaMode: 0 });
  await expectZoom(page, 'run', 1.6);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.camera.targetDistance)).toBeCloseTo(runBaseDistance * 1.6, 5);
  expect(await hudRect(page)).toEqual(hudBefore);

  await page.reload();
  await waitForRun(page);
  await expectZoom(page, 'run', 1.6);
  await page.keyboard.press('KeyZ');
  await expectZoom(page, 'run', 1);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, guideKey }) => {
      if (localStorage.getItem(profileKey)) return;
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(guideKey, '1');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
    },
  );
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function waitForTown(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function waitForRun(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
}

async function expectZoom(page: Page, scene: 'town' | 'run', expected: number): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate((activeScene) => {
        const camera = activeScene === 'town'
          ? window.__GR_TOWN_DIAGNOSTICS__?.camera
          : window.__THREE_GAME_DIAGNOSTICS__?.camera;
        return camera && Math.abs(camera.distanceScale - camera.targetDistanceScale) < 0.01
          ? camera.targetDistanceScale
          : -1;
      }, scene),
    )
    .toBeCloseTo(expected, 2);
}

async function expectCameraTruth(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.locator('#game-canvas').evaluate((canvas) =>
        Math.abs(Number(canvas.dataset.cameraAspect) - Number(canvas.dataset.cssAspect)),
      ),
    )
    .toBeLessThanOrEqual(0.01);
}

async function expectCameraAtTarget(page: Page, scene: 'town' | 'run'): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate((activeScene) => {
        const camera = activeScene === 'town'
          ? window.__GR_TOWN_DIAGNOSTICS__?.camera
          : window.__THREE_GAME_DIAGNOSTICS__?.camera;
        return camera ? Math.abs(camera.actualDistance - camera.targetDistance) : Number.POSITIVE_INFINITY;
      }, scene),
    )
    .toBeLessThan(0.05);
}

async function openTavernBoard(page: Page): Promise<void> {
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const door = town.buildings.find((building) => building.id === 'tavern')!.approach;
    town.teleport(door.x, door.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
}

async function pinchIn(canvas: Locator): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas bounds.');
  const y = box.y + box.height * 0.55;
  const left = box.x + box.width * 0.35;
  const right = box.x + box.width * 0.65;
  await canvas.dispatchEvent('pointerdown', touch(11, left, y, true));
  await canvas.dispatchEvent('pointerdown', touch(12, right, y));
  await canvas.dispatchEvent('pointermove', touch(12, box.x + box.width * 0.85, y));
  await canvas.dispatchEvent('pointerup', touch(12, box.x + box.width * 0.85, y));
  await canvas.dispatchEvent('pointerup', touch(11, left, y, true));
}

async function doubleTap(canvas: Locator): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas bounds.');
  await new Promise((resolve) => setTimeout(resolve, 350));
  const x = box.x + box.width * 0.5;
  const y = box.y + box.height * 0.55;
  for (let tap = 0; tap < 2; tap += 1) {
    await canvas.dispatchEvent('pointerdown', touch(20 + tap, x, y, true));
    await canvas.dispatchEvent('pointerup', touch(20 + tap, x, y, true));
    if (tap === 0) await new Promise((resolve) => setTimeout(resolve, 80));
  }
}

function touch(pointerId: number, clientX: number, clientY: number, isPrimary = false): Record<string, unknown> {
  return { pointerId, pointerType: 'touch', clientX, clientY, isPrimary, button: 0, buttons: 1 };
}

async function hudRect(page: Page): Promise<Record<string, number | string>> {
  return page.getByTestId('hud-vitals').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      x: Math.round(rect.x * 100) / 100,
      y: Math.round(rect.y * 100) / 100,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
      fontSize: style.fontSize,
      transform: style.transform,
    };
  });
}

async function dismissStoryCard(page: Page): Promise<void> {
  const box = await page.locator('#game-canvas').boundingBox();
  if (box) await page.locator('#game-canvas').click({ position: { x: box.width - 40, y: box.height - 40 } });
  await page.waitForTimeout(100);
}
