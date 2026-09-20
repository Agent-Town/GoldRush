// s1521 — PREDICATE v3, the one that survives. Measured, then the ack cost counted.
//
// v2 excluded `owner-fork` blocks. But measuring blockClass on the live board shows EVERY blocked
// leaf is owner-gated: 5 owner-fork + 1 `disputed` (f1328-1), and fire.md 3.0 says treat disputed
// AS owner-fork until an attended session rules. So the exclusion is not a heuristic at all —
// it collapses to the clean statement: only `stopped` leaves are a FIRE's to re-examine.
// A blocked leaf waits on Robin; asking a fire to re-open it is the rf-34 shape.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);
const stem = (r) => path.basename(String(r).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');
const git = (a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

function pairs(goals) {
  const L = [];
  (function w(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id || n.taskFile) L.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) w(k);
  })({ subgoals: goals.goals || [] });
  const real = L.filter((l) => !(l.subgoals || l.tasks));
  const keys = [];
  for (const l of real.filter((l) => l.status === 'stopped')) {
    if (l.id) keys.push({ key: l.id, leaf: l });
    if (l.taskFile) keys.push({ key: stem(l.taskFile), leaf: l });
  }
  const out = new Set();
  for (const m of real.filter((l) => SHIPPED.has(l.status))) {
    const strs = Object.values(m).filter((v) => typeof v === 'string');
    for (const { key, leaf } of keys) {
      if (key.length < 8) continue;
      if (strs.some((v) => v.includes(key))) out.add(`${m.id || stem(m.taskFile || '?')} -> ${leaf.id}`);
    }
  }
  return out;
}

const revs = git(['log', '--format=%H', '--since=2026-07-01', '--reverse', '--', 'tasks/goals.json'])
  .trim().split('\n').filter(Boolean);
const life = new Map();
let head = new Set();
for (const h of revs) {
  let g; try { g = JSON.parse(git(['show', `${h}:tasks/goals.json`])); } catch { continue; }
  head = pairs(g);
  for (const p of head) life.set(p, (life.get(p) || 0) + 1);
}
const all = [...life.entries()].sort((a, b) => b[1] - a[1]);
const standing = all.filter(([p]) => head.has(p));
const resolved = all.filter(([p]) => !head.has(p));
const GHOSTS = ['-> e1-baron-fort-solidity', '-> tb-stall-census'];

console.log('===== V3: shipped leaf names a STOPPED leaf =====');
console.log('revisions replayed        :', revs.length);
console.log('distinct pairs ever fired :', all.length);
console.log('  resolved (leaf retired) :', resolved.length);
console.log('  STANDING on HEAD        :', standing.length, '  <- the one-time acknowledgement cost');
console.log();
console.log('catches the two KNOWN ghosts:');
for (const [p, n] of all.filter(([p]) => GHOSTS.some((g) => p.endsWith(g)))) console.log('  ', String(n).padStart(4), 'revs ', p);
console.log();
console.log('standing pairs today (each needs ONE ack, then the guard is silent):');
for (const [p, n] of standing) console.log('  ', String(n).padStart(4), 'revs ', p);
console.log();
console.log('pairs that RESOLVED on their own (true-positive shape in hindsight):');
for (const [p, n] of resolved) console.log('  ', String(n).padStart(4), 'revs ', p);
