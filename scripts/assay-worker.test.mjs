import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const locator = (tapeId) => ({ epochId: 'epoch-1-frontier', contractId: 'the-claim', tapeId, rowId: `${'a'.repeat(32)}:1:1:${'b'.repeat(64)}` });
const score = { secured: true, waves: 10, timeAlive: 120, gold: 40, baseValue: 60 };
const row = (id, version = 2) => ({ locator: locator(id), tape: { version, id, eventLogHash: 'fnv1a32:1234abcd' }, score, submittedAt: 1 });

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'assay-worker-test-'));
  const stub = path.join(directory, 'replay-stub.mjs');
  await writeFile(stub, `
    import { readFile } from 'node:fs/promises';
    const tape = JSON.parse(await readFile(process.argv[2], 'utf8'));
    if (tape.id === 'crash') throw new Error('stub instrument crash');
    const eventLogHash = tape.id === 'hash-mismatch' ? 'fnv1a32:deadbeef' : 'fnv1a32:1234abcd';
    const outcome = { secured: true, waves: tape.id === 'outcome-mismatch' ? 9 : 10, timeAlive: 120, gold: 40 };
    process.stdout.write(JSON.stringify({ eventLogHash, outcome }) + '\\n');
  `);
  return { directory, stub };
}

async function mockApi(queue, options = {}) {
  const posts = [];
  let gets = 0;
  const server = createServer(async (request, response) => {
    if (request.url?.startsWith('/api/standings/assay-queue')) {
      gets += 1;
      if (gets <= (options.failGets ?? 0)) return json(response, 503, { ok: false, error: 'test_failure' });
      return json(response, 200, { ok: true, queue });
    }
    if (request.url === '/api/standings/assay-verdict' && request.method === 'POST') {
      let body = '';
      for await (const chunk of request) body += chunk;
      posts.push(JSON.parse(body));
      json(response, 200, { ok: true });
      options.onPost?.();
      return;
    }
    json(response, 404, { ok: false });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { base: `http://127.0.0.1:${server.address().port}`, posts, gets: () => gets, close: () => new Promise((resolve) => server.close(resolve)) };
}

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
}

function runWorker(base, stub, flags = ['--once']) {
  const child = spawn(process.execPath, ['scripts/assay-worker.mjs', ...flags], {
    cwd: root,
    env: { ...process.env, ASSAY_API_BASE: base, ASSAY_WORKER_SECRET: 'test-secret', ASSAY_REPLAY_SCRIPT: stub, ASSAY_POLL_MS: '5', ASSAY_BACKOFF_INITIAL_MS: '10', ASSAY_BACKOFF_MAX_MS: '20' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const done = new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
  return { child, done };
}

test('once processes verified, mismatch, crash, and legacy rows fail-honestly', async () => {
  const { directory, stub } = await fixture();
  const api = await mockApi([row('verified'), row('hash-mismatch'), row('outcome-mismatch'), row('crash'), row('legacy', 1)]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, stub).done;
    assert.equal(code, 0, stderr);
    assert.equal(api.gets(), 1, '--once fetches the queue once');
    assert.deepEqual(api.posts.map(({ verdict }) => verdict), ['verified', 'rejected', 'rejected', 'rejected', 'rejected']);
    assert.match(api.posts[1].reason, /eventLogHash mismatch/);
    assert.match(api.posts[2].reason, /outcome mismatch: waves/);
    assert.match(api.posts[3].reason, /stub instrument crash/);
    assert.match(api.posts[4].reason, /legacy tape v1 is unverifiable/);
    assert.equal(api.posts[3].replayedHash, 'fnv1a32:00000000');
    const logs = stdout.trim().split('\n').map(JSON.parse);
    assert.equal(logs.length, 5);
    assert.ok(logs.every((entry) => entry.locator && entry.hashes && Number.isInteger(entry.wallMs)));
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('dry-run prints the verdict without posting it', async () => {
  const { directory, stub } = await fixture();
  const api = await mockApi([row('verified')]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, stub, ['--once', '--dry-run']).done;
    assert.equal(code, 0, stderr);
    assert.equal(api.posts.length, 0);
    const log = JSON.parse(stdout);
    assert.deepEqual({ ...log, wallMs: 0 }, {
      locator: locator('verified'), verdict: 'verified', hashes: { claimed: 'fnv1a32:1234abcd', replayed: 'fnv1a32:1234abcd' }, wallMs: 0, dryRun: true,
    });
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('API failures back off before polling again', async () => {
  const { directory, stub } = await fixture();
  let child;
  const api = await mockApi([row('verified')], { failGets: 3, onPost: () => child.kill('SIGTERM') });
  try {
    const running = runWorker(api.base, stub, []);
    child = running.child;
    const { code, stdout, stderr } = await running.done;
    assert.equal(code, 0, stderr);
    assert.equal(api.gets(), 4);
    assert.equal(api.posts.length, 1);
    const logs = stdout.trim().split('\n').map(JSON.parse);
    assert.deepEqual(logs.slice(0, 3).map(({ delayMs }) => delayMs), [10, 20, 20]);
    assert.ok(logs.slice(0, 3).every(({ event, error }) => event === 'api_backoff' && /test_failure/.test(error)));
    assert.equal(logs[3].verdict, 'verified');
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});
