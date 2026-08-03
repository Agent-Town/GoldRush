import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  RUN_HISTORY_KEY,
  RUN_SUSPEND_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  TOWN_WELCOME_SEEN_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { RUN_TAPES_KEY } from '../src/game/RunTape';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../src/encyclopedia/storage';
import { loadEpoch } from '../src/meta/ContractFamilies';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

const ARTIFACT_DIR = path.resolve('artifacts/drill-yard-affordances');
const E1_CLAIM_COUNT = loadEpoch('epoch-1-frontier').contracts.filter((contract) => !contract.practice).length;
const PRACTICE_BUILDABLES = ['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office', 'lantern_post'] as const;
const BUILD_SITES: Record<(typeof PRACTICE_BUILDABLES)[number], { x: number; z: number }> = {
  sentry_beacon: { x: -24, z: 18 },
  palisade: { x: -18, z: 18 },
  sluice: { x: 24, z: 7 },
  stockpile: { x: -10, z: 18 },
  turret: { x: -4, z: 18 },
  assay_office: { x: -24, z: 7 },
  lantern_post: { x: 12, z: 18 },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ keys }) => {
      if (sessionStorage.getItem('__drill_yard_seeded') === '1') return;
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('__drill_yard_seeded', '1');
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
      };
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      localStorage.setItem(keys.town, 'Quartz Hill');
      localStorage.setItem(keys.welcome, '1');
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 2, science: 0, hero: 1, agent: 0 } }));
      localStorage.setItem(keys.scores, '[]');
      localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken: [], proposalSalt: 0 }));
    },
    {
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        welcome: profileDataKey('robin', TOWN_WELCOME_SEEN_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        scores: profileDataKey('robin', SCOREBOARD_KEY),
        research: profileDataKey('robin', RESEARCH_STATE_KEY),
      },
    },
  );
});

test('plain boot keeps the Drill Yard visible and launchable on both sides of the welcome', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const watch = watchErrors(page);

  await page.goto('/');
  expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  await page.getByTestId('start-menu-enter-town').click();
  await openBoard(page);

  await page.getByTestId('contract-board-close').click();
  await page.evaluate((key) => localStorage.setItem(key, '0'), profileDataKey('robin', TOWN_WELCOME_SEEN_KEY));
  await page.getByTestId('town-open-board').click();
  const preWelcomeCount = await page.getByTestId('contract-card-list').locator('[data-contract-id]').count();
  expect(preWelcomeCount).toBe(E1_CLAIM_COUNT);

  await page.getByTestId('contract-board-close').click();
  await page.evaluate((key) => localStorage.setItem(key, '1'), profileDataKey('robin', TOWN_WELCOME_SEEN_KEY));
  await page.getByTestId('town-open-board').click();
  const postWelcomeCount = await page.getByTestId('contract-card-list').locator('[data-contract-id]').count();
  expect(postWelcomeCount).toBe(E1_CLAIM_COUNT);

  await expect(page.getByTestId('contract-chapter-epoch-1-frontier').getByTestId('contract-card-e1-drill-yard')).toHaveCount(0);
  await expect(page.getByTestId('training-ground')).toContainText('THE TRAINING GROUND');
  await expect(page.getByTestId('contract-card-e1-drill-yard')).toBeVisible();
  await expect(page.getByTestId('contract-card-e1-drill-yard')).toHaveAttribute('data-training-ground', 'true');
  await expect(page.getByTestId('contract-board-briefing-e1-drill-yard')).toHaveCount(0);
  await expect(page.getByTestId('contract-best-e1-drill-yard')).toHaveCount(0);
  await expect(page.getByTestId('contract-flavor-e1-drill-yard')).toHaveText(
    'Practice ground — no stakes, no claim. The county lends the gold; the straw men lend their patience.',
  );
  await expect(page.getByTestId('contract-launch-e1-drill-yard')).toHaveText('Enter the yard');
  await shot(page, testInfo, 'after-board', 'e1-drill-yard');
  await page.getByTestId('contract-launch-e1-drill-yard').click();
  await expect.poll(() => new URL(page.url()).searchParams.get('contract')).toBe('e1-drill-yard');
  await expect(page.getByTestId('drill-yard-exit')).toBeVisible({ timeout: 15_000 });
  const trainingTag = page.getByTestId('drill-yard-training-tag');
  await expect(trainingTag).toBeVisible();
  await expect(trainingTag).toHaveText('DRILL YARD — training');
  await page.keyboard.press('KeyP');
  const pauseTraining = page.getByTestId('pause-drill-yard-training');
  await expect(pauseTraining).toBeVisible();
  await expect(pauseTraining).toHaveText('This is practice. Nothing is at stake. Leave anytime.');
  expectNoConsoleErrors(watch);
});

test('The Drill Yard is a resettable, ledger-free practice claim', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const watch = watchErrors(page);
  let standingsRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('standings')) standingsRequests += 1;
  });

  await page.goto('/');
  await page.evaluate(() => history.replaceState(null, '', '/?debug&nolevel&nopause&seed=drill-yard-pc01'));
  await page.getByTestId('start-menu-enter-town').click();
  await openBoard(page);

  const card = page.getByTestId('contract-card-e1-drill-yard');
  await expect(card).toBeVisible();
  await expect(card).toContainText('The Drill Yard');
  await expect(card).toContainText('Practice ground — no stakes, no claim.');
  await expect(card).toHaveAttribute('data-contract-locked', 'false');
  await shot(page, testInfo, 'card');
  const storageBeforeLaunch = await persistenceSnapshot(page);
  const ledgerBeforeLaunch = await ledgerIds(page);
  await page.getByTestId('contract-launch-e1-drill-yard').click();
  await waitForYard(page);
  const storageBeforePractice = await persistenceSnapshot(page);
  expect(storageBeforePractice[FIRST_CLAIM_DONE_KEY]).toBe(storageBeforeLaunch[FIRST_CLAIM_DONE_KEY]);
  expect(storageBeforePractice[profileDataKey('robin', FIRST_CLAIM_DONE_KEY)]).toBe(
    storageBeforeLaunch[profileDataKey('robin', FIRST_CLAIM_DONE_KEY)],
  );
  const ledgerAfterLaunch = await ledgerIds(page);
  expect(ledgerAfterLaunch.filter((id) => !ledgerBeforeLaunch.includes(id))).toEqual([]);

  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  expect(contract.practice).toMatchObject({
    scheduledWaves: false,
    scores: false,
    metaProgress: false,
    runHistory: false,
    standings: false,
    tapes: false,
    bellWaveSize: 8,
    buildables: [...PRACTICE_BUILDABLES],
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal)).toBe(0);

  await page.evaluate(() => window.__GR_TEST__!.teleport(-8, 12));
  await expect(page.getByTestId('drill-yard-prompt')).toContainText('The county desk lends practice gold.');
  await expect(page.getByTestId('drill-yard-action')).toHaveText('Draw practice gold');
  await shot(page, testInfo, 'faucet-prompt');
  await page.getByTestId('drill-yard-action').click();
  const faucet = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
    event: window.__GR_TEST__!.economyLog().at(-1),
  }));
  expect(faucet.gold).toBeGreaterThan(0);
  expect(faucet.event).toMatchObject({ type: 'gold_granted', source: 'practice', practice: true });

  const builds = await page.evaluate(({ ids, sites }) => ({
    offered: window.__THREE_GAME_DIAGNOSTICS__!.ui!.buildables.map((entry) => entry.id),
    placed: ids.map((id) => window.__GR_TEST__!.placeFree(id, sites[id].x, sites[id].z)),
  }), { ids: [...PRACTICE_BUILDABLES], sites: BUILD_SITES });
  expect(builds.offered).toEqual(expect.arrayContaining([...PRACTICE_BUILDABLES]));
  expect(builds.placed).toEqual(PRACTICE_BUILDABLES.map(() => true));

  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setBalance('blast.damage', 999);
    window.__GR_TEST__!.teleport(-9, -9);
    window.__GR_TEST__!.advanceSim(0.1);
  });
  await expect(page.getByTestId('world-info-note-title')).toHaveText('Straw men');
  await expect(page.getByTestId('world-info-note-body')).toHaveText("Straw men — they don't mind.");
  await shot(page, testInfo, 'straw-men-prompt');
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(0, -5);
    window.__GR_TEST__!.launchBlastAt(0, -9, 0.01);
    window.__GR_TEST__!.advanceSim(0.3);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.drillYard!.targets[2]!.falls)).toBe(1);
  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(0, -13);
    window.__GR_TEST__!.advanceSim(0.1);
  });
  await shot(page, testInfo, 'yard-dummies');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.drillYard!.targets[2]!.state)).toBe('standing');

  await page.evaluate(() => {
    window.__GR_TEST__!.teleport(8, 12);
    window.__GR_TEST__!.advanceSim(0.1);
  });
  await expect(page.getByTestId('drill-yard-prompt')).toContainText('The drill bell calls one practice wave.');
  await expect(page.getByTestId('drill-yard-action')).toHaveText('Ring for a practice wave');
  await shot(page, testInfo, 'bell-prompt');
  await page.getByTestId('drill-yard-action').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.drillYard!.bell.waveActive)).toBe(true);
  const basicJumpers = await page.evaluate(() => window.__GR_TEST__!.enemyPositions().filter((enemy) => !enemy.variantId?.startsWith('drill_')));
  expect(basicJumpers).toHaveLength(8);
  await shot(page, testInfo, 'bell-wave');
  await page.evaluate(() => {
    window.__GR_TEST__!.clearEnemies();
    window.__GR_TEST__!.advanceSim(0.2);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.drillYard!.bell)).toMatchObject({
    waveActive: false,
    wavesCompleted: 1,
  });

  await page.evaluate(() => {
    window.__GR_TEST__!.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__!.teleport(0, 12);
    window.__GR_TEST__!.spawnPack(1, 0.1, { speedScale: 0 });
    window.__GR_TEST__!.advanceSim(1);
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('dead');
  await expect(page.getByTestId('research-overlay')).toHaveCount(0);
  await expect(page.getByTestId('keep-run-tape')).toHaveCount(0);
  await page.evaluate(() => {
    window.__GR_TEST__!.resetRun();
    window.__GR_TEST__!.setBalance('enemy.contactDamage', 8);
  });
  await expect(page.getByTestId('death-overlay')).toHaveAttribute('aria-hidden', 'true');

  await page.getByTestId('drill-yard-exit').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('contract-board')).toBeVisible();
  expect(await persistenceSnapshot(page)).toEqual(storageBeforePractice);
  expect((await ledgerIds(page)).filter((id) => !ledgerBeforeLaunch.includes(id))).toEqual([]);
  await page.getByTestId('contract-launch-e1-drill-yard').click();
  await waitForYard(page);
  const fresh = await page.evaluate(() => ({
    gold: window.__THREE_GAME_DIAGNOSTICS__!.economy.gold,
    builds: window.__THREE_GAME_DIAGNOSTICS__!.ui!.buildables.map((entry) => entry.count),
    yard: window.__THREE_GAME_DIAGNOSTICS__!.drillYard,
    run: window.__THREE_GAME_DIAGNOSTICS__!.run,
  }));
  expect(fresh.gold).toBe(0);
  expect(fresh.builds.every((count) => count === 0)).toBe(true);
  expect(fresh.yard).toMatchObject({ faucet: { grants: 0 }, bell: { rings: 0, wavesCompleted: 0 } });
  expect(fresh.yard!.targets.every((target) => target.falls === 0 && target.state === 'standing')).toBe(true);
  expect(fresh.run.meta).toBeNull();
  expect(await persistenceSnapshot(page)).toEqual(storageBeforePractice);
  expect(standingsRequests).toBe(0);
  expectNoConsoleErrors(watch);
});

async function openBoard(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
}

async function waitForYard(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.drillYard?.targets.length === 5);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await expect(briefing).toBeHidden();
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

async function shot(page: Page, testInfo: TestInfo, name: string, contractId?: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  if (contractId) await page.getByTestId(`contract-card-${contractId}`).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

async function persistenceSnapshot(page: Page): Promise<Record<string, string | null>> {
  const logicalKeys = [
    META_PROGRESS_KEY,
    SCOREBOARD_KEY,
    RUN_HISTORY_KEY,
    RUN_SUSPEND_KEY,
      RUN_TAPES_KEY,
      RESEARCH_STATE_KEY,
      FIRST_CLAIM_DONE_KEY,
  ];
  const keys = [...logicalKeys, ...logicalKeys.map((key) => profileDataKey('robin', key))];
  return page.evaluate((storageKeys) => Object.fromEntries(storageKeys.map((key) => [key, localStorage.getItem(key)])), keys);
}

async function ledgerIds(page: Page): Promise<string[]> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), LEDGER_DISCOVERED_STORAGE_KEY);
}
