import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const SCRIPT_NAME = 'gold-rush-mp-room';
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
const checks = [];

await main();

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });

  try {
    await checkUnconfigured503();
    await checkRelayFlow();
    await checkRateLimits();
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
    assertEqual(response.status, 503, 'create returns 503 without Durable Object binding');
    assertEqual(response.body.message, "riding together isn't saddled yet", '503 message is the saddle copy');
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
    const bob = await connectClient(relay.url, code, 'Bob', 'River Bend');
    await alice.take('roster', (msg) => msg.players.length === 2);
    await bob.take('roster', (msg) => msg.players.length === 2);

    const aliceTicks = collectTicks(alice, 200);
    const bobTicks = collectTicks(bob, 200);
    for (let tick = 0; tick < 200; tick += 1) {
      alice.send({ v: 2, type: 'input', tick, input: { dx: 1, seq: tick } });
      bob.send({ v: 2, type: 'input', tick, input: { dx: -1, seq: tick } });
    }
    const [aliceInputs, bobInputs] = await Promise.all([aliceTicks, bobTicks]);
    assertEqual(JSON.stringify(aliceInputs), JSON.stringify(bobInputs), 'both clients receive identical tick batches');
    for (let tick = 0; tick < 200; tick += 1) {
      assertEqual(aliceInputs[tick].tick, tick, `tick ${tick} delivered in order`);
      assertEqual(aliceInputs[tick].inputs.length, 2, `tick ${tick} includes both players`);
    }

    alice.send({ v: 2, type: 'hash', tick: 200, hash: 'fnv1a32:alice' });
    const hashAtBob = await bob.take('hash', (msg) => msg.from === alice.playerId && msg.hash === 'fnv1a32:alice');
    assertEqual(hashAtBob.tick, 200, 'hash reaches peer');
    bob.send({ v: 2, type: 'hash', tick: 200, hash: 'fnv1a32:bob' });
    await alice.take('hash', (msg) => msg.from === bob.playerId && msg.hash === 'fnv1a32:bob');
    assert(true, 'hash round-trip succeeds');

    const snapshot = { kind: 'run-suspend', v: 1, wave: 6, gold: 123 };
    alice.send({ v: 2, type: 'snapshot-push', tick: 200, snapshot });
    await bob.take('snapshot-available', (msg) => msg.from === alice.playerId && msg.tick === 200);
    bob.send({ v: 2, type: 'snapshot-request' });
    const pulled = await bob.take('snapshot', (msg) => msg.tick === 200);
    assertEqual(JSON.stringify(pulled.snapshot), JSON.stringify(snapshot), 'active peer pulls latest snapshot');

    bob.close();
    await alice.take('roster', (msg) => msg.players.length === 1);
    const rejected = await rejectedJoin(relay.url, code, 'Bob', 'River Bend');
    assertEqual(rejected.error, 'ride_started', 'late rejoin is rejected before roster mutation');

    alice.close();
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
  const args = [
    'pages',
    'dev',
    'public',
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
  if (doScriptName) args.push('--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${doScriptName}`, '--kv', 'MULTIPLAYER_RATE_LIMITS');
  const child = spawnWrangler(args, `pages ${name}`);
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, child, '/api/multiplayer/create');
  return { url, stop: child.stop };
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
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function get(baseUrl, route, origin = ORIGIN, extraHeaders = {}) {
  const response = await fetch(`${baseUrl}${route}`, { headers: { Origin: origin, ...extraHeaders } });
  return { status: response.status, body: await response.json().catch(() => ({})) };
}

async function connectClient(baseUrl, code, name, town) {
  const url = `${baseUrl.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${code}`;
  const socket = new WebSocket(url);
  const queue = [];
  const waiters = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const waiterIndex = waiters.findIndex((waiter) => waiter.matches(message));
    if (waiterIndex >= 0) {
      const [waiter] = waiters.splice(waiterIndex, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(message);
    } else {
      queue.push(message);
    }
  });
  socket.addEventListener('error', () => {
    for (const waiter of waiters.splice(0)) waiter.reject(new Error('websocket error'));
  });
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  const client = {
    socket,
    playerId: '',
    send(value) {
      socket.send(JSON.stringify(value));
    },
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
    close() {
      socket.close();
    },
  };
  client.send({ v: 2, type: 'join', code, player: { name, town }, setup: SETUP });
  const joined = await client.take('joined');
  client.playerId = joined.playerId;
  return client;
}

async function rejectedJoin(baseUrl, code, name, town, setup = SETUP) {
  const url = `${baseUrl.replace(/^http/, 'ws')}/api/multiplayer/connect?code=${code}`;
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.send(JSON.stringify({ v: 2, type: 'join', code, player: { name, town }, setup }));
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

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
  checks.push(label);
}

async function writeSummary(status, err) {
  await writeFile(
    path.join(ARTIFACT_DIR, 'test-multiplayer.json'),
    `${JSON.stringify(
      {
        status,
        checks,
        error: err instanceof Error ? err.message : undefined,
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
