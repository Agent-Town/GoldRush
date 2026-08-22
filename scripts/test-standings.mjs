import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';

const SECRET = 'assay-worker-test-secret';
// The season roll (owner 2026-08-15): the county writes in the current season's key shape, and the
// pre-roll board keeps the shape it was written with, forever, read-only.
const KEY = 'standings:s2:epoch-1-frontier:the-claim';
const ARCHIVE_KEY = 'standings:epoch-1-frontier:the-claim';
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
  await checkSeasonRoll(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
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
  equal(stored.find((row) => row.tape.id === 'reject-me').assayReason, 'replay diverged', 'rejection reason is retained on the row');

  // THE ASSAY SLIP (F-ASSAY-E2E, 2026-08-22). A refused row leaves the ranked board; before this
  // it also took its reason with it, so an honest rider learned only that `rejectedCount` moved.
  // The slip is keyed on the tape id — the submitter's own handle, exactly as `?reel=` is — so
  // nothing is added to the ranked board and nothing else becomes readable.
  const slip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=reject-me', undefined, kv);
  equal(slip.status, 200, 'an unranked row still has a slip');
  equal(slip.body.assay, 'rejected', 'the slip names the verdict');
  equal(slip.body.assayReason, 'replay diverged', 'the slip names the reason');
  equal(slip.body.ranked, false, 'and says the row holds no rank');
  const verifiedSlip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=verify-me', undefined, kv);
  equal(verifiedSlip.body.assay, 'verified', 'a verified row reads its own slip too');
  equal(verifiedSlip.body.ranked, true, 'and it stays ranked');
  equal(verifiedSlip.body.assayReason, undefined, 'a verified slip carries no reason');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=no-such-reel', undefined, kv)).status, 404, 'an unknown reel has no slip');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=reject-me&party=solo', undefined, kv)).status, 400, 'the slip keeps the strict param arithmetic');
}

// Guards the NORMALIZATION law (a stored row that carries a tape but no assay stamp reads as
// pending) inside the CURRENT season. Post-roll the county's real legacy rows live in season one
// and are never retro-assayed at all — that archive is proved read-only by checkSeasonRoll below.
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

// THE SEASON ROLL — the four mutation proofs the owner's ruling asks for, in one fixture.
async function checkSeasonRoll(onRequest, queueRoute, verdictRoute) {
  const kv = makeKv();
  // The pre-roll board exactly as the county left it: 17 rows at the key shape they were written
  // with, three of them tapeless.
  const archive = Array.from({ length: 17 }, (_, index) => storedRow(index, index !== 2 && index !== 7 && index !== 11));
  await kv.put(ARCHIVE_KEY, JSON.stringify(archive));
  const archiveBytes = await kv.get(ARCHIVE_KEY);

  // (a) The current season starts clean, with a full archive sitting right beside it.
  const current = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(current.body.board.length, 0, 'current season starts empty beside a full archive');
  equal(current.body.season, 2, 'current season labels itself');
  equal(current.body.assayEra, true, 'current season declares the assay era');

  // (b) The archive door: labeled, read-only, and refusing the pen.
  const first = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&season=1', undefined, kv);
  equal(first.body.season, 1, 'archive board labels its season');
  equal(first.body.assayEra, false, 'archive board declares its pre-assay reality');
  equal(first.body.board.length, 14, 'archive still serves its rows (14 taped of 17)');
  const reel = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=legacy-0&season=1', undefined, kv);
  equal(reel.status, 200, 'archived reels stay on the shelf');
  equal(reel.body.assayEra, false, 'archived reel carries the pre-assay label');
  const closed = await call(onRequest, 'POST', '/api/standings?season=1', post('9'.repeat(32), 42, tape('post-to-history', 42)), kv);
  equal(closed.status, 403, 'POST to an archived season is refused');
  equal(closed.body.error, 'season_closed', 'the refusal names the closed season');
  equal(await kv.get(ARCHIVE_KEY), archiveBytes, 'the refused POST left the archive byte-identical');
  const unknown = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&season=7', undefined, kv);
  equal(unknown.status, 400, 'an unknown season is refused, never silently current');
  const emptyQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=100', undefined, kv, SECRET);
  equal(emptyQueue.body.queue.length, 0, 'archived rows never enter the assay queue');
  equal(await kv.get(ARCHIVE_KEY), archiveBytes, 'reading the archive never rewrites it');

  // The field book reads a season too, so the archive stays reachable through every view the
  // county offers and not only through the board.
  const currentView = await call(onRequest, 'GET', '/api/standings?view=byStack&epoch=epoch-1-frontier', undefined, kv);
  equal(currentView.body.season, 2, 'the field book labels the season it read');
  equal(currentView.body.byStack.length, 0, 'the fresh season\'s field book starts empty');
  const archivedView = await call(onRequest, 'GET', '/api/standings?view=byStack&epoch=epoch-1-frontier&season=1', undefined, kv);
  equal(archivedView.body.assayEra, false, 'the archived field book declares its pre-assay reality');
  equal(archivedView.body.byStack[0].aggregate.standings, 14, 'the archived field book still aggregates its rows');

  // (c) A v2 tape lands pending in the fresh season.
  const v2 = await call(onRequest, 'POST', '/api/standings', post('a'.repeat(32), 30, tapeV2('assayable', 30)), kv);
  equal(v2.body.rank, 1, 'the v2 standing takes the fresh season\'s first rank');
  equal(JSON.parse(await kv.get(KEY)).find((row) => row.tape.id === 'assayable').assay, 'pending', 'v2 POST lands pending');

  // (d) A v1 tape stores, and the LANDED lifecycle is what keeps it off the ranks: the worker
  // cannot verify a tape with no runStart (scripts/assay-worker.mjs:81), so its verdict unranks the
  // row while the row itself survives. The endpoint's tape contract is unchanged.
  const v1 = await call(onRequest, 'POST', '/api/standings', post('b'.repeat(32), 90, tape('legacy-shaped', 90)), kv);
  equal(v1.status, 200, 'the tape contract still accepts a v1 tape, unchanged');
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=100', undefined, kv, SECRET);
  const locator = queue.body.queue.find((row) => row.locator.tapeId === 'legacy-shaped').locator;
  const rejected = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', {
    locator, verdict: 'rejected', replayedHash: 'fnv1a32:00000000', reason: 'legacy tape v1 is unverifiable',
  }, kv, SECRET);
  equal(rejected.status, 200, 'the worker verdict on a v1 tape is accepted');
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'the v1 row holds no rank in the assayed season');
  equal(board.body.board[0].assay, 'pending', 'the assayable v2 row is what the fresh season shows');
  ok(JSON.parse(await kv.get(KEY)).some((row) => row.tape?.id === 'legacy-shaped'), 'the v1 row is stored, never deleted');
  equal(await kv.get(ARCHIVE_KEY), archiveBytes, 'a whole current-season lifecycle never touched season one');
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

// A v2 tape is a v1 tape plus the runStart that makes it replayable from a known state — the whole
// reason the board rolled to a season that admits only these.
function tapeV2(id, waves, eventLogHash = 'fnv1a32:1234abcd') {
  const meta = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    ...tape(id, waves, eventLogHash),
    version: 2,
    runStart: {
      meta,
      research: { version: 1, progress: meta, taken: [], proposalSalt: 0, pinnedTarget: null },
    },
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
