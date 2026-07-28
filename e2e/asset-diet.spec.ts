// Measures the built, dieted production bundle; Vite's dev server serves undieted originals.
// Run with GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/asset-diet');
const MAPS = [{ id: 'the-claim', era: 1 }, { id: 'e1-dry-gulch', era: 1 }] as const;
const BUILT_BUNDLE_ONLY = 'asset diet measures the BUILT production bundle; set GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet';

if (process.env.GR_ASSET_DIET_BUNDLE !== '1') console.warn(`[asset-diet] SKIPPED: ${BUILT_BUNDLE_ONLY}`);
test.skip(process.env.GR_ASSET_DIET_BUNDLE !== '1', BUILT_BUNDLE_ONLY);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
});

test('dieted output keeps two terrain census views and town within screenshot tolerance', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  for (const { id, era } of MAPS) {
    await page.goto(`/?debug&era=${era}&contract=${id}&nowaves&nolevel&nokill&nopause&tier=full&seed=asset-diet-${id}`);
    await page.waitForFunction(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
      return (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20
        && canvas?.dataset.terrain3dPilotState === 'ready'
        && canvas.dataset.assetLoadingState === 'ready';
    });
    const briefing = page.getByTestId('contract-briefing-dismiss');
    if (await briefing.isVisible().catch(() => false)) await briefing.click();
    await expect(page.locator('#game-canvas')).toHaveScreenshot(`${id}.png`, {
      animations: 'disabled',
      threshold: 0.3,
      maxDiffPixelRatio: 0.15,
    });
  }

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
    return (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20 && canvas?.dataset.assetLoadingState === 'ready';
  });
  await expect(page.locator('#game-canvas')).toHaveScreenshot('town.png', {
    animations: 'disabled',
    threshold: 0.3,
    maxDiffPixelRatio: 0.15,
  });
  expect(errors).toEqual([]);
});

test('honest town and claim cues appear while GLBs are throttled and leave at ready', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = watchErrors(page);
  const townResponses: number[] = [];
  let countTownTransfer = true;
  let townOrigin = '';
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (!townOrigin && response.request().isNavigationRequest()) townOrigin = url.origin;
    if (!countTownTransfer || url.protocol === 'blob:' || url.origin !== townOrigin) return;
    townResponses.push(Number(response.headers()['content-length'] ?? 0));
  });
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.route('**/*.glb', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    await route.continue();
  });

  await page.goto('/?town3dPilot=all&tier=full');
  await page.getByTestId('start-menu-enter-town').click();
  const cue = page.getByTestId('asset-loading-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toHaveText(/^the town is raising… \d+\/\d+$/);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-town-throttled.png`) });
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();
  countTownTransfer = false;
  const townResponseBytes = townResponses.reduce((sum, bytes) => sum + bytes, 0);
  console.info(`[asset-diet] ${testInfo.project.name} townResponses: ${townResponseBytes} bytes`);
  expect(townResponseBytes).toBeLessThan(25_000_000);

  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await expect(cue).toBeVisible();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-loading-ready', '0');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();

  await page.goto('/?debug&era=1&contract=the-claim&nowaves&nolevel&nokill&nopause&tier=full&seed=asset-diet-cue');
  await expect(cue).toBeVisible();
  await expect(cue).toHaveText(/^the claim is raising… \d+\/\d+$/);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-claim-throttled.png`) });
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
  await expect(cue).toBeHidden();
  expect(errors).toEqual([]);
});

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
