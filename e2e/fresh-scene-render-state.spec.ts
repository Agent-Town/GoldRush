import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/fresh-scene-render-state');
const RUN_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=fresh-scene-render-state';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, scoreKey }) => {
      localStorage.clear();
      sessionStorage.clear();
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
            hintsSeen: ['story:first-contract'],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(scoreKey, JSON.stringify([{ waves: 18, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' }]));
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
    },
  );
});

test('soft navigation repeatedly matches fresh Night Shift and town render dress', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const errors = collectErrors(page);

  await page.goto(`/${RUN_QUERY}`);
  await waitForRun(page);
  const hardRun = await runDress(page);
  await saveShot(page, `${testInfo.project.name}-hard-boot-night.png`);

  await page.goto('/');
  await page.evaluate((query) => history.replaceState(null, '', `/${query}`), RUN_QUERY.replace('contract=e1-night-shift&', ''));
  await page.getByTestId('start-menu-enter-town').click();
  await openBoard(page);
  const hardTown = await townDress(page);

  for (let pass = 1; pass <= 3; pass += 1) {
    await page.getByTestId('contract-chapter-tab-epoch-1-frontier').click();
    await expect(page.getByTestId('contract-card-e1-night-shift')).toBeVisible();
    await page.getByTestId('contract-launch-e1-night-shift').click();
    await waitForRun(page);
    expect(await runDress(page)).toEqual(hardRun);
    if (pass === 1) await saveShot(page, `${testInfo.project.name}-soft-nav-night.png`);

    await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
    await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
    await page.getByTestId('stake-again').click();
    await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
    await expect(page.getByTestId('contract-board')).toBeVisible();
    expect(await townDress(page)).toEqual(hardTown);
  }

  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function waitForRun(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function openBoard(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
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

async function runDress(page: Page): Promise<unknown> {
  return page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    const lighting = diagnostics?.lighting;
    return {
      contract: diagnostics?.contract.activeId,
      tilePalette: diagnostics?.contract.tileParams.palette,
      lighting: lighting
        ? {
            shadowsQuality: lighting.shadowsQuality,
            fogNear: lighting.fogNear,
            fogFar: lighting.fogFar,
            postEnabled: lighting.postEnabled,
            shadowMapSize: lighting.shadowMapSize,
            palette: (lighting as typeof lighting & { palette?: unknown }).palette,
            nightShift: lighting.nightShift,
          }
        : null,
    };
  });
}

async function townDress(page: Page): Promise<unknown> {
  return page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.lighting);
}

async function saveShot(page: Page, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, name) });
}
