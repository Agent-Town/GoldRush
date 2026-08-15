import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';

const SECRET = 'assay-worker-test-secret';
const KEY = 'standings:epoch-1-frontier:the-claim';
let checks = 0;

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { onRequest } = await vite.ssrLoadModule('/functions/api/standings.ts');
  const { onRequest: onRequestAssayQueue } = await vite.ssrLoadModule('/functions/api/standings/assay-queue.ts');
  const { onRequest: onRequestAssayVerdict } = await vite.ssrLoadModule('/functions/api/standings/assay-verdict.ts');
  await checkPosts(onRequest);
  await checkVerdicts(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
  await checkDuplicateTapeIds(onRequest, onRequestAssayVerdict);
  await checkUnrankedBound(onRequest);
  await checkRetroAssay(onRequest, onRequestAssayQueue);
  console.log(`standings assay checks passed (${checks})`);
} finally {
  await vite.close();
}

async function checkPosts(onRequest) {
  const kv = makeKv();
  const unattested = await call(onRequest, 'POST', '/api/standings', post('0'.repeat(32), 20), kv);
  equal(unattested.status, 200, 'tapeless POST accepted');
  equal(unattested.body.stored, true, 'tapeless POST stored');
  equal(unattested.body.rank, null, 'tapeless POST has no rank');
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.length, 1, 'tapeless row survives in KV');
  equal(stored[0].assay, undefined, 'tapeless row is unattested');
  const emptyBoard = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(emptyBoard.body.board.length, 0, 'tapeless row is excluded from board');

  const taped = post('0'.repeat(32), 20, tape('pending-tape', 20));
  const pending = await call(onRequest, 'POST', '/api/standings', taped, kv);
  equal(pending.body.rank, 1, 'taped resubmission supersedes unattested row');
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'pending row shows on board');
  equal(board.body.board[0].assay, 'pending', 'pending badge state is exposed');
}

async function checkVerdicts(onRequest, queueRoute, verdictRoute) {
  const kv = makeKv();
  await call(onRequest, 'POST', '/api/standings', post('1'.repeat(32), 30, tape('verify-me', 30)), kv);
  await call(onRequest, 'POST', '/api/standings', post('2'.repeat(32), 25, tape('reject-me', 25)), kv);

  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, kv, undefined)).status, 503, 'absent secret fails closed');
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, kv, SECRET, 'wrong')).status, 401, 'wrong key is unauthorized');
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=2', undefined, kv, SECRET);
  equal(queue.status, 200, 'correct key reads queue');
  equal(queue.body.queue.map((row) => row.locator.tapeId).join(','), 'verify-me,reject-me', 'queue is oldest first');

  const verifyLocator = queue.body.queue.find((row) => row.locator.tapeId === 'verify-me').locator;
  const rejectLocator = queue.body.queue.find((row) => row.locator.tapeId === 'reject-me').locator;
  const mismatch = verdict(verifyLocator, 'verified');
  mismatch.replayedHash = 'fnv1a32:deadbeef';
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', mismatch, kv, SECRET)).status, 400, 'verified hash mismatch is refused');
  const verified = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(verifyLocator, 'verified'), kv, SECRET);
  equal(verified.status, 200, 'verified verdict accepted');
  equal(verified.body.assay, 'verified', 'verified verdict flips state');
  const rejected = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(rejectLocator, 'rejected', 'replay diverged'), kv, SECRET);
  equal(rejected.status, 200, 'rejected verdict accepted');

  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'rejected row drops from ranking');
  equal(board.body.board[0].assay, 'verified', 'verified row remains ranked');
  equal(board.body.rejectedCount, 1, 'rejected row is counted');
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.length, 2, 'rejected row survives in KV');
  equal(stored.find((row) => row.tape.id === 'reject-me').assayReason, 'replay diverged', 'rejection reason is retained privately');
}

async function checkRetroAssay(onRequest, queueRoute) {
  const kv = makeKv();
  const rows = Array.from({ length: 17 }, (_, index) => storedRow(index, index !== 2 && index !== 7 && index !== 11));
  await kv.put(KEY, JSON.stringify(rows));
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 14, '17-row fixture excludes three tapeless rows');
  ok(board.body.board.every((row) => row.assay === 'pending'), 'legacy taped rows normalize to pending');
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=100', undefined, kv, SECRET);
  equal(queue.body.queue.length, 14, 'all legacy taped rows enter retro-assay queue');
  equal(JSON.parse(await kv.get(KEY)).length, 17, 'lazy migration deletes no stored rows');
}

async function checkDuplicateTapeIds(onRequest, verdictRoute) {
  const kv = makeKv();
  await call(onRequest, 'POST', '/api/standings', post('3'.repeat(32), 10, tape('duplicate', 10, 'fnv1a32:11111111')), kv);
  await call(onRequest, 'POST', '/api/standings', post('4'.repeat(32), 20, tape('duplicate', 20, 'fnv1a32:11111111')), kv);
  const { onRequest: queueRoute } = await vite.ssrLoadModule('/functions/api/standings/assay-queue.ts');
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=2', undefined, kv, SECRET);
  const locator = queue.body.queue.find((row) => row.score.waves === 10).locator;
  const result = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', {
    ...verdict(locator, 'verified'), replayedHash: 'fnv1a32:11111111',
  }, kv, SECRET);
  equal(result.status, 200, 'duplicate legacy tape IDs select the matching replay hash');
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.find((row) => row.anonId === '3'.repeat(32)).assay, 'verified', 'selected duplicate row receives verdict');
  equal(stored.find((row) => row.anonId === '4'.repeat(32)).assay, 'pending', 'identical duplicate row stays pending');
}

async function checkUnrankedBound(onRequest) {
  const kv = makeKv();
  await kv.put(KEY, JSON.stringify(Array.from({ length: 100 }, (_, index) => storedRow(index, false))));
  await call(onRequest, 'POST', '/api/standings', post('f'.repeat(32), 100), kv);
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.length, 100, 'unranked retention stays bounded');
  ok(stored.some((row) => row.waves === 100), 'newest unattested row is retained at the bound');
}

function post(anonId, waves, runTape) {
  const inputLogHash = runTape ? createHash('sha256').update(JSON.stringify(runTape.inputLog)).digest('hex') : 'b'.repeat(64);
  return {
    contractId: 'the-claim', epochId: 'epoch-1-frontier',
    score: { secured: true, waves, timeAlive: 120, gold: 40, baseValue: 60 },
    profileName: 'Assay Test', anonId, difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64), inputLogHash, ...(runTape ? { tape: runTape } : {}),
  };
}

function tape(id, waves, eventLogHash = 'fnv1a32:1234abcd') {
  return {
    version: 1, id, createdAt: 1, kept: true, contract: 'the-claim', seed: 'gold-rush', difficulty: 'trail', simVersion: 1,
    inputLog: {
      version: 1, name: id, contractId: 'the-claim', seed: 'gold-rush', difficultyPreset: 'trail', stepSeconds: 1 / 30,
      start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
    },
    eventLogHash,
    outcome: { reason: 'secured', secured: true, waves, timeAlive: 120, gold: 40 },
  };
}

function storedRow(index, withTape) {
  const payload = post(index.toString(16).padStart(32, '0'), 100 - index, withTape ? tape(`legacy-${index}`, 100 - index) : undefined);
  return {
    ...payload.score, profileName: `Legacy ${index}`, anonId: payload.anonId, difficulty: payload.difficulty,
    seed: payload.seed, seedMode: payload.seedMode, seedHash: payload.seedHash, inputLogHash: payload.inputLogHash,
    submittedAt: index + 1, ...(withTape ? { tape: payload.tape } : {}),
  };
}

function verdict(locator, verdictValue, reason) {
  return {
    locator, verdict: verdictValue,
    replayedHash: 'fnv1a32:1234abcd', ...(reason ? { reason } : {}),
  };
}

async function call(route, method, url, body, kv) {
  return workerCall(route, method, url, body, kv);
}

async function workerCall(route, method, url, body, kv, secret, key = secret) {
  const headers = new Headers(body === undefined ? {} : { 'content-type': 'application/json' });
  if (key !== undefined) headers.set('x-assay-key', key);
  const response = await route({
    request: new Request(`http://127.0.0.1${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
    env: { TELEMETRY: kv, ...(secret === undefined ? {} : { ASSAY_WORKER_SECRET: secret }) },
  });
  return { status: response.status, body: await response.json() };
}

function makeKv() {
  const values = new Map();
  return { get: async (key) => values.get(key) ?? null, put: async (key, value) => void values.set(key, value) };
}

function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  checks += 1;
}

function ok(value, message) {
  assert.ok(value, message);
  checks += 1;
}
