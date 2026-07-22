import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function seedRunProfile(page: Page, trailGuide: boolean): Promise<void> {
  await page.addInitScript(
    ({ profileKey, enrolled }) => {
      Date.now = () => (window as unknown as { __TRAIL_NOW__?: number }).__TRAIL_NOW__ ?? 1_000_000;
      if (localStorage.getItem(profileKey)) return;
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
            hintsSeen: [],
            ...(enrolled ? { trailGuide: true as const } : {}),
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
    },
    { profileKey: PROFILE_KEY, enrolled: trailGuide },
  );
}

async function openRun(page: Page): Promise<void> {
  await page.goto('/?debug&contract=the-claim&nospawn&nolevel');
  await page.waitForFunction(() => window.__GR_STORY__ && window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
}

async function expectBark(page: Page, text: string): Promise<void> {
  await expect(page.getByTestId('hud-agent-feed')).toContainText(text);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
}

async function approachFirstSeam(page: Page, seconds: number): Promise<void> {
  await page.evaluate((duration) => {
    const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes[0]?.position;
    if (!node || !window.__GR_TEST__) throw new Error('No first seam available.');
    window.__GR_TEST__.teleport(node.x, node.z);
    window.__GR_TEST__.advanceSim(duration);
  }, seconds);
}

async function guideHints(page: Page): Promise<string[]> {
  return page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles[0]?.hintsSeen.filter((hint) => hint.startsWith('story:trail-guide-')) ?? [];
  }, PROFILE_KEY);
}

test('fresh profile sees the first three trail beats once, in order, and reload stays quiet', async ({ page }) => {
  test.setTimeout(60_000);
  await seedRunProfile(page, true);
  const errors = collectErrors(page);
  await openRun(page);

  await expectBark(page, 'Move with the trail');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('hud-agent-feed')).toBeEmpty();
  await approachFirstSeam(page, 0.2);
  await expectBark(page, 'Raise a sluice beside water');
  await approachFirstSeam(page, 4);
  await expectBark(page, 'Open Build');

  expect(await guideHints(page)).toEqual([
    'story:trail-guide-first-run',
    'story:trail-guide-first-nugget',
    'story:trail-guide-first-gold',
  ]);

  await page.reload();
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForTimeout(300);
  await expect(page.getByTestId('hud-agent-feed')).not.toContainText(/Move with the trail|Raise a sluice|Open Build/);
  expect(await guideHints(page)).toHaveLength(3);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('veteran profile receives no Trail Guide barks', async ({ page }) => {
  await seedRunProfile(page, false);
  const errors = collectErrors(page);
  await openRun(page);
  await page.evaluate(() => {
    const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes[0]?.position;
    if (node && window.__GR_TEST__) {
      window.__GR_TEST__.teleport(node.x, node.z);
      window.__GR_TEST__.advanceSim(4);
    }
  });
  await page.waitForTimeout(300);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  expect(await guideHints(page)).toEqual([]);
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('first boot asks the greenhorn question once and sets the preset', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const errors = collectErrors(page);
  await page.goto('/');

  await expect(page.getByTestId('greenhorn-question')).toContainText('First time prospecting?');
  await page.getByLabel('Yes - ease me onto the trail').check();
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);

  const profile = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles.find((entry) => entry.id === state.activeId);
  }, PROFILE_KEY);
  expect(profile).toMatchObject({ name: 'Mina', difficultyPreset: 'greenhorn', trailGuide: true });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('profile-title first boot offers the same greenhorn choice once', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const errors = collectErrors(page);
  await page.goto('/?profiles');

  await expect(page.getByTestId('greenhorn-question')).toContainText('First time prospecting?');
  await page.getByLabel('Yes - ease me onto the trail').check();
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('greenhorn-question')).toHaveCount(0);

  const profile = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
    return state.profiles.find((entry) => entry.id === state.activeId);
  }, PROFILE_KEY);
  expect(profile).toMatchObject({ name: 'Mina', difficultyPreset: 'greenhorn', trailGuide: true });
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
