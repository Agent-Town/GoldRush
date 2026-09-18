#!/usr/bin/env node
// modified-tracked-evidence-census — the derivation behind the F-2569-2 desk figure.
//
// WHY THIS EXISTS (F-2585-1): the F-2569-2 desk row states a FIGURE (`516` files /
// `496.5 MB` across `26` trees) and names no PREDICATE and no INSTRUMENT. That row is
// re-measured every few fires (`421` -> `431` -> `516`), so re-derivation is the NORM,
// and the predicate has two plausible readings that differ ~3x:
//
//   AT RISK  (in NO object database)                 -> 516 files / 496.5 MB / 26 trees
//   non-SAFE (AT RISK + UNREFERENCED + LOCAL-REF-ONLY) -> 1569 files / 1853.8 MB / 28 trees
//
// The desk row means the FIRST. This tool computes it, and PRINTS ALL FOUR BUCKETS so the
// predicate is visible at the call site and cannot be silently swapped (F-2208-1: declare
// on the happy path too — a declaration that appears only on failure re-creates the
// ambiguity it removes).
//
// SCOPE, stated because every selector in this lineage has been too narrow once:
//   population : MODIFIED TRACKED files only (`git status --porcelain -uno`). The UNTRACKED
//                half is a different question with its own duty (F-2357-1 / F-2389-1).
//   trees      : EVERY registered worktree, inside the repo root as well as outside
//                (F-2484-1 / F-2488-1 / F-2489-1). A tree that cannot answer is counted as
//                `could-not-answer`, NEVER as `nothing-here` (F-2485-1).
//   paths      : the four declared evidence prefixes. That is a SELECTOR and it names only
//                the places we thought of (F-2389-1).
//   counts     : FILES, not `git status` ENTRIES — one entry can stand for a directory and
//                any number of megabytes (F-2490-1). `-uno` emits per-file rows anyway;
//                the count is asserted against the hash count below regardless.
//
// EXIT CODES: 0 advisory (default) · 1 = answered, and FACTORY-SIDE bytes are at risk
// (a fire's own duty) · 2 = could not answer. Attended-owned at-risk bytes are an OWNER
// call (F-2561-1) and never red here: a red on the normal state is excused into
// uselessness inside a week (F-1460-1, the `cross-engine` fate).

import { execFileSync } from 'node:child_process';
import { statSync, lstatSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

// Anchored to the git-resolved MAIN worktree root, never to process.cwd(): this tool diffs
// REFS, so it needs a valid REPO root, and a relocated copy must still be correct (F-2221-1).
//
// `--root <path>` names the tree explicitly. That flag is NOT decoration: without it this
// file is anchored to its OWN directory, so a fixture that merely sets `cwd` measures the
// REAL repo and every assertion about it is vacuous — a control aimed at the wrong subject
// (the trap this guard's own first draft fell into, and the one F-2215-1 exists to catch).
export function repoRoot(explicit) {
  const from = explicit || HERE;
  try {
    return execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd: from,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim().replace(/\/\.git\/?$/, '');
  } catch {
    return explicit || resolve(HERE, '..');
  }
}

const rootFlagIndex = process.argv.indexOf('--root');
const ROOT = repoRoot(rootFlagIndex !== -1 ? process.argv[rootFlagIndex + 1] : undefined);
const git = (args, opts = {}) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 << 20, ...opts });

export const EVIDENCE_PREFIXES = ['artifacts/', 'reviews/', 'tasks/runs/', 'logs/runs-archive/'];
export const isEvidence = (p) => EVIDENCE_PREFIXES.some((e) => p.startsWith(e));

// A tree is the FACTORY's when a fire may lawfully write in it. Everything else is
// attended-owned and is a thing to REPORT, never to touch (F-2561-1). Keyed on the
// repo-root-relative lane/gate convention, NOT on a path suffix: `~/.codex/worktrees/<h>/Gold Rush`
// ends in the repo's own basename, which mislabelled the two largest contributors once (s2582).
// §3.0b MANDATES gating undecided content in a DETACHED worktree, and §4.1 mandates
// screenshots into `reviews/shots-*/` — an evidence prefix — so the ordinary outcome of
// every drain is a fire-owned gate worktree holding evidence-prefixed files. Those trees
// are the FACTORY's: F-2569-1 salvaged `gate-s2501`'s 6 by hand and named it factory-side.
// Until s2603 the only out-of-root rule was `/tmp/gr-gate-`, which matched 5 trees — ALL
// FIVE prunable corpses holding ZERO regular files — and missed all four readable shapes,
// including the one in-root tree the standing fire memory PRESCRIBES (`worktrees/gate-s<N>`;
// `/tmp` is recorded unusable for gating, since playwright and vite both need a cwd the
// sandbox refuses outside the repo). F-2603-1.
//
// The gate token is `s<NNN>` + `gate`: a fire session number, which no attended tree carries
// (measured s2603 over all 127 registered worktrees — 0 attended trees match). Anything
// unrecognised stays ATTENDED, because that is the FAIL-SAFE direction: a false "attended"
// costs a report, a false "factory" invites a fire to write in someone else's tree (Mistake #2).
const FIRE_GATE_IN_ROOT = /^(worktrees\/)?gate-s\d+$/;
const FIRE_GATE_OUT_OF_ROOT = /^\/(private\/)?tmp\/gr-(gate-s\d+|s\d+-[a-z-]*gate)/;

export function isFactorySide(treePath, root = ROOT) {
  const rel = treePath === root ? '' : treePath.startsWith(root + '/') ? treePath.slice(root.length + 1) : null;
  if (rel === null) return FIRE_GATE_OUT_OF_ROOT.test(treePath);
  if (rel === '') return true;
  return /^worktrees\/lane-[a-d]$/.test(rel) || FIRE_GATE_IN_ROOT.test(rel);
}

export function bucketOf(present, onRemote, onAnyRef) {
  if (!present) return 'AT RISK';
  if (onRemote) return 'SAFE';
  if (onAnyRef) return 'LOCAL-REF-ONLY';
  return 'UNREFERENCED';
}

const mb = (b) => (b / 1e6).toFixed(1) + ' MB';

// F-2617-1. Counts the evidence-prefixed FILES surviving in a tree this tool could not
// read, so `could-not-answer` stops conflating a reaped corpse with a gitless tree that
// still holds evidence. Deliberately narrow: it walks ONLY the declared prefixes, because
// the decision-relevant fact is "is there evidence here to lose?", and a whole-tree walk
// over a 39k-file scratchpad buys nothing for it.
//
// Returns `null` — never a zero — when the walk itself fails, so a broken read fails
// toward NOTICING rather than toward an empty bucket (F-2212-1's polarity; the whole
// lineage from F-2217-1 onward is instruments whose corpus went silently empty).
export function evidenceFileCount(tree, cap = 200_000) {
  let files = 0;
  let bytes = 0;
  let walked = false;
  for (const pre of EVIDENCE_PREFIXES) {
    const root = join(tree, pre);
    try {
      if (!existsSync(root)) continue;
    } catch {
      return null;
    }
    const stack = [root];
    while (stack.length) {
      if (files >= cap) return { files, bytes, capped: true };
      const d = stack.pop();
      let entries;
      try {
        entries = readdirSync(d, { withFileTypes: true });
        walked = true;
      } catch {
        // A single unreadable subdirectory is not a failed read of the TREE; keep going,
        // but a tree where nothing at all could be walked returns null below.
        continue;
      }
      for (const e of entries) {
        const p = join(d, e.name);
        let st;
        try {
          st = lstatSync(p);
        } catch {
          continue;
        }
        // The load-bearing word here is `lstatSync` above, NOT this line: under lstat a
        // symlink is neither isFile() nor isDirectory(), so it is already skipped, and a
        // teeth sweep that deleted this `continue` reddened NOTHING. What the guard's
        // symlink arm actually defends is the lstat -> stat swap, which FOLLOWS the link
        // and walks another tree entirely — node_modules in these trees is a symlink INTO
        // main, so that swap counts MAIN's files as the tree's (F-2607-1 paid for that
        // one with a reversed headline). The line is kept as belt-and-braces and is
        // labelled redundant so nobody mistakes it for the protection.
        if (st.isSymbolicLink()) continue;
        if (st.isDirectory()) {
          if (e.name === '.git' || e.name === 'node_modules') continue;
          stack.push(p);
        } else if (st.isFile()) {
          files++;
          bytes += st.size;
        }
      }
    }
  }
  // No prefix directory present at all is a real, readable answer of zero — a tree that
  // never wrote evidence, or whose evidence directories the reaper took whole.
  let anyPrefix = false;
  for (const pre of EVIDENCE_PREFIXES) {
    try {
      if (existsSync(join(tree, pre))) anyPrefix = true;
    } catch {
      return null;
    }
  }
  if (anyPrefix && !walked) return null;
  return { files, bytes, capped: false };
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const asJson = argv.includes('--json');
  const out = [];
  const say = (s) => { if (!asJson) out.push(s); };

  // ---- CONTROLS FIRST: a zero must be an ANSWER, not a failed read (F-2215-1) ----
  let tracked, remoteObjs, allObjs;
  try {
    tracked = git(['ls-files']).split('\n').filter(Boolean).length;
    remoteObjs = new Set(git(['rev-list', '--objects', '--remotes']).split('\n').filter(Boolean).map((l) => l.slice(0, 40)));
    allObjs = new Set(git(['rev-list', '--objects', '--all']).split('\n').filter(Boolean).map((l) => l.slice(0, 40)));
  } catch (err) {
    process.stdout.write(`⛔ CANNOT VERIFY — the object database did not answer: ${err.message}\n`);
    process.exit(2);
  }
  if (!tracked) {
    process.stdout.write('⛔ CANNOT VERIFY — zero tracked files; this is not a populated repo root.\n');
    process.exit(2);
  }

  // ---- REGISTRY ----
  const trees = [];
  for (const line of git(['worktree', 'list', '--porcelain']).split('\n')) {
    if (line.startsWith('worktree ')) trees.push(line.slice(9));
  }

  const subjects = [];
  let answered = 0;
  const couldNot = [];
  // A gitless/prunable tree makes these calls FAIL, not return empty — that is the whole
  // point of the could-not-answer bucket. git writes `fatal: not a git repository` to
  // stderr on each, which this tool already classifies; leaking it would be unclassified
  // noise that reads as an alarm (F-2211-1), so the per-tree probes discard it.
  const quiet = { stdio: ['pipe', 'pipe', 'ignore'] };
  for (const t of trees) {
    try {
      // control per tree: a tree that answers must have tracked files, else its empty
      // modified list is a failed read wearing a clean answer's clothes.
      if (!git(['ls-files'], { cwd: t, ...quiet }).split('\n').filter(Boolean).length) throw new Error('zero tracked');
      answered++;
      for (const line of git(['status', '--porcelain', '-uno'], { cwd: t, ...quiet }).split('\n')) {
        if (!line.trim()) continue;
        const p = line.slice(3).trim();
        if (!p || p.includes(' -> ')) continue;
        if (!isEvidence(p)) continue;
        const abs = join(t, p);
        try { if (!lstatSync(abs).isFile()) continue; } catch { continue; }
        subjects.push({ tree: t, path: p, abs });
      }
    } catch {
      couldNot.push(t);
    }
  }

  say('MODIFIED-TRACKED EVIDENCE CENSUS — the F-2569-2 desk derivation');
  say('');
  say(`  corpus    : ${trees.length} registered worktree(s) — ${answered} answered, ${couldNot.length} could-not-answer`);
  say(`  population: modified TRACKED files only (git status --porcelain -uno); the untracked half is F-2357-1`);
  say(`  prefixes  : ${EVIDENCE_PREFIXES.join(' ')}`);
  say(`  controls  : ${tracked} tracked · ${remoteObjs.size} remote-reachable · ${allObjs.size} all-ref-reachable`);
  say(`  subjects  : ${subjects.length}`);

  const buckets = { 'AT RISK': [], UNREFERENCED: [], 'LOCAL-REF-ONLY': [], SAFE: [] };
  if (subjects.length) {
    const hashes = git(['hash-object', '--stdin-paths'], { input: subjects.map((s) => s.abs).join('\n') + '\n' })
      .split('\n').filter(Boolean);
    if (hashes.length !== subjects.length) {
      process.stdout.write(`⛔ CANNOT VERIFY — hashed ${hashes.length} of ${subjects.length} subject(s).\n`);
      process.exit(2);
    }
    const check = git(['cat-file', '--batch-check'], { input: hashes.join('\n') + '\n' }).split('\n').filter(Boolean);
    if (check.length !== hashes.length) {
      process.stdout.write(`⛔ CANNOT VERIFY — batch-check returned ${check.length} of ${hashes.length}.\n`);
      process.exit(2);
    }
    subjects.forEach((s, i) => {
      const h = hashes[i];
      let size = 0;
      try { size = statSync(s.abs).size; } catch {}
      buckets[bucketOf(!check[i].includes('missing'), remoteObjs.has(h), allObjs.has(h))].push({ ...s, blob: h, size });
    });
  }

  const atRisk = buckets['AT RISK'];
  const nonSafe = [...atRisk, ...buckets.UNREFERENCED, ...buckets['LOCAL-REF-ONLY']];
  const treesOf = (rows) => new Set(rows.map((r) => r.tree)).size;
  const bytesOf = (rows) => rows.reduce((a, r) => a + r.size, 0);

  say('');
  say('  ALL FOUR BUCKETS (printed so the predicate is visible, F-2560-1):');
  for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY', 'SAFE']) {
    say(`    ${k.padEnd(15)} ${String(buckets[k].length).padStart(6)} file(s)  ${mb(bytesOf(buckets[k])).padStart(10)}  ${treesOf(buckets[k])} tree(s)`);
  }
  say('');
  say(`  ➡️  THE DESK FIGURE is the AT RISK bucket — in NO object database:`);
  say(`      ${atRisk.length} file(s) / ${mb(bytesOf(atRisk))} across ${treesOf(atRisk)} tree(s)`);
  say(`      (the wider non-SAFE reading is ${nonSafe.length} / ${mb(bytesOf(nonSafe))} / ${treesOf(nonSafe)} trees — NOT the desk figure)`);

  const factory = atRisk.filter((r) => isFactorySide(r.tree));
  const attended = atRisk.filter((r) => !isFactorySide(r.tree));
  say('');
  say(`  ownership : ${attended.length} file(s) attended-owned (OWNER call, F-2561-1) · ${factory.length} FACTORY-SIDE`);
  if (factory.length) {
    say('  ⚠️  FACTORY-SIDE bytes at risk — these ARE a fire\'s own to salvage:');
    for (const [t, n] of Object.entries(factory.reduce((m, r) => ((m[r.tree] = (m[r.tree] || 0) + 1), m), {})))
      say(`        ${String(n).padStart(5)} file(s)  ${t}`);
  }

  // F-2602-1: the line above attributes the AT RISK bucket ALONE, and this tool prints
  // all four buckets "so the predicate is visible" (F-2560-1). A reader who sees
  // LOCAL-REF-ONLY at 3x the desk figure has no way to learn whose it is — and ownership
  // is the field that decides whether a fire may TOUCH it at all (F-2561-1). So every
  // non-SAFE bucket now carries its own ownership, printed ALWAYS including the all-clear
  // (F-2208-1: a line that appears only on failure re-creates the ambiguity it removes).
  // Measured s2602 on the live board: FACTORY-SIDE is 0 in all three, so this fires on
  // nothing today — which is exactly why it is a declaration and not an alarm.
  say('');
  say('  ownership BY BUCKET — which of these are a fire\'s own to touch (F-2602-1):');
  for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY']) {
    const rows = buckets[k];
    const f = rows.filter((r) => isFactorySide(r.tree));
    const a = rows.filter((r) => !isFactorySide(r.tree));
    say(`    ${k.padEnd(15)} FACTORY-SIDE ${String(f.length).padStart(5)} file(s) ${mb(bytesOf(f)).padStart(10)}` +
        ` · attended ${String(a.length).padStart(5)} file(s) ${mb(bytesOf(a)).padStart(10)}`);
    for (const [t, e] of Object.entries(f.reduce((m, r) => {
      const x = (m[r.tree] = m[r.tree] || { n: 0, b: 0 }); x.n++; x.b += r.size; return m;
    }, {})).sort((x, y) => y[1].b - x[1].b))
      say(`        ⚠️  FACTORY ${String(e.n).padStart(5)} file(s) ${mb(e.b).padStart(10)}  ${t}`);
  }
  say('    ⓘ  A non-SAFE verdict is not by itself an owed act: a retention transform may');
  say('       already hold the content in another SHAPE, which blob identity cannot see');
  say('       (F-2570-1/F-2571-1). Ask the save/* manifests before you salvage or push.');
  if (atRisk.length) {
    const byTree = atRisk.reduce((m, r) => {
      const e = (m[r.tree] = m[r.tree] || { n: 0, b: 0 });
      e.n++; e.b += r.size;
      return m;
    }, {});
    say('');
    say('  largest trees by bytes:');
    for (const [t, e] of Object.entries(byTree).sort((a, b) => b[1].b - a[1].b).slice(0, 4))
      say(`    ${String(e.n).padStart(5)} file(s) ${mb(e.b).padStart(10)}  ${t}`);
  }
  if (couldNot.length) {
    say('');
    say(`  could-not-answer (${couldNot.length}) — an error is NEVER "nothing here" (F-2485-1):`);
    for (const t of couldNot.slice(0, 4)) say(`    ${t}`);
    if (couldNot.length > 4) say(`    … and ${couldNot.length - 4} more`);

    // F-2617-1: that bucket names TWO populations with opposite consequences, and the
    // list above cannot tell them apart. A tree loses its `.git` and its FILES at
    // DIFFERENT times, so `could-not-answer` is not a proxy for "reaped": measured
    // s2617, 19 of 24 such trees were fileless corpses and 5 still held 1,874
    // evidence files / 955.3 MB. The path list reads as scratch either way, so a
    // reader correctly infers "nothing there" — right for the corpses, wrong for the
    // rest. Declared ALWAYS, including when the split is all-hollow (F-2208-1).
    //
    // This tool can never ANSWER about these trees, and that is not a fixable gap:
    // its population is "modified TRACKED", which needs an index the tree no longer
    // has. The right question for a gitless tree is the simpler one — are these bytes
    // in git anywhere? — which needs nothing from the tree at all, because a detached
    // arena's blobs live in MAIN's object database (F-2485-1's gitless-safe method).
    const hollow = [];
    const holding = [];
    const unverifiable = [];
    for (const t of couldNot) {
      const c = evidenceFileCount(t);
      if (c === null) unverifiable.push({ tree: t, files: 0, bytes: 0 });
      else if (c.files === 0) hollow.push({ tree: t, ...c });
      else holding.push({ tree: t, ...c });
    }
    holding.sort((a, b) => b.bytes - a.bytes);
    say('');
    say('    SPLIT BY WHAT SURVIVED — a tree loses its .git and its FILES at different');
    say('    times, so unreadable does NOT mean empty (F-2617-1):');
    say(`      HOLLOW        ${String(hollow.length).padStart(3)} tree(s) — 0 evidence file(s): nothing to lose`);
    say(`      HOLDING       ${String(holding.length).padStart(3)} tree(s) — still carrying evidence, and NO instrument reads them`);
    say(`      UNVERIFIABLE  ${String(unverifiable.length).padStart(3)} tree(s) — the walk itself failed; never scored as empty`);
    for (const h of holding)
      say(`        ${String(h.files).padStart(6)} file(s) ${mb(h.bytes).padStart(10)}  ${h.tree}`);
    for (const u of unverifiable) say(`        UNVERIFIABLE  ${u.tree}`);
    if (holding.length || unverifiable.length) {
      say('');
      say('    REMEDY — ask MAIN\'s object database directly; the tree supplies nothing but');
      say('    its bytes, so its missing .git does not matter (F-2485-1, F-2451-1):');
      say('      walk the tree, then from the MAIN worktree batch');
      say('        git hash-object --stdin-paths   then   git cat-file --batch-check');
      say('      and set-test each blob against `git rev-list --objects --remotes`.');
      say('      Assert the hash count EQUALS the file count before believing any zero');
      say('      (F-2215-1), and judge a non-SAFE result by PATH and not by blob: a');
      say('      control-arm re-render is never byte-identical to the shot a drain');
      say('      committed, so blob identity is exact about the wrong quantity');
      say('      (F-2570-1). Measured s2617 on this very population: 41 non-SAFE, and');
      say('      41 of 41 sat at relative paths git had already held — re-renders, not');
      say('      a hole. Expect that, and check it rather than assuming it.');
    }
  }

  if (asJson) {
    process.stdout.write(JSON.stringify({
      treesRegistered: trees.length,
      treesAnswered: answered,
      treesCouldNotAnswer: couldNot.length,
      subjects: subjects.length,
      deskFigure: { files: atRisk.length, bytes: bytesOf(atRisk), trees: treesOf(atRisk) },
      nonSafe: { files: nonSafe.length, bytes: bytesOf(nonSafe), trees: treesOf(nonSafe) },
      buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, { files: v.length, bytes: bytesOf(v), trees: treesOf(v) }])),
      factorySideAtRisk: factory.length,
      attendedAtRisk: attended.length,
      // F-2602-1: ownership for EVERY non-SAFE bucket, not the desk figure alone.
      ownershipByBucket: Object.fromEntries(['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY'].map((k) => {
        const f = buckets[k].filter((r) => isFactorySide(r.tree));
        const a = buckets[k].filter((r) => !isFactorySide(r.tree));
        return [k, {
          factorySide: { files: f.length, bytes: bytesOf(f), trees: treesOf(f) },
          attended: { files: a.length, bytes: bytesOf(a), trees: treesOf(a) },
        }];
      })),
    }, null, 2) + '\n');
  } else {
    process.stdout.write(out.join('\n') + '\n');
  }

  process.exit(strict && factory.length ? 1 : 0);
}

if (resolve(process.argv[1] || '') === resolve(fileURLToPath(import.meta.url))) main();
