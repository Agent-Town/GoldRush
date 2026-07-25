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
 *   SALVAGED  — name absent from main, but the blob IS in git       (parked)
 *   DIVERGED  — differs from main, but the blob IS in git           (adjudication material)
 *   SHIPPED   — byte-identical to main's blob                       (no exposure)
 *
 * ...and then asks the question those five cannot answer, across all of them:
 *   LOCAL-ONLY — the blob is in git HERE, but on no origin ref      (dies with this disk)
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
 * F-1055-1 (s1055): "the blob IS in git" was being read as "safe", but `cat-file
 * -e` only ever asked THIS disk's object database — and this script's whole
 * question is what happens when this disk is gone. Measured at the time of the
 * fix: the 14 DIVERGED plates s1054 had just salvaged (36.54 MB) were reachable
 * from exactly one ref, a local `save/*` branch whose push had timed out, and the
 * audit printed `AT RISK ... 0 files, 0 KB` over them. Same shape as F-1054-1 one
 * layer out: the headline was narrower than the question above it. So every
 * in-git blob is now also checked against the objects reachable from the
 * remote-tracking refs, and anything held only here is reported as LOCAL-ONLY.
 * That bucket is deliberately kept SEPARATE from AT RISK: at-risk bytes are
 * unrecoverable, local-only bytes are one `git push` from safe, and collapsing
 * the two would hide which of the two acts is owed.
 *
 * Usage: node scripts/art-staging-audit.mjs [--json] [--strict]
 *   --strict  exit 1 when anything dies with this disk — AT RISK or LOCAL-ONLY
 *             (default: always 0, so a fire's routine audit can never block a drain)
 *
 * CAVEAT worth knowing before trusting a green LOCAL-ONLY: remote-tracking refs
 * are a local mirror of origin, refreshed by fetch/push. Run `git fetch` first if
 * another writer may have pushed the blobs you are asking about.
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

// every object reachable from a remote-tracking ref — i.e. every object that
// survives this disk. One traversal (~150 ms, ~42k objects on this repo), not one
// query per file. The 40-char prefix of each line is the object name.
const offsite = new Set();
for (const line of git('rev-list', '--objects', '--remotes').split('\n')) {
  const sha = line.slice(0, 40);
  if (sha) offsite.add(sha);
}

const untracked = [];
const exposed = [];
const salvaged = [];
const diverged = [];
const shipped = [];
const localOnly = [];
for (const name of readdirSync(STAGING)) {
  if (name.startsWith('.')) continue;
  const path = join(STAGING, name);
  const size = statSync(path).size;
  const sha = hashOf(path);
  const main = tracked.get(name);
  // Asked of every bucket, including SHIPPED: main itself can be ahead of
  // origin/main, and then even "shipped" bytes are still only on this disk.
  if (inGit(sha) && !offsite.has(sha)) localOnly.push({ name, size });
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
        localOnlyFiles: localOnly.length,
        localOnlyBytes: total(localOnly),
        untracked,
        exposed,
        localOnly,
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
    `\nLOCAL-ONLY (in git HERE, but on no origin ref — one push from safe): ${localOnly.length} files, ${kb(total(localOnly))}`,
  );
  for (const r of localOnly.sort(byName)) console.log(`    ${r.name}  ${kb(r.size)}`);
  console.log(
    `\nSALVAGED (not on main, but the bytes ARE in git — parked): ${salvaged.length} files`,
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
if (process.argv.includes('--strict') && atRisk.length + localOnly.length > 0) process.exit(1);
