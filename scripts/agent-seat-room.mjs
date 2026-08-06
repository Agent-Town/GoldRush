import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// TWO SEATS, ONE SHARED RUN.
//
// The acceptance question is not "does the socket open" — it is "do two rigs riding one
// room compute the same world?" So this harness stands up the real relay (the same
// wrangler pair scripts/test-multiplayer.mjs uses), sits two headless seats in one room,
// hands ONE of them orders, and then checks three things that can only all be true if the
// transport is honest:
//
//   1. both seats end on the same eventLogHash;
//   2. that hash equals a SOLO headless run of the same contract and seed (a control arm
//      run in this same harness, never a pinned number) — riding in a room must not
//      perturb the sim;
//   3. the seat that was never given an order applied exactly the acts the other seat's
//      orders produced — which is the only way an act can have reached it.

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://localhost:5188';
const SCRIPT_NAME = `gold-rush-seat-room-${process.pid}`;
const STATE_ROOT = path.join(ROOT, `test-results/agent-seat-relay-state-${process.pid}`);
const ARTIFACT_DIR = path.join(ROOT, 'artifacts/agent-seat');
const CONTRACT = 'the-claim';
// The shortest terminal ride in the pinned bench set (73.1 s of sim), so the wall-clock
// throttle costs the gate the least real time it can.
const SEED = 'e1-the-claim-04';
const TICK_RATE = 45;
const SETUP = {
  contractId: CONTRACT,
  seed: SEED,
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
const BUILD_ORDERS = [
  { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 0 } },
  { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 10 }, when: { waveGte: 2 } },
];
const UNSPEAKABLE_ORDERS = [{ verb: 'HARVEST', seam: 'gold-seam-1' }];
// The first hash exchange after tick 0, so the fail-loud arm costs a second, not a ride.
const DESYNC_TICK = 30;

const checks = [];
const measured = {};

await main();

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });
  try {
    await checkSharedRun();
    await checkDesyncResignation();
    await writeSummary('passed');
    console.log(`agent seat checks passed (${checks.length})`);
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  }
}

async function checkSharedRun() {
  // The control arm FIRST: if the solo run has moved, every comparison below is against
  // a number nobody re-derived.
  const solo = soloOutcome();
  measured.solo = solo;
  assert(solo.eventLogHash.startsWith('fnv1a32:'), 'the solo control run produced an event-log hash');

  const relay = await startRelayEnv();
  try {
    const created = await post(relay.url, '/api/multiplayer/create', { setup: SETUP });
    assertEqual(created.status, 200, 'the host opens a room');
    const code = created.body.code;
    assert(/^[A-F0-9]{24}$/.test(code), 'the room code is the 96-bit claim word');

    const rider = startSeat(relay.url, code, { name: 'Rig A', policy: 'stdin' });
    const partner = startSeat(relay.url, code, { name: 'Rig B', policy: 'idle' });

    // A rider answers the VIEW, so the orders wait for it — exactly as a real one would.
    await rider.firstView;
    rider.write(BUILD_ORDERS);
    rider.write(UNSPEAKABLE_ORDERS);

    const [a, b] = await Promise.all([rider.finished, partner.finished]);
    measured.seats = { a: summary(a), b: summary(b) };

    assertEqual(a.exitCode, 0, 'the ordered seat rode to the end');
    assertEqual(b.exitCode, 0, 'the idle seat rode to the end');
    assertEqual(JSON.stringify(a.envelope.resigned), 'null', 'the ordered seat never resigned');
    assertEqual(JSON.stringify(b.envelope.resigned), 'null', 'the idle seat never resigned');

    assertEqual(a.envelope.roster.length, 2, 'the ordered seat saw a table of two');
    assertEqual(b.envelope.roster.length, 2, 'the idle seat saw a table of two');
    assertEqual(a.envelope.roster.join(' + '), b.envelope.roster.join(' + '), 'both seats read the same roster in the same order');

    assert(a.envelope.outcome && b.envelope.outcome, 'both seats reached a real outcome');
    assertEqual(
      b.envelope.outcome.eventLogHash,
      a.envelope.outcome.eventLogHash,
      'both seats ended on the same event-log hash',
    );
    assertEqual(
      a.envelope.outcome.eventLogHash,
      solo.eventLogHash,
      'the shared ride reproduces the solo headless run bit for bit',
    );
    assertEqual(JSON.stringify(b.envelope.outcome), JSON.stringify(a.envelope.outcome), 'both seats agree on every outcome field');
    assertEqual(JSON.stringify(a.envelope.outcome), JSON.stringify(solo), 'the seated outcome equals the solo control outcome');

    // THE TRANSPORT PROOF. Only Rig A was ever handed orders; Rig B's tally can only be
    // non-zero because Rig A's acts crossed the wire and were applied at both seats.
    assertEqual(JSON.stringify(b.envelope.builds), JSON.stringify(a.envelope.builds), 'both seats applied the same acts');
    assertEqual(b.envelope.builds.placed + b.envelope.builds.refused, BUILD_ORDERS.length, 'every ordered act reached the seat that never ordered it');
    assertEqual(JSON.stringify(a.envelope.unhonouredActions), '{}', 'no peer act was left unhonoured');

    // THE THROTTLE. A seat that outran its ceiling would have been rate-limited off the
    // wire, so this number is the law working, not decoration.
    assert(a.envelope.ticksPerSecond <= TICK_RATE + 1, `the ordered seat held its pace (${a.envelope.ticksPerSecond} ticks/s)`);
    assert(b.envelope.ticksPerSecond <= TICK_RATE + 1, `the idle seat held its pace (${b.envelope.ticksPerSecond} ticks/s)`);

    // REJECT, DON'T STRETCH — said out loud, to the rider, in the run's own stderr.
    assert(/cannot ride the lockstep wire yet/.test(a.stderr), 'the unspeakable verb was refused in words the rider can act on');
    assert(!/cannot ride the lockstep wire yet/.test(b.stderr), 'the idle seat was never asked for the impossible');
  } finally {
    await relay.stop();
  }
}

/**
 * THE FAIL-LOUD PATH, EXERCISED. One seat is told to corrupt its own hash at tick 30.
 * A silent zombie rider would keep simulating a world nobody else is in; what must happen
 * instead is that BOTH seats notice, both stop, and both say why — with a non-zero exit
 * code, because a resigned rig that reports success is the failure this test exists for.
 */
async function checkDesyncResignation() {
  const relay = await startRelayEnv();
  try {
    const created = await post(relay.url, '/api/multiplayer/create', { setup: SETUP });
    assertEqual(created.status, 200, 'the host opens a second room for the desync arm');
    const code = created.body.code;

    const liar = startSeat(relay.url, code, { name: 'Rig Liar', policy: 'idle', desyncAt: DESYNC_TICK });
    const honest = startSeat(relay.url, code, { name: 'Rig Honest', policy: 'idle' });
    const [a, b] = await Promise.all([liar.finished, honest.finished]);
    measured.desync = { liar: summary(a), honest: summary(b) };

    for (const [label, seat] of [['the lying seat', a], ['the honest seat', b]]) {
      assertEqual(seat.exitCode, 3, `${label} exits non-zero`);
      assert(seat.envelope.resigned !== null, `${label} resigned rather than rode on`);
      assertEqual(seat.envelope.resigned.reason, 'desync', `${label} named the desync`);
      assert(seat.envelope.outcome === null, `${label} claimed no outcome it did not earn`);
      assert(/gr-sim\.headless\.v1/.test(seat.envelope.resigned.detail), `${label} named the engine it hashed with`);
      assert(/seat resigned at tick/.test(seat.stderr), `${label} said so out loud`);
    }
    assert(a.envelope.resigned.tick <= DESYNC_TICK + 2, `the lie was caught at the tick it was told (${a.envelope.resigned.tick})`);
    assert(b.envelope.resigned.tick <= DESYNC_TICK + 2, `the honest seat caught it just as fast (${b.envelope.resigned.tick})`);
  } finally {
    await relay.stop();
  }
}

function summary(seat) {
  return {
    exitCode: seat.exitCode,
    ticks: seat.envelope?.ticks,
    ticksPerSecond: seat.envelope?.ticksPerSecond,
    wallClockSeconds: seat.envelope?.wallClockSeconds,
    roster: seat.envelope?.roster,
    builds: seat.envelope?.builds,
    unhonouredActions: seat.envelope?.unhonouredActions,
    lastHash: seat.envelope?.lastHash,
    resigned: seat.envelope?.resigned,
    outcome: seat.envelope?.outcome,
  };
}

/** The control arm: the same contract and seed, ridden alone, in this same harness. */
function soloOutcome() {
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 120_000 },
  );
  if (run.status !== 0) throw new Error(`the solo control run failed:\n${run.stderr}`);
  return JSON.parse(run.stdout.trim().split('\n').at(-1));
}

function startSeat(baseUrl, code, { name, policy, desyncAt }) {
  const args = [
    'scripts/gr-sim.mjs',
    '--room', code,
    '--origin', baseUrl,
    '--name', name,
    '--town', 'Calculating House',
    '--tick-rate', String(TICK_RATE),
    `--policy=${policy}`,
    ...(desyncAt === undefined ? [] : ['--desync-at', String(desyncAt)]),
  ];
  const child = spawn(process.execPath, args, { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  let announceFirstView = () => undefined;
  const firstView = new Promise((resolve) => {
    announceFirstView = resolve;
  });
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
    if (stdout.includes('\n')) announceFirstView();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });
  const finished = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`${name} never finished its ride:\n${stderr}`));
    }, 300_000);
    child.once('error', reject);
    child.once('exit', (exitCode) => {
      clearTimeout(timer);
      announceFirstView();
      const lines = stdout.trim().split('\n').filter(Boolean);
      let envelope = null;
      try {
        const last = JSON.parse(lines.at(-1) ?? 'null');
        envelope = last?.schema === 'goldrush.seat.v1' ? last : null;
      } catch {
        envelope = null;
      }
      if (!envelope) {
        reject(new Error(`${name} wrote no seat envelope (exit ${exitCode}):\n${stderr}`));
        return;
      }
      resolve({ exitCode, envelope, stderr, views: lines.length - 1 });
    });
  });
  return {
    firstView,
    finished,
    write: (orders) => child.stdin.write(`${JSON.stringify(orders)}\n`),
  };
}

// ---------------------------------------------------------------------------
// The relay, stood up exactly as scripts/test-multiplayer.mjs stands it up.
// ---------------------------------------------------------------------------

async function startRelayEnv() {
  const worker = await startRoomWorker();
  try {
    const pages = await startPages('seat', SCRIPT_NAME);
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
  const configPath = path.join(STATE_ROOT, 'wrangler-seat-room.jsonc');
  await mkdir(STATE_ROOT, { recursive: true });
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        name: SCRIPT_NAME,
        main: path.relative(STATE_ROOT, path.join(ROOT, 'functions/api/_multiplayer.ts')),
        compatibility_date: '2026-07-08',
        durable_objects: { bindings: [{ name: 'MULTIPLAYER_ROOMS', class_name: 'MultiplayerRoom' }] },
        migrations: [{ tag: 'mp-01', new_sqlite_classes: ['MultiplayerRoom'] }],
      },
      null,
      2,
    )}\n`,
  );
  const child = spawnWrangler(
    ['dev', '--config', configPath, '--port', String(port), '--ip', '127.0.0.1', '--persist-to', persistPath,
      '--log-level', 'error', '--show-interactive-dev-session=false'],
    'room worker',
  );
  await waitForServer(`http://127.0.0.1:${port}`, child);
  return child;
}

async function startPages(name, doScriptName) {
  const port = await freePort();
  const persistPath = path.join(STATE_ROOT, `pages-${name}`);
  const child = spawnWrangler(
    ['pages', 'dev', 'public', '--port', String(port), '--ip', '127.0.0.1', '--persist-to', persistPath,
      '--log-level', 'error', '--show-interactive-dev-session=false',
      '--do', `MULTIPLAYER_ROOMS=MultiplayerRoom@${doScriptName}`, '--kv', 'MULTIPLAYER_RATE_LIMITS'],
    `pages ${name}`,
  );
  const url = `http://127.0.0.1:${port}`;
  await waitForServer(url, child, '/api/multiplayer/create');
  return { url, stop: child.stop };
}

function spawnWrangler(args, label) {
  const child = spawn('wrangler', args, { cwd: ROOT, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
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

async function post(baseUrl, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => ({})) };
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
  // GR_GUARD_NO_ARTIFACT (F-1229-1) — same contract as test-multiplayer.mjs / test-accounts.mjs.
  if (process.env.GR_GUARD_NO_ARTIFACT === '1') return;
  await writeFile(
    path.join(ARTIFACT_DIR, 'agent-seat-room.json'),
    `${JSON.stringify({ status, checks, measured, error: err instanceof Error ? err.message : undefined, generatedAt: new Date().toISOString() }, null, 2)}\n`,
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
