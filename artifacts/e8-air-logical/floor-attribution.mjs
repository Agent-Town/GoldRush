/**
 * FLOOR ATTRIBUTION — which half of this slice moved each of the eight E8 idle rows.
 *
 *   node artifacts/e8-air-logical/floor-attribution.mjs
 *
 * Three rides per seed, all `--policy=idle`, all through `scripts/gr-sim.mjs` as a separate
 * process, and the only thing that differs between them is the contract file the run is booted
 * against:
 *
 *   · SHIPPED     — the tree as it stands.
 *   · NO HARM     — the same tree with `twist.atmosphere.harmPerSecond` struck from all four rows.
 *     A suit that empties and costs nothing is the pre-directive rule, so anything that still
 *     differs from the pre-slice hash here is the VIEW's doing (the suit row gained
 *     `harmPerSecond`, `harmDealt` and `harmTicks`, and `body` changed) rather than the harm's.
 *   · PRE-SLICE   — the values `assets/contracts/null-floors.json` held before this slice, read
 *     from git rather than re-derived, so the comparison cannot drift with the working tree.
 *
 * The point of separating them: an outcome that moved because a human suffocated is the directive
 * working; an outcome that moved because a view field appeared would be a bug.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACTS = path.join(root, 'assets/contracts/epoch-8-orbital/contracts.json');
const BACKUP = path.join(root, 'artifacts/e8-air-logical/.contracts-backup.json');
const MAPS = ['e8-mare-claim', 'e8-far-side', 'e8-low-orbit', 'e8-eclipse'];

const idle = (contract, seed) => {
  const out = execFileSync(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle'], {
    cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  });
  const o = JSON.parse(out.trim().split('\n').at(-1));
  return { secured: o.secured, waves: o.waves, timeMs: o.timeMs, gold: o.gold, kills: o.kills, eventLogHash: o.eventLogHash };
};

const preSlice = JSON.parse(execFileSync('git', ['show', 'main:assets/contracts/null-floors.json'], { cwd: root, encoding: 'utf8' })).floors;
const shipped = JSON.parse(readFileSync(path.join(root, 'assets/contracts/null-floors.json'), 'utf8')).floors;

copyFileSync(CONTRACTS, BACKUP);
const rows = [];
try {
  const bundle = JSON.parse(readFileSync(CONTRACTS, 'utf8'));
  for (const row of bundle.contracts) delete row.twist.atmosphere.harmPerSecond;
  writeFileSync(CONTRACTS, `${JSON.stringify(bundle, null, 2)}\n`);
  for (const contract of MAPS) {
    for (const seed of Object.keys(shipped[contract])) {
      rows.push({ contract, seed, noHarm: idle(contract, seed) });
    }
  }
} finally {
  copyFileSync(BACKUP, CONTRACTS);
}

const report = rows.map(({ contract, seed, noHarm }) => {
  const before = preSlice[contract][seed];
  const after = shipped[contract][seed];
  const outcomeMoved = before.waves !== after.waves || before.timeMs !== after.timeMs || before.kills !== after.kills;
  return {
    contract,
    seed,
    before,
    viewFieldsOnly: noHarm,
    shipped: after,
    hashMovedByViewFields: before.eventLogHash !== noHarm.eventLogHash,
    outcomeMovedByViewFields: before.waves !== noHarm.waves || before.timeMs !== noHarm.timeMs || before.kills !== noHarm.kills,
    outcomeMoved,
    attribution: outcomeMoved
      ? (before.waves !== noHarm.waves || before.timeMs !== noHarm.timeMs || before.kills !== noHarm.kills
        ? 'VIEW FIELDS — investigate'
        : 'THE HUMAN SUFFOCATED')
      : 'hash only (the view grew three fields)',
  };
});

writeFileSync(path.join(root, 'artifacts/e8-air-logical/floor-attribution.json'), `${JSON.stringify(report, null, 2)}\n`);
for (const row of report) {
  process.stdout.write(`${row.contract}/${row.seed}: ${row.attribution}\n`);
  process.stdout.write(`  before      ${JSON.stringify(row.before)}\n`);
  process.stdout.write(`  no harm     ${JSON.stringify(row.viewFieldsOnly)}\n`);
  process.stdout.write(`  shipped     ${JSON.stringify(row.shipped)}\n`);
}
