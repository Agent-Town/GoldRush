import { constantTimeEqual } from './_compare';
import { bumpCounter } from './_ratelimit';

export type LedgerListResult = {
  keys: { name: string }[];
  list_complete: boolean;
  cursor?: string;
};

export type LedgerStorage = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<LedgerListResult>;
  resolveAccount?(candidate: AccountRecord): Promise<AccountRecord>;
  retireAccount?(emailHash: string, accountId: string): Promise<boolean>;
  // SEC-1: one atomic count-and-read, where the store can offer one (SqliteStorage does; KV cannot).
  increment?(key: string, ttlSeconds: number): Promise<number>;
};

export type AccountRegistryNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
};

type AccountsEnv = {
  ACCOUNTS?: LedgerStorage;
  ACCOUNT_REGISTRY?: AccountRegistryNamespace;
  ACCOUNT_REGISTRY_SCOPE?: string;
  DEV_AUTH?: string;
  RESEND_API_KEY?: string;
  AUTH_CODE_PEPPER?: string;
  ALLOWED_CORS_ORIGINS?: ReadonlySet<string>;
};

type AccountsContext = {
  request: Request;
  env: AccountsEnv;
};

export type AccountRecord = {
  version: 1;
  accountId: string;
  email: string;
  emailHash: string;
  createdAt: string;
};

type SessionRecord = {
  version: 1;
  accountId: string;
  emailHash: string;
  createdAt: string;
  expiresAt: string;
};

type CodeRecord = {
  hash: string;
  revokeSessions: boolean;
};

type SaveRecord = {
  version: 1;
  accountId: string;
  profileId: string;
  savedAt: string;
  byteLength: number;
  envelope: unknown;
  metadata: SaveMetadata;
};

type SaveProfileSummary = SaveMetadata & {
  savedAt: string;
  byteLength: number;
};

type SaveMetadata = {
  profileId: string;
  profileName: string;
  updatedAt?: number;
};

type JsonRecord = Record<string, unknown>;

const CODE_TTL_SECONDS = 10 * 60;
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const RATE_TTL_SECONDS = 10 * 60;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_EMAIL = 5;
const MAX_REQUESTS_PER_IP = 20;
// SEC-1: /api/verify had no per-address cap at all, so the per-email budget was the only bound on a
// guess flood and a caller could work through one email after another from one machine. Hourly, like
// the other doors this limiter serves, and 60 is the number the owner already ruled for an hour
// (F-HEAT14-7, _ratelimit.ts). It cannot refuse a real sign-in: a real caller needs at most
// MAX_VERIFY_ATTEMPTS per code, and MAX_REQUESTS_PER_EMAIL caps how many codes an address can even
// have issued in a 10 minute window, so 60 is twelve full budgets an hour from a single address.
const MAX_VERIFIES_PER_IP = 60;
const VERIFY_RATE_TTL_SECONDS = 60 * 60;
const MAX_JSON_BYTES = 200 * 1024;
const SMALL_JSON_BYTES = 8 * 1024;
const CLOUD_DATA_CODEC_KEY = '$goldRushGzipDataV1';
const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);

export async function requestCode(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    if (!env.ACCOUNTS) return error(cors, 503, 'sign_in_not_enabled', 'sign-in not yet enabled');
    if (!isDev(env) && !env.RESEND_API_KEY) {
      return error(cors, 503, 'sign_in_not_enabled', 'sign-in not yet enabled');
    }

    const body = await readJson(request, SMALL_JSON_BYTES);
    const email = normalizeEmail(body.email);
    if (!email) return error(cors, 400, 'invalid_email', 'Enter a valid email address.');

    const emailHash = await sha256Hex(email);
    const ip = clientIp(request);
    const emailAllowed = await bumpCounter(env.ACCOUNTS, `ratelimit:email:${emailHash}`, MAX_REQUESTS_PER_EMAIL, RATE_TTL_SECONDS);
    const ipAllowed = await bumpCounter(env.ACCOUNTS, `ratelimit:${ip}`, MAX_REQUESTS_PER_IP, RATE_TTL_SECONDS);
    if (!emailAllowed || !ipAllowed) return error(cors, 429, 'rate_limited', 'Try again later.');

    const code = sixDigitCode();
    const codeHash = await codeDigest(env, emailHash, code);
    await env.ACCOUNTS.put(
      `code:${emailHash}`,
      JSON.stringify({ hash: codeHash, revokeSessions: body.revokeSessions === true, createdAt: nowIso() }),
      { expirationTtl: CODE_TTL_SECONDS },
    );
    // SEC-1: the guess budget is NOT reset here. Deleting `attempts:` on every new code made the
    // budget free to refill: a caller who had burned five guesses simply asked for another code and
    // got five more, so the 5-per-TTL bound was really 5 per code request, i.e. 25 per 10 minutes
    // per email. The counter now expires on its own TTL (CODE_TTL_SECONDS from the first counted
    // guess) and a successful verify is the only thing that clears it.

    if (isDev(env)) {
      return json(cors, { ok: true, code, dev: true });
    }

    const sent = await sendEmail(env, email, code);
    if (!sent) {
      await env.ACCOUNTS.delete(`code:${emailHash}`);
      return error(cors, 503, 'email_unavailable', 'sign-in not yet enabled');
    }
    return json(cors, { ok: true });
  });
}

export async function verifyCode(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;

    const body = await readJson(request, SMALL_JSON_BYTES);
    const email = normalizeEmail(body.email);
    const code = typeof body.code === 'string' && /^\d{6}$/.test(body.code) ? body.code : '';
    if (!email || !code) return error(cors, 401, 'invalid_code', 'Code not accepted.');

    // SEC-1: a per-address hourly cap, mirroring requestCode's, in its own bucket so a guess flood
    // cannot lock an address out of asking for codes and vice versa.
    if (!(await bumpCounter(kv, `ratelimit:verify:${clientIp(request)}`, MAX_VERIFIES_PER_IP, VERIFY_RATE_TTL_SECONDS))) {
      return error(cors, 429, 'rate_limited', 'Try again later.');
    }

    const emailHash = await sha256Hex(email);
    const attemptsKey = `attempts:${emailHash}`;
    // SEC-1: count FIRST, then compare. The guess is charged to the budget before anything is read
    // or hashed, and the caller is refused on the number its own count produced, so the two awaits
    // that used to sit inside the read-then-write window cannot buy an extra evaluation.
    const attempt = await countAttempt(kv, attemptsKey, CODE_TTL_SECONDS);
    if (attempt > MAX_VERIFY_ATTEMPTS) return error(cors, 429, 'too_many_attempts', 'Try again later.');

    const rawCode = await kv.get(`code:${emailHash}`);
    const expected = parseCode(rawCode);
    const actual = await codeDigest(env, emailHash, code);
    if (!expected || !constantTimeEqual(expected.hash, actual)) {
      return attempt >= MAX_VERIFY_ATTEMPTS
        ? error(cors, 429, 'too_many_attempts', 'Try again later.')
        : error(cors, 401, 'invalid_code', 'Code not accepted.');
    }

    const account = await loadOrCreateAccount(env, kv, email, emailHash);
    if (expected.revokeSessions) await deleteSessionsForAccount(kv, account.accountId);
    const token = randomHex(32);
    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
    const session: SessionRecord = { version: 1, accountId: account.accountId, emailHash, createdAt, expiresAt };
    await Promise.all([
      kv.put(`session:${token}`, JSON.stringify(session), { expirationTtl: SESSION_TTL_SECONDS }),
      kv.delete(`code:${emailHash}`),
      kv.delete(attemptsKey),
    ]);

    return json(cors, { ok: true, token, accountId: account.accountId, expiresAt });
  });
}

export async function sessionStatus(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;
    return json(cors, {
      ok: true,
      accountId: session.record.accountId,
      expiresAt: session.record.expiresAt,
    });
  });
}

export async function pushSave(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;

    const raw = await readJsonText(request, MAX_JSON_BYTES);
    const body = parseJsonText(raw);
    const profileId = normalizeProfileId(body.profileId);
    const envelope = isRecord(body.envelope) ? body.envelope : null;
    if (!profileId || !envelope) return error(cors, 400, 'bad_envelope', 'Save envelope not accepted.');

    const metadata = validateEnvelope(envelope, profileId);
    if (!metadata) return error(cors, 400, 'bad_envelope', 'Save envelope not accepted.');

    const previousSave = (await loadSaveHistory(kv, session.record.accountId, profileId))[0] ?? null;
    const baseSavedAt = typeof body.baseSavedAt === 'string' ? body.baseSavedAt : body.baseSavedAt === null ? null : undefined;
    const acknowledged = body.acknowledgeConflict === true;
    if (previousSave && !acknowledged && baseSavedAt !== previousSave.savedAt) {
      return json(
        cors,
        {
          ok: false,
          error: 'stale_save',
          message: 'Cloud has a newer ledger.',
          profileId,
          savedAt: previousSave.savedAt,
        },
      );
    }

    const savedAt = nextSavedAt(previousSave?.savedAt);
    const save: SaveRecord = {
      version: 1,
      accountId: session.record.accountId,
      profileId,
      savedAt,
      byteLength: utf8Length(raw),
      envelope,
      metadata,
    };
    // Atomicity invariant: saves are immutable entries; current and v1..v5 are
    // derived newest-first, so a concurrent push cannot clobber history with a
    // stale rotation write. stale_save still compares against derived current.
    await kv.put(`${saveEntryPrefix(session.record.accountId, profileId)}${savedAt}:${randomHex(4)}`, JSON.stringify(save));
    return json(cors, { ok: true, profileId, savedAt });
  });
}

export async function pullSave(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;
    const body = await readJson(request, SMALL_JSON_BYTES);
    const profileId = normalizeProfileId(body.profileId);
    const version = normalizeVersion(body.version);
    if (!profileId || version === false) return error(cors, 400, 'bad_request', 'Save request not accepted.');

    const save = (await loadSaveHistory(kv, session.record.accountId, profileId))[version ?? 0] ?? null;
    if (!save) return error(cors, 404, 'not_found', 'Save not found.');
    return json(cors, {
      ok: true,
      profileId,
      version: version || null,
      savedAt: save.savedAt,
      envelope: save.envelope,
    });
  });
}

export async function saveVersions(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;
    const body = await readJson(request, SMALL_JSON_BYTES);
    const profileId = normalizeProfileId(body.profileId);
    if (!profileId) return error(cors, 400, 'bad_request', 'Save request not accepted.');

    const versions = (await loadSaveHistory(kv, session.record.accountId, profileId)).map((save, index) =>
      versionSummary(save, index || null),
    );
    return json(cors, { ok: true, profileId, versions });
  });
}

export async function saveProfiles(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;

    const profiles: SaveProfileSummary[] = [];
    for (const profileId of await listProfileIds(kv, session.record.accountId)) {
      const current = (await loadSaveHistory(kv, session.record.accountId, profileId))[0];
      if (current) profiles.push({ ...current.metadata, savedAt: current.savedAt, byteLength: current.byteLength });
    }
    profiles.sort((left, right) => compareIsoDesc(left.savedAt, right.savedAt));
    return json(cors, { ok: true, profiles });
  });
}

export async function deleteAccount(context: AccountsContext): Promise<Response> {
  return route(context, async ({ request, env, cors }) => {
    if (request.method !== 'POST') return error(cors, 405, 'method_not_allowed', 'POST only');
    const kv = requireAccounts(env, cors);
    if (kv instanceof Response) return kv;
    const session = await requireSession(request, kv, cors);
    if (session instanceof Response) return session;

    if (!kv.retireAccount) {
      const status = await registryRequest(env, 'status');
      if (!isRecord(status) || status.ready !== true) {
        return error(cors, 503, 'account_registry_unavailable', 'The ledger office could not finish that request.');
      }
    }
    // Cleanup precedes retirement so a failed save deletion cannot strand the only identity.
    await deletePrefix(kv, `save:${session.record.accountId}:`);
    // Retire only this generation. An old session must never delete its replacement.
    const retired = kv.retireAccount
      ? await kv.retireAccount(session.record.emailHash, session.record.accountId)
      : await registryRequest(env, 'retire', { emailHash: session.record.emailHash, accountId: session.record.accountId });
    if (retired !== true) return error(cors, 401, 'unauthorized', 'Session not accepted.');
    // Preserve retry authorization if the registry fails after the readiness check.
    await deleteSessionsForAccount(kv, session.record.accountId);
    await Promise.all([
      // Legacy KV copies are immutable after registry cutover; SQLite already retired its row atomically.
      ...(!kv.retireAccount ? [kv.delete(`account:${session.record.emailHash}`)] : []),
      kv.delete(`code:${session.record.emailHash}`),
      kv.delete(`attempts:${session.record.emailHash}`),
      kv.delete(`ratelimit:email:${session.record.emailHash}`),
      kv.delete(`session:${session.token}`),
    ]);
    return json(cors, { ok: true });
  });
}

async function route(
  context: AccountsContext,
  handler: (value: { request: Request; env: AccountsEnv; cors: Record<string, string> }) => Promise<Response>,
): Promise<Response> {
  const cors = corsHeaders(context.request, context.env);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'Origin not allowed.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    return await handler({ request: context.request, env: context.env, cors });
  } catch (err) {
    if (err instanceof HttpError) return error(cors, err.status, err.code, err.message);
    return error(cors, 500, 'server_error', 'The ledger office could not finish that request.');
  }
}

// SEC-8 (outside review 2026-09-24): this allowlist admitted `http://localhost:*` and
// `http://127.0.0.1:*` UNCONDITIONALLY, in production, on the door that mints and accepts sign-in
// codes and hands back a session token. Anything a browser runs on the player's own machine — a
// page on a dev server, an extension's injected origin — could therefore talk to the live accounts
// door with the browser's cookies and read the answers, because the reply carried
// Access-Control-Allow-Origin for whatever localhost port asked.
//
// The dev arm now requires the PRODUCTION MAIL SENDER TO BE UNBOUND, which is the one marker a
// REQUEST cannot reach: `RESEND_API_KEY` is an environment binding (Pages project vars;
// `server/ledger/serve.mjs` for the droplet) and nothing derives it from a header, an origin or a
// host. This is deliberately the same unspoofable condition sec-signin-hardening-1 chose for
// `isDev` below, for the same reason recorded there: a localhost HOST or ORIGIN is whatever the
// caller writes, and the droplet forwards the caller's own `Host:` header.
//
// WHY NOT `isDev(env)` ITSELF (which also demands DEV_AUTH === '1'), measured rather than assumed:
// `scripts/test-accounts.mjs`'s unconfigured arm starts the worker with NEITHER binding and asserts
// that `/api/request-code` answers an honest 503 — with `Origin: http://localhost:5188`. Requiring
// DEV_AUTH here turns that answer into a 403 cors_forbidden, i.e. a developer who has configured
// nothing yet gets a misleading CORS refusal instead of the truthful "sign-in is not enabled". The
// half of `isDev` that closes the production hole is the sender binding, and that half is kept.
// Both live doors bind the sender (the droplet since 2026-08-24, Pages for the accounts flow), so
// production admits only the three named origins plus a `*.gold-rush-3in.pages.dev` preview.
function corsHeaders(request: Request, env: AccountsEnv): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (!origin) return headers;
  const devOrigins = !env.RESEND_API_KEY;
  if (
    ALLOWED_ORIGINS.has(origin) ||
    env.ALLOWED_CORS_ORIGINS?.has(origin) ||
    /^https:\/\/[a-z0-9-]+\.gold-rush-3in\.pages\.dev$/.test(origin) ||
    (devOrigins && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  ) {
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

function requireAccounts(env: AccountsEnv, cors: Record<string, string>): LedgerStorage | Response {
  return env.ACCOUNTS ?? error(cors, 503, 'sign_in_not_enabled', 'sign-in not yet enabled');
}

// SEC-1: charge one guess to a budget and hand back the number this call produced. The sqlite ledger
// counts in a single statement (storage.mjs `increment`), which is the door that is live behind nginx
// today. Cloudflare KV has no atomic increment and its own writes are eventually consistent, so the
// fallback keeps the read and the write ADJACENT, with no digest or code read between them: a burst
// on that backend can still share a count, and the nginx `limit_req` on /api/verify plus the per-IP
// cap above are what bound it there. Flagged in the report, not papered over.
async function countAttempt(kv: LedgerStorage, key: string, ttlSeconds: number): Promise<number> {
  if (kv.increment) return kv.increment(key, ttlSeconds);
  const attempt = numberOrZero(await kv.get(key)) + 1;
  await kv.put(key, String(attempt), { expirationTtl: ttlSeconds });
  return attempt;
}

async function readJson(request: Request, maxBytes: number): Promise<JsonRecord> {
  return parseJsonText(await readJsonText(request, maxBytes));
}

async function readJsonText(request: Request, maxBytes: number): Promise<string> {
  const type = request.headers.get('content-type') ?? '';
  if (!/^application\/json\b/i.test(type)) throw new HttpError(415, 'unsupported_media_type', 'Send application/json.');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, 'payload_too_large', 'Save envelope is too large.');
  }
  const text = await request.text();
  if (utf8Length(text) > maxBytes) throw new HttpError(413, 'payload_too_large', 'Save envelope is too large.');
  return text;
}

function parseJsonText(text: string): JsonRecord {
  try {
    const value = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {
    // handled below
  }
  throw new HttpError(400, 'bad_json', 'JSON not accepted.');
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function normalizeProfileId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const profileId = value.trim();
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(profileId) ? profileId : null;
}

function isInteger(value: unknown): value is number {
  return Number.isInteger(value);
}

function normalizeVersion(value: unknown): number | false | null {
  if (value === undefined || value === null) return null;
  return isInteger(value) && value >= 1 && value <= 5 ? value : false;
}

function validateEnvelope(envelope: JsonRecord, profileId: string): SaveMetadata | null {
  if (
    envelope.kind !== 'gold-rush-ledger-bundle' ||
    (envelope.version !== 1 && envelope.version !== 2)
  ) {
    return null;
  }
  if (!isRecord(envelope.profile) || !isRecord(envelope.data)) return null;
  if (envelope.version === 1 && CLOUD_DATA_CODEC_KEY in envelope.data) return null;
  if (envelope.version === 2) {
    const entries = Object.entries(envelope.data);
    if (entries.length !== 1 || entries[0]?.[0] !== CLOUD_DATA_CODEC_KEY || typeof entries[0][1] !== 'string') {
      return null;
    }
  }
  if (envelope.profile.id !== profileId) return null;
  const profileName = typeof envelope.profile.name === 'string' ? envelope.profile.name.trim().slice(0, 24) : '';
  if (!profileName) return null;
  const updatedAt = typeof envelope.profile.updatedAt === 'number' && Number.isFinite(envelope.profile.updatedAt)
    ? envelope.profile.updatedAt
    : undefined;
  return { profileId, profileName, updatedAt };
}

async function requireSession(
  request: Request,
  kv: LedgerStorage,
  cors: Record<string, string>,
): Promise<{ token: string; record: SessionRecord } | Response> {
  const token = await sessionToken(request);
  if (!token) return error(cors, 401, 'unauthorized', 'Session not accepted.');
  const record = parseSession(await kv.get(`session:${token}`));
  if (!record || Date.parse(record.expiresAt) <= Date.now()) {
    await kv.delete(`session:${token}`);
    return error(cors, 401, 'unauthorized', 'Session not accepted.');
  }
  return { token, record };
}

async function sessionToken(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const fromHeader = /^Bearer\s+([a-f0-9]{64})$/i.exec(header)?.[1];
  if (fromHeader) return fromHeader.toLowerCase();
  const clone = request.clone();
  try {
    const body = await readJson(clone, SMALL_JSON_BYTES);
    return typeof body.token === 'string' && /^[a-f0-9]{64}$/i.test(body.token) ? body.token.toLowerCase() : null;
  } catch {
    return null;
  }
}

async function loadOrCreateAccount(env: AccountsEnv, kv: LedgerStorage, email: string, emailHash: string): Promise<AccountRecord> {
  const candidate: AccountRecord = {
    version: 1,
    accountId: randomHex(16),
    email,
    emailHash,
    createdAt: nowIso(),
  };
  // KV has no atomic create: its registry is authoritative after an explicit legacy import.
  // Never fall back to a cached KV absence or derive a lifetime ID from the email.
  const resolved = kv.resolveAccount
    ? await kv.resolveAccount(candidate)
    : await registryRequest(env, 'resolve', candidate);
  const account = parseAccount(JSON.stringify(resolved));
  if (!account || account.email !== email || account.emailHash !== emailHash) {
    throw new HttpError(503, 'account_registry_unavailable', 'The ledger office could not finish that request.');
  }
  return account;
}

async function registryRequest(env: AccountsEnv, operation: string, body?: unknown): Promise<unknown> {
  if (env.ACCOUNT_REGISTRY && /^[a-zA-Z0-9_-]{1,80}$/.test(env.ACCOUNT_REGISTRY_SCOPE ?? '')) {
    try {
      const registry = env.ACCOUNT_REGISTRY.get(env.ACCOUNT_REGISTRY.idFromName(`accounts-v1:${env.ACCOUNT_REGISTRY_SCOPE}`));
      const response = await registry.fetch(new Request(`https://account-registry.internal/${operation}`, {
        method: body === undefined ? 'GET' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      }));
      if (response.ok) return await response.json();
    } catch {
      // Do not mint an identity when the atomic owner is unavailable.
    }
  }
  throw new HttpError(503, 'account_registry_unavailable', 'The ledger office could not finish that request.');
}

function parseAccount(raw: string | null): AccountRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      isRecord(value) &&
      value.version === 1 &&
      typeof value.accountId === 'string' &&
      typeof value.email === 'string' &&
      typeof value.emailHash === 'string'
    ) {
      return value as AccountRecord;
    }
  } catch {
    return null;
  }
  return null;
}

function parseSession(raw: string | null): SessionRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      isRecord(value) &&
      value.version === 1 &&
      typeof value.accountId === 'string' &&
      typeof value.emailHash === 'string' &&
      typeof value.expiresAt === 'string'
    ) {
      return value as SessionRecord;
    }
  } catch {
    return null;
  }
  return null;
}

function parseSave(raw: string | null): SaveRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      isRecord(value) &&
      value.version === 1 &&
      typeof value.accountId === 'string' &&
      typeof value.profileId === 'string' &&
      typeof value.savedAt === 'string' &&
      isRecord(value.metadata)
    ) {
      return value as SaveRecord;
    }
  } catch {
    return null;
  }
  return null;
}

function parseCode(raw: string | null): CodeRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    return isRecord(value) && typeof value.hash === 'string'
      ? { hash: value.hash, revokeSessions: value.revokeSessions === true }
      : null;
  } catch {
    return null;
  }
}

async function deleteSessionsForAccount(kv: LedgerStorage, accountId: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: 'session:', cursor });
    await Promise.all(
      page.keys.map(async ({ name }) => {
        const session = parseSession(await kv.get(name));
        if (session?.accountId === accountId) await kv.delete(name);
      }),
    );
    cursor = page.cursor;
    if (page.list_complete) break;
  } while (cursor);
}

async function deletePrefix(kv: LedgerStorage, prefix: string): Promise<void> {
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor });
    await Promise.all(page.keys.map(({ name }) => kv.delete(name)));
    cursor = page.cursor;
    if (page.list_complete) break;
  } while (cursor);
}

function saveKey(accountId: string, profileId: string): string {
  return `save:${accountId}:${profileId}`;
}

function saveEntryPrefix(accountId: string, profileId: string): string {
  return `${saveKey(accountId, profileId)}:entry:`;
}

async function loadSaveHistory(kv: LedgerStorage, accountId: string, profileId: string): Promise<SaveRecord[]> {
  const saves: { save: SaveRecord; key: string }[] = [];
  const key = saveKey(accountId, profileId);
  const legacyCurrent = parseSave(await kv.get(key));
  if (legacyCurrent) saves.push({ save: legacyCurrent, key });
  for (let index = 1; index <= 5; index += 1) {
    const legacyKey = `${key}:v${index}`;
    const legacy = parseSave(await kv.get(legacyKey));
    if (legacy) saves.push({ save: legacy, key: legacyKey });
  }
  for (const entryKey of await newestSaveEntryKeys(kv, saveEntryPrefix(accountId, profileId), 6)) {
    const save = parseSave(await kv.get(entryKey));
    if (save) saves.push({ save, key: entryKey });
  }
  return saves
    .sort((left, right) => compareIsoDesc(left.save.savedAt, right.save.savedAt) || right.key.localeCompare(left.key))
    .slice(0, 6)
    .map(({ save }) => save);
}

async function newestSaveEntryKeys(kv: LedgerStorage, prefix: string, limit: number): Promise<string[]> {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor });
    keys.push(...page.keys.map(({ name }) => name));
    keys.sort((left, right) => right.localeCompare(left));
    keys.length = Math.min(keys.length, limit);
    cursor = page.cursor;
    if (page.list_complete) break;
  } while (cursor);
  return keys;
}

async function listProfileIds(kv: LedgerStorage, accountId: string): Promise<string[]> {
  const ids = new Set<string>();
  const prefix = `save:${accountId}:`;
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix, cursor });
    for (const { name } of page.keys) {
      const profileId = name.slice(prefix.length).split(':')[0] ?? '';
      if (normalizeProfileId(profileId)) ids.add(profileId);
    }
    cursor = page.cursor;
    if (page.list_complete) break;
  } while (cursor);
  return [...ids];
}

function versionSummary(save: SaveRecord, version: number | null): JsonRecord {
  return {
    version,
    savedAt: save.savedAt,
    byteLength: save.byteLength,
    profileId: save.profileId,
    profileName: save.metadata.profileName,
    updatedAt: save.metadata.updatedAt,
  };
}

function compareIsoDesc(left: string, right: string): number {
  return Date.parse(right) - Date.parse(left) || right.localeCompare(left);
}

async function sendEmail(env: AccountsEnv, email: string, code: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Gold Rush <claim@agenttown.app>',
      to: [email],
      subject: 'Your Gold Rush sign-in code',
      text: `Your Gold Rush sign-in code is ${code}. It expires in 10 minutes.`,
    }),
  });
  return response.ok;
}

// SEC-10 (outside review 2026-09-24): `DEV_AUTH === '1'` on its own decided whether requestCode
// returns the login code in the response body, so ONE mis-set production variable hands a working
// code to anyone who asks for it. Measured on this tree before the fix: env `{ DEV_AUTH: '1',
// RESEND_API_KEY: <bound> }` answered 200 with `code` and `dev: true` and never sent the mail.
//
// The second condition is the ABSENCE of the production mail sender binding, and it is chosen
// because it is the one marker a REQUEST cannot reach. `RESEND_API_KEY` is an environment binding
// (Pages project vars; `server/ledger/serve.mjs:119` for the droplet) and nothing derives it from a
// header, an origin or a host. The alternative marker, a localhost host or origin, IS reachable by a
// request: the droplet forwards the caller's own `Host:` header to the ledger
// (`proxy_set_header Host $host`, ops/droplet/agenttown.app.nginx.conf), and `Origin` is whatever the
// caller writes, so either could be spoofed into saying "localhost" from the public internet.
// Both live doors bind the sender (the droplet since 2026-08-24, Pages for the accounts flow), so
// production can never satisfy this and a code is never returned there. A dev box that wants dev
// codes simply leaves the sender unbound, which is what every fixture in this repo already does
// (scripts/test-accounts.mjs `cleanEnv`, playwright.accounts.config.ts, e2e/ratelimit-429-net).
function isDev(env: AccountsEnv): boolean {
  return env.DEV_AUTH === '1' && !env.RESEND_API_KEY;
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'local'
  );
}

function sixDigitCode(): string {
  return String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000).padStart(6, '0');
}

function randomHex(bytes: number): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return [...values].map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function codeDigest(env: AccountsEnv, emailHash: string, code: string): Promise<string> {
  return sha256Hex(`${emailHash}:${code}:${env.AUTH_CODE_PEPPER ?? ''}`);
}

async function sha256Hex(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function numberOrZero(value: string | null): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextSavedAt(previousSavedAt?: string): string {
  const now = Date.now();
  const previous = previousSavedAt ? Date.parse(previousSavedAt) : NaN;
  return new Date(Number.isFinite(previous) && now <= previous ? previous + 1 : now).toISOString();
}

function utf8Length(value: string): number {
  return new TextEncoder().encode(value).length;
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
