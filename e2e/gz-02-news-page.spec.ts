import { createServer, type Server } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const ROOT = path.resolve('.');
const SITE_DIR = path.resolve('site');
const ARTIFACT_DIR = path.resolve('artifacts/gz-02');

let server: Server;
let baseUrl = '';

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  ({ server, baseUrl } = await serveSite());
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('renders Gazette dispatches newest-first', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await mockFeed(page, 'gz-02-herald.json');
  await page.goto(`${baseUrl}/news.html`);

  const items = page.locator('.news-item');
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('The Assay Office opens its public ledger');
  await expect(items.nth(0)).toContainText('Jul 11, 2026');
  await expect(items.nth(0).locator('.news-lines p')).toHaveCount(3);
  await expect(items.nth(1)).toContainText('Claim board lights at dawn');
  await expect(page.locator('.news-image')).toBeVisible();
  await expect(page.locator('.news-empty')).toHaveCount(0);

  if (testInfo.project.name === 'desktop-chrome') await screenshot(page, testInfo, 'populated');
  expect(errors).toEqual([]);
});

test('renders the empty Gazette state', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await mockFeed(page, 'gz-02-empty-herald.json');
  await page.goto(`${baseUrl}/news.html`);

  await expect(page.locator('.news-empty')).toHaveText('No fresh ink yet.');
  await expect(page.locator('.news-item')).toHaveCount(0);

  if (testInfo.project.name === 'desktop-chrome') await screenshot(page, testInfo, 'empty');
  expect(errors).toEqual([]);
});

test('keeps Gazette readable on mobile width', async ({ page }, testInfo) => {
  const errors = watchErrors(page);
  await mockFeed(page, 'gz-02-herald.json');
  await page.goto(`${baseUrl}/news.html`);

  await expect(page.locator('.news-item').first()).toBeVisible();
  await expect(page.locator('.news-body h2').first()).toBeVisible();

  if (testInfo.project.name === 'mobile-chrome') await screenshot(page, testInfo, 'mobile-populated');
  expect(errors).toEqual([]);
});

async function serveSite(): Promise<{ server: Server; baseUrl: string }> {
  const siteServer = createServer(async (request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
    const roots = pathname.startsWith('/news/') ? [ROOT, `.${pathname}`] : [SITE_DIR, `.${pathname}`];
    const filePath = path.resolve(roots[0], roots[1]);
    if (!filePath.startsWith(`${roots[0]}${path.sep}`)) {
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
  return { server: siteServer, baseUrl: `http://127.0.0.1:${address.port}` };
}

function contentType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.png')) return 'image/png';
  return 'application/octet-stream';
}

async function mockFeed(page: Page, fixture: string): Promise<void> {
  const body = await readFile(path.resolve('e2e/fixtures', fixture), 'utf8');
  await page.route('**/news/herald.json', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body,
    }),
  );
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
