import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';
import { HERALD_FRESHNESS_DAYS, type HeraldItem } from '../src/news/herald';

const ARTIFACT_DIR = path.resolve('artifacts/herald-class-map');
const LIVE_CUTS = [
  ['Board Becomes a Catalog', 'board'],
  ["River Runs Past the Claim's Edge", 'river'],
  ['Schoolhouse Chart Redrawn', 'schoolhouse'],
  ['Claim Ledger Opens Its Pages', 'ledger'],
] as const;

// Owner ruling 2026-08-09 ("the local news are from July 10th... better left out for now"), landed
// by gazette-unique: the live feed retires items older than HERALD_FRESHNESS_DAYS, so these four
// dated 2026-07-10 items no longer print on a plain boot. This spec's subject is the ENGRAVING
// CLASS MAP, not the feed's freshness, so it supplies those same items VERBATIM from news/herald.json
// as a dated snapshot — the override path treats a fixture's newest item as its own clock, exactly
// as the unclassified-markup test below already relies on. Coverage of the class map is unchanged;
// only the delivery of the items moved. F-1589-1, s1589 drain.
async function liveCutFeed(): Promise<HeraldItem[]> {
  const items = JSON.parse(await readFile(path.resolve('news/herald.json'), 'utf8')) as HeraldItem[];
  const wanted = new Set<string>(LIVE_CUTS.map(([headline]) => headline));
  const feed = items.filter(({ headline }) => wanted.has(headline));
  expect(feed, 'news/herald.json no longer carries the four classified cuts').toHaveLength(LIVE_CUTS.length);
  return feed;
}

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
  await seedTown(page, await liveCutFeed());
  await openHerald(page);

  for (const [headline, heraldClass] of LIVE_CUTS) {
    const item = page.getByTestId('claim-herald-item').filter({ has: page.getByRole('heading', { name: headline }) });
    const image = item.getByTestId('claim-herald-engraving');
    await expect(image).toBeVisible();
    expect(await image.evaluate((node: HTMLImageElement) => node.src)).toContain(`herald-engraving-${heraldClass}`);
    await image.evaluate((node: HTMLImageElement) => node.decode());
    const naturalSize = await image.evaluate((node: HTMLImageElement) => ({ width: node.naturalWidth, height: node.naturalHeight }));
    expect(naturalSize.width).toBeGreaterThan(0);
    expect(naturalSize.height).toBeGreaterThan(0);
    await expect(image).toHaveAttribute('alt', '');
    await expect(image).toHaveAttribute('aria-hidden', 'true');
  }

  await page.getByRole('heading', { name: LIVE_CUTS[0][0] }).scrollIntoViewIfNeeded();
  await shot(page, testInfo, 'live-cuts');
  expectNoErrors(errors);
});

// Mistake #10 ("where does the PLAYER see this, in a plain boot?"). The matrix above now runs off a
// dated snapshot, so this keeps one assertion on the UNSEEDED feed: whatever survives the freshness
// window must still print its engraving to a player who just walks up to the newsie. It asserts the
// class map through whichever item is currently fresh rather than naming one, so it does not rot as
// the paper turns over. F-1589-1, s1589 drain.
test('the freshest live item still prints its engraving on an unseeded boot', async ({ page }) => {
  const errors = collectErrors(page);
  const items = JSON.parse(await readFile(path.resolve('news/herald.json'), 'utf8')) as HeraldItem[];
  const ageDays = ({ date }: HeraldItem) => (Date.now() - Date.parse(`${date}T00:00:00Z`)) / 86_400_000;
  // Self-retiring by construction: when the paper's classified items all age out, this SKIPS rather
  // than reddening. A test that names today's front page is a time bomb; this one is not.
  const fresh = items.find((item) => item.class && ageDays(item) <= HERALD_FRESHNESS_DAYS);
  test.skip(!fresh, 'no classified item is inside the freshness window — nothing for a player to see');
  await seedTown(page);
  await openHerald(page);

  const item = page.getByTestId('claim-herald-item').filter({ has: page.getByRole('heading', { name: fresh!.headline }) });
  await expect(item).toBeVisible();
  const image = item.getByTestId('claim-herald-engraving');
  await expect(image).toBeVisible();
  expect(await image.evaluate((node: HTMLImageElement) => node.src)).toContain(`herald-engraving-${fresh!.class}`);
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
