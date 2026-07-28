import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import {
  HERO_SKIN_STORAGE_KEY,
  HERO_SKINS_OWNED_STORAGE_KEY,
  PROSPECTOR_SKIN_STORAGE_KEY,
  PROSPECTOR_SKINS_OWNED_STORAGE_KEY,
} from '../src/game/ProspectorSkin';

const SHOT_DIR = path.resolve('artifacts/wardrobe-preview');

test("the tailor's wagon owns the profile wardrobe and Settings has no picker", async ({ page }, testInfo) => {
  await seedTown(page);
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('start-menu-settings').click();
  await expect(page.getByTestId('start-menu-prospector-skin')).toHaveCount(0);
  await page.getByTestId('start-menu-settings-close').click();
  await openWardrobe(page);
  await assertWardrobeFits(page, testInfo);
  await expect(page.getByTestId('wardrobe-partner-rack')).toContainText('The Partner · Robin');
  await assertPreviewOptions(page, 'prospector', [
    ['stock', 'char-prospector-sheet-hover8-r0c0', 'ready'],
    ['complainant', 'char-prospector-complainant-sheet-hover8-r0c0', 'at-tailors'],
    ['gilded', 'char-prospector-gilded-sheet-hover8-r0c0', 'at-tailors'],
  ]);
  await assertPreviewOptions(page, 'partner', [
    ['stock', 'char-hero-sheet-walk4-a-f-r0c0', 'ready'],
    ['claim-day', 'char-hero-sheet-walk4-a-f-r0c0', 'at-tailors', true],
  ]);
  await expect(page.getByTestId('wardrobe-partner-preview')).toContainText("At the tailor's · Stock fit shown");
  await page.getByTestId('wardrobe-prospector-skin').selectOption('complainant');
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), PROSPECTOR_SKIN_STORAGE_KEY)).toBe('complainant');
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), HERO_SKIN_STORAGE_KEY)).toBe('claim-day');
  await shot(page, testInfo, 'wardrobe-preview');

  await page.reload();
  await openWardrobe(page);
  await expect(page.getByTestId('wardrobe-prospector-skin')).toHaveValue('complainant');
  await expect(page.getByTestId('wardrobe-hero-skin')).toHaveValue('claim-day');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-hero-skin')).toBe('claim-day');
  await expect.poll(() => page.locator('#game-canvas').getAttribute('data-hero-skin-sheet')).toMatch(/^(claim-day|stock)$/);
  expect(errors).toEqual({ console: [], page: [] });
});

test('claim-day stays equipped while an older heroine falls back to her stock age sheet', async ({ page }) => {
  await seedTown(page, true);
  const errors = collectErrors(page);
  await page.goto('/?debug&era=4&contract=the-claim&nowaves&nolevel&nopause&seed=tailor-age-fallback');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', 'midlife', { timeout: 15_000 });
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-skin', 'claim-day');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-skin-sheet', 'stock');
  expect(errors).toEqual({ console: [], page: [] });
});

async function seedTown(page: Page, equipped = false): Promise<void> {
  await page.addInitScript(({ keys, equipped }) => {
    if (localStorage.getItem(keys.profile)) return;
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(keys.profile, JSON.stringify(state));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    localStorage.setItem(keys.guide, '1');
    localStorage.setItem(keys.prospectorOwned, JSON.stringify(['stock', 'complainant', 'gilded']));
    localStorage.setItem(keys.heroOwned, JSON.stringify(['stock', 'claim-day']));
    if (equipped) localStorage.setItem(keys.heroSkin, 'claim-day');
  }, {
    keys: {
      profile: PROFILE_KEY,
      town: profileDataKey('robin', TOWN_NAME_KEY),
      meta: profileDataKey('robin', META_PROGRESS_KEY),
      guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      prospectorOwned: profileDataKey('robin', PROSPECTOR_SKINS_OWNED_STORAGE_KEY),
      heroOwned: profileDataKey('robin', HERO_SKINS_OWNED_STORAGE_KEY),
      heroSkin: profileDataKey('robin', HERO_SKIN_STORAGE_KEY),
    },
    equipped,
  });
}

async function openWardrobe(page: Page): Promise<void> {
  if (await page.getByTestId('start-menu-enter-town').isVisible()) {
    await page.getByTestId('start-menu-enter-town').click();
  }
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 20);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    town.teleport(town.tailorWagon.approach.x, town.tailorWagon.approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('tailor-wagon');
  await page.getByTestId('town-open-wardrobe').click();
  await expect(page.getByTestId('wardrobe-view')).toBeVisible();
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

type PreviewExpectation = [skin: string, file: string, state: 'ready' | 'at-tailors', placeholder?: boolean];

async function assertPreviewOptions(page: Page, rack: 'prospector' | 'partner', options: PreviewExpectation[]): Promise<void> {
  const select = page.getByTestId(rack === 'partner' ? 'wardrobe-hero-skin' : 'wardrobe-prospector-skin');
  const preview = page.getByTestId(`wardrobe-${rack}-preview`);
  for (const [skin, file, state, placeholder = false] of options) {
    await select.selectOption(skin);
    await expect(preview).toHaveAttribute('data-preview-skin', skin);
    await expect(preview).toHaveAttribute('data-preview-state', state);
    await expect(preview).toHaveAttribute('data-preview-placeholder', String(placeholder));
    await expect(preview.locator('img')).toHaveAttribute('src', new RegExp(`${file.replaceAll('.', '\\.')}`));
    await expect.poll(() => preview.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  }
}

async function assertWardrobeFits(page: Page, testInfo: TestInfo): Promise<void> {
  const wardrobe = page.getByTestId('wardrobe-view');
  await expect(page.getByTestId('wardrobe-close')).toBeInViewport();
  await expect.poll(() => wardrobe.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  if (testInfo.project.name !== 'mobile-chrome') return;
  const viewport = page.viewportSize()!;
  const shell = await wardrobe.locator('.town-ui__surface-shell').boundingBox();
  expect(shell).not.toBeNull();
  expect(shell!.x).toBeGreaterThanOrEqual(0);
  expect(shell!.x + shell!.width).toBeLessThanOrEqual(viewport.width);
  await page.getByTestId('wardrobe-partner-preview').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('wardrobe-partner-preview')).toBeInViewport();
}

async function shot(page: Page, testInfo: TestInfo, state: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${state}.png`), fullPage: true });
}
