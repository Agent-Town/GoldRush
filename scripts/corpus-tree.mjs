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
 * 'on-branch' | 'detached' | 'unverifiable' — is HEAD on a branch, or pinned to a
 * bare commit?
 *
 * F-2332-1 (s2332). `corpusTree` answers WHICH TREE, and `frozenTreeCheck` uses
 * that as a proxy for IS THIS CORPUS FRESH. The two come apart in the MAIN
 * worktree: a detached HEAD there reports 'main' — the modal healthy value, and
 * the value a correct run prints — while `STATUS.md`, `tasks/BACKLOG.md` and
 * `tasks/goals.json` are frozen at that commit exactly as they are in the linked
 * worktree this family already refuses.
 *
 * MEASURED s2332 against desk-carryforward-guard, ground truth = a REAL silent
 * desk drop on main, control asserting its own validity first (F-2215-1):
 *   healthy main worktree  -> rc=1, names F-BBB-1                    (the control)
 *   frozen LINKED worktree -> rc=2, REFUSING                         (already cured)
 *   SAME repo, main worktree DETACHED one commit back
 *                          -> rc=0, `PASS — every item ... carried`  (this defect)
 * The false PASS differs from a GENUINELY clean board in one substring — the
 * session label of the desk it happened to read (`s1001` vs `s1002`) — while the
 * verdict line, all three counts, `corpus tree : main` and the exit code are
 * byte-identical. A reader cannot falsify a plausible session number.
 *
 * ⚠️ SEVERITY STATED HONESTLY AND DELIBERATELY NOT INFLATED: LATENT. No script in
 * the repo detaches the MAIN worktree (swept s2332), and §3.0b's mandated gate
 * tree is made with `git worktree add`, which is LINKED and therefore already
 * caught. What earns it a cure is that the harm is a certified false PASS, in a
 * gate, in the default mode, and the sibling half of the same staleness has had a
 * four-finding apparatus built against it since s2232 — this is the second of the
 * two ways a tree can be frozen, and only one was being asked about.
 *
 * WHY DETACHMENT AND NOT "IS HEAD ON main": because a fire's OWN main worktree is
 * on `main` with UNCOMMITTED STATUS.md edits for its entire working life, so any
 * freshness test that compares local text to `main:STATUS.md` reads 'different'
 * and would refuse on every lawful handoff — F-1460-1's fate, a gate excused into
 * uselessness inside a week. Detachment is never a lawful fire state, so this arm
 * is structurally unable to fire on the prescribed path.
 */
export function headDetached(root) {
  // `symbolic-ref -q HEAD` is the narrow question: exit 0 + a ref when HEAD names a
  // branch, exit 1 and SILENT when it is detached. Only ever called once the tree
  // has been identified as 'main', so git has already answered here.
  const r = spawnSync('git', ['-C', root, 'symbolic-ref', '-q', 'HEAD'], { encoding: 'utf8' });
  if (r.error || r.status === null) return 'unverifiable';
  if (r.status === 0 && String(r.stdout).trim()) return 'on-branch';
  if (r.status === 1) return 'detached';
  return 'unverifiable';
}

/**
 * The refusal for a MAIN worktree that is pinned to a bare commit.
 *
 * A SEPARATE text from frozenTreeRefusal for this file's stated reason: that one
 * opens "this is a linked worktree", which is false here, and the two owe
 * different acts — that one says re-run from main, this one says `git checkout
 * main` first.
 */
export function detachedHeadRefusal(name) {
  return [
    `${name}: REFUSING — this is the main worktree but its HEAD is DETACHED.`,
    '  STATUS.md and tasks/BACKLOG.md are TRACKED, so they are frozen at that commit',
    '  and the desk(s) above are a self-consistent reading of the WRONG handoff — the',
    '  same staleness this guard already refuses in a linked worktree (F-2232-1), by',
    '  the other of the two ways a tree can be frozen (F-2332-1, proven by',
    '  manufacturing: a real silent drop on main read as PASS at rc=0 from here).',
    '  Run `git checkout main`, or pass --root <a tree on main>.',
  ].join('\n');
}

/**
 * The refusal for a main worktree whose HEAD state could not be read at all.
 *
 * SEPARATE from detachedHeadRefusal for this file's standing reason: that one opens
 * "its HEAD is DETACHED", which is precisely what is unknown here, and the two owe
 * different acts — that one says `git checkout main`, this one says go look at git.
 * Same split as frozenTreeRefusal vs unverifiableTreeRefusal one level up.
 */
export function unverifiableHeadRefusal(name) {
  return [
    `${name}: REFUSING — git could not say whether this main worktree's HEAD is`,
    '  detached. `git symbolic-ref -q HEAD` did not answer, so this run cannot tell a',
    '  tree that is on `main` from one frozen at a bare commit. STATUS.md and',
    '  tasks/BACKLOG.md are TRACKED, so a PASS would certify a board that might never',
    '  have been read (F-2332-1). This is an INSTRUMENT failure, not a board state:',
    '  check git, then re-run. (A non-git root is NOT this case — it never gets here.)',
  ].join('\n');
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
 * The refusal for a tree that could not be IDENTIFIED at all.
 *
 * A SEPARATE text from frozenTreeRefusal, and deliberately so: that one opens
 * "this is a linked worktree", which is precisely the thing we do not know here.
 * Asserting it would be F-2225-1 — a declaration naming a corpus the verdict did
 * not come from. The two also owe DIFFERENT ACTS: that one says re-run from main,
 * this one says the instrument itself is broken and wants investigating.
 */
export function unverifiableTreeRefusal(name) {
  return [
    `${name}: REFUSING — git could not say which tree this corpus is from.`,
    '  `git rev-parse --git-dir --git-common-dir` did not answer, so this run cannot',
    '  tell a MAIN worktree from a frozen linked one. Both corpora here are TRACKED,',
    '  so a PASS would certify a board that might never have been read (F-2243-1).',
    '  This is an INSTRUMENT failure, not a board state: check git, then re-run.',
    '  (A non-git root is NOT this case — that answers 128 and proceeds normally.)',
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
  // F-2243-1 (s2243): this line read `if (corpusTree(root) !== 'linked-worktree')
  // return null;` — which is F-2242-1's OWN defect on the sibling discriminator,
  // inside the function built to cure it. corpusTree returns FOUR values, and an
  // inequality against ONE of them puts the other three on the permissive side,
  // the failure value among them. Note the docstring's promise that strings
  // protect the caller does NOT hold here: a string protects a TRUTHINESS test,
  // and this is a test against a specific value. Proven by manufacturing: a
  // linked worktree whose line-1 is not main's, with only the corpusTree probe
  // failing, printed PASS at rc=0 with its verdict line BYTE-IDENTICAL to a
  // genuinely clean board.
  //
  // 'no-git' (exit 128) stays PERMISSIVE and that is load-bearing, not laziness:
  // measured s2243, a plain non-git temp dir AND a path that does not exist both
  // answer 128, and every legacy fixture in this family builds a non-git temp
  // root. Refusing there would red them all and be excused into uselessness
  // inside a week (F-1460-1). Only 'tree-unverifiable' — git present, question
  // unanswered — is an unambiguous instrument failure. Same restraint as
  // F-2218-1's absent-vs-unreadable split.
  const tree = corpusTree(root);
  if (tree === 'tree-unverifiable') return unverifiableTreeRefusal(name);
  // F-2332-1 (s2332): the OTHER way a tree is frozen. 'main' is the modal healthy
  // value, so it cannot by itself carry the freshness claim this line is making.
  //
  // SCOPED to 'main' deliberately: 'no-git' must keep falling through to the
  // permissive return below, since every legacy fixture in this family is a non-git
  // root and refusing there would red them all (F-2243-1's restraint, F-1460-1's fate).
  //
  // The two answers are tested SEPARATELY and neither by inequality, because they owe
  // DIFFERENT ACTS — 'detached' says `git checkout main`, 'unverifiable' says the
  // instrument is broken. Collapsing them into `!== 'on-branch'` would print a
  // DETACHED accusation for a git that simply did not answer, which is F-2225-1: a
  // declaration naming a state the verdict did not come from.
  const head = tree === 'main' ? headDetached(root) : 'not-asked';
  if (head === 'detached') return detachedHeadRefusal(name);
  if (head === 'unverifiable') return unverifiableHeadRefusal(name);
  if (tree !== 'linked-worktree') return null;
  const cmp = line1MatchesMain(root, statusText);
  // NOT `=== 'different'`: 'unverifiable' is the failure value, and per F-2212-1
  // a failure value must land on the side that NOTICES.
  return cmp === 'same' ? null : frozenTreeRefusal(name, cmp);
}
