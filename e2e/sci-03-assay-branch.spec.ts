import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { RESEARCH_NODES, RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const NON_CRAFTED_MAXED = {
  double_tap_coil: 6,
  heavy_spark: 3,
  long_resonator: 2,
  split_spark: 2,
  tinkers_plating: 3,
  spring_heels: 3,
  pan_legend: 2,
  prospectors_luck: 2,
  beacon_dynamo: 2,
  powder_charge: 2,
  wide_ring: 2,
  quick_fuse: 2,
  chain_spark_arc: 2,
  beacon_handoff: 2,
  rich_seam_pact: 2,
  spark_pressure_ring: 1,
  stockpile_seam_survey: 1,
};

const CRAFTED_MAXED = {
  crafted_craft_sci03_pan_receipt: 1,
  crafted_craft_sci03_spark_condenser: 1,
  crafted_craft_sci03_spring_boots: 1,
};
const TIER_CASES = [
  { tier: 1, taken: [] },
  { tier: 2, taken: ['second_order_slot', 'refined_assay'] },
  { tier: 3, taken: ['second_order_slot', 'refined_assay', 'pattern_library'] },
];

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, taken: string[], query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, researchKey, scoreKey, takenNodes }) => {
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: takenNodes.length, hero: 0, agent: 0 },
        }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt: 0 }));
    },
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY, scoreKey: SCOREBOARD_KEY, takenNodes: taken },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_CONTRACT_REGISTRY__);
  return errors;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

for (const entry of TIER_CASES) {
  test(`Assay research stamps contract tier ${entry.tier} into pending orders`, async ({ page }, testInfo: TestInfo) => {
    let path: string | null = null;
    const profile = `sci03_tier_${entry.tier}_${testInfo.project.name}`;
    const timestamp = `2026-07-07T06:3${entry.tier}:00.000Z`;
    const errors = await openGame(
      page,
      entry.taken,
      `?debug&nowaves&nolevel&profile=${encodeURIComponent(profile)}&queueNow=${encodeURIComponent(timestamp)}`,
    );
    await expect(page.getByTestId('assay-bench')).toBeVisible();
    expect(await page.evaluate(() => window.__GR_TEST__?.researchState().contractTier)).toBe(entry.tier);

    try {
      await page.getByTestId('assay-text').fill(`tier ${entry.tier} assay order`);
      await page.getByTestId('assay-post').click();
      await expect(page.getByTestId('assay-pending-status')).toHaveText('Posted');

      const request = await page.getByTestId('assay-pending-json').evaluate((el) => JSON.parse(el.textContent ?? '{}'));
      path = await page.getByTestId('assay-pending-path').textContent();
      expect(request.tier).toBe(entry.tier);
      expect(path).toBeTruthy();
      expect(JSON.parse(await readFile(resolve(process.cwd(), path!), 'utf8')).tier).toBe(entry.tier);
      assertNoErrors(errors);
    } finally {
      if (path) await rm(resolve(process.cwd(), path), { force: true });
    }
  });
}

test('contract tier budgets come from the epoch bundle', async ({ page }) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&nolevel&seed=sci-03-budgets');
  const checks = await page.evaluate(() => {
    const registry = window.__GR_CONTRACT_REGISTRY__;
    if (!registry) throw new Error('Missing contract registry');
    return registry.loadEpoch('epoch-1-frontier').contractTiers.flatMap((tier) =>
      (['common', 'uncommon', 'rare'] as const).map((rarity) => {
        const budget = tier.rarityBudgets[rarity];
        return {
          tier: tier.tier,
          rarity,
          budget,
          atCap: registry.contractBudgetOk('epoch-1-frontier', tier.tier, rarity, budget),
          overCap: registry.contractBudgetOk('epoch-1-frontier', tier.tier, rarity, budget + 0.01),
        };
      }),
    );
  });

  expect(checks.map((check) => [check.tier, check.rarity, check.budget])).toEqual([
    [1, 'common', 3],
    [1, 'uncommon', 5],
    [1, 'rare', 8],
    [2, 'common', 3.6],
    [2, 'uncommon', 6],
    [2, 'rare', 9.6],
    [3, 'common', 3.6],
    [3, 'uncommon', 6],
    [3, 'rare', 9.6],
  ]);
  expect(checks.every((check) => check.atCap === true && check.overCap === false)).toBe(true);
  assertNoErrors(errors);
});

test('Pattern Library offers family-tagged approved items with a 2-card cap', async ({ page }) => {
  const errors = await openGame(
    page,
    ['second_order_slot', 'refined_assay', 'pattern_library'],
    '?debug&timescale=3&nowaves&nolevel&profile=sci03_fixture&seed=sci-03-patterns',
  );
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
  }, {
    ...NON_CRAFTED_MAXED,
    crafted_craft_sci03_spark_condenser: 1,
    crafted_craft_sci03_spring_boots: 1,
  });
  expect(await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? [])).toContain('crafted_craft_sci03_pan_receipt');

  await page.evaluate((stacks) => window.__GR_TEST__?.setUpgradeStacks(stacks), NON_CRAFTED_MAXED);
  const offer = await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? []);
  const crafted = offer.filter((id) => id.startsWith('crafted_'));
  expect(crafted).toHaveLength(2);
  assertNoErrors(errors);
});

test('Pattern Library keeps approved fixtures scoped to their queue profile', async ({ page }) => {
  const errors = await openGame(
    page,
    ['second_order_slot', 'refined_assay', 'pattern_library'],
    '?debug&timescale=3&nowaves&nolevel&seed=sci-03-pattern-isolation',
  );
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
  }, NON_CRAFTED_MAXED);

  const offer = await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? []);
  expect(offer).not.toContain('crafted_craft_sci03_pan_receipt');
  expect(offer).not.toContain('crafted_craft_sci03_spark_condenser');
  expect(offer).not.toContain('crafted_craft_sci03_spring_boots');
  assertNoErrors(errors);
});

test('Agent Schooling appears after wave 15 and grants one run policy slot', async ({ page }) => {
  const errors = await openGame(
    page,
    ['second_order_slot', 'refined_assay', 'pattern_library', 'agent_schooling'],
    '?debug&timescale=3&nowaves&nolevel&profile=sci03_fixture&seed=sci-03-schooling',
  );
  await page.evaluate(
    ({ core, crafted }) => {
      window.__GR_TEST__?.setFillersDisabled(true);
      window.__GR_TEST__?.setUpgradeStacks({ ...core, ...crafted });
      window.__GR_TEST__?.setWave(15);
    },
    { core: NON_CRAFTED_MAXED, crafted: CRAFTED_MAXED },
  );
  expect(await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? [])).not.toContain('prospector_policy_slot');

  await page.evaluate(() => window.__GR_TEST__?.setWave(16));
  expect(await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? [])).toContain('prospector_policy_slot');

  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ prospector_policy_slot: 1 }));
  await expect.poll(() => page.evaluate(() => window.__GR_AGENT__?.state.permissionLevel ?? 0)).toBe(1);
  await expect(page.getByTestId('hud-agent-feed')).toContainText('Schooling: +1 policy slot');
  assertNoErrors(errors);
});

test('SCI-03 node copy stays effect-first and numbered', async () => {
  const nodes = RESEARCH_NODES.filter((node) => ['refined_assay', 'pattern_library', 'agent_schooling'].includes(node.id));

  expect(nodes.map((node) => node.name)).toEqual(['Refined Assay', 'Pattern Library', 'Agent Schooling']);
  expect(nodes.every((node) => /\d/.test(node.description) && /\d/.test(node.effect))).toBe(true);
});
