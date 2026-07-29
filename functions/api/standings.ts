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
};

type StoredRow = ScoreRow & {
  profileName: string;
  anonId: string;
  seed?: string;
  seedMode?: SeedMode;
  seedHash: string;
  inputLogHash: string;
  submittedAt: number;
  stack?: SelfDeclaredStack;
};

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
const MAX_JSON_BYTES = 4 * 1024;
const MAX_ROWS = 100;
const MAX_REQUESTS_PER_ANON = 12;
const MAX_REQUESTS_PER_IP = 60;
const RATE_TTL_SECONDS = 60 * 60;
const SHA256 = /^[a-f0-9]{64}$/;
const ANON_ID = /^[a-f0-9]{32}$/;
const MAX_SEED_LENGTH = 256;
const MAX_STACK_FIELD_LENGTH = 256;
const STACK_FIELDS = ['model', 'harness', 'harnessVersion', 'config'] as const;
const STACK_KEYS = new Set<string>(STACK_FIELDS);
const STORED_STACK_KEYS = new Set([...STACK_FIELDS, 'declaredBy']);
const POST_KEYS = new Set(['contractId', 'epochId', 'score', 'profileName', 'anonId', 'seed', 'seedMode', 'seedHash', 'inputLogHash', 'stack']);
const SCORE_KEYS = new Set(['secured', 'waves', 'timeAlive', 'gold', 'baseValue']);

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
  const contractId = url.searchParams.get('contract') ?? '';
  const epochId = url.searchParams.get('epoch') ?? '';
  if (url.searchParams.size !== 2 || !knownContract(epochId, contractId)) {
    return error(cors, 400, 'bad_contract', 'Contract and epoch not accepted.');
  }
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  const rows = kv ? await readBoard(kv, epochId, contractId, true) : [];
  return json(cors, {
    ok: true,
    epochId,
    contractId,
    board: rows.map(({ profileName, secured, waves, timeAlive, gold, baseValue }, index) => ({
      rank: index + 1,
      profileName,
      secured,
      waves,
      timeAlive,
      gold,
      baseValue,
    })),
  });
}

async function submitScore(context: StandingsContext, cors: Record<string, string>): Promise<Response> {
  const body = await readJson(context.request);
  if (!hasOnlyKeys(body, POST_KEYS)) return error(cors, 400, 'bad_payload', 'Standing not accepted.');
  const contractId = typeof body.contractId === 'string' ? body.contractId : '';
  const epochId = typeof body.epochId === 'string' ? body.epochId : '';
  const score = validateScore(body.score);
  const profileName = cleanName(body.profileName);
  const anonId = typeof body.anonId === 'string' && ANON_ID.test(body.anonId) ? body.anonId : '';
  const seed = typeof body.seed === 'string' && body.seed.length > 0 && body.seed.length <= MAX_SEED_LENGTH ? body.seed : '';
  const seedMode = body.seedMode === 'live' || body.seedMode === 'bench' ? body.seedMode : null;
  const seedHash = typeof body.seedHash === 'string' && SHA256.test(body.seedHash) ? body.seedHash : '';
  const inputLogHash = typeof body.inputLogHash === 'string' && SHA256.test(body.inputLogHash) ? body.inputLogHash : '';
  const stack = body.stack === undefined ? undefined : validateStack(body.stack);
  if (!knownContract(epochId, contractId) || !score || !anonId || !seed || !seedMode || !seedHash || !inputLogHash || stack === null) {
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
    seed,
    seedMode,
    seedHash,
    inputLogHash,
    submittedAt: Date.now(),
    ...(stack ? { stack } : {}),
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
    return Array.isArray(parsed) ? parsed.map(validateStoredRow).filter((row): row is StoredRow => row !== null).sort(compareScores).slice(0, MAX_ROWS) : [];
  } catch {
    if (tolerateFailure) return [];
    throw new HttpError(503, 'board_unavailable', 'The county book is unavailable.');
  }
}

function validateStoredRow(value: unknown): StoredRow | null {
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
  const hasSeedFields = value.seed !== undefined || value.seedMode !== undefined;
  if (hasSeedFields && (typeof value.seed !== 'string' || value.seed.length === 0 || value.seed.length > MAX_SEED_LENGTH)) return null;
  if (hasSeedFields && value.seedMode !== 'live' && value.seedMode !== 'bench') return null;
  if (typeof value.seedHash !== 'string' || !SHA256.test(value.seedHash)) return null;
  if (typeof value.inputLogHash !== 'string' || !SHA256.test(value.inputLogHash)) return null;
  const stack = value.stack === undefined ? undefined : validateStack(value.stack, true);
  if (stack === null) return null;
  const submittedAt = integerInRange(value.submittedAt, 0, Number.MAX_SAFE_INTEGER);
  if (submittedAt === null) return null;
  return {
    ...score,
    profileName,
    anonId: value.anonId,
    seedHash: value.seedHash,
    inputLogHash: value.inputLogHash,
    submittedAt,
    ...(hasSeedFields ? { seed: value.seed as string, seedMode: value.seedMode as SeedMode } : {}),
    ...(stack ? { stack } : {}),
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

function cleanName(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 24) || 'Anonymous Prospector' : 'Anonymous Prospector';
}

function validateStack(value: unknown, stored = false): SelfDeclaredStack | null {
  if (!isRecord(value) || !hasOnlyKeys(value, stored ? STORED_STACK_KEYS : STACK_KEYS)) return null;
  if (stored && value.declaredBy !== 'self') return null;
  const stack: SelfDeclaredStack = { declaredBy: 'self' };
  for (const field of STACK_FIELDS) {
    const fieldValue = value[field];
    if (fieldValue === undefined) continue;
    if (typeof fieldValue !== 'string' || fieldValue.length > MAX_STACK_FIELD_LENGTH) return null;
    stack[field] = fieldValue;
  }
  return stack;
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
