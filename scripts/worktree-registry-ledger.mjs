#!/usr/bin/env node
// worktree-registry-ledger — NAME what left the worktree registry, don't merely count it.
//
// WHY THIS EXISTS (F-2638-1, measured s2638).
// F-2636-1 established that `git worktree list` is a REGISTRY mutable by a third party,
// and made it binding to BANK THE `corpus` COUNT in the handoff and treat a FALL as a
// finding. That duty then failed its first real test, in the very next fire:
//
//   s2637 banked `corpus 110`. s2638 measured `corpus 109`. The fall was real (the
//   census's `trees.length` is the unfiltered `git worktree list` count) and the
//   `.git/worktrees` admin-dir count fell with it, so a registration really was removed.
//   The duty's own question — "which trees left, and were any of them HOLDING?" — was
//   UNANSWERABLE, and no amount of diligence could have answered it:
//
//     * a COUNT cannot name a departure; only a SET can, and nobody banks the set;
//     * and the disk cannot name it either, because DE-REGISTRATION REMOVES THE `.git`
//       FILE — the one marker distinguishing a worktree from an ordinary directory.
//       MEASURED s2638: all five F-2636-1-named de-registered trees have no `.git`, and
//       neither do plain scratch dirs (`ztmp`, `tools`, `vite-cache-*`, `debris`). On
//       disk they are the same shape. A probe keyed on `.git` returns ZERO for the
//       whole population; a probe keyed on the path shape returns 49 candidates and
//       cannot rank them.
//
// So the answer must be PERSISTED BEFORE THE FALL, by the fire that can still see the
// tree. A count persisted before the fall does not help; a SET does. This tool banks the
// set in git, so a successor is HANDED the departed path by name instead of deducing it.
//
// EXIT CODES follow the house convention (drain-block-check, dry-board-probe,
// master-shipped-classifier, review-evidence-audit): advisory 0 by default;
// `--strict` gives 1 = "answered, and the set CHANGED", 2 = "could not answer".
//
// ADVISORY BY DESIGN, and the restraint is INHERITED rather than re-argued: creating and
// removing worktrees is LAWFUL, routine attended work — it is what a finished heat leaves
// behind and what a tidy operator does — so a red here would fire during ordinary correct
// operation and be excused into uselessness inside a week (F-1460-1, the `cross-engine`
// fate). It is the same restraint F-2485-1 and F-2636-1 both took for this very hazard.
// This is a triage READ, exactly as §2.0c's runner check is.

import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { EVIDENCE_PREFIXES, evidenceFileCount, isFactorySide, repoRoot } from './modified-tracked-evidence-census.mjs';

export const BASELINE_REL = 'logs/worktree-registry.json';

// Anchored to the GIT-RESOLVED root, never to cwd and never to import.meta.url: this tool
// reads a REGISTRY and writes a repo file, so it needs a valid REPO ROOT from anywhere in
// the repo or any of its worktrees (F-2221-1's cure, and its deliberate non-use of
// import.meta.url).
export function baselinePath(root = repoRoot()) {
  return join(root, BASELINE_REL);
}

export function currentRegistry(root = repoRoot()) {
  const out = execFileSync('git', ['worktree', 'list', '--porcelain'], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 << 20,
  });
  const trees = [];
  for (const line of out.split('\n')) if (line.startsWith('worktree ')) trees.push(line.slice(9));
  return trees.sort();
}

// A STRING, never a boolean, for F-2212-1's reason: a careless truthiness test on a
// failure value is TRUE, i.e. it coerces toward NOTICING rather than toward a clean read.
export function readBaseline(file) {
  if (!existsSync(file)) return { state: 'absent', worktrees: [] };
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'));
    if (!Array.isArray(parsed.worktrees)) return { state: 'unreadable', worktrees: [], detail: 'no worktrees array' };
    return { state: 'read', worktrees: parsed.worktrees, measured: parsed.measured, session: parsed.session };
  } catch (err) {
    return { state: 'unreadable', worktrees: [], detail: err.message };
  }
}

// F-2664-1: CONTENTION IS A STATE, NOT AN EVENT — so it cannot be read off a DELTA.
//
// F-2663-1 made it a binding triage read to run this tool before any drain and "READ THE
// ADDED LIST BY NAME", because an ADDED tree containing your drain is a STOP (§7.6). That
// is right about the value and wrong about the channel: ADDED is a diff against the banked
// baseline, and F-2636-1's own duty tells the SAME fire to re-bank with `--update` in the
// SAME fire. So the contending tree enters the baseline immediately, while the contention
// it represents persists for hours — and on the NEXT fire the tool prints `✅ UNCHANGED`.
//
// MEASURED s2664, one fire after that cure landed: s2663 banked 9 paths INCLUDING
// `scratchpad/wt-corr2-land`, which held an unlanded `drain: merge sol/map-art-campaign-2`
// and was being written 4.1 minutes earlier. This tool's WHOLE output was 310 bytes, said
// `✅ UNCHANGED — the registry set is identical to the banked one (9 paths)`, and did not
// name that tree ANYWHERE. Meanwhile F-A3-2's temporary store gate had CLEARED, so
// `drain-block-check` read ✅ CLEAR and the lane sat 3 ahead — the exact collision F-2663-1
// predicted for "a fire arriving after that".
//
// So the declaration below is ALWAYS-ON and independent of the baseline (F-2208-1: a
// declaration that appears only on a delta re-creates the ambiguity it removes). It
// DECLARES and does NOT refuse — exit codes are untouched — because a worktree holding
// unlanded work is LAWFUL, routine attended work, and a red there would be excused into
// uselessness inside a week (F-1460-1). It is the same restraint F-2366-1 took for BUSY.
//
// Containment is asked BY VALUE (`rev-list --count`), never by `merge-base --is-ancestor`:
// that command uses exit 1 as a legitimate VERDICT, and F-2561-1 measured that the
// "exit 1 with empty stderr" discriminator is UNAVAILABLE through a wrapper that collapses
// a failure to `err.message` — node supplies "Command failed:", so a real verdict reads as
// a crash and three genuinely-unlanded trees get misfiled as unanswerable.
export function unlandedTrees(root = repoRoot(), mainRef = 'main') {
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }).trim();

  let mainSha;
  try {
    mainSha = git(['rev-parse', '--verify', mainRef]);
  } catch (err) {
    // A STRING state, never an empty list: an unresolvable main must fail toward NOTICING
    // rather than toward "nothing is in flight" (F-2212-1's polarity).
    return { state: 'unverifiable', detail: `could not resolve ${mainRef}: ${err.message}`, trees: [] };
  }

  let porcelain;
  try {
    porcelain = git(['worktree', 'list', '--porcelain']);
  } catch (err) {
    return { state: 'unverifiable', detail: `git worktree list failed: ${err.message}`, trees: [] };
  }

  const entries = [];
  let cur = null;
  for (const line of porcelain.split('\n')) {
    if (line.startsWith('worktree ')) {
      cur = { path: line.slice(9) };
      entries.push(cur);
    } else if (!cur) continue;
    else if (line.startsWith('HEAD ')) cur.head = line.slice(5);
    else if (line.startsWith('branch ')) cur.branch = line.slice(7).replace(/^refs\/heads\//, '');
    else if (line === 'detached') cur.detached = true;
  }

  const rootReal = (() => {
    try {
      return realpathSync(root);
    } catch {
      return resolve(root);
    }
  })();

  const trees = [];
  for (const e of entries) {
    if (!e.head) continue;
    let same = false;
    try {
      same = realpathSync(e.path) === rootReal;
    } catch {
      same = resolve(e.path) === rootReal;
    }
    if (same) continue; // the repo root is where a drain LANDS; it is never a contender.

    let ahead;
    try {
      ahead = Number(git(['rev-list', '--count', `${mainSha}..${e.head}`]));
    } catch (err) {
      // Declared, never dropped: a tree we could not judge is the one most worth naming.
      trees.push({ path: e.path, head: e.head, branch: e.branch || '(detached)', ahead: null, subject: null, state: 'unverifiable', detail: err.message });
      continue;
    }
    if (!Number.isFinite(ahead) || ahead === 0) continue; // contained in main: already landed.

    let subject = null;
    try {
      subject = git(['log', '-1', '--format=%s', e.head]);
    } catch {
      subject = null;
    }
    trees.push({ path: e.path, head: e.head, branch: e.branch || '(detached)', ahead, subject, state: 'unlanded' });
  }

  return { state: 'read', trees };
}

export function diffRegistry(before, after) {
  const b = new Set(before);
  const a = new Set(after);
  return {
    added: after.filter((p) => !b.has(p)),
    removed: before.filter((p) => !a.has(p)),
  };
}

// The F-2636-1 question, answered mechanically for a tree that has LEFT the registry.
// `evidenceFileCount` returns null — never a zero — when its walk fails, so an unreadable
// departure fails toward NOTICING.
export function judgeDeparture(path, root = repoRoot()) {
  const onDisk = existsSync(path);
  if (!onDisk) return { path, onDisk, verdict: 'GONE FROM DISK TOO', files: 0, bytes: 0 };
  const count = evidenceFileCount(path);
  if (count === null) return { path, onDisk, verdict: 'UNVERIFIABLE — the walk failed', files: null, bytes: null };
  return {
    path,
    onDisk,
    verdict: count.files > 0 ? 'STILL HOLDING EVIDENCE' : 'on disk, no evidence files',
    files: count.files,
    bytes: count.bytes,
    factorySide: isFactorySide(path, root),
  };
}

// F-2637-1: four evidence tools print the label ` MB` and two of them mean MEBIBYTES.
// This tool is in the census/sweep family, so it is DECIMAL — and it SAYS SO at every
// site, because the divergence is invisible in the three characters themselves.
const mb = (b) => (b / 1e6).toFixed(1);

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const update = argv.includes('--update');
  const say = (s = '') => process.stdout.write(s + '\n');

  // `--root <path>` names the tree explicitly, and it is NOT decoration: repoRoot()
  // anchors to the SCRIPT'S OWN DIRECTORY, never to cwd, so a fixture that merely sets
  // `cwd` measures the REAL repo and every assertion about it is vacuous. This guard's
  // own first draft fell into exactly that (s2638): 12 of 14 arms failed loud, but TWO
  // PASSED VACUOUSLY and one of them ran `--update` against the real baseline — a control
  // aimed at the wrong subject that also MUTATED it. The census carries the same flag and
  // the same warning; copying the flag is the whole cure.
  const rootFlag = argv.indexOf('--root');
  const explicitRoot = rootFlag !== -1 ? argv[rootFlag + 1] : undefined;

  let root;
  try {
    root = repoRoot(explicitRoot);
  } catch (err) {
    say('⛔ CANNOT VERIFY — could not resolve the repo root: ' + err.message);
    process.exit(strict ? 2 : 0);
  }

  let now;
  try {
    now = currentRegistry(root);
  } catch (err) {
    // A refusal is not a report: it reaches STDOUT, because a caller that classifies
    // stdout reads an empty string as silence (F-2211-1).
    say('⛔ CANNOT VERIFY — `git worktree list` failed: ' + err.message);
    process.exit(strict ? 2 : 0);
  }

  const file = baselinePath(root);
  const base = readBaseline(file);

  say('WORKTREE REGISTRY LEDGER — name what left, do not merely count it (F-2638-1)');
  say('');
  // The corpus declaration prints ALWAYS, including the happy path: a declaration that
  // appears only on failure re-creates the ambiguity it removes (F-2208-1).
  say(`  registry  : ${now.length} registered worktree(s) [live]`);
  say(`  baseline  : ${base.state}${base.state === 'read' ? ` — ${base.worktrees.length} path(s), banked ${base.measured || '?'} by ${base.session || '?'}` : ''}`);
  say(`  baseline @ : ${BASELINE_REL}`);
  if (base.detail) say(`  baseline detail: ${base.detail}`);

  // F-2664-1 — printed BEFORE every verdict branch, so it survives the UNCHANGED early
  // exit that swallowed it. The COUNT line is unconditional (it is a corpus fact, and its
  // zero is the all-clear a fire needs); the NAMED list is gated on the list existing,
  // because an always-on empty section is the noise that decays a declaration into a
  // formality (F-2366-1).
  const flight = unlandedTrees(root);
  if (flight.state !== 'read') {
    say(`  in flight : UNVERIFIABLE — ${flight.detail}`);
    say('              Do NOT read this as "nothing is in flight"; nothing was measured.');
  } else {
    say(`  in flight : ${flight.trees.length} registered tree(s) hold work that is NOT on main`);
    if (flight.trees.length) {
      say('');
      say('  ⚠️  IN FLIGHT ELSEWHERE — a tree holding YOUR drain is a STOP (F-2663-1, §7.6):');
      for (const t of flight.trees) {
        if (t.state === 'unverifiable') {
          say(`      ? ${t.path}`);
          say(`          UNVERIFIABLE — ${t.detail}`);
          continue;
        }
        say(`      • ${t.path}`);
        say(`          ${t.head.slice(0, 9)} · ${t.branch} · ${t.ahead} commit(s) ahead of main`);
        if (t.subject) say(`          "${t.subject.slice(0, 96)}"`);
      }
      say('');
      say('     ⓘ  Match your drain candidate against the HEADs above BEFORE you gate it. A');
      say('        path SUGGESTS a subject; a HEAD PROVES one. This list is deliberately');
      say('        independent of the baseline: contention is a STATE and persists across');
      say('        fires, while an ADDED delta is consumed by the first --update (F-2664-1).');
    }
  }
  say('');

  if (base.state === 'unreadable') {
    say('⛔ CANNOT VERIFY — the baseline exists but will not parse. That is an instrument');
    say('   failure, not a clean board: do NOT read it as "no change".');
    say(`   REMEDY: repair or re-mint it — node scripts/worktree-registry-ledger.mjs --update`);
    process.exit(strict ? 2 : 0);
  }

  if (base.state === 'absent') {
    say('ⓘ  NO BASELINE YET — nothing to diff against. This is lawful on a first run, and');
    say('   it is also exactly the state in which a departure is unnameable, so mint one:');
    say(`   REMEDY: node scripts/worktree-registry-ledger.mjs --update  &&  git add ${BASELINE_REL}`);
    if (update) mint(file, now, say);
    process.exit(0);
  }

  const { added, removed } = diffRegistry(base.worktrees, now);
  const delta = now.length - base.worktrees.length;

  if (!added.length && !removed.length) {
    say(`✅ UNCHANGED — the registry set is identical to the banked one (${now.length} paths).`);
    if (update) mint(file, now, say);
    process.exit(0);
  }

  say(`⚠️  THE REGISTRY SET CHANGED — count ${base.worktrees.length} → ${now.length} (${delta >= 0 ? '+' : ''}${delta})`);
  say('');

  if (added.length) {
    say(`  ADDED (${added.length}) — new registrations, ordinarily attended work:`);
    for (const p of added) say(`      + ${p}`);
    say('');
  }

  if (removed.length) {
    say(`  REMOVED (${removed.length}) — F-2636-1's question, ANSWERED BY NAME:`);
    for (const p of removed) {
      const j = judgeDeparture(p, root);
      const size = j.bytes === null ? '?' : `${j.files} file(s) / ${mb(j.bytes)} MB (decimal, F-2637-1)`;
      say(`      - ${p}`);
      say(`          ${j.verdict} · ${size}${j.factorySide === true ? ' · FACTORY-SIDE' : j.factorySide === false ? ' · attended-owned' : ''}`);
    }
    say('');
    say('  ⓘ  A removal is LAWFUL and usually costs nothing — but a tree that is STILL');
    say('     HOLDING EVIDENCE is now invisible to every instrument in this factory, because');
    say('     they all take their subject set from the registry (F-2636-1). Name such a tree');
    say('     in tasks/BACKLOG.md: a path is the only handle left on a de-registered tree.');
    say('');
  }

  say('  ➡️  JUDGE the lists above, then re-bank so the next fall is measured from here:');
  say(`      node scripts/worktree-registry-ledger.mjs --update  &&  git add ${BASELINE_REL}`);

  if (update) mint(file, now, say);
  process.exit(strict ? 1 : 0);
}

function mint(file, trees, say) {
  const session = process.env.GR_SESSION || '';
  const payload = {
    note: 'Banked worktree registry SET. F-2638-1: a COUNT cannot name a departure and the disk cannot either (de-registration removes the .git file), so the set must be persisted BEFORE the fall.',
    measured: new Date().toISOString(),
    session,
    count: trees.length,
    evidencePrefixes: EVIDENCE_PREFIXES,
    worktrees: trees,
  };
  writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
  say('');
  say(`  ✍️  BANKED — ${trees.length} path(s) written to ${BASELINE_REL}. Commit it path-scoped.`);
}

// REALPATH on both sides, not a raw compare and not a basename match: /tmp is a symlink
// to /private/tmp on macOS, and a raw comparison there silently skips main() — rc=0, 0 B
// stdout, indistinguishable from a subject that reported nothing (F-2215-1's silent-control
// trap, paid for in that fire by a control that never ran). A basename match is the
// opposite error: it would fire for any file that happens to share this one's name.
const selfPath = fileURLToPath(import.meta.url);
const real = (p) => {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
};
if (process.argv[1] && real(process.argv[1]) === real(selfPath)) main();
