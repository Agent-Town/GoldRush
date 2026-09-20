import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

// RE-WRITTEN FOR e5-regatta-boat-02 (F-RB2-1). The ride this guard used to assert — a body
// SWIMMING from mark to mark and winning the course — is the dishonest path slice 2 closed: under
// `specs/agent-play/e5-regatta-steerable-boat.md` law 3 the race counts the BOAT, and only while a
// body is aboard it. The guard's subject is unchanged (a rider wins the Regatta through the public
// verb grammar, applies fast water, and replays deterministically); only the body it rides changed.
// The public rider grammar steers to open water inside the gate radius, never into a solid buoy.
test('Regatta measures the rider, applies fast water to that body, and secures reproducibly', async () => {
  const oldLocation = globalThis.location;
  const oldWindow = globalThis.window;
  const location = new URL('http://regatta.test/?debug&contract=e5-regatta');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    const physics = loadContract('e5-regatta').tileParams.deepwater.claimBoat.physics;
    const run = (seed) => {
      const sim = new HeadlessContractSim({ contractId: 'e5-regatta', seed });
      const start = sim.currentTurn().view.now;
      assert.equal(sim.submitOrders(start.deepwater.pads.map((pad, i) => ({
        verb: 'BOAT_BUILD', padId: pad.id, buildingId: i === 0 ? 'sentry_beacon' : 'turret',
      }))).outcome.ok, true);
      let ticks = 0;
      let fastWaterSpeed = 0;
      let openWaterSpeed = 0;
      let boarded = false;
      let steppedOff = false;
      const passed = [];
      while (!sim.isTerminal && ticks++ < 700) {
        const now = sim.currentTurn().view.now;
        if (now.pendingSecure) {
          assert.equal(sim.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome.ok, true);
        } else if (!boarded) {
          // Boarding is a CROSSING (slice 1): the hero boots standing on the deck, so it steps off
          // once and walks back aboard. Boarding passes the start mark, which stands on the
          // boat's own mooring — that is how a rider knows it is aboard until slice 3 publishes it.
          // Off the deck FIRST — and stay ordered off until the body is actually clear of the
          // 8.8 x 28.5 deck rectangle, or the second order lands while the hero is still aboard
          // the deck it never left and nothing ever crosses the rail.
          if (!steppedOff) steppedOff = Math.abs(now.hero.x + 49) > 4.4;
          const target = steppedOff ? { x: -49, z: 6 } : { x: -40, z: 0 };
          assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: target }]).outcome.ok, true);
          boarded = now.deepwater.race.gatesPassed.length > 0;
        } else {
          const gate = now.deepwater.race.nextGate;
          if (gate) {
            const target = { x: gate.x, z: gate.z + 2 };
            assert.equal(Terrain.sample(target.x, target.z).walkable, true, `${gate.id} approach must be standable`);
            // RE-ISSUED EVERY TURN: `submitOrders` REPLACES the standing order list, so a turn
            // that submits nothing wipes the helm and the boat coasts to a stop.
            assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: target }]).outcome.ok, true);
          }
        }
        for (let step = 0; step < 15 && !sim.isTerminal; step += 1) {
          const before = sim.deepwater.tile.snapshot().boat.motion;
          sim.advanceOneTick();
          const after = sim.deepwater.tile.snapshot().boat.motion;
          if (after.aboard === null) continue;
          if (sim.deepwater.movementMultiplier(before) > 1) fastWaterSpeed = Math.max(fastWaterSpeed, after.speed);
          else openWaterSpeed = Math.max(openWaterSpeed, after.speed);
        }
        const after = sim.currentTurn().view.now;
        if (after.deepwater.race.gatesPassed.length > passed.length) {
          passed.push({ gate: after.deepwater.race.gatesPassed.at(-1).id, at: ticks });
        }
      }
      const end = sim.currentTurn();
      assert.equal(end.terminal, true, JSON.stringify({ ticks, now: end.view.now, orders: sim.standingOrdersSnapshot() }));
      assert.equal(end.view.now.deepwater.race.gatesPassed.length, 5);
      assert.equal(end.view.now.deepwater.race.finished, true);
      assert.equal(end.view.now.deepwater.race.forfeited, false);
      assert.equal(sim.outcome().secured, true, JSON.stringify(sim.outcome()));
      assert.equal(sim.outcome().waves, 12);
      // FAST WATER, ON THE BODY THAT RACES, against the CONTRACT's single authored number
      // (F-RB1-2). Measured against the authored top speed rather than against an observed
      // open-water maximum, because a hull leaving the band carries its band speed out with it
      // (drag is 0.8/s) — the observed "open water" maximum is 2.448, which is the band's own
      // speed decaying, and comparing the two would measure the drag, not the bonus.
      const ratio = fastWaterSpeed / physics.topSpeed;
      assert.ok(Math.abs(ratio - physics.fastWaterMultiplier) < 1e-6,
        `fast water ran at x${ratio.toFixed(4)} against the authored x${physics.fastWaterMultiplier}`);
      assert.equal(sim.currentTurn().view.now.deepwater.race.fastWaterMultiplier, physics.fastWaterMultiplier,
        'the race and the hull must read the same fast-water number');
      return { outcome: sim.outcome(), passed, fastWaterSpeed, openWaterSpeed };
    };
    for (const seed of ['e5-regatta-01', 'e5-regatta-02']) {
      const first = run(seed);
      assert.deepEqual(run(seed), first, `${seed} must replay deterministically`);
      console.log(JSON.stringify({ seed, ...first }));
    }
  } finally {
    await vite.close();
    if (oldLocation === undefined) delete globalThis.location; else globalThis.location = oldLocation;
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
  }
});
