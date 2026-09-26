/**
 * THE RIVER'S VERDICT ROWS (river-assay-1; F-RES1-1, F-RES1-6, F-RVA1-1; the county-board half of the owner's F-PP6-2
 * ruling of 2026-09-26, verbatim "2 - sure, lets do that", which chose "the pan is the win; the game writes a completed
 * score at the pan").
 *
 * The River's quiet pan writes a completed `e10-river` score and posts its reel as a county standing. These rows drive
 * that standing through the whole county chain on this machine, with nothing stubbed in between: the REAL door (the
 * droplet's own ledger server, `server/ledger/serve.mjs`, over an in-memory store), the standing posted exactly as
 * `Game.submitCountyStanding` builds it, and the REAL assay worker (`scripts/assay-worker.mjs --once`) spawning the
 * REAL browser instrument (`scripts/assay-replay.mjs`), which replays the reel in the ceremony world the lever staged.
 *
 * THE FIXTURE is a reel the game itself kept at the pan, on this slice's engine, after a DIAGONAL walk to the seam
 * (`artifacts/river-assay-1/fixtures/`, recorded by `artifacts/river-assay-1/instruments/record-reel.mjs`). A diagonal
 * matters: before F-RVA1-1 a live run moved by raw axes while its reel recorded them rounded, so exactly this reel could
 * never replay to its own hash.
 *
 * THE ROWS. The honest reel VERIFIES to its own score (secured, wave 0, 5 gold, the time at the pan) and the county
 * applies the replay's own secure snapshot; the same reel with its gold, its time or its pan tick edited is REJECTED,
 * each for its own reason; the headless arm refuses a River reel by name; the worker's seam sends one to the browser arm.
 *
 * NOTHING LEAVES THIS MACHINE: the door and the worker talk over 127.0.0.1, the instrument's vite server binds a free
 * local port, and no county URL is ever built. Nothing is written outside the system temp directory.
 */
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import { homedir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { CANONICAL_ASSAY_NODE_VERSION, isAgentTape } from './assay-replay-agent.mjs';
import { createLedgerServer } from '../server/ledger/serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = 'artifacts/river-assay-1/fixtures/river-reel-desktop.json';
const SECRET = 'river-assay-test-secret';
const RIVER = { contractId: 'e10-river', epochId: 'epoch-10-deepsky' };
const installedCanonicalNode = path.join(homedir(), '.nvm/versions/node', `v${CANONICAL_ASSAY_NODE_VERSION}`, 'bin/node');
const workerNode = process.versions.node === CANONICAL_ASSAY_NODE_VERSION ? process.execPath : installedCanonicalNode;
const honest = JSON.parse(readFileSync(path.join(root, FIXTURE), 'utf8'));

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/** The body `Game.submitCountyStanding` posts for a secured River run, field for field (no stack, no party). */
function standingBody(reel, anonId) {
  return {
    contractId: RIVER.contractId,
    epochId: RIVER.epochId,
    score: { secured: true, waves: reel.outcome.waves, timeAlive: reel.outcome.timeAlive, gold: reel.outcome.gold, baseValue: 0 },
    profileName: 'River Rider',
    anonId,
    difficulty: reel.difficulty,
    seed: reel.seed,
    seedMode: 'live',
    seedHash: sha256(reel.seed),
    inputLogHash: sha256(JSON.stringify(reel.inputLog)),
    tape: reel,
  };
}

/** A coherent cheat: the reel's outcome and the standing's score edited together, as the door requires. */
function tampered(kind) {
  const reel = structuredClone(honest);
  const tick = reel.inputLog.stepSeconds;
  if (kind === 'gold') reel.outcome.gold = 50;
  if (kind === 'time') reel.outcome.timeAlive -= 5 * tick;
  if (kind === 'pan tick') {
    // The pan claimed five ticks earlier: the reel is cut to end there, and its time with it.
    reel.inputLog.durationTicks -= 5;
    reel.inputLog.entries = reel.inputLog.entries.filter((entry) => entry.t < reel.inputLog.durationTicks);
    reel.outcome.timeAlive -= 5 * tick;
  }
  const suffix = { gold: 'a', time: 'b', 'pan tick': 'c' }[kind].repeat(12);
  reel.id = `${honest.id.slice(0, 24)}${suffix}`;
  reel.inputLog.name = reel.id;
  return reel;
}

function makeStore() {
  const values = new Map();
  return {
    get: async (key) => values.get(key) ?? null,
    put: async (key, value) => { values.set(key, value); },
    delete: async (key) => { values.delete(key); },
    list: async ({ prefix = '', cursor = '' } = {}) => ({
      keys: [...values.keys()].filter((key) => key.startsWith(prefix) && key > cursor).sort().map((name) => ({ name })),
      list_complete: true,
    }),
  };
}

async function freePort() {
  const server = createNetServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function slip(base, reel) {
  const query = new URLSearchParams({ contract: RIVER.contractId, epoch: RIVER.epochId, verdict: reel.id });
  return (await fetch(`${base}/api/standings?${query}`)).json();
}

function runWorker(base, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(workerNode, ['scripts/assay-worker.mjs', '--once'], {
      cwd: root,
      env: {
        ...process.env,
        ASSAY_API_BASE: base,
        ASSAY_WORKER_SECRET: SECRET,
        GR_ASSAY_REPLAY_PORT: String(port),
        ASSAY_BACKOFF_INITIAL_MS: '1000',
        ASSAY_BACKOFF_MAX_MS: '2000',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

test('the fixture is an honest River reel: the ceremony\'s completed score, a diagonal walk, no agent orders', () => {
  assert.equal(honest.contract, RIVER.contractId);
  assert.deepEqual({ ...honest.outcome, timeAlive: undefined }, { reason: 'secured', secured: true, waves: 0, gold: 5, timeAlive: undefined });
  assert.ok(honest.outcome.timeAlive > 0);
  assert.ok(honest.inputLog.entries.some((entry) => entry.mx !== 0 && entry.my !== 0), 'the walk to the seam is diagonal (the F-RVA1-1 case)');
  assert.equal(isAgentTape(honest), false, 'a browser River reel carries no agent_orders, so the worker\'s seam sends it to the browser arm');
});

test('the headless arm refuses a River reel by name', () => {
  const run = spawnSync(process.execPath, ['scripts/assay-replay-agent.mjs', FIXTURE], { cwd: root, encoding: 'utf8', timeout: 60_000 });
  assert.equal(run.status, 1, run.stdout);
  assert.match(run.stderr, /e10-river is the River ceremony, a browser run: its reel is assayed by the browser arm/);
});

test('the county verifies the honest River standing and rejects its three edits', { timeout: 280_000 }, async () => {
  assert.ok(existsSync(workerNode), `the assay worker requires Node ${CANONICAL_ASSAY_NODE_VERSION}`);
  const store = makeStore();
  const server = await createLedgerServer({ storage: store, env: { ASSAY_WORKER_SECRET: SECRET } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const rows = [
      { name: 'honest', reel: honest, anonId: '1'.repeat(32) },
      { name: 'gold', reel: tampered('gold'), anonId: '2'.repeat(32) },
      { name: 'time', reel: tampered('time'), anonId: '3'.repeat(32) },
      { name: 'pan tick', reel: tampered('pan tick'), anonId: '4'.repeat(32) },
    ];
    for (const row of rows) {
      const response = await fetch(`${base}/api/standings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(standingBody(row.reel, row.anonId)),
      });
      const answer = await response.json();
      assert.equal(response.status, 200, `${row.name}: ${JSON.stringify(answer)}`);
      assert.equal(answer.stored, true, `${row.name}: the door stores the standing`);
      assert.equal((await slip(base, row.reel)).assay, 'pending', `${row.name}: its verdict is pending until the assay`);
    }

    const worker = await runWorker(base, await freePort());
    assert.equal(worker.code, 0, worker.stderr);
    const verdicts = new Map(worker.stdout.trim().split('\n').map((line) => JSON.parse(line)).filter((line) => line.verdict)
      .map((line) => [line.locator.tapeId, line]));
    const verdictOf = (reel) => verdicts.get(reel.id);

    // THE HONEST REEL: the replay reproduces its hash and its score, and the county applies the replay's snapshot.
    const verified = verdictOf(honest);
    assert.equal(verified?.verdict, 'verified', JSON.stringify(verified));
    assert.deepEqual(verified.hashes, { claimed: honest.eventLogHash, replayed: honest.eventLogHash });
    const honestSlip = await slip(base, honest);
    assert.equal(honestSlip.assay, 'verified');
    assert.equal(honestSlip.assayHash, honest.eventLogHash);
    const board = await (await fetch(`${base}/api/standings?${new URLSearchParams({ contract: RIVER.contractId, epoch: RIVER.epochId })}`)).json();
    assert.equal(board.ok, true, JSON.stringify(board));
    assert.equal(board.board.length, 1, 'one ranked River row: the honest one');
    assert.deepEqual(
      { profileName: board.board[0].profileName, assay: board.board[0].assay, waves: board.board[0].waves, gold: board.board[0].gold, timeAlive: board.board[0].timeAlive },
      { profileName: 'River Rider', assay: 'verified', waves: 0, gold: 5, timeAlive: honest.outcome.timeAlive },
      'the ranked row carries the replay\'s own secure snapshot',
    );

    // THE EDITS: each is caught by the instrument's replay, for its own reason.
    for (const [kind, reason] of [['gold', 'outcome mismatch: gold'], ['time', 'outcome mismatch: timeAlive']]) {
      const line = verdictOf(tampered(kind));
      assert.equal(line?.verdict, 'rejected', `${kind}: ${JSON.stringify(line)}`);
      assert.equal(line.reason, reason, 'the replay reproduces the hash and refuses the edited score');
    }
    const cut = verdictOf(tampered('pan tick'));
    assert.equal(cut?.verdict, 'rejected', JSON.stringify(cut));
    assert.match(cut.reason, /^eventLogHash mismatch: claimed /, 'a reel cut before its pan replays no pan');
    for (const kind of ['gold', 'time', 'pan tick']) {
      const refused = await slip(base, tampered(kind));
      assert.equal(refused.assay, 'rejected', `${kind}: ${JSON.stringify(refused)}`);
      assert.equal(refused.ranked, false);
    }
    assert.equal(board.rejectedCount, 3);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
