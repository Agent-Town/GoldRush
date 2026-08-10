import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { SEASONS } from '../src/seasons/registry';

const SHOTS = path.resolve('reviews/shots-sea-2');
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'season-page',
  profiles: [{ id: 'season-page', name: 'Season Page', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
};

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function plainBoot(page: Page): Promise<void> {
  await page.addInitScript(({ key, state, epochKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.setItem(epochKey, 'epoch-2-steamworks');
  }, { key: PROFILE_KEY, state: PROFILE_STATE, epochKey: ACTIVE_EPOCH_KEY });
  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await page.getByTestId('start-menu-claim-ledger').click();
}

function cell(contractId: string, submittedAt: number, season?: string): Record<string, unknown> {
  return {
    contractId,
    score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 },
    difficulty: 'trail',
    submittedAt,
    harness: 'codex-cli',
    harnessVersion: '2026.08',
    config: 'medium',
    ...(season ? { season } : {}),
  };
}

function aggregate(submittedAt: number): Record<string, number> {
  return { standings: 1, contracts: 1, crowns: 1, bestWaves: 20, declaredCells: 1, undeclaredCells: 0, latestSubmittedAt: submittedAt };
}

test('plain boot opens the season list and a season page without losing legacy standings', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const season = SEASONS[0];
  const seasonedAt = season.startsAt + 60_000;
  const legacyAt = season.startsAt - 60_000;
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const view = params.get('view');
    if (view === 'byStack' || view === 'byHarness') {
      const name = view === 'byStack' ? 'model' : 'harness';
      const group = view === 'byStack' ? 'byStack' : 'byHarness';
      const rows = params.get('epoch') === 'epoch-1-frontier'
        ? [
            { [name]: view === 'byStack' ? 'gpt-5.6-sol' : 'codex-cli', aggregate: aggregate(seasonedAt), contracts: [cell('the-claim', seasonedAt, season.name)] },
            { [name]: view === 'byStack' ? 'Legacy Rider' : 'Legacy Rig', aggregate: aggregate(legacyAt), contracts: [cell('e1-dry-gulch', legacyAt)] },
          ]
        : [];
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          view,
          epochId: 'epoch-1-frontier',
          contracts: ['the-claim', 'e1-dry-gulch'],
          [group]: rows,
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        epochId: 'epoch-1-frontier',
        contractId: 'the-claim',
        party: 'solo',
        board: [
          { rank: 1, profileName: 'Seasoned Rider', secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400, difficulty: 'trail', submittedAt: seasonedAt, season: season.name, declared: false },
          { rank: 2, profileName: 'Legacy Rider', secured: true, waves: 10, timeAlive: 610, gold: 100, baseValue: 200, difficulty: 'trail', submittedAt: legacyAt, declared: false },
        ],
      }),
    });
  });

  await plainBoot(page);
  await page.getByTestId('claim-ledger-seasons').click();
  await expect(page.getByTestId('season-list').locator('[data-season-id]')).toHaveCount(SEASONS.length);
  await expect(page.getByTestId(`season-link-${season.id}`)).toContainText('Since August 6, 2026 — still riding');
  await mkdir(SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `list-${testInfo.project.name}.png`) });

  await page.getByTestId(`season-link-${season.id}`).click();
  const pageView = page.getByTestId(`season-page-${season.id}`);
  await expect(pageView).toBeVisible();
  await expect(pageView.getByRole('heading', { name: 'What happened' })).toBeVisible();
  await expect(pageView.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(pageView.getByRole('heading', { name: 'Commentary' })).toBeVisible();
  await expect(pageView.getByRole('heading', { name: 'What we learned' })).toBeVisible();
  await expect(page.getByTestId('season-results')).toContainText('Minds and rigs are SELF-DECLARED');
  await expect(page.getByTestId('season-results-byStack')).toContainText('gpt-5.6-sol');
  await expect(page.getByTestId('season-results-byHarness')).toContainText('codex-cli');
  await expect(page.getByTestId('season-results-board')).not.toContainText('Legacy Rider');
  await expect(page.getByTestId('season-results-board')).not.toContainText('Legacy Rig');
  expect(await page.locator('body').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await page.setViewportSize({ width: testInfo.project.name === 'mobile-chrome' ? 390 : 1280, height: testInfo.project.name === 'mobile-chrome' ? 1600 : 1000 });
  if (testInfo.project.name === 'desktop-chrome') {
    await page.locator('.claim-ledger__shell').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  }
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `page-${testInfo.project.name}.png`) });

  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-row-2')).toContainText('Legacy Rider');
  expect(errors).toEqual({ console: [], page: [] });
});

test('a season with no labelled rows says so plainly', async ({ page }) => {
  const errors = collectErrors(page);
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, contracts: [], byStack: [], byHarness: [] }),
  }));
  await plainBoot(page);
  await page.getByTestId('claim-ledger-seasons').click();
  await page.getByTestId(`season-link-${SEASONS[0].id}`).click();
  await expect(page.getByTestId('season-results-board')).toHaveText('No rides were posted for this season — the county page is ready when they are.');
  expect(errors).toEqual({ console: [], page: [] });
});

test('unavailable results are not reported as an empty season', async ({ page }) => {
  const errors = collectErrors(page);
  await plainBoot(page);
  await page.evaluate(() => Object.defineProperty(navigator, 'onLine', { configurable: true, value: false }));
  await page.getByTestId('claim-ledger-seasons').click();
  await page.getByTestId(`season-link-${SEASONS[0].id}`).click();
  await expect(page.getByTestId('season-results-board')).toHaveText('The county results book is unavailable right now — try this page again when the trail clears.');
  expect(errors).toEqual({ console: [], page: [] });
});
