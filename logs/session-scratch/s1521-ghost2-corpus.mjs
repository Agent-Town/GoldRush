// s1521 — PRICE the second ghost tell (s1520 NEXT B, from F-1518-2).
//
// THE CLASS: a non-shipped leaf carries prose written AT DISPATCH TIME that makes a claim about a
// FUTURE merge ("stays stopped", "supersedes nothing"). The named master later ships; the claim
// silently expires; no mechanism notices. F-1518-2 found exactly one, on e1-baron-fort-solidity.
//
// This script does NOT propose a guard. It measures the corpus a guard would have to live in:
//   (a) the denominator — how many leaves can even hold such a claim
//   (b) the candidate set a LOOSE reference-parser would flag
//   (c) how many of those are real ghosts vs correctly-parked hedges (hand-read, printed verbatim)
// s1520's strict `Successor:` guard already covers the commitment form; anything this finds beyond
// those 3 is the NEW cost.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));

const SHIPPED = new Set(['merged', 'verified-by-owner', 'shipped']);
const stem = (raw) => path.basename(String(raw).trim()).replace(/\.md$/, '').replace(/[.,;]+$/, '');

// Same walk as scripts/stale-successor-pointer-guard.test.mjs, so the denominators are comparable.
const leaves = [];
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (n.id || n.taskFile) leaves.push(n);
  for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
})({ subgoals: goals.goals || [] });

// A leaf is a real leaf (not a container) if it has no children.
const realLeaves = leaves.filter((l) => !(l.subgoals || l.tasks));

const byFile = new Map();
const byId = new Map();
for (const l of leaves) {
  if (l.taskFile) byFile.set(stem(l.taskFile), l);
  if (l.id) byId.set(l.id, l);
}

const statusCount = {};
for (const l of realLeaves) statusCount[l.status || '(none)'] = (statusCount[l.status || '(none)'] || 0) + 1;

const nonShipped = realLeaves.filter((l) => !SHIPPED.has(l.status));

// (b) THE LOOSE PARSER: any *.md filename mentioned anywhere in the leaf's own strings.
const MD_REF = /([A-Za-z0-9._-]+\.md)/g;
const STRICT_SUCCESSOR = /[Ss]uccessor:\s*`?([A-Za-z0-9._/-]+\.md)/;

const candidates = [];
for (const leaf of nonShipped) {
  const self = leaf.taskFile ? stem(leaf.taskFile) : null;
  for (const [key, val] of Object.entries(leaf)) {
    if (typeof val !== 'string') continue;
    for (const m of val.matchAll(MD_REF)) {
      const s = stem(m[1]);
      if (s === self) continue;
      const target = byFile.get(s);
      if (!target || !SHIPPED.has(target.status)) continue;
      // Is this already covered by s1520's shipped strict guard?
      const strict = STRICT_SUCCESSOR.test(val) && stem((val.match(STRICT_SUCCESSOR) || [])[1] || '') === s;
      const i = m.index;
      candidates.push({
        leaf: leaf.id || self,
        leafStatus: leaf.status,
        key,
        ref: s,
        refStatus: target.status,
        coveredByS1520: strict,
        quote: val.slice(Math.max(0, i - 220), Math.min(val.length, i + 120)).replace(/\s+/g, ' '),
      });
    }
  }
}

console.log('=== DENOMINATORS ===');
console.log('nodes walked        :', leaves.length);
console.log('real leaves         :', realLeaves.length);
console.log('non-shipped leaves  :', nonShipped.length);
console.log('status histogram    :', JSON.stringify(statusCount));
console.log();
console.log('=== CANDIDATE SET (loose parser: leaf not shipped, names a *.md that HAS shipped) ===');
console.log('candidates          :', candidates.length);
console.log('already covered s1520:', candidates.filter((c) => c.coveredByS1520).length);
console.log('NEW cost            :', candidates.filter((c) => !c.coveredByS1520).length);
console.log('distinct leaves     :', new Set(candidates.map((c) => c.leaf)).size);
console.log();
for (const c of candidates) {
  console.log('---');
  console.log(`leaf=${c.leaf} [${c.leafStatus}]  key=${c.key}  ->  ${c.ref} [${c.refStatus}]  strict=${c.coveredByS1520}`);
  console.log(`   …${c.quote}…`);
}
