// s1356 — F-1336-2's owed survey: does any consumer key off the `ap-*` goal ids?
// Replicates scripts/drain-block-check.mjs normalize()/findLeaves() EXACTLY (read from
// :156-173 at commit 21ea62d6) and asks the only question that matters for a renumbering:
// does mutating an `ap-*` id change which leaf any real query resolves to?
//
// Run: node logs/session-scratch/s1356-ap-id-consumer-probe.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const GOALS = 'tasks/goals.json';

// --- verbatim from drain-block-check.mjs:156-163 ---
function normalize(raw) {
  return raw
    .replace(/^.*\//, '')
    .replace(/\.md$/i, '')
    .replace(/\.log$/i, '')
    .replace(/^.*?(\d{8}-\d{6})-/, '')
    .replace(/^(lane-[a-d]|main|art)-(?=lane-|art-)/, '');
}

// --- verbatim from drain-block-check.mjs:165-174 (hit collection only) ---
function findLeaves(leaves, needle) {
  const key = normalize(needle).toLowerCase();
  const hits = [];
  for (const leaf of leaves) {
    const taskKey = normalize(leaf.taskFile).toLowerCase();
    if (!taskKey) continue;
    if (key.includes(taskKey) || taskKey.includes(key)) hits.push({ leaf, taskKey, via: 'taskFile' });
    else if (leaf.id && key.includes(String(leaf.id).toLowerCase())) hits.push({ leaf, taskKey, via: 'ID' });
  }
  return hits;
}

function collectLeaves(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { for (const c of node) collectLeaves(c, out); return out; }
  if (typeof node.taskFile === 'string') out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === 'object') collectLeaves(v, out);
  return out;
}

const goals = JSON.parse(readFileSync(GOALS, 'utf8'));
const leaves = collectLeaves(goals);
console.log(`leaves carrying taskFile : ${leaves.length}`);
const apLeaves = leaves.filter((l) => /^ap-/.test(String(l.id || '')));
console.log(`  of which ap-* ids      : ${apLeaves.length}`);

// The query universe: every real name a fire could hand the checker.
const names = new Set();
for (const dir of ['tasks/done', 'tasks', 'tasks/failed', 'tasks/runs']) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) if (/\.(md|log)$/i.test(f)) names.add(`${dir}/${f}`);
}
for (const l of leaves) names.add(l.taskFile);
const queries = [...names];
console.log(`query universe           : ${queries.length} real filenames\n`);

// PASS 1 — how often does the ID branch decide anything at all, on the live tree?
let idHits = 0;
const idHitDetail = [];
for (const q of queries) {
  for (const h of findLeaves(leaves, q)) {
    if (h.via === 'ID') { idHits++; idHitDetail.push(`${q}  ->  ${h.leaf.id}`); }
  }
}
console.log(`PASS 1 — hits resolved via the ID branch (:173): ${idHits}`);
idHitDetail.slice(0, 20).forEach((d) => console.log(`   ${d}`));
if (!idHits) console.log('   (none — the taskFile branch answers every real query)');

// PASS 2 — the renumbering experiment. Mutate every ap-* id the way F-1260-3's
// renumbering would (ap-07-county-standings -> ap-06-..., ap-08b -> ap-09b, etc.)
// and diff the resolved hit sets query-by-query.
const bump = (id) => id.replace(/^ap-(\d+)/, (_, n) => `ap-${String(Number(n) + 1).padStart(2, '0')}`);
const mutated = JSON.parse(JSON.stringify(goals));
const mLeaves = collectLeaves(mutated);
let renamed = 0;
for (const l of mLeaves) {
  if (/^ap-/.test(String(l.id || ''))) { l.id = bump(l.id); renamed++; }
}
console.log(`\nPASS 2 — renumbering experiment: ${renamed} ap-* ids bumped by +1`);

const sig = (hits) => hits.map((h) => h.leaf.id).sort().join(',');
let changed = 0;
for (const q of queries) {
  const before = sig(findLeaves(leaves, q));
  const after = sig(findLeaves(mLeaves, q).map((h) => ({ leaf: { id: h.leaf.id.replace(/^ap-(\d+)/, (_, n) => `ap-${String(Number(n) - 1).padStart(2, '0')}`) } })));
  if (before !== after) {
    changed++;
    if (changed <= 20) console.log(`   CHANGED  ${q}\n     before: ${before}\n     after : ${after}`);
  }
}
console.log(`   queries whose resolution CHANGED: ${changed} / ${queries.length}`);
