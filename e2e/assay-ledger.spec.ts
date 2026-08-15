import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/assay-ledger');
const STATS_ROUTE = '**/api/stats*';
const stats = {
  ok: true,
  empty: false,
  stats: {
    runs: { today: 7, sevenDays: 31, allTime: 144 },
    deepestWave: 42,
    medianDurationBucket: '5-10m',
    durationHistogram: { '5-10m': 68 },
    busiestContract: { id: 'e1-dry-gulch', runs: 58 },
    tierSplit: { FULL: 70, BALANCED: 52, LITE: 22 },
  },
};

function errors(page: Page): { console: string[]; page: string[] } {
  const result = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') result.console.push(message.text());
  });
  page.on('pageerror', (error) => result.page.push(error.message));
  return result;
}

async function openAssayOffice(page: Page): Promise<void> {
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, {
    key: PROFILE_KEY,
    state: {
      version: 2,
      activeId: 'assay-ledger',
      profiles: [{ id: 'assay-ledger', name: 'Assay Ledger', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    } satisfies ProfileState,
  });
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger-assay-office')).toBeVisible();
  await page.getByTestId('claim-ledger-assay-office').click();
  await expect(page.getByTestId('assay-ledger')).toBeVisible();
}

test('the Claim Ledger Assay Office renders the six county figures', async ({ page }, testInfo: TestInfo) => {
  const pageErrors = errors(page);
  await page.route(STATS_ROUTE, (route) => route.fulfill({ json: stats }));
  await openAssayOffice(page);

  const expected = {
    'runs-today': ['Runs today', '7'],
    'runs-seven-days': ['Past seven days', '31'],
    'runs-all-time': ['All time', '144'],
    'deepest-wave': ['Deepest wave', '42'],
    'typical-run': ['Typical run', '5–10 min'],
    'busiest-claim': ['Busiest claim', 'E1 Dry Gulch'],
  };
  for (const [id, text] of Object.entries(expected)) {
    await expect(page.getByTestId(`assay-ledger-${id}`)).toContainText(text[0]!);
    await expect(page.getByTestId(`assay-ledger-${id}`)).toContainText(text[1]!);
  }
  await expect(page.getByTestId('assay-ledger')).toContainText('Anonymous gameplay statistics, no personal data, opt-out in Settings.');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`), fullPage: true });
  expect(pageErrors).toEqual({ console: [], page: [] });
});

test('the Assay Office falls quiet when the county wire is unavailable', async ({ page }) => {
  const pageErrors = errors(page);
  await page.route(STATS_ROUTE, (route) => route.fulfill({ contentType: 'application/json', body: 'wire unavailable' }));
  await openAssayOffice(page);

  await expect(page.getByTestId('assay-ledger-quiet')).toContainText('The clerk is off the desk');
  await expect(page.getByTestId('assay-ledger')).not.toContainText('error');
  await expect(page.getByTestId('assay-ledger')).not.toContainText('loading');
  expect(pageErrors).toEqual({ console: [], page: [] });
});
