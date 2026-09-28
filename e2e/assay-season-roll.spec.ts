import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsRoute } from '../functions/api/standings';
import { GAME_API_ORIGIN } from '../src/app/GameApi';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';

// THE SEASON ROLL (owner ruling 2026-08-15, specs/agent-play/tape-contract.md §"The legacy board —
// RULED: SEASON ROLL"). The board a player opens is the season now riding; the pre-assay board is
// one tap away as closed history. Both views are served here by the REAL endpoint over a mock KV,
// so the reader's own query params are what prove the archive door works.
type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};
type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };

const SHOTS = path.resolve('artifacts/assay-season-roll');
const ARCHIVE_KEY = 'standings:epoch-1-frontier:the-claim';
const BOARD_KEY = 'standings:s2:epoch-1-frontier:the-claim';
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'robin',
  profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
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

function tape(id: string, waves: number, version: 1 | 2): Record<string, unknown> {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    version, id, createdAt: 1, kept: true, contract: 'the-claim', seed: 'gold-rush',
    difficulty: 'trail', simVersion: 1,
    ...(version === 2
      ? { runStart: { meta, research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null } } }
      : {}),
    inputLog: {
      version: 1, name: id, contractId: 'the-claim', seed: 'gold-rush', difficultyPreset: 'trail',
      stepSeconds: 1 / 30, start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null,
      primarySlot: 0, streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'secured', secured: true, waves, timeAlive: 120, gold: 40 },
  };
}

function row(name: string, anonId: string, waves: number, tapeVersion: 1 | 2, submittedAt: number): Record<string, unknown> {
  return {
    secured: true, waves, timeAlive: 120, gold: 40, baseValue: 60,
    profileName: name, anonId, difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64), submittedAt,
    tape: tape(`${anonId.slice(0, 6)}-reel`, waves, tapeVersion),
    assay: 'pending',
  };
}

async function seedBoards(): Promise<MockKV> {
  const kv = makeKv();
  const now = Date.now();
  // The closed first ledger, at the key shape it was written with — never re-keyed, never rewritten.
  await kv.put(ARCHIVE_KEY, JSON.stringify([
    row('Founding Rider', '1'.repeat(32), 27, 1, now - 86_400_000),
    row('Cedar Jack', '2'.repeat(32), 19, 1, now - 172_800_000),
  ]));
  // The season now riding: one assayable run, posted after the roll.
  await kv.put(BOARD_KEY, JSON.stringify([row('Fresh Season Rider', '3'.repeat(32), 12, 2, now - 60_000)]));
  return kv;
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function serveCounty(page: Page, kv: MockKV, seen: string[]): Promise<void> {
  await page.route(`${GAME_API_ORIGIN}/api/standings**`, async (route) => {
    const request = route.request();
    seen.push(new URL(request.url()).search);
    const response = await standingsRoute({
      request: new Request(request.url(), { method: request.method(), headers: request.headers() }),
      // localhost-cors-2 (F-LC2-4): the browser's own headers are forwarded, so whether or not they carry the page's
      // localhost Origin, the door sees the development switch a developer's box would carry.
      env: { TELEMETRY: kv, ALLOW_LOCALHOST_ORIGINS: '1' },
    });
    await route.fulfill({
      status: response.status,
      headers: { ...Object.fromEntries(response.headers), 'access-control-allow-origin': '*' },
      body: await response.text(),
    });
  });
}

test('the county board opens on the season now riding and reaches the closed first ledger', async ({ page }, testInfo) => {
  const kv = await seedBoards();
  const seen: string[] = [];
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await serveCounty(page, kv, seen);

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();

  // The default view is the current season — and the reader proves it by NOT naming a season.
  await expect(page.getByTestId('county-standings-season-current')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('county-standings-season-first')).toHaveAttribute('aria-pressed', 'false');
  await page.getByTestId('county-standings-week-all').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Fresh Season Rider');
  await expect(page.getByTestId('county-standings-row-2')).toHaveCount(0);
  await expect(page.locator('.county-standings__board-label')).toContainText('County board');
  expect(seen.filter((search) => search.includes('contract=the-claim')).every((search) => !search.includes('season='))).toBe(true);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await mkdir(SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `current-season-${testInfo.project.name}.png`) });

  // One tap reaches the archive, and it says plainly what it is.
  await page.getByTestId('county-standings-season-first').click();
  await expect(page.getByTestId('county-standings-season-first')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Founding Rider');
  await expect(page.getByTestId('county-standings-row-2')).toContainText('Cedar Jack');
  await expect(page.locator('.county-standings__board-label')).toContainText('First ledger');
  await expect(page.locator('.county-standings__seasons-hint')).toContainText('closed');
  expect(seen.some((search) => search.includes('season=1'))).toBe(true);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `first-ledger-${testInfo.project.name}.png`) });

  // And back: the season now riding is always one tap away too.
  await page.getByTestId('county-standings-season-current').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Fresh Season Rider');
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('the archive door serves season one read-only and refuses the pen', async () => {
  const kv = await seedBoards();
  const before = await kv.get(ARCHIVE_KEY);

  const archive = await standingsRoute({
    request: new Request('http://127.0.0.1/api/standings?contract=the-claim&epoch=epoch-1-frontier&season=1'),
    env: { TELEMETRY: kv },
  });
  expect(archive.status).toBe(200);
  expect(await archive.json()).toMatchObject({
    season: 1,
    assayEra: false,
    board: [{ rank: 1, profileName: 'Founding Rider' }, { rank: 2, profileName: 'Cedar Jack' }],
  });

  const current = await standingsRoute({
    request: new Request('http://127.0.0.1/api/standings?contract=the-claim&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  expect(await current.json()).toMatchObject({
    season: 2,
    assayEra: true,
    board: [{ rank: 1, profileName: 'Fresh Season Rider' }],
  });

  const closed = await standingsRoute({
    request: new Request('http://127.0.0.1/api/standings?season=1', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
      body: JSON.stringify({ contractId: 'the-claim', epochId: 'epoch-1-frontier' }),
    }),
    env: { TELEMETRY: kv },
  });
  expect(closed.status).toBe(403);
  expect(await closed.json()).toMatchObject({ ok: false, error: 'season_closed' });
  expect(await kv.get(ARCHIVE_KEY)).toBe(before);
});
