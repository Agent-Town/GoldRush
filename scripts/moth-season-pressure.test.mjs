import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SEED = 'e3-moth-season-01';
const FIXTURE = JSON.parse(readFileSync(new URL('./fixtures/moth-season-orders.json', import.meta.url), 'utf8'));
const ORDERS = FIXTURE.map((entry) => JSON.stringify(entry)).join('\n') + '\n';
// The authored circuit (`assets/contracts/epoch-3-voltage/contracts.json`, `e3-moth-season`).
// Named here so a re-author that renames a node reddens this guard instead of silently
// measuring nothing: every lookup below is by id, and a missing id reads as `undefined`.
const RELAY_SITE = { x: 0, z: -14 };
const NODES = { producer: 'corridor-dynamo', relay: 'corridor-pylon', gallery: 'corridor-gallery', lamp: 'corridor-lamp' };

function run(policy, input) {
  const result = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e3-moth-season', '--seed', SEED, `--policy=${policy}`],
    // `maxBuffer` explicitly, because gr-sim prints a WHOLE VIEW per turn and `spawnSync`'s default
    // ceiling is 1 MB: the ride below crosses it at about turn 131 and the child is killed with
    // ENOBUFS and an EMPTY stderr, which reads exactly like a sim failure and is not one
    // (F-RPG-12, measured 2026-09-07 — the pre-ADR-005 ride sat just under the cliff at 92 turns).
    { cwd: ROOT, encoding: 'utf8', input, timeout: 120_000, maxBuffer: 64 * 1024 * 1024 },
  );
  assert.equal(result.status, 0, result.error?.message ?? result.stderr);
  return JSON.parse(result.stdout.trim().split('\n').at(-1));
}

/** One vite server per ride: the sim is a source module, exactly as `view-schema-guard` loads it. */
async function withSim(fn) {
  globalThis.location = new URL(`http://moth-season.local/?debug&contract=e3-moth-season&seed=${SEED}`);
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const console_ = { log: console.log, info: console.info, debug: console.debug };
  console.log = console.info = console.debug = () => undefined;
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    return await fn({ HeadlessContractSim, Balance });
  } finally {
    Object.assign(console, console_);
    await vite.close();
  }
}

function circuit(sim) {
  const snapshot = sim.powerGraph?.snapshot() ?? null;
  const node = (id) => snapshot?.nodes.find((entry) => entry.id === id)?.state ?? null;
  return {
    gallery: node(NODES.gallery),
    lamp: node(NODES.lamp),
    span: snapshot?.wires.find((wire) => wire.a === NODES.producer || wire.b === NODES.producer)?.state ?? null,
    beacon: sim.build.diagnostics.hp
      .filter((entry) => entry.id === 'sentry_beacon')
      .map((entry) => ({ hp: Math.round(entry.hp), maxHp: entry.maxHp, wrecked: entry.wrecked })),
  };
}

test('Moth Season rejects idle darkness while the relayed-light floor ride secures', () => {
  const idle = run('idle');
  const competent = run('stdin', ORDERS);

  assert.equal(idle.secured, false);
  assert.ok(idle.waves <= 10, `idle survived too long: ${JSON.stringify(idle)}`);
  assert.deepEqual(
    { secured: competent.secured, waves: competent.waves },
    { secured: true, waves: 12 },
  );
  console.log(`moth-season idle ${JSON.stringify(idle)}`);
  console.log(`moth-season competent ${JSON.stringify(competent)}`);
});

test('the corridor circuit is cut, dark, repaired and lit across the floor ride', async () => {
  const { trace, outcome } = await withSim(async ({ HeadlessContractSim }) => {
    const sim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed: SEED });
    const trace = [];
    let turn = sim.currentTurn();
    let index = 0;
    while (!turn.terminal && index < FIXTURE.length) {
      sim.submitOrders(FIXTURE[index]);
      trace.push({ turn: index, wave: turn.view.now.wave, connect: turn.view.now.canyonConnect ?? null, ...circuit(sim) });
      index += 1;
      turn = sim.advanceToTurn();
    }
    while (!turn.terminal && index < FIXTURE.length + 8) {
      trace.push({ turn: index, wave: turn.view.now.wave, connect: turn.view.now.canyonConnect ?? null, ...circuit(sim) });
      index += 1;
      turn = sim.advanceToTurn();
    }
    trace.push({ turn: index, wave: turn.view.now.wave, connect: turn.view.now.canyonConnect ?? null, ...circuit(sim) });
    return { trace, outcome: sim.outcome() };
  });

  // 1. THE DARK. The run opens with no beacon on the pylon site, so the relay is offline, the
  //    span carries nothing and both consumers are dark. Surviving is not enough: `complete` is
  //    false and the connect deadline is still running.
  assert.deepEqual(
    { gallery: trace[0].gallery, lamp: trace[0].lamp, complete: trace[0].connect.complete, powered: trace[0].connect.powered },
    { gallery: 'dark', lamp: 'dark', complete: false, powered: 0 },
  );

  // 2. THE LIGHT. BUILDing the Sentry Beacon on the pylon site closes the span and powers both.
  const lit = trace.find((row) => row.lamp === 'powered');
  assert.ok(lit, 'the corridor lamp was never powered across the ride');
  assert.equal(lit.span, 'intact');
  assert.equal(lit.connect.complete, true);

  // 3. THE CUT. A Corridor Saboteur wrecks the beacon; the span cuts and the lamp goes out again.
  const cut = trace.find((row) => row.turn > lit.turn && row.span === 'cut');
  assert.ok(cut, 'no saboteur ever cut the corridor span');
  assert.deepEqual({ gallery: cut.gallery, lamp: cut.lamp }, { gallery: 'dark', lamp: 'dark' });
  assert.ok(cut.beacon.some((entry) => entry.wrecked), 'the span cut without a wrecked beacon');

  // 4. THE REPAIR, AND ITS PRICE (re-derived 2026-09-07, `rider-parity-grammar-stage3` A0).
  //    This beat used to belong to the same ride: the plan pinned the Prospector at the camp with
  //    `HOLD` and `REPAIR_UNDER` searched the WHOLE MAP, so the Prospector walked twenty-four units
  //    south on its own and mended the corridor beacon while the hero never moved. Neither half of
  //    that survives ADR-005: no verb positions the Prospector any more, and the repair search is
  //    bounded to `Balance.sparkRig.range` (10) from the acting body, exactly as the human's sweep
  //    is. The corridor beacon sits at (0, -14); the claim it defends sits at (0, +10). A body
  //    cannot hold both. So the beat is measured on its OWN ride below, and what this one pins is
  //    the consequence: the span stays cut, and the ONE-WAY `complete` latch is what still carries
  //    the secure to wave 12 (F-E3MS-1, now load-bearing rather than incidental).
  assert.equal(trace.filter((row) => row.turn > cut.turn && row.lamp === 'powered').length, 0,
    'the camp-holding ride cannot reach the corridor beacon: the mend is 24wu from a 10wu sweep');
  assert.deepEqual({ secured: outcome.secured, waves: outcome.waves }, { secured: true, waves: 12 });

  // MEASURED LIMIT, recorded not wished for (see `artifacts/e3-moth-season/report.md`, F-E3MS-1):
  // the shared `syncCanyonConnectObjective` latch is ONE-WAY in both engines, so what the secure
  // gates on is "the corridor carried current by wave 12", not "the lamp is lit at wave 12". This
  // ride reaches its terminal tick with the corridor `${terminalLamp}`; the assertion above is on
  // the latch, which is the rule the engines actually enforce.
  const terminalLamp = trace.at(-1).lamp;
  assert.ok(terminalLamp === 'powered' || terminalLamp === 'dark', 'the terminal corridor state must be readable');

  mkdirSync(path.join(ROOT, 'artifacts/e3-moth-season'), { recursive: true });
  writeFileSync(
    path.join(ROOT, `artifacts/e3-moth-season/ride-${SEED}.json`),
    `${JSON.stringify({ seed: SEED, outcome, beats: { dark: trace[0].turn, lit: lit.turn, cut: cut.turn, relit: null }, terminalLamp, trace }, null, 2)}\n`,
  );
  console.log(`moth-season circuit beats dark@${trace[0].turn} lit@${lit.turn} cut@${cut.turn} relit=none terminal=${terminalLamp} hash=${outcome.eventLogHash}`);
});

/**
 * F-RPG-11, the fourth beat on its own ride, and the price it costs (measured 2026-09-07).
 *
 * The repair still works and the 1:1 grammar can still reach it — a rider walks the HERO to the
 * corridor and the Prospector drifts in behind it, sees the wrecked beacon inside its 10wu sweep,
 * walks the rest and mends it. What a rider cannot do is be in two places: every configuration
 * measured (mend post z of -2, -4, -6, -8 and -10; one, two and unlimited trips; trips gated from
 * waves 0, 3, 5, 6, 7, 8, 9, 10 and 11) either relights the corridor and dies at wave 5-8, or holds
 * the camp to wave 12 and leaves the corridor dark. This test pins ONE side of that trade with the
 * plainest ride of the set: leave for the corridor the moment it goes dark, come home when it is
 * lit. It relights at turn 37 and the run falls one wave short of the secure.
 *
 * This is the law working, not a regression: a human player faces exactly the same choice, which is
 * the whole of ADR-005 ("This has to be 1:1 the same for the AI"). Whether Moth Season should be
 * winnable WITH its corridor lit is a design question for the owner, filed as F-RPG-11.
 */
test('the fourth beat on its own ride: walking the hero to the corridor mends it, and costs the claim', async () => {
  const ride = await withSim(async ({ HeadlessContractSim }) => {
    const sim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed: SEED });
    const trace = [];
    let turn = sim.currentTurn();
    let index = 0;
    let mending = false;
    let trips = 0;
    while (!turn.terminal && index < 400) {
      const now = turn.view.now;
      const connect = now.canyonConnect ?? null;
      const dark = Boolean(connect?.complete && connect.powered === 0);
      if (mending && !dark) mending = false;
      if (!mending && dark && trips < 1) { mending = true; trips += 1; }
      const opening = FIXTURE[index]?.filter((order) => order.verb !== 'REPAIR_UNDER' && order.verb !== 'MOVE_HERO') ?? [];
      const orders = now.pendingSecure
        ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }]
        : now.pendingOffer?.length
          ? [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }]
          : [...(index < 2 ? opening : []), { verb: 'REPAIR_UNDER', pct: 60 },
             { verb: 'MOVE_HERO', pos: mending ? { x: 0, z: -6 } : { x: 0, z: 10 } }];
      assert.equal(sim.submitOrders(orders).outcome.ok, true, `turn ${index}`);
      trace.push({ turn: index, wave: now.wave, mending, ...circuit(sim) });
      index += 1;
      turn = sim.advanceToTurn();
    }
    return { trace, outcome: turn.terminal ? sim.outcome() : null };
  });

  const lit = ride.trace.find((row) => row.lamp === 'powered');
  const cut = ride.trace.find((row) => row.turn > lit.turn && row.span === 'cut');
  const relit = ride.trace.find((row) => row.turn > cut.turn && row.lamp === 'powered');
  assert.ok(relit, 'walking the hero to the corridor must still mend the beacon');
  assert.equal(relit.span, 'intact');
  assert.equal(relit.turn, 37, 'the mend lands on its pinned turn');
  assert.ok(ride.trace.slice(cut.turn, relit.turn).some((row) => row.mending), 'the mend needed the walk');
  // The price, pinned so nobody re-derives it by accident: the claim falls short of the secure wave.
  assert.deepEqual({ secured: ride.outcome?.secured, waves: ride.outcome?.waves }, { secured: false, waves: 11 });
  console.log(`moth-season mend ride lit@${lit.turn} cut@${cut.turn} relit@${relit.turn} outcome=${JSON.stringify(ride.outcome)}`);
});

test('surviving the dark does not secure it: the corridor must have carried current', async () => {
  const results = await withSim(async ({ HeadlessContractSim, Balance }) => {
    const rig = { ...Balance.sparkRig };
    // The same isolation `e2e/er01-e3-census.spec.ts` uses on this map: an unkillable rider so
    // the ONLY thing separating the two runs below is the circuit, never the fight.
    Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
    try {
      const ride = (relay) => {
        const sim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed: SEED });
        sim.hero.applyStats(100_000, 1);
        sim.hero.heal(100_000);
        if (relay) assert.equal(sim.build.placeFree('sentry_beacon', RELAY_SITE, 0), true);
        let turn = sim.currentTurn();
        while (!turn.terminal && turn.view.now.wave < 15) turn = sim.advanceToTurn();
        return {
          terminal: turn.terminal,
          wave: turn.view.now.wave,
          connect: turn.view.now.canyonConnect,
          circuit: circuit(sim),
          outcome: turn.terminal ? sim.outcome() : null,
        };
      };
      return { dark: ride(false), relayed: ride(true) };
    } finally {
      Object.assign(Balance.sparkRig, rig);
    }
  });

  // Dark: the rider outlives every wave and still cannot secure — the deadline latched failed.
  assert.equal(results.dark.circuit.lamp, 'dark');
  assert.deepEqual(
    { powered: results.dark.connect.powered, complete: results.dark.connect.complete, failed: results.dark.connect.failed },
    { powered: 0, complete: false, failed: true },
  );
  assert.equal(results.dark.terminal, false, 'an unsecurable dark corridor must not terminate at the secure wave');
  assert.ok(results.dark.wave >= 15, `dark ride stopped early: ${JSON.stringify(results.dark)}`);

  // Relayed: the same rider, the same seed, one Sentry Beacon on the pylon site — secures at 12.
  // `complete`, not the live lamp: saboteurs may have the corridor down at the terminal tick and
  // the one-way latch still opens the secure (F-E3MS-1, the measured limit of the shared rule).
  assert.deepEqual(
    { complete: results.relayed.connect.complete, failed: results.relayed.connect.failed },
    { complete: true, failed: false },
  );
  assert.deepEqual(
    { secured: results.relayed.outcome?.secured, waves: results.relayed.outcome?.waves },
    { secured: true, waves: 12 },
  );
  console.log(`moth-season secure rule dark=${JSON.stringify(results.dark.connect)} relayed=${JSON.stringify(results.relayed.outcome)}`);
});
