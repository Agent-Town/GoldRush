import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 2000, height: 1000 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`town-run-town keeps camera truth at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    await seedProfile(page);
    const errors = collectErrors(page);

    await page.goto('/');
    await page.evaluate(() => history.replaceState(null, '', '/?debug&tour=camera-proof&seed=swap-proof&press=return-secured&nowaves&nolevel'));
    await page.getByTestId('start-menu-enter-town').click();
    await waitForTown(page);
    await expectCameraTruth(page);

    await openBoard(page);
    await page.getByTestId('contract-launch-the-claim').click();
    await waitForRun(page);
    await expectCameraTruth(page);

    await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
    await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
    await page.getByTestId('stake-again').click();
    await waitForTown(page);
    await expect(page.getByTestId('contract-board')).toBeVisible();
    await expectCameraTruth(page);

    const search = new URLSearchParams(await page.evaluate(() => location.search));
    expect(search.has('contract')).toBe(false);
    expect(search.has('seed')).toBe(false);
    expect(search.has('press')).toBe(false);
    expect(search.has('debug')).toBe(true);
    expect(search.get('tour')).toBe('camera-proof');

    await page.reload();
    await waitForTown(page);
    await expect(page.getByTestId('start-menu')).toHaveCount(0);
    await expectCameraTruth(page);
    expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  });
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } }));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
    },
  );
}

function collectErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function waitForTown(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function waitForRun(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
}

async function openBoard(page: Page): Promise<void> {
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function expectCameraTruth(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
          const cameraAspect = Number(canvas?.dataset.cameraAspect);
          const cssAspect = Number(canvas?.dataset.cssAspect);
          return Number.isFinite(cameraAspect) && Number.isFinite(cssAspect)
            ? Math.abs(cameraAspect - cssAspect)
            : Number.POSITIVE_INFINITY;
        }),
      { timeout: 10_000 },
    )
    .toBeLessThanOrEqual(0.01);
}
