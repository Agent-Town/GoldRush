import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { TOWN_ACTORS, townActorBark, type TownActorId } from '../src/town/townsfolk';

const ARTIFACT_DIR = path.resolve('artifacts/town-t5');
const CONCEPT_PATH = path.resolve('assets/raw/concept-town-square.png');
const PROFILE_ID = 'robin';
const GROWTH_BEATS_SEEN = ['story:town-growth-general-store', 'story:town-growth-chapel'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Box = { x: number; y: number; width: number; height: number };
type SeedState = {
  territory?: number;
  townName?: string;
  hintsSeen?: string[];
};
type TownDiagnostics = NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>;

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
    ({ profileKey, townKey, metaKey, seedState }) => {
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
          tracks: { territory: seedState.territory ?? 0, science: 0, hero: 0, agent: 0 },
        }),
      );
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
      seedState: seed,
    },
  );
  await page.reload();
}

async function openTown(page: Page): Promise<TownDiagnostics> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => {
    const diagnostics = window.__GR_TOWN_DIAGNOSTICS__;
    return (diagnostics?.frame ?? 0) > 10 && Array.isArray(diagnostics?.actors);
  });
  return townDiagnostics(page);
}

async function townDiagnostics(page: Page): Promise<TownDiagnostics> {
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
}

async function waitForVisibleActorArt(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const actors = window.__GR_TOWN_DIAGNOSTICS__?.actors?.filter((actor) => actor.visible) ?? [];
          return actors.length > 0 && actors.every((actor) => actor.loaded);
        }),
      { timeout: 10_000 },
    )
    .toBe(true);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function expectBark(page: Page, actorId: TownActorId, speaker: string, textIncludes?: string): Promise<void> {
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null), { timeout: 8_000 }).toBe(actorId);
  const bark = page.getByTestId('town-bark-card');
  await expect(bark).toBeVisible();
  await expect(bark).toHaveAttribute('data-actor-id', actorId);
  await expect(page.getByTestId('town-bark-speaker')).toHaveText(speaker);
  if (textIncludes) await expect(page.getByTestId('town-bark-text')).toContainText(textIncludes);
}

async function shot(page: Page, testInfo: TestInfo, name: string, options: { fullPage?: boolean } = {}): Promise<string> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  const filePath = path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`);
  await page.screenshot({ path: filePath, fullPage: options.fullPage ?? false });
  return filePath;
}

async function renderConceptComparison(page: Page, testInfo: TestInfo, squarePath: string): Promise<void> {
  const [square, concept] = await Promise.all([readFile(squarePath), readFile(CONCEPT_PATH)]);
  await page.setViewportSize({ width: 780, height: 844 });
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <style>
          body { margin: 0; background: #2e1b0e; font: 16px Georgia, serif; color: #fff8e8; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; box-sizing: border-box; height: 100vh; }
          figure { display: grid; grid-template-rows: auto 1fr; gap: 6px; margin: 0; min-width: 0; }
          figcaption { font-weight: 700; line-height: 1; }
          img { width: 100%; height: 100%; object-fit: contain; background: #e8d5a8; }
        </style>
      </head>
      <body>
        <div class="grid">
          <figure><figcaption>390px peopled square</figcaption><img src="data:image/png;base64,${square.toString('base64')}" /></figure>
          <figure><figcaption>Concept plate</figcaption><img src="data:image/png;base64,${concept.toString('base64')}" /></figure>
        </div>
      </body>
    </html>
  `);
  await shot(page, testInfo, 'mobile-390-side-by-side', { fullPage: true });
}

function actor(diagnostics: TownDiagnostics, id: TownActorId): TownDiagnostics['actors'][number] {
  const entry = diagnostics.actors.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`Missing town actor diagnostic: ${id}`);
  return entry;
}

function visibleActorIds(diagnostics: TownDiagnostics): TownActorId[] {
  return diagnostics.actors.filter((entry) => entry.visible).map((entry) => entry.id);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('townsfolk bark data is epoch-scoped and short', () => {
  for (const actorDef of TOWN_ACTORS) {
    expect(actorDef.e1Barks.length).toBeGreaterThanOrEqual(2);
    expect(actorDef.e1Barks.length).toBeLessThanOrEqual(3);
    for (let index = 0; index < actorDef.e1Barks.length; index += 1) {
      expect(townActorBark(actorDef, 'Quartz Canyon Fork', index).length).toBeLessThanOrEqual(90);
    }
  }
});

test('seeded growth tiers show the correct townsfolk roster with no run sim diagnostics', async ({ page }) => {
  const errors = collectErrors(page);

  await seedStorage(page, { territory: 0, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  let diagnostics = await openTown(page);
  expect(visibleActorIds(diagnostics).sort()).toEqual([
    'assay_clerk',
    'elder',
    'newsie',
    'prospector',
    'schoolteacher',
    'tavernkeeper',
    'youngster_a',
    'youngster_b',
  ]);
  expect(actor(diagnostics, 'storekeeper').visible).toBe(false);
  expect(actor(diagnostics, 'preacher').visible).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__ ?? null)).toBeNull();
  await waitForVisibleActorArt(page);

  await seedStorage(page, { territory: 2, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  diagnostics = await openTown(page);
  expect(actor(diagnostics, 'storekeeper')).toMatchObject({ visible: true, anchor: 'general_store' });
  expect(actor(diagnostics, 'preacher').visible).toBe(false);

  await seedStorage(page, { territory: 3, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  diagnostics = await openTown(page);
  expect(actor(diagnostics, 'storekeeper').visible).toBe(true);
  expect(actor(diagnostics, 'preacher')).toMatchObject({ visible: true, anchor: 'chapel' });
  expect(actor(diagnostics, 'prospector')).toMatchObject({ visible: true, anchor: 'claim_office' });
  assertNoErrors(errors);
});

test('approach barks identify sampled speakers and the Prospector greets by town name', async ({ page }) => {
  const errors = collectErrors(page);
  await seedStorage(page, { territory: 3, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  await openTown(page);
  await waitForVisibleActorArt(page);

  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expectBark(page, 'tavernkeeper', 'Marta Vale');

  await hold(page, 'KeyD', 2_050);
  await hold(page, 'KeyS', 300);
  await expectBark(page, 'prospector', 'The Prospector', 'Quartz Hill');

  await hold(page, 'KeyA', 2_350);
  await hold(page, 'KeyS', 1_250);
  await expectBark(page, 'elder', 'Elder Rowan');
  assertNoErrors(errors);
});

test('youngsters ride the town ring road', async ({ page }) => {
  const errors = collectErrors(page);
  await seedStorage(page, { territory: 3, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  await openTown(page);
  const before = await townDiagnostics(page);
  await page.waitForTimeout(3_500);
  const after = await townDiagnostics(page);

  for (const id of ['youngster_a', 'youngster_b'] as const) {
    const start = actor(before, id).position;
    const end = actor(after, id).position;
    expect(Math.hypot(end.x - start.x, end.z - start.z)).toBeGreaterThan(0.25);
    expect(Math.hypot(end.x, end.z)).toBeGreaterThanOrEqual(5.8);
    expect(Math.hypot(end.x, end.z)).toBeLessThanOrEqual(6.05);
  }
  assertNoErrors(errors);
});

test('mobile bark card is readable above the stick zone and captures concept comparison', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStorage(page, { territory: 3, townName: 'Quartz Hill', hintsSeen: GROWTH_BEATS_SEEN });
  await openTown(page);
  await waitForVisibleActorArt(page);

  await hold(page, 'KeyD', 1_300);
  await hold(page, 'KeyW', 650);
  await expectBark(page, 'prospector', 'The Prospector', 'Quartz Hill');
  const barkBox = await page.getByTestId('town-bark-card').boundingBox();
  const stickBox = await page.locator('#touch-stick').boundingBox();
  expect(barkBox).toBeTruthy();
  expect(stickBox).toBeTruthy();
  expect(boxesOverlap(barkBox!, stickBox!)).toBe(false);
  expect(barkBox!.width).toBeLessThanOrEqual(358);
  const squarePath = await shot(page, testInfo, 'mobile-390-peopled-square', { fullPage: true });
  await renderConceptComparison(page, testInfo, squarePath);
  assertNoErrors(errors);
});

function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
