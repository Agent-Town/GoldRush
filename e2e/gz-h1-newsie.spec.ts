import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fixtureFeed from './fixtures/herald-feed.json' with { type: 'json' };
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import type { HeraldItem } from '../src/news/herald';

const ARTIFACT_DIR = path.resolve('artifacts/gz-h1-newsie');
const PROFILE_ID = 'robin';
const FORBIDDEN_HERALD_PATTERNS = [/\b\d{3}\b/, /\b[A-Z]{2,}-\d+\b/, /\bshipped\b/i, /\brepo\b/i, /\btoken\b/i, /\bbackend\b/i];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TownDiagnostics = NonNullable<Window['__GR_TOWN_DIAGNOSTICS__']>;

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedTown(page: Page, feed: readonly HeraldItem[]): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, firstClaimKey, talesKey, items }) => {
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
            hintsSeen: ['story:town-growth-general-store', 'story:town-growth-chapel'],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(firstClaimKey, '1');
      localStorage.setItem(talesKey, '0');
      window.__GR_HERALD_FEED__ = items;
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
      metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
      firstClaimKey: FIRST_CLAIM_DONE_KEY,
      talesKey: STORY_TALES_STORAGE_KEY,
      items: feed,
    },
  );
}

async function openTown(page: Page): Promise<TownDiagnostics> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => {
    const diagnostics = window.__GR_TOWN_DIAGNOSTICS__;
    return (diagnostics?.frame ?? 0) > 10 && diagnostics?.actors.some((actor) => actor.id === 'newsie' && actor.visible);
  });
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
}

async function approachNewsie(page: Page): Promise<void> {
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId)) === 'newsie') break;
    const positions = await page.evaluate(() => {
      const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
      return { player: diagnostics.player, target: diagnostics.actors.find(({ id }) => id === 'newsie')?.position };
    });
    if (!positions.target) throw new Error('newsie is absent from town actor diagnostics');
    const keys: string[] = [];
    if (Math.abs(positions.target.x - positions.player.x) > 0.6) keys.push(positions.target.x > positions.player.x ? 'KeyD' : 'KeyA');
    if (Math.abs(positions.target.z - positions.player.z) > 0.6) keys.push(positions.target.z > positions.player.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null), { timeout: 8_000 }).toBe('newsie');
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function expectNoInternalHeraldText(page: Page): Promise<void> {
  const text = await page.getByTestId('claim-herald').innerText();
  for (const pattern of FORBIDDEN_HERALD_PATTERNS) expect(text).not.toMatch(pattern);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('newsie barks latest headline and opens the Claim Herald', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedTown(page, fixtureFeed);
  const diagnostics = await openTown(page);
  const newsie = diagnostics.actors.find((actor) => actor.id === 'newsie');
  expect(newsie).toMatchObject({ visible: true, anchor: 'tavern', assetSlot: 'char.town.youngster_a' });

  await approachNewsie(page);
  await expect(page.getByTestId('town-bark-speaker')).toHaveText('Pip Quick');
  await expect(page.getByTestId('town-bark-text')).toContainText(`EXTRA! ${fixtureFeed[0].headline}`);
  await shot(page, testInfo, 'newsie-plaza');

  await page.getByTestId('town-open-herald').click();
  await expect(page.getByTestId('claim-herald')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'THE CLAIM HERALD' })).toBeVisible();
  await expect(page.getByTestId('claim-herald-item')).toHaveCount(4);
  await expect(page.getByTestId('claim-herald')).toContainText(fixtureFeed[0].lines[0]);
  await expectNoInternalHeraldText(page);
  await shot(page, testInfo, 'herald-open');
  assertNoErrors(errors);
});

test('empty Herald feed shows the quiet line', async ({ page }) => {
  const errors = collectErrors(page);
  await seedTown(page, []);
  await openTown(page);
  await approachNewsie(page);
  await expect(page.getByTestId('town-bark-text')).toContainText('EXTRA! No fresh ink today.');
  await page.getByTestId('town-open-herald').click();
  await expect(page.getByTestId('claim-herald-empty')).toHaveText('No fresh ink today.');
  await expect(page.getByTestId('claim-herald-item')).toHaveCount(0);
  assertNoErrors(errors);
});
