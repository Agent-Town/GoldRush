import { createHash } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import { onRequest as standingsRoute } from '../functions/api/standings';
import type { DifficultyPresetId } from '../src/game/Balance';
import { PROFILE_KEY, SCOREBOARD_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
import type { RunTape } from '../src/game/RunTape';
import { TELEMETRY_DEV_SEND_STORAGE_KEY, TELEMETRY_OPT_IN_STORAGE_KEY } from '../src/telemetry/payload';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type MockKV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
};
type StandingPost = {
  contractId: string;
  epochId: string;
  score: { secured: true; waves: number; timeAlive: number; gold: number; baseValue: number };
  profileName: string;
  anonId: string;
  difficulty: DifficultyPresetId;
  seed: string;
  seedMode: 'live' | 'bench';
  seedHash: string;
  inputLogHash: string;
  stack?: { model?: string; harness?: string; harnessVersion?: string; config?: string };
  tape?: RunTape;
};

const ARTIFACT_DIR = path.resolve('artifacts/county-standings');
const FD3_SHOTS = path.resolve('reviews/shots-fd3');
const CLAIM_BENCH_SEED = benchSeeds['the-claim'][0]!;
const WRONG_CONTRACT_BENCH_SEED = benchSeeds['e1-dry-gulch'][0]!;
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

function apiRequest(method: 'GET' | 'POST', query = '', body?: unknown): Request {
  return new Request(`http://127.0.0.1/api/standings${query}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json', 'CF-Connecting-IP': '127.0.0.1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function validPost(anonId: string, waves = 10): StandingPost {
  return {
    contractId: 'the-claim',
    epochId: 'epoch-1-frontier',
    score: { secured: true, waves, timeAlive: 125.5, gold: 42, baseValue: 60 },
    profileName: 'Robin',
    anonId,
    difficulty: 'trail',
    seed: 'gold-rush',
    seedMode: 'live',
    seedHash: 'a'.repeat(64),
    inputLogHash: 'b'.repeat(64),
  };
}

function validTape(seed: string, difficulty: DifficultyPresetId): RunTape {
  return {
    version: 1,
    id: '11111111-1111-4111-8111-111111111111',
    createdAt: 1,
    kept: false,
    contract: 'the-claim',
    seed,
    difficulty,
    simVersion: 1,
    inputLog: {
      version: 1,
      name: '11111111-1111-4111-8111-111111111111',
      contractId: 'the-claim',
      seed,
      difficultyPreset: difficulty,
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

async function seedProfile(page: Page, optIn = true, devSend = true, scores?: unknown[]): Promise<void> {
  await page.addInitScript(
    ({ profileKey, profileState, scoreKey, scores, telemetryKey, devSendKey, optIn, devSend }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profileKey, JSON.stringify(profileState));
      if (scores) localStorage.setItem(scoreKey, JSON.stringify(scores));
      localStorage.setItem(telemetryKey, optIn ? '1' : '0');
      if (devSend) localStorage.setItem(devSendKey, '1');
    },
    {
      profileKey: PROFILE_KEY,
      profileState: PROFILE_STATE,
      scoreKey: profileDataKey(PROFILE_STATE.activeId, SCOREBOARD_KEY),
      scores,
      telemetryKey: TELEMETRY_OPT_IN_STORAGE_KEY,
      devSendKey: TELEMETRY_DEV_SEND_STORAGE_KEY,
      optIn,
      devSend,
    },
  );
}

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function secureClaim(page: Page, seed: string, beforeSecure?: () => Promise<void>, extraQuery = ''): Promise<void> {
  await page.goto(`/?debug&timescale=100&nolevel&seed=${seed}${extraQuery}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 5);
  await beforeSecure?.();
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
    window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
    window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
    window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
    window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
    window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
    window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
    window.__GR_TEST__?.resetRun();
  });
  await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 12_000 });
}

function interceptPosts(page: Page): StandingPost[] {
  const posts: StandingPost[] = [];
  void page.route('https://gold-rush-3in.pages.dev/api/standings', async (route) => {
    if (route.request().method() === 'POST') posts.push(JSON.parse(route.request().postData() ?? '{}') as StandingPost);
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  return posts;
}

function expectNoErrors(errors: ErrorBucket): void {
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
}

test('endpoint stores optional self-declared stack and keeps the public board stack-blind', async () => {
  const kv = makeKv();
  await kv.put('standings:epoch-1-frontier:the-claim', JSON.stringify([
    {
      ...validPost('3'.repeat(32), 13).score,
      profileName: 'Before the Bench',
      anonId: '3'.repeat(32),
      seedHash: 'a'.repeat(64),
      inputLogHash: 'b'.repeat(64),
      submittedAt: 1,
    },
    {
      ...validPost('4'.repeat(32), 15).score,
      profileName: 'Unclassified Bench',
      anonId: '4'.repeat(32),
      seed: CLAIM_BENCH_SEED,
      seedMode: 'bench',
      seedHash: 'a'.repeat(64),
      inputLogHash: 'b'.repeat(64),
      submittedAt: 2,
    },
  ]));
  const stack = {
    model: 'gpt-5.6-sol',
    harness: 'codex',
    harnessVersion: '1.2.3',
    config: ' effort = medium ',
  };
  const firstPost: StandingPost = {
    ...validPost('1'.repeat(32), 12),
    difficulty: 'vein-hunter' as const,
    seed: CLAIM_BENCH_SEED,
    seedMode: 'bench' as const,
    stack,
  };
  firstPost.tape = validTape(firstPost.seed, firstPost.difficulty);
  firstPost.inputLogHash = createHash('sha256').update(JSON.stringify(firstPost.tape.inputLog)).digest('hex');
  const first = await standingsRoute({ request: apiRequest('POST', '', firstPost), env: { TELEMETRY: kv } });
  expect(first.status).toBe(200);
  const mismatchedHash = await standingsRoute({
    request: apiRequest('POST', '', { ...firstPost, inputLogHash: 'b'.repeat(64) }),
    env: { TELEMETRY: kv },
  });
  expect(mismatchedHash.status).toBe(400);
  const mismatchedOutcome = await standingsRoute({
    request: apiRequest('POST', '', {
      ...firstPost,
      tape: { ...firstPost.tape, outcome: { ...firstPost.tape.outcome, waves: 11 } },
    }),
    env: { TELEMETRY: kv },
  });
  expect(mismatchedOutcome.status).toBe(400);
  const oversized = await standingsRoute({
    request: apiRequest('POST', '', {
      ...firstPost,
      tape: { ...firstPost.tape, inputLog: { ...firstPost.tape.inputLog, name: 'x'.repeat(70_000) } },
    }),
    env: { TELEMETRY: kv },
  });
  expect(oversized.status).toBe(413);
  await standingsRoute({ request: apiRequest('POST', '', validPost('1'.repeat(32), 8)), env: { TELEMETRY: kv } });
  await standingsRoute({ request: apiRequest('POST', '', validPost('2'.repeat(32), 14)), env: { TELEMETRY: kv } });

  const stored = JSON.parse((await kv.get('standings:epoch-1-frontier:the-claim')) ?? '[]') as Array<Record<string, unknown>>;
  expect(stored.find((row) => row.anonId === '1'.repeat(32))).toMatchObject({
    seed: CLAIM_BENCH_SEED,
    seedMode: 'bench',
    difficulty: 'vein-hunter',
    stack: { ...stack, declaredBy: 'self' },
    tape: firstPost.tape,
  });
  expect(stored.find((row) => row.anonId === '2'.repeat(32))).not.toHaveProperty('stack');
  expect(stored.find((row) => row.anonId === '3'.repeat(32))).toMatchObject({ difficulty: 'trail', defaulted: true });
  expect(stored.find((row) => row.anonId === '3'.repeat(32))).not.toHaveProperty('seedMode');
  expect(stored.find((row) => row.anonId === '4'.repeat(32))).toBeUndefined();

  const response = await standingsRoute({
    request: apiRequest('GET', '?contract=the-claim&epoch=epoch-1-frontier'),
    env: { TELEMETRY: kv },
  });
  const body = (await response.json()) as { board: Array<Record<string, unknown>> };
  expect(response.status).toBe(200);
  expect(body.board).toMatchObject([
    { rank: 1, profileName: 'Robin', secured: true, waves: 14, timeAlive: 125.5, gold: 42, baseValue: 60, difficulty: 'trail' },
    { rank: 2, profileName: 'Before the Bench', secured: true, waves: 13, timeAlive: 125.5, gold: 42, baseValue: 60, difficulty: 'trail', defaulted: true },
    { rank: 3, profileName: 'Robin', secured: true, waves: 12, timeAlive: 125.5, gold: 42, baseValue: 60, difficulty: 'vein-hunter' },
  ]);
  for (const row of body.board) {
    expect(row).not.toHaveProperty('anonId');
    expect(row).not.toHaveProperty('seed');
    expect(row).not.toHaveProperty('seedMode');
    expect(row).not.toHaveProperty('seedHash');
    expect(row).not.toHaveProperty('inputLogHash');
    expect(row).not.toHaveProperty('stack');
    expect(row).not.toHaveProperty('tape');
    expect(row).not.toHaveProperty('model');
    expect(row).not.toHaveProperty('harness');
    expect(row).not.toHaveProperty('harnessVersion');
    expect(row).not.toHaveProperty('config');
    expect(row).not.toHaveProperty('declaredBy');
    expect(row).not.toHaveProperty('species');
    expect(row).not.toHaveProperty('agent');
  }

  const filteredResponse = await standingsRoute({
    request: apiRequest('GET', '?contract=the-claim&epoch=epoch-1-frontier&difficulty=vein-hunter'),
    env: { TELEMETRY: kv },
  });
  expect(await filteredResponse.json()).toMatchObject({
    board: [{ rank: 3, profileName: 'Robin', difficulty: 'vein-hunter' }],
  });
  const allResponse = await standingsRoute({
    request: apiRequest('GET', '?contract=the-claim&epoch=epoch-1-frontier&difficulty=all'),
    env: { TELEMETRY: kv },
  });
  expect(((await allResponse.json()) as { board: unknown[] }).board).toHaveLength(3);
  const invalidFilter = await standingsRoute({
    request: apiRequest('GET', '?contract=the-claim&epoch=epoch-1-frontier&difficulty=prospector'),
    env: { TELEMETRY: kv },
  });
  expect(invalidFilter.status).toBe(400);
  expect(await invalidFilter.json()).toMatchObject({ ok: false, error: 'bad_difficulty' });

  const invalidDifficulty = await standingsRoute({
    request: apiRequest('POST', '', { ...validPost('9'.repeat(32)), difficulty: 'prospector' }),
    env: { TELEMETRY: kv },
  });
  expect(invalidDifficulty.status).toBe(400);

  const legacyClientKv = makeKv();
  const { difficulty: _difficulty, ...legacyClientPost } = validPost('a'.repeat(32));
  const legacyClient = await standingsRoute({
    request: apiRequest('POST', '', legacyClientPost),
    env: { TELEMETRY: legacyClientKv },
  });
  expect(legacyClient.status).toBe(200);
  expect(JSON.parse((await legacyClientKv.get('standings:epoch-1-frontier:the-claim')) ?? '[]')).toContainEqual(
    expect.objectContaining({ difficulty: 'trail', defaulted: true }),
  );

  const withAgentField = await standingsRoute({
    request: apiRequest('POST', '', { ...validPost('3'.repeat(32)), agent: true }),
    env: { TELEMETRY: kv },
  });
  expect(withAgentField.status).toBe(400);
  const wrongPair = await standingsRoute({
    request: apiRequest('POST', '', { ...validPost('4'.repeat(32)), epochId: 'epoch-2-steamworks' }),
    env: { TELEMETRY: kv },
  });
  expect(wrongPair.status).toBe(400);

  for (const field of ['model', 'harness', 'harnessVersion', 'config'] as const) {
    const capped = await standingsRoute({
      request: apiRequest('POST', '', { ...validPost('6'.repeat(32)), stack: { [field]: 'x'.repeat(257) } }),
      env: { TELEMETRY: kv },
    });
    expect(capped.status).toBe(400);
  }

  let boardWrites = 0;
  const unreadableKv: MockKV = {
    get: async (key) => {
      if (key === 'standings:epoch-1-frontier:the-claim') throw new Error('read failed');
      return null;
    },
    put: async (key) => {
      if (key === 'standings:epoch-1-frontier:the-claim') boardWrites += 1;
    },
  };
  const unreadable = await standingsRoute({
    request: apiRequest('POST', '', validPost('5'.repeat(32))),
    env: { TELEMETRY: unreadableKv },
  });
  expect(unreadable.status).toBe(503);
  expect(boardWrites).toBe(0);

  const fullKv = makeKv();
  await fullKv.put(
    'standings:epoch-1-frontier:the-claim',
    JSON.stringify(
      Array.from({ length: 100 }, (_, index) => ({
        secured: true,
        waves: 200 - index,
        timeAlive: 200,
        gold: 100,
        baseValue: 100,
        profileName: `Prospector ${index + 1}`,
        anonId: index.toString(16).padStart(32, '0'),
        seed: 'gold-rush',
        seedMode: 'live',
        seedHash: 'a'.repeat(64),
        inputLogHash: 'b'.repeat(64),
        submittedAt: index,
      })),
    ),
  );
  const unranked = await standingsRoute({
    request: apiRequest('POST', '', validPost('f'.repeat(32), 1)),
    env: { TELEMETRY: fullKv },
  });
  expect(await unranked.json()).toMatchObject({ ok: true, stored: false, rank: null });
});

test('bench submissions require membership in the contract frozen seed set', async () => {
  const kv = makeKv();
  const member = await standingsRoute({
    request: apiRequest('POST', '', {
      ...validPost('7'.repeat(32)),
      seed: CLAIM_BENCH_SEED,
      seedMode: 'bench',
    }),
    env: { TELEMETRY: kv },
  });
  expect(member.status).toBe(200);
  expect(JSON.parse((await kv.get('standings:epoch-1-frontier:the-claim')) ?? '[]')).toContainEqual(
    expect.objectContaining({ seed: CLAIM_BENCH_SEED, seedMode: 'bench' }),
  );

  const { difficulty: _difficulty, ...missingDifficulty } = validPost('9'.repeat(32));
  const defaultedBench = await standingsRoute({
    request: apiRequest('POST', '', {
      ...missingDifficulty,
      seed: CLAIM_BENCH_SEED,
      seedMode: 'bench',
    }),
    env: { TELEMETRY: kv },
  });
  expect(defaultedBench.status).toBe(400);

  const nonMember = await standingsRoute({
    request: apiRequest('POST', '', {
      ...validPost('8'.repeat(32)),
      seed: WRONG_CONTRACT_BENCH_SEED,
      seedMode: 'bench',
    }),
    env: { TELEMETRY: kv },
  });
  expect(nonMember.status).toBe(400);
  expect(await nonMember.json()).toMatchObject({ ok: false, error: 'bad_bench_seed' });
});

test('secure submits the county row with pinned origin, hashes, and profile name', async ({ page }) => {
  await seedProfile(page);
  const posts = interceptPosts(page);
  const errors = collectErrors(page);
  const seed = CLAIM_BENCH_SEED;

  await secureClaim(page, seed, undefined, '&epoch=epoch-2-steamworks&contract=the-claim');
  await expect.poll(() => posts.length, { timeout: 8_000 }).toBe(1);

  const post = posts[0]!;
  expect(post).toMatchObject({
    contractId: 'the-claim',
    epochId: 'epoch-1-frontier',
    profileName: 'Robin',
    score: { secured: true, waves: 10 },
  });
  expect(post.score.timeAlive).toBeGreaterThan(0);
  expect(post.score.gold).toBeGreaterThanOrEqual(0);
  expect(post.score.baseValue).toBeGreaterThanOrEqual(0);
  expect(post.anonId).toMatch(/^[a-f0-9]{32}$/);
  expect(post.seed).toBe(seed);
  expect(post.seedMode).toBe('bench');
  expect(post.difficulty).toBe('trail');
  expect(post.seedHash).toBe(createHash('sha256').update(seed).digest('hex'));
  expect(post.inputLogHash).toMatch(/^[a-f0-9]{64}$/);
  expect(post.tape).toMatchObject({
    contract: 'the-claim',
    seed,
    difficulty: 'trail',
    simVersion: 1,
    outcome: { reason: 'secured', secured: true, waves: 10 },
  });
  expect(post.inputLogHash).toBe(createHash('sha256').update(JSON.stringify(post.tape!.inputLog)).digest('hex'));
  expect(JSON.stringify(post)).not.toContain('"species"');
  expect(JSON.stringify(post)).not.toContain('"agent"');

  await page.getByTestId('stay-for-rush').click();
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBeGreaterThan(10);
  await page.evaluate(() => {
    window.__GR_TEST__?.setBalance('enemy.contactDamage', 999);
    window.__GR_TEST__?.teleport(0, 11.9);
    window.__GR_TEST__?.spawnPack(1, 0.1, { speedScale: 0 });
  });
  await expect.poll(() => posts.length, { timeout: 8_000 }).toBe(2);
  expect(posts[1]!.score.waves).toBeGreaterThan(post.score.waves);
  expectNoErrors(errors);
});

test('secure skips county submission for a pinned seed outside the frozen set', async ({ page }, testInfo) => {
  await seedProfile(page);
  const posts = interceptPosts(page);
  const errors = collectErrors(page);
  await secureClaim(page, `lb03-nonmember-${testInfo.project.name}`);
  await page.waitForTimeout(500);
  expect(posts).toEqual([]);
  expectNoErrors(errors);
});

test('development standings require the explicit dev-send opt-in', async ({ page }) => {
  await seedProfile(page, true, false);
  const posts = interceptPosts(page);
  const errors = collectErrors(page);
  await secureClaim(page, CLAIM_BENCH_SEED);
  await page.waitForTimeout(500);
  expect(posts).toEqual([]);
  expectNoErrors(errors);
});

test('standings opt-out suppresses submission', async ({ page }) => {
  await seedProfile(page, false);
  const posts = interceptPosts(page);
  const errors = collectErrors(page);
  await secureClaim(page, CLAIM_BENCH_SEED);
  await page.waitForTimeout(500);
  expect(posts).toEqual([]);
  expectNoErrors(errors);
});

test('offline standings failure stays silent through the secure ceremony', async ({ page }) => {
  await seedProfile(page);
  const errors = collectErrors(page);
  await secureClaim(page, CLAIM_BENCH_SEED, () =>
    page.evaluate(() => {
      Object.defineProperty(Navigator.prototype, 'onLine', { configurable: true, get: () => false });
    }),
  );
  await page.waitForTimeout(500);
  await expect(page.getByTestId('claim-secured')).toBeVisible();
  expectNoErrors(errors);
});

test('Claim Ledger renders the seeded county board and its empty contract state', async ({ page }, testInfo) => {
  const now = Date.now();
  await seedProfile(page, true, true, [{
    waves: 10, kills: 22, gold: 120, timeAlive: 300, at: now - 120_000,
    baseValue: 180, secured: true, contractId: 'the-claim', profileName: 'Robin',
  }]);
  const errors = collectErrors(page);
  await page.route('https://gold-rush-3in.pages.dev/api/standings**', async (route) => {
    const url = new URL(route.request().url());
    const difficulty = url.searchParams.get('difficulty');
    if (difficulty === 'greenhorn') await new Promise((resolve) => setTimeout(resolve, 250));
    const board =
      url.searchParams.get('contract') === 'the-claim'
        ? [
            { rank: 1, profileName: 'Ada', secured: true, waves: 27, timeAlive: 754, gold: 318, baseValue: 240, difficulty: 'greenhorn', submittedAt: now - 60_000 },
            { rank: 2, profileName: 'Cedar Jack', secured: true, waves: 23, timeAlive: 621, gold: 251, baseValue: 180, difficulty: 'vein-hunter', submittedAt: now - 3_600_000 },
            { rank: 3, profileName: 'Robin', secured: true, waves: 19, timeAlive: 518, gold: 211, baseValue: 150, difficulty: 'trail', submittedAt: now - 86_400_000, defaulted: true },
          ].filter((row) => !difficulty || row.difficulty === difficulty)
        : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ ok: true, board }),
    });
  });

  await page.goto('/');
  await page.getByTestId('start-menu-claim-ledger').click();
  await page.getByTestId('claim-ledger-county-standings').click();
  await expect(page.getByTestId('county-standings-row-1')).toContainText('Ada');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('27');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('12:34');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('318');
  await expect(page.getByTestId('county-standings-row-1')).toContainText('1m ago');
  await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'When' })).toBeVisible();
  await expect(page.getByTestId('county-standings-local')).toContainText('Your Claims');
  await expect(page.getByTestId('county-standings-local')).toContainText('Only this profile');
  await expect(page.getByTestId('county-standings-local-the-claim')).toContainText('Secured · 180 works');
  await expect(page.getByTestId('county-standings-difficulty-1')).toHaveText('Greenhorn');
  await expect(page.getByTestId('county-standings-difficulty-2')).toHaveText('Vein-Hunter');
  await expect(page.getByTestId('county-standings-difficulty-3')).toHaveText('Trail');
  await expect(page.getByTestId('county-standings-contract-e1-baron')).toBeVisible();

  await mkdir(ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}.png`), fullPage: true });
  await mkdir(FD3_SHOTS, { recursive: true });
  await page.getByTestId('claim-ledger').screenshot({ path: path.join(FD3_SHOTS, `after-standings-${testInfo.project.name}.png`) });

  await page.getByTestId('county-standings-difficulty-filter').selectOption('greenhorn');
  await page.getByTestId('county-standings-difficulty-filter').selectOption('vein-hunter');
  await expect(page.getByTestId('county-standings-row-2')).toContainText('Cedar Jack');
  await page.waitForTimeout(300);
  await expect(page.getByTestId('county-standings-row-2')).toContainText('Cedar Jack');
  await expect(page.getByTestId('county-standings-row-1')).toHaveCount(0);
  await expect(page.getByTestId('county-standings-row-3')).toHaveCount(0);

  await page.getByTestId('county-standings-contract-e1-dry-gulch').click();
  await expect(page.getByTestId('county-standings-board')).toHaveText('No standings yet — the door is open.');
  await page.getByTestId('claim-ledger-field-book').click();
  await expect(page.getByTestId('field-book')).toBeVisible();
  expectNoErrors(errors);
});
