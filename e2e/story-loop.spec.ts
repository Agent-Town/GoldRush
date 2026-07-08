import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';

const ARTIFACT_DIR = path.resolve('artifacts/story-loop');
const SEEN_FIRST_CONTRACT = 'story:first-contract';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, townKey, metaKey, scoreKey, seenFirstContract }) => {
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
            hintsSeen: [seenFirstContract],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } }));
      localStorage.setItem(scoreKey, '[]');
    },
    {
      profileKey: PROFILE_KEY,
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      seenFirstContract: SEEN_FIRST_CONTRACT,
    },
  );
}

async function openBoardAndLaunch(page: Page, query: string): Promise<void> {
  await page.goto('/');
  await page.evaluate((nextQuery) => history.replaceState(null, '', `/${nextQuery}`), query);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  await page.getByTestId('contract-launch-the-claim').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function forceSecure(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('run.secureWave', 1);
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.25);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 0);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.resetRun();
  });
}

async function forceOverrun(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    for (let pack = 0; pack < 6; pack += 1) window.__GR_TEST__?.spawnPack(5, 0.4);
  });
}

async function expectReturnBeat(page: Page, id: string, text: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).toHaveAttribute('data-beat-id', id);
  await expect(card).toContainText(text);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('secured contract returns to town, fires the secured beat, and leaves the board open', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  const errors = collectErrors(page);

  await openBoardAndLaunch(page, '?debug&timescale=24&nolevel&seed=story-loop-secured');
  await forceSecure(page);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await expect(page.getByTestId('bank-secured-claim')).toHaveText('Return to Town');
  await page.getByTestId('bank-secured-claim').click();

  await expect(page.getByTestId('death-overlay')).toBeVisible({ timeout: 8_000 });
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toHaveText('New Claim');
  await shot(page, testInfo, 'secured-return-primary');
  await page.getByTestId('stake-again').click();

  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await expectReturnBeat(page, 'return-secured', 'The town heard. Drinks tonight.');
  await shot(page, testInfo, 'secured-return-beat');
  assertNoErrors(errors);
});

test('overrun contract returns to town, fires the overrun beat, and never forces the menu', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  const errors = collectErrors(page);

  await openBoardAndLaunch(page, '?debug&timescale=8&nowaves&nolevel&seed=story-loop-overrun');
  await forceOverrun(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await expect(page.getByTestId('run-secondary-action')).toHaveText('Try Again');
  await shot(page, testInfo, 'overrun-return-primary');
  await page.getByTestId('stake-again').click();

  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await expectReturnBeat(page, 'return-overrun', "You're breathing. The claim can be re-staked.");
  await shot(page, testInfo, 'overrun-return-beat');
  assertNoErrors(errors);
});

test('staying for the rush still returns as secured after a later death', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await seedProfile(page);
  const errors = collectErrors(page);

  await openBoardAndLaunch(page, '?debug&timescale=24&nolevel&seed=story-loop-rush-secured');
  await forceSecure(page);
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
  await page.getByTestId('stay-for-rush').click();
  await expect(page.getByTestId('claim-secured')).toBeHidden();

  await forceOverrun(page);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 15_000 }).toBe('dead');
  await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  await page.getByTestId('stake-again').click();

  await expect(page.getByTestId('start-menu')).toHaveCount(0);
  await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 8_000 });
  await expectReturnBeat(page, 'return-secured', 'The town heard. Drinks tonight.');
  await shot(page, testInfo, 'rush-return-secured-beat');
  assertNoErrors(errors);
});
