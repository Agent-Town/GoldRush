import { spawn, spawnSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

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
// Long enough to cross a hash exchange (every 30 ticks) so the bounded arm still has a
// determinism hash to report, short enough to cost the gate ~1.5s.
const BOUNDED_TICKS = 60;
const SCOUT_TICKS = 120;
const TWO_SCOUT_TICKS = 900;
const AGENT_RIDER_TICKS = 300;

const checks = [];
const measured = {};

await main();

async function main() {
  await mkdir(ARTIFACT_DIR, { recursive: true });
  await rm(STATE_ROOT, { recursive: true, force: true });
  const browserEnv = await startBrowserEnv();
  try {
    await checkScoutRide(browserEnv);
    await checkTwoScoutRoom(browserEnv);
    await checkBrowserAgentOrders(browserEnv);
    await checkStrictRefusal(browserEnv);
    await checkSharedRun();
    await checkDesyncResignation();
    await checkBoundedRide();
    await writeSummary('passed');
    console.log(`agent seat checks passed (${checks.length})`);
  } catch (err) {
    await writeSummary('failed', err);
    throw err;
  } finally {
    await browserEnv.stop();
  }
}

async function checkScoutRide(browserEnv) {
  const relay = await startRelayEnv();
  let host;
  try {
    const created = await post(relay.url, '/api/multiplayer/create', {});
    assertEqual(created.status, 200, 'the browser host opens the scout room');
    host = await startBrowserHost(browserEnv, relay.url, created.body.code, 2, 'Browser Host');
    const seat = startSeat(relay.url, created.body.code, { name: 'Rig Scout', policy: 'idle', maxTicks: SCOUT_TICKS });
    const result = await seat.finished;
    const state = await host.page.evaluate(() => window.__GR_MP__?.state());
    measured.scout = { seat: summary(result), browser: browserSummary(state) };

    assertEqual(result.exitCode, 0, 'the invited scout rides cleanly');
    assertEqual(result.envelope.advisory, true, 'the invited seat declares its result advisory');
    assert(result.turns.length > 0 && result.turns.every((turn) => turn.advisory === true), 'every scout turn declares itself advisory');
    assert(result.envelope.roster.some((name) => name.includes('Rig Scout (scout)')), 'the roster declares the scout');
    assert(result.envelope.lastHash === null, 'the scout sends no determinism hashes');
    assert(state.tick >= 90, `the browser and scout rode at least 90 ticks (${state.tick})`);
    assertEqual(state.desyncs, 0, 'the browser saw zero scout desyncs');
  } finally {
    await host?.stop();
    await relay.stop();
  }
}

async function checkTwoScoutRoom(browserEnv) {
  const relay = await startRelayEnv();
  let host;
  try {
    const created = await post(relay.url, '/api/multiplayer/create', {});
    assertEqual(created.status, 200, 'the browser host opens the two-scout room');
    host = await startBrowserHost(browserEnv, relay.url, created.body.code, 3, 'Party Host');
    const first = startSeat(relay.url, created.body.code, { name: 'Scout One', policy: 'stdin', maxTicks: TWO_SCOUT_TICKS, party: 3 });
    const second = startSeat(relay.url, created.body.code, { name: 'Scout Two', policy: 'stdin', maxTicks: TWO_SCOUT_TICKS, party: 3 });
    await Promise.all([first.firstView, second.firstView]);
    await panGold(host.page, 25);
    first.write([{ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 0 } }]);
    second.write([{ verb: 'BUILD', what: 'palisade', where: { x: 2.5, z: 10 }, when: { goldGte: 0 } }]);
    await host.page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0) >= 2, undefined, { timeout: 15_000 });
    const [a, b] = await Promise.all([first.finished, second.finished]);
    const state = await host.page.evaluate(() => window.__GR_MP__?.state());
    const palisades = await host.page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0);
    measured.twoScouts = { a: summary(a), b: summary(b), browser: { ...browserSummary(state), palisades } };

    assertEqual(a.envelope.advisory, true, 'the first of two seats declares scout mode');
    assertEqual(b.envelope.advisory, true, 'the second of two seats declares scout mode');
    assert(a.turns.every((turn) => turn.advisory === true) && b.turns.every((turn) => turn.advisory === true), 'both scouts declare every turn advisory');
    assertEqual(palisades, 2, 'both scouts\' build acts landed in the browser world');
    assertEqual(state.desyncs, 0, 'the three-rider browser saw zero desyncs');
    assertEqual(host.errors.consoleErrors.length, 0, 'the two-scout browser logged zero console errors');
    assertEqual(host.errors.pageErrors.length, 0, 'the two-scout browser logged zero page errors');
  } finally {
    await host?.stop();
    await relay.stop();
  }
}

async function checkBrowserAgentOrders(browserEnv) {
  const relay = await startRelayEnv();
  let left;
  let right;
  let agent;
  try {
    const created = await post(relay.url, '/api/multiplayer/create', {});
    assertEqual(created.status, 200, 'the browser pair opens an agent-rider room');
    left = await startBrowserHost(browserEnv, relay.url, created.body.code, 3, 'Browser Left');
    right = await startBrowserHost(browserEnv, relay.url, created.body.code, 3, 'Browser Right');
    const setup = await left.page.evaluate(() => window.__GR_MP__?.state().setup);
    agent = await startHeadlessOrderClient(browserEnv, relay.url, created.body.code, setup);
    await Promise.all([left, right].map(({ page }) => page.waitForFunction(
      () => window.__GR_MP__?.state()?.roster.length === 3 && window.__THREE_GAME_DIAGNOSTICS__?.agent.riders?.length === 1,
      undefined,
      { timeout: 30_000 },
    )));

    await panGold(left.page, 25);
    const before = await riderState(left.page);
    const submittedTick = before.tick;
    await agent.send([
      { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 0 } },
      { verb: 'MOVE_TO', pos: { x: 8, z: 8 } },
    ], 'browser-order-arm-1');
    await Promise.all([left, right].map(({ page }) => page.waitForFunction(
      ({ tick }) => {
        const game = window.__THREE_GAME_DIAGNOSTICS__;
        return (game?.mp?.tick ?? 0) >= tick + 300 && (game?.build.palisades ?? 0) >= 1;
      },
      { tick: submittedTick },
      { timeout: 30_000 },
    )));

    const [a, b] = await Promise.all([riderState(left.page), riderState(right.page)]);
    const commonTick = Math.max(...a.hashes.map((entry) => entry.tick).filter((tick) => b.hashes.some((entry) => entry.tick === tick)));
    const aHash = a.hashes.find((entry) => entry.tick === commonTick)?.hash;
    const bHash = b.hashes.find((entry) => entry.tick === commonTick)?.hash;
    measured.agentOrders = { ticks: a.tick - submittedTick, commonTick, left: a, right: b };

    assert(a.rider.visible && b.rider.visible, 'the agent rider is a visible hero in both browser worlds');
    assert(Math.hypot(a.rider.position.x - before.rider.position.x, a.rider.position.z - before.rider.position.z) > 1,
      'MOVE_TO changes the agent hero position');
    assertEqual(JSON.stringify(a.rider.position), JSON.stringify(b.rider.position), 'both browsers place the agent hero identically');
    assertEqual(a.palisades, 1, 'the agent rider BUILD lands once in the first browser');
    assertEqual(b.palisades, 1, 'the agent rider BUILD lands once in the second browser');
    assert(a.tick - submittedTick >= AGENT_RIDER_TICKS, `the embodied order channel runs at least ${AGENT_RIDER_TICKS} ticks`);
    assertEqual(a.desyncs, 0, 'the first browser reports zero agent-rider desyncs');
    assertEqual(b.desyncs, 0, 'the second browser reports zero agent-rider desyncs');
    assert(Number.isFinite(commonTick) && commonTick >= submittedTick, 'the browsers produced a shared post-order hash');
    assert(typeof aHash === 'string' && typeof bHash === 'string', 'the shared post-order hashes are present');
    assertEqual(aHash, bHash, `both browsers agree at hash tick ${commonTick}`);
    for (const host of [left, right]) {
      assertEqual(host.errors.consoleErrors.length, 0, 'an agent-rider browser logs zero console errors');
      assertEqual(host.errors.pageErrors.length, 0, 'an agent-rider browser logs zero page errors');
    }
  } finally {
    await agent?.stop();
    await left?.stop();
    await right?.stop();
    await relay.stop();
  }
}

async function checkStrictRefusal(browserEnv) {
  const relay = await startRelayEnv();
  let host;
  try {
    const created = await post(relay.url, '/api/multiplayer/create', {});
    assertEqual(created.status, 200, 'the browser host opens the strict room');
    host = await startBrowserHost(browserEnv, relay.url, created.body.code, 2, 'Strict Host');
    const strict = await runStrictSeat(relay.url, created.body.code);
    measured.strict = strict;
    assert(strict.exitCode !== 0, 'the strict mixed-engine seat refuses the room');
    assert(/full mixed play arrives with MP-07c/.test(strict.stderr), 'the strict refusal names MP-07c');
  } finally {
    await host?.stop();
    await relay.stop();
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

    // THE LOAD-BEARING ASSERTION: two seats, one tick stream, one world. This one holds
    // no matter what the orders do, and it is the claim the slice actually makes.
    assertEqual(
      b.envelope.outcome.eventLogHash,
      a.envelope.outcome.eventLogHash,
      'both seats ended on the same event-log hash',
    );
    assertEqual(JSON.stringify(b.envelope.outcome), JSON.stringify(a.envelope.outcome), 'both seats agree on every outcome field');

    // THE CONTROL ARM, AND ITS PRECONDITION SAID OUT LOUD. "A seated ride equals a solo
    // ride" is only true while no wire act CHANGED the world — which today is guaranteed
    // by F-SEAT-3 (a build costs gold, gold needs HARVEST, HARVEST cannot ride, so every
    // ordered build is refused). Cure that and this assertion SHOULD flip. Asserting the
    // precondition alongside it means the next reader gets told which claim moved instead
    // of finding a mystery red where a proof used to be.
    assertEqual(a.envelope.builds.placed, 0, 'PRECONDITION for the solo comparison: no wire act changed the world');
    assertEqual(
      a.envelope.outcome.eventLogHash,
      solo.eventLogHash,
      'a seated ride that changed nothing reproduces the solo headless run bit for bit',
    );
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

/**
 * A BOUNDED RIDE. `--max-ticks` is documented in skill.md, and skill.md also promises that
 * a seat which stopped early "reports its hash and no outcome — it will not name a verdict
 * it did not earn". A promise in the agents' door with no test behind it is a claim, so
 * this arm is the shortest one that can falsify it.
 */
async function checkBoundedRide() {
  const relay = await startRelayEnv();
  try {
    const created = await post(relay.url, '/api/multiplayer/create', { setup: SETUP });
    assertEqual(created.status, 200, 'the host opens a third room for the bounded arm');
    const code = created.body.code;

    const seats = [
      startSeat(relay.url, code, { name: 'Rig Short A', policy: 'idle', maxTicks: BOUNDED_TICKS }),
      startSeat(relay.url, code, { name: 'Rig Short B', policy: 'idle', maxTicks: BOUNDED_TICKS }),
    ];
    const [a, b] = await Promise.all(seats.map((seat) => seat.finished));
    measured.bounded = { a: summary(a), b: summary(b) };

    for (const [label, seat] of [['the first bounded seat', a], ['the second bounded seat', b]]) {
      assertEqual(seat.exitCode, 0, `${label} stopped cleanly`);
      assertEqual(seat.envelope.ticks, BOUNDED_TICKS, `${label} rode exactly the ticks it was given`);
      assertEqual(JSON.stringify(seat.envelope.resigned), 'null', `${label} did not resign`);
      assert(seat.envelope.outcome === null, `${label} named no verdict it did not earn`);
      assert(seat.envelope.lastHash !== null, `${label} still reports a determinism hash`);
    }
    assertEqual(b.envelope.lastHash.hash, a.envelope.lastHash.hash, 'both bounded seats agreed on the hash they stopped at');
    assertEqual(b.envelope.lastHash.tick, a.envelope.lastHash.tick, 'both bounded seats stopped at the same tick');
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
    advisory: seat.envelope?.advisory,
  };
}

function browserSummary(state) {
  return { tick: state?.tick, desyncs: state?.desyncs, roster: state?.roster };
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

function startSeat(baseUrl, code, { name, policy, desyncAt, maxTicks, party = 2 }) {
  const args = [
    'scripts/gr-sim.mjs',
    '--room', code,
    '--origin', baseUrl,
    '--name', name,
    '--town', 'Calculating House',
    '--party', String(party),
    '--tick-rate', String(TICK_RATE),
    `--policy=${policy}`,
    ...(desyncAt === undefined ? [] : ['--desync-at', String(desyncAt)]),
    ...(maxTicks === undefined ? [] : ['--max-ticks', String(maxTicks)]),
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
      resolve({ exitCode, envelope, stderr, views: lines.length - 1, turns: lines.slice(0, -1).map((line) => JSON.parse(line)) });
    });
  });
  return {
    firstView,
    finished,
    write: (orders) => child.stdin.write(`${JSON.stringify(orders)}\n`),
  };
}

async function runStrictSeat(baseUrl, code) {
  const child = spawn(process.execPath, [
    'scripts/gr-sim.mjs', '--room', code, '--origin', baseUrl, '--name', 'Rig Strict', '--strict', '--policy=idle',
  ], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  const exitCode = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('strict seat did not refuse promptly')); }, 30_000);
    child.once('error', reject);
    child.once('exit', (code) => { clearTimeout(timer); resolve(code); });
  });
  return { exitCode, stdout, stderr };
}

async function startBrowserEnv() {
  const port = await freePort();
  const vite = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { host: '127.0.0.1', port, strictPort: true },
  });
  await vite.listen();
  const browser = await chromium.launch({ channel: 'chromium', headless: true });
  return {
    browser,
    url: `http://127.0.0.1:${port}`,
    async stop() {
      await browser.close();
      await vite.close();
    },
  };
}

async function startBrowserHost(browserEnv, relayBase, code, partySize, name) {
  const context = await browserEnv.browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  const query = new URLSearchParams({
    debug: '',
    contract: CONTRACT,
    seed: SEED,
    tier: 'low',
    mp: 'dev',
    mpCode: code,
    mpRelay: relayBase,
    mpName: name,
    mpTown: 'Browser Camp',
    mpParty: String(partySize),
  });
  await page.goto(`${browserEnv.url}/?${query}`);
  await page.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 30_000 });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  return { page, errors, stop: () => context.close() };
}

async function startHeadlessOrderClient(browserEnv, relayBase, code, setup) {
  const context = await browserEnv.browser.newContext();
  const page = await context.newPage();
  await page.goto(`${browserEnv.url}/skill.md`);
  await page.evaluate(async ({ relayBase, code, setup }) => {
    const { LockstepClient } = await import('/src/mp/LockstepClient.ts');
    const client = new LockstepClient({
      relayBase,
      code,
      player: { name: 'Order Rider', town: 'Calculating House' },
      client: 'headless',
      partySize: 3,
      setup,
      exchangeHashes: () => false,
    });
    const pending = [];
    const sample = () => ({
      mx: 0, my: 0, confirm: false, upgrade: false, rotateBuild: false, weaponToggle: false,
      build: false, cancel: false, buildSlot: null, restart: false, pause: false, pauseTarget: null,
      debugSpawn: false, debugXp: false, queuedActions: pending.splice(0),
    });
    await client.connect();
    window.__AGENT_RIDER_CLIENT__ = client;
    window.__AGENT_RIDER_SEND__ = (orders, submissionId) => pending.push({
      type: 'agent_orders', version: 1, orders, submissionId,
    });
    window.__AGENT_RIDER_TIMER__ = window.setInterval(() => client.pump(sample()), 8);
  }, { relayBase, code, setup });
  await page.waitForFunction(() => {
    const state = window.__AGENT_RIDER_CLIENT__?.state();
    return state?.error || state?.roster.length === 3;
  }, undefined, { timeout: 30_000 });
  const state = await page.evaluate(() => window.__AGENT_RIDER_CLIENT__?.state());
  if (state.error) throw new Error(`headless order client failed to join: ${state.error}`);
  return {
    send: (orders, submissionId) => page.evaluate(
      ({ orders, submissionId }) => window.__AGENT_RIDER_SEND__(orders, submissionId),
      { orders, submissionId },
    ),
    async stop() {
      await page.evaluate(() => {
        window.clearInterval(window.__AGENT_RIDER_TIMER__);
        window.__AGENT_RIDER_CLIENT__?.dispose();
      }).catch(() => undefined);
      await context.close();
    },
  };
}

async function riderState(page) {
  return page.evaluate(() => {
    const game = window.__THREE_GAME_DIAGNOSTICS__;
    const mp = window.__GR_MP__?.state();
    return {
      tick: mp?.tick ?? 0,
      desyncs: mp?.desyncs ?? -1,
      hashes: mp?.hashes ?? [],
      palisades: game?.build.palisades ?? 0,
      rider: game?.agent.riders?.[0] ?? null,
    };
  });
}

async function panGold(page, targetGold) {
  const pressed = new Set();
  const setKeys = async (keys) => {
    const wanted = new Set(keys);
    for (const key of pressed) if (!wanted.has(key)) { await page.keyboard.up(key); pressed.delete(key); }
    for (const key of wanted) if (!pressed.has(key)) { await page.keyboard.down(key); pressed.add(key); }
  };
  const deadline = Date.now() + 25_000;
  try {
    while (Date.now() < deadline) {
      const state = await page.evaluate(() => {
        const game = window.__THREE_GAME_DIAGNOSTICS__;
        const node = game?.harvest.activeNodes.filter((entry) => entry.active)
          .sort((a, b) => Math.hypot(a.position.x - game.player.position.x, a.position.z - game.player.position.z)
            - Math.hypot(b.position.x - game.player.position.x, b.position.z - game.player.position.z))[0];
        return game && node ? { gold: game.economy.gold, player: game.player.position, node: node.position } : null;
      });
      if (!state) { await sleep(100); continue; }
      if (state.gold >= targetGold) return;
      const dx = state.node.x - state.player.x;
      const dz = state.node.z - state.player.z;
      const near = Math.hypot(dx, dz) < 1.2;
      await setKeys(near ? ['Space'] : [
        ...(dx < -0.35 ? ['KeyA'] : dx > 0.35 ? ['KeyD'] : []),
        ...(dz < -0.35 ? ['KeyW'] : dz > 0.35 ? ['KeyS'] : []),
      ]);
      await sleep(100);
    }
    throw new Error(`browser host did not pan ${targetGold} gold`);
  } finally {
    await setKeys([]);
  }
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
