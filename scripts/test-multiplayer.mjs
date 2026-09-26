import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { assertWranglerVersion } from './wrangler-binary.mjs';
import { createLedgerServer } from '../server/ledger/serve.mjs';
import { SqliteStorage } from '../server/ledger/storage.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const SCRIPT_NAME = 'gold-rush-mp-room';
const VERSION = 3;
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/multiplayer-relay');
const STATE_ROOT = path.join(ROOT, 'test-results/multiplayer-relay-state');
const SETUP = {
  contractId: 'the-claim',
  seed: 'multiplayer-relay-test',
  difficultyPreset: 'trail',
  meta: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
  research: {
    version: 1,
    progress: { version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 0 } },
    taken: [],
    proposalSalt: 0,
    pinnedTarget: null,
  },
};
// kv-counters-to-ledger-1: a fixture value, not a credential; it exists only in this process and the
// ledger it starts on 127.0.0.1. Declared up here because main() runs at module top level.
const LEDGER_SECRET = 'kv-counters-to-ledger-fixture-secret-0000';
const RATE_LIMIT_MESSAGE = 'The wire is busy. Try again later.';
const checks = [];
let wranglerVersion = 'unknown';

await main();

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });

  try {
    wranglerVersion = assertWranglerVersion('test:mp');
    await checkUnconfigured503();
    await checkRelayFlow();
    await checkRateLimits();
    await checkLimiterThroughLedger();
    await writeSummary('passed');
    console.log(`multiplayer relay checks passed (${checks.length})`);
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  }
}

async function checkUnconfigured503() {
  const server = await startPages('unconfigured');
  try {
    const response = await post(server.url, '/api/multiplayer/create', {});
    assertEqual(response.status, 503, 'create returns 503 without Durable Object binding', response);
    assertEqual(response.body.message, "riding together isn't saddled yet", '503 message is the saddle copy', response);
  } finally {
    await server.stop();
  }
}

async function checkRelayFlow() {
  const relay = await startRelayEnv();
  try {
    const badCors = await post(relay.url, '/api/multiplayer/create', {}, 'https://evil.example');
    assertEqual(badCors.status, 403, 'bad CORS origin rejected');

    const created = await post(relay.url, '/api/multiplayer/create', { setup: SETUP });
    assertEqual(created.status, 200, 'room create succeeds');
    assert(/^[A-F0-9]{24}$/.test(created.body.code), 'room code is 96-bit hex');
    const code = created.body.code;

    const alice = await connectClient(relay.url, code, 'Alice', 'Dawn Claim');
    const inspected = await get(relay.url, `/api/multiplayer/inspect?code=${code}`);
    assertEqual(inspected.status, 200, 'room inspect succeeds without joining roster');
    assertEqual(JSON.stringify(inspected.body.setup), JSON.stringify(SETUP), 'room inspect returns canonical setup');
    const mismatch = await rejectedJoin(relay.url, code, 'Mallory', 'Wrong Claim', {
      ...SETUP,
      difficultyPreset: 'greenhorn',
    });
    assertEqual(mismatch.error, 'setup_mismatch', 'setup mismatch is rejected before roster mutation');
    const badStack = await rejectedJoin(relay.url, code, 'Mallory', 'Wrong Claim', SETUP, { stack: { model: 'x'.repeat(257) } });
    assertEqual(badStack.error, 'bad_stack', 'an invalid declared stack is rejected at room admission');
    const versionlessHarness = await rejectedJoin(relay.url, code, 'Mallory', 'Wrong Claim', SETUP, { stack: { harness: 'pi' } });
    assertEqual(versionlessHarness.error, 'bad_stack', 'a harness declaration names its version at room admission');
    const stack = { model: 'deepseek/deepseek-v4-flash', harness: 'pi', harnessVersion: '0.84.1' };
    const bob = await connectClient(relay.url, code, 'Bob', 'River Bend', 'headless', stack);
    await alice.take('roster', (msg) => msg.players.length === 2);
    const mixedRoster = await bob.take('roster', (msg) => msg.players.length === 2);
    assertEqual(JSON.stringify(mixedRoster.players[1].stack), JSON.stringify(stack), 'mixed room carries the agent declared stack');

    const aliceTicks = collectTicks(alice, 200);
    const bobTicks = collectTicks(bob, 200);
    for (let tick = 0; tick < 200; tick += 1) {
      alice.send({ v: VERSION, type: 'input', tick, input: { dx: 1, seq: tick } });
      bob.send({ v: VERSION, type: 'input', tick, input: { dx: -1, seq: tick } });
    }
    const [aliceInputs, bobInputs] = await Promise.all([aliceTicks, bobTicks]);
    assertEqual(JSON.stringify(aliceInputs), JSON.stringify(bobInputs), 'both clients receive identical tick batches');
    for (let tick = 0; tick < 200; tick += 1) {
      assertEqual(aliceInputs[tick].tick, tick, `tick ${tick} delivered in order`);
      assertEqual(aliceInputs[tick].inputs.length, 2, `tick ${tick} includes both players`);
    }

    alice.send({ v: VERSION, type: 'hash', tick: 200, hash: 'fnv1a32:alice' });
    const hashAtBob = await bob.take('hash', (msg) => msg.from === alice.playerId && msg.hash === 'fnv1a32:alice');
    assertEqual(hashAtBob.tick, 200, 'hash reaches peer');
    bob.send({ v: VERSION, type: 'hash', tick: 200, hash: 'fnv1a32:bob' });
    await alice.take('hash', (msg) => msg.from === bob.playerId && msg.hash === 'fnv1a32:bob');
    assert(true, 'hash round-trip succeeds');

    const snapshot = { kind: 'run-suspend', v: 1, wave: 6, gold: 123 };
    alice.send({ v: VERSION, type: 'snapshot-push', tick: 199, snapshot });
    await bob.take('snapshot-available', (msg) => msg.from === alice.playerId && msg.tick === 199);
    bob.send({ v: VERSION, type: 'snapshot-request' });
    const pulled = await bob.take('snapshot', (msg) => msg.tick === 199);
    assertEqual(JSON.stringify(pulled.snapshot), JSON.stringify(snapshot), 'active peer pulls latest snapshot');

    bob.send({ v: VERSION, type: 'input', tick: 200, input: { seq: 'stale' } });
    bob.send({ v: VERSION, type: 'ping' });
    await bob.take('pong');
    bob.close();
    await alice.take('player-held', (msg) => msg.playerId === bob.playerId);
    const returnedBob = await rejoinClient(relay.url, code, bob.reconnectToken);
    assertEqual(returnedBob.playerId, bob.playerId, 'rejoin keeps the held player id');
    alice.send({ v: VERSION, type: 'input', tick: 200, input: { seq: 'alice-fresh' } });
    returnedBob.send({ v: VERSION, type: 'input', tick: 200, input: { seq: 'bob-fresh' } });
    const resumed = await alice.take('tick-inputs', (msg) => msg.tick === 200);
    assertEqual(resumed.inputs.find((entry) => entry.playerId === bob.playerId)?.input?.seq, 'bob-fresh', 'fresh rejoin input owns the resumed tick');
    const rejected = await rejectedJoin(relay.url, code, 'Bob', 'River Bend');
    assertEqual(rejected.error, 'ride_started', 'late rejoin is rejected before roster mutation');

    returnedBob.close();
    alice.close();

    const benchmarkRoom = await post(relay.url, '/api/multiplayer/create', { setup: SETUP });
    const benchA = await connectClient(relay.url, benchmarkRoom.body.code, 'Rig A', 'Calculating House', 'headless');
    const benchB = await connectClient(relay.url, benchmarkRoom.body.code, 'Rig B', 'Calculating House', 'headless');
    await benchA.take('roster', (msg) => msg.players.length === 2);
    const benchmarkRoster = await benchB.take('roster', (msg) => msg.players.length === 2);
    assertEqual(JSON.stringify(benchmarkRoster.players), JSON.stringify([
      { playerId: 'p1', name: 'Rig A', town: 'Calculating House', client: 'headless' },
      { playerId: 'p2', name: 'Rig B', town: 'Calculating House', client: 'headless' },
    ]), 'agents-only benchmark roster is byte-unchanged');
    benchB.close();
    benchA.close();
  } finally {
    await relay.stop();
  }
}

async function checkRateLimits() {
  const relay = await startRelayEnv();
  try {
    const createIp = { 'CF-Connecting-IP': '203.0.113.55' };
    let created = null;
    for (let index = 0; index < 11; index += 1) {
      const response = await post(relay.url, '/api/multiplayer/create', {}, ORIGIN, createIp);
      if (response.status === 429) {
        created = response;
        break;
      }
      assertEqual(response.status, 200, `room create ${index + 1} before limit succeeds`);
    }
    assert(created, 'create rate limit trips');
    assertEqual(created.body.error, 'rate_limited', 'create rate limit error code');
    assertEqual(created.body.message, 'The wire is busy. Try again later.', 'create rate limit friendly copy');
    // kv-counters-to-ledger-1: this fixture binds no ledger, so the KV limiter answered, and says so
    // through the real wrangler runtime, not only through the direct-call arm below.
    assertEqual(created.headers.get('x-ledger-fallback'), 'unconfigured', 'an unbound door names the KV fallback in its header');

    const alternateIp = { 'CF-Connecting-IP': '203.0.113.44' };
    const room = await post(relay.url, '/api/multiplayer/create', {}, ORIGIN, alternateIp);
    assertEqual(room.status, 200, 'alternate IP can create room for connect limit check');
    const code = room.body.code;

    const connectIp = { 'CF-Connecting-IP': '203.0.113.66' };
    let connected = null;
    for (let index = 0; index < 31; index += 1) {
      const response = await get(relay.url, `/api/multiplayer/connect?code=${code}`, ORIGIN, connectIp);
      if (response.status === 429) {
        connected = response;
        break;
      }
      assertEqual(response.status, 426, `connect attempt ${index + 1} before limit reaches room`);
    }
    assert(connected, 'connect rate limit trips');
    assertEqual(connected.body.error, 'rate_limited', 'connect rate limit error code');
    assertEqual(connected.body.message, 'The wire is busy. Try again later.', 'connect rate limit friendly copy');
  } finally {
    await relay.stop();
  }
}

async function collectTicks(client, count) {
  const messages = [];
  while (messages.length < count) messages.push(await client.take('tick-inputs'));
  return messages;
}

async function startRelayEnv() {
  const worker = await startRoomWorker();
  try {
    const pages = await startPages('dev', SCRIPT_NAME);
    return {
      url: pages.url,
      async stop() {
        await pages.stop();
        await worker.stop();
      },
    };
  } catch (err) {
    await worker.stop();
    throw err;
  }
}

async function startRoomWorker() {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, 'room-worker');
  const configPath = path.join(STATE_ROOT, 'wrangler-mp-room.jsonc');
  await mkdir(STATE_ROOT, { recursive: true });
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        name: SCRIPT_NAME,
        main: path.relative(STATE_ROOT, path.join(ROOT, 'functions/api/_multiplayer.ts')),
        compatibility_date: '2026-07-08',
        durable_objects: {
          bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }],
        },
        migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
      },
      null,
      2,
    )}\n`,
  );
  const child = spawnWrangler(
    [
      'dev',
      '--config',
      configPath,
      '--port',
      String(port),
      '--ip',
      '127.0.0.1',
      '--persist-to',
      persistPath,
      '--log-level',
      'error',
      '--show-interactive-dev-session=false',
    ],
    'room worker',
  );
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, child);
  return child;
}

async function startPages(name, doScriptName) {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, `pages-${name}`);
  const unconfigured = name === 'unconfigured';
  // Wrangler 4.107 loads the repo's production DO binding for in-repo fixtures.
  const fixtureRoot = unconfigured ? await mkdtemp(path.join(tmpdir(), 'gold-rush-mp-unconfigured-')) : ROOT;
  if (unconfigured) {
    await symlink(path.join(ROOT, 'functions'), path.join(fixtureRoot, 'functions'));
    await writeFile(
      path.join(fixtureRoot, 'wrangler.toml'),
      `name = "gold-rush-unconfigured-test"\npages_build_output_dir = ${JSON.stringify(path.join(ROOT, 'public'))}\ncompatibility_date = "2026-07-08"\n`,
    );
  }
  const args = [
    'pages',
    'dev',
    unconfigured ? path.join(ROOT, 'public') : 'public',
    '--port',
    String(port),
    '--ip',
    '127.0.0.1',
    '--persist-to',
    persistPath,
    '--log-level',
    'error',
    '--show-interactive-dev-session=false',
  ];
  if (unconfigured) args.push('--cwd', fixtureRoot);
  // localhost-cors-2: both arms are a developer's own relay asked from a localhost origin, so both opt into the
  // development switch (functions/api/_cors.ts); the unconfigured arm runs from a temp dir no root .dev.vars reaches.
  args.push('--binding', 'ALLOW_LOCALHOST_ORIGINS=1');
  if (doScriptName) args.push('--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${doScriptName}`, '--kv', 'MULTIPLAYER_RATE_LIMITS');
  const child = spawnWrangler(args, `pages ${name}`);
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, child, '/api/multiplayer/create');
  return {
    url,
    async stop() {
      await child.stop();
      if (unconfigured) await rm(fixtureRoot, { recursive: true, force: true });
    },
  };
}

function spawnWrangler(args, label) {
  const child = spawn('wrangler', args, {
    cwd: ROOT,
    env: cleanEnv(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  return {
    get exitCode() {
      return child.exitCode;
    },
    logs: () => output,
    label,
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 2_000);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

function cleanEnv() {
  const env = { ...process.env };
  delete env.RESEND_API_KEY;
  delete env.AUTH_CODE_PEPPER;
  return env;
}

async function waitForServer(url, child, route = '/') {
  const started = Date.now();
  while (Date.now() - started < 25_000) {
    if (child.exitCode !== null) throw new Error(`${child.label} exited early:\n${child.logs()}`);
    try {
      const response = await fetch(`${url}${route}`, {
        method: route === '/' ? 'GET' : 'OPTIONS',
        headers: { Origin: ORIGIN },
      });
      if (response.status < 500 || response.status === 503) return;
    } catch {
      // server still starting
    }
    await sleep(250);
  }
  throw new Error(`${child.label} did not become ready:\n${child.logs()}`);
}

async function post(baseUrl, route, body, origin = ORIGIN, extraHeaders = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: origin, ...extraHeaders },
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

async function get(baseUrl, route, origin = ORIGIN, extraHeaders = {}) {
  const response = await fetch(`${baseUrl}${route}`, { headers: { Origin: origin, ...extraHeaders } });
  return readResponse(response);
}

async function readResponse(response) {
  const rawBody = await response.text();
  try {
    return { status: response.status, headers: response.headers, body: JSON.parse(rawBody), rawBody };
  } catch {
    return { status: response.status, headers: response.headers, body: {}, rawBody };
  }
}

// --- kv-counters-to-ledger-1 scope 2: the co-op limiter rides the ledger, and never throws ----------
// The three doors are called DIRECTLY (a Durable Object stub stands in for the room) so the KV binding
// can be made to FAIL the way the free tier fails when the day's 1,000 writes are spent: the put
// rejects. Before this task the connect door let that rejection escape as a thrown error
// (artifacts/kv-counters-to-ledger-1/writes-before.json, "connectWithFailingKv": "threw").
async function checkLimiterThroughLedger() {
  const vite = await createViteServer({ root: ROOT, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  let doors;
  try {
    doors = await vite.ssrLoadModule('/functions/api/_multiplayer.ts');
  } finally {
    await vite.close();
  }
  const storage = new SqliteStorage(':memory:');
  const server = await createLedgerServer({ storage, env: { LEDGER_PROXY_SECRET: LEDGER_SECRET } });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const bound = { LEDGER_ORIGIN: `http://127.0.0.1:${server.address().port}`, LEDGER_PROXY_SECRET: LEDGER_SECRET };
  const down = { LEDGER_ORIGIN: 'http://127.0.0.1:9', LEDGER_PROXY_SECRET: LEDGER_SECRET };
  const code = 'A'.repeat(24);
  try {
    // 1. A bump that fails refuses, on every door, with the rate limit's own status and words.
    for (const [door, call] of [['connect', doors.connectRoom], ['inspect', doors.inspectRoom], ['create', doors.createRoom]]) {
      const rooms = roomStub();
      const answer = await callRoomDoor(call, door, code, { MULTIPLAYER_ROOMS: rooms, MULTIPLAYER_RATE_LIMITS: failingKv() }, '192.0.2.10');
      assertEqual(answer.threw, undefined, `${door}: a failed bump is not a thrown error`);
      assertEqual(answer.status, 429, `${door}: a failed bump refuses`);
      assertEqual(answer.body.error, 'rate_limited', `${door}: with the rate limit's code`);
      assertEqual(answer.body.message, RATE_LIMIT_MESSAGE, `${door}: and the rate limit's words`);
      assertEqual(answer.fallback, 'unconfigured', `${door}: naming the KV fallback that failed`);
      assertEqual(rooms.calls, 0, `${door}: the room is never reached on a refused count`);
    }

    // 2. Bound: the ledger counts, a failing KV is never touched, and the window is the ledger's.
    const connectLimit = await sourceConstant('MAX_CONNECT_REQUESTS_PER_IP');
    const rooms = roomStub();
    const kv = failingKv();
    let refusedAt = null;
    for (let attempt = 1; attempt <= connectLimit + 1; attempt += 1) {
      const answer = await callRoomDoor(doors.connectRoom, 'connect', code, { MULTIPLAYER_ROOMS: rooms, MULTIPLAYER_RATE_LIMITS: kv, ...bound }, '192.0.2.20');
      if (answer.status === 429) {
        refusedAt = { attempt, answer };
        break;
      }
      assertEqual(answer.status, 426, `bound: connect ${attempt} of ${connectLimit} reaches the room`);
    }
    assertEqual(refusedAt?.attempt, connectLimit + 1, `bound: connect ${connectLimit + 1} from one address is refused by the ledger`);
    assertEqual(refusedAt?.answer.fallback, null, 'bound: the refusal came from the ledger, so no fallback header');
    assertEqual(kv.puts, 0, 'bound: the KV namespace is never written');
    assertEqual(rooms.calls, connectLimit, 'bound: exactly the admitted connects reach the room');
    const counted = storage.db.prepare("SELECT value FROM kv WHERE key LIKE 'mp:ratelimit:connect:%'").all();
    assertEqual(counted.length, 1, 'bound: one counter row per address and bucket, in the ledger');
    assertEqual(counted[0].value, String(connectLimit + 1), 'bound: the ledger counted every attempt');

    // 3. Bound but down: the KV fallback answers and says so; and if KV fails too, still a refusal.
    const healthy = healthyKv();
    const fallback = await callRoomDoor(doors.inspectRoom, 'inspect', code, { MULTIPLAYER_ROOMS: roomStub(), MULTIPLAYER_RATE_LIMITS: healthy, ...down }, '192.0.2.30');
    assertEqual(fallback.status, 200, 'down: the KV fallback admits the request');
    assertEqual(fallback.fallback, 'unreachable', 'down: and names the fallback');
    assertEqual(healthy.puts, 1, 'down: the fallback counted in KV');
    const both = await callRoomDoor(doors.connectRoom, 'connect', code, { MULTIPLAYER_ROOMS: roomStub(), MULTIPLAYER_RATE_LIMITS: failingKv(), ...down }, '192.0.2.31');
    assertEqual(both.status, 429, 'down with KV failing too: still a refusal, never a throw');
    assertEqual(both.fallback, 'unreachable', 'down with KV failing too: named');
    const bare = await callRoomDoor(doors.connectRoom, 'connect', code, { MULTIPLAYER_ROOMS: roomStub(), ...down }, '192.0.2.32');
    assertEqual(bare.status, 429, 'down with no KV bound: a failed count refuses');
    const unsaddled = await callRoomDoor(doors.connectRoom, 'connect', code, { MULTIPLAYER_ROOMS: roomStub() }, '192.0.2.33');
    assertEqual(unsaddled.status, 503, 'nothing bound at all: the honest "not saddled yet", as before');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    storage.close();
  }
}

async function callRoomDoor(handler, door, code, env, ip) {
  const url = door === 'create' ? 'http://localhost/api/multiplayer/create' : `http://localhost/api/multiplayer/${door}?code=${code}`;
  const request = new Request(url, {
    method: door === 'create' ? 'POST' : 'GET',
    headers: { Origin: ORIGIN, 'CF-Connecting-IP': ip, ...(door === 'create' ? { 'content-type': 'application/json' } : {}) },
    body: door === 'create' ? JSON.stringify({ setup: SETUP }) : undefined,
  });
  let response;
  try {
    // localhost-cors-2: the request carries the dev page's localhost Origin, so the door sees the development switch.
    response = await handler({ request, env: { ...env, ALLOW_LOCALHOST_ORIGINS: '1' } });
  } catch (error) {
    return { threw: error instanceof Error ? error.message : String(error) };
  }
  return { status: response.status, fallback: response.headers.get('x-ledger-fallback'), body: await response.json().catch(() => ({})) };
}

function roomStub() {
  const stub = {
    calls: 0,
    idFromName: (name) => name,
    get: () => ({
      fetch: async (request) => {
        stub.calls += 1;
        const path = new URL(request.url).pathname;
        if (path.endsWith('/inspect')) return new Response(JSON.stringify({ ok: true, type: 'room-info' }), { status: 200, headers: { 'content-type': 'application/json' } });
        if (path.endsWith('/create')) return new Response(JSON.stringify({ ok: true, type: 'room-created' }), { status: 200, headers: { 'content-type': 'application/json' } });
        return new Response(JSON.stringify({ ok: false, error: 'upgrade_required' }), { status: 426, headers: { 'content-type': 'application/json' } });
      },
    }),
  };
  return stub;
}

// The free tier's answer once the day's writes are spent: the read works, the put rejects.
function failingKv() {
  const kv = {
    puts: 0,
    async get() { return null; },
    async put() {
      kv.puts += 1;
      throw new Error('KV PUT failed: 429 Too Many Requests');
    },
    async list() { return { keys: [], list_complete: true }; },
  };
  return kv;
}

function healthyKv() {
  const values = new Map();
  const kv = {
    puts: 0,
    async get(key) { return values.get(key) ?? null; },
    async put(key, value) {
      kv.puts += 1;
      values.set(key, value);
    },
    async list() { return { keys: [], list_complete: true }; },
  };
  return kv;
}

async function sourceConstant(name) {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(path.join(ROOT, 'functions/api/_multiplayer.ts'), 'utf8');
  const match = new RegExp(String.raw`^const ${name} = ([0-9_]+);`, 'm').exec(source);
  if (!match) throw new Error(`${name} not found in functions/api/_multiplayer.ts`);
  return Number(match[1].replace(/_/g, ''));
}

async function connectClient(baseUrl, code, name, town, clientType = 'browser', stack) {
  const client = await openClientSocket(baseUrl, code);
  client.send({ v: VERSION, type: 'join', code, player: { name, town, ...(stack ? { stack } : {}) }, setup: SETUP, client: clientType });
  const joined = await client.take('joined');
  client.playerId = joined.playerId;
  client.reconnectToken = joined.reconnectToken;
  return client;
}

async function rejoinClient(baseUrl, code, reconnectToken) {
  const client = await openClientSocket(baseUrl, code);
  client.send({ v: VERSION, type: 'rejoin', code, reconnectToken });
  const rejoined = await client.take('rejoined');
  client.playerId = rejoined.playerId;
  client.reconnectToken = rejoined.reconnectToken;
  return client;
}

async function openClientSocket(baseUrl, code) {
  const socket = new WebSocket(`${baseUrl.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${code}`);
  const queue = [];
  const waiters = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const index = waiters.findIndex((waiter) => waiter.matches(message));
    if (index >= 0) {
      const [waiter] = waiters.splice(index, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    } else queue.push(message);
  });
  socket.addEventListener('error', () => {
    for (const waiter of waiters.splice(0)) waiter.reject(new Error('websocket error'));
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  return {
    socket,
    playerId: '',
    reconnectToken: '',
    send: (value) => socket.send(JSON.stringify(value)),
    take(type, predicate = () => true, timeoutMs = 5_000) {
      const index = queue.findIndex((message) => message.type === type && predicate(message));
      if (index >= 0) return Promise.resolve(queue.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        const waiter = {
          matches: (message) => message.type === type && predicate(message),
          resolve,
          reject,
          timer: setTimeout(() => {
            const waiterIndex = waiters.indexOf(waiter);
            if (waiterIndex >= 0) waiters.splice(waiterIndex, 1);
            reject(new Error(`timed out waiting for ${type}`));
          }, timeoutMs),
        };
        waiters.push(waiter);
      });
    },
    close: () => socket.close(),
  };
}

async function rejectedJoin(baseUrl, code, name, town, setup = SETUP, playerExtra = {}) {
  const url = `${baseUrl.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${code}`;
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.send(JSON.stringify({ v: VERSION, type: 'join', code, player: { name, town, ...playerExtra }, setup }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out waiting for rejected join')), 5_000);
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.type !== 'error') return;
      clearTimeout(timer);
      socket.close();
      resolve(message);
    });
  });
}

function assert(value, label) {
  if (!value) throw new Error(label);
  checks.push(label);
}

function assertEqual(actual, expected, label, response) {
  if (actual !== expected) {
    const err = new Error(`${label}: expected ${expected}, got ${actual}`);
    if (response) err.response = response;
    throw err;
  }
  checks.push(label);
}

async function writeSummary(status, err) {
  // GR_GUARD_NO_ARTIFACT (F-1229-1) -- same contract as scripts/test-accounts.mjs.
  // Fixing one of these two siblings and not the other would leave the defect alive
  // in the half nobody re-read; both writers are identical, so both take the flag.
  if (process.env.GR_GUARD_NO_ARTIFACT === '1') return;
  await writeFile(
    path.join(ARTIFACT_DIR, 'test-multiplayer.json'),
    `${JSON.stringify(
      {
        status,
        checks,
        error: err instanceof Error ? err.message : undefined,
        wranglerVersion,
        failureResponse: err?.response
          ? {
              status: err.response.status,
              rawBody: err.response.rawBody.slice(0, 4096),
              truncated: err.response.rawBody.length > 4096,
            }
          : undefined,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    )}\n`,
  );
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('No free port'));
      });
    });
    server.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
