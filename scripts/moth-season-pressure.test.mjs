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
    { cwd: ROOT, encoding: 'utf8', input, timeout: 120_000 },
  );
  assert.equal(result.status, 0, result.stderr);
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

  // 4. THE REPAIR. The standing REPAIR_UNDER order relights it, and the ride secures at 12.
  const relit = trace.find((row) => row.turn > cut.turn && row.lamp === 'powered');
  assert.ok(relit, 'the corridor was never repaired after the cut');
  assert.equal(relit.span, 'intact');
  assert.deepEqual({ secured: outcome.secured, waves: outcome.waves }, { secured: true, waves: 12 });

  // MEASURED LIMIT, recorded not wished for (see `artifacts/e3-moth-season/report.md`, F-E3MS-1):
  // the shared `syncCanyonConnectObjective` latch is ONE-WAY in both engines, so what the secure
  // gates on is "the corridor carried current by wave 12", not "the lamp is lit at wave 12". This
  // ride reaches its terminal tick with the corridor `${terminalLamp}`; the assertion above is on
  // the latch, which is the rule the engines actually enforce.
  const terminalLamp = trace.at(-1).lamp;
  assert.ok(terminalLamp === 'powered' || terminalLamp === 'dark', 'the terminal corridor state must be readable');

  const evidenceDir = path.join(ROOT, process.env.GR_REFRESH_EVIDENCE === '1' ? 'artifacts/e3-moth-season' : 'test-results/evidence/e3-moth-season');
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(
    path.join(evidenceDir, `ride-${SEED}.json`),
    `${JSON.stringify({ seed: SEED, outcome, beats: { dark: trace[0].turn, lit: lit.turn, cut: cut.turn, relit: relit.turn }, terminalLamp, trace }, null, 2)}\n`,
  );
  console.log(`moth-season circuit beats dark@${trace[0].turn} lit@${lit.turn} cut@${cut.turn} relit@${relit.turn} terminal=${terminalLamp} hash=${outcome.eventLogHash}`);
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
