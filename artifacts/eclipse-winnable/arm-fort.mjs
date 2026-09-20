/**
 * THE FORT-CAP ARM, measured as a PROBE before any per-contract plumbing is written.
 *
 *   node artifacts/eclipse-winnable/arm-fort.mjs --label fort-t6b9 --turrets 6 --beacons 9 --defence t6b9
 *
 * WHY A BALANCE PROBE AND NOT THE REAL OVERRIDE. A per-contract fort cap is not one read: the
 * pools `BuildSystem` allocates are sized from `def.maxCount` at MODULE LOAD
 * (`createFamily`, `src/systems/BuildSystem.ts:3232`), the browser's beacon `InstancedMesh` is
 * sized from `Balance.beacon.maxCount` (`src/world/LightRig.ts:653`), three arsenal systems size
 * their mount arrays from `Balance.turret.maxCount`, `RunSuspend` bounds a repair index by it, and
 * `MechanicsManifest` publishes a cost ladder of exactly that many rungs. Building all of that is
 * a day's work and it is only worth spending if MORE FORT IS WHAT THE MAP NEEDS. So this probe
 * asks the cheap question first — it raises the two Balance literals for the length of ONE ride,
 * runs the prover with a fort list wide enough to use them, and puts both files back in a
 * `finally`. The answer it returns is the arm's outcome, not a shippable change: a raised GLOBAL
 * number is exactly what this slice's honesty guard forbids shipping.
 */
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(root, 'artifacts/eclipse-winnable');
const BALANCE = path.join(root, 'src/game/Balance.ts');
const CONTRACTS = path.join(root, 'assets/contracts/epoch-8-orbital/contracts.json');
const LADDER = path.join(OUT_DIR, 'LADDER.log');

// The two literals, each pinned by the two lines above it so the replacement cannot land on one
// of the eleven other `maxCount:` lines in this file.
const BEACON_ANCHOR = '    costBase: 25,\n    costGrowth: 1.3,\n    maxCount: 6,';
const TURRET_ANCHOR = '    costBase: 50,\n    costGrowth: 1.35,\n    maxCount: 4,';

function parseArgs(argv) {
  const out = { label: null, turrets: null, beacons: null, defence: null, patch: '{}', seeds: ['e8-eclipse-01'], runs: 1 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--label') out.label = argv[i + 1];
    else if (argv[i] === '--turrets') out.turrets = Number(argv[i + 1]);
    else if (argv[i] === '--beacons') out.beacons = Number(argv[i + 1]);
    else if (argv[i] === '--defence') out.defence = argv[i + 1];
    else if (argv[i] === '--patch') out.patch = argv[i + 1];
    else if (argv[i] === '--seed') out.seeds = [argv[i + 1]];
    else if (argv[i] === '--runs') out.runs = Number(argv[i + 1]);
  }
  if (!out.label) {
    process.stderr.write('Usage: --label <name> [--turrets N] [--beacons N] [--defence <profile>] [--patch <twist patch>]\n');
    process.exit(1);
  }
  return out;
}

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

const options = parseArgs(process.argv.slice(2));
const originalBalance = await readFile(BALANCE, 'utf8');
const originalContracts = await readFile(CONTRACTS, 'utf8');
let report;
try {
  let balance = originalBalance;
  if (options.beacons !== null) {
    if (!balance.includes(BEACON_ANCHOR)) throw new Error('beacon anchor not found in Balance.ts');
    balance = balance.replace(BEACON_ANCHOR, BEACON_ANCHOR.replace('maxCount: 6,', `maxCount: ${options.beacons},`));
  }
  if (options.turrets !== null) {
    if (!balance.includes(TURRET_ANCHOR)) throw new Error('turret anchor not found in Balance.ts');
    balance = balance.replace(TURRET_ANCHOR, TURRET_ANCHOR.replace('maxCount: 4,', `maxCount: ${options.turrets},`));
  }
  await writeFile(BALANCE, balance);

  const bundle = JSON.parse(originalContracts);
  const row = bundle.contracts.find((entry) => entry.id === 'e8-eclipse');
  row.twist = merge(row.twist, JSON.parse(options.patch));
  await writeFile(CONTRACTS, `${JSON.stringify(bundle, null, 2)}\n`);

  const args = ['artifacts/eclipse-winnable/prover.mjs', '--contract', 'e8-eclipse', '--runs', String(options.runs), '--trace'];
  for (const seed of options.seeds) args.push('--seed', seed);
  if (options.defence) args.push('--defence', options.defence);
  const started = Date.now();
  const child = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (child.status !== 0) throw new Error(`prover exited ${child.status}: ${child.stderr.split('\n').slice(-5).join(' | ')}`);
  report = JSON.parse(child.stdout);
  report.arm = {
    label: options.label,
    probe: 'BALANCE LITERALS RAISED FOR THIS RIDE ONLY — never shipped',
    turrets: options.turrets,
    beacons: options.beacons,
    defence: options.defence,
    patch: JSON.parse(options.patch),
    seconds: Math.round((Date.now() - started) / 1000),
  };
} finally {
  await writeFile(BALANCE, originalBalance);
  await writeFile(CONTRACTS, originalContracts);
}

await writeFile(path.join(OUT_DIR, `arm-${options.label}.json`), `${JSON.stringify(report, null, 2)}\n`);
const rows = report.runs.map((run) => {
  const outcome = run.outcome ?? {};
  const last = run.trace?.[run.trace.length - 1] ?? {};
  return `${run.seed}#${run.run} secured=${outcome.secured} w${outcome.waves} t=${(outcome.timeMs ?? 0) / 1000}s gold=${outcome.gold} kills=${outcome.kills} tiers=[${(last.tiers ?? []).join(',')}] works=${JSON.stringify(last.works ?? {})} hash=${outcome.eventLogHash}`;
});
const line = `${options.label} | PROBE turrets=${options.turrets} beacons=${options.beacons} | patch ${options.patch} | defence ${options.defence ?? 'default'} | secured=${report.secured} | ${report.arm.seconds}s\n${rows.map((row) => `    ${row}`).join('\n')}\n`;
await appendFile(LADDER, line);
process.stdout.write(line);
