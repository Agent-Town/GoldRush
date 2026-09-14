import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';
import { SqliteStorage } from '../server/ledger/storage.mjs';
import { startAccountRegistry } from './test-accounts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha = (value) => createHash('sha256').update(value).digest('hex');
const record = (email, accountId = randomBytes(16).toString('hex')) => ({ version: 1, accountId, email, emailHash: sha(email), createdAt: '2026-07-01T00:00:00.000Z' });
const envelope = (id) => ({ kind: 'gold-rush-ledger-bundle', version: 1, profile: { id, name: id }, data: {} });

test('atomic account identities preserve legacy accounts and isolate registration generations on SQLite and real Durable Objects', { timeout: 90_000 }, async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gr-account-creation-'));
  let worker, sqlite, sqliteSibling;
  t.after(async () => {
    try { await worker?.stop(); }
    finally {
      sqlite?.close();
      sqliteSibling?.close();
      await rm(directory, { recursive: true, force: true });
    }
  });
  const vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  let handlers;
  try { handlers = await vite.ssrLoadModule('/functions/api/_accounts.ts'); } finally { await vite.close(); }
  const legacy = record('legacy@example.com');
  worker = await startAccountRegistry(path.join(directory, 'registry'), { internal: true, bootstrap: false });
  const callRegistry = async (operation, body, headers = worker.headers) => {
    const response = await fetch(`${worker.url}${operation}`, { method: body === undefined ? 'GET' : 'POST', headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: await response.json() };
  };

  assert.equal((await callRegistry('/resolve', record('closed@example.com'))).status, 503, 'unbootstrapped registry refuses new identities');
  assert.equal((await callRegistry('/public/bootstrap', {}, { 'content-type': 'application/json' })).status, 401, 'bootstrap requires the migration secret');
  assert.equal((await callRegistry('/public/resolve', record('public@example.com'))).status, 404, 'allocation is not a public worker endpoint');
  const bootstrap = { accounts: [legacy], expectedCount: 1, sourceQuiesced: true, digest: sha(JSON.stringify([legacy])) };
  assert.equal((await callRegistry('/bootstrap', { ...bootstrap, expectedCount: 0 })).status, 400, 'partial import count is refused');
  const conflicts = [legacy, { ...legacy, email: 'other@example.com', emailHash: sha('other@example.com') }];
  assert.equal((await callRegistry('/bootstrap', { ...bootstrap, accounts: conflicts, expectedCount: 2, digest: sha(JSON.stringify(conflicts)) })).status, 409, 'duplicate account ownership is refused');
  assert.equal((await callRegistry('/bootstrap', bootstrap)).status, 200);
  assert.equal((await callRegistry('/bootstrap', bootstrap)).status, 200, 'identical bootstrap retry is idempotent');
  assert.equal((await callRegistry('/bootstrap', { accounts: [], expectedCount: 0, sourceQuiesced: true, allowEmpty: true, digest: sha('[]') })).status, 409, 'active registry cannot be replaced by an empty import');
  const separateHeaders = { ...worker.headers, 'x-account-registry-scope': 'separate-kv-namespace' };
  assert.equal((await callRegistry('/resolve', legacy, separateHeaders)).status, 503, 'a separate account namespace starts independently closed');
  assert.equal((await callRegistry('/bootstrap', { accounts: [], expectedCount: 0, sourceQuiesced: true, allowEmpty: true, digest: sha('[]') }, separateHeaders)).status, 200);
  const separateIdentity = (await callRegistry('/resolve', record(legacy.email), separateHeaders)).body;
  assert.notEqual(separateIdentity.accountId, legacy.accountId);
  assert.equal((await callRegistry('/retire', separateIdentity, separateHeaders)).body, true);
  assert.equal((await callRegistry('/resolve', record(legacy.email))).body.accountId, legacy.accountId, 'another KV namespace cannot retire this identity');

  sqlite = new SqliteStorage(path.join(directory, 'accounts.db'));
  sqliteSibling = new SqliteStorage(path.join(directory, 'accounts.db'));
  await sqlite.put(`account:${legacy.emailHash}`, JSON.stringify(legacy));
  const kv = memoryKV();
  // Deliberately stale/incorrect legacy copies cannot override the bootstrapped atomic owner.
  await kv.put(`account:${legacy.emailHash}`, JSON.stringify(record(legacy.email)));
  const namespace = { idFromName: (name) => name, get: (name) => ({ fetch: (request) => {
    const url = new URL(request.url); const headers = new Headers(request.headers); headers.set('x-account-registry-scope', name.slice('accounts-v1:'.length));
    return fetch(`${worker.url}${url.pathname}`, new Request(request, { headers }));
  } }) };

  for (const [backend, storage, registry] of [['sqlite', sqlite, undefined], ['durable-object', kv, namespace]]) {
    await t.test(backend, async () => {
      const env = { DEV_AUTH: '1', ACCOUNTS: storage, ...(registry ? { ACCOUNT_REGISTRY: registry, ACCOUNT_REGISTRY_SCOPE: worker.scope } : {}) };
      const post = async (handler, body = {}, token, requestEnv = env) => {
        const response = await handlers[handler]({ env: requestEnv, request: new Request('http://localhost/api/test', { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }) });
        return { status: response.status, body: await response.json() };
      };
      const codeFor = async (email) => {
        const response = await post('requestCode', { email });
        assert.equal(response.status, 200);
        return response.body.code;
      };
      const verify = async (email) => {
        const response = await post('verifyCode', { email, code: await codeFor(email) });
        assert.equal(response.status, 200);
        return response.body;
      };
      const old = await verify('  LEGACY@example.com  ');
      assert.equal(old.accountId, legacy.accountId, 'existing random identity survives case/whitespace normalization');
      const email = `${backend}@example.com`;
      const code = await codeFor(email);
      // Force every verification to capture the same code before any request can consume it.
      const get = storage.get.bind(storage);
      let arrived = 0;
      let release;
      const barrier = new Promise((resolve) => { release = resolve; });
      storage.get = async (key) => {
        const value = await get(key);
        if (key === `code:${sha(email)}`) { if (++arrived === 2) release(); await barrier; }
        return value;
      };
      let results;
      try { results = await Promise.all([post('verifyCode', { email, code }), post('verifyCode', { email: email.toUpperCase(), code })]); }
      finally { storage.get = get; }
      assert.deepEqual(results.map((result) => result.status), [200, 200]);
      const [first, second] = results.map((result) => result.body);
      assert.equal(first.accountId, second.accountId, 'overlapping first verification has one atomic winner');
      assert.match(first.accountId, /^[a-f0-9]{32}$/);
      assert.notEqual(first.token, second.token);
      assert.match(first.token, /^[a-f0-9]{64}$/);
      for (const [index, session] of [first, second].entries()) assert.equal((await post('pushSave', { profileId: `child-${index}`, envelope: envelope(`child-${index}`) }, session.token)).status, 200);
      const again = await verify(email);
      assert.equal(again.accountId, first.accountId);
      assert.deepEqual((await post('saveProfiles', {}, again.token)).body.profiles.map((profile) => profile.profileId).sort(), ['child-0', 'child-1'], 'later login can discover both successful sessions\' saves');
      assert.equal((await post('pullSave', { profileId: 'child-0' }, old.token)).status, 404, 'another account cannot read these saves');
      assert.equal((await post('pullSave', { email, accountId: first.accountId, profileId: 'child-0' })).status, 401, 'email/account ID alone never authorizes a save');
      assert.equal((await post('sessionStatus', { token: first.accountId })).status, 401);

      // A verification already admitted before retirement may publish an old-generation token late.
      const staleToken = randomBytes(32).toString('hex');
      const staleSession = JSON.parse(await storage.get(`session:${first.token}`));
      if (backend === 'durable-object') {
        const snapshot = async () => Promise.all((await storage.list()).keys.map(async ({ name }) => [name, await storage.get(name)]));
        const before = await snapshot();
        const offline = { idFromName: (name) => name, get: () => ({ fetch: () => Promise.reject(new Error('offline')) }) };
        for (const requestEnv of [
          { ...env, ACCOUNT_REGISTRY: undefined }, { ...env, ACCOUNT_REGISTRY_SCOPE: undefined },
          { ...env, ACCOUNT_REGISTRY: offline }, { ...env, ACCOUNT_REGISTRY_SCOPE: 'not-bootstrapped-deletion-test' },
        ]) {
          assert.equal((await post('deleteAccount', {}, first.token, requestEnv)).status, 503);
          assert.deepEqual(await snapshot(), before, 'missing scope/binding, offline or unready registry must leave all data and sessions intact');
        }
      }
      const remove = storage.delete.bind(storage);
      storage.delete = async (key) => { if (key.startsWith(`save:${first.accountId}:`)) throw new Error('cleanup unavailable'); await remove(key); };
      try { assert.equal((await post('deleteAccount', {}, first.token)).status, 500); }
      finally { storage.delete = remove; }
      assert.equal((await verify(email)).accountId, first.accountId, 'failed save cleanup must not strand the existing identity');
      if (backend === 'durable-object') {
        let readyChecked = false;
        const lateFailure = { idFromName: (name) => name, get: (name) => ({ fetch: async (request) => {
          if (new URL(request.url).pathname === '/retire') { assert.equal(readyChecked, true); throw new Error('retirement unavailable after readiness'); }
          const response = await namespace.get(name).fetch(request);
          if (new URL(request.url).pathname === '/status') readyChecked = true;
          return response;
        } }) };
        assert.equal((await post('deleteAccount', {}, first.token, { ...env, ACCOUNT_REGISTRY: lateFailure })).status, 503);
        assert.equal((await post('sessionStatus', {}, first.token)).status, 200, 'a post-preflight retirement failure retains the retry session');
        assert.equal((await callRegistry('/resolve', record(email))).body.accountId, first.accountId, 'late retirement failure preserves the current identity');
      }
      assert.equal((await post('deleteAccount', {}, first.token)).status, 200);
      await storage.put(`session:${staleToken}`, JSON.stringify(staleSession));
      const replacement = await verify(email);
      assert.notEqual(replacement.accountId, first.accountId, 're-registration allocates a fresh namespace');
      assert.deepEqual((await post('saveProfiles', {}, replacement.token)).body.profiles, []);
      assert.equal((await post('pushSave', { profileId: 'new-child', envelope: envelope('new-child') }, replacement.token)).status, 200);
      assert.equal((await post('pullSave', { profileId: 'new-child' }, staleToken)).status, 404, 'late old-generation token cannot access replacement saves');
      assert.equal((await post('deleteAccount', {}, staleToken)).status, 401, 'old generation cannot retire the replacement');
      assert.equal((await post('sessionStatus', {}, replacement.token)).status, 200);
      const finalLogin = await verify(email);
      assert.equal(finalLogin.accountId, replacement.accountId);
      if (backend === 'sqlite') {
        const candidates = [record('connection@example.com'), record('connection@example.com')];
        const concurrent = await Promise.all([sqlite.resolveAccount(candidates[0]), sqliteSibling.resolveAccount(candidates[1])]);
        assert.equal(concurrent[0].accountId, concurrent[1].accountId, 'separate SQLite connections preserve the same winner');
      }
    });
  }

  const unavailable = memoryKV();
  const candidate = record('unavailable@example.com');
  await unavailable.put(`code:${candidate.emailHash}`, JSON.stringify({ hash: sha(`${candidate.emailHash}:123456:`) }));
  for (const [registry, scope] of [[undefined, worker.scope], [{ idFromName: () => 'accounts-v1', get: () => ({ fetch: () => Promise.reject(new Error('offline')) }) }, worker.scope], [namespace, undefined]]) {
    const response = await handlers.verifyCode({ env: { DEV_AUTH: '1', ACCOUNTS: unavailable, ACCOUNT_REGISTRY: registry, ACCOUNT_REGISTRY_SCOPE: scope }, request: new Request('http://localhost/api/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: candidate.email, code: '123456' }) }) });
    assert.equal(response.status, 503, 'missing/unavailable atomic owner fails closed');
    assert.equal((await unavailable.list({ prefix: 'session:' })).keys.length, 0, 'no token minted after coordination failure');
    assert.equal(await unavailable.get(`account:${candidate.emailHash}`), null, 'never falls back to KV identity writes');
  }
});

function memoryKV() {
  const entries = new Map();
  return {
    async get(key) { return entries.get(key) ?? null; },
    async put(key, value) { entries.set(key, value); },
    async delete(key) { entries.delete(key); },
    async list({ prefix = '' } = {}) { return { keys: [...entries.keys()].filter((key) => key.startsWith(prefix)).sort().map((name) => ({ name })), list_complete: true }; },
  };
}
