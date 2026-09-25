import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'vite';
import { createLedgerServer } from '../server/ledger/serve.mjs';
import { SqliteStorage } from '../server/ledger/storage.mjs';
import engineEra from '../assets/engine-era.json' with { type: 'json' };
import rotationSeeds from '../assets/rotations/rotation-seeds.json' with { type: 'json' };

const SECRET = 'assay-worker-test-secret';
// The season roll (owner 2026-08-15): the county writes in the current season's key shape, and the
// pre-roll board keeps the shape it was written with, forever, read-only.
const KEY = 'standings:s2:epoch-1-frontier:the-claim';
const ARCHIVE_KEY = 'standings:epoch-1-frontier:the-claim';
const ASSAY_INDEX_KEY = 'assay-queue-index';
let checks = 0;
let backend = 'kv';
let sqliteId = 0;
let httpRoutes;
const sqliteRoot = await mkdtemp(path.join(tmpdir(), 'gold-rush-ledger-standings-'));
const sqliteStores = [];
const httpServers = [];
const serversByStorage = new WeakMap();

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { MAX_JSON_BYTES, compareScores, onRequest, validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
  const { RunTapeRecorder, submittedRunTape, validateRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  const { CONTRACT_BUNDLES, MAX_PLAYBOOK_INTENTS, MAX_PLAYBOOK_TICKS, maxRunTapeTicksForContract, parsePlaybookText, runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  // The browser's own recorder, playbook shelf and intent seam: the door is judged against a reel a browser writes.
  const { PlaybookRecorderSession } = await vite.ssrLoadModule('/src/playbook/PlaybookSession.ts');
  const { intentsFromLockstepInput, lockstepInputFromIntents, normalizeLockstepAction } = await vite.ssrLoadModule('/src/mp/LockstepClient.ts');
  const { validateStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
  const recorderKit = { RunTapeRecorder, PlaybookRecorderSession, parsePlaybookText, intentsFromLockstepInput, lockstepInputFromIntents, submittedRunTape, normalizeLockstepAction, validateStandingOrders };
  const { onRequest: onRequestAssayQueue } = await vite.ssrLoadModule('/functions/api/standings/assay-queue.ts');
  const { onRequest: onRequestAssayVerdict } = await vite.ssrLoadModule('/functions/api/standings/assay-verdict.ts');
  const { onRequest: onRequestReassay } = await vite.ssrLoadModule('/functions/api/standings/reassay.ts');
  const { onRequest: onRequestRefusals } = await vite.ssrLoadModule('/functions/api/refusals.ts');
  httpRoutes = {
    '/api/standings': onRequest,
    '/api/standings/assay-queue': onRequestAssayQueue,
    '/api/standings/assay-verdict': onRequestAssayVerdict,
    '/api/standings/reassay': onRequestReassay,
    '/api/refusals': onRequestRefusals,
  };
  for (backend of ['kv', 'sqlite']) {
    checks = 0;
    await checkDoorEnvelopes(onRequest, validateTape, validateRunTape, submittedRunTape, maxRunTapeTicksForContract, runTapeEnvelopeForContract, CONTRACT_BUNDLES, MAX_PLAYBOOK_TICKS, MAX_PLAYBOOK_INTENTS, MAX_JSON_BYTES);
    checkTapeBuildMetadata(validateTape);
    await checkRecorderReel(onRequest, validateTape, validateRunTape, runTapeEnvelopeForContract, recorderKit);
    await checkRecorderVerbs(onRequest, validateTape, validateRunTape, recorderKit);
    await checkEngineHashReel(onRequest);
    await checkReplayableBoard(onRequest);
    await checkLineageReassay(onRequest, onRequestAssayQueue, onRequestAssayVerdict, onRequestReassay);
    await checkOperatorProbes(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkAssayIndexRace(onRequest, onRequestAssayQueue);
    await checkPosts(onRequest, onRequestAssayQueue, onRequestAssayVerdict, MAX_JSON_BYTES);
    await checkPreserveRanking(onRequest, compareScores);
    await checkMechanicRanking(onRequest, compareScores, onRequestAssayQueue, onRequestAssayVerdict, onRequestReassay);
    await checkBankedBaronTapes(onRequest, onRequestAssayQueue, onRequestAssayVerdict, validateTape, validateRunTape);
    await checkBankedHeat11Tapes(onRequest, validateTape, validateRunTape);
    await checkVerdicts(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkScoreMismatch(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkDuplicateTapeIds(onRequest, onRequestAssayVerdict);
    await checkVerdictSlipExactMatch(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkAssayIndex(onRequest, onRequestAssayQueue);
    await checkUnrankedBound(onRequest);
    await checkRetroAssay(onRequest, onRequestAssayQueue);
    await checkSeasonRoll(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkRotationBoard(onRequest);
    await checkAssayStrips(onRequest);
    await checkRefusals(onRequest, onRequestRefusals);
    console.log(`standings assay ${backend} checks passed (${checks})`);
  }
} finally {
  await Promise.all(httpServers.map((server) => new Promise((resolve) => server.close(resolve))));
  sqliteStores.forEach((store) => store.close());
  await rm(sqliteRoot, { recursive: true, force: true });
  await vite.close();
}

async function checkRefusals(onRequest, onRequestRefusals) {
  const kv = makeKv();
  const rider = '7'.repeat(32);
  const unsecured = post(rider, 4);
  unsecured.score.secured = false;
  equal((await call(onRequest, 'POST', '/api/standings', unsecured, kv)).body.error, 'unsecured', 'an unsecured submission gets its own failure reason');
  const malformed = post(rider, 4);
  malformed.seed = '';
  equal((await call(onRequest, 'POST', '/api/standings', malformed, kv)).body.error, 'bad_payload', 'a malformed submission is refused');

  const byRider = await call(onRequestRefusals, 'GET', `/api/refusals?rider=${rider}`, undefined, kv);
  equal(byRider.status, 200, 'a rider can read its refusal taxonomy');
  equal(byRider.body.counts, { bad_payload: 1, unsecured: 1 }, 'refusal counts are grouped by reason');
  equal(byRider.body.recent.map(({ reason, contractId }) => ({ reason, contractId })).sort((a, b) => a.reason.localeCompare(b.reason)), [
    { reason: 'bad_payload', contractId: 'the-claim' },
    { reason: 'unsecured', contractId: 'the-claim' },
  ], 'recent refusals return reason and contract only');
  equal(Object.keys(byRider.body.recent[0]).sort(), ['contractId', 'reason', 'refusedAt'], 'the endpoint does not echo rider identity');
  equal(Number.isSafeInteger(byRider.body.recent[0].refusedAt), true, 'recent refusals carry timestamps');
  const byProfile = await call(onRequestRefusals, 'GET', '/api/refusals?profile=Assay%20Test', undefined, kv);
  equal(byProfile.body.counts, byRider.body.counts, 'public profile lookup reads the same taxonomy');
  console.log(`refusals ${backend} sample ${JSON.stringify(byRider.body)}`);
}

async function checkPreserveRanking(onRequest, compareScores) {
  const contractId = 'e10-last-claim';
  const epochId = 'epoch-10-deepsky';
  const key = `standings:s2:${epochId}:${contractId}`;
  const fixtures = [
    ['eight waves', 8, 0.2, 120, 900, 6],
    ['seven waves, more hp', 7, 0.8, 120, 10, 5],
    ['seven waves, less hp', 7, 0.4, 120, 1_000, 4],
    ['six waves, longer time', 6, 0.5, 130, 1_000, 4],
    ['six waves, low gold', 6, 0.5, 120, 1, 2],
    ['six waves, high gold', 6, 0.5, 120, 1_000, 3],
  ].map(([profileName, preserveWavesAlive, preserveHpFraction, timeAlive, gold, submittedAt], index) => {
    const row = storedRowFor(index + 1, contractId, epochId);
    row.profileName = profileName;
    row.waves = row.tape.outcome.waves = preserveWavesAlive;
    row.timeAlive = row.tape.outcome.timeAlive = timeAlive;
    row.gold = row.tape.outcome.gold = gold;
    row.baseValue = 1_000 - index;
    row.preserveWavesAlive = preserveWavesAlive;
    row.preserveHpFraction = preserveHpFraction;
    row.submittedAt = submittedAt;
    return row;
  });
  const old = storedRowFor(9, contractId, epochId);
  old.profileName = 'old row, no preserve';
  old.submittedAt = 1;
  const kv = makeKv();
  await kv.put(key, JSON.stringify([...fixtures].reverse().concat(old)));
  const board = await call(onRequest, 'GET', `/api/standings?contract=${contractId}&epoch=${epochId}`, undefined, kv);
  equal(board.body.board.map((row) => row.profileName), [
    'eight waves',
    'seven waves, more hp',
    'seven waves, less hp',
    'six waves, longer time',
    'six waves, low gold',
    'six waves, high gold',
    'old row, no preserve',
  ], 'preserve rows rank by waves, hp, then time/submission; gold never reorders and old rows sort last');
  equal(board.body.board[0].preserveWavesAlive, 8, 'preserve score fields survive stored-row validation and reach the board');

  const common = { waves: 1, timeAlive: 1, gold: 1, baseValue: 1, preserveWavesAlive: 99, preserveHpFraction: 1 };
  equal(compareScores({ ...common, secured: true }, { ...common, secured: false }, contractId) < 0, true, 'secured preserve row beats unsecured');
  equal([
    { ...common, secured: true, profileName: 'gold wins', baseValue: 1, gold: 2, preserveWavesAlive: 0 },
    { ...common, secured: true, profileName: 'base value is ignored', baseValue: 2, gold: 1, preserveWavesAlive: 100 },
  ].sort((a, b) => compareScores(a, b, 'the-claim')).map((row) => row.profileName), [
    'gold wins',
    'base value is ignored',
  ], 'mixed non-preserve board ranks gold and ignores base value');

  const baron = [
    { ...common, secured: true, profileName: 'codex', waves: 22, timeAlive: 597, gold: 319, submittedAt: 1 },
    { ...common, secured: true, profileName: 'Claude Fable 5', waves: 22, timeAlive: 597, gold: 319, submittedAt: 2 },
    { ...common, secured: true, profileName: 'Claude Opus 5', waves: 22, timeAlive: 594.9, gold: 394, submittedAt: 3 },
  ];
  equal(baron.sort((a, b) => compareScores(a, b, 'e1-baron')).map((row) => row.profileName), [
    'Claude Opus 5',
    'codex',
    'Claude Fable 5',
  ], 'live-shaped Baron fixture ranks Opus first by gold, then breaks the exact codex/Fable tie by earliest submission');

  equal([
    { ...common, secured: false, profileName: 'longer survival', timeAlive: 20 },
    { ...common, secured: false, profileName: 'shorter survival', timeAlive: 10 },
  ].sort((a, b) => compareScores(a, b, 'the-claim')).map((row) => row.profileName), [
    'longer survival',
    'shorter survival',
  ], 'unsecured rows keep longer survival first');

  const invalid = post('c'.repeat(32), 8, undefined, contractId, epochId);
  invalid.score.preserveWavesAlive = 8;
  invalid.score.preserveHpFraction = 1.1;
  equal((await call(onRequest, 'POST', '/api/standings', invalid, makeKv())).status, 400, 'preserve hp fraction is bounded at the score boundary');
}

/**
 * THE MECHANIC BEATS THE WALK (F-HEAT15-4, owner ruling 2026-09-22, verbatim "F-HEAT15-4: yes" on
 * option (a): "a reel that finished the race supersedes one that did not").
 *
 * THE DEFECT THIS MEASURES IS A REAL BOARD, not a hypothetical: heat 15 rode `e5-regatta` three
 * times by SAILING the Claim-Boat, two reels were assayed and VERIFIED, and rank 1 stayed the
 * heat-14 row won by walking the hero through the water, because ride 2 tied it on waves, gold and
 * time and `compareScores` fell through to `submittedAt` (`reviews/heat-15-regatta.md`).
 *
 * Six checks, in the master's order: (a) the finish outranks a row with MORE waves and no finish,
 * (b) two finished rows fall through the old ladder unchanged, (c) every other contract compares
 * byte-identically with and without the field, (d) only a surviving `verified` stores it, (e) a
 * malformed one is refused at the door, (f) a rider cannot declare it.
 */
async function checkMechanicRanking(onRequest, compareScores, queueRoute, verdictRoute, reassayRoute) {
  const contractId = 'e5-regatta';
  const epochId = 'epoch-5-deepwater';
  const key = `standings:s2:${epochId}:${contractId}`;
  const FINISHED = { id: 'regatta-race', complete: true };
  const verifiedRow = (index, profileName, waves, gold, timeAlive, submittedAt, mechanic) => {
    const row = storedRowFor(index, contractId, epochId);
    row.profileName = profileName;
    row.waves = row.tape.outcome.waves = waves;
    row.gold = row.tape.outcome.gold = gold;
    row.timeAlive = row.tape.outcome.timeAlive = timeAlive;
    row.submittedAt = submittedAt;
    row.assay = 'verified';
    row.assayedAt = submittedAt + 1;
    row.assayHash = 'fnv1a32:1234abcd';
    if (mechanic) row.mechanic = mechanic;
    return row;
  };

  // (a) THE RULING ITSELF, and deliberately harder than the live case: the walked row is AHEAD on
  // waves, was submitted first, and still loses to the reel that finished the race.
  const kv = makeKv();
  const walked = verifiedRow(1, 'walked the water', 14, 400, 250, 1_000);
  const sailed = verifiedRow(2, 'sailed the course', 12, 200, 272, 2_000, FINISHED);
  await kv.put(key, JSON.stringify([walked, sailed]));
  const board = await call(onRequest, 'GET', `/api/standings?contract=${contractId}&epoch=${epochId}`, undefined, kv);
  equal(board.status, 200, 'the Regatta board reads');
  equal(board.body.board.map((row) => row.profileName), ['sailed the course', 'walked the water'],
    'a finished race outranks a row with more waves, more gold and an earlier date');
  equal(board.body.board[0].mechanic, FINISHED, 'the board publishes the mechanic it ranked on');
  equal(board.body.board[1].mechanic, undefined, 'a row the county never verified under the rule carries none');

  // (b) TWO FINISHED ROWS FALL THROUGH THE OLD LADDER, unchanged: waves, then gold, then time
  // (faster first for a secured row), then the earlier submission.
  const finished = { secured: true, baseValue: 1, mechanic: FINISHED };
  equal([
    { ...finished, profileName: 'fewer waves', waves: 11, gold: 900, timeAlive: 100, submittedAt: 1 },
    { ...finished, profileName: 'more waves', waves: 12, gold: 1, timeAlive: 300, submittedAt: 9 },
  ].sort((a, b) => compareScores(a, b, contractId)).map((row) => row.profileName), ['more waves', 'fewer waves'],
    'two finished rows still rank on waves first');
  equal([
    { ...finished, profileName: 'less gold', waves: 12, gold: 100, timeAlive: 100, submittedAt: 1 },
    { ...finished, profileName: 'more gold', waves: 12, gold: 200, timeAlive: 300, submittedAt: 9 },
  ].sort((a, b) => compareScores(a, b, contractId)).map((row) => row.profileName), ['more gold', 'less gold'],
    'then on gold');
  equal([
    { ...finished, profileName: 'slower', waves: 12, gold: 200, timeAlive: 300, submittedAt: 1 },
    { ...finished, profileName: 'faster', waves: 12, gold: 200, timeAlive: 272, submittedAt: 9 },
  ].sort((a, b) => compareScores(a, b, contractId)).map((row) => row.profileName), ['faster', 'slower'],
    'then on time, faster securing first');
  equal([
    { ...finished, profileName: 'later', waves: 12, gold: 200, timeAlive: 272, submittedAt: 9 },
    { ...finished, profileName: 'earlier', waves: 12, gold: 200, timeAlive: 272, submittedAt: 1 },
  ].sort((a, b) => compareScores(a, b, contractId)).map((row) => row.profileName), ['earlier', 'later'],
    'and an exact tie between two finished rows still goes to the earlier submission');

  // (c) EVERY OTHER CONTRACT IS BYTE-IDENTICAL with and without the field. The comparator's return
  // VALUE is compared, not just the order, so a clause that merely happened to agree would fail.
  const pairs = [
    [{ secured: true, waves: 12, gold: 200, timeAlive: 272, baseValue: 1, submittedAt: 1 }, { secured: true, waves: 14, gold: 100, timeAlive: 250, baseValue: 1, submittedAt: 2 }],
    [{ secured: true, waves: 12, gold: 200, timeAlive: 272, baseValue: 1, submittedAt: 1 }, { secured: true, waves: 12, gold: 200, timeAlive: 272, baseValue: 1, submittedAt: 2 }],
    [{ secured: false, waves: 3, gold: 0, timeAlive: 40, baseValue: 1, submittedAt: 1 }, { secured: true, waves: 1, gold: 0, timeAlive: 10, baseValue: 1, submittedAt: 2 }],
  ];
  for (const other of ['the-claim', 'e1-baron', 'e10-last-claim', undefined]) {
    for (const [left, right] of pairs) {
      equal(compareScores({ ...left, mechanic: FINISHED }, right, other), compareScores(left, right, other),
        `${other ?? 'no contract'} ranks identically with the field present on the left`);
      equal(compareScores(left, { ...right, mechanic: FINISHED }, other), compareScores(left, right, other),
        `${other ?? 'no contract'} ranks identically with the field present on the right`);
    }
  }

  // (d) ONLY A SURVIVING `verified` STORES IT — and this is also the re-assay evidence: a standing
  // that was verified before the rule existed GAINS the flag when the lineage sweep re-queues it
  // through the same worker path, and LOSES it again the moment a replay stops agreeing.
  const live = makeKv();
  const submission = post('9'.repeat(32), 12, tape('regatta-reel', 12, 'fnv1a32:1234abcd', contractId), contractId, epochId);
  equal((await call(onRequest, 'POST', '/api/standings', submission, live)).status, 200, 'a Regatta reel is accepted');
  const queued = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=5', undefined, live, SECRET);
  const locator = queued.body.queue.find((row) => row.locator.tapeId === 'regatta-reel').locator;
  const mechanicVerdict = verdict(locator, 'verified', undefined, 'fnv1a32:1234abcd', { waves: 12, timeAlive: 120, gold: 40 });
  mechanicVerdict.mechanic = FINISHED;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', mechanicVerdict, live, SECRET)).status, 200, 'a verified verdict carrying a mechanic is accepted');
  equal(JSON.parse(await live.get(key))[0].mechanic, FINISHED, 'a verified Regatta row stores the mechanic');

  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { epochId, contractId, reason: 'composition moved' }, live, SECRET)).body.requeued, 1, 'the sweep re-queues the verified row');
  const requeued = JSON.parse(await live.get(key))[0];
  equal(requeued.assay, 'pending', 're-queued row is pending again');
  equal(requeued.mechanic, undefined, 'and gives the flag back with the snapshot, to be re-earned by the replay');
  const second = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=5', undefined, live, SECRET);
  const reLocator = second.body.queue.find((row) => row.locator.tapeId === 'regatta-reel').locator;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(reLocator, 'rejected', 'replay diverged', 'fnv1a32:1234abcd'), live, SECRET)).status, 200, 'the re-assay may reject');
  equal(JSON.parse(await live.get(key))[0].mechanic, undefined, 'a rejected verdict stores no mechanic');

  // (e) A MALFORMED MECHANIC IS REFUSED exactly as a malformed securedSnapshot is, and it may
  // never ride a verdict that is not a verification.
  const refused = makeKv();
  await call(onRequest, 'POST', '/api/standings', post('a'.repeat(32), 12, tape('refuse-me', 12, 'fnv1a32:1234abcd', contractId), contractId, epochId), refused);
  const refusedQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=5', undefined, refused, SECRET);
  const refusedLocator = refusedQueue.body.queue.find((row) => row.locator.tapeId === 'refuse-me').locator;
  for (const bad of [{ id: '', complete: true }, { id: 'regatta-race' }, { id: 'regatta-race', complete: 'yes' }, { id: 'regatta-race', complete: true, extra: 1 }, 'regatta-race', null, { id: 'x'.repeat(65), complete: true }]) {
    const payload = verdict(refusedLocator, 'verified', undefined, 'fnv1a32:1234abcd', { waves: 12, timeAlive: 120, gold: 40 });
    payload.mechanic = bad;
    equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', payload, refused, SECRET)).status, 400, `malformed mechanic refused: ${JSON.stringify(bad)}`);
  }
  const onRejection = verdict(refusedLocator, 'rejected', 'replay diverged', 'fnv1a32:1234abcd');
  onRejection.mechanic = FINISHED;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', onRejection, refused, SECRET)).status, 400, 'a rejected verdict may not carry a mechanic at all');
  equal(JSON.parse(await refused.get(key))[0].assay, 'pending', 'and none of those refusals moved the row');

  // (f) A RIDER CANNOT DECLARE IT. Both shapes are refused before storage: on the payload
  // (`POST_KEYS`) and inside the score (`SCORE_KEYS`, unchanged by this ruling).
  const rider = makeKv();
  const claimed = post('d'.repeat(32), 12, tape('rider-claim', 12, 'fnv1a32:1234abcd', contractId), contractId, epochId);
  claimed.mechanic = FINISHED;
  equal((await call(onRequest, 'POST', '/api/standings', claimed, rider)).status, 400, 'a POST carrying a mechanic is refused');
  const inScore = post('e'.repeat(32), 12, tape('rider-score', 12, 'fnv1a32:1234abcd', contractId), contractId, epochId);
  inScore.score.mechanic = FINISHED;
  equal((await call(onRequest, 'POST', '/api/standings', inScore, rider)).status, 400, 'a mechanic inside the score is refused');
  ok(!(await rider.get(key)), 'and neither refusal wrote a board');
}

async function checkAssayStrips(onRequest) {
  const kv = makeKv();
  const verified = storedRowFor(10, 'the-claim', 'epoch-1-frontier');
  verified.profileName = 'Verified Mind';
  verified.stack = { declaredBy: 'self', model: 'verified-mind', harness: 'test-rig', harnessVersion: '1', calls: 2 };
  verified.assay = 'verified';
  verified.assayedAt = 1_787_000_001_000;
  verified.assayHash = 'fnv1a32:1234abcd';
  verified.submittedAt = 1_787_000_000_000;
  verified.seed = 'e1-the-claim-01';
  verified.tape.seed = verified.seed;
  verified.tape.inputLog.seed = verified.seed;
  verified.tape.inputLog.durationTicks = 10;
  verified.tape.inputLog.entries = Array.from({ length: 10 }, (_, index) => ({ t: index, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders: [] }] }));
  verified.inputLogHash = createHash('sha256').update(JSON.stringify(verified.tape.inputLog)).digest('hex');
  const pending = structuredClone(verified);
  pending.anonId = 'b'.repeat(32);
  pending.profileName = 'Pending Mind';
  pending.stack.model = 'pending-mind';
  pending.assay = 'pending';
  delete pending.assayedAt;
  delete pending.assayHash;
  pending.inputLogHash = 'f'.repeat(64);
  await kv.put(KEY, JSON.stringify([verified, pending]));

  const fieldBook = await call(onRequest, 'GET', '/api/standings?view=byStack&epoch=epoch-1-frontier', undefined, kv);
  equal(fieldBook.status, 200, 'field book assay read succeeds');
  const verifiedCell = fieldBook.body.byStack.find((row) => row.model === 'verified-mind').contracts[0];
  equal(verifiedCell.assayStrip.era, { id: '89e97e293', label: 'Same-Game era' }, 'verified row carries its era');
  equal(verifiedCell.assayStrip.outcome.waves, verified.waves, 'Outcome reads the verified score');
  equal(verifiedCell.assayStrip.economy, { status: 'measured', decisions: 10, frontierDecisions: 10, efficiency: 1 }, 'Economy is frontier-anchored');
  equal(verifiedCell.assayStrip.cost, { orders: null, calls: 2, tokensIn: null, tokensOut: null, durationS: verified.timeAlive }, 'Cost reads duration and declarations without inventing tape counts or tokens');
  equal(fieldBook.body.byStack.find((row) => row.model === 'pending-mind').contracts[0].assayStrip, undefined, 'unverified row has no assay strip');
}

function checkTapeBuildMetadata(validateTape) {
  const legacyV2 = tapeV2('without-build', 1);
  const stampedV2 = { ...tapeV2('with-build', 1), meta: { buildId: 'abcdef12', engineHash: 'a'.repeat(64) } };
  const badEngineHash = { ...tapeV2('bad-engine-hash', 1), meta: { buildId: 'abcdef12', engineHash: 'nope' } };
  equal(validateTape(legacyV2, 'the-claim', 'gold-rush', 'trail')?.meta, undefined, 'v2 tapes without build metadata remain valid');
  equal(validateTape(stampedV2, 'the-claim', 'gold-rush', 'trail')?.meta, stampedV2.meta, 'v2 engine metadata is accepted and preserved');
  equal(validateTape(badEngineHash, 'the-claim', 'gold-rush', 'trail'), null, 'malformed engine metadata is rejected');
}

// F-LSR1-0 (door-tape-grammar-1, 2026-09-25). The browser recorder writes `inputLog.playbookUses` on
// EVERY reel since 15dc51b89 (2026-09-05) and `inputLog.motorActions` once a motor was driven since
// 5823eaad6 (2026-09-04); the door's grammar knew neither key, so it refused every browser standing
// that carried a reel as `bad_payload`. These rows build the reel with the REAL recorder, the way
// Game.ts does at the standing, never with a hand-typed fixture, so the door is judged against what a
// browser actually sends.
async function checkRecorderReel(onRequest, validateTape, validateRunTape, runTapeEnvelopeForContract, kit) {
  const before = checks;
  const kv = makeKv();
  const full = recorderReel(kit, '1dd7'.repeat(8), { playbook: true, motor: true });
  const plain = recorderReel(kit, '0dd7'.repeat(8), { playbook: false, motor: false });
  equal([full.runTape.inputLog.playbookUses.length, full.runTape.inputLog.motorActions?.length], [1, 2],
    'the full reel carries one recorded playbook use and two motor actions');
  equal([plain.runTape.inputLog.playbookUses, Object.hasOwn(plain.runTape.inputLog, 'motorActions')], [[], false],
    'the plain reel carries the empty playbookUses list every browser reel carries, and no motor actions');
  ok(full.body.tape && plain.body.tape, 'both reels fit the byte envelope, so both bodies carry their tape (submittedRunTape)');
  const answers = [];
  for (const { body } of [full, plain]) answers.push(await call(onRequest, 'POST', '/api/standings', body, kv));
  equal(answers.map(({ status, body }) => [status, body.stored ?? body.error]), [[200, true], [200, true]],
    `the door accepts the recorder's reels (with a playbook use and motor actions, and plain): ${JSON.stringify(answers.map(({ body }) => body))}`);
  const stored = JSON.parse(await kv.get(KEY));
  for (const { runTape } of [full, plain]) {
    equal(stored.find((row) => row.tape?.id === runTape.id)?.tape.inputLog, runTape.inputLog,
      `the county stores reel ${runTape.id} with its input log exactly as the recorder wrote it`);
  }
  // Where the player sees it: Return to Town after securing, the standing lands on the county board.
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.map(({ profileName }) => profileName), ['Recorder Reel', 'Recorder Reel'], 'both recorder standings are ranked on the county board');

  // THE ROUND TRIP: the reel read back the way the browser reads it (`?reel=`) must satisfy the client's
  // own validator with both keys intact, because the Lantern replays them (Game.ts:7823, :7827).
  const watched = await call(onRequest, 'GET', `/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=${full.runTape.id}`, undefined, kv);
  equal(watched.status, 200, `the stored reel is on the shelf: ${JSON.stringify(watched.body).slice(0, 160)}`);
  const replayable = validateRunTape(watched.body.reel);
  ok(replayable, 'the client validateRunTape accepts the reel read back through ?reel=');
  equal(replayable?.inputLog.playbookUses, full.runTape.inputLog.playbookUses, 'the playbook use survives the round trip with its recording');
  equal(replayable?.inputLog.motorActions, full.runTape.inputLog.motorActions, 'the motor actions survive the round trip with their points');

  // NOTHING LOOSENED. Every mutation re-hashes the input log, so each refusal belongs to the grammar alone.
  const refusalKv = makeKv();
  const refused = async (label, source, mutate, atTheDoor = false) => {
    const candidate = structuredClone(source.body);
    mutate(candidate.tape.inputLog);
    candidate.inputLogHash = createHash('sha256').update(JSON.stringify(candidate.tape.inputLog)).digest('hex');
    equal(validateTape(candidate.tape, 'the-claim', 'gold-rush', 'trail'), null, `the tape grammar refuses ${label}`);
    if (!atTheDoor) return;
    const answer = await call(onRequest, 'POST', '/api/standings', candidate, refusalKv);
    equal([answer.status, answer.body.error], [400, 'bad_payload'], `the door refuses ${label} as bad_payload`);
  };
  const legacy = { body: post('2dd7'.repeat(8), 10, tapeV2('legacy-twelve-keys', 10)) };
  equal((await call(onRequest, 'POST', '/api/standings', legacy.body, refusalKv)).status, 200, 'control: the twelve-key tape is accepted as it always was');
  await refused('a twelve-key tape with an unknown thirteenth key', legacy, (log) => { log.probes = []; }, true);
  await refused('a recorder reel with an unknown fifteenth key', full, (log) => { log.probes = []; }, true);
  await refused('a playbook use with a bad kind', full, (log) => { log.playbookUses[0].kind = 'playbook_used'; }, true);
  await refused('a playbook use whose atTick is past the duration', full, (log) => { log.playbookUses[0].atTick = log.durationTicks + 1; }, true);
  await refused('a playbook use carrying a malformed playbook', full, (log) => { delete log.playbookUses[0].playbook.version; }, true);
  await refused('a playbook use with a negative atTick', full, (log) => { log.playbookUses[0].atTick = -1; });
  await refused('playbook uses whose atTicks run backwards', full, (log) => { log.playbookUses = [{ ...log.playbookUses[0], atTick: 4 }, { ...log.playbookUses[0], atTick: 3 }]; });
  await refused('a playbook use with an unknown key', full, (log) => { log.playbookUses[0].note = 'x'; });
  await refused('a playbook recorded on another seed', full, (log) => { log.playbookUses[0].playbook.seed = 'another-seed'; });
  await refused('a playbook whose entry names an action no grammar knows', full, (log) => { log.playbookUses[0].playbook.entries[0].a.push({ type: 'teleport' }); });
  await refused('playbookUses that is not a list', full, (log) => { log.playbookUses = { 0: log.playbookUses[0] }; });
  await refused('a motor action before tick 0', full, (log) => { log.motorActions[0].t = -1; });
  await refused('a motor action of an unknown kind', full, (log) => { log.motorActions[0].kind = 'motor_fly'; });
  await refused('a motor action at the duration', full, (log) => { log.motorActions[1].t = log.durationTicks; });
  await refused('a motor action off the map', full, (log) => { log.motorActions[0].point.x = 300; });
  await refused('motor actions running backwards', full, (log) => { log.motorActions.reverse(); });
  await refused('motorActions that is not a list', full, (log) => { log.motorActions = {}; });
  // Both lists are capped at the envelope's maxEntries; the byte envelope is checked first, so each
  // capped tape is measured to fit it and the refusal is the count's alone.
  const envelope = runTapeEnvelopeForContract('the-claim');
  for (const field of ['playbookUses', 'motorActions']) {
    const capped = structuredClone(full.body.tape);
    capped.inputLog[field] = Array.from({ length: envelope.maxEntries }, () => structuredClone(full.body.tape.inputLog[field][0]));
    ok(validateTape(capped, 'the-claim', 'gold-rush', 'trail'), `the grammar admits ${envelope.maxEntries} ${field}, the envelope's maxEntries`);
    capped.inputLog[field].push(structuredClone(full.body.tape.inputLog[field][0]));
    ok(Buffer.byteLength(JSON.stringify(capped)) <= envelope.maxTapeBytes, `${envelope.maxEntries + 1} ${field} still fit the byte envelope`);
    equal(validateTape(capped, 'the-claim', 'gold-rush', 'trail'), null, `the grammar refuses ${envelope.maxEntries + 1} ${field}`);
  }
  console.log(`recorder reel ${backend} checks (${checks - before})`);
}

// F-DTG1-1 (door-tape-grammar-2, 2026-09-25). After grammar-1 the door still refused three action verbs the
// browser recorder writes: `prospector_dispatch` on every solo dispatch (Game.ts:8256-8262), `context_action`
// `recover` (Game.ts:5727), and a seated agent rider's `agent_orders`, recorded in its slot's stream
// (Game.ts:7975-7986) in the shape `SeatedLockstepSim.submitOrders` builds. The reels are the REAL recorder's,
// as in `checkRecorderReel`, and the real handler judges them.
async function checkRecorderVerbs(onRequest, validateTape, validateRunTape, kit) {
  const before = checks;
  const kv = makeKv();
  const seatOrders = kit.normalizeLockstepAction({
    type: 'agent_orders', version: 1, submissionId: 'seat-1',
    orders: kit.validateStandingOrders([{ verb: 'HARVEST', seam: 'gold-seam-2' }, { verb: 'SET_WEAPON', weapon: 'blast' }]).orders,
  });
  const reels = [
    ['a solo prospector dispatch', recorderReel(kit, '3dd7'.repeat(8), { dispatch: 'gold-seam-2' }), { type: 'prospector_dispatch', node: 'gold-seam-2' }],
    ['a probe recovery', recorderReel(kit, '4dd7'.repeat(8), { recover: true }), { type: 'context_action', action: 'recover' }],
    ["a seated agent rider's orders", recorderReel(kit, '5dd7'.repeat(8), { seatOrders }), seatOrders],
  ];
  const actionsOf = (log) => [...log.entries, ...log.streams.flatMap((stream) => stream.entries)].flatMap((entry) => entry.a);
  equal(reels.map(([, { runTape }, verb]) => actionsOf(runTape.inputLog).filter((action) => JSON.stringify(action) === JSON.stringify(verb)).length), [1, 1, 1],
    'each reel carries its verb exactly once (a solo dispatch reaches the recorder twice and is kept once)');
  equal(reels.map(([, , verb]) => kit.normalizeLockstepAction(verb)), reels.map(([, , verb]) => verb),
    "each verb is already in the client normalizer's own shape, which is the shape the recorder writes");
  ok(reels.every(([, { body }]) => body.tape), 'every reel fits the byte envelope, so every body carries its tape');
  const answers = [];
  for (const [, { body }] of reels) answers.push(await call(onRequest, 'POST', '/api/standings', body, kv));
  equal(answers.map(({ status, body }) => [status, body.stored ?? body.error]), [[200, true], [200, true], [200, true]],
    `the door accepts the recorder's reels with a dispatch, a recovery and a seated rider's orders: ${JSON.stringify(answers.map(({ body }) => body))}`);
  const stored = JSON.parse(await kv.get(KEY));
  for (const [label, { runTape }] of reels) {
    equal(stored.find((row) => row.tape?.id === runTape.id)?.tape.inputLog, runTape.inputLog, `the county stores the reel with ${label} exactly as the recorder wrote it`);
    const watched = await call(onRequest, 'GET', `/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=${runTape.id}`, undefined, kv);
    const replayable = validateRunTape(watched.body.reel);
    ok(replayable, `the reel with ${label} reads back through ?reel= and satisfies the client's validateRunTape`);
    equal([replayable?.inputLog.entries, replayable?.inputLog.streams], [runTape.inputLog.entries, runTape.inputLog.streams],
      `the reel with ${label} keeps its actions intact through the round trip`);
  }
  const solo = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  const posse = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&party=2', undefined, kv);
  equal([solo.body.board.length, posse.body.board.length], [2, 1], 'the two solo reels rank on the solo board and the ridden one on the two-rider board');

  // NOTHING LOOSENED. Every mutation re-hashes the input log, so each refusal belongs to the grammar alone.
  const refusalKv = makeKv();
  const [dispatchReel, recoverReel, seatReel] = reels.map(([, reel]) => reel);
  const verbIn = (log, type) => actionsOf(log).find((action) => action.type === type && (type !== 'context_action' || action.action === 'recover'));
  const refused = async (label, reel, type, mutate, { atTheDoor = false, stored: atRead = false } = {}) => {
    const candidate = structuredClone(reel.body);
    mutate(verbIn(candidate.tape.inputLog, type));
    candidate.inputLogHash = createHash('sha256').update(JSON.stringify(candidate.tape.inputLog)).digest('hex');
    equal(validateTape(candidate.tape, 'the-claim', 'gold-rush', 'trail', atRead), null, `the tape grammar${atRead ? ' at read' : ''} refuses ${label}`);
    if (!atTheDoor) return;
    const answer = await call(onRequest, 'POST', '/api/standings', candidate, refusalKv);
    equal([answer.status, answer.body.error], [400, 'bad_payload'], `the door refuses ${label} as bad_payload`);
  };
  await refused('a verb no grammar knows', dispatchReel, 'prospector_dispatch', (action) => { action.type = 'prospector_recall'; }, { atTheDoor: true });
  await refused('a dispatch with an unknown key', dispatchReel, 'prospector_dispatch', (action) => { action.target = { id: 'sluice', index: 0 }; }, { atTheDoor: true });
  await refused('a recovery with an unknown key', recoverReel, 'context_action', (action) => { action.target = { id: 'sluice', index: 0 }; }, { atTheDoor: true });
  await refused("a seated rider's orders naming a retired verb", seatReel, 'agent_orders', (action) => { action.orders = [{ verb: 'HOLD', pos: { x: 0, z: 30 } }]; }, { atTheDoor: true });
  await refused('a dispatch with an empty node', dispatchReel, 'prospector_dispatch', (action) => { action.node = ''; });
  await refused('a dispatch with a 65-character node', dispatchReel, 'prospector_dispatch', (action) => { action.node = 'n'.repeat(65); });
  await refused('a dispatch whose node carries edge whitespace', dispatchReel, 'prospector_dispatch', (action) => { action.node = ' gold-seam-2 '; });
  await refused('a dispatch whose node is only whitespace', dispatchReel, 'prospector_dispatch', (action) => { action.node = '   '; });
  await refused('a dispatch whose node is not a string', dispatchReel, 'prospector_dispatch', (action) => { action.node = 2; });
  await refused('a targetless context action other than fund or recover', recoverReel, 'context_action', (action) => { action.action = 'recall'; });
  await refused("a seated rider's orders with an unknown key", seatReel, 'agent_orders', (action) => { action.note = 'x'; });
  await refused("a seated rider's orders on wire version 2", seatReel, 'agent_orders', (action) => { action.version = 2; });
  await refused("a seated rider's orders with an empty submission id", seatReel, 'agent_orders', (action) => { action.submissionId = ''; });
  await refused("a seated rider's orders with a 97-character submission id", seatReel, 'agent_orders', (action) => { action.submissionId = 's'.repeat(97); });
  await refused("a seated rider's orders whose submission id carries edge whitespace", seatReel, 'agent_orders', (action) => { action.submissionId = ' seat-1 '; });
  const heavy = Array.from({ length: 32 }, () => ({ verb: 'HARVEST', seam: 's'.repeat(80) }));
  ok(kit.validateStandingOrders(heavy).ok && Buffer.byteLength(JSON.stringify(heavy)) > 3 * 1024, 'the heavy orders are grammatical and over the 3 KiB wire limit, so the bytes alone decide');
  await refused("a seated rider's orders over the 3 KiB wire limit", seatReel, 'agent_orders', (action) => { action.orders = heavy; });
  await refused("a seated rider's 33 orders", seatReel, 'agent_orders', (action) => { action.orders = Array.from({ length: 33 }, () => ({ verb: 'SET_WEAPON', weapon: 'rig' })); });
  await refused("a seated rider's orders that are not a list", seatReel, 'agent_orders', (action) => { action.orders = {}; });
  // At read a seated rider's orders are judged for SHAPE only (ADR-005), as a stored `kind` entry's are, so a verb
  // retired after acceptance leaves the row readable and `tapeGrammarRefusal` retires it; the shape stays required.
  const heldSeat = structuredClone(seatReel.body.tape);
  verbIn(heldSeat.inputLog, 'agent_orders').orders = [{ verb: 'HOLD', pos: { x: 0, z: 30 } }];
  ok(validateTape(heldSeat, 'the-claim', 'gold-rush', 'trail', true), "at read the grammar keeps a seated rider's orders that name a since-retired verb");
  await refused("a seated rider's orders that are not a list", seatReel, 'agent_orders', (action) => { action.orders = {}; }, { stored: true });
  await refused("a seated rider's orders holding a non-order", seatReel, 'agent_orders', (action) => { action.orders = [1]; }, { stored: true });
  await refused("a seated rider's orders over the 3 KiB wire limit", seatReel, 'agent_orders', (action) => { action.orders = heavy; }, { stored: true });
  console.log(`recorder verbs ${backend} checks (${checks - before})`);
}

async function checkEngineHashReel(onRequest) {
  const kv = makeKv();
  const runTape = currentEraTape(tapeV2('engine-reel', 1));
  equal((await call(onRequest, 'POST', '/api/standings', post('e'.repeat(32), 1, runTape), kv)).status, 200, 'engine tape is stored');
  equal(JSON.parse(await kv.get(KEY))[0].tape.meta.engineHash, engineEra.engineHash, 'worker identity stays stored');
  const aliasTape = currentEraTape(tapeV2('aliased-engine-reel', 1));
  aliasTape.meta.engineHash = engineEra.pins[0].aliases[0];
  equal((await call(onRequest, 'POST', '/api/standings', post('f'.repeat(32), 1, aliasTape), kv)).status, 200, 'an aliased current-era tape is stored');
  const response = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=engine-reel', undefined, kv);
  // Keep this projection contract paired with scripts/agent-reels.test.mjs.
  equal(response.body.reel.meta, runTape.meta, 'public WATCH reel carries its era identity');
}

async function checkReplayableBoard(onRequest) {
  const kv = makeKv();
  const key = 'standings:s2:epoch-1-frontier:e1-baron';
  const current = storedRowFor(1, 'e1-baron', 'epoch-1-frontier');
  current.profileName = 'The Walking Crown';
  current.assay = 'verified';
  current.assayedAt = 2;
  current.assayHash = current.tape.eventLogHash;
  const retired = structuredClone(current);
  retired.profileName = 'The Era Three Crown';
  retired.anonId = 'f'.repeat(32);
  retired.submittedAt = 1;
  retired.tape.id = 'era-three-crown';
  retired.tape.meta = { buildId: 'deadbeef', engineHash: '0'.repeat(64), era: 3 };
  // ADR-005 stage 3: a reel whose orders name a retired verb is RETIRED AND COUNTED at read, never
  // dropped (F-RPG-21: the first read after the grammar deploy emptied 25 boards with retiredCount 0).
  const held = structuredClone(current);
  held.profileName = 'The Held Crown';
  held.anonId = 'e'.repeat(32);
  held.submittedAt = 1;
  held.tape.id = 'held-crown';
  held.tape.inputLog.entries = [{ t: 0, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders: [{ verb: 'HOLD', pos: { x: 0, z: 30 } }] }] }];
  held.inputLogHash = createHash('sha256').update(JSON.stringify(held.tape.inputLog)).digest('hex');
  await kv.put(key, JSON.stringify([retired, held, current]));
  const storedBytes = await kv.get(key);

  const response = await call(onRequest, 'GET', '/api/standings?contract=e1-baron&epoch=epoch-1-frontier', undefined, kv);
  equal(response.body.board.map(({ rank, profileName }) => ({ rank, profileName })), [{ rank: 1, profileName: 'The Walking Crown' }], 'e1-baron mints only the era-current crown');
  equal(response.body.retiredCount, 2, 'the cross-era Baron crown AND the retired-verb crown are counted as retired, not dropped');
  equal(await kv.get(key), storedBytes, 'reading the replayable board leaves all three raw rows byte-identical');

  const staleTape = { ...tapeV2('stale-door', 1), meta: { buildId: 'deadbeef', engineHash: '0'.repeat(64), era: engineEra.era - 1 } };
  const stalePost = post('d'.repeat(32), 1, staleTape);
  stalePost.tape = staleTape;
  const refused = await call(onRequest, 'POST', '/api/standings', stalePost, kv);
  equal(refused.status, 400, 'a cross-era submission is refused at the door');
  equal(refused.body.error, 'reel_not_current', 'the door names the current-era failure');
  equal(refused.body.message, `This reel rode era ${engineEra.era - 1}; the county accepts era ${engineEra.era} '${engineEra.name}'.`, 'the door gives the honest era reason');
  equal(await kv.get(key), storedBytes, 'the refused tape is never stored');
}

// THE LINEAGE RE-ASSAY (ADR-004, owner ruling 2026-09-06). The fixture is the case in point's own
// shape: two verified standings on `e3-moth-season`, one recorded under the CURRENT engine and one
// under an earlier era-5 pin, exactly as heat 12's Opus row and heat 11's Fable row sit today.
async function checkLineageReassay(onRequest, queueRoute, verdictRoute, reassayRoute) {
  const contractId = 'e3-moth-season';
  const epochId = 'epoch-3-voltage';
  const board = `/api/standings?contract=${contractId}&epoch=${epochId}`;
  const key = `standings:s2:${epochId}:${contractId}`;
  const kv = makeKv();
  const olderPin = engineEra.pins[0].engineHash;

  const current = storedRowFor(1, contractId, epochId);
  current.profileName = 'Claude Opus 5';
  current.stack = { declaredBy: 'self', model: 'claude-opus-5', harness: 'claude-code-cli', harnessVersion: '1' };
  current.tape.id = 'opus-moth-reel';
  current.submittedAt = 2;
  current.assay = 'verified';
  current.assayedAt = 20;
  current.assayHash = current.tape.eventLogHash;
  // The row's stored gold is the county's OLD snapshot (lifetime panning, 530 on the live Moth Season
  // row) while its reel declares the purse held (200): the re-queue must restore the declaration, or
  // an honest, replaying row is retired for the county's own earlier overwrite (measured live 2026-09-06).
  current.tape.outcome = { ...current.tape.outcome, secured: true, waves: current.waves, timeAlive: current.timeAlive, gold: current.gold };
  const declaredGold = current.gold;
  current.gold = declaredGold + 330;
  current.securedSnapshot = { waves: current.waves, timeAlive: current.timeAlive, gold: current.gold };

  // The stale row's score is its GOAL SNAPSHOT, which does NOT equal its reel's final outcome — the
  // `retained: 'goal_snapshot'` shape the door mints on a re-POST. A re-queue that forgot this would
  // not "fail": the row would simply stop validating and vanish from storage on the next read.
  const stale = storedRowFor(2, contractId, epochId);
  stale.profileName = 'Claude Fable 5';
  stale.stack = { declaredBy: 'self', model: 'claude-fable-5', harness: 'claude-code-cli', harnessVersion: '1' };
  stale.tape.id = 'fable-moth-reel';
  stale.tape.meta = { ...stale.tape.meta, engineHash: olderPin };
  stale.submittedAt = 1;
  stale.assay = 'verified';
  stale.assayedAt = 10;
  stale.assayHash = stale.tape.eventLogHash;
  stale.timeAlive = 90;
  stale.securedSnapshot = { waves: stale.waves, timeAlive: 90, gold: stale.gold };
  await kv.put(key, JSON.stringify([current, stale]));

  const before = await call(onRequest, 'GET', board, undefined, kv);
  equal(before.body.board.map((row) => row.profileName), ['Claude Opus 5', 'Claude Fable 5'], 'both standings rank before the re-assay');
  equal(before.body.retiredCount, 0, 'and neither is retired yet');
  equal(JSON.parse(await kv.get(key)).length, 2, 'the goal-snapshot row survives a plain board read');

  const reason = 'e3-moth-season composition changed at engine pin 324bb3cd0e32f2b7 (2026-09-05)';
  const request = { epochId, contractId, reason };
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', request, kv, undefined)).status, 503, 'the re-assay verb fails closed without a configured secret');
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', request, kv, SECRET, 'wrong')).status, 401, 'a wrong key cannot re-assay a contract');
  equal((await workerCall(reassayRoute, 'GET', '/api/standings/reassay', undefined, kv, SECRET)).status, 405, 'the re-assay verb is POST only');
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { epochId, contractId }, kv, SECRET)).status, 400, 'a re-assay without a stated reason is refused');
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { epochId, contractId: 'no-such-contract', reason }, kv, SECRET)).status, 400, 'a re-assay of an unknown contract is refused');
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { ...request, extra: 1 }, kv, SECRET)).status, 400, 'the re-assay body keeps the strict key arithmetic');
  equal(await kv.get(key), JSON.stringify([current, stale]), 'every refused re-assay leaves the board byte-identical');

  const requeue = await workerCall(reassayRoute, 'POST', '/api/standings/reassay', request, kv, SECRET);
  equal(requeue.status, 200, 'the assayer key re-assays the contract');
  equal(requeue.body.requeued, 2, 'every verified row of the contract goes back into the queue');
  const requeued = JSON.parse(await kv.get(key));
  equal(requeued.length, 2, 're-queueing deletes nothing');
  equal(requeued.map((row) => row.assay), ['pending', 'pending'], 'both rows are pending again');
  equal(requeued.map((row) => row.lineage.reason), [reason, reason], 'each row carries the operator cause');
  equal(requeued.find((row) => row.tape.id === 'opus-moth-reel').gold, declaredGold, 'a re-queued row is judged against its reel\'s DECLARED gold, not the county\'s earlier snapshot');
  equal(requeued.find((row) => row.tape.id === 'opus-moth-reel').securedSnapshot, undefined, 'and the old snapshot is dropped until the replay re-measures it');
  equal((await call(onRequest, 'GET', board, undefined, kv)).body.board.length, 2, 'a re-queued board does not flicker: pending rows keep their ranks while the assay runs');

  const requeuedBytes = await kv.get(key);
  const second = await workerCall(reassayRoute, 'POST', '/api/standings/reassay', request, kv, SECRET);
  equal(second.body.requeued, 0, 'a second call re-queues nothing');
  equal(await kv.get(key), requeuedBytes, 'and writes nothing: the verb is idempotent while the assay is outstanding');

  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, kv, SECRET);
  equal(queue.body.queue.map((row) => row.locator.tapeId).sort(), ['fable-moth-reel', 'opus-moth-reel'], 'both re-queued rows reach the assayer');
  const opusLocator = queue.body.queue.find((row) => row.locator.tapeId === 'opus-moth-reel').locator;
  const fableLocator = queue.body.queue.find((row) => row.locator.tapeId === 'fable-moth-reel').locator;

  const reverified = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(opusLocator, 'verified', undefined, current.tape.eventLogHash, { waves: current.waves, timeAlive: current.timeAlive, gold: declaredGold }), kv, SECRET);
  equal(reverified.body.assay, 'verified', 'a standing that still replays is verified again');
  const retired = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(fableLocator, 'rejected', 'eventLogHash mismatch: claimed fnv1a32:1234abcd, replayed fnv1a32:9be0399e', 'fnv1a32:9be0399e'), kv, SECRET);
  equal(retired.body.assay, 'retired', 'a re-queued standing that no longer replays is RETIRED, not rejected');

  const settled = JSON.parse(await kv.get(key));
  const keptRow = settled.find((row) => row.tape.id === 'opus-moth-reel');
  const retiredRow = settled.find((row) => row.tape.id === 'fable-moth-reel');
  equal(keptRow.assay, 'verified', 'the replaying standing holds its verdict');
  equal(keptRow.gold, declaredGold, 'and its published gold is the purse the replay measured, no longer the stale snapshot');
  equal(keptRow.submittedAt, 2, 'and keeps its original first-secure date');
  equal(keptRow.lineage, undefined, 'a row that replays sheds its lineage mark');
  ok(keptRow.assayedAt > 20, 'only the assay date moves');
  equal(retiredRow.assay, 'retired', 'the diverging standing is retired');
  equal(retiredRow.submittedAt, 1, 'a retirement never moves the date the standing was earned');
  equal(retiredRow.assayReason, `lineage: recorded under ${olderPin}, no longer replays under ${engineEra.engineHash}`, 'the retirement names both engines');
  equal(retiredRow.assayHash, 'fnv1a32:9be0399e', 'and keeps the hash the replay actually produced');
  equal(retiredRow.lineage.reason, reason, 'the almanac keeps the operator cause on the retired row');

  const after = await call(onRequest, 'GET', board, undefined, kv);
  equal(after.body.board.map((row) => row.profileName), ['Claude Opus 5'], 'the ranked board excludes the retired standing');
  equal(after.body.retiredCount, 1, 'retiredCount counts it');
  equal(after.body.rejectedCount, 0, 'a retirement is not a rejection');
  const repair = await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { ...request, includeRetired: true }, kv, SECRET);
  equal(repair.body.requeued, 2, 'includeRetired re-queues the retired row beside the verified one (a settled verdict is fair game for a later composition change)');
  equal(JSON.parse(await kv.get(key)).find((row) => row.tape.id === 'fable-moth-reel').assay, 'pending', 'a retired row can be asked again, for a repair');
  const repairQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, kv, SECRET);
  const fableAgain = repairQueue.body.queue.find((row) => row.locator.tapeId === 'fable-moth-reel').locator;
  const opusAgain = repairQueue.body.queue.find((row) => row.locator.tapeId === 'opus-moth-reel').locator;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(opusAgain, 'verified', undefined, current.tape.eventLogHash, { waves: current.waves, timeAlive: current.timeAlive, gold: declaredGold }), kv, SECRET)).body.assay, 'verified', 'the replaying row is verified again on the repair pass');
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(fableAgain, 'rejected', 'eventLogHash mismatch: claimed fnv1a32:1234abcd, replayed fnv1a32:9be0399e', 'fnv1a32:9be0399e'), kv, SECRET)).body.assay, 'retired', 'and retires again when it still does not replay');
  equal((await workerCall(reassayRoute, 'POST', '/api/standings/reassay', { ...request, includeRetired: 'yes' }, kv, SECRET)).status, 400, 'includeRetired must be a boolean');
  const settledBytes = await kv.get(key);
  await call(onRequest, 'GET', board, undefined, kv);
  equal(await kv.get(key), settledBytes, 'reading the board leaves the retired row byte-identical (retention law)');
  equal(JSON.parse(settledBytes).length, 2, 'the retired row stays in storage');

  equal((await call(onRequest, 'GET', `${board}&reel=fable-moth-reel`, undefined, kv)).status, 200, 'WATCH still serves the retired reel');
  const slip = await call(onRequest, 'GET', `${board}&verdict=fable-moth-reel`, undefined, kv);
  equal(slip.body.assay, 'retired', 'the slip names the retirement');
  equal(slip.body.ranked, false, 'and says the row holds no rank');
  equal(slip.body.assayReason, retiredRow.assayReason, 'the slip serves the lineage reason');
  equal(slip.body.lineage.reason, reason, 'and the cause the county gave for asking again');

  // THE HONESTY GUARD, EXECUTED. `src/encyclopedia/reader.ts:695` validates a field-book cell's
  // `assayStatus` against a closed list and DROPS any cell outside it — a browser reader this slice
  // may not touch. It survives because a retired row is never ranked, and the field book is built
  // from ranked rows alone, so the new state can never reach it. Asserted, not assumed.
  const fieldBook = await call(onRequest, 'GET', `/api/standings?view=byStack&epoch=${epochId}`, undefined, kv);
  const cells = fieldBook.body.byStack.flatMap((row) => row.contracts);
  equal(fieldBook.body.byStack.map((row) => row.model), ['claude-opus-5'], 'the field book carries only the standing that replays');
  equal(cells.some((cell) => cell.assayStatus === 'retired'), false, 'no field-book cell ever carries the retired state');

  checkReceiptsIgnoreRetirement(after.body, current.tape.meta.engineHash, olderPin);
}

// F-RECEIPTS-1: a first-secure receipt is history, not derived state (ADR-004 rule 3). The real
// generator is run against the post-retirement board — the retired rider is simply absent from it —
// with the retired rider's own receipt already on disk, and the receipt must not move.
function checkReceiptsIgnoreRetirement(boardBody, currentPin, olderPin) {
  const directory = mkdtempSync(path.join(tmpdir(), 'gold-rush-receipts-'));
  try {
    const fixture = path.join(directory, 'fixture.json');
    const output = path.join(directory, 'receipts.json');
    writeFileSync(fixture, JSON.stringify({
      defaultBoard: [],
      boards: { 'e3-moth-season': boardBody.board },
      reels: {
        'opus-moth-reel': { reel: { meta: { engineHash: currentPin } } },
        'fable-moth-reel': { reel: { meta: { engineHash: olderPin } } },
      },
    }));
    const receipt = {
      epochId: 'epoch-3-voltage',
      contractId: 'e3-moth-season',
      status: 'claimed',
      species: 'claude-fable-5',
      profileName: 'Claude Fable 5',
      reelId: 'fable-moth-reel',
      pin: olderPin,
      date: new Date(1).toISOString(),
    };
    writeFileSync(output, `${JSON.stringify({ version: 1, source: 'fixture', contracts: [receipt] }, null, 2)}\n`);
    const result = spawnSync(process.execPath, ['scripts/winnability-receipts.mjs', '--offline', '--fixture', fixture, '--output', output],
      { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
    equal(result.status, 0, `the receipts generator runs against the post-retirement board: ${result.stderr}`);
    const regenerated = JSON.parse(readFileSync(output, 'utf8')).contracts.find((row) => row.contractId === 'e3-moth-season');
    equal(regenerated, receipt, 'retiring a standing never moves the contract first-secure receipt');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function checkOperatorProbes(onRequest, queueRoute, verdictRoute) {
  const kv = makeKv();
  const probe = post('c'.repeat(32), 10, tape('operator-probe-reel', 10));
  probe.profileName = 'Era Probe';
  probe.stack = { model: 'deterministic-controller', harness: 'operator-probe', harnessVersion: '1' };
  equal((await call(onRequest, 'POST', '/api/standings', probe, kv)).body.rank, null, 'operator probe mints no rank');

  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, kv, SECRET);
  equal(queue.body.queue.length, 1, 'operator probe still enters the assay queue');
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(queue.body.queue[0].locator, 'verified'), kv, SECRET)).status, 200, 'operator probe verifies');

  const storedBytes = await kv.get(KEY);
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 0, 'verified operator probe stays off the board');
  equal(board.body.probeCount, 1, 'board counts the stored operator probe');
  equal(JSON.parse(storedBytes).length, 1, 'verified operator probe stays in storage');
  equal(await kv.get(KEY), storedBytes, 'reading the probe leaves storage byte-identical');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&reel=operator-probe-reel', undefined, kv)).status, 200, 'WATCH still serves the operator probe reel');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=operator-probe-reel', undefined, kv)).body, {
    ok: true,
    season: 2,
    assayEra: true,
    epochId: 'epoch-1-frontier',
    contractId: 'the-claim',
    tapeId: 'operator-probe-reel',
    assay: 'verified',
    ranked: false,
    assayedAt: JSON.parse(storedBytes)[0].assayedAt,
    assayHash: 'fnv1a32:1234abcd',
  }, 'verdict endpoint still answers for the unranked probe');

  const liveShape = [
    ['Claude Opus 5', 'claude-code-cli', 680],
    ['Claude Fable 5', 'claude-code-cli', 499],
    ['Heat 8 Era Probe', 'operator-probe', 200],
    ['Heat 9 R2 Era Probe', 'operator-probe', 200],
    ['OMP Heat 8', 'omp', 25],
    ['PI Heat 9 R2', 'pi', 2],
    ['OpenClaw Heat 8', 'openclaw', 0],
    ['Prime Agent Heat 9 R2', 'prime-agent', 0],
  ].map(([profileName, harness, gold], index) => {
    const row = storedRowFor(index + 20, 'the-claim', 'epoch-1-frontier');
    row.profileName = profileName;
    row.stack = { declaredBy: 'self', model: 'test-model', harness, harnessVersion: '1' };
    row.waves = row.tape.outcome.waves = 10;
    row.timeAlive = row.tape.outcome.timeAlive = 300;
    row.gold = row.tape.outcome.gold = gold;
    row.baseValue = 0;
    row.submittedAt = 1_788_000_000_000 + index;
    row.assay = 'verified';
    row.assayedAt = row.submittedAt + 1;
    row.assayHash = row.tape.eventLogHash;
    return row;
  });
  const fixtureKv = makeKv();
  await fixtureKv.put(KEY, JSON.stringify(liveShape));
  const fixtureBytes = await fixtureKv.get(KEY);
  const reranked = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, fixtureKv);
  equal(reranked.body.board.map(({ rank, profileName }) => ({ rank, profileName })), [
    { rank: 1, profileName: 'Claude Opus 5' },
    { rank: 2, profileName: 'Claude Fable 5' },
    { rank: 3, profileName: 'OMP Heat 8' },
    { rank: 4, profileName: 'PI Heat 9 R2' },
    { rank: 5, profileName: 'OpenClaw Heat 8' },
    { rank: 6, profileName: 'Prime Agent Heat 9 R2' },
  ], 'live-shaped Claim fixture promotes the four riders two ranks after removing both probes');
  equal(reranked.body.probeCount, 2, 'live-shaped Claim fixture counts both probes');
  equal(await fixtureKv.get(KEY), fixtureBytes, 're-ranking the live-shaped fixture is read-only');
}

async function checkAssayIndexRace(onRequest, queueRoute) {
  const raced = makeKv({ barrierIndexReads: 2 });
  await raced.put(ASSAY_INDEX_KEY, JSON.stringify(indexEnvelope([])));
  const [raceA, raceB] = await Promise.all([
    call(onRequest, 'POST', '/api/standings', post('a'.repeat(32), 20, tape('race-a', 20)), raced),
    call(onRequest, 'POST', '/api/standings', post('b'.repeat(32), 10, tape('race-b', 10, 'fnv1a32:1234abcd', 'e2-hill-mine'), 'e2-hill-mine', 'epoch-2-steamworks'), raced),
  ]);
  equal([raceA.status, raceB.status], [200, 200], 'concurrent cross-board submissions both store');
  const racedIndex = await assayIndex(raced);
  equal(racedIndex.locators.length, 1, 'the deterministic valid-index race loses exactly one locator');
  const racedQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, raced, SECRET);
  equal(racedQueue.body.queue.length, 1, 'fresh raced index serves only its surviving locator');
  const served = racedQueue.body.queue[0].locator.tapeId;
  const lost = served === 'race-a' ? 'race-b' : 'race-a';
  const lostBoardKey = lost === 'race-a' ? KEY : 'standings:s2:epoch-2-steamworks:e2-hill-mine';
  ok(JSON.parse(await raced.get(lostBoardKey)).some((row) => row.tape.id === lost && row.assay === 'pending'), 'lost locator remains pending on its board but unserved');

  racedIndex.sweptAt = 0;
  await raced.put(ASSAY_INDEX_KEY, JSON.stringify(racedIndex));
  raced.resetOps();
  const reconciled = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, raced, SECRET);
  equal(reconciled.body.queue.map((row) => row.locator.tapeId).sort(), ['race-a', 'race-b'], 'stale reconcile restores and serves the raced locator');
  equal(raced.ops.reads, 43, 'raced reconcile reads the index twice and every board');
  equal(raced.ops.writes, 1, 'raced reconcile writes one authoritative index');

  const overlap = makeKv({ pauseAfterBoardReads: 41 });
  const rowA = storedRowFor(6, 'the-claim', 'epoch-1-frontier');
  const rowB = storedRowFor(7, 'e2-hill-mine', 'epoch-2-steamworks');
  await overlap.put(KEY, JSON.stringify([rowA]));
  await overlap.put('standings:s2:epoch-2-steamworks:e2-hill-mine', JSON.stringify([rowB]));
  const rowBLocator = { ...queueRow(rowB, 'epoch-2-steamworks', 'e2-hill-mine').locator, submittedAt: rowB.submittedAt };
  await overlap.put(ASSAY_INDEX_KEY, JSON.stringify(indexEnvelope([rowBLocator], 0)));
  const overlappingSweep = workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, overlap, SECRET);
  await overlap.waitForBoardSweep();
  const late = storedRowFor(5, 'e3-blackout-ridge', 'epoch-3-voltage');
  await overlap.put('standings:s2:epoch-3-voltage:e3-blackout-ridge', JSON.stringify([late]));
  const lateLocator = { ...queueRow(late, 'epoch-3-voltage', 'e3-blackout-ridge').locator, submittedAt: late.submittedAt };
  await overlap.put(ASSAY_INDEX_KEY, JSON.stringify(indexEnvelope([
    rowBLocator,
    lateLocator,
  ], 0)));
  overlap.releaseBoardSweep();
  const withLateRow = await overlappingSweep;
  equal(withLateRow.body.queue.map((row) => row.locator.tapeId).sort(), [rowA.tape.id, rowB.tape.id, late.tape.id].sort(), 'reconcile restores the race without dropping a row written between its scan and index write');
}

async function checkPosts(onRequest, queueRoute, verdictRoute, maxRequestBytes) {
  const kv = makeKv();
  const unattested = await call(onRequest, 'POST', '/api/standings', post('0'.repeat(32), 20), kv);
  equal(unattested.status, 200, 'tapeless POST accepted');
  equal(unattested.body.stored, true, 'tapeless POST stored');
  equal(unattested.body.rank, null, 'tapeless POST has no rank');
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.length, 1, 'tapeless row survives in KV');
  equal(stored[0].assay, undefined, 'tapeless row is unattested');
  ok(!Object.hasOwn(stored[0], 'stack'), 'a legacy row remains valid without harness receipt fields');
  const emptyBoard = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(emptyBoard.body.board.length, 0, 'tapeless row is excluded from board');

  const disclosed = post('1'.repeat(32), 10);
  disclosed.stack = { worldModel: 'sim-import' };
  equal((await call(onRequest, 'POST', '/api/standings', disclosed, kv)).status, 200, 'world-model disclosure is optional and accepted');
  const oversizedDisclosure = post('2'.repeat(32), 10);
  oversizedDisclosure.stack = { worldModel: 'x'.repeat(65) };
  equal((await call(onRequest, 'POST', '/api/standings', oversizedDisclosure, kv)).status, 400, 'world-model disclosure is capped at 64 characters');
  const forgedSnapshot = post('3'.repeat(32), 10);
  forgedSnapshot.securedSnapshot = { waves: 99, timeAlive: 1, gold: 999_999 };
  equal((await call(onRequest, 'POST', '/api/standings', forgedSnapshot, makeKv())).status, 400,
    'the public score schema refuses a rider-declared secure snapshot');

  const taped = post('0'.repeat(32), 20, tape('pending-tape', 20));
  taped.stack = { model: 'test-model', harness: 'test-rig', harnessVersion: 'v1', harnessDigest: 'c'.repeat(64), harnessRef: 'abcdef1' };
  const pending = await call(onRequest, 'POST', '/api/standings', taped, kv);
  equal(pending.body.rank, 1, 'taped resubmission supersedes unattested row');
  equal(pending.body.decidedBy, 'crown', 'top submitted row explains that it holds the crown');
  const overtime = structuredClone(taped);
  overtime.score = { ...overtime.score, waves: 14, timeAlive: 180, gold: 90 };
  overtime.tape.outcome = { reason: 'rush', secured: true, waves: 14, timeAlive: 180, gold: 90 };
  const overtimeResponse = await call(onRequest, 'POST', '/api/standings', overtime, kv);
  equal({ stored: overtimeResponse.body.stored, rank: overtimeResponse.body.rank, retained: overtimeResponse.body.retained },
    { stored: false, rank: 1, retained: 'goal_snapshot' }, 'a Rush reply identifies the retained goal snapshot as this run');
  const frozen = JSON.parse(await kv.get(KEY)).find((row) => row.tape?.id === 'pending-tape');
  equal({ waves: frozen.waves, timeAlive: frozen.timeAlive, gold: frozen.gold }, { waves: 20, timeAlive: 120, gold: 40 },
    'a later Rush post with the same reel keeps the official-goal snapshot');

  const overtimeOnlyKv = makeKv();
  const overtimeOnly = post('4'.repeat(32), 14, tape('one-shot-overtime', 14));
  overtimeOnly.score = { ...overtimeOnly.score, waves: 14, timeAlive: 180, gold: 90 };
  overtimeOnly.tape.outcome = { reason: 'rush', secured: true, waves: 14, timeAlive: 180, gold: 90 };
  await call(onRequest, 'POST', '/api/standings', overtimeOnly, overtimeOnlyKv);
  const overtimeQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, overtimeOnlyKv, SECRET);
  const overtimeVerdict = verdict(overtimeQueue.body.queue[0].locator, 'verified', undefined, 'fnv1a32:1234abcd',
    { waves: 10, timeAlive: 120, gold: 40 });
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', overtimeVerdict, overtimeOnlyKv, SECRET)).status, 200,
    'the worker can verify a one-shot overtime tape');
  const rewritten = JSON.parse(await overtimeOnlyKv.get(KEY))[0];
  equal({ assay: rewritten.assay, waves: rewritten.waves, timeAlive: rewritten.timeAlive, gold: rewritten.gold },
    { assay: 'verified', waves: 10, timeAlive: 120, gold: 40 },
    'verification rewrites the rider final values to the secure-event snapshot');

  const challenger = post('4'.repeat(32), 20, tape('later-overtime', 20));
  challenger.score = { ...challenger.score, waves: 20, timeAlive: 240, gold: 100 };
  challenger.tape.outcome = { reason: 'rush', secured: true, waves: 20, timeAlive: 240, gold: 100 };
  await call(onRequest, 'POST', '/api/standings', challenger, overtimeOnlyKv);
  const challengerQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, overtimeOnlyKv, SECRET);
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(
    challengerQueue.body.queue[0].locator, 'verified', undefined, 'fnv1a32:1234abcd', { waves: 10, timeAlive: 125, gold: 30 },
  ), overtimeOnlyKv, SECRET)).status, 200, 'a later overtime tape verifies against its own secure snapshot');
  const preserved = JSON.parse(await overtimeOnlyKv.get(KEY)).find((row) => row.assay === 'verified');
  equal({ tape: preserved.tape.id, waves: preserved.waves, timeAlive: preserved.timeAlive, gold: preserved.gold },
    { tape: 'one-shot-overtime', waves: 10, timeAlive: 120, gold: 40 }, 'a worse verified snapshot cannot erase the prior personal best');
  const worse = post('0'.repeat(32), 10, tape('worse-tape', 10));
  const worseResponse = await call(onRequest, 'POST', '/api/standings', worse, kv);
  equal({ stored: worseResponse.body.stored, rank: worseResponse.body.rank, retained: worseResponse.body.retained },
    { stored: true, rank: null, retained: undefined }, 'a fresh tape waits for its own verified snapshot');
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'one optimistic pending row shows per rider');
  equal(board.body.board[0].assay, 'pending', 'pending badge state is exposed');
  equal(board.body.board[0].cost, { orders: null, calls: null, tokensIn: null, tokensOut: null, durationS: 120 }, 'pending row exposes the complete cost shape without inventing declarations');
  equal(board.body.board[0].harnessDigest, 'c'.repeat(64), 'harness digest reaches the board');
  equal(board.body.board[0].harnessRef, 'abcdef1', 'harness reference reaches the board');
  for (const [field, value] of [['harnessDigest', 'nope'], ['harnessRef', 'ftp://example.com/harness']]) {
    const invalid = post('9'.repeat(32), 10);
    invalid.stack = { [field]: value };
    equal((await call(onRequest, 'POST', '/api/standings', invalid, makeKv())).status, 400, `${field} shape is checked`);
  }

  const twin = tape('twin-final-tick', 20, 'fnv1a32:1234abcd', 'e1-twin-banks');
  twin.inputLog.durationTicks = 18_002;
  equal((await call(onRequest, 'POST', '/api/standings', post('3'.repeat(32), 20, twin, 'e1-twin-banks'), kv)).status, 200, 'Twin Banks final-tick tape is accepted');

  const night = tape('night-dawn', 25, 'fnv1a32:1234abcd', 'e1-night-shift');
  night.inputLog.durationTicks = 22_502;
  equal((await call(onRequest, 'POST', '/api/standings', post('4'.repeat(32), 25, night, 'e1-night-shift'), kv)).status, 200, 'Night Shift dawn tape is accepted');
  night.inputLog.durationTicks += 1;
  const beyondDawn = await call(onRequest, 'POST', '/api/standings', post('5'.repeat(32), 25, night, 'e1-night-shift'), kv);
  equal(beyondDawn.status, 400, 'Night Shift beyond-margin tape is refused');
  equal(beyondDawn.body.error, 'reel_duration_exceeded', 'Night Shift beyond-margin refusal names the duration reason');

  const picnic = tape('picnic-final-tick', 20, 'fnv1a32:1234abcd', 'e6-picnic');
  picnic.inputLog.durationTicks = 18_002;
  equal((await call(onRequest, 'POST', '/api/standings', post('6'.repeat(32), 20, picnic, 'e6-picnic', 'epoch-6-atomic'), kv)).status, 200, 'no-secureWave final-tick tape is accepted');
  picnic.inputLog.durationTicks += 1;
  const beyondPicnic = await call(onRequest, 'POST', '/api/standings', post('7'.repeat(32), 20, picnic, 'e6-picnic', 'epoch-6-atomic'), kv);
  equal(beyondPicnic.status, 400, 'no-secureWave beyond-margin tape is refused');
  equal(beyondPicnic.body.error, 'reel_duration_exceeded', 'no-secureWave beyond-margin refusal names the duration reason');

  const oversized = post('8'.repeat(32), 20);
  // DERIVED, not a literal: this padding only means anything while it is larger than the
  // reader cap, and the cap follows the envelope (F-HEAT12-2 moved it 802,080 -> 2,531,360, at
  // which point the old hardcoded 2 MiB was admitted and the assertion silently changed subject).
  oversized.profileName = 'x'.repeat(maxRequestBytes + 1);
  const tooLarge = await call(onRequest, 'POST', '/api/standings', oversized, kv);
  equal(tooLarge.status, 413, 'pretty-sized standing is refused before validation');
  equal(tooLarge.body.error, 'reel_too_large', '413 names the compact-reel cure');
}

async function checkDoorEnvelopes(onRequest, validateTape, validateRunTape, submittedRunTape, maxRunTapeTicksForContract, runTapeEnvelopeForContract, contractBundles, recorderTicks, playbookEntries, maxRequestBytes) {
  equal(recorderTicks, 18_000, 'browser recorder keeps its ten-minute DoS bound');
  equal(playbookEntries, 2_000, 'playbook authoring keeps its own 2,000-intent UX bound');
  const contracts = contractBundles.flatMap((bundle) => bundle.contracts);
  const clockSources = contracts.map(({ id, twist = {} }) => ({
    id,
    derived: Number.isFinite(twist.secureWave) && twist.secureWave > 0,
    explicit: Number.isInteger(twist.clockTicks) && twist.clockTicks > 0,
  }));
  equal(clockSources.filter(({ derived, explicit }) => Number(derived) + Number(explicit) !== 1).map(({ id }) => id), [],
    'every registry contract has exactly one positive clock source');
  const clockCensus = {
    total: clockSources.length,
    derived: clockSources.filter(({ derived }) => derived).length,
    explicit: clockSources.filter(({ explicit }) => explicit).length,
    missing: clockSources.filter(({ derived, explicit }) => !derived && !explicit).length,
  };
  // maps-campaign-land-era6 (attended 2026-09-14): Astra's map campaign 7c2744e5a moved one contract's clock from an explicit
  // clockTicks to a derived secureWave (see reviews/maps-campaign-land-era6.md F-MAPL-5); the census follows the data it measures.
  equal(clockCensus, { total: 42, derived: 25, explicit: 17, missing: 0 }, 'contract clock census is pinned');
  console.log(`contract clock census ${clockCensus.total}/${clockCensus.derived}/${clockCensus.explicit}/${clockCensus.missing}`);
  equal([
    'the-claim',
    'e1-drill-yard',
    'e1-dry-gulch',
    'e1-night-shift',
    'e1-twin-banks',
    'e1-baron',
  ].map((contractId) => {
    const envelope = runTapeEnvelopeForContract(contractId);
    return [contractId, envelope.maxTicks, envelope.maxTapeBytes, envelope.maxEntries, maxRequestBytes];
  // THE DERIVATION, so a reader can check the pins by arithmetic rather than by belief. Since
  // F-HEAT12-2 the byte axis prices two classes of entry (PlaybookFormat.ts, the comment above
  // RUN_TAPE_ENVELOPE_TICKS_PER_ORDER_ENTRY):
  //   maxEntries      = ceil(maxTicks / 5)                        one movement change-point per 5 ticks
  //   maxOrderEntries = ceil(maxTicks / 30)                       one whole order array per second
  //   maxTapeBytes    = 16,384 + maxEntries*160 + maxOrderEntries*(2,400 - 160)
  //   maxRequestBytes = max(maxTapeBytes over every contract) + 44 KiB of request metadata
  // The Claim: 16,384 + 3,601*160 + 601*2,240 = 1,938,784 (was 592,544 when every entry cost 160).
  // The reader cap follows the widest contract, e2-trestle at 2,486,304, so 2,486,304 + 45,056
  // = 2,531,360 (was 802,080). maxTicks and maxEntries are UNCHANGED on every row.
  }), [
    ['the-claim', 18_002, 1_938_784, 3_601, 2_531_360],
    ['e1-drill-yard', 18_002, 1_938_784, 3_601, 2_531_360],
    ['e1-dry-gulch', 18_002, 1_938_784, 3_601, 2_531_360],
    ['e1-night-shift', 22_502, 2_418_784, 4_501, 2_531_360],
    ['e1-twin-banks', 18_002, 1_938_784, 3_601, 2_531_360],
    ['e1-baron', 20_350, 2_188_544, 4_070, 2_531_360],
  ], 'E1 four-axis door envelope table is pinned');

  const widestCharacter = '\ud800';
  const maxStack = {
    model: widestCharacter.repeat(256), harness: widestCharacter.repeat(256), harnessVersion: widestCharacter.repeat(256),
    worldModel: widestCharacter.repeat(64), config: widestCharacter.repeat(256), source: `https://example.com/${widestCharacter.repeat(236)}`,
    tokensIn: 1_000_000_000_000, tokensOut: 1_000_000_000_000, calls: 1_000_000_000_000,
  };
  const trestleEnvelope = runTapeEnvelopeForContract('e2-trestle');
  const maximumTape = {
    ...tape('x'.repeat(64), 12, 'fnv1a32:1234abcd', 'e2-trestle'),
    seed: widestCharacter.repeat(256),
    inputLog: {
      ...tape('trestle', 12, 'fnv1a32:1234abcd', 'e2-trestle').inputLog,
      seed: widestCharacter.repeat(256),
      durationTicks: 1_195,
      entries: Array.from({ length: 1_195 }, (_, t) => ({
        t, mx: 0, my: 0, a: Array.from({ length: 24 }, () => ({ type: 'weapon_toggle' })),
      })),
    },
  };
  const maximumLawfulRequest = bankedPost(maximumTape, 'a'.repeat(32));
  maximumLawfulRequest.epochId = 'epoch-2-steamworks';
  maximumLawfulRequest.seedMode = 'live';
  maximumLawfulRequest.profileName = widestCharacter.repeat(24);
  maximumLawfulRequest.stack = maxStack;
  maximumLawfulRequest.party = { riderCount: 4, riders: Array.from({ length: 4 }, () => ({ name: widestCharacter.repeat(24), stack: maxStack })) };
  const metadataBytes = Buffer.byteLength(JSON.stringify({ ...maximumLawfulRequest, tape: null })) - Buffer.byteLength('null');
  ok(maxRequestBytes >= trestleEnvelope.maxTapeBytes + metadataBytes,
    `outer and reader cap admits the measured maximum lawful request (${trestleEnvelope.maxTapeBytes + metadataBytes} bytes)`);
  const maximumResponse = await call(onRequest, 'POST', '/api/standings', maximumLawfulRequest, makeKv());
  equal(maximumResponse.status, 200,
    `maximum escaped metadata and near-envelope Trestle tape pass the real standings handler: ${JSON.stringify(maximumResponse.body)}`);
  equal([
    'the-claim',
    'e1-drill-yard',
    'e1-dry-gulch',
    'e1-night-shift',
    'e1-twin-banks',
    'e1-baron',
    'e2-trestle',
    'e2-incline',
    'e3-canyon-works',
    'e4-dust-flats',
  ].map(maxRunTapeTicksForContract), [18_002, 18_002, 18_002, 22_502, 18_002, 20_350, 23_145, 21_602, 18_002, 18_002], 'contract duration table is pinned');
  equal(maxRunTapeTicksForContract('unknown-contract'), recorderTicks + 2, 'unknown contracts keep the inclusive recorder ceiling');
  equal(runTapeEnvelopeForContract('unknown-contract'), runTapeEnvelopeForContract('the-claim'), 'unknown contracts keep the ordinary door envelope');

  for (const [contractId, ceiling, waves] of [
    ['e6-picnic', 18_002, 20],
    ['e1-night-shift', 22_502, 25],
    ['e2-trestle', 23_145, 12],
    ['e2-incline', 21_602, 12],
    ['e3-canyon-works', 18_002, 12],
    ['e4-dust-flats', 18_002, 12],
  ]) {
    const bounded = tape(`${contractId}-validator`, waves, 'fnv1a32:1234abcd', contractId);
    bounded.inputLog.durationTicks = ceiling;
    ok(validateTape(bounded, contractId, 'gold-rush', 'trail'), `standings validator accepts ${contractId} ceiling`);
    ok(validateRunTape(bounded), `assay validator accepts ${contractId} ceiling`);
    bounded.inputLog.durationTicks += 1;
    equal(validateTape(bounded, contractId, 'gold-rush', 'trail'), null, `standings validator refuses beyond ${contractId} ceiling`);
    equal(validateRunTape(bounded), null, `assay validator refuses beyond ${contractId} ceiling`);
  }

  const baronEnvelope = runTapeEnvelopeForContract('e1-baron');
  const tooManyEntries = tape('baron-too-many-entries', 22, 'fnv1a32:1234abcd', 'e1-baron');
  tooManyEntries.inputLog.durationTicks = baronEnvelope.maxTicks;
  tooManyEntries.inputLog.entries = Array.from({ length: baronEnvelope.maxEntries + 1 }, (_, t) => ({ t, mx: 0, my: 0, a: [] }));
  equal(validateTape(tooManyEntries, 'e1-baron', 'gold-rush', 'trail'), null, 'standings validator refuses beyond the Baron entry envelope');
  equal(validateRunTape(tooManyEntries), null, 'assay validator refuses beyond the Baron entry envelope');

  const tooManyBytes = tape('baron-too-many-bytes', 22, 'fnv1a32:1234abcd', 'e1-baron');
  tooManyBytes.padding = 'x'.repeat(baronEnvelope.maxTapeBytes);
  equal(validateTape(tooManyBytes, 'e1-baron', 'gold-rush', 'trail'), null, 'standings validator refuses beyond the Baron byte envelope');
  equal(submittedRunTape(tooManyBytes), undefined, 'browser submission refuses beyond the Baron byte envelope');
}

async function checkBankedHeat11Tapes(onRequest, validateTape, validateRunTape) {
  // ADR-005 stage 3 (2026-09-07): the Half-Life Hollow and Picnic reels walk the Prospector with
  // MOVE_TO / HOLD, verbs the door has retired; the door refuses them and a stored copy reads back
  // retired. Relay Rush names no retired verb and still submits.
  for (const contractId of ['e6-half-life-hollow', 'e6-picnic', 'e7-relay-rush']) {
    const submission = JSON.parse(readFileSync(`artifacts/gauntlet-heat11-20260903/rides/${contractId}/opus/submission.json`, 'utf8'));
    submission.tape = currentEraTape(submission.tape);
    const retiredVerb = contractId !== 'e7-relay-rush';
    if (retiredVerb) {
      equal(validateTape(submission.tape, contractId, submission.seed, submission.difficulty), null, `${contractId} heat-11 tape is refused by the standings validator: it names a retired verb`);
      ok(validateTape(submission.tape, contractId, submission.seed, submission.difficulty, true), `${contractId} heat-11 tape still clears the STORED-row validator (shape only)`);
      equal((await call(onRequest, 'POST', '/api/standings', submission, makeKv())).status, 400, `${contractId} heat-11 submission is refused at the door`);
    } else {
      ok(validateTape(submission.tape, contractId, submission.seed, submission.difficulty), `${contractId} heat-11 tape clears the standings validator`);
      ok(validateRunTape(submission.tape), `${contractId} heat-11 tape clears the assay validator`);
      equal((await call(onRequest, 'POST', '/api/standings', submission, makeKv())).status, 200, `${contractId} heat-11 submission is accepted locally`);
    }
  }
}

async function checkBankedBaronTapes(onRequest, queueRoute, verdictRoute, validateTape, validateRunTape) {
  const kv = makeKv();
  const tapes = [1, 2].map((run) => JSON.parse(readFileSync(`artifacts/gauntlet-heat6-20260825/e1-baron/run-${run}-tape.json`, 'utf8')));
  // ADR-005 stage 3 (2026-09-07): both banked Baron tapes walk the Prospector with MOVE_TO and HOLD,
  // verbs the door has retired. The door refuses them; a stored row carrying one reads back retired
  // and counted (F-RPG-21); the assay-queue path below rides current-grammar reels instead.
  for (const [index, runTape] of tapes.entries()) {
    equal(validateTape(runTape, runTape.contract, runTape.seed, runTape.difficulty), null, `banked Baron tape ${index + 1} is refused by the standings validator: it names a retired verb`);
    ok(validateTape(runTape, runTape.contract, runTape.seed, runTape.difficulty, true), `banked Baron tape ${index + 1} still clears the STORED-row validator (shape only)`);
    const submitted = await call(onRequest, 'POST', '/api/standings', bankedPost(runTape, `${index + 7}`.repeat(32)), kv);
    equal(submitted.status, 400, `banked Baron tape ${index + 1} is refused at the door`);
  }
  const storedKey = 'standings:s2:epoch-1-frontier:e1-baron';
  const storedBanked = storedRowFor(1, 'e1-baron', 'epoch-1-frontier');
  storedBanked.profileName = 'The Banked Baron';
  storedBanked.tape = currentEraTape(tapes[0]);
  storedBanked.seed = storedBanked.tape.seed;
  storedBanked.difficulty = storedBanked.tape.difficulty;
  storedBanked.inputLogHash = createHash('sha256').update(JSON.stringify(storedBanked.tape.inputLog)).digest('hex');
  storedBanked.assay = 'verified';
  storedBanked.assayedAt = 2;
  storedBanked.assayHash = storedBanked.tape.eventLogHash;
  await kv.put(storedKey, JSON.stringify([storedBanked]));
  const bankedBoard = await call(onRequest, 'GET', '/api/standings?contract=e1-baron&epoch=epoch-1-frontier', undefined, kv);
  equal(bankedBoard.body.board.length, 0, 'a stored banked Baron row leaves the ranked board');
  equal(bankedBoard.body.retiredCount, 1, 'and is COUNTED as retired, not dropped');
  await kv.put(storedKey, '[]');
  // The same two banked reels with the retired orders struck out are current-grammar reels: same seed,
  // difficulty and outcome, so they submit and enter the queue exactly as the banked ones once did.
  for (const [index, runTape] of tapes.entries()) {
    const current = structuredClone(runTape);
    current.id = `${runTape.id}-current`;
    for (const entry of current.inputLog.entries) for (const action of entry.a ?? []) if (action.kind === 'agent_orders') action.orders = action.orders.filter((order) => order.verb !== 'MOVE_TO' && order.verb !== 'HOLD' && order.verb !== 'FALLBACK_IF');
    const submitted = await call(onRequest, 'POST', '/api/standings', bankedPost(current, `${index + 7}`.repeat(32)), kv);
    equal(submitted.status, 200, `current-grammar Baron reel ${index + 1} (the banked reel with its retired orders struck) submits: ${JSON.stringify(submitted.body).slice(0, 160)}`);
  }
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, kv, SECRET);
  equal(queue.body.queue.length, 2, 'both current-grammar Baron reels enter the assay queue');
  for (const row of queue.body.queue) {
    equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(row.locator, 'verified', undefined, row.tape.eventLogHash), kv, SECRET)).status, 200, `${row.locator.tapeId} accepts its verified worker verdict`);
    equal((await call(onRequest, 'GET', `/api/standings?contract=e1-baron&epoch=epoch-1-frontier&verdict=${row.locator.tapeId}`, undefined, kv)).body.assay, 'verified', `${row.locator.tapeId} polls verified`);
  }
}

async function checkVerdicts(onRequest, queueRoute, verdictRoute) {
  const kv = makeKv();
  const verifyTape = tape('verify-me', 30);
  verifyTape.inputLog.durationTicks = 2;
  verifyTape.inputLog.entries = [
    { t: 0, mx: 0, my: 0, a: [{ kind: 'agent_orders', orders: [] }] },
    { t: 1, mx: 1, my: 0, a: [] },
  ];
  verifyTape.inputLog.streams = [{ slot: 1, start: { x: 0, z: 12 }, entries: [{ t: 0, mx: 0, my: 1, a: [] }] }];
  const verifyPost = post('1'.repeat(32), 30, verifyTape);
  verifyPost.stack = { model: 'cost-fixture', calls: 114, tokensIn: 9_000 };
  await call(onRequest, 'POST', '/api/standings', verifyPost, kv);
  await call(onRequest, 'POST', '/api/standings', post('2'.repeat(32), 25, tape('reject-me', 25)), kv);
  await call(onRequest, 'POST', '/api/standings', post('5'.repeat(32), 20, tape('retry-me', 20)), kv);
  equal((await assayIndex(kv)).locators.length, 3, 'submissions append pending locators');

  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, kv, undefined)).status, 503, 'absent secret fails closed');
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, kv, SECRET, 'wrong')).status, 401, 'wrong key is unauthorized');
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=2', undefined, kv, SECRET);
  equal(queue.status, 200, 'correct key reads queue');
  equal(queue.body.queue.map((row) => row.locator.tapeId).join(','), 'verify-me,reject-me', 'queue is oldest first and respects its limit');

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
  const retryQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=3', undefined, kv, SECRET);
  const retryLocator = retryQueue.body.queue.find((row) => row.locator.tapeId === 'retry-me').locator;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(retryLocator, 'unassayable', 'instrument exited 143'), kv, SECRET)).status, 200, 'unassayable verdict accepted with a reason');
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(retryLocator, 'unassayable'), kv, SECRET)).status, 400, 'unassayable verdict without a reason is refused');
  equal((await assayIndex(kv)).locators.length, 0, 'all verdicts remove their locators');

  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'rejected row drops from ranking');
  equal(board.body.board[0].assay, 'verified', 'verified row remains ranked');
  equal(board.body.board[0].cost, { orders: 3, calls: 114, tokensIn: 9_000, tokensOut: null, durationS: 120 }, 'verified row counts every primary and human stream input at assay time and returns the full cost shape');
  equal(board.body.rejectedCount, 1, 'rejected row is counted');
  const stored = JSON.parse(await kv.get(KEY));
  equal(stored.length, 3, 'unranked rows survive in KV');
  equal(stored.find((row) => row.tape.id === 'verify-me').orders, 3, 'assay verdict persists the county-counted tape entries');
  equal(stored.find((row) => row.tape.id === 'reject-me').assayReason, 'replay diverged', 'rejection reason is retained on the row');
  equal(stored.find((row) => row.tape.id === 'retry-me').assayReason, 'instrument exited 143', 'instrument reason is retained on the row');

  // THE ASSAY SLIP (F-ASSAY-E2E, 2026-08-22). A refused row leaves the ranked board; before this
  // it also took its reason with it, so an honest rider learned only that `rejectedCount` moved.
  // The slip is keyed on the tape id — the submitter's own handle, exactly as `?reel=` is — so
  // nothing is added to the ranked board and nothing else becomes readable.
  const slip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=reject-me', undefined, kv);
  equal(slip.status, 200, 'an unranked row still has a slip');
  equal(slip.body.assay, 'rejected', 'the slip names the verdict');
  equal(slip.body.assayReason, 'replay diverged', 'the slip names the reason');
  equal(slip.body.ranked, false, 'and says the row holds no rank');
  const unassayableSlip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=retry-me', undefined, kv);
  equal(unassayableSlip.body.assay, 'unassayable', 'the slip names an infrastructure failure honestly');
  equal(unassayableSlip.body.assayReason, 'instrument exited 143', 'the slip serves the instrument reason');
  equal(unassayableSlip.body.assayHash, undefined, 'the slip does not invent a replay hash');
  equal(unassayableSlip.body.ranked, false, 'an unassayable row is not ranked');

  await call(onRequest, 'POST', '/api/standings', post('5'.repeat(32), 20, tape('retry-me', 20)), kv);
  equal((await assayIndex(kv)).locators.length, 1, 'resubmission requeues the assay locator');
  const secondQueue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=3', undefined, kv, SECRET);
  const secondLocator = secondQueue.body.queue.find((row) => row.locator.tapeId === 'retry-me').locator;
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(secondLocator, 'verified'), kv, SECRET)).status, 200, 'a flipped-back row re-enters the queue');
  const retried = JSON.parse(await kv.get(KEY)).find((row) => row.tape.id === 'retry-me');
  equal(retried.assay, 'verified', 'the later assay can verify it');
  equal(retried.assayReason, undefined, 'the stale instrument reason is cleared');
  const verifiedSlip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=verify-me', undefined, kv);
  equal(verifiedSlip.body.assay, 'verified', 'a verified row reads its own slip too');
  equal(verifiedSlip.body.ranked, true, 'and it stays ranked');
  equal(verifiedSlip.body.assayReason, undefined, 'a verified slip carries no reason');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=no-such-reel', undefined, kv)).status, 404, 'an unknown reel has no slip');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=reject-me&party=solo', undefined, kv)).status, 400, 'the slip keeps the strict param arithmetic');
}

async function checkAssayIndex(onRequest, queueRoute) {
  const idle = makeKv();
  await idle.put(ASSAY_INDEX_KEY, JSON.stringify(indexEnvelope([])));
  idle.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, idle, SECRET)).body.queue.length, 0, 'idle indexed queue is empty');
  equal(idle.ops.reads, 1, 'idle poll costs exactly one KV read');
  equal(idle.ops.writes, 0, 'idle poll does not rewrite its index');

  const pending = makeKv();
  await call(onRequest, 'POST', '/api/standings', post('8'.repeat(32), 20, tape('one-pending', 20)), pending);
  pending.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, pending, SECRET)).body.queue.length, 1, 'indexed pending row is served');
  equal(pending.ops.reads, 2, 'one-pending poll costs the index plus one board read');
  equal(pending.ops.writes, 0, 'live locators do not rewrite the index');

  const seeded = makeKv();
  const first = storedRowFor(20, 'the-claim', 'epoch-1-frontier');
  const second = storedRowFor(10, 'e2-hill-mine', 'epoch-2-steamworks');
  await seeded.put(KEY, JSON.stringify([first]));
  await seeded.put('standings:s2:epoch-2-steamworks:e2-hill-mine', JSON.stringify([second]));
  seeded.resetOps();
  const rebuilt = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, seeded, SECRET);
  equal(rebuilt.body.queue, [queueRow(second, 'epoch-2-steamworks', 'e2-hill-mine'), queueRow(first, 'epoch-1-frontier', 'the-claim')], 'missing index rebuild equals the seeded full-scan response');
  equal(seeded.ops.reads, 43, 'missing index rebuild reads the index twice and all 41 boards');
  equal(seeded.ops.writes, 1, 'missing index rebuild writes one index');

  await seeded.put(ASSAY_INDEX_KEY, '{broken');
  seeded.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, seeded, SECRET)).body.queue.length, 2, 'corrupt index rebuilds and serves');
  equal(seeded.ops.reads, 43, 'corrupt index rebuild reads the index twice and all 41 boards');

  const migratedLocators = (await assayIndex(seeded)).locators;
  await seeded.put(ASSAY_INDEX_KEY, JSON.stringify(migratedLocators));
  seeded.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, seeded, SECRET)).body.queue.length, 2, 'legacy bare index migrates and serves');
  const migrated = await assayIndex(seeded);
  equal(migrated.version, 1, 'legacy index is rewritten in the versioned envelope');
  ok(Number.isInteger(migrated.sweptAt), 'legacy migration records a full-sweep stamp');
  equal(seeded.ops.reads, 44, 'legacy migration performs two index reads, one full sweep, plus the assertion read');
  equal(seeded.ops.writes, 1, 'legacy migration rewrites the index once');

  const staleRows = JSON.parse(await pending.get(KEY));
  staleRows[0].assay = 'verified';
  staleRows[0].assayedAt = 1;
  staleRows[0].assayHash = 'fnv1a32:1234abcd';
  await pending.put(KEY, JSON.stringify(staleRows));
  pending.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, pending, SECRET)).body.queue.length, 0, 'stale verified locator is not served');
  equal((await assayIndex(pending)).locators.length, 0, 'stale verified locator is pruned');

  const busy = makeKv();
  const oldSweep = Date.now() - 1_000;
  await busy.put(ASSAY_INDEX_KEY, JSON.stringify(indexEnvelope([], oldSweep)));
  await call(onRequest, 'POST', '/api/standings', post('9'.repeat(32), 20, tape('busy-board', 20)), busy);
  equal((await assayIndex(busy)).sweptAt, oldSweep, 'incremental submission preserves the last full-sweep stamp');
  busy.resetOps();
  equal((await workerCall(queueRoute, 'GET', '/api/standings/assay-queue', undefined, busy, SECRET, SECRET, { ASSAY_INDEX_MAX_AGE_MS: '1' })).body.queue.length, 1, 'preserved stale stamp makes the next poll reconcile');
  equal(busy.ops.reads, 43, 'stale poll reads the index twice and all 41 boards');
  equal(busy.ops.writes, 1, 'stale poll rewrites one reconciled index');

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

/**
 * ONE GOLD NUMBER PER STANDING (F-2464-3, owner ruling 2026-09-06 "fix the board and tape gold
 * issue"). The assign in the verdict path is how the board publishes the SECURE-TICK standing for
 * a run that rode on past it, and the first two arms below keep that. What it must never do again
 * is substitute a different QUANTITY for the same instant, which is how a heat-12 Mare Claim reel
 * that banked 60 gold was published at 1180. Every arm here reds on the pre-cure code.
 */
async function checkScoreMismatch(onRequest, queueRoute, verdictRoute) {
  const secureTick = { waves: 20, timeAlive: 120, gold: 40 };
  const pendingLocator = async (kv, id) => {
    await call(onRequest, 'POST', '/api/standings', post('8'.repeat(32), 20, tape(id, 20)), kv);
    const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=1', undefined, kv, SECRET);
    return queue.body.queue[0].locator;
  };

  // A banked run: the snapshot IS the terminal tick, and it agrees. Nothing is rewritten.
  const agreeKv = makeKv();
  const agreeLocator = await pendingLocator(agreeKv, 'banked-agrees');
  const agreed = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(agreeLocator, 'verified', undefined, 'fnv1a32:1234abcd', secureTick), agreeKv, SECRET);
  equal(agreed.status, 200, 'a banked snapshot that agrees with the declared score verifies');
  equal(agreed.body.assay, 'verified', 'and the county records the verdict the worker reached');
  const agreedRow = JSON.parse(await agreeKv.get(KEY)).find((row) => row.tape.id === 'banked-agrees');
  equal({ waves: agreedRow.waves, timeAlive: agreedRow.timeAlive, gold: agreedRow.gold }, secureTick,
    'the rider keeps the score they declared');
  equal(agreedRow.securedSnapshot, secureTick, 'and the row carries the snapshot that confirmed it');

  // The same instant, a different gold: the defect this task was opened for.
  const mismatchKv = makeKv();
  const mismatchLocator = await pendingLocator(mismatchKv, 'banked-disagrees');
  const refused = await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(mismatchLocator, 'verified', undefined, 'fnv1a32:1234abcd', { ...secureTick, gold: 1_180 }), mismatchKv, SECRET);
  equal(refused.status, 200, 'the verdict endpoint still answers the worker');
  equal({ assay: refused.body.assay, reason: refused.body.reason }, { assay: 'rejected', reason: 'score_mismatch' },
    'a verified verdict whose snapshot contradicts the score at one tick is answered as a named rejection');
  const refusedRow = JSON.parse(await mismatchKv.get(KEY)).find((row) => row.tape.id === 'banked-disagrees');
  equal({ assay: refusedRow.assay, gold: refusedRow.gold, reason: refusedRow.assayReason, snapshot: refusedRow.securedSnapshot },
    { assay: 'rejected', gold: 40, reason: 'score_mismatch', snapshot: undefined },
    'the row is rejected with its reason and the rider\'s gold is never overwritten');
  const slip = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=banked-disagrees', undefined, mismatchKv);
  equal({ assay: slip.body.assay, reason: slip.body.assayReason, ranked: slip.body.ranked },
    { assay: 'rejected', reason: 'score_mismatch', ranked: false }, 'and the rider can read the reason on their own slip');
  equal((await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, mismatchKv)).body.board.length, 0,
    'a score-mismatched row holds no rank');

  // Overtime: the secure tick precedes the terminal tick, so a different gold is honest and the
  // snapshot still becomes the standing.
  const overtimeKv = makeKv();
  const overtimeLocator = await pendingLocator(overtimeKv, 'rode-on');
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(overtimeLocator, 'verified', undefined, 'fnv1a32:1234abcd', { waves: 10, timeAlive: 60, gold: 1_180 }), overtimeKv, SECRET)).body.assay,
    'verified', 'a snapshot taken before the terminal tick may carry its own gold');
  const rodeOn = JSON.parse(await overtimeKv.get(KEY)).find((row) => row.tape.id === 'rode-on');
  equal({ waves: rodeOn.waves, timeAlive: rodeOn.timeAlive, gold: rodeOn.gold }, { waves: 10, timeAlive: 60, gold: 1_180 },
    'and the standing is still the secure tick, not the end of the ride');

  // An impossible snapshot — the claim secured after the run ended — is refused on its own.
  const impossibleKv = makeKv();
  const impossibleLocator = await pendingLocator(impossibleKv, 'secured-after-the-end');
  equal((await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict',
    verdict(impossibleLocator, 'verified', undefined, 'fnv1a32:1234abcd', { waves: 21, timeAlive: 120, gold: 40 }), impossibleKv, SECRET)).body.reason,
    'score_mismatch', 'a snapshot deeper than the score it belongs to is impossible, whatever its gold says');
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

async function checkVerdictSlipExactMatch(onRequest, queueRoute, verdictRoute) {
  const kv = makeKv();
  const collisionId = JSON.parse(readFileSync('artifacts/assay-e2e-20260822/round2/tape-run1.json', 'utf8')).id;
  const uniqueId = `${collisionId}-00000000-0000-4000-8000-000000000000`;
  await call(onRequest, 'POST', '/api/standings', post('6'.repeat(32), 10, tape(collisionId, 10)), kv);
  await call(onRequest, 'POST', '/api/standings', post('7'.repeat(32), 20, tape(uniqueId, 20)), kv);
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=2', undefined, kv, SECRET);
  for (const row of queue.body.queue) {
    await workerCall(verdictRoute, 'POST', '/api/standings/assay-verdict', verdict(row.locator, 'rejected', `reason:${row.locator.tapeId}`), kv, SECRET);
  }
  const slip = await call(onRequest, 'GET', `/api/standings?contract=the-claim&epoch=epoch-1-frontier&verdict=${uniqueId}`, undefined, kv);
  equal(slip.body.tapeId, uniqueId, 'the round-2 collision prefix resolves only the full id');
  equal(slip.body.assayReason, `reason:${uniqueId}`, 'the exact matching slip is reachable');
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

  // (d) A v1 tape has no complete era papers, so the era-5 clerk refuses it before storage.
  const legacyTape = tape('legacy-shaped', 90);
  const legacyPost = post('b'.repeat(32), 90, legacyTape);
  legacyPost.tape = legacyTape;
  const v1 = await call(onRequest, 'POST', '/api/standings', legacyPost, kv);
  equal(v1.status, 400, 'the current-era door refuses a v1 tape with no era papers');
  equal(v1.body.error, 'reel_not_current', 'the v1 refusal names the current-era law');
  const board = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
  equal(board.body.board.length, 1, 'the v1 row holds no rank in the assayed season');
  equal(board.body.board[0].assay, 'pending', 'the assayable v2 row is what the fresh season shows');
  ok(!JSON.parse(await kv.get(KEY)).some((row) => row.tape?.id === 'legacy-shaped'), 'the v1 row never enters storage');
  equal(await kv.get(ARCHIVE_KEY), archiveBytes, 'a whole current-season lifecycle never touched season one');
}

async function checkRotationBoard(onRequest) {
  const rotation = rotationSeeds.rotations[0];
  const openAt = Date.parse(rotation.opensAt) + 1;
  const priorNow = Date.now;
  Date.now = () => openAt;
  try {
    const kv = makeKv();
    const publicRow = storedRowFor(40, 'the-claim', 'epoch-1-frontier');
    publicRow.assay = 'verified';
    publicRow.assayedAt = openAt;
    publicRow.assayHash = 'fnv1a32:1234abcd';
    publicRow.stack = { declaredBy: 'self', model: 'transfer-test', harness: 'test-rig', harnessVersion: '1', harnessDigest: 'c'.repeat(64) };
    await kv.put(KEY, JSON.stringify([publicRow]));

    const before = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
    const accepted = await call(onRequest, 'POST', '/api/standings', rotationPost('d'.repeat(32), 12, rotation.seeds['the-claim']), kv);
    equal(accepted.body.rotationId, rotation.id, 'an open rotation seed is admitted and stamped');
    const stored = JSON.parse(await kv.get(KEY));
    const rotationRow = stored.find((row) => row.rotationId === rotation.id);
    equal(rotationRow.rotationId, rotation.id, 'the stored row carries its rotation id');
    rotationRow.assay = 'verified';
    rotationRow.assayedAt = openAt;
    rotationRow.assayHash = 'fnv1a32:1234abcd';
    await kv.put(KEY, JSON.stringify(stored));

    const transfer = await call(onRequest, 'GET', `/api/standings?board=transfer&rotation=${rotation.id}`, undefined, kv);
    equal(transfer.status, 200, 'the transfer board is readable by rotation id');
    const claim = transfer.body.standings.find((standing) => standing.contractId === 'the-claim');
    equal(claim.board.map((row) => [row.rotationId, row.waves]), [[rotation.id, 12]], 'the transfer board contains verified rotation rows only');

    const after = await call(onRequest, 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined, kv);
    equal(after.body.board[0].heldOut, { rotationId: rotation.id, waves: 12 }, 'a public row joins its same-digest held-out result');
    const withoutHeldOut = (response) => response.body.board.map(({ heldOut, ...row }) => row);
    equal(JSON.stringify(withoutHeldOut(after)), JSON.stringify(withoutHeldOut(before)), 'public board rows are byte-identical apart from the additive heldOut cell');

    Date.now = () => Date.parse(rotation.closesAt);
    const refused = await call(onRequest, 'POST', '/api/standings', rotationPost('e'.repeat(32), 13, rotation.seeds['the-claim']), kv);
    equal(refused.body.error, 'rotation_closed', 'the same rotation seed is refused at the closing instant');
    const ordinary = post('f'.repeat(32), 4);
    ordinary.seed = 'outside-the-registry';
    equal((await call(onRequest, 'POST', '/api/standings', ordinary, makeKv())).status, 200, 'a live seed outside the registry keeps its prior behavior');
  } finally {
    Date.now = priorNow;
  }
}

function post(anonId, waves, runTape, contractId = 'the-claim', epochId = 'epoch-1-frontier') {
  const submittedTape = runTape ? currentEraTape(runTape) : undefined;
  const inputLogHash = submittedTape ? createHash('sha256').update(JSON.stringify(submittedTape.inputLog)).digest('hex') : 'b'.repeat(64);
  return {
    contractId, epochId,
    score: { secured: true, waves, timeAlive: 120, gold: 40, baseValue: 60 },
    profileName: 'Assay Test', anonId, difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64), inputLogHash, ...(submittedTape ? { tape: submittedTape } : {}),
  };
}

function rotationPost(anonId, waves, seed) {
  const payload = post(anonId, waves, tapeV2(`rotation-${anonId.slice(0, 4)}`, waves));
  payload.seed = payload.tape.seed = payload.tape.inputLog.seed = seed;
  payload.seedMode = 'bench';
  payload.seedHash = createHash('sha256').update(seed).digest('hex');
  payload.inputLogHash = createHash('sha256').update(JSON.stringify(payload.tape.inputLog)).digest('hex');
  payload.stack = { model: 'transfer-test', harness: 'test-rig', harnessVersion: '1', harnessDigest: 'c'.repeat(64) };
  return payload;
}

function tape(id, waves, eventLogHash = 'fnv1a32:1234abcd', contractId = 'the-claim') {
  return {
    version: 1, id, createdAt: 1, kept: true, contract: contractId, seed: 'gold-rush', difficulty: 'trail', simVersion: 1,
    inputLog: {
      version: 1, name: id, contractId, seed: 'gold-rush', difficultyPreset: 'trail', stepSeconds: 1 / 30,
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

function bankedPost(runTape, anonId) {
  runTape = currentEraTape(runTape);
  return {
    contractId: runTape.contract,
    epochId: 'epoch-1-frontier',
    score: {
      secured: runTape.outcome.secured,
      waves: runTape.outcome.waves,
      timeAlive: runTape.outcome.timeAlive,
      gold: runTape.outcome.gold,
      baseValue: 0,
    },
    profileName: 'Banked Baron',
    anonId,
    difficulty: runTape.difficulty,
    seed: runTape.seed,
    seedMode: 'bench',
    seedHash: createHash('sha256').update(runTape.seed).digest('hex'),
    inputLogHash: createHash('sha256').update(JSON.stringify(runTape.inputLog)).digest('hex'),
    tape: runTape,
  };
}

function currentEraTape(runTape) {
  const meta = { buildId: runTape.meta?.buildId ?? 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era };
  if (runTape.version === 2) return { ...runTape, meta };
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  return {
    ...runTape,
    version: 2,
    meta,
    runStart: { meta: progress, research: { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null } },
  };
}

// A reel written by the browser's own recorder and submitted the way Game.ts submits a secured standing
// (Game.ts 8104-8143): `snapshot(outcome, eventLog)`, then `submittedRunTape`, then the body around it.
// The playbook is recorded and read back off the shelf exactly as a named playbook is before its use
// (`PlaybookRecorderSession.finish`, then `parsePlaybookText`, Game.ts:3900-3907).
function recorderReel(kit, anonId, { playbook = false, motor = false, dispatch = null, recover = false, seatOrders = null } = {}) {
  const { RunTapeRecorder, PlaybookRecorderSession, parsePlaybookText, intentsFromLockstepInput, lockstepInputFromIntents, submittedRunTape } = kit;
  const [contract, seed, difficulty] = ['the-claim', 'gold-rush', 'trail'];
  const start = { x: 0.25, z: 12.5 };
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  const recorder = new RunTapeRecorder({
    contract, seed, difficulty,
    meta: { buildId: 'dev', viewVersion: engineEra.viewSchema.version, engineHash: engineEra.engineHash, era: engineEra.era },
    start,
    runStart: { meta: progress, research: { version: 1, epochId: 'epoch-1-frontier', metaScienceCursor: 0, progress, taken: [], proposalSalt: 0, pinnedTarget: null, unlocks: {} } },
  });
  const move = (mx, my) => intentsFromLockstepInput({ mx, my, actions: [] });
  const shelf = new PlaybookRecorderSession({ contractId: contract, seed, difficultyPreset: difficulty, start }, null);
  shelf.recordTick(lockstepInputFromIntents(move(0, -1)), start);
  shelf.recordTick(lockstepInputFromIntents(move(1, 0), { queuedActions: [{ type: 'place_build', id: 'palisade', position: { x: 1, z: 9 }, rotationSteps: 0 }] }), start);
  shelf.recordTick(lockstepInputFromIntents(move(0, 0)), start);
  const shelved = parsePlaybookText(shelf.finish('Assay Patrol').text);
  if (!shelved.ok) throw new Error(`the shelf playbook did not parse: ${shelved.reason}`);
  recorder.record(move(1, 0), start);
  recorder.record(move(1, 0), { x: 0.5, z: 12.5 });
  recorder.recordAction({ type: 'place_build', id: 'sluice', position: { x: 2, z: 10 }, rotationSteps: 1 });
  // A solo dispatch reaches the recorder twice, as in Game.ts: `recordRunTapeAction` (:8261) and the tick's
  // own action list (:2982-2984, :7969-7974). The recorder keeps one (RunTape.ts `record`, the routed dedupe).
  const dispatched = dispatch ? [{ type: 'prospector_dispatch', node: dispatch }] : [];
  dispatched.forEach((action) => recorder.recordAction(action));
  recorder.record(move(0, 1), { x: 0.75, z: 12.5 }, dispatched);
  if (motor) recorder.recordMotorAction('motor_grade', { x: 3.14159, z: 7.5 });
  if (playbook) recorder.recordPlaybookUse(shelved.playbook);
  if (recover) recorder.recordAction({ type: 'context_action', action: 'recover' });
  recorder.record(move(0, 0), { x: 0.75, z: 12.75 });
  // A seated agent rider's orders arrive among its own slot's actions and land in that slot's stream
  // (Game.ts:7975-7986), in the shape `SeatedLockstepSim.submitOrders` builds.
  if (seatOrders) recorder.recordAdditional(1, move(0, 0), { x: 1, z: 13 }, [seatOrders]);
  recorder.record(move(-0.5, 0.25), { x: 0.75, z: 12.75 });
  if (motor) recorder.recordMotorAction('motor_haul', { x: 4, z: 8 });
  recorder.record(move(0, 0), { x: 0.625, z: 12.875 });
  const runTape = recorder.snapshot(
    { reason: 'secured', secured: true, waves: 10, timeAlive: 120, gold: 40 },
    { ...recorder.eventLog(), kills: 3, gold: 40, wave: 10, economy: { banked: 40 } },
  );
  const submittedTape = submittedRunTape(runTape);
  const sha256 = (text) => createHash('sha256').update(text).digest('hex');
  return {
    runTape,
    body: {
      contractId: contract,
      epochId: 'epoch-1-frontier',
      score: { secured: true, waves: 10, timeAlive: 120, gold: 40, baseValue: 60 },
      profileName: 'Recorder Reel',
      anonId,
      difficulty,
      seed,
      seedMode: 'live',
      seedHash: sha256(seed),
      inputLogHash: sha256(JSON.stringify(runTape.inputLog)),
      // A ride with a seated agent rider is a posse (DeclaredStack.ts `multiplayerStandingParty`).
      ...(seatOrders ? { party: { riderCount: 2, riders: [{ name: 'Recorder Reel' }, { name: 'Order Rider', stack: {} }] } } : {}),
      ...(submittedTape ? { tape: submittedTape } : {}),
    },
  };
}

function storedRowFor(index, contractId, epochId) {
  const runTape = tape(`seed-${index}`, 100 - index, 'fnv1a32:1234abcd', contractId);
  const payload = post(index.toString(16).padStart(32, '0'), 100 - index, runTape, contractId, epochId);
  return {
    ...payload.score, profileName: `Seed ${index}`, anonId: payload.anonId, difficulty: payload.difficulty,
    seed: payload.seed, seedMode: payload.seedMode, seedHash: payload.seedHash, inputLogHash: payload.inputLogHash,
    submittedAt: index + 1, tape: payload.tape, assay: 'pending',
  };
}

function queueRow(row, epochId, contractId) {
  return {
    locator: { epochId, contractId, tapeId: row.tape.id, rowId: `${row.anonId}:1:${row.submittedAt}:${row.inputLogHash}` },
    tape: row.tape,
    score: { secured: true, waves: row.waves, timeAlive: row.timeAlive, gold: row.gold, baseValue: row.baseValue },
    submittedAt: row.submittedAt,
  };
}

function verdict(locator, verdictValue, reason, replayedHash = 'fnv1a32:1234abcd', securedSnapshot = { waves: 10, timeAlive: 120, gold: 40 }) {
  return {
    locator, verdict: verdictValue,
    ...(verdictValue === 'unassayable' ? {} : { replayedHash }),
    ...(verdictValue === 'verified' ? { securedSnapshot } : {}),
    ...(reason ? { reason } : {}),
  };
}

async function call(route, method, url, body, kv) {
  return workerCall(route, method, url, body, kv);
}

async function workerCall(route, method, url, body, kv, secret, key = secret, extraEnv = {}) {
  const headers = new Headers(body === undefined ? {} : { 'content-type': 'application/json' });
  if (key !== undefined) headers.set('x-assay-key', key);
  if (backend === 'sqlite') {
    const base = await serviceFor(kv, secret, extraEnv);
    const response = await fetch(`${base}${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  }
  const response = await route({
    request: new Request(`http://127.0.0.1${url}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }),
    env: { TELEMETRY: kv, ...(secret === undefined ? {} : { ASSAY_WORKER_SECRET: secret }), ...extraEnv },
  });
  return { status: response.status, body: await response.json() };
}

function makeKv({ barrierIndexReads = 0, pauseAfterBoardReads = 0 } = {}) {
  const values = new Map();
  const storage = backend === 'sqlite'
    ? new SqliteStorage(path.join(sqliteRoot, `${sqliteId += 1}.db`))
    : {
        get: async (key) => values.get(key) ?? null,
        put: async (key, value) => { values.set(key, value); },
        list: async ({ prefix = '', cursor = '' } = {}) => {
          const keys = [...values.keys()].filter((key) => key.startsWith(prefix) && key > cursor).sort().map((name) => ({ name }));
          return { keys, list_complete: true };
        },
      };
  if (backend === 'sqlite') sqliteStores.push(storage);
  const ops = { reads: 0, writes: 0 };
  let blockedIndexReads = 0;
  let releaseIndexReads;
  const indexReadBarrier = barrierIndexReads > 0 && new Promise((resolve) => { releaseIndexReads = resolve; });
  let boardReads = 0;
  let signalBoardSweep;
  let releaseBoardSweep;
  const boardSweepReached = pauseAfterBoardReads > 0 && new Promise((resolve) => { signalBoardSweep = resolve; });
  const boardSweepBarrier = pauseAfterBoardReads > 0 && new Promise((resolve) => { releaseBoardSweep = resolve; });
  return {
    ops,
    resetOps: () => { ops.reads = 0; ops.writes = 0; },
    waitForBoardSweep: () => boardSweepReached,
    releaseBoardSweep: () => releaseBoardSweep?.(),
    get: async (key) => {
      ops.reads += 1;
      const value = await storage.get(key);
      if (key === ASSAY_INDEX_KEY && blockedIndexReads < barrierIndexReads) {
        blockedIndexReads += 1;
        if (blockedIndexReads === barrierIndexReads) releaseIndexReads();
        await indexReadBarrier;
      }
      if (key.startsWith('standings:') && pauseAfterBoardReads > 0 && ++boardReads === pauseAfterBoardReads) {
        signalBoardSweep();
        await boardSweepBarrier;
      }
      return value;
    },
    put: async (key, value, options) => { ops.writes += 1; await storage.put(key, value, options); },
    delete: (key) => storage.delete?.(key),
    list: (options) => storage.list?.(options),
    ...(storage.recordRefusal ? { recordRefusal: (record) => storage.recordRefusal(record) } : {}),
    ...(storage.readRefusals ? { readRefusals: (query) => storage.readRefusals(query) } : {}),
  };
}

async function serviceFor(storage, secret, extraEnv) {
  let services = serversByStorage.get(storage);
  if (!services) {
    services = new Map();
    serversByStorage.set(storage, services);
  }
  const key = JSON.stringify({ secret, extraEnv });
  if (services.has(key)) return services.get(key);
  const server = await createLedgerServer({
    storage,
    handlers: httpRoutes,
    env: { ...(secret === undefined ? {} : { ASSAY_WORKER_SECRET: secret }), ...extraEnv },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  httpServers.push(server);
  const base = `http://127.0.0.1:${server.address().port}`;
  services.set(key, base);
  return base;
}

function indexEnvelope(locators, sweptAt = Date.now()) {
  return { version: 1, sweptAt, locators };
}

async function assayIndex(kv) {
  const parsed = JSON.parse(await kv.get(ASSAY_INDEX_KEY));
  return Array.isArray(parsed) ? { version: 0, sweptAt: null, locators: parsed } : parsed;
}

function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  checks += 1;
}

function ok(value, message) {
  assert.ok(value, message);
  checks += 1;
}
