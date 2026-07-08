import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const SHOT_DIR = 'artifacts/town-t1';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TownPrompt = 'tavern' | 'claim_office' | 'schoolhouse' | 'assay_office';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, townKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [
        {
          id: 'robin',
          name: 'Robin',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: [],
        },
      ],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(townKey, 'Quartz Hill');
  }, { profileKey: PROFILE_KEY, townKey: profileDataKey('robin', TOWN_NAME_KEY) });
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function approach(page: Page, keys: [string, number][], prompt: TownPrompt, name: string): Promise<void> {
  for (const [key, ms] of keys) await hold(page, key, ms);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe(prompt);
  await expect(page.getByTestId('town-approach-prompt')).toContainText(name);
  await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon');
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('menu enters town square, prompts at four shells, exits, then starts normal run', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.getByTestId('town-ui')).toBeVisible();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt ?? null)).toBeNull();
  await shot(page, testInfo, 'square-overview');

  await approach(page, [['KeyA', 850], ['KeyW', 850]], 'tavern', 'Tavern');
  await shot(page, testInfo, 'shell-prompt');
  await approach(page, [['KeyD', 2_000], ['KeyS', 350]], 'claim_office', 'Claim Office');
  await approach(page, [['KeyA', 2_300], ['KeyS', 1_200]], 'schoolhouse', 'Schoolhouse');
  await approach(page, [['KeyD', 2_250], ['KeyS', 350]], 'assay_office', 'Assay Office');

  await page.getByTestId('town-exit').click();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-new-claim').click();
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  assertNoErrors(errors);
});

test('town exit is reachable and square renders at 390px', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('town-exit')).toBeVisible();
  await expect(page.locator('#touch-stick')).toBeVisible();
  await shot(page, testInfo, 'mobile-390');

  await page.getByTestId('town-exit').click();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  assertNoErrors(errors);
});
