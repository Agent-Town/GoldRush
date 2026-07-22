import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  FIRST_CLAIM_DONE_KEY,
  MEDALS_KEY,
  PROFILE_KEY,
  TOWN_NAME_KEY,
  profileDataKey,
  type ProfileState,
} from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { MEGAPROJECT_STATE_KEY } from '../src/meta/Megaproject';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const DEEPWATER = 'epoch-5-deepwater';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedReadyFrontier(page: Page, url = '/'): Promise<void> {
  await page.addInitScript(
    ({ frontier, keys, threshold, taken }) => {
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
      localStorage.setItem(keys.activeEpoch, frontier);
      localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: threshold, hero: 0, agent: 0 } }));
      localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken, proposalSalt: 0, pinnedTarget: null }));
      localStorage.setItem(keys.medals, JSON.stringify({ version: 1, baronBeaten: true, rocketCartCaptured: true }));
      localStorage.setItem(
        keys.megaproject,
        JSON.stringify({
          version: 1,
          projects: { 'stamp-mill': { stage: 3, funded: false, ticksRemaining: 0, hp: 150, delayTicks: 0, defenseWave: 0 } },
        }),
      );
    },
    {
      frontier: FRONTIER,
      threshold: STEAMWORKS_THRESHOLD,
      taken: RESEARCH_NODES.map((node) => node.id),
      keys: {
        profile: PROFILE_KEY,
        town: profileDataKey('robin', TOWN_NAME_KEY),
        firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
        activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
        meta: profileDataKey('robin', META_PROGRESS_KEY),
        research: profileDataKey('robin', RESEARCH_STATE_KEY),
        medals: profileDataKey('robin', MEDALS_KEY),
        megaproject: profileDataKey('robin', MEGAPROJECT_STATE_KEY),
      },
    },
  );
  await page.goto(url);
}

async function enterTown(page: Page): Promise<void> {
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
}

async function openTownSurface(page: Page, buildingId: 'schoolhouse' | 'tavern', action: 'town-open-schoolhouse' | 'town-open-board'): Promise<void> {
  await page.evaluate((id) => {
    const diagnostics = window.__GR_TOWN_DIAGNOSTICS__!;
    const building = diagnostics.buildings.find((entry) => entry.id === id)!;
    diagnostics.teleport(building.approach.x, building.approach.z);
  }, buildingId);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe(buildingId);
  await page.getByTestId(action).click();
}

test('the E1 release frontier ends the Book at the horizon', async ({ page }) => {
  const errors = watchErrors(page);
  await seedReadyFrontier(page);
  await enterTown(page);
  await openTownSurface(page, 'schoolhouse', 'town-open-schoolhouse');

  const door = page.getByTestId('stamp-mill-epoch-door');
  await expect(door).toHaveAttribute('data-door-state', 'horizon');
  await expect(door).toContainText('The Stamp Mill stands ready.');
  await expect(page.getByTestId('release-frontier-horizon')).toHaveText('The era turns when the wider world sends word.');
  await expect(page.getByTestId('raise-stamp-mill')).toHaveCount(0);

  await page.getByTestId('schoolhouse-close').click();
  await openTownSurface(page, 'tavern', 'town-open-board');
  await expect(page.getByTestId('contract-chapter-nav').locator('[data-contract-page]')).toHaveCount(1);
  await expect(page.getByTestId('contract-chapter-tab-epoch-2-steamworks')).toHaveCount(0);
  expect(await page.getByTestId('contract-board').innerHTML()).not.toContain(STEAMWORKS);
  expect(errors).toEqual([]);
});

test('turning the release frontier off restores the Stamp Mill arm', async ({ page }) => {
  const errors = watchErrors(page);
  await seedReadyFrontier(page);
  await page.evaluate(async () => {
    const { Balance } = (await Function('return import("/src/game/Balance.ts")')()) as typeof import('../src/game/Balance');
    (Balance as { releaseFrontier: string | false | undefined }).releaseFrontier = false;
  });
  await enterTown(page);
  await openTownSurface(page, 'schoolhouse', 'town-open-schoolhouse');

  await expect(page.getByTestId('stamp-mill-epoch-door')).toHaveAttribute('data-door-state', 'ready');
  await page.getByTestId('raise-stamp-mill').click();
  await expect.poll(async () => page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return registry.activeEpochId();
  })).toBe(STEAMWORKS);
  expect(errors).toEqual([]);
});

test('debug era doors bypass the release frontier', async ({ page }) => {
  const errors = watchErrors(page);
  await seedReadyFrontier(page, '/?debug&era=5&contract=e5-regatta&nowaves&nolevel&nopause&seed=release-frontier-debug');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(async () => {
    const registry = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
    return registry.activeEpochId();
  })).toBe(DEEPWATER);
  expect(errors).toEqual([]);
});
