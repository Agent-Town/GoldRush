import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, RUN_SUSPEND_KEY, TOWN_NAME_KEY } from '../src/game/ProfileStorage';

const SHOT_DIR = 'artifacts/ac-02';
const ACCOUNT_KEY = 'gr.account.v1';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.describe.configure({ mode: 'serial' });

test('sign-in pushes, local wipe pulls the profile back, and chips stay quiet', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'roundtrip');
  await seedProfile(page, { town: 'Quartz Hill', science: 6 });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await shot(page, testInfo, 'sign-in-card');

  await signIn(page, email);
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');
  await shot(page, testInfo, 'status-chip');
  await page.getByTestId('account-sign-out').click();
  await signIn(page, email);
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');
  await expect(page.getByTestId('account-compare-card')).toHaveCount(0);

  await wipeProfileStoragePreservingAccount(page);
  await page.goto('/');
  await expect(page.getByTestId('start-menu-profile')).toBeVisible();
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('Quartz Hill');
  await expect(readScience(page)).resolves.toBe(6);
  assertNoErrors(errors);
});

test('compare card can use cloud over local', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'use-cloud');
  await seedProfile(page, { town: 'Cloud Bend', science: 6 });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await signIn(page, email);
  await page.getByTestId('account-sign-out').click();

  await writeProfileDatum(page, TOWN_NAME_KEY, 'Local Fork');
  await writeProfileDatum(page, META_PROGRESS_KEY, { version: 1, tracks: { territory: 1, science: 1, hero: 0, agent: 0 } });
  await signIn(page, email);
  await expect(page.getByTestId('account-compare-card')).toContainText('Cloud has Cloud Bend at science 6');
  await shot(page, testInfo, 'compare-card');

  await page.getByTestId('account-use-cloud').click();
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('Cloud Bend');
  await expect(readScience(page)).resolves.toBe(6);
  assertNoErrors(errors);
});

test('compare card can keep local, then burn the cloud ledger', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'keep-local');
  await seedProfile(page, { town: 'Old Cloud', science: 2 });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await signIn(page, email);
  await page.getByTestId('account-sign-out').click();

  await writeProfileDatum(page, TOWN_NAME_KEY, 'New Local');
  await writeProfileDatum(page, META_PROGRESS_KEY, { version: 1, tracks: { territory: 3, science: 8, hero: 0, agent: 0 } });
  await signIn(page, email);
  await expect(page.getByTestId('account-compare-card')).toContainText('Old Cloud');
  await page.getByTestId('account-keep-local').click();
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');

  await wipeProfileStoragePreservingAccount(page);
  await page.goto('/?profiles');
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Robin' })).toBeVisible();
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('New Local');
  await expect(readScience(page)).resolves.toBe(8);

  await page.getByTestId('account-burn').click();
  await expect(page.getByTestId('account-burn-confirm-card')).toBeVisible();
  await shot(page, testInfo, 'burn-flow');
  await page.getByTestId('account-burn-confirm').click();
  await expect(page.getByTestId('account-status-chip')).toContainText('cloud ledger burned');
  assertNoErrors(errors);
});

test('signed-out boot leaves profile bytes alone and makes no account request', async ({ page }) => {
  let accountRequests = 0;
  await page.route('http://127.0.0.1:8788/api/**', (route) => {
    accountRequests += 1;
    return route.abort();
  });
  await seedProfile(page, { town: 'Offline Claim', science: 4 });
  await page.addInitScript(() => {
    const snapshot = JSON.stringify(
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? '')
        .filter(Boolean)
        .map((key) => [key, localStorage.getItem(key)])
        .sort(),
    );
    (window as Window & { __GR_BEFORE_STORAGE__?: string }).__GR_BEFORE_STORAGE__ = snapshot;
  });
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  const after = await page.evaluate(() =>
    JSON.stringify(
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? '')
        .filter(Boolean)
        .map((key) => [key, localStorage.getItem(key)])
        .sort(),
    ),
  );
  const before = await page.evaluate(() => (window as Window & { __GR_BEFORE_STORAGE__?: string }).__GR_BEFORE_STORAGE__);

  expect(after).toBe(before);
  expect(accountRequests).toBe(0);
  assertNoErrors(errors);
});

async function signIn(page: Page, email: string): Promise<void> {
  await page.getByTestId('account-email').fill(email);
  await page.getByTestId('account-request-code').click();
  const code = (await page.getByTestId('account-dev-code').textContent())?.trim() ?? '';
  expect(code).toMatch(/^\d{6}$/);
  await page.getByTestId('account-code').fill(code);
  await page.getByTestId('account-verify').click();
  await expect(page.getByTestId('account-message')).not.toContainText('the wire');
}

async function seedProfile(page: Page, options: { town: string; science: number }): Promise<void> {
  await page.goto('/favicon-16.png');
  await page.evaluate(
    ({ profileKey, townKey, metaKey, suspendKey, town, science, suspend }) => {
      localStorage.clear();
      sessionStorage.clear();
      const profile = { id: 'robin', name: 'Robin', createdAt: 1, updatedAt: Date.now(), difficultyPreset: 'trail', hintsSeen: [] };
      const state = { version: 2, activeId: 'robin', profiles: [profile] };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(`${profileKey}.robin.${townKey}`, town);
      localStorage.setItem(`${profileKey}.robin.${metaKey}`, JSON.stringify({ version: 1, tracks: { territory: 3, science, hero: 0, agent: 0 } }));
      localStorage.setItem(`${profileKey}.robin.${suspendKey}`, JSON.stringify(suspend));
    },
    { profileKey: PROFILE_KEY, townKey: TOWN_NAME_KEY, metaKey: META_PROGRESS_KEY, suspendKey: RUN_SUSPEND_KEY, suspend: suspendFixture(), ...options },
  );
}

async function wipeProfileStoragePreservingAccount(page: Page): Promise<void> {
  await page.evaluate((accountKey) => {
    const session = localStorage.getItem(accountKey);
    localStorage.clear();
    sessionStorage.clear();
    if (session) localStorage.setItem(accountKey, session);
  }, ACCOUNT_KEY);
}

async function writeProfileDatum(page: Page, key: string, value: unknown): Promise<void> {
  await page.evaluate(
    ({ profileKey, key, value }) => {
      localStorage.setItem(`${profileKey}.robin.${key}`, typeof value === 'string' ? value : JSON.stringify(value));
    },
    { profileKey: PROFILE_KEY, key, value },
  );
}

async function readProfileDatum(page: Page, key: string): Promise<string | null> {
  return page.evaluate(({ profileKey, key }) => localStorage.getItem(`${profileKey}.robin.${key}`), { profileKey: PROFILE_KEY, key });
}

async function readScience(page: Page): Promise<number> {
  return page.evaluate(
    ({ profileKey, metaKey }) => JSON.parse(localStorage.getItem(`${profileKey}.robin.${metaKey}`) ?? '{}').tracks?.science ?? 0,
    { profileKey: PROFILE_KEY, metaKey: META_PROGRESS_KEY },
  );
}

function emailFor(testInfo: TestInfo, label: string): string {
  return `ac02-${testInfo.project.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${label}@example.com`;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

function suspendFixture(): unknown {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    v: 1,
    wave: 7,
    timeAlive: 70,
    writtenAt: 1,
    lastWriteMs: 0,
    sizeBytes: 0,
    trigger: 'wave-boundary',
    copy: 'The claim resumes at wave 7.',
    contractId: 'the-claim',
    seed: null,
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave: 7,
      pulse: 0,
      edge: null,
      budget: 0,
      waveSpawnedTotal: 0,
      nextTrickleAt: 0,
      nextWaveAt: 999,
      nextPlanWaveAt: 999,
      nextPlanWave: 8,
      plannedPulses: [],
      copyCursor: 0,
      lastCopy: '',
      currentAtSim: 70,
      waveState: 'quiet',
      lastPulseAt: null,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: {
      gold: 0,
      bankCap: 200,
      resources: { pressure: { amount: 0, cap: 100 } },
      log: [],
      summary: {},
    },
    hero: {
      level: 1,
      xpTotal: 0,
      spentXp: 0,
      xpInto: 0,
      pendingLevels: 0,
      offer: null,
      stacks: {},
      hp: 100,
      maxHp: 100,
      position: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    },
    buildings: [],
    counters: {
      kills: 0,
      stolenTotal: 0,
      reclaimedTotal: 0,
      buildingHitsResolved: 0,
      buildingsWrecked: 0,
      weapon: 'rig',
      weaponToggleCount: 0,
      blastTime: 0,
    },
    meta,
    research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null },
  };
}
