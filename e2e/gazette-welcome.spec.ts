import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { townPlazaSlot } from '../src/town/townLayout';

const ARTIFACT_DIR = path.resolve('artifacts/gazette-welcome');
const BEATS = [
  ['tavern-board', townPlazaSlot('tavern').approach],
  ['the-works', townPlazaSlot('general_store').approach],
  ['schoolhouse-chart', townPlazaSlot('schoolhouse').approach],
] as const;

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.describe.configure({ timeout: 90_000 });

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function approachNewsie(page: Page): Promise<void> {
  await expect.poll(
    () => page.evaluate(() => {
      const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
      const newsie = diagnostics.actors.find((actor) => actor.id === 'newsie')!;
      diagnostics.teleport(newsie.position.x, newsie.position.z);
      return diagnostics.activeBark?.actorId ?? null;
    }),
    { timeout: 8_000 },
  ).toBe('newsie');
}

test('the Gazette welcome fires once, walks skippably, and retriggers through the newsie', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const errors = collectErrors(page);

  await page.goto('/');
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('town-name-input').fill('Sunrise Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');

  const welcome = page.locator('[data-welcome-phase]');
  await expect(welcome).toHaveAttribute('data-welcome-phase', 'delivery', { timeout: 8_000 });
  await expect(page.getByTestId('town-bark-text')).toContainText('your first Gazette');
  await expect(page.getByTestId('town-welcome-skip')).toBeVisible();
  await shot(page, testInfo, 'delivery-moment');

  await page.getByTestId('town-welcome-take-paper').click();
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await page.getByTestId('claim-herald-close').click();

  for (const [index, [id, anchor]] of BEATS.entries()) {
    await expect(welcome).toHaveAttribute('data-welcome-beat', id);
    await expect(page.getByTestId('town-welcome-skip')).toBeVisible();
    await page.evaluate(({ x, z }) => window.__GR_TOWN_DIAGNOSTICS__!.teleport(x, z), anchor);
    await expect(welcome).toHaveAttribute('data-welcome-arrived', 'true');
    await expect(page.getByTestId('town-welcome-skip')).toBeVisible();
    if (index === 0) await shot(page, testInfo, 'walk-beat');
    const newsieBefore = index === BEATS.length - 1
      ? await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.find((actor) => actor.id === 'newsie')!.position)
      : undefined;
    await page.getByTestId('town-welcome-next').click();
    if (newsieBefore) {
      await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.welcomeFollowsPlayer)).toBe(false);
      const newsieAfter = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__!.actors.find((actor) => actor.id === 'newsie')!.position);
      expect(Math.hypot(newsieAfter.x - newsieBefore.x, newsieAfter.z - newsieBefore.z)).toBeLessThan(1);
    }
  }
  await expect(welcome).toHaveCount(0);

  const profileId = await page.evaluate((profileKey) => (JSON.parse(localStorage.getItem(profileKey)!) as ProfileState).activeId, PROFILE_KEY);
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey(profileId, TOWN_WELCOME_SEEN_KEY))).resolves.toBe('1');

  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForTimeout(1_000);
  await expect(welcome).toHaveCount(0);
  await expect(page.getByTestId('claim-herald')).toHaveCount(0);

  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');
  await approachNewsie(page);
  await expect(page.getByTestId('town-open-herald')).toHaveText('Read issue #1 again');
  await expect(page.getByTestId('town-show-around-again')).toHaveText('Show me around again');
  await shot(page, testInfo, 'retrigger-prompt');

  await page.getByTestId('town-show-around-again').click();
  await expect(welcome).toHaveAttribute('data-welcome-beat', 'tavern-board');
  await page.getByTestId('town-welcome-skip').click();
  await expect(welcome).toHaveCount(0);

  await approachNewsie(page);
  await page.getByTestId('town-open-herald').click();
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('skip retires the unread nag on later entries', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.getByTestId('profile-name-input').fill('June');
  await page.getByTestId('profile-create').click();
  await page.getByTestId('town-name-input').fill('Quiet Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-welcome-phase="delivery"]')).toBeVisible();
  await page.getByTestId('town-welcome-skip').click();
  await expect(page.getByTestId('town-herald-badge')).toHaveAttribute('data-unread', 'false');
  await page.getByTestId('town-exit').click();
  await page.getByTestId('start-menu-enter-town').click();
  await expect(page.locator('[data-welcome-phase]')).toHaveCount(0);
  await expect(page.getByTestId('town-herald-badge')).toHaveAttribute('data-unread', 'false');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('a fresh profile that reads the badge early continues straight to the walk', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await page.getByTestId('town-herald-badge').click();
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await page.getByTestId('claim-herald-close').click();
  await page.getByTestId('town-name-input').fill('Sunrise Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-welcome-phase="walk"]')).toHaveAttribute('data-welcome-beat', 'tavern-board');
  await expect(page.getByTestId('town-welcome-take-paper')).toHaveCount(0);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('an imported ledger never starts the welcome uninvited', async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const state: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(state));
    localStorage.setItem(`${profileKey}.robin.${townKey}`, 'Quartz Hill');
  }, { profileKey: PROFILE_KEY, townKey: TOWN_NAME_KEY });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  await page.getByTestId('profile-import-file').setInputFiles({
    name: 'imported-ledger.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      kind: 'goldrush.profile.ledger',
      version: 1,
      exportedAt: '2026-07-30T00:00:00.000Z',
      profile: {
        id: 'archivist',
        name: 'Archivist',
        createdAt: 1,
        updatedAt: 1,
        difficultyPreset: 'trail',
        hintsSeen: [],
        trailGuide: true,
      },
      data: {
        [META_PROGRESS_KEY]: { version: 1, tracks: { territory: 1, science: 1, hero: 0, agent: 0 } },
        [TOWN_WELCOME_SEEN_KEY]: 0,
      },
    })),
  });
  await page.getByTestId('profile-import-apply').click();
  await page.getByTestId('profile-back').click();
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.getByTestId('town-name-input').fill('Archive Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await page.waitForTimeout(1_000);
  await expect(page.locator('[data-welcome-phase]')).toHaveCount(0);
  const profileId = await page.evaluate((profileKey) => (JSON.parse(localStorage.getItem(profileKey)!) as ProfileState).activeId, PROFILE_KEY);
  await expect(page.evaluate((key) => localStorage.getItem(key), profileDataKey(profileId, TOWN_WELCOME_SEEN_KEY))).resolves.toBe('1');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('opening the Herald badge during delivery continues into the walk', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const errors = collectErrors(page);
  await page.goto('/');
  await page.getByTestId('profile-name-input').fill('June');
  await page.getByTestId('profile-create').click();
  await page.getByTestId('town-name-input').fill('Badge Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);
  await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-first-claim', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-welcome-phase="delivery"]')).toBeVisible();
  await page.getByTestId('town-herald-badge').click();
  await expect(page.getByTestId('gazette-first-issue')).toBeVisible();
  await page.getByTestId('claim-herald-close').click();
  await expect(page.locator('[data-welcome-phase="walk"]')).toHaveAttribute('data-welcome-beat', 'tavern-board');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
