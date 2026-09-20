// s1521 — THE REVERSE-DIRECTION PREDICATE, run on the live corpus BEFORE anyone builds a guard.
//
// s1520's shipped guard walks FORWARD: a stopped leaf names `Successor: y.md`; is y shipped?
// F-1518-2's ghost names no successor, so that guard is blind to it — correctly, and it says so.
//
// But the F-1518-2 pair is still structurally visible, from the OTHER END. The dispatch row for
// `f1452-1` named `e1-baron-fort-solidity` explicitly ("stays stopped ... this supersedes nothing").
// That reference survives in the ledger. So the predicate is:
//
//   a leaf M that HAS SHIPPED, whose own prose names a leaf L that is STILL stopped/blocked
//     => re-ask: did M supersede L?
//
// No temporal-claim parsing, no future tense, no NLP. Just a reference and two statuses.
// This script measures its YIELD and its FALSE-POSITIVE rate on today's board. It builds nothing.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const leaves = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.id || n.taskFile) leaves.push(n);
  for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
})({ subgoals: goals.goals || [] });
const realLeaves = leaves.filter((l) => !(l.subgoals || l.tasks));

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);
const OPEN = new Set(['stopped', 'blocked']);
const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');

const open = realLeaves.filter((l) => OPEN.has(l.status));
const shipped = realLeaves.filter((l) => SHIPPED.has(l.status));

console.log('=== DENOMINATORS ===');
console.log('real leaves      :', realLeaves.length);
console.log('open (stopped|blocked):', open.length, open.map((l) => `${l.id}[${l.status}]`).join(', '));
console.log('shipped leaves   :', shipped.length);
console.log();

// Every token by which an open leaf can be named: its id, and its taskFile stem.
const openKeys = [];
for (const l of open) {
  if (l.id) openKeys.push({ key: l.id, leaf: l });
  if (l.taskFile) openKeys.push({ key: stem(l.taskFile), leaf: l });
}

const hits = [];
for (const m of shipped) {
  const blob = Object.entries(m)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => [k, v]);
  for (const { key, leaf } of openKeys) {
    if (key.length < 8) continue; // avoid degenerate short ids matching prose
    for (const [k, v] of blob) {
      const i = v.indexOf(key);
      if (i < 0) continue;
      hits.push({
        shippedLeaf: m.id || stem(m.taskFile || '?'),
        shippedStatus: m.status,
        mergeHash: (m.mergeHash || '').slice(0, 8),
        key: k,
        namesOpen: leaf.id,
        openStatus: leaf.status,
        quote: v.slice(Math.max(0, i - 260), Math.min(v.length, i + 260)).replace(/\s+/g, ' '),
      });
      break;
    }
  }
}

console.log('=== YIELD: shipped leaf whose prose names a still-open leaf ===');
console.log('hits            :', hits.length);
console.log('distinct pairs  :', new Set(hits.map((h) => `${h.shippedLeaf}->${h.namesOpen}`)).size);
console.log('open leaves hit :', new Set(hits.map((h) => h.namesOpen)).size, '/', open.length);
console.log();
for (const h of hits) {
  console.log('---');
  console.log(`SHIPPED ${h.shippedLeaf} [${h.shippedStatus} ${h.mergeHash}]  names  OPEN ${h.namesOpen} [${h.openStatus}]   (key=${h.key})`);
  console.log(`   …${h.quote}…`);
}
