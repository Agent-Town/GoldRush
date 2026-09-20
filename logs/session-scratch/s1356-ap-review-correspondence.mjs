// s1356 — F-1336-2 survey, second named suspect: "review cross-references".
// Does a review FILENAME encode a goal id? If so, renumbering an id silently breaks
// the correspondence. Measured against the repo-wide denominator so the ap-* share
// is a proportion, not an anecdote.
import { readFileSync, readdirSync } from 'node:fs';

function collect(n, out = []) {
  if (!n || typeof n !== 'object') return out;
  if (Array.isArray(n)) { for (const c of n) collect(c, out); return out; }
  if (typeof n.id === 'string') out.push(n);
  for (const v of Object.values(n)) if (v && typeof v === 'object') collect(v, out);
  return out;
}

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
const nodes = collect(goals);
const ap = nodes.filter((n) => /^ap-/.test(n.id));
const reviews = readdirSync('reviews').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));

console.log(`review files              : ${reviews.length}`);
console.log(`id-bearing goal nodes     : ${nodes.length}`);
console.log(`  of which ap-*           : ${ap.length}\n`);

let exact = 0;
for (const n of ap) {
  if (reviews.includes(n.id)) { exact++; console.log(`  EXACT  reviews/${n.id}.md   [${n.status}]`); }
}
console.log(`\nap-* ids with an exact review filename: ${exact} / ${ap.length}`);

let allExact = 0;
for (const n of nodes) if (reviews.includes(n.id)) allExact++;
console.log(`repo-wide id<->review filename matches: ${allExact} / ${nodes.length} id-bearing nodes`);
console.log(`ap-* share of that convention        : ${exact} / ${allExact}`);
