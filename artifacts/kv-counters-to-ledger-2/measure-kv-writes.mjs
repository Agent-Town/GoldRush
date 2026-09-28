#!/usr/bin/env node
// kv-counters-to-ledger-2: re-runnable evidence for the two doors this slice changes (F-KV1-4, F-KV1-5).
//
//   node artifacts/kv-counters-to-ledger-2/measure-kv-writes.mjs                  # base dec3196c5 vs this tree
//   node artifacts/kv-counters-to-ledger-2/measure-kv-writes.mjs --base <rev> --out <file.json>
//
// The shape is the kv-counters-to-ledger-1 instrument's (artifacts/kv-counters-to-ledger-1/
// measure-kv-writes.mjs): load the doors the way the Pages runtime compiles them (vite's SSR transform
// of the TypeScript) and drive them with a KV stand-in that COUNTS every call, because a KV write is what
// the free tier meters (1,000 a day, shared by every door on the namespace). Two things are new here:
//   1. BOTH columns come from one run. The co-op door (functions/api/_multiplayer.ts) and the standings
//      door (functions/api/standings.ts) are served from `git show <base>:<file>` for the "before"
//      column and from this working tree for the "after" column; every other module is the working
//      tree's. The script refuses to run unless those two files are the ONLY difference between the
//      base and this tree under functions/, src/, assets/ and server/, so the columns differ by this
//      slice and nothing else.
//   2. The KV stand-in honours expirationTtl against a FIXED clock (Date.now is replaced for the run),
//      which is what the window behaviour is made of. One variant also enforces Cloudflare KV's floor
//      of 60 seconds on expirationTtl (the rule Miniflare applies as MIN_EXPIRATION_TTL_SECONDS; the
//      repo pins it in scripts/site-security-headers.test.mjs), for finding F-KV2-1.
// Nothing here opens a socket: no network, no Cloudflare, no droplet, no ledger (vite runs with its
// WebSocket server disabled, and no fetch is ever made).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DOORS = ['functions/api/_multiplayer.ts', 'functions/api/standings.ts'];
const COMPARED_TREES = ['functions', 'src', 'assets', 'server'];
const DEFAULT_BASE = 'dec3196c5'; // the commit fix/kv-counters-to-ledger-2 was cut from
const CANONICAL_ORIGIN = 'https://agenttown.app';
const PAGES_ORIGIN = 'https://gold-rush-3in.pages.dev';
const KV_MIN_EXPIRATION_TTL_SECONDS = 60;
const HOUR_START = Date.UTC(2026, 8, 25, 9, 0, 0);
const MINUTE = 60_000;

const args = process.argv.slice(2);
const option = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : null);
const base = option('--base') ?? DEFAULT_BASE;
const out = option('--out') ? path.resolve(option('--out')) : null;

function git(...gitArgs) {
  return execFileSync('git', gitArgs, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// The honesty check behind the two columns: nothing else under the compared trees may differ.
function assertOnlyTheDoorsDiffer() {
  const changed = git('diff', '--name-only', base, '--', ...COMPARED_TREES).split('\n').filter(Boolean);
  const untracked = git('ls-files', '--others', '--exclude-standard', '--', ...COMPARED_TREES).split('\n').filter(Boolean);
  const stray = [...changed.filter((file) => !DOORS.includes(file)), ...untracked];
  if (stray.length > 0) {
    throw new Error(`refusing to measure: besides the two doors, ${stray.length} file(s) differ from ${base} under ${COMPARED_TREES.join(', ')}:\n  ${stray.join('\n  ')}`);
  }
  return changed;
}

// Serve the named files from a revision instead of the working tree, before vite's own loader.
function revisionOverrides(revision) {
  const sources = new Map(DOORS.map((file) => [path.join(ROOT, file), git('show', `${revision}:${file}`)]));
  return { name: 'kv2-revision-overrides', enforce: 'pre', load: (id) => sources.get(id.split('?')[0]) ?? null };
}

async function loadDoors(revision) {
  const vite = await createViteServer({
    root: ROOT,
    configFile: false,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true, watch: null, ws: false },
    plugins: revision ? [revisionOverrides(revision)] : [],
  });
  try {
    return {
      coop: await vite.ssrLoadModule('/functions/api/_multiplayer.ts'),
      standings: await vite.ssrLoadModule('/functions/api/standings.ts'),
    };
  } finally {
    await vite.close();
  }
}

// --- the clock and the KV stand-in -----------------------------------------------------------------

let now = HOUR_START;
const realNow = Date.now;
function atMinute(minutes) {
  now = HOUR_START + Math.round(minutes * MINUTE);
}

function countingKv({ enforceTtlFloor = false } = {}) {
  const values = new Map();
  const calls = [];
  const puts = [];
  return {
    calls,
    puts,
    raw: (key) => values.get(key)?.value ?? null,
    async get(key) {
      calls.push('get');
      const entry = values.get(key);
      if (!entry) return null;
      if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
        values.delete(key);
        return null;
      }
      return entry.value;
    },
    async put(key, value, options) {
      calls.push('put');
      const ttl = options?.expirationTtl;
      if (enforceTtlFloor && ttl !== undefined && ttl < KV_MIN_EXPIRATION_TTL_SECONDS) {
        // Miniflare's wording, which is the production rule it mirrors.
        throw new Error(`KV PUT failed: 400 Invalid expiration_ttl of ${ttl}. Expiration TTL must be at least ${KV_MIN_EXPIRATION_TTL_SECONDS}.`);
      }
      puts.push({ key, value, ttl: ttl ?? null, at: Date.now() });
      values.set(key, { value, expiresAt: ttl === undefined ? null : Date.now() + ttl * 1000 });
    },
    async delete(key) {
      calls.push('delete');
      values.delete(key);
    },
    async list({ prefix = '' } = {}) {
      calls.push('list');
      return { keys: [...values.keys()].filter((key) => key.startsWith(prefix)).sort().map((name) => ({ name })), list_complete: true };
    },
  };
}

function tally(calls) {
  const byMethod = {};
  for (const call of calls) byMethod[call] = (byMethod[call] ?? 0) + 1;
  return { total: calls.length, writes: (byMethod.put ?? 0) + (byMethod.delete ?? 0), byMethod };
}

// --- the co-op door's KV fallback (F-KV1-4) ----------------------------------------------------------

const ADMITTED = 426; // the room stub's answer: the request got past the limiter and reached the room
const ROOM_CODE = 'A'.repeat(24);

async function coopCall(coop, door, kv, ip = '198.51.100.7') {
  const rooms = { idFromName: (name) => name, get: () => ({ fetch: async () => new Response(null, { status: ADMITTED }) }) };
  const create = door === 'create';
  const request = new Request(create ? 'http://localhost/api/multiplayer/create' : `http://localhost/api/multiplayer/${door}?code=${ROOM_CODE}`, {
    method: create ? 'POST' : 'GET',
    headers: { Origin: CANONICAL_ORIGIN, 'CF-Connecting-IP': ip, ...(create ? { 'content-type': 'application/json' } : {}) },
    body: create ? '{}' : undefined,
  });
  const handler = { create: coop.createRoom, connect: coop.connectRoom, inspect: coop.inspectRoom }[door];
  // No LEDGER_PROXY_SECRET: every count takes the KV fallback, which is production until the ops evening.
  const response = await handler({ request, env: { MULTIPLAYER_ROOMS: rooms, MULTIPLAYER_RATE_LIMITS: kv } });
  return response.status === ADMITTED || (create && response.status === 200) ? 'admitted' : response.status === 429 ? 'refused' : `status ${response.status}`;
}

function constant(source, name) {
  const match = new RegExp(String.raw`^const ${name} = ([0-9 _*]+);`, 'm').exec(source);
  if (!match) throw new Error(`${name} not found`);
  return match[1].split('*').map((part) => Number(part.trim().replace(/_/g, ''))).reduce((a, b) => a * b, 1);
}

async function measureCoop(coop, coopSource) {
  const limits = {
    create: constant(coopSource, 'MAX_CREATE_REQUESTS_PER_IP'),
    connect: constant(coopSource, 'MAX_CONNECT_REQUESTS_PER_IP'),
    inspect: constant(coopSource, 'MAX_INSPECT_REQUESTS_PER_IP'),
  };
  const result = { limits, writesPerRequest: {}, window: {} };

  // 1. KV writes per admitted request and per refused request, each door: the limit spent a minute
  //    apart inside one hour, then five more attempts.
  for (const door of ['create', 'connect', 'inspect']) {
    const kv = countingKv();
    let admitted = 0;
    let admittedWrites = 0;
    for (let request = 0; request < limits[door]; request += 1) {
      atMinute(request * 0.25);
      const before = kv.puts.length;
      if ((await coopCall(coop, door, kv)) === 'admitted') admitted += 1;
      admittedWrites += kv.puts.length - before;
    }
    const writesBeforeRefusals = kv.puts.length;
    const refusals = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      atMinute(limits[door] * 0.25 + attempt);
      refusals.push(await coopCall(coop, door, kv));
    }
    result.writesPerRequest[door] = {
      admitted,
      kvWritesPerAdmittedRequest: admitted === 0 ? null : admittedWrites / admitted,
      refusedAttempts: refusals.filter((answer) => answer === 'refused').length,
      kvWritesPerRefusedAttempt: (kv.puts.length - writesBeforeRefusals) / refusals.length,
      kvCallsTotal: tally(kv.calls),
    };
  }

  // 2. The window, on the connect door (the co-op path every rider takes).
  {
    const kv = countingKv();
    atMinute(0);
    await coopCall(coop, 'connect', kv);
    const firstTtl = kv.puts.at(-1).ttl;
    atMinute(59);
    const at59 = await coopCall(coop, 'connect', kv);
    const ttlArmedAt59 = kv.puts.at(-1).ttl;
    atMinute(60);
    const at60 = await coopCall(coop, 'connect', kv);
    result.window.connectsAtMinutes0And59ThenAt60 = {
      ttlArmedByFirstConnectSeconds: firstTtl,
      minute59: at59,
      ttlArmedByMinute59ConnectSeconds: ttlArmedAt59,
      minute60: at60,
      storedValueAfterMinute60: kv.raw(kv.puts.at(-1).key),
      windowRestartedAtMinute60: /^1:\d+$/.test(kv.raw(kv.puts.at(-1).key) ?? ''),
    };
  }
  {
    // A rider who spends the whole limit a minute apart, then knocks once a minute: when are they let back in?
    const kv = countingKv();
    for (let ride = 0; ride < limits.connect; ride += 1) {
      atMinute(ride);
      await coopCall(coop, 'connect', kv);
    }
    let readmittedAtMinute = null;
    for (let minute = limits.connect; minute <= 180 && readmittedAtMinute === null; minute += 1) {
      atMinute(minute);
      if ((await coopCall(coop, 'connect', kv)) === 'admitted') readmittedAtMinute = minute;
    }
    result.window.limitSpentMinutes0To29 = { lastAdmittedMinute: limits.connect - 1, readmittedAtMinute };
  }
  {
    // A rider who connects every ten minutes for six hours: six an hour, well under the limit.
    const kv = countingKv();
    const answers = [];
    for (let minute = 0; minute < 360; minute += 10) {
      atMinute(minute);
      answers.push([minute, await coopCall(coop, 'connect', kv)]);
    }
    const refused = answers.filter(([, answer]) => answer === 'refused');
    result.window.everyTenMinutesForSixHours = {
      connects: answers.length,
      refused: refused.length,
      firstRefusedAtMinute: refused[0]?.[0] ?? null,
    };
  }

  // 3. F-KV2-1: with Cloudflare KV's 60-second floor on expirationTtl enforced, a connect at the named
  //    instant of the window (each on a fresh store: one connect at minute 0, then this one).
  result.window.withKvTtlFloor = {};
  for (const [label, minutes] of [['59:00', 59], ['59:01', 59 + 1 / 60], ['59:30', 59.5], ['59:59', 59 + 59 / 60], ['60:00', 60]]) {
    const kv = countingKv({ enforceTtlFloor: true });
    atMinute(0);
    await coopCall(coop, 'connect', kv);
    atMinute(minutes);
    result.window.withKvTtlFloor[label] = await coopCall(coop, 'connect', kv);
  }
  return result;
}

// --- the Pages standings door (F-KV1-5) ------------------------------------------------------------

const engineEra = JSON.parse(readFileSync(path.join(ROOT, 'assets/engine-era.json'), 'utf8'));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

// The accepted-submission shape scripts/test-standings.mjs builds with post() and tape().
function submission() {
  const progress = { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } };
  const tape = {
    version: 2, id: 'kv2-measure', createdAt: 1, kept: true, contract: 'the-claim', seed: 'gold-rush', difficulty: 'trail', simVersion: 1,
    inputLog: {
      version: 1, name: 'kv2-measure', contractId: 'the-claim', seed: 'gold-rush', difficultyPreset: 'trail', stepSeconds: 1 / 30,
      start: { x: 0, z: 12 }, durationTicks: 1, entries: [], truncated: null, primarySlot: 0, streams: [],
    },
    eventLogHash: 'fnv1a32:1234abcd',
    outcome: { reason: 'secured', secured: true, waves: 10, timeAlive: 120, gold: 40 },
    meta: { buildId: 'abcdef12', engineHash: engineEra.engineHash, era: engineEra.era },
    runStart: { meta: progress, research: { version: 1, progress, taken: [], proposalSalt: 0, pinnedTarget: null } },
  };
  return {
    contractId: 'the-claim', epochId: 'epoch-1-frontier',
    score: { secured: true, waves: 10, timeAlive: 120, gold: 40, baseValue: 60 },
    profileName: 'Kv Measure', anonId: 'e'.repeat(32), difficulty: 'trail', seed: 'gold-rush', seedMode: 'live',
    seedHash: 'a'.repeat(64), inputLogHash: sha256(JSON.stringify(tape.inputLog)), tape,
  };
}

const STANDINGS_CALLS = [
  ['POST /api/standings, no body (the ops-evening probe)', 'onRequest', 'POST', '/api/standings', undefined],
  ['POST /api/standings, an accepted submission', 'onRequest', 'POST', '/api/standings', submission],
  ['POST /api/standings, a refused submission (unsecured)', 'onRequest', 'POST', '/api/standings', () => ({ ...submission(), score: { ...submission().score, secured: false } })],
  ['GET /api/standings (a board)', 'onRequest', 'GET', '/api/standings?contract=the-claim&epoch=epoch-1-frontier', undefined],
  ['GET /api/standings/assay-queue (assayer key)', 'onRequestAssayQueue', 'GET', '/api/standings/assay-queue?limit=5', undefined],
];
const ASSAY_KEY = 'kv2-measure-assay-key'; // a fixture value, not a credential

async function measureStandings(standings, bound) {
  const rows = [];
  for (const [name, handler, method, url, body] of STANDINGS_CALLS) {
    atMinute(0);
    const kv = countingKv();
    const payload = typeof body === 'function' ? body() : body;
    const headers = new Headers({ 'CF-Connecting-IP': '198.51.100.9', ...(payload === undefined ? {} : { 'content-type': 'application/json' }) });
    if (handler === 'onRequestAssayQueue') headers.set('x-assay-key', ASSAY_KEY);
    const response = await standings[handler]({
      request: new Request(`${PAGES_ORIGIN}${url}`, { method, headers, body: payload === undefined ? undefined : JSON.stringify(payload) }),
      env: { TELEMETRY: kv, ASSAY_WORKER_SECRET: ASSAY_KEY, ...(bound ? { STANDINGS_CANONICAL_ORIGIN: CANONICAL_ORIGIN } : {}) },
    });
    rows.push({ call: name, status: response.status, location: response.headers.get('location'), kvCalls: tally(kv.calls) });
  }
  return rows;
}

// --- the run ------------------------------------------------------------------------------------------

async function measureRevision(label, revision) {
  const doors = await loadDoors(revision);
  const coopSource = revision ? git('show', `${revision}:functions/api/_multiplayer.ts`) : readFileSync(path.join(ROOT, 'functions/api/_multiplayer.ts'), 'utf8');
  Date.now = () => now;
  try {
    return {
      label,
      revision: revision ?? 'working tree',
      coopFallback: await measureCoop(doors.coop, coopSource),
      standingsPages: {
        unbound: await measureStandings(doors.standings, false),
        bound: await measureStandings(doors.standings, true),
      },
    };
  } finally {
    Date.now = realNow;
  }
}

async function main() {
  const differing = assertOnlyTheDoorsDiffer();
  const result = {
    instrument: 'artifacts/kv-counters-to-ledger-2/measure-kv-writes.mjs',
    base: `${base} (${git('rev-parse', '--short=9', base).trim()})`,
    tree: `${git('rev-parse', '--short=9', 'HEAD').trim()} plus working-tree changes`,
    doorsThatDiffer: differing,
    before: await measureRevision('before (base)', base),
    after: await measureRevision('after (this tree)', null),
  };
  const text = `${JSON.stringify(result, null, 2)}\n`;
  if (out) writeFileSync(out, text);
  process.stdout.write(text);
}

await main();
