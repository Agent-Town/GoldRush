/**
 * e10-squall-scheduler — the Ember Shore's Static squall is one clock, run by both engines.
 *
 * WHY THIS EXISTS (E10S-2, `specs/agent-play/e10-ember-shore-preserve.md` §4). The slice's gate is
 * "phase timings deterministic in headless snapshots", and a scheduler is the one kind of mechanic
 * that can drift between engines while every other check stays green: nothing it publishes is
 * scored yet, so a browser that ticked it a frame later than the headless door would look fine
 * until E10S-3 keys warmth decay on it and two engines start disagreeing about whether a run was
 * lost. The cheapest moment to pin a clock is BEFORE anything depends on it.
 *
 * WHAT IT PINS, and each is a different failure:
 *   1. THE PHASE TABLE — the authored cadence produces these exact ticks, so a retune is a visible
 *      edit rather than a silent one.
 *   2. DETERMINISM — two independent runs of the same contract produce byte-identical logs.
 *   3. REFUSE-TO-ARM — a contract with a broken or absent cadence arms nothing (the F-1471-1
 *      discipline one slice before there is a latch to pin).
 *   4. BOTH ENGINES — `HeadlessContractSim` is proven LIVE here; the browser half is proven by
 *      source, in `board-launchable-guard`'s manner, because `Game.ts` cannot boot under node. The
 *      live browser proof is `e2e/e10-ember-shore-squall.spec.ts`, which reads the same numbers.
 *   5. NO SPILLOVER — no other board contract grows a `now.squall` row.
 *   6. NO RENDER REACH (F-A8-7) — the scheduler both engines construct must not drag `three` or
 *      the DOM into the headless graph; the last module that did collapsed `playwright --list` to
 *      "Total: 0 tests in 0 files".
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const STEP_SECONDS = 1 / 30;

/**
 * THE PHASE TABLE, as ticks rather than seconds, because a tick is what two engines can be
 * compared on. Each is one step AFTER the ideal boundary by construction: `update()` counts its
 * tick before it reads the phase, so the transition stamped at 1801 is "at the end of step 1801,
 * 60.033s had elapsed and the calm was over". The `atSeconds` column is the same fact in the
 * engine's own accumulated float, and it is pinned too — a drift there is a drift in how the
 * seconds were summed, which is exactly what an engine split would look like.
 */
const EXPECTED_TRANSITIONS = [
  { from: null, to: 'calm', tick: 0, atSeconds: 0, cycle: 0 },
  { from: 'calm', to: 'telegraph', tick: 1801, atSeconds: 60.033, cycle: 0 },
  { from: 'telegraph', to: 'squall', tick: 2041, atSeconds: 68.033, cycle: 0 },
  { from: 'squall', to: 'recover', tick: 2791, atSeconds: 93.033, cycle: 0 },
  { from: 'recover', to: 'calm', tick: 3031, atSeconds: 101.033, cycle: 1 },
  { from: 'calm', to: 'telegraph', tick: 4831, atSeconds: 161.033, cycle: 1 },
  { from: 'telegraph', to: 'squall', tick: 5071, atSeconds: 169.033, cycle: 1 },
  { from: 'squall', to: 'recover', tick: 5821, atSeconds: 194.033, cycle: 1 },
  { from: 'recover', to: 'calm', tick: 6061, atSeconds: 202.033, cycle: 2 },
];

/** The authored cadence, quoted from the contract so a retune reds this file and not only a number. */
const EXPECTED_CADENCE = { calmSeconds: 60, telegraphSeconds: 8, squallSeconds: 25, recoverSeconds: 8, cycleSeconds: 101 };

let modules;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const location = new URL(`http://e10-squall.test/?debug&contract=${CONTRACT}&seed=e10-squall-guard`);
  globalThis.location = location;
  globalThis.window = { location };
  modules = {
    scheduler: await vite.ssrLoadModule('/src/systems/E10SquallScheduler.ts'),
    contracts: await vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
    manifest: await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts'),
    sim: await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
  };
} finally {
  await vite.close();
}

const { E10SquallScheduler, SQUALL_PHASE_ORDER } = modules.scheduler;
const { listBoardContracts, loadContract } = modules.contracts;

/** Drives the bare scheduler on the fixed step both engines use. */
function ride(seconds) {
  const scheduler = E10SquallScheduler.create(loadContract(CONTRACT));
  for (let step = 0; step < Math.round(seconds / STEP_SECONDS); step += 1) scheduler.update(STEP_SECONDS);
  return scheduler.diagnostics;
}

test('the corpus is not empty', () => {
  // An empty corpus is the shape of false good news: a loop over nothing registers no assertions
  // and reports success. Refuse rather than certify.
  assert.ok(listBoardContracts().length >= 42, 'the board resolved too few contracts; the root is wrong, not the tree');
});

test('the Ember Shore declares a whole cadence and the scheduler arms on it', () => {
  const squall = loadContract(CONTRACT).twist.emberShore?.squall;
  assert.ok(squall, `${CONTRACT} no longer declares twist.emberShore.squall`);
  const scheduler = E10SquallScheduler.create(loadContract(CONTRACT));
  assert.equal(scheduler.isDeclared, true);
  const { calmSeconds, telegraphSeconds, squallSeconds, recoverSeconds, cycleSeconds } = scheduler.diagnostics;
  assert.deepEqual(
    { calmSeconds, telegraphSeconds, squallSeconds, recoverSeconds, cycleSeconds },
    EXPECTED_CADENCE,
    'the squall cadence moved; spec §3 gives 60/8/25 and §6 correction point 3 makes them retunable — update this pin WITH the reason',
  );
  assert.deepEqual([...SQUALL_PHASE_ORDER], ['calm', 'telegraph', 'squall', 'recover']);
});

test('the phase machine changes phase at fixed ticks', () => {
  const diagnostics = ride(250);
  assert.deepEqual(diagnostics.transitions.map((entry) => ({ ...entry })), EXPECTED_TRANSITIONS);
  // Every transition lands exactly ONE step after its ideal boundary, which is what makes the
  // table above readable as the authored seconds rather than as nine magic numbers.
  const boundaries = [60, 68, 93, 101, 161, 169, 194, 202];
  assert.deepEqual(
    diagnostics.transitions.slice(1).map((entry) => entry.tick),
    boundaries.map((seconds) => Math.round(seconds / STEP_SECONDS) + 1),
  );
  assert.equal(diagnostics.squallsStarted, 2);
  assert.equal(diagnostics.squallsCompleted, 2);
  assert.equal(diagnostics.motePressureMultiplier, 2);
  console.log(JSON.stringify({ phaseTable: diagnostics.transitions, cadence: EXPECTED_CADENCE }));
});

test('the published phase agrees with the log at every sampled instant', () => {
  // The log and the live `phase` are two derivations of the same fact; a mechanic that reported
  // one while painting the other would satisfy the table above and still lie to the browser.
  for (const [seconds, phase, blowing] of [
    [30, 'calm', false], [60, 'calm', false], [61, 'telegraph', false], [67, 'telegraph', false],
    [69, 'squall', true], [92, 'squall', true], [94, 'recover', false], [100, 'recover', false],
    [102, 'calm', false], [170, 'squall', true],
  ]) {
    const diagnostics = ride(seconds);
    assert.equal(diagnostics.phase, phase, `at ${seconds}s the shore should be ${phase}`);
    assert.equal(diagnostics.blowing, blowing, `at ${seconds}s blowing should be ${blowing}`);
    assert.equal(diagnostics.phase, diagnostics.transitions.at(-1).to, `at ${seconds}s the log and the live phase disagree`);
    assert.ok(diagnostics.phaseProgress >= 0 && diagnostics.phaseProgress <= 1);
  }
});

test('two runs of the same cadence are byte-identical', () => {
  const first = ride(250);
  const second = ride(250);
  assert.deepEqual(second, first, 'the scheduler is not deterministic across two runs of the same contract');
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test('a broken or absent cadence arms nothing', () => {
  const cases = [
    ['no twist at all', { twist: {} }],
    ['emberShore without a squall', { twist: { emberShore: { preserve: {} } } }],
    ['a zero duration', { twist: { emberShore: { squall: { calmSeconds: 0, telegraphSeconds: 8, squallSeconds: 25 } } } }],
    ['a negative duration', { twist: { emberShore: { squall: { squallSeconds: -1 } } } }],
    ['a non-numeric duration', { twist: { emberShore: { squall: { squallSeconds: '25' } } } }],
    ['a squall that is not an object', { twist: { emberShore: { squall: 25 } } }],
  ];
  for (const [label, contract] of cases) {
    const scheduler = E10SquallScheduler.create(contract);
    assert.equal(scheduler.isDeclared, false, `${label} should not arm the scheduler`);
    for (let step = 0; step < 6_000; step += 1) scheduler.update(STEP_SECONDS);
    assert.equal(scheduler.diagnostics.phase, 'calm', `${label} must stay calm forever`);
    assert.deepEqual(scheduler.diagnostics.transitions, [], `${label} must log nothing`);
    assert.equal(scheduler.diagnostics.tick, 0, `${label} must not even count ticks`);
  }
  // The POSITIVE control: an omitted `recoverSeconds` is NOT broken — it falls back to the
  // ratified mirror of the telegraph — so this guard cannot pass by refusing everything.
  const partial = E10SquallScheduler.create({ twist: { emberShore: { squall: { calmSeconds: 12 } } } });
  assert.equal(partial.isDeclared, true, 'an omitted duration must fall back, not disarm');
  assert.equal(partial.diagnostics.recoverSeconds, 8);
  assert.equal(partial.diagnostics.calmSeconds, 12);
});

test('reset restores the run-start clock', () => {
  const scheduler = E10SquallScheduler.create(loadContract(CONTRACT));
  for (let step = 0; step < 3_000; step += 1) scheduler.update(STEP_SECONDS);
  assert.notEqual(scheduler.diagnostics.transitions.length, 1);
  scheduler.reset();
  assert.deepEqual(scheduler.diagnostics, E10SquallScheduler.create(loadContract(CONTRACT)).diagnostics);
});

test('the headless engine publishes the squall on the view, and only there', async () => {
  const { HeadlessContractSim } = modules.sim;
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: 'e10-squall-guard', admissionProbe: true });
  // Past the first telegraph (tick 1801) and into the first squall (tick 2041), through the
  // engine's OWN fixed step rather than the scheduler's, so this measures the wiring not the class.
  for (let tick = 0; tick < 2_100; tick += 1) sim.advanceOneTick();
  const view = sim.currentTurn().view;
  const squall = view.now.squall;
  assert.ok(squall, 'HeadlessContractSim does not publish now.squall on the Ember Shore');
  assert.equal(squall.declared, true);
  assert.equal(squall.phase, 'squall', `the engine's own step put the shore in ${squall.phase} at tick 2100`);
  assert.deepEqual(
    squall.transitions.map(({ from, to, tick }) => ({ from, to, tick })),
    EXPECTED_TRANSITIONS.slice(0, 3).map(({ from, to, tick }) => ({ from, to, tick })),
    'the engine ticked the scheduler a different number of times than it stepped the sim',
  );
  assert.equal(squall.tick, 2_100, 'the scheduler and the sim disagree about how many fixed steps ran');
  console.log(JSON.stringify({ engine: 'HeadlessContractSim', tick: squall.tick, phase: squall.phase, transitions: squall.transitions }));
});

test('no other board contract grows a squall', () => {
  const armed = listBoardContracts()
    .filter((contract) => E10SquallScheduler.create(contract).isDeclared)
    .map((contract) => contract.id);
  assert.deepEqual(armed, [CONTRACT], 'a second contract armed the squall scheduler; every other view and hash must be untouched');
});

test('the browser engine ticks the same scheduler at the same point in its order', () => {
  // Source, not runtime: `Game.ts` needs a DOM and a WebGL context. The live proof is
  // `e2e/e10-ember-shore-squall.spec.ts`; this is the cheap check that the wiring still exists,
  // in the manner `board-launchable-guard` pins the launch door's own clause.
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  for (const [name, source, update] of [['Game.ts', game, 'this.squall.update(simDelta);'], ['HeadlessContractSim.ts', headless, 'this.squall.update(STEP_SECONDS);']]) {
    assert.match(source, /E10SquallScheduler\.create\(/, `${name} no longer builds the squall scheduler off the contract`);
    assert.ok(source.includes(update), `${name} no longer advances the squall on its fixed step`);
  }
  // ORDER, not merely presence: both engines must tick the squall immediately after the A5 front,
  // so the tick a transition is stamped with is the same integer in both.
  for (const [name, source, front, squall] of [
    ['Game.ts', game, 'this.interferenceFront.update(simDelta', 'this.squall.update(simDelta)'],
    ['HeadlessContractSim.ts', headless, 'this.interferenceFront.update(STEP_SECONDS', 'this.squall.update(STEP_SECONDS)'],
  ]) {
    assert.ok(source.indexOf(front) > 0 && source.indexOf(squall) > source.indexOf(front), `${name} moved the squall tick away from the front`);
  }
  assert.match(game, /this\.squallPresentation\.sync\(this\.squall\.diagnostics\)/, 'the browser no longer paints the squall it schedules');
});

test('the scheduler reaches no render code (F-A8-7)', () => {
  const source = readFileSync(new URL('../src/systems/E10SquallScheduler.ts', import.meta.url), 'utf8');
  const imports = [...source.matchAll(/^import[^\n]*from '([^']+)'/gm)].map(([, from]) => from);
  assert.deepEqual(imports, ['../meta/ContractFamilies'], 'the squall scheduler grew an import; both engines construct it, so a render import would poison the headless graph');
  assert.match(source, /^import type /m, 'the one import must stay a TYPE import');
});

test('the mechanics manifest publishes the squall rule, and says what it does not do', () => {
  const { deriveMechanicsManifest } = modules.manifest;
  const rule = deriveMechanicsManifest(CONTRACT).rules.find(({ id }) => id === 'static_squall');
  assert.ok(rule, 'the Ember Shore manifest carries no static_squall rule');
  assert.equal(rule.source, 'E10SquallScheduler.update');
  assert.equal(rule.data.cycleSeconds, EXPECTED_CADENCE.cycleSeconds);
  assert.equal(rule.data.applies, 'phase-only', 'the rule must say the pressure is published and not applied');
  assert.equal(rule.data.gatesSecure, false);
  assert.match(String(rule.data.consequence), /E10S-3/, 'the rule must name the slice that lands the warmth it will drain');
  assert.equal(
    deriveMechanicsManifest('the-claim').rules.some(({ id }) => id === 'static_squall'),
    false,
    'a contract with no squall grew the rule',
  );
});
