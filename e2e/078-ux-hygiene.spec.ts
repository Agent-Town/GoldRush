import { expect, test, type Page } from '@playwright/test';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TownPrompt = 'tavern' | 'schoolhouse';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, hintsSeen: string[] = []): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, scoreKey, ledgerKey, hints }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: hints }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(scoreKey, JSON.stringify([{ waves: 10, kills: 0, gold: 0, timeAlive: 120, at: 1, contractId: 'the-claim' }]));
      localStorage.setItem(ledgerKey, JSON.stringify(['contract_the_claim', 'contract_e1_dry_gulch']));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      ledgerKey: profileDataKey('robin', LEDGER_DISCOVERED_STORAGE_KEY),
      hints: hintsSeen,
    },
  );
}

async function openTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function openTownBoard(page: Page): Promise<void> {
  await openTown(page);
  await walkTo(page, { x: -6, z: -9 }, 'tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function openSchoolhouse(page: Page): Promise<void> {
  await openTown(page);
  await walkTo(page, { x: -8.2, z: 5.4 }, 'schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
}

async function walkTo(page: Page, target: { x: number; z: number }, prompt: TownPrompt): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === prompt) return;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [];
    if (Math.abs(target.x - position.x) > 0.6) keys.push(target.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - position.z) > 0.6) keys.push(target.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 2_000 }).toBe(prompt);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('legacy board-unlock seen keys suppress duplicate unlock cards', async ({ page }) => {
  await seedProfile(page, ['story:first-contract', 'story:board-unlock-generic:e1-dry-gulch']);
  const errors = collectErrors(page);
  await page.goto('/');

  await page.evaluate(async () => {
    const importViteModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    const { emitStorySignal } = (await importViteModule('/src/story/signals.ts')) as {
      emitStorySignal: (signal: {
        type: 'contract-unlocked';
        contractId: string;
        contractName: string;
        ledgerBlurb: string;
      }) => void;
    };
    emitStorySignal({
      type: 'contract-unlocked',
      contractId: 'e1-dry-gulch',
      contractName: 'The Dry Gulch',
      ledgerBlurb: 'Mesa country; dry washes fall toward one sunken spring.',
    });
  });

  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  assertNoErrors(errors);
});

test('ledger discovery write-back preserves unknown ids', async ({ page }) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await page.goto('/');

  const stored = await page.evaluate(async (key) => {
    localStorage.setItem(key, JSON.stringify(['future-ledger-id']));
    const importViteModule = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<unknown>;
    const { discoverLedgerEntry } = (await importViteModule('/src/encyclopedia/state.ts')) as {
      discoverLedgerEntry: (id: string) => boolean;
    };
    discoverLedgerEntry('baron');
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
  }, LEDGER_DISCOVERED_STORAGE_KEY);

  expect(stored).toEqual(['future-ledger-id', 'baron']);
  assertNoErrors(errors);
});

test('ledger Escape closes only the ledger and restores schoolhouse focus', async ({ page }) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await openSchoolhouse(page);

  await page.getByTestId('schoolhouse-open-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await expect(page.getByTestId('claim-ledger-close')).toBeFocused();

  await page.keyboard.down('Shift');
  await page.keyboard.press('Tab');
  await page.keyboard.up('Shift');
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('[data-testid="claim-ledger"]'))).toBe(true);

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('claim-ledger')).toHaveCount(0);
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
  await expect(page.getByTestId('schoolhouse-open-ledger')).toBeFocused();
  assertNoErrors(errors);
});

test('contract board focuses Launch on open', async ({ page }) => {
  await seedProfile(page, ['story:first-contract']);
  const errors = collectErrors(page);
  await openTownBoard(page);

  await expect(page.getByTestId('contract-launch-the-claim')).toBeFocused();
  assertNoErrors(errors);
});
