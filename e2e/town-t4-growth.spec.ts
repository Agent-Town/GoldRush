import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { MEGAPROJECT_STATE_KEY, type MegaprojectProjectState } from '../src/meta/Megaproject';

const ARTIFACT_DIR = path.resolve('artifacts/town-t4');
const GROWTH_BEATS_SEEN = ['story:town-growth-general-store', 'story:town-growth-chapel'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type SeedState = {
  territory?: number;
  science?: number;
  townName?: string;
  hintsSeen?: string[];
  stampMill?: Partial<MegaprojectProjectState>;
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedStorage(page: Page, seed: SeedState = {}): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ profileKey, townKey, metaKey, megaprojectKey, seedState }) => {
      localStorage.clear();
      sessionStorage.clear();
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
            hintsSeen: seedState.hintsSeen ?? [],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      if (seedState.townName) localStorage.setItem(townKey, seedState.townName);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: seedState.territory ?? 0, science: seedState.science ?? 0, hero: 0, agent: 0 },
        }),
      );
      if (seedState.stampMill) {
        localStorage.setItem(
          megaprojectKey,
          JSON.stringify({
            version: 1,
            projects: {
              'stamp-mill': {
                stage: seedState.stampMill.stage ?? 0,
                funded: seedState.stampMill.funded === true,
                ticksRemaining: seedState.stampMill.ticksRemaining ?? (seedState.stampMill.funded ? 1 : 0),
                hp: seedState.stampMill.hp ?? 120,
                delayTicks: seedState.stampMill.delayTicks ?? 0,
                defenseWave: seedState.stampMill.defenseWave ?? 0,
              },
            },
          }),
        );
      }
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      megaprojectKey: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
      seedState: seed,
    },
  );
  await page.reload();
}

async function openTown(page: Page): Promise<NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  return townDiagnostics(page);
}

async function townDiagnostics(page: Page): Promise<NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>> {
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function moveToSouthSquare(page: Page): Promise<void> {
  await hold(page, 'KeyS', 1_250);
  await page.waitForTimeout(250);
}

async function moveToStampMillView(page: Page): Promise<void> {
  await hold(page, 'KeyA', 650);
  await hold(page, 'KeyS', 4_500);
  await page.waitForTimeout(250);
}

async function expectBeat(page: Page, id: string, text: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).toHaveAttribute('data-beat-id', id);
  await expect(card).toContainText(text);
}

async function dismissBeat(page: Page): Promise<void> {
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

function building(
  diagnostics: NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>,
  id: 'general_store' | 'chapel',
) {
  const entry = diagnostics.buildings.find((item) => item.id === id);
  if (!entry) throw new Error(`Missing town building diagnostic: ${id}`);
  return entry;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('fresh and seeded territory tiers render only earned town buildings', async ({ page }, testInfo) => {
  const errors = collectErrors(page);

  await seedStorage(page);
  let diagnostics = await openTown(page);
  expect(building(diagnostics, 'general_store').visible).toBe(false);
  expect(building(diagnostics, 'chapel').visible).toBe(false);
  await expect(page.getByTestId('town-name-card')).toBeVisible();

  await seedStorage(page, { territory: 0, townName: 'Quartz Hill' });
  diagnostics = await openTown(page);
  expect(building(diagnostics, 'general_store').visible).toBe(false);
  expect(building(diagnostics, 'chapel').visible).toBe(false);
  await shot(page, testInfo, 'bare-square');

  await seedStorage(page, { territory: 2, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  diagnostics = await openTown(page);
  expect(building(diagnostics, 'general_store')).toMatchObject({
    visible: true,
    territoryRequired: 2,
    barkSlot: 'storekeeper-porch',
  });
  expect(building(diagnostics, 'chapel').visible).toBe(false);

  await seedStorage(page, { territory: 3, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  diagnostics = await openTown(page);
  expect(building(diagnostics, 'general_store').visible).toBe(true);
  expect(building(diagnostics, 'chapel')).toMatchObject({
    visible: true,
    territoryRequired: 3,
    barkSlot: 'preacher-porch',
  });
  await moveToSouthSquare(page);
  await shot(page, testInfo, 'grown-square');
  assertNoErrors(errors);
});

test('Stamp Mill town vignette mirrors megaproject stage state', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const cases = [
    {
      name: 'survey',
      stampMill: { stage: 0, funded: false },
      expect: { surveyVisible: true, constructionProps: 0, plaque: 'surveyed for the town', visibleStages: 1, complete: false },
    },
    {
      name: 'boilers',
      stampMill: { stage: 1, funded: false },
      expect: { surveyVisible: false, constructionProps: 3, plaque: 'boilers are seated', visibleStages: 1, complete: false },
    },
    {
      name: 'mill-rising',
      stampMill: { stage: 2, funded: true, ticksRemaining: 2 },
      expect: { surveyVisible: false, constructionProps: 3, plaque: 'stamps are set', visibleStages: 3, complete: false },
      shot: true,
    },
    {
      name: 'complete',
      stampMill: { stage: 3, funded: false },
      expect: { surveyVisible: false, constructionProps: 0, plaque: 'awaits the whistle', visibleStages: 3, complete: true },
    },
  ] as const;

  for (const entry of cases) {
    await seedStorage(page, {
      territory: 3,
      science: 6,
      townName: 'Quartz Hill',
      hintsSeen: GROWTH_BEATS_SEEN,
      stampMill: entry.stampMill,
    });
    const diagnostics = await openTown(page);
    expect(diagnostics.stampMill.visible).toBe(true);
    expect(diagnostics.stampMill.stage).toBe(entry.stampMill.stage);
    expect(diagnostics.stampMill.totalStages).toBe(3);
    expect(diagnostics.stampMill.surveyVisible).toBe(entry.expect.surveyVisible);
    expect(diagnostics.stampMill.constructionProps).toBe(entry.expect.constructionProps);
    expect(diagnostics.stampMill.visibleStages).toHaveLength(entry.expect.visibleStages);
    expect(diagnostics.stampMill.complete).toBe(entry.expect.complete);
    expect(diagnostics.stampMill.plaque).toContain(entry.expect.plaque);
    if ('shot' in entry) {
      await moveToStampMillView(page);
      await shot(page, testInfo, entry.name);
    }
  }
  assertNoErrors(errors);
});

test('growth beats fire once per profile', async ({ page }) => {
  const errors = collectErrors(page);
  await seedStorage(page, { territory: 3, townName: 'Quartz Hill' });
  await openTown(page);

  await expectBeat(page, 'town-growth-general-store', "Tuesday's wagon");
  await dismissBeat(page);
  await expectBeat(page, 'town-growth-chapel', 'Chapel bell');
  await dismissBeat(page);

  await page.reload();
  await openTown(page);
  await page.waitForTimeout(700);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  assertNoErrors(errors);
});

test('grown town remains readable at 390px', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStorage(page, {
    territory: 3,
    science: 6,
    townName: 'Quartz Hill',
    hintsSeen: GROWTH_BEATS_SEEN,
    stampMill: { stage: 2, funded: true, ticksRemaining: 2 },
  });
  const diagnostics = await openTown(page);

  expect(building(diagnostics, 'general_store').visible).toBe(true);
  expect(building(diagnostics, 'chapel').visible).toBe(true);
  expect(diagnostics.stampMill.visible).toBe(true);
  await expect(page.getByTestId('town-exit')).toBeVisible();
  await shot(page, testInfo, 'mobile-390');
  assertNoErrors(errors);
});
