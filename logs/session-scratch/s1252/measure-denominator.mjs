// s1252 — measure citation-title-guard's DENOMINATOR against the whole tracked tree.
// The guard scans `git ls-files tasks` only. How many `e2e/*.spec.ts:<line>` citations
// live in tracked .md files it never opens?
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g; // verbatim from the guard

const all = execFileSync('git', ['ls-files'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  .trim().split('\n').filter((f) => f.endsWith('.md'));

const scanned = new Set(
  execFileSync('git', ['ls-files', 'tasks'], { encoding: 'utf8', maxBuffer: 1 << 28 })
    .trim().split('\n').filter((f) => f.endsWith('.md')),
);

const byTop = new Map();
const perFile = [];
let inScope = 0, outScope = 0;

for (const f of all) {
  let text;
  try { text = fs.readFileSync(f, 'utf8'); } catch { continue; }
  CITE.lastIndex = 0;
  let n = 0, m;
  while ((m = CITE.exec(text))) n++;
  if (!n) continue;
  const top = f.split('/')[0];
  const seen = scanned.has(f);
  if (seen) inScope += n; else outScope += n;
  byTop.set(top, (byTop.get(top) || 0) + n);
  if (!seen) perFile.push([f, n]);
}

console.log(`tracked .md files                : ${all.length}`);
console.log(`  of which the guard scans (tasks): ${scanned.size}`);
console.log(`citations IN the denominator      : ${inScope}`);
console.log(`citations OUTSIDE the denominator : ${outScope}`);
console.log('\nby top-level dir:');
for (const [k, v] of [...byTop].sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(12)} ${v}`);
console.log('\nUNSCANNED files carrying citations (desc):');
for (const [f, n] of perFile.sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${f}`);
