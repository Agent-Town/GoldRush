import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const BASELINE_MAXED = {
  double_tap_coil: Balance.upgrades.doubleTapCoilMaxStacks,
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
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, taken: string[] = [], query = '?debug&timescale=3&nowaves&seed=sci-04'): Promise<ErrorBucket> {
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

test('contract registry lists Frontier and locked Steamworks in order', async ({ page }) => {
  const errors = await openGame(page);
  const registry = await page.evaluate(() => {
    const contracts = window.__GR_CONTRACT_REGISTRY__;
    if (!contracts) throw new Error('Missing contract registry');
    return {
      epochs: contracts.listEpochs(),
      frontier: contracts.loadEpoch('epoch-1-frontier'),
      steamworks: contracts.loadEpoch('epoch-2-steamworks'),
    };
  });

  expect(registry.epochs.map((epoch) => epoch.id)).toEqual(['epoch-1-frontier', 'epoch-2-steamworks']);
  expect(registry.epochs.map((epoch) => epoch.displayName)).toEqual(['Frontier', 'Steamworks']);
  expect(registry.frontier).toMatchObject({ locked: false, threshold: 6 });
  expect(registry.frontier.gates).toEqual(['chain_spark_primer', 'beacon_cadence', 'pact_ledger', 'agent_schooling']);
  expect(registry.frontier.families.flatMap((family) => family.cards.map((card) => card.id))).toEqual([
    'chain_spark_arc',
    'beacon_handoff',
    'rich_seam_pact',
    'prospector_policy_slot',
  ]);
  expect(registry.frontier.contractTiers.map((tier) => tier.rarityBudgets.common)).toEqual([3, 3.6, 3.6]);
  expect(registry.steamworks).toMatchObject({
    id: 'epoch-2-steamworks',
    displayName: 'Steamworks',
    locked: true,
    threshold: null,
    families: [],
    gates: [],
    masteryConversions: [],
    synergyCards: [],
    contractTiers: [],
    contracts: [{ id: 'e2-hill-mine' }],
  });
  assertNoErrors(errors);
});

test('Frontier registry routing preserves gated Arsenal offers', async ({ page }) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&seed=sci-04-gated');
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
  }, BASELINE_MAXED);

  const before = await page.evaluate(() => Array.from({ length: 4 }, () => window.__GR_TEST__?.rollUpgradeOffer() ?? []).flat());
  expect(before).not.toContain('beacon_handoff');

  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('chain_spark_primer'))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('beacon_cadence'))).toBe(true);
  await page.evaluate((stacks) => window.__GR_TEST__?.setUpgradeStacks(stacks), {
    ...BASELINE_MAXED,
    chain_spark_arc: 2,
  });
  await page.evaluate(() => window.__GR_TEST__?.grantXp(50));

  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect(page.locator('[data-upgrade-id="beacon_handoff"]')).toBeVisible();
  assertNoErrors(errors);
});

test('locked Steamworks stub loads without changing fresh offers', async ({ page }) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&seed=sci-04-steamworks');
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.eligibility ?? []);
  const steamworks = await page.evaluate(() => window.__GR_CONTRACT_REGISTRY__?.loadEpoch('epoch-2-steamworks'));
  const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.eligibility ?? []);

  expect(steamworks).toMatchObject({ locked: true, families: [], gates: [], contracts: [{ id: 'e2-hill-mine' }] });
  expect(after).toEqual(before);
  expect(after).not.toContain('beacon_handoff');
  expect(after).not.toContain('spark_pressure_ring');

  await page.evaluate(() => window.__GR_TEST__?.grantXp(50));
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  const offer = await page.$$eval('[data-upgrade-id]', (cards) => cards.map((card) => (card as HTMLElement).dataset.upgradeId ?? ''));
  expect(offer).toHaveLength(3);
  assertNoErrors(errors);
});
