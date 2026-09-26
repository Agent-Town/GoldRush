import benchSeeds from '../../assets/contracts/bench-seeds.json' with { type: 'json' };
import rotationSeeds from '../../assets/rotations/rotation-seeds.json' with { type: 'json' };
import engineEra from '../../assets/engine-era.json' with { type: 'json' };
import nullFloors from '../../assets/contracts/null-floors.json' with { type: 'json' };
import type { DifficultyPresetId } from '../../src/game/Balance';
import { validateRunTape } from '../../src/game/RunTape';
import { normalizeLockstepAction } from '../../src/mp/LockstepClient';
import { validateStandingOrders } from '../../src/agent/StandingOrders';
import { CONTRACT_BUNDLES, runTapeEnvelopeForContract, validatePlaybook, type RunTapeEnvelope } from '../../src/playbook/PlaybookFormat';
import { engineEraIncludes } from '../../src/replay/EngineEraLineage.mjs';
import { resolveSeasonAt, SEASONS } from '../../src/seasons/registry';
import { constantTimeEqual } from './_compare';
import { bumpCounter, clientIpHash } from './_ratelimit';
import { recordSubmissionRefusal, type AssayRejectionReason, type RefusalStorage, type SubmissionRefusalReason } from './refusals';
import type { LedgerStorage } from './_accounts';

type StandingsStorage = Pick<LedgerStorage, 'get' | 'put'> & Pick<RefusalStorage, 'recordRefusal' | 'readRefusals'>;

type StandingsEnv = {
  TELEMETRY?: StandingsStorage;
  ACCOUNTS?: StandingsStorage;
  ASSAY_WORKER_SECRET?: string;
  ASSAY_INDEX_MAX_AGE_MS?: string;
  ALLOWED_CORS_ORIGINS?: ReadonlySet<string>;
  // kv-counters-to-ledger-2 (F-KV1-5): where the county's boards live. Bound on the Pages project (the
  // ops evening, Part C step 9), this copy answers every request with a 308 there (`canonicalRedirect`).
  STANDINGS_CANONICAL_ORIGIN?: string;
};

type StandingsContext = {
  request: Request;
  env: StandingsEnv;
};

type JsonRecord = Record<string, unknown>;

type ScoreRow = {
  secured: boolean;
  waves: number;
  timeAlive: number;
  gold: number;
  baseValue: number;
  preserveWavesAlive?: number;
  preserveHpFraction?: number;
};

type SecuredSnapshot = Pick<ScoreRow, 'waves' | 'timeAlive' | 'gold'>;

// THE MECHANIC A MAP IS ABOUT (F-HEAT15-4, owner ruling 2026-09-22, verbatim: "F-HEAT15-4: yes" —
// option (a), "a reel that finished the race supersedes one that did not — the mechanic beats the
// walk"). NOT A SCORE: it is never in `SCORE_KEYS`, so a rider cannot declare it; the county only
// ever learns it from an assay verdict, which is a replay of the rider's own reel.
type MechanicOutcome = { id: string; complete: boolean };

type SeedMode = 'live' | 'bench';

type Rotation = {
  id: string;
  opensAt: string;
  closesAt: string;
  seeds: Record<string, string>;
};

type SelfDeclaredStack = {
  declaredBy: 'self';
  model?: string;
  harness?: string;
  harnessVersion?: string;
  harnessDigest?: string;
  harnessRef?: string;
  worldModel?: string;
  config?: string;
  source?: string;
  tokensIn?: number;
  tokensOut?: number;
  calls?: number;
};

// History (AP-06): the county board was only ever handed rider names because a declared stack
// was treated as a species tell and the ladder stayed species-blind. Owner ruling 2026-08-08
// supersedes that display law: rank stays outcome-only, but every row names its declared mind.
type PartyRider = {
  name: string;
  stack?: SelfDeclaredStack;
};

type SubmittedParty = {
  riderCount: number;
  riders: PartyRider[];
};

// THE LINEAGE MARK (ADR-004, owner ruling 2026-09-06). Set by the reassay verb when a contract's
// composition changed under standings that were honestly verified; it says WHY the row went back
// into the queue, and it is what tells the verdict endpoint that a `rejected` on this row is a
// RETIREMENT (the county moved the ground) rather than a rider's failed claim.
type LineageMark = {
  reason: string;
  requeuedAt: number;
};

type StoredRow = ScoreRow & {
  profileName: string;
  anonId: string;
  difficulty: DifficultyPresetId;
  defaulted?: true;
  seed?: string;
  seedMode?: SeedMode;
  seedHash: string;
  inputLogHash: string;
  submittedAt: number;
  stack?: SelfDeclaredStack;
  party?: SubmittedParty;
  tape?: JsonRecord;
  // `retired` is a TERMINAL LINEAGE outcome, not a rider verdict: the reel no longer replays because
  // its contract's composition moved after the ride. It is unranked, counted in `retiredCount`,
  // stored forever (retention law) and still served by WATCH and the assay slip.
  assay?: 'pending' | 'verified' | 'rejected' | 'unassayable' | 'retired';
  assayedAt?: number;
  assayHash?: string;
  assayReason?: string;
  orders?: number;
  securedSnapshot?: SecuredSnapshot;
  // Written ONLY by the assay verdict, ONLY on `verified`, and ONLY for a MECHANIC_CONTRACTS
  // contract; cleared by every other verdict and by the re-assay verb, so it is always a fact
  // about the row's CURRENT verification rather than a mark it keeps after one (F-HEAT15-4).
  mechanic?: MechanicOutcome;
  rotationId?: string;
  lineage?: LineageMark;
};

type AssayLocator = {
  epochId: string;
  contractId: string;
  tapeId: string;
  rowId: string;
  submittedAt: number;
};

type AssayIndex = {
  version: 1;
  sweptAt: number;
  locators: AssayLocator[];
};

type GroupAggregate = {
  standings: number;
  contracts: number;
  crowns: number;
  bestWaves: number;
  totalTokensIn?: number;
  totalTokensOut?: number;
  totalCalls?: number;
  declaredCells: number;
  undeclaredCells: number;
  latestSubmittedAt: number;
};

type BoardGroup = { contracts: Map<string, unknown>; aggregate: GroupAggregate };

const CONTRACT_EPOCHS = new Map(
  CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts.map((contract) => [contract.id, bundle.epochId] as const)),
);
const PRESERVE_CONTRACTS = new Set(CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts
  .filter((contract) => 'preserve' in contract.twist)
  .map((contract) => contract.id)));
// THE MECHANIC BOARDS (F-HEAT15-4). Hand-mirrored from `HeadlessContractSim.MECHANIC_OUTCOMES` —
// the door is a Cloudflare worker and cannot import the engine, so the two lists are pinned equal
// by `scripts/skillmd-guard.test.mjs` instead. `PRESERVE_CONTRACTS` above derives itself from the
// bundles because `twist.preserve` is declared there; a signature mechanic is not a twist field,
// it is a predicate over the sim's diagnostics, so it cannot be derived the same way.
const MECHANIC_CONTRACTS: ReadonlySet<string> = new Set(['e5-regatta']);
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
// THE OUTER WALL, and it is derived rather than authored: the widest per-contract reel plus 44 KiB
// of request metadata. It is NOT the refusal a rider meets first. Side by side after F-HEAT12-2's
// two-class pricing (`PlaybookFormat.runTapeEnvelopeForContract`):
//   per-contract reel ceiling, `e9-dome-basin`   1,938,784 B  (was 592,544)  <- `validateTape`
//   outer wall, every request                    2,531,360 B  (was 802,080)  <- `readJson`
// Both moved together because this line reads the envelope; neither number is written down twice.
export const MAX_JSON_BYTES = Math.max(...CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts
  .map((contract) => runTapeEnvelopeForContract(contract.id).maxTapeBytes))) + 44 * 1024;
const MAX_ROWS = 100;
const ASSAY_QUEUE_INDEX_KEY = 'assay-queue-index';
const ASSAY_INDEX_KEYS = new Set(['epochId', 'contractId', 'tapeId', 'rowId', 'submittedAt']);
const ASSAY_INDEX_ENVELOPE_KEYS = new Set(['version', 'sweptAt', 'locators']);
const ASSAY_INDEX_MAX_AGE_MS = 900_000;
// Owner ruling 2026-09-06 ("sure, raise it", F-HEAT12-8): a heat rides more than twelve contracts an hour from one
// rider and one host; 30 per rider and 120 per address leave the assayer's queue, not the door, as the pace.
// F-HEAT14-7, owner ruling 2026-09-19 ("I agree with all your recommendations on the decisions - good
// work"; the register: "(b) and (a) together: a real hour and a cap of 60"). Heat 14 rode 37 board
// contracts from one rider, so 30 locked its tail out — and because the hour re-armed on every
// accepted write, it was 30 per HEAT, not per hour. The hour is now real (`_ratelimit.ts` stores the
// window start); 60 leaves room for a rider that plays every board once and then re-posts. The cap is
// against floods, not against a rider playing the whole book; `anonId` was never the abuse control —
// the per-address 120 is.
const MAX_REQUESTS_PER_ANON = 60;
const MAX_REQUESTS_PER_IP = 120;
const RATE_TTL_SECONDS = 60 * 60;
const SHA256 = /^[a-f0-9]{64}$/;
const ANON_ID = /^[a-f0-9]{32}$/;
const MAX_SEED_LENGTH = 256;
const MAX_STACK_FIELD_LENGTH = 256;
const MAX_WORLD_MODEL_LENGTH = 64;
const MAX_STACK_COST = 1_000_000_000_000;
const STACK_TEXT_FIELDS = ['model', 'harness', 'harnessVersion', 'worldModel', 'config'] as const;
const STACK_COST_FIELDS = ['tokensIn', 'tokensOut', 'calls'] as const;
const STACK_KEYS = new Set<string>([...STACK_TEXT_FIELDS, ...STACK_COST_FIELDS, 'source', 'harnessDigest', 'harnessRef']);
const STORED_STACK_KEYS = new Set([...STACK_KEYS, 'declaredBy']);
const POST_KEYS = new Set(['contractId', 'epochId', 'score', 'profileName', 'anonId', 'difficulty', 'seed', 'seedMode', 'seedHash', 'inputLogHash', 'stack', 'party', 'tape']);
const SCORE_KEYS = new Set(['secured', 'waves', 'timeAlive', 'gold', 'baseValue', 'preserveWavesAlive', 'preserveHpFraction']);
const PARTY_KEYS = new Set(['riderCount', 'riders']);
const RIDER_KEYS = new Set(['name', 'stack']);
// Two riders is the smallest posse; four is the lockstep slot ceiling the tape format already
// enforces (primarySlot 0..3 + at most three extra streams), so the board can never advertise a
// party size the replay machinery could not have produced.
const MIN_PARTY_RIDERS = 2;
const MAX_PARTY_RIDERS = 4;
const PARTY_FILTERS = new Set(['solo', '2', '3', '4']);
const UNDECLARED_RIDER = 'undeclared rider';
const UNDECLARED_RIG = 'undeclared rig';
const UNREGISTERED_RIG = 'unregistered rig';
const MAX_REEL_ID_LENGTH = 64;
const MAX_ASSAY_QUEUE = 100;
const MAX_ASSAY_REASON_LENGTH = 256;
const ASSAY_HASH = /^fnv1a32:[a-f0-9]{8}$/;
const ASSAY_ROW_ID = /^[a-f0-9]{32}:[1-4]:\d{1,16}:[a-f0-9]{64}$/;
const ASSAY_VERDICT_KEYS = new Set(['locator', 'verdict', 'replayedHash', 'reason', 'securedSnapshot', 'mechanic']);
const SECURED_SNAPSHOT_KEYS = new Set(['waves', 'timeAlive', 'gold']);
const MECHANIC_KEYS = new Set(['id', 'complete']);
const MAX_MECHANIC_ID_LENGTH = 64;
const ASSAY_LOCATOR_KEYS = new Set(['epochId', 'contractId', 'tapeId', 'rowId']);
const REASSAY_KEYS = new Set(['epochId', 'contractId', 'reason', 'includeRetired', 'storedUnassayed']);
const LINEAGE_KEYS = new Set(['reason', 'requeuedAt']);
const MAX_LINEAGE_REASON_LENGTH = 256;
const DRILL_YARD_CONTRACT_ID = 'e1-drill-yard';
const WALK_ERA_START = 1_786_167_061_000;
const WALK_ERA_STAMP = '55ce6f7d';
const SAME_GAME_ERA = SEASONS.find((season) => season.id === 'same-game-season')!;
const ROTATIONS = (rotationSeeds.rotations as Rotation[]);

// ── THE SEASON ROLL (owner ruling 2026-08-15, verbatim in specs/agent-play/tape-contract.md
// §"The legacy board — RULED: SEASON ROLL": "I think this kind of calls for a next season?").
// A season dimension DID already exist in this repo, which is why this one is defined here rather
// than bolted onto it — the two axes are genuinely different and must never be conflated:
//   • the CHRONICLE season (src/seasons/registry.ts `resolveSeasonAt`, SEA-1..3) — a TIME WINDOW
//     over the county's story, stamped onto each ROW as a name. It partitions by WHEN a row was
//     posted; its current window already contains pre-assay rows, so it cannot express the roll.
//     Untouched here: rows keep their chronicle name and the season pages keep telling the story.
//   • the LEDGER season (below) — the KV KEY partition, which rolls when the ADMISSION LAW
//     changes. Season 1 admitted un-assayed rows; the current season admits only rows an assay can
//     verify, because v1 tapes carry no runStart and are structurally unverifiable.
// The ledger season is an ID, never a name — naming a season is the chronicle's job and the owner's.
const FIRST_SEASON = 1;
const CURRENT_SEASON = 2;
const KNOWN_SEASONS: ReadonlySet<number> = new Set([FIRST_SEASON, CURRENT_SEASON]);

export async function onRequest(context: StandingsContext): Promise<Response> {
  const moved = canonicalRedirect(context);
  if (moved) return moved;
  const cors = corsHeaders(context.request, context.env.ALLOWED_CORS_ORIGINS);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

  try {
    if (context.request.method === 'GET') return await getBoard(context, cors);
    if (context.request.method === 'POST') return await submitScore(context, cors);
    return error(cors, 405, 'method_not_allowed', 'GET or POST only');
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'The county book is unavailable.');
  }
}

export async function onRequestAssayQueue(context: StandingsContext): Promise<Response> {
  return assayRequest(context, async (cors) => {
    if (context.request.method !== 'GET') return error(cors, 405, 'method_not_allowed', 'GET only');
    const url = new URL(context.request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam === null ? 10 : integerInRange(Number(limitParam), 1, MAX_ASSAY_QUEUE);
    if (limit === null || url.searchParams.size !== (limitParam === null ? 0 : 1)) {
      return error(cors, 400, 'bad_limit', 'Queue limit not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return error(cors, 503, 'board_unavailable', 'The county book is unavailable.');
    let index = parseAssayIndex(await kv.get(ASSAY_QUEUE_INDEX_KEY));
    const observedIndex = index;
    const configuredMaxAge = integerInRange(Number(context.env.ASSAY_INDEX_MAX_AGE_MS), 1, Number.MAX_SAFE_INTEGER);
    let boards: Map<string, StoredRow[]>;
    if (index === null || Date.now() - index.sweptAt > (configuredMaxAge ?? ASSAY_INDEX_MAX_AGE_MS)) {
      ({ index, boards } = await rebuildAssayIndex(kv));
      const concurrentIndex = parseAssayIndex(await kv.get(ASSAY_QUEUE_INDEX_KEY));
      const observedIds = JSON.stringify(observedIndex?.locators.map(locatorId).sort() ?? []);
      const concurrentIds = JSON.stringify(concurrentIndex?.locators.map(locatorId).sort() ?? []);
      if (concurrentIndex && concurrentIds !== observedIds) {
        const candidates = [...(observedIndex?.locators ?? []), ...concurrentIndex.locators];
        const changedBoards = [...new Set(candidates.map((locator) => boardKey(locator.epochId, locator.contractId)))];
        for (const key of changedBoards) {
          const locator = candidates.find((candidate) => boardKey(candidate.epochId, candidate.contractId) === key)!;
          const rows = await readBoard(kv, locator.epochId, locator.contractId);
          boards.set(key, rows);
          index.locators = [
            ...index.locators.filter((candidate) => boardKey(candidate.epochId, candidate.contractId) !== key),
            ...rows.filter((row) => row.assay === 'pending' && row.tape).map((row) => assayLocator(locator.epochId, locator.contractId, row)),
          ];
        }
      }
      await kv.put(ASSAY_QUEUE_INDEX_KEY, JSON.stringify(index));
    } else {
      const namedBoards = [...new Set(index.locators.map((locator) => boardKey(locator.epochId, locator.contractId)))];
      boards = new Map(await Promise.all(namedBoards.map(async (key) => {
        const locator = index!.locators.find((candidate) => boardKey(candidate.epochId, candidate.contractId) === key)!;
        return [key, await readBoard(kv, locator.epochId, locator.contractId)] as const;
      })));
    }
    const verified = index.locators.flatMap((locator) => {
      const row = boards.get(boardKey(locator.epochId, locator.contractId))?.find((candidate) => candidate.assay === 'pending'
        && candidate.tape?.id === locator.tapeId && assayRowId(candidate) === locator.rowId);
      return row ? [{
        locator: { epochId: locator.epochId, contractId: locator.contractId, tapeId: locator.tapeId, rowId: locator.rowId },
        tape: row.tape!, score: scoreOf(row), submittedAt: row.submittedAt,
      }] : [];
    });
    if (verified.length !== index.locators.length) {
      const live = new Set(verified.map((row) => locatorId(row.locator)));
      index.locators = index.locators.filter((locator) => live.has(locatorId(locator)));
      await kv.put(ASSAY_QUEUE_INDEX_KEY, JSON.stringify(index));
    }
    const queue = verified.sort((a, b) => a.submittedAt - b.submittedAt).slice(0, limit);
    return json(cors, { ok: true, queue });
  });
}

export async function onRequestAssayVerdict(context: StandingsContext): Promise<Response> {
  return assayRequest(context, async (cors) => {
    if (context.request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const body = await readJson(context.request);
    const locator = isRecord(body.locator) ? body.locator : null;
    const reason = body.reason === undefined ? undefined : typeof body.reason === 'string' && body.reason.length <= MAX_ASSAY_REASON_LENGTH ? body.reason : null;
    const replayedHash = typeof body.replayedHash === 'string' && ASSAY_HASH.test(body.replayedHash) ? body.replayedHash : null;
    const securedSnapshot = body.securedSnapshot === undefined ? undefined : validateSecuredSnapshot(body.securedSnapshot);
    // F-HEAT15-4: optional even on `verified` — most contracts declare no mechanic and the
    // instrument reports none — but a PRESENT one must be well formed, and it may never ride a
    // verdict that is not a verification.
    const mechanic = body.mechanic === undefined ? undefined : validateMechanicOutcome(body.mechanic);
    if (!hasOnlyKeys(body, ASSAY_VERDICT_KEYS) || !locator || !hasOnlyKeys(locator, ASSAY_LOCATOR_KEYS)
      || (body.verdict !== 'verified' && body.verdict !== 'rejected' && body.verdict !== 'unassayable')
      || (body.verdict === 'unassayable' ? body.replayedHash !== undefined : replayedHash === null)
      || (body.verdict === 'verified' ? securedSnapshot === null || securedSnapshot === undefined : body.securedSnapshot !== undefined)
      || (body.verdict === 'verified' ? mechanic === null : body.mechanic !== undefined)
      || reason === null || typeof locator.epochId !== 'string' || typeof locator.contractId !== 'string'
      || typeof locator.tapeId !== 'string' || locator.tapeId.length === 0 || locator.tapeId.length > MAX_REEL_ID_LENGTH
      || typeof locator.rowId !== 'string' || !ASSAY_ROW_ID.test(locator.rowId)
      || !knownContract(locator.epochId, locator.contractId)
      || (body.verdict === 'unassayable' && !reason)) {
      return error(cors, 400, 'bad_verdict', 'Assay verdict not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return error(cors, 503, 'board_unavailable', 'The county book is unavailable.');
    const rows = await readBoard(kv, locator.epochId, locator.contractId);
    const pending = rows.filter((candidate) => candidate.assay === 'pending'
      && candidate.tape?.id === locator.tapeId && assayRowId(candidate) === locator.rowId);
    const row = pending.find((candidate) => body.verdict !== 'verified' || candidate.tape?.eventLogHash === replayedHash);
    if (!row && pending.length > 0) {
      return error(cors, 400, 'bad_verdict', 'Verified replay hash does not match the submitted tape.');
    }
    if (!row) return error(cors, 404, 'assay_not_found', 'Pending assay not found.');
    // THE LINEAGE RULE (ADR-004 rule 2). The worker's vocabulary is unchanged — it posts exactly the
    // three verdicts it always posted, so the door and the droplet need no lockstep deploy. What
    // changes is who the county blames: a `rejected` on a row the reassay verb re-queued is the
    // COUNTY's composition change catching up with an honest standing, so it is recorded as
    // `retired` naming both engines. An `unassayable` is an instrument failure and proves nothing
    // about replayability, so the mark stays and a later sweep can ask again.
    // ONE GOLD NUMBER PER STANDING (F-2464-3, owner ruling 2026-09-06, verbatim: "fix the board
    // and tape gold issue"). The assign below is how the board publishes the SECURE-TICK standing
    // rather than the end of a run that rode on past it — that is why it exists and it stays. What
    // it must never do again is quietly substitute a DIFFERENT QUANTITY for the same instant: the
    // headless door declared the purse held at the secure tick while the assayer's snapshot
    // reported the run's lifetime panning, so a Mare Claim reel that banked 60 gold was published
    // as 1180 and nobody could say which was the standing. `securedSnapshotMismatch` reads the two
    // as measurements of one replay: the secure tick cannot follow the terminal tick, and when the
    // two ARE the same tick the two golds must agree. A disagreement is now a named rejection the
    // rider can read at `?verdict=<reel id>`, never a rewrite.
    // Both rules compose: the gold comparator decides what the replay MEANS, the lineage mark decides
    // who the county BLAMES. A replay-side rejection on a re-queued row retires it (the county's own
    // change catching up); a gold mismatch is the rider's tape disagreeing with its own replay and stays
    // a plain rejection, mark kept, so a later sweep can ask again.
    const mismatch = body.verdict === 'verified' && securedSnapshot ? securedSnapshotMismatch(row, securedSnapshot) : null;
    const verdictValue = mismatch ? 'rejected' : body.verdict;
    const retiring = body.verdict === 'rejected' && row.lineage !== undefined;
    row.assay = retiring ? 'retired' : verdictValue;
    if (mismatch) delete row.securedSnapshot;
    else if (body.verdict === 'verified' && securedSnapshot) {
      Object.assign(row, securedSnapshot);
      row.securedSnapshot = securedSnapshot;
    }
    // THE MECHANIC BEATS THE WALK (F-HEAT15-4, owner ruling 2026-09-22 (a)). Cleared first and set
    // only on a surviving `verified` for a contract whose board the mechanic decides, so: a
    // rejection (including a gold mismatch demoted above) takes the flag with it, a re-verification
    // re-earns it, and a contract nobody declared a mechanic for can never carry one however the
    // instrument is patched. The rider's own POST cannot reach here — `SCORE_KEYS` is unchanged and
    // this endpoint is the assayer's secret path.
    delete row.mechanic;
    if (!mismatch && body.verdict === 'verified' && mechanic && MECHANIC_CONTRACTS.has(locator.contractId)) row.mechanic = mechanic;
    row.assayedAt = Date.now();
    row.orders = inputEntryCount(row) ?? 0;
    delete row.assayHash;
    if (replayedHash !== null) row.assayHash = replayedHash;
    delete row.assayReason;
    if (retiring) row.assayReason = lineageRetirementReason(row);
    else if (mismatch) row.assayReason = mismatch;
    else if ((body.verdict === 'rejected' || body.verdict === 'unassayable') && reason) row.assayReason = reason;
    // A row that replays again is current again: the mark is spent, and `submittedAt` — the row's
    // first-secure date — was never touched by this path, so the standing keeps the day it earned.
    if (verdictValue === 'verified') delete row.lineage;
    // ONE STANDING PER RIDER IS A PUBLISHING RULE, NOT A DELETION (F-HEAT14-6, 2026-09-19).
    //
    // This site used to enforce "one standing per rider" by DELETING a row from storage. When a
    // verdict came back `verified` it looked for another verified row with the same
    // `standingOwnerKey` and wrote the board back as either `rows.filter((c) => c !== row)` — the
    // row it had just verified, gone — or the mirror, the incumbent gone. Both arms landed in
    // `53450564a` (2026-09-04) alongside the owner dedupe in `rankedRows`.
    //
    // WHAT IT COST. Heat 14 rode 37 boards, secured 31, and the county kept 18. Twelve accepted
    // submissions answered `{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"}` and then
    // `assay_not_found` for ever. The assayer's journal shows it VERIFIED nine of them by name
    // (e2-incline 2026-09-18T00:56:41Z through e10-last-claim 07:21:11Z), so nothing was lost on
    // the way in: the door deleted each one in the same request that verified it. The receipts
    // measure both arms exactly — of the 18 boards that gained a standing 13 lost exactly one
    // retired reel, and all 12 that dropped held their retired count unchanged.
    //
    // WHY DELETION WAS NEVER NEEDED. `rankedRows` (below) already dedupes by `standingOwnerKey`
    // after sorting, so the published board shows one row per rider whatever is in storage. The
    // write-side deletion bought no board change at all; it only destroyed the losing receipt.
    // Worse, `compareScores` weighs SCORES and knows nothing about rankability, so an era-5 row
    // that `isRankedRow` can never publish still won — which is why e2-incline's board is empty
    // today while a 200-gold era-5 reel and an 88-gold era-5 reel sit in its blob.
    //
    // So the verdict path may re-rank a board and may never shrink it. `retainUnranked` keeps the
    // ranked survivors plus every other row up to MAX_ROWS, exactly as it does on the POST path,
    // and the beaten receipt stays readable at `?verdict=<reel id>` — honestly unranked, never
    // absent. Deleting an honest standing is a retention-law violation, not a tidy-up.
    const next = retainUnranked(rows, locator.contractId);
    await kv.put(boardKey(locator.epochId, locator.contractId), JSON.stringify(next));
    await syncAssayBoardIndex(kv, locator.epochId, locator.contractId, next);
    // The worker logs the verdict IT reached; this answers with the verdict the county RECORDED,
    // and names the reason when the two differ, so a score mismatch is visible in the operator log
    // rather than only in the row it demoted.
    return json(cors, { ok: true, locator, assay: row.assay, ...(mismatch ? { reason: mismatch } : {}) });
  });
}

/**
 * THE RE-ASSAY VERB (ADR-004 rule 2, owner ruling 2026-09-06: "we are now in the early release
 * phase, we can act freely"). When a contract's composition changes, every verified standing on it
 * was earned on a board that no longer exists. This puts those rows back in the assay queue with a
 * lineage mark; the assayer then decides each one on the evidence — replays again, or retires.
 *
 * It rides the assayer's own secret path (`assayRequest`), so it is authenticated exactly as the
 * verdict endpoint is and is untouched by the submission rate limiter, which lives in `submitScore`
 * alone. It is idempotent by construction: only `verified` rows are flipped, so a second call finds
 * none and writes nothing.
 */
export async function onRequestStandingsReassay(context: StandingsContext): Promise<Response> {
  return assayRequest(context, async (cors) => {
    if (context.request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const body = await readJson(context.request);
    const { epochId, contractId, reason, includeRetired, storedUnassayed } = body;
    if (!hasOnlyKeys(body, REASSAY_KEYS) || typeof epochId !== 'string' || typeof contractId !== 'string'
      || typeof reason !== 'string' || reason.length === 0 || reason.length > MAX_LINEAGE_REASON_LENGTH
      || (includeRetired !== undefined && typeof includeRetired !== 'boolean')
      || (storedUnassayed !== undefined && typeof storedUnassayed !== 'boolean')
      || !knownContract(epochId, contractId)) {
      return error(cors, 400, 'bad_reassay', 'Re-assay request not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return error(cors, 503, 'board_unavailable', 'The county book is unavailable.');
    const rows = await readBoard(kv, epochId, contractId);
    const requeuedAt = Date.now();
    // THE STORED-UNASSAYED SWEEP (F-HEAT14-6, 2026-09-19). The other way a standing goes quiet:
    // the row is stored and `pending`, but `assay-queue-index` has no entry for it, so the assayer
    // is never told it exists. That is a real, measured condition — the index is ONE KV key that
    // every accepted submission read-modify-writes, and an eventually-consistent store loses
    // entries when two POSTs land inside one propagation window (reproduced deterministically in
    // `scripts/test-standings.mjs` `checkAssayIndexRace`). `onRequestAssayQueue` heals it on its
    // own when the envelope ages past ASSAY_INDEX_MAX_AGE_MS; this is the same repair on demand,
    // for an operator who has just watched a heat and does not want to wait for a sweep.
    //
    // It is deliberately the SMALLEST possible act: it writes the index and NOTHING else. No row
    // is rewritten, so `submittedAt` — the row's first-secure date — is untouched by construction;
    // no lineage mark is invented, because a row that was always pending was never re-queued by a
    // composition change; and `requeued` counts only the locators that were actually missing, so a
    // second call answers 0 rather than claiming the same repair twice.
    if (storedUnassayed === true) {
      const pending = rows.filter((row) => row.assay === 'pending' && row.tape !== undefined);
      const index = parseAssayIndex(await kv.get(ASSAY_QUEUE_INDEX_KEY));
      const indexed = new Set((index?.locators ?? []).map(locatorId));
      const missing = pending.filter((row) => !indexed.has(locatorId(assayLocator(epochId, contractId, row))));
      if (missing.length > 0) await syncAssayBoardIndex(kv, epochId, contractId, rows);
      return json(cors, { ok: true, epochId, contractId, requeued: missing.length, requeuedAt });
    }
    const requeued = rows.filter((row) => (row.assay === 'verified' || (includeRetired === true && row.assay === 'retired')) && row.tape !== undefined);
    for (const row of requeued) {
      // `submittedAt` (the first-secure date) is left exactly as it is. The SCORE is restored to the
      // reel's own declared outcome before the re-assay: a verified row's score is the county's
      // snapshot from an EARLIER assay, and the snapshot's meaning can change (2026-09-06: lifetime
      // panning became the purse held at the secure tick), so judging the replay against the old
      // snapshot retires honest rows for the county's own reasons. Measured live on Moth Season the
      // morning this landed: the Opus row replayed to its exact hash and was still retired because its
      // stored gold was the old 530 while its reel declares 200. The re-assay judges the reel against
      // its declaration and then re-snapshots under the current meaning.
      const outcome = isRecord(row.tape?.outcome) ? row.tape.outcome : null;
      if (outcome) {
        const waves = integerInRange(outcome.waves, 0, 10_000);
        const timeAlive = numberInRange(outcome.timeAlive, 0, 24 * 60 * 60);
        const gold = integerInRange(outcome.gold, 0, 1_000_000_000);
        if (waves !== null && timeAlive !== null && gold !== null) Object.assign(row, { waves, timeAlive, gold });
      }
      delete row.securedSnapshot;
      // F-HEAT15-4: the mechanic flag is a fact about the row's CURRENT verification, so it goes
      // back with the snapshot. The row is `pending` again and the replay re-earns both, which is
      // also what lets a standing recorded before this rule landed GAIN the flag on a sweep.
      delete row.mechanic;
      row.assay = 'pending';
      row.lineage = { reason, requeuedAt };
      delete row.assayReason;
    }
    if (requeued.length > 0) {
      const next = retainUnranked(rows, contractId);
      await kv.put(boardKey(epochId, contractId), JSON.stringify(next));
      await syncAssayBoardIndex(kv, epochId, contractId, next);
    }
    return json(cors, { ok: true, epochId, contractId, requeued: requeued.length, requeuedAt });
  });
}

function lineageRetirementReason(row: StoredRow): string {
  const meta = isRecord(row.tape?.meta) ? row.tape.meta : null;
  const recorded = typeof meta?.engineHash === 'string' ? meta.engineHash : 'an unrecorded engine';
  return `lineage: recorded under ${recorded}, no longer replays under ${engineEra.engineHash}`.slice(0, MAX_ASSAY_REASON_LENGTH);
}

function validateLineage(value: unknown): LineageMark | null {
  if (!isRecord(value) || !hasOnlyKeys(value, LINEAGE_KEYS)) return null;
  const requeuedAt = integerInRange(value.requeuedAt, 0, Number.MAX_SAFE_INTEGER);
  return typeof value.reason === 'string' && value.reason.length > 0
    && value.reason.length <= MAX_LINEAGE_REASON_LENGTH && requeuedAt !== null
    ? { reason: value.reason, requeuedAt }
    : null;
}

// A row leaves the ranked board for two different lineage reasons, and the county counts both under
// one number: its reel's engine pin is not in the current era at all (the era-5 replayable-board
// law), or its contract's composition moved and the re-assay retired it (ADR-004).
function isRetiredRow(row: StoredRow): boolean {
  return row.assay === 'retired' || (row.tape !== undefined && currentLineageRefusal(row.tape) !== null);
}

async function assayRequest(context: StandingsContext, handle: (cors: Record<string, string>) => Promise<Response>): Promise<Response> {
  // The three assay routes are this file's other doors onto the store, so they move with the board.
  const moved = canonicalRedirect(context);
  if (moved) return moved;
  const cors = corsHeaders(context.request, context.env.ALLOWED_CORS_ORIGINS);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  const secret = context.env.ASSAY_WORKER_SECRET;
  if (!secret) return error(cors, 503, 'assay_unavailable', 'The assay worker is not configured.');
  if (!constantTimeEqual(context.request.headers.get('x-assay-key') ?? '', secret)) {
    return error(cors, 401, 'unauthorized', 'Assay key not accepted.');
  }
  try {
    return await handle(cors);
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'The county book is unavailable.');
  }
}

async function getBoard(context: StandingsContext, cors: Record<string, string>): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.searchParams.get('board') === 'transfer') {
    const rotation = ROTATIONS.find(({ id }) => id === url.searchParams.get('rotation'));
    if (!rotation || url.searchParams.size !== 2) return error(cors, 400, 'bad_rotation', 'Rotation not accepted.');
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const standings = await Promise.all(Object.keys(rotation.seeds).map(async (contractId) => {
      const epochId = CONTRACT_EPOCHS.get(contractId)!;
      const rows = kv ? await readBoard(kv, epochId, contractId, true) : [];
      const board = rankedRows(rows.filter((row) => row.rotationId === rotation.id && row.assay === 'verified'
        && (row.party?.riderCount ?? 1) === 1), contractId).map((row, index) => boardRow(row, index));
      return { epochId, contractId, board };
    }));
    return json(cors, { ok: true, board: 'transfer', rotation, standings });
  }
  const epochId = url.searchParams.get('epoch') ?? '';
  const view = url.searchParams.get('view');
  // Every read surface carries the season the same way: one optional param, counted into the strict
  // param arithmetic each branch already does, so an unknown season is a refusal and never a
  // silently-current board.
  const season = parseSeason(url);
  const seasonParams = url.searchParams.get('season') === null ? 0 : 1;
  if (season === null) return error(cors, 400, 'bad_season', 'Season not accepted.');
  if (view !== null) {
    const contracts = epochContracts(epochId);
    if ((view !== 'byStack' && view !== 'byHarness' && view !== 'byParty') || url.searchParams.size !== 2 + seasonParams || !contracts) {
      return error(cors, 400, 'bad_view', 'Field book view not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const boards = await Promise.all(contracts.map(async (contractId) => [contractId, kv ? rankedRows((await readBoard(kv, epochId, contractId, true, season)).filter((row) => !row.rotationId), contractId) : []] as const));
    const frontiers = frontierDecisionMap(boards);
    if (view === 'byParty') {
      return json(cors, {
        ok: true,
        view: 'byParty',
        ...seasonLabels(season),
        epochId,
        contracts,
        // Composition is INFORMATION, never ranking: no rank is minted here and the groups sort by
        // recency, exactly as byStack does (owner 2026-08-05 — detail lives in the field book).
        byParty: groupRows(boards, (row) => (row.party ? partyComposition(row.party) : null),
          (row, contractId) => partyCell(row, contractId, frontiers))
          .map(([composition, group]) => ({
            composition,
            riderCount: composition.split('+').length,
            contracts: [...group.contracts.values()],
            latestSubmittedAt: group.aggregate.latestSubmittedAt,
          })),
      });
    }
    const byHarness = view === 'byHarness';
    const grouped = groupRows(
      boards,
      (row) => (byHarness ? row.stack?.harness?.trim() || UNDECLARED_RIG : row.stack?.model?.trim() || UNDECLARED_RIDER),
      (row, contractId) => stackCell(row, contractId, frontiers),
    ).map(([name, group]) => ({
      [byHarness ? 'harness' : 'model']: name,
      contracts: [...group.contracts.values()],
      latestSubmittedAt: group.aggregate.latestSubmittedAt,
      aggregate: group.aggregate,
    }));
    return json(cors, {
      ok: true,
      view,
      ...seasonLabels(season),
      epochId,
      contracts,
      [byHarness ? 'byHarness' : 'byStack']: grouped,
    });
  }
  const contractId = url.searchParams.get('contract') ?? '';
  const reelId = url.searchParams.get('reel');
  if (reelId !== null) {
    if (url.searchParams.size !== 3 + seasonParams || reelId.length === 0 || reelId.length > MAX_REEL_ID_LENGTH || !knownContract(epochId, contractId)) {
      return error(cors, 400, 'bad_reel', 'Reel not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const rows = kv ? await readBoard(kv, epochId, contractId, true, season) : [];
    const reel = rows.find((row) => row.tape?.id === reelId)?.tape;
    if (!reel) return error(cors, 404, 'reel_not_found', 'That reel is not on the shelf.');
    // The archive keeps its reels: a season-1 tape stays fetchable as the artifact it is, and the
    // payload's own labels say which era's proof standards it was posted under.
    // EH-3 ed0d3c5389 retired F-2308-1's validator premise. WATCH now carries only the stored
    // reel's public era identity; no private controller state or additional metadata is exposed.
    const publicReel = isRecord(reel.meta) && reel.meta.engineHash !== undefined
      ? { ...reel, meta: { buildId: reel.meta.buildId, engineHash: reel.meta.engineHash, era: reel.meta.era, ...(reel.meta.viewVersion === undefined ? {} : { viewVersion: reel.meta.viewVersion }) } }
      : reel;
    return json(cors, { ok: true, ...seasonLabels(season), epochId, contractId, reel: publicReel });
  }
  // THE ASSAY SLIP (F-ASSAY-E2E, 2026-08-22). A refused row leaves the ranked board and takes its
  // reason with it, so a rider who submitted honestly and was rejected could learn only that
  // `rejectedCount` had moved. This is the smallest honest read that fixes that: keyed on the
  // TAPE ID, exactly as `?reel=` already is, so it is the submitter's own handle and no ranking
  // surface changes — a rejected row stays off the board, it just stops being mute about why.
  const verdictId = url.searchParams.get('verdict');
  if (verdictId !== null) {
    if (url.searchParams.size !== 3 + seasonParams || verdictId.length === 0 || verdictId.length > MAX_REEL_ID_LENGTH || !knownContract(epochId, contractId)) {
      return error(cors, 400, 'bad_verdict_lookup', 'Assay slip not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const rows = kv ? await readBoard(kv, epochId, contractId, true, season) : [];
    const row = rows.find((candidate) => candidate.tape?.id === verdictId);
    if (!row || !row.assay) return error(cors, 404, 'assay_not_found', 'No assay slip for that reel.');
    return json(cors, {
      ok: true,
      ...seasonLabels(season),
      epochId,
      contractId,
      tapeId: verdictId,
      assay: row.assay,
      ranked: isRankedRow(row),
      ...(row.assayedAt === undefined ? {} : { assayedAt: row.assayedAt }),
      ...(row.assayHash === undefined ? {} : { assayHash: row.assayHash }),
      ...(row.assayReason === undefined ? {} : { assayReason: row.assayReason }),
      // The almanac's half of the lineage rule: a retired row says not only that it no longer
      // replays but WHY the county came asking again, in the operator's own words.
      ...(row.lineage === undefined ? {} : { lineage: row.lineage }),
    });
  }
  const difficultyParam = url.searchParams.get('difficulty');
  const partyParam = url.searchParams.get('party');
  const expectedParams = 2 + seasonParams + (difficultyParam === null ? 0 : 1) + (partyParam === null ? 0 : 1);
  if (url.searchParams.size !== expectedParams || !knownContract(epochId, contractId)) {
    return error(cors, 400, 'bad_contract', 'Contract and epoch not accepted.');
  }
  if (partyParam !== null && !PARTY_FILTERS.has(partyParam)) {
    return error(cors, 400, 'bad_party', 'Party size not accepted.');
  }
  const difficulty = difficultyParam ?? 'all';
  if (difficulty !== 'all' && !isDifficultyPreset(difficulty)) {
    return error(cors, 400, 'bad_difficulty', 'Difficulty not accepted.');
  }
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  const rows = kv ? await readBoard(kv, epochId, contractId, true, season) : [];
  // Posses rank WITHIN their size and nowhere else (owner 2026-08-05), so the size partitions the
  // field BEFORE ranks are minted: a posse row can never move a solo rank, and an omitted party
  // param is the solo board — which is byte-identical to the board this endpoint served before.
  const partySize = partyParam === null || partyParam === 'solo' ? 1 : Number(partyParam);
  const partition = rows.filter((row) => !row.rotationId && (row.party?.riderCount ?? 1) === partySize);
  const ranked = rankedRows(partition, contractId);
  const rotation = currentOrLatestRotation(Date.now());
  const board = ranked.map((row, index) => boardRow(row, index, heldOutFor(row, rows, contractId, rotation)));
  const rejectedCount = partition.filter((row) => row.assay === 'rejected'
    && (difficulty === 'all' || row.difficulty === difficulty)).length;
  const retiredCount = partition.filter((row) => isRetiredRow(row)
    && (difficulty === 'all' || row.difficulty === difficulty)).length;
  const probeCount = partition.filter((row) => row.stack?.harness === 'operator-probe'
    && (difficulty === 'all' || row.difficulty === difficulty)).length;
  return json(cors, {
    ok: true,
    ...seasonLabels(season),
    epochId,
    contractId,
    party: partyParam === null ? 'solo' : partyParam,
    board: difficulty === 'all' ? board : board.filter((row) => row.difficulty === difficulty),
    rejectedCount,
    retiredCount,
    probeCount,
  });
}

function boardRow(row: StoredRow, index: number, heldOut?: JsonRecord | null): JsonRecord {
  const reel = row.tape === undefined ? undefined : { id: row.tape.id as string, simVersion: row.tape.simVersion as number };
  const season = resolveSeasonAt(row.submittedAt);
  return {
    rank: index + 1,
    profileName: row.profileName,
    secured: row.secured,
    waves: row.waves,
    timeAlive: row.timeAlive,
    gold: row.gold,
    baseValue: row.baseValue,
    ...(row.preserveWavesAlive === undefined ? {} : { preserveWavesAlive: row.preserveWavesAlive }),
    ...(row.preserveHpFraction === undefined ? {} : { preserveHpFraction: row.preserveHpFraction }),
    // F-HEAT15-4: the mechanic the board was decided on, published where a rider can read why a
    // row outranks one with more waves. Absent on every contract that declares none, and on a row
    // the county has not verified under the rule.
    ...(row.mechanic === undefined ? {} : { mechanic: row.mechanic }),
    assay: row.assay,
    difficulty: row.difficulty,
    ...(Number.isFinite(row.submittedAt) && row.submittedAt >= 0 ? { submittedAt: row.submittedAt } : {}),
    ...(season ? { season: season.name } : {}),
    ...(row.defaulted ? { defaulted: true } : {}),
    ...boardStack(row.stack),
    ...(row.party ? {
      party: {
        riderCount: row.party.riderCount,
        riders: row.party.riders.map((rider) => ({ name: rider.name, ...boardStack(rider.stack) })),
      },
    } : {}),
    // A handle to the reel, never the reel: the tape blob is fetched on demand by ?reel=<id>.
    ...(reel ? { reel } : {}),
    cost: rowCost(row),
    ...(row.rotationId ? { rotationId: row.rotationId } : {}),
    ...(heldOut === undefined ? {} : { heldOut }),
  };
}

function heldOutFor(row: StoredRow, rows: StoredRow[], contractId: string, rotation: Rotation | null): JsonRecord | null {
  const digest = row.stack?.harnessDigest;
  if (!rotation || !digest) return null;
  const candidates = rows.filter((candidate) => candidate.rotationId === rotation.id && candidate.assay === 'verified'
    && candidate.stack?.harnessDigest === digest && (candidate.party?.riderCount ?? 1) === (row.party?.riderCount ?? 1));
  const best = rankedRows(candidates, contractId)[0];
  return best ? { rotationId: rotation.id, waves: best.waves } : null;
}

function rowCost(row: StoredRow): JsonRecord {
  return {
    orders: row.orders ?? null,
    calls: row.stack?.calls ?? null,
    tokensIn: row.stack?.tokensIn ?? null,
    tokensOut: row.stack?.tokensOut ?? null,
    durationS: row.timeAlive,
  };
}

function boardStack(stack?: SelfDeclaredStack): JsonRecord {
  if (!stack) return { declared: false };
  return {
    declared: true,
    ...(stack.model === undefined ? {} : { model: stack.model }),
    ...(stack.harness === undefined ? {} : { harness: stack.harness }),
    ...(stack.harnessVersion === undefined ? {} : { harnessVersion: stack.harnessVersion }),
    ...(stack.harnessDigest === undefined ? {} : { harnessDigest: stack.harnessDigest }),
    ...(stack.harnessRef === undefined ? {} : { harnessRef: stack.harnessRef }),
    ...(stack.worldModel === undefined ? {} : { worldModel: stack.worldModel }),
    ...(stack.source === undefined ? {} : { source: stack.source }),
  };
}

function groupRows(
  boards: ReadonlyArray<readonly [string, StoredRow[]]>,
  keyOf: (row: StoredRow) => string | null,
  cellOf: (row: StoredRow, contractId: string) => JsonRecord,
): Array<[string, BoardGroup]> {
  const groups = new Map<string, BoardGroup>();
  for (const [contractId, rows] of boards) {
    // County ranks are minted per contract x party size. Difficulty only filters that ranked board,
    // so its matching preset cannot mint the same crown a second time.
    const crownedParties = new Set<number>();
    for (const row of rows) {
      const partySize = row.party?.riderCount ?? 1;
      const crown = !crownedParties.has(partySize);
      crownedParties.add(partySize);
      const key = keyOf(row);
      if (key === null) continue;
      const group = groups.get(key) ?? {
        contracts: new Map<string, unknown>(),
        aggregate: {
          standings: 0,
          contracts: 0,
          crowns: 0,
          bestWaves: 0,
          declaredCells: 0,
          undeclaredCells: 0,
          latestSubmittedAt: 0,
        },
      };
      const aggregate = group.aggregate;
      aggregate.standings += 1;
      aggregate.crowns += Number(crown);
      aggregate.bestWaves = Math.max(aggregate.bestWaves, row.waves);
      aggregate.latestSubmittedAt = Math.max(aggregate.latestSubmittedAt, row.submittedAt);
      const costs = [row.stack?.tokensIn, row.stack?.tokensOut, row.stack?.calls];
      costs.some((value) => value !== undefined) ? aggregate.declaredCells += 1 : aggregate.undeclaredCells += 1;
      if (row.stack?.tokensIn !== undefined) aggregate.totalTokensIn = (aggregate.totalTokensIn ?? 0) + row.stack.tokensIn;
      if (row.stack?.tokensOut !== undefined) aggregate.totalTokensOut = (aggregate.totalTokensOut ?? 0) + row.stack.tokensOut;
      if (row.stack?.calls !== undefined) aggregate.totalCalls = (aggregate.totalCalls ?? 0) + row.stack.calls;
      if (!group.contracts.has(contractId)) {
        group.contracts.set(contractId, cellOf(row, contractId));
        aggregate.contracts += 1;
      }
      groups.set(key, group);
    }
  }
  return [...groups.entries()].sort((a, b) => b[1].aggregate.latestSubmittedAt - a[1].aggregate.latestSubmittedAt || a[0].localeCompare(b[0]));
}

function showing(row: StoredRow, contractId: string, frontiers: ReadonlyMap<string, number>): JsonRecord {
  const season = resolveSeasonAt(row.submittedAt);
  return {
    contractId,
    score: {
      secured: row.secured,
      waves: row.waves,
      timeAlive: row.timeAlive,
      gold: row.gold,
      baseValue: row.baseValue,
      ...(row.preserveWavesAlive === undefined ? {} : { preserveWavesAlive: row.preserveWavesAlive }),
      ...(row.preserveHpFraction === undefined ? {} : { preserveHpFraction: row.preserveHpFraction }),
    },
    difficulty: row.difficulty,
    submittedAt: row.submittedAt,
    ...(season ? { season: season.name } : {}),
    assayStatus: row.assay ?? 'legacy',
    ...(row.assay === 'verified' ? { assayStrip: assayStrip(row, contractId, frontiers) } : {}),
  };
}

function stackCell(row: StoredRow, contractId: string, frontiers: ReadonlyMap<string, number>): JsonRecord {
  return {
    ...showing(row, contractId, frontiers),
    ...(row.stack?.tokensIn === undefined ? {} : { tokensIn: row.stack.tokensIn }),
    ...(row.stack?.tokensOut === undefined ? {} : { tokensOut: row.stack.tokensOut }),
    ...(row.stack?.calls === undefined ? {} : { calls: row.stack.calls }),
    ...(row.stack?.harness === undefined ? {} : { harness: row.stack.harness }),
    ...(row.stack?.harnessVersion === undefined ? {} : { harnessVersion: row.stack.harnessVersion }),
    ...(row.stack?.harnessDigest === undefined ? {} : { harnessDigest: row.stack.harnessDigest }),
    ...(row.stack?.harnessRef === undefined ? {} : { harnessRef: row.stack.harnessRef }),
    ...(row.stack?.worldModel === undefined ? {} : { worldModel: row.stack.worldModel }),
    ...(row.stack?.config === undefined ? {} : { config: row.stack.config }),
  };
}

function partyCell(row: StoredRow, contractId: string, frontiers: ReadonlyMap<string, number>): JsonRecord {
  return {
    ...showing(row, contractId, frontiers),
    profileName: row.profileName,
    riders: row.party?.riders.map((rider) => rider.name) ?? [],
    rigs: row.party ? partyRigs(row.party) : [],
  };
}

function assayStrip(row: StoredRow, contractId: string, frontiers: ReadonlyMap<string, number>): JsonRecord {
  const era = assayEra(row.submittedAt);
  const decisions = decisionCount(row);
  const frontier = row.seed ? frontiers.get(frontierKey(contractId, row.seed, era.id)) : undefined;
  const floorSecures = row.seed ? Boolean((nullFloors.floors as Record<string, Record<string, { secured?: boolean }>>)[contractId]?.[row.seed]?.secured) : false;
  const economy = floorSecures
    ? { status: 'void', reason: 'The null floor already secures.' }
    : decisions === undefined || frontier === undefined
      ? { status: 'unavailable', reason: 'No verified decision frontier for this seed.' }
      : { status: 'measured', decisions, frontierDecisions: frontier, efficiency: frontier / decisions };
  return {
    era,
    outcome: { secured: true, waves: row.waves, timeAlive: row.timeAlive },
    economy,
    cost: rowCost(row),
  };
}

function frontierDecisionMap(boards: ReadonlyArray<readonly [string, StoredRow[]]>): Map<string, number> {
  const frontiers = new Map<string, number>();
  for (const [contractId, rows] of boards) for (const row of rows) {
    const decisions = row.assay === 'verified' ? decisionCount(row) : undefined;
    if (!row.seed || decisions === undefined) continue;
    const key = frontierKey(contractId, row.seed, assayEra(row.submittedAt).id);
    frontiers.set(key, Math.min(frontiers.get(key) ?? Number.POSITIVE_INFINITY, decisions));
  }
  return frontiers;
}

function frontierKey(contractId: string, seed: string, era: string): string {
  return `${contractId}\n${seed}\n${era}`;
}

function assayEra(submittedAt: number): { id: string; label: string } {
  if (submittedAt >= SAME_GAME_ERA.startsAt) return { id: SAME_GAME_ERA.eraStamps.at(-1)!, label: 'Same-Game era' };
  if (submittedAt >= WALK_ERA_START) return { id: WALK_ERA_STAMP, label: 'Walk era' };
  return { id: 'pre-walk', label: 'Before the Walk' };
}

function decisionCount(row: StoredRow): number | undefined {
  const entries = tapeEntries(row);
  if (!entries) return undefined;
  const decisions = entries.filter((entry) => isRecord(entry) && Array.isArray(entry.a)
    && entry.a.some((action) => isRecord(action) && action.kind === 'agent_orders')).length;
  return decisions > 0 ? decisions : undefined;
}

function inputEntryCount(row: StoredRow): number | undefined {
  return tapeEntries(row)?.length;
}

function tapeEntries(row: StoredRow): unknown[] | undefined {
  const input = isRecord(row.tape?.inputLog) ? row.tape.inputLog : null;
  if (!input || !Array.isArray(input.entries)) return undefined;
  const streams = Array.isArray(input.streams) ? input.streams : [];
  return [input.entries, ...streams.flatMap((stream) => isRecord(stream) && Array.isArray(stream.entries) ? [stream.entries] : [])].flat();
}

// 'h+a', 'h+h+a', 'a+a+a' — humans first so the key is stable however the riders were ordered.
// A rider is read as an agent when it DECLARED a stack; self-declaration is the only evidence
// this endpoint has, and the field book is where declarations are allowed to be seen.
function partyComposition(party: SubmittedParty): string {
  const agents = party.riders.filter((rider) => rider.stack !== undefined).length;
  return [
    ...Array.from({ length: party.riders.length - agents }, () => 'h'),
    ...Array.from({ length: agents }, () => 'a'),
  ].join('+');
}

function partyRigs(party: SubmittedParty): string[] {
  return party.riders.flatMap((rider) => (rider.stack ? [rider.stack.model?.trim() || UNREGISTERED_RIG] : []));
}

async function submitScore(context: StandingsContext, cors: Record<string, string>): Promise<Response> {
  // A closed season is closed to the clerk too. Its submission metadata is read only for the
  // refusal ledger; the archived board remains unreachable by every write path (RETENTION LAW).
  let body: JsonRecord;
  try {
    body = await readJson(context.request);
  } catch (cause) {
    if (cause instanceof HttpError && isSubmissionRefusalReason(cause.code)) {
      return refuseSubmission(context, cors, {}, cause.status, cause.code, cause.message);
    }
    throw cause;
  }
  const season = parseSeason(new URL(context.request.url));
  if (season === null) return refuseSubmission(context, cors, body, 400, 'bad_season', 'Season not accepted.');
  if (season !== CURRENT_SEASON) {
    return refuseSubmission(context, cors, body, 403, 'season_closed', 'That season’s book is closed. The county writes only in the season now riding.');
  }
  if (!hasOnlyKeys(body, POST_KEYS)) return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');
  const contractId = typeof body.contractId === 'string' ? body.contractId : '';
  const epochId = typeof body.epochId === 'string' ? body.epochId : '';
  // Training, not standings — the drill yard never ranks.
  if (contractId === DRILL_YARD_CONTRACT_ID) {
    return refuseSubmission(context, cors, body, 400, 'training_ground', 'The Drill Yard is the training ground — practice is its own reward.');
  }
  if (isRecord(body.score) && body.score.secured === false) {
    return refuseSubmission(context, cors, body, 400, 'unsecured', 'Only a secured claim can enter the standings.');
  }
  const score = validateScore(body.score);
  const profileName = cleanName(body.profileName);
  const anonId = typeof body.anonId === 'string' && ANON_ID.test(body.anonId) ? body.anonId : '';
  const defaulted = body.difficulty === undefined;
  const difficulty = defaulted ? 'trail' : isDifficultyPreset(body.difficulty) ? body.difficulty : null;
  const seed = typeof body.seed === 'string' && body.seed.length > 0 && body.seed.length <= MAX_SEED_LENGTH ? body.seed : '';
  const seedMode = body.seedMode === 'live' || body.seedMode === 'bench' ? body.seedMode : null;
  const seedHash = typeof body.seedHash === 'string' && SHA256.test(body.seedHash) ? body.seedHash : '';
  const inputLogHash = typeof body.inputLogHash === 'string' && SHA256.test(body.inputLogHash) ? body.inputLogHash : '';
  const stack = body.stack === undefined ? undefined : validateStack(body.stack);
  const party = body.party === undefined ? undefined : validateParty(body.party);
  if (knownContract(epochId, contractId) && isRecord(body.tape) && isRecord(body.tape.inputLog)
    && Number.isSafeInteger(body.tape.inputLog.durationTicks)
    && (body.tape.inputLog.durationTicks as number) > runTapeEnvelopeForContract(contractId).maxTicks) {
    return refuseSubmission(context, cors, body, 400, 'reel_duration_exceeded', `Reel duration exceeds the ${contractId} contract ceiling.`);
  }
  const tape = body.tape === undefined ? undefined : validateTape(body.tape, contractId, seed, difficulty);
  if (!knownContract(epochId, contractId) || !score || !anonId || !seed || !seedMode || !seedHash || !inputLogHash || stack === null || party === null || tape === null) {
    return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (!difficulty || (seedMode === 'bench' && defaulted)) {
    return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (tape && await sha256Hex(JSON.stringify(tape.inputLog)) !== inputLogHash) {
    return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (tape && !tapeMatchesScore(tape, score)) {
    return refuseSubmission(context, cors, body, 400, 'bad_payload', 'Standing not accepted.');
  }
  const eraRefusal = tape ? currentLineageRefusal(tape) : null;
  if (eraRefusal) return refuseSubmission(context, cors, body, 400, 'reel_not_current', eraRefusal);
  const rotation = rotationForSeed(contractId, seed);
  if (rotation && (Date.now() < Date.parse(rotation.opensAt) || Date.now() >= Date.parse(rotation.closesAt))) {
    return refuseSubmission(context, cors, body, 403, 'rotation_closed', 'That rotation is not open.');
  }
  if (seedMode === 'bench' && !rotation && !(benchSeeds as Record<string, string[]>)[contractId]?.includes(seed)) {
    return refuseSubmission(context, cors, body, 400, 'bad_bench_seed', 'Bench seed not accepted.');
  }

  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return json(cors, { ok: true, stored: false });
  const [ipAllowed, anonAllowed] = await Promise.all([
    bumpCounter(kv, `standings:ratelimit:ip:${await clientIpHash(context.request)}`, MAX_REQUESTS_PER_IP, RATE_TTL_SECONDS),
    bumpCounter(kv, `standings:ratelimit:anon:${anonId}`, MAX_REQUESTS_PER_ANON, RATE_TTL_SECONDS),
  ]);
  if (!ipAllowed || !anonAllowed) return refuseSubmission(context, cors, body, 429, 'rate_limited', 'The county clerk needs a spell.');

  const key = boardKey(epochId, contractId);
  const current = await readBoard(kv, epochId, contractId);
  const candidate: StoredRow = {
    ...score,
    profileName,
    anonId,
    difficulty,
    ...(defaulted ? { defaulted: true } : {}),
    seed,
    seedMode,
    seedHash,
    inputLogHash,
    submittedAt: Date.now(),
    ...(stack ? { stack } : {}),
    ...(party ? { party } : {}),
    ...(tape ? { tape } : {}),
    ...(tape ? { assay: 'pending' as const } : {}),
    ...(rotation ? { rotationId: rotation.id } : {}),
  };
  const sameTape = tape && current.find((row) => sameStandingOwner(row, candidate) && row.tape?.id === tape.id
    && row.assay !== 'rejected' && row.assay !== 'unassayable');
  const prior = current.find((row) => sameStandingOwner(row, candidate) && (tape ? isRankedRow(row) : row.tape === undefined));
  const kept = sameTape ?? (tape ? candidate : prior && compareScores(prior, candidate, contractId) < 0 ? prior : candidate);
  const next = retainUnranked([
    ...current.filter((row) => !sameStandingOwner(row, candidate) || (tape ? row.tape?.id !== tape.id : row.tape !== undefined)),
    kept,
  ], contractId);
  // ponytail: KV read-modify-write; move this board to a Durable Object if concurrent submissions measurably collide.
  await kv.put(key, JSON.stringify(next));
  if (tape && kept === candidate) await syncAssayBoardIndex(kv, epochId, contractId, next);
  const index = rankedRows(next.filter((row) => row.rotationId === rotation?.id), contractId).indexOf(kept);
  const ranked = rankedRows(next.filter((row) => row.rotationId === rotation?.id), contractId);
  const decidedBy = index === 0 ? 'crown' : index > 0 ? decidingKey(ranked[index - 1], kept, contractId) : undefined;
  const retained = kept === sameTape ? 'goal_snapshot' : kept !== candidate ? 'personal_best' : undefined;
  const candidateStored = kept === candidate && next.includes(candidate);
  const sameRun = candidateStored || retained === 'goal_snapshot';
  return json(cors, { ok: true, stored: candidateStored, rank: sameRun && index >= 0 ? index + 1 : null,
    ...(sameRun && decidedBy ? { decidedBy } : {}),
    ...(retained ? { retained } : {}),
    ...(rotation ? { rotationId: rotation.id } : {}) });
}

async function refuseSubmission(
  context: StandingsContext,
  cors: Record<string, string>,
  body: JsonRecord,
  status: number,
  reason: SubmissionRefusalReason,
  message: string,
): Promise<Response> {
  try {
    await recordSubmissionRefusal(context.env.TELEMETRY ?? context.env.ACCOUNTS, body, reason);
  } catch {
    // The refusal remains authoritative even when its diagnostic ledger is unavailable.
  }
  return error(cors, status, reason, message);
}

function isSubmissionRefusalReason(value: string): value is SubmissionRefusalReason {
  return value === 'bad_json' || value === 'reel_too_large' || value === 'unsupported_media_type';
}

async function readBoard(kv: StandingsStorage, epochId: string, contractId: string, tolerateFailure = false, season: number = CURRENT_SEASON): Promise<StoredRow[]> {
  try {
    const parsed = JSON.parse((await kv.get(boardKey(epochId, contractId, season))) ?? '[]') as unknown;
    return Array.isArray(parsed) ? retainUnranked(parsed.map((row) => validateStoredRow(row, contractId)).filter((row): row is StoredRow => row !== null), contractId) : [];
  } catch {
    if (tolerateFailure) return [];
    throw new HttpError(503, 'board_unavailable', 'The county book is unavailable.');
  }
}

function validateStoredRow(value: unknown, contractId: string): StoredRow | null {
  if (!isRecord(value)) return null;
  const score = validateScore({
    secured: value.secured,
    waves: value.waves,
    timeAlive: value.timeAlive,
    gold: value.gold,
    baseValue: value.baseValue,
    preserveWavesAlive: value.preserveWavesAlive,
    preserveHpFraction: value.preserveHpFraction,
  });
  const profileName = cleanName(value.profileName);
  if (!score || typeof value.anonId !== 'string' || !ANON_ID.test(value.anonId)) return null;
  if (value.difficulty === undefined && value.seedMode === 'bench') return null;
  const difficulty = value.difficulty === undefined ? 'trail' : isDifficultyPreset(value.difficulty) ? value.difficulty : null;
  if (!difficulty || (value.defaulted !== undefined && value.defaulted !== true)) return null;
  const defaulted = value.difficulty === undefined || value.defaulted === true;
  const hasSeedFields = value.seed !== undefined || value.seedMode !== undefined;
  if (hasSeedFields && (typeof value.seed !== 'string' || value.seed.length === 0 || value.seed.length > MAX_SEED_LENGTH)) return null;
  if (hasSeedFields && value.seedMode !== 'live' && value.seedMode !== 'bench') return null;
  if (typeof value.seedHash !== 'string' || !SHA256.test(value.seedHash)) return null;
  if (typeof value.inputLogHash !== 'string' || !SHA256.test(value.inputLogHash)) return null;
  const stack = value.stack === undefined ? undefined : validateStack(value.stack, true);
  const party = value.party === undefined ? undefined : validateParty(value.party, true);
  if (stack === null || party === null) return null;
  const tape = value.tape === undefined ? undefined : validateTape(value.tape, contractId, value.seed, difficulty, true);
  const submittedAt = integerInRange(value.submittedAt, 0, Number.MAX_SAFE_INTEGER);
  const assay = value.assay === undefined && tape ? 'pending'
    : value.assay === 'pending' || value.assay === 'verified' || value.assay === 'rejected'
      || value.assay === 'unassayable' || value.assay === 'retired' ? value.assay : undefined;
  const assayedAt = value.assayedAt === undefined ? undefined : integerInRange(value.assayedAt, 0, Number.MAX_SAFE_INTEGER);
  const assayHash = typeof value.assayHash === 'string' && ASSAY_HASH.test(value.assayHash) ? value.assayHash : undefined;
  const assayReason = typeof value.assayReason === 'string' && value.assayReason.length <= MAX_ASSAY_REASON_LENGTH ? value.assayReason : undefined;
  const orders = value.orders === undefined ? undefined : integerInRange(value.orders, 0, Number.MAX_SAFE_INTEGER);
  const securedSnapshot = value.securedSnapshot === undefined ? undefined : validateSecuredSnapshot(value.securedSnapshot);
  // F-HEAT15-4. A MALFORMED mechanic refuses the row, exactly as a malformed `securedSnapshot`
  // does — it can only come from a corrupted blob. A WELL-FORMED one in a place the verdict path
  // could never have written it (a row that is not `verified`, or a contract with no declared
  // mechanic) is STRIPPED and the row kept: publishing a flag the county did not earn is the harm,
  // and destroying an honest standing to prevent it is a retention-law violation (F-HEAT14-6).
  const mechanic = value.mechanic === undefined ? undefined : validateMechanicOutcome(value.mechanic);
  const lawfulMechanic = mechanic && assay === 'verified' && MECHANIC_CONTRACTS.has(contractId) ? mechanic : undefined;
  const rotationId = value.rotationId === undefined ? undefined : typeof value.rotationId === 'string' ? value.rotationId : null;
  const lineage = value.lineage === undefined ? undefined : validateLineage(value.lineage);
  // A re-queued row's score is the `securedSnapshot` the county measured at its verification, which
  // is allowed to differ from the reel's final outcome (a run may continue past the secure). Without
  // this clause the `pending` arm of the tape/score check would DELETE every goal-snapshot standing
  // the reassay verb touched — the row would simply stop validating on the next read.
  const snapshotBacked = securedSnapshot !== undefined && securedSnapshot !== null && sameSecuredSnapshot(score, securedSnapshot);
  if (submittedAt === null || tape === null || securedSnapshot === null || lineage === null || mechanic === null
    || (tape && assay !== 'verified' && !(lineage && snapshotBacked) && !tapeMatchesScore(tape, score))
    || (assay === 'verified' && securedSnapshot && !sameSecuredSnapshot(score, securedSnapshot))) return null;
  if ((!tape && (value.assay !== undefined || value.assayedAt !== undefined || value.assayHash !== undefined || value.assayReason !== undefined))
    || (tape && !assay)
    || (!tape && lineage !== undefined)
    || (value.assayedAt !== undefined && assayedAt === null)
    || (value.assayHash !== undefined && !assayHash)
    || (value.assayReason !== undefined && assayReason === undefined)
    || (value.orders !== undefined && orders === null)
    || rotationId === null
    || (rotationId !== undefined && rotationForSeed(contractId, value.seed as string)?.id !== rotationId)
    || ((assay === 'verified' || assay === 'rejected' || assay === 'retired') && (assayedAt === undefined || assayHash === undefined))
    || (assay === 'retired' && assayReason === undefined)
    || (assay === 'unassayable' && (assayedAt === undefined || assayHash !== undefined || assayReason === undefined))) return null;
  return {
    ...score,
    profileName,
    anonId: value.anonId,
    difficulty,
    ...(defaulted ? { defaulted: true } : {}),
    seedHash: value.seedHash,
    inputLogHash: value.inputLogHash,
    submittedAt,
    ...(hasSeedFields ? { seed: value.seed as string, seedMode: value.seedMode as SeedMode } : {}),
    ...(stack ? { stack } : {}),
    ...(party ? { party } : {}),
    ...(tape ? { tape } : {}),
    ...(assay ? { assay } : {}),
    ...(typeof assayedAt === 'number' ? { assayedAt } : {}),
    ...(assayHash === undefined ? {} : { assayHash }),
    ...(assayReason === undefined ? {} : { assayReason }),
    ...(typeof orders === 'number' ? { orders } : {}),
    ...(securedSnapshot ? { securedSnapshot } : {}),
    ...(lawfulMechanic ? { mechanic: lawfulMechanic } : {}),
    ...(rotationId ? { rotationId } : {}),
    ...(lineage ? { lineage } : {}),
  };
}

function rankedRows(rows: StoredRow[], contractId: string): StoredRow[] {
  const owners = new Set<string>();
  return rows.filter(isRankedRow).sort((a, b) => compareScores(a, b, contractId)).filter((row) => {
    const owner = standingOwnerKey(row);
    if (owners.has(owner)) return false;
    owners.add(owner);
    return true;
  }).slice(0, MAX_ROWS);
}

function isRankedRow(row: StoredRow): boolean {
  return row.tape !== undefined && currentLineageRefusal(row.tape) === null
    && row.stack?.harness !== 'operator-probe'
    && row.assay !== 'rejected' && row.assay !== 'unassayable' && row.assay !== 'retired';
}

function sameStandingOwner(left: StoredRow, right: StoredRow): boolean {
  return standingOwnerKey(left) === standingOwnerKey(right);
}

function standingOwnerKey(row: StoredRow): string {
  return `${row.anonId}\n${row.rotationId ?? ''}\n${row.party?.riderCount ?? 1}`;
}

function currentLineageRefusal(tape: JsonRecord): string | null {
  const meta = isRecord(tape.meta) ? tape.meta : null;
  if (!meta || typeof meta.era !== 'number' || typeof meta.engineHash !== 'string') {
    return `This reel carries no current-era papers; the county accepts era ${engineEra.era} '${engineEra.name}'.`;
  }
  if (meta.era !== engineEra.era) {
    return `This reel rode era ${meta.era}; the county accepts era ${engineEra.era} '${engineEra.name}'.`;
  }
  if (!engineEraIncludes(engineEra, meta.engineHash)) return `This reel's engine pin is not recorded in era ${engineEra.era} '${engineEra.name}'.`;
  return tapeGrammarRefusal(tape);
}

// A stored reel whose orders name a verb the door has since retired (ADR-005) is RETIRED at read:
// unranked and counted, exactly like a cross-era reel, and the county says why. So is a reel stored
// before door-tape-grammar-3 with an action the client cannot load (F-DTG2-2, `clientRefusesAction`),
// because it cannot replay (ADR-004). Walks the primary entries, every stream and every recording a
// playbook use carries (F-DTG1-2), and judges both order forms, an entry's `kind: 'agent_orders'` and a
// seated rider's wire `agent_orders`; the first refusal is the reason.
function tapeGrammarRefusal(tape: JsonRecord): string | null {
  const input = isRecord(tape.inputLog) ? tape.inputLog : null;
  if (!input) return null;
  const lists: unknown[] = [input.entries, ...(Array.isArray(input.streams) ? input.streams.map((stream) => (isRecord(stream) ? stream.entries : undefined)) : [])];
  if (Array.isArray(input.playbookUses)) lists.push(...input.playbookUses.map((use) => (isRecord(use) && isRecord(use.playbook) ? use.playbook.entries : undefined)));
  for (const entries of lists) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      if (!isRecord(entry) || !Array.isArray(entry.a)) continue;
      for (const action of entry.a) {
        if (isRecord(action) && clientRefusesAction(action)) return `This reel carries a ${String(action.type)} the client cannot load, so it cannot replay; it stands retired under ADR-004.`;
        if (!isRecord(action) || (action.kind !== 'agent_orders' && action.type !== 'agent_orders')) continue;
        const verdict = validateStandingOrders(action.orders);
        if (!verdict.ok) return `This reel's orders name a verb the door has retired (${verdict.message}); it stands retired under ADR-005.`;
      }
    }
  }
  return null;
}

function retainUnranked(rows: StoredRow[], contractId: string): StoredRow[] {
  const partitions = new Map<string, StoredRow[]>();
  for (const row of rows) {
    const key = `${row.rotationId ?? 'public'}\n${row.party?.riderCount ?? 1}`;
    partitions.set(key, [...(partitions.get(key) ?? []), row]);
  }
  return [...partitions.values()].flatMap((partition) => retainPartition(partition, contractId));
}

function retainPartition(rows: StoredRow[], contractId: string): StoredRow[] {
  const ranked = rankedRows(rows, contractId);
  const kept = new Set(ranked);
  const unranked = rows.filter((row) => !kept.has(row))
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .slice(0, MAX_ROWS);
  return [...ranked, ...unranked];
}

function rotationForSeed(contractId: string, seed: string): Rotation | undefined {
  return ROTATIONS.find((rotation) => rotation.seeds[contractId] === seed);
}

function currentOrLatestRotation(now: number): Rotation | null {
  return [...ROTATIONS].filter((rotation) => Date.parse(rotation.opensAt) <= now)
    .sort((a, b) => Date.parse(b.opensAt) - Date.parse(a.opensAt))[0] ?? null;
}

function scoreOf(row: ScoreRow): ScoreRow {
  return {
    secured: row.secured,
    waves: row.waves,
    timeAlive: row.timeAlive,
    gold: row.gold,
    baseValue: row.baseValue,
    ...(row.preserveWavesAlive === undefined ? {} : { preserveWavesAlive: row.preserveWavesAlive }),
    ...(row.preserveHpFraction === undefined ? {} : { preserveHpFraction: row.preserveHpFraction }),
  };
}

function assayRowId(row: StoredRow): string {
  return `${row.anonId}:${row.party?.riderCount ?? 1}:${row.submittedAt}:${row.inputLogHash}`;
}

function assayLocator(epochId: string, contractId: string, row: StoredRow): AssayLocator {
  return { epochId, contractId, tapeId: row.tape!.id as string, rowId: assayRowId(row), submittedAt: row.submittedAt };
}

function locatorId(locator: Pick<AssayLocator, 'epochId' | 'contractId' | 'tapeId' | 'rowId'>): string {
  return `${locator.epochId}\n${locator.contractId}\n${locator.tapeId}\n${locator.rowId}`;
}

function parseAssayIndex(raw: string | null): AssayIndex | null {
  if (raw === null) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed) || !hasOnlyKeys(parsed, ASSAY_INDEX_ENVELOPE_KEYS) || parsed.version !== 1
      || integerInRange(parsed.sweptAt, 0, Number.MAX_SAFE_INTEGER) === null || !Array.isArray(parsed.locators)) return null;
    const locators: AssayLocator[] = [];
    const seen = new Set<string>();
    for (const value of parsed.locators) {
      if (!isRecord(value) || !hasOnlyKeys(value, ASSAY_INDEX_KEYS)
        || typeof value.epochId !== 'string' || typeof value.contractId !== 'string' || !knownContract(value.epochId, value.contractId)
        || typeof value.tapeId !== 'string' || value.tapeId.length === 0 || value.tapeId.length > MAX_REEL_ID_LENGTH
        || typeof value.rowId !== 'string' || !ASSAY_ROW_ID.test(value.rowId)
        || integerInRange(value.submittedAt, 0, Number.MAX_SAFE_INTEGER) === null) return null;
      const locator = value as AssayLocator;
      const id = locatorId(locator);
      if (seen.has(id)) return null;
      seen.add(id);
      locators.push(locator);
    }
    return { version: 1, sweptAt: parsed.sweptAt as number, locators };
  } catch {
    return null;
  }
}

async function rebuildAssayIndex(kv: StandingsStorage): Promise<{ index: AssayIndex; boards: Map<string, StoredRow[]> }> {
  const entries = await Promise.all(CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts
    .filter((contract) => contract.id !== DRILL_YARD_CONTRACT_ID)
    .map(async (contract) => {
      const rows = await readBoard(kv, bundle.epochId, contract.id);
      return [boardKey(bundle.epochId, contract.id), rows, bundle.epochId, contract.id] as const;
    })));
  return {
    boards: new Map(entries.map(([key, rows]) => [key, rows])),
    index: {
      version: 1,
      sweptAt: Date.now(),
      locators: entries.flatMap(([, rows, epochId, contractId]) => rows
        .filter((row) => row.assay === 'pending' && row.tape)
        .map((row) => assayLocator(epochId, contractId, row))),
    },
  };
}

async function syncAssayBoardIndex(kv: StandingsStorage, epochId: string, contractId: string, rows: StoredRow[]): Promise<void> {
  // ponytail: one KV key cannot serialize concurrent writes; ASSAY_INDEX_MAX_AGE_MS bounds staleness, a Durable Object cures it at launch traffic.
  let index = parseAssayIndex(await kv.get(ASSAY_QUEUE_INDEX_KEY));
  if (index === null) ({ index } = await rebuildAssayIndex(kv));
  index.locators = [
    ...index.locators.filter((locator) => locator.epochId !== epochId || locator.contractId !== contractId),
    ...rows.filter((row) => row.assay === 'pending' && row.tape).map((row) => assayLocator(epochId, contractId, row)),
  ];
  await kv.put(ASSAY_QUEUE_INDEX_KEY, JSON.stringify(index));
}

function validateScore(value: unknown): ScoreRow | null {
  if (!isRecord(value) || !hasOnlyKeys(value, SCORE_KEYS) || value.secured !== true) return null;
  const waves = integerInRange(value.waves, 0, 10_000);
  const timeAlive = numberInRange(value.timeAlive, 0, 24 * 60 * 60);
  const gold = integerInRange(value.gold, 0, 1_000_000_000);
  const baseValue = integerInRange(value.baseValue, 0, 1_000_000_000);
  const preserveWavesAlive = value.preserveWavesAlive === undefined ? undefined : integerInRange(value.preserveWavesAlive, 0, 10_000);
  const preserveHpFraction = value.preserveHpFraction === undefined ? undefined : numberInRange(value.preserveHpFraction, 0, 1);
  return waves === null || timeAlive === null || gold === null || baseValue === null
    || preserveWavesAlive === null || preserveHpFraction === null
    ? null
    : {
        secured: true,
        waves,
        timeAlive,
        gold,
        baseValue,
        ...(preserveWavesAlive === undefined ? {} : { preserveWavesAlive }),
        ...(preserveHpFraction === undefined ? {} : { preserveHpFraction }),
      };
}

function validateSecuredSnapshot(value: unknown): SecuredSnapshot | null {
  if (!isRecord(value) || !hasOnlyKeys(value, SECURED_SNAPSHOT_KEYS)) return null;
  const waves = integerInRange(value.waves, 0, 10_000);
  const timeAlive = numberInRange(value.timeAlive, 0, 24 * 60 * 60);
  const gold = integerInRange(value.gold, 0, 1_000_000_000);
  return waves === null || timeAlive === null || gold === null ? null : { waves, timeAlive, gold };
}

/**
 * F-HEAT15-4. Refused the way a malformed `securedSnapshot` is: `null` means "present and not a
 * mechanic outcome", which the caller turns into HTTP 400 `bad_verdict`. The shape is deliberately
 * the narrowest thing that can carry the ruling — an id so a later map's mechanic is legible in the
 * row, and one boolean the replay decided.
 */
function validateMechanicOutcome(value: unknown): MechanicOutcome | null {
  if (!isRecord(value) || !hasOnlyKeys(value, MECHANIC_KEYS)) return null;
  const id = typeof value.id === 'string' && value.id.length > 0 && value.id.length <= MAX_MECHANIC_ID_LENGTH ? value.id : null;
  if (id === null || typeof value.complete !== 'boolean') return null;
  return { id, complete: value.complete };
}

function sameSecuredSnapshot(score: ScoreRow, snapshot: SecuredSnapshot): boolean {
  return score.waves === snapshot.waves && score.timeAlive === snapshot.timeAlive && score.gold === snapshot.gold;
}

/**
 * THE COMPARATOR THAT USED TO BE DECORATIVE (F-2464-3, 2026-09-06).
 *
 * `sameSecuredSnapshot` above guards every STORED verified row, but it could never fail: the
 * verdict path assigned the snapshot over the score first, so the read-back always agreed with
 * itself. This is the same comparison made where it still means something — before the assign,
 * against the score the rider declared and the replay confirmed.
 *
 * Both numbers come from ONE replay of ONE reel. The row's score is the terminal tick (the worker
 * has already refused the verdict if the replay disagreed with it); the snapshot is the secure
 * tick. So:
 *
 *   - the secure tick cannot come AFTER the terminal tick. A snapshot deeper in waves or later in
 *     time than the score it belongs to is impossible, whatever its gold says.
 *   - when the two describe the SAME tick — the rider banked and stopped, which is every heat-12
 *     standing — they are two readings of one instant and their gold must agree. It did not, and
 *     that was the whole finding: the reel banked 60 and the board printed 1180.
 *   - when the secure tick precedes the terminal tick, the rider rode on into overtime. The gold
 *     legitimately differs there (they kept earning and spending after the claim was won) and the
 *     snapshot is applied exactly as before, because the standing is the secure tick.
 */
function securedSnapshotMismatch(score: ScoreRow, snapshot: SecuredSnapshot): AssayRejectionReason | null {
  if (snapshot.waves > score.waves || snapshot.timeAlive > score.timeAlive) return 'score_mismatch';
  const sameTick = snapshot.waves === score.waves && snapshot.timeAlive === score.timeAlive;
  return sameTick && snapshot.gold !== score.gold ? 'score_mismatch' : null;
}

/**
 * THE MECHANIC BEATS THE WALK (F-HEAT15-4, owner ruling 2026-09-22 (a), on the finding that heat
 * 15 re-won `e5-regatta` three times by SAILING and the board still showed the row won by walking
 * the hero through the water).
 *
 * A row "finished" only when the county's own replay said so: `mechanic.complete === true`.
 * ABSENT and `false` are the same answer here, and that is the ruling rather than an oversight —
 * a standing assayed before this landed carries no mechanic, and the owner chose (a) knowing it
 * ranks below a reel that finished the race.
 */
function finishedMechanic(row: { mechanic?: MechanicOutcome }): boolean {
  return row.mechanic?.complete === true;
}

export function compareScores(a: ScoreRow & { submittedAt?: number; mechanic?: MechanicOutcome }, b: ScoreRow & { submittedAt?: number; mechanic?: MechanicOutcome }, contractId?: string): number {
  if (a.secured !== b.secured) return a.secured ? -1 : 1;
  if (contractId && PRESERVE_CONTRACTS.has(contractId)) {
    if (a.preserveWavesAlive !== b.preserveWavesAlive) return (b.preserveWavesAlive ?? -1) - (a.preserveWavesAlive ?? -1);
    if (a.preserveHpFraction !== b.preserveHpFraction) return (b.preserveHpFraction ?? -1) - (a.preserveHpFraction ?? -1);
    if (a.timeAlive !== b.timeAlive) return b.timeAlive - a.timeAlive;
    return (a.submittedAt ?? 0) - (b.submittedAt ?? 0);
  }
  // Exactly one clause, between `secured` and `waves`, on exactly the contracts that declare a
  // board-deciding mechanic. Every other contract takes the identical path it always took.
  if (contractId && MECHANIC_CONTRACTS.has(contractId) && finishedMechanic(a) !== finishedMechanic(b)) return finishedMechanic(a) ? -1 : 1;
  if (a.waves !== b.waves) return b.waves - a.waves;
  if (a.gold !== b.gold) return b.gold - a.gold;
  if (a.timeAlive !== b.timeAlive) return a.secured ? a.timeAlive - b.timeAlive : b.timeAlive - a.timeAlive;
  return (a.submittedAt ?? 0) - (b.submittedAt ?? 0);
}

function decidingKey(a: ScoreRow & { submittedAt?: number; mechanic?: MechanicOutcome }, b: ScoreRow & { submittedAt?: number; mechanic?: MechanicOutcome }, contractId?: string): string {
  if (contractId && PRESERVE_CONTRACTS.has(contractId)) {
    if (a.preserveWavesAlive !== b.preserveWavesAlive || a.preserveHpFraction !== b.preserveHpFraction) return 'preservation';
    if (a.timeAlive !== b.timeAlive) return 'time';
    return 'submittedAt';
  }
  // F-HEAT15-4. `src/ui/DeathOverlay.ts` already answers an unknown key with "The row above holds
  // the next tiebreak", so the score screen stays honest without moving.
  if (contractId && MECHANIC_CONTRACTS.has(contractId) && finishedMechanic(a) !== finishedMechanic(b)) return 'mechanic';
  if (a.waves !== b.waves) return 'waves';
  if (a.gold !== b.gold) return 'gold';
  if (a.timeAlive !== b.timeAlive) return 'time';
  return 'submittedAt';
}

function knownContract(epochId: string, contractId: string): boolean {
  return contractId !== DRILL_YARD_CONTRACT_ID && CONTRACT_EPOCHS.get(contractId) === epochId;
}

function epochContracts(epochId: string): string[] | null {
  return CONTRACT_BUNDLES.find((bundle) => bundle.epochId === epochId)?.contracts
    .map((contract) => contract.id)
    .filter((contractId) => contractId !== DRILL_YARD_CONTRACT_ID) ?? null;
}

function isDifficultyPreset(value: unknown): value is DifficultyPresetId {
  return value === 'greenhorn' || value === 'trail' || value === 'vein-hunter';
}

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 24) || 'Anonymous Prospector' : 'Anonymous Prospector';
}

function validateStack(value: unknown, stored = false): SelfDeclaredStack | null {
  if (!isRecord(value) || !hasOnlyKeys(value, stored ? STORED_STACK_KEYS : STACK_KEYS)) return null;
  if (stored && value.declaredBy !== 'self') return null;
  const stack: SelfDeclaredStack = { declaredBy: 'self' };
  for (const field of STACK_TEXT_FIELDS) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    const maxLength = field === 'worldModel' ? MAX_WORLD_MODEL_LENGTH : MAX_STACK_FIELD_LENGTH;
    if (typeof fieldValue !== 'string' || fieldValue.length > maxLength) return null;
    stack[field] = fieldValue;
  }
  // Stored rows are season history; never retro-judge version-less harness declarations.
  if (!stored && stack.harness !== undefined && !stack.harnessVersion?.trim()) return null;
  if (value.harnessDigest !== undefined) {
    if (typeof value.harnessDigest !== 'string' || !SHA256.test(value.harnessDigest)) return null;
    stack.harnessDigest = value.harnessDigest;
  }
  if (value.harnessRef !== undefined) {
    if (typeof value.harnessRef !== 'string' || value.harnessRef.length > MAX_STACK_FIELD_LENGTH) return null;
    if (!/^[a-f0-9]{7,40}$/.test(value.harnessRef)) {
      try {
        if (new URL(value.harnessRef).protocol !== 'https:') return null;
      } catch {
        return null;
      }
    }
    stack.harnessRef = value.harnessRef;
  }
  if (value.source !== undefined) {
    if (typeof value.source !== 'string' || value.source.length > MAX_STACK_FIELD_LENGTH) return null;
    try {
      if (new URL(value.source).protocol !== 'https:') return null;
    } catch {
      return null;
    }
    stack.source = value.source;
  }
  for (const field of STACK_COST_FIELDS) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    const cost = integerInRange(fieldValue, 0, MAX_STACK_COST);
    if (cost === null) return null;
    stack[field] = cost;
  }
  return stack;
}

// NEVER required (F-1216-2's lesson: a solo post predating this merge must keep posting cleanly),
// but strict once offered: riders.length must equal riderCount, or a posse of four that names two
// riders would make its own composition unreadable — reject-don't-stretch (Mistake #14).
// A rider NAME is coerced, not rejected, because that is exactly what the clerk already does to
// profileName (cleanName); a garbled name must not cost a stored row its whole standing.
function validateParty(value: unknown, stored = false): SubmittedParty | null {
  if (!isRecord(value) || !hasOnlyKeys(value, PARTY_KEYS)) return null;
  const riderCount = integerInRange(value.riderCount, MIN_PARTY_RIDERS, MAX_PARTY_RIDERS);
  if (riderCount === null || !Array.isArray(value.riders) || value.riders.length !== riderCount) return null;
  const riders: PartyRider[] = [];
  for (const candidate of value.riders) {
    if (!isRecord(candidate) || !hasOnlyKeys(candidate, RIDER_KEYS)) return null;
    const stack = candidate.stack === undefined ? undefined : validateStack(candidate.stack, stored);
    if (stack === null) return null;
    riders.push({ name: cleanName(candidate.name), ...(stack ? { stack } : {}) });
  }
  return { riderCount, riders };
}

// `stored` is true when the county re-reads a row it already accepted. At the door (`stored` false) the
// grammar is strict: every field must have the door's own shape, and every action whose verb is in
// `CLIENT_JUDGED_ACTIONS` must also be one the client's own normalizer keeps. At read the SHAPE is still
// required, but two judgments move to `tapeGrammarRefusal`: the standing orders' verbs (ADR-005) and the
// client-judged actions (ADR-004 rule 2: a reel the client cannot load cannot replay). Either makes the row
// RETIRED and COUNTED, never silently dropped. ADR-005 stage 3 (2026-09-07): the first read after the grammar
// deploy emptied 25 boards with a retiredCount of zero because every retired-verb tape simply stopped
// validating (F-RPG-21).
export function validateTape(value: unknown, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null, stored = false): JsonRecord | null {
  if (!isRecord(value) || new TextEncoder().encode(JSON.stringify(value)).length > runTapeEnvelopeForContract(String(contractId)).maxTapeBytes) return null;
  if (!hasOnlyKeys(value, new Set(['version', 'id', 'createdAt', 'kept', 'contract', 'seed', 'difficulty', 'simVersion', 'meta', 'runStart', 'inputLog', 'eventLogHash', 'outcome']))) return null;
  if ((value.version !== 1 && value.version !== 2) || value.simVersion !== 1 || typeof value.id !== 'string' || !value.id || value.id.length > 64) return null;
  if (!Number.isSafeInteger(value.createdAt) || (value.createdAt as number) < 0 || typeof value.kept !== 'boolean') return null;
  if (value.contract !== contractId || value.seed !== seed || value.difficulty !== difficulty) return null;
  if (typeof value.eventLogHash !== 'string' || !/^fnv1a32:[a-f0-9]{8}$/.test(value.eventLogHash)) return null;
  if (!validTapeOutcome(value.outcome) || !validTapeInput(value.inputLog, contractId, seed, difficulty, stored)
    || !validTapeMeta(value.meta)
    || (value.version === 2 ? !validRunStart(value.runStart) : value.runStart !== undefined || value.meta !== undefined)) return null;
  return value;
}

function validTapeMeta(value: unknown): boolean {
  return value === undefined || (isRecord(value)
    && hasOnlyKeys(value, new Set(['buildId', 'engineHash', 'era', 'viewVersion']))
    && typeof value.buildId === 'string'
    && /^(dev|[a-f0-9]{7,16})$/.test(value.buildId)
    && (value.engineHash === undefined || (typeof value.engineHash === 'string' && SHA256.test(value.engineHash)))
    && (value.era === undefined || (Number.isSafeInteger(value.era) && (value.era as number) > 0))
    && (value.viewVersion === undefined || (Number.isSafeInteger(value.viewVersion) && (value.viewVersion as number) > 0)));
}

function validRunStart(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['meta', 'research'])) || !validMetaProgress(value.meta) || !isRecord(value.research)
    || !hasOnlyKeys(value.research, new Set(['version', 'epochId', 'metaScienceCursor', 'progress', 'taken', 'proposalSalt', 'pinnedTarget', 'unlocks']))) return false;
  const { epochId, metaScienceCursor, progress, taken, proposalSalt, pinnedTarget, unlocks } = value.research;
  return value.research.version === 1 && validMetaProgress(progress)
    && (epochId === undefined || token(epochId))
    && (metaScienceCursor === undefined || integerInRange(metaScienceCursor, 0, Number.MAX_SAFE_INTEGER) !== null)
    && Array.isArray(taken) && taken.length <= 256 && taken.every(token) && new Set(taken).size === taken.length
    && integerInRange(proposalSalt, 0, Number.MAX_SAFE_INTEGER) !== null
    && (pinnedTarget === null || token(pinnedTarget))
    && (unlocks === undefined || (isRecord(unlocks) && hasOnlyKeys(unlocks, new Set(['rocketCartCaptured']))
      && (unlocks.rocketCartCaptured === undefined || typeof unlocks.rocketCartCaptured === 'boolean')));
}

function validMetaProgress(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['version', 'tracks'])) || value.version !== 1 || !isRecord(value.tracks)
    || !hasOnlyKeys(value.tracks, new Set(['territory', 'science', 'hero', 'agent']))) return false;
  const tracks = value.tracks;
  return ['territory', 'science', 'hero', 'agent']
    .every((track) => integerInRange(tracks[track], 0, Number.MAX_SAFE_INTEGER) !== null);
}

function validTapeOutcome(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['reason', 'secured', 'waves', 'timeAlive', 'gold']))) return false;
  const secured = value.reason === 'secured' || value.reason === 'rush';
  return (value.reason === 'death' || secured) && value.secured === secured
    && integerInRange(value.waves, 0, 10_000) !== null
    && numberInRange(value.timeAlive, 0, 24 * 60 * 60) !== null
    && numberInRange(value.gold, 0, 1_000_000_000) !== null;
}

function validTapeInput(value: unknown, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null, stored = false): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['version', 'name', 'contractId', 'seed', 'difficultyPreset', 'stepSeconds', 'start', 'durationTicks', 'entries', 'truncated', 'primarySlot', 'streams', 'motorActions', 'playbookUses']))) return false;
  if (value.version !== 1 || value.contractId !== contractId || value.seed !== seed || value.difficultyPreset !== difficulty || value.stepSeconds !== 1 / 30) return false;
  if (typeof value.name !== 'string' || !value.name || value.name.length > 64 || !isRecord(value.start)
    || !hasOnlyKeys(value.start, new Set(['x', 'z']))) return false;
  if (numberInRange(value.start.x, -256, 256) === null || numberInRange(value.start.z, -256, 256) === null) return false;
  const envelope = runTapeEnvelopeForContract(String(contractId));
  const duration = integerInRange(value.durationTicks, 0, envelope.maxTicks);
  if (duration === null || !Array.isArray(value.entries) || value.entries.length > envelope.maxEntries || !validTapeTruncation(value.truncated, duration)) return false;
  const primarySlot = integerInRange(value.primarySlot, 0, 3);
  if (primarySlot === null || !Array.isArray(value.streams) || value.streams.length > 3 || !validTapeEntries(value.entries, duration, envelope.maxEntries, stored)) return false;
  const slots = new Set<number>([primarySlot]);
  for (const stream of value.streams) {
    if (!isRecord(stream) || !hasOnlyKeys(stream, new Set(['slot', 'start', 'entries']))) return false;
    const slot = integerInRange(stream.slot, 0, 3);
    if (slot === null || slots.has(slot) || !isRecord(stream.start) || !hasOnlyKeys(stream.start, new Set(['x', 'z']))) return false;
    if (numberInRange(stream.start.x, -256, 256) === null || numberInRange(stream.start.z, -256, 256) === null) return false;
    if (!validTapeEntries(stream.entries, duration, envelope.maxEntries, stored)) return false;
    slots.add(slot);
  }
  // F-LSR1-0: the browser recorder's two OPTIONAL input-log keys, each judged by the client's own validators.
  if (!validTapeMotorActions(value.motorActions, duration, contractId, seed, difficulty)
    || !validTapePlaybookUses(value.playbookUses, duration, envelope, contractId, seed, difficulty, stored)) return false;
  return true;
}

// F-LSR1-0 (door-tape-grammar-1, 2026-09-25): since 5823eaad6 (2026-09-04) the recorder writes `motorActions`
// once a motor was driven. The client judges them in `validateMotorActions`, which is private to RunTape.ts,
// and every byte of `src/` is engine identity (`ENGINE_SOURCE_INPUTS`, scripts/assay-replay-agent.mjs), so
// exporting it would move the engine hash and need an era pin. The door reaches that same validator through
// the exported `validateRunTape`, over a minimal tape that carries nothing else, and adds one bound of its
// own: like every entry here, a motor action starts no earlier than tick 0. Absent is lawful.
function validTapeMotorActions(value: unknown, duration: number, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null): boolean {
  if (value === undefined) return true;
  if (typeof contractId !== 'string' || typeof seed !== 'string' || difficulty === null) return false;
  const judged = validateRunTape({
    version: 1, id: 'motor-actions', createdAt: 0, kept: false, contract: contractId, seed, difficulty, simVersion: 1,
    inputLog: {
      version: 1, name: 'motor-actions', contractId, seed, difficultyPreset: difficulty, stepSeconds: 1 / 30,
      start: { x: 0, z: 0 }, durationTicks: duration, entries: [], truncated: null, primarySlot: 0, streams: [], motorActions: value,
    },
    eventLogHash: 'fnv1a32:00000000',
    outcome: { reason: 'death', secured: false, waves: 0, timeAlive: 0, gold: 0 },
  });
  return judged !== null && (judged.inputLog.motorActions ?? []).every((action) => action.t >= 0);
}

// F-LSR1-0 (door-tape-grammar-1, 2026-09-25): since 15dc51b89 (2026-09-05) the browser recorder writes
// `playbookUses` on EVERY reel (RunTape.ts `snapshot`) and the Lantern replays it, so the door admits it in
// exactly the shape the client reads back. Absent is lawful. Each use is `{ kind: 'playbook_use', atTick,
// playbook }`: atTick an integer in [0, durationTicks], never earlier than the use before it; the recording
// judged by the client's own parser (`validatePlaybook`, the call RunTape.ts `validatePlaybookUses` makes)
// and ridden on the tape's own contract, seed and difficulty (as RunTape.ts `validateRunTape` requires). The
// list is capped at the envelope's maxEntries; `maxTapeBytes`, checked first in `validateTape`, bounds it.
function validTapePlaybookUses(value: unknown, duration: number, envelope: RunTapeEnvelope, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null, stored = false): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.length > envelope.maxEntries) return false;
  let prior = 0;
  for (const use of value) {
    if (!isRecord(use) || !hasOnlyKeys(use, new Set(['kind', 'atTick', 'playbook'])) || use.kind !== 'playbook_use') return false;
    const atTick = integerInRange(use.atTick, prior, duration);
    const parsed = validatePlaybook(stored ? ordersJudgedForShape(use.playbook) : use.playbook, envelope.maxTicks, envelope.maxEntries);
    if (atTick === null || !parsed.ok || parsed.playbook.contractId !== contractId || parsed.playbook.seed !== seed
      || parsed.playbook.difficultyPreset !== difficulty) return false;
    prior = atTick;
  }
  return true;
}

// ADR-005 at read (F-DTG1-2): the orders inside a playbook use's recording are judged for SHAPE only, as a
// stored entry's are, so a verb retired after acceptance cannot make `validatePlaybook` drop the row;
// `tapeGrammarRefusal` judges those verbs and retires the row instead. Every other field of the recording
// is still the client parser's to judge: it gets the recording with each well-shaped order list emptied,
// or null (refused) when a list is malformed.
function ordersJudgedForShape(playbook: unknown): unknown {
  if (!isRecord(playbook) || !Array.isArray(playbook.entries)) return playbook;
  let shaped = true;
  const entries = playbook.entries.map((entry) => {
    if (!isRecord(entry) || !Array.isArray(entry.a)) return entry;
    return {
      ...entry,
      a: entry.a.map((action) => {
        if (!isRecord(action) || (action.kind !== 'agent_orders' && action.type !== 'agent_orders')) return action;
        if (!ordersShape(action.orders) || (action.type === 'agent_orders' && jsonByteLength(action.orders) > SEAT_ORDERS_MAX_BYTES)) shaped = false;
        return { ...action, orders: [] };
      }),
    };
  });
  return shaped ? { ...playbook, entries } : null;
}

function validTapeEntries(entries: unknown, duration: number, maxEntries: number, stored = false): boolean {
  if (!Array.isArray(entries) || entries.length > maxEntries) return false;
  let prior = -1;
  for (const entry of entries) {
    if (!isRecord(entry) || !hasOnlyKeys(entry, new Set(['t', 'mx', 'my', 'a']))) return false;
    const tick = integerInRange(entry.t, 0, Math.max(0, duration - 1));
    if (tick === null || tick <= prior || !quantizedAxis(entry.mx) || !quantizedAxis(entry.my) || !Array.isArray(entry.a) || entry.a.length > 24) return false;
    if (!entry.a.every((action) => validTapeAction(action, stored))) return false;
    if (entry.a.some((action) => isRecord(action) && action.kind === 'agent_orders') && (entry.mx !== 0 || entry.my !== 0)) return false;
    prior = tick;
  }
  return true;
}

function validTapeTruncation(value: unknown, duration: number): boolean {
  if (value === null) return true;
  return isRecord(value)
    && hasOnlyKeys(value, new Set(['reason', 'atTick']))
    && (value.reason === 'max-ticks' || value.reason === 'max-entries' || value.reason === 'run-ended')
    && value.atTick === duration;
}

function validTapeAction(value: unknown, stored = false): boolean {
  if (!isRecord(value)) return false;
  if (value.kind === 'agent_orders') {
    if (!hasOnlyKeys(value, new Set(['kind', 'orders']))) return false;
    if (stored) return Array.isArray(value.orders) && value.orders.length <= 32 && value.orders.every((order) => isRecord(order) && typeof order.verb === 'string');
    return validateStandingOrders(value.orders).ok;
  }
  if (typeof value.type !== 'string') return false;
  // F-DTG2-2 (door-tape-grammar-3): at the door an action in CLIENT_JUDGED_ACTIONS (place_build, pick_upgrade, set_agent_ability, research_pick, context_action; F-DTG4-1) must also be
  // one the client can load; at read the shape below still stands and `tapeGrammarRefusal` retires the row.
  if (!stored && clientRefusesAction(value)) return false;
  const simple = new Set(['weapon_toggle', 'restart', 'debug_spawn', 'debug_xp', 'skip_ceremony', 'research_skip']);
  if (simple.has(value.type)) return hasOnlyKeys(value, new Set(['type']));
  if (value.type === 'place_build') return hasOnlyKeys(value, new Set(['type', 'id', 'position', 'rotationSteps']))
    && token(value.id) && isRecord(value.position) && hasOnlyKeys(value.position, new Set(['x', 'z']))
    && numberInRange(value.position.x, -256, 256) !== null
    && numberInRange(value.position.z, -256, 256) !== null && integerInRange(value.rotationSteps, 0, 3) !== null;
  if (value.type === 'set_pause') return hasOnlyKeys(value, new Set(['type', 'paused'])) && typeof value.paused === 'boolean';
  if (value.type === 'pick_upgrade' || value.type === 'research_pick') return hasOnlyKeys(value, new Set(['type', 'id'])) && token(value.id);
  if (value.type === 'death_action') return hasOnlyKeys(value, new Set(['type', 'choice']))
    && (value.choice === 'done' || value.choice === 'secondary');
  if (value.type === 'secure_choice') return hasOnlyKeys(value, new Set(['type', 'choice']))
    && (value.choice === 'bank' || value.choice === 'rush');
  if (value.type === 'context_action') {
    if (value.action === 'fund') return hasOnlyKeys(value, new Set(['type', 'action']));
    // F-DTG1-1 (door-tape-grammar-2): the probe recovery (Game.ts:5727), targetless like `fund`, as the client writes it.
    if (value.action === 'recover') return hasOnlyKeys(value, new Set(['type', 'action']));
    return (value.action === 'upgrade' || value.action === 'demolish') && hasOnlyKeys(value, new Set(['type', 'action', 'target']))
      && isRecord(value.target) && hasOnlyKeys(value.target, new Set(['id', 'index'])) && token(value.target.id)
      && integerInRange(value.target.index, 0, 10_000) !== null;
  }
  // F-DTG1-1 (door-tape-grammar-2): every solo dispatch of the Prospector (Game.ts:8256-8262), and a seated agent
  // rider's orders on the lockstep wire (SeatedLockstepSim.submitOrders), each exactly as the client normalizes it.
  if (value.type === 'prospector_dispatch') return hasOnlyKeys(value, new Set(['type', 'node'])) && cleanedToken(value.node, 64);
  if (value.type === 'agent_orders') return validSeatOrders(value, stored);
  if (value.type === 'set_agent_rung') return hasOnlyKeys(value, new Set(['type', 'level', 'granted']))
    && integerInRange(value.level, 0, 3) !== null && typeof value.granted === 'boolean';
  return value.type === 'set_agent_ability' && hasOnlyKeys(value, new Set(['type', 'ability', 'granted']))
    && token(value.ability) && typeof value.granted === 'boolean';
}

// F-DTG2-2 and F-DTG3-1 (door-tape-grammar-3 and -4, 2026-09-26): the verbs whose door shape was looser than the
// client's own normalizer (`normalizeLockstepAction`, LockstepClient.ts), so the county stored and ranked reels the
// Lantern and the assayer cannot load: a `place_build`, `pick_upgrade` or `research_pick` id that trims to nothing,
// a `set_agent_ability` naming an ability outside the client's own set, and a `context_action` upgrade or
// demolition whose target names no building the client knows. For these the client's normalizer has the last
// word: the door refuses what it refuses (its own bounds stay as they were), and at read `tapeGrammarRefusal`
// retires a row stored before this grammar instead of dropping it.
const CLIENT_JUDGED_ACTIONS = new Set(['place_build', 'pick_upgrade', 'research_pick', 'set_agent_ability', 'context_action']);
function clientRefusesAction(action: JsonRecord): boolean {
  return typeof action.type === 'string' && CLIENT_JUDGED_ACTIONS.has(action.type) && normalizeLockstepAction(action) === null;
}

// The client's `cleanToken` (LockstepClient.ts) trims, then cuts to `maxLength`. The door takes only a value
// it would keep exactly as it is, so what the county stores is what the client reads back.
function cleanedToken(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength && value.trim() === value;
}

// A seated agent rider's orders as the lockstep wire carries them (LockstepClient.ts `normalizeAction`):
// version 1, a submission id of at most 96 characters, the orders within the wire's 3 KiB and, at the door,
// the standing-order grammar. At read (`stored`) the orders are judged for SHAPE only and
// `tapeGrammarRefusal` judges their verbs, exactly as for a `kind: 'agent_orders'` entry (ADR-005).
const SEAT_ORDERS_MAX_BYTES = 3 * 1024;
function validSeatOrders(value: JsonRecord, stored: boolean): boolean {
  if (!hasOnlyKeys(value, new Set(['type', 'version', 'orders', 'submissionId'])) || value.version !== 1
    || !cleanedToken(value.submissionId, 96) || jsonByteLength(value.orders) > SEAT_ORDERS_MAX_BYTES) return false;
  return stored ? ordersShape(value.orders) : validateStandingOrders(value.orders).ok;
}

// The shape a stored order list keeps whatever its verbs (as the `stored` arm for `kind: 'agent_orders'`).
function ordersShape(orders: unknown): boolean {
  return Array.isArray(orders) && orders.length <= 32 && orders.every((order) => isRecord(order) && typeof order.verb === 'string');
}

// The client's `jsonBytes` (LockstepClient.ts): the UTF-8 bytes of the JSON, unbounded when it cannot serialize.
function jsonByteLength(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function tapeMatchesScore(tape: JsonRecord, score: ScoreRow): boolean {
  const outcome = tape.outcome as JsonRecord;
  return outcome.secured === score.secured && outcome.waves === score.waves
    && outcome.timeAlive === score.timeAlive && outcome.gold === score.gold;
}

function quantizedAxis(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= -1 && value <= 1 && value === Math.round(value * 1000) / 1000;
}

function token(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Season 1 keeps the exact key shape it was written with — no migration, no re-keying, not one
// archived row rewritten (RETENTION LAW). Every WRITE path calls this with the DEFAULT season, so
// the archive is unreachable by the county's pen: read-only by construction, not by promise.
function boardKey(epochId: string, contractId: string, season: number = CURRENT_SEASON): string {
  return season === FIRST_SEASON
    ? `standings:${epochId}:${contractId}`
    : `standings:s${season}:${epochId}:${contractId}`;
}

// An absent param is the current season, so every client written before the roll keeps asking for
// exactly the board it always asked for.
function parseSeason(url: URL): number | null {
  const raw = url.searchParams.get('season');
  if (raw === null) return CURRENT_SEASON;
  const season = /^[0-9]{1,4}$/.test(raw) ? Number(raw) : null;
  return season !== null && KNOWN_SEASONS.has(season) ? season : null;
}

// The assay era began at the roll. Season 1's rows were admitted before any tape could be verified,
// so every archived payload says so plainly rather than letting a reader assume a proved rank.
function seasonLabels(season: number): JsonRecord {
  return { season, assayEra: season !== FIRST_SEASON };
}

function integerInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function hasOnlyKeys(value: JsonRecord, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

async function readJson(request: Request): Promise<JsonRecord> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) throw new HttpError(415, 'unsupported_media_type', 'Send application/json.');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) throw new HttpError(413, 'reel_too_large', 'Reel is too large. Submit compact JSON without whitespace.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new HttpError(413, 'reel_too_large', 'Reel is too large. Submit compact JSON without whitespace.');
  try {
    const value = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {}
  throw new HttpError(400, 'bad_json', 'JSON not accepted.');
}

// kv-counters-to-ledger-2 (F-KV1-5, 2026-09-25): ONE WRITER PER SURFACE (CLAUDE.md §4.4). Since the L3
// cutover of 2026-08-23 the county's boards are the droplet's sqlite ledger (nginx routes /api/standings*
// there: ops/droplet/agenttown.app.nginx.conf), so this Pages copy answers only whoever calls
// gold-rush-3in.pages.dev directly, and each such call read or wrote the shared free-tier KV: a POST
// wrote a shadow board, assay index or refusal record that no player reads. With
// STANDINGS_CANONICAL_ORIGIN bound (the ops evening, docs/ops/ops-evening-2026-09.md Part C step 9),
// every request to the four handlers is answered 308 to the same path and query on that origin before
// any store is touched: 308 rather than 301 because it keeps the method and the body, so a POST lands
// on the ledger as a POST. `no-store` keeps any client from caching the move, so unbinding the variable
// and redeploying is the whole rollback, and the door's CORS headers ride along so a browser may follow.
//
// Unbound, empty, or not a bare https origin (a path, a query, a fragment or credentials), the door is
// exactly what it was: a value that cannot be a redirect target is ignored (as `_ledger.ts` leaves a
// door unbound when LEDGER_ORIGIN is not an origin it can use), and the step-9 probe then shows no
// 308. A request already addressed to the canonical host is served and never moved, because a
// redirect to itself would loop. The droplet runs this same file (server/ledger/serve.mjs) and sees
// its requests as http on that host; its env never carries this variable, and this rule would hold
// if it did.
function canonicalRedirect(context: StandingsContext): Response | null {
  const canonical = canonicalOrigin(context.env.STANDINGS_CANONICAL_ORIGIN);
  if (!canonical) return null;
  const url = new URL(context.request.url);
  if (url.host === canonical.host) return null;
  return new Response(null, {
    status: 308,
    headers: {
      ...(corsHeaders(context.request, context.env.ALLOWED_CORS_ORIGINS) ?? {}),
      'Cache-Control': 'no-store',
      Location: `${canonical.origin}${url.pathname}${url.search}`,
    },
  });
}

function canonicalOrigin(value: string | undefined): URL | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  const bare = url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password;
  return url.protocol === 'https:' && bare ? url : null;
}

function corsHeaders(request: Request, extraOrigins?: ReadonlySet<string>): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || extraOrigins?.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin };
  }
  return null;
}

function json(cors: Record<string, string>, value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors, 'content-type': 'application/json; charset=utf-8' },
  });
}

function error(cors: Record<string, string>, status: number, code: string, message: string): Response {
  return json(cors, { ok: false, error: code, message }, status);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
