#!/usr/bin/env node
// s1350 — characterise the 556.96 MB the owner is being asked to rule on (F-1331-4).
// The row has carried a headline number for many fires and has never said WHAT it is.
// A one-word ruling is cheap only if the thing being ruled on is legible.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const BASE = join(ROOT, 'worktrees/art/assets/motion-pilot');
const git = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
};

const files = walk(BASE);
const mb = (n) => (n / 1048576).toFixed(2);

// per top-level subdir
const byDir = new Map();
const byExt = new Map();
const byHash = new Map(); // duplicate detection: identical bytes stored twice?
let total = 0;

for (const abs of files) {
  const rel = abs.slice(BASE.length + 1);
  const top = rel.includes('/') ? rel.split('/')[0] : '(root)';
  const size = statSync(abs).size;
  total += size;
  const d = byDir.get(top) || { n: 0, bytes: 0 };
  d.n++; d.bytes += size; byDir.set(top, d);
  const ext = extname(abs) || '(none)';
  const x = byExt.get(ext) || { n: 0, bytes: 0 };
  x.n++; x.bytes += size; byExt.set(ext, x);
  const h = git(['hash-object', abs]);
  const g = byHash.get(h) || { n: 0, bytes: size, paths: [] };
  g.n++; g.paths.push(rel); byHash.set(h, g);
}

console.log(`motion-pilot: ${files.length} files / ${mb(total)} MB\n`);

console.log('BY TOP-LEVEL SUBDIR (largest first):');
for (const [k, v] of [...byDir].sort((a, b) => b[1].bytes - a[1].bytes))
  console.log(`  ${mb(v.bytes).padStart(8)} MB  ${String(v.n).padStart(4)} files  ${k}`);

console.log('\nBY EXTENSION:');
for (const [k, v] of [...byExt].sort((a, b) => b[1].bytes - a[1].bytes))
  console.log(`  ${mb(v.bytes).padStart(8)} MB  ${String(v.n).padStart(4)} files  ${k}`);

const dupes = [...byHash.values()].filter((g) => g.n > 1);
const dupeWaste = dupes.reduce((s, g) => s + g.bytes * (g.n - 1), 0);
console.log(`\nEXACT-DUPLICATE BYTES WITHIN motion-pilot: ${dupes.length} distinct blobs held ${dupes.reduce((s, g) => s + g.n, 0)} times`);
console.log(`  redundant weight if deduped by git anyway: ${mb(dupeWaste)} MB`);

// how much of it is already blob-identical to something in git (git stores once)?
const known = new Set();
for (const ref of git(['for-each-ref', '--format=%(objectname)']).split('\n')) {
  try {
    for (const line of git(['ls-tree', '-r', ref]).split('\n')) {
      const m = /^\d+ blob ([0-9a-f]{40})\t/.exec(line);
      if (m) known.add(m[1]);
    }
  } catch { /* skip */ }
}
let alreadyIn = 0, alreadyN = 0;
for (const [h, g] of byHash) if (known.has(h)) { alreadyIn += g.bytes * g.n; alreadyN += g.n; }
console.log(`\nALREADY IN GIT (blob-identical to an existing object): ${alreadyN} files / ${mb(alreadyIn)} MB`);
console.log(`TRUE NEW WEIGHT a full salvage would add: ~${mb(total - alreadyIn - dupeWaste)} MB (pre-compression)`);
