import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

import { motorFloorOrders, motorSteps } from './e4-motor-floor.mjs';

// E4 ROADS AND CONVOYS (`tasks/e4-roads-and-convoys.md`): the shared motor consumer composed into
// all four Motor Frontier maps, one errand each, exactly the audit's own "smallest slices"
// (`docs/audits/2026-09-02-era-mechanic-audit.md`), with SECURE waiting on that errand.
//
// F-1406-2: the terminal pins below are CHANGE DETECTORS. A red means the sim's behaviour moved;
// establish why before re-deriving, never paste over it. Every number here was measured on
// 2026-09-04 by three instruments that agree: this in-process door, `scripts/e4-motor-ride.mjs`
// over the gr-sim NDJSON transport, and (for the idle rows) `assets/contracts/null-floors.json`.
//
// RE-DERIVED 2026-09-07 by `rider-parity-grammar-stage3` A0, one cause for every FLOOR row that
// moved: ADR-005 (owner, "This has to be 1:1 the same for the AI"). The plans below walked the
// PROSPECTOR to a stake with `MOVE_TO` and pinned it there with `HOLD`, two verbs no human has;
// they now walk the HERO with `MOVE_HERO` and let the Prospector drift in behind it, and `GRADE`
// and `HAUL` are measured at the hero in both engines since stage 1. Three consequences, all of
// them visible in the numbers: the caller's body is wider (`Balance.hero.radius` 0.5 against
// `Balance.agent.arriveRadius` 0.16), the route is one body's walk rather than two, and three of
// the four errand stops are ground NO HERO CAN STAND ON, so a plan aims beside them.
// EVERY IDLE ROW IS UNCHANGED — no orders, no grammar, no movement.
//
// F-RPG-10 (finding, for the drain; NOT a regression this task introduced): the Long Road's convoy
// errand cannot be landed by any body a human positions. Its town gains ground only as the lead
// Hauler's straight-line distance to `(190, 0)` falls, and it arrives when the cumulative gain
// reaches `convoy.total` — which `MotorSocket.ts` seeds as that same opening distance, so the
// Hauler must come to rest EXACTLY on the stop (`:341-345`). `HAUL` brings the Hauler to the hero,
// and `Terrain.sample(190, 0).walkable` is false: the far railhead is an impassable rectangle
// about x 186..190 by z -5..5, with standable ground only east of it at x >= 190.75, reachable
// only around the block. Every rung of the aim ladder therefore refuses (measured: two
// UNREACHABLE_TERRAIN, three UNREACHABLE_APPROACH), and the row below pins that honestly rather
// than pretending. The cure is the socket's or the contract's — give the convoy the same
// `MOTOR_STOP_REACH` the other three errands use, or move the stop onto standable ground — and
// both are outside this task's firewall. The other three errands land exactly as before.

const root = fileURLToPath(new URL('..', import.meta.url));
const DUST_FLATS = 'e4-dust-flats';
const SEED = 'e4-dust-flats-01';
const STEP = 1 / 30;

/** The four maps, their errand, and both pinned rides. `objWave` is the wave the errand landed on. */
const MAPS = [
  {
    id: 'e4-dust-flats',
    kind: 'haul',
    corridorId: 'camp-to-railhead',
    stop: { x: 0, z: 72 },
    rules: ['motor_fuel', 'motor_haul_objective', 'motor_hauler', 'motor_roads', 'motor_weather'],
    idle: { waves: 2, kills: 34, eventLogHash: 'fnv1a32:7e5b43cc' },
    floor: { waves: 3, kills: 48, eventLogHash: 'fnv1a32:8985c7ba', objWave: 1, securableAtWave: 12, residual: [] },
    motor: {
      graded: ['camp-to-railhead'], hauled: true, arrivedAt: 35.033, roadDistance: 59.997,
      distanceTravelled: 86.877, fuelDrawn: 16.03, tarHarvested: 9, convoyArrived: null,
    },
    events: ['motor_haul_arrived', 'motor_haul_dispatched', 'motor_road_graded', 'motor_tar_harvested', 'motor_weather'],
  },
  {
    id: 'e4-long-road',
    kind: 'convoy',
    corridorId: 'the-long-road',
    stop: { x: 190, z: 0 },
    rules: ['motor_convoy', 'motor_fuel', 'motor_haul_objective', 'motor_hauler', 'motor_roads', 'motor_weather'],
    idle: { waves: 4, kills: 44, eventLogHash: 'fnv1a32:a7ffb1c9' },
    // F-RPG-10: the ONLY errand of the four the 1:1 grammar cannot land. See the note above MAPS.
    floor: {
      waves: 4, kills: 25, eventLogHash: 'fnv1a32:bf0c9c2c', objWave: null, securableAtWave: null,
      residual: [
        { verb: 'MOVE_HERO', pos: { x: 190, z: 0 } }, { verb: 'MOVE_HERO', pos: { x: 191, z: 0 } },
        { verb: 'MOVE_HERO', pos: { x: 189, z: 0 } }, { verb: 'MOVE_HERO', pos: { x: 192, z: 0 } },
        { verb: 'MOVE_HERO', pos: { x: 188, z: 0 } }, { verb: 'HAUL' },
      ],
    },
    motor: {
      graded: ['the-long-road'], hauled: false, arrivedAt: null, roadDistance: 291.75,
      distanceTravelled: 291.75, fuelDrawn: 15.56, tarHarvested: 9, convoyArrived: false, kind: 'convoy',
    },
    events: ['motor_convoy_arrived', 'motor_haul_arrived', 'motor_haul_dispatched', 'motor_road_graded', 'motor_tar_harvested', 'motor_weather'],
  },
  {
    id: 'e4-gusher-county',
    kind: 'deliveries',
    corridorId: 'camp-to-west-lease',
    stop: { x: -50, z: -40 },
    rules: ['motor_closures', 'motor_fuel', 'motor_haul_objective', 'motor_hauler', 'motor_roads', 'motor_weather'],
    idle: { waves: 5, kills: 90, eventLogHash: 'fnv1a32:b9638b36' },
    floor: { waves: 6, kills: 131, eventLogHash: 'fnv1a32:a8ce35f4', objWave: 4, securableAtWave: 12, residual: [] },
    motor: {
      graded: ['camp-to-east-lease', 'camp-to-north-lease', 'camp-to-west-lease'], hauled: true,
      arrivedAt: 133.7, roadDistance: 216.804, distanceTravelled: 265.314, fuelDrawn: 32.626,
      tarHarvested: 9, convoyArrived: null, kind: 'deliveries',
      delivered: ['camp-to-west-lease', 'camp-to-east-lease', 'camp-to-north-lease'],
    },
    events: ['motor_haul_arrived', 'motor_haul_dispatched', 'motor_lease_delivered', 'motor_road_closed', 'motor_road_graded', 'motor_road_reopened', 'motor_tar_harvested', 'motor_weather'],
  },
  {
    id: 'e4-boneyard',
    kind: 'tow',
    corridorId: 'gate-to-west-rows',
    stop: { x: -18, z: -8 },
    rules: ['motor_fuel', 'motor_haul_objective', 'motor_hauler', 'motor_roads', 'motor_weather'],
    idle: { waves: 4, kills: 35, eventLogHash: 'fnv1a32:5c7f6600' },
    floor: { waves: 4, kills: 40, eventLogHash: 'fnv1a32:5329f56d', objWave: 1, securableAtWave: 12, residual: [] },
    motor: {
      graded: ['gate-to-west-rows'], hauled: true, arrivedAt: 53.933, roadDistance: 10.633,
      distanceTravelled: 69.078, fuelDrawn: 20.844, tarHarvested: 9, convoyArrived: null,
      kind: 'tow', towed: true,
    },
    events: ['motor_haul_arrived', 'motor_haul_dispatched', 'motor_road_graded', 'motor_tar_harvested', 'motor_tow_delivered', 'motor_tow_hitched', 'motor_weather'],
  },
];

/** The twist-gating control: a door with no `twist.motorFrontier` composes no socket at all. */
const UNDECLARED = ['the-claim', 'e3-moth-season'];

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

/** Drives the sim to `seconds` of sim time from wherever it is, ticking whole steps. */
function tickTo(sim, seconds) {
  tick(sim, Math.max(0, seconds - sim.replayTick / 30));
}

/**
 * gr-sim's own loop (`scripts/gr-sim.mjs:120-137`): print, answer, advance to the next turn. Also
 * watches the secure gate: `pendingSecure` must never appear while the errand is unmet.
 */
function rideTurns(HeadlessContractSim, contract, seed, policy) {
  const sim = new HeadlessContractSim({ contractId: contract, seed });
  const secureWave = sim.manifest.twist.secureWave ?? 20;
  const ceiling = Math.max(secureWave, sim.manifest.twist.baron?.wave ?? 0) + 6;
  let turn = sim.currentTurn();
  let arrivedWave = null;
  let leaked = false;
  while (!turn.terminal) {
    if (turn.view.now.wave >= ceiling) { sim.hero.hp = 0; sim.dead = true; break; }
    const view = turn.view;
    if (view.now.pendingSecure && view.now.motor && !view.now.motor.objective.arrived) leaked = true;
    if (policy) submit(sim, policy(view));
    if (arrivedWave === null && view.now.motor?.objective.arrived) arrivedWave = view.now.wave;
    turn = sim.advanceToTurn();
  }
  return { outcome: sim.outcome(), view: sim.currentTurn().view, arrivedWave, leaked };
}

test('each Motor map composes its own errand, and a door without the twist composes none', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    for (const map of MAPS) {
      const view = new door.HeadlessContractSim({ contractId: map.id, seed: `${map.id}-01` }).currentTurn().view;
      const objective = view.now.motor.objective;
      assert.equal(objective.kind, map.kind, `${map.id} errand`);
      assert.equal(objective.corridorId, map.corridorId, `${map.id} road`);
      assert.deepEqual(objective.stop, map.stop, `${map.id} first stop`);
      assert.equal(objective.stopReach, 2.5);
      assert.equal(objective.arrived, false);
      assert.equal(objective.securableAtWave, null, `${map.id} publishes no secure wave before its errand lands`);
      assert.equal(view.now.motor.fuel.capacity, 24);
      assert.equal(view.now.motor.vehicle.state, 'idle');
      // Keyed on the contract, not the view: `View.buildView` derives `stablePrefix.mechanics` from
      // the location's `?contract=` (one door per process in gr-sim), which this one process set
      // to the Dust Flats above. The census spec sets the location per contract for the same reason.
      const rules = door.manifest.deriveMechanicsManifest(map.id).rules;
      assert.deepEqual(rules.filter(({ id }) => id.startsWith('motor_')).map(({ id }) => id).sort(), map.rules, `${map.id} rules`);
      assert.equal(rules.find(({ id }) => id === 'motor_haul_objective').data.kind, map.kind);
    }
    // The Dust Flats' own opening, pinned in full: this shape is what every earlier ride recorded.
    const dust = new door.HeadlessContractSim({ contractId: DUST_FLATS, seed: SEED }).currentTurn().view;
    assert.deepEqual(dust.now.motor.objective, {
      kind: 'haul', corridorId: 'camp-to-railhead', label: 'the railhead', stop: { x: 0, z: 72 }, stopReach: 2.5,
      arrived: false, arrivedAt: null, roadDistanceAtArrival: null, securableAtWave: null,
    });
    assert.deepEqual(dust.now.motor.roads.graded, []);
    assert.equal(dust.now.motor.roads.corridors.length, 4);
    assert.deepEqual(dust.now.motor.vehicle, {
      active: true, kind: 'hauler', state: 'idle', x: -20, z: -8, target: null, speed: 9, burnPerSecond: 3,
      distanceTravelled: 0, onRoad: false, roadDistance: 0, dispatch: null,
    });
    assert.equal(dust.now.motor.weather.phase, 'clear');
    assert.equal(dust.now.motor.weather.nextPhaseInSeconds, 6);
    assert.equal(dust.now.motor.convoy, null);
    for (const contract of UNDECLARED) {
      const sim = new door.HeadlessContractSim({ contractId: contract, seed: `${contract}-01` });
      assert.equal(sim.currentTurn().view.now.motor, undefined, `${contract} must not carry now.motor`);
      assert.deepEqual(door.manifest.deriveMechanicsManifest(contract).rules.filter(({ id }) => id.startsWith('motor_')), [], `${contract} declares no motor rule`);
    }
  } finally {
    await door.close();
  }
});

test('the mechanic fires: tar fuels the Hauler, GRADE builds the corridor, HAUL rides it 2.5x faster on 0.4x fuel, and the haul latch opens the secure wave', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const sim = new door.HeadlessContractSim({ contractId: DUST_FLATS, seed: SEED });
    // Fuel: the HERO stands at each tar node (ADR-005: the rider positions the body a human
    // positions, and fuel takes "any body"). No hold verb is needed or offered — `Hero.update`
    // decelerates an unsteered hero to a stop where it stands, so arriving IS the dwell.
    for (const node of motor(sim).fuel.nodes) {
      submit(sim, [{ verb: 'MOVE_HERO', pos: { x: node.x, z: node.z } }]);
      for (let waited = 0; waited < 12 && !motor(sim).fuel.nodes.find((entry) => entry.x === node.x).harvested; waited += 1) tick(sim, 0.5);
    }
    assert.deepEqual({ ...motor(sim).fuel, nodes: undefined, active: undefined }, { tar: 3, stored: 24, capacity: 24, harvestedNodes: 3, refinedTar: 6, drawn: 0, nodes: undefined, active: undefined });

    // GRADE away from any stake is refused with the nearest stake named; at the stake it grades.
    submit(sim, [{ verb: 'GRADE' }]);
    tick(sim, STEP);
    const refused = sim.standingOrdersSnapshot().orders[0];
    assert.equal(refused.status, 'failed');
    assert.match(refused.reason, /OUT_OF_REACH: GRADE needs an ungraded corridor stake within 2\.5wu/);
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }, { verb: 'GRADE' }, { verb: 'HAUL' }]);
    for (let waited = 0; waited < 40 && motor(sim).vehicle.state !== 'arrived'; waited += 1) tick(sim, 0.5);
    const staged = motor(sim);
    assert.deepEqual(staged.roads.graded, ['camp-to-railhead']);
    assert.equal(staged.roads.segments, 1);
    assert.equal(staged.roads.length, 60);
    assert.equal(staged.vehicle.state, 'arrived');
    // 0.6, not 0.2: `HAUL` brings the Hauler to the body that called it, and that body is now the
    // hero, which completes a walk inside `HERO_ARRIVE_RADIUS` (`Balance.hero.radius`, 0.5) where
    // the Prospector completed one inside `Balance.agent.arriveRadius` (0.16). The Hauler is as
    // exact as it ever was; the caller is a wider body.
    assert.ok(Math.hypot(staged.vehicle.x, staged.vehicle.z - 12) < 0.6, `the Hauler rests at the stake: (${staged.vehicle.x}, ${staged.vehicle.z})`);
    assert.ok(staged.vehicle.distanceTravelled > 28 && staged.vehicle.distanceTravelled < 29, `staged ${staged.vehicle.distanceTravelled}`);
    const stagedFuel = staged.fuel.drawn;
    // Off-road: 28.2 units at 9/s burn 3/s = 9.4 fuel, plus the road's last unit-and-a-bit at 0.4x.
    assert.ok(stagedFuel > 9 && stagedFuel < 13.5, `off-road burn ${stagedFuel}`);
    assert.equal(staged.objective.arrived, false);

    // The road leg: the HERO walks to the railhead and calls the Hauler up the graded corridor.
    // The railhead stake itself is not standable — `Terrain.sample(0, 72).walkable` is false — so
    // the plan aims one unit short of it and the Hauler that comes to the hero is still inside
    // `objective.stopReach`. This is the aim ladder `scripts/e4-motor-floor.mjs` writes as orders,
    // spelled out here: MOVE_HERO refuses the stake outright and the next rung takes the tick.
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: 0, z: 72 } }, { verb: 'MOVE_HERO', pos: { x: 0, z: 71 } }, { verb: 'HAUL' }]);
    tick(sim, STEP);
    assert.match(sim.standingOrdersSnapshot().orders[0].reason, /UNREACHABLE_TERRAIN/, 'the railhead stake is not ground a hero can stand on');
    for (let waited = 0; waited < 80 && !motor(sim).objective.arrived; waited += 1) tick(sim, 0.5);
    const arrived = motor(sim);
    assert.equal(arrived.objective.arrived, true);
    assert.equal(arrived.objective.securableAtWave, 12);
    assert.ok(Math.hypot(arrived.vehicle.x, arrived.vehicle.z - 72) <= arrived.objective.stopReach, `the Hauler rests within reach of the railhead: (${arrived.vehicle.x}, ${arrived.vehicle.z})`);
    const roadLeg = arrived.vehicle.roadDistance - staged.vehicle.roadDistance;
    const roadFuel = arrived.fuel.drawn - stagedFuel;
    // 58, not 59: the corridor is 60 units and the leg is now bounded by where a HERO can stand at
    // each end — inside `Balance.hero.radius` of the stake, and one unit short of the unstandable
    // railhead. The road still carries the whole trip; it just starts and ends a body's width in.
    assert.ok(roadLeg > 58 && roadLeg <= 60.5, `road leg ${roadLeg}`);
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
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: -12, z: -8 } }]);
    for (let waited = 0; waited < 12 && motor(sim).fuel.harvestedNodes < 1; waited += 1) tick(sim, 0.5);
    tickTo(sim, 10.5); // into the storm (10s-22s of cycle 0)
    assert.equal(motor(sim).weather.phase, 'storm');
    submit(sim, [{ verb: 'HAUL' }]);
    tick(sim, STEP);
    const before = motor(sim).vehicle.distanceTravelled;
    tick(sim, 1);
    const stormStep = motor(sim).vehicle.distanceTravelled - before;
    assert.ok(Math.abs(stormStep - 9 * 0.7) < 0.05, `storm speed ${stormStep} vs ${9 * 0.7}`);
  } finally {
    await door.close();
  }
});

test("the Long Road's town gains only the ground its lead Hauler gains, and latches at the far stop", async () => {
  const door = await loadDoor('e4-long-road', 'e4-long-road-01');
  try {
    // The composition, read off the door exactly as a rider would.
    const sim = new door.HeadlessContractSim({ contractId: 'e4-long-road', seed: 'e4-long-road-01' });
    const opening = motor(sim);
    assert.equal(opening.convoy.members.length, 3);
    assert.equal(opening.convoy.total, 370);
    assert.equal(opening.convoy.leaderDistance, 0);
    assert.equal(opening.convoy.label, 'the far railhead');
    assert.equal(opening.objective.arrived, false);

    // The physics, driven on the socket itself, because proving "backwards moves the town nowhere"
    // needs a Hauler driven 380 units the wrong way and back, and no Prospector survives that walk
    // on this map (the floor ride below is what proves the same latch inside a real run).
    const socket = door.MotorSocket.MotorSocket.create(door.contracts.loadContract('e4-long-road'));
    const events = [];
    const emit = (event) => events.push(event);
    let time = 0;
    const step = (seconds) => {
      for (let index = 0; index < Math.round(seconds / STEP); index += 1) {
        time += STEP;
        socket.update(STEP, time, [], emit);
      }
    };
    const read = () => socket.diagnostics(time, 12);
    // Fuel it the way the map does: the Prospector stands at each tar node for the dwell.
    for (const node of read().fuel.nodes) {
      const actor = { x: node.x, y: 0, z: node.z };
      for (let index = 0; index < 30; index += 1) { time += STEP; socket.update(STEP, time, [actor], emit); }
    }
    assert.equal(read().fuel.harvestedNodes, 3);
    assert.equal(socket.gradeAt({ x: -190, z: 0 }, time, emit).ok, true);
    assert.deepEqual(read().roads.graded, ['the-long-road']);

    // West first: the Hauler gives ground, and the town keeps every inch it had.
    assert.equal(socket.haulTo({ x: -190, z: 0 }, time, emit).ok, true);
    step(4);
    assert.ok(read().vehicle.x < -188, `the Hauler drove west: ${read().vehicle.x}`);
    assert.equal(read().convoy.leaderDistance, 0, 'the town did not follow it backwards');
    assert.equal(read().objective.arrived, false);

    // Then east, the whole road. The town tracks the Hauler's gain and latches at the far stop.
    assert.equal(socket.haulTo({ x: 190, z: 0 }, time, emit).ok, true);
    for (let waited = 0; waited < 400 && !socket.objectiveAllowsSecure; waited += 1) step(0.5);
    const arrived = read();
    assert.equal(socket.objectiveAllowsSecure, true);
    assert.equal(arrived.objective.arrived, true);
    assert.equal(arrived.objective.securableAtWave, 12);
    assert.equal(arrived.convoy.arrived, true);
    assert.equal(arrived.convoy.leaderDistance, 370);
    assert.ok(arrived.convoy.members.slice(1).every((member) => member.gap > 0), 'followers ride behind the leader');
    assert.ok(arrived.vehicle.roadDistance > 360, `the whole trip rode the grade: ${arrived.vehicle.roadDistance}`);
    assert.ok(events.some(({ type }) => type === 'motor_convoy_arrived'));
    assert.equal(socket.simulationSnapshot.convoy.arrived, true);
  } finally {
    await door.close();
  }
});

test('Gusher County washes out one lease per storm, refuses a delivery through it, and takes it when it reopens', async () => {
  const door = await loadDoor('e4-gusher-county', 'e4-gusher-county-01');
  try {
    const sim = new door.HeadlessContractSim({ contractId: 'e4-gusher-county', seed: 'e4-gusher-county-01' });
    // The closure schedule is the weather clock alone: cycle 30s, clear 6, telegraph 4, storm 12-22s.
    assert.deepEqual(motor(sim).roads.closed, []);
    assert.equal(motor(sim).roads.closesNext, 'camp-to-west-lease');
    assert.deepEqual(motor(sim).objective.remaining, ['camp-to-west-lease', 'camp-to-east-lease', 'camp-to-north-lease']);

    // Fuel and grade the west lease from its stake, which is also a tar node.
    for (const node of motor(sim).fuel.nodes) {
      submit(sim, [{ verb: 'MOVE_HERO', pos: { x: node.x, z: node.z } }]);
      for (let waited = 0; waited < 60 && !motor(sim).fuel.nodes.find((entry) => entry.x === node.x).harvested; waited += 1) tick(sim, 0.5);
    }
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: -12, z: -8 } }, { verb: 'GRADE' }]);
    for (let waited = 0; waited < 30 && motor(sim).roads.graded.length === 0; waited += 1) tick(sim, 0.5);
    assert.deepEqual(motor(sim).roads.graded, ['camp-to-west-lease']);

    // Park the Hauler at the west lease head DURING cycle 0's storm: the road is shut, so no delivery.
    // This lease head IS standable ground, so the aim needs no ladder rung.
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: -50, z: -40 } }, { verb: 'HAUL' }]);
    for (let waited = 0; waited < 60 && motor(sim).vehicle.state !== 'arrived'; waited += 1) tick(sim, 0.5);
    assert.equal(motor(sim).vehicle.state, 'arrived');
    for (let waited = 0; waited < 120 && motor(sim).weather.phase !== 'storm'; waited += 1) tick(sim, 0.5);
    const shut = motor(sim);
    assert.equal(shut.weather.phase, 'storm');
    const closed = shut.roads.closed;
    assert.equal(closed.length, 1, `exactly one lease shuts: ${JSON.stringify(closed)}`);
    assert.equal(shut.roads.corridors.find(({ id }) => id === closed[0]).closed, true);
    if (closed[0] === 'camp-to-west-lease') {
      assert.deepEqual(shut.objective.delivered, [], 'a washed-out lease takes no delivery');
      assert.ok(shut.events.some(({ type }) => type === 'motor_road_closed'));
      // The storm lifts; the lease reopens and the Hauler that never moved delivers on the spot.
      for (let waited = 0; waited < 120 && motor(sim).roads.closed.length > 0; waited += 1) tick(sim, 0.5);
      const open = motor(sim);
      assert.deepEqual(open.roads.closed, []);
      assert.deepEqual(open.objective.delivered, ['camp-to-west-lease'], 'the same Hauler, the same spot, an open road');
      assert.ok(open.events.some(({ type }) => type === 'motor_road_reopened'));
      assert.ok(open.events.some(({ type }) => type === 'motor_lease_delivered'));
    } else {
      // The Hauler reached the head under a different cycle's closure, so the west lease was open.
      assert.deepEqual(shut.objective.delivered, ['camp-to-west-lease']);
    }
    assert.equal(motor(sim).objective.arrived, false, 'one lease of three is not the errand');
    assert.equal(motor(sim).objective.securableAtWave, null);
  } finally {
    await door.close();
  }
});

test('the Boneyard hitches its hulk where it lies and delivers it at the gate end of the road', async () => {
  const door = await loadDoor('e4-boneyard', 'e4-boneyard-01');
  try {
    const sim = new door.HeadlessContractSim({ contractId: 'e4-boneyard', seed: 'e4-boneyard-01' });
    assert.deepEqual(motor(sim).objective.hulk, { id: 'spent-boiler-west', kind: 'boiler', x: -18, z: -8 });
    assert.equal(motor(sim).objective.hitched, false);
    for (const node of motor(sim).fuel.nodes) {
      submit(sim, [{ verb: 'MOVE_HERO', pos: { x: node.x, z: node.z } }]);
      for (let waited = 0; waited < 60 && !motor(sim).fuel.nodes.find((entry) => entry.x === node.x).harvested; waited += 1) tick(sim, 0.5);
    }
    // Leg one: the Hauler comes to the boiler and takes it on the hook. The hulk blocks a disc about
    // two units wide around its own stake, so the plan's second aim rung is what stands: the hero
    // walks up beside the boiler and the Hauler comes to the hero, inside `stopReach` of the hulk.
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: -18, z: -8 } }, { verb: 'MOVE_HERO', pos: { x: -18, z: -10 } }, { verb: 'HAUL' }]);
    for (let waited = 0; waited < 80 && !motor(sim).objective.hitched; waited += 1) tick(sim, 0.5);
    const hitched = motor(sim);
    assert.equal(hitched.objective.hitched, true);
    assert.ok(hitched.objective.hitchedAt > 0);
    assert.equal(hitched.objective.arrived, false, 'a hitched hulk is not a delivered hulk');
    assert.deepEqual(hitched.objective.stop, { x: -8, z: -38 }, 'the stop moves to the gate once the hook is on');
    assert.ok(hitched.events.some(({ type }) => type === 'motor_tow_hitched'));
    // Leg two: back down the gate road. The gate stake IS standable ground.
    submit(sim, [{ verb: 'MOVE_HERO', pos: { x: -8, z: -38 } }, { verb: 'HAUL' }]);
    for (let waited = 0; waited < 80 && !motor(sim).objective.arrived; waited += 1) tick(sim, 0.5);
    const delivered = motor(sim);
    assert.equal(delivered.objective.arrived, true);
    assert.equal(delivered.objective.securableAtWave, 12);
    assert.ok(delivered.events.some(({ type }) => type === 'motor_tow_delivered'));
    assert.equal(delivered.objective.hitched, true, 'delivered with the hulk still on the hook');
  } finally {
    await door.close();
  }
});

test('the contract schema fails closed: unknown motor fields, two errands, an errand naming no corridor, a tow with no such hulk', async () => {
  const door = await loadDoor(DUST_FLATS, SEED);
  try {
    const { contractDescriptorJson, loadContract, parseContractDescriptor } = door.contracts;
    const reasonsFor = (contract, mutate) => {
      const template = loadContract(contract);
      const authored = structuredClone(template);
      mutate(authored);
      const parsed = parseContractDescriptor(contractDescriptorJson(authored), template);
      return parsed.ok ? [] : parsed.reasons.map((reason) => `${reason.code}@${reason.path}`);
    };
    for (const map of MAPS) assert.deepEqual(reasonsFor(map.id, () => undefined), [], `${map.id} parses as authored`);
    // Through the editor the template's own shape answers first, and it is the stricter answer: a
    // second errand is an unknown field on THIS contract, a missing one is a missing field.
    assert.ok(reasonsFor(DUST_FLATS, (a) => { a.twist.motorFrontier.tow = { hulkId: 'x', corridorId: 'camp-to-railhead', label: 'y' }; }).includes('field_unknown@twist.motorFrontier.tow'), 'two errands');
    assert.ok(reasonsFor(DUST_FLATS, (a) => { delete a.twist.motorFrontier.haul; }).includes('field_missing@twist.motorFrontier.haul'), 'no errand');
    // And the exactly-one rule itself, reached by making the mutated contract its OWN template, which
    // is the shape a hand-authored bundle presents to the eager validation at module-evaluation time.
    const ownTemplate = (contract) => (mutate) => {
      const authored = structuredClone(loadContract(contract));
      mutate(authored);
      const parsed = parseContractDescriptor(contractDescriptorJson(authored), authored);
      return parsed.ok ? [] : parsed.reasons.map((reason) => `${reason.code}@${reason.path}`);
    };
    const selfTemplate = ownTemplate(DUST_FLATS);
    const gusherSelfTemplate = ownTemplate('e4-gusher-county');
    assert.ok(selfTemplate((a) => { a.twist.motorFrontier.tow = { hulkId: 'spent-boiler-west', corridorId: 'camp-to-railhead', label: 'y' }; }).includes('motor_frontier@twist.motorFrontier'), 'exactly one errand: two rejected');
    assert.ok(selfTemplate((a) => { delete a.twist.motorFrontier.haul; }).includes('motor_frontier@twist.motorFrontier'), 'exactly one errand: none rejected');
    assert.ok(reasonsFor(DUST_FLATS, (a) => { a.twist.motorFrontier.cargo = true; }).includes('field_unknown@twist.motorFrontier.cargo'));
    assert.ok(reasonsFor(DUST_FLATS, (a) => { a.twist.motorFrontier.haul.corridorId = 'no-such-road'; }).includes('motor_frontier@twist.motorFrontier.haul'));
    // A Hauler with no finite start and a Motor Frontier with no weather are caught by the shape
    // layer's own field rules, one layer earlier than the socket's; both still fail closed.
    assert.ok(reasonsFor(DUST_FLATS, (a) => { a.twist.motorFrontier.vehicle = { start: { x: 'west', z: 0 } }; }).includes('field_number@twist.motorFrontier.vehicle.start.x'));
    assert.ok(reasonsFor(DUST_FLATS, (a) => { delete a.twist.weather; }).includes('field_missing@twist.weather'));
    assert.ok(selfTemplate((a) => { delete a.twist.weather; }).includes('motor_frontier@twist.motorFrontier'), 'storms with no weather');
    assert.ok(reasonsFor('e4-long-road', (a) => { a.twist.motorFrontier.convoy.corridorId = 'no-such-road'; }).includes('motor_frontier@twist.motorFrontier.convoy'));
    assert.ok(reasonsFor('e4-gusher-county', (a) => { a.twist.motorFrontier.deliveries.corridorIds = ['camp-to-west-lease', 'camp-to-west-lease', 'camp-to-north-lease']; }).includes('motor_frontier@twist.motorFrontier.deliveries'), 'the same road twice is no choice');
    assert.ok(gusherSelfTemplate((a) => { a.twist.motorFrontier.deliveries.corridorIds = ['camp-to-west-lease']; }).includes('motor_frontier@twist.motorFrontier.deliveries'), 'one road is no choice');
    assert.ok(reasonsFor('e4-boneyard', (a) => { a.twist.motorFrontier.tow.hulkId = 'no-such-hulk'; }).includes('motor_frontier@twist.motorFrontier.tow'));
    // The grammar: both verbs are targetless and refuse any extra key, like CAPTURE.
    const { validateStandingOrders } = door.orders;
    assert.deepEqual(validateStandingOrders([{ verb: 'GRADE' }, { verb: 'HAUL' }]), { ok: true, orders: [{ verb: 'GRADE' }, { verb: 'HAUL' }] });
    assert.equal(validateStandingOrders([{ verb: 'GRADE', pos: { x: 0, z: 0 } }]).ok, false);
    assert.equal(validateStandingOrders([{ verb: 'HAUL', to: 'railhead' }]).ok, false);
  } finally {
    await door.close();
  }
});

for (const map of MAPS) {
  test(`${map.id}: idle cannot secure and pins its hash; the floor lands the errand and pins its own`, async () => {
    const door = await loadDoor(map.id, `${map.id}-01`);
    try {
      const seed = `${map.id}-01`;
      const idle = rideTurns(door.HeadlessContractSim, map.id, seed, null);
      assert.equal(idle.outcome.secured, false);
      assert.equal(idle.leaked, false, 'the secure gate never opens on an unmet errand');
      assert.equal(idle.outcome.waves, map.idle.waves);
      assert.equal(idle.outcome.kills, map.idle.kills);
      assert.equal(idle.outcome.eventLogHash, map.idle.eventLogHash);
      assert.equal(idle.outcome.motor.hauled, false);
      assert.deepEqual(idle.outcome.motor.graded, []);
      assert.equal(idle.view.now.motor.objective.securableAtWave, null);

      const floor = rideTurns(door.HeadlessContractSim, map.id, seed, (view) => motorFloorOrders(view));
      assert.equal(floor.leaked, false);
      assert.equal(floor.arrivedWave, map.floor.objWave, 'the errand lands on its pinned wave');
      assert.deepEqual(floor.outcome.motor, map.motor);
      assert.equal(floor.view.now.motor.objective.securableAtWave, map.floor.securableAtWave);
      // L2 (winnability) is NOT claimed by these pins: no floor variant secures a Motor map yet, the
      // audit's own ceiling for this era. They certify that the MECHANIC fired and the gate opened.
      assert.equal(floor.outcome.secured, false);
      assert.equal(floor.outcome.waves, map.floor.waves);
      assert.equal(floor.outcome.kills, map.floor.kills);
      assert.equal(floor.outcome.eventLogHash, map.floor.eventLogHash);
      assert.deepEqual(rideTurns(door.HeadlessContractSim, map.id, seed, (view) => motorFloorOrders(view)).outcome, floor.outcome, 'the same seed and the same policy replay identically');
      // The policy is idempotent against the view: once the errand has landed it issues no motor
      // step. Read from the HERO now, the body the plan walks. On the Long Road the errand never
      // lands (F-RPG-10), so what is pinned instead is the aim ladder the floor is still offering
      // the refused stop: a plan that gave up would be the same silence as a plan that finished.
      assert.deepEqual(motorSteps(floor.view.now.motor, floor.view.now.hero), map.floor.residual);
    } finally {
      await door.close();
    }
  });
}
