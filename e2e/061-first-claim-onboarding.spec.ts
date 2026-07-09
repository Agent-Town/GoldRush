import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/061');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, options: { townName?: string; scores?: unknown[] } = {}): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, townKey, metaKey, scoreKey, options }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
      if (options.townName) localStorage.setItem(townKey, options.townName);
      if (options.scores) localStorage.setItem(scoreKey, JSON.stringify(options.scores));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      options,
    },
  );
  await page.reload();
}

async function openTown(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function nameTown(page: Page): Promise<void> {
  await expect(page.getByTestId('town-name-card')).toBeVisible();
  await page.getByTestId('town-name-input').fill('Copper Hill');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-card')).toBeHidden({ timeout: 3_000 });
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

async function waitForFirstClaimGuide(page: Page): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.active ?? false), { timeout: 5_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.trailVisible ?? false), { timeout: 5_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.greetingVisible ?? false), { timeout: 5_000 }).toBe(true);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await expect(page.getByTestId('town-bark-speaker')).toHaveText('Marta Vale');
  await expect(page.getByTestId('town-bark-text')).toContainText('stake your first claim');
}

async function dismissGreeting(page: Page): Promise<void> {
  await page.keyboard.press('ShiftLeft');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.greetingVisible ?? true), { timeout: 3_000 }).toBe(false);
}

async function walkToTavern(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('fresh profile gets first-claim guidance, launch sets the per-profile done flag, and second town entry is quiet', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await seedProfile(page);
  await openTown(page);
  await nameTown(page);

  await waitForFirstClaimGuide(page);
  await shot(page, testInfo, 'desktop-trail-tavern-pulse');
  await dismissGreeting(page);

  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await expect(page.getByTestId('first-claim-launch-tooltip')).toHaveText('Stake your first claim');
  await expect(page.getByTestId('contract-launch-the-claim')).toHaveAttribute('data-first-claim-launch', 'true');
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', FIRST_CLAIM_DONE_KEY))).resolves.toBe('1');

  await page.goto('/');
  await openTown(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.active ?? true), { timeout: 5_000 }).toBe(false);
  await expect(page.getByTestId('town-bark-card')).not.toHaveAttribute('data-first-claim', 'true');
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('first-claim-launch-tooltip')).toHaveCount(0);
  await expect(page.getByTestId('contract-launch-the-claim')).not.toHaveAttribute('data-first-claim-launch', 'true');
  assertNoErrors(errors);
});

test('mobile first-entry trail and tavern pulse fit at 390px', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seedProfile(page);
  await openTown(page);
  await nameTown(page);
  await waitForFirstClaimGuide(page);
  await shot(page, testInfo, 'mobile-390-trail-tavern-pulse');
  await dismissGreeting(page);
  assertNoErrors(errors);
});

test('name-only exit keeps the first-claim guide pending until launch', async ({ page }) => {
  const errors = collectErrors(page);
  await seedProfile(page);
  await openTown(page);
  await nameTown(page);
  await waitForFirstClaimGuide(page);
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey('robin', FIRST_CLAIM_DONE_KEY))).resolves.toBe('pending');

  await page.goto('/');
  await openTown(page);
  await waitForFirstClaimGuide(page);
  await dismissGreeting(page);
  await walkToTavern(page);
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('first-claim-launch-tooltip')).toHaveText('Stake your first claim');
  await expect(page.getByTestId('contract-launch-the-claim')).toHaveAttribute('data-first-claim-launch', 'true');
  assertNoErrors(errors);
});

test('existing profile without the new flag gets no first-run visual delta', async ({ page }) => {
  const errors = collectErrors(page);
  await seedProfile(page, { townName: 'Quartz Hill' });
  await openTown(page);

  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.active ?? true), { timeout: 5_000 }).toBe(false);
  await expect(page.getByTestId('town-bark-card')).not.toHaveAttribute('data-first-claim', 'true');
  await walkToTavern(page);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.trailVisible ?? true)).toBe(false);
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await expect(page.getByTestId('first-claim-launch-tooltip')).toHaveCount(0);
  await expect(page.getByTestId('contract-launch-the-claim')).not.toHaveAttribute('data-first-claim-launch', 'true');
  assertNoErrors(errors);
});
