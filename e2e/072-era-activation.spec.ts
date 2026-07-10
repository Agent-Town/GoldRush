import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY, EPOCH_CEREMONY_KEY } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

const ARTIFACT_DIR = path.resolve('artifacts/072-era-activation');
const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const E1_CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'];

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function seedProfile(page: Page, ready: boolean): Promise<void> {
  await page.goto('/');
  await page.evaluate(
    ({ keys, readyForEpoch, threshold, taken }) => {
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
          {
            id: 'casey',
            name: 'Casey',
            createdAt: 2,
            updatedAt: 2,
            difficultyPreset: 'trail',
            hintsSeen: [],
          },
        ],
      };
      localStorage.setItem(keys.profile, JSON.stringify(state));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.firstClaim, '1');
      localStorage.setItem(
        keys.meta,
        JSON.stringify({ version: 1, tracks: { territory: 0, science: readyForEpoch ? threshold : 0, hero: 0, agent: 0 } }),
      );
      localStorage.setItem(
        keys.research,
        JSON.stringify({ version: 1, taken: readyForEpoch ? taken : [], proposalSalt: 0, pinnedTarget: null }),
      );
      localStorage.setItem(keys.scores, JSON.stringify([]));
      if (readyForEpoch) {
        localStorage.setItem(
          keys.megaproject,
          JSON.stringify({
            version: 1,
            projects: {
              'stamp-mill': {
                stage: 3,
                funded: false,
                ticksRemaining: 0,
                hp: 150,
                delayTicks: 0,
                defenseWave: 0,
              },
            },
          }),
        );
      }
    },
    {
      readyForEpoch: ready,
      threshold: STEAMWORKS_THRESHOLD,
      taken: RESEARCH_NODES.map((node) => node.id),
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        research: profileDataKey('robin', RESEARCH_STATE_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
        megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
      },
    },
  );
  await page.reload();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function openTown(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function openSchoolhouse(page: Page): Promise<void> {
  await openTown(page);
  await hold(page, 'KeyA', 900);
  await hold(page, 'KeyS', 500);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await expect(page.getByTestId('schoolhouse-view')).toBeVisible();
}

async function openBoard(page: Page): Promise<void> {
  await openTown(page);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
}

async function expectCeremonyStep(page: Page, id: string, artKey: string, text: string): Promise<void> {
  const card = page.getByTestId('story-beat-card');
  await expect(card).toBeVisible({ timeout: 8_000 });
  await expect(card).toHaveAttribute('data-beat-id', id);
  await expect(card).toHaveAttribute('data-art-key', artKey);
  await expect(card).toContainText(text);
  await expect(card).toHaveClass(/story-beat-card--visible/);
  await page.waitForTimeout(240);
}

async function preflipFingerprint(browser: Browser, explicitFrontier: boolean): Promise<{
  hash: string;
  payload: unknown;
  errors: ErrorBucket;
}> {
  const context = await browser.newContext();
  const page = await context.newPage();
  if (explicitFrontier) {
    await page.addInitScript(
      ({ key, epoch }) => localStorage.setItem(key, epoch),
      { key: ACTIVE_EPOCH_KEY, epoch: FRONTIER },
    );
  }
  const errors = collectErrors(page);
  await page.goto('/');
  const payload = await page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return {
      epoch: registry.activeEpoch(),
      contract: registry.activeContract(),
      tile: registry.activeTileDescriptor(),
      water: registry.activeWaterDescriptor(),
      board: registry.listBoardContracts(),
    };
  });
  const hash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  await context.close();
  return { hash, payload, errors };
}

test('fresh E1 profile stays unchanged and the pre-flip determinism hash is identical', async ({ page, browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chrome', 'one deterministic proof is enough');
  test.setTimeout(90_000);
  await seedProfile(page, false);
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activeEpochId();
    }),
  ).toBe(FRONTIER);
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.listContracts().map((contract) => contract.id);
    }),
  ).toEqual(E1_CONTRACTS);

  const absent = await preflipFingerprint(browser, false);
  const explicit = await preflipFingerprint(browser, true);
  const report = {
    seed: '072-preflip',
    absentKeyHash: absent.hash,
    explicitE1Hash: explicit.hash,
  };
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await writeFile(path.join(ARTIFACT_DIR, 'preflip-determinism.json'), `${JSON.stringify(report, null, 2)}\n`);

  expect(absent.hash).toBe(explicit.hash);
  expect(absent.payload).toEqual(explicit.payload);
  expect(absent.errors).toEqual({ consoleErrors: [], pageErrors: [] });
  expect(explicit.errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('the completed Stamp Mill activates E2 once, stages the ceremony, and makes Hill Mine playable after reload', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);
  await seedProfile(page, true);
  await openSchoolhouse(page);

  await expect(page.getByTestId('stamp-mill-epoch-door')).toContainText('420 gold pledged');
  await expect(page.getByTestId('raise-stamp-mill')).toHaveText('Raise the Stamp Mill');
  await page.getByTestId('raise-stamp-mill').click();

  await expectCeremonyStep(page, 'e2-ceremony-mill', 'kit-stamp-mill', 'The Stamp Mill rises.');
  await shot(page, testInfo, 'ceremony-1-mill-rises');
  await page.locator('[data-story-ceremony-continue]').click();
  await expectCeremonyStep(page, 'e2-ceremony-valley', 'kit-era-2', 'The valley takes its first new shape.');
  await shot(page, testInfo, 'ceremony-2-valley-transforms');
  await page.locator('[data-story-ceremony-continue]').click();
  await expectCeremonyStep(page, 'e2-ceremony-title', 'kit-era-2', 'Epoch 2');
  await expect(page.getByTestId('story-beat-card')).toContainText('The Steamworks');
  await shot(page, testInfo, 'ceremony-3-epoch-title');

  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(STEAMWORKS);
  expect(await page.evaluate((key) => localStorage.getItem(key), EPOCH_CEREMONY_KEY)).toBe(STEAMWORKS);
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey('casey', ACTIVE_EPOCH_KEY))).toBeNull();
  expect(await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeEpochId)).toBe(STEAMWORKS);
  expect(
    await page.evaluate(async (frontier) => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activateEpoch(frontier);
    }, FRONTIER),
  ).toBe(false);

  await page.locator('[data-story-ceremony-continue]').click();
  await expect(page.locator('.story-beat-card--ceremony')).toHaveCount(0); // ceremony gone; OTHER queued beats (e.g. ledger-page discoveries) are legitimate on the merged tree
  await expect(page.getByTestId('research-next-epoch')).toHaveAttribute('data-epoch-state', 'active');
  await expect(page.getByTestId('research-next-epoch')).toContainText('active in town');

  await page.reload();
  await openBoard(page);
  const board = await page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return {
      activeEpoch: registry.activeEpochId(),
      ids: registry.listBoardContracts().map((contract) => contract.id),
      hillRoster: registry.loadContract('e2-hill-mine').twist.enemyRoster?.map((enemy) => enemy.id),
    };
  });
  expect(board.activeEpoch).toBe(STEAMWORKS);
  expect(board.ids).toEqual([...E1_CONTRACTS, 'e2-hill-mine']);
  expect(board.hillRoster).toEqual(['rail_tough', 'steam_wrecker', 'coal_thief']);

  await page.getByTestId('contract-page-dot-e2-hill-mine').click();
  await expect(page.getByTestId('contract-card-e2-hill-mine')).toHaveAttribute('data-contract-locked', 'false');
  await expect(page.getByTestId('contract-launch-e2-hill-mine')).toHaveText('Launch');
  await page.getByTestId('contract-launch-e2-hill-mine').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e2-hill-mine');
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activeContract().twist.enemyRoster?.map((enemy) => enemy.id);
    }),
  ).toEqual(['rail_tough', 'steam_wrecker', 'coal_thief']);
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activeTileDescriptor().id;
    }),
  ).toBe('e2-hill-mine');

  await page.reload();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(
    await page.evaluate(async () => {
      const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
      return registry.activeEpochId();
    }),
  ).toBe(STEAMWORKS);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e2-hill-mine');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('the E2 ceremony can be skipped without undoing activation', async ({ page }) => {
  const errors = collectErrors(page);
  await seedProfile(page, true);
  await openSchoolhouse(page);
  await page.getByTestId('raise-stamp-mill').click();
  await expectCeremonyStep(page, 'e2-ceremony-mill', 'kit-stamp-mill', 'The Stamp Mill rises.');
  await page.locator('[data-story-ceremony-skip]').click();
  await expect(page.locator('.story-beat-card--ceremony')).toHaveCount(0); // ceremony gone; OTHER queued beats (e.g. ledger-page discoveries) are legitimate on the merged tree
  expect(await page.evaluate((key) => localStorage.getItem(key), ACTIVE_EPOCH_KEY)).toBe(STEAMWORKS);
  await expect(page.getByTestId('research-next-epoch')).toHaveAttribute('data-epoch-state', 'active');
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
