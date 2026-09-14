import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertWranglerVersion } from './wrangler-binary.mjs';
import { createLedgerServer } from '../server/ledger/serve.mjs';
import { SqliteStorage } from '../server/ledger/storage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/accounts-worker');
const STATE_ROOT = path.join(ROOT, 'test-results/accounts-worker-state');
const SQLITE_ROOT = path.join(STATE_ROOT, 'sqlite');
const checks = [];

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
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
