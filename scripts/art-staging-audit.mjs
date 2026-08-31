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
 *
 * F-2184-1 (s2184): that caveat names only the HARMLESS direction. Tracking-ref
 * staleness has two, and only one of them can lie in the direction this audit has
 * already lied twice (F-1054-1, F-1055-1):
 *   (1) tracking ref BEHIND the wire  -> `offsite` too SMALL -> false ALARM. This
 *       is the direction the caveat above describes; it over-reports risk, which
 *       is the safe way to be wrong.
 *   (2) tracking ref names objects the wire NO LONGER HAS (branch deleted or
 *       rewound on origin, tracking ref not yet pruned) -> `offsite` too LARGE
 *       -> FALSE ZERO: blobs reported backed that in fact die with this disk.
 * Direction (2) is the false-zero SHAPE this header catalogues, one level up: the
 * question moved from "is this blob in git?" to "is the ref I am trusting real?".
 *
 * MEASURED AT THE WIRE s2184, and the exposure is currently NIL — recorded so the
 * next fire re-measures rather than re-derives, and knows this audit does NOT ask:
 *   - 133 tracking refs (+HEAD = 134) vs `git ls-remote origin`: SET-IDENTICAL.
 *     Same names, same SHAs, zero divergence in EITHER direction. Diff the set,
 *     never the tally (F-2182-1) — an equal count is also what one deletion plus
 *     one addition looks like.
 *   - one remote only (origin, git@github.com:Agent-Town/GoldRush.git), so
 *     `--remotes` really is origin and cannot be inflated by a second, on-disk
 *     remote — which would be F-1055-1's "asks only THIS disk" recurring.
 * DELIBERATELY NOT CURED IN CODE: adding an `ls-remote` call would make this audit
 * network-dependent, so a flaky connection would turn a working instrument into a
 * failing one, and the audit is a fire duty rather than a gate. The check above is
 * ~1 s by hand when a LOCAL-ONLY green is actually load-bearing. If direction (2)
 * ever measures non-zero, THAT is the third gap the header demands be fixed as a
 * class rather than an instance.
 *
 * F-2185-1 (s2185): `offsite` is a UNION of every remote-tracking ref, and A UNION
 * CANNOT EXPRESS REDUNDANCY. A blob whose only home is ONE deletable ref produces
 * a byte-identical verdict to a blob held on all 133. So `LOCAL-ONLY 0` is true
 * and says less than every reader has taken it to say: it certifies EXISTENCE
 * offsite, never DURABILITY. Nobody had ever asked where SALVAGED actually lives.
 * MEASURED s2185, per-ref attribution over all 134 remote-tracking refs:
 *   - 760 SALVAGED files = 754 distinct blobs = 587.64 MB.
 *   - 753 of 754 blobs (99.87%) have REDUNDANCY 1 — exactly one origin ref each.
 *   - those sole homes are FOUR refs, all `save/art-staging-*`, holding 563.18 MB:
 *       save/art-staging-20260822  578 blobs  509.22 MB
 *       save/art-staging-20260801  166 blobs   38.58 MB
 *       save/art-staging-20260811    5 blobs    8.23 MB
 *       save/art-staging-20260725    4 blobs    7.15 MB
 *   - the single exception (redundancy 133) is
 *     motion-pilot/production-newsie-mei/char-newsie-mei-sheet-walk8.png, whose
 *     bytes are on origin/main under a different path; it is SALVAGED only
 *     because its STAGING PATH is absent from main's assets/ tree.
 *   - NO-ORIGIN-REF blobs: 0 — which independently re-confirms `LOCAL-ONLY 0`.
 * THE OBVIOUS THREAT WAS CHECKED AND IS REFUTED, and it is written down so the
 * next fire does not re-derive it: fire.md §2E's SALVAGE LIFECYCLE retires
 * `save/<name>` -> `archive/<name>` once its re-land merges, and
 * `salvage-census.mjs --strict` exits 1 on any absorbed `save/*` still unrenamed
 * (55 such renames are pending on the OWNER'S DESK as F-1536-2). If these four
 * were in THAT batch, one owner word would move 563.18 MB of sole-copy art.
 * They are not: `salvage-census` classifies all four as HOLDS (content main
 * lacks), so the pending rename batch does not reach them. ASK THE CENSUS, do
 * not assume from the prefix.
 * WHAT REMAINS IS A CLASSIFICATION MISMATCH, NOT A DELETION THREAT: the census
 * calls these four "genuinely re-land-pending", which they will never be — they
 * are BACKUPS, not re-land candidates, and `save/art-staging-20260725` has sat in
 * that state for 28 days. A lifecycle whose terminal state is "retire once
 * merged" is the wrong lifecycle for bytes that must never be retired, and the
 * `save/` prefix is the only thing declaring their intent.
 * DELIBERATELY NOT CURED IN CODE, for the same reason the wire check above is
 * not: per-ref attribution costs 134 `rev-list --objects` traversals (~3 min),
 * which would turn a 31.9 s fire duty into a 4 min one — and F-2159-1 is already
 * an open OWNER'S DESK question about whether a >=30 s addition is a fire's call
 * at all. What IS cured here is free: the SALVAGED headline now prints its BYTES.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — the repo path contains a space ("Gold Rush")
// and pathname keeps it percent-encoded, which git reads as a different directory.
const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const STAGING_ROOT = join(REPO, 'worktrees/art/assets');
// The ART slot's worktree root — one level ABOVE the staging tree. See §1b.
const ART_ROOT = join(REPO, 'worktrees/art');

const git = (...args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });

// F-2196-1 (s2196): THE BOUNDARY DECLARATION — what sits immediately OUTSIDE the
// scan root, named out loud on every run.
//
// This script's class has now recurred FIVE times (F-1054-1 name-vs-blob ·
// F-1055-1 here-vs-origin · F-1120-2 one-dir-vs-enumerated · F-1658-3
// assets-root-vs-subdirs · F-2195-1 worktree-root), and every cure widened the
// boundary by exactly the width of the incident that prompted it. s2195 wrote
// the lesson down — "when you widen a scan, state the new boundary explicitly
// and go look at what is immediately outside it" — and going to look found the
// SIXTH instance one sibling away: `worktrees/lane-{a,b,c,d}-salvage`, four
// directories that are NOT registered git worktrees (their `.git` stubs point at
// the LIVE lanes' admin dirs) and so belong to no scan root the factory owns.
// 111 files / 25.18 MB of source, specs and review screenshots sat there in NO
// object database for 48 days — including
// `e2e/lane-c-polish-02-rivalry-stats.spec.ts`, polish-02, the named casualty of
// CLAUDE.md Mistake #2, the Reset Massacre. Salvaged to `save/lane-salvage-s2196`
// @ 207e6222 and pushed to origin BEFORE this code changed.
//
// This does NOT widen the scan, deliberately. Walking those trees would sweep in
// 10,047 files / 833.30 MB of node_modules+dist+test-results, drowning the AT
// RISK signal and making `--strict` red forever — which is how a guard gets
// excused into uselessness inside a week (the `cross-engine` decay, F-1460-1).
// It instead makes the blind spot VISIBLE: a sibling tree appearing under
// `worktrees/` is named on the next run rather than after 48 days.
//
// ADVISORY, exit 0 always (the `drain-block-check` UNKNOWN precedent). It must
// not move `--strict`: that would prejudge F-2159-1, the open OWNER'S DESK
// question about rooting this audit in `test:ledger-guards`, by making the
// answer permanently red.
const WORKTREES_DIR = join(REPO, 'worktrees');

// F-2406-1 (s2406): WHOSE GITDIR DOES AN UNOWNED TREE BORROW?
//
// CREDIT WHERE IT IS OWED, because this is not a new sighting: F-2196-1's comment
// above records in passing that these trees' `.git` stubs "point at the LIVE
// lanes' admin dirs", and **F-2404-1 (s2404) characterised it correctly one fire
// earlier** — "a tool run with cwd inside a salvage tree would resolve to the live
// lane's HEAD and index while looking at salvage's files". That reading is right,
// and s2404 priced the item INERT on a MEASURED reachability argument (no script,
// skill or npm leg sends anyone into these trees) and deliberately proposed no
// cure. That restraint was reasonable and its reachability claim re-verified here.
//
// WHAT IS NEW IS THE DIRECTION, AND IT IS WHY "inert" needed one qualifier: s2404
// priced the READ hazard. The WRITE hazard is not inert, and it is destructive.
//
// MEASURED s2406 on a throwaway fixture (a plain `cp -R` of a linked worktree,
// which is exactly the shape these four are), READ-ONLY probes first:
//   --show-toplevel  -> the COPY          (it gets its own working tree)
//   --git-dir        -> the LIVE lane's   (HEAD, index and refs are SHARED)
//   worktree list    -> the copy is ABSENT (so `lane-usable` cannot see it)
// and then the write arms:
//   `git add` inside the copy   -> the LIVE lane reads `MM file.txt` with its own
//                                  file untouched on disk (shared index)
//   `git reset --hard HEAD~1`   -> the LIVE lane's HEAD *and the branch ref* move,
//                                  its disk is NOT rewritten, and `main..lane/x`
//                                  drops 1 -> 0: an unmerged commit silently
//                                  leaves the lane's ahead-set.
// That last one is Mistake #2, the Reset Massacre, reached from a directory that
// is invisible to every lane instrument the factory owns.
//
// SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT, realised cost ZERO. All
// four lanes read ahead=0 / tracked-dirt=0 the day this landed, no script in
// scripts/ or ops/ runs git inside these trees (s2404's reachability claim,
// re-verified s2406 — the only non-test globber of worktrees/ is this file, which
// deliberately does not walk them), and `worktrees/` is gitignored. The trigger is
// a human or an agent typing a git command after being sent to look at one of
// these trees — and the one thing in the factory that sends anybody there is the
// block this function prints. s2404 says so itself: "if an attended session ever
// wants the disk space back, these are the four trees to ask about."
//
// So the cure is NOT a new measurement — it is MOVING A KNOWN FACT to where it is
// read. s2404's characterisation lived in a BACKLOG row, which is not a surface a
// fire or an attended session reads at the moment it stands in one of these
// directories. That is this factory's most-repeated finding (F-2153-1 · F-2204-1 ·
// F-2350-1 · F-2360-1 · F-2365-1 · F-2403-1): a cure with no reader.
//
// It DECLARES and does not REFUSE (F-1460-1): these trees are LAWFUL — the
// RETENTION LAW forbids deleting them, and their content is in the object database
// BY CONSTRUCTION (F-2404-1's mechanism: each is a checkout of committed
// lane-branch content; re-confirmed s2406 at 1554/1554, which reproduces s2404's
// figure exactly). A red on "a salvage tree exists" would fire forever and be
// excused into uselessness.
// Values are STRINGS for F-2212-1's reason: a careless truthiness test on a
// failure value coerces toward NOTICING, not toward silence.
function gitdirOwners() {
  const owners = new Map(); // absolute admin dir -> registered worktree path
  for (const w of registeredWorktrees()) {
    const dot = join(w, '.git');
    try {
      const st = statSync(dot);
      if (st.isDirectory()) owners.set(resolve(dot), w);
      else {
        const m = readFileSync(dot, 'utf8').match(/^gitdir:\s*(.+)$/m);
        if (m) owners.set(resolve(dirname(dot), m[1].trim()), w);
      }
    } catch {
      // a registered worktree we cannot read is not a reason to fail the audit;
      // it only means this one cannot be named as an owner below.
    }
  }
  return owners;
}

// Ask `git worktree list`, never a hardcoded lane list: the slot->path mapping
// rots (F-1464-3), and a hardcoded list of what git already knows is a defect
// awaiting a rename.
function registeredWorktrees() {
  return git('worktree', 'list', '--porcelain')
    .split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => l.slice('worktree '.length));
}

// 'shared'   — borrows a LIVE registered worktree's gitdir; a git WRITE here
//              reaches that lane. The hazard this classifier exists for.
// 'orphan'   — points at an admin dir no registered worktree owns (harmless to
//              the lanes, but git commands there answer about nothing).
// 'own-repo' — a real independent repository. Self-contained.
// 'no-git'   — a plain directory. Self-contained.
// 'unverifiable' — could not be read; declared, never assumed safe.
function gitdirLink(abs, owners) {
  const dot = join(abs, '.git');
  try {
    if (!existsSync(dot)) return { link: 'no-git', sharesWith: null };
    if (statSync(dot).isDirectory()) return { link: 'own-repo', sharesWith: null };
    const m = readFileSync(dot, 'utf8').match(/^gitdir:\s*(.+)$/m);
    if (!m) return { link: 'unverifiable', sharesWith: null };
    const target = resolve(dirname(dot), m[1].trim());
    const owner = owners.get(target);
    return owner
      ? { link: 'shared', sharesWith: relative(REPO, owner) }
      : { link: 'orphan', sharesWith: null };
  } catch {
    return { link: 'unverifiable', sharesWith: null };
  }
}

function unauditedNeighbours() {
  if (!existsSync(WORKTREES_DIR)) return [];
  // Registered worktrees are git's own business and are audited by git itself.
  const registered = new Set(registeredWorktrees());
  const owners = gitdirOwners();
  const out = [];
  for (const e of readdirSync(WORKTREES_DIR, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const abs = join(WORKTREES_DIR, e.name);
    if (abs === ART_ROOT || registered.has(abs)) continue;
    // walk() skips SKIP_NAMES, so a worktree's `.git` stub is not counted as content.
    out.push({ name: relative(REPO, abs), files: walk(abs).length, ...gitdirLink(abs, owners) });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

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
// F-2174-1 (s2174): skip VCS/OS noise BY NAME, never every dot-prefixed entry.
// The old rule was `if (e.name.startsWith('.')) continue`, which excluded real
// generated art from the scan set BY CONSTRUCTION. Live casualty: 36 files /
// 12.43 MB of `.hero-<pose>-<dir>-take[123].png` under
// motion-pilot/pose-library/hero/contact-sheets/, every one in NO object
// database, while this audit printed `AT RISK 0`.
//
// This is this script's own recurring class a FIFTH time (F-1054-1 name-vs-blob,
// F-1055-1 here-vs-origin, F-1120-2 one-dir-vs-enumerated, F-1658-3 root-loose-
// files) and the standing order on it is "fix the CLASS, not the instance" — so
// the identical skip in the SIBLING tool `salvage-art-staging.mjs:110` is cured
// in the same commit. That pairing is what made this invisible: the tool that
// SAVES and the tool that VERIFIES the save shared one blind spot, so the
// morning's motion-pilot salvage (`68de23724`, pushed to
// origin/save/art-staging-20260822) skipped these 36 and the audit then
// certified the result clean.
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

// THE SCAN SET — every place ART-slot output is known to land, discovered rather
// than hardcoded, so a new one is covered the day it appears (F-1120-2).
//
// 1. The staging tree: `worktrees/art/assets/*` is enumerated, not listed. These
//    dirs are gitignored, so git itself will never mention them and the only way
//    to classify them is to hash every file.
// F-1658-3 (s1658): walk the staging ROOT ITSELF, not merely its subdirectories.
// The old loop kept only entries that were directories, so a file sitting LOOSE
// at the root belonged to no area and was never scanned. That is this script's
// own recurring class a FOURTH time (F-1054-1 name-vs-blob, F-1055-1 here-vs-
// origin, F-1120-2 one-dir-vs-enumerated), and it had a live casualty: the ART
// slot's own `worktrees/art/assets/LEDGER.md` — 62,822 bytes whose blob is in NO
// object database, under a name main tracks at DIFFERENT bytes. The audit that
// exists to find exactly that was structurally unable to see it.
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
// 1b. The ART WORKTREE's own root files. F-2195-1 (s2195): STAGING_ROOT is
//    `worktrees/art/assets`, so a file sitting at `worktrees/art/` — one level
//    ABOVE it — belonged to no area and was never scanned. This is F-1658-3
//    exactly one directory up: that finding's own comment says to walk "the
//    staging ROOT ITSELF, not merely its subdirectories", and it cured the root
//    of assets/ while leaving the root of the WORKTREE unwalked. FIFTH
//    recurrence of this script's own class (F-1054-1 name-vs-blob · F-1055-1
//    here-vs-origin · F-1120-2 one-dir-vs-enumerated · F-1658-3 assets-root-vs-
//    subdirs), and like every one of them it had a live casualty: the slot's own
//    `worktrees/art/README.md` — 120 bytes recording where ART output goes — in
//    NO object database for 48 days, while four consecutive fires read AT RISK 0.
//    maxdepth 1 by design: `assets/` is walked above, and the audit must not
//    recurse into any future sibling dir without a deliberate area mapping.
//    mainPath is the bare root-relative name, which CANNOT collide with the
//    `tracked` map (keyed exclusively on `assets/...` paths from ls-tree), so a
//    root file with no counterpart on main classifies untracked => AT RISK.
for (const e of existsSync(ART_ROOT) ? readdirSync(ART_ROOT, { withFileTypes: true }) : []) {
  if (SKIP_NAMES.has(e.name) || !e.isFile()) continue;
  scan.push({
    file: join(ART_ROOT, e.name),
    mainPath: e.name,
    area: 'staging/(worktree-root)',
  });
}

// 2. MAIN's own assets/ tree. An ART run that writes to the repo root instead of
//    the staging dir (the recurring F-071-1 defect) leaves untracked files here,
//    where no amount of widening the staging path would ever have found them.
//    `git status -uall` is the cheap, exact way to ask: tracked-and-clean files
//    are by definition already in git and need no hashing.
const seenMainPaths = new Set();
for (const line of git('status', '--porcelain', '--untracked-files=all', '--', 'assets/').split('\n')) {
  if (!line.trim()) continue;
  // XY <path>  — renames would carry ' -> ', which we do not expect under assets/
  const rel = line.slice(3).trim().replace(/^"|"$/g, '');
  const abs = join(REPO, rel);
  if (!existsSync(abs) || !statSync(abs).isFile()) continue;
  seenMainPaths.add(rel);
  scan.push({ file: abs, mainPath: rel, area: 'main-tree' });
}

// 2b. MAIN's tracked-and-CLEAN assets/ files that are committed but NOT PUSHED.
//     F-1184-5 (s1184) — the THIRD false zero in this audit's history, and the
//     ART-SLOT LAW says fix the class, not the instance (cf. F-1054-1 classified
//     by NAME; F-1055-1 asked only THIS disk). The gap: step 2 collects main-tree
//     via `git status`, which lists only DIRTY or UNTRACKED files. Its comment
//     reasons that "tracked-and-clean files are by definition already in git and
//     need no hashing" — true for AT RISK, but LOCAL-ONLY asks a DIFFERENT
//     question: is the blob on an ORIGIN ref? A tracked, clean, committed-but-
//     unpushed file is in git here and on no origin ref — exactly LOCAL-ONLY —
//     yet it never entered `scan`, so the localOnly test below could never see
//     it. Measured when found: 28.33 MB of freshly salvaged assets/raw/originals/
//     sat in a commit 6 ahead of origin/main and the audit printed LOCAL-ONLY 0.
//     Asking `origin/main..main` is O(unpushed commits), not O(6.5k tracked files).
//
// F-2216-1 (s2216) — THIS CURE COULD SILENTLY RESTORE THE FALSE ZERO IT CURED.
// The catch below used to be bare, justified by a comment reading "no origin, or
// no origin/main remote-tracking ref yet — nothing to compare against, and a
// missing remote is already the loudest possible signal." Both halves are wrong:
//   1. The catch fires when the REMOTE IS PRESENT and only the `origin/main`
//      REF is unavailable. Then `offsite` is still populated from the other
//      remote-tracking refs (137 of them on this repo), so NOTHING is loud —
//      the main-tree files simply never enter `scan` and appear in no bucket.
//   2. It also fires for any other failure of that one call (a fork/spawn
//      failure at ~2,000 spawns a run, git dying on the plumbing call), which
//      the comment never contemplated. F-2212-1's class: a handler correct for
//      its named cause and blind to every other one.
// PROVEN BY MANUFACTURING on a scratch repo whose ground truth was one unpushed
// asset (LOCAL-ONLY 1). Healthy git: `LOCAL-ONLY 1 files`, names it, `--strict`
// rc=1. Delete only refs/remotes/origin/main, remote and other refs intact:
// `LOCAL-ONLY 0 files`, `--strict` rc=0, `--json` localOnlyFiles 0 — all THREE
// machine channels byte-identical to a genuinely safe board. Same for a
// transient failure of that one call. The only dissent was an unlabelled line
// of git's own stderr, which no caller classifies and `--json` drops entirely.
// That is F-2208-1's shape — "could not answer" and "the answer is clean"
// sharing one verdict — sitting inside the cure for this audit's THIRD false
// zero, and it is the number the ART-SLOT LAW makes every dry-board fire report
// to the owner (six consecutive fires have reported LOCAL-ONLY 0).
// CURE: declare the source's coverage, exactly as F-2196-1 declares the scan's
// boundary forty lines up. `mainTreeSource` is a STRING for F-2212-1's reason —
// a careless truthiness test on a FAILURE value is true, i.e. toward declaring.
let mainTreeSource = 'ok';
try {
  const unpushed = git('diff', '--name-only', 'origin/main..main', '--', 'assets/');
  for (const line of unpushed.split('\n')) {
    const rel = line.trim();
    if (!rel) continue;
    if (seenMainPaths.has(rel)) continue; // step 2 already has it (dirty/untracked)
    const abs = join(REPO, rel);
    if (!existsSync(abs) || !statSync(abs).isFile()) continue; // deleted upstream
    scan.push({ file: abs, mainPath: rel, area: 'main-tree' });
  }
} catch {
  // BOTH outcomes blind this bucket, so both are declared. Naming which one
  // tells the reader which act is owed — fetch/push, versus investigate. The
  // discriminator is the one F-2213-1 measured: `rev-parse --verify --quiet`
  // exits 1 when the ref simply is not there, and that is the only non-zero
  // code that means anything here.
  try {
    git('rev-parse', '--verify', '--quiet', 'origin/main^{commit}');
    mainTreeSource = 'unverifiable';
  } catch {
    mainTreeSource = 'absent-ref';
  }
}
const MAIN_TREE_SOURCE_NOTE = {
  ok: 'committed-but-unpushed source: ran (this bucket was asked)',
  'absent-ref':
    '⛔ UNDER-REPORTED — origin/main is unavailable, so committed-but-unpushed assets were never asked about. This number is a FLOOR, not a verdict. Fetch or push, then re-run.',
  unverifiable:
    '⛔ CANNOT VERIFY — the committed-but-unpushed probe FAILED with origin/main present. This number is a FLOOR, not a verdict. Investigate before reporting it.',
};

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
        // F-2196-1: the boundary, machine-readable too — a consumer that only
        // reads atRiskFiles must still be able to see what was never scanned.
        notAudited: unauditedNeighbours(),
        // F-2216-1: same principle for the OTHER headline. A consumer reading
        // localOnlyFiles must be able to see whether that bucket was asked.
        mainTreeSource,
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
  // F-2196-1: name the boundary. See the comment at unauditedNeighbours().
  const outside = unauditedNeighbours();
  if (outside.length) {
    console.log(
      `\nNOT AUDITED — ${outside.length} tree(s) under worktrees/ that no git worktree owns and this audit does not scan:`,
    );
    for (const d of outside) {
      // F-2406-1: the gitdir link is declared on EVERY row, including the benign
      // ones (F-2208-1 — a declaration that appears only on failure re-creates the
      // ambiguity it removes).
      const note =
        d.link === 'shared'
          ? `⚠️  SHARES the gitdir of ${d.sharesWith}`
          : d.link === 'orphan'
            ? 'gitdir points at an admin dir no worktree owns'
            : d.link === 'unverifiable'
              ? '⚠️  gitdir UNVERIFIABLE — could not be read'
              : d.link === 'own-repo'
                ? 'self-contained (own repository)'
                : 'self-contained (no .git)';
      console.log(`  ${d.name}  ${d.files} files  —  ${note}`);
    }
    console.log(
      '  These are outside the scan root BY DESIGN (walking them would drown AT RISK in build output).',
    );
    console.log(
      '  They are named so a new one is visible on the next run, not after 48 days — F-2196-1.',
    );
    if (outside.some((d) => d.link === 'shared')) {
      console.log(
        '  ⚠️  A tree marked SHARES has its OWN working tree but BORROWS that lane\'s HEAD,\n' +
          '      index and branch refs. Reading there is safe; a WRITE is not — `git add`\n' +
          '      dirties the live lane\'s index, and `reset`/`checkout`/`commit` move the live\n' +
          '      lane\'s HEAD and branch ref without rewriting its disk, silently dropping\n' +
          '      commits out of `main..<lane>` (Mistake #2, the Reset Massacre). These trees\n' +
          '      are ABSENT from `git worktree list`, so `lane-usable` cannot see them.\n' +
          '      Never run a writing git command inside one — F-2406-1.',
      );
    }
  }
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
  // F-2216-1: ALWAYS printed, including on the happy path. A declaration that
  // appears only on failure cannot distinguish "asked and found nothing" from
  // "never asked" — which is precisely the §4 desk-header precedent: if the desk
  // is genuinely empty, still write the header.
  console.log(`  ${MAIN_TREE_SOURCE_NOTE[mainTreeSource]}`);
  list(localOnly, (r) => `${r.name}  ${kb(r.size)}`);
  // F-2185-1 (s2185): print the BYTES, not merely the file count. "760 files"
  // reads like bookkeeping; "587.64 MB" reads like the largest bucket on the
  // board, which it is. The number was already computed — only the headline was
  // narrower than the fact, which is this script's own recurring class.
  console.log(
    `\nSALVAGED (not on main, but the bytes ARE in git — parked): ${salvaged.length} files, ${kb(total(salvaged))}`,
  );
  list(salvaged, (r) => `${r.name}  ${kb(r.size)}`, '  ');
  console.log(
    `\nDIVERGED (regenerated over shipped art, bytes ARE in git): ${diverged.length} files`,
  );
  list(diverged, (r) => `${r.name}  staging ${kb(r.size)} vs main ${kb(r.mainSize)}`, '  ');
  console.log(`\nSHIPPED (blob-identical to main): ${shipped.length} files`);
}

// Default exit is always 0: a routine audit must never block a fire's drain.
// That intent is real and an over-general cure destroys it, so F-2216-1 changes
// ONLY --strict — the one mode whose whole purpose is to turn the verdict into
// an exit code, and the exact arm the open F-2159-1 desk question proposes to
// root in `test:ledger-guards`.
//
// The convention is the corpus's own, carried by drain-block-check,
// dry-board-probe, master-shipped-classifier and review-evidence-audit:
//   2 = could not answer        1 = answered, and the answer refuses
// "Could not answer" is tested FIRST and wins: when the source did not run the
// counts below are a FLOOR, so a 1 taken off them would assert a completeness
// this run never had.
if (process.argv.includes('--strict')) {
  if (mainTreeSource !== 'ok') process.exit(2);
  if (atRisk.length + localOnly.length > 0) process.exit(1);
}
