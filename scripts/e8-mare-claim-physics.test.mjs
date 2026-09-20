// THE MARE CLAIM RIDES UNDER ITS OWN PHYSICS — the guard for `tasks/e8-mare-claim-physics.md`.
//
// The 2026-09-02 era-mechanic audit filed `e8-mare-claim` as a RESKIN: the contract declares
// `tileParams.gravity` and `tileParams.atmosphere`, the BROWSER composes `E8PhysicsSystem`
// (`src/game/Game.ts:804`), and the engine a rider actually plays composed neither
// (`docs/audits/2026-09-02-era-mechanic-audit.md:47`). This file pins the cure in four parts:
//
//   1. ONE PROFILE, TWO ENGINES — the browser's constructor argument and the headless sim's are
//      the same contract, so the same profile comes out, and the three seams the browser reads it
//      at are mirrored line for line in the sim. Source-anchored, in `same-game-audit.mjs`'s
//      manner: an assertion about the OTHER engine that reads that engine's own text.
//   2. AIR AS THE WALL — the suit drains outside a breathing dome and refills inside one, dome
//      pads breach under siege and seal when clear, and a pan made with an empty suit is counted
//      and credited to nothing.
//   3. THE SECURE TURNS ON THE MECHANIC — one seed, one order set, two latches: with the regolith
//      run unsatisfied the wave-20 boundary never offers a secure; satisfied, it offers and banks.
//   4. MUTATION PROOFS — remove the composition and this file goes red: the sim's event-log hash
//      falls back to exactly the hash the audit recorded for the un-composed engine
//      (`fnv1a32:ee2f7c14`, also the pinned null floor in `assets/contracts/null-floors.json`),
//      `now.air` disappears from the view, and a 20m lob that the 2.4x arc makes legal is refused
//      OUT_OF_RANGE at 1.0x.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';
const read = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');

// MEASURED on this tree, 2026-09-04 (node v23.11.1). Every one of these is a real ride's output,
// re-derivable with `artifacts/e8-mare-claim-physics/ride.mjs`.
// RE-POINTED 2026-09-06 by `tasks/mare-claim-air-prevalent.md` (owner ruling: "no, this has to be
// more prevalent"), from `fnv1a32:1a62757f`. The idle ride itself is UNCHANGED in every outcome
// field; only the hash moved, because `atmosphere.diagnostics` rides `eventLogHash` and that block
// gained the authored gate (1 -> 4) and the four window fields. Both halves attributed separately
// in `artifacts/mare-claim-air-prevalent/floor-attribution.json`.
// RE-POINTED 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from `fnv1a32:32f62335`: the suit is the HUMAN's now and an
// empty one charges hit points, so this map's idle floor dies of the era's own rule five seconds
// sooner than it used to (81 233 ms / 32 kills becomes 76 033 / 30). The hero is dropped at
// (0, 12), six world units north of every dome this map authors.
const IDLE_HASH_COMPOSED = 'fnv1a32:271eabbb';
const IDLE_HASH_UNCOMPOSED = 'fnv1a32:ee2f7c14';

const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const physics = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
const contracts = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
const { E8PhysicsSystem, E8AtmosphereSystem, SUIT_AIR_SECONDS, REGOLITH_GROUNDS_FOR_SECURE } = physics;
after(() => vite.close());
/** The engine's own `create`, captured before any patch, so a proof can restore the default gate. */
const defaultCreate = E8AtmosphereSystem.create;

const manifest = contracts.activeContract();
const dome = (id) => manifest.tileParams.buildZones.find((zone) => zone.id === id);
const centreOf = (zone) => ({ x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 });
const OUTSIDE = { x: 40, z: 40 };

/** One ride, orders submitted once, bounded. `stopAtWave` keeps an immortal ride from running away. */
function ride({ orders = [], immortal = false, stopAtWave = null, maxDecisions = 400 } = {}) {
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
  if (immortal) {
    // `scripts/twin-banks-hash-probe.mjs:47-49`: outlive the map's null floor (wave 2) so the
    // wave-20 secure boundary can be observed at all. It changes no air rule.
    sim.hero.applyStats(10_000, 1);
    sim.hero.heal(10_000);
  }
  if (orders.length) assert.equal(sim.submitOrders(orders).outcome.ok, true);
  let turn = sim.currentTurn();
  let offered = false;
  let decisions = 0;
  while (!turn.terminal && decisions < maxDecisions) {
    if (turn.view.now.pendingSecure) {
      offered = true;
      assert.equal(sim.submitOrders([{ verb: 'SECURE_CHOICE', choice: 'bank' }]).outcome.ok, true);
    }
    if (stopAtWave !== null && turn.view.now.wave >= stopAtWave) break;
    turn = sim.advanceToTurn();
    decisions += 1;
  }
  return { sim, view: turn.view, terminal: turn.terminal, offered, outcome: turn.terminal ? sim.outcome() : null };
}

/**
 * Swap a static or prototype member for the length of one call — the mutation-proof lever. The
 * replacement is always a DATA property, so patching a getter (`objectiveAllowsSecure`,
 * `lobArcDistanceMultiplier`) is legal, and the original descriptor goes back in `finally` so one
 * proof cannot leak into the next.
 */
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

test('one contract, one gravity profile, and the three seams the browser reads it at', () => {
  // The browser's own argument (`Game.ts:804` = `new E8PhysicsSystem(this.activeContract)`) and
  // the sim's (`new E8PhysicsSystem(this.manifest)`) are the same manifest, so this is the profile
  // BOTH engines hold for this contract.
  const profile = new E8PhysicsSystem(manifest).diagnostics;
  assert.deepEqual(
    { ...profile, filteredMovement: undefined, adaptedLobs: undefined },
    {
      active: true, contractId: CONTRACT, source: 'gravity', movement: 'floaty', feelG: 0.6,
      lobArcDistanceMultiplier: 2.4, lobAirTimeMultiplier: 2.4, knockbackScale: 1.3,
      orbitalReturn: false, vacuum: true, fixedTimestepOnly: true,
      filteredMovement: undefined, adaptedLobs: undefined,
    },
  );

  // The sim publishes that same profile on the view, so a rider reads one truth in either engine.
  const { view } = ride({ maxDecisions: 0 });
  assert.deepEqual(view.now.gravity, {
    source: 'gravity', movement: 'floaty', feelG: 0.6, lobArcDistanceMultiplier: 2.4,
    lobAirTimeMultiplier: 2.4, knockbackScale: 1.3, orbitalReturn: false, vacuum: true,
  });

  // SOURCE-ANCHORED MIRROR. Each seam is asserted in BOTH engines' own text, because "the sim
  // mirrors the browser" is a claim about two files and a claim about one file cannot check it.
  const game = read('src/game/Game.ts');
  const sim = read('src/sim/HeadlessContractSim.ts');
  assert.match(game, /new E8PhysicsSystem\(this\.activeContract\)/);
  assert.match(sim, /new E8PhysicsSystem\(this\.manifest\)/);
  // 1. LOBS: the same reach expression in both, and the same air-time scaling.
  assert.match(game, /shooter\.range = Balance\.blast\.range \* this\.e8PhysicsSystem\.lobArcDistanceMultiplier/);
  assert.match(sim, /this\.blastShooter\.range = Balance\.blast\.range \* this\.e8Physics\.lobArcDistanceMultiplier/);
  assert.match(game, /Math\.min\(len, Balance\.blast\.range \* this\.e8PhysicsSystem\.lobArcDistanceMultiplier\)/);
  assert.match(sim, /const reach = Balance\.blast\.range \* this\.e8Physics\.lobArcDistanceMultiplier/);
  assert.match(game, /scaleLobAirTime\(Balance\.blast\.airTime\)/);
  assert.match(sim, /scaleLobAirTime\(Balance\.blast\.airTime\)/);
  // 2. MOVEMENT: one filter seam per engine, with low orbit's terrain answer where declared.
  assert.match(game, /this\.e8PhysicsSystem\.filterMovement\(slot, intents\.move, fixedDelta, actor\.velocity, terrain, actor\.movementSpeed\)/);
  assert.match(sim, /this\.e8Physics\.filterMovement\(0, intents\.move, STEP_SECONDS, this\.hero\.velocity, terrain, this\.hero\.movementSpeed\)/);
  // 3. The profile is published under the same diagnostics key in both engines.
  assert.match(game, /e8Physics: this\.e8PhysicsSystem\.diagnostics/);
  assert.match(sim, /e8Physics: this\.e8Physics\.diagnostics/);
});

test('air is the wall: the suit drains outside, refills inside, and a breathless pan buys nothing', () => {
  const air = E8AtmosphereSystem.create(manifest);
  assert.equal(air.isDeclared, true);
  const inside = centreOf(dome('dome-cluster-pad-center'));

  // Outside every dome: one second of air per second, and nothing else moves.
  for (let step = 0; step < 300; step += 1) air.update(1 / 30, OUTSIDE, []);
  const drained = air.diagnostics;
  assert.equal(drained.suit.seconds, SUIT_AIR_SECONDS - 10);
  assert.equal(drained.suit.inDome, null);
  assert.deepEqual(drained.domes.map((pad) => [pad.breached, pad.air]), [[false, 1], [false, 1], [false, 1]]);

  // Inside a breathing dome: refill at the published rate, capped at the suit's capacity.
  air.update(1, inside, []);
  assert.equal(air.diagnostics.suit.seconds, SUIT_AIR_SECONDS - 10 + drained.suit.refillPerSecond);
  assert.equal(air.diagnostics.suit.inDome, 'dome-cluster-pad-center');
  for (let step = 0; step < 30; step += 1) air.update(1, inside, []);
  assert.equal(air.diagnostics.suit.seconds, SUIT_AIR_SECONDS);

  // A sieger on the pad breaches it; the dial falls while it stands there and seals when it goes.
  const sieger = [{ isAlive: true, position: inside }];
  air.update(9, inside, sieger);
  const breached = air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center');
  assert.deepEqual(
    { breached: breached.breached, breaches: breached.breaches, siegers: breached.siegers, air: breached.air },
    { breached: true, breaches: 1, siegers: 1, air: 0.8 },
  );
  air.update(3, inside, []);
  assert.equal(air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center').breached, false);
  // A dead body is not a siege.
  air.update(1, inside, [{ isAlive: false, position: inside }]);
  assert.equal(air.diagnostics.domes.find((pad) => pad.id === 'dome-cluster-pad-center').siegers, 0);

  // THE RUN. A pan on air works its ground; the same pan with an empty suit is counted and
  // credited to nothing, which is the whole reason the wall is a wall.
  const run = E8AtmosphereSystem.create(manifest);
  assert.equal(run.objectiveAllowsSecure, false, 'an unworked claim cannot secure');
  assert.equal(run.notePan(3), true);
  assert.equal(run.diagnostics.regolith.worked.length, REGOLITH_GROUNDS_FOR_SECURE);
  // RE-POINTED 2026-09-06 (`tasks/mare-claim-air-prevalent.md`): one ground no longer opens the
  // latch on THIS contract, because it now authors `twist.atmosphere.regolithRequired` above the
  // shared default. The pan itself is unchanged, and a contract that authors nothing still opens
  // on one — that control is `scripts/e8-regolith-gate-override.test.mjs`.
  assert.equal(run.objectiveAllowsSecure, false, 'one ground of the authored four cannot secure');
  assert.equal(run.diagnostics.regolith.required, manifest.twist.atmosphere.regolithRequired);
  const starved = E8AtmosphereSystem.create(manifest);
  for (let step = 0; step < SUIT_AIR_SECONDS + 1; step += 1) starved.update(1, OUTSIDE, []);
  assert.equal(starved.diagnostics.suit.empty, true);
  assert.equal(starved.notePan(3), false);
  assert.deepEqual(
    { worked: starved.diagnostics.regolith.worked, breathless: starved.diagnostics.regolith.breathlessPans },
    { worked: [], breathless: 1 },
  );
  assert.equal(starved.objectiveAllowsSecure, false);

  // EVERY OTHER CONTRACT: inert, so no admitted contract grew a terminal move or a view field.
  for (const id of ['the-claim', 'e8-eclipse', 'e8-low-orbit', 'e8-far-side']) {
    const other = E8AtmosphereSystem.create({ ...manifest, id, tileParams: { ...manifest.tileParams } });
    assert.equal(other.isDeclared, id === CONTRACT, `${id} must not arm the air wall`);
    assert.equal(other.objectiveAllowsSecure, true, `${id} must keep its terminal moves`);
  }
});

test('the ride the audit measured, now carrying its air — and the un-composed hash it replaces', () => {
  // The null floor with the composition: the ride the audit logged (wave 2), with the air state
  // inside the hash — and, since 2026-09-07, with the human's own suffocation inside the outcome.
  const composed = ride();
  assert.equal(composed.terminal, true);
  assert.deepEqual(
    { secured: composed.outcome.secured, waves: composed.outcome.waves, timeMs: composed.outcome.timeMs, kills: composed.outcome.kills },
    { secured: false, waves: 2, timeMs: 76_033, kills: 30 },
  );
  assert.equal(composed.outcome.eventLogHash, IDLE_HASH_COMPOSED);
  assert.equal(composed.view.now.air.suit.drainedTotal, 60, 'the idle floor suffocates: 60s of suit, all of it spent');
  // AND IT NOW COSTS HER. Re-pointed 2026-09-07: the same sentence, with the consequence the
  // directive added — the dial that empties is the human's and it charges her for emptying.
  assert.ok(composed.view.now.air.suit.harmTicks > 0, 'an empty suit charges the hero every second');
  assert.ok(composed.view.now.air.suit.harmDealt > 0, 'and the charge reaches her through CombatSystem');
  assert.equal(composed.view.now.air.regolith.worked.length, 0, 'an idle ride works no ground');

  // MUTATION PROOF. Remove the composition — `E8AtmosphereSystem.create` answering `none()` is
  // exactly the engine the audit measured — and the ride's hash falls back to the audit's own
  // recorded value, the view loses `now.air`, and the latch stops existing.
  const uncomposed = withPatch(E8AtmosphereSystem, 'create', () => E8AtmosphereSystem.none(), () => ride());
  assert.equal(uncomposed.outcome.eventLogHash, IDLE_HASH_UNCOMPOSED);
  assert.notEqual(uncomposed.outcome.eventLogHash, composed.outcome.eventLogHash);
  assert.equal(uncomposed.view.now.air, undefined);
  assert.equal(uncomposed.view.now.gravity !== undefined, true, 'the gravity profile is a separate composition');
  // The recorded numbers are not invented here: the COMPOSED ride above is the contract's pinned
  // null floor, which is what makes "the engine this map actually rides" a checkable claim.
  //
  // RE-POINTED 2026-09-06 (`tasks/mare-claim-air-prevalent.md`) from `IDLE_HASH_UNCOMPOSED`, and
  // this line was ALREADY RED before that slice: the sentence was written when the pinned floor
  // still held the audit's un-composed value, and the floors were regenerated to the composed one
  // when `e8-mare-claim-physics` landed. Verified against a pristine `main` (22cf98cfe), where
  // `floors[e8-mare-claim][e8-mare-claim-01].eventLogHash` is `fnv1a32:1a62757f` and
  // `IDLE_HASH_UNCOMPOSED` is `fnv1a32:ee2f7c14` — the assertion could not have passed. F-MCAP-3.
  const floors = JSON.parse(read('assets/contracts/null-floors.json')).floors[CONTRACT];
  assert.equal(floors[SEED].eventLogHash, IDLE_HASH_COMPOSED);
  assert.notEqual(floors[SEED].eventLogHash, IDLE_HASH_UNCOMPOSED);
});

test('the gravity-scaled lob: 2.4x reach and hang, and OUT_OF_RANGE the moment the profile is gone', () => {
  const reach = Balance.blast.range * 2.4;
  const lob = (distance) => {
    const run = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    assert.equal(run.submitOrders([{ verb: 'BLAST_AT', pos: { x: distance, z: 12 } }]).outcome.ok, true);
    const turn = run.advanceToTurn();
    const record = turn.view.now.orders.find((entry) => entry.order.verb === 'BLAST_AT');
    return { status: record.status, reason: record.reason ?? '', events: run.replayEvents.filter((event) => event.type === 'blast_at') };
  };

  const far = lob(reach);
  assert.equal(far.status, 'done', far.reason);
  assert.deepEqual(far.events[0].lob, { reach, airTime: Balance.blast.airTime * 2.4 });
  assert.ok(reach > Balance.blast.range, 'the era is what makes this shot legal');

  // MUTATION PROOF: flatten the arc to 1.0x and the same order is refused at the same point.
  const flattened = withPatch(
    Object.getPrototypeOf(new E8PhysicsSystem(manifest)),
    'lobArcDistanceMultiplier',
    1,
    () => lob(reach),
  );
  assert.equal(flattened.status, 'failed');
  assert.match(flattened.reason, /OUT_OF_RANGE/);
  assert.equal(flattened.events.length, 0);
});

test('the secure turns on the regolith run: same seed, same orders, two latches', { timeout: 300_000 }, () => {
  // The order set is the smallest ride that works a ground on air and then stands in the dome:
  // HARVEST sends the Prospector to the seam, and with the order done it drifts back to the hero
  // (`src/agent/Embodiment.ts:139`), which is standing on the centre pad — the map's only
  // authored way back to breathable air (there is no water here, so no sluice to be sent to).
  const orders = [
    { verb: 'HARVEST', seam: 'gold-seam-1' },
    // ADR-005 stage 3: was HOLD on the pad. The rider walks its HERO onto the pad and the
    // Prospector drifts in behind it to breathe — the answer public/skill.md now teaches.
    { verb: 'MOVE_HERO', pos: centreOf(dome('dome-cluster-pad-center')) },
  ];

  // LATCH CLOSED — the run has not worked its ground, so the wave-20 boundary offers nothing.
  const closed = withPatch(
    Object.getPrototypeOf(E8AtmosphereSystem.none()),
    'objectiveAllowsSecure',
    false,
    () => ride({ orders, immortal: true, stopAtWave: 22 }),
  );
  assert.equal(closed.offered, false, 'a claim that has not made its regolith run cannot be offered a secure');
  assert.ok(closed.view.now.wave >= 20, `the ride must reach the boundary to prove it was refused there (wave ${closed.view.now.wave})`);

  // THE AUTHORED GATE, added 2026-09-06 (`tasks/mare-claim-air-prevalent.md`): with the contract's
  // own `twist.atmosphere` in force, this SAME one-ground ride is refused a secure at the same
  // boundary, because the gate is four grounds at one per four-wave window. That is the ruling
  // biting, measured on the ride this file already had.
  const gated = ride({ orders, immortal: true, stopAtWave: 22 });
  assert.equal(gated.offered, false, 'one ground of the authored four cannot be offered a secure');
  assert.ok(gated.view.now.wave >= 20, `the gated ride must reach the boundary (wave ${gated.view.now.wave})`);
  assert.equal(gated.view.now.air.regolith.complete, false);
  assert.equal(gated.view.now.air.regolith.worked.length, 1);

  // LATCH OPEN — the same ride, the same seed, the run made: offered at 20 and banked. The gate is
  // taken back to the shared default for this case (the contract read with `twist.atmosphere`
  // stripped, which is the engine's own default path), so what is under test stays what it always
  // was: the SECURE turning on the regolith run rather than on the size of the gate.
  const bare = { ...manifest, twist: { ...manifest.twist, atmosphere: undefined } };
  const open = withPatch(
    E8AtmosphereSystem,
    'create',
    (contract) => defaultCreate.call(E8AtmosphereSystem, contract.id === CONTRACT ? bare : contract),
    () => ride({ orders, immortal: true }),
  );
  assert.equal(open.offered, true);
  assert.equal(open.terminal, true);
  assert.equal(open.outcome.secured, true);
  assert.equal(open.outcome.waves, 20);
  assert.equal(open.view.now.air.regolith.complete, true);
  assert.ok(open.view.now.air.regolith.runsOnAir >= 1);
  console.log(JSON.stringify({ closedAtWave: closed.view.now.wave, gatedAtWave: gated.view.now.wave, open: open.outcome }));
});
