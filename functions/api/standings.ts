import benchSeeds from '../../assets/contracts/bench-seeds.json' with { type: 'json' };
import atomicContracts from '../../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };
import deepwaterContracts from '../../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };
import deepskyContracts from '../../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };
import frontierContracts from '../../assets/contracts/epoch-1-frontier/contracts.json' with { type: 'json' };
import motorContracts from '../../assets/contracts/epoch-4-motor/contracts.json' with { type: 'json' };
import orbitalContracts from '../../assets/contracts/epoch-8-orbital/contracts.json' with { type: 'json' };
import redfieldsContracts from '../../assets/contracts/epoch-9-redfields/contracts.json' with { type: 'json' };
import signalContracts from '../../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };
import steamworksContracts from '../../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };
import voltageContracts from '../../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };
import type { DifficultyPresetId } from '../../src/game/Balance';
import { bumpCounter, clientIpHash, type KVNamespaceLike } from './_ratelimit';

type StandingsEnv = {
  TELEMETRY?: KVNamespaceLike;
  ACCOUNTS?: KVNamespaceLike;
};

type StandingsContext = {
  request: Request;
  env: StandingsEnv;
};

type JsonRecord = Record<string, unknown>;

type ScoreRow = {
  secured: true;
  waves: number;
  timeAlive: number;
  gold: number;
  baseValue: number;
};

type SeedMode = 'live' | 'bench';

type SelfDeclaredStack = {
  declaredBy: 'self';
  model?: string;
  harness?: string;
  harnessVersion?: string;
  config?: string;
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
};

type BoardGroup = { latestSubmittedAt: number; contracts: Map<string, unknown> };

type ContractBundle = {
  epochId: string;
  contracts: Array<{ id: string }>;
};

const CONTRACT_BUNDLES = [
  frontierContracts,
  steamworksContracts,
  voltageContracts,
  motorContracts,
  deepwaterContracts,
  atomicContracts,
  signalContracts,
  orbitalContracts,
  redfieldsContracts,
  deepskyContracts,
] as ContractBundle[];
const CONTRACT_EPOCHS = new Map(
  CONTRACT_BUNDLES.flatMap((bundle) => bundle.contracts.map((contract) => [contract.id, bundle.epochId] as const)),
);
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const MAX_TAPE_BYTES = 64 * 1024;
const MAX_JSON_BYTES = MAX_TAPE_BYTES + 4 * 1024;
const MAX_ROWS = 100;
const MAX_REQUESTS_PER_ANON = 12;
const MAX_REQUESTS_PER_IP = 60;
const RATE_TTL_SECONDS = 60 * 60;
const SHA256 = /^[a-f0-9]{64}$/;
const ANON_ID = /^[a-f0-9]{32}$/;
const MAX_SEED_LENGTH = 256;
const MAX_STACK_FIELD_LENGTH = 256;
const MAX_STACK_COST = 1_000_000_000_000;
const STACK_TEXT_FIELDS = ['model', 'harness', 'harnessVersion', 'config'] as const;
const STACK_COST_FIELDS = ['tokensIn', 'tokensOut', 'calls'] as const;
const STACK_KEYS = new Set<string>([...STACK_TEXT_FIELDS, ...STACK_COST_FIELDS]);
const STORED_STACK_KEYS = new Set([...STACK_TEXT_FIELDS, ...STACK_COST_FIELDS, 'declaredBy']);
const POST_KEYS = new Set(['contractId', 'epochId', 'score', 'profileName', 'anonId', 'difficulty', 'seed', 'seedMode', 'seedHash', 'inputLogHash', 'stack', 'party', 'tape']);
const SCORE_KEYS = new Set(['secured', 'waves', 'timeAlive', 'gold', 'baseValue']);
const PARTY_KEYS = new Set(['riderCount', 'riders']);
const RIDER_KEYS = new Set(['name', 'stack']);
// Two riders is the smallest posse; four is the lockstep slot ceiling the tape format already
// enforces (primarySlot 0..3 + at most three extra streams), so the board can never advertise a
// party size the replay machinery could not have produced.
const MIN_PARTY_RIDERS = 2;
const MAX_PARTY_RIDERS = 4;
const PARTY_FILTERS = new Set(['solo', '2', '3', '4']);
const UNREGISTERED_RIG = 'unregistered rig';
const MAX_REEL_ID_LENGTH = 64;

export async function onRequest(context: StandingsContext): Promise<Response> {
  const cors = corsHeaders(context.request);
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

async function getBoard(context: StandingsContext, cors: Record<string, string>): Promise<Response> {
  const url = new URL(context.request.url);
  const epochId = url.searchParams.get('epoch') ?? '';
  const view = url.searchParams.get('view');
  if (view !== null) {
    const contracts = epochContracts(epochId);
    if ((view !== 'byStack' && view !== 'byParty') || url.searchParams.size !== 2 || !contracts) {
      return error(cors, 400, 'bad_view', 'Field book view not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const boards = await Promise.all(contracts.map(async (contractId) => [contractId, kv ? await readBoard(kv, epochId, contractId, true) : []] as const));
    if (view === 'byParty') {
      return json(cors, {
        ok: true,
        view: 'byParty',
        epochId,
        contracts,
        // Composition is INFORMATION, never ranking: no rank is minted here and the groups sort by
        // recency, exactly as byStack does (owner 2026-08-05 — detail lives in the field book).
        byParty: groupRows(boards, (row) => (row.party ? partyComposition(row.party) : null), partyCell)
          .map(([composition, group]) => ({
            composition,
            riderCount: composition.split('+').length,
            contracts: [...group.contracts.values()],
            latestSubmittedAt: group.latestSubmittedAt,
          })),
      });
    }
    return json(cors, {
      ok: true,
      view: 'byStack',
      epochId,
      contracts,
      byStack: groupRows(boards, (row) => row.stack?.model?.trim() || UNREGISTERED_RIG, stackCell)
        .map(([model, group]) => ({ model, contracts: [...group.contracts.values()], latestSubmittedAt: group.latestSubmittedAt })),
    });
  }
  const contractId = url.searchParams.get('contract') ?? '';
  const reelId = url.searchParams.get('reel');
  if (reelId !== null) {
    if (url.searchParams.size !== 3 || reelId.length === 0 || reelId.length > MAX_REEL_ID_LENGTH || !knownContract(epochId, contractId)) {
      return error(cors, 400, 'bad_reel', 'Reel not accepted.');
    }
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    const rows = kv ? await readBoard(kv, epochId, contractId, true) : [];
    const reel = rows.find((row) => row.tape?.id === reelId)?.tape;
    if (!reel) return error(cors, 404, 'reel_not_found', 'That reel is not on the shelf.');
    return json(cors, { ok: true, epochId, contractId, reel });
  }
  const difficultyParam = url.searchParams.get('difficulty');
  const partyParam = url.searchParams.get('party');
  const expectedParams = 2 + (difficultyParam === null ? 0 : 1) + (partyParam === null ? 0 : 1);
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
  const rows = kv ? await readBoard(kv, epochId, contractId, true) : [];
  // Posses rank WITHIN their size and nowhere else (owner 2026-08-05), so the size partitions the
  // field BEFORE ranks are minted: a posse row can never move a solo rank, and an omitted party
  // param is the solo board — which is byte-identical to the board this endpoint served before.
  const partySize = partyParam === null || partyParam === 'solo' ? 1 : Number(partyParam);
  const board = rows.filter((row) => (row.party?.riderCount ?? 1) === partySize).map(boardRow);
  return json(cors, {
    ok: true,
    epochId,
    contractId,
    party: partyParam === null ? 'solo' : partyParam,
    board: difficulty === 'all' ? board : board.filter((row) => row.difficulty === difficulty),
  });
}

function boardRow(row: StoredRow, index: number): JsonRecord {
  const reel = row.tape === undefined ? undefined : { id: row.tape.id as string, simVersion: row.tape.simVersion as number };
  return {
    rank: index + 1,
    profileName: row.profileName,
    secured: row.secured,
    waves: row.waves,
    timeAlive: row.timeAlive,
    gold: row.gold,
    baseValue: row.baseValue,
    difficulty: row.difficulty,
    ...(Number.isFinite(row.submittedAt) && row.submittedAt >= 0 ? { submittedAt: row.submittedAt } : {}),
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
  };
}

function boardStack(stack?: SelfDeclaredStack): JsonRecord {
  if (!stack) return { declared: false };
  return {
    declared: true,
    ...(stack.model === undefined ? {} : { model: stack.model }),
    ...(stack.harness === undefined ? {} : { harness: stack.harness }),
    ...(stack.harnessVersion === undefined ? {} : { harnessVersion: stack.harnessVersion }),
  };
}

function groupRows(
  boards: ReadonlyArray<readonly [string, StoredRow[]]>,
  keyOf: (row: StoredRow) => string | null,
  cellOf: (row: StoredRow, contractId: string) => JsonRecord,
): Array<[string, BoardGroup]> {
  const groups = new Map<string, BoardGroup>();
  for (const [contractId, rows] of boards) {
    for (const row of rows) {
      const key = keyOf(row);
      if (key === null) continue;
      const group = groups.get(key) ?? { latestSubmittedAt: 0, contracts: new Map<string, unknown>() };
      if (group.contracts.has(contractId)) continue;
      group.latestSubmittedAt = Math.max(group.latestSubmittedAt, row.submittedAt);
      group.contracts.set(contractId, cellOf(row, contractId));
      groups.set(key, group);
    }
  }
  return [...groups.entries()].sort((a, b) => b[1].latestSubmittedAt - a[1].latestSubmittedAt || a[0].localeCompare(b[0]));
}

function showing(row: StoredRow, contractId: string): JsonRecord {
  return {
    contractId,
    score: {
      secured: row.secured,
      waves: row.waves,
      timeAlive: row.timeAlive,
      gold: row.gold,
      baseValue: row.baseValue,
    },
    difficulty: row.difficulty,
    submittedAt: row.submittedAt,
  };
}

function stackCell(row: StoredRow, contractId: string): JsonRecord {
  return {
    ...showing(row, contractId),
    ...(row.stack?.tokensIn === undefined ? {} : { tokensIn: row.stack.tokensIn }),
    ...(row.stack?.tokensOut === undefined ? {} : { tokensOut: row.stack.tokensOut }),
    ...(row.stack?.calls === undefined ? {} : { calls: row.stack.calls }),
    ...(row.stack?.harness === undefined ? {} : { harness: row.stack.harness }),
    ...(row.stack?.harnessVersion === undefined ? {} : { harnessVersion: row.stack.harnessVersion }),
    ...(row.stack?.config === undefined ? {} : { config: row.stack.config }),
  };
}

function partyCell(row: StoredRow, contractId: string): JsonRecord {
  return {
    ...showing(row, contractId),
    profileName: row.profileName,
    riders: row.party?.riders.map((rider) => rider.name) ?? [],
    rigs: row.party ? partyRigs(row.party) : [],
  };
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
  const body = await readJson(context.request);
  if (!hasOnlyKeys(body, POST_KEYS)) return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  const contractId = typeof body.contractId === 'string' ? body.contractId : '';
  const epochId = typeof body.epochId === 'string' ? body.epochId : '';
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
  const tape = body.tape === undefined ? undefined : validateTape(body.tape, contractId, seed, difficulty);
  if (!knownContract(epochId, contractId) || !score || !anonId || !seed || !seedMode || !seedHash || !inputLogHash || stack === null || party === null || tape === null) {
    return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (!difficulty || (seedMode === 'bench' && defaulted)) {
    return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (tape && await sha256Hex(JSON.stringify(tape.inputLog)) !== inputLogHash) {
    return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (tape && !tapeMatchesScore(tape, score)) {
    return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  }
  if (seedMode === 'bench' && !(benchSeeds as Record<string, string[]>)[contractId]?.includes(seed)) {
    return error(cors, 400, 'bad_bench_seed', 'Bench seed not accepted.');
  }

  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return json(cors, { ok: true, stored: false });
  const [ipAllowed, anonAllowed] = await Promise.all([
    bumpCounter(kv, `standings:ratelimit:ip:${await clientIpHash(context.request)}`, MAX_REQUESTS_PER_IP, RATE_TTL_SECONDS),
    bumpCounter(kv, `standings:ratelimit:anon:${anonId}`, MAX_REQUESTS_PER_ANON, RATE_TTL_SECONDS),
  ]);
  if (!ipAllowed || !anonAllowed) return error(cors, 429, 'rate_limited', 'The county clerk needs a spell.');

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
  };
  const prior = current.find((row) => row.anonId === anonId);
  const kept = prior && compareScores(prior, candidate) < 0 ? prior : candidate;
  const next = [...current.filter((row) => row.anonId !== anonId), kept].sort(compareScores).slice(0, MAX_ROWS);
  // ponytail: KV read-modify-write; move this board to a Durable Object if concurrent submissions measurably collide.
  await kv.put(key, JSON.stringify(next));
  const index = next.indexOf(kept);
  return json(cors, { ok: true, stored: index >= 0, rank: index >= 0 ? index + 1 : null });
}

async function readBoard(kv: KVNamespaceLike, epochId: string, contractId: string, tolerateFailure = false): Promise<StoredRow[]> {
  try {
    const parsed = JSON.parse((await kv.get(boardKey(epochId, contractId))) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.map((row) => validateStoredRow(row, contractId)).filter((row): row is StoredRow => row !== null).sort(compareScores).slice(0, MAX_ROWS) : [];
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
  const tape = value.tape === undefined ? undefined : validateTape(value.tape, contractId, value.seed, difficulty);
  const submittedAt = integerInRange(value.submittedAt, 0, Number.MAX_SAFE_INTEGER);
  if (submittedAt === null || tape === null || (tape && !tapeMatchesScore(tape, score))) return null;
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
  };
}

function validateScore(value: unknown): ScoreRow | null {
  if (!isRecord(value) || !hasOnlyKeys(value, SCORE_KEYS) || value.secured !== true) return null;
  const waves = integerInRange(value.waves, 0, 10_000);
  const timeAlive = numberInRange(value.timeAlive, 0, 24 * 60 * 60);
  const gold = integerInRange(value.gold, 0, 1_000_000_000);
  const baseValue = integerInRange(value.baseValue, 0, 1_000_000_000);
  return waves === null || timeAlive === null || gold === null || baseValue === null
    ? null
    : { secured: true, waves, timeAlive, gold, baseValue };
}

function compareScores(a: ScoreRow & { submittedAt?: number }, b: ScoreRow & { submittedAt?: number }): number {
  if (a.secured !== b.secured) return a.secured ? -1 : 1;
  if (a.waves !== b.waves) return b.waves - a.waves;
  if (a.baseValue !== b.baseValue) return b.baseValue - a.baseValue;
  if (a.timeAlive !== b.timeAlive) return b.timeAlive - a.timeAlive;
  if (a.gold !== b.gold) return b.gold - a.gold;
  return (a.submittedAt ?? 0) - (b.submittedAt ?? 0);
}

function knownContract(epochId: string, contractId: string): boolean {
  return CONTRACT_EPOCHS.get(contractId) === epochId;
}

function epochContracts(epochId: string): string[] | null {
  return CONTRACT_BUNDLES.find((bundle) => bundle.epochId === epochId)?.contracts.map((contract) => contract.id) ?? null;
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
    if (typeof fieldValue !== 'string' || fieldValue.length > MAX_STACK_FIELD_LENGTH) return null;
    stack[field] = fieldValue;
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

function validateTape(value: unknown, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null): JsonRecord | null {
  if (!isRecord(value) || new TextEncoder().encode(JSON.stringify(value)).length > MAX_TAPE_BYTES) return null;
  if (!hasOnlyKeys(value, new Set(['version', 'id', 'createdAt', 'kept', 'contract', 'seed', 'difficulty', 'simVersion', 'inputLog', 'eventLogHash', 'outcome']))) return null;
  if (value.version !== 1 || value.simVersion !== 1 || typeof value.id !== 'string' || !value.id || value.id.length > 64) return null;
  if (!Number.isSafeInteger(value.createdAt) || (value.createdAt as number) < 0 || typeof value.kept !== 'boolean') return null;
  if (value.contract !== contractId || value.seed !== seed || value.difficulty !== difficulty) return null;
  if (typeof value.eventLogHash !== 'string' || !/^fnv1a32:[a-f0-9]{8}$/.test(value.eventLogHash)) return null;
  if (!validTapeOutcome(value.outcome) || !validTapeInput(value.inputLog, contractId, seed, difficulty)) return null;
  return value;
}

function validTapeOutcome(value: unknown): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['reason', 'secured', 'waves', 'timeAlive', 'gold']))) return false;
  const secured = value.reason === 'secured' || value.reason === 'rush';
  return (value.reason === 'death' || secured) && value.secured === secured
    && integerInRange(value.waves, 0, 10_000) !== null
    && numberInRange(value.timeAlive, 0, 24 * 60 * 60) !== null
    && numberInRange(value.gold, 0, 1_000_000_000) !== null;
}

function validTapeInput(value: unknown, contractId: unknown, seed: unknown, difficulty: DifficultyPresetId | null): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, new Set(['version', 'name', 'contractId', 'seed', 'difficultyPreset', 'stepSeconds', 'start', 'durationTicks', 'entries', 'truncated', 'primarySlot', 'streams']))) return false;
  if (value.version !== 1 || value.contractId !== contractId || value.seed !== seed || value.difficultyPreset !== difficulty || value.stepSeconds !== 1 / 30) return false;
  if (typeof value.name !== 'string' || !value.name || value.name.length > 64 || !isRecord(value.start)
    || !hasOnlyKeys(value.start, new Set(['x', 'z']))) return false;
  if (numberInRange(value.start.x, -256, 256) === null || numberInRange(value.start.z, -256, 256) === null) return false;
  const duration = integerInRange(value.durationTicks, 0, 18_000);
  if (duration === null || !Array.isArray(value.entries) || value.entries.length > 2_000 || !validTapeTruncation(value.truncated, duration)) return false;
  const primarySlot = integerInRange(value.primarySlot, 0, 3);
  if (primarySlot === null || !Array.isArray(value.streams) || value.streams.length > 3 || !validTapeEntries(value.entries, duration)) return false;
  const slots = new Set<number>([primarySlot]);
  for (const stream of value.streams) {
    if (!isRecord(stream) || !hasOnlyKeys(stream, new Set(['slot', 'start', 'entries']))) return false;
    const slot = integerInRange(stream.slot, 0, 3);
    if (slot === null || slots.has(slot) || !isRecord(stream.start) || !hasOnlyKeys(stream.start, new Set(['x', 'z']))) return false;
    if (numberInRange(stream.start.x, -256, 256) === null || numberInRange(stream.start.z, -256, 256) === null) return false;
    if (!validTapeEntries(stream.entries, duration)) return false;
    slots.add(slot);
  }
  return true;
}

function validTapeEntries(entries: unknown, duration: number): boolean {
  if (!Array.isArray(entries) || entries.length > 2_000) return false;
  let prior = -1;
  for (const entry of entries) {
    if (!isRecord(entry) || !hasOnlyKeys(entry, new Set(['t', 'mx', 'my', 'a']))) return false;
    const tick = integerInRange(entry.t, 0, Math.max(0, duration - 1));
    if (tick === null || tick <= prior || !quantizedAxis(entry.mx) || !quantizedAxis(entry.my) || !Array.isArray(entry.a) || entry.a.length > 24) return false;
    if (!entry.a.every(validTapeAction)) return false;
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

function validTapeAction(value: unknown): boolean {
  if (!isRecord(value) || typeof value.type !== 'string') return false;
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
    return (value.action === 'upgrade' || value.action === 'demolish') && hasOnlyKeys(value, new Set(['type', 'action', 'target']))
      && isRecord(value.target) && hasOnlyKeys(value.target, new Set(['id', 'index'])) && token(value.target.id)
      && integerInRange(value.target.index, 0, 10_000) !== null;
  }
  if (value.type === 'set_agent_rung') return hasOnlyKeys(value, new Set(['type', 'level', 'granted']))
    && integerInRange(value.level, 0, 3) !== null && typeof value.granted === 'boolean';
  return value.type === 'set_agent_ability' && hasOnlyKeys(value, new Set(['type', 'ability', 'granted']))
    && token(value.ability) && typeof value.granted === 'boolean';
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

function boardKey(epochId: string, contractId: string): string {
  return `standings:${epochId}:${contractId}`;
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
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) throw new HttpError(413, 'payload_too_large', 'Standing is too large.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new HttpError(413, 'payload_too_large', 'Standing is too large.');
  try {
    const value = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {}
  throw new HttpError(400, 'bad_json', 'JSON not accepted.');
}

function corsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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
