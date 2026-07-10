import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import type { LedgerDiscoveryId } from '../src/encyclopedia/registry';

const ARTIFACT_DIR = path.resolve('artifacts/en-03');
const PROFILE_ID = 'robin';
const STEAMWORKS = 'epoch-2-steamworks';
const FORBIDDEN_PLAYER_LEDGER_PATTERNS = [/\(lore\//i, /\.md\b/i, /\bbatch-/i, /\b20\d{2}-\d{2}-\d{2}\b/];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, ledgerKey }) => {
      if (sessionStorage.getItem('__en03_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__en03_seeded', '1');
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
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      ledgerKey: profileDataKey(PROFILE_ID, LEDGER_DISCOVERED_STORAGE_KEY),
    },
  );
}

async function openMenuLedger(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function openLedgerDirect(page: Page, entryId?: string): Promise<void> {
  await page.evaluate(async (targetId) => {
    const loadReader = new Function('return import("/src/encyclopedia/reader.ts")') as () => Promise<{
      openClaimLedger: (options?: { entryId?: string }) => void;
    }>;
    const { openClaimLedger } = await loadReader();
    openClaimLedger(targetId ? { entryId: targetId } : undefined);
  }, entryId);
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function closeLedger(page: Page): Promise<void> {
  await page.getByTestId('claim-ledger-close').click();
  await expect(page.getByTestId('claim-ledger')).toHaveCount(0);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function ledgerStorage(page: Page): Promise<LedgerDiscoveryId[]> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, LEDGER_DISCOVERED_STORAGE_KEY);
}

async function emitEpochActivated(page: Page, epochId: string): Promise<void> {
  await page.evaluate(async ({ id }) => {
    const signals = (await Function('return import("/src/story/signals.ts")')()) as typeof import('../src/story/signals');
    signals.emitStorySignal({ type: 'epoch-activated', epochId: id, displayName: 'The Steamworks' });
  }, { id: epochId });
}

async function expectNoInternalLedgerText(page: Page): Promise<void> {
  const discoveredTexts = await page.locator('[data-ledger-discovered="true"]').allInnerTexts();
  expect(discoveredTexts.length).toBeGreaterThan(0);
  for (const text of discoveredTexts) {
    for (const pattern of FORBIDDEN_PLAYER_LEDGER_PATTERNS) expect(text).not.toMatch(pattern);
  }
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('EN-03 epoch pages unlock on epoch activation and keep future eras absent', async ({ page }, testInfo) => {
  test.setTimeout(75_000);
  await seedProfile(page);
  const errors = collectErrors(page);

  await openMenuLedger(page);
  const frontier = page.getByTestId('claim-ledger-card-era_frontier');
  await expect(frontier).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(frontier).toContainText('The Age of the Frontier');
  await expect(frontier).toContainText('The Claim');
  await expect(page.getByTestId('claim-ledger-card-era_steamworks')).toHaveCount(0);
  await expect(page.getByTestId('claim-ledger-card-era_voltage')).toHaveCount(0);
  await expect(page.getByTestId('claim-ledger')).not.toContainText('Voltage Age');
  await expectNoInternalLedgerText(page);
  await shot(page, testInfo, 'frontier-era-only');
  await closeLedger(page);

  await emitEpochActivated(page, STEAMWORKS);
  await expect.poll(() => ledgerStorage(page)).toContain('era_steamworks');
  await emitEpochActivated(page, STEAMWORKS);
  expect((await ledgerStorage(page)).filter((id) => id === 'era_steamworks')).toHaveLength(1);

  await openLedgerDirect(page, 'era_steamworks');
  const steamworks = page.getByTestId('claim-ledger-card-era_steamworks');
  await expect(steamworks).toBeInViewport({ ratio: 0.5 });
  await expect(page.getByTestId('claim-ledger-card-era_frontier')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(steamworks).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(steamworks).toContainText('The Age of Steamworks');
  await expect(steamworks).toContainText('The Hill Mine');
  await expect(steamworks).toContainText('Pressure');
  await expect(steamworks).toContainText('Dynamo Hall');
  await expect(steamworks).toContainText('Rail Tough');
  await expect(page.getByTestId('claim-ledger-card-era_voltage')).toHaveCount(0);
  await expect(page.getByTestId('claim-ledger')).not.toContainText('Voltage Age');
  await expectNoInternalLedgerText(page);
  await shot(page, testInfo, 'steamworks-era-unlocked');

  await page.reload();
  await openLedgerDirect(page, 'era_steamworks');
  await expect(page.getByTestId('claim-ledger-card-era_frontier')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-era_steamworks')).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(page.getByTestId('claim-ledger-card-era_voltage')).toHaveCount(0);
  expect(await ledgerStorage(page)).toContain('era_steamworks');
  expect(await ledgerStorage(page)).not.toContain('era_voltage');
  expectNoErrors(errors);
});
