import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { RESEARCH_STATE_KEY } from '../src/meta/ResearchTree';

const SCORE_KEY = 'gr.scores.v1';
const SHOT_DIR = 'artifacts/sci-02';

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

async function openGame(page: Page, taken: string[] = [], query = '?debug&timescale=3&nowaves&seed=sci-02'): Promise<ErrorBucket> {
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
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY, scoreKey: SCORE_KEY, takenNodes: taken },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(SHOT_DIR, { recursive: true });
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function killFast(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('Beacon Handoff is absent before its Arsenal node and present after', async ({ page }, testInfo) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&seed=sci-02-gated');
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
  await shot(page, testInfo, 'gated-arsenal-offer');
  assertNoErrors(errors);
});

test('maxed firerate mastery converts into a named blast-radius offer', async ({ page }, testInfo) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&seed=sci-02-mastery');
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
  }, {
    ...BASELINE_MAXED,
    double_tap_coil: Balance.upgrades.doubleTapCoilMaxStacks - 1,
  });

  const before = await page.evaluate(() => Array.from({ length: 4 }, () => window.__GR_TEST__?.rollUpgradeOffer() ?? []).flat());
  expect(before).not.toContain('spark_pressure_ring');

  await page.evaluate((stacks) => window.__GR_TEST__?.setUpgradeStacks(stacks), BASELINE_MAXED);
  expect(await page.evaluate(() => window.__GR_TEST__?.rollUpgradeOffer() ?? [])).toContain('spark_pressure_ring');

  await page.evaluate(() => window.__GR_TEST__?.grantXp(50));
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect(page.locator('[data-upgrade-id="spark_pressure_ring"]')).toBeVisible();
  await shot(page, testInfo, 'mastery-synergy-offer');
  assertNoErrors(errors);
});

test('mastery synergy stats stay inside epoch caps', async ({ page }) => {
  const errors = await openGame(page, [], '?debug&timescale=3&nowaves&seed=sci-02-caps');
  await page.evaluate(() =>
    window.__GR_TEST__?.setUpgradeStacks({
      wide_ring: 2,
      spark_pressure_ring: 1,
      prospectors_luck: 2,
      stockpile_seam_survey: 1,
    }),
  );

  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(diagnostics.progression.stats.blastRadiusMult).toBeLessThanOrEqual(Balance.eraCaps.blastRadiusMult);
  expect(diagnostics.progression.stats.seamCapacityBonus).toBeLessThanOrEqual(Balance.eraCaps.seamCapacityBonus);
  expect(diagnostics.progression.stats.stockpileCapBonus).toBeLessThanOrEqual(Balance.eraCaps.stockpileCapBonus);
  expect(diagnostics.arsenal.blastRadius).toBeLessThanOrEqual(Balance.blast.radius * Balance.eraCaps.blastRadiusMult);
  expect(diagnostics.economy.bankCap).toBe(Balance.economy.bankCap + diagnostics.progression.stats.stockpileCapBonus);
  assertNoErrors(errors);
});

test('Assay Grading stockpile room counts pact prospecting stacks', async ({ page }) => {
  const errors = await openGame(
    page,
    ['assay_grading', 'mother_lode_survey', 'sluice_accounting', 'claim_map_table', 'pact_ledger'],
    '?debug&timescale=3&nowaves&seed=sci-02-assay-pact',
  );
  await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ rich_seam_pact: 1 }));

  const diagnostics = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
  expect(diagnostics.economy.bankCap).toBe(Balance.economy.bankCap + Balance.research.assayGradingStockpileCapBonus);
  assertNoErrors(errors);
});

test('fresh profile keeps SCI-01 research pick persistence and no gated mastery offers', async ({ page }) => {
  const errors = await openGame(page, [], '?debug&timescale=8&nowaves&nolevel&seed=sci-02-fresh');
  const eligibility = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.progression.eligibility ?? []);
  expect(eligibility).not.toContain('beacon_handoff');
  expect(eligibility).not.toContain('spark_pressure_ring');
  expect(eligibility).not.toContain('stockpile_seam_survey');

  await killFast(page);
  const before = await page.$$eval('[data-research-id]', (cards) =>
    cards.map((card) => (card as HTMLElement).dataset.researchId ?? ''),
  );
  expect(before).toHaveLength(2);
  await page.getByTestId('research-card-0').click();

  const saved = await page.evaluate(
    ({ metaKey, researchKey }) => ({
      meta: JSON.parse(localStorage.getItem(metaKey) ?? 'null'),
      research: JSON.parse(localStorage.getItem(researchKey) ?? 'null'),
    }),
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY },
  );
  expect(saved.meta.tracks.science).toBe(1);
  expect(saved.research.taken).toContain(before[0]);
  assertNoErrors(errors);
});
