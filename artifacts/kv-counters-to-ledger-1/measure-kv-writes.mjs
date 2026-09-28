#!/usr/bin/env node
// kv-counters-to-ledger-1: re-runnable evidence for the headline number, KV writes per beacon.
//
//   node artifacts/kv-counters-to-ledger-1/measure-kv-writes.mjs --rev 90a26053c   # before (the cut)
//   node artifacts/kv-counters-to-ledger-1/measure-kv-writes.mjs                   # after (this tree)
//
// It materialises the telemetry and multiplayer doors of the named revision (or the working tree)
// into a temporary directory, loads them the way the Pages runtime would (vite SSR transform of the
// TypeScript), and drives them with a KV stand-in that COUNTS every put and delete: a KV write is
// what the free tier meters (1,000 a day, shared by every door on the namespace). Nothing here
// talks to Cloudflare, the droplet or any network other than a ledger it starts on 127.0.0.1.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILES = [
  'functions/api/telemetry.ts',
  'functions/api/_ratelimit.ts',
  'functions/api/_ledger.ts',
  'functions/api/_compare.ts',
  'functions/api/_multiplayer.ts',
  'src/agent/DeclaredStack.ts',
];
// A fixture value, not a credential: it exists only inside this process and the ledger it starts.
const FIXTURE_SECRET = 'measure-kv-writes-fixture-secret-0000000000';

const args = process.argv.slice(2);
const revIndex = args.indexOf('--rev');
const rev = revIndex === -1 ? null : args[revIndex + 1];
const outIndex = args.indexOf('--out');
const out = outIndex === -1 ? null : path.resolve(args[outIndex + 1]);

function materialise(directory, revision) {
  const present = [];
  for (const file of FILES) {
    let source;
    try {
      source = revision
        ? execFileSync('git', ['show', `${revision}:${file}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
        : execFileSync('cat', [path.join(ROOT, file)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      continue; // absent at this revision (the ledger client did not exist before this task)
    }
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    writeFileSync(path.join(directory, file), source);
    present.push(file);
  }
  return present;
}

function countingKv({ failWrites = false } = {}) {
  const values = new Map();
  const writes = [];
  let reads = 0;
  return {
    writes,
    get reads() { return reads; },
    async get(key) {
      reads += 1;
      const entry = values.get(key);
      if (!entry) return null;
      if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) { values.delete(key); return null; }
      return entry.value;
    },
    async put(key, value, options) {
      if (failWrites) throw new Error('KV PUT failed: 429 Too Many Requests (daily write limit)');
      writes.push(key);
      values.set(key, { value, expiresAt: options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : null });
    },
    async delete(key) {
      if (failWrites) throw new Error('KV DELETE failed: 429 Too Many Requests (daily write limit)');
      writes.push(`delete ${key}`);
      values.delete(key);
    },
    async list({ prefix = '' } = {}) {
      return { keys: [...values.keys()].filter((key) => key.startsWith(prefix)).sort().map((name) => ({ name })), list_complete: true };
    },
  };
}

function beacon(overrides = {}) {
  return {
    contract: 'e1-dry-gulch', stage: 'end', waves: 12, secureWave: 0, deepestWave: 12, duration: 312_345, upgradesTaken: 5,
    tier: 'BALANCED', frameP95: 21.7, deviceClass: 'desktop', buildHash: 'abcdef12', nonce: 'a'.repeat(32), ...overrides,
  };
}

function demotion(overrides = {}) {
  return { event: 'render_demotion', reason: 'webgl-context-lost', contractId: 'the-claim', buildId: 'abcdef12', tier: 'LITE', dataset: { terrain3dPilotState: 'ready' }, ...overrides };
}

// Each scenario is a sequence of beacons into ONE store; the number reported is the writes the LAST
// beacon of the sequence cost, i.e. the marginal cost in the named state.
const SCENARIOS = [
  ['first run beacon ever (end, unsecured)', [beacon()]],
  ['next distinct run within the minute (end, unsecured)', [beacon(), beacon({ duration: 401_000 })]],
  ['secure beacon', [beacon(), beacon({ stage: 'secure', waves: 8, secureWave: 8, deepestWave: 8, duration: 200_000 })]],
  ['end beacon after a secure', [beacon(), beacon({ stage: 'end', waves: 14, secureWave: 8, deepestWave: 14, duration: 500_000 })]],
  ['legacy client, secured, deepest wave record (the worst case)', [beacon({ stage: undefined, secureWave: 9, deepestWave: 40, waves: 40, duration: 900_000 })]],
  ['same run replayed with the SAME nonce', [beacon(), beacon()]],
  ['same run replayed with a FRESH nonce (the flood shape)', [beacon(), beacon({ nonce: 'b'.repeat(32) })]],
  ['render demotion, first', [demotion()]],
  ['render demotion, identical replay', [demotion(), demotion()]],
];

async function measureTelemetry(module, extraEnv, startScenarioLedger = null) {
  const rows = [];
  let ip = 0;
  for (const [name, sequence] of SCENARIOS) {
    const kv = countingKv();
    const ledger = startScenarioLedger ? await startScenarioLedger() : null;
    ip += 1;
    let last = null;
    let before = 0;
    let ledgerBefore = 0;
    try {
      for (const payload of sequence) {
        before = kv.writes.length;
        ledgerBefore = ledger ? ledger.writes() : 0;
        const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
        const response = await module.onRequest({
          env: { TELEMETRY: kv, ...extraEnv(ledger) },
          request: new Request('http://localhost/api/telemetry', {
            method: 'POST',
            headers: { 'content-type': 'application/json', Origin: 'https://agenttown.app', 'CF-Connecting-IP': `203.0.113.${ip}` },
            body: JSON.stringify(body),
          }),
        });
        last = { status: response.status, fallback: response.headers.get('x-ledger-fallback'), body: await response.json() };
      }
      rows.push({
        scenario: name,
        kvWritesThisBeacon: kv.writes.length - before,
        kvKeysWrittenThisBeacon: kv.writes.slice(before),
        ...(ledger ? { ledgerWritesThisBeacon: ledger.writes() - ledgerBefore } : {}),
        response: last,
      });
    } finally {
      await ledger?.stop();
    }
  }
  return rows;
}

async function measureFailedBump(module) {
  const kv = countingKv({ failWrites: true });
  let roomCalls = 0;
  const rooms = { idFromName: (name) => name, get: () => ({ fetch: async () => { roomCalls += 1; return new Response(null, { status: 426 }); } }) };
  try {
    const response = await module.connectRoom({
      env: { MULTIPLAYER_ROOMS: rooms, MULTIPLAYER_RATE_LIMITS: kv },
      request: new Request(`http://localhost/api/multiplayer/connect?code=${'A'.repeat(24)}`, { headers: { Origin: 'https://agenttown.app', 'CF-Connecting-IP': '203.0.113.200' } }),
    });
    return { outcome: 'answered', status: response.status, body: await response.json().catch(() => null), fallback: response.headers.get('x-ledger-fallback'), roomCalls };
  } catch (error) {
    return { outcome: 'threw', error: error instanceof Error ? error.message : String(error), roomCalls };
  }
}

async function startLedger() {
  const { createLedgerServer } = await import(path.join(ROOT, 'server/ledger/serve.mjs'));
  const { SqliteStorage } = await import(path.join(ROOT, 'server/ledger/storage.mjs'));
  const storage = new SqliteStorage(':memory:');
  let writes = 0;
  for (const method of ['put', 'delete', 'increment', 'tally', 'raise']) {
    if (typeof storage[method] !== 'function') continue;
    const original = storage[method].bind(storage);
    storage[method] = async (...call) => { writes += 1; return original(...call); };
  }
  const server = await createLedgerServer({ storage, env: { LEDGER_PROXY_SECRET: FIXTURE_SECRET } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    writes: () => writes,
    async stop() {
      await new Promise((resolve) => server.close(resolve));
      storage.close();
    },
  };
}

async function main() {
  const tree = mkdtempSync(path.join(tmpdir(), 'kv1-measure-'));
  try {
    const present = materialise(tree, rev);
    const vite = await createViteServer({ root: tree, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
    let telemetry;
    let multiplayer;
    try {
      telemetry = await vite.ssrLoadModule('/functions/api/telemetry.ts');
      multiplayer = await vite.ssrLoadModule('/functions/api/_multiplayer.ts');
    } finally {
      await vite.close();
    }
    const result = {
      revision: rev ?? 'working-tree',
      commit: rev ? execFileSync('git', ['rev-parse', '--short=9', rev], { cwd: ROOT, encoding: 'utf8' }).trim() : 'working-tree',
      ledgerClientPresent: present.includes('functions/api/_ledger.ts'),
      telemetry: { unconfigured: await measureTelemetry(telemetry, () => ({})) },
      connectWithFailingKv: await measureFailedBump(multiplayer),
    };
    if (result.ledgerClientPresent) {
      // A fresh ledger per scenario, like the fresh KV, so each row is the marginal cost in that state.
      result.telemetry.ledger = await measureTelemetry(telemetry, (ledger) => ({ LEDGER_ORIGIN: ledger.url, LEDGER_PROXY_SECRET: FIXTURE_SECRET }), startLedger);
      // Port 9 (discard) on the loopback: nothing answers, which is the "bound but unreachable" state.
      result.telemetry.ledgerDown = await measureTelemetry(telemetry, () => ({ LEDGER_ORIGIN: 'http://127.0.0.1:9', LEDGER_PROXY_SECRET: FIXTURE_SECRET }));
    }
    const text = `${JSON.stringify(result, null, 2)}\n`;
    if (out) writeFileSync(out, text);
    process.stdout.write(text);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
}

await main();
