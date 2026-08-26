/**
 * F-2334-1 — the DETACHED-HEAD half of dry-board-probe's staleness layer.
 *
 * The ladder this file sits at the end of, each rung cured by the fire that the
 * previous cure made reachable:
 *   F-2209-1  the EXIT CODE      (nothing exercised exitCodeFor's call site)
 *   F-2210-1  STDOUT             (advisory mode carries the verdict there)
 *   F-2211-1  the CAPTURE        (a crash classified as the verdict it died on)
 *   F-2217-1  the ENUMERATION    (the subject set is empty because the READ FAILED)
 *   F-2222-1  the STALENESS      (the read SUCCEEDED, against a LINKED worktree)
 *   F-2334-1  the OTHER STALENESS (the read succeeded, against a DETACHED main)
 *
 * F-2222-1 asked WHICH TREE and used the answer as a proxy for IS THIS CORPUS
 * FRESH. The two come apart in the MAIN worktree: a detached HEAD there reports
 * 'main' -- the modal healthy value, and the value a correct run prints -- while
 * `tasks/done` is TRACKED and therefore frozen at that bare commit exactly as it
 * is in the linked worktree this tool already refuses.
 *
 * MEASURED s2334, ground truth = a board holding ONE REAL DRAIN, the control
 * asserting its own validity first (F-2215-1):
 *   attached main branch           -> "⛔ NOT DRY — 1 undrained done-move(s)"
 *   SAME repo, main worktree
 *   DETACHED one commit back       -> "✅ DRY ... The word is earned."   rc=0
 *   REVERSE CONTROL, genuinely dry -> "✅ DRY ... The word is earned."   rc=0
 * The defect arm and the genuinely-dry board were BYTE-IDENTICAL: 774 B of stdout
 * each, the same banner, the same rc in BOTH modes, and F-2217-1's own declaration
 * line reading `read` -- affirmatively, and truthfully, because it really had read
 * *a* tasks/done.
 *
 * ⚠️ WHY THE SIBLING'S CURE CANNOT COVER THIS ONE. s2333 made drain-block-check
 * REFUSE from a detached tree, and F-2240-1 already teaches this consumer to treat
 * that refusal as loud -- so it is tempting to call this covered. It is not: the
 * freeze narrows the SUBJECT SET first (the derived convention start moves with the
 * corpus), so `subjects` empties, the child is NEVER SPAWNED, and its refusal
 * cannot fire. A cure in the classifier is unreachable when the defect is in the
 * enumeration. Arm 2 pins exactly that by asserting zero subjects alongside the
 * refusal.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT in the prescribed invocation.
 * §2F says the repo root on an attached main, and every DRY declaration this streak
 * has made was TRUE -- verified, not assumed (the live board reads byte-identically
 * before and after this cure, 6/6 channels). What earns it a cure is the DIRECTION:
 * the s1061 banner, an affirmative clearance, in the tool §2F names as the FIRST
 * ACT of a dry-board fire, in the default mode.
 *
 * Arms 4-7 are REVERSE CONTROLS. They exist because two over-general cures pass
 * every defect arm: refusing on any non-'on-branch' HEAD (which reds every non-git
 * fixture root F-2209-1's CLI arms build), and collapsing this diagnosis into the
 * linked-worktree one (which sends the reader to `git checkout main` when the real
 * owed act is to re-run from the board, or the reverse).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROBE = path.join(HERE, 'dry-board-probe.mjs');

const EARNED = 'The word is earned';
const DETACHED_BANNER = /⛔ CANNOT VERIFY — this is the main worktree, but its HEAD is DETACHED\./;

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return (r.stdout || '').trim();
}

/** Stub the classifier so the fixture owns its own verdict and the live corpus is never read. */
function stubClassifier(root) {
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'scripts', 'drain-block-check.mjs'),
    'console.log("✅ CLEAR — nothing blocks this drain");\n',
  );
}

/**
 * A real git repo whose board gains a DRAIN in its second commit, so detaching to
 * the first commit reproduces the live shape exactly: the dir exists, reads fine,
 * and is simply older. Returns the pre-drain sha.
 */
function repoWithDrain(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-detached-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const main = path.join(base, 'main');
  fs.mkdirSync(path.join(main, 'tasks', 'done'), { recursive: true });
  stubClassifier(main);

  git(main, ['init', '-q', '-b', 'main']);
  git(main, ['config', 'user.email', 'fire@example.com']);
  git(main, ['config', 'user.name', 'fire']);
  fs.writeFileSync(path.join(main, 'tasks', 'done', 'drained-s1-20260801-010101-x.md'), 'x');
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'base']);
  const stale = git(main, ['rev-parse', 'HEAD']);

  fs.writeFileSync(path.join(main, 'tasks', 'done', '20260801-020202-real-slice.md'), 'x');
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'a drain lands on the board']);

  return { base, main, stale };
}

function runProbe(cwd, args = []) {
  const r = spawnSync('node', [PROBE, ...args], { cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '' };
}

// ---------------------------------------------------------------------------
// THE DEFECT — a frozen-but-readable MAIN worktree, on both observables.
// ---------------------------------------------------------------------------

test('a DETACHED main worktree never prints the earned-DRY banner in ADVISORY mode', (t) => {
  const { main, stale } = repoWithDrain(t);

  // CONTROL FIRST (F-2215-1): the fixture really does hold a drain, and the
  // detached checkout really is the narrower corpus. A control whose failure mode
  // is silence cannot be told from the silence it measures.
  const truth = runProbe(main);
  assert.match(truth.out, /NOT DRY/, 'control invalid — the fixture drain was not detected on main');
  assert.match(truth.out, /done-moves \(\.md\) *: 2/, 'control invalid — main should see 2 done-moves');

  git(main, ['checkout', '-q', '--detach', stale]);
  const got = runProbe(main);
  assert.match(got.out, /done-moves \(\.md\) *: 1/, 'control invalid — the detached tree should be the narrower corpus');
  assert.ok(!got.out.includes(EARNED), 'declared a dry board off a DETACHED checkout of the board');
  // Assert the BANNER, not merely that the words appear SOMEWHERE in stdout. The
  // declaration line (arm 3) also contains "DETACHED HEAD", so a blob-level match
  // passes while the banner still falls through to F-2217-1's "unreadable" text --
  // a refusal that names the wrong cause and sends the reader to check the wrong
  // thing. That exact partial cure scored 6/6 against the first draft of the
  // sibling F-2222-1 suite, which is why this is asserted here from the start.
  assert.match(got.out, DETACHED_BANNER,
    'the BANNER did not name the detachment — advisory mode reads stdout alone (F-2210-1)');
  assert.ok(!got.out.includes('was unreadable'), 'refused with the wrong diagnosis');
  assert.ok(!got.out.includes('LINKED WORKTREE'), 'a detached MAIN worktree is not a linked worktree');
});

test('the refusal fires even though ZERO subjects were classified — the enumeration, not the classifier', (t) => {
  const { main, stale } = repoWithDrain(t);
  git(main, ['checkout', '-q', '--detach', stale]);
  const got = runProbe(main);
  // This is the arm that pins WHY the sibling's s2333 cure cannot cover this one:
  // with no subjects the child is never spawned, so no refusal of its can fire.
  assert.match(got.out, /SUBJECTS to classify *: 0/,
    'fixture no longer reproduces the narrowing — the arm below would prove nothing');
  assert.match(got.out, DETACHED_BANNER, 'refused only when a subject happened to be classified');
});

test('a DETACHED main worktree exits 2 = "could not answer" under --strict, never 0 and never 1', (t) => {
  const { main, stale } = repoWithDrain(t);
  git(main, ['checkout', '-q', '--detach', stale]);
  assert.equal(runProbe(main, ['--strict']).rc, 2);
});

test('the corpus declaration names the detachment on stdout — the only channel advisory mode has', (t) => {
  const { main, stale } = repoWithDrain(t);
  git(main, ['checkout', '-q', '--detach', stale]);
  const got = runProbe(main);
  assert.match(got.out, /corpus tasks\/done\/ *: DETACHED HEAD — STALE CHECKOUT/);
});

// ---------------------------------------------------------------------------
// REVERSE CONTROLS — these fail if the cure is one level too general.
// ---------------------------------------------------------------------------

test('REVERSE CONTROL: a genuinely dry ATTACHED main worktree still earns the word', (t) => {
  const { main } = repoWithDrain(t);
  fs.rmSync(path.join(main, 'tasks', 'done', '20260801-020202-real-slice.md'));
  const got = runProbe(main);
  assert.ok(got.out.includes(EARNED), 'the cure refuses on a board that genuinely is dry');
  assert.match(got.out, /corpus tasks\/done\/ *: read/);
  assert.equal(runProbe(main, ['--strict']).rc, 0);
});

test('REVERSE CONTROL: a NON-GIT fixture root is unaffected — the sibling suites depend on it', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-detached-nongit-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  stubClassifier(root);
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-s1-20260801-010101-x.md'), 'x');

  const got = runProbe(root);
  // git exits 128 ("not a repository"). corpusTree maps that onto 'main' on
  // purpose, so headDetached must stay PERMISSIVE here or F-2209-1's CLI arms all
  // red. This is the over-general cure's tripwire (F-2243-1's restraint).
  assert.match(got.out, /corpus tasks\/done\/ *: read/);
  assert.ok(got.out.includes(EARNED));
  assert.equal(runProbe(root, ['--strict']).rc, 0);
});

test('REVERSE CONTROL: a LINKED worktree keeps its OWN diagnosis — the two are not collapsed', (t) => {
  const { main } = repoWithDrain(t);
  const wt = path.join(path.dirname(main), 'lane-x');
  git(main, ['worktree', 'add', '-q', '-b', 'lane-x', wt]);
  stubClassifier(wt);

  const got = runProbe(wt);
  // A linked worktree checked out on a BRANCH is not detached. It must still be
  // refused, and refused as a LINKED WORKTREE: the two owe different acts -- that
  // one says "re-run from the board", this one says "git checkout main".
  assert.match(got.out, /⛔ CANNOT VERIFY — this is a LINKED WORKTREE, not the board\./);
  assert.ok(!got.out.includes('HEAD is DETACHED'), 'a linked worktree on a branch was reported as detached');
  assert.equal(runProbe(wt, ['--strict']).rc, 2);
});

test('ORDERING: a DETACHED LINKED worktree is still diagnosed as LINKED — corpusTree answers first', (t) => {
  const { main, stale } = repoWithDrain(t);
  const wt = path.join(path.dirname(main), 'lane-y');
  git(main, ['worktree', 'add', '-q', '--detach', wt, stale]);
  stubClassifier(wt);

  const got = runProbe(wt);
  // Both conditions hold at once here. WHICH TREE is the more actionable answer --
  // "you are in a lane" tells the reader where the board is; "your HEAD is
  // detached" would send them to `git checkout main` inside a lane, which is wrong.
  assert.match(got.out, /⛔ CANNOT VERIFY — this is a LINKED WORKTREE, not the board\./);
  assert.ok(!got.out.includes('HEAD is DETACHED'), 'the tree question must be answered before the HEAD question');
});

// ---------------------------------------------------------------------------
// ANTI-DRIFT — the property F-2227-1 actually protects.
// ---------------------------------------------------------------------------

test('this file\'s headDetached copy AGREES with corpus-tree.mjs\'s, code-for-code', () => {
  // F-2227-1 measured that independent copies of one predicate is HOW it drifts,
  // and its cure is "import the sibling". s2334 TRIED that and the battery refuted
  // it: dry-board-bucket-verdict-guard.test.mjs:62-65 relocates this file to a BARE
  // temp dir as variant.mjs, so any relative import dies ERR_MODULE_NOT_FOUND.
  //
  // The constraint is therefore NOT "fixtures copy by a fixed list" (F-2284-1 is
  // one instance of it) but the wider: A FILE WHOSE GUARDS RELOCATE IT CANNOT CARRY
  // RELATIVE IMPORTS. With the import off the table, anti-drift is discharged the
  // way s2333 discharged it for the other two instruments -- by asserting the
  // copies AGREE. That is the property F-2227-1 actually protects.
  const body = (src) => {
    const m = src.match(/function headDetached\(root\) \{([\s\S]*?)\n\}/);
    assert.ok(m, 'headDetached not found — the anti-drift arm has lost its subject');
    return m[1]
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, '').trim())   // comments differ by design
      .filter(Boolean)
      .join('\n');
  };
  const mine = body(fs.readFileSync(PROBE, 'utf8'));
  const shared = body(fs.readFileSync(path.join(HERE, 'corpus-tree.mjs'), 'utf8'));
  assert.ok(mine.length > 0, 'control invalid — extracted an empty body');
  assert.equal(mine, shared,
    'this copy of headDetached has DRIFTED from corpus-tree.mjs — that drift is the whole hazard');
});
