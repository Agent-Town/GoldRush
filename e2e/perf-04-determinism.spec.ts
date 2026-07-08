import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type DeterminismReport = {
  status: 'running' | 'pass' | 'fail';
  seed?: string;
  economyHash?: string;
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

async function clearStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}

async function runDeterminism(page: Page): Promise<{ report: DeterminismReport; errors: ErrorBucket }> {
  await clearStorage(page);
  const errors = collectErrors(page);
  await page.goto(`/?debug&determinism&nolevel&nopause&seed=${seed}&timescale=24`);
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const report = (window as DeterminismWindow).__GR_DETERMINISM__;
          return report?.status !== undefined && report.status !== 'running';
        }),
      { timeout: 900_000 },
    )
    .toBe(true);
  const report = (await page.evaluate(() => (window as DeterminismWindow).__GR_DETERMINISM__)) as DeterminismReport;
  return { report, errors };
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

test('same seed produces identical economy hash and entity timeline', async ({ page }, testInfo) => {
  test.setTimeout(1_200_000);
  const first = await runDeterminism(page);
  const second = await runDeterminism(page);
  await writeReport(testInfo, { first: first.report, second: second.report, errors: { first: first.errors, second: second.errors } });

  expect(first.report.status, first.report.findings?.join('\n')).toBe('pass');
  expect(second.report.status, second.report.findings?.join('\n')).toBe('pass');
  expect(first.report.error).toBeNull();
  expect(second.report.error).toBeNull();
  expect(first.report.economyHash).toBe(second.report.economyHash);
  expect(first.report.economyLogLength).toBeGreaterThan(0);
  expect(first.report.entityTimeline?.length).toBeGreaterThan(0);
  expect(first.report.entityTimeline).toEqual(second.report.entityTimeline);
  expect(first.errors.consoleErrors).toEqual([]);
  expect(first.errors.pageErrors).toEqual([]);
  expect(second.errors.consoleErrors).toEqual([]);
  expect(second.errors.pageErrors).toEqual([]);
});
