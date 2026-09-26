import { localhostOriginAllowed, type LocalhostOriginsEnv } from './_cors';
import {
  fallbackReason,
  LedgerRequestError,
  ledgerClientKey,
  ledgerLink,
  ledgerRoute,
  withLedgerFallback,
  type LedgerEnv,
} from './_ledger';
import { bumpCounter, clientIpHash, type KVNamespaceLike as RateLimitKVNamespaceLike } from './_ratelimit';

type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type KVNamespaceLike = RateLimitKVNamespaceLike & {
  list(options?: { prefix?: string; cursor?: string }): Promise<KVListResult>;
  // The droplet ledger's permanent atomic counter and maximum (server/ledger/storage.mjs). Absent on
  // Cloudflare KV, where the read-then-write below is the only way.
  tally?(key: string): Promise<number>;
  raise?(key: string, value: number): Promise<void>;
};

type TelemetryEnv = LedgerEnv & LocalhostOriginsEnv & {
  TELEMETRY?: KVNamespaceLike; ACCOUNTS?: KVNamespaceLike;
};

type TelemetryContext = {
  request: Request;
  env: TelemetryEnv;
};

type JsonRecord = Record<string, unknown>;

type RunTelemetryPayload = {
  contract: string;
  stage: 'secure' | 'end' | 'legacy';
  waves: number;
  secureWave: number;
  deepestWave: number;
  duration: number;
  upgradesTaken: number;
  tier: 'FULL' | 'BALANCED' | 'LITE';
  frameP95: number;
  deviceClass: 'desktop' | 'mobile' | 'tablet';
  buildHash: string;
  nonce: string;
};

type RenderDemotionPayload = {
  event: 'render_demotion';
  reason: string;
  contractId: string;
  buildId: string;
  tier: 'FULL' | 'BALANCED' | 'LITE';
  dataset: Record<string, string>;
};

type TelemetryPayload = RunTelemetryPayload | RenderDemotionPayload;

const MAX_JSON_BYTES = 4 * 1024;
// The ledger road carries the validated beacon plus the anonymous client key.
const LEDGER_TELEMETRY_BYTES = MAX_JSON_BYTES + 1024;
const DEDUP_TTL_SECONDS = 62 * 24 * 60 * 60;
const UPDATED_AT_KEY = 'telemetry:updatedAt';
// kv-counters-to-ledger-1 scope 1: the "last beacon" stamp moves at most once a minute. The stats door
// caches its answer for 60 s (`PUBLIC_CACHE`, stats.ts), so a finer stamp was a write nobody could see.
const UPDATED_AT_MIN_INTERVAL_MS = 60_000;
const RATE_LIMIT_MESSAGE = 'The wire is busy. Try again later.';
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REQUESTS_PER_IP = 30;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const IDENTIFIER_KEYS = new Set(['email', 'profile', 'profileid', 'profilename', 'wallet', 'ip', 'name', 'userid', 'user_id']);
const ALLOWED_RUN_PAYLOAD_KEYS = new Set([
  'contract',
  'stage',
  'waves',
  'secureWave',
  'deepestWave',
  'duration',
  'upgradesTaken',
  'tier',
  'frameP95',
  'deviceClass',
  'buildHash',
  'nonce',
]);
const ALLOWED_RENDER_DEMOTION_KEYS = new Set(['event', 'reason', 'contractId', 'buildId', 'tier', 'dataset']);
const KNOWN_CONTRACTS = new Set(['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron', 'e2-hill-mine']);
const OTHER_CONTRACT = 'other';

export async function onRequest(context: TelemetryContext): Promise<Response> {
  const cors = corsHeaders(context.request, context.env);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');

  try {
    const body = await readJson(context.request, MAX_JSON_BYTES);
    if (hasIdentifierKey(body)) return error(cors, 400, 'identifier_rejected', 'Telemetry cannot carry identifiers.');
    if (!hasOnlyAllowedPayloadKeys(body)) return error(cors, 400, 'bad_payload', 'Telemetry payload not accepted.');
    const payload = validatePayload(body);
    if (!payload) return error(cors, 400, 'bad_payload', 'Telemetry payload not accepted.');
    const client = await clientIpHash(context.request);

    // kv-counters-to-ledger-1 scope 1, "or better: forward the beacon to the ledger and write nothing
    // on the edge". With the ledger bound, a beacon costs the shared KV namespace ZERO writes: the
    // per-address limit, the dedup and every aggregate are counted in sqlite, where a write is free.
    const ledger = ledgerLink(context.env);
    if (ledger) {
      // The body AS RECEIVED (already accepted above), not the normalised payload: `validatePayload`
      // fills a legacy client's missing stage in as 'legacy', which it would then refuse on the ledger.
      // Both ends validate the same bytes with the same function.
      const reply = await ledger.post('/api/ledger/telemetry', { client, beacon: body });
      if (reply?.ok === true) return json(cors, { ok: true, stored: true, duplicate: reply.duplicate === true });
      if (reply?.error === 'rate_limited') return error(cors, 429, 'rate_limited', RATE_LIMIT_MESSAGE);
      // Bound but not served (down, restarting, the nginx route missing): the beacon is DROPPED, not
      // spent against the KV budget. That budget is the co-op limiter's fallback, the one door that
      // must keep answering while the ledger rests; telemetry is best-effort and says so here.
      return json(withLedgerFallback(cors, fallbackReason(ledger)), { ok: true, stored: false });
    }

    // Unconfigured (every fixture, and production until the ops evening binds the secret): the KV path
    // keeps its shape, because the unchanged stats door reads these very keys back (`npm run
    // test:stats` pins it). What scope 1 changes here is what a beacon can make it spend: a replay under
    // a fresh nonce is now a duplicate (1 write, the limiter, instead of 13), a replayed render demotion
    // likewise (1 instead of 8), and `telemetry:updatedAt` moves at most once a minute.
    const unconfigured = withLedgerFallback(cors, fallbackReason(ledger));
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return json(unconfigured, { ok: true, stored: false });
    const ipAllowed = await bumpCounter(kv, `telemetry:ratelimit:${client}`, MAX_REQUESTS_PER_IP, RATE_TTL_SECONDS);
    if (!ipAllowed) return error(unconfigured, 429, 'rate_limited', RATE_LIMIT_MESSAGE);
    return json(unconfigured, { ok: true, stored: true, duplicate: await recordBeacon(kv, payload) });
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'Telemetry not accepted.');
  }
}

// POST /api/ledger/telemetry {client, beacon} on the droplet (server/ledger/serve.mjs). The beacon is
// validated AGAIN here with the same allowlist and caps as the edge: the ledger trusts the secret, not
// the shape of what arrives with it.
export async function ledgerTelemetry(context: { request: Request; env: TelemetryEnv }): Promise<Response> {
  return ledgerRoute(context, ['POST'], LEDGER_TELEMETRY_BYTES, async ({ body }) => {
    const client = ledgerClientKey(body.client);
    const beacon = isRecord(body.beacon) && !hasIdentifierKey(body.beacon) && hasOnlyAllowedPayloadKeys(body.beacon)
      ? validatePayload(body.beacon)
      : null;
    if (!client || !beacon) throw new LedgerRequestError(400, 'bad_payload');
    const store = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!store) throw new LedgerRequestError(503, 'office_closed');
    if (!(await bumpCounter(store, `telemetry:ratelimit:${client}`, MAX_REQUESTS_PER_IP, RATE_TTL_SECONDS))) {
      return { ok: false, error: 'rate_limited' };
    }
    return { ok: true, duplicate: await recordBeacon(store, beacon) };
  });
}

async function recordBeacon(kv: KVNamespaceLike, payload: TelemetryPayload): Promise<boolean> {
  return 'event' in payload ? storeRenderDemotion(kv, payload) : storeAggregate(kv, payload);
}

async function storeAggregate(kv: KVNamespaceLike, payload: RunTelemetryPayload): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const dedupKey = `telemetry:dedup:${month}:${await digestPayload(payload)}`;
  if (await kv.get(dedupKey)) return true;

  await kv.put(dedupKey, '1', { expirationTtl: DEDUP_TTL_SECONDS });
  const recordsRun = payload.stage === 'legacy' || payload.stage === 'secure' || payload.secureWave === 0;
  const recordsEnd = payload.stage !== 'secure';
  await Promise.all([
    ...(recordsRun ? [
      bump(kv, 'telemetry:runs:total'),
      bump(kv, `telemetry:runs:day:${day}`),
      bump(kv, `telemetry:contract:${contractBucket(payload.contract)}`),
      bump(kv, `telemetry:tier:${payload.tier}`),
      bump(kv, `telemetry:device:${payload.deviceClass}`),
      bump(kv, `telemetry:frameP95:${frameBucket(payload.frameP95)}`),
      bump(kv, `telemetry:device:${payload.deviceClass}:frameP95:${frameBucket(payload.frameP95)}`),
    ] : []),
    ...(recordsEnd ? [
      bump(kv, `telemetry:duration:${durationBucket(payload.duration)}`),
      bump(kv, `telemetry:waves:${waveBucket(payload.waves)}`),
      maxValue(kv, 'telemetry:waves:max', payload.waves),
      bump(kv, `telemetry:continuation:${payload.secureWave > 0 && payload.deepestWave > payload.secureWave ? 'continued' : payload.secureWave > 0 ? 'left' : 'unsecured'}`),
    ] : []),
    ...(payload.secureWave > 0 && payload.stage !== 'end'
      ? [bump(kv, `telemetry:secured-at:${waveBucket(payload.secureWave)}`)]
      : []),
  ]);
  await touchUpdatedAt(kv);
  return false;
}

// kv-counters-to-ledger-1 scope 1: the render-demotion record gets the run beacon's dedup and TTL. It
// used to write eight rows per report with no dedup at all, so a replayed report cost eight writes
// every time. NOTE THE MEANING THIS BUYS: the payload carries no identity (identifiers are refused
// above, by design), so a demotion is now counted once per distinct signature per month; two players
// who demote identically on the same build are one row. That trade is the owner's to keep or change.
async function storeRenderDemotion(kv: KVNamespaceLike, payload: RenderDemotionPayload): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const dedupKey = `telemetry:dedup:${day.slice(0, 7)}:${await digestRenderDemotion(payload)}`;
  if (await kv.get(dedupKey)) return true;
  await kv.put(dedupKey, '1', { expirationTtl: DEDUP_TTL_SECONDS });
  await Promise.all([
    bump(kv, 'telemetry:render-demotion:total'),
    bump(kv, `telemetry:render-demotion:day:${day}`),
    bump(kv, `telemetry:render-demotion:reason:${reasonBucket(payload.reason)}`),
    bump(kv, `telemetry:render-demotion:contract:${payload.contractId}`),
    bump(kv, `telemetry:render-demotion:tier:${payload.tier}`),
    kv.put(
      `telemetry:render-demotion:latest:${payload.contractId}`,
      JSON.stringify({ ...payload, receivedAt: new Date().toISOString() }),
      { expirationTtl: DEDUP_TTL_SECONDS },
    ),
  ]);
  await touchUpdatedAt(kv);
  return false;
}

// Read first, write only when the stamp is a minute old (or missing, or from a clock ahead of ours).
async function touchUpdatedAt(kv: KVNamespaceLike): Promise<void> {
  const now = Date.now();
  const last = Date.parse((await kv.get(UPDATED_AT_KEY)) ?? '');
  if (Number.isFinite(last) && now >= last && now - last < UPDATED_AT_MIN_INTERVAL_MS) return;
  await kv.put(UPDATED_AT_KEY, new Date(now).toISOString());
}

async function bump(kv: KVNamespaceLike, key: string): Promise<void> {
  if (kv.tally) {
    await kv.tally(key);
    return;
  }
  const current = Number(await kv.get(key));
  await kv.put(key, String((Number.isFinite(current) && current > 0 ? current : 0) + 1));
}

async function maxValue(kv: KVNamespaceLike, key: string, value: number): Promise<void> {
  if (kv.raise) {
    await kv.raise(key, value);
    return;
  }
  const current = Number(await kv.get(key));
  if (!Number.isFinite(current) || value > current) await kv.put(key, String(value));
}

function validatePayload(value: JsonRecord): TelemetryPayload | null {
  if (value.event === 'render_demotion') return validateRenderDemotionPayload(value);
  const waves = integerInRange(value.waves, 0, 10000);
  const payload = {
    contract: typeof value.contract === 'string' && /^[a-z0-9][a-z0-9-]{0,80}$/.test(value.contract) ? value.contract : '',
    stage: value.stage === undefined ? 'legacy' : value.stage === 'secure' || value.stage === 'end' ? value.stage : null,
    waves,
    secureWave: value.secureWave === undefined ? 0 : integerInRange(value.secureWave, 0, 10000),
    deepestWave: value.deepestWave === undefined ? waves : integerInRange(value.deepestWave, 0, 10000),
    duration: integerInRange(value.duration, 0, 24 * 60 * 60 * 1000),
    upgradesTaken: integerInRange(value.upgradesTaken, 0, 1000),
    tier: value.tier === 'FULL' || value.tier === 'BALANCED' || value.tier === 'LITE' ? value.tier : null,
    frameP95: numberInRange(value.frameP95, 0, 10000),
    deviceClass: value.deviceClass === 'desktop' || value.deviceClass === 'mobile' || value.deviceClass === 'tablet' ? value.deviceClass : null,
    buildHash: typeof value.buildHash === 'string' && /^(dev|[a-f0-9]{7,16})$/i.test(value.buildHash) ? value.buildHash : '',
    nonce: typeof value.nonce === 'string' && /^[a-f0-9]{32}$/.test(value.nonce) ? value.nonce : '',
  };
  if (!payload.contract || !payload.stage || payload.waves === null || payload.duration === null || payload.upgradesTaken === null) return null;
  if (!payload.tier || payload.frameP95 === null || !payload.deviceClass || !payload.buildHash || !payload.nonce) return null;
  if (payload.secureWave === null || payload.deepestWave === null || payload.deepestWave < payload.secureWave) return null;
  return payload as RunTelemetryPayload;
}

function validateRenderDemotionPayload(value: JsonRecord): RenderDemotionPayload | null {
  const dataset = validateDataset(value.dataset);
  if (
    typeof value.reason !== 'string' || value.reason.length < 1 || value.reason.length > 240 || /[\u0000-\u001f\u007f]/.test(value.reason) ||
    typeof value.contractId !== 'string' || !/^[a-z0-9][a-z0-9-]{0,80}$/.test(value.contractId) ||
    typeof value.buildId !== 'string' || !/^(dev|[a-f0-9]{7,16})$/i.test(value.buildId) ||
    (value.tier !== 'FULL' && value.tier !== 'BALANCED' && value.tier !== 'LITE') || !dataset
  ) return null;
  return {
    event: 'render_demotion',
    reason: value.reason,
    contractId: value.contractId,
    buildId: value.buildId,
    tier: value.tier,
    dataset,
  };
}

function validateDataset(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  const entries = Object.entries(value);
  if (entries.length > 50) return null;
  for (const [key, item] of entries) {
    if (!/^[A-Za-z0-9]{1,80}$/.test(key) || typeof item !== 'string' || item.length > MAX_JSON_BYTES) return null;
  }
  return Object.fromEntries(entries) as Record<string, string>;
}

function contractBucket(contract: string): string {
  return KNOWN_CONTRACTS.has(contract) ? contract : OTHER_CONTRACT;
}

function integerInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function frameBucket(value: number): string {
  if (value < 16) return 'lt16';
  if (value < 25) return '16-25';
  if (value < 33) return '25-33';
  if (value < 50) return '33-50';
  return '50plus';
}

function durationBucket(value: number): string {
  const seconds = value / 1000;
  if (seconds < 60) return 'lt1m';
  if (seconds < 180) return '1-3m';
  if (seconds < 300) return '3-5m';
  if (seconds < 600) return '5-10m';
  if (seconds < 1200) return '10-20m';
  return '20mplus';
}

function waveBucket(value: number): string {
  if (value < 5) return '0-4';
  if (value < 10) return '5-9';
  if (value < 20) return '10-19';
  if (value < 30) return '20-29';
  if (value < 40) return '30-39';
  return '40plus';
}

// kv-counters-to-ledger-1 scope 1: the client nonce is OUT of the digest. It was the only field a
// caller could change freely, so a replayed beacon under a fresh nonce was a brand-new run to this
// door and cost its full write bill again (measured: 13 KV writes, the flood shape). The digest is now
// the run itself: which contract, which stage, how it went, on what build and device. The master named
// the run's identity as "contract, seed, outcome, the profile's anonymous id"; the beacon carries no
// seed and no anonymous id (src/telemetry/payload.ts), and the monthly nonce WAS the only anonymous id
// it carried, which is exactly why it cannot anchor a dedup. The nonce is still required on the wire,
// so every shipped client keeps being accepted.
async function digestPayload(payload: RunTelemetryPayload): Promise<string> {
  return sha256Hex([
    payload.contract,
    payload.stage,
    payload.waves,
    payload.secureWave,
    payload.deepestWave,
    payload.duration,
    payload.upgradesTaken,
    payload.tier,
    payload.frameP95,
    payload.deviceClass,
    payload.buildHash,
  ].join(':'));
}

async function digestRenderDemotion(payload: RenderDemotionPayload): Promise<string> {
  const dataset = Object.keys(payload.dataset).sort().map((key) => [key, payload.dataset[key]]);
  return sha256Hex(JSON.stringify([payload.event, payload.reason, payload.contractId, payload.buildId, payload.tier, dataset]));
}

async function sha256Hex(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hasIdentifierKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasIdentifierKey);
  if (!isRecord(value)) return false;
  for (const [key, nested] of Object.entries(value)) {
    if (IDENTIFIER_KEYS.has(key.toLowerCase())) return true;
    if (hasIdentifierKey(nested)) return true;
  }
  return false;
}

function hasOnlyAllowedPayloadKeys(value: JsonRecord): boolean {
  const allowed = value.event === 'render_demotion' ? ALLOWED_RENDER_DEMOTION_KEYS : ALLOWED_RUN_PAYLOAD_KEYS;
  return Object.keys(value).every((key) => allowed.has(key));
}

function reasonBucket(reason: string): string {
  return reason.split(':', 1)[0]!.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 80) || 'other';
}

async function readJson(request: Request, maxBytes: number): Promise<JsonRecord> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) throw new HttpError(415, 'unsupported_media_type', 'Send application/json.');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) throw new HttpError(413, 'payload_too_large', 'Telemetry payload is too large.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new HttpError(413, 'payload_too_large', 'Telemetry payload is too large.');
  try {
    const value = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {}
  throw new HttpError(400, 'bad_json', 'JSON not accepted.');
}

function corsHeaders(request: Request, env: LocalhostOriginsEnv): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || localhostOriginAllowed(origin, env)) {
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
