/**
 * F-HEAT14-7 -- THE COUNTY'S HOUR WAS NEVER AN HOUR, AND THE CAP LOCKED OUT A RIDER WHO PLAYED
 * EVERY BOARD ONCE.
 *
 * OWNER RULING 2026-09-19, verbatim: "I agree with all your recommendations on the decisions - good
 * work", taken on `docs/OWNER-DESK-2026-09-19.md` where the recommendation reads "(b) and (a)
 * together: a real hour and a cap of 60. The cap is against floods, not against a rider that plays
 * every board once."
 *
 * THE MEASURED SYMPTOM (`artifacts/gauntlet-heat14-e3949bfa/heat14-note.md` §5): heat 14 rode 37
 * board contracts from one `anonId`. The door allowed 30 per rider per hour, and `bumpCounter`
 * re-armed `expirationTtl` to a FULL hour on every accepted write, so the window restarted on every
 * accepted submission and could never roll while the rider kept riding. "30 per hour" was 30 per
 * HEAT. Ride 37 -- a first-ever secure of the Archive World -- was refused `rate_limited`.
 *
 * WHAT THIS GUARD PINS, and why each arm exists rather than being a restatement of the code:
 *   1. the rider cap is 60 and the 61st submission inside one hour is refused;
 *   2. an hour is an hour: a caller that fills the limit is accepted again once the window from the
 *      FIRST write has passed -- with the pre-cure body run as a CONTROL on the same fixture, so the
 *      arm proves the cure and not merely the current behaviour (the control refuses);
 *   3. a refusal never bumps and never re-arms the window;
 *   4. the stored TTL is the REMAINDER of the window, never a fresh hour -- this is the mechanism,
 *      and it is the line the pre-cure code got wrong;
 *   5. a counter written before the window start was stored (a bare count) keeps its count, so the
 *      deploy that lands this cure cannot hand a flood a free window;
 *   6. the census: this limiter is shared, and every door that shares it still passes its own TTL
 *      (seven doors since kv-counters-to-ledger-2 added the co-op door, F-KV1-4);
 *   7. the co-op door's KV fallback keeps the real hour, driven through the door itself: a connect at
 *      minute 59 does not extend its window, the count restarts at the hour, and a rider who filled
 *      the limit is let back in at the hour. All three were red on the door's own pre-change limiter.
 *
 * The door's numbers are DERIVED from `functions/api/standings.ts` (and the co-op rows' from
 * `functions/api/_multiplayer.ts`) rather than transcribed here: a pin that copies the number it
 * guards goes green against a tree where the number moved.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

import { bumpCounter } from '../functions/api/_ratelimit.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DOOR_SOURCE = readFileSync(new URL('../functions/api/standings.ts', import.meta.url), 'utf8');
const COOP_FILE = 'functions/api/_multiplayer.ts';
const COOP_SOURCE = readFileSync(new URL(`../${COOP_FILE}`, import.meta.url), 'utf8');
const HEAT14_BOARD_CONTRACTS = 37; // heat14-note.md §5: the ride count that met the cap.

/** Read a numeric `const NAME = <int or int * int>;` out of a door, so the pin follows the door. */
function doorConstant(name, source = DOOR_SOURCE, file = 'functions/api/standings.ts') {
  const match = new RegExp(String.raw`^const ${name} = ([0-9 _*]+);`, 'm').exec(source);
  assert.ok(match, `${name} not found in ${file} -- the pin lost its subject`);
  const value = match[1].split('*').map((part) => Number(part.trim().replace(/_/g, ''))).reduce((a, b) => a * b, 1);
  assert.ok(Number.isFinite(value) && value > 0, `${name} did not parse as a positive number: ${match[1]}`);
  return value;
}

/**
 * A KV that honours `expirationTtl` against the SAME fake clock the limiter reads. That is the whole
 * subject: under the pre-cure body the key's expiry was pushed out by every accepted write, so it
 * never expired for a busy caller.
 */
function makeKv() {
  const values = new Map();
  const puts = [];
  return {
    puts,
    raw: (key) => values.get(key)?.value ?? null,
    seed(key, value, ttlSeconds) { values.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 }); },
    async get(key) {
      const entry = values.get(key);
      if (!entry) return null;
      if (entry.expiresAt <= Date.now()) { values.delete(key); return null; }
      return entry.value;
    },
    async put(key, value, options) {
      const ttl = options?.expirationTtl;
      puts.push({ key, value, ttl });
      values.set(key, { value, expiresAt: Date.now() + (ttl ?? 0) * 1000 });
    },
  };
}

async function withClock(startMs, body) {
  const real = Date.now;
  let now = startMs;
  Date.now = () => now;
  try {
    return await body({ advance: (ms) => { now += ms; }, now: () => now });
  } finally {
    Date.now = real;
  }
}

/**
 * The PRE-CURE body, copied from `git show 797052233:functions/api/_ratelimit.ts` (the base this
 * branch was cut from). It is here as a control: an arm that only exercises the new code cannot say
 * whether the old code would have passed too.
 */
async function legacyBumpCounter(kv, key, limit, ttlSeconds) {
  const current = Number(await kv.get(key));
  const count = Number.isFinite(current) && current > 0 ? Math.trunc(current) : 0;
  if (count >= limit) return false;
  await kv.put(key, String(count + 1), { expirationTtl: ttlSeconds });
  return true;
}

/**
 * kv-counters-to-ledger-2 (F-KV1-4): THE CO-OP DOOR, DRIVEN THROUGH THE DOOR ITSELF. Its KV fallback
 * kept a limiter of its own that re-armed `expirationTtl` to a full hour on every accepted write (the
 * shape the ruling above retired for the six doors) until this slice moved it onto the shared one. A
 * row on `_ratelimit.ts` alone would be green on the tree that still had the defect, so these rows call
 * `connectRoom` as the Pages runtime would (vite's SSR transform of the TypeScript, its WebSocket
 * server off), with a room stub behind it and no ledger bound, so every count lands on the KV fallback.
 */
const ADMITTED = 426; // the room stub's answer: the connect got past the limiter and reached the room
const REFUSED = 429;
let coopDoors = null;

async function coopDoor() {
  if (!coopDoors) {
    const vite = await createViteServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null, ws: false } });
    try {
      coopDoors = await vite.ssrLoadModule(`/${COOP_FILE}`);
    } finally {
      await vite.close();
    }
  }
  return coopDoors;
}

// The door is loaded BEFORE a row enters its fixed clock (vite is not run with Date.now frozen).
async function coopConnect(door, kv) {
  const { connectRoom } = door;
  const rooms = { idFromName: (name) => name, get: () => ({ fetch: async () => new Response(null, { status: ADMITTED }) }) };
  const request = new Request(`http://localhost/api/multiplayer/connect?code=${'A'.repeat(24)}`, {
    headers: { Origin: 'https://agenttown.app', 'CF-Connecting-IP': '198.51.100.7' },
  });
  const response = await connectRoom({ request, env: { MULTIPLAYER_ROOMS: rooms, MULTIPLAYER_RATE_LIMITS: kv } });
  return response.status;
}

test('the rider cap is 60 and the sixty-first submission inside one hour is refused', async () => {
  const cap = doorConstant('MAX_REQUESTS_PER_ANON');
  assert.equal(cap, 60, 'owner ruling 2026-09-19 (F-HEAT14-7): "a real hour and a cap of 60"');
  assert.ok(cap > HEAT14_BOARD_CONTRACTS, `the cap must clear a rider who plays every board once (${HEAT14_BOARD_CONTRACTS} in heat 14)`);
  const ttl = doorConstant('RATE_TTL_SECONDS');
  const kv = makeKv();
  await withClock(Date.UTC(2026, 8, 19, 9, 0, 0), async (clock) => {
    for (let ride = 1; ride <= cap; ride += 1) {
      assert.equal(await bumpCounter(kv, 'standings:ratelimit:anon:rider', cap, ttl), true, `ride ${ride} of ${cap} must be accepted`);
      clock.advance(30_000); // 60 rides, 30 s apart: half an hour, comfortably inside the window
    }
    assert.ok(clock.now() < Date.UTC(2026, 8, 19, 9, 0, 0) + ttl * 1000, 'the arm must stay inside one window to mean anything');
    assert.equal(await bumpCounter(kv, 'standings:ratelimit:anon:rider', cap, ttl), false, `submission ${cap + 1} inside the hour must be refused`);
  });
});

test('an hour is an hour: the limit refills once the window from the first write has passed', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS');
  const limit = 30; // the pre-ruling cap, which is the shape ruling (b) repairs
  const start = Date.UTC(2026, 8, 19, 9, 0, 0);
  const cured = makeKv();
  const control = makeKv();
  await withClock(start, async (clock) => {
    for (let ride = 1; ride <= limit; ride += 1) {
      assert.equal(await bumpCounter(cured, 'k', limit, ttl), true, `cured: ride ${ride} accepted`);
      assert.equal(await legacyBumpCounter(control, 'k', limit, ttl), true, `control: ride ${ride} accepted`);
      clock.advance(60_000); // 30 rides a minute apart: the window opened 30 minutes ago
    }
    assert.equal(await bumpCounter(cured, 'k', limit, ttl), false, 'cured: the limit is still a limit inside the window');
    // Step to one second past the hour measured from the FIRST write.
    clock.advance(start + ttl * 1000 + 1000 - clock.now());
    assert.equal(await bumpCounter(cured, 'k', limit, ttl), true, 'cured: past the hour, the rider is accepted again');
    assert.equal(await legacyBumpCounter(control, 'k', limit, ttl), false,
      'CONTROL: the pre-cure body re-armed the hour on every accepted write, so the same caller is still locked out -- this is the defect the ruling names');
  });
});

test('a refusal never bumps the count and never re-arms the window', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS');
  const limit = 3;
  const start = Date.UTC(2026, 8, 19, 9, 0, 0);
  const kv = makeKv();
  await withClock(start, async (clock) => {
    for (let ride = 1; ride <= limit; ride += 1) assert.equal(await bumpCounter(kv, 'k', limit, ttl), true);
    const storedAtLimit = kv.raw('k');
    const putsAtLimit = kv.puts.length;
    for (let refused = 1; refused <= 3; refused += 1) {
      clock.advance(10 * 60_000);
      assert.equal(await bumpCounter(kv, 'k', limit, ttl), false, `refusal ${refused}`);
    }
    assert.equal(kv.raw('k'), storedAtLimit, 'a refusal must not rewrite the counter');
    assert.equal(kv.puts.length, putsAtLimit, 'a refusal must not write to the store at all');
    // Half an hour of refusals must not have pushed the window out: the hour still ends on time.
    clock.advance(start + ttl * 1000 + 1000 - clock.now());
    assert.equal(await bumpCounter(kv, 'k', limit, ttl), true, 'the hour that refused you is the hour that passes');
  });
});

test('the stored ttl is the remainder of the window, never a fresh hour', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS');
  const kv = makeKv();
  await withClock(Date.UTC(2026, 8, 19, 9, 0, 0), async (clock) => {
    assert.equal(await bumpCounter(kv, 'k', 10, ttl), true);
    assert.equal(kv.puts.at(-1).ttl, ttl, 'the first write in a window arms the whole window');
    clock.advance(40 * 60_000);
    assert.equal(await bumpCounter(kv, 'k', 10, ttl), true);
    const remaining = kv.puts.at(-1).ttl;
    assert.ok(remaining <= ttl - 40 * 60 && remaining > 0,
      `a write 40 minutes into the hour must arm the REMAINDER (expected about ${ttl - 40 * 60} s, got ${remaining} s)`);
    assert.match(kv.raw('k'), /^2:\d+$/, 'the stored value carries the count and the window start');
  });
});

test('a counter written before the window start was stored keeps its count', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS');
  const kv = makeKv();
  await withClock(Date.UTC(2026, 8, 19, 9, 0, 0), async () => {
    kv.seed('k', '7', ttl); // the pre-cure shape: a bare count, no window start
    assert.equal(await bumpCounter(kv, 'k', 8, ttl), true, 'the eighth request of eight is still allowed');
    assert.equal(await bumpCounter(kv, 'k', 8, ttl), false, 'the legacy count is carried, not discarded');
    assert.match(kv.raw('k'), /^8:\d+$/, 'the value is rewritten in the window shape on the first bump after the deploy');
  });
});

test('the co-op door (KV fallback): a connect admitted at minute 59 does not extend its window', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS', COOP_SOURCE, COOP_FILE);
  const start = Date.UTC(2026, 8, 25, 9, 0, 0);
  const door = await coopDoor();
  const kv = makeKv();
  await withClock(start, async (clock) => {
    assert.equal(await coopConnect(door, kv), ADMITTED, 'the first connect of the hour reaches the room');
    clock.advance(59 * 60_000);
    assert.equal(await coopConnect(door, kv), ADMITTED, 'a connect at minute 59, inside the limit, reaches the room');
    const armed = kv.puts.at(-1).ttl;
    assert.ok(armed <= ttl - 59 * 60,
      `the write at minute 59 must arm the REMAINDER of the hour (at most ${ttl - 59 * 60} s), not a fresh hour: it armed ${armed} s`);
    assert.equal(kv.puts.at(-1).value, `2:${start}`, 'and the window it records still starts at the first connect');
  });
});

test('the co-op door (KV fallback): the count restarts at the hour measured from the first connect', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS', COOP_SOURCE, COOP_FILE);
  const start = Date.UTC(2026, 8, 25, 9, 0, 0);
  const door = await coopDoor();
  const kv = makeKv();
  await withClock(start, async (clock) => {
    assert.equal(await coopConnect(door, kv), ADMITTED);
    clock.advance(59 * 60_000);
    assert.equal(await coopConnect(door, kv), ADMITTED);
    clock.advance(start + ttl * 1000 - clock.now()); // the hour, measured from the FIRST connect
    assert.equal(await coopConnect(door, kv), ADMITTED, 'at the hour the rider reaches the room');
    assert.equal(kv.puts.at(-1).value, `1:${clock.now()}`,
      'and is counted as the FIRST connect of a new window: a limiter that re-armed the hour at minute 59 carries the count on');
  });
});

test('the co-op door (KV fallback): a rider who filled the limit is let back in at the hour, not an hour after the last connect', async () => {
  const ttl = doorConstant('RATE_TTL_SECONDS', COOP_SOURCE, COOP_FILE);
  const limit = doorConstant('MAX_CONNECT_REQUESTS_PER_IP', COOP_SOURCE, COOP_FILE);
  const start = Date.UTC(2026, 8, 25, 9, 0, 0);
  const door = await coopDoor();
  const kv = makeKv();
  await withClock(start, async (clock) => {
    for (let ride = 1; ride <= limit; ride += 1) {
      assert.equal(await coopConnect(door, kv), ADMITTED, `connect ${ride} of ${limit} reaches the room`);
      clock.advance(60_000); // one a minute: the limit is spent inside the first half hour
    }
    assert.equal(await coopConnect(door, kv), REFUSED, `connect ${limit + 1} inside the hour is refused`);
    clock.advance(start + ttl * 1000 - clock.now());
    assert.equal(await coopConnect(door, kv), ADMITTED,
      'at the hour from the first connect the rider is admitted again; a limiter that re-arms on every accepted write keeps them out until an hour after the LAST one');
  });
});

test('every door that shares this limiter still passes its own ttl', () => {
  const callers = execFileSync('git', ['grep', '-l', '-e', "from './_ratelimit'", '--', 'functions'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
  // The census of the doors that share this limiter. F-HEAT14-7's register and review counted six:
  // standings, accounts, telemetry, redeem, bugs, refusals. SEVEN since kv-counters-to-ledger-2
  // (F-KV1-4, 2026-09-25): multiplayer, whose KV fallback moved onto this limiter on purpose, so the
  // co-op door's hour is the ruled real hour too. If this census moves, the blast radius of a change
  // here moved with it.
  assert.deepEqual(callers.sort(), [
    'functions/api/_accounts.ts',
    'functions/api/_bugs.ts',
    'functions/api/_multiplayer.ts',
    'functions/api/redeem.ts',
    'functions/api/refusals.ts',
    'functions/api/standings.ts',
    'functions/api/telemetry.ts',
  ]);
  for (const caller of callers) {
    const source = readFileSync(new URL(`../${caller}`, import.meta.url), 'utf8');
    for (const call of source.matchAll(/bumpCounter\(([^;]*?)\)(?:,|\))/gs)) {
      assert.match(call[1], /RATE_TTL_SECONDS\s*$/,
        `${caller}: every bumpCounter call must still pass its own RATE_TTL_SECONDS (the window is per door)`);
    }
  }
});
