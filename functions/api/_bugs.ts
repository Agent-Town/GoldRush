type KVListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KVListResult>;
};

export type BugsEnv = {
  TELEMETRY?: KVNamespaceLike;
  ACCOUNTS?: KVNamespaceLike;
  BUG_OFFICE_TOKEN?: string;
};

export type BugsContext = {
  request: Request;
  env: BugsEnv;
  params?: Record<string, string | string[]>;
};

type JsonRecord = Record<string, unknown>;

type BugReport = {
  id: string;
  submittedAt: string;
  description: string;
  prospectorName?: string;
  screenshot?: string;
  diagnostics: {
    contractId: string;
    wave: number;
    position: { x: number; z: number };
    tier: 'FULL' | 'BALANCED' | 'LITE';
    version: string;
  };
};

const MAX_DESCRIPTION_LENGTH = 2_000;
const MAX_NAME_LENGTH = 24;
const MAX_SCREENSHOT_BYTES = 180 * 1024;
const MAX_JSON_BYTES = 260 * 1024;
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REPORTS_PER_IP = 5;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);

export async function postBug(context: BugsContext): Promise<Response> {
  const cors = corsHeaders(context.request, 'POST, OPTIONS');
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'The clerk cannot take reports from that trail.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return decline(cors);

  try {
    const report = validateReport(await readJson(context.request));
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return error(cors, 503, 'office_closed', 'The complaints ledger is off the desk. Try again later.');
    if (!(await bumpCounter(kv, `bug:ratelimit:${await clientIpHash(context.request)}`))) {
      return error(cors, 429, 'rate_limited', 'The complaints desk has your stack already. Try again after the next bell.');
    }

    const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const stored: BugReport = { id, submittedAt: new Date().toISOString(), ...report };
    await kv.put(`bug:${id}`, JSON.stringify(stored));
    return json(cors, { ok: true, id }, 201);
  } catch (cause) {
    if (cause instanceof HttpError) return error(cors, cause.status, cause.code, cause.message);
    return error(cors, 500, 'server_error', 'The clerk dropped the ledger. Try again later.');
  }
}

export async function listBugs(context: BugsContext): Promise<Response> {
  const cors = corsHeaders(context.request, 'GET, OPTIONS');
  if (!cors) return decline({});
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET' || !authorized(context)) return decline(cors);
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return json(cors, { ok: true, bugs: [], cursor: null, listComplete: true });

  const url = new URL(context.request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const requestedLimit = Number(url.searchParams.get('limit') ?? '50');
  const limit = Number.isInteger(requestedLimit) ? Math.min(100, Math.max(1, requestedLimit)) : 50;
  const page = await kv.list({ prefix: 'bug:', cursor, limit });
  const reports = (await Promise.all(page.keys.map(({ name }) => kv.get(name))))
    .map(parseStoredReport)
    .filter((report): report is BugReport => report !== null)
    .map(({ screenshot: _screenshot, ...summary }) => summary);
  return json(cors, {
    ok: true,
    bugs: reports,
    cursor: page.list_complete ? null : page.cursor ?? null,
    listComplete: page.list_complete,
  });
}

export async function getBug(context: BugsContext): Promise<Response> {
  const cors = corsHeaders(context.request, 'GET, OPTIONS');
  if (!cors) return decline({});
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET' || !authorized(context)) return decline(cors);
  const id = context.params?.id;
  if (typeof id !== 'string' || !/^\d{13}-[a-f0-9]{8}$/.test(id)) return decline(cors);
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return decline(cors);
  const report = parseStoredReport(await kv.get(`bug:${id}`));
  return report ? json(cors, { ok: true, bug: report }) : decline(cors);
}

function validateReport(value: JsonRecord): Omit<BugReport, 'id' | 'submittedAt'> {
  if (!hasOnlyKeys(value, ['description', 'prospectorName', 'screenshot', 'diagnostics'])) throw badPayload();
  const description = typeof value.description === 'string' ? value.description.trim() : '';
  if (!description || description.length > MAX_DESCRIPTION_LENGTH) throw badPayload();

  let prospectorName: string | undefined;
  if (value.prospectorName !== undefined) {
    if (typeof value.prospectorName !== 'string') throw badPayload();
    prospectorName = value.prospectorName.trim();
    if (!prospectorName || prospectorName.length > MAX_NAME_LENGTH) throw badPayload();
  }

  const diagnostics = validateDiagnostics(value.diagnostics);
  const screenshot = value.screenshot === undefined ? undefined : validateScreenshot(value.screenshot);
  return { description, ...(prospectorName ? { prospectorName } : {}), ...(screenshot ? { screenshot } : {}), diagnostics };
}

function validateDiagnostics(value: unknown): BugReport['diagnostics'] {
  if (!isRecord(value) || !hasOnlyKeys(value, ['contractId', 'wave', 'position', 'tier', 'version'])) throw badPayload();
  if (!isRecord(value.position) || !hasOnlyKeys(value.position, ['x', 'z'])) throw badPayload();
  const contractId = typeof value.contractId === 'string' && /^[a-z0-9][a-z0-9-]{0,80}$/.test(value.contractId) ? value.contractId : '';
  const wave = integerInRange(value.wave, 0, 10_000);
  const x = numberInRange(value.position.x, -100_000, 100_000);
  const z = numberInRange(value.position.z, -100_000, 100_000);
  const tier = value.tier === 'FULL' || value.tier === 'BALANCED' || value.tier === 'LITE' ? value.tier : null;
  const version = typeof value.version === 'string' && /^[A-Za-z0-9._-]{1,40}$/.test(value.version) ? value.version : '';
  if (!contractId || wave === null || x === null || z === null || !tier || !version) throw badPayload();
  return { contractId, wave, position: { x, z }, tier, version };
}

function validateScreenshot(value: unknown): string {
  if (typeof value !== 'string') throw badScreenshot('The clerk only accepts a JPEG photograph.');
  const base64 = value.startsWith('data:image/jpeg;base64,') ? value.slice(23) : value;
  if (!base64 || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw badScreenshot('The clerk cannot read that photograph.');
  }
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  if ((base64.length / 4) * 3 - padding > MAX_SCREENSHOT_BYTES) {
    throw badScreenshot('That photograph will not fit the complaints ledger.');
  }
  let bytes: string;
  try {
    bytes = atob(base64);
  } catch {
    throw badScreenshot('The clerk cannot read that photograph.');
  }
  if (bytes.length < 4 || bytes.charCodeAt(0) !== 0xff || bytes.charCodeAt(1) !== 0xd8 || bytes.charCodeAt(bytes.length - 2) !== 0xff || bytes.charCodeAt(bytes.length - 1) !== 0xd9) {
    throw badScreenshot('The clerk only accepts a JPEG photograph.');
  }
  return `data:image/jpeg;base64,${base64}`;
}

async function readJson(request: Request): Promise<JsonRecord> {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') ?? '')) {
    throw new HttpError(415, 'unsupported_media_type', 'Bring the clerk a written complaint.');
  }
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) throw badScreenshot('That photograph will not fit the complaints ledger.');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw badScreenshot('That photograph will not fit the complaints ledger.');
  try {
    const value = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {}
  throw new HttpError(400, 'bad_json', 'The clerk cannot read this complaint.');
}

function authorized(context: BugsContext): boolean {
  const token = new URL(context.request.url).searchParams.get('token');
  return Boolean(context.env.BUG_OFFICE_TOKEN && token === context.env.BUG_OFFICE_TOKEN);
}

async function bumpCounter(kv: KVNamespaceLike, key: string): Promise<boolean> {
  const current = Number(await kv.get(key));
  const count = Number.isFinite(current) && current > 0 ? Math.trunc(current) : 0;
  if (count >= MAX_REPORTS_PER_IP) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_TTL_SECONDS });
  return true;
}

async function clientIpHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'local';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function parseStoredReport(value: string | null): BugReport | null {
  try {
    const parsed: unknown = JSON.parse(value ?? 'null');
    return isRecord(parsed) && typeof parsed.id === 'string' && typeof parsed.description === 'string' ? parsed as BugReport : null;
  } catch {
    return null;
  }
}

function corsHeaders(request: Request, methods: string): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': methods,
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  if (ALLOWED_ORIGINS.has(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return { ...headers, 'Access-Control-Allow-Origin': origin };
  }
  return null;
}

function decline(cors: Record<string, string>): Response {
  return error(cors, 404, 'not_found', 'No office answers at this address.');
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

function badPayload(): HttpError {
  return new HttpError(400, 'bad_payload', 'The clerk needs a description and honest field notes.');
}

function badScreenshot(message: string): HttpError {
  return new HttpError(413, 'screenshot_rejected', message);
}

function integerInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function numberInRange(value: unknown, min: number, max: number): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function hasOnlyKeys(value: JsonRecord, allowed: string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
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
