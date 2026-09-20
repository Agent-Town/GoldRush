// s1491 — RETENTION LAW: .gitignore:7 (*.log) would have left this fire's cited evidence
// untracked, i.e. dying with the disk while two ledger rows point at it. Rename to a tracked
// extension and repair every citation in the SAME commit -- a cure that rots the coordinates its
// own evidence cites is a known house failure.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';

const renames = [
  ['quiet-cold.log', 'quiet-cold.txt'],
  ['battery-run2.log', 'battery-run2.txt'],
  ['quiet-cold-run2.log', 'quiet-cold-run2.txt'],
];

for (const [from, to] of renames) {
  const src = `artifacts/f1489-1/${from}`;
  if (existsSync(src)) {
    renameSync(src, `artifacts/f1489-1/${to}`);
    console.log(`renamed ${from} -> ${to}`);
  }
}

for (const p of ['tasks/BACKLOG.md', 'artifacts/f1489-1/measurements.md']) {
  const before = readFileSync(p, 'utf8');
  let after = before;
  for (const [from, to] of renames) after = after.split(from).join(to);
  if (after !== before) {
    writeFileSync(p, after);
    console.log(`citations repaired in ${p}`);
  }
}
