import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/town-zoom');
const PROFILE_ID = 'robin';

test('town wheel and mobile pinch show inhabitants close up without scaling prompts', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await page.goto('/?tier=lite');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await dismissStoryCard(page);
  await mkdir(ARTIFACT_DIR, { recursive: true });

  const canvas = page.locator('#game-canvas');
  const defaultZoom = await zoom(page);
  expect(defaultZoom.framingDistanceScale).toBeCloseTo(0.85, 2);
  await shot(page, testInfo, 'default');

  await canvas.dispatchEvent('wheel', { deltaY: -800, deltaMode: 0 });
  await expectZoom(page, 0.36);
  const closeHeight = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.heroRenderedHeight);
  expect(closeHeight / (defaultZoom.heroRenderedHeight * 0.85)).toBeGreaterThanOrEqual(2.5);
  expect(closeHeight / (defaultZoom.heroRenderedHeight * 0.85)).toBeLessThanOrEqual(3);

  await showTavernPrompt(page);
  const closePrompt = await promptMetrics(page);
  expect(closePrompt.fontSize).toBeGreaterThanOrEqual(14);
  expect(closePrompt.bottom).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  await shot(page, testInfo, 'close-prompt');

  await canvas.dispatchEvent('wheel', { deltaY: 3_000, deltaMode: 0 });
  await expectZoom(page, 1.1);
  const widePrompt = await promptMetrics(page);
  expect(widePrompt).toEqual(closePrompt);
  await shot(page, testInfo, 'wide');

  if (testInfo.project.name === 'mobile-chrome') {
    await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(0.85));
    await expectZoom(page, 0.85);
    await pinchIn(canvas);
    await expectZoom(page, 0.36);
  }

  await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(-10));
  await expectZoom(page, 0.36);
  await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.camera.setZoom(10));
  await expectZoom(page, 1.1);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, guideKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{
          id: 'robin',
          name: 'Robin',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: ['story:first-contract'],
        }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(guideKey, '1');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      guideKey: profileDataKey(PROFILE_ID, FIRST_CLAIM_DONE_KEY),
    },
  );
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function zoom(page: Page) {
  return page.evaluate(() => {
    const camera = window.__GR_TOWN_DIAGNOSTICS__!.camera;
    return {
      framingDistanceScale: camera.framingDistanceScale,
      heroRenderedHeight: camera.heroRenderedHeight,
    };
  });
}

async function expectZoom(page: Page, expected: number): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const camera = window.__GR_TOWN_DIAGNOSTICS__?.camera;
        return camera && Math.abs(camera.framingDistanceScale - camera.targetFramingDistanceScale) < 0.01
          ? camera.targetFramingDistanceScale
          : -1;
      }),
    )
    .toBeCloseTo(expected, 2);
}

async function showTavernPrompt(page: Page): Promise<void> {
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const door = town.buildings.find((building) => building.id === 'tavern')!.approach;
    town.teleport(door.x, door.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await expect(page.getByTestId('town-approach-prompt')).toBeVisible();
}

async function promptMetrics(page: Page): Promise<{ x: number; y: number; width: number; height: number; bottom: number; fontSize: number }> {
  return page.getByTestId('town-approach-prompt').evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      bottom: Math.round(rect.bottom),
      fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
    };
  });
}

async function pinchIn(canvas: Locator): Promise<void> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Missing canvas bounds.');
  const y = box.y + box.height * 0.55;
  const left = box.x + box.width * 0.35;
  const right = box.x + box.width * 0.65;
  await canvas.dispatchEvent('pointerdown', touch(11, left, y, true));
  await canvas.dispatchEvent('pointerdown', touch(12, right, y));
  await canvas.dispatchEvent('pointermove', touch(12, box.x + box.width * 0.95, y));
  await canvas.dispatchEvent('pointerup', touch(12, box.x + box.width * 0.95, y));
  await canvas.dispatchEvent('pointerup', touch(11, left, y, true));
}

function touch(pointerId: number, clientX: number, clientY: number, isPrimary = false): Record<string, unknown> {
  return { pointerId, pointerType: 'touch', clientX, clientY, isPrimary, button: 0, buttons: 1 };
}

async function shot(page: Page, testInfo: { project: { name: string } }, name: string): Promise<void> {
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`) });
}

async function dismissStoryCard(page: Page): Promise<void> {
  const box = await page.locator('#game-canvas').boundingBox();
  if (box) await page.locator('#game-canvas').click({ position: { x: box.width - 40, y: box.height - 40 } });
}
