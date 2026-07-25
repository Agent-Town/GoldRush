#!/usr/bin/env node
/**
 * art-staging-audit — answer Mistake #11's question for the ART slot:
 * "what dies with this disk today?"
 *
 * worktrees/art/ is NOT a git worktree (verified s1045, 2026-07-25): it is a
 * plain staging directory, ignored by main's .gitignore. Anything in it that
 * main does not track exists in no object database anywhere.
 *
 * Prints three buckets:
 *   UNTRACKED — in staging, absent from main            (loss risk: TOTAL)
 *   DIVERGED  — in both, different byte size            (adjudication material)
 *   SAME-SIZE — in both, same size (assumed shipped)    (no exposure)
 *
 * Usage: node scripts/art-staging-audit.mjs [--json]
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded, which git reads as a different directory.
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const STAGING = join(REPO, 'worktrees/art/assets/raw');

const git = (...args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });

// main's tracked raws, name -> byte size (from the index/HEAD, not the disk)
const tracked = new Map();
for (const line of git('ls-tree', '-r', '-l', 'main', '--', 'assets/raw/').split('\n')) {
  if (!line.trim()) continue;
  // <mode> <type> <sha> <size>\t<path>
  const m = line.match(/^\S+\s+\S+\s+\S+\s+(\d+)\t(.+)$/);
  if (!m) continue;
  tracked.set(m[2].replace(/^assets\/raw\//, ''), Number(m[1]));
}

const untracked = [];
const diverged = [];
const same = [];
for (const name of readdirSync(STAGING)) {
  if (name.startsWith('.')) continue;
  const size = statSync(join(STAGING, name)).size;
  if (!tracked.has(name)) untracked.push({ name, size });
  else if (tracked.get(name) !== size) diverged.push({ name, size, mainSize: tracked.get(name) });
  else same.push({ name, size });
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const total = (rows) => rows.reduce((a, r) => a + r.size, 0);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ untracked, diverged, same: same.length }, null, 2));
} else {
  console.log(`ART STAGING AUDIT — ${STAGING}`);
  console.log(`main tracks ${tracked.size} raws; staging holds ${untracked.length + diverged.length + same.length}\n`);
  console.log(`UNTRACKED (in NO commit — dies with this disk): ${untracked.length} files, ${kb(total(untracked))}`);
  for (const r of untracked.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${r.name}  ${kb(r.size)}`);
  }
  console.log(`\nDIVERGED (regenerated over shipped art): ${diverged.length} files`);
  for (const r of diverged.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`);
  }
  console.log(`\nSAME-SIZE (assumed shipped): ${same.length} files`);
}
