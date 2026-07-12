import { mkdir } from 'node:fs/promises';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const SHOT_DIR = 'artifacts/fresh-build-toast';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function stubVersion(page: Page, build: string): Promise<() => number> {
  let requests = 0;
  await page.route('**/version.json*', async (route) => {
    requests += 1;
    await route.fulfill({ json: { build, builtAt: '2099-01-01T00:00:00Z' } });
  });
  return () => requests;
}

test('new build shows fresh ink and reloads an idle start menu', async ({ page }, testInfo: TestInfo) => {
  const errors = collectErrors(page);
  const requestCount = await stubVersion(page, 'newer-build');
  await page.goto('/');
  const toast = page.getByTestId('fresh-build-toast');
  await expect(toast).toHaveText('Fresh ink — a newer build is out. Refresh keeps your place.');
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: `${SHOT_DIR}/${testInfo.project.name}-toast.png`, fullPage: true });

  await page.clock.setFixedTime(Date.now() + 61_000);
  const reloaded = page.waitForEvent('load');
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await reloaded;
  await expect.poll(requestCount).toBeGreaterThan(1);
  expect(errors).toEqual([]);
});

test('new build never auto-reloads a run', async ({ page }) => {
  const errors = collectErrors(page);
  let documentRequests = 0;
  page.on('request', (request) => {
    if (request.resourceType() === 'document') documentRequests += 1;
  });
  const requestCount = await stubVersion(page, 'newer-build');
  await page.goto('/?debug&nowaves&nolevel&seed=fresh-build');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await expect(page.getByTestId('fresh-build-toast')).toBeVisible();
  const before = requestCount();

  await page.clock.setFixedTime(Date.now() + 61_000);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.poll(requestCount).toBeGreaterThan(before);
  await expect(page.getByTestId('fresh-build-toast')).toBeVisible();
  expect(page.url()).toContain('seed=fresh-build');
  expect(documentRequests).toBe(1);
  expect(errors).toEqual([]);
});

test('running build shows no toast', async ({ page }) => {
  const errors = collectErrors(page);
  await stubVersion(page, 'dev');
  await page.goto('/');
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await expect(page.getByTestId('fresh-build-toast')).toHaveCount(0);
  expect(errors).toEqual([]);
});
