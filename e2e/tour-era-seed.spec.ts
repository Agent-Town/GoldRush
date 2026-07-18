import { expect, test, type Page } from '@playwright/test';
import { PROFILE_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const ATOMIC = 'epoch-6-atomic';
const RED_FIELDS = 'epoch-9-redfields';
const TOUR_PROFILE = 'tour';
const OTHER_PROFILE = 'casey';

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function seedProfiles(page: Page, tourEpoch = STEAMWORKS): Promise<void> {
  await page.addInitScript(
    ({ profileKey, tourEpochKey, otherEpochKey, tourEpoch, frontier }) => {
      localStorage.clear();
      sessionStorage.clear();
      const state: ProfileState = {
        version: 2,
        activeId: 'tour',
        profiles: [
          { id: 'tour', name: 'Tour', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
          { id: 'casey', name: 'Casey', createdAt: 2, updatedAt: 2, difficultyPreset: 'trail', hintsSeen: [] },
        ],
      };
      localStorage.setItem(profileKey, JSON.stringify(state));
      localStorage.setItem(tourEpochKey, tourEpoch);
      localStorage.setItem(otherEpochKey, frontier);
    },
    {
      profileKey: PROFILE_KEY,
      tourEpochKey: profileDataKey(TOUR_PROFILE, ACTIVE_EPOCH_KEY),
      otherEpochKey: profileDataKey(OTHER_PROFILE, ACTIVE_EPOCH_KEY),
      tourEpoch,
      frontier: FRONTIER,
    },
  );
}

test('an earlier era door overrides a later persisted tour era for this run', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfiles(page, RED_FIELDS);
  await page.goto('/?contract=e6-showroom&debug&era=6');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const result = await page.evaluate(
    ({ activeEpochKey, researchKey }) => ({
      contract: window.__THREE_GAME_DIAGNOSTICS__!.contract,
      arsenal: window.__THREE_GAME_DIAGNOSTICS__!.e6Arsenal,
      breadcrumb: document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.seededEra,
      persistedEpoch: localStorage.getItem(activeEpochKey),
      research: JSON.parse(localStorage.getItem(researchKey) ?? 'null'),
    }),
    {
      activeEpochKey: profileDataKey(TOUR_PROFILE, ACTIVE_EPOCH_KEY),
      researchKey: profileDataKey(TOUR_PROFILE, researchStateKey(ATOMIC)),
    },
  );

  expect(result.contract).toMatchObject({ activeId: 'e6-showroom', epochId: ATOMIC });
  expect(result.arsenal).toMatchObject({ eraActive: true });
  expect(result.arsenal.items).toContain('sunlineBeam');
  expect(result.breadcrumb).toBe('6');
  expect(result.persistedEpoch).toBe(RED_FIELDS);
  expect(result.research.taken).toContain('sunline_beam');
  expect(errors).toEqual([]);
});

test('debug era door arms E9 and grants its arsenal only to the active profile', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfiles(page);
  await page.goto('/?contract=e9-dome-basin&debug&era=9');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const result = await page.evaluate(
    ({ activeEpochKey, researchKey, otherEpochKey, otherResearchKey }) => ({
      contract: window.__THREE_GAME_DIAGNOSTICS__!.contract,
      arsenal: window.__THREE_GAME_DIAGNOSTICS__!.e9Arsenal,
      breadcrumb: document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.seededEra,
      activeEpoch: localStorage.getItem(activeEpochKey),
      research: JSON.parse(localStorage.getItem(researchKey) ?? 'null'),
      otherEpoch: localStorage.getItem(otherEpochKey),
      otherResearch: localStorage.getItem(otherResearchKey),
    }),
    {
      activeEpochKey: profileDataKey(TOUR_PROFILE, ACTIVE_EPOCH_KEY),
      researchKey: profileDataKey(TOUR_PROFILE, researchStateKey(RED_FIELDS)),
      otherEpochKey: profileDataKey(OTHER_PROFILE, ACTIVE_EPOCH_KEY),
      otherResearchKey: profileDataKey(OTHER_PROFILE, researchStateKey(RED_FIELDS)),
    },
  );

  expect(result.contract).toMatchObject({ activeId: 'e9-dome-basin', epochId: RED_FIELDS });
  expect(result.arsenal).toMatchObject({ eraActive: true });
  expect(result.arsenal.items).toContain('terraformCannon');
  expect(result.breadcrumb).toBe('9');
  expect(result.activeEpoch).toBe(RED_FIELDS);
  expect(result.research).toMatchObject({ steps: 22 });
  expect(result.research.taken).toContain('terraform_cannon');
  expect(result.otherEpoch).toBe(FRONTIER);
  expect(result.otherResearch).toBeNull();
  expect(errors).toEqual([]);
});

test('era parameter is inert without debug', async ({ page }) => {
  const errors = watchErrors(page);
  await seedProfiles(page);
  await page.goto('/?contract=e9-dome-basin&era=9');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  const result = await page.evaluate(
    ({ activeEpochKey, researchKey }) => ({
      contract: window.__THREE_GAME_DIAGNOSTICS__!.contract,
      breadcrumb: document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.seededEra ?? null,
      activeEpoch: localStorage.getItem(activeEpochKey),
      research: localStorage.getItem(researchKey),
    }),
    {
      activeEpochKey: profileDataKey(TOUR_PROFILE, ACTIVE_EPOCH_KEY),
      researchKey: profileDataKey(TOUR_PROFILE, researchStateKey(RED_FIELDS)),
    },
  );

  expect(result.contract).toMatchObject({ activeId: 'the-claim', epochId: STEAMWORKS, fallbackReason: 'debug-disabled' });
  expect(result.breadcrumb).toBeNull();
  expect(result.activeEpoch).toBe(STEAMWORKS);
  expect(result.research).toBeNull();
  expect(errors).toEqual([]);
});
