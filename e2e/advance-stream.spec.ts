import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey, metaKey, guideKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(guideKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    guideKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  });
});

test('menu idle warms town first and publishes progress', async ({ page }) => {
  const errors = collectErrors(page);
  const prefetched: string[] = [];
  page.on('request', (request) => {
    if (request.headers()['x-gold-rush-prefetch'] === '1') prefetched.push(request.url());
  });

  await page.goto('/');
  await expect.poll(() => prefetched.filter((url) => url.includes('.glb')).length, { timeout: 15_000 }).toBeGreaterThan(0);

  const firstGlbs = prefetched.filter((url) => url.includes('.glb')).slice(0, 2).join('\n');
  expect(firstGlbs).toMatch(/town-plate|town-v3-tavern/);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-scene', 'menu');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-prefetch-total')).not.toBe('0');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-progress', /\d+\/\d+/);
  expect(errors).toEqual([]);
});

test('saveData keeps tier one and skips bulk contract maps', async ({ page }) => {
  await page.addInitScript((activeEpochKey) => {
    localStorage.setItem(activeEpochKey, 'epoch-10-deepsky');
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true } });
  }, profileDataKey('robin', ACTIVE_EPOCH_KEY));
  const errors = collectErrors(page);
  const prefetched: string[] = [];
  page.on('request', (request) => {
    if (request.headers()['x-gold-rush-prefetch'] === '1') prefetched.push(request.url());
  });

  await page.goto('/');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-asset-prefetch-state'), { timeout: 20_000 }).toBe('ready');

  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-save-data', 'true');
  expect(prefetched.some((url) => /(?:the-claim|dry-gulch|night-shift|twin-banks|baron)-(?:terrain|panorama)/.test(url))).toBe(false);
  expect(prefetched.some((url) => /town-plate|tavern\.e8/.test(url))).toBe(true);
  expect(prefetched.filter((url) => url.includes('.glb')).length).toBeLessThan(20);
  expect(prefetched.some((url) => /stamp-mill|dynamo-hall/.test(url))).toBe(false);
  expect(errors).toEqual([]);
});

test('lite rendering skips unused 3D prefetch', async ({ page }) => {
  const prefetched: string[] = [];
  page.on('request', (request) => {
    if (request.headers()['x-gold-rush-prefetch'] === '1') prefetched.push(request.url());
  });

  await page.goto('/?tier=lite');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-state', 'ready');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-enabled', 'false');
  expect(prefetched).toEqual([]);
});

test('closing profiles resumes the menu stream', async ({ page }) => {
  await page.route('**/*.glb', async (route) => {
    if (route.request().headers()['x-gold-rush-prefetch'] === '1') await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue().catch(() => undefined);
  });

  await page.goto('/');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-state', 'fetching', { timeout: 15_000 });
  await page.getByTestId('start-menu-profile').click();
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-state', 'paused');
  await page.getByTestId('profile-back').click();
  await expect(page.locator('#game-canvas')).not.toHaveAttribute('data-asset-prefetch-state', 'paused');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-scene', 'menu');
});

test('launch aborts pending prefetch before the run requests its own map', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  let releasePrefetch: () => void = () => {};
  const barrier = new Promise<void>((resolve) => { releasePrefetch = resolve; });
  let blockedPrefetches = 0;
  let actualRunRequest = false;

  page.on('request', (request) => {
    if (request.headers()['x-gold-rush-prefetch'] !== '1' && request.url().includes('the-claim-terrain')) {
      actualRunRequest = true;
    }
  });
  await page.route('**/*.glb', async (route) => {
    if (route.request().headers()['x-gold-rush-prefetch'] !== '1') {
      await route.continue();
      return;
    }
    blockedPrefetches += 1;
    await barrier;
    await route.continue().catch(() => undefined);
  });

  await page.goto('/');
  await expect.poll(() => blockedPrefetches, { timeout: 15_000 }).toBeGreaterThan(0);
  await page.evaluate(() => history.replaceState(null, '', '/?debug&nowaves&nolevel&seed=advance-stream'));
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await openBoard(page);
  await page.getByTestId('contract-launch-the-claim').click();

  const runStartedBeforeRelease = await Promise.race([
    expect.poll(() => actualRunRequest, { timeout: 4_000 }).toBe(true).then(() => true),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 4_500)),
  ]);
  releasePrefetch();
  expect(runStartedBeforeRelease).toBe(true);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(errors).toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function openBoard(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}
