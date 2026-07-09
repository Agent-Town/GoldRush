import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';

const ARTIFACT_DIR = path.resolve('artifacts/en-01');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedFreshProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, ledgerKey }) => {
      if (sessionStorage.getItem('__en01_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__en01_seeded', '1');
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
      localStorage.removeItem(ledgerKey);
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      ledgerKey: profileDataKey('robin', LEDGER_DISCOVERED_STORAGE_KEY),
    },
  );
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function closeLedger(page: Page): Promise<void> {
  await page.getByTestId('claim-ledger-close').click();
  await expect(page.getByTestId('claim-ledger')).toHaveCount(0);
}

async function expectFactCap(page: Page): Promise<void> {
  const maxFacts = await page.locator('[data-testid^="claim-ledger-facts-"]').evaluateAll((lists) =>
    Math.max(0, ...lists.map((list) => list.querySelectorAll('[data-testid="claim-ledger-fact-line"]').length)),
  );
  expect(maxFacts).toBeLessThanOrEqual(4);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function approachSchoolhouse(page: Page): Promise<void> {
  await hold(page, 'KeyA', 1150);
  await hold(page, 'KeyS', 900);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('EN-01 claim ledger access, discovery beat, dupe guard, persistence, and fact cap', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedFreshProfile(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await expect(page.getByTestId('claim-ledger-card-hero')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-prospector')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-era_frontier')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.locator('[data-ledger-discovered="true"]')).toHaveCount(3);
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toHaveAttribute('data-ledger-discovered', 'false');
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toContainText('Not yet met');
  await expect(page.getByTestId('claim-ledger-card-the_claim').getByTestId('claim-ledger-fact-line')).toHaveCount(0);
  await expectFactCap(page);
  await shot(page, testInfo, 'menu-reader-locked');
  await closeLedger(page);

  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.getByTestId('town-ui')).toBeVisible();
  const beat = page.getByTestId('story-beat-card');
  await expect(beat).toBeVisible({ timeout: 8_000 });
  await expect(beat).toHaveAttribute('data-beat-id', 'ledger-page:the_claim');
  await expect(beat).toContainText('The ledger gains a page: The Claim.');
  await shot(page, testInfo, 'new-page-beat');
  await beat.click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-facts-the_claim').getByTestId('claim-ledger-fact-line')).toHaveCount(3);
  await expect(page.getByTestId('claim-ledger-facts-the_claim')).not.toContainText('Spawn edges');
  await expectFactCap(page);
  await shot(page, testInfo, 'beat-open-reader');
  await closeLedger(page);

  await page.getByTestId('town-exit').click();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.getByTestId('town-ui')).toBeVisible();
  await page.waitForTimeout(900);
  await expect(page.locator('[data-beat-id="ledger-page:the_claim"]')).toHaveCount(0);

  await approachSchoolhouse(page);
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
  await page.getByTestId('schoolhouse-open-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await shot(page, testInfo, 'schoolhouse-reader');
  await closeLedger(page);

  await page.goto('/?contract=the-claim&seed=en-01-pause');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  await page.getByTestId('pause-open-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await shot(page, testInfo, 'pause-reader');
  await closeLedger(page);

  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect.poll(() => page.locator('[data-ledger-discovered="true"]').count()).toBeGreaterThanOrEqual(4);
  await shot(page, testInfo, 'persisted-reader-mobile-safe');

  assertNoErrors(errors);
});
