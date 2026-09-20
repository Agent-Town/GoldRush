/**
 * WHICH HALF OF THE CHANGE MOVED THE FLOOR — attribution for the two mare-claim `null-floors.json`
 * rows, in `artifacts/canyon-works-second-lever/floor-attribution.mjs`'s manner.
 *
 *   node artifacts/mare-claim-air-prevalent/floor-attribution.mjs
 *
 * The change has two halves and they move the hash for different reasons, so a reader should not
 * have to guess which:
 *   A. the four NEW DIAGNOSTIC FIELDS (`windowWaves`, `window`, `creditedThisWindow`,
 *      `windowHeldPans`) — `atmosphere.diagnostics` rides `eventLogHash`
 *      (`src/sim/HeadlessContractSim.ts`, the E8 spread-if-declared row), so new keys move it even
 *      on a ride that never works a ground;
 *   B. the two AUTHORED NUMBERS (`required` 1 -> 4, the window) — `required` is in the same
 *      payload, so raising it moves the hash too.
 * An idle floor works NO ground and never secures, so neither half can change the OUTCOME. This
 * probe proves that: it rides the idle policy three ways and prints all six fields each time.
 *
 * The "authored numbers off" variant is produced by wrapping `E8AtmosphereSystem.create` so it
 * sees the contract with `twist.atmosphere` stripped — the engine's own default path, not a
 * separate code path invented for the measurement.
 */
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACT = 'e8-mare-claim';
const SEEDS = ['e8-mare-claim-01', 'e8-mare-claim-02'];

const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEEDS[0]}`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const quiet = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

let rows;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const physics = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
  const { E8AtmosphereSystem } = physics;
  const realCreate = Object.getOwnPropertyDescriptor(E8AtmosphereSystem, 'create');

  /** The idle floor, ridden exactly as `scripts/null-floor-anchors.mjs` rides it: no orders at all. */
  const idle = (seed) => {
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed });
    let turn = sim.currentTurn();
    let decisions = 0;
    while (!turn.terminal && decisions < 400) {
      turn = sim.advanceToTurn();
      decisions += 1;
    }
    const outcome = sim.outcome();
    return {
      secured: outcome.secured,
      waves: outcome.waves,
      timeMs: outcome.timeMs,
      gold: outcome.gold,
      kills: outcome.kills,
      eventLogHash: outcome.eventLogHash,
      regolith: turn.view.now.air?.regolith ?? null,
    };
  };

  const withoutAuthored = (body) => {
    Object.defineProperty(E8AtmosphereSystem, 'create', {
      value: (contract) => realCreate.value.call(
        E8AtmosphereSystem,
        { ...contract, twist: { ...contract.twist, atmosphere: undefined } },
      ),
      writable: true,
      configurable: true,
    });
    try {
      return body();
    } finally {
      Object.defineProperty(E8AtmosphereSystem, 'create', realCreate);
    }
  };

  rows = SEEDS.map((seed) => ({
    seed,
    // The pinned rows on `main`, quoted so the diff is readable without a second file open.
    pinnedOnMain: seed === SEEDS[0] ? 'fnv1a32:1a62757f' : 'fnv1a32:dc8e828d',
    fieldsOnly: withoutAuthored(() => idle(seed)),
    fieldsAndNumbers: idle(seed),
  }));
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

const out = path.join(root, 'artifacts/mare-claim-air-prevalent/floor-attribution.json');
await writeFile(out, `${JSON.stringify({ measuredAt: new Date().toISOString(), contract: CONTRACT, rows }, null, 2)}\n`);
for (const row of rows) {
  const same = ['secured', 'waves', 'timeMs', 'gold', 'kills']
    .every((field) => row.fieldsOnly[field] === row.fieldsAndNumbers[field]);
  process.stdout.write(`${row.seed}\n`);
  process.stdout.write(`  pinned on main        ${row.pinnedOnMain}\n`);
  process.stdout.write(`  + new fields only     ${row.fieldsOnly.eventLogHash}  (required ${row.fieldsOnly.regolith?.required}, windowWaves ${row.fieldsOnly.regolith?.windowWaves})\n`);
  process.stdout.write(`  + authored numbers    ${row.fieldsAndNumbers.eventLogHash}  (required ${row.fieldsAndNumbers.regolith?.required}, windowWaves ${row.fieldsAndNumbers.regolith?.windowWaves})\n`);
  process.stdout.write(`  outcome unchanged across all three: ${same} — secured ${row.fieldsAndNumbers.secured}, waves ${row.fieldsAndNumbers.waves}, timeMs ${row.fieldsAndNumbers.timeMs}, gold ${row.fieldsAndNumbers.gold}, kills ${row.fieldsAndNumbers.kills}\n`);
}
process.stdout.write(`wrote ${path.relative(root, out)}\n`);
