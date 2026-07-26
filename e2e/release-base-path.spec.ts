import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { GAME_API_ORIGIN, gameApiUrl } from '../src/app/GameApi';

test('release boots cleanly beneath /goldrush/ and keeps API traffic on the game project', async ({ page }, testInfo) => {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const notFound: string[] = [];
  const apiRequests: string[] = [];
  const network: Array<{ method: string; status: number; url: string }> = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    network.push({ method: response.request().method(), status: response.status(), url: response.url() });
    if (response.status() === 404) notFound.push(response.url());
    if (response.url().startsWith(`${GAME_API_ORIGIN}/api/`)) apiRequests.push(response.url());
  });
  await page.route(`${GAME_API_ORIGIN}/api/**`, (route) => route.fulfill({ json: { ok: true } }));

  await page.goto('.');
  await expect(page.locator('#game-canvas')).toBeAttached();
  await expect(page.getByTestId('start-menu')).toBeVisible();
  await page.evaluate(async (urls) => {
    await Promise.all(urls.map((url) => fetch(url)));
  }, [
    gameApiUrl('/api/telemetry'),
    gameApiUrl('/api/stats'),
    gameApiUrl('/api/bug-report'),
    gameApiUrl('/api/verify'),
    gameApiUrl('/api/multiplayer/inspect'),
  ]);

  expect(apiRequests.sort()).toEqual([
    `${GAME_API_ORIGIN}/api/bug-report`,
    `${GAME_API_ORIGIN}/api/multiplayer/inspect`,
    `${GAME_API_ORIGIN}/api/stats`,
    `${GAME_API_ORIGIN}/api/telemetry`,
    `${GAME_API_ORIGIN}/api/verify`,
  ]);
  expect(notFound).toEqual([]);
  expect(failedRequests).toEqual([]);
  expect(consoleErrors).toEqual([]);
  await testInfo.attach('subpath-network.json', {
    body: JSON.stringify(network.sort((left, right) => left.url.localeCompare(right.url)), null, 2),
    contentType: 'application/json',
  });
});

test('every game function permits both agenttown origins', () => {
  for (const path of [
    'functions/api/_accounts.ts',
    'functions/api/_bugs.ts',
    'functions/api/_multiplayer.ts',
    'functions/api/stats.ts',
    'functions/api/telemetry.ts',
  ]) {
    const source = readFileSync(path, 'utf8');
    expect(source, path).toContain("'https://agenttown.app'");
    expect(source, path).toContain("'https://www.agenttown.app'");
  }
});
