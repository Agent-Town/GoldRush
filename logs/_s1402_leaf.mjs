// s1402: register the F-1402-1 cure as a goal leaf under factory-infra/factory-truth
// (Goal Registration Law: the drain/land commit and its leaf move together).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const P = REPO + '/tasks/goals.json';
const full = execFileSync('git', ['-C', REPO, 'rev-parse', '8f10884e'], { encoding: 'utf8' }).trim();
if (!/^[0-9a-f]{40}$/.test(full)) { console.error('bad hash ' + full); process.exit(2); }

const g = JSON.parse(readFileSync(P, 'utf8'));
const infra = g.goals.find((x) => x.id === 'factory-infra');
const truth = infra.subgoals.find((x) => x.id === 'factory-truth');
if (truth.tasks.some((t) => t.id === 'f1402-1-main-lock-gate')) { console.log('already present'); process.exit(0); }

truth.tasks.push({
  id: 'f1402-1-main-lock-gate',
  title:
    "F-1402-1 — the runner's main-slot lock gate reads STATUS line 1 only ✅ " +
    "(was `head -2 | grep 'ACTIVE 2'`: §4's line-2 archive bullet starved main ~6h from s1393, " +
    'and the literal match left main OPEN in 31 of 58 measured lock states); ' +
    'guarded by scripts/main-lock-gate-guard.test.sh, teeth proven both directions. ' +
    'INERT until the lane runner is restarted.',
  status: 'merged',
  mergeHash: full,
});

writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('leaf registered, mergeHash ' + full);
