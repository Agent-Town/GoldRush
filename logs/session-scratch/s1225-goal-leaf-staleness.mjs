// s1225 / F-1225-2 — measure the Goal Registration Law's actual failure mode.
//
// The law (fire.md, owner ruling 2026-07-16): "every drain updates that leaf's status and
// merge hash IN THE DRAIN COMMIT."  The only automated reader of goals.json is
// scripts/goal-tracker.test.mjs, whose denominator is:
//   (a) schema — a leaf CLAIMING merged must carry a mergeHash, and
//   (b) ten HARDCODED e1/e2-era leaf ids with pinned hashes.
// Neither can see the law's real failure: work that SHIPPED while its leaf was never flipped.
// Such a leaf sits at queued/building/planned and is perfectly schema-valid.
//
// This measures that class: for every leaf with a taskFile, find its done-move (if any) and
// compare the done-move's disposition prefix against the leaf's status.
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks/goals.json'), 'utf8'));

const leaves = [];
for (const goal of goals.goals) {
  for (const leaf of goal.tasks ?? []) leaves.push({ ...leaf, path: goal.id });
  for (const sub of goal.subgoals ?? []) {
    for (const leaf of sub.tasks ?? []) leaves.push({ ...leaf, path: `${goal.id}/${sub.id}` });
  }
}

const doneFiles = fs.readdirSync(path.join(root, 'tasks/done'));

// A done-move filename is "<disposition-prefix->…-<taskFile>".  Landed dispositions mean the
// work is ON MAIN; the leaf therefore owes a terminal status + a receipt.
const LANDED = /^(drained|shipped)-/;
const TERMINAL = new Set(['merged', 'shipped', 'superseded', 'verified-by-owner']);

const rows = [];
for (const leaf of leaves) {
  if (!leaf.taskFile) continue;
  const moves = doneFiles.filter((f) => f.endsWith(`-${leaf.taskFile}`));
  if (!moves.length) continue;
  const landed = moves.filter((f) => LANDED.test(f));
  if (!landed.length) continue;
  if (TERMINAL.has(leaf.status)) continue;
  rows.push({
    id: leaf.id,
    status: leaf.status,
    mergeHash: leaf.mergeHash ?? null,
    taskFile: leaf.taskFile,
    path: leaf.path,
    doneMoves: landed,
  });
}

const counts = {};
for (const leaf of leaves) counts[leaf.status] = (counts[leaf.status] ?? 0) + 1;

console.log(`leaves total: ${leaves.length}`);
console.log(`leaves with a taskFile: ${leaves.filter((l) => l.taskFile).length}`);
console.log('status histogram:', JSON.stringify(counts, null, 0));
console.log(`\nSTALE LEAVES (a landed done-move exists, leaf status is non-terminal): ${rows.length}`);
for (const r of rows) {
  console.log(`  ${r.id}  status=${r.status}  hash=${r.mergeHash ?? '—'}`);
  console.log(`      leaf path: ${r.path}`);
  for (const m of r.doneMoves) console.log(`      done-move: ${m}`);
}

fs.writeFileSync(
  path.join(root, 'logs/session-scratch/s1225-goal-leaf-staleness.json'),
  JSON.stringify({ total: leaves.length, counts, stale: rows }, null, 2),
);
