import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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
  const { submittedRunTape, validateRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  const { CONTRACT_BUNDLES, MAX_PLAYBOOK_INTENTS, MAX_PLAYBOOK_TICKS, maxRunTapeTicksForContract, runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  const { onRequest: onRequestAssayQueue } = await vite.ssrLoadModule('/functions/api/standings/assay-queue.ts');
  const { onRequest: onRequestAssayVerdict } = await vite.ssrLoadModule('/functions/api/standings/assay-verdict.ts');
  const { onRequest: onRequestRefusals } = await vite.ssrLoadModule('/functions/api/refusals.ts');
  httpRoutes = {
    '/api/standings': onRequest,
    '/api/standings/assay-queue': onRequestAssayQueue,
    '/api/standings/assay-verdict': onRequestAssayVerdict,
    '/api/refusals': onRequestRefusals,
  };
  for (backend of ['kv', 'sqlite']) {
    checks = 0;
    await checkDoorEnvelopes(onRequest, validateTape, validateRunTape, submittedRunTape, maxRunTapeTicksForContract, runTapeEnvelopeForContract, CONTRACT_BUNDLES, MAX_PLAYBOOK_TICKS, MAX_PLAYBOOK_INTENTS, MAX_JSON_BYTES);
    checkTapeBuildMetadata(validateTape);
    await checkEngineHashReel(onRequest);
    await checkReplayableBoard(onRequest);
    await checkOperatorProbes(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkAssayIndexRace(onRequest, onRequestAssayQueue);
    await checkPosts(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
    await checkPreserveRanking(onRequest, compareScores);
    await checkBankedBaronTapes(onRequest, onRequestAssayQueue, onRequestAssayVerdict, validateTape, validateRunTape);
    await checkBankedHeat11Tapes(onRequest, validateTape, validateRunTape);
    await checkVerdicts(onRequest, onRequestAssayQueue, onRequestAssayVerdict);
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
  equal(verifiedCell.assayStrip.era, { id: 'b8cf2332d', label: 'Same-Game era' }, 'verified row carries its era');
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
  await kv.put(key, JSON.stringify([retired, current]));
  const storedBytes = await kv.get(key);

  const response = await call(onRequest, 'GET', '/api/standings?contract=e1-baron&epoch=epoch-1-frontier', undefined, kv);
  equal(response.body.board.map(({ rank, profileName }) => ({ rank, profileName })), [{ rank: 1, profileName: 'The Walking Crown' }], 'e1-baron mints only the era-current crown');
  equal(response.body.retiredCount, 1, 'the cross-era Baron crown is counted as retired');
  equal(await kv.get(key), storedBytes, 'reading the replayable board leaves both raw rows byte-identical');

  const staleTape = { ...tapeV2('stale-door', 1), meta: { buildId: 'deadbeef', engineHash: '0'.repeat(64), era: engineEra.era - 1 } };
  const stalePost = post('d'.repeat(32), 1, staleTape);
  stalePost.tape = staleTape;
  const refused = await call(onRequest, 'POST', '/api/standings', stalePost, kv);
  equal(refused.status, 400, 'a cross-era submission is refused at the door');
  equal(refused.body.error, 'reel_not_current', 'the door names the current-era failure');
  equal(refused.body.message, `This reel rode era ${engineEra.era - 1}; the county accepts era ${engineEra.era} '${engineEra.name}'.`, 'the door gives the honest era reason');
  equal(await kv.get(key), storedBytes, 'the refused tape is never stored');
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

async function checkPosts(onRequest, queueRoute, verdictRoute) {
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
  oversized.profileName = 'x'.repeat(2 * 1024 * 1024);
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
  equal(clockCensus, { total: 42, derived: 24, explicit: 18, missing: 0 }, 'contract clock census is pinned');
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
  }), [
    ['the-claim', 18_002, 592_544, 3_601, 802_080],
    ['e1-drill-yard', 18_002, 592_544, 3_601, 802_080],
    ['e1-dry-gulch', 18_002, 592_544, 3_601, 802_080],
    ['e1-night-shift', 22_502, 736_544, 4_501, 802_080],
    ['e1-twin-banks', 18_002, 592_544, 3_601, 802_080],
    ['e1-baron', 20_350, 667_584, 4_070, 802_080],
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
  for (const contractId of ['e6-half-life-hollow', 'e6-picnic', 'e7-relay-rush']) {
    const submission = JSON.parse(readFileSync(`artifacts/gauntlet-heat11-20260903/rides/${contractId}/opus/submission.json`, 'utf8'));
    submission.tape = currentEraTape(submission.tape);
    ok(validateTape(submission.tape, contractId, submission.seed, submission.difficulty), `${contractId} heat-11 tape clears the standings validator`);
    ok(validateRunTape(submission.tape), `${contractId} heat-11 tape clears the assay validator`);
    equal((await call(onRequest, 'POST', '/api/standings', submission, makeKv())).status, 200, `${contractId} heat-11 submission is accepted locally`);
  }
}

async function checkBankedBaronTapes(onRequest, queueRoute, verdictRoute, validateTape, validateRunTape) {
  const kv = makeKv();
  const tapes = [1, 2].map((run) => JSON.parse(readFileSync(`artifacts/gauntlet-heat6-20260825/e1-baron/run-${run}-tape.json`, 'utf8')));
  for (const [index, runTape] of tapes.entries()) {
    ok(validateTape(runTape, runTape.contract, runTape.seed, runTape.difficulty), `banked Baron tape ${index + 1} clears the standings validator`);
    ok(validateRunTape({ ...runTape, meta: { buildId: runTape.meta.buildId } }), `banked Baron tape ${index + 1} clears the assay validator`);
    const submitted = await call(onRequest, 'POST', '/api/standings', bankedPost(runTape, `${index + 7}`.repeat(32)), kv);
    equal(submitted.status, 200, `banked Baron tape ${index + 1} submits`);
  }
  const queue = await workerCall(queueRoute, 'GET', '/api/standings/assay-queue?limit=10', undefined, kv, SECRET);
  equal(queue.body.queue.length, 2, 'both banked Baron tapes enter the assay queue');
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
