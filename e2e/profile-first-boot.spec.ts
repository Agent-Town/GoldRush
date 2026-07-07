import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  PROFILE_KEY,
  RUN_SUSPEND_KEY,
  TOWN_NAME_KEY,
  type ProfileState,
} from '../src/game/ProfileStorage';

const SHOT_DIR = 'artifacts/profile-first-boot';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('cleared-storage boot asks who is prospecting and creates no Robin ghost', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('profile-title')).toContainText("Who's prospecting?");
  await expect(page.getByTestId('start-menu-new-claim')).toHaveCount(0);
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('start-menu-new-claim')).toBeVisible();

  const state = await readProfileState(page);
  expect(state.activeId).toBe('mina');
  expect(state.profiles.map((profile) => profile.name)).toEqual(['Mina']);
  expect(state.profiles.some((profile) => profile.name === 'Robin')).toBe(false);
  await shot(page, testInfo, 'first-boot-created');
  assertNoErrors(errors);
});

test('existing profile state boots straight to the menu', async ({ page }, testInfo) => {
  await seedProfile(page, 'robin', 'Robin');
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('profile-title')).toHaveCount(0);
  await page.getByTestId('start-menu-profile').click();
  await expect(page.getByText('Saves live in this browser. Pack the ledger to keep or move them.')).toBeVisible();
  await shot(page, testInfo, 'existing-state-profiles');
  assertNoErrors(errors);
});

test('pack the ledger downloads human-readable active profile data', async ({ page }) => {
  await seedProfile(page, 'robin', 'Robin');
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('profile-export').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^goldrush-robin-\d{4}-\d{2}-\d{2}\.json$/);
  const path = await download.path();
  expect(path).not.toBeNull();
  const packed = JSON.parse(await readFile(path!, 'utf8'));

  expect(packed).toMatchObject({ kind: 'goldrush.profile.ledger', version: 1, profile: { id: 'robin', name: 'Robin' } });
  expect(packed.data[TOWN_NAME_KEY]).toBe('Quartz Hill');
  expect(packed.data[META_PROGRESS_KEY].tracks).toMatchObject({ science: 6, territory: 3 });
  expect(packed.data[RUN_SUSPEND_KEY]).toMatchObject({ v: 1, wave: 7 });
  assertNoErrors(errors);
});

test('unpack a ledger previews, imports as a new profile, and suffixes collisions', async ({ page }, testInfo) => {
  await seedProfile(page, 'robin', 'Robin');
  const file = testInfo.outputPath('robin-ledger.json');
  await writeFile(file, `${JSON.stringify(ledgerFixture('Robin'), null, 2)}\n`);
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  await page.getByTestId('profile-import-file').setInputFiles(file);
  await expect(page.getByTestId('profile-import-confirm')).toContainText("Robin - town 'Aurora Bend', science 6, territory III");
  await page.getByTestId('profile-import-apply').click();

  const imported = await page.evaluate(
    ({ profileKey, metaKey, townKey }) => {
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
      const profile = state.profiles.find((entry) => entry.name === 'Robin (2)')!;
      return {
        activeId: state.activeId,
        profile,
        meta: JSON.parse(localStorage.getItem(`${profileKey}.${profile.id}.${metaKey}`) ?? '{}'),
        town: localStorage.getItem(`${profileKey}.${profile.id}.${townKey}`),
      };
    },
    { profileKey: PROFILE_KEY, metaKey: META_PROGRESS_KEY, townKey: TOWN_NAME_KEY },
  );
  expect(imported.activeId).toBe(imported.profile.id);
  expect(imported.meta.tracks).toMatchObject({ science: 6, territory: 3 });
  expect(imported.town).toBe('Aurora Bend');
  await shot(page, testInfo, 'imported-collision');
  assertNoErrors(errors);
});

test('malformed ledgers are rejected warmly and the picker fits at 390px', async ({ page }, testInfo) => {
  await seedProfile(page, 'robin', 'Robin');
  await page.setViewportSize({ width: 390, height: 844 });
  const file = testInfo.outputPath('bad-ledger.json');
  await writeFile(file, 'not json');
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();

  await page.getByTestId('profile-import-file').setInputFiles(file);
  await expect(page.getByTestId('profile-message')).toContainText('That ledger is torn');
  const box = await page.getByTestId('profile-import-file').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await shot(page, testInfo, 'mobile-import-reject');
  assertNoErrors(errors);
});

async function seedProfile(page: Page, id: string, name: string): Promise<void> {
  await page.addInitScript(
    ({ profileKey, metaKey, townKey, suspendKey, suspend, id, name }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          version: 2,
          activeId: id,
          profiles: [{ id, name, createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
        }),
      );
      localStorage.setItem(`${profileKey}.${id}.${townKey}`, 'Quartz Hill');
      localStorage.setItem(`${profileKey}.${id}.${metaKey}`, JSON.stringify({ version: 1, tracks: { territory: 3, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(`${profileKey}.${id}.${suspendKey}`, JSON.stringify(suspend));
    },
    { profileKey: PROFILE_KEY, metaKey: META_PROGRESS_KEY, townKey: TOWN_NAME_KEY, suspendKey: RUN_SUSPEND_KEY, suspend: suspendFixture(), id, name },
  );
}

async function readProfileState(page: Page): Promise<ProfileState> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState, PROFILE_KEY);
}

function ledgerFixture(name: string): unknown {
  return {
    kind: 'goldrush.profile.ledger',
    version: 1,
    exportedAt: '2026-07-07T00:00:00.000Z',
    profile: { id: 'robin', name, createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
    data: {
      [TOWN_NAME_KEY]: 'Aurora Bend',
      [META_PROGRESS_KEY]: { version: 1, tracks: { territory: 3, science: 6, hero: 0, agent: 0 } },
      [RUN_SUSPEND_KEY]: suspendFixture(),
    },
  };
}

function suspendFixture(): unknown {
  return {
    v: 1,
    wave: 7,
    timeAlive: 70,
    contractId: 'the-claim',
    economy: {},
    hero: {},
    buildings: [],
    waveSystem: {},
    enemies: { active: [] },
    meta: {},
    research: {},
  };
}
