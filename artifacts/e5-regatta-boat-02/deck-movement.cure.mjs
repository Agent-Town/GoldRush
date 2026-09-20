import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

test('boat and Flotilla movement carries only aboard riders and keeps pad/building ownership through loss and reset', async () => {
  const vite = await createServer({ configFile: false, appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null } });
  try {
    const { DeepwaterClaimTile } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
    const { contracts } = JSON.parse(await readFile(new URL('../assets/contracts/epoch-5-deepwater/contracts.json', import.meta.url)));
    for (const contract of contracts) {
      const tile = new DeepwaterClaimTile(contract), before = tile.snapshot().boat;
      for (const pad of before.pads) assert.equal(tile.placeBoatBuilding(pad.id, 'turret'), true);
      const hull = tile.flotilla?.diagnostics.hulls[0];
      const origin = hull ?? before.anchor;
      const aboard = { x: origin.x + .5, z: origin.z + .5 }, outside = { x: 63, z: 63 };
      const riders = [aboard, outside];
      const initial = structuredClone(riders);
      assert.equal(tile.reanchor('unknown', riders), false); assert.deepEqual(riders, initial);
      const target = hull?.id ?? contract.tileParams.deepwater.claimBoat.anchors[1].id;
      assert.equal(tile.reanchor(target, riders), true);
      const moved = hull ? tile.flotilla.diagnostics.hulls[0] : tile.snapshot().boat.anchor;
      assert.ok(Math.abs(aboard.x - moved.x - .5) < 1e-8);
      assert.ok(Math.abs(aboard.z - moved.z - .5) < 1e-8);
      assert.deepEqual(outside, initial[1]);
      const snapshot = tile.snapshot().boat;
      for (const building of snapshot.buildings) {
        const pad = snapshot.pads.find(p => p.id === building.padId);
        assert.equal(building.x, snapshot.anchor.x + pad.x); assert.equal(building.z, snapshot.anchor.z + pad.z);
        if (tile.flotilla) {
          const owner = tile.flotilla.diagnostics.hulls.find(h => h.id === pad.id);
          assert.equal(building.x, owner.x); assert.equal(building.z, owner.z);
        }
      }
      const after = structuredClone(riders);
      assert.equal(tile.reanchor(target, riders), false, 'same anchor or Flotilla cooldown refuses');
      assert.deepEqual(riders, after);
      if (hull) {
        const current = tile.flotilla.diagnostics.hulls[0];
        tile.flotilla.advance(1, [{ id: 1, isAlive: true, position: { x: current.x, z: current.z }, hitRadius: .1, contactDamage: 100 }]);
        const lost = tile.flotilla.diagnostics.hulls[0];
        assert.equal(lost.lost, true); assert.equal(lost.integrity, 0);
        assert.equal(tile.reanchor(hull.id, riders), false);
        assert.ok(!tile.reanchorTargets().some(a => a.id === hull.id));
        const live = tile.flotilla.diagnostics.hulls[1], rider = { x: live.x, z: live.z };
        const formationBefore = tile.snapshot().boat.anchor;
        assert.equal(tile.reanchor('open-water', [rider]), true);
        const formationAfter = tile.snapshot().boat.anchor;
        assert.equal(rider.x, live.x + formationAfter.x - formationBefore.x);
        assert.equal(rider.z, live.z + formationAfter.z - formationBefore.z);
        assert.deepEqual(tile.flotilla.diagnostics.hulls[0], lost, 'sunken hull remains at its loss site');
        for (const building of tile.snapshot().boat.buildings) {
          const owner = tile.flotilla.diagnostics.hulls.find(h => h.id === building.padId);
          assert.equal(building.x, owner.x); assert.equal(building.z, owner.z);
        }
      } else tile.loseHull(before.pads[0].id);
      assert.ok(!tile.snapshot().boat.pads.some(p => p.id === before.pads[0].id));
      assert.ok(!tile.snapshot().boat.buildings.some(p => p.padId === before.pads[0].id));
      tile.reset(); assert.deepEqual(tile.snapshot().boat, before);
      if (hull) assert.deepEqual(tile.flotilla.diagnostics.hulls[0], hull);
    }
  } finally { await vite.close(); }
});

test('headless public BOAT_BUILD and REANCHOR orders use the same rider and hull owners', async () => {
  const oldWindow = globalThis.window, oldLocation = globalThis.location;
  globalThis.location = new URL('http://deck.test/?debug&contract=e5-deepwater-claim');
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, watch: null } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    for (const contractId of ['e5-deepwater-claim', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']) {
      const sim = new HeadlessContractSim({ contractId, seed: 'deck-owner-check' });
      const before = sim.currentTurn().view.now, boat = before.deepwater;
      const target = boat.flotilla?.hulls[0].id ?? boat.anchors[1].id;
      const orders = [...boat.pads.map(p => ({ verb: 'BOAT_BUILD', padId: p.id, buildingId: 'turret' })), { verb: 'REANCHOR', anchorId: target }];
      assert.equal(sim.submitOrders(orders).outcome.ok, true);
      for (let i = 0; i < 8; i++) sim.advanceOneTick();
      const after = sim.currentTurn().view.now;
      assert.equal(after.deepwater.boatBuildings.length, 3, contractId);
      if (!boat.flotilla) {
        assert.equal(after.deepwater.anchor.id, target, contractId);
        assert.ok(Math.abs(after.hero.x - (before.hero.x + after.deepwater.anchor.x - boat.anchor.x)) < .001, contractId);
        assert.ok(Math.abs(after.hero.z - (before.hero.z + after.deepwater.anchor.z - boat.anchor.z)) < .001, contractId);
      } else {
        for (const building of after.deepwater.boatBuildings) {
          const hull = after.deepwater.flotilla.hulls.find(h => h.id === building.padId);
          assert.equal(building.x, hull.x); assert.equal(building.z, hull.z);
        }
        assert.notEqual(after.deepwater.flotilla.hulls[0].x, boat.flotilla.hulls[0].x);
      }
    }
    // RE-WRITTEN e5-regatta-boat-02 (2026-09-20), spec law 3 "the race counts the boat": the gate
    // is passed by the HULL with a body aboard, never by a body swimming the course. The boat is
    // moored on the first beacon, so BOARDING passes it — the boat therefore steps off the deck
    // and back aboard first, and the gate this block watches is the SECOND mark.
    const raceSim = new HeadlessContractSim({ contractId: 'e5-regatta', seed: 'gate-tick-check' });
    for (const spot of [{ x: -40, z: 0 }, { x: -49, z: 6 }]) {
      raceSim.hero.group.position.set(spot.x, raceSim.hero.group.position.y, spot.z);
      raceSim.advanceOneTick();
    }
    assert.equal(raceSim.deepwater.tile.boat.aboard, 'hero', 'the gate check must ride the boat');
    const gate = raceSim.currentTurn().view.now.deepwater.race.nextGate;
    assert.equal(raceSim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: gate.x, z: gate.z + 2 } }]).outcome.ok, true);
    let entered = false;
    for (let i = 0; i < 900; i++) {
      const before = raceSim.hero.group.position.clone();
      raceSim.advanceOneTick();
      const after = raceSim.currentTurn().view.now;
      const hero = raceSim.hero.group.position;
      if (Math.hypot(before.x - gate.x, before.z - gate.z) > (gate.radius ?? 6)
        && Math.hypot(hero.x - gate.x, hero.z - gate.z) <= (gate.radius ?? 6)) {
        const passed = after.deepwater.race.gatesPassed.find(p => p.id === gate.id);
        assert.ok(passed, 'the movement tick must pass the gate immediately');
        assert.ok(Math.abs(passed.passedAt - after.timers.runSeconds) < .001);
        entered = true; break;
      }
    }
    assert.ok(entered, JSON.stringify({ gate, now: raceSim.currentTurn().view.now, orders: raceSim.standingOrdersSnapshot() }));
    const { RegattaRaceSystem } = await vite.ssrLoadModule('/src/systems/RegattaRaceSystem.ts');
    const { contracts } = JSON.parse(await readFile(new URL('../assets/contracts/epoch-5-deepwater/contracts.json', import.meta.url)));
    const contract = contracts.find(c => c.id === 'e5-regatta'), race = RegattaRaceSystem.create(contract);
    // ONE RACER OR NONE, never a list (slice 2): `advance` takes the boat's point itself.
    for (let i = 0; i < contract.tileParams.raceCourse.beacons.length; i++) race.advance(i + 1, contract.twist.secureWave - 1, race.diagnostics.nextGate);
    race.advance(20, contract.twist.secureWave, race.diagnostics.nextGate); assert.equal(race.diagnostics.finished, false);
    race.advance(21, contract.twist.secureWave - 1, race.diagnostics.nextGate); assert.equal(race.diagnostics.finishedAt, 21);
    // And the forfeit clause, on the same object: a step with no racer after the start ends it.
    race.reset();
    race.advance(1, 0, { x: contract.tileParams.raceCourse.beacons[0].x, z: contract.tileParams.raceCourse.beacons[0].z });
    race.advance(2, 0, null);
    assert.equal(race.diagnostics.forfeited, true);
    assert.equal(race.diagnostics.nextGate, null);
  } finally {
    await vite.close();
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldLocation === undefined) delete globalThis.location; else globalThis.location = oldLocation;
  }
});


test('closing a formation stops at living hull boundaries, including a swept crossing', async () => {
  const vite = await createServer({configFile:false, appType:'custom', logLevel:'silent', optimizeDeps:{noDiscovery:true,include:[]}, server:{middlewareMode:true,watch:null}});
  try {
    const {FlotillaHullSystem} = await vite.ssrLoadModule('/src/systems/FlotillaHullSystem.ts');
    const {contracts} = JSON.parse(await readFile(new URL('../assets/contracts/epoch-5-deepwater/contracts.json', import.meta.url)));
    const contract = contracts.find(c => c.id === 'e5-flotilla');
    const separated = system => {
      const alive = system.diagnostics.hulls.filter(h => !h.lost);
      for (let i=0;i<alive.length;i++) for (const other of alive.slice(i+1))
        assert.ok(Math.hypot(alive[i].x-other.x,alive[i].z-other.z) >= alive[i].radius+other.radius-1e-8, 'living hulls overlap');
    };
    for (const loseFirst of [false,true]) {
      const system = FlotillaHullSystem.create(contract);
      if (loseFirst) system.advance(0,[{id:1,isAlive:true,position:{x:-26,z:21},hitRadius:.1,contactDamage:100}]);
      for (let turn=0;turn<100;turn++) {
        system.advance(turn*8,[]);
        const target = system.diagnostics.hulls.find(h=>h.straggler&&!h.lost);
        const rider={x:target.x,z:target.z};
        system.reanchor(target.id,[rider]);separated(system);
        const moved=system.diagnostics.hulls.find(h=>h.id===target.id);
        assert.ok(Math.hypot(rider.x-moved.x,rider.z-moved.z)<1e-8,'aboard rider separated from hull');
      }
    }
    const small=structuredClone(contract);
    small.tileParams.flotilla.hulls=small.tileParams.flotilla.hulls.map((h,i)=>({...h,x:[-4,0,30][i],z:0,radius:.5}));
    const crossing=FlotillaHullSystem.create(small);
    assert.equal(crossing.reanchor('kitchen-scow'),true);
    assert.ok(Math.abs(crossing.diagnostics.hulls[0].x+1)<1e-8,'six-meter step tunneled through a one-meter hull boundary');
    separated(crossing);
    crossing.advance(8,[]);
    assert.equal(crossing.reanchor('kitchen-scow'),false,'touching hull must not move inward or consume cooldown');
    assert.equal(crossing.diagnostics.reshapeCooldownSeconds,0);
  } finally {await vite.close();}
});
