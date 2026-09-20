// s1521 — REPLAY the reverse-direction predicate over the board's real history.
//
// Today's board gives a yield (16 pairs) but says nothing about PRECISION, because every open leaf
// on it is long-known. The question that prices the guard is: at the tree just BEFORE s1518 cured
// F-1518-2, does the predicate name the baron pair — and how much noise does it name alongside?
//
// A guard that fires on the real ghost 1 time out of 17 is not a guard, it is a chore.
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);
const OPEN = new Set(['stopped', 'blocked']);
const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');

const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });

function predicate(goals) {
  const leaves = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.id || n.taskFile) leaves.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: goals.goals || [] });
  const real = leaves.filter((l) => !(l.subgoals || l.tasks));
  const open = real.filter((l) => OPEN.has(l.status));
  const shipped = real.filter((l) => SHIPPED.has(l.status));
  const openKeys = [];
  for (const l of open) {
    if (l.id) openKeys.push({ key: l.id, leaf: l });
    if (l.taskFile) openKeys.push({ key: stem(l.taskFile), leaf: l });
  }
  const pairs = new Set();
  for (const m of shipped) {
    const strs = Object.values(m).filter((v) => typeof v === 'string');
    for (const { key, leaf } of openKeys) {
      if (key.length < 8) continue;
      if (strs.some((v) => v.includes(key))) pairs.add(`${m.id || stem(m.taskFile || '?')} -> ${leaf.id}`);
    }
  }
  return { pairs, openCount: open.length };
}

// Every revision of goals.json since 2026-07-01, oldest first.
const revs = git(['log', '--format=%H %cI', '--since=2026-07-01', '--reverse', '--', 'tasks/goals.json'])
  .trim().split('\n').filter(Boolean).map((l) => { const [h, d] = l.split(' '); return { h, d }; });

console.log('revisions of tasks/goals.json since 2026-07-01:', revs.length);

const BARON = 'e1-baron-fort-solidity';
let baronRevs = 0, firstBaron = null, lastBaron = null;
const allPairs = new Map();   // pair -> revisions alive
let sampled = 0;

for (const r of revs) {
  let goals;
  try { goals = JSON.parse(git(['show', `${r.h}:tasks/goals.json`])); } catch { continue; }
  sampled++;
  const { pairs } = predicate(goals);
  for (const p of pairs) allPairs.set(p, (allPairs.get(p) || 0) + 1);
  const baron = [...pairs].filter((p) => p.endsWith(`-> ${BARON}`));
  if (baron.length) { baronRevs++; firstBaron ??= r; lastBaron = r; }
}

console.log('revisions parsed :', sampled);
console.log();
console.log('=== DOES IT NAME THE F-1518-2 GHOST? ===');
console.log('revisions where some shipped leaf names', BARON, 'while it was open:', baronRevs);
if (firstBaron) console.log('  first:', firstBaron.h.slice(0, 8), firstBaron.d, ' last:', lastBaron.h.slice(0, 8), lastBaron.d);
console.log();
console.log('=== NOISE FLOOR: every pair the predicate ever fired, by lifetime in revisions ===');
const sorted = [...allPairs.entries()].sort((a, b) => b[1] - a[1]);
console.log('distinct pairs ever fired:', sorted.length);
for (const [p, n] of sorted) console.log(String(n).padStart(4), 'revs  ', p);
