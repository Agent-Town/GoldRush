// s1455 measurement probe (NOT the guard) — re-derive the F-1454-2 class independently.
// Question: how many reviews/*.md carry a non-merged VERDICT line, how many of those map to a
// goal leaf, and by WHICH key does the mapping actually work?
import { readdirSync, readFileSync } from 'node:fs';

const goals = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));

const leaves = [];
(function walk(nodes) {
  for (const n of nodes ?? []) {
    if (n.taskFile || n.mergeHash || (n.status && !n.subgoals && !n.tasks)) leaves.push(n);
    walk(n.subgoals);
    walk(n.tasks);
  }
})(goals.goals);

const byId = new Map(leaves.map((l) => [l.id, l]));
const byTaskFile = new Map(leaves.filter((l) => l.taskFile).map((l) => [l.taskFile, l]));

const files = readdirSync('reviews').filter((f) => f.endsWith('.md'));
const NOT_MERGED = /^##\s*VERDICT:\s*(.*(HOLD|HELD|NOT\s+MERGED|WITHHELD|WITHHOLD|BLOCKED|REJECT).*)$/im;

let verdictCount = 0;
const nonMerged = [];
for (const f of files) {
  const text = readFileSync('reviews/' + f, 'utf8');
  const vm = text.match(/^##\s*VERDICT:.*$/im);
  if (vm) verdictCount++;
  const m = text.match(NOT_MERGED);
  if (!m) continue;
  const sliceM = text.match(/^\*\*Slice:\*\*\s*`([^`]+)`/im);
  const slice = sliceM ? sliceM[1] : null;
  const stem = f.replace(/\.md$/, '');
  const leaf = (slice && byId.get(slice)) || byId.get(stem) || byTaskFile.get(stem + '.md') || null;
  const superseded = /SUPERSEDED|SUPERSEDES|DISCHARGED/i.test(text.slice(0, text.indexOf(m[0]) + 2500));
  nonMerged.push({
    file: f,
    verdict: m[0].replace(/^##\s*VERDICT:\s*/i, '').slice(0, 60),
    slice,
    matchedBy: (slice && byId.get(slice)) ? 'slice-id'
      : byId.get(stem) ? 'file-stem-id'
      : byTaskFile.get(stem + '.md') ? 'taskFile' : 'NO-LEAF',
    leafStatus: leaf ? leaf.status : null,
    superseded,
  });
}

console.log('reviews/*.md total:', files.length, '| with a ## VERDICT line:', verdictCount);
console.log('non-merged verdicts:', nonMerged.length);
console.log('');
const mapped = nonMerged.filter((r) => r.matchedBy !== 'NO-LEAF');
console.log('mapped to a leaf:', mapped.length, '| unmapped:', nonMerged.length - mapped.length);
console.log('mapping key used:', JSON.stringify(
  mapped.reduce((a, r) => ((a[r.matchedBy] = (a[r.matchedBy] || 0) + 1), a), {})));
console.log('');
console.log('=== MAPPED, leaf says merged/shipped (the class) ===');
for (const r of mapped.filter((x) => /merged|shipped/i.test(x.leafStatus || ''))) {
  console.log((r.superseded ? '  ok(bannered) ' : '  >>> STALE    ') +
    r.file + '  [leaf=' + r.leafStatus + '] verdict=' + r.verdict);
}
console.log('');
console.log('=== MAPPED, leaf NOT merged (correctly held) ===');
for (const r of mapped.filter((x) => !/merged|shipped/i.test(x.leafStatus || ''))) {
  console.log('  ' + r.file + '  [leaf=' + r.leafStatus + ']');
}
console.log('');
console.log('=== UNMAPPED (guard cannot judge these) ===');
for (const r of nonMerged.filter((x) => x.matchedBy === 'NO-LEAF')) {
  console.log('  ' + r.file + '  slice=' + r.slice);
}
