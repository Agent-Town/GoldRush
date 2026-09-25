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
    for (const [label, check] of [['sign-in hardening', checkSignInHardening], ['office credential', checkBugOfficeCredential]]) {
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
  for (const file of ['functions/api/_accounts.ts', 'functions/api/_bugs.ts', 'functions/api/redeem.ts', 'functions/api/standings.ts']) {
    const source = await readFile(path.join(ROOT, file), 'utf8');
    assert(/from '\.\/_compare'/.test(source), `${file} imports the shared constant-time compare`);
    assert(
      !/[!=]==\s*(?:context\.)?env\.[A-Z_]*(?:TOKEN|SECRET)\b/.test(source),
      `${file} never compares an operator secret with === or !==`,
    );
  }
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
