#!/usr/bin/env node
// s1350 — isolate the NON-motion-pilot slice of the F-1331-4 at-risk hole.
// Asks the same question art-staging-audit.mjs asks (are these bytes in ANY object
// database reachable from a ref, local or remote?) but only over the two areas the
// owner's `motion-pilot` ruling does not cover.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const AREAS = ['worktrees/art/assets/contact-sheets', 'worktrees/art/assets/requests'];

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });

// every blob hash reachable from every ref (local + remote-tracking), once.
const known = new Set();
const refs = git(['for-each-ref', '--format=%(objectname)']).trim().split('\n').filter(Boolean);
for (const r of refs) {
  try {
    for (const line of git(['ls-tree', '-r', r]).split('\n')) {
      const m = /^\d+ blob ([0-9a-f]{40})\t/.exec(line);
      if (m) known.add(m[1]);
    }
  } catch { /* unreadable ref */ }
}

const rows = [];
for (const area of AREAS) {
  let entries;
  try { entries = readdirSync(join(ROOT, area)); } catch { continue; }
  for (const name of entries) {
    const rel = join(area, name);
    const abs = join(ROOT, rel);
    const st = statSync(abs);
    if (!st.isFile()) continue;
    const hash = git(['hash-object', abs]).trim();
    rows.push({ rel, bytes: st.size, mtime: st.mtime.toISOString().slice(0, 10), inGit: known.has(hash) });
  }
}

const risk = rows.filter((r) => !r.inGit).sort((a, b) => b.bytes - a.bytes);
const safe = rows.filter((r) => r.inGit);
const mb = (n) => (n / 1048576).toFixed(2) + ' MB';
console.log(`refs scanned: ${refs.length}  distinct blobs known: ${known.size}`);
console.log(`\nAT RISK (bytes in no object database on this disk or any remote-tracking ref): ${risk.length} files / ${mb(risk.reduce((s, r) => s + r.bytes, 0))}`);
for (const r of risk) console.log(`  ${r.mtime}  ${String(r.bytes).padStart(9)}  ${r.rel}`);
console.log(`\nALREADY STORED: ${safe.length} files / ${mb(safe.reduce((s, r) => s + r.bytes, 0))}`);
for (const r of safe) console.log(`  ${r.mtime}  ${String(r.bytes).padStart(9)}  ${r.rel}`);
