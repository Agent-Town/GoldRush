import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';

// The public rider grammar steers to open water inside the gate radius, never into a solid buoy.
test('Regatta measures the rider, applies fast water to that body, and secures reproducibly', async () => {
  const oldLocation = globalThis.location;
  const oldWindow = globalThis.window;
  const location = new URL('http://regatta.test/?debug&contract=e5-regatta');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
    const run = (seed) => {
      const sim = new HeadlessContractSim({ contractId: 'e5-regatta', seed });
      const start = sim.currentTurn().view.now;
      assert.equal(sim.submitOrders(start.deepwater.pads.map((pad, i) => ({
        verb: 'BOAT_BUILD', padId: pad.id, buildingId: i === 0 ? 'sentry_beacon' : 'turret',
      }))).outcome.ok, true);
      let gateId;
      let ticks = 0;
      let fastWaterSpeed = 0;
      const passed = [];
      while (!sim.isTerminal && ticks++ < 700) {
        const now = sim.currentTurn().view.now;
        if (now.pendingSecure) {
          assert.equal(sim.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome.ok, true);
        } else {
          const gate = now.deepwater.race.nextGate;
          if (gate && gate.id !== gateId) {
            const target = { x: gate.x, z: gate.z + 2 };
            assert.equal(Terrain.sample(target.x, target.z).walkable, true, `${gate.id} approach must be standable`);
            assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: target }]).outcome.ok, true);
            gateId = gate.id;
          }
        }
        for (let step = 0; step < 15 && !sim.isTerminal; step += 1) {
          const before = sim.hero.group.position.clone();
          sim.advanceOneTick();
          if (sim.deepwater.movementMultiplier(before) > 1 && sim.currentTurn().view.now.hero.level === 1) {
            fastWaterSpeed = Math.max(fastWaterSpeed, before.distanceTo(sim.hero.group.position) * 30);
          }
        }
        const after = sim.currentTurn().view.now;
        if (after.deepwater.race.gatesPassed.length > passed.length) {
          passed.push({ gate: gateId, hero: { x: after.hero.x, z: after.hero.z }, at: ticks });
        }
      }
      const end = sim.currentTurn();
      assert.equal(end.terminal, true, JSON.stringify({ ticks, now: end.view.now, orders: sim.standingOrdersSnapshot() }));
      assert.equal(end.view.now.deepwater.race.gatesPassed.length, 5);
      assert.equal(end.view.now.deepwater.race.finished, true);
      assert.equal(sim.outcome().secured, true, JSON.stringify(sim.outcome()));
      assert.equal(sim.outcome().waves, 12);
      assert.ok(fastWaterSpeed > 7.5, `rider fast-water speed was ${fastWaterSpeed}`);
      return { outcome: sim.outcome(), passed, fastWaterSpeed };
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
