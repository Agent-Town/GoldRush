import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { onRequest as standingsRoute } from '../functions/api/standings';
import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
import { LANTERN_VERSION_REFUSAL } from '../src/ui/LanternShow';
import type { RunTape } from '../src/game/RunTape';

type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};
type BoardRow = {
  rank: number;
  profileName: string;
  declared: boolean;
  model?: string;
  harness?: string;
  harnessVersion?: string;
  party?: { riderCount: number; riders: Array<{ name: string; declared: boolean; model?: string; harness?: string; harnessVersion?: string }> };
  reel?: { id: string; simVersion: number };
};

const SHOTS = path.resolve('reviews/shots-f-board-1');
const COMPAT_SHOTS = path.resolve('reviews/shots-f1563-1');
const PROFILE_STATE: ProfileState = {
  version: 2,
  activeId: 'posse',
  profiles: [{ id: 'posse', name: 'Posse', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
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

function standing(anonId: string, waves: number, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractId: 'the-claim',
    epochId: 'epoch-1-frontier',
    score: { secured: true, waves, timeAlive: 600 + waves, gold: waves * 10, baseValue: waves * 20 },
    profileName: 'Posse',
    anonId,
    difficulty: 'trail',
    seed: `posse-${anonId}`,
    seedMode: 'live',
    seedHash: 'a'.repeat(64),
    inputLogHash: 'b'.repeat(64),
    ...extra,
  };
}

async function post(kv: MockKV, body: unknown): Promise<Response> {
  return standingsRoute({ request: request('POST', '', body), env: { TELEMETRY: kv } });
}

async function board(kv: MockKV, query: string): Promise<{ status: number; body: { board?: BoardRow[]; party?: string; error?: string } }> {
  const response = await standingsRoute({ request: request('GET', query), env: { TELEMETRY: kv } });
  return { status: response.status, body: (await response.json()) as { board?: BoardRow[]; party?: string; error?: string } };
}

function fixtureTape(id: string, simVersion: number): RunTape {
  return {
    version: 1,
    id,
    createdAt: 1,
    kept: false,
    contract: 'the-claim',
    seed: 'gold-rush',
    difficulty: 'trail',
    simVersion,
    inputLog: {
      version: 1,
      name: id,
      contractId: 'the-claim',
      seed: 'gold-rush',
      difficultyPreset: 'trail',
      stepSeconds: 1 / 30,
      start: { x: 0, z: 12 },
      durationTicks: 1,
      entries: [],
      truncated: null,
      primarySlot: 0,
      streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'secured', secured: true, waves: 12, timeAlive: 125.5, gold: 42 },
  };
}

function collectErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

const RIDERS = {
  pair: [{ name: 'Ada' }, { name: 'Cedar Jack', stack: { model: 'gpt-5.6-sol', harness: 'codex' } }],
  humans: [{ name: 'Ada' }, { name: 'Robin' }],
  agents: [{ name: 'Rig A', stack: { model: 'gpt-5.6-sol' } }, { name: 'Rig B', stack: { harness: 'gr-sim' } }],
  trio: [{ name: 'Ada' }, { name: 'Robin' }, { name: 'Cedar Jack', stack: { model: 'gpt-5.6-sol' } }],
};

test('a posse ranks only within its own size and never disturbs the solo board', async () => {
  const kv = makeKv();
  expect((await post(kv, standing('1'.repeat(32), 20, { stack: { model: 'deepseek/deepseek-v4-flash', harness: 'pi', harnessVersion: '0.84.1' } }))).status).toBe(200);
  expect((await post(kv, standing('2'.repeat(32), 10))).status).toBe(200);
  // The strongest run in the county is a posse of two. If size did not partition the field it
  // would take rank 1 from the solo board; the whole point of the ruling is that it cannot.
  expect((await post(kv, standing('3'.repeat(32), 40, { party: { riderCount: 2, riders: RIDERS.pair } }))).status).toBe(200);
  expect((await post(kv, standing('4'.repeat(32), 30, { party: { riderCount: 2, riders: RIDERS.humans } }))).status).toBe(200);
  expect((await post(kv, standing('5'.repeat(32), 35, { party: { riderCount: 3, riders: RIDERS.trio } }))).status).toBe(200);

  const solo = await board(kv, '?contract=the-claim&epoch=epoch-1-frontier');
  expect(solo.status).toBe(200);
  expect(solo.body.party).toBe('solo');
  expect(solo.body.board).toMatchObject([
    { rank: 1, waves: 20, declared: true, model: 'deepseek/deepseek-v4-flash', harness: 'pi', harnessVersion: '0.84.1' },
    { rank: 2, waves: 10, declared: false },
  ]);
  expect(solo.body.board?.[1]).not.toHaveProperty('model');
  expect(solo.body.board?.[1]).not.toHaveProperty('harness');
  expect(solo.body.board?.[1]).not.toHaveProperty('harnessVersion');
  for (const row of solo.body.board ?? []) expect(row).not.toHaveProperty('party');

  const posseOfTwo = await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=2');
  expect(posseOfTwo.body.party).toBe('2');
  // Re-ranked from 1 inside the size, not carrying a global rank down.
  expect(posseOfTwo.body.board).toMatchObject([
    { rank: 1, waves: 40, party: { riderCount: 2, riders: [{ name: 'Ada', declared: false }, { name: 'Cedar Jack', declared: true, model: 'gpt-5.6-sol', harness: 'codex' }] } },
    { rank: 2, waves: 30, party: { riderCount: 2, riders: [{ name: 'Ada', declared: false }, { name: 'Robin', declared: false }] } },
  ]);
  const posseOfThree = await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=3');
  expect(posseOfThree.body.board).toMatchObject([{ rank: 1, waves: 35, party: { riderCount: 3 } }]);
  expect((await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=4')).body.board).toEqual([]);

  // Display provenance rides the board now, while private storage and honesty markers do not.
  const serialized = JSON.stringify(posseOfTwo.body.board);
  expect(serialized).toContain('gpt-5.6-sol');
  expect(serialized).toContain('codex');
  for (const tell of ['stack', 'declaredBy', 'species', 'agent', 'anonId']) {
    expect(serialized).not.toContain(tell);
  }

  // Party partitions BEFORE the difficulty filter, so both survive together.
  expect((await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=2&difficulty=trail')).body.board).toHaveLength(2);
  expect((await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=2&difficulty=greenhorn')).body.board).toEqual([]);

  const badParty = await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=5');
  expect(badParty.status).toBe(400);
  expect(badParty.body.error).toBe('bad_party');
  expect((await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=1')).status).toBe(400);
  expect((await board(kv, '?contract=the-claim&epoch=epoch-1-frontier&party=')).status).toBe(400);
});

test('party is optional and strict once offered', async () => {
  const kv = makeKv();
  // F-1216-2's law: a solo post that predates the party field is untouched.
  expect((await post(kv, standing('a'.repeat(32), 5))).status).toBe(200);

  const rejected: Array<[string, unknown]> = [
    ['solo party', { riderCount: 1, riders: [{ name: 'Ada' }] }],
    ['over the lockstep ceiling', { riderCount: 5, riders: Array.from({ length: 5 }, () => ({ name: 'Ada' })) }],
    ['count disagrees with the list', { riderCount: 3, riders: RIDERS.humans }],
    ['riders missing', { riderCount: 2 }],
    ['unknown party key', { riderCount: 2, riders: RIDERS.humans, species: 'human' }],
    ['unknown rider key', { riderCount: 2, riders: [{ name: 'Ada' }, { name: 'Robin', agent: true }] }],
    ['rider stack over the cap', { riderCount: 2, riders: [{ name: 'Ada' }, { name: 'Robin', stack: { model: 'x'.repeat(257) } }] }],
    ['rider stack cost not an integer', { riderCount: 2, riders: [{ name: 'Ada' }, { name: 'Robin', stack: { calls: 1.5 } }] }],
    ['riders not a list', { riderCount: 2, riders: { name: 'Ada' } }],
    ['party not an object', 'two of us'],
  ];
  for (const [label, party] of rejected) {
    const response = await post(kv, standing('b'.repeat(32), 5, { party }));
    expect(response.status, label).toBe(400);
  }

  // A garbled rider NAME is coerced exactly as profileName is, never fatal to the standing.
  expect((await post(kv, standing('c'.repeat(32), 6, { party: { riderCount: 2, riders: [{ name: 7 }, { name: '  Ada   Lovelace  ' }] } }))).status).toBe(200);
  const stored = JSON.parse((await kv.get('standings:epoch-1-frontier:the-claim')) ?? '[]') as Array<Record<string, unknown>>;
  expect(stored.find((row) => row.anonId === 'c'.repeat(32))).toMatchObject({
    party: { riderCount: 2, riders: [{ name: 'Anonymous Prospector' }, { name: 'Ada Lovelace' }] },
  });
  expect(stored.find((row) => row.anonId === 'a'.repeat(32))).not.toHaveProperty('party');

  // A stored row whose party went bad is dropped on read, never rendered half-legible.
  const poisoned = makeKv();
  await poisoned.put('standings:epoch-1-frontier:the-claim', JSON.stringify([
    { ...(standing('d'.repeat(32), 9).score as object), profileName: 'Broken', anonId: 'd'.repeat(32), seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64), submittedAt: 1, party: { riderCount: 2, riders: [{ name: 'Ada' }] } },
    { ...(standing('e'.repeat(32), 8).score as object), profileName: 'Sound', anonId: 'e'.repeat(32), seedHash: 'a'.repeat(64), inputLogHash: 'b'.repeat(64), submittedAt: 2 },
  ]));
  expect((await board(poisoned, '?contract=the-claim&epoch=epoch-1-frontier')).body.board).toMatchObject([{ rank: 1, profileName: 'Sound' }]);
});

test('the field book reads composition from self-declared stacks, and ranks nothing', async () => {
  const kv = makeKv();
  await post(kv, standing('1'.repeat(32), 30, { party: { riderCount: 2, riders: RIDERS.pair } }));
  await post(kv, standing('2'.repeat(32), 25, { party: { riderCount: 2, riders: RIDERS.humans } }));
  await post(kv, standing('3'.repeat(32), 20, { party: { riderCount: 2, riders: RIDERS.agents } }));
  await post(kv, standing('4'.repeat(32), 15, { party: { riderCount: 3, riders: RIDERS.trio } }));
  await post(kv, standing('5'.repeat(32), 12));

  const response = await standingsRoute({
    request: request('GET', '?view=byParty&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  expect(response.status).toBe(200);
  const body = (await response.json()) as {
    view: string;
    contracts: string[];
    byParty: Array<{ composition: string; riderCount: number; contracts: Array<Record<string, unknown>> }>;
  };
  expect(body.view).toBe('byParty');
  expect(body.contracts).toEqual(['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron']);
  expect(body.byParty.map((row) => row.composition).sort()).toEqual(['a+a', 'h+a', 'h+h', 'h+h+a']);

  // Rider B declared a HARNESS but no model — an agent by declaration, an unregistered rig by name.
  expect(body.byParty.find((row) => row.composition === 'a+a')).toMatchObject({
    riderCount: 2,
    contracts: [{ contractId: 'the-claim', rigs: ['gpt-5.6-sol', 'unregistered rig'] }],
  });
  expect(body.byParty.find((row) => row.composition === 'h+h')).toMatchObject({ contracts: [{ rigs: [] }] });
  expect(body.byParty.find((row) => row.composition === 'h+h+a')).toMatchObject({ riderCount: 3 });
  // The solo row has no composition to read, so it appears in no group at all.
  expect(JSON.stringify(body.byParty)).not.toContain('"waves":12');
  // Information, never ranking.
  for (const row of body.byParty) for (const cell of row.contracts) expect(cell).not.toHaveProperty('rank');

  // The rig matrix is unchanged by any of this, and still counts a posse's submitter stack once.
  const byStack = await standingsRoute({ request: request('GET', '?view=byStack&epoch=epoch-1-frontier'), env: { TELEMETRY: kv } });
  expect(((await byStack.json()) as { view: string }).view).toBe('byStack');
  expect((await standingsRoute({ request: request('GET', '?view=byPosse&epoch=epoch-1-frontier'), env: { TELEMETRY: kv } })).status).toBe(400);
});

test('a standings row publishes a reel handle, and the reel itself is fetched on demand', async () => {
  const kv = makeKv();
  const tape = fixtureTape('11111111-1111-4111-8111-111111111111', 1);
  const { createHash } = await import('node:crypto');
  const withTape = standing('1'.repeat(32), 12, {
    seed: 'gold-rush',
    tape,
    inputLogHash: createHash('sha256').update(JSON.stringify(tape.inputLog)).digest('hex'),
    score: { secured: true, waves: 12, timeAlive: 125.5, gold: 42, baseValue: 60 },
  });
  expect((await post(kv, withTape)).status).toBe(200);
  expect((await post(kv, standing('2'.repeat(32), 6))).status).toBe(200);

  const rows = (await board(kv, '?contract=the-claim&epoch=epoch-1-frontier')).body.board ?? [];
  expect(rows[0]).toMatchObject({ rank: 1, reel: { id: tape.id, simVersion: 1 } });
  expect(rows[1]).not.toHaveProperty('reel');
  // A HANDLE, not the blob: the 64KB tape never rides the board.
  expect(JSON.stringify(rows)).not.toContain('inputLog');
  expect(JSON.stringify(rows)).not.toContain('eventLogHash');

  const reel = await standingsRoute({
    request: request('GET', `?contract=the-claim&epoch=epoch-1-frontier&reel=${tape.id}`),
    env: { TELEMETRY: kv },
  });
  expect(reel.status).toBe(200);
  expect((await reel.json()) as { reel: RunTape }).toMatchObject({ ok: true, reel: { id: tape.id, eventLogHash: tape.eventLogHash } });

  const missing = await standingsRoute({
    request: request('GET', '?contract=the-claim&epoch=epoch-1-frontier&reel=99999999-9999-4999-8999-999999999999'),
    env: { TELEMETRY: kv },
  });
  expect(missing.status).toBe(404);
  expect((await missing.json()) as { error: string }).toMatchObject({ error: 'reel_not_found' });
  for (const query of ['&reel=', `&reel=${'x'.repeat(65)}`, `&reel=${tape.id}&difficulty=trail`]) {
    const bad = await standingsRoute({ request: request('GET', `?contract=the-claim&epoch=epoch-1-frontier${query}`), env: { TELEMETRY: kv } });
    expect(bad.status, query).toBe(400);
  }
});

test('plain boot: an offline county clerk leaves the posse board and field book quiet', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
    // The reader's shipped offline guard short-circuits BEFORE any fetch, so this arm makes no
    // network request at all and the zero-error claim below can stay absolute and unfiltered.
    Object.defineProperty(Navigator.prototype, 'onLine', { configurable: true, get: () => false });
  }, { key: PROFILE_KEY, state: PROFILE_STATE });

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet — the door is open.');
  await page.getByTestId('county-standings-party-3').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No posse of 3 standings yet — the door is open.');
  await expect(page.getByTestId('county-standings-watch-1')).toHaveCount(0);
  await page.getByTestId('claim-ledger-field-book').click();
  await page.getByTestId('field-book-view-byParty').click();
  await expect(page.getByTestId('field-book-board')).toHaveText('No posses in the field book yet — the door is open.');
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain boot: a failing standings request adds no error of the application own', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', (route) => route.abort());

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet — the door is open.');
  await page.getByTestId('county-standings-party-2').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No posse of 2 standings yet — the door is open.');
  await page.getByTestId('claim-ledger-field-book').click();
  await page.getByTestId('field-book-view-byParty').click();
  await expect(page.getByTestId('field-book-board')).toHaveText('No posses in the field book yet — the door is open.');
  // Chromium logs its OWN transport failure for every aborted request, so this arm cannot claim a
  // clean console. What it CAN claim, and what matters, is that every line is that transport log —
  // the app adds nothing of its own, and throws nothing at all.
  expect(errors.page).toEqual([]);
  expect(errors.console.length).toBeGreaterThan(0);
  expect(errors.console.filter((line) => !line.includes('net::ERR_FAILED'))).toEqual([]);
});

test('plain boot: standings accept pre-declaration rows but reject malformed or dishonest stacks', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });
  const base = { profileName: 'Legacy rider', secured: true, waves: 12, timeAlive: 400, gold: 90, baseValue: 100, difficulty: 'trail' };
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: true,
      board: [
        { ...base, rank: 1 },
        { ...base, rank: 2, profileName: 'Legacy posse', party: { riderCount: 2, riders: [{ name: 'Ada' }, { name: 'Robin' }] } },
        { ...base, rank: 3, declared: 'yes' },
        { ...base, rank: 4, model: 7 },
        { ...base, rank: 5, harness: {} },
        { ...base, rank: 6, harnessVersion: 1 },
        { ...base, rank: 7, model: 'stack without a declaration' },
        { ...base, rank: 8, declared: false, model: 'stack while undeclared' },
      ],
    }),
  }));

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Legacy rider');
  await expect(page.getByTestId('county-standings-stack-1')).toHaveText('Undeclared rider');
  await expect(page.getByTestId('county-standings-row-2')).toContainText('Legacy posse');
  await expect(page.getByTestId('county-standings-stack-2-1')).toHaveText('Undeclared rider');
  await expect(page.getByTestId('county-standings-stack-2-2')).toHaveText('Undeclared rider');
  await expect(page.locator('[data-testid^="county-standings-row-"]')).toHaveCount(2);
  await expect(page.getByTestId('county-standings-board')).not.toContainText('undefined');
  expect(errors).toEqual({ console: [], page: [] });

  await mkdir(COMPAT_SHOTS, { recursive: true });
  await page.getByTestId('county-standings-board').screenshot({ path: path.join(COMPAT_SHOTS, `county-board-${testInfo.project.name}.png`) });
});

test('plain boot: posse chips rank within size, the field book counts hands, and a row watches its run', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  const now = Date.now();
  const playable = fixtureTape('11111111-1111-4111-8111-111111111111', 1);
  const foreign = fixtureTape('22222222-2222-4222-8222-222222222222', 2);
  await page.addInitScript(({ key, state }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: PROFILE_KEY, state: PROFILE_STATE });

  const seen: string[] = [];
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', async (route) => {
    const url = new URL(route.request().url());
    seen.push(url.search);
    const reelId = url.searchParams.get('reel');
    const body = reelId
      ? { ok: true, reel: reelId === playable.id ? playable : foreign }
      : url.searchParams.get('view') === 'byParty'
        ? {
            ok: true,
            view: 'byParty',
            epochId: 'epoch-1-frontier',
            contracts: ['the-claim'],
            byParty: [
              {
                composition: 'h+a',
                riderCount: 2,
                latestSubmittedAt: now,
                contracts: [{
                  contractId: 'the-claim',
                  score: { secured: true, waves: 30, timeAlive: 630, gold: 300, baseValue: 600 },
                  difficulty: 'trail',
                  submittedAt: now,
                  profileName: 'Ada',
                  riders: ['Ada', 'Cedar Jack'],
                  rigs: ['gpt-5.6-sol'],
                }],
              },
              {
                composition: 'h+h',
                riderCount: 2,
                latestSubmittedAt: now - 60_000,
                contracts: [{
                  contractId: 'the-claim',
                  score: { secured: true, waves: 25, timeAlive: 625, gold: 250, baseValue: 500 },
                  difficulty: 'greenhorn',
                  submittedAt: now - 60_000,
                  profileName: 'Robin',
                  riders: ['Ada', 'Robin'],
                  rigs: [],
                }],
              },
            ],
          }
        : url.searchParams.get('party') === '2'
          ? {
              ok: true,
              party: '2',
              board: [
                { rank: 1, profileName: 'Ada', secured: true, waves: 30, timeAlive: 630, gold: 300, baseValue: 600, difficulty: 'trail', declared: false, party: { riderCount: 2, riders: [{ name: 'Ada', declared: false }, { name: 'Cedar Jack', declared: true, model: 'deepseek/deepseek-v4-flash', harness: 'pi' }] } },
                { rank: 2, profileName: 'Robin', secured: true, waves: 25, timeAlive: 625, gold: 250, baseValue: 500, difficulty: 'greenhorn', declared: false, party: { riderCount: 2, riders: [{ name: 'Ada', declared: false }, { name: 'Robin', declared: false }] } },
              ],
            }
          : {
              ok: true,
              party: 'solo',
              board: [
                { rank: 1, profileName: 'Cedar Jack', secured: true, waves: 19, timeAlive: 518, gold: 211, baseValue: 150, difficulty: 'trail', declared: true, model: 'deepseek/deepseek-v4-flash', harness: 'pi', reel: { id: playable.id, simVersion: 1 } },
                { rank: 2, profileName: 'Grace', secured: true, waves: 17, timeAlive: 500, gold: 180, baseValue: 140, difficulty: 'vein-hunter', declared: true, model: 'gpt-5.6-sol', harness: 'codex', reel: { id: foreign.id, simVersion: 2 } },
                { rank: 3, profileName: 'Robin', secured: true, waves: 12, timeAlive: 400, gold: 90, baseValue: 100, difficulty: 'trail', declared: false },
              ],
            };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });

  await page.goto('/');
  expect(new URL(page.url()).search).toBe('');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();

  // Solo is the default board, so it is the FIRST chip. Asserted by ORDER, not presence: keying
  // the labels off an object put '2','3','4' ahead of 'solo' (integer-like keys sort first) and
  // every presence-only assertion stayed green while the default sat at the end of the row.
  await expect(page.locator('[data-standings-party]')).toHaveText(['Solo', 'Posse of 2', 'Posse of 3', 'Posse of 4']);
  await expect(page.getByTestId('county-standings-party-solo')).toHaveAttribute('aria-pressed', 'true');

  // Solo looks exactly like it always did, plus the reel column.
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Cedar Jack');
  await expect(page.getByTestId('county-standings-stack-1')).toHaveText('deepseek/deepseek-v4-flash · pi');
  await expect(page.getByTestId('county-standings-stack-3')).toHaveText('Undeclared rider');
  await expect(page.getByTestId('county-standings-watch-1')).toBeVisible();
  await expect(page.getByTestId('county-standings-row-3')).toContainText('No reel');
  expect(seen.at(-1)).not.toContain('party=');

  await page.getByTestId('county-standings-party-2').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Ada');
  await expect(page.getByTestId('county-standings-riders-1')).toContainText('Ada');
  await expect(page.getByTestId('county-standings-riders-1')).toContainText('Cedar Jack');
  await expect(page.getByTestId('county-standings-stack-1-2')).toHaveText('deepseek/deepseek-v4-flash · pi');
  await expect(page.getByTestId('county-standings-stack-2-2')).toHaveText('Undeclared rider');
  expect(seen.at(-1)).toContain('party=2');
  await expect(page.getByTestId('county-standings-party-4')).toBeVisible();

  await mkdir(SHOTS, { recursive: true });
  await page.getByTestId('county-standings-board').screenshot({ path: path.join(SHOTS, `posse-board-${testInfo.project.name}.png`) });

  // The Field Book counts hands — information, and no rank anywhere in it.
  await page.getByTestId('claim-ledger-field-book').click();
  await page.getByTestId('field-book-view-byParty').click();
  await expect(page.getByTestId('field-book-party-matrix')).toBeVisible();
  await expect(page.getByTestId('field-book-party-row-h-a')).toContainText('Human + Agent');
  await expect(page.getByTestId('field-book-party-cell-h-a-the-claim')).toContainText('gpt-5.6-sol');
  await expect(page.getByTestId('field-book-party-cell-h-h-the-claim')).toContainText('No rig declared');
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(SHOTS, `field-book-posse-${testInfo.project.name}.png`) });
  await page.getByTestId('field-book-view-byStack').click();
  await expect(page.getByTestId('field-book-party-matrix')).toHaveCount(0);

  // The version law, on the board's own surface: a reel cut for another machine is refused.
  // The chosen posse size survives the trip through the field book, so solo is re-selected here.
  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-party-2')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('county-standings-party-solo').click();
  await page.getByTestId('county-standings-watch-2').click();
  await expect(page.getByTestId('tape-version-refusal')).toHaveText(LANTERN_VERSION_REFUSAL);
  await expect(page.getByTestId('claim-ledger')).toBeVisible();

  // And a reel this machine can thread hands off to the shipped Lantern Show.
  await page.getByTestId('county-standings-watch-1').click();
  await expect(page.getByTestId('lantern-show')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('claim-ledger')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get('replay')).toBe(playable.id);
  await page.getByTestId('lantern-show').screenshot({ path: path.join(SHOTS, `watch-this-run-${testInfo.project.name}.png`) });

  expect(errors).toEqual({ console: [], page: [] });
});
