import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type DeterminismReport = {
  status: 'running' | 'pass' | 'fail';
  seed?: string;
  economyHash?: string;
  futureStateHash?: string;
  economyLogLength?: number;
  entityTimeline?: unknown[];
  findings?: string[];
  error?: string | null;
};
type DeterminismWindow = Window & { __GR_DETERMINISM__?: DeterminismReport };

const reportDir = path.resolve('test-results/perf-04-determinism');
const seed = 'perf-04-determinism';

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function runDeterminism(page: Page): Promise<{ report: DeterminismReport; errors: ErrorBucket; futureState: unknown }> {
  const errors = collectErrors(page);
  await page.goto(`/?debug&determinism&nolevel&nopause&seed=${seed}&timescale=24`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  const handle = await page.waitForFunction(
    () => {
      const report = (window as DeterminismWindow).__GR_DETERMINISM__;
      return report && report.status !== 'running' ? report : null;
    },
    undefined,
    { timeout: 900_000 },
  );
  const report = (await handle.jsonValue()) as DeterminismReport;
  const futureState = await page.evaluate(async () => {
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    return suspend.runSuspendFutureState(window.__GR_TEST__!.captureSuspend());
  });
  return { report, errors, futureState };
}

async function writeReport(testInfo: TestInfo, body: unknown): Promise<void> {
  const text = `${JSON.stringify(body, null, 2)}\n`;
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${testInfo.project.name}.json`), text);
  await testInfo.attach('perf-04-determinism', { body: text, contentType: 'application/json' });
}

test('?debug without determinism leaves the harness dormant', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nolevel&nopause&seed=${seed}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  expect(await page.evaluate(() => (window as DeterminismWindow).__GR_DETERMINISM__)).toBeUndefined();
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('resetRun rewinds every RNG stream on the same page', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(`/?debug&nolevel&nopause&seed=${seed}`);
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));

  const [first, second] = await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.setBalance('enemy.contactDamage', 0);
    const runPass = () => {
      harness.resetRun();
      harness.setManualSim(true);
      const offer = harness.rollUpgradeOffer();
      harness.advanceSim(40);
      const snapshot = harness.captureSuspend();
      return {
        rng: snapshot.rng,
        runResetAt: snapshot.economy.log.find((event) => event.type === 'run_reset')?.at,
        offer,
        waveSystem: snapshot.waveSystem,
        enemies: snapshot.enemies,
        harvest: snapshot.harvest,
      };
    };
    return [runPass(), runPass()];
  });

  expect(first.rng.waves?.calls).toBeGreaterThan(0);
  expect(first.rng.upgrades?.calls).toBeGreaterThan(0);
  expect(first.rng.harvest?.calls).toBeGreaterThan(0);
  expect(first.runResetAt).toBe(0);
  expect(second).toEqual(first);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('same seed produces identical future-state hash, economy hash, and entity timeline', async ({ page }, testInfo) => {
  test.setTimeout(1_200_000);
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  const first = await runDeterminism(page);
  const second = await runDeterminism(page);
  const futureStateDiff = first.report.futureStateHash === second.report.futureStateHash
    ? undefined
    : { first: first.futureState, second: second.futureState };
  await writeReport(testInfo, {
    first: first.report,
    second: second.report,
    errors: { first: first.errors, second: second.errors },
    futureStateDiff,
  });

  expect(first.report.status, first.report.findings?.join('\n')).toBe('pass');
  expect(second.report.status, second.report.findings?.join('\n')).toBe('pass');
  expect(first.report.error).toBeNull();
  expect(second.report.error).toBeNull();
  expect(first.report.economyHash).toBe(second.report.economyHash);
  expect(first.report.futureStateHash).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
  expect(first.report.futureStateHash).toBe(second.report.futureStateHash);
  expect(first.report.economyLogLength).toBeGreaterThan(0);
  expect(first.report.entityTimeline?.length).toBeGreaterThan(0);
  expect(first.report.entityTimeline).toEqual(second.report.entityTimeline);
  expect(first.errors.consoleErrors).toEqual([]);
  expect(first.errors.pageErrors).toEqual([]);
  expect(second.errors.consoleErrors).toEqual([]);
  expect(second.errors.pageErrors).toEqual([]);
});
