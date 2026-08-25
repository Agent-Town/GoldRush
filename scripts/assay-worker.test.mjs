import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assertCanonicalAssayNode, CANONICAL_ASSAY_NODE_VERSION, computeEngineHash, ENGINE_SOURCE_INPUTS } from './assay-replay-agent.mjs';

const root = process.cwd();
const buildId = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const engineHash = await computeEngineHash(root);
const installedCanonicalNode = path.join(homedir(), '.nvm/versions/node', `v${CANONICAL_ASSAY_NODE_VERSION}`, 'bin/node');
const workerNode = process.versions.node === CANONICAL_ASSAY_NODE_VERSION ? process.execPath : installedCanonicalNode;
if (!existsSync(workerNode)) throw new Error(`assay-worker tests require Node ${CANONICAL_ASSAY_NODE_VERSION}`);
const locator = (tapeId) => ({ epochId: 'epoch-1-frontier', contractId: 'the-claim', tapeId, rowId: `${'a'.repeat(32)}:1:1:${'b'.repeat(64)}` });
const score = { secured: true, waves: 10, timeAlive: 120, gold: 40, baseValue: 60 };
const row = (id, version = 2) => ({ locator: locator(id), tape: { version, id, eventLogHash: 'fnv1a32:1234abcd' }, score, submittedAt: 1 });

async function fixture() {
  const directory = await mkdtemp(path.join(tmpdir(), 'assay-worker-test-'));
  const stub = path.join(directory, 'replay-stub.mjs');
  const attempts = path.join(directory, 'attempts.txt');
  await writeFile(stub, `
    import { readFile, writeFile } from 'node:fs/promises';
    const tape = JSON.parse(await readFile(process.argv[2], 'utf8'));
    if (tape.id === 'crash') throw new Error('stub instrument crash');
    if (tape.id === 'shutdown') {
      process.kill(process.ppid, 'SIGTERM');
      await new Promise((resolve) => setTimeout(resolve, 20));
      throw new Error('stub instrument interrupted');
    }
    if (tape.id === 'flaky') {
      const attempt = Number(await readFile(${JSON.stringify(attempts)}, 'utf8').catch(() => '0')) + 1;
      await writeFile(${JSON.stringify(attempts)}, String(attempt));
      if (attempt <= 3) throw new Error('stub instrument unavailable');
    }
    const eventLogHash = tape.id === 'hash-mismatch' ? 'fnv1a32:deadbeef' : tape.id === 'invalid-hash' ? 'not-a-hash' : tape.id === 'matching-round2' ? tape.eventLogHash : 'fnv1a32:1234abcd';
    const outcome = tape.id === 'matching-round2' ? tape.outcome : { secured: true, waves: tape.id === 'outcome-mismatch' ? 9 : 10, timeAlive: 120, gold: 40 };
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
  const child = spawn(workerNode, ['scripts/assay-worker.mjs', ...flags], {
    cwd: root,
    env: { ...process.env, ASSAY_BUILD_ID: buildId, ASSAY_API_BASE: base, ASSAY_WORKER_SECRET: 'test-secret', ASSAY_REPLAY_SCRIPT: stub, ASSAY_POLL_MS: '5', ASSAY_BACKOFF_INITIAL_MS: '10', ASSAY_BACKOFF_MAX_MS: '20' },
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

test('once keeps completed mismatches rejected and retries instrument failures before unassayable', async () => {
  const { directory, stub } = await fixture();
  const api = await mockApi([row('verified'), row('hash-mismatch'), row('outcome-mismatch'), row('crash'), row('invalid-hash'), row('legacy', 1)]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, stub).done;
    assert.equal(code, 0, stderr);
    assert.equal(api.gets(), 1, '--once fetches the queue once');
    assert.deepEqual(api.posts.map(({ verdict }) => verdict), ['verified', 'rejected', 'rejected', 'unassayable', 'unassayable', 'unassayable']);
    assert.match(api.posts[1].reason, /eventLogHash mismatch/);
    assert.match(api.posts[2].reason, /outcome mismatch: waves/);
    assert.match(api.posts[3].reason, /stub instrument crash/);
    assert.match(api.posts[4].reason, /no valid eventLogHash/);
    assert.match(api.posts[5].reason, /legacy tape v1 is unverifiable/);
    assert.equal(api.posts[3].replayedHash, undefined, 'no fake replay hash is published for an instrument failure');
    const logs = stdout.trim().split('\n').map(JSON.parse);
    assert.deepEqual(logs.filter(({ event }) => event === 'instrument_retry').map(({ attempt, delayMs }) => [attempt, delayMs]), [
      [1, 10], [2, 20], [1, 10], [2, 20], [1, 10], [2, 20],
    ]);
    const verdicts = logs.filter(({ verdict }) => verdict);
    assert.equal(verdicts.length, 6);
    assert.ok(verdicts.every((entry) => entry.locator && entry.hashes && Number.isInteger(entry.wallMs)));
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('engine hash wins over build id, with build id retained for legacy tapes', async () => {
  const { directory, stub } = await fixture();
  const round2 = JSON.parse(readFileSync('artifacts/assay-e2e-20260822/round2/tape-secure-verb.json', 'utf8'));
  const matchingTape = { ...round2, id: 'matching-round2', meta: { buildId: buildId.slice(0, 8), engineHash, era: 3 } };
  const matchingRow = {
    locator: locator(matchingTape.id),
    tape: matchingTape,
    score: { ...matchingTape.outcome, baseValue: 60 },
    submittedAt: 1,
  };
  const engineSkew = row('engine-skew');
  engineSkew.tape.meta = { buildId, engineHash: '0'.repeat(64), era: 2 };
  const legacySkew = row('legacy-skew');
  legacySkew.tape.meta = { buildId: 'deadbeef' };
  const api = await mockApi([engineSkew, legacySkew, matchingRow]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, stub).done;
    assert.equal(code, 0, stderr);
    assert.deepEqual(api.posts.map(({ verdict }) => verdict), ['unassayable', 'unassayable', 'verified']);
    assert.equal(api.posts[0].reason, "engine era 3 'the Honest Hypot', tape from era 2");
    assert.equal(api.posts[0].replayedHash, undefined);
    assert.equal(api.posts[1].reason, `build-skew (tape deadbeef, assayer ${buildId})`);
    assert.equal(api.posts[2].reason, undefined);
    assert.equal(stdout.trim().split('\n').map(JSON.parse).some(({ event }) => event === 'instrument_retry'), false);
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});

test('the worker environment law refuses every Node version except the exact canonical one', () => {
  assert.doesNotThrow(() => assertCanonicalAssayNode(CANONICAL_ASSAY_NODE_VERSION));
  assert.throws(() => assertCanonicalAssayNode('26.4.1'), /requires Node 26\.4\.0 exactly; found 26\.4\.1/);
});

test('engine hash ignores a doc-only commit and moves on a Balance edit in a scratch worktree', async () => {
  const repository = await mkdtemp(path.join(tmpdir(), 'assay-engine-hash-repo-'));
  const worktree = `${repository}-worktree`;
  const gitEnv = { ...process.env, GIT_AUTHOR_NAME: 'Assay Test', GIT_AUTHOR_EMAIL: 'assay@test.invalid', GIT_COMMITTER_NAME: 'Assay Test', GIT_COMMITTER_EMAIL: 'assay@test.invalid' };
  try {
    for (const input of ENGINE_SOURCE_INPUTS) {
      if (path.extname(input)) {
        await mkdir(path.dirname(path.join(repository, input)), { recursive: true });
        await writeFile(path.join(repository, input), `${input}\n`);
      } else {
        await mkdir(path.join(repository, input), { recursive: true });
        await writeFile(path.join(repository, input, input.startsWith('assets/') ? 'fixture.json' : 'fixture.ts'), '{}\n');
      }
    }
    await mkdir(path.join(repository, 'src/game'), { recursive: true });
    await writeFile(path.join(repository, 'src/game/Balance.ts'), 'export const Balance = 1;\n');
    execFileSync('git', ['init', '-q'], { cwd: repository });
    execFileSync('git', ['add', '.'], { cwd: repository });
    execFileSync('git', ['commit', '-qm', 'engine baseline'], { cwd: repository, env: gitEnv });
    execFileSync('git', ['worktree', 'add', '-q', '--detach', worktree, 'HEAD'], { cwd: repository });

    const baseline = await computeEngineHash(worktree);
    await mkdir(path.join(worktree, 'docs'), { recursive: true });
    await writeFile(path.join(worktree, 'docs/note.md'), 'docs only\n');
    execFileSync('git', ['add', 'docs/note.md'], { cwd: worktree });
    execFileSync('git', ['commit', '-qm', 'docs only'], { cwd: worktree, env: gitEnv });
    assert.equal(await computeEngineHash(worktree), baseline);

    const balancePath = path.join(worktree, 'src/game/Balance.ts');
    await writeFile(balancePath, `${await readFile(balancePath, 'utf8')}export const changed = true;\n`);
    const balanceHash = await computeEngineHash(worktree);
    assert.notEqual(balanceHash, baseline);
    await writeFile(path.join(worktree, 'assets/crafting-queue/approved/fixture.json'), '{"changed":true}\n');
    assert.notEqual(await computeEngineHash(worktree), balanceHash);
  } finally {
    if (existsSync(worktree)) execFileSync('git', ['worktree', 'remove', '--force', worktree], { cwd: repository });
    await rm(repository, { recursive: true, force: true });
  }
});

// The county SERVES a rejection's reason now (`?verdict=<reel id>`), so the posted text is public
// while the operator's log stays whole. An instrument failure carries the box's paths through
// `error.message`; a rider learns nothing from them and a stranger learns the deploy layout.
test('a posted unassayable reason names files, never paths; the operator log keeps both', async () => {
  const { directory, stub } = await fixture();
  const pathStub = path.join(directory, 'path-stub.mjs');
  await writeFile(pathStub, `
    process.stderr.write("Cannot find module '/srv/gold-rush/scripts/assay-replay.mjs'\\n");
    process.exit(1);
  `);
  const api = await mockApi([row('leaky')]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, pathStub).done;
    assert.equal(code, 0, stderr);
    assert.equal(api.posts.length, 1);
    assert.equal(api.posts[0].verdict, 'unassayable');
    assert.equal(api.posts[0].reason, "Cannot find module 'assay-replay.mjs'");
    assert.ok(!/\/srv\//.test(api.posts[0].reason), 'no absolute path reaches the county');
    assert.match(JSON.parse(stdout.trim().split('\n').at(-1)).reason, /\/srv\/gold-rush\/scripts\/assay-replay\.mjs/, 'the operator log keeps the whole message');
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

test('shutdown during replay leaves the row pending', async () => {
  const { directory, stub } = await fixture();
  const api = await mockApi([row('shutdown')]);
  try {
    const { code, stdout, stderr } = await runWorker(api.base, stub).done;
    assert.equal(code, 0, stderr);
    assert.equal(api.posts.length, 0);
    assert.equal(stdout, '');
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

test('a row flipped back to pending is assayed again from a clean attempt budget', async () => {
  const { directory, stub } = await fixture();
  let child;
  const api = await mockApi([row('flaky')], { onPost: () => {
    if (api.posts.length === 2) child.kill('SIGTERM');
  } });
  try {
    const running = runWorker(api.base, stub, []);
    child = running.child;
    const { code, stdout, stderr } = await running.done;
    assert.equal(code, 0, stderr);
    assert.deepEqual(api.posts.map(({ verdict }) => verdict), ['unassayable', 'verified']);
    assert.equal(api.posts[1].reason, undefined, 'a successful retry does not retain an earlier failure reason');
    assert.equal(JSON.parse(stdout.trim().split('\n').at(-1)).reason, undefined, 'the verified operator log is not contradictory');
  } finally {
    await api.close();
    await rm(directory, { recursive: true, force: true });
  }
});
