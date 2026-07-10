import { expect, test, type Page } from '@playwright/test';
import { Balance, DIFFICULTY_PRESET_STORAGE_KEY } from '../src/game/Balance';
import { type MetaProgress } from '../src/game/MetaProgress';
import {
  PROFILE_KEY,
  RUN_SUSPEND_KEY,
  SCOREBOARD_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test('two title profiles isolate meta, suspend slots, and Best Claims scores', async ({ page }) => {
  await resetStorage(page);
  const errors = collectErrors(page);
  await page.goto('/?debug&profiles&nowaves&nolevel&seed=profiles-isolation');

  await expect(page.getByTestId('profile-title')).toBeVisible();
  await createProfile(page, 'Alice');
  await createProfile(page, 'Bob');
  await seedProfileData(page);

  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await expect(page.locator('#gr-meta-debug')).toContainText('territory: 2');
  await expect(page.locator('#gr-meta-debug')).toContainText('hero: 0');
  expect(await page.evaluate(() => window.__GR_PROFILE__?.switchProfile('bob'))).toBe(false);
  expect(await page.evaluate(() => window.__GR_PROFILE__?.active().id)).toBe('alice');
  expect(await readJson<{ wave: number }>(page, profileDataKey('alice', RUN_SUSPEND_KEY))).toMatchObject({ wave: 4 });

  await page.reload();
  await expect(page.getByTestId('profile-title')).toBeVisible();
  await page.getByTestId('profile-row').filter({ hasText: 'Bob' }).click();
  await page.getByTestId('profile-start').click();
  await expect(page.locator('#gr-meta-debug')).toContainText('territory: 0');
  await expect(page.locator('#gr-meta-debug')).toContainText('hero: 1');

  await forceDeath(page);
  const board = (await page.getByTestId('best-claim-row').allTextContents()).join('\n');
  expect(board).toContain('Bob');
  expect(board).not.toContain('Alice');
  expect(board).not.toContain('30 waves');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('legacy single-profile scores migrate into Robin with difficulty and hints defaults', async ({ page }) => {
  await resetStorage(page);
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify([{ waves: 36, kills: 120, gold: 900, timeAlive: 1800, at: 36 }]));
  }, SCOREBOARD_KEY);
  const errors = collectErrors(page);
  await page.goto('/?debug&profiles&nowaves&nolevel&seed=profiles-migration');

  const state = await readJson<ProfileState>(page, PROFILE_KEY);
  expect(state.activeId).toBe('robin');
  expect(state.profiles[0]).toMatchObject({ name: 'Robin', difficultyPreset: 'trail', hintsSeen: [] });
  expect(await readJson<unknown[]>(page, profileDataKey('robin', SCOREBOARD_KEY))).toHaveLength(1);
  expect(await page.evaluate(() => window.__GR_PROFILE__?.markHintSeen('first-run'))).toBe(true);
  expect((await readJson<ProfileState>(page, PROFILE_KEY)).profiles[0]?.hintsSeen).toContain('first-run');

  await page.getByTestId('profile-start').click();
  await forceDeath(page);

  const first = page.getByTestId('best-claim-row').first();
  await expect(first).toContainText('36 waves');
  await expect(first).toContainText('Robin');

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('difficulty preset key follows the active profile', async ({ page }) => {
  await resetStorage(page);
  const errors = collectErrors(page);
  await page.goto('/?debug&profiles&nowaves&nolevel&seed=profiles-difficulty');
  await createProfile(page, 'Alice');
  await createProfile(page, 'Bob');

  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate((key) => window.__GR_TEST__?.setDifficultyPreset('greenhorn') && localStorage.getItem(key), DIFFICULTY_PRESET_STORAGE_KEY)).toBe(
    'greenhorn',
  );

  await page.reload();
  await page.getByTestId('profile-row').filter({ hasText: 'Bob' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset)).toBe('trail');
  expect(await page.evaluate((key) => window.__GR_TEST__?.setDifficultyPreset('vein-hunter') && localStorage.getItem(key), DIFFICULTY_PRESET_STORAGE_KEY)).toBe(
    'vein-hunter',
  );

  await page.reload();
  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.difficultyPreset)).toBe('greenhorn');
  expect(await page.evaluate(() => window.__GR_TEST__?.state().balance.xpPerKill)).toBe(4);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('running profile keeps its storage when another tab changes active profile', async ({ browser }) => {
  const context = await browser.newContext();
  const alicePage = await context.newPage();
  const bobPage = await context.newPage();
  await resetStorage(alicePage);
  const aliceErrors = collectErrors(alicePage);
  const bobErrors = collectErrors(bobPage);

  await alicePage.goto('/?debug&profiles&nowaves&nolevel&seed=profiles-tabs-a');
  await createProfile(alicePage, 'Alice');
  await createProfile(alicePage, 'Bob');
  await alicePage.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await alicePage.getByTestId('profile-start').click();
  await alicePage.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  await bobPage.goto('/?debug&profiles&nowaves&nolevel&seed=profiles-tabs-b');
  await expect(bobPage.getByTestId('profile-title')).toBeVisible();
  await setSharedActive(bobPage, 'bob');
  await setSharedActive(alicePage, 'bob');
  await expect.poll(() => bobPage.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}')?.activeId, PROFILE_KEY)).toBe('bob');
  expect(await alicePage.evaluate(() => window.__GR_PROFILE__?.markHintSeen('tab-bound-hint'))).toBe(true);

  const hintState = await readJson<ProfileState>(alicePage, PROFILE_KEY);
  expect(hintState.profiles.find((profile) => profile.id === 'alice')?.hintsSeen).toContain('tab-bound-hint');
  expect(hintState.profiles.find((profile) => profile.id === 'bob')?.hintsSeen).not.toContain('tab-bound-hint');

  const aliceMeta: MetaProgress = { version: 1, tracks: { territory: 7, science: 0, hero: 0, agent: 0 } };
  await alicePage.evaluate((meta) => localStorage.setItem('gr.meta.v1', JSON.stringify(meta)), aliceMeta);

  const scoped = await alicePage.evaluate(() => ({
    pageActive: window.__GR_PROFILE__?.active().id,
    sharedActive: JSON.parse(localStorage.getItem('gr.profile.v2') ?? '{}')?.activeId,
    alice: localStorage.getItem(window.__GR_PROFILE__!.storageKey('gr.meta.v1', 'alice')),
    bob: localStorage.getItem(window.__GR_PROFILE__!.storageKey('gr.meta.v1', 'bob')),
  }));
  expect(scoped.pageActive).toBe('alice');
  expect(scoped.sharedActive).toBe('bob');
  expect(JSON.parse(scoped.alice ?? 'null')).toEqual(aliceMeta);
  expect(scoped.bob).not.toBe(JSON.stringify(aliceMeta));
  expect(aliceErrors.consoleErrors).toEqual([]);
  expect(aliceErrors.pageErrors).toEqual([]);
  expect(bobErrors.consoleErrors).toEqual([]);
  expect(bobErrors.pageErrors).toEqual([]);
  await context.close();
});

async function resetStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (sessionStorage.getItem('__gr_profiles_reset_done__')) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('__gr_profiles_reset_done__', '1');
  });
}

async function createProfile(page: Page, name: string): Promise<void> {
  await page.getByTestId('profile-name-input').fill(name);
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: name })).toBeVisible();
}

async function seedProfileData(page: Page): Promise<void> {
  const aliceMeta: MetaProgress = { version: 1, tracks: { territory: 2, science: 0, hero: 0, agent: 0 } };
  const bobMeta: MetaProgress = { version: 1, tracks: { territory: 0, science: 0, hero: 1, agent: 0 } };
  await page.evaluate(
    ({ aliceMeta, bobMeta, aliceSlot, bobSlot, scoreKey }) => {
      localStorage.setItem(window.__GR_PROFILE__!.storageKey('gr.meta.v1', 'alice'), JSON.stringify(aliceMeta));
      localStorage.setItem(window.__GR_PROFILE__!.storageKey('gr.meta.v1', 'bob'), JSON.stringify(bobMeta));
      localStorage.setItem(window.__GR_PROFILE__!.storageKey('gr.run.v1', 'alice'), JSON.stringify(aliceSlot));
      localStorage.setItem(window.__GR_PROFILE__!.storageKey('gr.run.v1', 'bob'), JSON.stringify(bobSlot));
      localStorage.setItem(
        window.__GR_PROFILE__!.storageKey(scoreKey, 'alice'),
        JSON.stringify([{ waves: 30, kills: 50, gold: 200, timeAlive: 500, at: 1, profileName: 'Alice' }]),
      );
      localStorage.setItem(
        window.__GR_PROFILE__!.storageKey(scoreKey, 'bob'),
        JSON.stringify([{ waves: 6, kills: 10, gold: 40, timeAlive: 90, at: 2, profileName: 'Bob' }]),
      );
    },
    { aliceMeta, bobMeta, aliceSlot: suspendFixture(4, aliceMeta), bobSlot: suspendFixture(8, bobMeta), scoreKey: SCOREBOARD_KEY },
  );
}

function suspendFixture(wave: number, meta: MetaProgress): unknown {
  const timeAlive = wave * Balance.waves.waveInterval;
  return {
    v: 1,
    wave,
    timeAlive,
    contractId: 'the-claim',
    rng: { waves: null, upgrades: null },
    waveSystem: {
      wave,
      pulse: 0,
      edge: null,
      budget: 0,
      waveSpawnedTotal: 0,
      nextTrickleAt: timeAlive + Balance.waves.trickleInterval,
      nextWaveAt: timeAlive + Balance.waves.waveInterval,
      nextPlanWaveAt: timeAlive + Balance.waves.waveInterval,
      nextPlanWave: wave + 1,
      plannedPulses: [],
      copyCursor: 0,
      currentAtSim: timeAlive,
      waveState: 'quiet',
      lastPulseAt: null,
    },
    enemies: { spawnSerial: 0, active: [] },
    economy: { gold: 0, bankCap: Balance.economy.bankCap, log: [] },
    hero: {
      level: 1,
      xpTotal: 0,
      spentXp: 0,
      xpInto: 0,
      pendingLevels: 0,
      offer: null,
      stacks: {},
      hp: Balance.hero.maxHp,
      maxHp: Balance.hero.maxHp,
      position: { x: 0, y: 0.06, z: 12 },
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

async function forceDeath(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    for (let pack = 0; pack < 6; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.4);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
  await expect(page.getByTestId('death-overlay')).toBeVisible();
}

async function readJson<T>(page: Page, key: string): Promise<T> {
  const raw = await page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
  return JSON.parse(raw ?? 'null') as T;
}

async function setSharedActive(page: Page, profileId: string): Promise<void> {
  await page.evaluate(
    ({ profileKey, profileId }) => {
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
      state.activeId = profileId;
      localStorage.setItem(profileKey, JSON.stringify(state));
    },
    { profileKey: PROFILE_KEY, profileId },
  );
}

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}
