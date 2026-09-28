export type KVNamespaceLike = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  // kv-counters-to-ledger-1: the droplet ledger's one-statement count-and-read
  // (server/ledger/storage.mjs `increment`). SqliteStorage offers it; Cloudflare KV cannot.
  increment?(key: string, ttlSeconds: number): Promise<number>;
};

// F-HEAT14-7, owner ruling 2026-09-19 (verbatim: "I agree with all your recommendations on the
// decisions - good work"; the register's recommendation was "(b) and (a) together: a real hour and a
// cap of 60"). The counter used to store only its count and re-arm `expirationTtl` on EVERY accepted
// write, so the window restarted on each accepted request and never rolled for a caller that kept
// submitting: "30 per hour" was really 30 per heat, and heat 14's ride 37 — a first-ever secure of the
// Archive World — was refused `rate_limited` (`artifacts/gauntlet-heat14-e3949bfa/heat14-note.md` §5).
//
// The stored value now carries the window START beside the count (`"<count>:<startedAtMs>"`) and the
// TTL is the REMAINDER of the window measured from that start, so an hour is an hour for every door
// this limiter serves. Nothing else moved: the signature, the return type, the refuse-before-write
// order and every caller's limit are byte-identical, so the seven doors that share it
// (`standings`, `_accounts`, `telemetry`, `redeem`, `_bugs`, `refusals`, and `_multiplayer`'s KV fallback since
// kv-counters-to-ledger-2, F-KV1-4) keep their own numbers. The
// one behaviour every door inherits is the fixed window — which is the ruling.
const WINDOW_SEPARATOR = ':';

type RateWindow = { count: number; startedAt: number };

// A value written before the window start was stored is a bare count. Keep the count (flood control
// never loosens because of a deploy) and start its window now, once.
function parseWindow(raw: string | null, now: number): RateWindow {
  if (raw === null) return { count: 0, startedAt: now };
  const separator = raw.indexOf(WINDOW_SEPARATOR);
  const count = Number(separator === -1 ? raw : raw.slice(0, separator));
  const startedAt = separator === -1 ? Number.NaN : Number(raw.slice(separator + 1));
  return {
    count: Number.isFinite(count) && count > 0 ? Math.trunc(count) : 0,
    startedAt: Number.isFinite(startedAt) && startedAt > 0 ? startedAt : now,
  };
}

export async function bumpCounter(kv: KVNamespaceLike, key: string, limit: number, ttlSeconds: number): Promise<boolean> {
  // kv-counters-to-ledger-1 (owner ruling 2026-09-24, item 7 "(b)"): where the store can count
  // atomically - the sqlite ledger behind every door the droplet serves, and the ledger routes the
  // Pages doors now call - the window counter IS that count. The read-then-write below lets a burst
  // share one number (the SEC-1 defect, measured on the guess counter), and the ledger's statement
  // cannot: each caller is refused on the count its own call produced. The window is the same fixed
  // window this file already promises: `increment` arms `expires_at` once, from the first counted
  // request, and never re-arms it. One difference, deliberate: a refused request is counted too, so
  // the stored number can pass the limit. That buys nothing and costs nothing, because the window it
  // sits in still ends on time. A value this file wrote as `<count>:<start>` keeps its count: sqlite
  // reads `CAST('7:1788...' AS INTEGER)` as 7, measured.
  if (kv.increment) return (await kv.increment(key, ttlSeconds)) <= limit;
  const now = Date.now();
  const stored = parseWindow(await kv.get(key), now);
  const elapsedMs = now - stored.startedAt;
  // Outside the window (expired, or a start in the future after a clock step) the window is new.
  const rolled = !(elapsedMs >= 0 && elapsedMs < ttlSeconds * 1000);
  const count = rolled ? 0 : stored.count;
  const startedAt = rolled ? now : stored.startedAt;
  // A refusal never bumps and never re-arms the window: the hour that refused you is the hour that
  // has to pass, not an hour restarted by your own refused attempt.
  if (count >= limit) return false;
  // Cloudflare KV refuses an expirationTtl under 60 s (F-KV2-1, 2026-09-25): floor it, so the last 59 s of a
  // rider's hour do not throw and 429 at the door. The window START stored beside the count still rolls the
  // hour on the next read, so the floor costs at most 59 s of key life, never a longer window.
  const remainingSeconds = Math.max(60, Math.ceil((startedAt + ttlSeconds * 1000 - now) / 1000));
  await kv.put(key, `${count + 1}${WINDOW_SEPARATOR}${startedAt}`, { expirationTtl: remainingSeconds });
  return true;
}

export async function clientIpHash(request: Request): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'local';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
