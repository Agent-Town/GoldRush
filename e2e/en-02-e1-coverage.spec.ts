import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { buildableDefs } from '../src/game/buildables';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { listContracts } from '../src/meta/ContractFamilies';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import {
  LEDGER_CATEGORIES,
  alwaysDiscoveredEntryIds,
  buildableLedgerEntryById,
  contractLedgerEntryById,
  enemyStatsDiscoveryIds,
  ledgerEntries,
  townActorLedgerEntryById,
  type LedgerDiscoveryId,
  type LedgerEntryId,
} from '../src/encyclopedia/registry';
import { TOWN_ACTORS } from '../src/town/townsfolk';

const ARTIFACT_DIR = path.resolve('artifacts/en-02');
const PROFILE_ID = 'robin';
const LEDGER_FACT_LINE_CAP = 4;
const ENEMY_ENTRY_IDS = ['claim_jumper', 'outlaw', 'wrecker', 'baron'] as const satisfies readonly LedgerEntryId[];
const BUILDING_ENTRY_IDS = Object.values(buildableLedgerEntryById);
const CONTRACT_ENTRY_IDS = Object.values(contractLedgerEntryById);
const CHARACTER_ENTRY_IDS = ledgerEntries
  .filter((entry) => entry.category === 'The People' || entry.category === 'The Deputy')
  .map((entry) => entry.id);
const CHARACTER_QUOTE_ENTRY_IDS = [
  ...CHARACTER_ENTRY_IDS,
  'claim_jumper',
  'baron',
] as const satisfies readonly LedgerEntryId[];
const FULL_DISCOVERY_IDS = [...ledgerEntries.map((entry) => entry.id), ...enemyStatsDiscoveryIds] as LedgerDiscoveryId[];
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

async function seedProfile(page: Page, discovered: readonly LedgerDiscoveryId[] = []): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, ledgerKey, discoveredIds }) => {
      if (sessionStorage.getItem('__en02_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__en02_seeded', '1');
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

async function openPauseLedger(page: Page): Promise<void> {
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  await page.getByTestId('pause-open-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
}

async function openLedgerDirect(page: Page, entryId?: LedgerEntryId): Promise<void> {
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

async function waitForGame(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function taskShot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const dir = path.resolve('artifacts/063');
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function expectFactCap(page: Page): Promise<void> {
  const maxFacts = await page.locator('[data-testid^="claim-ledger-facts-"]').evaluateAll((lists) =>
    Math.max(0, ...lists.map((list) => list.querySelectorAll('[data-testid="claim-ledger-fact-line"]').length)),
  );
  expect(maxFacts).toBeLessThanOrEqual(LEDGER_FACT_LINE_CAP);
}

async function expectNoInternalLedgerText(page: Page): Promise<void> {
  const discoveredTexts = await page.locator('[data-ledger-discovered="true"]').allInnerTexts();
  expect(discoveredTexts.length).toBeGreaterThan(0);
  for (const text of discoveredTexts) {
    for (const pattern of FORBIDDEN_PLAYER_LEDGER_PATTERNS) expect(text).not.toMatch(pattern);
  }
}

async function expectCharacterQuotes(page: Page): Promise<void> {
  const expectedQuotes = await readCharacterQuoteLines();
  for (const id of CHARACTER_QUOTE_ENTRY_IDS) {
    const card = page.getByTestId(`claim-ledger-card-${id}`);
    await expect(card).toHaveAttribute('data-ledger-discovered', 'true');
    const quote = card.getByTestId('claim-ledger-character-quote');
    await expect(quote).toHaveCount(1);
    const text = (await quote.textContent())?.trim() ?? '';
    const expected = expectedQuotes.get(id);
    expect(expected, `missing QUOTE line for ${id}`).toBeTruthy();
    expect(text.startsWith('\u201c')).toBe(true);
    expect(text.endsWith('\u201d')).toBe(true);
    expect(text.slice(1, -1)).toBe(expected);
    expect(text.slice(1, -1).split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(12);
  }
}

async function readCharacterQuoteLines(): Promise<Map<LedgerEntryId, string>> {
  const text = await readFile(path.resolve('lore/characters.md'), 'utf8');
  return new Map(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^QUOTE:\s*([a-z0-9_]+):\s*(.+)$/i))
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .map((match) => [match[1] as LedgerEntryId, match[2]!.trim()]),
  );
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

async function approachTavern(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
}

async function ledgerStorage(page: Page): Promise<LedgerDiscoveryId[]> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }, LEDGER_DISCOVERED_STORAGE_KEY);
}

async function storyHintCount(page: Page, hint: string): Promise<number> {
  return page.evaluate(
    ({ profileKey, hintKey }) => {
      const raw = localStorage.getItem(profileKey);
      const state = raw ? (JSON.parse(raw) as ProfileState) : null;
      const active = state?.profiles.find((profile) => profile.id === state.activeId);
      return active?.hintsSeen.filter((entry) => entry === hintKey).length ?? 0;
    },
    { profileKey: PROFILE_KEY, hintKey: hint },
  );
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function shelfSlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

test('EN-02 plain ledger access and fresh seeds stay intact', async ({ page }, testInfo) => {
  test.setTimeout(75_000);
  await seedProfile(page);
  const errors = collectErrors(page);

  await openMenuLedger(page);
  await expect(page.locator('[data-testid^="claim-ledger-shelf-"]')).toHaveCount(LEDGER_CATEGORIES.length);
  await expect(page.locator('[data-ledger-entry]')).toHaveCount(ledgerEntries.length);
  await expect(page.locator('[data-ledger-discovered="true"]')).toHaveCount(alwaysDiscoveredEntryIds.length);
  for (const id of alwaysDiscoveredEntryIds) {
    await expect(page.getByTestId(`claim-ledger-card-${id}`)).toHaveAttribute('data-ledger-discovered', 'true');
  }
  await expectFactCap(page);
  await closeLedger(page);

  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.getByTestId('town-ui')).toBeVisible();
  await approachSchoolhouse(page);
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
  await page.getByTestId('schoolhouse-open-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await shot(page, testInfo, 'plain-schoolhouse-ledger');
  await closeLedger(page);

  await page.goto('/?contract=the-claim&seed=en-02-pause');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await openPauseLedger(page);
  await shot(page, testInfo, 'plain-pause-ledger');
  await expectFactCap(page);

  expectNoErrors(errors);
});

test('EN-02 full E1 roster has manifest-backed entries and capped facts', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page, FULL_DISCOVERY_IDS);
  const errors = collectErrors(page);

  await openMenuLedger(page);
  for (const category of LEDGER_CATEGORIES) {
    const expected = ledgerEntries.filter((entry) => entry.category === category).length;
    await expect(page.getByTestId(`claim-ledger-shelf-${shelfSlug(category)}`).locator('[data-ledger-entry]')).toHaveCount(expected);
  }
  await expect(page.locator('[data-ledger-discovered="true"]')).toHaveCount(ledgerEntries.length);
  expect(BUILDING_ENTRY_IDS).toHaveLength(buildableDefs.length);
  expect(ENEMY_ENTRY_IDS).toHaveLength(4);
  expect(CHARACTER_ENTRY_IDS).toHaveLength(TOWN_ACTORS.length + 1);
  expect(CONTRACT_ENTRY_IDS).toHaveLength(listContracts().length);
  for (const id of [...BUILDING_ENTRY_IDS, ...ENEMY_ENTRY_IDS, ...CHARACTER_ENTRY_IDS, ...CONTRACT_ENTRY_IDS]) {
    await expect(page.getByTestId(`claim-ledger-card-${id}`)).toHaveCount(1);
  }
  await expectFactCap(page);
  await expectNoInternalLedgerText(page);
  await expectCharacterQuotes(page);
  await shot(page, testInfo, 'full-shelves-populated');
  await page.getByTestId('claim-ledger-card-hero').scrollIntoViewIfNeeded();
  await taskShot(page, testInfo, 'character-quote-hero');

  expectNoErrors(errors);
});

test('EN-02 town board and bark discover contracts and townsfolk', async ({ page }) => {
  await seedProfile(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await approachTavern(page);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-actor-id', 'tavernkeeper');
  await expect.poll(() => ledgerStorage(page)).toContain(townActorLedgerEntryById.tavernkeeper);

  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  for (const id of CONTRACT_ENTRY_IDS) {
    await expect.poll(() => ledgerStorage(page)).toContain(id);
  }

  expectNoErrors(errors);
});

test('EN-02 enemy stats reveal once, persist, and hero facts live-read abilities', async ({ page }, testInfo) => {
  test.setTimeout(75_000);
  await seedProfile(page, ['claim_jumper']);
  const errors = collectErrors(page);

  await page.goto('/?debug&nowaves&nolevel&seed=en-02-enemy-stats');
  await waitForGame(page);
  await openLedgerDirect(page, 'claim_jumper');
  const claimJumper = page.getByTestId('claim-ledger-card-claim_jumper');
  await expect(claimJumper).toHaveAttribute('data-ledger-discovered', 'true');
  await expect(claimJumper).toContainText('Claim Jumper');
  await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('Not yet measured');
  await expect(claimJumper.getByTestId('claim-ledger-locked-silhouette')).toHaveCount(1);
  await shot(page, testInfo, 'enemy-pre-kill-not-measured');
  await closeLedger(page);

  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.hp', 1);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('sparkRig.damage', 999);
    window.__GR_TEST__?.setBalance('sparkRig.fireRate', 30);
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 4, { speedScale: 0 });
  });
  await expect.poll(() => ledgerStorage(page), { timeout: 12_000 }).toContain('claim_jumper_stats');
  await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats')).toBe(1);

  await openLedgerDirect(page, 'claim_jumper');
  await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).not.toContainText('Not yet measured');
  await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('HP: 1');
  await expect(claimJumper.getByTestId('claim-ledger-locked-silhouette')).toHaveCount(0);
  await shot(page, testInfo, 'enemy-post-kill-stats');
  await closeLedger(page);

  const kills = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0);
  await page.evaluate(() => {
    window.__GR_TEST__?.clearEnemies();
    window.__GR_TEST__?.spawnPack(1, 4, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0), { timeout: 12_000 }).toBeGreaterThan(kills);
  await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats')).toBe(1);
  expect((await ledgerStorage(page)).filter((id) => id === 'claim_jumper_stats')).toHaveLength(1);

  await page.reload();
  await waitForGame(page);
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ powder_charge: 1, wide_ring: 1 }));
  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.blastDamage ?? 0), { timeout: 8_000 })
    .toBeGreaterThan(20);
  await openLedgerDirect(page, 'hero');
  await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).not.toContainText('Not yet measured');
  await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('HP:');
  await expect(page.getByTestId('claim-ledger-facts-hero')).toContainText(/blast 25 dmg\/2\.5wu/);
  await expect(page.getByTestId('claim-ledger-card-hero').getByTestId('claim-ledger-character-quote')).toHaveCount(1);
  await shot(page, testInfo, 'hero-live-ability-and-persisted-stats');
  await expectFactCap(page);

  expectNoErrors(errors);
});
