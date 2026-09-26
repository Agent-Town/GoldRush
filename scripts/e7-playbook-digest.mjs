#!/usr/bin/env node
// E7 playbook digest: rides the four Signal maps through the SAME scripted order stream in Node
// that `e2e/e7-playbook-rows.spec.ts` rides in the browser runtime, and prints one JSON object
// keyed by contract. The two sides are compared field for field; that comparison IS the
// both-engines claim for this slice (the county's own definition: one `HeadlessContractSim`, one
// seed, one order stream, two runtimes).
//
// Usage: node scripts/e7-playbook-digest.mjs [--all | <contract>]
// The digest runs only when this file is the entry point, decided by real path (F-SF1-2).
import { isMain } from './is-main.mjs';
import { createServer } from 'vite';

const RELAY_R1_PAD = { x: -45, z: 40 };
const harvest = (seam, count) => Array.from({ length: count }, () => ({ verb: 'HARVEST', seam }));

export const E7_PLAYBOOK_SCRIPTS = {
  'e7-relay-valley': [[
    { verb: 'PLAYBOOK_USE', name: 'light-the-relay' },
    ...harvest('gold-seam-1', 10),
    { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
  ]],
  'e7-echo-canyon': [
    [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, ...harvest('gold-seam-1', 6), { verb: 'MOVE_HERO', pos: { x: 0, z: 10 } }],
    [{ verb: 'PLAYBOOK_USE', name: 'canyon-patrol' }, { verb: 'MOVE_HERO', pos: { x: 0, z: 10 } }],
  ],
  'e7-dead-band': [[{ verb: 'PLAYBOOK_USE', name: 'old-tools' }]],
  'e7-relay-rush': [[
    { verb: 'PLAYBOOK_USE', name: 'relay-program' },
    ...harvest('gold-seam-1', 10),
    { verb: 'BUILD', what: 'sentry_beacon', where: RELAY_R1_PAD, when: { goldGte: 25 } },
    { verb: 'MOVE_HERO', pos: { x: -25, z: 41 } },
  ]],
};

/**
 * THE SUB-WAVE SCRIPTS, keyed on TICK rather than on turn, so the browser arm and the Node arm run
 * the same stream without either one calling `advanceToTurn` (which crosses wave boundaries).
 *
 * WHY THE BROWSER ARM IS BOUNDED, MEASURED NOT ASSUMED. `RunManager.install` builds a
 * `RunSuspendController` whenever `typeof document !== 'undefined'` (`src/game/RunManager.ts:93`),
 * and that controller's `captureBoundary` snapshots a `Game` (`game.actors[0]`, `game.buildSystem`,
 * `game.harvestSystem`, ...) through `JSON.parse(JSON.stringify(...))`. A `HeadlessContractSim`
 * has none of those fields, so the clone throws `"undefined" is not valid JSON` at the FIRST wave
 * boundary that passes its `wave <= 0` guard. In Node `document` is undefined, the controller is
 * never installed, and the same ride runs to its terminal. That is a pre-existing property of
 * riding this sim inside a page (`e2e/e4-roads-and-convoys.spec.ts` hit the same wall and bounded
 * its browser arm the same way); it is not E7's doing, and no E7 file is on that path.
 */
export const E7_SUBWAVE_SCRIPTS = {
  'e7-relay-valley': [{ atTick: 0, orders: E7_PLAYBOOK_SCRIPTS['e7-relay-valley'][0] }],
  'e7-echo-canyon': [
    { atTick: 0, orders: E7_PLAYBOOK_SCRIPTS['e7-echo-canyon'][0] },
    { atTick: 300, orders: E7_PLAYBOOK_SCRIPTS['e7-echo-canyon'][1] },
  ],
  'e7-dead-band': [{ atTick: 0, orders: E7_PLAYBOOK_SCRIPTS['e7-dead-band'][0] }],
  'e7-relay-rush': [{ atTick: 0, orders: E7_PLAYBOOK_SCRIPTS['e7-relay-rush'][0] }],
};

/** One tick under the first 30s wave boundary (`Balance.waves.waveInterval`), so no snapshot fires. */
export const SUBWAVE_TICKS = 890;

/** The bounded both-engine digest: the mechanic's counters plus the sim's own per-tick fingerprint. */
export function playbookSubWaveDigest(sim, script, ticks = SUBWAVE_TICKS) {
  const pending = [...script];
  for (let tick = 0; tick <= ticks; tick += 1) {
    while (pending.length > 0 && pending[0].atTick === tick) sim.submitOrders(pending.shift().orders);
    if (tick < ticks) sim.advanceOneTick();
  }
  const row = sim.currentTurn().view.now.playbookUse;
  const mirror = sim.currentTurn().view.now.broadcastMirror ?? null;
  return {
    objective: row.objective,
    objectiveMet: row.objectiveMet,
    uses: row.uses,
    repeats: row.repeats,
    programRuns: row.programRuns,
    programSuspensions: row.programSuspensions,
    relaysLitByProgram: row.relaysLitByProgram,
    refusals: row.refusals,
    shelfHashes: row.shelf.map(({ name, hash, uses }) => `${name}:${hash}:${uses}`),
    recordedUses: mirror ? mirror.recordedUses : null,
    pendingMirrors: mirror ? mirror.pending.length : null,
    tickHash: sim.tickHash(ticks),
  };
}

/** The comparable facts: the mechanic's own counters plus the terminal the run hashed to. */
export function playbookDigest(sim, script, turns = 40) {
  let turn = sim.currentTurn();
  for (let index = 0; index < turns && !turn.terminal; index += 1) {
    const orders = script[index];
    if (orders) sim.submitOrders(orders);
    turn = sim.advanceToTurn();
  }
  const row = turn.view.now.playbookUse;
  const outcome = sim.outcome();
  return {
    objective: row.objective,
    objectiveMet: row.objectiveMet,
    uses: row.uses,
    repeats: row.repeats,
    programRuns: row.programRuns,
    programSuspensions: row.programSuspensions,
    relaysLitByProgram: row.relaysLitByProgram,
    refusals: row.refusals,
    shelf: row.shelf.map(({ name, hash, entries, uses }) => ({ name, hash, entries, uses })),
    eventLogHash: outcome.eventLogHash,
    waves: outcome.waves,
    secured: outcome.secured,
  };
}

// isMain compares REAL paths: never a `file://${argv[1]}` string (this repo's checkout path contains
// a space, which `import.meta.url` percent-encodes) and never a resolved path, which a symlinked run
// defeats; either form silently never matches and the script prints nothing at all (F-SF1-2).
if (isMain(import.meta.url)) {
  const requested = process.argv.includes('--all')
    ? Object.keys(E7_PLAYBOOK_SCRIPTS)
    : process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
  const contracts = requested.length > 0 ? requested : Object.keys(E7_PLAYBOOK_SCRIPTS);
  const subWave = process.argv.includes('--sub-wave');
  const silenced = { log: console.log, info: console.info, debug: console.debug };
  const table = {};
  for (const contract of contracts) {
    const location = new URL(`http://e7-playbook-digest.local/?debug&contract=${contract}&seed=${contract}-01`);
    globalThis.location = location;
    globalThis.window = { location };
    console.log = console.info = console.debug = () => undefined;
    const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    try {
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      table[contract] = subWave
        ? playbookSubWaveDigest(new HeadlessContractSim({ contractId: contract, seed: `${contract}-01` }), E7_SUBWAVE_SCRIPTS[contract])
        : playbookDigest(new HeadlessContractSim({ contractId: contract, seed: `${contract}-01` }), E7_PLAYBOOK_SCRIPTS[contract]);
    } finally {
      await vite.close();
      Object.assign(console, silenced);
    }
  }
  process.stdout.write(`${JSON.stringify(table)}\n`);
}
