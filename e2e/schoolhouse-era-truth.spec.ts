import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const TAKEN = ['assay_grading', 'second_order_slot', 'chain_spark_primer', 'beacon_cadence'];
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };

// The research-inheritance spec gates the era row and the readonly Frontier view;
// this spec gates what the ACTIVE Steamworks chart itself shows (F-sci-e2), plus
// the reconcileActiveEpoch heal for a profile whose epoch pointer went missing
// (stale tab / profile-scope drift) while its era evidence survived.

test('the active Steamworks chart shows Steamworks science', async ({ page }) => {
  await runSchoolhouseCase(page, { seedActiveEpoch: true });
});

test('a profile with Steamworks evidence but no epoch pointer heals forward', async ({ page }) => {
  await runSchoolhouseCase(page, { seedActiveEpoch: false });
});

async function runSchoolhouseCase(page: Page, options: { seedActiveEpoch: boolean }): Promise<void> {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('PAGE: ' + e.message));
  await page.addInitScript(
    ({ profileKey, activeKey, metaKey, frontierKey, steamworksKey, townKey, steamworks, taken, seedActiveEpoch }) => {
      if (sessionStorage.getItem('era-truth-seeded') === 'true') return;
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      if (seedActiveEpoch) localStorage.setItem(activeKey, steamworks);
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(frontierKey, JSON.stringify({ version: 1, steps: 6, taken, proposalSalt: 3, pinnedTarget: null }));
      localStorage.setItem(
        steamworksKey,
        JSON.stringify({ version: 1, steps: 2, metaScienceCursor: 6, taken: [], proposalSalt: 0, pinnedTarget: null }),
      );
      localStorage.setItem(townKey, 'Quartz Hill');
      sessionStorage.setItem('era-truth-seeded', 'true');
    },
    {
      profileKey: PROFILE_KEY,
      activeKey: profileDataKey('robin', ACTIVE_EPOCH_KEY),
      metaKey: profileDataKey('robin', META_PROGRESS_KEY),
      frontierKey: profileDataKey('robin', researchStateKey(FRONTIER)),
      steamworksKey: profileDataKey('robin', researchStateKey(STEAMWORKS)),
      townKey: profileDataKey('robin', TOWN_NAME_KEY),
      steamworks: STEAMWORKS,
      taken: TAKEN,
      seedActiveEpoch: options.seedActiveEpoch,
    },
  );
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  for (let step = 0; step < 48; step += 1) {
    if ((await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)) === 'schoolhouse') break;
    const position = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.player ?? { x: 0, z: 0 });
    const keys = [] as string[];
    if (Math.abs(SCHOOLHOUSE.x - position.x) > 0.6) keys.push(SCHOOLHOUSE.x > position.x ? 'KeyD' : 'KeyA');
    if (Math.abs(SCHOOLHOUSE.z - position.z) > 0.6) keys.push(SCHOOLHOUSE.z > position.z ? 'KeyS' : 'KeyW');
    for (const key of keys) await page.keyboard.down(key);
    await page.waitForTimeout(160);
    for (const key of keys.reverse()) await page.keyboard.up(key);
  }
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();

  const chart = page.getByTestId('research-chart');
  await expect(chart).toBeVisible();
  await expect(chart).toHaveAttribute('data-research-readonly', 'false');
  await expect(page.getByTestId('research-era-row')).toBeVisible();
  await expect(page.getByTestId(`research-era-${STEAMWORKS}`)).toHaveText('The Steamworks — active');
  await expect(page.getByTestId('research-chart-node-pressure_assay')).toBeVisible();
  await expect(page.getByTestId('research-chart-node-assay_grading')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('gr.activeEpoch.v1'))).toBe(STEAMWORKS);
  expect(errors).toEqual([]);
}
