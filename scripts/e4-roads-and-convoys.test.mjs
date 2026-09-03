import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

import { motorFloorOrders, motorSteps } from './e4-motor-floor.mjs';

// E4 ROADS AND CONVOYS (`tasks/e4-roads-and-convoys.md`): the shared motor consumer composed
// into the Dust Flats, gated on `twist.motorFrontier`, with SECURE waiting on the haul.
//
// F-1406-2: the terminal pins below are CHANGE DETECTORS. A red means the sim's behaviour moved;
// establish why before re-deriving, never paste over it. The three undeclared Motor maps are
// pinned to the hashes `docs/audits/2026-09-02-era-mechanic-audit.md` recorded and a detached
// control worktree of main re-measured on 2026-09-03 (`artifacts/e4-roads-and-convoys/report.md`):
// they prove the socket is twist-gated, because nothing else in this slice may move them.

const root = fileURLToPath(new URL('..', import.meta.url));
const DUST_FLATS = 'e4-dust-flats';
const SEED = 'e4-dust-flats-01';
const STEP = 1 / 30;
const UNDECLARED = [
  ['e4-long-road', 'e4-long-road-01', { waves: 4, kills: 41, eventLogHash: 'fnv1a32:2b27b21d' }],
  ['e4-gusher-county', 'e4-gusher-county-01', { waves: 5, kills: 93, eventLogHash: 'fnv1a32:95f5777c' }],
  ['e4-boneyard', 'e4-boneyard-01', { waves: 4, kills: 41, eventLogHash: 'fnv1a32:717f1001' }],
];

async function loadDoor(contract, seed) {
  const location = new URL(`http://e4-roads-and-convoys.test/?debug&contract=${contract}&seed=${seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const modules = {
    HeadlessContractSim: (await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts')).HeadlessContractSim,
    MotorSocket: await vite.ssrLoadModule('/src/sim/MotorSocket.ts'),
    contracts: await vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    orders: await vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
    manifest: await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts'),
  };
  return { ...modules, close: () => vite.close() };
}

function submit(sim, orders) {
  const receipt = sim.submitOrders(orders);
  assert.equal(receipt.outcome.ok, true, receipt.outcome.message);
}

function tick(sim, seconds) {
  for (let step = 0; step < Math.round(seconds / STEP); step += 1) sim.advanceOneTick();
}

function motor(sim) {
  return sim.currentTurn().view.now.motor;
}

/** gr-sim's own loop (`scripts/gr-sim.mjs:120-137`): print, answer, advance to the next turn. */
function rideTurns(HeadlessContractSim, contract, seed, policy) {
  const sim = new HeadlessContractSim({ contractId: contract, seed });
  const secureWave = sim.manifest.twist.secureWave ?? 20;
  const ceiling = Math.max(secureWave, sim.manifest.twist.baron?.wave ?? 0) + 6;
  let turn = sim.currentTurn();
  let arrivedWave = null;
  while (!turn.terminal) {
    if (turn.view.now.wave >= ceiling) { sim.hero.hp = 0; sim.dead = true; break; }
    if (policy) submit(sim, policy(turn.view));
    if (arrivedWave === null && turn.view.now.motor?.objective.arrived) arrivedWave = turn.view.now.wave;
    turn = sim.advanceToTurn();
  }
  return { outcome: sim.outcome(), view: sim.currentTurn().view, arrivedWave };
}

test('the Dust Flats composes the motor socket and the other three Motor maps do not', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const dust = new door.HeadlessContractSim({ contractId: DUST_FLATS, seed: SEED });
    const view = dust.currentTurn().view;
    assert.deepEqual(view.now.motor.objective, {
      kind: 'haul', corridorId: 'camp-to-railhead', label: 'the railhead', stop: { x: 0, z: 72 }, stopReach: 2.5,
      arrived: false, arrivedAt: null, roadDistanceAtArrival: null, securableAtWave: null,
    });
    assert.deepEqual(view.now.motor.roads.graded, []);
    assert.equal(view.now.motor.roads.corridors.length, 4);
    assert.deepEqual(view.now.motor.vehicle, {
      active: true, kind: 'hauler', state: 'idle', x: -20, z: -8, target: null, speed: 9, burnPerSecond: 3,
      distanceTravelled: 0, onRoad: false, roadDistance: 0, dispatch: null,
    });
    assert.equal(view.now.motor.fuel.capacity, 24);
    assert.equal(view.now.motor.weather.phase, 'clear');
    assert.equal(view.now.motor.weather.nextPhaseInSeconds, 6);
    assert.equal(view.now.motor.convoy, null);
    const ruleIds = view.stablePrefix.mechanics.rules.map(({ id }) => id);
    assert.deepEqual(ruleIds.filter((id) => id.startsWith('motor_')).sort(), ['motor_fuel', 'motor_haul_objective', 'motor_hauler', 'motor_roads', 'motor_weather']);
    for (const [contract, seed] of UNDECLARED) {
      const sim = new door.HeadlessContractSim({ contractId: contract, seed });
      assert.equal(sim.currentTurn().view.now.motor, undefined, `${contract} must not carry now.motor`);
      // Keyed on the contract, not the view: `View.buildView` derives `stablePrefix.mechanics` from
      // the location's `?contract=` (one door per process in gr-sim), which this one process set
      // to the Dust Flats above. The census spec sets the location per contract for the same reason.
      const rules = door.manifest.deriveMechanicsManifest(contract).rules;
      assert.deepEqual(rules.filter(({ id }) => id.startsWith('motor_')), [], `${contract} must declare no motor rule`);
    }
  } finally {
    await door.close();
  }
});

test('the mechanic fires: tar fuels the Hauler, GRADE builds the corridor, HAUL rides it 2.5x faster on 0.4x fuel, and the haul latch opens the secure wave', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const sim = new door.HeadlessContractSim({ contractId: DUST_FLATS, seed: SEED });
    // Fuel: the Prospector stands at each tar node. HOLD keeps it there for the half-second dwell.
    for (const node of motor(sim).fuel.nodes) {
      submit(sim, [{ verb: 'MOVE_TO', pos: { x: node.x, z: node.z } }, { verb: 'HOLD', pos: { x: node.x, z: node.z } }]);
      for (let waited = 0; waited < 12 && !motor(sim).fuel.nodes.find((entry) => entry.x === node.x).harvested; waited += 1) tick(sim, 0.5);
    }
    assert.deepEqual({ ...motor(sim).fuel, nodes: undefined, active: undefined }, { tar: 3, stored: 24, capacity: 24, harvestedNodes: 3, refinedTar: 6, drawn: 0, nodes: undefined, active: undefined });

    // GRADE away from any stake is refused with the nearest stake named; at the stake it grades.
    submit(sim, [{ verb: 'GRADE' }, { verb: 'HOLD', pos: { x: 12, z: -8 } }]);
    tick(sim, STEP);
    const refused = sim.standingOrdersSnapshot().orders[0];
    assert.equal(refused.status, 'failed');
    assert.match(refused.reason, /OUT_OF_REACH: GRADE needs an ungraded corridor stake within 2\.5wu/);
    submit(sim, [{ verb: 'MOVE_TO', pos: { x: 0, z: 12 } }, { verb: 'GRADE' }, { verb: 'HAUL' }, { verb: 'HOLD', pos: { x: 0, z: 12 } }]);
    for (let waited = 0; waited < 40 && motor(sim).vehicle.state !== 'arrived'; waited += 1) tick(sim, 0.5);
    const staged = motor(sim);
    assert.deepEqual(staged.roads.graded, ['camp-to-railhead']);
    assert.equal(staged.roads.segments, 1);
    assert.equal(staged.roads.length, 60);
    assert.equal(staged.vehicle.state, 'arrived');
    assert.ok(Math.hypot(staged.vehicle.x, staged.vehicle.z - 12) < 0.2, 'the Hauler rests at the stake');
    assert.ok(staged.vehicle.distanceTravelled > 28 && staged.vehicle.distanceTravelled < 29, `staged ${staged.vehicle.distanceTravelled}`);
    const stagedFuel = staged.fuel.drawn;
    // Off-road: 28.2 units at 9/s burn 3/s = 9.4 fuel, plus the road's last unit-and-a-bit at 0.4x.
    assert.ok(stagedFuel > 9 && stagedFuel < 13.5, `off-road burn ${stagedFuel}`);
    assert.equal(staged.objective.arrived, false);

    // The road leg: the Prospector walks the railhead and calls the Hauler up the graded corridor.
    submit(sim, [{ verb: 'MOVE_TO', pos: { x: 0, z: 72 } }, { verb: 'HAUL' }, { verb: 'HOLD', pos: { x: 0, z: 72 } }]);
    for (let waited = 0; waited < 80 && !motor(sim).objective.arrived; waited += 1) tick(sim, 0.5);
    const arrived = motor(sim);
    assert.equal(arrived.objective.arrived, true);
    assert.equal(arrived.objective.securableAtWave, 12);
    assert.deepEqual({ x: arrived.vehicle.x, z: arrived.vehicle.z }, { x: 0, z: 72 });
    const roadLeg = arrived.vehicle.roadDistance - staged.vehicle.roadDistance;
    const roadFuel = arrived.fuel.drawn - stagedFuel;
    assert.ok(roadLeg > 59 && roadLeg <= 60.5, `road leg ${roadLeg}`);
    // 60 units at 22.5/s (9 x 2.5) burn 3/s x 0.4 for 2.67s = 3.2 fuel; a storm slows but does not cheapen it.
    assert.ok(roadFuel > 3 && roadFuel < 3.6, `road-leg burn ${roadFuel} for ${roadLeg} units`);
    assert.ok(roadFuel * 4 < stagedFuel, 'the graded road moved twice the distance for a quarter of the fuel');
    const kinds = arrived.events.map(({ type }) => type);
    for (const kind of ['motor_tar_harvested', 'motor_road_graded', 'motor_haul_dispatched', 'motor_haul_arrived', 'motor_weather']) {
      assert.ok(kinds.includes(kind), `event log carries ${kind}`);
    }
    assert.ok(arrived.eventCount >= kinds.length);
  } finally {
    await door.close();
  }
});

test('the storm slows the Hauler by the authored multiplier and every outlaw with it', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const sim = new door.HeadlessContractSim({ contractId: DUST_FLATS, seed: SEED });
    const internal = sim;
    // Weather is a function of sim time alone: clear 0-6s, telegraph 6-10s, storm 10-22s.
    assert.equal(internal.motor.enemyMovementMultiplier(3), 1);
    assert.equal(internal.motor.enemyMovementMultiplier(8), 1);
    assert.equal(internal.motor.enemyMovementMultiplier(15), 0.7);
    assert.equal(internal.motor.enemyMovementMultiplier(25), 1);
    assert.equal(internal.motor.enemyMovementMultiplier(45), 0.7);
    // The Hauler under the storm: fuel it, then drive during the storm window and measure the speed.
    submit(sim, [{ verb: 'MOVE_TO', pos: { x: -12, z: -8 } }, { verb: 'HOLD', pos: { x: -12, z: -8 } }]);
    for (let waited = 0; waited < 12 && motor(sim).fuel.harvestedNodes < 1; waited += 1) tick(sim, 0.5);
    tick(sim, 10.5 - sim.replayTick / 30); // into the storm (10s-22s of cycle 0)
    assert.equal(motor(sim).weather.phase, 'storm');
    submit(sim, [{ verb: 'HAUL' }, { verb: 'HOLD', pos: { x: -12, z: -8 } }]);
    tick(sim, STEP);
    const before = motor(sim).vehicle.distanceTravelled;
    tick(sim, 1);
    const stormStep = motor(sim).vehicle.distanceTravelled - before;
    assert.ok(Math.abs(stormStep - 9 * 0.7) < 0.05, `storm speed ${stormStep} vs ${9 * 0.7}`);
  } finally {
    await door.close();
  }
});

test('the shared consumer composes a convoy along an authored convoyRoute and latches its arrival', async () => {
  const door = await loadDoor('e4-long-road', 'e4-long-road-01');
  try {
    const base = door.contracts.loadContract('e4-long-road');
    const manifest = structuredClone(base);
    manifest.twist.motorFrontier = {
      description: 'test: the Long Road with its convoy composed',
      vehicle: { start: { x: -180, z: 0 } },
      haul: { corridorId: 'the-long-road', label: 'the far railhead' },
      convoy: { members: 3, label: 'the town' },
    };
    const parsed = door.contracts.parseContractDescriptor(door.contracts.contractDescriptorJson(manifest), base);
    assert.equal(parsed.ok, true, JSON.stringify(parsed));
    const socket = door.MotorSocket.MotorSocket.create(manifest);
    const events = [];
    let time = 0;
    const emit = (event) => events.push(event);
    for (let step = 0; step < 30 * 60 && !socket.diagnostics(time, 12).convoy.arrived; step += 1) {
      time += STEP;
      socket.update(STEP, time, [], emit);
    }
    const convoy = socket.diagnostics(time, 12).convoy;
    assert.equal(convoy.label, 'the town');
    assert.equal(convoy.members.length, 3);
    assert.equal(convoy.total, 370);
    assert.equal(convoy.arrived, true);
    assert.equal(convoy.leaderDistance, 370);
    assert.ok(convoy.members.slice(1).every((member) => member.gap > 0), 'followers ride behind the leader');
    // 370 units at 9/s is 41.1s clear; two storms (12s each at 0.7x) stretch it. Measured band, not a point.
    assert.ok(convoy.arrivedAt > 41 && convoy.arrivedAt < 60, `convoy arrivedAt ${convoy.arrivedAt}`);
    assert.ok(events.some((event) => event.type === 'motor_convoy_arrived' && event.routeId === 'e4-long-road:convoy'));
    assert.equal(socket.simulationSnapshot.convoy.arrived, true);
  } finally {
    await door.close();
  }
});

test('the contract schema fails closed: unknown motor fields, a haul to no corridor, a convoy without a route', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const { contractDescriptorJson, loadContract, parseContractDescriptor } = door.contracts;
    const template = loadContract(DUST_FLATS);
    const reasons = (mutate) => {
      const authored = structuredClone(template);
      mutate(authored);
      const parsed = parseContractDescriptor(contractDescriptorJson(authored), template);
      return parsed.ok ? [] : parsed.reasons.map((reason) => `${reason.code}@${reason.path}`);
    };
    assert.deepEqual(reasons(() => undefined), []);
    assert.ok(reasons((authored) => { authored.twist.motorFrontier.tow = true; }).includes('field_unknown@twist.motorFrontier.tow'));
    assert.ok(reasons((authored) => { authored.twist.motorFrontier.haul.corridorId = 'no-such-road'; }).includes('motor_frontier@twist.motorFrontier.haul'));
    assert.ok(reasons((authored) => { authored.twist.motorFrontier.vehicle = { start: { x: 'west', z: 0 } }; }).includes('motor_frontier@twist.motorFrontier.vehicle'));
    assert.ok(reasons((authored) => { authored.twist.motorFrontier.convoy = { members: 3, label: 'x' }; }).includes('motor_frontier@twist.motorFrontier.convoy'));
    assert.ok(reasons((authored) => { delete authored.twist.weather; }).includes('motor_frontier@twist.motorFrontier'));
    // The grammar: both verbs are targetless and refuse any extra key, like CAPTURE.
    const { validateStandingOrders } = door.orders;
    assert.deepEqual(validateStandingOrders([{ verb: 'GRADE' }, { verb: 'HAUL' }]), { ok: true, orders: [{ verb: 'GRADE' }, { verb: 'HAUL' }] });
    assert.equal(validateStandingOrders([{ verb: 'GRADE', pos: { x: 0, z: 0 } }]).ok, false);
    assert.equal(validateStandingOrders([{ verb: 'HAUL', to: 'railhead' }]).ok, false);
  } finally {
    await door.close();
  }
});

test('an idle Dust Flats cannot secure and pins its hash; the floor hauls by wave 1 and pins its own; both replay identically', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const idle = rideTurns(door.HeadlessContractSim, DUST_FLATS, SEED, null);
    assert.equal(idle.outcome.secured, false);
    assert.equal(idle.outcome.waves, 2);
    assert.equal(idle.outcome.kills, 34);
    assert.equal(idle.outcome.eventLogHash, 'fnv1a32:7e5b43cc');
    assert.deepEqual(idle.outcome.motor, { graded: [], hauled: false, arrivedAt: null, roadDistance: 0, distanceTravelled: 0, fuelDrawn: 0, tarHarvested: 0, convoyArrived: null });
    assert.equal(idle.view.now.motor.objective.securableAtWave, null);

    const floor = rideTurns(door.HeadlessContractSim, DUST_FLATS, SEED, (view) => motorFloorOrders(view));
    assert.equal(floor.arrivedWave, 1, 'the haul lands before the wave-1 boundary turn');
    assert.deepEqual(floor.outcome.motor, {
      graded: ['camp-to-railhead'], hauled: true, arrivedAt: 29.833, roadDistance: 61.406, distanceTravelled: 88.286,
      fuelDrawn: 16.105, tarHarvested: 9, convoyArrived: null,
    });
    assert.equal(floor.view.now.motor.objective.securableAtWave, 12);
    // L2 (winnability) is NOT claimed by this pin: the floor dies at wave 3 with the haul done and only
    // timber affordable, the audit's own ceiling for this map. The pin certifies the mechanic fired.
    assert.equal(floor.outcome.secured, false);
    assert.equal(floor.outcome.waves, 3);
    assert.equal(floor.outcome.kills, 49);
    assert.equal(floor.outcome.eventLogHash, 'fnv1a32:514e0c11');
    assert.deepEqual(rideTurns(door.HeadlessContractSim, DUST_FLATS, SEED, (view) => motorFloorOrders(view)).outcome, floor.outcome);
    // The policy is idempotent against the view: once the haul has landed it stops issuing motor steps.
    assert.deepEqual(motorSteps(floor.view.now.motor), []);
  } finally {
    await door.close();
  }
});

for (const [contract, seed, pinned] of UNDECLARED) {
  test(`${contract} idle keeps the audit's hash: the socket is twist-gated`, async () => {
    const door = await loadDoor(contract, seed);
    try {
      const ride = rideTurns(door.HeadlessContractSim, contract, seed, null);
      assert.equal(ride.outcome.secured, false);
      assert.equal(ride.outcome.waves, pinned.waves);
      assert.equal(ride.outcome.kills, pinned.kills);
      assert.equal(ride.outcome.eventLogHash, pinned.eventLogHash);
      assert.equal(ride.outcome.motor, undefined);
    } finally {
      await door.close();
    }
  });
}
