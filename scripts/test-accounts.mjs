import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { assertWranglerVersion } from './wrangler-binary.mjs';
import { createLedgerServer, loadLedgerHandlers } from '../server/ledger/serve.mjs';
import { SqliteStorage } from '../server/ledger/storage.mjs';
import { sweepExpiredLedgerRows } from '../ops/droplet/ledger-backup.mjs';
import { applyImport, planImport, TELEMETRY_MARKER } from './kv-to-ledger-migrate.mjs';
import { isMain } from './is-main.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/accounts-worker');
const STATE_ROOT = path.join(ROOT, 'test-results/accounts-worker-state');
const SQLITE_ROOT = path.join(STATE_ROOT, 'sqlite');
// These two mirror functions/api/_accounts.ts. They live up here beside the other module constants
// because main() runs at module top level, before any later `const` has left its temporal dead zone.
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_VERIFIES_PER_IP = 60;
const CODE_TTL_SECONDS = 10 * 60;
// kv-counters-to-ledger-1, up here for the same temporal-dead-zone reason. Fixture values, not
// credentials: they exist only inside this process and the ledgers it starts on 127.0.0.1.
const LEDGER_SECRET = 'kv-counters-to-ledger-fixture-secret-0000';
const OFFICE_SECRET = 'kv-counters-to-ledger-office-fixture';
// KV writes per beacon MEASURED on 90a26053c, the cut this task started from, by
// artifacts/kv-counters-to-ledger-1/measure-kv-writes.mjs (writes-before.json beside it).
const KV_WRITES_BEFORE = { legacyWorstCase: 15, freshNonceReplay: 13, renderDemotionReplay: 8 };
// The smallest valid JPEG the clerk accepts: SOI then EOI.
const TINY_JPEG = 'data:image/jpeg;base64,/9j/2Q==';
const checks = [];

if (isMain(import.meta.url)) {
  if (process.argv[2] === '--serve') await serve(process.argv[3]);
  else await main();
}

async function serve(value) {
  const port = Number(value);
  if (!/^\d+$/.test(value ?? '') || !Number.isSafeInteger(port) || port < 1 || port > 65_535) throw new Error('--serve requires a port from 1 to 65535');
  assertWranglerVersion('accounts browser fixture');
  const stateRoot = await mkdtemp(path.join(tmpdir(), 'gold-rush-accounts-browser-'));
  let finish;
  const stopped = new Promise((resolve) => { finish = resolve; });
  process.once('SIGINT', finish);
  process.once('SIGTERM', finish);
  let server;
  try {
    server = await startWrangler('browser', true, { port, stateRoot });
    console.log(`accounts browser fixture ready at ${server.url}`);
    await stopped;
  } finally {
    await server?.stop();
    process.removeListener('SIGINT', finish);
    process.removeListener('SIGTERM', finish);
    await rm(stateRoot, { recursive: true, force: true });
  }
}

async function main() {
  assertWranglerVersion('test:accounts');
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });
  await mkdir(SQLITE_ROOT, { recursive: true });

  try {
    for (const [backend, start] of [['kv', startWrangler], ['sqlite', startLedger]]) {
      const before = checks.length;
      await checkUnconfigured503(start);
      await checkDevFlow(start);
      console.log(`accounts ${backend} checks passed (${checks.length - before})`);
    }
    for (const [label, check] of [
      ['sign-in hardening', checkSignInHardening],
      ['office credential', checkBugOfficeCredential],
      ['ledger road', checkLedgerRoad],
      ['kv-to-ledger migration', checkKvToLedgerMigration],
    ]) {
      const before = checks.length;
      await check();
      console.log(`accounts ${label} checks passed (${checks.length - before})`);
    }
    await writeSummary('passed');
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  }
}

async function checkUnconfigured503(start) {
  const server = await start('unconfigured', false);
  try {
    const response = await post(server.url, '/api/request-code', { email: 'family@example.com' });
    assertEqual(response.status, 503, 'request-code returns 503 without DEV_AUTH or Resend');
  } finally {
    await server.stop();
  }
}

async function checkDevFlow(start) {
  const server = await start('dev', true);
  try {
    const badCors = await post(server.url, '/api/request-code', { email: 'cors@example.com' }, undefined, 'https://evil.example');
    assertEqual(badCors.status, 403, 'bad CORS origin rejected');

    const request = await post(server.url, '/api/request-code', { email: 'family@example.com' });
    assertEqual(request.status, 200, 'request-code returns a dev code');
    assert(/^\d{6}$/.test(request.body.code), 'dev code is six digits');

    const verify = await post(server.url, '/api/verify', { email: 'family@example.com', code: request.body.code });
    assertEqual(verify.status, 200, 'verify accepts the dev code');
    assert(/^[a-f0-9]{64}$/.test(verify.body.token), 'verify returns a 256-bit token');
    let token = verify.body.token;

    const session = await post(server.url, '/api/session', {}, token);
    assertEqual(session.status, 200, 'session validates token');

    const revokeRequest = await post(server.url, '/api/request-code', {
      email: 'family@example.com',
      revokeSessions: true,
    });
    assertEqual(revokeRequest.status, 200, 'revoke request-code returns a dev code');
    assertEqual((await post(server.url, '/api/session', {}, token)).status, 200, 'revoke request does not revoke before verify');
    const revokeVerify = await post(server.url, '/api/verify', {
      email: 'family@example.com',
      code: revokeRequest.body.code,
    });
    assertEqual(revokeVerify.status, 200, 'revoke verify succeeds');
    assertEqual((await post(server.url, '/api/session', {}, token)).status, 401, 'revoke verify revokes old sessions');
    token = revokeVerify.body.token;
    assertEqual((await post(server.url, '/api/session', {}, token)).status, 200, 'new session survives revoke');

    const firstSave = await pushSave(server.url, token, ledgerEnvelope(6));
    assertEqual(firstSave.status, 200, 'first save pushes');
    let baseSavedAt = firstSave.body.savedAt;
    const secondSave = await pushSave(server.url, token, ledgerEnvelope(7), baseSavedAt);
    assertEqual(secondSave.status, 200, 'second save pushes');
    baseSavedAt = secondSave.body.savedAt;

    const current = await post(server.url, '/api/save/pull', { profileId: 'robin' }, token);
    assertEqual(current.status, 200, 'current save pulls');
    assertEqual(current.body.envelope.data['gr.meta.v1'].science, 7, 'current save is latest envelope');

    const prior = await post(server.url, '/api/save/pull', { profileId: 'robin', version: 1 }, token);
    assertEqual(prior.status, 200, 'prior save version pulls');
    assertEqual(prior.body.envelope.data['gr.meta.v1'].science, 6, 'version 1 is previous envelope');

    const versions = await post(server.url, '/api/save/versions', { profileId: 'robin' }, token);
    assertEqual(versions.status, 200, 'save versions list');
    assert(versions.body.versions.some((entry) => entry.version === 1), 'versions include v1');
    const profiles = await post(server.url, '/api/save/profiles', {}, token);
    assertEqual(profiles.status, 200, 'save profile index lists');
    assert(profiles.body.profiles.some((entry) => entry.profileId === 'robin' && entry.profileName === 'Robin'), 'profile index includes Robin');

    for (let science = 8; science <= 13; science += 1) {
      await sleep(2);
      const pushed = await pushSave(server.url, token, ledgerEnvelope(science), baseSavedAt);
      assertEqual(pushed.status, 200, `version-order push ${science} succeeds`);
      baseSavedAt = pushed.body.savedAt;
    }
    const ordered = await post(server.url, '/api/save/versions', { profileId: 'robin' }, token);
    assertEqual(ordered.status, 200, 'version-order versions list');
    assertEqual(ordered.body.versions.length, 6, 'version-order keeps current plus five versions');
    assertEqual(ordered.body.versions[0].version, null, 'version-order current marker');
    assertEqual(ordered.body.versions[0].savedAt >= ordered.body.versions[1].savedAt, true, 'version-order newest first');
    const orderedSciences = ordered.body.versions.map((entry) => entry.updatedAt).filter((value) => typeof value === 'number');
    assertEqual(orderedSciences.join(','), '13,12,11,10,9,8', 'version-order preserves newest-to-oldest saves');

    const stale = await pushSave(server.url, token, ledgerEnvelope(20), '1900-01-01T00:00:00.000Z');
    assertEqual(stale.status, 200, 'stale-save response returns conflict payload');
    assertEqual(stale.body.error, 'stale_save', 'stale-save conflict still fires under immutable store');
    assertEqual(stale.body.savedAt, baseSavedAt, 'stale-save compares against derived current save');
    const acknowledged = await post(
      server.url,
      '/api/save/push',
      { profileId: 'robin', envelope: ledgerEnvelope(20), baseSavedAt: '1900-01-01T00:00:00.000Z', acknowledgeConflict: true },
      token,
    );
    assertEqual(acknowledged.status, 200, 'acknowledged stale-save push succeeds');
    baseSavedAt = acknowledged.body.savedAt;

    const badEnvelope = await post(server.url, '/api/save/push', { profileId: 'robin', envelope: { version: 1 } }, token);
    assertEqual(badEnvelope.status, 400, 'bad envelope rejected');

    const oversize = await post(
      server.url,
      '/api/save/push',
      { profileId: 'robin', envelope: ledgerEnvelope(8, 'x'.repeat(205 * 1024)) },
      token,
    );
    assertEqual(oversize.status, 413, 'oversize envelope rejected');

    await checkRequestRateLimit(server.url);
    await checkAttemptLimit(server.url);

    const deleted = await post(server.url, '/api/delete-account', {}, token);
    assertEqual(deleted.status, 200, 'delete-account succeeds');
    assertEqual((await post(server.url, '/api/session', {}, token)).status, 401, 'deleted session is revoked');
  } finally {
    await server.stop();
  }
}

async function checkRequestRateLimit(baseUrl) {
  let last;
  for (let index = 0; index < 6; index += 1) {
    last = await post(baseUrl, '/api/request-code', { email: 'rate@example.com' });
  }
  assertEqual(last.status, 429, 'per-email request rate limit trips');
}

async function checkAttemptLimit(baseUrl) {
  await post(baseUrl, '/api/request-code', { email: 'attempts@example.com' });
  let last;
  for (let index = 0; index < 5; index += 1) {
    last = await post(baseUrl, '/api/verify', { email: 'attempts@example.com', code: '000000' });
  }
  assertEqual(last.status, 429, 'verify attempt limit trips');
}

// --- sign-in hardening: SEC-1 and SEC-10 of the outside review of 2026-09-24 -------------------
// These call the handlers DIRECTLY over an in-memory store instead of through an HTTP fixture, for
// three reasons. The guess flood has to interleave inside one isolate to reproduce the defect at all
// (that is what the defect WAS: two awaits inside a read-then-write window). Every case needs its own
// CF-Connecting-IP so the new per-address cap cannot leak between them. And the isDev case has to
// stand up a mail sender binding without any request reaching api.resend.com, so globalThis.fetch is
// stubbed for exactly that one call and restored immediately.
async function checkSignInHardening() {
  const handlers = await loadLedgerHandlers();
  const storage = new SqliteStorage(':memory:');
  const env = { ACCOUNTS: storage, TELEMETRY: storage, DEV_AUTH: '1' };
  try {
    await checkStoreCountsAtomically();
    await checkParallelGuessBudget(handlers, storage, env);
    await checkGuessBudgetSurvivesANewCode(handlers, env);
    await checkVerifyPerAddressCap(handlers, env);
    await checkDevCodesNeedAnUnboundSender(handlers, env);
  } finally {
    storage.close();
  }
}

// The mechanism itself, one level below the door. A counter that loses updates cannot bound a guess
// budget no matter how the caller is written, and a mutant that drops verifyCode back to
// read-then-write is only caught by asserting BOTH this property and that the door uses it (below).
async function checkStoreCountsAtomically() {
  const storage = new SqliteStorage(':memory:');
  try {
    const key = 'attempts:atomic-store';
    const counts = await Promise.all(Array.from({ length: 50 }, () => storage.increment(key, CODE_TTL_SECONDS)));
    assertEqual(new Set(counts).size, counts.length, 'the store hands every concurrent caller its own count');
    assertEqual(Math.max(...counts), counts.length, 'no concurrent count is lost to a last-writer-wins race');
    assertEqual(await storage.get(key), String(counts.length), 'the stored count equals the number of calls');
    let rejected = null;
    await storage.increment(key, 0).catch((cause) => { rejected = cause; });
    assert(rejected instanceof Error, 'the store refuses a counter with no window');
  } finally {
    storage.close();
  }
}

async function checkParallelGuessBudget(handlers, storage, env) {
  const ip = '198.51.100.11';
  const email = 'flood@example.com';
  const guesses = 50;
  const issued = await callAccounts(handlers, '/api/request-code', { email }, env, ip);
  assertEqual(issued.status, 200, 'parallel-guess fixture receives a dev code');
  const wrong = issued.body.code === '000000' ? '111111' : '000000';

  // Counting reads of the code record counts the guesses that reached the digest compare, which is
  // the number the review measured (109 of 200 evaluated against a budget of 5). Measured on this
  // tree BEFORE the fix: 50 of 50 evaluated, the stored counter left at 1, and the real code still
  // accepted afterwards. AFTER: 5 evaluated, the counter at 50, the real code refused.
  const emailHash = createHash('sha256').update(email).digest('hex');
  const codeKey = `code:${emailHash}`;
  const read = storage.get.bind(storage);
  const bump = storage.increment.bind(storage);
  let evaluated = 0;
  let counted = 0;
  storage.get = async (key) => {
    if (key === codeKey) evaluated += 1;
    return read(key);
  };
  storage.increment = async (key, ttlSeconds) => {
    if (key === `attempts:${emailHash}`) counted += 1;
    return bump(key, ttlSeconds);
  };
  let results;
  try {
    results = await Promise.all(Array.from({ length: guesses }, () => callAccounts(handlers, '/api/verify', { email, code: wrong }, env, ip)));
  } finally {
    storage.get = read;
    storage.increment = bump;
  }

  assert(evaluated <= MAX_VERIFY_ATTEMPTS, `parallel guesses evaluated: expected at most ${MAX_VERIFY_ATTEMPTS}, got ${evaluated} of ${guesses}`);
  // A door that counts with its own read-then-write would pass the line above on a fast machine and
  // still lose the race under real concurrency, so the door must be seen USING the atomic counter.
  assertEqual(counted, guesses, 'every guess in the flood is charged through the store atomic counter');
  assertEqual(results.filter(({ status }) => status === 401).length, MAX_VERIFY_ATTEMPTS - 1, 'parallel guesses: every evaluated guess but the budget-closing one answers 401');
  assertEqual(
    results.filter(({ body }) => body.error === 'too_many_attempts').length,
    guesses - (MAX_VERIFY_ATTEMPTS - 1),
    'parallel guesses: every guess past the budget is refused on its own count',
  );
  const spent = await callAccounts(handlers, '/api/verify', { email, code: issued.body.code }, env, ip);
  assertEqual(spent.body.error, 'too_many_attempts', 'a budget spent by a flood refuses even the real code');
}

async function checkGuessBudgetSurvivesANewCode(handlers, env) {
  const ip = '198.51.100.12';
  const email = 'budget@example.com';
  const first = await callAccounts(handlers, '/api/request-code', { email }, env, ip);
  assertEqual(first.status, 200, 'guess-budget fixture receives a dev code');
  const wrong = first.body.code === '000000' ? '111111' : '000000';
  for (let guess = 1; guess <= 3; guess += 1) {
    assertEqual((await callAccounts(handlers, '/api/verify', { email, code: wrong }, env, ip)).status, 401, `guess ${guess} is evaluated and refused`);
  }
  const second = await callAccounts(handlers, '/api/request-code', { email }, env, ip);
  assertEqual(second.status, 200, 'a second code is issued while the budget is part spent');
  assertEqual((await callAccounts(handlers, '/api/verify', { email, code: wrong }, env, ip)).status, 401, 'guess 4 of the budget survives the new code');
  assertEqual(
    (await callAccounts(handlers, '/api/verify', { email, code: wrong }, env, ip)).body.error,
    'too_many_attempts',
    'guess 5 closes a budget the new code did not reset',
  );
  assertEqual(
    (await callAccounts(handlers, '/api/verify', { email, code: second.body.code }, env, ip)).body.error,
    'too_many_attempts',
    'a fresh code cannot be spent on an exhausted budget',
  );
}

async function checkVerifyPerAddressCap(handlers, env) {
  const ip = '198.51.100.13';
  const email = 'cap@example.com';
  let last;
  for (let attempt = 1; attempt <= MAX_VERIFIES_PER_IP; attempt += 1) {
    last = await callAccounts(handlers, '/api/verify', { email, code: '000000' }, env, ip);
  }
  assertEqual(last.body.error, 'too_many_attempts', 'the per-address cap does not fire before its own number');
  const over = await callAccounts(handlers, '/api/verify', { email, code: '000000' }, env, ip);
  assertEqual(over.status, 429, 'the verify door caps one address by the hour');
  assertEqual(over.body.error, 'rate_limited', 'past the per-address number the refusal is a rate limit, not an attempt limit');
}

async function checkDevCodesNeedAnUnboundSender(handlers, env) {
  const ip = '198.51.100.14';
  const dev = await callAccounts(handlers, '/api/request-code', { email: 'devcode@example.com' }, env, ip);
  assertEqual(dev.status, 200, 'a dev box with no mail sender bound still returns the code');
  assert(/^\d{6}$/.test(dev.body.code ?? ''), 'the dev code is six digits');

  const realFetch = globalThis.fetch;
  let mailed = 0;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.startsWith('https://api.resend.com/')) {
      mailed += 1;
      return new Response('{"id":"stub"}', { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return realFetch(input, init);
  };
  let misset;
  try {
    misset = await callAccounts(handlers, '/api/request-code', { email: 'misset@example.com' }, { ...env, RESEND_API_KEY: 'stub-sender-binding' }, ip);
  } finally {
    globalThis.fetch = realFetch;
  }
  assertEqual(misset.status, 200, 'DEV_AUTH mis-set beside a bound sender still sends the mail');
  assertEqual(mailed, 1, 'the mis-set case takes the mail path, not the dev path');
  assertEqual(misset.body.code, undefined, 'DEV_AUTH alone never returns a login code once the sender is bound');
  assertEqual(misset.body.dev, undefined, 'the dev marker is absent once the sender is bound');
}

async function callAccounts(handlers, route, body, env, ip) {
  const response = await handlers[route]({
    env,
    request: new Request(`http://localhost${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'CF-Connecting-IP': ip },
      body: JSON.stringify(body),
    }),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

// --- the office credential: SEC-9 of the same review -------------------------------------------
async function checkBugOfficeCredential() {
  const vite = await createViteServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  let bugs;
  let redeem;
  let compare;
  try {
    bugs = await vite.ssrLoadModule('/functions/api/_bugs.ts');
    redeem = await vite.ssrLoadModule('/functions/api/redeem.ts');
    compare = await vite.ssrLoadModule('/functions/api/_compare.ts');
  } finally {
    await vite.close();
  }

  // A fixture value, not a credential: the office secret only ever exists in this process.
  const secret = 'test-office-token';
  const storage = new SqliteStorage(':memory:');
  const warnings = [];
  const realWarn = console.warn;
  console.warn = (...args) => warnings.push(args.map(String).join(' '));
  try {
    const list = async ({ query, bearer } = {}) => {
      const url = new URL('http://localhost/api/bugs');
      if (query !== undefined) url.searchParams.set('token', query);
      const response = await bugs.listBugs({
        env: { TELEMETRY: storage, ACCOUNTS: storage, BUG_OFFICE_TOKEN: secret },
        request: new Request(url, { method: 'GET', headers: bearer === undefined ? {} : { authorization: `Bearer ${bearer}` } }),
      });
      return { status: response.status, body: await response.json().catch(() => ({})) };
    };
    assertEqual((await list()).status, 404, 'the office declines a caller with no credential');
    assertEqual((await list({ bearer: secret })).status, 200, 'the office reads for a bearer token');
    assertEqual((await list({ bearer: `${secret}x` })).status, 404, 'the office declines a wrong bearer token');
    assertEqual(warnings.length, 0, 'the bearer path logs no deprecation');
    assertEqual((await list({ query: secret })).status, 200, 'a query token still reads for one release');
    assertEqual(warnings.filter((line) => line.includes('deprecated ?token=')).length, 1, 'the query credential is logged as deprecated');
    assertEqual((await list({ query: `${secret}x` })).status, 404, 'the office declines a wrong query token');

    const mint = async (bearer) => {
      const response = await redeem.onRequest({
        env: { TELEMETRY: storage, BUG_OFFICE_TOKEN: secret },
        request: new Request('http://localhost/api/redeem', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...(bearer === undefined ? {} : { authorization: `Bearer ${bearer}` }) },
          body: JSON.stringify({ codes: ['GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD'] }),
        }),
      });
      return { status: response.status, body: await response.json().catch(() => ({})) };
    };
    assertEqual((await mint()).status, 404, 'the mint declines a caller with no bearer token');
    assertEqual((await mint(`${secret}x`)).status, 404, 'the mint declines a wrong bearer token');
    assertEqual((await mint(secret)).status, 201, 'the mint accepts the office bearer token');
  } finally {
    console.warn = realWarn;
    storage.close();
  }

  assertEqual(compare.constantTimeEqual('same-secret', 'same-secret'), true, 'constant-time compare accepts an exact match');
  assertEqual(compare.constantTimeEqual('same-secret', 'xame-secret'), false, 'constant-time compare refuses a first-byte difference');
  assertEqual(compare.constantTimeEqual('same-secret', 'same-secreu'), false, 'constant-time compare refuses a last-byte difference');
  assertEqual(compare.constantTimeEqual('same-secret', 'same-secret-longer'), false, 'constant-time compare refuses a prefix of itself');
  assertEqual(compare.constantTimeEqual('', ''), true, 'constant-time compare accepts two empty strings');
  assertEqual(compare.constantTimeEqual('same-secret', ''), false, 'constant-time compare refuses an empty guess');

  // Structural, because timing measurement in a gate is a flake generator: the doors that compare an
  // operator secret must route through the shared helper and never through === or !==.
  for (const file of ['functions/api/_accounts.ts', 'functions/api/_bugs.ts', 'functions/api/redeem.ts', 'functions/api/standings.ts', 'functions/api/_ledger.ts']) {
    const source = await readFile(path.join(ROOT, file), 'utf8');
    assert(/from '\.\/_compare'/.test(source), `${file} imports the shared constant-time compare`);
    assert(
      !/[!=]==\s*(?:context\.)?env\.[A-Z_]*(?:TOKEN|SECRET)\b/.test(source),
      `${file} never compares an operator secret with === or !==`,
    );
  }
}

// --- kv-counters-to-ledger-1: the ledger road ------------------------------------------------------
// The Pages doors are called DIRECTLY (as the Pages runtime would, one request object at a time) and
// reach a REAL ledger over HTTP on 127.0.0.1: createLedgerServer, the same routes serve.mjs registers,
// an in-memory SqliteStorage behind them. The KV binding they are handed COUNTS every put and delete,
// because a KV write is what the free tier meters and what this task exists to stop spending.
async function checkLedgerRoad() {
  const doors = await loadDoors(['_ledger', '_ratelimit', 'telemetry', '_bugs', 'redeem']);
  const storage = new SqliteStorage(':memory:');
  const server = await createLedgerServer({ storage, env: { LEDGER_PROXY_SECRET: LEDGER_SECRET } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const ledgerUrl = `http://127.0.0.1:${server.address().port}`;
  const bound = { LEDGER_ORIGIN: ledgerUrl, LEDGER_PROXY_SECRET: LEDGER_SECRET, BUG_OFFICE_TOKEN: OFFICE_SECRET };
  try {
    await checkLedgerGate(doors, ledgerUrl);
    await checkAtomicLimiter(doors);
    await checkTelemetryWritesPerBeacon(doors, bound, storage, ledgerUrl);
    await checkBugOfficeThroughLedger(doors, bound, storage, ledgerUrl);
    await checkPrizeDeskThroughLedger(doors, bound, storage);
    await checkUnreachableLedger(doors);
    await checkNightlySweep();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.close();
  }
}

async function checkLedgerGate(doors, ledgerUrl) {
  const key = `mp:ratelimit:connect:${'a'.repeat(32)}`;
  const auth = { authorization: `Bearer ${LEDGER_SECRET}` };
  const call = (headers, body = { key, ttlSeconds: 60 }, method = 'POST') => fetch(`${ledgerUrl}/api/ledger/increment`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
  assertEqual((await call({})).status, 404, 'a ledger route is dark to a caller with no secret');
  assertEqual((await call({ authorization: `Bearer ${LEDGER_SECRET}x` })).status, 404, 'a ledger route is dark to a wrong secret');
  assertEqual((await call(auth, undefined, 'GET')).status, 405, 'the counter route is POST only');
  assertEqual((await call(auth, { key: 'session:abc', ttlSeconds: 60 })).status, 400, 'the counter route refuses any key outside the three co-op buckets');
  assertEqual((await call(auth, { key, ttlSeconds: 0 })).status, 400, 'the counter route refuses a counter with no window');
  assertEqual((await (await call(auth)).json()).count, 1, 'the counter route counts');
  assertEqual((await (await call(auth)).json()).count, 2, 'the counter route hands back the count it produced');
  const ledger = doors._ledger;
  assertEqual(ledger.ledgerAdmits(new Request('http://localhost/', { headers: { authorization: 'Bearer short' } }), { LEDGER_PROXY_SECRET: 'short' }), false, 'a short secret leaves the ledger routes dark');
  assertEqual(ledger.ledgerLink({ LEDGER_PROXY_SECRET: 'short' }), null, 'a short secret is never sent');
  assertEqual(ledger.ledgerLink({ LEDGER_PROXY_SECRET: LEDGER_SECRET, LEDGER_ORIGIN: 'http://agenttown.app' }), null, 'the secret never rides plain http off the loopback');
  assertEqual(ledger.ledgerLink({ LEDGER_PROXY_SECRET: LEDGER_SECRET }) !== null, true, 'bound with no origin, the road leads to the public door');
  assertEqual(ledger.ledgerLink({}), null, 'unbound, there is no road and every door keeps its KV path');
}

// The shared window counter on a store that can count atomically, against a KV-shaped control.
async function checkAtomicLimiter(doors) {
  const { bumpCounter } = doors._ratelimit;
  const storage = new SqliteStorage(':memory:');
  try {
    const verdicts = await Promise.all(Array.from({ length: 50 }, () => bumpCounter(storage, 'telemetry:ratelimit:flood', 30, 3600)));
    assertEqual(verdicts.filter(Boolean).length, 30, 'fifty parallel requests against a limit of 30: exactly 30 pass on the ledger');
    assertEqual(await storage.get('telemetry:ratelimit:flood'), '50', 'every request in the flood was counted by the one statement');
  } finally {
    storage.close();
  }
  // CONTROL: the same flood on a store with no atomic count, whose read and write are an I/O hop apart
  // as Cloudflare KV's are. Read-then-write lets it through, which is the race the ledger closes.
  const values = new Map();
  const hopKv = {
    async get(key) { await sleep(1); return values.get(key) ?? null; },
    async put(key, value) { await sleep(1); values.set(key, value); },
  };
  const raced = await Promise.all(Array.from({ length: 50 }, () => bumpCounter(hopKv, 'k', 30, 3600)));
  assert(raced.filter(Boolean).length > 30, `CONTROL: read-then-write lets a parallel flood past its limit (${raced.filter(Boolean).length} of 50 passed a limit of 30)`);
}

async function checkTelemetryWritesPerBeacon(doors, bound, storage, ledgerUrl) {
  const door = doors.telemetry.onRequest;
  const limit = await sourceConstant('functions/api/telemetry.ts', 'MAX_REQUESTS_PER_IP');
  const shapes = [
    ['a run that ended unsecured', beacon({})],
    ['a secure beacon', beacon({ stage: 'secure', waves: 8, secureWave: 8, deepestWave: 8, duration: 200_000 })],
    ['a legacy client, secured, on a deepest-wave record', beacon({ stage: undefined, secureWave: 9, deepestWave: 40, waves: 40, duration: 900_000 })],
    ['a render demotion', demotion()],
  ];
  let host = 10;
  for (const [label, body] of shapes) {
    const kv = countingKv();
    const answer = await callDoor(door, '/api/telemetry', body, { TELEMETRY: kv, ...bound }, `198.51.100.${host++}`);
    assertEqual(answer.status, 200, `${label}: accepted through the ledger`);
    assertEqual(answer.body.stored, true, `${label}: stored`);
    assertEqual(answer.fallback, null, `${label}: served by the ledger, so no fallback header`);
    assert(kv.writes.length <= 1, `${label}: at most one KV write per beacon (up to ${KV_WRITES_BEFORE.legacyWorstCase} before), got ${kv.writes.length}`);
    assertEqual(kv.writes.length, 0, `${label}: in fact no KV write at all`);
  }
  assertEqual(await storage.get('telemetry:runs:total'), '3', 'the run aggregates are counted in the ledger');
  assertEqual(await storage.get('telemetry:render-demotion:total'), '1', 'the render-demotion aggregates are counted in the ledger');
  const stats = await (await fetch(`${ledgerUrl}/api/stats`, { headers: { Origin: 'https://agenttown.app' } })).json();
  assertEqual(stats.stats.runs.allTime, 3, 'the unchanged stats door answers from the ledger');

  // The nonce is out of the digest: the same run under a fresh nonce is a duplicate.
  const replayKv = countingKv();
  const replay = await callDoor(door, '/api/telemetry', beacon({ nonce: 'b'.repeat(32) }), { TELEMETRY: replayKv, ...bound }, '198.51.100.10');
  assertEqual(replay.body.duplicate, true, 'through the ledger, a replay under a fresh nonce is a duplicate');
  assertEqual(replayKv.writes.length, 0, 'and it costs KV nothing');

  // The per-address limit holds in the ledger, and KV still pays nothing.
  const limitedKv = countingKv();
  let refused = null;
  for (let run = 1; run <= limit + 1; run += 1) {
    const answer = await callDoor(door, '/api/telemetry', beacon({ duration: 100_000 + run }), { TELEMETRY: limitedKv, ...bound }, '198.51.100.30');
    if (answer.status === 429) {
      refused = { run, answer };
      break;
    }
  }
  assertEqual(refused?.run, limit + 1, `the ledger refuses beacon ${limit + 1} from one address inside the hour`);
  assertEqual(refused?.answer.body.error, 'rate_limited', 'the refusal is the rate limit');
  assertEqual(limitedKv.writes.length, 0, 'a whole hour of one address costs KV nothing through the ledger');

  // UNBOUND (every fixture; production until the ops evening): the KV path, minus what scope 1 cut.
  const kv = countingKv();
  const env = { TELEMETRY: kv };
  const first = await callDoor(door, '/api/telemetry', beacon({}), env, '198.51.100.40');
  assertEqual(first.fallback, 'unconfigured', 'unbound, the door says the ledger did not serve it');
  let mark = kv.writes.length;
  const flood = await callDoor(door, '/api/telemetry', beacon({ nonce: 'c'.repeat(32) }), env, '198.51.100.40');
  assertEqual(flood.body.duplicate, true, 'unbound, a replay under a fresh nonce is a duplicate too');
  assertEqual(kv.writes.length - mark, 1, `unbound, that replay costs 1 KV write, the limiter (${KV_WRITES_BEFORE.freshNonceReplay} before)`);
  mark = kv.writes.length;
  await callDoor(door, '/api/telemetry', beacon({ duration: 401_000 }), env, '198.51.100.40');
  assert(!kv.writes.slice(mark).includes('telemetry:updatedAt'), 'telemetry:updatedAt is not rewritten inside the minute');
  const renderKv = countingKv();
  await callDoor(door, '/api/telemetry', demotion(), { TELEMETRY: renderKv }, '198.51.100.41');
  const latest = renderKv.puts.find(({ key }) => key.startsWith('telemetry:render-demotion:latest:'));
  assertEqual(latest?.ttl, await sourceConstant('functions/api/telemetry.ts', 'DEDUP_TTL_SECONDS'), 'the render-demotion record carries the dedup TTL');
  mark = renderKv.writes.length;
  const renderReplay = await callDoor(door, '/api/telemetry', demotion(), { TELEMETRY: renderKv }, '198.51.100.41');
  assertEqual(renderReplay.body.duplicate, true, 'a replayed render demotion is a duplicate');
  assertEqual(renderKv.writes.length - mark, 1, `a replayed render demotion costs 1 KV write, the limiter (${KV_WRITES_BEFORE.renderDemotionReplay} before)`);
}

async function checkBugOfficeThroughLedger(doors, bound, storage, ledgerUrl) {
  const { postBug, listBugs, getBug } = doors._bugs;
  const limit = await sourceConstant('functions/api/_bugs.ts', 'MAX_REPORTS_PER_IP');
  const ttl = await sourceConstant('functions/api/_bugs.ts', 'REPORT_TTL_SECONDS');
  const kv = countingKv();
  const env = { TELEMETRY: kv, ...bound };
  const office = { authorization: `Bearer ${OFFICE_SECRET}` };
  const filed = await callDoor(postBug, '/api/bug-report', bugReport(), env, '198.51.100.50');
  assertEqual(filed.status, 201, 'a bug report is filed through the ledger');
  assertEqual(filed.fallback, null, 'the ledger served it');
  const row = storage.db.prepare('SELECT expires_at AS expiresAt, updated_at AS updatedAt FROM kv WHERE key = ?').get(`bug:${filed.body.id}`);
  assert(row, 'the report is a ledger row under the key KV used');
  assert(Math.abs(row.expiresAt - row.updatedAt - ttl * 1000) < 5_000, 'its 90-day expiry is the row expires_at column');
  const listed = await callDoor(listBugs, '/api/bugs?limit=10', undefined, env, '198.51.100.51', { method: 'GET', headers: office });
  assertEqual(listed.status, 200, 'the office lists through the ledger');
  assert(listed.body.bugs.some((bug) => bug.id === filed.body.id && bug.screenshot === undefined), 'the list is summaries without the photograph');
  const read = await callDoor(getBug, `/api/bugs/${filed.body.id}`, undefined, env, '198.51.100.51', { method: 'GET', headers: office, params: { id: filed.body.id } });
  assertEqual(read.body.bug?.screenshot, TINY_JPEG, 'the office reads one report in full through the ledger');
  const missing = await callDoor(getBug, '/api/bugs/1790000000000-00000000', undefined, env, '198.51.100.51', { method: 'GET', headers: office, params: { id: '1790000000000-00000000' } });
  assertEqual(missing.status, 404, 'an unknown report is the office declining, as before');
  assertEqual((await callDoor(listBugs, '/api/bugs', undefined, env, '198.51.100.51', { method: 'GET' })).status, 404, 'the office token is still checked at the edge');
  assertEqual((await callDoor(postBug, '/api/bug-report', { ...bugReport(), email: 'x@example.com' }, env, '198.51.100.52')).status, 400, 'the edge refuses a field outside the allowlist before the ledger sees it');
  const direct = await fetch(`${ledgerUrl}/api/ledger/bugs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${LEDGER_SECRET}` },
    body: JSON.stringify({ client: 'a'.repeat(32), report: { ...bugReport(), email: 'x@example.com' } }),
  });
  assertEqual(direct.status, 400, 'the ledger re-validates what arrives with the secret');
  for (let report = 2; report <= limit; report += 1) {
    assertEqual((await callDoor(postBug, '/api/bug-report', bugReport(), env, '198.51.100.50')).status, 201, `report ${report} of ${limit} from one address is filed`);
  }
  const over = await callDoor(postBug, '/api/bug-report', bugReport(), env, '198.51.100.50');
  assertEqual(over.status, 429, 'the per-address limit holds in the ledger');
  assertEqual(kv.writes.length, 0, 'the whole office visit cost KV nothing');
}

async function checkPrizeDeskThroughLedger(doors, bound, storage) {
  const door = doors.redeem.onRequest;
  const limit = await sourceConstant('functions/api/redeem.ts', 'MAX_REDEEMS_PER_IP');
  const kv = countingKv();
  const env = { TELEMETRY: kv, ...bound };
  const codes = ['GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD', 'GR-111111-222222-333333-444444'];
  assertEqual((await callDoor(door, '/api/redeem', { codes }, env, '198.51.100.60')).status, 404, 'the mint still needs the office bearer at the edge');
  const minted = await callDoor(door, '/api/redeem', { codes }, env, '198.51.100.60', { headers: { authorization: `Bearer ${OFFICE_SECRET}` } });
  assertEqual(minted.status, 201, 'the mint lands in the ledger');
  assertEqual(minted.body.minted, 2, 'both codes are minted');
  const redeemed = await callDoor(door, '/api/redeem', { code: codes[0].toLowerCase() }, env, '198.51.100.61');
  assertEqual(redeemed.body.skin, 'gilded', 'a minted code redeems through the ledger');
  assertEqual(redeemed.fallback, null, 'the ledger decided it');
  assert((await storage.get(`prize:${codes[0]}`))?.startsWith('redeemed:'), 'the first redemption is stamped in the ledger');
  assertEqual((await callDoor(door, '/api/redeem', { code: codes[0] }, env, '198.51.100.61')).body.skin, 'gilded', 'a stamped code still answers with its skin, as before');
  assertEqual((await callDoor(door, '/api/redeem', { code: 'GR-999999-999999-999999-999999' }, env, '198.51.100.61')).body.error, 'bad_stub', 'an unknown code is no county prize');
  for (let attempt = 1; attempt <= limit; attempt += 1) await callDoor(door, '/api/redeem', { code: codes[1] }, env, '198.51.100.62');
  assertEqual((await callDoor(door, '/api/redeem', { code: codes[1] }, env, '198.51.100.62')).status, 429, 'the per-address redeem limit holds in the ledger');
  assertEqual(kv.writes.length, 0, 'the prize desk cost KV nothing');
}

async function checkUnreachableLedger(doors) {
  const kv = countingKv();
  const env = { TELEMETRY: kv, LEDGER_ORIGIN: 'http://127.0.0.1:9', LEDGER_PROXY_SECRET: LEDGER_SECRET, BUG_OFFICE_TOKEN: OFFICE_SECRET };
  const beaconAnswer = await callDoor(doors.telemetry.onRequest, '/api/telemetry', beacon({}), env, '198.51.100.70');
  assertEqual(beaconAnswer.body.stored, false, 'a bound ledger that does not answer drops the beacon');
  assertEqual(beaconAnswer.fallback, 'unreachable', 'and says why');
  const bugAnswer = await callDoor(doors._bugs.postBug, '/api/bug-report', bugReport(), env, '198.51.100.70');
  assertEqual(bugAnswer.status, 503, 'the complaints desk is honestly off the desk');
  assertEqual(bugAnswer.fallback, 'unreachable', 'the bug door says why');
  const prizeAnswer = await callDoor(doors.redeem.onRequest, '/api/redeem', { code: 'GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD' }, env, '198.51.100.70');
  assertEqual(prizeAnswer.status, 503, 'the prize desk is honestly off the desk');
  assertEqual(prizeAnswer.fallback, 'unreachable', 'the prize door says why');
  assertEqual(kv.writes.length, 0, 'none of it is spent against the shared KV budget');
}

// The nightly job's sweep, on a real file: exactly the rows past their own expiry are removed.
async function checkNightlySweep() {
  const directory = await mkdtemp(path.join(tmpdir(), 'gold-rush-ledger-sweep-'));
  try {
    const file = path.join(directory, 'ledger.db');
    const storage = new SqliteStorage(file);
    await storage.put('bug:1790000000000-aaaaaaaa', JSON.stringify({ id: '1790000000000-aaaaaaaa', description: 'old' }), { expirationTtl: 1 });
    await storage.put('bug:1790000000001-bbbbbbbb', JSON.stringify({ id: '1790000000001-bbbbbbbb', description: 'new' }), { expirationTtl: 60 });
    await storage.put('prize:GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD', 'gilded');
    storage.close();
    assertEqual(sweepExpiredLedgerRows(file, Date.now() + 2_000), 1, 'the nightly sweep removes exactly the row past its own expiry');
    const reopened = new SqliteStorage(file);
    try {
      const keys = reopened.db.prepare('SELECT key FROM kv ORDER BY key').all().map(({ key }) => key);
      assertEqual(keys.join(','), 'bug:1790000000001-bbbbbbbb,prize:GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD', 'the expired report is gone from the file and nothing else is');
    } finally {
      reopened.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

// scripts/kv-to-ledger-migrate.mjs, its PURE halves only, on a throwaway in-memory ledger: the script
// itself is never run against KV or the droplet by this task.
async function checkKvToLedgerMigration() {
  const storage = new SqliteStorage(':memory:');
  try {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    // The ledger after the flip: a prize already redeemed there, a counter already counting.
    await storage.put('prize:GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD', 'redeemed:2026-09-26T00:00:00.000Z|gilded');
    await storage.tally('telemetry:runs:total');
    const report = (id, submittedAt) => JSON.stringify({ id, submittedAt, description: 'the ford ate my wagon', diagnostics: {} });
    const document = {
      version: 1,
      exportedAt: new Date(now).toISOString(),
      namespaceId: 'f22215557bbe46e0a283953b8a0cfb4b',
      rows: [
        { key: 'bug:1790000000000-aaaaaaaa', value: report('1790000000000-aaaaaaaa', new Date(now - day).toISOString()), expiration: Math.floor((now + 89 * day) / 1000) },
        { key: 'bug:1780000000000-bbbbbbbb', value: report('1780000000000-bbbbbbbb', new Date(now - 100 * day).toISOString()), expiration: null },
        { key: 'prize:GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD', value: 'gilded', expiration: null },
        { key: 'prize:GR-111111-222222-333333-444444', value: 'gilded', expiration: null },
        { key: 'telemetry:runs:total', value: '41', expiration: null },
        { key: 'telemetry:waves:max', value: '37', expiration: null },
        { key: 'telemetry:updatedAt', value: '2026-09-20T00:00:00.000Z', expiration: null },
        { key: 'telemetry:ratelimit:abc', value: '3:1', expiration: Math.floor(now / 1000) + 60 },
        { key: 'telemetry:dedup:2026-09:abc', value: '1', expiration: Math.floor(now / 1000) + 60 },
        { key: 'bug:ratelimit:abc', value: '1', expiration: Math.floor(now / 1000) + 60 },
        { key: 'session:deadbeef', value: '{}', expiration: null },
      ],
    };
    const plan = planImport(document, { now });
    assertEqual(plan.skipped.unclassified, 4, 'rate-limit hours, dedup markers and any foreign class are never planned');
    applyImport(storage.db, plan, { now, dryRun: true });
    assertEqual(await storage.get('bug:1790000000000-aaaaaaaa'), null, 'a dry run writes nothing');
    const counts = applyImport(storage.db, plan, { now });
    assertEqual(counts.bugsInserted, 2, 'both reports are imported');
    assertEqual(counts.prizesInserted, 1, 'the prize the ledger lacked is imported');
    assertEqual(counts.prizesAlreadyInLedger, 1, 'the prize the ledger already holds is left alone');
    assert((await storage.get('prize:GR-AAAAAA-BBBBBB-CCCCCC-DDDDDD')).startsWith('redeemed:'), 'a prize redeemed in the ledger since the flip stays redeemed');
    assertEqual(await storage.get('telemetry:runs:total'), '42', 'counters are ADDED to what the ledger counted since the flip');
    assertEqual(await storage.get('telemetry:waves:max'), '37', 'the wave maximum is the larger');
    assertEqual(await storage.get('session:deadbeef'), null, 'a session row in the file is never imported');
    const expiry = (key) => storage.db.prepare('SELECT expires_at AS expiresAt FROM kv WHERE key = ?').get(key)?.expiresAt;
    assertEqual(expiry('bug:1790000000000-aaaaaaaa'), document.rows[0].expiration * 1000, "a report keeps KV's own expiry");
    assertEqual(expiry('bug:1780000000000-bbbbbbbb'), null, 'a pre-SEC-7 report keeps its lack of one: that is an owner decision');
    assert((await storage.get(TELEMETRY_MARKER)) !== null, 'the one-time telemetry import leaves its marker');
    const again = applyImport(storage.db, planImport(document, { now }), { now });
    assertEqual(again.telemetryRowsSkippedAlreadyImported, 3, 'a second run skips the counters');
    assertEqual(await storage.get('telemetry:runs:total'), '42', 'so the stats are never counted twice');
    assertEqual(again.bugsAlreadyInLedger, 2, 'and the reports are not duplicated');
    const expiring = planImport(document, { now, expireLegacyBugs: true });
    assertEqual(expiring.rows.some(({ key }) => key === 'bug:1780000000000-bbbbbbbb'), false, '--expire-legacy-bugs skips a pre-SEC-7 report already past its 90 days');
  } finally {
    storage.close();
  }
}

async function loadDoors(names) {
  const vite = await createViteServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const doors = {};
    for (const name of names) doors[name] = await vite.ssrLoadModule(`/functions/api/${name}.ts`);
    return doors;
  } finally {
    await vite.close();
  }
}

async function callDoor(handler, route, body, env, ip, { method = 'POST', headers = {}, params } = {}) {
  const response = await handler({
    env,
    params,
    request: new Request(`http://localhost${route}`, {
      method,
      headers: { 'content-type': 'application/json', Origin: ORIGIN, 'CF-Connecting-IP': ip, ...headers },
      body: method === 'GET' ? undefined : JSON.stringify(body),
    }),
  });
  return { status: response.status, fallback: response.headers.get('x-ledger-fallback'), body: await response.json().catch(() => ({})) };
}

// A KV stand-in that counts what the free tier meters: every put and every delete.
function countingKv() {
  const values = new Map();
  const writes = [];
  const puts = [];
  return {
    writes,
    puts,
    async get(key) {
      const entry = values.get(key);
      if (!entry) return null;
      if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
        values.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key, value, options) {
      writes.push(key);
      puts.push({ key, ttl: options?.expirationTtl ?? null });
      values.set(key, { value, expiresAt: options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : null });
    },
    async delete(key) {
      writes.push(`delete ${key}`);
      values.delete(key);
    },
    async list({ prefix = '' } = {}) {
      return { keys: [...values.keys()].filter((key) => key.startsWith(prefix)).sort().map((name) => ({ name })), list_complete: true };
    },
  };
}

function beacon(overrides) {
  const body = {
    contract: 'e1-dry-gulch', stage: 'end', waves: 12, secureWave: 0, deepestWave: 12, duration: 312_345, upgradesTaken: 5,
    tier: 'BALANCED', frameP95: 21.7, deviceClass: 'desktop', buildHash: 'abcdef12', nonce: 'a'.repeat(32), ...overrides,
  };
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
}

function demotion() {
  return { event: 'render_demotion', reason: 'webgl-context-lost', contractId: 'the-claim', buildId: 'abcdef12', tier: 'LITE', dataset: { terrain3dPilotState: 'ready' } };
}

function bugReport() {
  return {
    description: 'The ford swallowed my wagon at the second bell.',
    prospectorName: 'Robin',
    screenshot: TINY_JPEG,
    diagnostics: { contractId: 'the-claim', wave: 3, position: { x: 1.5, z: -2 }, tier: 'LITE', version: 'abcdef12' },
  };
}

// Numbers the doors own are READ from the door, never transcribed (the ratelimit-window pattern: a pin
// that copies the number it guards goes green against a tree where the number moved).
async function sourceConstant(file, name) {
  const source = await readFile(path.join(ROOT, file), 'utf8');
  const match = new RegExp(String.raw`^const ${name} = ([0-9 _*]+);`, 'm').exec(source);
  if (!match) throw new Error(`${name} not found in ${file}`);
  return match[1].split('*').map((part) => Number(part.trim().replace(/_/g, ''))).reduce((a, b) => a * b, 1);
}

function ledgerEnvelope(science, filler = '') {
  return {
    kind: 'gold-rush-ledger-bundle',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      id: 'robin',
      name: 'Robin',
      updatedAt: science,
    },
    data: {
      'gr.meta.v1': { science },
      'gr.town.name.v1': 'Dawn Claim',
      filler,
    },
  };
}

async function pushSave(baseUrl, token, envelope, baseSavedAt = null) {
  return post(baseUrl, '/api/save/push', { profileId: 'robin', envelope, baseSavedAt }, token);
}

async function startWrangler(name, devAuth, { port: requestedPort, stateRoot = STATE_ROOT } = {}) {
  const registry = devAuth ? await startAccountRegistry(path.join(stateRoot, `registry-${name}`)) : null;
  const port = requestedPort ?? await freePort();
  const persistPath = path.join(stateRoot, name);
  const args = [
    'pages',
    'dev',
    'public',
    '--kv',
    'ACCOUNTS',
    '--port',
    String(port),
    '--ip',
    '127.0.0.1',
    '--persist-to',
    persistPath,
    '--log-level',
    'error',
    '--show-interactive-dev-session=false',
  ];
  if (devAuth) args.push('--binding', 'DEV_AUTH=1');
  if (registry) args.push('--do', `ACCOUNT_REGISTRY=AccountRegistry@${registry.name}`, '--binding', `ACCOUNT_REGISTRY_SCOPE=${registry.scope}`);

  const child = spawn('wrangler', args, {
    cwd: ROOT,
    env: cleanEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  const url = `http://127.0.0.1:${port}`;
  try {
    await waitForServer(url, child, () => output);
  } catch (error) {
    child.kill('SIGTERM');
    await registry?.stop();
    throw error;
  }
  return {
    url,
    async stop() {
      await registry?.stop();
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

// Real workerd SQLite Durable Object; the local-only bridge exposes internal operations to focused tests.
export async function startAccountRegistry(directory, { internal = false, bootstrap = true } = {}) {
  await mkdir(directory, { recursive: true });
  const name = `gr-account-test-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const port = await freePort();
  const scope = 'local-account-test';
  const mainPath = path.join(ROOT, 'functions/api/_account-registry.ts');
  const bridgePath = path.join(directory, 'registry-bridge.ts');
  if (internal) await writeFile(bridgePath, `export { AccountRegistry } from ${JSON.stringify(mainPath)};\nimport worker from ${JSON.stringify(mainPath)};\nexport default { fetch(request, env) { const url = new URL(request.url); if (url.pathname.startsWith('/public/')) { url.pathname = url.pathname.slice(7); return worker.fetch(new Request(url, request), env); } const scope = request.headers.get('x-account-registry-scope') || ${JSON.stringify(scope)}; return env.ACCOUNT_REGISTRY.get(env.ACCOUNT_REGISTRY.idFromName('accounts-v1:' + scope)).fetch(request); } };\n`);
  const configPath = path.join(directory, 'wrangler.json');
  await writeFile(configPath, JSON.stringify({
    name, main: internal ? bridgePath : mainPath, compatibility_date: '2026-07-08',
    vars: { ACCOUNT_REGISTRY_MIGRATION_SECRET: 'local-account-registry-test-only' },
    durable_objects: { bindings: [{ name: 'ACCOUNT_REGISTRY', class_name: 'AccountRegistry' }] },
    migrations: [{ tag: 'accounts-01', new_sqlite_classes: ['AccountRegistry'] }],
  }));
  const child = spawn('wrangler', ['dev', '--config', configPath, '--port', String(port), '--ip', '127.0.0.1', '--persist-to', path.join(directory, 'state'), '--log-level', 'error', '--show-interactive-dev-session=false'], { cwd: ROOT, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const url = `http://127.0.0.1:${port}`;
  const headers = { authorization: 'Bearer local-account-registry-test-only', 'content-type': 'application/json', 'x-account-registry-scope': scope };
  const stop = async () => {
    if (child.exitCode !== null) return;
    child.kill('SIGTERM');
    await new Promise((resolve) => { const timer = setTimeout(resolve, 2_000); child.once('exit', () => { clearTimeout(timer); resolve(); }); });
    if (child.exitCode === null) child.kill('SIGKILL');
  };
  try {
    const started = Date.now();
    while (true) {
      if (child.exitCode !== null || Date.now() - started > 20_000) throw new Error(`account registry did not start: ${output}`);
      try { if ((await fetch(`${url}/status`, { headers })).ok) break; } catch { /* worker starts asynchronously */ }
      await sleep(100);
    }
    if (bootstrap) {
      const digest = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('[]'))).toString('hex');
      const response = await fetch(`${url}/bootstrap`, { method: 'POST', headers, body: JSON.stringify({ accounts: [], expectedCount: 0, sourceQuiesced: true, allowEmpty: true, digest }) });
      if (!response.ok) throw new Error(`account registry bootstrap failed (${response.status})`);
    }
    return { name, url, headers, scope, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

async function startLedger(name, devAuth) {
  const storage = new SqliteStorage(path.join(SQLITE_ROOT, `${name}.db`));
  const server = await createLedgerServer({ storage, env: devAuth ? { DEV_AUTH: '1' } : {} });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    async stop() {
      await new Promise((resolve) => server.close(resolve));
      storage.close();
    },
  };
}

function cleanEnv() {
  const env = { ...process.env };
  delete env.DEV_AUTH;
  delete env.RESEND_API_KEY;
  delete env.AUTH_CODE_PEPPER;
  return env;
}

async function waitForServer(url, child, logs) {
  const started = Date.now();
  while (Date.now() - started < 20_000) {
    if (child.exitCode !== null) throw new Error(`wrangler exited early:\n${logs()}`);
    try {
      const response = await fetch(`${url}/api/session`, {
        method: 'OPTIONS',
        headers: { Origin: ORIGIN },
      });
      if (response.status === 204) return;
    } catch {
      // server still starting
    }
    await sleep(250);
  }
  throw new Error(`wrangler did not become ready:\n${logs()}`);
}

async function post(baseUrl, route, body, token, origin = ORIGIN) {
  const headers = { 'content-type': 'application/json', Origin: origin };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

function assert(value, label) {
  if (!value) throw new Error(label);
  checks.push(label);
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
}

async function writeSummary(status, err) {
  // GR_GUARD_NO_ARTIFACT (F-1229-1): this summary carries a `generatedAt` and an
  // echoed save timestamp, so every run rewrites a TRACKED file with pure noise --
  // measured s1229: two lines, both timestamps, zero semantic change. That churn is
  // harmless by hand and fatal in a gate, because a drain's own precondition is a
  // clean tree. run-guards.mjs sets this flag so the guard can be wired into the
  // merge path; `npm run test:accounts` on its own still refreshes the artifact.
  if (process.env.GR_GUARD_NO_ARTIFACT === '1') return;
  await writeFile(
    path.join(ARTIFACT_DIR, 'test-accounts.json'),
    `${JSON.stringify(
      {
        status,
        checks,
        error: err instanceof Error ? err.message : undefined,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('No free port'));
      });
    });
    server.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
