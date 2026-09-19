// THE HERO-MOVE VERB GUARD (owner ruling 2026-09-06, verbatim: "yes! please! rider has to be able
// to move, I did not know that was not possible before").
//
// `MOVE_HERO {pos}` is the first order in the union that moves the HERO rather than the Prospector.
// Six things can rot, and each has a test:
//
//   1. THE SCHEMA SOFTENS. The door accepts one shape and one shape only. A stray key, a missing
//      axis, an infinite number or a bare verb must be refused as a whole array (replace semantics
//      make a partially accepted submission the worst possible outcome).
//   2. THE STEERING STOPS STEERING. The whole slice is worthless if the hero does not actually
//      arrive, so this drives a real `HeadlessContractSim` tick by tick and asserts the hero
//      crosses real ground and the record ends `done` inside a measured step budget.
//   3. A RIDER MOVES A HUMAN'S HERO. This is the owner's law and the only clause with a moral
//      failure mode. The browser's singleton door binds `riderPiloted: false`; the test drives an
//      executor with that channel and asserts the record fails with `HERO_NOT_YOURS` and that the
//      hero never receives a steering target.
//   4. THE VERB STALLS SILENTLY. Ground the hero cannot stand on, and ground it cannot reach, must
//      both answer. An order that sits `active` forever is the Silent No-Op (Mistake #1) wearing a
//      status.
//   5. DETERMINISM AND REPLAY DRIFT. Two runs on the same orders must be byte-identical, and a tape
//      carrying MOVE_HERO must replay to its own hash through `AgentTapeReplaySession`.
//   6. THE IDLE FLOORS MOVE. The verb is additive: a run that issues no MOVE_HERO must walk the
//      same object graph it walked before the verb existed. `heroOrderIntents` returns the
//      `IDLE_INTENTS` OBJECT ITSELF in that case, and the two-run outcome of an idle ride must
//      match the recorded null floor for the same contract and seed exactly.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'the-claim';
const SEED = 'the-claim-01';
/** 30 s of sim at the fixed 1/30 step: ten times the ~2 s the hero needs, and a real ceiling. */
const STEP_BUDGET = 900;

async function withVite(run) {
  const location = new URL(`http://hero-move-verb.test/?debug&contract=${CONTRACT}`);
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
    globalThis.location = previousLocation;
    globalThis.window = previousWindow;
  }
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

test('the MOVE_HERO schema accepts one shape and refuses every near miss', async () => {
  await withVite(async (vite) => {
    const { validateStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');

    const accepted = validateStandingOrders([{ verb: 'MOVE_HERO', pos: { x: 4, z: -3.5 } }]);
    assert.equal(accepted.ok, true, 'the published form must be accepted');
    assert.deepEqual(accepted.orders, [{ verb: 'MOVE_HERO', pos: { x: 4, z: -3.5 } }]);

    for (const bad of [
      { verb: 'MOVE_HERO' },
      { verb: 'MOVE_HERO', pos: { x: 1 } },
      { verb: 'MOVE_HERO', pos: { x: 1, z: 2, y: 3 } },
      { verb: 'MOVE_HERO', pos: { x: 1, z: Number.POSITIVE_INFINITY } },
      { verb: 'MOVE_HERO', pos: { x: 1, z: 2 }, speed: 1 },
      { verb: 'MOVE_HERO', pos: [1, 2] },
      { verb: 'MOVE_HERO', pos: null },
      { verb: 'HOLD_HERO', pos: { x: 1, z: 2 } },
    ]) {
      const result = validateStandingOrders([bad]);
      assert.equal(result.ok, false, `${JSON.stringify(bad)} must be refused`);
    }

    // Replace semantics: one bad order refuses the WHOLE array, so a rider can never end up with
    // half a tape installed.
    const mixed = validateStandingOrders([
      { verb: 'MOVE_HERO', pos: { x: 0, z: 0 } },
      { verb: 'MOVE_HERO', pos: { x: 0 } },
    ]);
    assert.equal(mixed.ok, false, 'a bad order must refuse the whole submission');
  });
});

test('the headless engine walks the hero to the target and spends the order', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { HERO_ARRIVE_RADIUS, snapshotStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');

    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const start = { ...sim.currentTurn().view.now.hero };
    const target = { x: start.x, z: start.z - 12 };
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: target }]).outcome.ok, true);

    let steps = 0;
    let record = null;
    while (steps < STEP_BUDGET && !sim.isTerminal) {
      sim.advanceOneTick();
      steps += 1;
      record = snapshotStandingOrders().orders.find(({ order }) => order.verb === 'MOVE_HERO');
      if (record?.status === 'done' || record?.status === 'failed') break;
    }

    assert.ok(record, 'the submitted order must be on the executor');
    assert.equal(record.status, 'done', `MOVE_HERO ended ${record.status}${record.reason ? `: ${record.reason}` : ''}`);
    const hero = sim.currentTurn().view.now.hero;
    assert.ok(distance(hero, target) <= HERO_ARRIVE_RADIUS + 0.05,
      `hero stopped ${distance(hero, target).toFixed(3)} from the target`);
    assert.ok(distance(hero, start) > 6, 'the hero must have crossed real ground, not jittered');
    // The hero walks; it does not teleport. `Balance.hero.speed` is 6 wu/s on the 1/30 step, so 12 wu
    // cannot be crossed in fewer than 60 ticks even at a standing start with no acceleration ramp.
    // The floor is asserted rather than the exact count, so terrain speed multipliers stay free to
    // vary by map. Measured on this tree: 65 ticks (2.17 s), which is the ramp and nothing else.
    assert.ok(steps >= 60, `12 wu in ${steps} ticks is faster than the hero can walk`);
    assert.ok(steps < STEP_BUDGET, 'the order must finish inside the budget');

    // Spent, not repeating: a done MOVE_HERO stops steering and the hero stays put.
    const parked = { ...sim.currentTurn().view.now.hero };
    for (let i = 0; i < 120 && !sim.isTerminal; i += 1) sim.advanceOneTick();
    const after = sim.currentTurn().view.now.hero;
    assert.ok(distance(after, parked) < 1.5, 'a spent MOVE_HERO must not keep driving the hero');
  });
});

test("a rider's order never moves a human's hero", async () => {
  await withVite(async (vite) => {
    const orders = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    const { StandingOrdersExecutor } = orders;

    // The browser's own binding: a hero that exists, is walkable ground, and is NOT the rider's.
    // Everything except `riderPiloted` is true, so a pass here can only come from the ownership
    // clause and not from some other refusal standing in for it.
    const hero = { x: 0, z: 12 };
    let steered = 0;
    const surface = { permissionLevel: () => 3, tools: {}, buildTargetReachable: () => true, buildPlacementRadius: () => 1 };
    const executor = new StandingOrdersExecutor(surface, () => ({ timeAlive: 0, runState: 'playing', hp: 100, maxHp: 100 }));
    executor.bindHeroChannel({
      position: () => { steered += 1; return hero; },
      riderPiloted: () => false,
      walkable: () => true,
    });
    assert.equal(executor.submit([{ verb: 'MOVE_HERO', pos: { x: 0, z: -6 } }], 0).ok, true);

    const result = executor.tick(0.1, { x: 0, z: 12 });
    assert.deepEqual(result, {}, 'a refused MOVE_HERO must publish no movement of any kind');
    assert.equal(executor.heroSteering(), null, 'the hero must never receive a steering target');
    assert.equal(steered, 0, "the executor must not even read a human's hero position");
    const [record] = executor.snapshot().orders;
    assert.equal(record.status, 'failed');
    assert.match(record.reason, /^HERO_NOT_YOURS: /);
    assert.ok(executor.snapshot().needsRider, 'the refusal must raise the order-failure surprise');

    // The same executor with the same order, once the hero IS the rider's: the ownership clause is
    // the ONLY thing that changed, so this is the control that proves the test above measures it.
    executor.bindHeroChannel({ position: () => hero, riderPiloted: () => true, walkable: () => true });
    assert.equal(executor.submit([{ verb: 'MOVE_HERO', pos: { x: 0, z: -6 } }], 1).ok, true);
    assert.deepEqual(executor.tick(1.1, { x: 0, z: 12 }), { heroMovement: { x: 0, z: -6 } });
    assert.deepEqual(executor.heroSteering(), { x: 0, z: -6 });

    // And the browser door binds exactly that refusing channel, proved at the source because
    // `Game` needs a canvas and cannot be constructed here.
    const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
    const bind = game.slice(game.indexOf('bindStandingOrderHero({'));
    assert.ok(bind.startsWith('bindStandingOrderHero({'), 'Game.ts must bind a hero channel');
    assert.match(bind.slice(0, 400), /riderPiloted: \(\) => false,/,
      "the browser singleton must bind riderPiloted false: its hero is the human's");
    // ...and the room seat binds its own, which exists only for a headless roster entry.
    const seat = readFileSync(new URL('../src/mp/AgentRiderBody.ts', import.meta.url), 'utf8');
    assert.match(seat, /riderPiloted: \(\) => true,/);
    assert.match(game, /agent: player\.client === 'headless'/);
    assert.match(game, /const headlessIds = new Set\(roster\.filter\(\(player\) => player\.client === 'headless'\)/);
  });
});

test('unwalkable ground and unreachable ground both answer, and neither stalls', async () => {
  await withVite(async (vite) => {
    const { StandingOrdersExecutor } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    const state = () => ({ timeAlive: 0, runState: 'playing', hp: 100, maxHp: 100 });
    const surface = { permissionLevel: () => 3, tools: {}, buildTargetReachable: () => true, buildPlacementRadius: () => 1 };

    const refused = new StandingOrdersExecutor(surface, state);
    refused.bindHeroChannel({ position: () => ({ x: 0, z: 12 }), riderPiloted: () => true, walkable: () => false });
    refused.submit([{ verb: 'MOVE_HERO', pos: { x: 99, z: 99 } }], 0);
    refused.tick(0.1, { x: 0, z: 12 });
    assert.match(refused.snapshot().orders[0].reason, /^UNREACHABLE_TERRAIN: /);

    // A hero pinned against a wall: walkable target, live channel, and no progress. The order must
    // give up after the four-second rule rather than sit `active` for the rest of the run.
    const pinned = new StandingOrdersExecutor(surface, state);
    pinned.bindHeroChannel({ position: () => ({ x: 0, z: 12 }), riderPiloted: () => true, walkable: () => true });
    pinned.submit([{ verb: 'MOVE_HERO', pos: { x: 0, z: -6 } }], 0);
    for (let at = 0; at <= 4.2; at += 0.1) pinned.tick(Number(at.toFixed(1)), { x: 0, z: 12 });
    const record = pinned.snapshot().orders[0];
    assert.equal(record.status, 'failed');
    assert.match(record.reason, /^UNREACHABLE_APPROACH: /);
    assert.equal(pinned.heroSteering(), null, 'a failed order must stop steering the hero');

    // No channel at all: the honest "unavailable in this engine" refusal every optional verb gives.
    const unbound = new StandingOrdersExecutor(surface, state);
    unbound.submit([{ verb: 'MOVE_HERO', pos: { x: 0, z: 0 } }], 0);
    unbound.tick(0.1, { x: 0, z: 12 });
    assert.match(unbound.snapshot().orders[0].reason, /^HERO_UNAVAILABLE: /);
  });
});

test('two MOVE_HERO runs are identical and a MOVE_HERO tape replays to its hash', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
    const { agentOrdersEventLogHash } = await vite.ssrLoadModule('/src/game/RunTape.ts');

    const ride = () => {
      const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
      const start = sim.currentTurn().view.now.hero;
      sim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: start.x + 8, z: start.z - 8 } }]);
      const hashes = [];
      for (let step = 0; step < 600 && !sim.isTerminal; step += 1) {
        sim.advanceOneTick();
        if (step % 100 === 0) hashes.push(sim.tickHash(step));
      }
      const now = sim.currentTurn().view.now;
      return {
        hashes,
        hero: now.hero,
        orders: agentOrdersEventLogHash(sim.standingOrdersSnapshot()),
      };
    };

    const first = ride();
    const second = ride();
    assert.deepEqual(second.hashes, first.hashes, 'two identical MOVE_HERO rides must hash identically');
    assert.deepEqual(second.hero, first.hero, 'two identical MOVE_HERO rides must leave the hero on the same point');
    assert.equal(second.orders, first.orders, 'the standing-order event log must be identical');
    assert.ok(first.hashes.length > 1 && new Set(first.hashes).size > 1, 'the tick hash must actually move');

    // Replay: a tape recorded through the DOOR (gr-sim writes these) carries the MOVE_HERO as an
    // `agent_orders` action, and `AgentTapeReplaySession` must reproduce the ride from it. The tape
    // is read from the artifact the slice's own prover wrote rather than minted here, so the thing
    // replayed is the thing the door actually produced.
    const tapePath = new URL('../artifacts/hero-move-verb/kite-01.tape.json', import.meta.url);
    const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
    const carriesVerb = JSON.stringify(tape).includes('"MOVE_HERO"');
    assert.ok(carriesVerb, 'the pinned tape must carry a MOVE_HERO order');
    const replay = new AgentTapeReplaySession(tape);
    while (!replay.complete && replay.tick < replay.durationTicks) replay.advanceOneTick();
    const result = replay.result();
    const expected = JSON.parse(readFileSync(new URL('../artifacts/hero-move-verb/kite-01.replay.json', import.meta.url), 'utf8'));
    assert.equal(result.eventLogHash, expected.eventLogHash, 'the MOVE_HERO tape must replay to its recorded hash');
    assert.deepEqual(result.outcome, expected.outcome, 'the MOVE_HERO tape must replay to its recorded outcome');
  });
});

// DRIVEN THROUGH `gr-sim.mjs --policy=idle`, THE SAME INSTRUMENT `scripts/null-floor-anchors.mjs`
// MINTS THE FLOORS WITH, and not through a hand-rolled `advanceOneTick` loop. That distinction was
// MEASURED while writing this guard, and it is the sort of thing that quietly turns a guard into a
// liar: a bare tick loop on `e1-twin-banks-01` ended at wave 2 / 80133 ms / hash `fnv1a32:42370bca`
// while the recorded floor is wave 3 / 91600 ms / `fnv1a32:01e5173c` — because the CLI drives the
// run with `currentTurn()` + `advanceToTurn()` and clamps at a wave ceiling, and that harness is
// part of what a floor MEANS. The engine was innocent both times: `null-floor-anchors.mjs --check`
// on this tree reported the eraStamp as its only difference, every floor byte-identical.
test('a run that issues no MOVE_HERO leaves the recorded null floor byte-identical', () => {
  const floors = JSON.parse(readFileSync(new URL('../assets/contracts/null-floors.json', import.meta.url), 'utf8'));
  const fields = ['secured', 'waves', 'timeMs', 'gold', 'kills', 'eventLogHash'];

  // The bench seeds the floors are recorded under, which are NOT the ad-hoc seed the steering tests
  // above ride: a floor only means something against the seed it was minted with. Two contracts, so
  // one map's quirk cannot carry the claim on its own.
  for (const [contract, seed] of [['the-claim', 'e1-the-claim-01'], ['e1-twin-banks', 'e1-twin-banks-01']]) {
    const recorded = floors.floors[contract]?.[seed];
    assert.ok(recorded, `${contract}/${seed} must have a recorded null floor`);
    const run = spawnSync(process.execPath, [
      'scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle',
    ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 240_000 });
    assert.equal(run.status, 0, run.stderr);
    const outcome = JSON.parse(run.stdout.trim().split('\n').at(-1));
    assert.deepEqual(
      Object.fromEntries(fields.map((field) => [field, outcome[field]])),
      recorded,
      `the idle floor for ${contract}/${seed} moved: the verb is not additive`,
    );
  }
});
