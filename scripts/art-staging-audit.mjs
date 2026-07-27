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
 * F-1120-2 (s1120): THE SAME CLASS, A THIRD TIME, AND THE LARGEST YET — the
 * headline was narrower than the question because of WHERE it looked, not what
 * it compared. This script scanned exactly one hardcoded directory,
 * `worktrees/art/assets/raw`, non-recursively. But the ART slot writes to four
 * sibling staging dirs, and two of the other three were full: measured at the
 * time of the fix, `contact-sheets/` held 12 files (9.51 MB) and
 * `motion-pilot/` held 735 files (556.96 MB) in NO object database — 748 files
 * and 566.47 MB dying with this disk — under a headline reading
 * `AT RISK ... 0 files`. Worse, the slot does not reliably write into the
 * staging tree at all: the `art-batch-portrait-convention` run of 2026-07-27
 * landed 6 portrait raws + a contact sheet (22.58 MB) as UNTRACKED files in
 * MAIN's `assets/`, where this audit had no reason to look — the recurring
 * F-071-1 defect (ART-slot runs writing to the repo root). So the fix is not a
 * wider hardcoded path:
 *   - staging roots are now ENUMERATED from `worktrees/art/assets/*`, so a new
 *     staging subdir is covered the day it appears rather than the day someone
 *     notices it;
 *   - each root is walked RECURSIVELY (motion-pilot nests two levels deep, and
 *     every one of those files was invisible);
 *   - and main's own `assets/` tree is asked too, via `git status -uall`, which
 *     is what catches an ART run that wrote to the repo root instead.
 * Fixing the instance (adding 'contact-sheets' beside 'raw') would have left
 * the next new directory, and the next stray write into main, equally invisible.
 *
 * CAVEAT worth knowing before trusting a green LOCAL-ONLY: remote-tracking refs
 * are a local mirror of origin, refreshed by fetch/push. Run `git fetch` first if
 * another writer may have pushed the blobs you are asking about.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded, which git reads as a different directory.
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const STAGING_ROOT = join(REPO, 'worktrees/art/assets');

const git = (...args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });

// main's tracked assets, REPO-RELATIVE PATH -> { sha, size } (from HEAD, not the
// disk). The sha is what classifies: two files with the same name and the same
// size can still be different images, and that is exactly the case this audit
// must catch. Keyed by full path, not basename: once several roots are scanned,
// `raw/hero.png` and `contact-sheets/hero.png` are different questions (F-1120-2).
const tracked = new Map();
for (const line of git('ls-tree', '-r', '-l', 'main', '--', 'assets/').split('\n')) {
  if (!line.trim()) continue;
  // <mode> <type> <sha> <size>\t<path>
  const m = line.match(/^\S+\s+\S+\s+(\S+)\s+(\d+)\t(.+)$/);
  if (!m) continue;
  tracked.set(m[3], { sha: m[1], size: Number(m[2]) });
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

// Every file under a directory, recursively. motion-pilot/ nests two levels
// deep and the old non-recursive readdir could not see any of it (F-1120-2).
const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile()) acc.push(p);
  }
  return acc;
};

// THE SCAN SET — every place ART-slot output is known to land, discovered rather
// than hardcoded, so a new one is covered the day it appears (F-1120-2).
//
// 1. The staging tree: `worktrees/art/assets/*` is enumerated, not listed. These
//    dirs are gitignored, so git itself will never mention them and the only way
//    to classify them is to hash every file.
const scan = [];
for (const name of existsSync(STAGING_ROOT) ? readdirSync(STAGING_ROOT) : []) {
  if (name.startsWith('.')) continue;
  const dir = join(STAGING_ROOT, name);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of walk(dir)) {
    // A staging file's counterpart on main is the same path under assets/.
    scan.push({ file, mainPath: join('assets', relative(STAGING_ROOT, file)), area: `staging/${name}` });
  }
}
// 2. MAIN's own assets/ tree. An ART run that writes to the repo root instead of
//    the staging dir (the recurring F-071-1 defect) leaves untracked files here,
//    where no amount of widening the staging path would ever have found them.
//    `git status -uall` is the cheap, exact way to ask: tracked-and-clean files
//    are by definition already in git and need no hashing.
for (const line of git('status', '--porcelain', '--untracked-files=all', '--', 'assets/').split('\n')) {
  if (!line.trim()) continue;
  // XY <path>  — renames would carry ' -> ', which we do not expect under assets/
  const rel = line.slice(3).trim().replace(/^"|"$/g, '');
  const abs = join(REPO, rel);
  if (!existsSync(abs) || !statSync(abs).isFile()) continue;
  scan.push({ file: abs, mainPath: rel, area: 'main-tree' });
}

const untracked = [];
const exposed = [];
const salvaged = [];
const diverged = [];
const shipped = [];
const localOnly = [];
for (const { file, mainPath, area } of scan) {
  const name = relative(REPO, file);
  const size = statSync(file).size;
  const sha = hashOf(file);
  const main = tracked.get(mainPath);
  // Asked of every bucket, including SHIPPED: main itself can be ahead of
  // origin/main, and then even "shipped" bytes are still only on this disk.
  if (inGit(sha) && !offsite.has(sha)) localOnly.push({ name, size, area });
  if (main && main.sha === sha) {
    shipped.push({ name, size, area });
    continue;
  }
  // Not identical to main (or not on main at all) — so the only question that
  // matters is whether these bytes survive this disk. Ask it in BOTH cases: the
  // old code asked it only when the NAME was absent from main, which is what
  // let 36.54 MB of regenerated plates report as safe (F-1054-1).
  const backed = inGit(sha);
  if (!main) (backed ? salvaged : untracked).push({ name, size, area });
  else (backed ? diverged : exposed).push({ name, size, mainSize: main.size, area });
}
const atRisk = [...untracked, ...exposed];

const kb = (n) => (n >= 1024 * 1024 ? `${(n / 1048576).toFixed(2)} MB` : `${(n / 1024).toFixed(0)} KB`);
const total = (rows) => rows.reduce((a, r) => a + r.size, 0);

const byName = (a, b) => a.name.localeCompare(b.name);

// Listings are capped so a 748-file bucket cannot bury the headline — but the
// remainder is ALWAYS printed as a count. A silent truncation would read as
// "that's all of them", which is the exact failure mode this script keeps having.
const LIST_CAP = 12;
const list = (rows, fmt, indent = '    ') => {
  const sorted = [...rows].sort(byName);
  for (const r of sorted.slice(0, LIST_CAP)) console.log(indent + fmt(r));
  if (sorted.length > LIST_CAP) {
    console.log(`${indent}… and ${sorted.length - LIST_CAP} more (use --json for the full list)`);
  }
};

// Where the exposure actually is, so the reader knows which act is owed and
// where. A single global number cannot distinguish "the staging tree is full"
// from "an ART run wrote into main again".
const byArea = (rows) => {
  const m = new Map();
  for (const r of rows) {
    const e = m.get(r.area) ?? { files: 0, bytes: 0 };
    e.files += 1;
    e.bytes += r.size;
    m.set(r.area, e);
  }
  return [...m.entries()].sort((a, b) => b[1].bytes - a[1].bytes);
};

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
  const areas = [...new Set(scan.map((s) => s.area))].sort();
  console.log(`ART STAGING AUDIT — ${areas.length} areas scanned, ${scan.length} files`);
  console.log(`  ${areas.join(' · ')}`);
  console.log(`main tracks ${tracked.size} files under assets/`);
  console.log(
    `\nAT RISK (in NO object database — dies with this disk): ${atRisk.length} files, ${kb(total(atRisk))}`,
  );
  for (const [area, e] of byArea(atRisk)) console.log(`  by area: ${area} — ${e.files} files, ${kb(e.bytes)}`);
  console.log(
    `  UNTRACKED (name not on main): ${untracked.length} files, ${kb(total(untracked))}`,
  );
  list(untracked, (r) => `${r.name}  ${kb(r.size)}`);
  console.log(
    `  EXPOSED (name IS on main, but these bytes are not): ${exposed.length} files, ${kb(total(exposed))}`,
  );
  list(exposed, (r) => `${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`);
  console.log(
    `\nLOCAL-ONLY (in git HERE, but on no origin ref — one push from safe): ${localOnly.length} files, ${kb(total(localOnly))}`,
  );
  list(localOnly, (r) => `${r.name}  ${kb(r.size)}`);
  console.log(
    `\nSALVAGED (not on main, but the bytes ARE in git — parked): ${salvaged.length} files`,
  );
  list(salvaged, (r) => `${r.name}  ${kb(r.size)}`, '  ');
  console.log(
    `\nDIVERGED (regenerated over shipped art, bytes ARE in git): ${diverged.length} files`,
  );
  list(diverged, (r) => `${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`, '  ');
  console.log(`\nSHIPPED (blob-identical to main): ${shipped.length} files`);
}

// Default exit is always 0: a routine audit must never block a fire's drain.
if (process.argv.includes('--strict') && atRisk.length + localOnly.length > 0) process.exit(1);
