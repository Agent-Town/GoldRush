import { localhostOriginAllowed, type LocalhostOriginsEnv } from './_cors';
import { bumpCounter, clientIpHash } from './_ratelimit';

export const SUBMISSION_REFUSAL_REASONS = [
  'bad_json',
  'bad_payload',
  'bad_bench_seed',
  'bad_season',
  'rate_limited',
  'reel_duration_exceeded',
  'reel_not_current',
  'reel_too_large',
  'rotation_closed',
  'season_closed',
  'training_ground',
  'unsecured',
  'unsupported_media_type',
] as const;

export type SubmissionRefusalReason = (typeof SUBMISSION_REFUSAL_REASONS)[number];

/**
 * WHAT THE ASSAY REFUSES, as opposed to what the door refuses (F-2464-3, 2026-09-06).
 *
 * These name a verdict the county reaches about a standing it already accepted and stored, so they
 * are deliberately NOT members of `SUBMISSION_REFUSAL_REASONS` above: that list is pinned by
 * `scripts/skillmd-guard.test.mjs` against the `refuseSubmission(...)` branches in `standings.ts`
 * and against `public/skill.md`'s published taxonomy, and an assay verdict has neither. They reach
 * a rider as the `assayReason` on their own slip (`GET /api/standings?...&verdict=<reel id>`).
 *
 * `score_mismatch` — the reel's declared score and the county's own secure-tick snapshot disagree
 * about one instant. Before this reason existed the county silently published its snapshot over
 * the rider's score, which is how a Mare Claim reel that banked 60 gold appeared on the board at
 * 1180 (F-HEAT12-5).
 */
export const ASSAY_REJECTION_REASONS = ['score_mismatch'] as const;

export type AssayRejectionReason = (typeof ASSAY_REJECTION_REASONS)[number];

export type RefusalRecord = {
  reason: SubmissionRefusalReason;
  contractId: string;
  anonId: string;
  profileName: string;
  refusedAt: number;
};

type RefusalQuery = { rider?: string; profile?: string; limit: number };
type RefusalResult = { counts: Record<string, number>; recent: RefusalRecord[] };
export type RefusalStorage = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  recordRefusal?(record: RefusalRecord): Promise<void>;
  readRefusals?(query: RefusalQuery): Promise<RefusalResult>;
};

type RefusalContext = {
  request: Request;
  env: LocalhostOriginsEnv & { TELEMETRY?: RefusalStorage; ACCOUNTS?: RefusalStorage; ALLOWED_CORS_ORIGINS?: ReadonlySet<string> };
};

const ANON_ID = /^[a-f0-9]{32}$/;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const RECENT_LIMIT = 20;
const READ_RATE_LIMIT = 60;
const RATE_TTL_SECONDS = 60 * 60;
const KV_PREFIX = 'refusal:';

export async function onRequest(context: RefusalContext): Promise<Response> {
  const cors = corsHeaders(context.request, context.env);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET') return error(cors, 405, 'method_not_allowed', 'GET only');

  const url = new URL(context.request.url);
  const rider = url.searchParams.get('rider');
  const profile = url.searchParams.get('profile');
  if (url.searchParams.size !== 1 || (rider === null) === (profile === null)
    || (rider !== null && !ANON_ID.test(rider))
    || (profile !== null && (profile.length === 0 || profile.length > 24 || cleanProfile(profile) !== profile))) {
    return error(cors, 400, 'bad_filter', 'Ask by one rider or profile.');
  }

  const storage = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!storage?.readRefusals && url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') {
    const ledgerUrl = new URL(url);
    ledgerUrl.protocol = 'https:';
    ledgerUrl.host = 'agenttown.app';
    ledgerUrl.pathname = '/api/standings/refusals';
    return fetch(new Request(ledgerUrl, context.request));
  }
  if (!storage) return error(cors, 503, 'board_unavailable', 'The county book is unavailable.');
  if (!(await bumpCounter(storage, `refusals:ratelimit:${await clientIpHash(context.request)}`, READ_RATE_LIMIT, RATE_TTL_SECONDS))) {
    return error(cors, 429, 'rate_limited', 'The county clerk needs a spell.');
  }

  const result = storage.readRefusals
    ? await storage.readRefusals({ ...(rider ? { rider } : { profile: profile! }), limit: RECENT_LIMIT })
    : await readKvRefusals(storage, { ...(rider ? { rider } : { profile: profile! }), limit: RECENT_LIMIT });
  return json(cors, { ok: true, counts: result.counts, recent: result.recent.map(({ reason, contractId, refusedAt }) => ({ reason, contractId, refusedAt })) });
}

export async function recordSubmissionRefusal(storage: RefusalStorage | undefined, body: Record<string, unknown>, reason: SubmissionRefusalReason): Promise<void> {
  if (!storage) return;
  const record: RefusalRecord = {
    reason,
    contractId: typeof body.contractId === 'string' ? body.contractId.slice(0, 80) : '',
    anonId: typeof body.anonId === 'string' && ANON_ID.test(body.anonId) ? body.anonId : '',
    profileName: cleanProfile(body.profileName),
    refusedAt: Date.now(),
  };
  if (storage.recordRefusal) return storage.recordRefusal(record);
  const keys = [
    ...(record.anonId ? [`${KV_PREFIX}rider:${record.anonId}`] : []),
    ...(record.profileName ? [`${KV_PREFIX}profile:${encodeURIComponent(record.profileName)}`] : []),
  ];
  if (keys.length === 0) keys.push(`${KV_PREFIX}anonymous`);
  // ponytail: KV read-modify-write can lose simultaneous increments; move this index to a
  // Durable Object if concurrent refusal traffic makes exact edge-side counts necessary.
  await Promise.all(keys.map((key) => updateKvRefusals(storage, key, record)));
}

async function readKvRefusals(storage: RefusalStorage, query: RefusalQuery): Promise<RefusalResult> {
  const key = query.rider ? `${KV_PREFIX}rider:${query.rider}` : `${KV_PREFIX}profile:${encodeURIComponent(query.profile!)}`;
  const result = parseResult(await storage.get(key));
  return { counts: result.counts, recent: result.recent.slice(0, query.limit) };
}

async function updateKvRefusals(storage: RefusalStorage, key: string, record: RefusalRecord): Promise<void> {
  const result = parseResult(await storage.get(key));
  result.counts[record.reason] = (result.counts[record.reason] ?? 0) + 1;
  result.recent.unshift(record);
  await storage.put(key, JSON.stringify({ counts: result.counts, recent: result.recent.slice(0, RECENT_LIMIT) }));
}

function parseResult(value: string | null): RefusalResult {
  try {
    const parsed = JSON.parse(value ?? '') as RefusalResult;
    if (!parsed || typeof parsed.counts !== 'object' || !Array.isArray(parsed.recent)) return { counts: {}, recent: [] };
    const recent = parsed.recent.filter((record) => record && SUBMISSION_REFUSAL_REASONS.includes(record.reason)
      && typeof record.contractId === 'string' && typeof record.anonId === 'string'
      && typeof record.profileName === 'string' && Number.isSafeInteger(record.refusedAt));
    const counts = Object.fromEntries(Object.entries(parsed.counts).filter(([reason, count]) =>
      SUBMISSION_REFUSAL_REASONS.includes(reason as SubmissionRefusalReason) && Number.isSafeInteger(count) && count >= 0));
    return { counts, recent };
  } catch {
    return { counts: {}, recent: [] };
  }
}

function cleanProfile(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, 24) : '';
}

function corsHeaders(request: Request, env: LocalhostOriginsEnv & { ALLOWED_CORS_ORIGINS?: ReadonlySet<string> }): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers = { 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Cache-Control': 'no-store', Vary: 'Origin' };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || env.ALLOWED_CORS_ORIGINS?.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || localhostOriginAllowed(origin, env)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin };
  }
  return null;
}

function json(cors: Record<string, string>, value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8' } });
}

function error(cors: Record<string, string>, status: number, code: string, message: string): Response {
  return json(cors, { ok: false, error: code, message }, status);
}
