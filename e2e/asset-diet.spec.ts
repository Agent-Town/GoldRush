// Measures the built, dieted production bundle; Vite's dev server serves undieted originals.
// Run with GR_ASSET_DIET_BUNDLE=1 via: npm run test:asset-diet

import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

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
  const watch = watchErrors(page);
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
  expectNoConsoleErrors(watch);
});

test('honest town and claim cues appear while GLBs are throttled and leave at ready', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);
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
  expectNoConsoleErrors(watch);
});

// A number worth measuring is not yet a number worth asserting: asset changes may move the totals and delta.
test('town byte budget reports normal and saveData arms by URL', async ({ browser, page }, testInfo) => {
  test.setTimeout(90_000);
  const measureTown = async (armPage: typeof page) => {
    let townOrigin = '';
    const responses: Array<{ url: string; bytes: number }> = [];
    let countTownTransfer = true;
    const cdp = await armPage.context().newCDPSession(armPage);
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    armPage.on('response', (response) => {
      const url = new URL(response.url());
      if (!townOrigin && response.request().isNavigationRequest()) townOrigin = url.origin;
      if (!countTownTransfer || url.protocol === 'blob:' || url.origin !== townOrigin) return;
      responses.push({ url: `${url.pathname}${url.search}`, bytes: Number(response.headers()['content-length'] ?? 0) });
    });
    await armPage.route('**/*.glb', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    await armPage.goto('/?town3dPilot=all&tier=full');
    await expect(armPage.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-town-state', 'ready', { timeout: 45_000 });
    await armPage.getByTestId('start-menu-enter-town').click();
    await expect.poll(() => armPage.locator('#game-canvas').getAttribute('data-asset-loading-state'), { timeout: 45_000 }).toBe('ready');
    countTownTransfer = false;
    await cdp.detach();
    return responses;
  };

  const use = testInfo.project.use;
  const createArm = async (metered: boolean) => {
    const context = await browser.newContext({
      baseURL: use.baseURL,
      deviceScaleFactor: use.deviceScaleFactor,
      hasTouch: use.hasTouch,
      isMobile: use.isMobile,
      userAgent: use.userAgent,
      viewport: use.viewport,
    });
    const armPage = await context.newPage();
    await armPage.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
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
    if (metered) {
      await armPage.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
      });
    }
    return { context, page: armPage, watch: watchErrors(armPage) };
  };

  const normalArm = await createArm(false);
  const normal = await measureTown(normalArm.page);
  const saveDataArm = await createArm(true);
  const saveData = await measureTown(saveDataArm.page);
  const total = (responses: Array<{ bytes: number }>) => responses.reduce((sum, response) => sum + response.bytes, 0);
  const byUrl = (responses: Array<{ url: string; bytes: number }>) => responses.reduce((urls, response) => {
    urls.set(response.url, (urls.get(response.url) ?? 0) + response.bytes);
    return urls;
  }, new Map<string, number>());
  const normalBytes = total(normal);
  const saveDataBytes = total(saveData);
  const normalByUrl = byUrl(normal);
  const saveDataByUrl = byUrl(saveData);
  const changedUrls = [...new Set([...normalByUrl.keys(), ...saveDataByUrl.keys()])]
    .map((url) => [url, normalByUrl.get(url) ?? 0, saveDataByUrl.get(url) ?? 0] as const)
    .filter(([, normalUrlBytes, saveDataUrlBytes]) => normalUrlBytes !== saveDataUrlBytes)
    .sort((left, right) => Math.max(right[1], right[2]) - Math.max(left[1], left[2]));
  const rows = changedUrls.map(([url, normalUrlBytes, saveDataUrlBytes]) =>
    `| ${url.replaceAll('|', '\\|')} | ${normalUrlBytes} | ${saveDataUrlBytes} | ${normalUrlBytes - saveDataUrlBytes} |`);
  const report = [
    `# Town byte budget — ${testInfo.project.name}`,
    '',
    '| Arm | townResponseBytes | Headroom against 25,000,000 |',
    '| --- | ---: | ---: |',
    `| normal | ${normalBytes} | ${25_000_000 - normalBytes} |`,
    `| saveData | ${saveDataBytes} | ${25_000_000 - saveDataBytes} |`,
    '',
    `Delta (normal - saveData): **${normalBytes - saveDataBytes} bytes**.`,
    '',
    'The saveData arm is a lower bound, not a clean isolation of the two bulk halls: it also narrows advance-stream prefetch to priority one.',
    '',
    '| URL | normal bytes | saveData bytes | delta |',
    '| --- | ---: | ---: | ---: |',
    ...rows,
    '',
  ].join('\n');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, `town-budget-${testInfo.project.name}.md`), report);

  expect(normalBytes).toBeLessThan(25_000_000);
  expect(saveDataBytes).toBeLessThan(25_000_000);
  expect(saveDataBytes).toBeLessThanOrEqual(normalBytes);
  expectNoConsoleErrors(normalArm.watch, 'normal');
  expectNoConsoleErrors(saveDataArm.watch, 'saveData');
  await normalArm.context.close();
  await saveDataArm.context.close();
});
