// s1468 drain bookkeeping: flip the leaf to merged + 40-hex mergeHash, rename the done-move.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';

const MERGE = '8e3c149177fd00bca7dda4356d49d2b580663e7e';
const SHORT = MERGE.slice(0, 8);
const ID = 'f1467-1-alpha-recipe-ab';

// --- goal leaf ---
const raw = readFileSync('tasks/goals.json', 'utf8');
const g = JSON.parse(raw);
let hit = null;
(function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (n && typeof n === 'object') {
    if (n.id === ID) hit = n;
    Object.values(n).forEach(walk);
  }
})(g);
if (!hit) { console.error('LEAF NOT FOUND'); process.exit(1); }
hit.status = 'merged';
hit.mergeHash = MERGE;
if (!hit.review) hit.review = 'reviews/f1467-alpha-recipe-ab.md';
console.log('leaf ->', JSON.stringify({ id: hit.id, status: hit.status, mergeHash: hit.mergeHash, review: hit.review }));

// preserve trailing newline convention
const trailing = raw.endsWith('\n') ? '\n' : '';
writeFileSync('tasks/goals.json', JSON.stringify(g, null, 2) + trailing);

// --- done-move rename (claim -> fact) ---
const from = 'tasks/done/20260806-005756-lane-f1467-1-alpha-recipe-ab.md';
const to = `tasks/done/drained-${SHORT}-20260806-005756-lane-f1467-1-alpha-recipe-ab.md`;
if (existsSync(from)) { renameSync(from, to); console.log('renamed done-move ->', to); }
else console.log('done-move already renamed or missing:', from);
