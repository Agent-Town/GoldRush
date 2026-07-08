import { expect, test, type Page } from '@playwright/test';
import type { CraftedItemDef } from '../src/crafting/CraftingQueueContract';
import type { StatSimRun } from '../src/crafting/StatSimHarness';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const fairItem: CraftedItemDef = {
  id: 'm5_03_fair_pan_receipt',
  kind: 'tool',
  rarity: 'common',
  family: 'panning',
  name: 'Fair Pan Receipt',
  blurb: 'A brass-stamped receipt for steadier panning.',
  cost: 30,
  stats: { panTickMult: -0.12 },
};

const overpoweredItem: CraftedItemDef = {
  id: 'm5_03_overclocked_spark_condenser',
  kind: 'weapon_mod',
  rarity: 'rare',
  family: 'damage',
  name: 'Overclocked Spark Condenser',
  blurb: 'A brass condenser that claims ordinary Spark Rig improvements.',
  cost: 80,
  stats: { damageMult: 0.35, fireRateMult: 0.3 },
};

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openGame(page: Page, query = '?debug&nowaves&nolevel'): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  return errors;
}

async function runHarness(page: Page, item: CraftedItemDef): Promise<StatSimRun> {
  return page.evaluate(async (candidate) => {
    const modulePath = '/src/crafting/StatSimHarness.ts';
    const { runStatSimHarness } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/crafting/StatSimHarness');
    return runStatSimHarness(candidate);
  }, item);
}

test('overpowered item passes declared budget but is caught empirically', async ({ page }) => {
  const errors = await openGame(page);
  const result = await runHarness(page, overpoweredItem);

  expect(result.contract.budgetOk).toBe(true);
  expect(result.status).toBe('overperforming');
  expect(result.verdict.ok).toBe(false);
  expect(result.verdict.reasons.map((reason) => reason.code)).toContain('overperforming');
  expect(result.measuredBudget).toBeGreaterThan(result.contract.declaredBudget * result.tolerance);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('fair item passes declared budget and stat sim tolerance', async ({ page }) => {
  const errors = await openGame(page);
  const result = await runHarness(page, fairItem);

  expect(result.contract.budgetOk).toBe(true);
  expect(result.status).toBe('within-tolerance');
  expect(result.verdict.ok).toBe(true);
  expect(result.measured.goldRate).toBeGreaterThan(result.baseline.goldRate);
  expect(result.measuredBudget).toBeLessThanOrEqual(result.contract.declaredBudget * result.tolerance);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('same item produces hash-identical deterministic measurements', async ({ page }) => {
  const errors = await openGame(page);
  const first = await runHarness(page, fairItem);
  const second = await runHarness(page, fairItem);

  expect(first.hash).toBe(second.hash);
  expect(first).toEqual(second);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('?simitem exposes diagnostics and absent param leaves normal boot unchanged', async ({ page }) => {
  const encoded = encodeURIComponent(JSON.stringify(fairItem));
  let errors = await openGame(page, '?debug&nowaves&nolevel');
  expect(await page.evaluate(() => window.__GR_STAT_SIM__)).toBeUndefined();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = await openGame(page, `?nowaves&nolevel&simitem=${encoded}`);
  expect(await page.evaluate(() => window.__GR_STAT_SIM__)).toBeUndefined();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);

  errors = collectErrors(page);
  await page.goto(`/?debug&nowaves&nolevel&simitem=${encoded}`);
  await page.waitForFunction(() => window.__GR_STAT_SIM__ !== undefined);
  const channel = await page.evaluate(() => window.__GR_STAT_SIM__);

  expect(channel?.ok).toBe(true);
  if (channel?.ok) {
    expect(channel.itemId).toBe(fairItem.id);
    expect(channel.result.status).toBe('within-tolerance');
    expect(channel.result.verdict.measurements.measured.goldRate).toBeGreaterThan(channel.result.verdict.measurements.baseline.goldRate);
  }
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
