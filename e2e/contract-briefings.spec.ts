import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { STORY_TALES_STORAGE_KEY } from '../src/story/settings';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Briefing = {
  id: string;
  name: string;
  geographyLine: string;
  goals: string[];
  rules: string[];
};
type SeedScore = {
  waves: number;
  kills?: number;
  gold?: number;
  timeAlive?: number;
  at?: number;
  secured?: boolean;
  contractId?: string;
};

const ARTIFACT_DIR = path.resolve('artifacts/contract-briefings');
const CONTRACTS: readonly Briefing[] = [
  {
    id: 'the-claim',
    name: 'The Claim',
    geographyLine: 'The classic river claim.',
    goals: ['Pan. Build. Hold the claim.'],
    rules: ['Secure the claim at wave 20, then stay for the rush.', 'Protect the stake; overrun ends the run.'],
  },
  {
    id: 'e1-dry-gulch',
    name: 'The Dry Gulch',
    geographyLine: 'Mesa country; dry washes fall toward one sunken spring.',
    goals: ['Secure the claim at wave 20, then stay for the rush.'],
    rules: [
      'Sluices work only beside the spring.',
      'The river is gone; enemies can press from every edge.',
      'Seams pay 40% more gold.',
    ],
  },
  {
    id: 'e1-night-shift',
    name: 'Night Shift',
    geographyLine: 'The claim, gone dark, dotted with cold lanterns.',
    goals: ['Survive to DAWN at wave 25.'],
    rules: [
      'Beyond your light, the night owns the claim.',
      'Relight cold lanterns or build new posts to see threats.',
      'Turrets still target in the dark.',
    ],
  },
  {
    id: 'e1-twin-banks',
    name: 'Twin Banks',
    geographyLine: 'A braided river claim with twin fords, gravel bars, and damp reeds.',
    goals: ['Secure the south claim, then decide how far north to build.'],
    rules: [
      'Both banks can hold buildings.',
      'Two fords carry pressure across the river.',
      'The north marker is expansion; the south stake is the loss point.',
    ],
  },
  {
    id: 'e1-baron',
    name: 'The Claim-Jumper Baron',
    geographyLine: 'A brass-bannered bully compresses the waves and waits at the twentieth horn.',
    goals: ['The Baron rides at wave 20. End him.'],
    rules: [
      'His outfit rides hot: waves come 15% faster.',
      'Taunts warn you before his banner appears.',
      'Kill the Baron for the medal and double science.',
    ],
  },
  {
    id: 'e2-hill-mine',
    name: 'The Hill Mine',
    geographyLine: 'A terraced hillside mine above a flooded rail cut.',
    goals: ['Hold the Boiler House pad and keep the rail cut open.'],
    rules: [
      'T2 and T3 pads out-range the valley, but cliff faces block bolts.',
      'Claim-jumpers must climb the switchbacks; cliff bands are impassable.',
      'The flooded gallery is deep except at the trestle and wet edge.',
    ],
  },
];

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

async function seedProfile(page: Page, scores: readonly SeedScore[] = []): Promise<void> {
  await page.addInitScript(
    ({ profileKey, scoreKey, townKey, metaKey, storyKey, seededScores }) => {
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
            hintsSeen: [],
          },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(townKey, 'Quartz Hill');
      localStorage.setItem(storyKey, '0');
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(
        scoreKey,
        JSON.stringify(
          seededScores.map((score, index) => ({
            kills: 0,
            gold: 0,
            timeAlive: 60,
            at: index + 1,
            profileName: 'Robin',
            ...score,
          })),
        ),
      );
    },
    {
      profileKey: PROFILE_KEY,
      scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      storyKey: STORY_TALES_STORAGE_KEY,
      seededScores: scores,
    },
  );
}

async function openContract(page: Page, contractId: string, seed: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await clearStorage(page);
  await page.goto(`/?debug&contract=${contractId}&timescale=3&nowaves&nolevel&seed=${seed}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  return errors;
}

async function openBoard(page: Page): Promise<void> {
  await seedProfile(page, [{ waves: 20, secured: true, contractId: 'the-claim' }]);
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
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

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function assertRunCard(page: Page, expected: Briefing): Promise<void> {
  await expect(page.getByTestId('contract-briefing')).toBeVisible();
  await expect(page.getByTestId('contract-briefing-name')).toHaveText(expected.name);
  await expect(page.getByTestId('contract-briefing-geography')).toHaveText(expected.geographyLine);
  expect(await page.getByTestId('contract-briefing-goals').locator('li').allTextContents()).toEqual(expected.goals);
  expect(await page.getByTestId('contract-briefing-rules').locator('li').allTextContents()).toEqual(expected.rules);
  const manifest = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  expect(manifest?.activeId).toBe(expected.id);
  expect(manifest?.briefing).toEqual({
    geographyLine: expected.geographyLine,
    goals: expected.goals,
    rules: expected.rules,
  });
}

async function assertPauseContract(page: Page, expected: Briefing): Promise<void> {
  await expect(page.getByTestId('pause-contract')).toBeVisible();
  await expect(page.getByTestId('pause-contract-name')).toHaveText(expected.name);
  await expect(page.getByTestId('pause-contract-geography')).toHaveText(expected.geographyLine);
  expect(await page.getByTestId('pause-contract-goals').locator('li').allTextContents()).toEqual(expected.goals);
  expect(await page.getByTestId('pause-contract-rules').locator('li').allTextContents()).toEqual(expected.rules);
}

async function assertBoardBriefing(page: Page, expected: Briefing): Promise<void> {
  await expect(page.getByTestId(`contract-board-geography-${expected.id}`)).toHaveText(expected.geographyLine);
  await page.getByTestId(`contract-card-${expected.id}`).scrollIntoViewIfNeeded();
  const board = page.getByTestId(`contract-board-briefing-${expected.id}`);
  await expect(board).toBeVisible();
  for (const line of [...expected.goals, ...expected.rules]) await expect(board).toContainText(line);
  await expectStacked(board, page.getByTestId(`contract-best-${expected.id}`));
  await expectStacked(page.getByTestId(`contract-best-${expected.id}`), page.getByTestId(`contract-launch-${expected.id}`));
}

async function expectInViewport(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!box || !viewport) return;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

async function expectStacked(upper: Locator, lower: Locator): Promise<void> {
  const upperBox = await upper.boundingBox();
  const lowerBox = await lower.boundingBox();
  expect(upperBox).not.toBeNull();
  expect(lowerBox).not.toBeNull();
  if (!upperBox || !lowerBox) return;
  expect(upperBox.y + upperBox.height).toBeLessThanOrEqual(lowerBox.y + 1);
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('every current contract launch shows manifest briefing goals and rules', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await clearStorage(page);
  for (const contract of CONTRACTS) {
    await page.goto(`/?debug&contract=${contract.id}&timescale=3&nowaves&nolevel&seed=briefing-${contract.id}`);
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
    await assertRunCard(page, contract);
    if (contract.id === 'e1-dry-gulch' || contract.id === 'e1-baron') await shot(page, testInfo, `card-${contract.id}`);
  }
  assertNoErrors(errors);
});

test('run briefing dismisses by click and by eight second timer while sim keeps running', async ({ page }) => {
  const errors = await openContract(page, 'e1-dry-gulch', 'briefing-dismiss-click');
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  expect(after).toBeGreaterThan(before);

  await page.getByTestId('contract-briefing-dismiss').click();
  await expect(page.getByTestId('contract-briefing')).toBeHidden();

  await page.goto('/?debug&contract=e1-dry-gulch&timescale=3&nowaves&nolevel&seed=briefing-dismiss-auto');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  await expect(page.getByTestId('contract-briefing')).toBeVisible();
  await expect(page.getByTestId('contract-briefing')).toBeHidden({ timeout: 9_000 });
  assertNoErrors(errors);
});

test('pause panel repeats the active contract briefing', async ({ page }, testInfo) => {
  const baron = CONTRACTS.find((entry) => entry.id === 'e1-baron')!;
  const errors = await openContract(page, baron.id, 'briefing-pause');
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.keyboard.press('KeyP');
  await expect(page.getByTestId('pause-meta-panel')).toBeVisible();
  await assertPauseContract(page, baron);
  await shot(page, testInfo, 'pause-panel');
  assertNoErrors(errors);
});

test('plain no-debug New Claim still briefs The Claim', async ({ page }) => {
  const claim = CONTRACTS[0]!;
  const errors = collectErrors(page);
  await seedProfile(page);
  await page.goto('/');
  await page.getByTestId('start-menu-new-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  await assertRunCard(page, claim);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason)).toBeNull();
  assertNoErrors(errors);
});

test('board cards show the same briefing data', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await openBoard(page);
  await expect(page.getByTestId('contract-card-list').locator('[data-contract-id]')).toHaveCount(CONTRACTS.length);
  for (const contract of CONTRACTS) await assertBoardBriefing(page, contract);
  await page.getByTestId('contract-card-list').evaluate((element) => {
    element.scrollTop = 0;
  });
  await shot(page, testInfo, 'board-briefings');
  assertNoErrors(errors);
});

test('briefing card and pause contract fit at 390px', async ({ page }, testInfo) => {
  const night = CONTRACTS.find((entry) => entry.id === 'e1-night-shift')!;
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = await openContract(page, night.id, 'briefing-mobile');
  await assertRunCard(page, night);
  await expectInViewport(page, page.getByTestId('contract-briefing'));
  await shot(page, testInfo, 'mobile-390-card');
  await page.getByTestId('contract-briefing-dismiss').click();
  await page.keyboard.press('KeyP');
  await assertPauseContract(page, night);
  await expectInViewport(page, page.getByTestId('pause-meta-panel'));
  await expect(page.getByTestId('prompt-stack')).toHaveCSS('display', 'none');
  await shot(page, testInfo, 'mobile-390-pause');
  assertNoErrors(errors);
});
