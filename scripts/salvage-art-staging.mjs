#!/usr/bin/env node
/**
 * salvage-art-staging — put every AT-RISK ART-slot staging file into git,
 * on a save/* branch, WITHOUT touching main or main's working tree.
 *
 * WHY (Retention Law, CLAUDE.md §4.10b, owner verbatim 2026-07-25: "We have to
 * stop the pruning, our history is our strength"): worktrees/art/ is a plain
 * directory, not a git worktree (verified s1045) — anything there that main
 * does not track exists in NO object database. Mistake #11 with a live answer.
 *
 * Safety properties, by construction:
 *   - never checks out, resets, or stages anything in the main worktree
 *     (all work happens in a throwaway index via GIT_INDEX_FILE)
 *   - refuses to run if the target ref already exists (no clobber)
 *   - creates one new branch ref; main is untouched and stays at its tip
 *
 * Landing the branch on main stays a separate, deliberate decision — this only
 * ends the disk exposure. Usage: node scripts/salvage-art-staging.mjs <branch> [--dry-run]
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * F-1658-1 (s1658): THE PRESCRIBED CURE COULD NOT REACH ONE AT-RISK BYTE.
 *
 * This script was written at s1045, when the ART staging tree was a single flat
 * directory holding 10 files, and it was correct then. `art-staging-audit.mjs`
 * — the instrument that RAISES the alarm this script is supposed to ANSWER —
 * was afterwards widened three times, and this script was never revisited:
 *
 *   F-1054-1  classify by BLOB HASH, not by name. A regenerated file whose name
 *             matches main can still hold bytes that exist nowhere else.
 *   F-1055-1  "in git" must also mean "on an origin ref", or a local-only
 *             salvage branch reads as safe.
 *   F-1120-2  staging roots are ENUMERATED from `worktrees/art/assets/*` and
 *             walked RECURSIVELY — the ART slot writes to four sibling dirs and
 *             motion-pilot nests two levels deep.
 *
 * The old code here asked the two questions the audit had already retired: it
 * read exactly `worktrees/art/assets/raw`, NON-recursively (`readdirSync`), and
 * selected by NAME (`!tracked.has(n)` over `ls-tree main -- assets/raw/`).
 *
 * Measured s1658, live: the audit reported AT RISK 582 files / 527.89 MB, and
 * ALL 582 were `staging/motion-pilot`, nested — e.g.
 * `motion-pilot/pose-library/hero/contact-sheets/hero-attack-down-takes123.png`.
 * This script's own --dry-run offered THREE files, all from `raw/`, none of them
 * at risk. Reach: 0 of 582. It would have written a save/* branch, printed a
 * success line, and ended no exposure at all.
 *
 * That mattered because the remedy text is WIRED INTO THE ALARM:
 * `scripts/health-watch.sh` (the `alert "ART slot: $AU staged file(s)…"` line —
 * cite the CONTENT, the coordinate drifts: this read `:139` until s2195, by
 * which time the true line was `:209` and `:139` landed on the unrelated
 * `status` dispatch, i.e. a reader would conclude the remedy was DELETED)
 * tells its reader, every ten minutes,
 * "preserve with: node scripts/salvage-art-staging.mjs save/<name>" — and the
 * 530 MB question on the owner's desk (F-1640-1) offers "salvage to a branch"
 * as one of its three one-word options. The option was not executable by the
 * tool that offered it.
 *
 * The fix is the same shape as F-1120-2's, and deliberately not a wider
 * hardcoded path: enumerate the staging roots, walk them recursively, and
 * select on the ONE property that defines the exposure — the blob is in no
 * object database. Anything already in git (SHIPPED / SALVAGED / DIVERGED) is
 * not at risk and is not this script's business.
 *
 * NOTE ON SCOPE, so the next reader is not misled: the audit also scans main's
 * own `assets/` tree for stray untracked ART output (the recurring F-071-1
 * defect). That bucket is NOT salvaged here — a stray file in main's working
 * tree is visible to `git status` and its cure is a normal path-scoped add, not
 * a save/* branch. It measured 0 files at s1658. This script reports what it
 * walked, so a future divergence from the audit's denominator is visible rather
 * than silent.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded, which git reads as a different directory.
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const STAGING_ROOT = join(REPO, 'worktrees/art/assets');
// The ART slot's worktree root — one level ABOVE the staging tree (F-2195-1).
const ART_ROOT = join(REPO, 'worktrees/art');
const BRANCH = process.argv[2];
const DRY = process.argv.includes('--dry-run');

if (!BRANCH || !BRANCH.startsWith('save/')) {
  console.error('usage: salvage-art-staging.mjs save/<name> [--dry-run]');
  process.exit(2);
}

const INDEX = join(tmpdir(), `gr-salvage-${BRANCH.replace(/\W/g, '-')}.idx`);
const git = (args, env) =>
  execFileSync('git', ['-C', REPO, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
    env: { ...process.env, ...env },
  }).trim();
const idxGit = (args) => git(args, { GIT_INDEX_FILE: INDEX });

// --- no-clobber guard -------------------------------------------------------
try {
  git(['show-ref', '--verify', '--quiet', `refs/heads/${BRANCH}`]);
  console.error(`REFUSING: ${BRANCH} already exists. Pick another name.`);
  process.exit(1);
} catch {
  /* absent — good */
}

// --- the scan set: enumerated and recursive, never hardcoded (F-1120-2) -----
// Every file under a directory, recursively. motion-pilot/ nests two levels deep
// and the old non-recursive readdir could not see any of it.
// F-2174-1 (s2174): skip VCS/OS noise BY NAME, never every dot-prefixed entry.
// The old rule was `if (e.name.startsWith('.')) continue`, so this tool could
// never SALVAGE a dot-prefixed file and its sibling `art-staging-audit.mjs:136`
// could never REPORT one missing — one blind spot in both halves of the loop.
// Measured casualty: the 36 `.hero-*-take[123].png` pose-library takes
// (12.43 MB) that this tool's own 2026-08-22 run (`68de23724`) walked past.
// Kept in lockstep with the audit's SKIP_NAMES; `salvage-art-staging-reach.test.mjs`
// reds if the two drift apart.
const SKIP_NAMES = new Set(['.git', '.DS_Store', '.localized', 'Thumbs.db']);
const walk = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_NAMES.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.isFile()) acc.push(p);
  }
  return acc;
};

// Walk the staging ROOT ITSELF, not merely its subdirectories: a file sitting
// LOOSE at the root belongs to no area, and a directories-only enumeration can
// never see it. Live casualty at s1658: `worktrees/art/assets/LEDGER.md`, the
// ART slot's own batch ledger, 62,822 bytes in NO object database (F-1658-3).
const scan = [];
for (const file of walk(STAGING_ROOT)) {
  // A staging file's counterpart on main is the same path under assets/.
  const rel = relative(STAGING_ROOT, file);
  const slash = rel.indexOf('/');
  scan.push({
    file,
    mainPath: join('assets', rel),
    area: `staging/${slash === -1 ? '(root)' : rel.slice(0, slash)}`,
  });
}
// ...and walk the ART WORKTREE ROOT too, one level ABOVE the staging tree.
// F-2195-1 (s2195): the comment above says to walk "the staging ROOT ITSELF",
// and it does — but STAGING_ROOT is `worktrees/art/assets`, so a file at
// `worktrees/art/` still belonged to no area and was never scanned. F-1658-3
// exactly one directory up, and the FIFTH recurrence of this class. The cure
// must land in all THREE implementations of this question (the audit, this
// tool, and health-watch.sh's art_untracked) or it restores F-2174-1's shape:
// the tool that SAVES and the tool that VERIFIES the save blind identically.
// Live casualty: `worktrees/art/README.md`, 120 bytes in no object database
// since 2026-07-05. Salvaged path keeps its TRUE location rather than being
// remapped under assets/ — it is not art output, it is the slot's own note.
for (const e of existsSync(ART_ROOT) ? readdirSync(ART_ROOT, { withFileTypes: true }) : []) {
  if (SKIP_NAMES.has(e.name) || !e.isFile()) continue;
  scan.push({
    file: join(ART_ROOT, e.name),
    mainPath: join('worktrees/art', e.name),
    area: 'staging/(worktree-root)',
  });
}

const areas = [...scan.reduce((m, s) => m.set(s.area, (m.get(s.area) || 0) + 1), new Map())]
  .sort()
  .map(([area, count]) => ({ area, count }));

if (!scan.length) {
  console.log(`nothing under ${relative(REPO, STAGING_ROOT)} — no salvage needed`);
  process.exit(0);
}

// A path containing a newline would corrupt the --stdin-paths batch below, and
// silently salvaging the wrong bytes is worse than refusing. No art file has one.
const bad = scan.filter((s) => s.file.includes('\n'));
if (bad.length) {
  console.error(`REFUSING: ${bad.length} path(s) contain a newline; cannot batch-hash safely`);
  process.exit(2);
}

// --- classify by BLOB HASH, never by name (F-1054-1) ------------------------
// `hash-object` WITHOUT -w computes the sha and writes nothing, so classifying
// is side-effect-free: a --dry-run really does leave the object database alone.
// Batched through --stdin-paths — one process for 982 files instead of 982.
const hashAll = (paths, write) =>
  execFileSync('git', ['-C', REPO, 'hash-object', ...(write ? ['-w'] : []), '--stdin-paths'], {
    input: paths.join('\n') + '\n',
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  })
    .trim()
    .split('\n');

const shas = hashAll(scan.map((s) => s.file), false);
if (shas.length !== scan.length) {
  console.error(`REFUSING: hashed ${shas.length} of ${scan.length} files — refusing to guess the mapping`);
  process.exit(2);
}

// Every object already in this database, in one traversal — `cat-file -e` per
// file is correct but costs a process each. `--batch-check` answers in bulk.
const present = new Set();
{
  const out = execFileSync('git', ['-C', REPO, 'cat-file', '--batch-check=%(objectname) %(objecttype)'], {
    input: shas.join('\n') + '\n',
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
  for (const line of out.split('\n')) {
    const m = line.match(/^([0-9a-f]{40}) blob$/);
    if (m) present.add(m[1]);
  }
}

// AT RISK is the whole selection rule: these bytes are in no object database, so
// they die with this disk. Bytes already in git are SHIPPED / SALVAGED /
// DIVERGED — safe, and none of this script's business.
const atRisk = scan
  .map((s, i) => ({ ...s, sha: shas[i], size: statSync(s.file).size }))
  .filter((s) => !present.has(s.sha))
  .sort((a, b) => a.mainPath.localeCompare(b.mainPath));

const mb = (n) => `${(n / 1048576).toFixed(2)} MB`;
const bytes = atRisk.reduce((a, r) => a + r.size, 0);

console.log(`scanned ${scan.length} file(s) across ${areas.length} staging area(s):`);
for (const a of areas) console.log(`  ${a.area}  ${a.count} file(s)`);
console.log(`\nAT RISK (in NO object database): ${atRisk.length} file(s), ${mb(bytes)}`);

if (!atRisk.length) {
  console.log('nothing at risk in the art staging tree — no salvage needed');
  process.exit(0);
}

const byArea = new Map();
for (const r of atRisk) byArea.set(r.area, (byArea.get(r.area) || 0) + 1);
for (const [area, n] of [...byArea].sort()) console.log(`  ${area}  ${n} file(s)`);
console.log();
for (const r of atRisk.slice(0, 20)) console.log(`  ${r.mainPath}  ${mb(r.size)}`);
if (atRisk.length > 20) console.log(`  … and ${atRisk.length - 20} more`);

if (DRY) {
  console.log('\n--dry-run: no ref written, no object written');
  process.exit(0);
}

// --- build the commit in a throwaway index ---------------------------------
if (existsSync(INDEX)) rmSync(INDEX);
const base = git(['rev-parse', 'main']);
idxGit(['read-tree', base]);

// NOW write the blobs (this is the first mutation of any kind).
const written = hashAll(atRisk.map((r) => r.file), true);
if (written.length !== atRisk.length) {
  console.error(`REFUSING: wrote ${written.length} of ${atRisk.length} blobs — refusing to build a partial tree`);
  process.exit(2);
}
atRisk.forEach((r, i) => {
  if (written[i] !== r.sha) {
    console.error(`REFUSING: ${r.mainPath} hashed ${r.sha} but wrote ${written[i]} — the file changed under us`);
    process.exit(2);
  }
  idxGit(['update-index', '--add', '--cacheinfo', `100644,${r.sha},${r.mainPath}`]);
});

const tree = idxGit(['write-tree']);
const msg = [
  `salvage: ${atRisk.length} at-risk ART-slot staging file(s) into git (Retention Law)`,
  '',
  'These files existed in NO object database: worktrees/art/ is a plain staging',
  'directory, not a git worktree, and is ignored by main. This commit ends that',
  'disk exposure and PREJUDGES NOTHING — none of these have passed art QA, and',
  'whether any of them belong on main is still an owner decision.',
  '',
  `${mb(bytes)} across ${byArea.size} staging area(s):`,
  ...[...byArea].sort().map(([area, n]) => `  ${area}  ${n} file(s)`),
  '',
  ...atRisk.map((r) => `  ${r.mainPath}`),
  '',
  `base: ${base} (main at salvage time) — main itself is untouched`,
].join('\n');

const commit = git(['commit-tree', tree, '-p', base, '-m', msg]);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);
rmSync(INDEX, { force: true });

console.log(`\nwrote ${BRANCH} = ${commit}`);
console.log(`main still at ${git(['rev-parse', 'main'])} (unchanged)`);
console.log(`\nNOT PUSHED. These bytes are in git HERE but on no origin ref, which the`);
console.log(`audit reports as LOCAL-ONLY — one push from safe:  git push origin ${BRANCH}`);
