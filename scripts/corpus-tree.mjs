/**
 * WHICH TREE IS THIS CORPUS FROM? — the desk family's shared discriminator.
 *
 * EXTRACTED s2241 (F-2241-1) from desk-carryforward-guard.mjs, where F-2232-1
 * landed it. Moved VERBATIM, not re-derived: the body below — including the
 * macOS realpath normalisation its own arm 8 caught — is the one that suite
 * already tests, and re-typing a working cure is how a predicate drifts.
 *
 * WHY A LEAF MODULE, and it is the only cycle-free home available. The desk
 * family already imports in one direction:
 *
 *     desk-declaration-guard  <--  desk-birth-guard  <--  desk-carryforward-guard
 *
 * so desk-declaration-guard cannot import from desk-carryforward-guard without
 * closing that chain into a cycle. This module imports nothing of theirs, so all
 * three reach it freely. That matters more than tidiness: F-2227-1 measured that
 * FOUR independent copies of one predicate is HOW it drifts, and the fix it
 * prescribes is "import the sibling predicate rather than write a fifth copy".
 *
 * ⚠️ SCOPE, STATED SO IT IS NOT OVER-READ: this consolidates the DESK FAMILY
 * only. Three further copies live in dry-board-probe.mjs, drain-block-check.mjs
 * and master-shipped-classifier.mjs, and they are DELIBERATELY LEFT ALONE — they
 * differ in the one respect that matters (which tree the question is about:
 * process.cwd() vs an explicit --root; see F-2223-1 / F-2224-1), so folding them
 * in behind one signature would answer the wrong question for some caller.
 * Consolidating them is real work with a real design question in it, not a
 * drive-by, and re-coding a working cure in passing is exactly what this file's
 * own provenance note warns against.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/**
 * 'main' | 'linked-worktree' | 'no-git' | 'tree-unverifiable'
 *
 * STRINGS, not booleans, for F-2212-1's reason: a careless truthiness test at a
 * call site coerces every failure value to TRUE, i.e. toward NOTICING.
 *
 * Exit 128 is git saying "not a repository", which is LAWFUL here and must NOT
 * refuse: every legacy fixture in this family builds a non-git temp root.
 */
export function corpusTree(root) {
  const r = spawnSync('git', ['-C', root, 'rev-parse', '--git-dir', '--git-common-dir'], {
    encoding: 'utf8',
  });
  if (r.error || r.status === null) return 'tree-unverifiable';
  if (r.status === 128) return 'no-git';
  if (r.status !== 0) return 'tree-unverifiable';
  const [gitDir, commonDir] = String(r.stdout).trim().split('\n');
  if (!gitDir || !commonDir) return 'tree-unverifiable';
  // The two answers arrive in DIFFERENT SHAPES and must be normalised on both
  // axes before they can be compared. From the repo root git says ".git"/".git";
  // from a SUBDIRECTORY it says an ABSOLUTE --git-dir and a RELATIVE
  // --git-common-dir ("../.git"). Resolving alone is not enough on macOS, where
  // the absolute form git prints is /private/var/... while resolving the
  // relative one against a /var/... root yields /var/... — the same directory
  // through a symlink, comparing unequal as strings, which would misread every
  // subdirectory of the MAIN worktree as a linked one.
  const norm = (p) => {
    const abs = path.resolve(root, p);
    try { return fs.realpathSync(abs); } catch { return abs; }
  };
  // Equal means the MAIN worktree or any subdirectory of it — correct, not a flag.
  return norm(gitDir) === norm(commonDir) ? 'main' : 'linked-worktree';
}

/**
 * 'same' | 'different' | 'unverifiable' — is this frozen tree's STATUS.md line-1
 * the one main carries?
 *
 * Only worth asking when the tree is a linked worktree AND the verdict is about
 * to be a PASS. A SKIP asserts nothing and a FAIL is already loud, so neither
 * can hide anything; the PASS is the only verdict a frozen tree makes DANGEROUS.
 *
 * Deliberately NOT a blanket linked-worktree refusal: §3.0b MANDATES gating in a
 * detached worktree and these guards are chained in that battery, so a fire
 * FOLLOWING THE LAW runs them from a worktree as ordinary prescribed work. That
 * refusal would red the mandated drain gate and be excused into uselessness
 * inside a week (F-1460-1, the `cross-engine` fate). A merged gate tree carries
 * main's STATUS.md unchanged — lane tasks are firewalled from it — so the
 * targeted form is structurally unable to fire there.
 */
export function line1MatchesMain(root, localStatusText) {
  const r = spawnSync('git', ['-C', root, 'show', 'main:STATUS.md'], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return 'unverifiable';
  const mainLine1 = String(r.stdout).split('\n')[0] || '';
  const localLine1 = String(localStatusText).split('\n')[0] || '';
  return mainLine1 === localLine1 ? 'same' : 'different';
}

/**
 * The shared refusal text. One copy, because three guards print it and F-2227-1's
 * lesson is precisely that independently-maintained copies of one thing drift.
 *
 * `cmp` is REQUIRED and names which of the two refusable answers arrived, because
 * they owe different acts: 'different' means the tree is frozen (re-run from main),
 * 'unverifiable' means the comparison could not be made at all (investigate git).
 * Collapsing them would reproduce F-2225-1 — a declaration that names a corpus the
 * tool opened rather than the one the verdict came from.
 */
export function frozenTreeRefusal(name, cmp) {
  return [
    `${name}: REFUSING — this is a linked worktree and its STATUS.md`,
    `  line-1 is ${cmp === 'different' ? 'NOT the one main carries' : 'not comparable against main'}.`,
    '  Both corpora here are TRACKED, so this tree is frozen at its branch point and',
    '  the desk(s) above are a self-consistent reading of the WRONG handoff. A PASS',
    '  would certify a board this run never read (F-2232-1 / F-2241-1 / F-2242-1, each',
    '  proven by manufacturing: a real defect on main read byte-identically to a clean',
    '  board from here).',
    '  Re-run from the main worktree, or pass --root <main worktree>.',
  ].join('\n');
}

/**
 * THE WHOLE DECISION, in one place — returns the refusal text, or null to proceed.
 *
 * F-2242-1 (s2242): s2241 extracted `corpusTree` and `line1MatchesMain` here
 * citing F-2227-1 — "four independent copies of one predicate is HOW it drifts" —
 * and then, in the same commit, HAND-WROTE the consuming condition at two new call
 * sites as `line1MatchesMain(...) === 'different'`. The original site three lines
 * from its own convention comment used `cmp !== 'same'`. So the FUNCTION was
 * unified while the CONDITION was re-typed, and re-typed with the opposite
 * polarity: 'unverifiable' — "I could not answer" — fell through to PASS, in a
 * gate, in the default mode. Proven by manufacturing: with a real undeclared desk
 * item on main and `main` unresolvable from the worktree, both guards printed
 * `PASS` at rc=0, their verdict line byte-identical to a genuinely clean board.
 *
 * The lesson is that extracting a helper does not unify a decision; the decision
 * is the condition, so the condition is what has to move. Everything a caller can
 * get wrong now lives on this side of the import.
 */
export function frozenTreeCheck(root, statusText, name) {
  if (corpusTree(root) !== 'linked-worktree') return null;
  const cmp = line1MatchesMain(root, statusText);
  // NOT `=== 'different'`: 'unverifiable' is the failure value, and per F-2212-1
  // a failure value must land on the side that NOTICES.
  return cmp === 'same' ? null : frozenTreeRefusal(name, cmp);
}
