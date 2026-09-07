import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// E7 PLAYBOOK ROWS — the four Signal maps' own proof, and the parity gap it does not hide.
//
// `docs/audits/2026-09-02-era-mechanic-audit.md:43-46` measured all four E7 contracts as
// RESKIN/PARTIAL for one shared reason: the era's systems are composed headless but "the public
// grammar has no playbook verb", so nothing could reach them. Its smallest-slice list (`:79-82`)
// names one proof per map. This guard is those four proofs plus the two things that keep them
// honest: the era scope (no other contract grew a row or a latch) and the human-parity gap
// (the browser binds no playbook verb, so its secure decision carries no playbook clause).
//
// Every ride here drives the SAME public door a rider drives: `submitOrders` + `advanceToTurn`.
// Nothing reaches into a private field, so a green here is a claim about the grammar, not about
// this file's access.

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');
const harvest = (seam, count) => Array.from({ length: count }, () => ({ verb: 'HARVEST', seam }));

/**
 * One pad inside `relay-site-r1` on both maps that author relay sites (`tileParams.buildZones`,
 * x -50..-40, z 36..46). A sentry beacon is a `POWERED_RELAY_KIND`, so placing one lights the site.
 */
const RELAY_R1_PAD = { x: -45, z: 40 };

async function loadSim(contract, seed) {
  const location = new URL(`http://e7-playbook-rows.test/?debug&contract=${contract}&seed=${seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  return { HeadlessContractSim, close: () => vite.close() };
}

/** Rides one contract, submitting `script[n]` at turn n (null means "no change"). */
function ride(HeadlessContractSim, contractId, seed, script, turns = 40) {
  const sim = new HeadlessContractSim({ contractId, seed });
  let turn = sim.currentTurn();
  for (let index = 0; index < turns && !turn.terminal; index += 1) {
    const orders = script[index];
    if (orders) {
      const receipt = sim.submitOrders(orders);
      assert.equal(receipt.outcome.ok, true, `turn ${index}: ${receipt.outcome.message ?? receipt.outcome.reason}`);
    }
    turn = sim.advanceToTurn();
  }
  return { sim, view: turn.view, outcome: sim.outcome() };
}

test('the Relay Valley: a program lights a relay, and that is what opens its secure', async () => {
  const { HeadlessContractSim, close } = await loadSim('e7-relay-valley', 'e7-relay-valley-01');
  try {
    // The demonstration and the delegation in one submission: `PLAYBOOK_USE` is record 0, so it
    // executes on the first tick, and the tape it banks is this same array with itself stripped.
    // The program then pans its own stake money and places the beacon on relay-site-r1 ITSELF.
    const script = [[
      { verb: 'PLAYBOOK_USE', name: 'light-the-relay' },
      ...harvest('gold-seam-1', 10),
      { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
    ]];
    const { view } = ride(HeadlessContractSim, 'e7-relay-valley', 'e7-relay-valley-01', script);
    const row = view.now.playbookUse;
    assert.ok(row, 'the Relay Valley must publish now.playbookUse');
    assert.equal(row.objective, 'relay');
    assert.equal(row.uses, 1, 'exactly one use');
    assert.equal(row.programRuns, 1, 'the used tape was actually installed and run');
    assert.deepEqual(row.relaysLitByProgram, ['relay-site-r1'], 'the PROGRAM lit the relay, not the rider by hand');
    assert.equal(row.objectiveMet, true);
    assert.equal(row.shelf.length, 1);
    assert.equal(row.shelf[0].name, 'light-the-relay');
    assert.match(row.shelf[0].hash, /^fnv1a32:[0-9a-f]{8}$/);
  } finally {
    await close();
  }
});

test('Echo Canyon: a use is recorded, the next wave fields the mirror, and a repeat is counted', async () => {
  const { HeadlessContractSim, close } = await loadSim('e7-echo-canyon', 'e7-echo-canyon-01');
  try {
    const script = [
      [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, ...harvest('gold-seam-1', 6), { verb: 'MOVE_HERO', pos: { x: 0, z: 10 } }],
      // The SAME name a turn later is a REPEAT of the SAME tape, which is exactly what the Echo's
      // ratified lesson punishes (+10% hp per repeat, `BroadcastMirror.ts:49`). Variety is the cure.
      [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, { verb: 'MOVE_HERO', pos: { x: 0, z: 10 } }],
    ];
    const { view } = ride(HeadlessContractSim, 'e7-echo-canyon', 'e7-echo-canyon-01', script);
    const row = view.now.playbookUse;
    const mirror = view.now.broadcastMirror;
    assert.ok(row && mirror, 'Echo Canyon must publish both rows');
    assert.equal(row.objective, 'mirror');
    assert.equal(row.uses, 2);
    assert.equal(row.repeats, 1, 'the second use of one name is a repeat');
    assert.equal(mirror.recordedUses, 2, 'both uses reached BroadcastMirror.noteUse');
    assert.equal(mirror.distinctPlaybooks, 1);
    assert.equal(mirror.maxRepeat, 1);
    // The audit measured `bodiesFielded: 0` here. A squad is 2..4 bodies, never zero.
    assert.ok(mirror.squadsFielded >= 1, `squadsFielded ${mirror.squadsFielded} must be >= 1`);
    assert.ok(mirror.bodiesFielded >= 2, `bodiesFielded ${mirror.bodiesFielded} must be >= 2`);
    assert.equal(row.objectiveMet, true);
  } finally {
    await close();
  }
});

test('the Dead Band: the verb is refused signal-suppressed, and the refusal is the objective', async () => {
  const { HeadlessContractSim, close } = await loadSim('e7-dead-band', 'e7-dead-band-01');
  try {
    const { view } = ride(HeadlessContractSim, 'e7-dead-band', 'e7-dead-band-01', [[{ verb: 'PLAYBOOK_USE', name: 'old-tools' }]]);
    const row = view.now.playbookUse;
    assert.ok(row, 'the Dead Band must publish now.playbookUse');
    assert.equal(row.objective, 'refusal');
    assert.equal(row.uses, 0, 'a refused use is not a use');
    assert.equal(row.refusals.suppressed, 1);
    assert.equal(row.last.ok, false);
    assert.equal(row.last.reason, 'signal-suppressed: The dead band swallows it.');
    // The audit measured every suppression counter at 0 and called it "only by construction".
    // This is the same counter, moved by a real refusal through the public grammar.
    assert.equal(view.now.signalSuppression.refusals.playbooks, 1);
    assert.equal(row.objectiveMet, true);
    // Nostalgia by subtraction: the mirror never fires here, because a refusal is not a use.
    assert.equal(view.now.broadcastMirror, undefined);
  } finally {
    await close();
  }
});

test('Relay Rush: the interference front suspends a running program and restores it', async () => {
  const { HeadlessContractSim, close } = await loadSim('e7-relay-rush', 'e7-relay-rush-01');
  try {
    const script = [[
      { verb: 'PLAYBOOK_USE', name: 'relay-program' },
      ...harvest('gold-seam-1', 10),
      { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
      // The command stake, so the body the program runs from stands in the corridor the wall crosses.
      // ADR-005 stage 3: the HERO walks to the stake and the Prospector drifts in behind it, which is
      // also the body `usePlaybook` and `syncProgramSuspension` now read (stage 1, and item 9 below).
      { verb: 'MOVE_HERO', pos: { x: -25, z: 41 } },
    ]];
    const { view } = ride(HeadlessContractSim, 'e7-relay-rush', 'e7-relay-rush-01', script);
    const row = view.now.playbookUse;
    const front = view.now.interferenceFront;
    assert.ok(row && front, 'Relay Rush must publish both rows');
    assert.equal(row.objective, 'suspended');
    assert.equal(row.programRuns, 1);
    assert.ok(front.frontsArrived >= 1, 'the ride must reach the first front');
    // The audit measured `refusals` all zero and `frontsArrived: 0`. This is the front's own
    // counter, moved by the wall standing over the body a program was running from.
    assert.equal(front.refusals.playbooks, 1, 'the front suspended the program exactly once per crossing');
    assert.equal(row.programSuspensions, 1);
    assert.equal(row.objectiveMet, true);
    // Muted is never damaged: the program comes back, and the relay it lit stays lit.
    assert.equal(row.suspendedProgram, null, 'the wall passed, so nothing is still suspended');
    assert.equal(row.runningProgram, 'relay-program', 'the program was RESTORED, not cancelled');
    assert.deepEqual(row.relaysLitByProgram, ['relay-site-r1']);
  } finally {
    await close();
  }
});

test('the era scope is the Signal bundle: no other contract grows a row, a latch or a refusal', async () => {
  // `e8-far-side` is the load-bearing control. It declares `twist.signalSuppression` too
  // (`SignalSuppression.ts:20`), so a latch keyed on the TWIST would hand the Far Side an E7
  // objective it has no way to discharge, which is F-1471-1's exact casualty.
  const { HeadlessContractSim, close } = await loadSim('e8-far-side', 'e8-far-side-01');
  try {
    const sim = new HeadlessContractSim({ contractId: 'e8-far-side', seed: 'e8-far-side-01' });
    const receipt = sim.submitOrders([{ verb: 'PLAYBOOK_USE', name: 'not-an-e7-map' }]);
    assert.equal(receipt.outcome.ok, true, 'the verb is grammar everywhere; only its ANSWER is contract-scoped');
    for (let tick = 0; tick < 10; tick += 1) sim.advanceOneTick();
    const view = sim.currentTurn().view;
    assert.equal(view.now.playbookUse, undefined, 'no Signal row off the Signal bundle');
    // The Far Side still refuses the verb, because A4 is a contract read and not an epoch read.
    // What it does NOT gain is an objective: its secure decision is untouched by this slice.
    const order = sim.standingOrdersSnapshot().orders.find((record) => record.order.verb === 'PLAYBOOK_USE');
    assert.equal(order.status, 'failed');
    assert.match(order.reason, /signal-suppressed/);

    const claim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'e1-the-claim-01' });
    claim.submitOrders([{ verb: 'PLAYBOOK_USE', name: 'not-an-e7-map' }]);
    for (let tick = 0; tick < 10; tick += 1) claim.advanceOneTick();
    assert.equal(claim.currentTurn().view.now.playbookUse, undefined, 'no Signal row on an E1 contract');
    const claimOrder = claim.standingOrdersSnapshot().orders.find((record) => record.order.verb === 'PLAYBOOK_USE');
    assert.equal(claimOrder.status, 'failed');
    assert.match(claimOrder.reason, /NOTHING_RECORDED/, 'off the bundle the verb still answers honestly');
  } finally {
    await close();
  }
});

test('HUMAN PARITY: browser player and rider use the shared Signal latch and the human tape records the use', () => {
  const standingOrders = read('src/agent/StandingOrders.ts');
  const game = read('src/game/Game.ts');
  const sim = read('src/sim/HeadlessContractSim.ts');
  const latch = read('src/systems/E7PlaybookLatch.ts');
  const runTape = read('src/game/RunTape.ts');

  // The verb is public grammar.
  assert.match(standingOrders, /verb: 'PLAYBOOK_USE'; name: string/);
  assert.match(standingOrders, /playbookUse\?: \(name: string\) => ActionOrderResult/);
  // The headless door binds it.
  assert.match(sim, /playbookUse: \(name\) => this\.usePlaybook\(name\)/);

  assert.match(game, /playbookUse: \(name: string\) => this\.useNamedPlaybookForRider\(name, playerId\)/);
  assert.match(game, /private readonly playbookLatch = new E7PlaybookLatch\(this\.activeContract\)/);
  assert.match(sim, /private readonly playbookLatch: E7PlaybookLatch/);
  assert.match(game, /\|\| !this\.playbookObjectiveAllowsSecure/);
  assert.match(sim, /\|\| !this\.playbookObjectiveAllowsSecure/);
  for (const rule of [
    /case 'refusal': return signals\.suppressedUses > 0/,
    /case 'mirror': return signals\.fieldedMirrors > 0/,
    /case 'suspended': return signals\.mutedUses > 0/,
    /case 'relay': return this\.lit\.size > 0/,
  ]) assert.match(latch, rule);
  assert.match(game, /this\.broadcastMirror\.noteUse\(/, 'the browser player path still reaches the mirror');
  assert.match(game, /this\.signalSuppression\.refuse\('playbooks'\)/, 'the browser player path still asks A4');
  assert.match(runTape, /kind: 'playbook_use'/);
  assert.match(game, /recordPlaybookUse\(playbook\)/);
});
