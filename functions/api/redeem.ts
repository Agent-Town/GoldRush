import { constantTimeEqual } from './_compare';
import { localhostOriginAllowed, type LocalhostOriginsEnv } from './_cors';
import {
  fallbackReason,
  LedgerRequestError,
  ledgerClientKey,
  ledgerLink,
  ledgerRoute,
  SMALL_LEDGER_BYTES,
  withLedgerFallback,
  type LedgerEnv,
  type LedgerLink,
} from './_ledger';
import { bumpCounter, clientIpHash, type KVNamespaceLike } from './_ratelimit';

type RedeemEnv = LedgerEnv & LocalhostOriginsEnv & {
  TELEMETRY?: KVNamespaceLike;
  ACCOUNTS?: KVNamespaceLike;
  BUG_OFFICE_TOKEN?: string;
};

type RedeemContext = {
  request: Request;
  env: RedeemEnv;
};

// What the prize desk decided, whichever store it asked.
type RedeemOutcome = { kind: 'redeemed'; skin: string } | { kind: 'rate_limited' } | { kind: 'bad_stub' } | { kind: 'unavailable' };

const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const CODE_PATTERN = /^GR(?:-[A-F0-9]{6}){4}$/;
const MAX_JSON_BYTES = 2_048;
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REDEEMS_PER_IP = 5;
const BAD_STUB = { ok: false, error: 'bad_stub', message: 'The clerk turns the stub over. “This one is no county prize.”' };
const OFFICE_CLOSED = { ok: false, error: 'office_closed', message: 'The prize ledger is off the desk. Try again later.' };

export async function onRequest(context: RedeemContext): Promise<Response> {
  const cors = corsHeaders(context.request, context.env);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'The clerk cannot take stubs from that trail.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return json(cors, { ok: false, error: 'not_found', message: 'No office answers at this address.' }, 404);

  // kv-counters-to-ledger-1 scope 3 (owner ruling 2026-09-24, item 7 "(b)"): the prize codes live in
  // the droplet ledger. This door keeps every check it had (the body cap, the key allowlist, the stub
  // pattern, the office bearer on the mint) and hands the decision over; the per-address limit and the
  // redeemed stamp are kept there. Unbound, the KV path below is the one it always was.
  const ledger = ledgerLink(context.env);
  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!ledger && !kv) return json(withLedgerFallback(cors, fallbackReason(ledger)), OFFICE_CLOSED, 503);

  try {
    const body = await readJson(context.request);
    if ('codes' in body) {
      if (Object.keys(body).some((key) => key !== 'codes')) throw new PayloadError();
      return await mint(context, ledger, kv, cors, body.codes);
    }
    if (Object.keys(body).some((key) => key !== 'code')) throw new PayloadError();
    const code = normalizeCode(body.code);
    if (!code) return json(cors, BAD_STUB);
    const client = await clientIpHash(context.request);
    // `kv` is bound whenever `ledger` is not: the early return above.
    const outcome = ledger ? await redeemThroughLedger(ledger, client, code) : await redeemCode(kv!, client, code);
    // No header when the ledger decided; `unconfigured` when KV did; `unreachable` when nobody could.
    const answered = ledger && outcome.kind !== 'unavailable' ? cors : withLedgerFallback(cors, fallbackReason(ledger));
    switch (outcome.kind) {
      case 'redeemed':
        return json(answered, { ok: true, skin: outcome.skin, message: 'The clerk stamps the stub. The Gilded Coat is yours.' });
      case 'rate_limited':
        return json(answered, { ok: false, error: 'rate_limited', message: 'The prize desk has your stack already. Try again after the next bell.' }, 429);
      case 'bad_stub':
        return json(answered, BAD_STUB);
      default:
        return json(answered, OFFICE_CLOSED, 503);
    }
  } catch (cause) {
    if (!(cause instanceof PayloadError)) {
      return json(cors, { ok: false, error: 'server_error', message: 'The prize ledger slipped off the desk. Try again.' }, 503);
    }
    return json(cors, { ok: false, error: 'bad_payload', message: 'The clerk cannot read that prize stub.' }, 400);
  }
}

async function mint(
  context: RedeemContext,
  ledger: LedgerLink | null,
  kv: KVNamespaceLike | undefined,
  cors: Record<string, string>,
  value: unknown,
): Promise<Response> {
  // SEC-9: the mint bearer was compared with `!==`, a first-differing-byte timing oracle on the same
  // secret the bug office uses. Same constant-time compare as every other door now. The SECRET REUSE
  // itself is unchanged and deliberate: splitting the mint off BUG_OFFICE_TOKEN means a new binding
  // on the Pages project and the droplet, which is an owner ops step, not a code change (report).
  const token = /^Bearer\s+(.+)$/i.exec(context.request.headers.get('authorization') ?? '')?.[1];
  if (!context.env.BUG_OFFICE_TOKEN || !constantTimeEqual(token ?? '', context.env.BUG_OFFICE_TOKEN)) {
    return json(cors, { ok: false, error: 'not_found', message: 'No office answers at this address.' }, 404);
  }
  const codes = validateCodes(value);
  if (ledger) {
    const reply = await ledger.post('/api/ledger/prizes/mint', { codes });
    if (reply?.ok === true && typeof reply.minted === 'number') return json(cors, { ok: true, minted: reply.minted }, 201);
    return json(withLedgerFallback(cors, fallbackReason(ledger)), OFFICE_CLOSED, 503);
  }
  if (!kv) return json(withLedgerFallback(cors, fallbackReason(ledger)), OFFICE_CLOSED, 503);
  await mintCodes(kv, codes);
  return json(withLedgerFallback(cors, fallbackReason(ledger)), { ok: true, minted: codes.length }, 201);
}

// POST /api/ledger/prizes/mint {codes} and POST /api/ledger/prizes/redeem {client, code}, droplet side
// (server/ledger/serve.mjs). The office bearer is checked by the public door; the ledger admits that
// door by the shared secret, and re-checks every code against the same pattern and the same 1-20 cap.
// Same `prize:<code>` rows KV held, so the one-shot migration is a straight copy.
export async function ledgerMint(context: { request: Request; env: RedeemEnv }): Promise<Response> {
  return ledgerRoute(context, ['POST'], SMALL_LEDGER_BYTES, async ({ body }) => {
    const store = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!store) throw new LedgerRequestError(503, 'office_closed');
    let codes: string[];
    try {
      codes = validateCodes(body.codes);
    } catch {
      throw new LedgerRequestError(400, 'bad_payload');
    }
    await mintCodes(store, codes);
    return { ok: true, minted: codes.length };
  });
}

export async function ledgerRedeem(context: { request: Request; env: RedeemEnv }): Promise<Response> {
  return ledgerRoute(context, ['POST'], SMALL_LEDGER_BYTES, async ({ body }) => {
    const store = context.env.TELEMETRY ?? context.env.ACCOUNTS;
    if (!store) throw new LedgerRequestError(503, 'office_closed');
    const client = ledgerClientKey(body.client);
    const code = normalizeCode(body.code);
    if (!client || !code) throw new LedgerRequestError(400, 'bad_payload');
    const outcome = await redeemCode(store, client, code);
    return outcome.kind === 'redeemed' ? { ok: true, skin: outcome.skin } : { ok: false, error: outcome.kind };
  });
}

async function redeemThroughLedger(ledger: LedgerLink, client: string, code: string): Promise<RedeemOutcome> {
  const reply = await ledger.post('/api/ledger/prizes/redeem', { client, code });
  if (reply?.ok === true && typeof reply.skin === 'string') return { kind: 'redeemed', skin: reply.skin };
  if (reply?.error === 'rate_limited') return { kind: 'rate_limited' };
  if (reply?.error === 'bad_stub') return { kind: 'bad_stub' };
  return { kind: 'unavailable' };
}

// One home for the decision, whichever store serves it. Unchanged semantics: the per-address limit is
// charged only for a well-formed stub, a known code answers with its skin every time it is shown, and
// the first redemption stamps the time.
async function redeemCode(kv: KVNamespaceLike, client: string, code: string): Promise<RedeemOutcome> {
  if (!(await bumpCounter(kv, `redeem:ratelimit:${client}`, MAX_REDEEMS_PER_IP, RATE_TTL_SECONDS))) return { kind: 'rate_limited' };
  const stored = await kv.get(`prize:${code}`);
  const skin = stored?.startsWith('redeemed:') ? stored.split('|', 2)[1] : stored;
  if (!skin || stored === null) return { kind: 'bad_stub' };
  if (!stored.startsWith('redeemed:')) await kv.put(`prize:${code}`, `redeemed:${new Date().toISOString()}|${skin}`);
  return { kind: 'redeemed', skin };
}

function validateCodes(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw new PayloadError();
  const codes = value.map(normalizeCode);
  if (codes.some((code) => !code) || new Set(codes).size !== codes.length) throw new PayloadError();
  return codes as string[];
}

async function mintCodes(kv: KVNamespaceLike, codes: string[]): Promise<void> {
  await Promise.all(codes.map((code) => kv.put(`prize:${code}`, 'gilded')));
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') ?? '')) throw new PayloadError();
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) throw new PayloadError();
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_JSON_BYTES) throw new PayloadError();
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new PayloadError();
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PayloadError();
  return value as Record<string, unknown>;
}

function normalizeCode(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

function corsHeaders(request: Request, env: LocalhostOriginsEnv): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Headers': 'authorization, content-type',
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

class PayloadError extends Error {}
