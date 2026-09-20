// s1521 — PREDICATE v2, and the honest scoring of v1 that motivated it.
//
// v1 (reverse direction) fired 30 distinct pairs over 884 revisions. Reading them one by one shows
// the first read ("all noise") was WRONG: several pairs stopped firing precisely because the open
// leaf was later resolved — which is what a true positive looks like in hindsight. So the useful
// split is not true/false, it is: pairs that RESOLVED (the leaf left the open set) vs pairs still
// firing today (which, on a board this old, are the standing false positives).
//
// v2 adds one exclusion, from the observation that today's noise concentrates on leaves a fire is
// FORBIDDEN to supersede anyway: owner-fork blocks (fire.md 3.0 — lifted by the OWNER only).
// Asking a fire to re-examine those is asking it to do the one thing the block exists to prevent.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);
const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');
const git = (a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 28 });

// v2 open set: stopped always; blocked ONLY when the block is not the owner's to lift.
function isOpenV2(l) {
  if (l.status === 'stopped') return true;
  if (l.status !== 'blocked') return false;
  const cls = l.blockClass || 'owner-fork'; // fire.md: undeclared fails safe to owner-fork
  return cls !== 'owner-fork';
}
const isOpenV1 = (l) => l.status === 'stopped' || l.status === 'blocked';

function pairsFor(goals, isOpen) {
  const leaves = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id || n.taskFile) leaves.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: goals.goals || [] });
  const real = leaves.filter((l) => !(l.subgoals || l.tasks));
  const open = real.filter(isOpen);
  const keys = [];
  for (const l of open) {
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

const life = { v1: new Map(), v2: new Map() };
let last = { v1: new Set(), v2: new Set() };
for (const h of revs) {
  let g; try { g = JSON.parse(git(['show', `${h}:tasks/goals.json`])); } catch { continue; }
  for (const v of ['v1', 'v2']) {
    const p = pairsFor(g, v === 'v1' ? isOpenV1 : isOpenV2);
    for (const x of p) life[v].set(x, (life[v].get(x) || 0) + 1);
    last[v] = p;
  }
}

const GHOSTS = ['-> e1-baron-fort-solidity', '-> tb-stall-census'];  // the two REAL ones, F-1518-2 + F-1519-1
for (const v of ['v1', 'v2']) {
  const all = [...life[v].entries()].sort((a, b) => b[1] - a[1]);
  const stillFiring = all.filter(([p]) => last[v].has(p));
  const resolved = all.filter(([p]) => !last[v].has(p));
  const caught = all.filter(([p]) => GHOSTS.some((g) => p.endsWith(g)));
  console.log(`\n===== ${v.toUpperCase()} =====`);
  console.log('distinct pairs ever  :', all.length);
  console.log('  resolved (leaf left the open set) :', resolved.length);
  console.log('  STILL FIRING on HEAD (standing FP):', stillFiring.length);
  console.log('catches the 2 known ghosts:', caught.length ? caught.map(([p, n]) => `${p} [${n} revs]`).join(' | ') : 'NO');
  if (stillFiring.length) {
    console.log('  standing false positives today:');
    for (const [p, n] of stillFiring) console.log('   ', String(n).padStart(4), 'revs ', p);
  }
}
