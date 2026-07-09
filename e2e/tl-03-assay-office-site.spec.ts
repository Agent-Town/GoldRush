import { createServer, type Server } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type Route, type TestInfo } from '@playwright/test';

const SITE_DIR = path.resolve('site');
const ARTIFACT_DIR = path.resolve('artifacts/tl-03');
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*' };
const IDENTIFIER_WORDS = ['nonce', 'email', 'profile', 'wallet', 'userid'];

let server: Server;
let baseUrl = '';
let populatedPayload: Record<string, unknown>;
let emptyPayload: Record<string, unknown>;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  [populatedPayload, emptyPayload] = await Promise.all([
    readJson('artifacts/tl-02/desktop-chrome-populated-response.json'),
    readJson('artifacts/tl-02/desktop-chrome-empty-response.json'),
  ]);
  ({ server, baseUrl } = await serveSite());
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('renders populated Assay Office aggregates', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await setRefresh(page, 10000);
  await mockStats(page, populatedPayload);
  await page.goto(baseUrl);

  const office = page.locator('#assay-office');
  await expect(office).toBeVisible();
  await expect(office).toContainText('Anonymous gameplay statistics, no personal data, opt-out in Settings.');
  await expect(office.locator('[data-assay="runs-all-time"]')).toHaveText('42');
  await expect(office.locator('[data-assay="deepest-wave"]')).toHaveText('37');
  await expect(office.locator('[data-assay="typical-run"]')).toHaveText('3–5 min');
  await expect(office.locator('[data-assay="busiest-contract"]')).toHaveText('Steady Hands');
  await expect(office.locator('[data-assay="runs-today"]')).toHaveText('5');
  await expect(office.locator('[data-assay="runs-seven-days"]')).toHaveText('14');
  expectNoIdentifierWords(await office.innerText());

  if (testInfo.project.name === 'desktop-chrome' || testInfo.project.name === 'mobile-chrome') {
    await screenshot(page, testInfo, 'populated');
  }
  expect(errors).toEqual([]);
});

test('renders empty office message without zero tallies', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await setRefresh(page, 10000);
  await mockStats(page, emptyPayload);
  await page.goto(baseUrl);

  const office = page.locator('#assay-office');
  await expect(office).toBeVisible();
  await expect(office.locator('[data-assay="message"]')).toHaveText('the office opens with the first assay');
  await expect(office.locator('[data-assay="grid"]')).toBeHidden();
  await expect(office).toContainText('Anonymous gameplay statistics, no personal data, opt-out in Settings.');
  await expect(office).not.toContainText('42');
  await expect(office).not.toContainText('37');

  if (testInfo.project.name === 'desktop-chrome') {
    await screenshot(page, testInfo, 'empty');
  }
  expect(errors).toEqual([]);
});

test('renders quiet fallback when the stats wire fails', async ({ page }) => {
  const errors = watchErrors(page);
  await setRefresh(page, 10000);
  await page.route('**/api/stats*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: 'not-json',
    }),
  );
  await page.goto(baseUrl);

  await expect(page.locator('#assay-office [data-assay="message"]')).toHaveText('the wire is quiet — the office reports again shortly');
  await expect(page.locator('.hero')).toBeVisible();
  await expect(page.locator('#pillars')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
  expect(errors).toEqual([]);
});

test('refreshes the Assay Office feed', async ({ page }) => {
  let hits = 0;
  await setRefresh(page, 150);
  await page.route('**/api/stats*', async (route) => {
    hits += 1;
    await fulfillJson(route, populatedPayload);
  });
  await page.goto(baseUrl);

  await expect.poll(() => hits, { timeout: 1200 }).toBeGreaterThanOrEqual(2);
});

test('keeps the telemetry promise honest', async ({ page }) => {
  await setRefresh(page, 10000);
  await mockStats(page, populatedPayload);
  await page.goto(baseUrl);

  await expect(page.locator('footer')).not.toContainText('no analytics, no third-party beacons');
  await expect(page.locator('footer')).toContainText('Anonymous gameplay statistics only — no personal data, no third-party trackers, opt-out in Settings.');
  await expect(page.locator('#assay-office')).toContainText('Anonymous gameplay statistics, no personal data, opt-out in Settings.');
});

async function readJson(file: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path.resolve(file), 'utf8')) as Record<string, unknown>;
}

async function serveSite(): Promise<{ server: Server; baseUrl: string }> {
  const siteServer = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const filePath = path.resolve(SITE_DIR, `.${pathname}`);
    if (!filePath.startsWith(`${SITE_DIR}${path.sep}`)) {
      response.writeHead(403).end('forbidden');
      return;
    }
    try {
      const body = await readFile(filePath);
      response.writeHead(200, { 'Content-Type': contentType(filePath) });
      response.end(body);
    } catch {
      response.writeHead(404).end('not found');
    }
  });
  await new Promise<void>((resolve) => siteServer.listen(0, '127.0.0.1', resolve));
  const address = siteServer.address();
  if (!address || typeof address === 'string') throw new Error('static server did not bind a port');
  return { server: siteServer, baseUrl: `http://127.0.0.1:${address.port}/` };
}

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

async function mockStats(page: Page, payload: Record<string, unknown>): Promise<void> {
  await page.route('**/api/stats*', (route) => fulfillJson(route, payload));
}

async function setRefresh(page: Page, refreshMs: number): Promise<void> {
  await page.addInitScript((ms) => {
    (window as Window & { __ASSAY_REFRESH_MS__?: number }).__ASSAY_REFRESH_MS__ = ms;
  }, refreshMs);
}

async function fulfillJson(route: Route, payload: Record<string, unknown>): Promise<void> {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: CORS_HEADERS,
    body: JSON.stringify(payload),
  });
}

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

async function screenshot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
}

function expectNoIdentifierWords(text: string): void {
  const lower = text.toLowerCase();
  for (const word of IDENTIFIER_WORDS) expect(lower).not.toContain(word);
}
