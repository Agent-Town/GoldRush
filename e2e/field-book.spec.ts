import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsRoute } from '../functions/api/standings';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};

const SHOTS = path.resolve('reviews/shots-fd3');
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'field-book',
  profiles: [{ id: 'field-book', name: 'Field Book', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
};

function makeKv(): MockKV {
  const store = new Map<string, string>();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => {
      store.set(key, value);
    },
  };
}

function request(method: 'GET' | 'POST', query = '', body?: unknown): Request {
  return new Request(`http://127.0.0.1/api/standings${query}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function standing(anonId: string, contractId: string, waves: number, stack?: Record<string, unknown>): Record<string, unknown> {
  return {
    contractId,
    epochId: 'epoch-1-frontier',
    score: { secured: true, waves, timeAlive: 600 + waves, gold: waves * 10, baseValue: waves * 20 },
    profileName: 'Field Book',
    anonId,
    difficulty: 'trail',
    seed: `field-book-${anonId}`,
    seedMode: 'live',
    seedHash: 'a'.repeat(64),
    inputLogHash: 'b'.repeat(64),
    ...(stack ? { stack } : {}),
  };
}

async function post(kv: MockKV, body: unknown): Promise<Response> {
  return standingsRoute({ request: request('POST', '', body), env: { TELEMETRY: kv } });
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

test('optional cost fields group the best score by model and never change county ranking', async () => {
  const kv = makeKv();
  const expensiveBest = standing('1'.repeat(32), 'the-claim', 20, {
    model: 'gpt-5.6-sol', harness: 'codex', harnessVersion: '2026.08', config: 'medium',
    tokensIn: 90_000, tokensOut: 8_000, calls: 18,
  });
  const cheapLower = standing('2'.repeat(32), 'the-claim', 10, {
    model: 'gpt-5.6-sol', harness: 'codex', tokensIn: 1, tokensOut: 1, calls: 1,
  });
  const noCost = standing('3'.repeat(32), 'e1-dry-gulch', 14, {
    model: 'gpt-5.6-sol', harness: 'gr-sim', harnessVersion: '1', config: 'idle',
  });
  const unregistered = standing('4'.repeat(32), 'e1-dry-gulch', 12);

  for (const body of [expensiveBest, cheapLower, noCost, unregistered]) expect((await post(kv, body)).status).toBe(200);
  for (const field of ['tokensIn', 'tokensOut', 'calls']) {
    for (const value of [-1, 1.5, 1_000_000_000_001]) {
      expect((await post(kv, standing('5'.repeat(32), 'the-claim', 1, { model: 'invalid', [field]: value }))).status).toBe(400);
    }
  }

  const county = await standingsRoute({
    request: request('GET', '?contract=the-claim&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  expect(await county.json()).toMatchObject({ board: [{ rank: 1, waves: 20 }, { rank: 2, waves: 10 }] });

  const response = await standingsRoute({
    request: request('GET', '?view=byStack&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  const body = await response.json() as {
    view: string;
    contracts: string[];
    byStack: Array<{ model: string; contracts: Array<Record<string, unknown>> }>;
  };
  expect(response.status).toBe(200);
  expect(body.view).toBe('byStack');
  expect(body.contracts).toEqual(['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron']);
  expect(body.byStack.find((row) => row.model === 'gpt-5.6-sol')).toMatchObject({
    contracts: [
      {
        contractId: 'the-claim',
        score: { secured: true, waves: 20 },
        difficulty: 'trail',
        tokensIn: 90_000,
        tokensOut: 8_000,
        calls: 18,
        harness: 'codex',
        harnessVersion: '2026.08',
      },
      { contractId: 'e1-dry-gulch', score: { secured: true, waves: 14 }, harness: 'gr-sim' },
    ],
  });
  expect(body.byStack.find((row) => row.model === 'unregistered rig')).toMatchObject({
    contracts: [{ contractId: 'e1-dry-gulch', score: { waves: 12 } }],
  });
  expect(body.byStack.find((row) => row.model === 'gpt-5.6-sol')?.contracts[1]).not.toHaveProperty('tokensIn');
});

test('plain boot renders and expands the Field Book matrix', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const now = Date.now();
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('view')).toBe('byStack');
    expect(url.searchParams.get('epoch')).toBe('epoch-1-frontier');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        view: 'byStack',
        epochId: 'epoch-1-frontier',
        contracts: ['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron'],
        byStack: [
          {
            model: 'gpt-5.6-sol',
            latestSubmittedAt: now - 60_000,
            contracts: [
              {
                contractId: 'the-claim',
                score: { secured: true, waves: 20, timeAlive: 620, gold: 200, baseValue: 400 },
                difficulty: 'trail',
                tokensIn: 90_000,
                tokensOut: 8_000,
                calls: 18,
                harness: 'codex',
                harnessVersion: '2026.08',
                config: 'medium',
                submittedAt: now - 60_000,
              },
              {
                contractId: 'e1-dry-gulch',
                score: { secured: true, waves: 14, timeAlive: 614, gold: 140, baseValue: 280 },
                difficulty: 'vein-hunter',
                harness: 'gr-sim',
                submittedAt: now - 86_400_000,
              },
            ],
          },
          {
            model: 'unregistered rig',
            latestSubmittedAt: now - 120_000,
            contracts: [{
              contractId: 'the-claim',
              score: { secured: true, waves: 12, timeAlive: 612, gold: 120, baseValue: 240 },
              difficulty: 'greenhorn',
              submittedAt: now - 120_000,
            }],
          },
          {
            model: 'pi-v4',
            latestSubmittedAt: now - 180_000,
            contracts: [{
              contractId: 'e1-dry-gulch',
              score: { secured: true, waves: 20, timeAlive: 700, gold: 260, baseValue: 420 },
              difficulty: 'trail',
              submittedAt: now - 180_000,
            }],
          },
        ],
      }),
    });
  });

  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-field-book').click();
  await expect(page.getByTestId('field-book-matrix')).toBeVisible();
  await expect(page.getByTestId('field-book-matrix')).toContainText('3 rigs · 2 contracts with showings');
  await expect(page.getByTestId('field-book-matrix').locator('thead th')).toHaveCount(3);
  await expect(page.getByTestId('field-book-matrix')).not.toContainText('Night Shift');
  await expect(page.getByTestId('field-book-cell-gpt-5-6-sol-the-claim')).toContainText('90,000 in');
  await expect(page.getByTestId('field-book-cell-gpt-5-6-sol-e1-dry-gulch')).toContainText('Cost not declared');
  await expect(page.getByTestId('field-book-row-unregistered-rig')).toBeVisible();
  await page.getByTestId('field-book-row-gpt-5-6-sol').click();
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText('codex 2026.08');
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText('medium');
  await expect(page.getByTestId('field-book-detail-gpt-5-6-sol-the-claim')).toContainText(new Date(now - 60_000).toISOString());
  await mkdir(SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `after-field-book-${testInfo.project.name}.png`) });
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain boot renders the honest empty Field Book state', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, view: 'byStack', epochId: 'epoch-1-frontier', contracts: [], byStack: [] }),
  }));

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-field-book').click();
  await expect(page.getByTestId('field-book-board')).toHaveText('No rigs in the field book yet — the door is open.');
  expect(errors).toEqual({ console: [], page: [] });
});
