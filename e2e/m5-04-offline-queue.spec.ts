import { expect, test, type Page } from '@playwright/test';
import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { makePendingQueueRequest, pendingQueuePath } from '../src/crafting/CraftingQueueContract';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

function collectErrors(page: Page): ErrorBucket {
  const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  return bucket;
}

async function openBench(page: Page, query: string): Promise<ErrorBucket> {
  const errors = collectErrors(page);
  await page.goto(`/${query}`);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('assay-bench')).toBeVisible();
  return errors;
}

test('post the order writes the exact pending request JSON', async ({ page }, testInfo) => {
  const text = 'steady teal coil for careful claim work';
  const profile = `e2e_${testInfo.project.name}`;
  const expected = makePendingQueueRequest(text, profile, '2026-07-05T14:20:00.000Z');
  const filePath = resolve(process.cwd(), pendingQueuePath(expected.id));
  await rm(filePath, { force: true });

  const errors = await openBench(
    page,
    `?debug&nowaves&nolevel&profile=${encodeURIComponent(profile)}&queueNow=${encodeURIComponent(expected.timestamp)}`,
  );

  try {
    await page.getByTestId('assay-text').fill(text);
    await page.getByTestId('assay-post').click();
    await expect(page.getByTestId('assay-pending-status')).toHaveText('Posted');
    await expect(page.getByTestId('assay-pending-path')).toHaveText(pendingQueuePath(expected.id));

    const visibleJson = await page.getByTestId('assay-pending-json').evaluate((el) => JSON.parse(el.textContent ?? '{}'));
    const diskJson = JSON.parse(await readFile(filePath, 'utf8'));
    expect(visibleJson).toEqual(expected);
    expect(diskJson).toEqual(expected);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  } finally {
    await rm(filePath, { force: true });
  }
});

test('approved fixtures enter a profile history once', async ({ page }) => {
  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=m5_example_prospector');

  const rows = page.getByTestId('assay-log').locator('li');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Brass Pan Receipt (common)');

  const idempotentCount = await page.evaluate(async () => {
    const benchPath = '/src/crafting/AssayBench.ts';
    const queuePath = '/src/crafting/CraftingQueue.ts';
    const [{ AssayBench }, { loadCraftingQueue }] = await Promise.all([
      import(benchPath),
      import(queuePath),
    ]);
    const bench = new AssayBench();
    const queue = loadCraftingQueue('m5_example_prospector');
    bench.ingestApproved(queue.approved);
    bench.ingestApproved(queue.approved);
    return bench.acceptedLog.length;
  });
  expect(idempotentCount).toBe(1);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('rejected fixtures show pipeline reasons in the bench', async ({ page }) => {
  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=m5_rejected_prospect');

  const reasons = page.getByTestId('assay-queue-rejections').locator('li');
  await expect(reasons).toHaveCount(2);
  await expect(reasons).toContainText(['Banned frontier-tech term: rifle.', 'Requested range exceeds the rare item budget.']);
  await expect(page.getByTestId('assay-log').locator('li')).toHaveCount(0);
  expect(await reasons.evaluateAll((rows) => rows.map((row) => (row as HTMLElement).dataset.reasonCode))).toEqual([
    'canon_banned_term',
    'power_budget',
  ]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
