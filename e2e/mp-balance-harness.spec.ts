import { expect, test, type Page } from '@playwright/test';
import type { MultiplayerBalanceReport } from '../src/mp/MultiplayerBalanceHarness';
import baselineReport from '../artifacts/sol/mp-balance-harness/first-report.json' with { type: 'json' };

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function runHarness(page: Page, seed: string): Promise<MultiplayerBalanceReport> {
  return page.evaluate(async (runSeed) => {
    const modulePath = '/src/mp/MultiplayerBalanceHarness.ts';
    const { runMultiplayerBalanceHarness } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/mp/MultiplayerBalanceHarness');
    return runMultiplayerBalanceHarness({ seed: runSeed });
  }, seed);
}

function expectFinite(value: number): void {
  expect(Number.isFinite(value)).toBe(true);
}

test('seeded rider simulations are deterministic and obey balance invariants', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&seed=mp-balance-e2e');

  const first = await runHarness(page, 'mp-balance-e2e');
  const repeated = await runHarness(page, 'mp-balance-e2e');
  const different = await runHarness(page, 'mp-balance-e2e-other');
  const baseline = await runHarness(page, 'mp-balance-v1');
  const difficultyIsolation = await page.evaluate(async (runSeed) => {
    const balancePath = '/src/game/Balance.ts';
    const harnessPath = '/src/mp/MultiplayerBalanceHarness.ts';
    const balance = (await import(/* @vite-ignore */ balancePath)) as typeof import('../src/game/Balance');
    const harness = (await import(/* @vite-ignore */ harnessPath)) as typeof import('../src/mp/MultiplayerBalanceHarness');
    balance.applyDifficultyPreset('trail');
    const trailHp = balance.Balance.enemy.hp;
    balance.applyDifficultyPreset('vein-hunter');
    const before = balance.Balance.enemy.hp;
    try {
      const report = harness.runMultiplayerBalanceHarness({ seed: runSeed });
      return { trailHp, before, after: balance.Balance.enemy.hp, report };
    } finally {
      balance.applyDifficultyPreset('trail');
    }
  }, 'mp-balance-e2e');

  expect(repeated).toEqual(first);
  expect(baseline).toEqual(baselineReport);
  expect(repeated.stableHash).toBe(first.stableHash);
  expect(different.stableHash).not.toBe(first.stableHash);
  expect(difficultyIsolation.before).not.toBe(difficultyIsolation.trailHp);
  expect(difficultyIsolation.after).toBe(difficultyIsolation.before);
  expect(difficultyIsolation.report).toEqual(first);
  expect(first.rows.map((row) => row.riderCount)).toEqual([1, 2, 3, 4]);
  expect(first.seedCorpus.length).toBeGreaterThan(0);
  expect(first.stepSeconds).toBeGreaterThan(0);
  expect(first.durationSeconds).toBeGreaterThan(0);
  expect(first.assumptions).toMatchObject({
    difficultyPreset: 'trail',
    survivalEndsAt: 'first-rider-death',
    harvest: 'single-shared-progress-channel',
    riderFormation: 'solo-centered-multiplayer-1.2-radius',
    waveSpawns: 'seeded-distinct-edges-with-live-group-spread',
    enemyTargeting: 'nearest-stationary-rider-from-seeded-edge-spawn',
    goldAccounting: 'gross-panned-no-bank-cap',
  });

  const solo = first.rows[0];
  expect(solo.survival.medianSeconds).toBeGreaterThan(0);
  expect(solo.gold.teamPerMinute).toBeGreaterThan(0);
  expect(solo.gold.perRiderPerMinute).toBeGreaterThan(0);
  expect(solo.survival.delta).toBe(0);
  expect(solo.gold.teamDelta).toBe(0);
  expect(solo.gold.perRiderDelta).toBe(0);

  for (const row of first.rows) {
    const survival = row.survival;
    const gold = row.gold;
    const values = [
      survival.minSeconds,
      survival.medianSeconds,
      survival.maxSeconds,
      survival.delta,
      gold.teamPerMinute,
      gold.teamDelta,
      gold.perRiderPerMinute,
      gold.perRiderDelta,
    ];
    values.forEach(expectFinite);

    expect(survival.minSeconds).toBeGreaterThanOrEqual(0);
    expect(survival.minSeconds).toBeLessThanOrEqual(survival.medianSeconds);
    expect(survival.medianSeconds).toBeLessThanOrEqual(survival.maxSeconds);
    expect(survival.maxSeconds).toBeLessThanOrEqual(first.durationSeconds);
    expect(survival.censoredRuns).toBeGreaterThanOrEqual(0);
    expect(survival.censoredRuns).toBeLessThanOrEqual(first.seedCorpus.length);
    expect(Number.isInteger(survival.censoredRuns)).toBe(true);
    expect(survival.delta).toBeGreaterThanOrEqual(-1);
    expect(gold.teamPerMinute).toBeGreaterThanOrEqual(0);
    expect(gold.teamDelta).toBeGreaterThanOrEqual(-1);
    expect(gold.perRiderPerMinute).toBeGreaterThanOrEqual(0);
    expect(gold.perRiderDelta).toBeGreaterThanOrEqual(-1);
    expect(gold.perRiderPerMinute).toBeCloseTo(gold.teamPerMinute / row.riderCount, 4);
    expect(survival.delta).toBeCloseTo(survival.medianSeconds / solo.survival.medianSeconds - 1, 4);
    expect(gold.teamDelta).toBeCloseTo(gold.teamPerMinute / solo.gold.teamPerMinute - 1, 4);
    expect(gold.perRiderDelta).toBeCloseTo(gold.perRiderPerMinute / solo.gold.perRiderPerMinute - 1, 4);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the browser channel requires both debug and mpbalance query gates', async ({ page }) => {
  const errors = collectErrors(page);

  for (const query of ['', '?mpbalance&seed=mp-balance-gate', '?debug&seed=mp-balance-gate']) {
    await page.goto(`/${query}`);
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    expect(await page.evaluate(() => window.__GR_MP_BALANCE__)).toBeUndefined();
  }

  await page.goto('/?debug&mpbalance&seed=mp-balance-gate');
  await page.waitForFunction(() => window.__GR_MP_BALANCE__ !== undefined);
  const channel = await page.evaluate(() => window.__GR_MP_BALANCE__);

  expect(channel?.ok).toBe(true);
  if (channel?.ok) expect(channel.result.rows.map((row) => row.riderCount)).toEqual([1, 2, 3, 4]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
