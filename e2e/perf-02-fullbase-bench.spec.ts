import { expect, test, type Page, type TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type BenchWindow = { label: string; frameMsP95: number; drawCallsMax: number; glErrors: string[] };
type BenchReport = {
  status: 'pass' | 'fail';
  budgets: { drawCallsMax: number; p95RatioMax: number };
  build: { target: number; placed: number };
  baseline: BenchWindow;
  waves: BenchWindow[];
  summary: { maxDrawCalls: number; p95RatioMax: number; glErrors: string[]; findings: string[] };
  error: string | null;
};

const reportDir = path.resolve('test-results/perf-02-fullbase-bench');

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function writeReport(testInfo: TestInfo, report: BenchReport, errors: ErrorBucket): Promise<void> {
  const body = `${JSON.stringify({ report, errors }, null, 2)}\n`;
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, `${testInfo.project.name}.json`), body);
  await testInfo.attach('perf-02-fullbase-bench', { body, contentType: 'application/json' });
}

test('full-base benchmark stays inside draw-call and frame envelopes', async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);
  await page.goto('/?bench=fullbase');
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.__BENCH_REPORT__)), { timeout: 45_000 })
    .toBe(true);

  const report = (await page.evaluate(() => window.__BENCH_REPORT__)) as BenchReport;
  await writeReport(testInfo, report, errors);

  expect(report.error).toBeNull();
  expect(report.build.placed).toBe(report.build.target);
  expect(report.waves).toHaveLength(4);
  expect(report.summary.glErrors).toEqual([]);
  for (const sample of [report.baseline, ...report.waves]) expect(sample.glErrors).toEqual([]);
  for (const sample of report.waves) {
    expect(sample.drawCallsMax).toBeLessThanOrEqual(report.budgets.drawCallsMax);
    expect(sample.frameMsP95).toBeLessThanOrEqual(report.baseline.frameMsP95 * report.budgets.p95RatioMax);
  }
  expect(report.summary.maxDrawCalls).toBeLessThanOrEqual(report.budgets.drawCallsMax);
  expect(report.summary.p95RatioMax).toBeLessThanOrEqual(report.budgets.p95RatioMax);
  expect(report.status, report.summary.findings.join('\n')).toBe('pass');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
