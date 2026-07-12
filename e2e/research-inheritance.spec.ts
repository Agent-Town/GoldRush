import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { PROFILE_KEY, RUN_SUSPEND_KEY, TOWN_NAME_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const FRONTIER = 'epoch-1-frontier';
const STEAMWORKS = 'epoch-2-steamworks';
const TAKEN = ['assay_grading', 'second_order_slot', 'chain_spark_primer'];
const SCHOOLHOUSE = { x: -8.2, z: 5.4 };
const SHOT_DIR = 'artifacts/research-inheritance';

test('Frontier science remains live, visible, and suspend-canonical in Steamworks', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await seedSteamworks(page);

  await page.goto('/?debug&timescale=10&nokill&nolevel&nosteal&nowreck&seed=research-inheritance');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ prospectors_luck: 1 }));

  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(diagnostics.research.taken).toEqual([]);
  expect(diagnostics.research.assayOrderSlots).toBe(Balance.research.secondOrderSlots);
  expect(diagnostics.economy.bankCap).toBe(Balance.economy.bankCap + Balance.research.assayGradingStockpileCapBonus);
  expect(diagnostics.progression.eligibility).toContain('chain_spark_arc');

  const firstSuspend = await waitForSuspend(page, 1);
  const canonicalResearch = JSON.stringify(firstSuspend.research);
  const canonicalHash = createHash('sha256').update(canonicalResearch).digest('hex');
  await page.reload();
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().assayOrderSlots)).toBe(Balance.research.secondOrderSlots);
  const resaved = await waitForSuspend(page, 2);
  expect(JSON.stringify(resaved.research)).toBe(canonicalResearch);
  console.log(`[research-inheritance] suspend research canonical sha256 ${canonicalHash}`);

  await openSchoolhouse(page);
  await expect(page.getByTestId('research-era-row')).toBeVisible();
  await expect(page.getByTestId(`research-era-${FRONTIER}`)).toHaveText('The Frontier — complete ✓');
  await expect(page.getByTestId(`research-era-${STEAMWORKS}`)).toHaveText('The Steamworks — active');
  await shot(page, testInfo, 'era-row');

  await page.getByTestId(`research-era-${FRONTIER}`).click();
  await expect(page.getByTestId('research-chart')).toHaveAttribute('data-research-readonly', 'true');
  await expect(page.getByTestId('research-chart-node-assay_grading')).toHaveAttribute('data-research-state', 'taken');
  await expect(page.getByTestId('research-chart-node-second_order_slot')).toHaveAttribute('data-research-state', 'taken');
  await expect(page.getByTestId('research-chart-node-assay_grading')).toBeDisabled();
  await expect(page.getByTestId('research-chart-pin')).toHaveCount(0);
  await shot(page, testInfo, 'frontier-readonly');

  expect(errors).toEqual({ console: [], page: [] });
});

async function seedSteamworks(page: Page): Promise<void> {
  await page.addInitScript(
    ({ profileKey, activeKey, metaKey, frontierKey, steamworksKey, townKey, steamworks, taken }) => {
      if (sessionStorage.getItem('research-inheritance-seeded') === 'true') return;
      localStorage.clear();
      sessionStorage.clear();
      const profile: ProfileState = {
        version: 2,
        activeId: 'robin',
        profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
      };
      localStorage.setItem(profileKey, JSON.stringify(profile));
      localStorage.setItem(activeKey, steamworks);
      localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
      localStorage.setItem(
        frontierKey,
        JSON.stringify({ version: 1, steps: 6, taken, proposalSalt: 3, pinnedTarget: null }),
      );
      localStorage.setItem(
        steamworksKey,
        JSON.stringify({ version: 1, steps: 0, metaScienceCursor: 6, taken: [], proposalSalt: 0, pinnedTarget: null }),
      );
      localStorage.setItem(townKey, 'Quartz Hill');
      sessionStorage.setItem('research-inheritance-seeded', 'true');
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
    },
  );
}

async function waitForSuspend(page: Page, minimumWave: number): Promise<{ wave: number; research: unknown }> {
  await page.waitForFunction(
    ([key, wave]) => {
      try {
        return (JSON.parse(localStorage.getItem(key) ?? 'null') as { wave?: number } | null)?.wave! >= wave;
      } catch {
        return false;
      }
    },
    [RUN_SUSPEND_KEY, minimumWave] as const,
    { timeout: 15_000 },
  );
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!) as { wave: number; research: unknown }, RUN_SUSPEND_KEY);
}

async function openSchoolhouse(page: Page): Promise<void> {
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
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}
