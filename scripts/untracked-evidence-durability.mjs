#!/usr/bin/env node
// untracked-evidence-durability — the UNTRACKED half of the standing §2E evidence sweep.
//
// WHY THIS EXISTS (F-2586-1): `modified-tracked-evidence-census.mjs` computes the
// MODIFIED-TRACKED half and declares in its own output that "the untracked half is
// F-2357-1". That half is a duty on EVERY dry board, and it had no instrument — so nine
// consecutive fires rebuilt it from prose (s2560 · s2570 · s2571 · s2572 · s2581 · s2582 ·
// s2584 · s2585 · s2586), and SIX of them found a defect in their own hand-built verifier:
//
//   F-2570-1  LOCAL-REF-ONLY over-reports: a retention transform preserves CONTENT while
//             destroying BLOB IDENTITY, so the "exact" test says NO for offsite bytes.
//   F-2571-1  the cure was scoped one bucket too narrow — UNREFERENCED over-reports too.
//   F-2572-1  the verifier's OWN KEYS lie: a transform RELOCATES the path, and a retention
//             ref is named for the fire that minted it, never for what it holds. Search
//             the TREES, never the names — and never key parts on `gitBlob`.
//   F-2581-1  an entry has TWO shapes: `parts[]` OR `storedAs`. A parts-only test scores a
//             whole-stored file `0/0` and reports it NOT PRESERVED.
//   F-2582-1  presence is not recoverability: nothing had ever verified the sha256 the
//             manifest records precisely so the question stays decidable.
//
// The error rate on hand-rebuild is measured, not feared. This file freezes the version
// that reproduces every banked figure, and PRINTS THOSE FIGURES so a successor gets
// F-2581-1's regression test for free.
//
// SCOPE, stated because every selector in this lineage has been too narrow once:
//   population : UNTRACKED files (`git ls-files --others --exclude-standard`) plus the
//                modified-tracked rows of the same tree, because §2E's sweep reads both and
//                F-2569-1 showed `--others` is blind to work. NO PATHSPEC (F-2389-1): a path
//                built from an undefined variable lands outside every prefix by construction.
//   trees      : the MAIN tree by default — that is the §2E duty. `--all-trees` sweeps EVERY
//                registered worktree (F-2488-1 / F-2489-1); the discriminator is
//                REGISTRATION, never location. A tree that cannot answer is
//                `could-not-answer`, NEVER `nothing-here` (F-2485-1).
//   paths      : the four declared evidence prefixes, IMPORTED from the sibling rather than
//                re-typed — four independent copies of one predicate is HOW they drift
//                (F-2227-1).
//   counts     : FILES, not `git status` ENTRIES — one entry can stand for a directory and
//                any number of megabytes (F-2490-1).
//   bytes      : `--verify-bytes` streams every retained part and checks the manifest's own
//                sha256 and byte count (F-2582-1). It is OFF by default because it is a
//                fire-scope cost, not a gate-scope one (the F-2159-1 precedent), and the
//                default still proves every part is ORIGIN-REACHABLE.
//
// EXIT CODES: 0 advisory (default) · 1 = answered, and FACTORY-SIDE bytes are at risk and
// NOT preserved by any retention transform (a fire's own duty) · 2 = could not answer.
// Attended-owned bytes are an OWNER call (F-2561-1) and never red here, and an untracked
// file in a live tree is a LAWFUL routine state — a red on the normal state is excused into
// uselessness inside a week (F-1460-1, the `cross-engine` fate).

import { execFileSync } from 'node:child_process';
import { statSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';

import {
  repoRoot,
  EVIDENCE_PREFIXES,
  isEvidence,
  isFactorySide,
  bucketOf,
} from './modified-tracked-evidence-census.mjs';

const rootFlagIndex = process.argv.indexOf('--root');
const ROOT = repoRoot(rootFlagIndex !== -1 ? process.argv[rootFlagIndex + 1] : undefined);
const git = (args, opts = {}) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1024 << 20, ...opts });

const mb = (b) => (b / 1e6).toFixed(1) + ' MB';

// A gitless/prunable tree makes these calls FAIL, not return empty — that is the whole point
// of the could-not-answer bucket, and git's `fatal: not a git repository` on stderr would be
// unclassified noise that reads as an alarm (F-2211-1), so the per-tree probes discard it.
const QUIET = { stdio: ['pipe', 'pipe', 'ignore'] };

/** Subjects of one tree: untracked + modified-tracked, evidence-prefixed, REGULAR FILES only.
 *  The lstat filter is not defensive decoration — `ls-files --others` can emit a
 *  directory-shaped entry that `hash-object` REFUSES, and one such path killed s2560's
 *  first pass mid-run. */
export function subjectsOfTree(tree, gitFn = git) {
  // control per tree: a tree that answers must have tracked files, else its empty subject
  // list is a failed read wearing a clean answer's clothes (F-2215-1).
  if (!gitFn(['ls-files'], { cwd: tree, ...QUIET }).split('\n').filter(Boolean).length) {
    throw new Error('zero tracked files');
  }
  const untracked = gitFn(['ls-files', '--others', '--exclude-standard'], { cwd: tree, ...QUIET })
    .split('\n').filter(Boolean);
  const modified = gitFn(['status', '--porcelain', '-uno'], { cwd: tree, ...QUIET })
    .split('\n').filter((l) => l.trim()).map((l) => l.slice(3).trim())
    .filter((p) => p && !p.includes(' -> '));

  // Each subject carries WHICH POPULATION it came from. That is not bookkeeping: the
  // modified-tracked half IS the F-2569-2 desk figure, so a combined AT RISK count has two
  // plausible readings and a reader can paste the wrong one onto an owner decision row —
  // the exact defect F-2585-1 was filed for, one population over.
  const out = [];
  const seen = new Set();
  for (const [p, population] of [
    ...untracked.map((p) => [p, 'untracked']),
    ...modified.map((p) => [p, 'modified-tracked']),
  ]) {
    if (!isEvidence(p) || seen.has(p)) continue;
    const abs = join(tree, p);
    try { if (!lstatSync(abs).isFile()) continue; } catch { continue; }
    seen.add(p);
    out.push({ tree, path: p, abs, population });
  }
  return out;
}

/** Every retention manifest this repo holds, indexed by the blob each entry preserves.
 *  A retention ref is named for the FIRE THAT MINTED IT, never for what it holds — a
 *  ref-NAME grep for the subject directory returns the WRONG ref or none (F-2572-1). So
 *  ask every ref's TREE. */
export function retentionIndex(gitFn = git) {
  const refs = gitFn(['for-each-ref', '--format=%(refname)']).split('\n').filter(Boolean);
  const byBlob = new Map();
  let manifests = 0;
  for (const ref of refs) {
    let listing;
    try { listing = gitFn(['ls-tree', '-r', '--name-only', ref], QUIET).split('\n').filter(Boolean); }
    catch { continue; }
    for (const path of listing) {
      if (!path.endsWith('BACKUP-MANIFEST.json')) continue;
      let json;
      try { json = JSON.parse(gitFn(['show', `${ref}:${path}`], QUIET)); } catch { continue; }
      const entries = Array.isArray(json) ? json : (json.files || json.entries || []);
      if (!Array.isArray(entries)) continue;
      manifests++;
      for (const e of entries) {
        // Key on the manifest's OWN `gitBlob` — that field exists precisely so the question
        // stays decidable when every other coordinate has moved (F-2572-1).
        if (e && typeof e.gitBlob === 'string' && !byBlob.has(e.gitBlob)) {
          byBlob.set(e.gitBlob, { ref, manifestPath: path, entry: e, tree: listing });
        }
      }
    }
  }
  return { byBlob, manifests, refs: refs.length };
}

/** Resolve ONE retained path inside the holding ref's tree, BY PATH (F-2572-1).
 *  Exact match first; then a unique path-segment-boundary suffix. A suffix that matches
 *  MORE THAN ONE tree entry is ambiguous and is refused rather than guessed — the fuzzy
 *  `endsWith` this replaces is the loose key F-2572-1 forbids, and it silently picks the
 *  first of several same-basename files. */
export function resolveInTree(tree, wanted) {
  if (tree.includes(wanted)) return { path: wanted, how: 'exact' };
  const hits = tree.filter((t) => t === wanted || t.endsWith('/' + wanted));
  if (hits.length === 1) return { path: hits[0], how: 'suffix' };
  if (hits.length > 1) return { ambiguous: hits.length };
  return null;
}

/** Has a retention transform preserved this blob's CONTENT, in whatever SHAPE?
 *  `parts[]` OR `storedAs` — an entry with neither is UNKNOWN SHAPE, never absence
 *  (F-2581-1). */
export function preservationOf(hit, remoteObjs, { verifyBytes = false, gitFn = git } = {}) {
  if (!hit) return { verdict: 'NOT PRESERVED' };
  const { entry, ref, tree } = hit;
  const parts = Array.isArray(entry.parts) && entry.parts.length ? entry.parts : null;
  const targets = parts
    ? parts.map((p) => ({ want: p.path, sha256: p.sha256, bytes: p.bytes }))
    : (entry.storedAs ? [{ want: entry.storedAs, sha256: entry.sha256, bytes: entry.bytes }] : null);
  if (!targets) return { verdict: 'UNKNOWN SHAPE', ref };

  let onRemote = 0;
  const problems = [];
  // LEXICAL order is what the documented `cat …/part-* > file` reconstruction uses, so the
  // hash must be taken in that order or a green verdict would attest to the wrong bytes.
  const ordered = parts ? [...targets].sort((a, b) => String(a.want).localeCompare(String(b.want))) : targets;
  const whole = verifyBytes ? createHash('sha256') : null;
  let wholeBytes = 0;

  for (const t of ordered) {
    const found = resolveInTree(tree, t.want);
    if (!found) { problems.push(`no tree entry for ${t.want}`); continue; }
    if (found.ambiguous) { problems.push(`${t.want} is ambiguous in ${ref} (${found.ambiguous} matches)`); continue; }
    let oid;
    try { oid = gitFn(['rev-parse', `${ref}:${found.path}`], QUIET).trim(); }
    catch { problems.push(`unresolvable: ${found.path}`); continue; }
    if (remoteObjs.has(oid)) onRemote++;
    else problems.push(`not origin-reachable: ${found.path}`);
    if (verifyBytes) {
      let buf;
      try { buf = execFileSync('git', ['show', `${ref}:${found.path}`], { cwd: ROOT, maxBuffer: 1024 << 20 }); }
      catch { problems.push(`unreadable: ${found.path}`); continue; }
      if (typeof t.bytes === 'number' && buf.length !== t.bytes) problems.push(`byte mismatch: ${found.path}`);
      if (t.sha256 && createHash('sha256').update(buf).digest('hex') !== t.sha256) problems.push(`sha256 mismatch: ${found.path}`);
      whole.update(buf);
      wholeBytes += buf.length;
    }
  }

  const res = {
    verdict: problems.length === 0 && onRemote === ordered.length ? 'PRESERVED' : 'INCOMPLETE',
    shape: parts ? 'SPLIT' : 'WHOLE',
    ref,
    onRemote,
    parts: ordered.length,
    problems,
  };
  if (verifyBytes) {
    res.reconstructedBytes = wholeBytes;
    res.reconstructedSha256 = whole.digest('hex');
    if (entry.sha256) res.reconstructionMatches = res.reconstructedSha256 === entry.sha256;
    if (typeof entry.bytes === 'number') res.reconstructionBytesMatch = wholeBytes === entry.bytes;
  }
  return res;
}

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const asJson = argv.includes('--json');
  const allTrees = argv.includes('--all-trees');
  const verifyBytes = argv.includes('--verify-bytes');
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

  const registered = git(['worktree', 'list', '--porcelain']).split('\n')
    .filter((l) => l.startsWith('worktree ')).map((l) => l.slice(9));
  const trees = allTrees ? registered : [ROOT];

  const subjects = [];
  let answered = 0;
  const couldNot = [];
  for (const t of trees) {
    try { subjects.push(...subjectsOfTree(t)); answered++; }
    catch { couldNot.push(t); }
  }

  say('UNTRACKED EVIDENCE DURABILITY — the §2E sweep\'s untracked half (F-2586-1)');
  say('');
  say(`  corpus    : ${trees.length} tree(s) swept of ${registered.length} registered — ${answered} answered, ${couldNot.length} could-not-answer`);
  say(`  scope     : ${allTrees ? 'ALL registered worktrees (F-2488-1/F-2489-1)' : 'MAIN tree only — the §2E duty; add --all-trees for the registry'}`);
  say(`  population: untracked + modified-tracked, NO pathspec (F-2389-1); the modified-tracked-only census is F-2569-2`);
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
      try { size = statSync(s.abs).size; } catch { /* raced with a live writer */ }
      buckets[bucketOf(!check[i].includes('missing'), remoteObjs.has(h), allObjs.has(h))].push({ ...s, blob: h, size });
    });
  }

  const bytesOf = (rows) => rows.reduce((a, r) => a + r.size, 0);
  const treesOf = (rows) => new Set(rows.map((r) => r.tree)).size;
  const nonSafe = [...buckets['AT RISK'], ...buckets.UNREFERENCED, ...buckets['LOCAL-REF-ONLY']];

  say('');
  say('  ALL FOUR BUCKETS (printed so the predicate is visible, F-2560-1):');
  for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY', 'SAFE']) {
    say(`    ${k.padEnd(15)} ${String(buckets[k].length).padStart(6)} file(s)  ${mb(bytesOf(buckets[k])).padStart(11)}  ${treesOf(buckets[k])} tree(s)`);
  }
  // The AT RISK bucket spans TWO populations and only one of them is the desk figure.
  // Printing the split is the whole cure: an undivided count is a figure with two readings
  // (F-2585-1), and this one is read onto an OWNER decision row.
  const atRisk = buckets['AT RISK'];
  const atRiskMod = atRisk.filter((r) => r.population === 'modified-tracked');
  const atRiskUnt = atRisk.filter((r) => r.population === 'untracked');
  say('');
  say('    AT RISK splits by POPULATION, and only ONE half is the F-2569-2 desk figure:');
  say(`      modified-tracked ${String(atRiskMod.length).padStart(6)} file(s)  ${mb(bytesOf(atRiskMod)).padStart(11)}  ${treesOf(atRiskMod)} tree(s)  = the DESK figure`);
  say(`      untracked        ${String(atRiskUnt.length).padStart(6)} file(s)  ${mb(bytesOf(atRiskUnt)).padStart(11)}  ${treesOf(atRiskUnt)} tree(s)  = THIS tool's own subject`);
  say('      Do NOT paste the combined AT RISK count onto the desk row — derive the desk');
  say('      figure with `node scripts/modified-tracked-evidence-census.mjs` (F-2585-1).');

  say('');
  say('    UNREFERENCED means: in the object database, held by NO ref. For a file STILL ON');
  say('    DISK the object copy is REDUNDANT and `git gc` costs nothing — the prunable-fuse');
  say('    reading of this bucket is FALSE for these subjects (F-2566-1).');

  // ---- F-2495-1's SIXTH TEST: is anything still BEING WRITTEN? A discriminator that is
  // exact on a finished corpus can be VACUOUS on a live one. Epoch-ms on BOTH sides, and
  // the TIMESTAMP is what gets carried — an age is only as good as its author's clock
  // (F-2567-1).
  let inflight = null;
  if (nonSafe.length) {
    let newest = 0, newestPath = null;
    for (const r of nonSafe) {
      try { const m = statSync(r.abs).mtimeMs; if (m > newest) { newest = m; newestPath = r.path; } }
      catch { /* raced */ }
    }
    const quietMs = Date.now() - newest;
    inflight = { newestMtimeIso: new Date(newest).toISOString(), quietMinutes: quietMs / 60000, newestPath };
    say('');
    say(`  newest non-SAFE mtime : ${inflight.newestMtimeIso}  (${(quietMs / 86400000).toFixed(2)} days quiet)`);
    say(`                          ${newestPath}`);
    if (quietMs < 30 * 60000) {
      say('  ⏱️  IN FLIGHT — something is still WRITING these. REPORT, DO NOT TOUCH; find');
      say('      the owner (F-2495-1). Reaching into a live tree to "rescue" bytes is the');
      say('      Mistake #2 direction F-2489-1 forbids.');
    }
  }

  // ---- RETENTION-TRANSFORM TEST on EVERY non-SAFE bucket (F-2571-1) ----
  const index = nonSafe.length ? retentionIndex() : { byBlob: new Map(), manifests: 0, refs: 0 };
  say('');
  say(`  retention refs carrying a BACKUP-MANIFEST: ${index.manifests} (of ${index.refs} ref(s))`);
  if (nonSafe.length) {
    say(`  retention-transform test on ALL ${nonSafe.length} non-SAFE subject(s) — F-2571-1 applies it to`);
    say('  EVERY non-SAFE bucket, not just LOCAL-REF-ONLY:');
  }

  let preserved = 0, partsOk = 0, partsTotal = 0, reconstructed = 0;
  const rows = [];
  for (const r of nonSafe) {
    const p = preservationOf(index.byBlob.get(r.blob), remoteObjs, { verifyBytes });
    partsOk += p.onRemote || 0;
    partsTotal += p.parts || 0;
    if (p.verdict === 'PRESERVED') preserved++;
    if (p.reconstructionMatches) reconstructed++;
    rows.push({ ...r, preservation: p });
    const mark = p.verdict === 'PRESERVED' ? '✅' : p.verdict === 'UNKNOWN SHAPE' ? '?' : '✗';
    say(`    ${mark} ${(p.shape || p.verdict).padEnd(13)} ${String(p.onRemote ?? 0)}/${String(p.parts ?? 0)}  ${r.path}`);
    if (p.ref) say(`        [${p.ref}]${p.reconstructionMatches ? '  sha256 ✓ reconstructs' : ''}`);
    for (const problem of p.problems || []) say(`        ⚠️  ${problem}`);
  }
  if (nonSafe.length) {
    say('');
    say(`  RETENTION VERDICT: ${preserved}/${nonSafe.length} non-SAFE subject(s) fully preserved; parts ${partsOk}/${partsTotal} origin-reachable`);
    say(verifyBytes
      ? `  BYTES VERIFIED: ${reconstructed}/${nonSafe.length} reconstruct to the manifest's own sha256 (F-2582-1)`
      : '  bytes NOT streamed — presence is not recoverability (F-2582-1); add --verify-bytes to check');
    say('  ⚖️  A PRESERVED verdict means the alarm is a FALSE URGENCY: do not push bytes that');
    say('      are already on origin, and do not file a durability hole that does not exist.');
  }

  // Ownership decides WHO acts, and it is the only thing that reds (F-2561-1).
  // `rows` is built from `nonSafe`, so every member is already non-SAFE by construction —
  // an extra `bucket !== 'SAFE'` test here would be an always-true condition reading as a
  // safeguard.
  const unpreserved = rows.filter((r) => r.preservation.verdict !== 'PRESERVED');
  const factoryOwed = unpreserved.filter((r) => isFactorySide(r.tree));
  const attendedOwed = unpreserved.filter((r) => !isFactorySide(r.tree));
  say('');
  say(`  ownership : ${attendedOwed.length} unpreserved file(s) attended-owned (REPORT, never touch — F-2561-1) · ${factoryOwed.length} FACTORY-SIDE`);
  if (factoryOwed.length) {
    say('  ⚠️  FACTORY-SIDE and unpreserved — these ARE a fire\'s own to salvage:');
    say('      node scripts/salvage-art-staging.mjs save/<name> && git push origin save/<name>');
    say('      (a local-only salvage reads as safe and is not — F-1055-1)');
    for (const r of factoryOwed.slice(0, 8)) say(`        ${r.tree} :: ${r.path}`);
  }

  if (couldNot.length) {
    say('');
    say(`  could-not-answer (${couldNot.length}) — an error is NEVER "nothing here" (F-2485-1).`);
    say('  A gitless registered tree still SHARES main\'s object database: walk it and hash');
    say('  FROM MAIN rather than reporting it as empty.');
    for (const t of couldNot.slice(0, 4)) say(`    ${t}`);
    if (couldNot.length > 4) say(`    … and ${couldNot.length - 4} more`);
  }

  // BANKED FIGURES: a banked count is a regression test a successor runs for free, and it is
  // the ONLY thing that catches a broken verifier (F-2581-1 — an inherited number, not a
  // green, is what caught s2581's own `0/5`).
  say('');
  say('  BANKED (main tree, s2582 · s2584 · s2585 · s2586 all agree — F-2581-1):');
  say('    AT RISK 0 · UNREFERENCED 2 · LOCAL-REF-ONLY 4 · SAFE 91 · 6/6 preserved · 23/23 parts');
  say('    A divergence here is a finding about your TREE or about this VERIFIER. Read both.');

  if (asJson) {
    process.stdout.write(JSON.stringify({
      treesRegistered: registered.length,
      treesSwept: trees.length,
      treesAnswered: answered,
      treesCouldNotAnswer: couldNot.length,
      subjects: subjects.length,
      buckets: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, { files: v.length, bytes: bytesOf(v), trees: treesOf(v) }])),
      atRiskByPopulation: {
        'modified-tracked': { files: atRiskMod.length, bytes: bytesOf(atRiskMod), trees: treesOf(atRiskMod), note: 'the F-2569-2 desk figure' },
        untracked: { files: atRiskUnt.length, bytes: bytesOf(atRiskUnt), trees: treesOf(atRiskUnt) },
      },
      nonSafe: nonSafe.length,
      preserved,
      partsOnRemote: partsOk,
      partsTotal,
      bytesVerified: verifyBytes,
      reconstructed: verifyBytes ? reconstructed : null,
      inflight,
      factorySideUnpreserved: factoryOwed.length,
      attendedUnpreserved: attendedOwed.length,
    }, null, 2) + '\n');
  } else {
    process.stdout.write(out.join('\n') + '\n');
  }

  process.exit(strict && factoryOwed.length ? 1 : 0);
}

if (resolve(process.argv[1] || '') === resolve(fileURLToPath(import.meta.url))) main();
