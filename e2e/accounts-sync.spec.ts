import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, RUN_SUSPEND_KEY, TOWN_NAME_KEY } from '../src/game/ProfileStorage';

const SHOT_DIR = 'artifacts/ac-02';
const ACCOUNT_KEY = 'gr.account.v1';
const ACCOUNTS_URL = process.env.GR_ACCOUNTS_WORKER_URL ?? 'http://127.0.0.1:8788';

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

test('late cloud profile index response cannot cross an account switch', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one async account-isolation proof is enough');
  await page.goto('/?profiles');
  const visibleProfiles = await page.evaluate(async () => {
    const { accountSync } = await import('../src/game/AccountSync');
    type FakeSession = {
      email: string;
      token: string;
      accountId: string;
      expiresAt: string;
      profileId?: string;
    };
    type FakeSummary = { profileId: string; profileName: string; savedAt: string };
    const sync = accountSync as unknown as {
      session: FakeSession | null;
      cloudProfiles: FakeSummary[];
      request: (...args: unknown[]) => Promise<unknown>;
      refreshCloudProfiles: () => Promise<void>;
    };
    const originalSession = sync.session;
    const originalProfiles = [...sync.cloudProfiles];
    const originalRequest = sync.request;
    const hadOwnRequest = Object.prototype.hasOwnProperty.call(sync, 'request');
    let releaseOldResponse!: () => void;
    const oldResponse = new Promise<Record<string, unknown>>((resolve) => {
      releaseOldResponse = () => resolve({
        ok: true,
        profiles: [{ profileId: 'old', profileName: 'Old Family', savedAt: '2026-07-10T00:00:00.000Z' }],
      });
    });

    try {
      sync.session = {
        email: 'old@example.com',
        token: 'old-token',
        accountId: 'old-account',
        expiresAt: '2099-01-01T00:00:00.000Z',
      };
      sync.cloudProfiles = [];
      sync.request = () => oldResponse;
      const pending = sync.refreshCloudProfiles();
      sync.session = {
        email: 'new@example.com',
        token: 'new-token',
        accountId: 'new-account',
        expiresAt: '2099-01-01T00:00:00.000Z',
      };
      sync.cloudProfiles = [{ profileId: 'new', profileName: 'New Family', savedAt: '2026-07-11T00:00:00.000Z' }];
      releaseOldResponse();
      await pending;
      return structuredClone(sync.cloudProfiles);
    } finally {
      sync.session = originalSession;
      sync.cloudProfiles = originalProfiles;
      if (hadOwnRequest) sync.request = originalRequest;
      else delete (sync as unknown as Record<string, unknown>).request;
    }
  });

  expect(visibleProfiles).toEqual([
    { profileId: 'new', profileName: 'New Family', savedAt: '2026-07-11T00:00:00.000Z' },
  ]);
});

test('fresh signed-in device restores two indexed cloud profiles', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'profile-index');
  await seedProfile(page, { town: 'Family Trail', science: 9 });
  const errors = collectErrors(page);
  await page.goto('/?profiles');
  await signIn(page, email);
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');
  const robinSavedAt = await page.evaluate((accountKey) => JSON.parse(localStorage.getItem(accountKey) ?? '{}').lastSavedAt as string, ACCOUNT_KEY);
  expect(robinSavedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  await page.waitForTimeout(10);

  await page.getByTestId('profile-name-input').fill('Scout');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Scout' })).toBeVisible();
  await writeActiveProfileDatum(page, TOWN_NAME_KEY, 'Scout Ridge');
  await writeActiveProfileDatum(page, META_PROGRESS_KEY, { version: 1, tracks: { territory: 2, science: 5, hero: 0, agent: 0 } });
  const scoutPushed = page.waitForResponse((response) => {
    const request = response.request();
    return request.url().includes('/api/save/push') && (request.postData() ?? '').includes('Scout Ridge');
  });
  await page.getByTestId('account-sync-now').click();
  const scoutResponse = await scoutPushed;
  expect(scoutResponse.status()).toBe(200);
  const scoutSavedAt = ((await scoutResponse.json()) as { savedAt: string }).savedAt;
  expect(scoutSavedAt).not.toBe(robinSavedAt);
  await page.getByTestId('account-sign-out').click();

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('/?profiles');
  await signIn(page, email);
  await expect(page.getByTestId('cloud-profile-option')).toHaveCount(2);

  await page.getByTestId('cloud-profile-option').filter({ hasText: 'Robin' }).click();
  await expect(page.getByTestId('account-compare-card')).toContainText('Family Trail');
  await page.getByTestId('account-use-cloud').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Robin' })).toBeVisible();
  await expect(page.getByTestId('cloud-profile-option')).toHaveCount(1);

  let keepLocalPushes = 0;
  await page.route(`${ACCOUNTS_URL}/api/save/push`, async (route) => {
    keepLocalPushes += 1;
    await route.continue();
  });
  await page.getByTestId('cloud-profile-option').filter({ hasText: 'Scout' }).click();
  await expect(page.getByTestId('account-compare-card')).toContainText('Scout Ridge');
  await page.getByTestId('account-keep-local').click();
  await expect(page.getByTestId('account-compare-card')).toHaveCount(0);
  await expect(page.getByTestId('account-message')).toContainText('Cloud ledger left untouched');
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Scout' })).toHaveCount(0);
  await expect(page.getByTestId('cloud-profile-option')).toHaveCount(1);
  await page.waitForTimeout(100);
  expect(keepLocalPushes).toBe(0);

  await page.getByTestId('cloud-profile-option').filter({ hasText: 'Scout' }).click();
  await page.getByTestId('account-use-cloud').click();
  await expect(page.getByTestId('profile-row')).toHaveCount(2);
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Scout' })).toBeVisible();
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('Family Trail');
  await expect(readProfileDatumFor(page, 'scout', TOWN_NAME_KEY)).resolves.toBe('Scout Ridge');

  await page.getByTestId('profile-row').filter({ hasText: 'Robin' }).click();
  const robinRepushed = page.waitForResponse((response) => {
    if (!response.request().url().includes('/api/save/push')) return false;
    return (response.request().postDataJSON() as { profileId?: string }).profileId === 'robin';
  });
  await page.getByTestId('account-sync-now').click();
  const robinRepushResponse = await robinRepushed;
  expect(robinRepushResponse.status()).toBe(200);
  expect((robinRepushResponse.request().postDataJSON() as { baseSavedAt?: string }).baseSavedAt).toBe(robinSavedAt);

  await page.getByTestId('profile-row').filter({ hasText: 'Scout' }).click();
  const scoutRepushed = page.waitForResponse((response) => {
    if (!response.request().url().includes('/api/save/push')) return false;
    return (response.request().postDataJSON() as { profileId?: string }).profileId === 'scout';
  });
  await page.getByTestId('account-sync-now').click();
  const scoutRepushResponse = await scoutRepushed;
  expect(scoutRepushResponse.status()).toBe(200);
  expect((scoutRepushResponse.request().postDataJSON() as { baseSavedAt?: string }).baseSavedAt).toBe(scoutSavedAt);
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

test('pagehide flushes a queued cloud push before debounce expires', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'exit-flush');
  await seedProfile(page, { town: 'Before Exit', science: 3 });
  const errors = collectErrors(page);
  await page.goto('/?profiles');
  await signIn(page, email);

  const pushed = page.waitForResponse((response) => {
    const request = response.request();
    return request.url().includes('/api/save/push') && (request.postData() ?? '').includes('Exit Flush');
  });
  await writeProfileDatum(page, TOWN_NAME_KEY, 'Exit Flush');
  await page.evaluate(() => {
    window.dispatchEvent(new Event('gr:profile-data-changed'));
    window.dispatchEvent(new Event('pagehide'));
  });
  expect((await pushed).status()).toBe(200);
  assertNoErrors(errors);
});

test('pagehide keeps an oversized cloud envelope local and carries its error across reload', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'oversized-local');
  await seedProfile(page, { town: 'Heavy Ledger', science: 3 });
  const errors = collectErrors(page);
  await page.goto('/?profiles');
  await signIn(page, email);

  let pushRequests = 0;
  await page.route(`${ACCOUNTS_URL}/api/save/push`, async (route) => {
    pushRequests += 1;
    await route.continue();
  });
  await page.evaluate(
    ({ profileKey, runKey }) => {
      const storageKey = `${profileKey}.robin.${runKey}`;
      const snapshot = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let noiseState = 0x51_07_2026;
      const noise = (length: number): string => {
        let value = '';
        for (let index = 0; index < length; index += 1) {
          noiseState = (Math.imul(noiseState, 1_664_525) + 1_013_904_223) >>> 0;
          value += alphabet[(noiseState >>> 26) & 63];
        }
        return value;
      };
      snapshot.economy.log = Array.from({ length: 5_000 }, (_, index) => ({
        id: `${index}-${noise(92)}`,
        at: index,
        type: 'gold_spent',
        sink: `repair_${noise(96)}`,
        amount: 0,
      }));
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    },
    { profileKey: PROFILE_KEY, runKey: RUN_SUSPEND_KEY },
  );
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));

  await expect(page.getByTestId('account-message')).toContainText("current run's save is too large to back up");
  expect(pushRequests).toBe(0);
  await page.reload();
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backup needs attention');
  await expect(page.getByTestId('account-message')).toContainText("current run's save is too large to back up");
  assertNoErrors(errors);
});

test('stale device opens compare instead of overwriting newer cloud save', async ({ page }, testInfo) => {
  const email = emailFor(testInfo, 'stale-device');
  await seedProfile(page, { town: 'Morning Claim', science: 2 });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await signIn(page, email);
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');
  const staleSession = await page.evaluate((accountKey) => localStorage.getItem(accountKey), ACCOUNT_KEY);
  expect(staleSession).toContain('lastSavedAt');

  await writeProfileDatum(page, TOWN_NAME_KEY, 'Evening Cloud');
  await writeProfileDatum(page, META_PROGRESS_KEY, { version: 1, tracks: { territory: 3, science: 9, hero: 0, agent: 0 } });
  const newerCloudPush = page.waitForResponse((response) => {
    const request = response.request();
    return request.url().includes('/api/save/push') && (request.postData() ?? '').includes('Evening Cloud');
  });
  await page.getByTestId('account-sync-now').click();
  expect((await newerCloudPush).status()).toBe(200);
  await expect(page.getByTestId('account-status-chip')).toContainText('ledger backed up');

  await page.goto('/favicon-16.png');
  await page.evaluate(
    ({ accountKey, profileKey, townKey, metaKey, staleSession }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(accountKey, staleSession!);
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: 'robin',
          profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Morning Claim');
      localStorage.setItem(`${profileKey}.robin.${metaKey}`, JSON.stringify({ version: 1, tracks: { territory: 3, science: 2, hero: 0, agent: 0 } }));
    },
    { accountKey: ACCOUNT_KEY, profileKey: PROFILE_KEY, townKey: TOWN_NAME_KEY, metaKey: META_PROGRESS_KEY, staleSession },
  );
  await page.goto('/?profiles');
  await page.getByTestId('account-sync-now').click();

  await expect(page.getByTestId('account-compare-card')).toContainText('Cloud has Evening Cloud at science 9');
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('Morning Claim');
  await expect(readScience(page)).resolves.toBe(2);

  await page.reload();
  await page.getByTestId('account-sync-now').click();
  await expect(page.getByTestId('account-compare-card')).toContainText('Cloud has Evening Cloud at science 9');
  await expect(readProfileDatum(page, TOWN_NAME_KEY)).resolves.toBe('Morning Claim');
  assertNoErrors(errors);
});

test('signed-out boot leaves non-suspend profile bytes alone and makes no account request', async ({ page }) => {
  let accountRequests = 0;
  await page.route(`${ACCOUNTS_URL}/api/**`, (route) => {
    accountRequests += 1;
    return route.abort();
  });
  await seedProfile(page, { town: 'Offline Claim', science: 4 });
  await page.addInitScript((runKey) => {
    const snapshot = JSON.stringify(
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? '')
        .filter((key) => Boolean(key) && key !== runKey && !key.endsWith(`.${runKey}`))
        .map((key) => [key, localStorage.getItem(key)])
        .sort(),
    );
    (window as Window & { __GR_BEFORE_STORAGE__?: string }).__GR_BEFORE_STORAGE__ = snapshot;
  }, RUN_SUSPEND_KEY);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  const after = await page.evaluate(
    (runKey) =>
      JSON.stringify(
        Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index) ?? '')
          .filter((key) => Boolean(key) && key !== runKey && !key.endsWith(`.${runKey}`))
          .map((key) => [key, localStorage.getItem(key)])
          .sort(),
      ),
    RUN_SUSPEND_KEY,
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

async function writeActiveProfileDatum(page: Page, key: string, value: unknown): Promise<void> {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)),
    { key, value },
  );
}

async function readProfileDatum(page: Page, key: string): Promise<string | null> {
  return page.evaluate(({ profileKey, key }) => localStorage.getItem(`${profileKey}.robin.${key}`), { profileKey: PROFILE_KEY, key });
}

async function readProfileDatumFor(page: Page, profileId: string, key: string): Promise<string | null> {
  return page.evaluate(
    ({ profileKey, profileId, key }) => localStorage.getItem(`${profileKey}.${profileId}.${key}`),
    { profileKey: PROFILE_KEY, profileId, key },
  );
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
      summary: {
        panned: 0,
        sluiced: 0,
        granted: 0,
        stolen: 0,
        reclaimed: 0,
        pannedByProspector: 0,
        sluicedByProspector: 0,
        reclaimedByProspector: 0,
        spent: 0,
        baseValue: 0,
        buildingsBuilt: 0,
        beaconsBuilt: 0,
        repairSpent: 0,
        repairs: 0,
      },
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
