import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

type ResponseRow = {
  url: string;
  status: number;
  type: string;
  bytes: number;
};

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test('052 first-load transfer stays within the download diet', async ({ page, baseURL }, testInfo) => {
  const origin = new URL(baseURL ?? 'http://127.0.0.1:5188').origin;
  const rows: ResponseRow[] = [];
  const jobs: Promise<unknown>[] = [];
  const errors = collectErrors(page);

  page.on('response', (response) => {
    if (!response.url().startsWith(origin)) return;
    const row: ResponseRow = {
      url: response.url(),
      status: response.status(),
      type: response.request().resourceType(),
      bytes: 0,
    };
    rows.push(row);
    jobs.push(
      response
        .finished()
        .then(async () => {
          try {
            row.bytes = (await response.body()).length;
          } catch {
            row.bytes = Number(response.headers()['content-length'] ?? 0) || 0;
          }
        })
        .catch(() => undefined),
    );
  });

  await page.goto('/');
  await page.getByTestId('start-menu').waitFor();
  await page.waitForLoadState('networkidle').catch(() => undefined);
  const bootAudio = rows.filter((row) => row.url.endsWith('.mp3')).length;

  await page.getByTestId('start-menu-new-claim').click();
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30);
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await Promise.all(jobs);

  const total = rows.reduce((sum, row) => sum + row.bytes, 0);
  const summary: Record<string, { count: number; bytes: number }> = {};
  for (const row of rows) {
    summary[row.type] ??= { count: 0, bytes: 0 };
    summary[row.type].count += 1;
    summary[row.type].bytes += row.bytes;
  }
  const top = [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 20);

  await mkdir('artifacts/052', { recursive: true });
  await writeFile(
    `artifacts/052/${testInfo.project.name}-network.json`,
    `${JSON.stringify({ total, mb: total / 1024 / 1024, bootAudio, summary, top, errors, rows }, null, 2)}\n`,
    'utf8',
  );

  expect(errors).toEqual([]);
  expect(bootAudio).toBe(0);
  expect(total).toBeLessThanOrEqual(12 * 1024 * 1024);
});
