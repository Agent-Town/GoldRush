import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import type { HeraldItem } from '../src/news/herald';

const ARTIFACT_DIR = path.resolve('artifacts/gazette-art-wiring');
const LIVE_CUTS = [
  ['Board Becomes a Catalog', 'board'],
  ["River Runs Past the Claim's Edge", 'river'],
  ['Schoolhouse Chart Redrawn', 'schoolhouse'],
  ['Claim Ledger Opens Its Pages', 'ledger'],
] as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedTown(page: Page, feed?: readonly HeraldItem[]): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, firstClaimKey, talesKey, items }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{
          id: 'robin',
          name: 'Robin',
          createdAt: 1,
          updatedAt: 1,
          difficultyPreset: 'trail',
          hintsSeen: ['story:town-growth-general-store', 'story:town-growth-chapel'],
        }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(firstClaimKey, '1');
      localStorage.setItem(talesKey, '0');
      if (items) window.__GR_HERALD_FEED__ = items;
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      firstClaimKey: FIRST_CLAIM_DONE_KEY,
      talesKey: STORY_TALES_STORAGE_KEY,
      items: feed,
    },
  );
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

async function openHerald(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => {
    const diagnostics = window.__GR_TOWN_DIAGNOSTICS__;
    return (diagnostics?.frame ?? 0) > 10 && diagnostics?.actors.some((actor) => actor.id === 'newsie' && actor.visible);
  });
  await approachNewsie(page);
  await page.getByTestId('town-open-herald').click();
  await expect(page.getByTestId('claim-herald')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('plain-boot Claim Herald shows the correct live cut for every item', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await seedTown(page);
  await openHerald(page);

  for (const [headline, heraldClass] of LIVE_CUTS) {
    const item = page.getByTestId('claim-herald-item').filter({ has: page.getByRole('heading', { name: headline }) });
    const image = item.getByTestId('claim-herald-engraving');
    await expect(image).toBeVisible();
    expect(await image.evaluate((node: HTMLImageElement) => node.src)).toContain(`herald-engraving-${heraldClass}`);
    await expect(image).toHaveAttribute('alt', '');
    await expect(image).toHaveAttribute('aria-hidden', 'true');
  }

  await shot(page, testInfo, 'live-cuts');
  expectNoErrors(errors);
});

test('unclassified items keep the original markup and render no image', async ({ page }) => {
  const errors = collectErrors(page);
  await seedTown(page, [{
    headline: 'Unclassified Notice',
    lines: ['The old markup stays put.'],
    date: '2026-07-10',
    hash: 'unclassified-notice',
  }]);
  await openHerald(page);

  const item = page.getByTestId('claim-herald-item');
  await expect(item.getByRole('img')).toHaveCount(0);
  expect(await item.innerHTML()).toBe(`
      <p class="claim-herald__date">July 10</p>
      <h3>Unclassified Notice</h3>
      <p>The old markup stays put.</p>
    `);
  expectNoErrors(errors);
});
