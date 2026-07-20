import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

type HeroAge = 'midlife' | 'silver' | 'elder';

const AGE_CASES: ReadonlyArray<{ era: number; age: HeroAge }> = [
  { era: 4, age: 'midlife' },
  { era: 8, age: 'silver' },
  { era: 10, age: 'elder' },
];

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript((profileKey) => {
    const state: ProfileState = {
      version: 2,
      activeId: 'hero-age',
      profiles: [{ id: 'hero-age', name: 'Hero Age', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
  }, PROFILE_KEY);
}

function processedSheetExists(age: HeroAge): boolean {
  return ['a', 'b'].every((sheet) =>
    Array.from({ length: 16 }, (_, index) =>
      path.resolve(`assets/processed/char-hero-${age}-sheet-walk4-${sheet}-r${Math.floor(index / 4)}c${index % 4}.png`),
    ).every(existsSync),
  );
}

async function bootRun(page: Page, era: number, extra = ''): Promise<void> {
  await page.goto(`/?debug&era=${era}&contract=the-claim&nowaves&nolevel&nopause&seed=hero-age-${era}${extra}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

for (const { era, age } of AGE_CASES) {
  test(`era ${era} resolves the ${age} sheet in run and town`, async ({ page }) => {
    const errors = watchErrors(page);
    await seedProfile(page);
    await bootRun(page, era);
    const expected = processedSheetExists(age) ? age : 'young';
    await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', expected, { timeout: 15_000 });

    await page.evaluate(() => history.replaceState({ goldRushScene: 'town' }, '', location.href));
    await page.reload();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', expected, { timeout: 15_000 });
    expect(errors).toEqual([]);
  });
}

test('missing aged cells fall back silently to the young sheet', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page);
  await bootRun(page, 4, '&noheroageart');
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', 'young', { timeout: 15_000 });
  expect(errors).toEqual([]);
});

test('era 1 keeps the existing young hero binding', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page);
  await bootRun(page, 1);
  await expect(page.locator('#game-canvas')).toHaveAttribute('data-hero-sheet', 'young', { timeout: 15_000 });
  await page.keyboard.down('KeyS');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.clip === 'walk');
  const source = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.hero']?.sourceFrameKey ?? '');
  await page.keyboard.up('KeyS');
  expect(source).toContain('char-hero-sheet-');
  expect(source).not.toMatch(/midlife|silver|elder/);
  expect(errors).toEqual([]);
});
