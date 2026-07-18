import { expect, test, type Page } from '@playwright/test';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { PROFILE_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const PROFILE_ID = 'robin';
const STEAMWORKS = 'epoch-2-steamworks';

async function seed(page: Page, epochId = 'epoch-1-frontier'): Promise<void> {
  await page.addInitScript(
    ({ activeEpochKey, epoch, profileKey }) => {
      localStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(activeEpochKey, epoch);
    },
    { activeEpochKey: profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY), epoch: epochId, profileKey: PROFILE_KEY },
  );
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
}

async function emit(page: Page, signal: { type: 'first-victory' } | { type: 'epoch-activated'; epochId: string; displayName: string }): Promise<void> {
  await page.evaluate(async (value) => {
    const { emitStorySignal } = (await Function('return import("/src/story/signals.ts")')()) as typeof import('../src/story/signals');
    emitStorySignal(value);
  }, signal);
}

async function discovered(page: Page): Promise<string[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), LEDGER_DISCOVERED_STORAGE_KEY);
}

async function openLedger(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const { openClaimLedger } = (await Function('return import("/src/encyclopedia/reader.ts")')()) as typeof import('../src/encyclopedia/reader');
    openClaimLedger();
  });
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

test('WD-03 reveals each era page once, never before its era', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await seed(page);

  await openLedger(page);
  await expect(page.getByTestId('claim-ledger-card-world_outside_1')).toHaveCount(0);
  await page.getByTestId('claim-ledger-close').click();

  const activation = { type: 'epoch-activated', epochId: STEAMWORKS, displayName: 'The Steamworks' } as const;
  await emit(page, activation);
  expect(await discovered(page)).not.toContain('world_outside_2');

  await page.evaluate((key) => localStorage.setItem(key, 'epoch-2-steamworks'), ACTIVE_EPOCH_KEY);
  await emit(page, activation);
  await emit(page, activation);
  expect((await discovered(page)).filter((id) => id === 'world_outside_2')).toHaveLength(1);

  await openLedger(page);
  await page.getByTestId(`claim-ledger-era-${STEAMWORKS}`).click();
  const pageCard = page.getByTestId('claim-ledger-card-world_outside_2');
  await expect(pageCard).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(pageCard.getByTestId('claim-ledger-fact-line')).toHaveCount(4);
  await expect(pageCard).toContainText('The strain rides the rails it craves.');
  await expect(pageCard).toContainText('The night choir of the Coalport shift');
  await expect(pageCard).not.toContainText(/killed|slain|cured|OWNER|cited:/i);
  const allDispatchText = await page.evaluate(async () => {
    const { worldOutsideLedgerEntries } = (await Function('return import("/src/encyclopedia/worldOutside.ts")')()) as typeof import('../src/encyclopedia/worldOutside');
    return worldOutsideLedgerEntries.flatMap((entry) => [...entry.factLines(), entry.loreLine]).join('\n');
  });
  expect(allDispatchText).not.toMatch(/killed|slain|cured|OWNER|cited:|STORYBOOK|\[ANSWERED|wireable|ruling #/i);
  expect(errors).toEqual([]);
});

test('WD-03 uses first victory for the Frontier page and keeps plain boot unchanged', async ({ page }) => {
  await seed(page);
  expect(await discovered(page)).not.toContain('world_outside_1');
  await emit(page, { type: 'first-victory' });
  await emit(page, { type: 'first-victory' });
  expect((await discovered(page)).filter((id) => id === 'world_outside_1')).toHaveLength(1);
  await openLedger(page);
  await expect(page.getByTestId('claim-ledger-card-world_outside_1')).toContainText('The rushes multiply.');
});

test('WD-03 backfills pages for a profile that already reached Steamworks', async ({ page }) => {
  await seed(page, STEAMWORKS);
  expect(await discovered(page)).not.toContain('world_outside_2');
  await openLedger(page);
  expect(await discovered(page)).toEqual(expect.arrayContaining(['world_outside_1', 'world_outside_2']));
  await page.getByTestId(`claim-ledger-era-${STEAMWORKS}`).click();
  await expect(page.getByTestId('claim-ledger-card-world_outside_2')).toHaveAttribute('data-ledger-discovered', 'true');
});
