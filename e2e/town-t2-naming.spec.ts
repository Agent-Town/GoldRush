import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const SHOT_DIR = 'artifacts/town-t2';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type TownPrompt = 'tavern' | 'claim_office';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.goto('/?debug&seed=town-t2-reset');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function enterTown(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function foundTown(page: Page, name: string): Promise<void> {
  await page.getByTestId('town-name-input').fill(name);
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-beat')).toHaveText(`Founded: ${name}, 2026`);
  await expect(page.getByTestId('town-name-card')).toBeHidden({ timeout: 2_500 });
  await expect(page.getByTestId('town-name')).toHaveText(name);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function approach(page: Page, keys: [string, number][], prompt: TownPrompt): Promise<void> {
  for (const key of keys) await hold(page, key[0], key[1]);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe(prompt);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
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

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('fresh town naming persists, renames, and appears in recap and run ledger', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await enterTown(page);

  await expect(page.getByTestId('town-name-card')).toBeVisible();
  await expect(page.getByTestId('town-name-card')).toContainText('What will you call this place?');
  await shot(page, testInfo, 'founding-card');
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('town-ui')).toBeVisible();
  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(180);
  await page.getByTestId('town-name-input').click();
  await page.keyboard.up('KeyW');
  const releasedZ = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player.z ?? 0);
  await page.waitForTimeout(600);
  const settledZ = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player.z ?? 0);
  expect(Math.abs(settledZ - releasedZ)).toBeLessThan(1.5);

  await page.getByTestId('town-name-input').fill('Bad shit');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-error')).toHaveText('The Elder suggests a different name.');

  await foundTown(page, 'Aurora Bend');
  await shot(page, testInfo, 'named-header');

  await page.reload();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('town-name-card')).toBeHidden();
  await expect(page.getByTestId('town-name')).toHaveText('Aurora Bend');

  await approach(page, [['KeyA', 850], ['KeyW', 850]], 'tavern');
  await approach(page, [['KeyD', 2_000], ['KeyS', 350]], 'claim_office');
  await page.getByTestId('town-rename').click();
  await page.getByTestId('town-name-input').fill('Quartz Hill');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('town-name-beat')).toHaveText('Renamed: Quartz Hill, 2026');
  await expect(page.getByTestId('town-name-card')).toBeHidden({ timeout: 2_500 });
  await expect(page.getByTestId('town-name')).toHaveText('Quartz Hill');

  await page.evaluate((metaKey) => {
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, agent: 0 } }));
  }, profileDataKey('robin', META_PROGRESS_KEY));
  await page.goto('/?debug&timescale=3&nowaves&nolevel&seed=town-t2-recap');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('run-meta-recap')).toHaveText('Quartz Hill remembers: palisade ring (Territory III)');
  await shot(page, testInfo, 'named-recap');

  await forceDeath(page);
  await expect(page.getByTestId('run-ledger-town')).toContainText('the claim of Quartz Hill');
  assertNoErrors(errors);
});

test('profile created before naming gets its own founding prompt', async ({ page }) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await enterTown(page);
  await foundTown(page, 'Robin Ridge');

  await page.goto('/?debug&profiles&seed=town-t2-profiles');
  await page.getByTestId('profile-name-input').fill('Bob');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: 'Bob' })).toBeVisible();

  await enterTown(page);
  await expect(page.getByTestId('town-name-card')).toBeVisible();
  await foundTown(page, 'Bob Ridge');

  const names = await page.evaluate(
    ({ profileKey, nameKey }) => {
      const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
      return {
        robin: localStorage.getItem(`${profileKey}.robin.${nameKey}`),
        bob: localStorage.getItem(`${profileKey}.${state.activeId}.${nameKey}`),
      };
    },
    { profileKey: PROFILE_KEY, nameKey: TOWN_NAME_KEY },
  );
  expect(names).toEqual({ robin: 'Robin Ridge', bob: 'Bob Ridge' });
  assertNoErrors(errors);
});

test('founding input is usable at 390px', async ({ page }, testInfo) => {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await enterTown(page);

  const input = page.getByTestId('town-name-input');
  await expect(input).toBeVisible();
  const stickBox = await page.locator('#touch-stick').boundingBox();
  expect(stickBox).not.toBeNull();
  const backdropBlocksStick = await page.evaluate(({ x, y }) => {
    return document.elementFromPoint(x, y)?.closest('[data-testid="town-name-card"]') !== null;
  }, { x: stickBox!.x + stickBox!.width / 2, y: stickBox!.y + stickBox!.height / 2 });
  expect(backdropBlocksStick).toBe(true);
  await input.fill('Mobile Bend');
  await expect(input).toHaveValue('Mobile Bend');
  await expect(input.evaluate((node) => Number.parseFloat(getComputedStyle(node).fontSize))).resolves.toBeGreaterThanOrEqual(16);
  await shot(page, testInfo, 'mobile-390-input');
  assertNoErrors(errors);
});
