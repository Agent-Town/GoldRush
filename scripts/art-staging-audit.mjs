#!/usr/bin/env node
/**
 * art-staging-audit — answer Mistake #11's question for the ART slot:
 * "what dies with this disk today?"
 *
 * worktrees/art/ is NOT a git worktree (verified s1045, 2026-07-25): it is a
 * plain staging directory, ignored by main's .gitignore. Anything in it that
 * main does not track exists in no object database anywhere.
 *
 * Prints five buckets, classified by CONTENT HASH (not by name or by size):
 *   UNTRACKED — name absent from main, bytes in NO object database  (loss risk: TOTAL)
 *   EXPOSED   — name on main but THESE bytes in no object database  (loss risk: TOTAL)
 *   SALVAGED  — name absent from main, but the blob IS in git       (parked, safe)
 *   DIVERGED  — differs from main, but the blob IS in git           (adjudication material)
 *   SHIPPED   — byte-identical to main's blob                       (no exposure)
 *
 * UNTRACKED/EXPOSED mean "in no object database", NOT "absent from main": art
 * parked on a save/* branch awaiting an owner verdict is preserved, and counting
 * it as exposed would keep an unfixable alarm ringing until someone lands it on
 * main — which is exactly the decision that is legitimately still open.
 *
 * F-1054-1 (s1054): the EXPOSED bucket did not exist. A staging file whose NAME
 * matched main went straight to "DIVERGED — adjudication material" and never got
 * the in-git check at all, so 14 regenerated plates totalling 36.54 MB — held in
 * no object database, the whole reason this script exists — were reported under a
 * headline reading "UNTRACKED ... 0 files". The bug was that identity was decided
 * by NAME and then by SIZE; it is now decided by the blob hash, which is the only
 * thing that actually answers "are these bytes recoverable?". Size equality was
 * also load-bearing for the old SAME-SIZE bucket ("assumed shipped") — that
 * assumption is gone too: SHIPPED now means the hashes match.
 *
 * Usage: node scripts/art-staging-audit.mjs [--json] [--strict]
 *   --strict  exit 1 when anything is in no object database (default: always 0,
 *             so a fire's routine audit can never block a drain)
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

// main's tracked raws, name -> { sha, size } (from the index/HEAD, not the disk).
// The sha is what classifies: two files with the same name and the same size can
// still be different images, and that is exactly the case this audit must catch.
const tracked = new Map();
for (const line of git('ls-tree', '-r', '-l', 'main', '--', 'assets/raw/').split('\n')) {
  if (!line.trim()) continue;
  // <mode> <type> <sha> <size>\t<path>
  const m = line.match(/^\S+\s+\S+\s+(\S+)\s+(\d+)\t(.+)$/);
  if (!m) continue;
  tracked.set(m[3].replace(/^assets\/raw\//, ''), { sha: m[1], size: Number(m[2]) });
}

// the blob hash these bytes WOULD have. Computing it does not write anything.
// .trim() matters: git returns a trailing newline, and `cat-file -e` reads it as
// part of the object name ("Not a valid object name").
const hashOf = (path) => git('hash-object', '--', path).trim();

// does this exact blob already exist in the object database (reachable or not)?
const inGit = (sha) => {
  try {
    git('cat-file', '-e', sha);
    return true;
  } catch {
    return false;
  }
};

const untracked = [];
const exposed = [];
const salvaged = [];
const diverged = [];
const shipped = [];
for (const name of readdirSync(STAGING)) {
  if (name.startsWith('.')) continue;
  const path = join(STAGING, name);
  const size = statSync(path).size;
  const sha = hashOf(path);
  const main = tracked.get(name);
  if (main && main.sha === sha) {
    shipped.push({ name, size });
    continue;
  }
  // Not identical to main (or not on main at all) — so the only question that
  // matters is whether these bytes survive this disk. Ask it in BOTH cases: the
  // old code asked it only when the NAME was absent from main, which is what
  // let 36.54 MB of regenerated plates report as safe (F-1054-1).
  const backed = inGit(sha);
  if (!main) (backed ? salvaged : untracked).push({ name, size });
  else (backed ? diverged : exposed).push({ name, size, mainSize: main.size });
}
const atRisk = [...untracked, ...exposed];

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
const total = (rows) => rows.reduce((a, r) => a + r.size, 0);

const byName = (a, b) => a.name.localeCompare(b.name);

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      {
        atRiskFiles: atRisk.length,
        atRiskBytes: total(atRisk),
        untracked,
        exposed,
        salvaged,
        diverged,
        shipped: shipped.length,
      },
      null,
      2,
    ),
  );
} else {
  console.log(`ART STAGING AUDIT — ${STAGING}`);
  const staged =
    untracked.length + exposed.length + salvaged.length + diverged.length + shipped.length;
  console.log(`main tracks ${tracked.size} raws; staging holds ${staged}`);
  console.log(
    `\nAT RISK (in NO object database — dies with this disk): ${atRisk.length} files, ${kb(total(atRisk))}`,
  );
  console.log(
    `  UNTRACKED (name not on main): ${untracked.length} files, ${kb(total(untracked))}`,
  );
  for (const r of untracked.sort(byName)) console.log(`    ${r.name}  ${kb(r.size)}`);
  console.log(
    `  EXPOSED (name IS on main, but these bytes are not): ${exposed.length} files, ${kb(total(exposed))}`,
  );
  for (const r of exposed.sort(byName)) {
    console.log(`    ${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`);
  }
  console.log(
    `\nSALVAGED (not on main, but the bytes ARE in git — parked, safe): ${salvaged.length} files`,
  );
  for (const r of salvaged.sort(byName)) console.log(`  ${r.name}  ${kb(r.size)}`);
  console.log(
    `\nDIVERGED (regenerated over shipped art, bytes ARE in git): ${diverged.length} files`,
  );
  for (const r of diverged.sort(byName)) {
    console.log(`  ${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`);
  }
  console.log(`\nSHIPPED (blob-identical to main): ${shipped.length} files`);
}

// Default exit is always 0: a routine audit must never block a fire's drain.
if (process.argv.includes('--strict') && atRisk.length > 0) process.exit(1);
