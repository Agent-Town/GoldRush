// kv-counters-to-ledger-1 — the one road between the Pages functions and the droplet ledger.
//
// WHY (outside review 2026-09-24, SEC-2; owner ruling 2026-09-24, item 7 "(b)": "Move the remaining
// counters to the droplet ledger instead (no money, more work)"). Telemetry, the co-op rate limits, the
// bug office and the prize desk share ONE free-tier KV namespace with 1,000 writes a day. A run beacon
// cost up to 15 writes (measured on 90a26053c: artifacts/kv-counters-to-ledger-1/writes-before.json),
// so one visitor could spend the day's budget in about two and a half hours, after which co-op rooms,
// bug reports and prize redemption failed for everyone. The owner declined the paid plan, so the
// state moves to the sqlite ledger the droplet already runs (server/ledger/serve.mjs), where a write
// costs nothing but a row.
//
// TWO HALVES LIVE HERE, AND THEY SHARE ONE SECRET.
//   - The CLIENT (`ledgerLink`) is what a Pages function uses to call the ledger's `/api/ledger/*`
//     routes: one POST or GET, the shared secret as a bearer token, a short timeout, and a strict
//     reading of the answer. It returns `null` for anything that is not a served ledger answer, so a
//     door can never mistake a proxy error page, a timeout or a refused credential for a reply.
//   - The GATE (`ledgerRoute`) is what those routes run on the droplet: it admits only a caller that
//     presents the same secret, compared in constant time (SEC-9, `_compare.ts`).
//
// THE FALLBACK HEADER. A door that is NOT served by the ledger says so in `X-Ledger-Fallback`, with
// the reason: `unconfigured` (no secret bound: a dev fixture, or production before the ops evening
// binds it) or `unreachable` (a secret is bound but the ledger did not serve this call: down,
// restarting, the nginx route missing, or the credential refused). Its ABSENCE on a door response
// means the ledger served it. Tests read it; so can the owner, with one curl, on the ops evening.
//
// NOTHING HERE IS LIVE UNTIL THE OWNER BINDS IT. With `LEDGER_PROXY_SECRET` unbound (every Pages
// deployment and every fixture today) `ledgerLink` returns null and every door keeps its KV path,
// byte for byte. The ops-evening steps are in artifacts/kv-counters-to-ledger-1/report.md.
import { constantTimeEqual } from './_compare';

type JsonRecord = Record<string, unknown>;

export type LedgerEnv = {
  // The shared secret. Pages: a project secret. Droplet: /etc/goldrush-ledger.env (serve.mjs main()).
  LEDGER_PROXY_SECRET?: string;
  // Where the ledger answers. Defaults to the public door; tests point it at a ledger on 127.0.0.1.
  LEDGER_ORIGIN?: string;
};

export type LedgerFallback = 'unconfigured' | 'unreachable';

export type LedgerPath =
  | '/api/ledger/increment'
  | '/api/ledger/telemetry'
  | '/api/ledger/bugs'
  | '/api/ledger/prizes/mint'
  | '/api/ledger/prizes/redeem';

export type LedgerLink = {
  post(path: LedgerPath, body: JsonRecord): Promise<JsonRecord | null>;
  get(path: LedgerPath, query: Record<string, string>): Promise<JsonRecord | null>;
};

export const LEDGER_FALLBACK_HEADER = 'X-Ledger-Fallback';

// A secret shorter than this is treated as UNBOUND on both halves: a guessable credential in front
// of the ledger that also holds the accounts is worse than no ledger road at all.
export const MIN_LEDGER_SECRET_LENGTH = 32;

// nginx answers agenttown.app; the ops evening adds `location /api/ledger/` in front of 127.0.0.1:8791.
const DEFAULT_LEDGER_ORIGIN = 'https://agenttown.app';
// A co-op connect waits on this before falling back to KV, so it stays short. A healthy round trip
// edge -> droplet -> edge is well under a second.
const LEDGER_TIMEOUT_MS = 3_000;
// The ledger-side reader cap for the small routes (a counter key, a telemetry beacon, a prize stub).
export const SMALL_LEDGER_BYTES = 8 * 1024;
// The co-op limiter is the only caller of the raw counter route, and these are its three buckets.
const LEDGER_COUNTER_KEY = /^mp:ratelimit:(?:create|connect|inspect):[a-f0-9]{32}$/;
const MAX_COUNTER_TTL_SECONDS = 24 * 60 * 60;
const CLIENT_KEY = /^[a-f0-9]{32}$/;

export function ledgerLink(env: LedgerEnv): LedgerLink | null {
  const secret = usableSecret(env.LEDGER_PROXY_SECRET);
  const origin = ledgerOrigin(env.LEDGER_ORIGIN);
  if (!secret || !origin) return null;
  return {
    post: (path, body) => callLedger(origin, secret, 'POST', path, undefined, body),
    get: (path, query) => callLedger(origin, secret, 'GET', path, query, undefined),
  };
}

// The reason a door is answering without the ledger, given the link it tried (or did not have).
export function fallbackReason(link: LedgerLink | null): LedgerFallback {
  return link ? 'unreachable' : 'unconfigured';
}

export function withLedgerFallback(headers: Record<string, string>, fallback: LedgerFallback | null): Record<string, string> {
  return fallback ? { ...headers, [LEDGER_FALLBACK_HEADER]: fallback } : headers;
}

// The anonymous client key a door forwards (`clientIpHash`, 32 hex). The ledger re-checks its shape
// rather than trusting the caller to have hashed anything.
export function ledgerClientKey(value: unknown): string | null {
  return typeof value === 'string' && CLIENT_KEY.test(value) ? value : null;
}

async function callLedger(
  origin: string,
  secret: string,
  method: 'GET' | 'POST',
  path: LedgerPath,
  query: Record<string, string> | undefined,
  body: JsonRecord | undefined,
): Promise<JsonRecord | null> {
  const url = new URL(path, origin);
  for (const [name, value] of Object.entries(query ?? {})) url.searchParams.set(name, value);
  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        authorization: `Bearer ${secret}`,
        accept: 'application/json',
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      // Never follow a redirect while carrying the secret: a 3xx is simply not a ledger answer.
      redirect: 'manual',
      signal: AbortSignal.timeout(LEDGER_TIMEOUT_MS),
    });
    // Every SERVED ledger answer is a 200 with a JSON object carrying `ok`, including the refusals a
    // door must relay (`{ ok: false, error: 'rate_limited' }`). Anything else - nginx's 503
    // ledger_resting, a 404 from a refused credential, the Pages fallback page when the nginx route
    // is missing, a 500 - is "not served", and the door falls back.
    if (response.status !== 200 || !/^application\/json\b/i.test(response.headers.get('content-type') ?? '')) return null;
    const value: unknown = await response.json();
    return isRecord(value) && typeof value.ok === 'boolean' ? value : null;
  } catch {
    return null;
  }
}

function usableSecret(value: string | undefined): string | null {
  return typeof value === 'string' && value.length >= MIN_LEDGER_SECRET_LENGTH ? value : null;
}

function ledgerOrigin(value: string | undefined): string | null {
  let url: URL;
  try {
    url = new URL(value ?? DEFAULT_LEDGER_ORIGIN);
  } catch {
    return null;
  }
  // HTTPS only, except a ledger on the loopback interface (the test fixtures). The secret must never
  // ride plain HTTP across a network.
  const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) return null;
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
  return url.origin;
}

// --- the gate: what every /api/ledger/* route runs on the droplet --------------------------------

export class LedgerRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(code);
  }
}

type LedgerRouteContext = {
  request: Request;
  env: LedgerEnv;
};

export type LedgerCall = {
  method: 'GET' | 'POST';
  body: JsonRecord;
  url: URL;
};

export async function ledgerRoute(
  context: LedgerRouteContext,
  methods: readonly ('GET' | 'POST')[],
  maxBytes: number,
  handler: (call: LedgerCall) => Promise<JsonRecord>,
): Promise<Response> {
  // Unbound, short, or wrong: the route does not exist as far as the caller can tell.
  if (!ledgerAdmits(context.request, context.env)) return ledgerReply({ ok: false, error: 'not_found' }, 404);
  const method = context.request.method;
  if ((method !== 'GET' && method !== 'POST') || !methods.includes(method)) {
    return ledgerReply({ ok: false, error: 'method_not_allowed' }, 405);
  }
  try {
    const body = method === 'POST' ? await readLedgerJson(context.request, maxBytes) : {};
    return ledgerReply(await handler({ method, body, url: new URL(context.request.url) }), 200);
  } catch (error) {
    if (error instanceof LedgerRequestError) return ledgerReply({ ok: false, error: error.code }, error.status);
    throw error; // serve.mjs logs it and answers 500, which the client reads as "not served".
  }
}

export function ledgerAdmits(request: Request, env: LedgerEnv): boolean {
  const secret = usableSecret(env.LEDGER_PROXY_SECRET);
  if (!secret) return false;
  const bearer = /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') ?? '')?.[1];
  return bearer !== undefined && constantTimeEqual(bearer, secret);
}

type CounterStore = {
  increment?(key: string, ttlSeconds: number): Promise<number>;
};

type CounterEnv = LedgerEnv & {
  TELEMETRY?: CounterStore;
  ACCOUNTS?: CounterStore;
};

// POST /api/ledger/increment {key, ttlSeconds} -> {ok: true, count}. The co-op limiter's atomic count:
// the SAME one-statement count-and-read sec-signin-hardening-1 gave the sign-in guess budget
// (server/ledger/storage.mjs `increment`), reached over the ledger road. Least privilege: the key must
// be one of the three co-op buckets for a hashed client, so the secret cannot touch any other row of
// a store that also holds the accounts.
export async function ledgerIncrement(context: { request: Request; env: CounterEnv }): Promise<Response> {
  return ledgerRoute(context, ['POST'], SMALL_LEDGER_BYTES, async ({ body }) => {
    const key = typeof body.key === 'string' && LEDGER_COUNTER_KEY.test(body.key) ? body.key : null;
    const ttlSeconds = body.ttlSeconds;
    if (!key || typeof ttlSeconds !== 'number' || !Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > MAX_COUNTER_TTL_SECONDS) {
      throw new LedgerRequestError(400, 'bad_counter');
    }
    const store = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!store?.increment) throw new LedgerRequestError(503, 'counter_unavailable');
    return { ok: true, count: await store.increment(key, ttlSeconds) };
  });
}

async function readLedgerJson(request: Request, maxBytes: number): Promise<JsonRecord> {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') ?? '')) throw new LedgerRequestError(415, 'unsupported_media_type');
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > maxBytes) throw new LedgerRequestError(413, 'payload_too_large');
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new LedgerRequestError(413, 'payload_too_large');
  try {
    const value: unknown = JSON.parse(text || '{}');
    if (isRecord(value)) return value;
  } catch {
    // answered below
  }
  throw new LedgerRequestError(400, 'bad_json');
}

function ledgerReply(value: JsonRecord, status: number): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
