import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import type { RuntimeStorySignal } from '../src/story/signals';

const MOTOR = 'epoch-4-motor';
const DEEPWATER = 'epoch-5-deepwater';

async function seed(page: Page, epochId = 'epoch-1-frontier'): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(({ profileKey, activeEpochKey, epochId }) => {
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(profileKey, JSON.stringify(profile));
    localStorage.setItem(activeEpochKey, epochId);
  }, { profileKey: PROFILE_KEY, activeEpochKey: ACTIVE_EPOCH_KEY, epochId });
  await page.goto(`/?debug&epoch=${epochId}&nowaves&nolevel&seed=wd04`);
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function emit(page: Page, signal: RuntimeStorySignal): Promise<void> {
  await page.evaluate((value) => window.__GR_STORY__?.emit(value), signal);
}

test('WD-04 fires the reached ceremony postscript exactly once and keeps pre-era entries silent', async ({ page }) => {
  const errors = await seed(page);
  const milestone = {
    type: 'epoch-activated',
    epochId: DEEPWATER,
    displayName: 'The Deepwater Age',
    postscriptOnly: true,
  } as const;

  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
  await emit(page, milestone);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);

  await page.goto(`/?debug&epoch=${DEEPWATER}&nowaves&nolevel&seed=wd04`);
  await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('story-beat-card')).toHaveCount(0);

  expect(
    await page.evaluate(async (value) => {
      const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      const postscripts = (await Function('return import("/src/story/ceremonyPostscripts.ts")')()) as typeof import('../src/story/ceremonyPostscripts');
      const beat = postscripts.CEREMONY_POSTSCRIPT_BEATS.find((entry) => entry.id === 'wd04-postscript-t4');
      return {
        activeEpochId: contracts.activeEpochId(),
        registered: !!beat,
        matches: beat?.when?.(value) ?? false,
        durationMs: beat?.durationMs,
        talesEnabled: window.__GR_STORY__?.talesEnabled(),
      };
    }, milestone),
  ).toEqual({ activeEpochId: DEEPWATER, registered: true, matches: true, durationMs: 20_800, talesEnabled: true });

  await page.evaluate((value) => {
    window.__GR_STORY__?.emit(value);
    window.__GR_STORY__?.emit(value);
  }, milestone);
  await page.waitForFunction(() => window.__GR_STORY__?.active() === 'wd04-postscript-t4');
  const shown = await page.evaluate((profileKey) => {
    const profile = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
    return {
      active: window.__GR_STORY__?.active(),
      pending: window.__GR_STORY__?.pending().filter((id) => id === 'wd04-postscript-t4'),
      text: document.querySelector<HTMLElement>('[data-testid="story-beat-card"]')?.textContent,
      seen: profile.profiles[0]?.hintsSeen.filter((id) => id === 'story:wd04-postscript-t4').length,
    };
  }, PROFILE_KEY);
  expect(shown).toEqual({
    active: 'wd04-postscript-t4',
    pending: [],
    text: expect.stringContaining('declines to carry the wanting'),
    seen: 1,
  });

  await page.locator('[data-story-ceremony-continue]').click();
  await expect.poll(() => page.evaluate(() => window.__GR_STORY__?.active() === 'wd04-postscript-t4')).toBe(false);
  await emit(page, milestone);
  expect(await page.evaluate(() => ({
    active: window.__GR_STORY__?.active() === 'wd04-postscript-t4',
    pending: window.__GR_STORY__?.pending().filter((id) => id === 'wd04-postscript-t4'),
  }))).toEqual({
    active: false,
    pending: [],
  });
  expect(errors).toEqual([]);
});

test('WD-04 parses every lore postscript and preserves the lexicon law', async ({ page }) => {
  const errors = await seed(page, MOTOR);
  const postscripts = await page.evaluate(async () => {
    const module = (await Function('return import("/src/story/ceremonyPostscripts.ts")')()) as typeof import('../src/story/ceremonyPostscripts');
    return module.CEREMONY_POSTSCRIPTS;
  });
  expect(postscripts).toHaveLength(10);
  expect(postscripts.map((entry) => entry.era)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect(postscripts.map((entry) => entry.line).join('\n')).not.toMatch(/\b(?:killed|slain|cured)\b/i);
  expect(errors).toEqual([]);
});

test('WD-04 stages the final postscript from a successful Charter Press lever pull', async ({ page }) => {
  const errors = await seed(page, 'epoch-10-deepsky');
  await page.goto('/?editor&debug&epoch=epoch-10-deepsky&contract=e1-twin-banks&nowaves&nolevel&seed=wd04-t10');
  await expect(page.getByTestId('charter-press-panel')).toBeVisible({ timeout: 30_000 });
  await page.getByTestId('press-mode-lever').click();
  await page.getByTestId('lever-press').click();
  await page.waitForFunction(() => window.__GR_STORY__?.active() === 'wd04-postscript-t10');
  await expect(page.getByTestId('story-beat-card')).toContainText('acquires a taste for rivers');
  await expect(page).toHaveURL(/editor/);
  await page.locator('[data-story-ceremony-continue]').click();
  await page.waitForURL((url) => url.searchParams.has('contract') && !url.searchParams.has('editor'));
  expect(errors).toEqual([]);
});
