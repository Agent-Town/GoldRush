import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { SCOREBOARD_KEY } from '../src/game/ProfileStorage';
import { RESEARCH_NODES, RESEARCH_STATE_KEY, STEAMWORKS_THRESHOLD } from '../src/meta/ResearchTree';

const SCI_COPY_SHOT_DIR = 'artifacts/sci-copy';
const SCI_CEILING_SHOT_DIR = 'artifacts/sci-ceiling';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const CORE_STACKS = {
  double_tap_coil: Balance.upgrades.doubleTapCoilMaxStacks,
  heavy_spark: 3,
  long_resonator: 2,
  split_spark: 2,
  tinkers_plating: 3,
  spring_heels: 3,
  pan_legend: 2,
  prospectors_luck: 2,
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

async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, researchKey, scoreKey }) => {
      if (sessionStorage.getItem('sci-01-cleared') === 'true') return;
      localStorage.removeItem(metaKey);
      localStorage.removeItem(researchKey);
      localStorage.removeItem(scoreKey);
      sessionStorage.setItem('sci-01-cleared', 'true');
    },
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY, scoreKey: SCOREBOARD_KEY },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function shot(page: Page, testInfo: TestInfo, name: string, dir = SCI_COPY_SHOT_DIR): Promise<void> {
  await mkdir(dir, { recursive: true });
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  await page.screenshot({ path: `${dir}/${testInfo.project.name}-${name}.png`, fullPage: true });
}

async function killFast(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 12);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
}

async function fastWave20(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });
}

async function researchCardIds(page: Page): Promise<string[]> {
  return page.$$eval('[data-research-id]', (cards) => cards.map((card) => (card as HTMLElement).dataset.researchId ?? ''));
}

async function createProfile(page: Page, name: string): Promise<void> {
  await page.getByTestId('profile-name-input').fill(name);
  await page.getByTestId('profile-create').click();
  await expect(page.getByTestId('profile-row').filter({ hasText: name })).toBeVisible();
}

async function openSeededResearchGame(page: Page, taken: string[], science: number, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ metaKey, researchKey, scoreKey, takenNodes, scienceSteps }) => {
      localStorage.removeItem(scoreKey);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          version: 1,
          tracks: { territory: 0, science: scienceSteps, hero: 0, agent: 0 },
        }),
      );
      localStorage.setItem(researchKey, JSON.stringify({ version: 1, taken: takenNodes, proposalSalt: 0 }));
    },
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY, scoreKey: SCOREBOARD_KEY, takenNodes: taken, scienceSteps: science },
  );
  await page.goto(`/${query}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

function assertNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('research node descriptions stay concrete', () => {
  const namedCardFamilies = ['Seam cards', 'Chain Spark Arc', 'Beacon Handoff', 'Rich Seam Pact', 'Spark Pressure Ring'];
  const vague = RESEARCH_NODES.filter(
    (node) => !/\d/.test(node.description) && !namedCardFamilies.some((family) => node.description.includes(family)),
  );
  expect(vague.map((node) => `${node.id}: ${node.description}`)).toEqual([]);
});

test('science ceiling promises the Steamworks and surfaces banked overflow', async ({ page }, testInfo) => {
  const errors = await openSeededResearchGame(
    page,
    [],
    STEAMWORKS_THRESHOLD + 2,
    '?debug&timescale=8&nowaves&nolevel&seed=sci-ceiling-copy',
  );
  await killFast(page);

  await expect(page.getByTestId('science-meter')).toContainText('Epoch science complete');
  await expect(page.getByTestId('science-meter')).toContainText('the Steamworks awaits a town to build it');
  await expect(page.getByTestId('science-meter')).not.toContainText('(locked)');
  await expect(page.getByTestId('science-banked')).toHaveText('banked: +2 toward the Steamworks');
  const state = await page.evaluate(() => window.__GR_TEST__?.researchState());
  expect(state?.remaining).toBe(0);
  expect(state?.overflow).toBe(2);
  await shot(page, testInfo, 'ceiling-meter', SCI_CEILING_SHOT_DIR);
  assertNoErrors(errors);
});

test('exhausted Frontier tree offers Continued Study proposals with numeric copy', async ({ page }, testInfo) => {
  const taken = RESEARCH_NODES.map((node) => node.id);
  const errors = await openSeededResearchGame(
    page,
    taken,
    taken.length,
    '?debug&timescale=8&nowaves&nolevel&seed=sci-continued-study',
  );
  await killFast(page);

  const proposalIds = await researchCardIds(page);
  expect(proposalIds).toHaveLength(2);
  expect(proposalIds.every((id) => id.startsWith('continued_study:'))).toBe(true);
  for (const index of [0, 1]) {
    await expect(page.getByTestId(`research-card-${index}`)).toContainText('Continued Study');
    await expect(page.getByTestId(`research-effect-${index}`)).toContainText(/Effect: \+\d+(%| stockpile cap)/);
  }
  await expect(page.getByTestId('science-banked')).toHaveText(`banked: +${taken.length - STEAMWORKS_THRESHOLD} toward the Steamworks`);
  await page.getByTestId('research-card-0').scrollIntoViewIfNeeded();
  await shot(page, testInfo, 'continued-study-proposal', SCI_CEILING_SHOT_DIR);

  await page.getByTestId('research-card-0').click();
  const state = await page.evaluate(() => window.__GR_TEST__?.researchState());
  expect(state?.steps).toBe(taken.length + 1);
  expect(state?.available).toHaveLength(2);
  expect(state?.available.every((id) => id.startsWith('continued_study:'))).toBe(true);
  expect(Object.values(state?.continued ?? {}).some((value) => value > 0)).toBe(true);
  assertNoErrors(errors);
});

test('death ledger offers research, persists the pick, and changes the next proposal pool', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&timescale=8&nowaves&nolevel&seed=sci-01-death');
  await killFast(page);

  await expect(page.getByTestId('death-overlay')).toBeVisible();
  await expect(page.getByTestId('science-meter')).toContainText(`Science: 0 steps - ${STEAMWORKS_THRESHOLD} to the Steamworks`);
  const before = await researchCardIds(page);
  expect(before).toHaveLength(2);
  for (const index of [0, 1]) {
    await expect(page.getByTestId(`research-branch-${index}`)).toContainText(/Advances (economy|arsenal|crafting-agent)/);
    await expect(page.getByTestId(`research-effect-${index}`)).toContainText('Effect: ');
  }
  await page.getByTestId('research-card-0').scrollIntoViewIfNeeded();
  await shot(page, testInfo, 'research-overlay');

  const pickedEffect = (await page.getByTestId('research-effect-0').textContent())?.replace('Effect: ', '') ?? '';
  await page.getByTestId('research-card-0').click();
  const picked = before[0];
  await expect(page.getByTestId('research-receipt')).toHaveText(`The Elder logs it: ${pickedEffect}`);
  await expect(page.getByTestId('science-meter')).toContainText(`Science: 1 steps - ${STEAMWORKS_THRESHOLD - 1}`);
  await shot(page, testInfo, 'post-pick-toast');

  const saved = await page.evaluate(
    ({ metaKey, researchKey }) => ({
      meta: JSON.parse(localStorage.getItem(metaKey) ?? 'null'),
      research: JSON.parse(localStorage.getItem(researchKey) ?? 'null'),
    }),
    { metaKey: META_PROGRESS_KEY, researchKey: RESEARCH_STATE_KEY },
  );
  expect(saved.meta.tracks.science).toBe(1);
  expect(saved.research.taken).toContain(picked);

  await page.getByTestId('stake-again').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await killFast(page);
  const after = await researchCardIds(page);
  expect(after).toHaveLength(2);
  expect(after).not.toEqual(before);

  await page.reload();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().taken ?? [])).toContain(picked);
  assertNoErrors(errors);
});

test('victory grants a second research proposal round', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = await openGame(page, '?debug&timescale=100&nolevel&seed=sci-01-victory');
  await fastWave20(page);

  await expect(page.getByTestId('claim-office')).toBeVisible({ timeout: 12_000 });
  await page.getByTestId('bank-secured-claim').click();
  await expect(page.getByTestId('research-overlay')).toBeVisible();
  await expect(page.getByTestId('research-overlay')).toContainText('Research pick 1 of 2');
  await expect(page.getByTestId('science-meter')).toContainText(`Science: 1 steps - ${STEAMWORKS_THRESHOLD - 1}`);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('paused');

  await page.getByTestId('research-card-0').click();
  await expect(page.getByTestId('research-overlay')).toContainText('Research pick 2 of 2');
  await page.getByTestId('research-card-0').click();

  const state = await page.evaluate(() => window.__GR_TEST__?.researchState());
  expect(state?.taken).toHaveLength(2);
  expect(state?.steps).toBe(3);
  expect(state?.remaining).toBe(STEAMWORKS_THRESHOLD - 3);
  assertNoErrors(errors);
});

test('launch nodes apply live effects', async ({ page }) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=sci-01-effects');
  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('assay_grading'))).toBe(true);
  await page.evaluate((stacks) => window.__GR_TEST__?.setUpgradeStacks(stacks), { prospectors_luck: 1 });
  expect(await page.evaluate(() => window.__GR_TEST__?.state().economy.bankCap)).toBe(
    Balance.economy.bankCap + Balance.research.assayGradingStockpileCapBonus,
  );

  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('second_order_slot'))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().assayOrderSlots)).toBe(Balance.research.secondOrderSlots);
  assertNoErrors(errors);
});

test('Chain Spark family is absent before its node and present after', async ({ page }, testInfo) => {
  const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=sci-01-chain');
  await page.evaluate((stacks) => {
    window.__GR_TEST__?.setFillersDisabled(true);
    window.__GR_TEST__?.setUpgradeStacks(stacks);
  }, CORE_STACKS);

  const before = await page.evaluate(() => Array.from({ length: 6 }, () => window.__GR_TEST__?.rollUpgradeOffer() ?? []).flat());
  expect(before).not.toContain('chain_spark_arc');

  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('chain_spark_primer'))).toBe(true);
  await page.evaluate(() => window.__GR_TEST__?.grantXp(50));
  await expect(page.getByTestId('upgrade-overlay')).toBeVisible();
  await expect(page.locator('[data-upgrade-id="chain_spark_arc"]')).toBeVisible();
  await shot(page, testInfo, 'gated-family-offer');
  assertNoErrors(errors);
});

test('research registry follows the active profile', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    if (sessionStorage.getItem('sci-01-profile-cleared') === 'true') return;
    localStorage.clear();
    sessionStorage.setItem('sci-01-profile-cleared', 'true');
  });
  await page.goto('/?debug&profiles&nowaves&nolevel&seed=sci-01-profile-scope');
  await expect(page.getByTestId('profile-title')).toBeVisible();
  await createProfile(page, 'Alice');
  await createProfile(page, 'Bob');

  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.takeResearchNode('assay_grading'))).toBe(true);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().taken ?? [])).toContain('assay_grading');

  await page.reload();
  await expect(page.getByTestId('profile-title')).toBeVisible();
  await page.getByTestId('profile-row').filter({ hasText: 'Bob' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().taken ?? [])).not.toContain('assay_grading');

  await page.reload();
  await expect(page.getByTestId('profile-title')).toBeVisible();
  await page.getByTestId('profile-row').filter({ hasText: 'Alice' }).click();
  await page.getByTestId('profile-start').click();
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__?.researchState().taken ?? [])).toContain('assay_grading');
  assertNoErrors(errors);
});
