import { execFileSync } from 'node:child_process';
import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  PROFILE_KEY,
  SCOREBOARD_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const CONTRACTS = ['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'] as const;
const LAUNCH_KEY = 'gr.contract.launch.v1';
const SEEDED_KEY = 'gr.release-build.seeded';

test('first player creates a profile, hears Mei, opens the Book, runs the Claim, and returns to town', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = watchErrors(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('gr.release-build.first-player')) return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('gr.release-build.first-player', '1');
  });
  await page.goto('/');
  await page.getByTestId('profile-name-input').fill('Mina');
  await page.getByTestId('profile-create').click();
  await waitForTown(page);
  await page.getByTestId('town-name-input').fill('Aurora Bend');
  await page.getByTestId('town-name-submit').click();
  await expect(page.getByTestId('story-beat-card')).toHaveAttribute('data-beat-id', 'founding-welcome');
  await page.mouse.click(6, 6);

  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.firstClaimGuide.greetingVisible)).toBe(true);
  await page.mouse.click(6, 6);
  await teleportToActor(page, 'newsie');
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activeBark?.actorId ?? null)).toBe('newsie');
  await teleportToBuilding(page, 'tavern');
  await page.getByTestId('town-open-board').click();
  await expect(page.getByTestId('contract-board')).toBeVisible();
  if (await page.getByTestId('story-beat-card').isVisible().catch(() => false)) await page.mouse.click(6, 6);
  await page.getByTestId('contract-launch-the-claim').click();
  await waitForContract(page, 'the-claim');
  if (await page.getByTestId('contract-briefing').isVisible().catch(() => false)) {
    await page.getByTestId('contract-briefing-dismiss').click();
  }
  await page.keyboard.press('Escape');
  await page.getByTestId('pause-back-to-town').click();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.getByTestId('start-menu-enter-town').click();
  await waitForTown(page);
  expect(errors).toEqual([]);
});

for (const contractId of CONTRACTS) {
  test(`${contractId} boots through the E1 release door`, async ({ page }) => {
    const errors = watchErrors(page);
    await seedProfile(page, { contractId, unlocked: true });
    await page.goto(`/?contract=${contractId}`);
    await waitForContract(page, contractId);
    expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
    expect(errors).toEqual([]);
  });
}

test('debug and era query seams are inert', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page, { unlocked: true });
  await page.goto('/?debug&era=5&contract=e1-baron');
  await waitForContract(page, 'the-claim');
  expect(await page.evaluate(() => ({
    epoch: localStorage.getItem('gr.activeEpoch.v1'),
    seam: typeof window.__GR_TEST__,
    gui: typeof window.__GR_GUI__,
    agent: typeof window.__GR_AGENT__,
    telemetry: typeof window.__GR_TELEMETRY__,
    seededEra: document.querySelector('canvas')?.dataset.seededEra,
  }))).toEqual({
    epoch: FRONTIER,
    seam: 'undefined',
    gui: 'undefined',
    agent: 'undefined',
    telemetry: 'undefined',
    seededEra: undefined,
  });
  expect(errors).toEqual([]);
});

test('an imported later ledger heals to the frontier and plays', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page, { unlocked: true });
  await page.goto('/');
  await page.getByTestId('start-menu-profile').click();
  const futureResearchKey = 'gr.research.epoch-7-signal.v1';
  const envelope = {
    kind: 'goldrush.profile.ledger',
    version: 1,
    exportedAt: '2026-07-23T00:00:00.000Z',
    profile: { id: 'future', name: 'Future Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
    data: {
      [ACTIVE_EPOCH_KEY]: 'epoch-7-signal',
      [futureResearchKey]: { version: 1, epochId: 'epoch-7-signal', taken: ['signal-array'], proposalSalt: 0, pinnedTarget: null },
    },
  };
  await page.getByTestId('profile-import-file').setInputFiles({
    name: 'future-ledger.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(envelope)),
  });
  await page.getByTestId('profile-import-apply').click();
  const importedId = await page.evaluate((profileKey) => {
    const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
    return state.profiles.find((profile) => profile.name === 'Future Robin')?.id ?? '';
  }, PROFILE_KEY);
  expect(importedId).not.toBe('');
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, futureResearchKey))).not.toBeNull();
  await page.goto('/?contract=the-claim');
  await waitForContract(page, 'the-claim');
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, ACTIVE_EPOCH_KEY))).toBe(FRONTIER);
  expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, futureResearchKey))).not.toBeNull();
  expect(errors).toEqual([]);
});

test('later flagship URLs decline to the Claim', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page, { unlocked: true });
  for (const contractId of ['e7-relay-valley', 'e10-last-claim']) {
    await page.goto(`/?contract=${contractId}`);
    await waitForContract(page, 'the-claim');
  }
  expect(errors).toEqual([]);
});

test('a forged locked launch declines to the Claim', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page, { contractId: 'e1-baron', unlocked: false });
  await page.goto('/?contract=e1-baron');
  await waitForContract(page, 'the-claim');
  expect(await page.evaluate((key) => sessionStorage.getItem(key), LAUNCH_KEY)).toBeNull();
  expect(errors).toEqual([]);
});

test('a legitimate suspend resumes its unlocked contract', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfile(page, { unlocked: true });
  await page.goto('/');
  // continueSavedRun stages the saved contract through this exact launch seam.
  await page.evaluate(([key, id]) => sessionStorage.setItem(key, id), [LAUNCH_KEY, 'e1-dry-gulch']);
  await page.goto('/?contract=e1-dry-gulch');
  await waitForContract(page, 'e1-dry-gulch');
  expect(errors).toEqual([]);
});

test('dist has no later manifest ids or plate/GLB assets', () => {
  expect(() => execFileSync(process.execPath, ['scripts/assert-release-build.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, GR_RELEASE: 'e1' },
  })).not.toThrow();
});

async function seedProfile(
  page: Page,
  options: { contractId?: string; unlocked: boolean; activeEpoch?: string },
): Promise<void> {
  await page.addInitScript(({ keys, launchKey, seededKey, contractId, unlocked, frontier, activeEpoch, threshold, taken }) => {
    if (sessionStorage.getItem(seededKey)) return;
    localStorage.clear();
    sessionStorage.clear();
    const profile: ProfileState = {
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    };
    localStorage.setItem(keys.profile, JSON.stringify(profile));
    localStorage.setItem(keys.town, 'Quartz Hill');
    localStorage.setItem(keys.firstClaim, '1');
    localStorage.setItem(keys.activeEpoch, activeEpoch ?? frontier);
    localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: unlocked ? threshold : 0, hero: 0, agent: 0 } }));
    localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken: unlocked ? taken : [], proposalSalt: 0, pinnedTarget: null }));
    if (unlocked) {
      localStorage.setItem(keys.scores, JSON.stringify([
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' },
        { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 2, secured: true, contractId: 'e1-dry-gulch', profileName: 'Robin' },
      ]));
    }
    if (contractId) sessionStorage.setItem(launchKey, contractId);
    sessionStorage.setItem(seededKey, '1');
  }, {
    keys: {
      profile: PROFILE_KEY,
      town: profileDataKey('robin', TOWN_NAME_KEY),
      firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
      activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      meta: profileDataKey('robin', META_PROGRESS_KEY),
      research: profileDataKey('robin', RESEARCH_STATE_KEY),
      scores: profileDataKey('robin', SCOREBOARD_KEY),
    },
    launchKey: LAUNCH_KEY,
    seededKey: SEEDED_KEY,
    contractId: options.contractId,
    unlocked: options.unlocked,
    frontier: FRONTIER,
    activeEpoch: options.activeEpoch,
    threshold: STEAMWORKS_THRESHOLD,
    taken: RESEARCH_NODES.map((node) => node.id),
  });
}

async function waitForContract(page: Page, contractId: string): Promise<void> {
  await page.waitForFunction((id) =>
    window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
  contractId);
}

async function waitForTown(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function teleportToActor(page: Page, actorId: string): Promise<void> {
  await page.evaluate((id) => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const actor = town.actors.find((entry) => entry.id === id)!;
    town.teleport(actor.position.x, actor.position.z);
  }, actorId);
}

async function teleportToBuilding(page: Page, buildingId: string): Promise<void> {
  await page.evaluate((id) => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const building = town.buildings.find((entry) => entry.id === id)!;
    town.teleport(building.approach.x, building.approach.z);
  }, buildingId);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe(buildingId);
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}
