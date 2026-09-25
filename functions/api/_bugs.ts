import { constantTimeEqual } from './_compare';
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
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<KVListResult>;
};

export type BugsEnv = LedgerEnv & {
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

type ReportBody = Omit<BugReport, 'id' | 'submittedAt'>;

type ReportPage = {
  bugs: Omit<BugReport, 'screenshot'>[];
  cursor: string | null;
  listComplete: boolean;
};

const MAX_DESCRIPTION_LENGTH = 2_000;
const MAX_NAME_LENGTH = 24;
const MAX_SCREENSHOT_BYTES = 180 * 1024;
const MAX_JSON_BYTES = 260 * 1024;
// What the ledger road carries for one report: the report as validated here (a bare base64 screenshot
// gains its 23-byte data: prefix) plus the anonymous client key. Well under the ledger reader's own cap.
const LEDGER_BUG_BYTES = MAX_JSON_BYTES + 1024;
const BUG_ID = /^\d{13}-[a-f0-9]{8}$/;
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REPORTS_PER_IP = 5;
// SEC-7 (outside review 2026-09-24): a bug report is the most personal thing this game stores — a
// free-text description, an optional prospector NAME, and a JPEG of whatever was on screen (up to
// 180 KB, which can include a browser window, a face on a call, anything) — and it was written with
// no expiry at all, so the first complaint of 2026 would still be sitting in KV in 2036.
//
// NINETY DAYS, and the number is a triage window rather than a compliance figure: the office exists
// so the owner can read a complaint, reproduce it and file the finding, which happens within days;
// a quarter is generous headroom for a report filed while he is away from the desk, and it is short
// enough that a screenshot the player forgot about does not outlive the build it was taken on.
// Cloudflare deletes the key itself at the TTL — nothing has to remember to run a sweep, which is
// the property that makes this durable. Reports that matter are already copied out of the office by
// `scripts/fetch-bugs.mjs`, which prints each report's AGE so the owner can see what is close to
// ageing out. Existing keys written before this change keep their infinite life: KV has no
// retro-expiry, and re-writing every row to add one is an owner decision, not a slice's.
const REPORT_TTL_SECONDS = 60 * 60 * 24 * 90;
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);

export async function postBug(context: BugsContext): Promise<Response> {
  const cors = corsHeaders(context.request, 'POST, OPTIONS');
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'The clerk cannot take reports from that trail.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return decline(cors);

  try {
    const report = validateReport(await readJson(context.request));
    const client = await clientIpHash(context.request);

    // kv-counters-to-ledger-1 scope 3 (owner ruling 2026-09-24, item 7 "(b)"): the complaints ledger
    // lives in the droplet ledger. This door validates exactly as before and hands the report over;
    // the per-address limit and the 90-day expiry are kept there. A ledger that is bound but does not
    // answer is an honest "off the desk", never a second copy in KV, where the office would not look.
    const ledger = ledgerLink(context.env);
    if (ledger) {
      const reply = await ledger.post('/api/ledger/bugs', { client, report });
      if (reply?.ok === true && typeof reply.id === 'string') return json(cors, { ok: true, id: reply.id }, 201);
      if (reply?.error === 'rate_limited') return rateLimited(cors);
      return officeClosed(withLedgerFallback(cors, fallbackReason(ledger)));
    }

    const headers = withLedgerFallback(cors, fallbackReason(ledger));
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) return officeClosed(headers);
    const id = await fileReport(kv, client, report);
    return id ? json(headers, { ok: true, id }, 201) : rateLimited(headers);
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
  const url = new URL(context.request.url);
  const cursor = url.searchParams.get('cursor') || undefined;
  const limit = pageLimit(url.searchParams.get('limit'));

  // The office token is checked HERE, at the edge, exactly as before; the ledger admits this door by
  // the shared secret and never sees the office token.
  const ledger = ledgerLink(context.env);
  if (ledger) {
    const reply = await ledger.get('/api/ledger/bugs', { ...(cursor ? { cursor } : {}), limit: String(limit) });
    if (reply?.ok === true && Array.isArray(reply.bugs)) {
      return json(cors, {
        ok: true,
        bugs: reply.bugs,
        cursor: typeof reply.cursor === 'string' ? reply.cursor : null,
        listComplete: reply.listComplete === true,
      });
    }
    return officeClosed(withLedgerFallback(cors, fallbackReason(ledger)));
  }

  const headers = withLedgerFallback(cors, fallbackReason(ledger));
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return json(headers, { ok: true, bugs: [], cursor: null, listComplete: true });
  return json(headers, { ok: true, ...(await readReportPage(kv, cursor, limit)) });
}

export async function getBug(context: BugsContext): Promise<Response> {
  const cors = corsHeaders(context.request, 'GET, OPTIONS');
  if (!cors) return decline({});
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'GET' || !authorized(context)) return decline(cors);
  const id = context.params?.id;
  if (typeof id !== 'string' || !BUG_ID.test(id)) return decline(cors);
  const ledger = ledgerLink(context.env);
  if (ledger) {
    const reply = await ledger.get('/api/ledger/bugs', { id });
    if (reply?.ok === true && isRecord(reply.bug)) return json(cors, { ok: true, bug: reply.bug });
    if (reply?.ok === false && reply.error === 'not_found') return decline(cors);
    return officeClosed(withLedgerFallback(cors, fallbackReason(ledger)));
  }
  const headers = withLedgerFallback(cors, fallbackReason(ledger));
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return decline(headers);
  const report = parseStoredReport(await kv.get(`bug:${id}`));
  return report ? json(headers, { ok: true, bug: report }) : decline(headers);
}

// POST /api/ledger/bugs {client, report} files a report; GET /api/ledger/bugs?cursor=&limit= pages the
// summaries (no screenshots); GET /api/ledger/bugs?id= reads one in full. Droplet side
// (server/ledger/serve.mjs). The report is validated AGAIN with the same field allowlists and caps the
// public door enforces: the ledger trusts the secret, not the shape of what arrives with it. Stored
// under the same `bug:<id>` key KV used, so the office, fetch-bugs and the one-shot migration
// (scripts/kv-to-ledger-migrate.mjs) all read one shape; the 90-day expiry is the row's `expires_at`,
// swept nightly by ops/droplet/ledger-backup.mjs.
export async function ledgerBugs(context: { request: Request; env: BugsEnv }): Promise<Response> {
  return ledgerRoute(context, ['GET', 'POST'], LEDGER_BUG_BYTES, async ({ method, body, url }) => {
    const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!kv) throw new LedgerRequestError(503, 'office_closed');
    if (method === 'POST') {
      const client = ledgerClientKey(body.client);
      const report = isRecord(body.report) ? revalidate(body.report) : null;
      if (!client || !report) throw new LedgerRequestError(400, 'bad_payload');
      const id = await fileReport(kv, client, report);
      return id ? { ok: true, id } : { ok: false, error: 'rate_limited' };
    }
    const id = url.searchParams.get('id');
    if (id !== null) {
      if (!BUG_ID.test(id)) throw new LedgerRequestError(400, 'bad_id');
      const report = parseStoredReport(await kv.get(`bug:${id}`));
      return report ? { ok: true, bug: report } : { ok: false, error: 'not_found' };
    }
    return { ok: true, ...(await readReportPage(kv, url.searchParams.get('cursor') || undefined, pageLimit(url.searchParams.get('limit')))) };
  });
}

// One home for the write, whichever store serves it: the per-address limit, then the report with its
// 90-day expiry (SEC-7). Returns the new id, or null when the limit refuses.
async function fileReport(kv: KVNamespaceLike, client: string, report: ReportBody): Promise<string | null> {
  if (!(await bumpCounter(kv, `bug:ratelimit:${client}`, MAX_REPORTS_PER_IP, RATE_TTL_SECONDS))) return null;
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const stored: BugReport = { id, submittedAt: new Date().toISOString(), ...report };
  await kv.put(`bug:${id}`, JSON.stringify(stored), { expirationTtl: REPORT_TTL_SECONDS });
  return id;
}

async function readReportPage(kv: KVNamespaceLike, cursor: string | undefined, limit: number): Promise<ReportPage> {
  const page = await kv.list({ prefix: 'bug:', cursor, limit });
  const reports = (await Promise.all(page.keys.map(({ name }) => kv.get(name))))
    .map(parseStoredReport)
    .filter((report): report is BugReport => report !== null)
    .map(({ screenshot: _screenshot, ...summary }) => summary);
  return { bugs: reports, cursor: page.list_complete ? null : page.cursor ?? null, listComplete: page.list_complete };
}

function pageLimit(value: string | null): number {
  const requested = Number(value ?? '50');
  return Number.isInteger(requested) ? Math.min(100, Math.max(1, requested)) : 50;
}

function revalidate(value: JsonRecord): ReportBody | null {
  try {
    return validateReport(value);
  } catch {
    return null;
  }
}

function officeClosed(headers: Record<string, string>): Response {
  return error(headers, 503, 'office_closed', 'The complaints ledger is off the desk. Try again later.');
}

function rateLimited(headers: Record<string, string>): Response {
  return error(headers, 429, 'rate_limited', 'The complaints desk has your stack already. Try again after the next bell.');
}

function validateReport(value: JsonRecord): ReportBody {
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

// SEC-9 (outside review 2026-09-24): the office token arrived in the QUERY STRING and was compared
// with `===`. A query credential is written into every access log it passes (nginx, Cloudflare, the
// owner's shell history, a Referer header if the URL is ever rendered), and `===` returns at the
// first differing byte. The header is the supported form now, and both forms compare in constant
// time.
function authorized(context: BugsContext): boolean {
  const secret = context.env.BUG_OFFICE_TOKEN;
  if (!secret) return false;
  const bearer = /^Bearer\s+(.+)$/i.exec(context.request.headers.get('authorization') ?? '')?.[1];
  if (bearer !== undefined) return constantTimeEqual(bearer, secret);
  const query = new URL(context.request.url).searchParams.get('token');
  if (query === null) return false;
  // DEPRECATED, one release only. Kept so a caller mid-upgrade is not locked out of the office, and
  // so the log line names anyone still using it: e2e/bug-office-api.spec.ts:73,78 is the last one in
  // this repo (scripts/fetch-bugs.mjs sends the header as of this change). Delete this branch, and
  // the log line with it, once that spec sends the header too.
  console.warn('bug office: deprecated ?token= query credential accepted; send "Authorization: Bearer <token>" instead');
  return constantTimeEqual(query, secret);
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
  if (ALLOWED_ORIGINS.has(origin) || /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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
