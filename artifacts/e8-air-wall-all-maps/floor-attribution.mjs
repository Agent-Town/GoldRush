/**
 * WHICH HALF OF THE CHANGE MOVED EACH FLOOR — attribution for the six sibling `null-floors.json`
 * rows, in `artifacts/mare-claim-air-prevalent/floor-attribution.mjs`'s manner (which is
 * `artifacts/canyon-works-second-lever/floor-attribution.mjs`'s).
 *
 *   node artifacts/e8-air-wall-all-maps/floor-attribution.mjs
 *
 * The change has two halves and they move the hash for different reasons, so a reader should not
 * have to guess which:
 *   A. the NEW DIAGNOSTIC FIELDS — the four regolith window fields on all three siblings, plus
 *      `credited` / `windowWaves` / `window` / `creditedThisWindow` / `windowHeldEntries` on the
 *      two crossing maps. `suitAir.diagnostics` rides `eventLogHash` (`HeadlessContractSim`, the
 *      E8 spread-if-declared row), so new keys move it even on a ride that crosses nothing;
 *   B. the AUTHORED NUMBERS (`crossingRequired` 1/3 -> 4 on the crossing maps, `regolithRequired`
 *      1 -> 4 on the Eclipse, and both windows) — they sit in the same payload, so authoring them
 *      moves the hash too.
 * An idle floor works no ground, makes no crossing and never secures, so neither half can change
 * the OUTCOME. This probe proves that: it rides the idle policy both ways and prints the fields.
 *
 * THE MARE CLAIM RIDES HERE TOO, AS THE CONTROL. This slice moved the Mare Claim's own window
 * bookkeeping into `src/systems/E8AirWindow.ts` so both consumers enforce one law; the control
 * rows are what prove that refactor was behaviour-identical rather than merely intended to be.
 *
 * The "authored numbers off" variant is produced by wrapping `E8SuitAirSystem.create` so it sees
 * the contract with `twist.atmosphere` stripped — the engine's own default path, not a separate
 * code path invented for the measurement.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MAPS = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse'];
const CONTROL = 'e8-mare-claim';
/** The rows pinned on `main` before this slice, quoted so the diff reads without a second file. */
const PINNED = {
  'e8-far-side-01': 'fnv1a32:5c30efd5',
  'e8-far-side-02': 'fnv1a32:47d63524',
  'e8-low-orbit-01': 'fnv1a32:6e1931c2',
  'e8-low-orbit-02': 'fnv1a32:b77f104b',
  'e8-eclipse-01': 'fnv1a32:466507ac',
  'e8-eclipse-02': 'fnv1a32:1568e702',
  'e8-mare-claim-01': 'fnv1a32:32f62335',
  'e8-mare-claim-02': 'fnv1a32:7b215239',
};

const location = new URL(`http://gr-sim.local/?debug&contract=${MAPS[0]}&seed=${MAPS[0]}-01`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const quiet = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

let rows;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
  const realCreate = Object.getOwnPropertyDescriptor(E8SuitAirSystem, 'create');

  /** The idle floor, ridden exactly as `scripts/null-floor-anchors.mjs` rides it: no orders at all. */
  const idle = (contractId, seed) => {
    const sim = new HeadlessContractSim({ contractId, seed });
    let turn = sim.currentTurn();
    let decisions = 0;
    while (!turn.terminal && decisions < 400) {
      turn = sim.advanceToTurn();
      decisions += 1;
    }
    const outcome = sim.outcome();
    const air = turn.view.now.air ?? null;
    return {
      secured: outcome.secured,
      waves: outcome.waves,
      timeMs: outcome.timeMs,
      gold: outcome.gold,
      kills: outcome.kills,
      eventLogHash: outcome.eventLogHash,
      regolith: air?.regolith ?? null,
      crossing: air?.crossing ?? null,
    };
  };

  const withoutAuthored = (body) => {
    Object.defineProperty(E8SuitAirSystem, 'create', {
      value: (contract) => realCreate.value.call(
        E8SuitAirSystem,
        { ...contract, twist: { ...contract.twist, atmosphere: undefined } },
      ),
      writable: true,
      configurable: true,
    });
    try {
      return body();
    } finally {
      Object.defineProperty(E8SuitAirSystem, 'create', realCreate);
    }
  };

  rows = [];
  for (const contractId of [...MAPS, CONTROL]) {
    for (const suffix of ['01', '02']) {
      const seed = `${contractId}-${suffix}`;
      rows.push({
        contract: contractId,
        seed,
        pinnedOnMain: PINNED[seed],
        fieldsOnly: withoutAuthored(() => idle(contractId, seed)),
        fieldsAndNumbers: idle(contractId, seed),
      });
    }
  }
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

const out = path.join(root, 'artifacts/e8-air-wall-all-maps/floor-attribution.json');
await writeFile(out, `${JSON.stringify({ measuredAt: new Date().toISOString(), rows }, null, 2)}\n`);
for (const row of rows) {
  const same = ['secured', 'waves', 'timeMs', 'gold', 'kills']
    .every((field) => row.fieldsOnly[field] === row.fieldsAndNumbers[field]);
  const gate = (side) => (row[side].crossing
    ? `crossing.required ${row[side].crossing.required}, windowWaves ${row[side].crossing.windowWaves}`
    : `regolith.required ${row[side].regolith?.required}, windowWaves ${row[side].regolith?.windowWaves}`);
  process.stdout.write(`${row.seed}\n`);
  process.stdout.write(`  pinned on main        ${row.pinnedOnMain}\n`);
  process.stdout.write(`  + new fields only     ${row.fieldsOnly.eventLogHash}  (${gate('fieldsOnly')})\n`);
  process.stdout.write(`  + authored numbers    ${row.fieldsAndNumbers.eventLogHash}  (${gate('fieldsAndNumbers')})\n`);
  process.stdout.write(`  moved: ${row.fieldsAndNumbers.eventLogHash !== row.pinnedOnMain}; outcome unchanged across both: ${same} — secured ${row.fieldsAndNumbers.secured}, waves ${row.fieldsAndNumbers.waves}, timeMs ${row.fieldsAndNumbers.timeMs}, gold ${row.fieldsAndNumbers.gold}, kills ${row.fieldsAndNumbers.kills}\n`);
}
process.stdout.write(`wrote ${path.relative(root, out)}\n`);
