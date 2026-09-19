/**
 * F-HEAT14-6 — THE COUNTY DELETED HONEST STANDINGS AT VERDICT TIME.
 *
 * THE REPORTED SYMPTOM. Heat 14 rode 37 board contracts and secured 31. Twelve of the accepted
 * submissions answered `{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"}` at the door and
 * then `assay_not_found` on every later poll (`artifacts/gauntlet-heat14-e3949bfa/heat14-note.md`
 * §5). Heat 13 saw three of these (F-HEAT13-2), so the note read the drop as scaling with
 * submission rate and named the `assay-queue-index` KV race as the suspect.
 *
 * THAT SUSPECT IS INNOCENT, and the county's own instruments say so:
 *   • the assayer's journal for 2026-09-18 shows it REACHED and VERIFIED nine of the twelve
 *     (e2-incline 00:56:41Z, e4-gusher-county 02:22:33Z, e7-dead-band 02:46:13Z, e7-echo-canyon
 *     03:06:46Z, e9-devils-alley 04:22:00Z, e5-flotilla 05:19:10Z, e5-regatta 05:42:20Z,
 *     e6-half-life-hollow 06:21:56Z, e10-last-claim 07:21:11Z). A row the queue never served
 *     cannot be verified, so the queue served them.
 *   • the live board blob for e2-incline holds exactly two rows today, neither of them heat 14's.
 *
 * THE REAL MECHANISM, and it is a deliberate line of code: `functions/api/standings.ts:368-375`
 * AS IT STOOD BEFORE THIS CURE (landed by `fa8b096f3`, 2026-09-04; on the curing branch the site
 * is :368-395, and the deleted coordinates are recoverable from that commit, not from today's
 * file). When the assayer returns `verified`, the door looks
 * for another VERIFIED row with the same `standingOwnerKey` and, if that incumbent wins
 * `compareScores`, writes the board back as `rows.filter((candidate) => candidate !== row)` — the
 * row it has just verified is DELETED from storage. `compareScores` falls through to `submittedAt`,
 * so an exact tie also deletes the newcomer. The mirror branch deletes the incumbent instead.
 *
 * Two things make that indefensible rather than merely surprising:
 *   1. "one standing per rider" is ALREADY enforced where it is published — `rankedRows` dedupes by
 *      `standingOwnerKey` (`standings.ts` `rankedRows`, the owner `Set` filter after the sort),
 *      landed in the same commit. The write-side
 *      deletion buys no board change at all; it only destroys the losing receipt.
 *   2. `compareScores` compares SCORES and knows nothing about rankability. Heat 14's incumbents
 *      were era-5 rows that `isRankedRow` can never rank, so the county threw away the only row on
 *      the board that could have stood. e2-incline's published board is `[]` for exactly that
 *      reason, with a 200-gold era-5 row and an 88-gold era-5 row still in the blob.
 *
 * THE MEASURED SPLIT, from `receipts-before.json` / `receipts-after.json` in the heat directory:
 * of the 18 boards that gained a standing, 13 lost exactly one retired reel (the incumbent-delete
 * branch); of the 12 that dropped, ALL 12 held their retired count unchanged (the newcomer-delete
 * branch). 18/12 with no exceptions either way — the two arms of one `if`.
 *
 * WHAT THIS GUARD PINS. The verdict path may re-rank a board; it may never shrink it. Every arm
 * below counts the stored rows across a verdict and asks the door for the loser's slip, and the
 * board arm proves the published answer is unchanged — the rider still holds exactly one standing.
 *
 * The last two arms cover the OTHER class, the one the note suspected: a row that is stored and
 * `pending` but missing from `assay-queue-index`. That race is real (it is deliberately reproduced
 * and asserted in `scripts/test-standings.mjs` `checkAssayIndexRace`, which also proves the
 * 15-minute reconcile heals it), and the `storedUnassayed` re-assay mode is how an operator heals
 * it on demand instead of waiting for a sweep.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import engineEra from '../assets/engine-era.json' with { type: 'json' };

const root = fileURLToPath(new URL('..', import.meta.url));
const SECRET = 'assay-standing-drop-secret';
const INDEX_KEY = 'assay-queue-index';
const RIDER = '9'.repeat(32);

let door;
let queueRoute;
let verdictRoute;
let reassayRoute;

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  ({ onRequest: door } = await vite.ssrLoadModule('/functions/api/standings.ts'));
  ({ onRequest: queueRoute } = await vite.ssrLoadModule('/functions/api/standings/assay-queue.ts'));
  ({ onRequest: verdictRoute } = await vite.ssrLoadModule('/functions/api/standings/assay-verdict.ts'));
  ({ onRequest: reassayRoute } = await vite.ssrLoadModule('/functions/api/standings/reassay.ts'));
} finally {
  await vite.close();
}

function makeKv() {
  const values = new Map();
  return {
    values,
    get: async (key) => values.get(key) ?? null,
    put: async (key, value) => { values.set(key, value); },
    list: async ({ prefix = '', cursor = '' } = {}) => ({
      keys: [...values.keys()].filter((key) => key.startsWith(prefix) && key > cursor).sort().map((name) => ({ name })),
      list_complete: true,
    }),
  };
}

async function call(route, method, url, body, kv, secret) {
  const headers = new Headers(body === undefined ? {} : { 'content-type': 'application/json' });
  if (secret !== undefined) headers.set('x-assay-key', secret);
  const response = await route({
    request: new Request(`http://127.0.0.1${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
    env: { TELEMETRY: kv, ...(secret === undefined ? {} : { ASSAY_WORKER_SECRET: secret }) },
  });
  return { status: response.status, body: await response.json() };
}

function tape(id, waves, gold, contractId, eventLogHash) {
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    version: 2, id, createdAt: 1, kept: true, contract: contractId, seed: 'gold-rush', difficulty: 'trail', simVersion: 1,
    meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
    runStart: { meta: progress, research: { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null } },
    inputLog: {
      version: 1, name: id, contractId, seed: 'gold-rush', difficultyPreset: 'trail', stepSeconds: 1 / 30,
      start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
    },
    eventLogHash,
    outcome: { reason: 'secured', secured: true, waves, timeAlive: 360, gold },
  };
}

function post(anonId, waves, gold, reel, contractId = 'the-claim', epochId = 'epoch-1-frontier') {
  const submitted = tape(reel.id, waves, gold, contractId, reel.hash);
  return {
    contractId, epochId,
    score: { secured: true, waves, timeAlive: 360, gold, baseValue: 0 },
    profileName: 'Drop Guard', anonId, difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64),
    inputLogHash: createHash('sha256').update(JSON.stringify(submitted.inputLog)).digest('hex'),
    tape: submitted,
  };
}

function boardKey(epochId, contractId) {
  return `standings:s2:${epochId}:${contractId}`;
}

async function storedRows(kv, epochId = 'epoch-1-frontier', contractId = 'the-claim') {
  return JSON.parse(await kv.get(boardKey(epochId, contractId)) ?? '[]');
}

/** Post a reel, let the assayer pull it off the queue, and return the verdict response. */
async function rideAndVerify(kv, payload, snapshot) {
  const stored = await call(door, 'POST', '/api/standings', payload, kv);
  assert.equal(stored.status, 200, 'the door accepts the submission');
  assert.equal(stored.body.stored, true, 'the door stores the submission');
  const queue = await call(queueRoute, 'GET', '/api/standings/assay-queue?limit=50', undefined, kv, SECRET);
  const entry = queue.body.queue.find((row) => row.locator.tapeId === payload.tape.id);
  assert.ok(entry, `the assay queue serves ${payload.tape.id}`);
  const verdict = await call(verdictRoute, 'POST', '/api/standings/assay-verdict', {
    locator: entry.locator, verdict: 'verified', replayedHash: payload.tape.eventLogHash, securedSnapshot: snapshot,
  }, kv, SECRET);
  assert.equal(verdict.status, 200, `the county records a verdict for ${payload.tape.id}`);
  return verdict;
}

function slipUrl(payload) {
  return `/api/standings?contract=${payload.contractId}&epoch=${payload.epochId}&season=2&verdict=${payload.tape.id}`;
}

test('a verified standing the rider has already beaten is kept, not deleted', async () => {
  const kv = makeKv();
  const best = post(RIDER, 12, 200, { id: 'reel-best', hash: 'fnv1a32:aaaa0001' });
  const worse = post(RIDER, 12, 129, { id: 'reel-worse', hash: 'fnv1a32:aaaa0002' });

  await rideAndVerify(kv, best, { waves: 12, timeAlive: 360, gold: 200 });
  const beforeCount = (await storedRows(kv)).length;
  assert.equal(beforeCount, 1, 'the board holds the first standing');

  await rideAndVerify(kv, worse, { waves: 12, timeAlive: 360, gold: 129 });
  const after = await storedRows(kv);
  assert.equal(after.length, 2, 'a verdict may re-rank a board; it may never shrink it');
  assert.deepEqual(
    after.map((row) => [row.tape.id, row.assay]).sort(),
    [['reel-best', 'verified'], ['reel-worse', 'verified']],
    'both honest receipts survive the verdict that ranked them',
  );

  const slip = await call(door, 'GET', slipUrl(worse), undefined, kv);
  assert.equal(slip.status, 200, 'the beaten reel still has an assay slip (it answered assay_not_found before the cure)');
  assert.equal(slip.body.assay, 'verified', 'the beaten reel reads as verified, because it was');
  // `ranked` is `isRankedRow` — "this row is ELIGIBLE to rank" (current era, not rejected,
  // unassayable or retired) — and not "this row is published". The distinction predates this cure:
  // a pending row of the same owner already answered `true` while the board showed another. It is
  // pinned here so the looseness is a recorded fact rather than a surprise (F-HEAT14-6b, reported,
  // not changed: narrowing the field would change a published meaning the heat rigs already read).
  assert.equal(slip.body.ranked, true, 'the beaten reel is rank-eligible; the owner dedupe decides what is published');
});

test('the published board still shows exactly one standing per rider', async () => {
  const kv = makeKv();
  const best = post(RIDER, 12, 200, { id: 'board-best', hash: 'fnv1a32:bbbb0001' });
  const worse = post(RIDER, 12, 129, { id: 'board-worse', hash: 'fnv1a32:bbbb0002' });
  await rideAndVerify(kv, best, { waves: 12, timeAlive: 360, gold: 200 });
  await rideAndVerify(kv, worse, { waves: 12, timeAlive: 360, gold: 129 });

  const board = await call(door, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&season=2', undefined, kv);
  assert.equal(board.status, 200, 'the board answers');
  assert.equal(board.body.board.length, 1, 'one rider, one published standing — unchanged by keeping the loser');
  assert.equal(board.body.board[0].reel.id, 'board-best', 'and it is the best reel the rider holds');
  assert.equal(board.body.rejectedCount, 0, 'a kept loser is not a rejection');
});

test('an identical score does not delete the newcomer either', async () => {
  const kv = makeKv();
  const first = post(RIDER, 12, 200, { id: 'tie-first', hash: 'fnv1a32:cccc0001' });
  const second = post(RIDER, 12, 200, { id: 'tie-second', hash: 'fnv1a32:cccc0002' });
  await rideAndVerify(kv, first, { waves: 12, timeAlive: 360, gold: 200 });
  await rideAndVerify(kv, second, { waves: 12, timeAlive: 360, gold: 200 });
  const after = await storedRows(kv);
  assert.equal(after.length, 2, 'compareScores falls through to submittedAt, so a tie used to delete the newcomer');
  const slip = await call(door, 'GET', slipUrl(second), undefined, kv);
  assert.equal(slip.status, 200, 'the tied newcomer keeps its slip');
});

test('an incumbent that can never rank cannot delete a current-era standing', async () => {
  // The heat-14 shape exactly: e2-incline's incumbent was the SAME rider's era-5 reel, stored
  // `verified` and unrankable under `isRankedRow`, scoring 200 gold against the new row's 129.
  const kv = makeKv();
  const staleTape = tape('era-five-reel', 12, 200, 'the-claim', 'fnv1a32:dddd0001');
  staleTape.meta = { ...staleTape.meta, era: engineEra.era - 1 };
  await kv.put(boardKey('epoch-1-frontier', 'the-claim'), JSON.stringify([{
    secured: true, waves: 12, timeAlive: 360, gold: 200, baseValue: 0,
    profileName: 'Drop Guard', anonId: RIDER, difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64), inputLogHash: createHash('sha256').update(JSON.stringify(staleTape.inputLog)).digest('hex'),
    submittedAt: 1, tape: staleTape, assay: 'verified', assayedAt: 2, assayHash: 'fnv1a32:dddd0001',
  }]));

  const current = post(RIDER, 12, 129, { id: 'era-six-reel', hash: 'fnv1a32:dddd0002' });
  await rideAndVerify(kv, current, { waves: 12, timeAlive: 360, gold: 129 });

  const after = await storedRows(kv);
  assert.equal(after.length, 2, 'the era-5 receipt and the era-6 standing both survive');
  const board = await call(door, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&season=2', undefined, kv);
  assert.equal(board.body.board.length, 1, 'the county publishes the standing it can rank');
  assert.equal(board.body.board[0].reel.id, 'era-six-reel', 'and it is the current-era reel, not the retired one it "lost" to');
  assert.equal(board.body.retiredCount, 1, 'the era-5 receipt is still counted, not erased');
});

test('a stored row missing from the assay index is re-queueable without losing its submittedAt', async () => {
  const kv = makeKv();
  const payload = post(RIDER, 12, 200, { id: 'orphan-reel', hash: 'fnv1a32:eeee0001' });
  assert.equal((await call(door, 'POST', '/api/standings', payload, kv)).body.stored, true, 'the row is stored');
  const submittedAt = (await storedRows(kv))[0].submittedAt;

  // The measured index-race outcome: the row is stored and pending, the index entry is gone, and
  // the envelope is fresh enough that no sweep will rebuild it for another fifteen minutes.
  await kv.put(INDEX_KEY, JSON.stringify({ version: 1, sweptAt: Date.now(), locators: [] }));
  const starved = await call(queueRoute, 'GET', '/api/standings/assay-queue?limit=50', undefined, kv, SECRET);
  assert.equal(starved.body.queue.length, 0, 'a fresh empty index starves the assayer of a stored, pending row');

  const recovered = await call(reassayRoute, 'POST', '/api/standings/reassay', {
    epochId: 'epoch-1-frontier', contractId: 'the-claim', reason: 'F-HEAT14-6 recovery', storedUnassayed: true,
  }, kv, SECRET);
  assert.equal(recovered.status, 200, 'the re-assay verb accepts a stored-unassayed sweep');
  assert.equal(recovered.body.requeued, 1, 'and reports the row it restored to the index');

  const queue = await call(queueRoute, 'GET', '/api/standings/assay-queue?limit=50', undefined, kv, SECRET);
  assert.deepEqual(queue.body.queue.map((row) => row.locator.tapeId), ['orphan-reel'], 'the assayer can see the row again');
  const row = (await storedRows(kv))[0];
  assert.equal(row.submittedAt, submittedAt, 'the recovered row keeps the day it earned');
  assert.equal(row.assay, 'pending', 'and it is still simply pending, with no lineage mark invented for it');
  assert.equal(row.lineage, undefined, 'a stored-unassayed row was never re-queued by a composition change');
});

test('the stored-unassayed sweep restores every row a concurrent burst cost the index', async () => {
  // Six accepted POSTs inside one propagation window, the burst size heat 14 actually rode. The
  // index is one KV key read-modify-written per POST, so last-writer-wins loses entries — the
  // race `checkAssayIndexRace` pins and the 15-minute reconcile heals. This arm proves an operator
  // does not have to wait for that sweep, and that the burst never costs a stored ROW.
  const kv = makeKv();
  const boards = [
    ['epoch-1-frontier', 'the-claim'], ['epoch-2-steamworks', 'e2-hill-mine'], ['epoch-2-steamworks', 'e2-incline'],
    ['epoch-3-voltage', 'e3-blackout-ridge'], ['epoch-3-voltage', 'e3-fairground'], ['epoch-4-motor', 'e4-boneyard'],
  ];
  await kv.put(INDEX_KEY, JSON.stringify({ version: 1, sweptAt: Date.now(), locators: [] }));
  const snapshot = await kv.get(INDEX_KEY);
  let served = 0;
  const raced = {
    ...kv,
    // Every POST in the burst reads the same pre-burst index value, which is exactly what an
    // eventually-consistent store serves inside its propagation window.
    get: async (key) => (key === INDEX_KEY && served++ < boards.length ? snapshot : kv.get(key)),
  };
  const payloads = boards.map(([epochId, contractId], index) =>
    post(RIDER, 12, 200, { id: `burst-${index}`, hash: `fnv1a32:ffff000${index}` }, contractId, epochId));
  const responses = await Promise.all(payloads.map((payload) => call(door, 'POST', '/api/standings', payload, raced)));
  assert.deepEqual(responses.map((response) => response.body.stored), Array(boards.length).fill(true), 'every submission in the burst is stored');

  const lost = JSON.parse(await kv.get(INDEX_KEY)).locators.length;
  assert.ok(lost < boards.length, `the one-key index loses entries under a burst (${lost} of ${boards.length} survived)`);
  for (const [index, [epochId, contractId]] of boards.entries()) {
    const rows = await storedRows(kv, epochId, contractId);
    assert.deepEqual(rows.map((row) => row.tape.id), [`burst-${index}`], `burst-${index} is stored on its own board regardless`);
  }

  for (const [epochId, contractId] of boards) {
    const swept = await call(reassayRoute, 'POST', '/api/standings/reassay', {
      epochId, contractId, reason: 'F-HEAT14-6 burst recovery', storedUnassayed: true,
    }, kv, SECRET);
    assert.equal(swept.status, 200, `${contractId} accepts the sweep`);
  }
  const queue = await call(queueRoute, 'GET', '/api/standings/assay-queue?limit=50', undefined, kv, SECRET);
  assert.deepEqual(
    queue.body.queue.map((row) => row.locator.tapeId).sort(),
    boards.map((_, index) => `burst-${index}`).sort(),
    'the sweep restores all six, with no wait for the fifteen-minute reconcile',
  );
});
