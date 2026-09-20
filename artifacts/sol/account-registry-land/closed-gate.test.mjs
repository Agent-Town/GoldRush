import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';
import { startAccountRegistry } from '../../../scripts/test-accounts.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sha = (value) => createHash('sha256').update(value).digest('hex');

test('closed account gate preserves saves, sessions, identity and retry code', { timeout: 60_000 }, async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'gr-closed-registry-'));
  let worker, vite;
  t.after(async () => {
    try { await worker?.stop(); } finally { await vite?.close(); await rm(directory, { recursive: true, force: true }); }
  });
  const baseline = execFileSync('git', ['show', `${(await readFile(new URL('./base.txt', import.meta.url), 'utf8')).trim()}:functions/api/_accounts.ts`], { cwd: ROOT, encoding: 'utf8' });
  let source = await readFile(path.join(ROOT, 'functions/api/_accounts.ts'), 'utf8');
  const mutant = process.env.GR_REGISTRY_MUTANT;
  if (mutant === 'kv-fallback') {
    // Restore the old allocator: an absent registry incorrectly permits sign-in.
    const oldAllocator = baseline.slice(baseline.indexOf('async function loadOrCreateAccount('), baseline.indexOf('function parseAccount('));
    source = source.replace('loadOrCreateAccount(env, kv, email, emailHash)', 'loadOrCreateAccount(kv, email, emailHash)');
    source = source.slice(0, source.indexOf('async function loadOrCreateAccount(')) + oldAllocator + source.slice(source.indexOf('async function registryRequest('));
  } else if (mutant === 'delete-before-readiness') {
    // The destructive cleanup moves ahead of the guard, while the 503 remains.
    const cleanup = '    await deletePrefix(kv, `save:${session.record.accountId}:`);';
    assert.equal(source.split(cleanup).length, 2);
    source = source.replace(cleanup, '').replace('    if (!kv.retireAccount) {', `${cleanup}\n    if (!kv.retireAccount) {`);
  } else assert.equal(mutant, undefined);
  for (const [name, code] of [['current', source], ['baseline', baseline]]) {
    await writeFile(path.join(directory, `${name}.ts`), code.replace("'./_ratelimit'", JSON.stringify(path.join(ROOT, 'functions/api/_ratelimit.ts'))));
  }
  vite = await createServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const handlers = await vite.ssrLoadModule(path.join(directory, 'current.ts'));
  const old = await vite.ssrLoadModule(path.join(directory, 'baseline.ts'));
  const email = 'gate-fixture@example.com';
  const emailHash = sha(email), token = '1'.repeat(64), accountId = '2'.repeat(32);
  const request = (handler, env) => ({ env, request: new Request(`http://localhost/api/${handler === 'verifyCode' ? 'verify' : 'delete-account'}`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ email, code: '123456' }),
  }) });
  await t.test('unconfigured routes retain baseline status and body', async () => {
    for (const handler of ['verifyCode', 'deleteAccount']) {
      const current = await handlers[handler](request(handler, {}));
      const prior = await old[handler](request(handler, {}));
      assert.equal(current.status, 503);
      assert.equal(current.status, prior.status);
      assert.deepEqual(await current.json(), await prior.json());
    }
  });
  worker = await startAccountRegistry(path.join(directory, 'registry'), { internal: true, bootstrap: false });
  const namespace = { idFromName: (name) => name, get: (name) => ({ fetch: (req) => {
    const headers = new Headers(req.headers);
    headers.set('x-account-registry-scope', name.slice('accounts-v1:'.length));
    return fetch(`${worker.url}${new URL(req.url).pathname}`, new Request(req, { headers }));
  } }) };
  const offline = { idFromName: (name) => name, get: () => ({ fetch: async () => { throw new Error('manufactured outage'); } }) };
  for (const [label, config] of [
    ['missing binding and scope', {}],
    ['missing binding', { ACCOUNT_REGISTRY_SCOPE: worker.scope }],
    ['missing scope', { ACCOUNT_REGISTRY: namespace }],
    ['unreachable registry', { ACCOUNT_REGISTRY: offline, ACCOUNT_REGISTRY_SCOPE: worker.scope }],
    ['unopened real registry', { ACCOUNT_REGISTRY: namespace, ACCOUNT_REGISTRY_SCOPE: worker.scope }],
  ]) {
    for (const handler of ['verifyCode', 'deleteAccount']) await t.test(`${handler}: ${label}`, async () => {
      const values = new Map([
        [`account:${emailHash}`, JSON.stringify({ version: 1, accountId, email, emailHash, createdAt: '2026-07-01T00:00:00Z' })],
        [`session:${token}`, JSON.stringify({ version: 1, accountId, emailHash, createdAt: '2026-07-01T00:00:00Z', expiresAt: new Date(Date.now() + 86400_000).toISOString() })],
        [`save:${accountId}:child:current`, 'existing save bytes'],
        [`code:${emailHash}`, JSON.stringify({ hash: sha(`${emailHash}:123456:`), revokeSessions: true })],
      ]);
      const storage = {
        async get(key) { return values.get(key) ?? null; },
        async put(key, value) { values.set(key, value); },
        async delete(key) { values.delete(key); },
        async list({ prefix = '' } = {}) { return { keys: [...values.keys()].filter((key) => key.startsWith(prefix)).map((name) => ({ name })), list_complete: true }; },
      };
      const before = [...values];
      const response = await handlers[handler](request(handler, { DEV_AUTH: '1', ACCOUNTS: storage, ...config }));
      assert.equal(response.status, 503);
      assert.equal((await response.json()).error, 'account_registry_unavailable');
      assert.deepEqual([...values], before, 'unavailable registry must not change saves, sessions, identity or the retry code');
    });
  }
});
