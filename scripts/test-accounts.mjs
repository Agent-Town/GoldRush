import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/accounts-worker');
const STATE_ROOT = path.join(ROOT, 'test-results/accounts-worker-state');
const checks = [];

await main();

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });

  try {
    await checkUnconfigured503();
    await checkDevFlow();
    await writeSummary('passed');
    console.log(`accounts worker checks passed (${checks.length})`);
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  }
}

async function checkUnconfigured503() {
  const server = await startWrangler('unconfigured', false);
  try {
    const response = await post(server.url, '/api/request-code', { email: 'family@example.com' });
    assertEqual(response.status, 503, 'request-code returns 503 without DEV_AUTH or Resend');
  } finally {
    await server.stop();
  }
}

async function checkDevFlow() {
  const server = await startWrangler('dev', true);
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

async function startWrangler(name, devAuth) {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, name);
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
  await waitForServer(url, child, () => output);
  return {
    url,
    async stop() {
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
