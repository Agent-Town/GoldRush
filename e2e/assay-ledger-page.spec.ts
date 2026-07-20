import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { PROFILE_KEY, SCOREBOARD_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const PROFILE_ID = 'robin';
const STATS_ROUTE = 'https://gold-rush-3in.pages.dev/api/stats';
const RECORDS_ID = 'assay_office_records';

const countyStats = {
  ok: true,
  empty: false,
  stats: {
    runs: { today: 5, sevenDays: 14, allTime: 42 },
    deepestWave: 37,
    medianDurationBucket: '3-5m',
    busiestContract: { id: 'steady-hands', runs: 30 },
    tierSplit: { FULL: 10, BALANCED: 20, LITE: 12 },
    durationHistogram: { lt1m: 1, '1-3m': 9, '3-5m': 15 },
    wavesHistogram: { '0-4': 1, '5-9': 4, '10-19': 9 },
  },
};

type Errors = { console: string[]; page: string[] };

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function seedProfile(page: Page, completedRun: boolean): Promise<void> {
  await page.addInitScript(
    ({ profileKey, ledgerKey, scoreKey, profileId, discoveredId, hasRun }) => {
      localStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: profileId,
        profiles: [{ id: profileId, name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      if (!hasRun) return;
      localStorage.setItem(ledgerKey, JSON.stringify([discoveredId]));
      localStorage.setItem(
        scoreKey,
        JSON.stringify([
          { waves: 12, kills: 18, gold: 240, timeAlive: 185, at: 2, contractId: 'the-claim' },
          { waves: 8, kills: 7, gold: 90, timeAlive: 75, at: 1, contractId: 'e1-dry-gulch' },
        ]),
      );
    },
    {
      profileKey: PROFILE_KEY,
      ledgerKey: profileDataKey(PROFILE_ID, LEDGER_DISCOVERED_STORAGE_KEY),
      scoreKey: profileDataKey(PROFILE_ID, SCOREBOARD_KEY),
      profileId: PROFILE_ID,
      discoveredId: RECORDS_ID,
      hasRun: completedRun,
    },
  );
}

async function openLedger(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function screenshot(page: Page, testInfo: TestInfo): Promise<void> {
  const dir = path.resolve('artifacts/assay-ledger-page');
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${testInfo.project.name}-records.png`), fullPage: true });
}

test('locks the records page before the first run', async ({ page }) => {
  await seedProfile(page, false);
  const errors = collectErrors(page);
  await openLedger(page);

  const card = page.getByTestId(`claim-ledger-card-${RECORDS_ID}`);
  await expect(card).toHaveAttribute('data-ledger-discovered', 'false');
  await expect(card.getByTestId('claim-ledger-locked-copy')).toBeVisible();
  expect(errors).toEqual({ console: [], page: [] });
});

test('renders the county book and this claim from a seeded first run', async ({ page }, testInfo) => {
  await seedProfile(page, true);
  const errors = collectErrors(page);
  await page.route(STATS_ROUTE, (route) => route.fulfill({ json: countyStats }));
  await openLedger(page);

  const card = page.getByTestId(`claim-ledger-card-${RECORDS_ID}`);
  await expect(card).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(card.getByRole('heading', { name: 'Assay Office — Records' })).toBeVisible();
  await expect(card.getByTestId('assay-records-county')).toContainText("THE COUNTY — the county's book");
  await expect(card.getByTestId('assay-records-county')).toContainText('Claims assayed this week: 14');
  await expect(card.getByTestId('assay-records-county')).toContainText('Typical run: 3–5 min');
  await expect(card.getByTestId('assay-records-county')).toContainText('Trail rigs: Full 10, Balanced 20, Lite 12');
  await expect(card.getByTestId('assay-records-claim')).toContainText('THE CLAIM — your page in it');
  await expect(card.getByTestId('assay-records-claim')).toContainText('Runs entered: 2 · Deepest holdout: wave 12');
  await expect(card.getByTestId('assay-records-claim')).toContainText('Gold panned: 330 · Folks freed: 25');
  await expect(card.getByTestId('assay-records-claim')).toContainText('Playtime in the ledger: 4 min');
  await card.scrollIntoViewIfNeeded();
  await screenshot(page, testInfo);
  expect(errors).toEqual({ console: [], page: [] });
});

test('keeps local records visible when the county wire is quiet', async ({ page }) => {
  await seedProfile(page, true);
  const errors = collectErrors(page);
  await page.route(STATS_ROUTE, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: 'not-json' }));
  await openLedger(page);

  const card = page.getByTestId(`claim-ledger-card-${RECORDS_ID}`);
  await expect(card.getByTestId('assay-records-county')).toContainText('the wire is quiet');
  await expect(card.getByTestId('assay-records-claim')).toContainText('Gold panned: 330');
  expect(errors).toEqual({ console: [], page: [] });
});

test('shows the honest county empty state', async ({ page }) => {
  await seedProfile(page, true);
  const errors = collectErrors(page);
  await page.route(STATS_ROUTE, (route) => route.fulfill({ json: { ok: true, empty: true } }));
  await openLedger(page);

  await expect(page.getByTestId('assay-records-county')).toContainText('the office opens with the first assay');
  expect(errors).toEqual({ console: [], page: [] });
});
