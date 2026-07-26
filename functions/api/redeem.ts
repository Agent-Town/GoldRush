import { bumpCounter, clientIpHash, type KVNamespaceLike } from './_ratelimit';

type RedeemContext = {
  request: Request;
  env: {
    TELEMETRY?: KVNamespaceLike;
    ACCOUNTS?: KVNamespaceLike;
    BUG_OFFICE_TOKEN?: string;
  };
};

const ALLOWED_ORIGINS = new Set(['https://gold-rush-3in.pages.dev', 'https://agenttown.app', 'https://www.agenttown.app']);
const CODE_PATTERN = /^GR(?:-[A-F0-9]{6}){4}$/;
const MAX_JSON_BYTES = 2_048;
const RATE_TTL_SECONDS = 60 * 60;
const MAX_REDEEMS_PER_IP = 5;

export async function onRequest(context: RedeemContext): Promise<Response> {
  const cors = corsHeaders(context.request);
  if (!cors) return json({}, { ok: false, error: 'cors_forbidden', message: 'The clerk cannot take stubs from that trail.' }, 403);
  if (context.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (context.request.method !== 'POST') return json(cors, { ok: false, error: 'not_found', message: 'No office answers at this address.' }, 404);

  const kv = context.env.TELEMETRY ?? context.env.ACCOUNTS;
  if (!kv) return json(cors, { ok: false, error: 'office_closed', message: 'The prize ledger is off the desk. Try again later.' }, 503);

  try {
    const body = await readJson(context.request);
    if ('codes' in body) {
      if (Object.keys(body).some((key) => key !== 'codes')) throw new PayloadError();
      return await mint(context, kv, cors, body.codes);
    }
    if (Object.keys(body).some((key) => key !== 'code')) throw new PayloadError();
    const code = normalizeCode(body.code);
    if (!code) {
      return json(cors, { ok: false, error: 'bad_stub', message: 'The clerk turns the stub over. “This one is no county prize.”' });
    }
    if (!(await bumpCounter(kv, `redeem:ratelimit:${await clientIpHash(context.request)}`, MAX_REDEEMS_PER_IP, RATE_TTL_SECONDS))) {
      return json(cors, { ok: false, error: 'rate_limited', message: 'The prize desk has your stack already. Try again after the next bell.' }, 429);
    }
    const stored = await kv.get(`prize:${code}`);
    const skin = stored?.startsWith('redeemed:') ? stored.split('|', 2)[1] : stored;
    if (!skin) {
      return json(cors, { ok: false, error: 'bad_stub', message: 'The clerk turns the stub over. “This one is no county prize.”' });
    }
    if (!stored.startsWith('redeemed:')) await kv.put(`prize:${code}`, `redeemed:${new Date().toISOString()}|${skin}`);
    return json(cors, { ok: true, skin, message: 'The clerk stamps the stub. The Gilded Coat is yours.' });
  } catch (cause) {
    if (!(cause instanceof PayloadError)) {
      return json(cors, { ok: false, error: 'server_error', message: 'The prize ledger slipped off the desk. Try again.' }, 503);
    }
    return json(cors, { ok: false, error: 'bad_payload', message: 'The clerk cannot read that prize stub.' }, 400);
  }
}

async function mint(
  context: RedeemContext,
  kv: KVNamespaceLike,
  cors: Record<string, string>,
  value: unknown,
): Promise<Response> {
  const token = /^Bearer\s+(.+)$/i.exec(context.request.headers.get('authorization') ?? '')?.[1];
  if (!context.env.BUG_OFFICE_TOKEN || token !== context.env.BUG_OFFICE_TOKEN) {
    return json(cors, { ok: false, error: 'not_found', message: 'No office answers at this address.' }, 404);
  }
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw new PayloadError();
  const codes = value.map(normalizeCode);
  if (codes.some((code) => !code) || new Set(codes).size !== codes.length) throw new PayloadError();
  await Promise.all(codes.map((code) => kv.put(`prize:${code}`, 'gilded')));
  return json(cors, { ok: true, minted: codes.length }, 201);
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

function corsHeaders(request: Request): Record<string, string> | null {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Headers': 'authorization, content-type',
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

class PayloadError extends Error {}
