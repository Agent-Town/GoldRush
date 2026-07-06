import { expect, test, type Page } from '@playwright/test';
import { readFile, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { makePendingQueueRequest, normalizeQueueProfile, pendingQueuePath } from '../src/crafting/CraftingQueueContract';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Box = { x: number; y: number; width: number; height: number };

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

function overlaps(a: Box | null, b: Box | null): boolean {
  if (!a || !b) return false;
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// Sweep the two kinds of pending orders that tests leak, without racing sibling
// workers. The w1 gate config runs desktop + mobile projects in parallel against a
// shared pending dir. The only order file a test READS back is its own
// `order_e2e_<project>_*` (the "post the order" test), so that sweep must be scoped
// to the current project — a broad `order_e2e_*` delete let one worker wipe a
// sibling's in-flight file mid-test (ENOENT race, F-033-2 regression). The default
// `local_prospector` orders (F-033-3 leak) are never read back by any test, so
// deleting them broadly is race-free.
async function cleanPostedOrders(profile: string): Promise<void> {
  const pendingDir = resolve(process.cwd(), 'assets/crafting-queue/pending');
  const files = await readdir(pendingDir).catch(() => []);
  const ownPrefix = `order_${normalizeQueueProfile(profile)}_`;
  await Promise.all(
    files
      .filter(
        (file) =>
          file.endsWith('.json') &&
          (file.startsWith('order_local_prospector_') || file.startsWith(ownPrefix)),
      )
      .map((file) => rm(resolve(pendingDir, file), { force: true })),
  );
}

async function localSamplePendingOrders(): Promise<string[]> {
  const pendingDir = resolve(process.cwd(), 'assets/crafting-queue/pending');
  return (await readdir(pendingDir).catch(() => []))
    .filter((file) => file.startsWith('order_local_prospector_') && file.endsWith('_steady_brass_pan_receipt_for_faster_claim_work.json'))
    .sort();
}

async function cleanLocalSamplePendingOrders(): Promise<void> {
  const pendingDir = resolve(process.cwd(), 'assets/crafting-queue/pending');
  await Promise.all((await localSamplePendingOrders()).map((file) => rm(resolve(pendingDir, file), { force: true })));
}

test.afterEach(async ({}, testInfo) => {
  await cleanPostedOrders(`e2e_${testInfo.project.name}`);
});

test('booting never posts the default local sample order', async ({ page }) => {
  await cleanLocalSamplePendingOrders();
  const errors = collectErrors(page);

  for (const query of ['?debug&nowaves&nolevel', '?nowaves&nolevel', '?debug&nowaves&nolevel']) {
    await page.goto(`/${query}`);
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
    expect(await localSamplePendingOrders()).toEqual([]);
  }

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

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

    await page.getByTestId('assay-post').click();
    await expect(page.getByTestId('assay-pending-status')).toHaveText('Already at the works');
    expect(JSON.parse(await readFile(filePath, 'utf8'))).toEqual(expected);
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  } finally {
    await rm(filePath, { force: true });
  }
});

test('verdicted order ids cannot be recreated as pending', async ({ page }) => {
  const duplicates = [
    {
      profile: 'local_prospector',
      text: 'steady brass pan receipt for faster claim work',
      timestamp: '2026-07-05T23:54:01.057Z',
    },
    {
      profile: 'm5_rejected_prospect',
      text: 'make a rifle with infinite range',
      timestamp: '2026-07-05T14:10:00.000Z',
    },
  ];

  for (const duplicate of duplicates) {
    const expected = makePendingQueueRequest(duplicate.text, duplicate.profile, duplicate.timestamp);
    const pendingPath = resolve(process.cwd(), pendingQueuePath(expected.id));
    await rm(pendingPath, { force: true });

    const errors = await openBench(
      page,
      `?debug&nowaves&nolevel&profile=${encodeURIComponent(duplicate.profile)}&queueNow=${encodeURIComponent(expected.timestamp)}`,
    );
    await page.getByTestId('assay-text').fill(duplicate.text);
    await page.getByTestId('assay-post').click();
    await expect(page.getByTestId('assay-pending-status')).toHaveText('Already at the works');
    await expect(page.getByTestId('assay-pending-path')).not.toHaveText(pendingQueuePath(expected.id));
    await expect(readFile(pendingPath, 'utf8')).rejects.toThrow();
    expect(errors.consoleErrors).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
  }
});

test('blank bench submits stay local', async ({ page }) => {
  await cleanLocalSamplePendingOrders();
  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=local_prospector');

  await page.getByTestId('assay-post').click();
  await expect(page.getByTestId('assay-pending-status')).toHaveText('Write an order first');
  await expect(page.getByTestId('assay-pending-path')).toHaveText('');
  expect(await localSamplePendingOrders()).toEqual([]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('first-run pipeline consumes pending orders and keeps verdicts flexible', async ({ page }) => {
  const consumed = [
    'order_m5_example_prospector_20260705t140000000z_steady_brass_pan_receipt_for_faster_claim_work.json',
    'order_local_prospector_20260705t235401057z_steady_brass_pan_receipt_for_faster_claim_work.json',
    'order_local_prospector_20260705t235419215z_steady_brass_pan_receipt_for_faster_claim_work.json',
  ];
  const pendingFiles = new Set(await readdir(resolve(process.cwd(), 'assets/crafting-queue/pending')).catch(() => []));
  expect(consumed.filter((file) => pendingFiles.has(file))).toEqual([]);

  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=local_prospector');
  const verdicts = await page.evaluate(async () => {
    const queuePath = '/src/crafting/CraftingQueue.ts';
    const { loadCraftingQueue } = await import(queuePath);
    const queue = loadCraftingQueue('local_prospector') as {
      approved: unknown[];
      rejected: Array<{ reasons: Array<{ message: string }> }>;
    };
    return {
      approved: queue.approved.length,
      rejected: queue.rejected.length,
      rejectedReasons: queue.rejected.flatMap((entry) => entry.reasons.map((reason) => reason.message)),
    };
  });
  expect(verdicts.approved + verdicts.rejected).toBeGreaterThanOrEqual(2);
  expect(verdicts.rejectedReasons.every((message) => message.length > 0)).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('approved fixtures enter a profile history once', async ({ page }) => {
  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=m5_example_prospector');

  const rows = page.getByTestId('assay-log').locator('li');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Brass Pan Receipt (common) arrived — collection opens soon');

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

test('bench hint is visible, avoids HUD chips, and closes both ways', async ({ page }) => {
  const errors = await openBench(page, '?debug&nowaves&nolevel&profile=m5_example_prospector');
  await expect(page.getByTestId('assay-hint')).toHaveText(
    'Write what you need — the Assayer takes orders now, fills them between sessions.',
  );
  await expect(page.getByTestId('assay-close')).toBeVisible();

  const benchBox = await page.getByTestId('assay-bench').boundingBox();
  expect(overlaps(benchBox, await page.getByTestId('hud-vitals').boundingBox())).toBe(false);
  expect(overlaps(benchBox, await page.getByTestId('hud-gold').boundingBox())).toBe(false);
  expect(overlaps(benchBox, await page.getByTestId('hud-build').boundingBox())).toBe(false);

  await page.keyboard.press('Escape');
  await expect(page.getByTestId('assay-bench')).toBeHidden();
  await page.getByTestId('assay-bench').evaluate((el) => {
    (el as HTMLElement).hidden = false;
    el.setAttribute('aria-hidden', 'false');
  });
  await page.getByTestId('assay-close').click();
  await expect(page.getByTestId('assay-bench')).toBeHidden();
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
