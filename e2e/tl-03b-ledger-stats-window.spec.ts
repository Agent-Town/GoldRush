import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import type { LedgerDiscoveryId } from '../src/encyclopedia/registry';

const ARTIFACT_DIR = path.resolve('artifacts/tl-03b');
const PROFILE_ID = 'robin';
const STATS_ROUTE = '**/api/stats*';
const FORBIDDEN_LEDGER_WORDS = ['api/stats', 'telemetry', 'nonce', 'email', 'profile', 'wallet', 'userid', 'dedup'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, discovered: readonly LedgerDiscoveryId[] = []): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, ledgerKey, discoveredIds }) => {
      if (sessionStorage.getItem('__tl03b_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__tl03b_seeded', '1');
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
      if (discoveredIds.length > 0) localStorage.setItem(ledgerKey, JSON.stringify(discoveredIds));
      else localStorage.removeItem(ledgerKey);
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      ledgerKey: profileDataKey(PROFILE_ID, LEDGER_DISCOVERED_STORAGE_KEY),
      discoveredIds: discovered,
    },
  );
}

async function openMenuLedger(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function ledgerStorage(page: Page): Promise<LedgerDiscoveryId[]> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, LEDGER_DISCOVERED_STORAGE_KEY);
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function readPopulatedPayload(): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path.resolve('artifacts/tl-02/desktop-chrome-populated-response.json'), 'utf8')) as Record<
    string,
    unknown
  >;
}

async function fulfillJson(route: Route, payload: Record<string, unknown>): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(payload),
  });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

async function expectNoInternalStrings(page: Page): Promise<void> {
  const text = (await page.getByTestId('claim-ledger-card-assay_office_records').innerText()).toLowerCase();
  for (const word of FORBIDDEN_LEDGER_WORDS) expect(text).not.toContain(word);
}

test('Assay Office records are locked until the first completed run, then show mocked tallies', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  const errors = collectErrors(page);
  let hits = 0;
  const populatedPayload = await readPopulatedPayload();
  await page.route(STATS_ROUTE, async (route) => {
    hits += 1;
    await fulfillJson(route, populatedPayload);
  });

  await openMenuLedger(page);
  await expect(page.getByTestId('claim-ledger-card-assay_office_records')).toHaveAttribute('data-ledger-discovered', 'false');

  await page.goto('/?debug&nowaves&nolevel&seed=tl-03b-first-assay');
  await waitForGame(page);
  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  await expect.poll(() => ledgerStorage(page), { timeout: 8_000 }).toContain('assay_office_records');

  await openMenuLedger(page);
  const card = page.getByTestId('claim-ledger-card-assay_office_records');
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(card).toContainText('Assay Office — Records');
  await expect(card).toContainText('Claims assayed this week: 14');
  await expect(card).toContainText('Claims assayed all told: 42');
  await expect(card).toContainText('Deepest holdout: wave 37');
  await expect(card).toContainText('Busiest trail: E1 Dry Gulch (30 assays)');
  await expectNoInternalStrings(page);
  await page.waitForTimeout(500);
  expect(hits).toBe(1);
  await screenshot(page, testInfo, 'populated');

  assertNoErrors(errors);
});

test('Assay Office records fall back quietly when the wire is unreachable', async ({ page }, testInfo) => {
  await seedProfile(page, ['assay_office_records']);
  const errors = collectErrors(page);
  await page.route(STATS_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'not-json',
    }),
  );

  await openMenuLedger(page);
  const card = page.getByTestId('claim-ledger-card-assay_office_records');
  await expect(card).toBeVisible();
  await expect(card).toContainText('the wire is quiet.');
  await expect(card).not.toContainText('error');
  await expect(card).not.toContainText('loading');
  await expectNoInternalStrings(page);
  await screenshot(page, testInfo, 'quiet-wire');

  assertNoErrors(errors);
});
