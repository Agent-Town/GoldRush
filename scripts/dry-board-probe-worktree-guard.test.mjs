/**
 * F-2222-1 — the STALENESS layer of dry-board-probe.
 *
 * The streak that produced this guard walked one layer outward each fire, and
 * then ran out of layers to walk:
 *   F-2209-1  the EXIT CODE      (nothing exercised exitCodeFor's call site)
 *   F-2210-1  STDOUT             (advisory mode carries the verdict there)
 *   F-2211-1  the CAPTURE        (a crash classified as the verdict it died on)
 *   F-2217-1  the ENUMERATION    (the subject set is empty because the READ FAILED)
 *   F-2222-1  the STALENESS      (the read SUCCEEDED, against the wrong corpus)
 *
 * Every discriminator above keys on a corpus that is ABSENT, UNREADABLE, CRASHED
 * or EMPTY. None of them can see a corpus that is present, readable,
 * complete-looking and STALE. `tasks/done` is TRACKED, so every linked worktree
 * holds a checkout of the board frozen at whatever commit that lane sits on.
 *
 * MEASURED s2222 on the live board: worktrees/lane-c held 154 done-moves against
 * main's 1,353, and the probe printed
 *
 *     corpus tasks/done/      : read
 *     ✅ DRY — every subject resolves merged or closed. The word is earned.
 *
 * at rc=0. F-2217-1's own declaration line read `read` -- affirmatively, and
 * truthfully, because it really had read *a* tasks/done. The cure built to stop
 * the s1061 banner CERTIFIED it. s2217 named this hazard in its own handoff and
 * left it open ("a stale TRACKED subset ... the defence remains 'run it from the
 * repo root'"); this closes it.
 *
 * Every red arm below was proven by manufacturing the defect on a scratch copy.
 * Arms 4-6 are REVERSE CONTROLS. They exist because the obvious cure is one
 * level too general: anchoring the root to the main worktree would refuse from
 * an ordinary SUBDIRECTORY, break the non-git fixture roots every other suite in
 * this family depends on, and re-point a cwd-rooted tool at a tree its caller
 * did not choose -- which is exactly the near-catastrophic reverse control
 * s2221 recorded when it cured lane-usable.mjs.
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
const LINKED = 'LINKED WORKTREE';

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
 * A real git repo whose main worktree holds a DRAIN, plus a linked worktree whose
 * checkout of tasks/done is the STALE one (it predates the drain). That is the
 * live shape exactly: both dirs exist, both read fine, one is simply older.
 */
function repoWithWorktree(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-wt-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const main = path.join(base, 'main');
  fs.mkdirSync(path.join(main, 'tasks', 'done'), { recursive: true });
  stubClassifier(main);

  git(main, ['init', '-q', '-b', 'main']);
  git(main, ['config', 'user.email', 'fire@example.com']);
  git(main, ['config', 'user.name', 'fire']);
  // The STALE state: one terminal-prefixed entry, no drain.
  fs.writeFileSync(path.join(main, 'tasks', 'done', 'drained-s1-20260801-010101-x.md'), 'x');
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'base']);

  // The linked worktree branches from that stale commit.
  const wt = path.join(base, 'lane-x');
  git(main, ['worktree', 'add', '-q', '-b', 'lane-x', wt]);
  stubClassifier(wt);

  // Only NOW does main gain the drain, so main and the worktree diverge exactly
  // as the live board does.
  fs.writeFileSync(path.join(main, 'tasks', 'done', '20260801-020202-real-slice.md'), 'x');
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'a drain lands on the board']);

  return { main, wt };
}

function runProbe(cwd, args = []) {
  const r = spawnSync('node', [PROBE, ...args], { cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '' };
}

// ---------------------------------------------------------------------------
// THE DEFECT — a stale-but-readable corpus, on both observables.
// ---------------------------------------------------------------------------

test('a linked worktree never prints the earned-DRY banner in ADVISORY mode', (t) => {
  const { main, wt } = repoWithWorktree(t);

  // CONTROL FIRST (F-2215-1): the fixture really does hold a drain on the board,
  // and the worktree really is a narrower corpus. A control whose failure mode is
  // silence cannot be told from the silence it measures.
  const truth = runProbe(main);
  assert.match(truth.out, /NOT DRY/, 'control invalid — the fixture drain was not detected on main');
  assert.match(truth.out, /done-moves \(\.md\) *: 2/, 'control invalid — main should see 2 done-moves');

  const got = runProbe(wt);
  assert.match(got.out, /done-moves \(\.md\) *: 1/, 'control invalid — the worktree should be the STALE, narrower corpus');
  assert.ok(!got.out.includes(EARNED), 'declared a dry board off a STALE checkout of the board');
  // Assert the BANNER, not merely that the words appear SOMEWHERE in stdout.
  // The declaration line (arm 3) also contains "LINKED WORKTREE", so a blob-level
  // match passes while the banner still falls through to F-2217-1's "unreadable"
  // text -- a refusal that names the wrong cause and sends the reader to check
  // the wrong thing. Caught by manufacturing exactly that partial cure: it scored
  // 6/6 against the first draft of this file.
  assert.match(got.out, /⛔ CANNOT VERIFY — this is a LINKED WORKTREE, not the board\./,
    'the BANNER did not name the staleness — advisory mode reads stdout alone (F-2210-1)');
  assert.ok(!got.out.includes('was unreadable'), 'refused with the wrong diagnosis');
});

test('a linked worktree exits 2 = "could not answer" under --strict, never 0 and never 1', (t) => {
  const { wt } = repoWithWorktree(t);
  assert.equal(runProbe(wt, ['--strict']).rc, 2);
});

test('the corpus declaration names the staleness on stdout — the only channel advisory mode has', (t) => {
  const { wt } = repoWithWorktree(t);
  const got = runProbe(wt);
  assert.match(got.out, /corpus tasks\/done\/ *: LINKED WORKTREE — STALE CHECKOUT/);
  // It must also say WHERE the board is, or the reader is told they are wrong
  // without being told what to do about it.
  assert.match(got.out, /the board lives in /);
});

// ---------------------------------------------------------------------------
// REVERSE CONTROLS — these fail if the cure is one level too general.
// ---------------------------------------------------------------------------

test('REVERSE CONTROL: a genuinely dry MAIN worktree still earns the word', (t) => {
  const { main } = repoWithWorktree(t);
  fs.rmSync(path.join(main, 'tasks', 'done', '20260801-020202-real-slice.md'));
  const got = runProbe(main);
  assert.ok(got.out.includes(EARNED), 'the cure refuses on a board that genuinely is dry');
  assert.equal(runProbe(main, ['--strict']).rc, 0);
});

test('REVERSE CONTROL: an ordinary SUBDIRECTORY of the main worktree is not a linked worktree', (t) => {
  const { main } = repoWithWorktree(t);
  const sub = path.join(main, 'scripts');
  const got = runProbe(sub);
  // It has no tasks/done of its own, so F-2217-1's UNREADABLE arm is the correct
  // verdict here. What must NOT happen is being mislabelled a linked worktree --
  // that is the over-general anchor, and it would refuse from `scripts/`.
  assert.ok(!got.out.includes(LINKED), 'a subdirectory of main was mislabelled a linked worktree');
  assert.match(got.out, /UNREADABLE/);
});

test('REVERSE CONTROL: a NON-GIT fixture root is unaffected — the sibling suites depend on it', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-nongit-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  stubClassifier(root);
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-s1-20260801-010101-x.md'), 'x');

  const got = runProbe(root);
  // git exits 128 ("not a repository") here. That is LAWFUL: F-2209-1's CLI arms
  // build exactly this shape, and treating it as unverifiable would red them all.
  assert.match(got.out, /corpus tasks\/done\/ *: read/);
  assert.ok(got.out.includes(EARNED));
  assert.equal(runProbe(root, ['--strict']).rc, 0);
});
