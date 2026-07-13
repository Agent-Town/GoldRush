import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const ARTIFACT_DIR = path.resolve('artifacts/ledger-era-chapters');
const PROFILE_ID = 'robin';
const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const VOLTAGE = 'epoch-3-voltage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function seedProfile(page: Page, epochId: string, discovered: string[]): Promise<void> {
  await page.addInitScript(
    ({ activeEpochKey, discoveredIds, epoch, ledgerKey, profileKey, townKey }) => {
      localStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(activeEpochKey, epoch);
      localStorage.setItem(ledgerKey, JSON.stringify(discoveredIds));
    },
    {
      activeEpochKey: profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY),
      discoveredIds: discovered,
      epoch: epochId,
      ledgerKey: profileDataKey(PROFILE_ID, LEDGER_DISCOVERED_STORAGE_KEY),
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
    },
  );
}

async function openLedger(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('E2 ledger has two open chapters, a locked future stub, tabs, and deep links', async ({ page }, testInfo) => {
  await seedProfile(page, STEAMWORKS, ['era_steamworks', 'rail_tough', 'the_claim']);
  const errors = collectErrors(page);
  await openLedger(page);

  const eraRow = page.getByTestId('claim-ledger-era-row');
  await expect(eraRow.locator('[data-ledger-era-state="open"]')).toHaveCount(2);
  await expect(eraRow.locator('[data-ledger-era-state="locked"]')).toHaveCount(1);
  await expect(page.getByTestId(`claim-ledger-era-${FRONTIER}`)).toContainText('The Frontier ✓');
  await expect(page.getByTestId(`claim-ledger-era-${STEAMWORKS}`)).toContainText('The Steamworks — active');
  await expect(page.getByTestId(`claim-ledger-era-${VOLTAGE}`)).toBeDisabled();
  await expect(page.getByTestId('claim-ledger-locked-chapter')).toHaveAttribute('data-ledger-era', VOLTAGE);
  await expect(page.getByTestId('claim-ledger-locked-chapter')).toContainText('The ledger has pages yet unwritten');
  await expect(page.getByTestId(`claim-ledger-chapter-${STEAMWORKS}`)).toBeVisible();
  await expect(page.getByTestId('claim-ledger-card-rail_tough')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-steam_wrecker')).toHaveAttribute('data-ledger-discovered', 'false');
  await shot(page, testInfo, 'e2-active');

  await page.getByTestId(`claim-ledger-era-${FRONTIER}`).click();
  await expect(page.getByTestId(`claim-ledger-chapter-${FRONTIER}`)).toBeVisible();
  await expect(page.getByTestId('claim-ledger-card-hero')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-rail_tough')).toBeHidden();

  await page.evaluate(async () => {
    const events = (await Function('return import("/src/encyclopedia/events.ts")')()) as typeof import('../src/encyclopedia/events');
    events.requestOpenClaimLedger('rail_tough');
  });
  await expect(page.getByTestId(`claim-ledger-chapter-${STEAMWORKS}`)).toBeVisible();
  await expect(page.getByTestId('claim-ledger-card-rail_tough')).toHaveClass(/claim-ledger-card--selected/);
  await expect(page.getByTestId('claim-ledger-card-rail_tough')).toBeInViewport({ ratio: 0.5 });
  expectNoErrors(errors);
});

test('E1-only ledger exposes one chapter and keeps the next era locked', async ({ page }, testInfo) => {
  await seedProfile(page, FRONTIER, ['the_claim']);
  const errors = collectErrors(page);
  await openLedger(page);

  const eraRow = page.getByTestId('claim-ledger-era-row');
  await expect(eraRow.locator('[data-ledger-era-state="open"]')).toHaveCount(1);
  await expect(eraRow.locator('[data-ledger-era-state="locked"]')).toHaveCount(1);
  await expect(page.getByTestId(`claim-ledger-chapter-${FRONTIER}`)).toBeVisible();
  await expect(page.getByTestId('claim-ledger-locked-chapter')).toHaveAttribute('data-ledger-era', STEAMWORKS);
  await expect(page.getByTestId('claim-ledger-card-the_claim')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-rail_tough')).toBeHidden();
  await shot(page, testInfo, 'e1-only');
  expectNoErrors(errors);
});
