import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { EventBus } from '../src/core/EventBus';
import { Economy } from '../src/game/Economy';
import { PROFILE_KEY, RUN_HISTORY_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { install } from '../src/game/RunManager';
import { RUN_HISTORY_LIMIT, readRunHistory, type RunHistoryEntry } from '../src/ui/RunLedger';

const ARTIFACT_DIR = path.resolve('artifacts/m3-05b-run-ledger');

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test('run end writes the actor split and keeps only the newest 50 additive entries', () => {
  const storage = memoryStorage();
  const oldEntries = Array.from({ length: RUN_HISTORY_LIMIT }, (_, index): RunHistoryEntry => ({
    at: index + 1,
    contractId: `old-${index + 1}`,
    contract: `Old Claim ${index + 1}`,
    outcome: 'death',
    waves: index + 1,
    gold: index + 1,
    goldByProspector: 0,
    duration: index + 1,
    futureField: `kept-${index + 1}`,
  }));
  storage.setItem(
    RUN_HISTORY_KEY,
    JSON.stringify([{ ...oldEntries[0], at: Number.MAX_VALUE, contractId: 'invalid-date' }, ...oldEntries]),
  );

  const events = new EventBus();
  const economy = new Economy(16);
  install(
    {
      events,
      economy,
      activeContract: { id: 'e1-dry-gulch', name: 'Dry Gulch' },
      waveSystem: { diagnostics: { wave: 9 } },
    },
    { storage },
  );
  economy.apply({ id: uuid(1), at: 1, type: 'gold_panned', nodeId: 'hero-pan', amount: 30, actor: 'player' });
  economy.apply({ id: uuid(2), at: 2, type: 'gold_panned', nodeId: 'prospector-pan', amount: 12, actor: 'prospector' });
  events.emit({
    type: 'hero_died',
    at: 75,
    timeAlive: 75,
    kills: 0,
    goldPanned: 42,
    spent: 0,
    beaconsBuilt: 0,
    wavesSurvived: 9,
    weaponToggles: 0,
    blastTime: 0,
  });

  const history = readRunHistory(storage);
  expect(history).toHaveLength(RUN_HISTORY_LIMIT);
  expect(history[0]).toMatchObject({
    contractId: 'e1-dry-gulch',
    contract: 'Dry Gulch',
    outcome: 'death',
    waves: 9,
    gold: 42,
    goldByProspector: 12,
    duration: 75,
  });
  expect(history[1]).toMatchObject({ contractId: 'old-1', futureField: 'kept-1' });
  expect(history.at(-1)?.contractId).toBe('old-49');
  expect(history.some((entry) => entry.contractId === 'invalid-date')).toBe(false);
});

test('Claim Office opens a responsive Run Ledger and a profile reset returns its warm empty state', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedProfileWithHistory(page);
  await page.goto('/?debug&timescale=100&nolevel&seed=m3-05b-ledger');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  await fastToSecure(page);

  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await page.getByTestId('open-run-ledger').click();
  await expect(page.getByTestId('run-ledger')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('run-ledger-close')).toBeFocused();
  await expect(page.getByTestId('run-ledger-contract')).toHaveText('Dry Gulch');
  await expect(page.getByTestId('run-ledger-outcome')).toHaveText('Claim secured');
  await expect(page.getByTestId('run-ledger-waves')).toHaveText('18');
  await expect(page.getByTestId('run-ledger-gold-split')).toHaveText('you 31 / the Prospector 11');
  await expect(page.getByTestId('run-ledger-duration')).toHaveText('2:05');
  await expect(page.getByTestId('run-ledger-date')).toContainText('Jul 28, 2026');
  await shot(page, testInfo);

  await page.getByTestId('run-ledger-close').click();
  await expect(page.getByTestId('open-run-ledger')).toBeFocused();
  await page.evaluate(() => localStorage.clear());
  await page.getByTestId('open-run-ledger').click();
  await expect(page.getByTestId('run-ledger-empty')).toHaveText('No claims stamped yet. The first trail is waiting.');
  assertNoErrors(errors);
});

test('a pre-history exported ledger still imports without a history key', async ({ page }, testInfo) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  const file = testInfo.outputPath('pre-history-ledger.json');
  await writeFile(
    file,
    JSON.stringify({
      kind: 'goldrush.profile.ledger',
      version: 1,
      exportedAt: '2026-07-01T00:00:00.000Z',
      profile: {
        id: 'old-timer',
        name: 'Old Timer',
        createdAt: 1,
        updatedAt: 1,
        difficultyPreset: 'trail',
        hintsSeen: [],
      },
      data: {},
    }),
  );

  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await page.getByTestId('profile-import-file').setInputFiles(file);
  await expect(page.getByTestId('profile-import-confirm')).toContainText('Old Timer');
  await page.getByTestId('profile-import-apply').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Old Timer' })).toBeVisible();
  expect(
    await page.evaluate(
      ({ profileKey, historyKey }) => {
        const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
        return localStorage.getItem(`${profileKey}.${state.activeId}.${historyKey}`);
      },
      { profileKey: PROFILE_KEY, historyKey: RUN_HISTORY_KEY },
    ),
  ).toBeNull();
  await page.getByTestId('profile-back').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  assertNoErrors(errors);
});

async function seedProfileWithHistory(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, historyKey, history }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(historyKey, JSON.stringify(history));
    },
    {
      profileKey: PROFILE_KEY,
      historyKey: profileDataKey('robin', RUN_HISTORY_KEY),
      history: [
        {
          at: Date.UTC(2026, 6, 28, 12),
          contractId: 'e1-dry-gulch',
          contract: 'Dry Gulch',
          outcome: 'secured',
          waves: 18,
          gold: 42,
          goldByProspector: 11,
          duration: 125,
          importedNote: 'unknown fields stay harmless',
        },
      ],
    },
  );
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript((profileKey) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
  }, PROFILE_KEY);
}

async function fastToSecure(page: Page): Promise<void> {
  for (const [key, value] of [
    ['enemy.contactDamage', 0],
    ['waves.waveInterval', 0.35],
    ['waves.trickleInterval', 9999],
    ['waves.pulseBase', 1],
    ['waves.pulsePerWave', 0],
    ['waves.pulsesPerWave', 1],
    ['waves.edgesPerPulse', 1],
  ] as const) {
    expect(await page.evaluate(([path, next]) => window.__GR_TEST__?.setBalance(path, next), [key, value] as const)).toBe(true);
  }
  await page.evaluate(() => window.__GR_TEST__?.resetRun());
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`), fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem'> {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

function uuid(index: number): string {
  return `00000000-0000-4000-8000-${index.toString().padStart(12, '0')}`;
}
