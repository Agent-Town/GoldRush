type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<KVListResult>;
};

type TelemetryEnv = {
  TELEMETRY?: KVNamespaceLike; ACCOUNTS?: KVNamespaceLike;
};

type TelemetryContext = {
  request: Request;
  env: TelemetryEnv;
};

type JsonRecord = Record<string, unknown>;

type TelemetryPayload = {
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

const MAX_JSON_BYTES = 4 * 1024;
const DEDUP_TTL_SECONDS = 62 * 24 * 60 * 60;
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REQUESTS_PER_IP = 30;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const IDENTIFIER_KEYS = new Set(['email', 'profile', 'profileid', 'profilename', 'wallet', 'ip', 'name', 'userid', 'user_id']);
const ALLOWED_PAYLOAD_KEYS = new Set([
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
const KNOWN_CONTRACTS = new Set(['the-claim', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron', 'e2-hill-mine']);
const OTHER_CONTRACT = 'other';

export async function onRequest(context: TelemetryContext): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');

  try {
    const body = await readJson(context.request, MAX_JSON_BYTES);
    if (hasIdentifierKey(body)) return error(cors, 400, 'identifier_rejected', 'Telemetry cannot carry identifiers.');
    if (!hasOnlyAllowedPayloadKeys(body)) return error(cors, 400, 'bad_payload', 'Telemetry payload not accepted.');
    const payload = validatePayload(body);
    if (!payload) return error(cors, 400, 'bad_payload', 'Telemetry payload not accepted.');
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return json(cors, { ok: true, stored: false });
    const ipAllowed = await bumpCounter(kv, `telemetry:ratelimit:${await clientIpHash(context.request)}`, MAX_REQUESTS_PER_IP);
    if (!ipAllowed) return error(cors, 429, 'rate_limited', 'The wire is busy. Try again later.');

    const duplicate = await storeAggregate(kv, payload);
    return json(cors, { ok: true, stored: true, duplicate });
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'Telemetry not accepted.');
  }
}

async function storeAggregate(kv: KVNamespaceLike, payload: TelemetryPayload): Promise<boolean> {
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
  await kv.put('telemetry:updatedAt', new Date().toISOString());
  return false;
}

async function bump(kv: KVNamespaceLike, key: string): Promise<void> {
  const current = Number(await kv.get(key));
  await kv.put(key, String((Number.isFinite(current) && current > 0 ? current : 0) + 1));
}

async function bumpCounter(kv: KVNamespaceLike, key: string, limit: number): Promise<boolean> {
  const current = Number(await kv.get(key));
  const count = Number.isFinite(current) && current > 0 ? Math.trunc(current) : 0;
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_TTL_SECONDS });
  return true;
}

async function maxValue(kv: KVNamespaceLike, key: string, value: number): Promise<void> {
  const current = Number(await kv.get(key));
  if (!Number.isFinite(current) || value > current) await kv.put(key, String(value));
}

function validatePayload(value: JsonRecord): TelemetryPayload | null {
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
  return payload as TelemetryPayload;
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

async function digestPayload(payload: TelemetryPayload): Promise<string> {
  const text = [
    payload.nonce,
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
  ].join(':');
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function clientIpHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'local';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
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
  return Object.keys(value).every((key) => ALLOWED_PAYLOAD_KEYS.has(key));
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

function corsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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
