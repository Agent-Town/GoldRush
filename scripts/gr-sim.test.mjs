import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import { installedNodeEngines } from './cross-engine-skip.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// F-2321-1: the engine list lives in cross-engine-skip.mjs, beside the decision it feeds. This file
// deliberately does NOT adopt crossEngineSkipReason's fire-shell arm — that is an owner-priced
// ruling (F-1408-2) scoped to wave-scaling-cross-engine, and extending it here would silently
// delete this test's coverage from every fire. See the F-2321-1 row for the measurement.
const NODE_ENGINES = installedNodeEngines();

test('harness digest pins all three rider-side inputs', async () => {
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { assembleSelfDeclaredStack, computeHarnessDigest, normalizeSelfDeclaredStack } = await vite.ssrLoadModule('/src/agent/DeclaredStack.ts');
    const first = await computeHarnessDigest('charter text', '## generation 7', 'controller-v3');
    assert.equal(await computeHarnessDigest('charter text', '## generation 7', 'controller-v3'), first);
    assert.notEqual(await computeHarnessDigest('charter texu', '## generation 7', 'controller-v3'), first);
    assert.match(first, /^[a-f0-9]{64}$/);
    assert.deepEqual(normalizeSelfDeclaredStack({ harness: 'test-rig', harnessVersion: 'controller-v3', harnessDigest: first, harnessRef: 'abcdef1' }), {
      harness: 'test-rig', harnessVersion: 'controller-v3', harnessDigest: first, harnessRef: 'abcdef1',
    });
    assert.deepEqual(await assembleSelfDeclaredStack({
      model: 'test-model', harness: 'test-rig', harnessVersion: 'controller-v3', harnessRef: 'abcdef1',
      charterText: 'charter text', notebookGenerationHeader: '## generation 7',
    }), {
      model: 'test-model', harness: 'test-rig', harnessVersion: 'controller-v3', harnessRef: 'abcdef1', harnessDigest: first,
    });
  } finally {
    await vite.close();
  }
});

const ORDERS = [
  [{ verb: 'HARVEST', seam: 'gold-seam-1' }],
  [{ verb: 'HARVEST', seam: 'gold-seam-2' }],
  [{ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } }],
  [],
  [],
  ...Array(20).fill(null),
].map(JSON.stringify).join('\n') + '\n';

function scriptedCli(args, ordersFor, captureView = () => false) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/gr-sim.mjs', ...args], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '';
    let stderr = '';
    let fundedAt;
    let outcome;
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        if (message.schema === 'goldrush.view.v1') {
          if (!fundedAt && captureView(message)) fundedAt = message.now;
          child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
        } else outcome = message;
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(stderr));
      else resolve({ ...outcome, ...(fundedAt ? { fundedAt } : {}) });
    });
  });
}

// F-1406-2: these terminal outcome pins are change detectors. A red means the
// sim's behaviour moved; establish why before re-deriving, never paste over it.

test('gr-sim replays the same contract, seed, and orders byte-for-byte', () => {
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
    { cwd: ROOT, encoding: 'utf8', input: ORDERS, timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);

  const lines = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(lines[0].schema, 'goldrush.view.v1');
  assert.deepEqual(Object.keys(lines.at(-1)), ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'defaultedPicks', 'defaultedSecure', 'eventLogHash']);
  // AP-16-2: bench-001 levels once; the first-option pick moves from immediate to the trail
  // deadline, so the outcome gains one default and its terminal hash re-pins.
  assert.deepEqual(lines.at(-1), {
    secured: false,
    waves: 4,
    timeMs: 135667,
    gold: 4,
    kills: 37,
    calls: 5,
    defaultedPicks: 1,
    defaultedSecure: 0,
    eventLogHash: 'fnv1a32:4e33eba1',
  });
  assert.equal(lines.at(-1).calls, 5);
  assert.ok(lines.some((line) => line.schema === 'goldrush.view.v1' && line.now.works.byKind.palisade === 1));
  assert.match(first.stderr, /gr-sim speed: \d+\.\d{2} waves\/s/);

  // The refusal probe must name a contract that is ACTUALLY still refused, and this is the THIRD
  // time that has bitten: it was `e5-deepwater-claim` until the Dredge-Queen socket admitted it
  // on 2026-08-20, then `e5-stillwater` until the noise-hunt admitted THAT on 2026-08-21. Each
  // time the hardcoded id left the assertion testing nothing but its own staleness — which the
  // previous comment predicted in writing and still did not prevent, because a prediction is not
  // a mechanism.
  //
  // SO IT IS NO LONGER HARDCODED. The id is READ from `CONTRACT_ADMISSION_EXEMPTIONS` at run
  // time, so admitting any single contract can never again turn this probe into a tautology; the
  // `assert.ok` below is what fails loudly on the day the table finally empties, which is a real
  // event this suite should announce rather than skip.
  const exemptions = [...readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8')
    .matchAll(/^ {2}'([a-z0-9-]+)': \{$/gm)].map(([, id]) => id);
  assert.ok(exemptions.length > 0, 'no cited exemption remains — this refusal probe needs a new subject');
  const unsupported = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', exemptions[0], '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift, e1-twin-banks, e1-baron/);
});

test('gr-sim resumes at a recorded mid-ride tick as one byte-identical tape', { timeout: 240_000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-tape-resume-'));
  try {
    const straightPath = join(directory, 'straight.json');
    const resumedPath = join(directory, 'resumed.json');
    const positions = {
      sentry_beacon: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }],
      turret: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }],
    };
    const costs = { sentry_beacon: [25, 35, 45, 55, 75, 95], turret: [50, 70, 95, 125] };
    const ordersFor = (view) => {
      if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
      if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
      const orders = [];
      for (const kind of ['sentry_beacon', 'turret']) {
        for (let index = view.now.works.byKind[kind] ?? 0; index < positions[kind].length; index += 1) {
          orders.push({ verb: 'BUILD', what: kind, where: positions[kind][index], when: { goldGte: costs[kind][index] } });
        }
      }
      for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
        for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
      }
      if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
      orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } });
      return orders.slice(0, 32);
    };
    const straight = await scriptedCli(
      ['--contract', 'the-claim', '--seed', 'e1-the-claim-02', '--tape', straightPath],
      ordersFor,
    );
    assert.equal(straight.secured, true);

    const tape = JSON.parse(readFileSync(straightPath, 'utf8'));
    const resumeTick = tape.inputLog.entries[Math.floor(tape.inputLog.entries.length / 2)].t;
    writeFileSync(resumedPath, readFileSync(straightPath));
    const resumed = await scriptedCli(['--resume', resumedPath, '--to-tick', String(resumeTick)], ordersFor);
    assert.equal(resumed.secured, true);
    // RE-POINTED 2026-09-07 (`spec-hygiene-batch`, F-E10S4-3), a COUPLED SURFACE declared rather
    // than an unrelated edit: this test used to read its result back out of `resumedPath` itself,
    // because a bare `--resume` OVERWROTE its input. That hazard is now cured — a bare resume writes
    // the sibling `<stem>.resumed<ext>` — so leaving these four reads on `resumedPath` would have
    // left them comparing the untouched COPY of `straightPath` against `straightPath`: still green,
    // measuring nothing, which is the false green this repo forbids. The output path moves; every
    // assertion below is the SAME assertion it always was, plus the one this cure earns (the input
    // survived). `scripts/gr-sim-resume-tape-safety.test.mjs` guards the rule itself.
    const resumeOutputPath = `${resumedPath.slice(0, -'.json'.length)}.resumed.json`;
    assert.equal(readFileSync(resumedPath, 'utf8'), readFileSync(straightPath, 'utf8'), 'the resume wrote over its own input');
    assert.equal(readFileSync(resumeOutputPath, 'utf8'), readFileSync(straightPath, 'utf8'));
    const resumedTape = JSON.parse(readFileSync(resumeOutputPath, 'utf8'));

    const replay = spawnSync(process.execPath, ['scripts/assay-replay.mjs', resumeOutputPath], {
      cwd: ROOT, encoding: 'utf8', timeout: 60_000,
    });
    assert.equal(replay.status, 0, replay.stderr);
    const assay = JSON.parse(replay.stdout);
    assert.equal(assay.eventLogHash, tape.eventLogHash);

    const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    try {
      const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
      assert.ok(validateTape(resumedTape, tape.contract, tape.seed, tape.difficulty), 'the county door accepts the resumed tape');
      process.stdout.write(`[tape-resume] straight=${tape.eventLogHash} resumed=${resumedTape.eventLogHash} assay=${assay.eventLogHash} door=accepted\n`);
    } finally {
      await vite.close();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('a reactive client can recover from rejected orders', { timeout: 30_000 }, async () => {
  const answer = (view) => {
    if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
    if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
    return [{ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }];
  };
  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath,
      ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=stdin'],
      { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let buffer = '';
    let stderr = '';
    let firstView;
    let outcome;
    let repeatedView = false;
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('gr-sim did not recover from rejected orders within 20 seconds.'));
    }, 20_000);
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        if (message.schema === 'goldrush.view.v1') {
          if (!firstView) {
            firstView = message;
            child.stdin.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id: 'no-such-offer-id' }])}\n`);
          } else {
            repeatedView ||= JSON.stringify(message) === JSON.stringify(firstView);
            child.stdin.write(`${JSON.stringify(answer(message))}\n`);
          }
        } else {
          outcome = message;
        }
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', (status) => {
      clearTimeout(timeout);
      resolve({ status, stderr, repeatedView, outcome });
    });
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.repeatedView, true);
  assert.match(result.stderr, /gr-sim rejected orders: PICK_UPGRADE requires a live offered id/);
  assert.equal(typeof result.outcome.secured, 'boolean');
});

test('headless landmark starts release before enemies can stall at the perimeter', { timeout: 120_000 }, () => {
  // RE-DERIVED 2026-09-04, cause stated (F-1406-2 forbids pasting over a red without one):
  // `tasks/e4-roads-and-convoys.md` composes `MotorSocket` into every Motor contract, and the
  // Motor Frontier's storms now slow OUTLAWS as well as the Hauler
  // (`HeadlessContractSim` hands `motor.enemyMovementMultiplier` to the enemy speed lambda, the
  // composition `731373d4d` shipped in `Game.ts:1749`). An idle ride therefore kills a slightly
  // different number of outlaws in the same number of waves, and its event log hashes differently.
  // Waves are UNCHANGED on all four rows, which is the shape a movement-only change should have.
  // The same four values were re-derived independently into `assets/contracts/null-floors.json`
  // by riding, and the two agree.
  //   was: long-road-01 41 kills 2b27b21d · long-road-02 48 kills 37ab9177
  //        gusher-01    93 kills 95f5777c · gusher-02    29 kills a9b7d153
  const cases = [
    ['e4-long-road', 'e4-long-road-01', -180, 0, 4, 44, 'fnv1a32:a7ffb1c9'],
    ['e4-long-road', 'e4-long-road-02', -180, 0, 4, 50, 'fnv1a32:021ae639'],
    ['e4-gusher-county', 'e4-gusher-county-01', 0, -4, 5, 90, 'fnv1a32:b9638b36'],
    ['e4-gusher-county', 'e4-gusher-county-02', 0, -4, 2, 29, 'fnv1a32:e857081c'],
  ];

  for (const [contract, seed, startX, startZ, waves, kills, eventLogHash] of cases) {
    const run = () => spawnSync(
      process.execPath,
      ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle'],
      { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
    );
    const first = run();
    const second = run();
    assert.equal(first.status, 0, first.stderr);
    assert.equal(second.status, 0, second.stderr);

    const firstLines = first.stdout.trim().split('\n');
    const secondLines = second.stdout.trim().split('\n');
    assert.equal(secondLines.at(-1), firstLines.at(-1));
    const views = firstLines.slice(0, -1).map(JSON.parse);
    const outcome = JSON.parse(firstLines.at(-1));
    assert.deepEqual(
      { waves: outcome.waves, kills: outcome.kills, eventLogHash: outcome.eventLogHash },
      { waves, kills, eventLogHash },
    );
    assert.deepEqual(
      { x: views[0].now.hero.x, z: views[0].now.hero.z },
      { x: startX, z: startZ },
    );
    assert.ok(
      views.slice(0, -1).some(({ now }) => now.hero.x !== startX || now.hero.z !== startZ),
      `${seed} stayed at its landmark-centered start until terminal`,
    );
  }
});

test('a distant HARVEST walks before it pays', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-dry-gulch&seed=harvest-walk');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'harvest-walk' });
    const start = sim.prospector.position;
    const seam = sim.harvestSnapshot.activeNodes
      .filter(({ active }) => active)
      .sort((a, b) => Math.hypot(b.position.x - start.x, b.position.z - start.z)
        - Math.hypot(a.position.x - start.x, a.position.z - start.z))[0];
    assert.ok(Math.hypot(seam.position.x - start.x, seam.position.z - start.z) > Balance.goldSeam.channelRange);
    assert.equal(sim.submitOrders([{ verb: 'HARVEST', seam: seam.id }]).outcome.ok, true);

    sim.advanceOneTick();
    // The old teleport world paid 7 gold on this same order set and fixed one-tick horizon.
    assert.equal(sim.economy.gold, 0);
    assert.equal(sim.currentTurn().view.now.orders[0].status, 'active');
    assert.equal(sim.prospector.snapshot.moving, true);

    for (let ticks = 0; sim.economy.gold === 0 && ticks < 1_000; ticks += 1) sim.advanceOneTick();
    assert.ok(sim.economy.gold > 0);
    assert.ok(Math.hypot(seam.position.x - sim.prospector.position.x, seam.position.z - sim.prospector.position.z)
      <= Balance.goldSeam.channelRange);
    assert.equal(sim.currentTurn().view.now.orders[0].status, 'done');
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('BUILD walks, confirms from the ordering body, and cannot wedge on unreachable terrain', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-dry-gulch&seed=embodied-build');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { StandingOrdersExecutor } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    let placements = 0;
    const placedAt = [];
    const state = () => ({
      timeAlive: 0,
      runState: 'playing',
      hp: 100,
      maxHp: 100,
      enemiesAlive: 0,
      wave: 1,
      nextWaveInSim: 30,
      economy: { gold: 100 },
      wreck: { hitsResolved: 0 },
      build: { hp: [], sluicePositions: [] },
      harvest: { activeNodes: [] },
    });
    const surface = {
      namespace: 'et.goldrush',
      permissionLevel: () => 3,
      capabilities: [],
      buildPlacementRadius: () => 6,
      buildTargetReachable: ({ x, z }) => Math.abs(x) <= 32 && Math.abs(z) <= 32,
      tools: {
        place_building: (def, pos) => {
          placements += 1;
          placedAt.push({ x: Math.round(pos.x), z: Math.round(pos.z) });
          return { tool: 'et.goldrush.place_building', args: { def, pos, rot: 0 }, outcome: { ok: true, economyLog: [] } };
        },
      },
    };
    const executor = new StandingOrdersExecutor(surface, state);
    const remote = [{ verb: 'BUILD', what: 'palisade', where: { x: 10, z: 10 }, when: { goldGte: 0 } }];
    executor.submit(remote, 0);
    for (let tick = 1; tick <= 3; tick += 1) {
      assert.deepEqual(executor.tick(tick, { x: 0, z: 0 }).movement, { x: 10, z: 10 });
    }
    assert.equal(placements, 0, 'a body that never moves cannot place remotely');
    assert.equal(executor.snapshot().orders[0].status, 'active');
    executor.tick(4, { x: 6, z: 10 });
    assert.equal(placements, 1);
    assert.equal(executor.snapshot().orders[0].status, 'done');

    executor.submit([{ verb: 'BUILD', what: 'palisade', where: { x: 32.4, z: 10 }, when: { goldGte: 0 } }], 5);
    executor.tick(5, { x: 26, z: 10 });
    assert.deepEqual(placedAt.at(-1), { x: 32, z: 10 }, 'the executor uses the placement door grid before validating range');

    executor.submit([
      { verb: 'BUILD', what: 'palisade', where: { x: 10, z: 10 }, when: { goldGte: 0 } },
      { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 0 }, when: { goldGte: 0 } },
    ], 6);
    executor.tick(6, { x: 0, z: 0 });
    executor.tick(10, { x: 0, z: 0 });
    assert.equal(executor.snapshot().orders[0].reason, 'UNREACHABLE: BUILD target has no traversable approach.');
    executor.tick(11, { x: 0, z: 0 });
    assert.equal(executor.snapshot().orders[1].status, 'done', 'the order after a route-stalled BUILD still executes');

    executor.submit([
      { verb: 'BUILD', what: 'palisade', where: { x: 99, z: 99 }, when: { goldGte: 0 } },
      { verb: 'BUILD', what: 'palisade', where: { x: 6, z: 10 }, when: { goldGte: 0 } },
    ], 12);
    executor.tick(12, { x: 6, z: 10 });
    assert.deepEqual(executor.snapshot().orders[0], {
      id: 'orders-4-1',
      order: { verb: 'BUILD', what: 'palisade', where: { x: 99, z: 99 }, when: { goldGte: 0 } },
      status: 'failed',
      reason: 'UNREACHABLE: BUILD target is outside buildable terrain.',
    });
    executor.tick(13, { x: 6, z: 10 });
    assert.equal(executor.snapshot().orders[1].status, 'done');
    assert.equal(placements, 4, 'the order after an unreachable BUILD still executes');
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('the gr-sim door walks to a remote BUILD and its tape assay-replays', { timeout: 120_000 }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'gold-rush-embodied-build-'));
  const tapePath = join(directory, 'ride.json');
  const target = { x: 10, z: 10 };
  const views = [];
  try {
    const outcome = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [
        'scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'embodied-build', '--tape', tapePath,
      ], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
      let buffer = '';
      let stderr = '';
      let outcome;
      child.stdout.on('data', (chunk) => {
        buffer += chunk;
        let newline;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newline);
          buffer = buffer.slice(newline + 1);
          if (!line) continue;
          const message = JSON.parse(line);
          if (message.schema !== 'goldrush.view.v1') {
            outcome = message;
            continue;
          }
          views.push(message);
          // F-RPG-14, found by re-planning this fixture (ADR-005 stage 3): the rider must ANSWER
          // the secure window. It never did, so the window refused its ordinary plan over and over
          // (SECURE_CHOICE_ONLY), and F-MCAP-1's cure spends the window's clock ONE REFUSAL AT A
          // TIME while the tape writer records only ACCEPTED submissions. A tape written that way
          // does not replay to its own order-log hash: the refusals that moved the state are not in
          // it. Measured on this tree — without this branch, tape fnv1a32:634bba4f replays to
          // fnv1a32:51f97ebf twice over, with a byte-identical world outcome; with it, tape and
          // replay agree at fnv1a32:93466629. The plan was incomplete, not the door; the finding
          // stands for the drain because any rider that lets the window refuse it writes an
          // unreplayable tape.
          const orders = message.now.pendingSecure
            ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
            : message.now.pendingOffer?.[0]
            ? [{ verb: 'PICK_UPGRADE', id: message.now.pendingOffer[0].id }]
            : message.now.works.byKind.palisade > 0
              ? [{ verb: 'MOVE_HERO', pos: target }]
              : message.now.gold >= 10
                ? [
                    { verb: 'BUILD', what: 'palisade', where: target, when: { goldGte: 10 } },
                    { verb: 'MOVE_HERO', pos: target },
                  ]
                : [{ verb: 'HARVEST', seam: message.now.seams.find(({ active, remaining }) => active && remaining > 0)?.id ?? 'gold-seam-1' }];
          child.stdin.write(`${JSON.stringify(orders)}\n`);
        }
      });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) reject(new Error(stderr));
        else resolve(outcome);
      });
    });
    assert.equal(typeof outcome.secured, 'boolean');
    const departure = views.find(({ now }) => now.gold >= 10 && (now.works.byKind.palisade ?? 0) === 0);
    const arrived = views.find(({ now }) => now.works.byKind.palisade === 1);
    assert.ok(departure, 'the transcript must show the rider before the remote build');
    assert.ok(arrived, 'the remote build must confirm after arrival');
    assert.notDeepEqual(arrived.now.prospector, departure.now.prospector, 'the ordering body must move before placement');
    const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
    assert.ok(
      Math.hypot(arrived.now.prospector.x - target.x, arrived.now.prospector.z - target.z) <= 6.1,
      JSON.stringify({ departure: departure.now, arrived: arrived.now, target, entries: tape.inputLog.entries }),
    );

    const replay = spawnSync(process.execPath, ['scripts/assay-replay.mjs', tapePath], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 120_000,
    });
    assert.equal(replay.status, 0, replay.stderr);
    assert.equal(JSON.parse(replay.stdout).eventLogHash, tape.eventLogHash);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('gr-sim keeps standing orders through free blank and null turns', () => {
  // ADR-005 stage 3: the plan was a single HOLD, whose whole property was that it never
  // completes, so the order sat 'active' for as long as the run kept it. Nothing in the surviving
  // grammar is permanently active — MOVE_HERO completes on arrival, and (12,12) is not even
  // standable on this map (measured: UNREACHABLE_TERRAIN). A BUILD whose gold condition can never
  // be met is the honest replacement for what this test measures: it is RETAINED, tick after tick,
  // across the blank and null turns, and the ID below is the proof that it is the SAME record
  // rather than a re-submitted one.
  const plan = JSON.stringify([{ verb: 'BUILD', what: 'palisade', where: { x: 3, z: 12 }, when: { goldGte: 99999 } }]);
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
    { cwd: ROOT, encoding: 'utf8', input: [plan, '', 'null', ...Array(20).fill('null')].join('\n') + '\n', timeout: 30_000 },
  );
  assert.equal(run.status, 0, run.stderr);

  const lines = run.stdout.trim().split('\n').map(JSON.parse);
  const views = lines.filter((line) => line.schema === 'goldrush.view.v1');
  assert.equal(lines.at(-1).calls, 1);
  assert.deepEqual(views.slice(1, 4).map((view) => view.now.orders[0]?.status), ['pending', 'pending', 'pending']);
  assert.deepEqual(views.slice(1, 4).map((view) => view.now.orders[0]?.id), ['orders-1-1', 'orders-1-1', 'orders-1-1'],
    'the blank and null turns kept the SAME order record, not a re-submitted one');
});

test('gr-sim hashes a fractional-yield run identically twice', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-dry-gulch&seed=gold-quantization');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  let Balance;
  let originalTickGold;
  try {
    ({ Balance } = await vite.ssrLoadModule('/src/game/Balance.ts'));
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    originalTickGold = Balance.goldSeam.tickGold;
    Balance.goldSeam.tickGold = 1;
    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'e1-dry-gulch', seed: 'gold-quantization' });
      assert.equal(sim.submitOrders([{ verb: 'HARVEST', seam: 'gold-seam-1' }]).outcome.ok, true);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return {
        outcome: sim.outcome(),
        fractionalYield: sim.economy.log.some((event) => event.type === 'gold_panned' && !Number.isInteger(event.amount)),
      };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    assert.equal(first.fractionalYield, true);
    assert.equal(Number.isInteger(first.outcome.gold), true);
  } finally {
    if (Balance && originalTickGold !== undefined) Balance.goldSeam.tickGold = originalTickGold;
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('gr-sim deterministically runs the Claim objective', () => {
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);
  const lines = first.stdout.trim().split('\n').map(JSON.parse);
  assert.deepEqual(lines[0].stablePrefix.mechanics.posting.waves, [
    { event: 'secure', wave: 10, source: 'twist.secureWave' },
  ]);
  // AP-16-2: this idle seed dies with its first offer still live instead of receiving an
  // immediate upgrade, moving the terminal wave/kills and hash without a default.
  assert.deepEqual(lines.at(-2).appendLog.at(-1), {
    wave: 2,
    outcome: 'rider-down',
    goldDelta: 0,
    worksHp: { current: 0, max: 0, delta: 0 },
    kills: 13,
    surprises: ['hero_down'],
  });
  assert.equal(lines.at(-1).secured, false);
  assert.deepEqual(
    Object.keys(lines.at(-1)),
    ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'defaultedPicks', 'defaultedSecure', 'eventLogHash'],
  );
});

test('overtime banks the Claim secure and measures the homestead on both Node engines', {
  skip: NODE_ENGINES.length < 2 ? 'two installed Node engines are required' : false,
  timeout: 240_000,
}, async () => {
  const positions = {
    sentry_beacon: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }],
    turret: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }],
  };
  const costs = { sentry_beacon: [25, 35, 45, 55, 75, 95], turret: [50, 70, 95, 125] };
  const ordersFor = (view) => {
    if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'rush' }];
    if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
    const orders = [];
    for (const kind of ['sentry_beacon', 'turret']) {
      const built = view.now.works.byKind[kind] ?? 0;
      for (let index = built; index < positions[kind].length; index += 1) {
        orders.push({ verb: 'BUILD', what: kind, where: positions[kind][index], when: { goldGte: costs[kind][index] } });
      }
    }
    for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
      for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
    }
    if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) {
      orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
    }
    orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } });
    return orders.slice(0, 32);
  };
  const run = (node) => new Promise((resolve, reject) => {
    const child = spawn(node, [
      'scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-02', '--overtime',
    ], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let buffer = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const message = JSON.parse(line);
        if (message.schema === 'goldrush.view.v1') child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
      }
    });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr)));
  });
  const hashes = [];

  for (const node of NODE_ENGINES) {
    const first = await run(node);
    const second = await run(node);
    assert.equal(second.stdout, first.stdout);
    const lines = first.stdout.trim().split('\n').map(JSON.parse);
    const outcome = lines.at(-1);
    const postSecure = lines.find((line) => line.schema === 'goldrush.view.v1' && line.now.overtime === true);
    assert.ok(postSecure.now.wave >= 10);
    assert.equal(postSecure.now.overtime, true);
    assert.equal(outcome.secured, true);
    assert.equal(outcome.securedWave, 10);
    assert.ok(outcome.waves > 10);
    assert.equal(outcome.overtimeWaves, outcome.waves - 10);
    assert.ok(outcome.homestead.goldPanned > 0);
    assert.ok(outcome.homestead.goldSpent > 0);
    assert.ok(outcome.homestead.peakWorks > 0);
    assert.ok(Object.keys(outcome.homestead.worksByTier).length > 0);
    assert.ok(outcome.homestead.worksLost >= 0);
    hashes.push(outcome.eventLogHash);
  }
  assert.equal(new Set(hashes).size, 1, hashes.join(' !== '));
});

test('runtime rush and --overtime use the same CLI ceiling and terminal stream', { timeout: 90_000 }, async () => {
  const positions = {
    sentry_beacon: [{ x: 0, z: 13 }, { x: 0, z: 11 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 }],
    turret: [{ x: 4, z: 14 }, { x: -4, z: 14 }, { x: 4, z: 10 }, { x: -4, z: 10 }],
  };
  const costs = { sentry_beacon: [25, 35, 45, 55, 75, 95], turret: [50, 70, 95, 125] };
  const ordersFor = (view) => {
    if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'rush' }];
    if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }];
    const orders = [];
    for (const kind of ['sentry_beacon', 'turret']) {
      const built = view.now.works.byKind[kind] ?? 0;
      for (let index = built; index < positions[kind].length; index += 1) {
        orders.push({ verb: 'BUILD', what: kind, where: positions[kind][index], when: { goldGte: costs[kind][index] } });
      }
    }
    for (const seam of view.now.seams.filter(({ active, remaining }) => active && remaining > 0)) {
      for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
    }
    if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.6) orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
    orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } });
    return orders.slice(0, 32);
  };
  const run = (overtime) => scriptedCli(
    ['--contract', 'the-claim', '--seed', 'e1-the-claim-02', ...(overtime ? ['--overtime'] : [])],
    ordersFor,
  );

  const explicit = await run(false);
  const flagged = await run(true);
  assert.equal(explicit.endReason ?? null, flagged.endReason ?? null);
  assert.notEqual(explicit.endReason, 'wave-ceiling');
  assert.equal(explicit.eventLogHash, flagged.eventLogHash);
  // 94fe2e2d -> ec44fd11 (rider-parity-grammar-stage3 B, ADR-005): the policy above ended with
  // HOLD at the claim and now ends with MOVE_HERO at the same point, so the hero takes the post the
  // Prospector used to be pinned to. What this test is ABOUT is untouched and still asserted above:
  // the runtime rush and the --overtime flag ride the same ceiling and produce the SAME hash as
  // each other, which is the invariant. Only the shared value moved, and one plan change moved it.
  assert.equal(explicit.eventLogHash, 'fnv1a32:ec44fd11');
});

test('the CLI science input reaches and funds the published megaproject cost', { timeout: 30_000 }, async () => {
  let publishedCost = null;
  const outcome = await scriptedCli(
    ['--contract', 'the-claim', '--seed', 'ap16-6-cli-fund', '--science-steps', '100'],
    (view) => {
      const project = view.now.megaproject;
      if (project) publishedCost ??= project.cost;
      // ADR-005 stage 1 (`tasks/rider-parity-grammar.md`): `fundMegaproject` reads the HERO'S
      // position now, matching the browser's `this.fundMegaprojectStage(this.actionActor.group.position)`.
      // A `MOVE_TO` here walked the PROSPECTOR to the site and left the hero at its stake, so the
      // fund was refused forever and this test hung on `funded === true` (measured: TypeError on
      // `outcome.fundedAt.gold`). The 1:1 plan is the human's own: walk the rider's body to the
      // site, then press fund.
      // The site CENTRE is not walkable — it is the building's own footprint — so a MOVE_HERO
      // naming it is refused `UNREACHABLE_TERRAIN` (measured on `the-claim`: site (-8,16),
      // `Terrain.sample` not walkable). The fund reach is 2.2 wu from the footprint RECTANGLE, and
      // the view publishes `site.w`/`site.d`, so the legal approach is derivable: stand beside the
      // building, exactly as the player does.
      //
      // The offsets below are not arbitrary. `MOVE_HERO` completes within `Balance.hero.radius`
      // (0.5) of its target, so a plan that aims AT the reach boundary can stop just outside it —
      // measured: aiming 1.5/1.5 clear of the footprint stopped the hero at (-3.8,12.95), gap
      // 2.30 > 2.2, and the fund answered `OUT_OF_REACH` forever. This pair lands inside the
      // 180 points on this map that stay in reach after a full arrival-radius overshoot.
      const approach = project
        ? { x: project.site.x + project.site.w / 2 + 1.5, z: project.site.z - project.site.d / 2 - 0.75 }
        : null;
      const fund = project && !project.funded && view.now.gold >= project.cost
        ? [
            { verb: 'MOVE_HERO', pos: approach },
            { verb: 'CONTEXT_ACTION', action: 'fund' },
          ]
        : [];
      if (view.now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: view.now.pendingOffer[0].id }, ...fund];
      if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
      if (fund.length > 0) return fund;
      if (project && !project.funded) {
        const seam = view.now.seams.find(({ active, remaining }) => active && remaining > 0);
        if (seam) return Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam: seam.id }));
      }
      return [{ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }];
    },
    (view) => view.now.megaproject?.funded === true,
  );
  assert.equal(publishedCost, 90);
  assert.equal(outcome.fundedAt.gold, 0);
  assert.equal(outcome.fundedAt.megaproject.cost, publishedCost);

  const invalid = spawnSync(process.execPath, [
    'scripts/gr-sim.mjs', '--contract', 'the-claim', '--science-steps', '-1', '--policy=idle',
  ], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /--science-steps must be an integer between 0 and 9007199254740991/);
});

test('gr-sim boots escort mode from data instead of URL state', { timeout: 120_000 }, async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e2-hill-mine&seed=e2-escort-headless');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'e2-hill-mine', seed: 'e2-escort-headless', mode: 'escort' });
    assert.equal(location.searchParams.has('mode'), false);
    assert.deepEqual(sim.currentTurn().view.stablePrefix.mechanics.modes, sim.manifest.modes);
    assert.equal(sim.escortDiagnostics.enabled, true);
    assert.equal(sim.escortDiagnostics.enabled && sim.escortDiagnostics.required, 1);
    assert.equal(sim.escortDiagnostics.enabled && sim.escortDiagnostics.payout, 40);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }

  const cli = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e2-hill-mine', '--seed', 'e2-escort-headless', '--mode', 'escort', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(cli.signal, null, cli.stderr);
  assert.equal(JSON.parse(cli.stdout.split('\n', 1)[0]).stablePrefix.mechanics.modes[0].id, 'escort');
});

test('the Claim driver consumes declared water and posts RunManager secure at wave 10', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=e1-the-claim-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({
    root: ROOT,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  try {
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    assert.deepEqual(Terrain.fordRanges(), [
      { id: 'center-ford', minX: -3, maxX: 3, centerX: 0, halfWidth: 3 },
    ]);
    assert.deepEqual(Terrain.sample(-12, 0), {
      walkable: false,
      speedMul: 0,
      zone: 'river',
      waterSource: 'river',
      waterDepth: 1.25,
      waterClass: 'deep',
    });
    assert.deepEqual(Terrain.sample(0, 0), {
      walkable: true,
      speedMul: 0.85,
      zone: 'ford',
      waterSource: 'river',
      waterDepth: 0.35,
      waterClass: 'wade',
    });

    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e1-the-claim-01' });
      sim.hero.applyStats(10_000, 1);
      sim.hero.heal(10_000);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return { outcome: sim.outcome(), terminalLog: turn.view.appendLog.at(-1) };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    // AP-16-2: e1-the-claim-01 reaches eleven stable trail deadlines. Queued XP no longer
    // refreshes a live offer, so defaults arrive sooner and move combat timing and the hash.
    assert.deepEqual(first.outcome, {
      secured: true,
      waves: 10,
      timeMs: 300000,
      gold: 0,
      kills: 291,
      calls: 0,
      defaultedPicks: 11,
      defaultedSecure: 1,
      eventLogHash: 'fnv1a32:6410fd15',
    });
    assert.equal(first.terminalLog.outcome, 'secured');
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('Twin Banks consumes its declared crossings and build zones before securing at wave 20', { timeout: 45_000 }, async () => {
  const runCli = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-twin-banks', '--seed', 'e1-twin-banks-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const firstCli = runCli();
  const secondCli = runCli();
  assert.equal(firstCli.status, 0, firstCli.stderr);
  assert.equal(secondCli.status, 0, secondCli.stderr);
  assert.equal(secondCli.stdout, firstCli.stdout);
  const transcript = firstCli.stdout.trim().split('\n').map(JSON.parse);
  // hero-move-verb (owner ruling 2026-09-06): the manifest's first unconditional row, published on
  // every contract because the verb's contract belongs to the engine rather than to a map.
  assert.deepEqual(transcript[0].stablePrefix.mechanics.rules, [
    { id: 'build_zones', source: 'tileParams.buildZones', data: { count: 2, banks: ['north', 'south'] } },
    {
      id: 'hero_orders',
      source: 'StandingOrders.MOVE_HERO',
      data: {
        verb: 'MOVE_HERO',
        body: 'hero',
        arriveRadius: 0.5,
        refusals: ['HERO_NOT_YOURS', 'UNREACHABLE_TERRAIN', 'UNREACHABLE_APPROACH', 'HERO_UNAVAILABLE'],
        pilots: {
          headless: "the rider pilots the run's only hero",
          roomSeat: 'a headless roster seat pilots its own hero',
          soloBrowser: 'a human pilots the hero; MOVE_HERO refuses HERO_NOT_YOURS',
        },
      },
    },
    { id: 'river', source: 'tileParams.river', data: {} },
    { id: 'water_crossings', source: 'tileParams.ford', data: { count: 2, ids: ['east-ford', 'west-ford'] } },
  ]);
  assert.deepEqual(transcript[0].stablePrefix.mechanics.posting.waves, [
    { event: 'secure', wave: 20, source: 'twist.secureWave' },
  ]);
  // F44: the authored braid mask and obstacle-aware ford routes change combat timing.
  // Pin the repeated idle run separately from the high-health secure-wave check below.
  assert.equal(transcript.at(-1).eventLogHash, 'fnv1a32:6730d992');

  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-twin-banks&seed=e1-twin-banks-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({
    root: ROOT,
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  try {
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const probe = new HeadlessContractSim({ contractId: 'e1-twin-banks', seed: 'e1-twin-banks-01' });
    const { buildZones, fords, water } = probe.manifest.tileParams;

    assert.deepEqual(
      Terrain.fordRanges(),
      fords.map(({ id, x, halfWidth }) => ({
        id,
        minX: x - halfWidth,
        maxX: x + halfWidth,
        centerX: x,
        halfWidth,
      })),
    );
    assert.equal(Terrain.sample(0, 0).zone, 'bank');
    for (const ford of fords) assert.equal(Terrain.sample(ford.x, 0).zone, 'ford');
    for (const bar of water.gravelBars) assert.equal(Terrain.isCrossingStructure(bar.x, bar.z), true);

    for (const zone of buildZones) {
      const position = { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 };
      assert.equal(Terrain.isBuildable(position.x, position.z), true);
      assert.equal(probe.build.placeFree('palisade', position), true);
    }
    assert.equal(probe.build.diagnostics.palisades, buildZones.length);
    assert.equal(Terrain.isBuildable(buildZones[0].maxX + 1, -12), false);
    assert.equal(probe.build.placeFree('palisade', { x: buildZones[0].maxX + 1, z: -12 }), false);

    const run = () => {
      const sim = new HeadlessContractSim({ contractId: 'e1-twin-banks', seed: 'e1-twin-banks-01' });
      sim.hero.applyStats(10_000, 1);
      sim.hero.heal(10_000);
      let turn = sim.currentTurn();
      while (!turn.terminal) turn = sim.advanceToTurn();
      return { outcome: sim.outcome(), terminalLog: turn.view.appendLog.at(-1) };
    };
    const first = run();
    const second = run();
    assert.deepEqual(second, first);
    // F44: corrected braid routing preserves wave-20 timing and offer deadlines;
    // kills and the event digest reflect the newly reachable paths.
    assert.deepEqual(first.outcome, {
      secured: true,
      waves: 20,
      timeMs: 600000,
      gold: 0,
      kills: 787,
      calls: 0,
      defaultedPicks: 25,
      defaultedSecure: 1,
      eventLogHash: 'fnv1a32:6c36401c',
    });
    assert.equal(first.terminalLog.outcome, 'secured');
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('the frozen Claim environment rows equal the five pinned bench seeds', () => {
  const rows = readFileSync(new URL('../env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl', import.meta.url), 'utf8')
    .trim()
    .split('\n')
    .map(JSON.parse)
    .map((row) => JSON.parse(row.info))
    .filter((info) => info.contractId === 'the-claim');
  assert.deepEqual(rows.map((row) => row.seed), benchSeeds['the-claim']);
});

test('gr-sim places Night Shift fixtures from the contract', () => {
  const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-1-frontier/contracts.json', import.meta.url), 'utf8'));
  const contract = contracts.contracts.find(({ id }) => id === 'e1-night-shift');
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract.id, '--seed', 'e1-night-shift-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  const firstLines = first.stdout.trim().split('\n').map(JSON.parse);
  const secondOutcome = JSON.parse(second.stdout.trim().split('\n').at(-1));
  assert.deepEqual(secondOutcome, firstLines.at(-1));
  // AP-16-2: Night Shift reaches three stable trail deadlines. Queued XP cannot refresh
  // them, moving its loss boundary and terminal hash while the kill count stays fixed.
  assert.deepEqual(firstLines.at(-1), {
    secured: false,
    waves: 4,
    timeMs: 147933,
    gold: 0,
    kills: 86,
    calls: 0,
    defaultedPicks: 3,
    defaultedSecure: 0,
    eventLogHash: 'fnv1a32:3bcb3c2d',
  });
  const firstView = firstLines[0];
  assert.equal(firstView.now.works.byKind.lantern_post, contract.tileParams.prePlacedBuildables.length);
});

test('Night Shift wreckers outrun lantern light headlessly', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-night-shift&seed=night-speed');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'e1-night-shift', seed: 'night-speed' });
    sim.lightField.update(1, [{ id: 'lantern:0', kind: 'lantern', x: 0, z: 0, radius: 7 }]);
    const wrecker = { variantId: 'bandit_wrecker', isWrecker: true };
    assert.equal(sim.nightSpeedMultiplier({ ...wrecker, position: { x: 0, z: 0 } }), 1);
    assert.equal(
      sim.nightSpeedMultiplier({ ...wrecker, position: { x: 20, z: 0 } }),
      Balance.contracts.nightShift.nightSpeedOutsideLight,
    );
    assert.equal(sim.nightSpeedMultiplier({ variantId: 'rusher', isWrecker: false, position: { x: 20, z: 0 } }), 1);
    assert.equal(sim.nightSpeedMultiplier({ variantId: 'moth_swarm', isWrecker: true, position: { x: 20, z: 0 } }), 1);
    const mothSim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed: 'night-speed' });
    assert.ok(mothSim.lightField.snapshot().sources.some((source) => source.kind === 'hero'));
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('gr-sim ends an idle Baron run at its grace ceiling', {
  timeout: 45_000,
  skip: 'F-E2S-3 owner ruling 2026-08-09: no still-listed Baron contract reaches its ceiling under idle; the pressure-to-damage socket slice restores this test.',
}, () => {
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e2-hill-mine', '--seed', 'e2-hill-mine-01', '--policy=idle'],
    { cwd: ROOT, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.signal, null, run.stderr);

  const lines = run.stdout.trim().split('\n').map(JSON.parse);
  const terminalView = lines.at(-2);
  const outcome = lines.at(-1);
  assert.equal(terminalView.schema, 'goldrush.view.v1');
  assert.equal(terminalView.now.wave, 18);
  assert.equal(terminalView.appendLog.at(-1).outcome, 'rider-down');
  assert.deepEqual(Object.keys(outcome), ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'eventLogHash', 'endReason']);
  assert.equal(outcome.secured, false);
  assert.equal(outcome.waves, 18);
  assert.equal(outcome.endReason, 'wave-ceiling');
});

test('the Baron driver runs the declared fight and keeps medal writes off headless', async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const previousStorage = globalThis.localStorage;
  const location = new URL('http://gr-sim.local/?debug&contract=e1-baron&seed=e1-baron-01');
  const storageWrites = [];
  globalThis.location = location;
  globalThis.window = { location };
  globalThis.localStorage = {
    getItem: () => null,
    setItem: (key, value) => storageWrites.push([key, value]),
  };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const manifest = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-1-frontier/contracts.json', import.meta.url), 'utf8'))
      .contracts.find(({ id }) => id === 'e1-baron');
    const baron = manifest.twist.baron;
    const rig = { ...Balance.sparkRig };
    Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
    try {
      const run = () => {
        const sim = new HeadlessContractSim({ contractId: 'e1-baron', seed: 'e1-baron-01' });
        sim.hero.applyStats(100_000, 1);
        sim.hero.heal(100_000);
        let turn = sim.currentTurn();
        while (!turn.terminal) turn = sim.advanceToTurn();
        return {
          outcome: sim.outcome(),
          payout: sim.runManager.diagnostics.victoryPayout,
          transcript: sim.replayEvents.filter(({ type }) =>
            ['baron_announcement', 'baron_spawned', 'baron_rocket_telegraph', 'baron_rocket_volley', 'run_secured', 'baron_defeated'].includes(type)),
        };
      };
      const first = run();
      const second = run();
      assert.deepEqual(second, first);
      // NAMED-CAUSE RE-PIN (F-1460-1, re-measured and landed s1462). kills/eventLogHash moved
      // 869/b9566c6d -> 861/36004eab at 4ab48743 (runner output of f1452-1 fort-solidity), which
      // gates the stuck-watchdog on route.blocker in src/entities/Enemy.ts and rewrites +139/-31 of
      // src/systems/BuildSystem.ts. Different routing -> different engagement -> 8 fewer kills over
      // 20 waves. Deliberate and spec-green, merely unpinned; f1452-1 reached main via drain
      // 07213c73, whose evidence was its own specs only, so nothing re-took this cross-cutting pin.
      // This is NOT the F-1403-1/F-1404-2 cross-engine class: that class means two engines
      // DISAGREEING, and they do not. Measured s1462 on the pinned 26.4.0 AND the runner's 23.11.1
      // -- both return 861/36004eab byte-identical, and the determinism assert above (second ===
      // first) passes on both. Re-pin only ever with a named cause; a blind re-pin is forbidden
      // (F-1441-3).
      // NAMED-CAUSE RE-PIN (F-2235-5, re-pinned s2237 from predecessor 6a7bafb26):
      // assets/contracts/* prose is inside eventLogHash via canonicalReplayEvents. The wave-20
      // medal event carries medalBlurb, which the c5 em-dash sweep rewrote. Measured s2237:
      // gameplay outcome UNCHANGED: kills 862, waves 20, timeMs 528400, gold 0, secured true,
      // defaultedPicks 21, defaultedSecure 1; only 5b1d21f1 -> 9a7d4dfd moved. A copy edit to
      // contract prose is therefore expected to move this pin. Blind re-pins remain forbidden
      // (F-1441-3).
      // AP-16-2: e1-baron-01 reaches twenty-one stable trail deadlines. Queued XP cannot
      // refresh them; choices stay deterministic while secure time and the hash re-pin.
      assert.deepEqual(first.outcome, {
        secured: true,
        waves: baron.wave,
        timeMs: 528_400,
        gold: 0,
        kills: 862,
        calls: 0,
        defaultedPicks: 21,
        defaultedSecure: 1,
        eventLogHash: 'fnv1a32:9a7d4dfd',
      });
      assert.equal(first.payout.science, Balance.meta.victoryPayout.science * baron.sciencePayoutMult);
      assert.deepEqual(first.transcript.filter(({ type }) => type === 'baron_announcement').map(({ wave }) => wave), [5, 12, 18, 20]);
      const { at: spawnAt, ...spawn } = first.transcript.find(({ type }) => type === 'baron_spawned');
      assert.ok(Math.abs(spawnAt - baron.wave * Balance.waves.waveInterval / manifest.twist.waveCadenceMult) <= 1 / 30);
      assert.deepEqual(spawn, {
        type: 'baron_spawned',
        position: { x: 5.911, z: -14 },
        wave: baron.wave,
        hpScale: baron.hpScale,
        speedScale: baron.speedScale,
        scale: baron.scale,
        pursuitRange: baron.pursuitRange,
        escorts: baron.escortCount,
      });
      const { at: volleyAt, ...volley } = first.transcript.find(({ type }) => type === 'baron_rocket_volley');
      assert.ok(volleyAt - spawnAt >= baron.rocketVolley.telegraphSeconds);
      assert.deepEqual(volley, {
        type: 'baron_rocket_volley',
        volley: 0,
        count: baron.rocketVolley.count,
        damage: baron.rocketVolley.damage,
        radius: baron.rocketVolley.radius,
        target: { x: 0, z: 12 },
      });
      const { at: defeatAt, ...defeat } = first.transcript.at(-1);
      assert.equal(defeatAt, first.transcript.at(-2).at);
      assert.deepEqual(defeat, {
        type: 'baron_defeated',
        wave: baron.wave,
        defeatBeat: baron.defeatBeat,
        sciencePayoutMult: baron.sciencePayoutMult,
        medal: { eligible: true, blurb: baron.medalBlurb, awarded: false, sideEffects: false },
      });
      assert.deepEqual(storageWrites, []);
      assert.deepEqual(benchSeeds['e1-baron'], ['e1-baron-01', 'e1-baron-02', 'e1-baron-03', 'e1-baron-04', 'e1-baron-05']);

      Balance.sparkRig.damage = 0;
      const capped = new HeadlessContractSim({ contractId: 'e1-baron', seed: 'e1-baron-01' });
      capped.hero.applyStats(1_000_000_000, 1);
      capped.hero.heal(1_000_000_000);
      let cappedTurn = capped.currentTurn();
      while (cappedTurn.view.now.wave < baron.wave) cappedTurn = capped.advanceToTurn();
      assert.equal(capped.replayEvents.find(({ type }) => type === 'baron_spawned').escorts, 0);
    } finally {
      Object.assign(Balance.sparkRig, rig);
    }
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});

test('the E2 Baron fights keep their pinned outcomes', {
  timeout: 45_000,
  skip: 'F-E2S-3 owner ruling 2026-08-09: no still-listed Baron contract reaches its ceiling under idle; the pressure-to-damage socket slice restores these railcar pins.',
}, async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const contractIds = ['e2-hill-mine', 'e2-trestle', 'e2-incline'];
  const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-2-steamworks/contracts.json', import.meta.url), 'utf8'))
    .contracts.filter(({ id }) => contractIds.includes(id));
  const outcomes = {};
  try {
    for (const contract of contracts) {
      const seed = benchSeeds[contract.id][0];
      const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}&seed=${seed}`);
      globalThis.location = location;
      globalThis.window = { location };
      const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      try {
        const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
        const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
        const rig = { ...Balance.sparkRig };
        Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
        try {
          const run = () => {
            const sim = new HeadlessContractSim({ contractId: contract.id, seed });
            sim.hero.applyStats(100_000, 1);
            sim.hero.heal(100_000);
            let turn = sim.currentTurn();
            while (!turn.terminal) turn = sim.advanceToTurn();
            return sim.outcome();
          };
          const first = run();
          const second = run();
          assert.deepEqual(second, first);
          // autoSecureWaveForRun() returns Number.MAX_SAFE_INTEGER while twist.baron && !baronBeaten.
          assert.ok(first.waves >= contract.twist.secureWave);
          outcomes[contract.id] = first;
        } finally {
          Object.assign(Balance.sparkRig, rig);
        }
      } finally {
        await vite.close();
      }
    }
    // NAMED-CAUSE PIN (F-1493-2, lane-f1493-2-baron-drift-pin, 2026-08-06): the census
    // equality that used to catch baron-map drift was unsound and was correctly relaxed at
    // ff628a132; this is its replacement. A red requires a named cause; blind re-pinning is
    // forbidden (F-1441-3).
    assert.deepEqual(outcomes, {
      'e2-hill-mine': {
        secured: true,
        waves: 12,
        timeMs: 366_933,
        gold: 0,
        kills: 445,
        calls: 0,
        eventLogHash: 'fnv1a32:a3b2c95e',
      },
      'e2-trestle': {
        secured: true,
        waves: 12,
        timeMs: 365_067,
        gold: 0,
        kills: 448,
        calls: 0,
        eventLogHash: 'fnv1a32:94275d9a',
      },
      'e2-incline': {
        secured: true,
        waves: 12,
        timeMs: 360_767,
        gold: 0,
        kills: 424,
        calls: 0,
        eventLogHash: 'fnv1a32:3362e2f0',
      },
    });
  } finally {
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test('identical order failures coalesce across submissions without hiding a new failure', { timeout: 45_000 }, async () => {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL('http://gr-sim.local/?debug&contract=the-claim&seed=e1-the-claim-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e1-the-claim-01' });
    const impossible = [{ verb: 'HARVEST', seam: 'gold-seam-999' }];
    let turn = sim.currentTurn();
    while (!turn.terminal) {
      assert.equal(sim.submitOrders(impossible).outcome.ok, true);
      turn = sim.advanceToTurn();
    }
    assert.ok(sim.outcome().calls <= 8, `expected at most 8 calls, got ${sim.outcome().calls}`);

    const { StandingOrdersExecutor } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    let buildSucceeds = false;
    let buildDetail = 'insufficient_gold';
    const state = () => ({
      timeAlive: 0,
      runState: 'playing',
      hp: 100,
      maxHp: 100,
      enemiesAlive: 0,
      wave: 1,
      nextWaveInSim: 30,
      economy: { gold: 100 },
      wreck: { hitsResolved: 0 },
      build: { hp: [], sluicePositions: [] },
      harvest: { activeNodes: [] },
    });
    const executor = new StandingOrdersExecutor({
      buildPlacementRadius: () => 6,
      buildTargetReachable: () => true,
      permissionLevel: () => 3,
      tools: {
        place_building: (def, pos) => ({
          tool: 'et.goldrush.place_building',
          args: { def, pos, rot: 0 },
          outcome: buildSucceeds
            ? { ok: true, economyLog: [] }
            : { ok: false, reason: 'FAILED', detail: buildDetail, economyLog: [] },
        }),
      },
    }, state);
    const order = [{ verb: 'BUILD', what: 'palisade', where: { x: 1, z: 2 }, when: { goldGte: 0 } }];
    const reorderedOrder = [{ verb: 'BUILD', what: 'palisade', where: { z: 2, x: 1 }, when: { goldGte: 0 } }];
    executor.submit(order, 1);
    executor.tick(1, { x: 0, z: 0 });
    assert.equal(executor.snapshot().orders[0].reason, 'FAILED (insufficient_gold): BUILD action was rejected.');
    const firstFailureSeq = executor.snapshot().log.findLast((event) => event.surprise === 'order_failure').seq;

    executor.submit(reorderedOrder, 2);
    executor.tick(2, { x: 0, z: 0 });
    const repeated = executor.snapshot().log.filter((event) => event.surprise === 'order_failure');
    assert.equal(repeated.length, 1);
    assert.equal(repeated.at(-1).seq, firstFailureSeq);

    buildSucceeds = true;
    executor.submit(order, 3);
    executor.tick(3, { x: 0, z: 0 });
    assert.equal(executor.snapshot().orders[0].status, 'done');

    buildSucceeds = false;
    buildDetail = 'collision';
    executor.submit(reorderedOrder, 4);
    executor.tick(4, { x: 0, z: 0 });
    const newFailure = executor.snapshot();
    assert.equal(newFailure.orders[0].reason, 'FAILED (collision): BUILD action was rejected.');
    assert.equal(newFailure.needsRider, true);
    assert.equal(newFailure.log.filter((event) => event.surprise === 'order_failure').length, 2);
    assert.ok(newFailure.log.findLast((event) => event.surprise === 'order_failure').seq > firstFailureSeq);

    executor.reset();
    executor.submit(order, 5);
    executor.tick(5, { x: 0, z: 0 });
    assert.equal(executor.snapshot().log.filter((event) => event.surprise === 'order_failure').length, 1);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
