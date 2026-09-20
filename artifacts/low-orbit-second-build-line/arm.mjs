/**
 * THE LEVER LADDER — one arm, measured, then put back exactly as it was.
 *
 *   node artifacts/low-orbit-second-build-line/arm.mjs --label spine-gantry \
 *     --tile-patch @artifacts/low-orbit-second-build-line/tile-spine-gantry.json \
 *     --defence-file artifacts/low-orbit-second-build-line/defence-spine-gantry.json
 *
 * `artifacts/eclipse-winnable/arm.mjs` carried forward. THREE CHANGES: the row it patches is
 * `--contract` (default `e8-low-orbit`) rather than the hard-coded `e8-eclipse`; `--defence-file`
 * rides through to the prover so a build-zone arm can vary the fort with the zone; and the ladder
 * line names the file when one is given. Its `finally` still restores the ORIGINAL BYTES.
 *
 * WHY A HARNESS RATHER THAN AN EDIT PER ARM. `ContractFamilies.ts` imports every epoch's
 * `contracts.json` STATICALLY, so an arm is a file edit plus a fresh process, and an arm left
 * behind is a measurement that silently contaminates the next one. This harness therefore reads
 * the authored bytes, writes the patched bytes, runs the prover in a child process, and restores
 * the ORIGINAL BYTES in a `finally` — so a crash, a kill or a failed ride all leave the tree
 * exactly as they found it. It patches `twist` on the `e8-eclipse` row and nothing else.
 *
 * The prover it drives is `artifacts/eclipse-winnable/prover.mjs` (the air-wall prover's Eclipse
 * policy, unchanged except for the fort list an arm may widen), driven over the door's own
 * vocabulary in a separate process. Nothing here mints gold, imports an engine or touches
 * `Balance`.
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(root, 'artifacts/low-orbit-second-build-line');
const CONTRACTS = path.join(root, 'assets/contracts/epoch-8-orbital/contracts.json');
const LADDER = path.join(OUT_DIR, 'LADDER.log');

function parseArgs(argv) {
  const out = { label: null, patch: '{}', tilePatch: '{}', seeds: ['e8-low-orbit-01'], runs: 1, defence: null, kite: null, prover: 'artifacts/low-orbit-second-build-line/prover.mjs', contract: 'e8-low-orbit', defenceFile: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--label') out.label = argv[i + 1];
    else if (argv[i] === '--patch') out.patch = argv[i + 1];
    else if (argv[i] === '--tile-patch') out.tilePatch = argv[i + 1];
    else if (argv[i] === '--seed') out.seeds = [argv[i + 1]];
    else if (argv[i] === '--seeds') out.seeds = argv[i + 1].split(',');
    else if (argv[i] === '--runs') out.runs = Number(argv[i + 1]);
    else if (argv[i] === '--defence') out.defence = argv[i + 1];
    else if (argv[i] === '--kite') out.kite = argv[i + 1];
    else if (argv[i] === '--prover') out.prover = argv[i + 1];
    else if (argv[i] === '--contract') out.contract = argv[i + 1];
    else if (argv[i] === '--defence-file') out.defenceFile = argv[i + 1];
    // The one prover knob an arm needs to reach: `--sortie-from-wave 999` suppresses the crossing
    // errand, which is F-EAL-3's own falsifier ("the same rider with sorties suppressed outlives
    // the gate"). An arm that authors a zone has to be able to re-run that control on the zone.
    else if (argv[i] === '--sortie-from-wave') out.sortieFromWave = argv[i + 1];
  }
  if (!out.label) {
    process.stderr.write('Usage: --label <name> [--patch <json twist patch>] [--defence <fort profile>] [--seed <id>] [--runs N]\n');
    process.exit(1);
  }
  return out;
}

/** A patch of `undefined` DELETES the key, which is how an arm removes an authored field. */
function merge(base, patch) {
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete out[key];
    else if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = merge(out[key], value);
    } else out[key] = value;
  }
  return out;
}

/**
 * THE HERO POST AN ARM RIDES WITH, and it is a MEASURED correction to the harness rather than a
 * preference. `artifacts/eclipse-winnable/arm.mjs` sent `--no-kite` whenever `--kite` was absent,
 * because on the Eclipse the ride an arm is compared against is the air-WALL ride, which had no
 * hero post at all. On Low Orbit the ride an arm is compared against is the air-LOGICAL ride, and
 * that one posts the hero at (0, 10) — so an arm that inherited `--no-kite` here would measure a
 * different policy from its own baseline. It does, and loudly: the first four arms of `LADDER.log`
 * ran that way and two of them died at WAVE 2, t = 82.4 s, byte-identical to each other with one
 * turret standing, because an unsteered hero in free fall coasts to the map bound and suffocates
 * (F-EAL-5). Those rows are kept exactly as they were measured and are marked `kite none`.
 *
 * `--kite none` still reproduces that behaviour on purpose; everything else takes the map's own
 * post. Pass `--kite x,z` to move it.
 */
const KITE_DEFAULT = { 'e8-low-orbit': '0,10', 'e8-eclipse': 'none', 'e8-far-side': '0,-36', 'e8-mare-claim': '0,4' };

const options = parseArgs(process.argv.slice(2));
const tilePatchLabel = options.tilePatch;
const patchLabel = options.patch;
// `@path` reads the patch from a file: a build-zone arm carries the whole authored list and does
// not fit a shell argument without quoting it into something no reader can check.
if (options.tilePatch.startsWith('@')) options.tilePatch = await readFile(path.resolve(root, options.tilePatch.slice(1)), 'utf8');
if (options.patch.startsWith('@')) options.patch = await readFile(path.resolve(root, options.patch.slice(1)), 'utf8');
const original = await readFile(CONTRACTS, 'utf8');
let report;
try {
  const bundle = JSON.parse(original);
  const row = bundle.contracts.find((entry) => entry.id === options.contract);
  if (!row) throw new Error(`${options.contract} row not found`);
  row.twist = merge(row.twist, JSON.parse(options.patch));
  row.tileParams = merge(row.tileParams, JSON.parse(options.tilePatch));
  await writeFile(CONTRACTS, `${JSON.stringify(bundle, null, 2)}\n`);

  const args = [options.prover, '--contract', options.contract, '--runs', String(options.runs), '--trace'];
  for (const seed of options.seeds) args.push('--seed', seed);
  if (options.defence) args.push('--defence', options.defence);
  if (options.defenceFile) args.push('--defence-file', options.defenceFile);
  if (options.sortieFromWave) args.push('--sortie-from-wave', options.sortieFromWave);
  // ALWAYS explicit, never inherited: the prover's own default is the hero post that wins, so an
  // arm that said nothing would silently measure a different policy than the row it writes.
  const kite = options.kite ?? KITE_DEFAULT[options.contract] ?? 'none';
  if (kite === 'none') args.push('--no-kite');
  else args.push('--kite', kite);
  const started = Date.now();
  const child = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (child.status !== 0) throw new Error(`prover exited ${child.status}: ${child.stderr.split('\n').slice(-5).join(' | ')}`);
  report = JSON.parse(child.stdout);
  report.arm = {
    label: options.label,
    patch: JSON.parse(options.patch),
    tilePatch: JSON.parse(options.tilePatch),
    defence: options.defence,
    defenceFile: options.defenceFile,
    contract: options.contract,
    kite,
    seconds: Math.round((Date.now() - started) / 1000),
  };
} finally {
  await writeFile(CONTRACTS, original);
}

await writeFile(path.join(OUT_DIR, `arm-${options.label}.json`), `${JSON.stringify(report, null, 2)}\n`);
const rows = report.runs.map((run) => {
  const outcome = run.outcome ?? {};
  const last = run.trace?.[run.trace.length - 1] ?? {};
  return `${run.seed}#${run.run} secured=${outcome.secured} w${outcome.waves} t=${(outcome.timeMs ?? 0) / 1000}s gold=${outcome.gold} kills=${outcome.kills} tiers=[${(last.tiers ?? []).join(',')}] works=${JSON.stringify(last.works ?? {})} hash=${outcome.eventLogHash}`;
});
const line = `${options.label} | patch ${patchLabel} | tile ${tilePatchLabel} | defence ${options.defenceFile ?? options.defence ?? 'default'} | kite ${report.arm.kite} | secured=${report.secured} identical=${report.identical} | ${report.arm.seconds}s\n${rows.map((row) => `    ${row}`).join('\n')}\n`;
await appendFile(LADDER, line);
process.stdout.write(line);
