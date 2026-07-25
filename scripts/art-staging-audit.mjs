#!/usr/bin/env node
/**
 * art-staging-audit — answer Mistake #11's question for the ART slot:
 * "what dies with this disk today?"
 *
 * worktrees/art/ is NOT a git worktree (verified s1045, 2026-07-25): it is a
 * plain staging directory, ignored by main's .gitignore. Anything in it that
 * main does not track exists in no object database anywhere.
 *
 * Prints four buckets:
 *   UNTRACKED — in staging, in NO object database       (loss risk: TOTAL)
 *   SALVAGED  — absent from main but its blob IS in git (parked, safe)
 *   DIVERGED  — in both, different byte size            (adjudication material)
 *   SAME-SIZE — in both, same size (assumed shipped)    (no exposure)
 *
 * UNTRACKED means "in no object database", NOT "absent from main": art parked
 * on a save/* branch awaiting an owner verdict is preserved, and counting it as
 * exposed would keep an unfixable alarm ringing until someone lands it on main —
 * which is exactly the decision that is legitimately still open.
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

// is this file's content already a blob in the object database (any ref)?
const inGit = (path) => {
  try {
    // .trim() matters: this helper returns raw stdout, and `cat-file -e` reads a
    // trailing newline as part of the object name ("Not a valid object name").
    const sha = git('hash-object', '--', path).trim();
    git('cat-file', '-e', sha);
    return true;
  } catch {
    return false;
  }
};

const untracked = [];
const salvaged = [];
const diverged = [];
const same = [];
for (const name of readdirSync(STAGING)) {
  if (name.startsWith('.')) continue;
  const path = join(STAGING, name);
  const size = statSync(path).size;
  if (!tracked.has(name)) {
    (inGit(path) ? salvaged : untracked).push({ name, size });
  } else if (tracked.get(name) !== size) {
    diverged.push({ name, size, mainSize: tracked.get(name) });
  } else {
    same.push({ name, size });
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const total = (rows) => rows.reduce((a, r) => a + r.size, 0);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ untracked, salvaged, diverged, same: same.length }, null, 2));
} else {
  console.log(`ART STAGING AUDIT — ${STAGING}`);
  const staged = untracked.length + salvaged.length + diverged.length + same.length;
  console.log(`main tracks ${tracked.size} raws; staging holds ${staged}\n`);
  console.log(`UNTRACKED (in NO commit — dies with this disk): ${untracked.length} files, ${kb(total(untracked))}`);
  for (const r of untracked.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${r.name}  ${kb(r.size)}`);
  }
  console.log(
    `\nSALVAGED (not on main, but the bytes ARE in git — parked, safe): ${salvaged.length} files`,
  );
  for (const r of salvaged.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${r.name}  ${kb(r.size)}`);
  }
  console.log(`\nDIVERGED (regenerated over shipped art): ${diverged.length} files`);
  for (const r of diverged.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`);
  }
  console.log(`\nSAME-SIZE (assumed shipped): ${same.length} files`);
}
