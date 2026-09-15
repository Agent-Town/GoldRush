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
import { statSync, lstatSync } from 'node:fs';
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
export function isFactorySide(treePath, root = ROOT) {
  const rel = treePath === root ? '' : treePath.startsWith(root + '/') ? treePath.slice(root.length + 1) : null;
  if (rel === null) return /^\/(private\/)?tmp\/gr-gate-/.test(treePath);
  if (rel === '') return true;
  return /^worktrees\/lane-[a-d]$/.test(rel);
}

export function bucketOf(present, onRemote, onAnyRef) {
  if (!present) return 'AT RISK';
  if (onRemote) return 'SAFE';
  if (onAnyRef) return 'LOCAL-REF-ONLY';
  return 'UNREFERENCED';
}

const mb = (b) => (b / 1e6).toFixed(1) + ' MB';

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
    }, null, 2) + '\n');
  } else {
    process.stdout.write(out.join('\n') + '\n');
  }

  process.exit(strict && factory.length ? 1 : 0);
}

if (resolve(process.argv[1] || '') === resolve(fileURLToPath(import.meta.url))) main();
