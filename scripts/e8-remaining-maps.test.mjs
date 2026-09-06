// THE MARE CLAIM'S THREE SIBLINGS RIDE UNDER ITS PHYSICS — the guard for
// `tasks/e8-remaining-maps.md`.
//
// The 2026-09-02 era-mechanic audit filed `e8-far-side` and `e8-eclipse` as RESKIN and
// `e8-low-orbit` as PARTIAL: the contracts declare `tileParams.gravity` and
// `tileParams.atmosphere`, and no headless consumer read the atmosphere half
// (`docs/audits/2026-09-02-era-mechanic-audit.md`). `e8-mare-claim-physics` cured the Mare Claim.
// This file pins the cure for the other three, in five parts:
//
//   1. THE GRAVITY HALF WAS ALREADY THERE, and the audit rows saying otherwise are stale: all
//      three publish `now.gravity` off the same `E8PhysicsSystem` both engines construct.
//   2. AIR AS THE WALL, on each map's OWN declared geography: the suit drains outside a breathing
//      shelter and refills inside one; only a contract whose air `airIsWall` is true lets a sieger
//      breach a shelter; a crossing made with an empty suit is counted and credits nothing.
//   3. THE ECLIPSE REMOVES A ROUTE. Mid-run the shadow takes the solar-fed pads offline and leaves
//      one reserve, and the secure then needs a ground worked on air AFTER it landed.
//   4. THE SECURE TURNS ON THE MECHANIC — one seed, one order set, two latches: with the crossing
//      unmade the wave-20 boundary never offers a secure; made, it offers and banks.
//   5. MUTATION PROOFS — remove the composition and this file goes red: each map's event-log hash
//      falls back to exactly the hash pinned in `assets/contracts/null-floors.json` for the
//      un-composed engine, `now.air` disappears from the view, and the latch stops existing. The
//      Mare Claim is the CONTROL: composed or not, its own hash never moves under this diff.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');
const floors = JSON.parse(read('assets/contracts/null-floors.json')).floors;
const bundle = JSON.parse(read('assets/contracts/epoch-8-orbital/contracts.json')).contracts;
const manifestOf = (id) => bundle.find((entry) => entry.id === id);

// MEASURED on this tree, 2026-09-05 (node v23.11.1), idle policy, 400-decision bound. Re-derivable
// with `artifacts/e8-remaining-maps/probe-armed.mjs`; the un-composed column is the pinned null
// floor, which is what makes "the audit's engine" a checkable claim rather than a memory.
const IDLE = {
  'e8-far-side': { seed: 'e8-far-side-01', composed: 'fnv1a32:5c30efd5', waves: 2, timeMs: 79_400, kills: 30 },
  'e8-low-orbit': { seed: 'e8-low-orbit-01', composed: 'fnv1a32:6e1931c2', waves: 2, timeMs: 78_333, kills: 33 },
  'e8-eclipse': { seed: 'e8-eclipse-01', composed: 'fnv1a32:466507ac', waves: 2, timeMs: 81_800, kills: 32 },
};
// THE CONTROL, pinned by `reviews/e8-mare-claim-physics.md` before this slice existed.
// RE-POINTED 2026-09-06 by `tasks/mare-claim-air-prevalent.md` (owner ruling: "no, this has to be
// more prevalent"), from `fnv1a32:1a62757f`. This row is the MARE CLAIM's, which that slice owns;
// every sibling row in this file is deliberately untouched, and this test's point survives intact —
// the Mare Claim still rides byte-identically with `E8SuitAirSystem` composed and with it gone, and
// the outcome fields below are unmoved. Attribution:
// `artifacts/mare-claim-air-prevalent/floor-attribution.json`.
//
// KNOWN RED IN THIS FILE, NOT THIS ROW AND NOT THIS SLICE (F-MCAP-4): the sibling test above
// asserts each un-composed idle hash equals that map's PINNED NULL FLOOR while also asserting it
// differs from the composed one, and the floors hold the composed value. Measured on a pristine
// `main` (502a398d9) with every file of this slice reverted: the same test fails with the same
// numbers, `e8-far-side` un-composed `fnv1a32:3fe83eca` against the pinned `fnv1a32:5c30efd5`.
const MARE_CLAIM = { seed: 'e8-mare-claim-01', hash: 'fnv1a32:32f62335', waves: 2, timeMs: 81_233, kills: 32 };

const location = new URL('http://gr-sim.local/?debug&contract=e8-far-side&seed=e8-far-side-01');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const { E8SuitAirSystem, SUIT_AIR_CONTRACT_IDS } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
const { SUIT_AIR_SECONDS, REGOLITH_GROUNDS_FOR_SECURE, E8AtmosphereSystem } = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
after(() => vite.close());

const centreOf = (zone) => ({ x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 });
const zoneOf = (id, contractId) => {
  const tile = manifestOf(contractId).tileParams;
  return [...(tile.buildZones ?? []), ...(tile.orbitalScaffoldZones ?? []), ...(tile.probeRecoveryZones ?? [])]
    .find((zone) => zone.id === id);
};

/** One idle ride, bounded exactly as the null-floor policy rides. */
function idleRide(contractId, seed) {
  const sim = new HeadlessContractSim({ contractId, seed });
  let turn = sim.currentTurn();
  for (let decisions = 0; decisions < 400 && !turn.terminal; decisions += 1) turn = sim.advanceToTurn();
  return { view: turn.view, terminal: turn.terminal, outcome: turn.terminal ? sim.outcome() : null };
}

/**
 * One CROSSING ride, re-submitting its orders every turn. The re-submission is not decoration:
 * `StandingOrders.tick` returns on the first order that yields a result and a HOLD yields one
 * every tick, so a `recover` queued behind one never runs at all (measured over 45 turns). Fresh
 * records each turn put the verb back in front.
 */
function crossingRide(contractId, seed, { immortal = false, stopAtWave = null, maxDecisions = 200 } = {}) {
  const sim = new HeadlessContractSim({ contractId, seed });
  if (immortal) {
    // `scripts/twin-banks-hash-probe.mjs:47-49`: outlive the map's null floor (wave 2) so the
    // wave-20 secure boundary can be observed at all. It changes no air rule.
    sim.hero.applyStats(10_000, 1);
    sim.hero.heal(10_000);
  }
  let turn = sim.currentTurn();
  let offered = false;
  let decisions = 0;
  while (!turn.terminal && decisions < maxDecisions) {
    const now = turn.view.now;
    if (now.pendingSecure) {
      offered = true;
      assert.equal(sim.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome.ok, true);
    } else {
      const crossing = now.air?.crossing;
      const next = crossing?.zones.find((id) => !crossing.reached.includes(id)) ?? crossing?.zones.at(-1);
      const orders = [];
      if (now.probeRecovery && !now.probeRecovery.recovered) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
      if (next) orders.push({ verb: 'HOLD', pos: centreOf(zoneOf(next, contractId)) });
      if (orders.length) assert.equal(sim.submitOrders(orders).outcome.ok, true);
    }
    if (stopAtWave !== null && turn.view.now.wave >= stopAtWave) break;
    turn = sim.advanceToTurn();
    decisions += 1;
  }
  return { sim, view: turn.view, terminal: turn.terminal, offered, outcome: turn.terminal ? sim.outcome() : null };
}

/** Swap a static or prototype member for the length of one call — the mutation-proof lever. */
function withPatch(target, key, value, body) {
  const original = Object.getOwnPropertyDescriptor(target, key);
  assert.ok(original, `nothing to patch at ${key}`);
  Object.defineProperty(target, key, { value, writable: true, enumerable: Boolean(original.enumerable), configurable: true });
  try {
    return body();
  } finally {
    Object.defineProperty(target, key, original);
  }
}

test('the gravity half was already composed: all three publish the profile the browser holds', () => {
  // The audit's E8 rows read "No physics" for the Far Side and the Eclipse. That was true when it
  // was written and is not true now: `HeadlessContractSim` constructs `E8PhysicsSystem` from the
  // manifest for EVERY contract, so the profile has been on all three since the Mare Claim slice.
  // Measured here rather than asserted from the audit, which is exactly the point.
  const expected = {
    'e8-far-side': { source: 'gravity', movement: 'floaty', feelG: 0.6, lobArcDistanceMultiplier: 2.4, vacuum: true },
    'e8-low-orbit': { source: 'zero-gravity', movement: 'free-fall', feelG: 0, lobArcDistanceMultiplier: 4.8, orbitalReturn: true },
    'e8-eclipse': { source: 'gravity', movement: 'floaty', feelG: 0.6, lobArcDistanceMultiplier: 2.4, vacuum: true },
  };
  for (const [contractId, profile] of Object.entries(expected)) {
    const sim = new HeadlessContractSim({ contractId, seed: IDLE[contractId].seed });
    const gravity = sim.currentTurn().view.now.gravity;
    assert.ok(gravity, `${contractId} must publish now.gravity`);
    for (const [key, value] of Object.entries(profile)) assert.equal(gravity[key], value, `${contractId}.${key}`);
  }
});

test('the air wall arms on each map own declaration, and on nothing else', () => {
  for (const contractId of SUIT_AIR_CONTRACT_IDS) {
    const air = E8SuitAirSystem.create(manifestOf(contractId));
    assert.equal(air.isDeclared, true, `${contractId} must arm its own suit air`);
  }
  // THE MARE CLAIM IS NOT ON THIS LIST, and that is the whole shape of the split: its air stays
  // `E8AtmosphereSystem`'s. The two consumers can never both be declared for one contract.
  const mareClaim = manifestOf('e8-mare-claim');
  assert.equal(E8SuitAirSystem.create(mareClaim).isDeclared, false, 'the Mare Claim keeps its own consumer');
  assert.equal(E8AtmosphereSystem.create(mareClaim).isDeclared, true);
  for (const contractId of SUIT_AIR_CONTRACT_IDS) {
    assert.equal(E8AtmosphereSystem.create(manifestOf(contractId)).isDeclared, false, `${contractId} must not arm the Mare Claim consumer`);
  }
  // Every other contract in the game: inert, with its terminal moves intact.
  for (const id of ['the-claim', 'e5-regatta', 'e10-last-claim']) {
    const other = E8SuitAirSystem.create({ ...manifestOf('e8-eclipse'), id });
    assert.equal(other.isDeclared, false, `${id} must not arm the suit air`);
    assert.equal(other.objectiveAllowsSecure, true, `${id} must keep its terminal moves`);
  }
});

test('air is the wall: the suit drains outside a shelter, refills inside one, and only a wall map breaches', () => {
  const air = E8SuitAirSystem.create(manifestOf('e8-eclipse'));
  const inside = centreOf(zoneOf('dome-cluster-pad-center', 'e8-eclipse'));
  const outside = { x: 40, z: 40 };

  // Outside every shelter: one second of air per second, and nothing else moves.
  for (let step = 0; step < 300; step += 1) air.update(1 / 30, outside, [], 1);
  const drained = air.diagnostics;
  assert.equal(drained.suit.seconds, SUIT_AIR_SECONDS - 10);
  assert.equal(drained.suit.inDome, null);
  assert.deepEqual(drained.domes.map((pad) => [pad.breached, pad.air]), [[false, 1], [false, 1], [false, 1]]);

  // Inside a breathing shelter: refill at the published rate, capped at the suit's capacity.
  air.update(1, inside, [], 1);
  assert.equal(air.diagnostics.suit.seconds, SUIT_AIR_SECONDS - 10 + drained.suit.refillPerSecond);
  assert.equal(air.diagnostics.suit.inDome, 'dome-cluster-pad-center');

  // A sieger on the pad breaches it, because THIS contract authors `airIsWall: true`.
  air.update(9, inside, [{ isAlive: true, position: inside }], 1);
  const breached = air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center');
  assert.deepEqual(
    { breached: breached.breached, breaches: breached.breaches, siegers: breached.siegers, air: breached.air },
    { breached: true, breaches: 1, siegers: 1, air: 0.8 },
  );
  air.update(3, inside, [], 1);
  assert.equal(air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center').breached, false);
  // A dead body is not a siege.
  air.update(1, inside, [{ isAlive: false, position: inside }], 1);
  assert.equal(air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center').siegers, 0);

  // THE FAR SIDE AUTHORS `airIsWall: false`, so a sieger standing in the lander's yard is a
  // threat to the body and not to the air. The two maps read the same field and answer differently.
  const farSide = E8SuitAirSystem.create(manifestOf('e8-far-side'));
  const yard = centreOf(zoneOf('far-side-landing-yard', 'e8-far-side'));
  farSide.update(9, yard, [{ isAlive: true, position: yard }], 1);
  assert.deepEqual(
    farSide.diagnostics.domes.map((pad) => [pad.id, pad.breached, pad.breaches, pad.air]),
    [['far-side-landing-yard', false, 0, 1]],
  );
});

test('the crossing is made on air, or it is not made: a breathless entry counts and credits nothing', () => {
  const crater = centreOf(zoneOf('listening-probe-crater', 'e8-far-side'));
  const yard = centreOf(zoneOf('far-side-landing-yard', 'e8-far-side'));

  const made = E8SuitAirSystem.create(manifestOf('e8-far-side'));
  assert.equal(made.objectiveAllowsSecure, false, 'an uncrossed Far Side cannot secure');
  made.update(1, crater, [], 1);
  assert.deepEqual(made.diagnostics.crossing, {
    zones: ['listening-probe-crater'],
    required: 1,
    reached: ['listening-probe-crater'],
    breathlessEntries: 0,
    complete: true,
  });
  assert.equal(made.objectiveAllowsSecure, true);

  // An ENTRY is what counts, not a step: thirty steps parked in the crater are one crossing.
  const parked = E8SuitAirSystem.create(manifestOf('e8-far-side'));
  for (let step = 0; step < 30; step += 1) parked.update(1 / 30, crater, [], 1);
  assert.equal(parked.diagnostics.crossing.reached.length, 1);
  assert.equal(parked.diagnostics.crossing.breathlessEntries, 0);

  // BREATHLESS: spend the whole suit outside, then stand in the crater. The entry is counted and
  // the crossing is NOT credited, which is the whole reason the wall is a wall.
  const starved = E8SuitAirSystem.create(manifestOf('e8-far-side'));
  for (let step = 0; step < SUIT_AIR_SECONDS + 1; step += 1) starved.update(1, { x: 0, z: 10 }, [], 1);
  assert.equal(starved.diagnostics.suit.empty, true);
  starved.update(1, crater, [], 1);
  assert.deepEqual(
    { reached: starved.diagnostics.crossing.reached, breathless: starved.diagnostics.crossing.breathlessEntries },
    { reached: [], breathless: 1 },
  );
  assert.equal(starved.objectiveAllowsSecure, false);

  // AND IT IS NOT A DEAD END (L2). Walk back to the lander's air, refill, cross again: credited.
  for (let step = 0; step < 30; step += 1) starved.update(1, yard, [], 1);
  assert.equal(starved.diagnostics.suit.seconds, SUIT_AIR_SECONDS);
  starved.update(1, { x: 0, z: 10 }, [], 1);
  starved.update(1, crater, [], 1);
  assert.equal(starved.objectiveAllowsSecure, true);
  assert.equal(starved.diagnostics.crossing.breathlessEntries, 1, 'the refused entry stays on the record');
});

test('low orbit crosses its three authored decks, and the returning-lob seam is untouched', () => {
  const air = E8SuitAirSystem.create(manifestOf('e8-low-orbit'));
  const decks = ['west-scaffold-deck', 'claw-carcass-yard', 'east-scaffold-deck'];
  assert.deepEqual(air.diagnostics.crossing.zones, decks);
  assert.equal(air.diagnostics.crossing.required, 3);
  for (const deck of decks) {
    assert.equal(air.objectiveAllowsSecure, false);
    air.update(1, centreOf(zoneOf(deck, 'e8-low-orbit')), [], 1);
    air.update(1, { x: 0, z: 40 }, [], 1);
  }
  assert.equal(air.objectiveAllowsSecure, true);
  assert.deepEqual(air.diagnostics.crossing.reached, decks);

  // THE PROVEN SEAM IS KEPT, and this is a claim about a file rather than about this one: the
  // drift/debris scaling still reaches `filterMovement` through the sim's own movement seam, and
  // `LowOrbitSystem` carries no import of this consumer.
  const sim = read('src/sim/HeadlessContractSim.ts');
  assert.match(sim, /this\.e8Physics\.filterMovement\(0, intents\.move, STEP_SECONDS, this\.hero\.velocity, terrain\)/);
  assert.match(sim, /controlScale: this\.lowOrbit\.controlScale\(position\.x, position\.z\)/);
  assert.match(sim, /speedScale: this\.lowOrbit\.speedScale\(position\.x, position\.z\)/);
  assert.doesNotMatch(read('src/systems/LowOrbitSystem.ts'), /E8SuitAirSystem/);
});

test('the eclipse removes an air route mid-run, and the secure needs a ground worked after it', () => {
  const air = E8SuitAirSystem.create(manifestOf('e8-eclipse'));
  const before = air.diagnostics.eclipse;
  assert.deepEqual(
    { arrived: before.arrived, arrivedAtWave: before.arrivedAtWave, solar: before.solar, offline: before.offline },
    { arrived: false, arrivedAtWave: null, solar: 'online', offline: [] },
    'the first run gets no warning: the contract authors firstRunWarning false',
  );
  assert.equal(before.reserve, 'dome-cluster-pad-center', 'the reserve is the shelter nearest the origin');
  assert.equal(before.requiredAfter, REGOLITH_GROUNDS_FOR_SECURE);

  // The regolith latch alone, satisfied BEFORE the shadow: the map may secure on it.
  assert.equal(air.notePan(3), true);
  assert.equal(air.objectiveAllowsSecure, true);

  // MID-RUN, read off the run's own boundary: `Balance.run.secureWave` is 20, so wave 10.
  const outside = { x: 40, z: 40 };
  air.update(1 / 30, outside, [], 9);
  assert.equal(air.diagnostics.eclipse.arrived, false, 'wave 9 is not mid-run yet');
  air.update(1 / 30, outside, [], 10);
  const after = air.diagnostics.eclipse;
  assert.deepEqual(
    { arrived: after.arrived, arrivedAtWave: after.arrivedAtWave, solar: after.solar, offline: after.offline },
    {
      arrived: true,
      arrivedAtWave: 10,
      solar: 'offline',
      offline: ['dome-cluster-pad-west', 'dome-cluster-pad-east'],
    },
  );
  // THE ROUTE IS GONE, AND ONE REMAINS. The rim pads drain to nothing and never reseal; the
  // reserve keeps its air, so the transfer the map asks for is a transfer and not a death.
  const west = centreOf(zoneOf('dome-cluster-pad-west', 'e8-eclipse'));
  const centre = centreOf(zoneOf('dome-cluster-pad-center', 'e8-eclipse'));
  for (let step = 0; step < 60; step += 1) air.update(1, west, [], 10);
  const dials = Object.fromEntries(air.diagnostics.domes.map((pad) => [pad.id, pad.air]));
  assert.equal(dials['dome-cluster-pad-west'], 0, 'the rim pad has lost its solar life support');
  assert.equal(dials['dome-cluster-pad-east'], 0);
  assert.equal(dials['dome-cluster-pad-center'], 1, 'the reserve still breathes');
  assert.equal(air.diagnostics.suit.inDome, null, 'a dead pad is not a breath');
  air.update(1, centre, [], 10);
  assert.equal(air.diagnostics.suit.inDome, 'dome-cluster-pad-center', 'the transfer is the answer the map wants');

  // AND THE LATCH MOVED WITH IT: the pre-shadow run no longer opens the secure on its own.
  assert.equal(air.objectiveAllowsSecure, false, 'reserves are the objective now');
  assert.equal(air.notePan(4), true);
  assert.equal(air.diagnostics.eclipse.groundsWorkedAfter, 1);
  assert.equal(air.objectiveAllowsSecure, true);
});

test('the ride the audit measured, now carrying its air, and the un-composed hash it replaces', () => {
  for (const [contractId, pinned] of Object.entries(IDLE)) {
    const composed = idleRide(contractId, pinned.seed);
    assert.equal(composed.terminal, true, `${contractId} must terminate`);
    assert.deepEqual(
      { waves: composed.outcome.waves, timeMs: composed.outcome.timeMs, kills: composed.outcome.kills },
      { waves: pinned.waves, timeMs: pinned.timeMs, kills: pinned.kills },
      `${contractId}: the ride itself is unchanged, only its terminal facts grew`,
    );
    assert.equal(composed.outcome.eventLogHash, pinned.composed, `${contractId} composed hash`);
    assert.ok(composed.view.now.air, `${contractId} must publish now.air`);

    // THE FLOOR IS THE COMPOSED RIDE. Re-pointed 2026-09-06 (F-MCAP-4, attended drain of
    // mare-claim-air-prevalent): `assets/contracts/null-floors.json` was re-pinned to the COMPOSED idle
    // rides when air was composed on these three maps, so the line this replaces (un-composed hash
    // equals the floor) asserted the pre-composition world and reddened `test:node-guards` on main
    // (e8-far-side un-composed fnv1a32:3fe83eca against the pinned fnv1a32:5c30efd5, verified by
    // revert at 502a398d9). The same shape as the F-MCAP-3 cure in e8-mare-claim-physics.test.mjs.
    assert.equal(composed.outcome.eventLogHash, floors[contractId][pinned.seed].eventLogHash, `${contractId}: the pinned null floor is the composed idle ride`);

    // MUTATION PROOF. Remove the composition — `E8SuitAirSystem.create` answering `none()` is
    // exactly the engine the audit measured — and the hash leaves the pinned floor, the view loses
    // `now.air`, and the latch stops existing.
    const uncomposed = withPatch(E8SuitAirSystem, 'create', () => E8SuitAirSystem.none(), () => idleRide(contractId, pinned.seed));
    assert.notEqual(uncomposed.outcome.eventLogHash, floors[contractId][pinned.seed].eventLogHash, `${contractId}: without air the ride cannot sit on the composed floor`);
    assert.notEqual(uncomposed.outcome.eventLogHash, composed.outcome.eventLogHash);
    assert.equal(uncomposed.view.now.air, undefined);
    assert.equal(uncomposed.view.now.gravity !== undefined, true, 'the gravity profile is a separate composition');
  }
});

test('the Mare Claim is the control: byte-identical with the siblings composed and with them gone', () => {
  const composed = idleRide('e8-mare-claim', MARE_CLAIM.seed);
  assert.deepEqual(
    { secured: composed.outcome.secured, waves: composed.outcome.waves, timeMs: composed.outcome.timeMs, kills: composed.outcome.kills },
    { secured: false, waves: MARE_CLAIM.waves, timeMs: MARE_CLAIM.timeMs, kills: MARE_CLAIM.kills },
  );
  assert.equal(composed.outcome.eventLogHash, MARE_CLAIM.hash, 'the value reviews/e8-mare-claim-physics.md pinned');
  assert.equal(composed.view.now.air.crossing, undefined, 'the Mare Claim declares no crossing');
  assert.equal(composed.view.now.air.eclipse, undefined, 'the Mare Claim rides under no shadow');
  const withoutSiblings = withPatch(E8SuitAirSystem, 'create', () => E8SuitAirSystem.none(), () => idleRide('e8-mare-claim', MARE_CLAIM.seed));
  assert.equal(withoutSiblings.outcome.eventLogHash, MARE_CLAIM.hash, 'this diff cannot reach the Mare Claim at all');
});

test('the secure turns on the crossing: same seed, same orders, two latches', { timeout: 600_000 }, () => {
  // LATCH CLOSED — the run has not crossed on air, so the wave-20 boundary offers nothing.
  const closed = withPatch(
    Object.getPrototypeOf(E8SuitAirSystem.none()),
    'objectiveAllowsSecure',
    false,
    () => crossingRide('e8-far-side', IDLE['e8-far-side'].seed, { immortal: true, stopAtWave: 22 }),
  );
  assert.equal(closed.offered, false, 'a Far Side that has not crossed on air cannot be offered a secure');
  assert.ok(closed.view.now.wave >= 20, `the ride must reach the boundary to prove it was refused there (wave ${closed.view.now.wave})`);

  // LATCH OPEN — the same ride, the same seed, the crossing made: offered at 20 and banked.
  const open = crossingRide('e8-far-side', IDLE['e8-far-side'].seed, { immortal: true });
  assert.equal(open.offered, true);
  assert.equal(open.terminal, true);
  assert.equal(open.outcome.secured, true);
  assert.equal(open.outcome.waves, 20);
  assert.equal(open.view.now.air.crossing.complete, true);
  assert.equal(open.view.now.air.crossing.breathlessEntries >= 0, true);
  assert.equal(open.view.now.probeRecovery.recovered, true, 'A6 own latch still has to be satisfied too');
  console.log(JSON.stringify({ closedAtWave: closed.view.now.wave, open: open.outcome }));
});
