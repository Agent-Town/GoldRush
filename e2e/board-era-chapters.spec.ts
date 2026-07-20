import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, listEpochs, loadEpoch } from '../src/meta/ContractFamilies';

const PROFILE_ID = 'robin';
const SEED_MARKER = 'board-era-chapters-seeded';
const ARTIFACT_DIR = path.resolve('artifacts/board-era-chapters');
const EPOCHS = listEpochs().map(({ id }) => loadEpoch(id));

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function watchErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function seedFreshProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ activeEpochKey, firstClaimKey, marker, metaKey, profileKey, townNameKey }) => {
      if (sessionStorage.getItem(marker)) return;
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(townNameKey, 'Quartz Hill');
      localStorage.setItem(activeEpochKey, 'epoch-1-frontier');
      localStorage.setItem(firstClaimKey, '1');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
      sessionStorage.setItem(marker, '1');
    },
    {
      activeEpochKey: profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY),
      firstClaimKey: profileDataKey(PROFILE_ID, FIRST_CLAIM_DONE_KEY),
      marker: SEED_MARKER,
      metaKey: profileDataKey(PROFILE_ID, META_PROGRESS_KEY),
      profileKey: PROFILE_KEY,
      townNameKey: profileDataKey(PROFILE_ID, TOWN_NAME_KEY),
    },
  );
}

async function enterTown(page: Page, url = '/'): Promise<void> {
  await page.goto('/');
  if (url !== '/') await page.evaluate((next) => history.replaceState(null, '', next), url);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20);
}

async function walkToTavern(page: Page): Promise<void> {
  for (let step = 0; step < 64; step += 1) {
    const diagnostics = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!);
    if (diagnostics.activePrompt === 'tavern') break;
    const target = diagnostics.buildings.find((building) => building.id === 'tavern')!.approach;
    const keys: string[] = [];
    if (Math.abs(target.x - diagnostics.player.x) > 0.5) keys.push(target.x > diagnostics.player.x ? 'KeyD' : 'KeyA');
    if (Math.abs(target.z - diagnostics.player.z) > 0.5) keys.push(target.z > diagnostics.player.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(140);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.getByTestId('contract-card-list').evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function expectChapter(page: Page, index: number): Promise<void> {
  const epoch = EPOCHS[index]!;
  await page.getByTestId(`contract-chapter-tab-${epoch.id}`).click();
  const chapter = page.getByTestId(`contract-chapter-${epoch.id}`);
  await expect(chapter).toBeVisible();
  await expect(chapter.locator('[data-contract-id]')).toHaveCount(epoch.contracts.length);
  await expect(chapter.locator('[data-contract-launch]')).toHaveCount(epoch.contracts.length);
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
}

test('a fresh profile opens only the Frontier chapter and keeps Ride Together and the Claim Ledger', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await seedFreshProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await expect(page.getByTestId('claim-ledger')).toBeVisible();
  await page.getByTestId('claim-ledger-close').click();
  await enterTown(page);
  await walkToTavern(page);

  const board = page.getByTestId('contract-board');
  await expect(page.getByTestId('contract-board-title')).toHaveText('The Book');
  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(1);
  await expectChapter(page, 0);
  const markup = await board.innerHTML();
  for (const epoch of EPOCHS.slice(1)) {
    expect(markup).not.toContain(epoch.id);
    expect(markup).not.toContain(epoch.displayName);
    for (const contract of epoch.contracts) expect(markup).not.toContain(contract.id);
  }
  await expect(page.getByTestId('ride-together-card')).toBeVisible();
  await shot(page, testInfo, 'fresh-e1-only');
  await page.getByTestId('ride-together-toggle').click();
  await expect(page.getByTestId('ride-together-controls')).toBeVisible();
  expectNoErrors(errors);
});

test('the era door exposes chapters through the reached frontier and nothing beyond it', async ({ page }) => {
  const errors = watchErrors(page);
  await seedFreshProfile(page);
  await page.goto('/?contract=the-claim&debug&era=4&nowaves&nolevel&nopause&seed=board-era-door');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), profileDataKey(PROFILE_ID, ACTIVE_EPOCH_KEY))).toBe(EPOCHS[3]!.id);

  await enterTown(page);
  await walkToTavern(page);
  const nav = page.getByTestId('contract-chapter-nav');
  await expect(nav.locator('[data-contract-page]')).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) await expectChapter(page, index);
  const markup = await page.getByTestId('contract-board').innerHTML();
  for (const epoch of EPOCHS.slice(4)) {
    expect(markup).not.toContain(epoch.id);
    expect(markup).not.toContain(epoch.displayName);
    for (const contract of epoch.contracts) expect(markup).not.toContain(contract.id);
  }
  expectNoErrors(errors);
});

test('debug opens every chapter without removing any contract launch surface', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await seedFreshProfile(page);
  await enterTown(page, '/?debug');
  await walkToTavern(page);
  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(EPOCHS.length);
  for (let index = 0; index < EPOCHS.length; index += 1) await expectChapter(page, index);
  await shot(page, testInfo, 'debug-all-chapters');
  expectNoErrors(errors);
});
