import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/town-fresh-boot');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey, metaKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    metaKey: profileDataKey('robin', META_PROGRESS_KEY),
  });
});

test('delayed town textures converge without a reload and bark portrait falls back', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = collectErrors(page);

  await page.route('**/*.png*', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (/\/townsfolk-[^/]+\.png$/.test(pathname)) {
      await route.fulfill({ status: 200, contentType: 'image/png', body: 'not-an-image' });
      return;
    }
    if (/bld-(tavern|claim-office|schoolhouse|general-store|chapel)/.test(pathname)) {
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 1_500));
      await route.fulfill({ response });
      return;
    }
    await route.continue();
  });

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2);

  await expect.poll(() => facadeStates(page)).toContain('placeholder');
  await saveShot(page, `${testInfo.project.name}-before-delayed-textures.png`);

  await expect.poll(() => facadeStates(page), { timeout: 10_000 }).not.toContain('placeholder');
  await expect.poll(() => facadeStates(page)).not.toContain('error');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.textures.ground)).toBe('placeholder');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.textures.barkPortrait), { timeout: 8_000 }).toBe('fallback');
  await saveShot(page, `${testInfo.project.name}-after-delayed-textures.png`);

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function facadeStates(page: Page): Promise<string[]> {
  return page.evaluate(() => Object.values(window.__GR_TOWN_DIAGNOSTICS__?.textures.facades ?? {}));
}

async function saveShot(page: Page, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, name), fullPage: true });
}
