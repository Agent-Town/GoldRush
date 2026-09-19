/**
 * e10-preserve-consumer — the Ember Shore's vent is one consumer, run by both engines.
 *
 * WHY THIS EXISTS (E10S-3, `specs/agent-play/e10-ember-shore-preserve.md` §3, §4). The slice's own
 * gate is "stoked vent survives a squall; unstoked vent gutters => loss; secure refused while
 * warmth 0", and this consumer is the first thing on this map that can END A RUN. A scheduler that
 * drifted between engines was E10S-2's risk; a CONSUMER that drifts is worse, because the two
 * engines would then disagree about whether a claim was won.
 *
 * WHAT IT PINS, and each is a different failure:
 *   1. THE STATE TABLE — warmth falls ONLY while the squall blows, at the authored rate, and the
 *      calm costs the vent nothing. A decay keyed on sim time instead of phase would still look
 *      right at the end of a squall and be wrong everywhere else.
 *   2. THE LOSS — an unstoked vent reaches zero and latches `guttered`, once, at a fixed instant.
 *   3. THE LATCH — BOTH conditions, each proven alone: alight but no squall survived refuses, and
 *      a squall survived with a cold vent refuses. A latch that reads only one of the two would
 *      pass a single-condition test and ship a claim that could be won by outliving the map.
 *   4. THE STOKE — it spends the run's own gold through the caller (F-1741, no minting), it is
 *      refused out of reach and refused when the purse is short, and every refusal is COUNTED.
 *   5. REFUSE-TO-ARM — a half-declared preserve arms nothing (F-1471-1, the standing casualty of
 *      arming a mechanic no engine consumes).
 *   6. THE APPLIED PRESSURE — the E10S-2 multiplier is actually applied: a quarter of the field
 *      walks at the vent in the calm and half of it in the squall, deterministically by enemy id.
 *   7. BOTH ENGINES — `HeadlessContractSim` is proven LIVE here; the browser half is proven by
 *      source, in `board-launchable-guard`'s manner, because `Game.ts` cannot boot under node. The
 *      live browser proof is `e2e/e10-ember-shore-preserve.spec.ts`.
 *   8. NO SPILLOVER — no other board contract grows a vent, a rule or a way to lose.
 *   9. NO RENDER REACH (F-A8-7) — a module both engines construct must not drag `three` or the DOM
 *      into the headless collection graph.
 *
 * MEASURED HONESTY (the master's honesty guard, and it is REPORTED rather than tuned): with the
 * spec's defaults the vent holds 100 warmth and loses 4/s for the squall's 25s, so an unstoked vent
 * reaches exactly zero on the squall's LAST tick — tick 2790, 93.0s. The contract also declares
 * `harvestAnchors: []` until E10S-4 earns them, so a run has no income and cannot afford the
 * 15-gold stoke: the vent is UN-KEEPABLE on today's data, and the tests below pin that as a
 * measurement (`insufficient-gold` refusals) rather than curing it with a number nobody ratified.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const STEP_SECONDS = 1 / 30;

/** The authored numbers, quoted from the contract so a retune reds this file and not only a value. */
const EXPECTED = {
  stakeId: 'last-warm-vent',
  position: { x: 3, z: -10 },
  initialWarmth: 100,
  decayPerSecond: 4,
  goldCost: 15,
  warmthRestore: 40,
  radius: 4,
  squallsRequired: 1,
};

/**
 * The squall's own phase table, transcribed from `scripts/e10-squall-scheduler.test.mjs` rather
 * than re-derived. The vent's whole behaviour is read against these instants.
 */
const FIRST_SQUALL_OPENS_AT_TICK = 2_041;
const FIRST_SQUALL_CLOSES_AT_TICK = 2_791;

let modules;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const location = new URL(`http://e10-preserve.test/?debug&contract=${CONTRACT}&seed=e10-preserve-guard`);
  globalThis.location = location;
  globalThis.window = { location };
  modules = {
    preserve: await vite.ssrLoadModule('/src/systems/E10PreserveSystem.ts'),
    scheduler: await vite.ssrLoadModule('/src/systems/E10SquallScheduler.ts'),
    contracts: await vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    manifest: await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts'),
    sim: await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
  };
} finally {
  await vite.close();
}

const { E10PreserveSystem, PRESERVE_MOTE_PRESS_WEIGHT, PRESERVE_STOKE_SINK } = modules.preserve;
const { E10SquallScheduler } = modules.scheduler;
const { listBoardContracts, loadContract } = modules.contracts;

/** A calm reading and a blowing reading of the real scheduler, so nothing here invents a phase. */
function phases() {
  const scheduler = E10SquallScheduler.create(loadContract(CONTRACT));
  const calm = scheduler.diagnostics;
  for (let tick = 0; tick < FIRST_SQUALL_OPENS_AT_TICK; tick += 1) scheduler.update(STEP_SECONDS);
  const blowing = scheduler.diagnostics;
  assert.equal(calm.blowing, false);
  assert.equal(blowing.blowing, true, 'the transcribed squall tick no longer opens the squall');
  return { calm, blowing };
}

/** Drives the bare consumer for `seconds` under one phase. `spend` defaults to a bottomless purse. */
function ride(seconds, phase, spend = () => true) {
  const vent = E10PreserveSystem.create(loadContract(CONTRACT));
  for (let step = 0; step < Math.round(seconds / STEP_SECONDS); step += 1) vent.update(STEP_SECONDS, phase);
  return { vent, spend };
}

test('the corpus is not empty', () => {
  // An empty corpus is the shape of false good news: a loop over nothing registers no assertions
  // and reports success. Refuse rather than certify.
  assert.ok(listBoardContracts().length >= 42, 'the board resolved too few contracts; the root is wrong, not the tree');
});

test('the Ember Shore declares a whole preserve and the consumer arms on it', () => {
  const preserve = loadContract(CONTRACT).twist.emberShore?.preserve;
  assert.ok(preserve, `${CONTRACT} no longer declares twist.emberShore.preserve`);
  const vent = E10PreserveSystem.create(loadContract(CONTRACT));
  assert.equal(vent.isDeclared, true);
  const state = vent.diagnostics;
  assert.deepEqual({
    stakeId: state.stakeId,
    position: state.position,
    initialWarmth: state.maxWarmth,
    decayPerSecond: state.decayPerSecond,
    goldCost: state.stoke.goldCost,
    warmthRestore: state.stoke.warmthRestore,
    radius: state.stoke.radius,
    squallsRequired: state.squallsRequired,
  }, EXPECTED, 'the vent numbers moved; spec §3 authors them and §6 point 2 makes them retunable — update this pin WITH the reason');
  assert.equal(state.warmth, EXPECTED.initialWarmth);
  assert.equal(state.alight, true);
  assert.equal(state.guttered, false);
  assert.equal(state.stoke.action, 'STOKE');
  console.log(JSON.stringify({ authored: EXPECTED, sink: PRESERVE_STOKE_SINK }));
});

test('warmth falls only while the squall blows', () => {
  const { calm, blowing } = phases();
  // 60s of calm — the whole authored calm phase — costs the vent nothing at all.
  const quiet = ride(60, calm).vent.diagnostics;
  assert.equal(quiet.warmth, EXPECTED.initialWarmth, 'the calm took warmth; decay must be squall-only (spec §3)');
  assert.equal(quiet.decaying, false);
  assert.equal(quiet.warmthLost, 0);
  // 10s of squall costs exactly the authored rate.
  const bitten = ride(10, blowing).vent.diagnostics;
  assert.equal(bitten.warmth, EXPECTED.initialWarmth - EXPECTED.decayPerSecond * 10);
  assert.equal(bitten.decaying, true);
  assert.equal(bitten.warmthLost, EXPECTED.decayPerSecond * 10);
  assert.equal(bitten.alight, true);
  assert.equal(bitten.guttered, false);
});

test('an unstoked vent gutters inside one squall, and latches once', () => {
  const { blowing } = phases();
  const { vent } = ride(24, blowing);
  assert.equal(vent.diagnostics.warmth, 4, '24s of squall should leave exactly one second of warmth');
  assert.equal(vent.hasGuttered, false);
  // The 25th second is the one that takes it — which is the whole authored squall (spec §3).
  for (let step = 0; step < 30; step += 1) vent.update(STEP_SECONDS, blowing);
  assert.equal(vent.hasGuttered, true, 'the authored squall did not gutter an unstoked vent');
  assert.equal(vent.alight, false);
  const at = vent.diagnostics.gutteredAtSeconds;
  assert.equal(vent.diagnostics.warmth, 0);
  // Latched: further squall changes nothing, and the instant does not move.
  for (let step = 0; step < 300; step += 1) vent.update(STEP_SECONDS, blowing);
  assert.equal(vent.diagnostics.gutteredAtSeconds, at, 'the gutter instant moved after it latched');
  assert.equal(vent.diagnostics.warmthLost, EXPECTED.initialWarmth);
  console.log(JSON.stringify({ gutteredAtSeconds: at, decayPerSecond: EXPECTED.decayPerSecond }));
});

test('a stoked vent survives the squall that would have taken it', () => {
  const { blowing } = phases();
  const { vent } = ride(20, blowing);
  assert.equal(vent.diagnostics.warmth, 20);
  const stoked = vent.tryStoke(EXPECTED.position, () => true);
  assert.equal(stoked.ok, true, `the stoke was refused: ${stoked.reason ?? ''}`);
  assert.equal(vent.diagnostics.warmth, 20 + EXPECTED.warmthRestore);
  assert.equal(vent.diagnostics.stoke.uses, 1);
  // The remaining 5s of the authored squall no longer reaches zero.
  for (let step = 0; step < Math.round(5 / STEP_SECONDS); step += 1) vent.update(STEP_SECONDS, blowing);
  assert.equal(vent.hasGuttered, false, 'a stoked vent still guttered inside one authored squall');
  assert.equal(vent.alight, true);
  assert.equal(vent.diagnostics.warmth, 20 + EXPECTED.warmthRestore - EXPECTED.decayPerSecond * 5);
});

test('the stoke is refused out of reach, refused when the purse is short, and never over-fills', () => {
  const { blowing } = phases();
  const { vent } = ride(10, blowing);
  const far = { x: EXPECTED.position.x + EXPECTED.radius + 0.01, z: EXPECTED.position.z };
  let charged = 0;
  const outOfReach = vent.tryStoke(far, (amount) => { charged += amount; return true; });
  assert.equal(outOfReach.ok, false);
  assert.equal(outOfReach.reason, 'out-of-reach');
  assert.equal(charged, 0, 'a refused stoke debited the purse');
  // The disc is inclusive at its edge, which is what `inReach` publishes to the HUD and a rider.
  assert.equal(vent.inReach({ x: EXPECTED.position.x + EXPECTED.radius, z: EXPECTED.position.z }), true);
  assert.equal(vent.inReach(far), false);

  const broke = vent.tryStoke(EXPECTED.position, () => false);
  assert.equal(broke.ok, false);
  assert.equal(broke.reason, 'insufficient-gold');
  assert.equal(vent.diagnostics.warmth, 60, 'a refused stoke changed the warmth');

  // A full vent refuses rather than banking warmth it cannot hold, and the cap is the authored one.
  const full = E10PreserveSystem.create(loadContract(CONTRACT));
  const already = full.tryStoke(EXPECTED.position, () => true);
  assert.equal(already.ok, false);
  assert.equal(already.reason, 'already-warm');
  const { vent: nearlyFull } = ride(2, blowing);
  assert.equal(nearlyFull.tryStoke(EXPECTED.position, () => true).ok, true);
  assert.equal(nearlyFull.diagnostics.warmth, EXPECTED.initialWarmth, 'the stoke overfilled the vent past its authored cap');

  // Every refusal was COUNTED, not swallowed.
  assert.deepEqual(vent.diagnostics.stoke.refusals, {
    undeclared: 0, guttered: 0, 'out-of-reach': 1, 'insufficient-gold': 1, 'already-warm': 0,
  });
  assert.equal(vent.diagnostics.stoke.lastRefusal, 'insufficient-gold');
  // And a cold vent refuses everything, so a run cannot be bought back after it is over.
  const dead = E10PreserveSystem.create(loadContract(CONTRACT));
  for (let step = 0; step < Math.round(26 / STEP_SECONDS); step += 1) dead.update(STEP_SECONDS, blowing);
  assert.equal(dead.hasGuttered, true);
  assert.equal(dead.tryStoke(EXPECTED.position, () => true).reason, 'guttered');
});

test('the secure latch needs BOTH conditions, and each is proven alone', () => {
  const { calm, blowing } = phases();
  // (a) alight, but no squall has been ridden out: refused.
  const untested = ride(60, calm).vent;
  assert.equal(untested.alight, true);
  assert.equal(untested.diagnostics.squallsSurvived, 0);
  assert.equal(untested.objectiveAllowsSecure, false, 'a vent that has never met a squall opened the secure');

  // (b) a whole squall ridden out with the vent still burning: allowed. The scheduler is the one
  // that counts a completed squall, so this drives the REAL clock rather than a hand-made flag.
  const scheduler = E10SquallScheduler.create(loadContract(CONTRACT));
  const vent = E10PreserveSystem.create(loadContract(CONTRACT));
  for (let tick = 0; tick < FIRST_SQUALL_CLOSES_AT_TICK + 30; tick += 1) {
    scheduler.update(STEP_SECONDS);
    vent.update(STEP_SECONDS, scheduler.diagnostics);
    // Stoke whenever the squall has taken enough that the vent could not otherwise last, which is
    // the play the map is asking for. The purse is the caller's; nothing is minted in the sim.
    if (vent.diagnostics.warmth < 60 && !vent.hasGuttered) vent.tryStoke(EXPECTED.position, () => true);
  }
  assert.equal(vent.hasGuttered, false, 'the stoked ride still lost the vent');
  assert.equal(vent.diagnostics.squallsSurvived, 1);
  assert.equal(vent.objectiveAllowsSecure, true, 'a vent alight after one whole squall did NOT open the secure');
  assert.equal(vent.diagnostics.objectiveMet, true);

  // (c) a squall ridden out but the vent cold: refused. Warmth zero is the whole point.
  const cold = E10PreserveSystem.create(loadContract(CONTRACT));
  const clock = E10SquallScheduler.create(loadContract(CONTRACT));
  for (let tick = 0; tick < FIRST_SQUALL_CLOSES_AT_TICK + 30; tick += 1) {
    clock.update(STEP_SECONDS);
    cold.update(STEP_SECONDS, clock.diagnostics);
  }
  assert.equal(cold.alight, false);
  assert.equal(cold.objectiveAllowsSecure, false, 'a cold vent opened the secure');

  // (d) every contract that declares no vent answers TRUE, so no admitted terminal moves.
  assert.equal(E10PreserveSystem.none().objectiveAllowsSecure, true);
  assert.equal(E10PreserveSystem.create(loadContract('the-claim')).objectiveAllowsSecure, true);
});

test('a half-declared preserve arms nothing (F-1471-1)', () => {
  const tile = { stakeMarkers: [{ id: EXPECTED.stakeId, x: 3, z: -10 }] };
  const cases = [
    ['no twist at all', { twist: {}, tileParams: tile }],
    ['emberShore without a preserve', { twist: { emberShore: { squall: {} } }, tileParams: tile }],
    ['a preserve that is not an object', { twist: { emberShore: { preserve: 4 } }, tileParams: tile }],
    ['no stakeId', { twist: { emberShore: { preserve: { initialWarmth: 100 } } }, tileParams: tile }],
    ['a stake the tile does not carry', { twist: { emberShore: { preserve: { stakeId: 'nowhere' } } }, tileParams: tile }],
    ['no stake markers at all', { twist: { emberShore: { preserve: { stakeId: EXPECTED.stakeId } } }, tileParams: {} }],
    ['a zero warmth', { twist: { emberShore: { preserve: { stakeId: EXPECTED.stakeId, initialWarmth: 0 } } }, tileParams: tile }],
    ['a negative decay', { twist: { emberShore: { preserve: { stakeId: EXPECTED.stakeId, squallDecayPerSecond: -4 } } }, tileParams: tile }],
    ['a non-numeric cost', { twist: { emberShore: { preserve: { stakeId: EXPECTED.stakeId, stoke: { goldCost: '15' } } } }, tileParams: tile }],
  ];
  const { blowing } = phases();
  for (const [label, contract] of cases) {
    const vent = E10PreserveSystem.create(contract);
    assert.equal(vent.isDeclared, false, `${label} should not arm the consumer`);
    for (let step = 0; step < 6_000; step += 1) vent.update(STEP_SECONDS, blowing);
    assert.equal(vent.hasGuttered, false, `${label} must never gutter`);
    assert.equal(vent.objectiveAllowsSecure, true, `${label} must not gate a secure`);
    assert.equal(vent.pressureTarget({ id: 0 }), null, `${label} must press nobody`);
    assert.equal(vent.tryStoke(EXPECTED.position, () => true).reason, 'undeclared');
    assert.equal(vent.diagnostics.declared, false);
    assert.equal(vent.diagnostics.stakeId, null);
  }
  // The POSITIVE control: an omitted number is NOT broken — it falls back to the ratified default
  // — so this guard cannot pass by refusing everything.
  const partial = E10PreserveSystem.create({
    twist: { emberShore: { preserve: { stakeId: EXPECTED.stakeId } } },
    tileParams: tile,
  });
  assert.equal(partial.isDeclared, true, 'an omitted number must fall back, not disarm');
  assert.equal(partial.diagnostics.maxWarmth, EXPECTED.initialWarmth);
  assert.equal(partial.diagnostics.stoke.goldCost, EXPECTED.goldCost);
  assert.equal(partial.diagnostics.squallsRequired, EXPECTED.squallsRequired);
});

test('the E10S-2 mote pressure is APPLIED: a quarter of the field in the calm, half of it in the squall', () => {
  const { calm, blowing } = phases();
  const field = Array.from({ length: 400 }, (unused, id) => ({ id }));
  const pressed = (vent) => field.filter((enemy) => vent.pressureTarget(enemy) !== null).length;

  const quiet = ride(1, calm).vent;
  assert.equal(quiet.diagnostics.motePressure.pressShare, PRESERVE_MOTE_PRESS_WEIGHT);
  assert.equal(quiet.diagnostics.motePressure.active, false);
  assert.equal(pressed(quiet), field.length * PRESERVE_MOTE_PRESS_WEIGHT);

  const storm = ride(1, blowing).vent;
  const multiplier = blowing.motePressureMultiplier;
  assert.equal(multiplier, 2, 'the contract no longer doubles the mote pressure');
  assert.equal(storm.diagnostics.motePressure.active, true);
  assert.equal(storm.diagnostics.motePressure.pressShare, PRESERVE_MOTE_PRESS_WEIGHT * multiplier);
  assert.equal(pressed(storm), pressed(quiet) * multiplier, 'the squall did not double the share pressing the vent');
  // It presses the AUTHORED stake and nowhere else, and it presses nobody once the vent is out.
  assert.deepEqual(storm.pressureTarget({ id: 0 }), EXPECTED.position);
  const dead = E10PreserveSystem.create(loadContract(CONTRACT));
  for (let step = 0; step < Math.round(26 / STEP_SECONDS); step += 1) dead.update(STEP_SECONDS, blowing);
  assert.equal(dead.pressureTarget({ id: 0 }), null);
  console.log(JSON.stringify({ calmShare: quiet.diagnostics.motePressure.pressShare, squallShare: storm.diagnostics.motePressure.pressShare }));
});

test('reset relights the vent exactly as a new run finds it', () => {
  const { blowing } = phases();
  const vent = E10PreserveSystem.create(loadContract(CONTRACT));
  for (let step = 0; step < 200; step += 1) vent.update(STEP_SECONDS, blowing);
  vent.tryStoke(EXPECTED.position, () => true);
  assert.notEqual(vent.diagnostics.stoke.uses, 0);
  vent.reset();
  assert.deepEqual(vent.diagnostics, E10PreserveSystem.create(loadContract(CONTRACT)).diagnostics);
});

test('the headless engine runs the vent, publishes it, and ends the run on it', () => {
  const { HeadlessContractSim } = modules.sim;
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: 'e10-preserve-guard', admissionProbe: true });
  // Into the first squall through the ENGINE's own fixed step, so this measures the wiring.
  for (let tick = 0; tick < FIRST_SQUALL_OPENS_AT_TICK + 300; tick += 1) sim.advanceOneTick();
  const view = sim.currentTurn().view;
  const vent = view.now.emberShore?.preserve;
  assert.ok(vent, 'HeadlessContractSim does not publish now.emberShore.preserve on the Ember Shore');
  assert.equal(vent.declared, true);
  assert.equal(vent.stakeId, EXPECTED.stakeId);
  assert.equal(view.now.squall.blowing, true, 'the transcribed tick no longer lands inside the squall');
  assert.equal(vent.decaying, true, 'the engine is not draining the vent during its own squall');
  assert.ok(vent.warmth < EXPECTED.initialWarmth && vent.warmth > 0, `warmth ${vent.warmth} is not mid-drain`);
  assert.equal(vent.objectiveMet, false, 'the secure opened before a squall had been ridden out');

  // NOT `now.preserve`: that field is `twist.preserve`'s damageable vent on `e10-last-claim`, and
  // two unrelated shapes on one field is how a rider learns to distrust a view.
  assert.equal(view.now.preserve, undefined, 'the Ember Shore grew a twist.preserve row it does not declare');

  // The rest of the authored squall takes it, and the run ends NAMED.
  for (let tick = 0; tick < 900; tick += 1) sim.advanceOneTick();
  const ended = sim.outcome();
  assert.equal(ended.secured, false, 'Law 2: the idle policy secured the Ember Shore');
  assert.equal(ended.endReason, 'vent_guttered', `the run ended as ${ended.endReason ?? 'nothing'} rather than a named gutter`);
  console.log(JSON.stringify({ engine: 'HeadlessContractSim', endReason: ended.endReason, waves: ended.waves, hash: ended.eventLogHash }));
});

test('the headless STOKE verb is reachable, spends the run purse, and refuses honestly', () => {
  const { HeadlessContractSim } = modules.sim;
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: 'e10-preserve-guard', admissionProbe: true });
  const receipt = sim.submitOrders([{ verb: 'CONTEXT_ACTION', action: 'stoke' }]);
  assert.equal(receipt.outcome.ok, true, `the STOKE order was not accepted: ${receipt.outcome.message ?? ''}`);
  let turn = sim.currentTurn();
  for (let decisions = 0; decisions < 12 && !turn.terminal; decisions += 1) turn = sim.advanceToTurn();
  const vent = turn.view.now.emberShore.preserve;
  // MEASURED, NOT TUNED (the master's honesty guard). The hero starts AT the vent, so the stoke is
  // in reach; the vent starts full, so the first answer is `already-warm`; and this contract still
  // declares `harvestAnchors: []` until E10S-4, so the run has no income and the purse cannot pay
  // once the squall has made room. Both refusals are the map telling the truth about itself.
  assert.equal(vent.stoke.refusals['out-of-reach'], 0, 'the hero start is no longer inside the vent disc');
  assert.ok(
    vent.stoke.uses > 0 || vent.stoke.refusals['already-warm'] > 0 || vent.stoke.refusals['insufficient-gold'] > 0,
    'the STOKE verb never reached the consumer at all',
  );
  console.log(JSON.stringify({ stokes: vent.stoke.uses, refusals: vent.stoke.refusals }));
});

test('no other board contract grows a vent', () => {
  const armed = listBoardContracts()
    .filter((contract) => E10PreserveSystem.create(contract).isDeclared)
    .map((contract) => contract.id);
  assert.deepEqual(armed, [CONTRACT], 'a second contract armed the preserve consumer; every other view, latch and hash must be untouched');
  const rules = listBoardContracts()
    .filter((contract) => modules.manifest.deriveMechanicsManifest(contract).rules.some(({ id }) => id === 'preserve_vent'))
    .map((contract) => contract.id);
  assert.deepEqual(rules, [CONTRACT], 'a second contract grew the preserve_vent rule');
});

test('the browser engine runs the same consumer at the same point in its order', () => {
  // Source, not runtime: `Game.ts` needs a DOM and a WebGL context. The live proof is
  // `e2e/e10-ember-shore-preserve.spec.ts`; this is the cheap check that the wiring still exists,
  // in the manner `board-launchable-guard` pins the launch door's own clause.
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  for (const [name, source, update, squall] of [
    ['Game.ts', game, 'this.preserveVent.update(simDelta, this.squall.diagnostics);', 'this.squall.update(simDelta)'],
    ['HeadlessContractSim.ts', headless, 'this.preserveVent.update(STEP_SECONDS, this.squall.diagnostics);', 'this.squall.update(STEP_SECONDS)'],
  ]) {
    assert.match(source, /E10PreserveSystem\.create\(/, `${name} no longer builds the preserve consumer off the contract`);
    assert.ok(source.includes(update), `${name} no longer advances the vent on its fixed step from the squall's own phase`);
    // ORDER, not merely presence: the vent must tick AFTER the clock that drains it, in both
    // engines, or the warmth lost on tick N would belong to tick N-1's phase in one of them.
    assert.ok(
      source.indexOf(squall) > 0 && source.indexOf(update) > source.indexOf(squall),
      `${name} ticks the vent before the squall that drains it`,
    );
    // The LOSS and the LATCH, both engines.
    assert.match(source, /this\.preserveVent\.hasGuttered/, `${name} does not end the run on a guttered vent`);
    assert.match(source, /this\.preserveVent\.objectiveAllowsSecure/, `${name} does not gate the secure on the vent`);
    // The APPLIED pressure, both engines.
    assert.match(source, /this\.preserveVent\.pressureTarget\(enemy\)/, `${name} no longer applies the doubled mote pressure`);
  }
  // The player's own door and the rider's, in the browser (Mistake #10: a plain boot must reach it).
  assert.match(game, /this\.tryStokeVent\(this\.actionActor\.group\.position\)/, 'the confirm key no longer stokes the vent');
  assert.match(game, /this\.hud\.setVentWarmth\(/, 'the HUD no longer shows the warmth meter');
  assert.match(game, new RegExp(`sink: ${PRESERVE_STOKE_SINK.replace(/_/g, '_')}|PRESERVE_STOKE_SINK`), 'the browser stoke no longer spends through Economy');
});

test('the consumer reaches no render code (F-A8-7)', () => {
  const source = readFileSync(new URL('../src/systems/E10PreserveSystem.ts', import.meta.url), 'utf8');
  const imports = [...source.matchAll(/^import[^\n]*from '([^']+)'/gm)].map(([, from]) => from);
  assert.deepEqual(
    imports,
    ['../meta/ContractFamilies', './E10SquallScheduler', './PicnicHoldSystem'],
    'the preserve consumer grew an import; both engines construct it, so a render import would poison the headless graph',
  );
  // The two type imports must STAY type imports; only the ratified press weight is a value.
  assert.match(source, /^import type \{ ContractManifest \}/m);
  assert.match(source, /^import type \{ SquallDiagnostics \}/m);
  assert.match(source, /^import \{ PICNIC_STAKE_PRESS_WEIGHT \}/m, 'the press weight must be INHERITED from the Picnic, never retyped (F-1741)');
});

test('the mechanics manifest publishes the vent rule with the numbers the engine enforces', () => {
  const { deriveMechanicsManifest } = modules.manifest;
  const rule = deriveMechanicsManifest(CONTRACT).rules.find(({ id }) => id === 'preserve_vent');
  assert.ok(rule, 'the Ember Shore manifest carries no preserve_vent rule');
  assert.equal(rule.source, 'E10PreserveSystem.update');
  assert.equal(rule.data.stake, EXPECTED.stakeId);
  assert.equal(rule.data.warmth, EXPECTED.initialWarmth);
  assert.equal(rule.data.squallDecayPerSecond, EXPECTED.decayPerSecond);
  assert.equal(rule.data.goldCost, EXPECTED.goldCost);
  assert.equal(rule.data.warmthRestore, EXPECTED.warmthRestore);
  assert.equal(rule.data.stokeRadius, EXPECTED.radius);
  assert.equal(rule.data.squallsRequiredForSecure, EXPECTED.squallsRequired);
  assert.equal(rule.data.motePressMultiplierDuringSquall, 2);
  assert.equal(rule.data.decaysOnlyDuring, 'squall');
  assert.equal(rule.data.gatesSecure, true, 'the vent rule must say it gates the secure');
  assert.equal(rule.data.damages, false, 'the vent is not damageable by enemies (spec §3)');
  assert.equal(rule.data.view, 'now.emberShore.preserve');
  assert.deepEqual(rule.data.order, { verb: 'CONTEXT_ACTION', action: 'stoke' });
});

test('the engine dependency says LANDED and names the slice that landed it (F-E10S2-1)', () => {
  const contract = loadContract(CONTRACT);
  const [entry, ...rest] = contract.tileParams.engineDependencies ?? [];
  assert.equal(rest.length, 0, 'the Ember Shore grew a second engine dependency');
  assert.equal(entry.status, 'landed', 'the preserve consumer landed; the dependency must say so');
  assert.equal(entry.landedBy, 'E10S-3');
  assert.match(entry.description, /E10S-4/, 'the row must still name what is NOT yet earned (admission)');
  // The schema is the thing being pinned, not just this row: a landed status without its slice,
  // and a missing status WITH one, must both be refused.
  const { parseContractDescriptor, contractDescriptorJson } = modules.contracts;
  const withDependency = (dependency) => {
    const next = structuredClone(contract);
    next.tileParams.engineDependencies = [dependency];
    return parseContractDescriptor(contractDescriptorJson(next), next).ok;
  };
  assert.equal(withDependency({ dep: 'x', status: 'landed', landedBy: 'E10S-3', description: 'ok' }), true);
  assert.equal(withDependency({ dep: 'x', status: 'landed', description: 'no slice named' }), false);
  assert.equal(withDependency({ dep: 'x', status: 'missing', landedBy: 'E10S-3', description: 'both at once' }), false);
  assert.equal(withDependency({ dep: 'x', status: 'shipped', description: 'not a status' }), false);
  assert.equal(withDependency({ dep: 'x', status: 'missing', description: 'still legal' }), true);
});
