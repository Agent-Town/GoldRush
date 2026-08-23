/**
 * F-2222-2 — the STALENESS layer of master-shipped-classifier.
 *
 * This file's discriminators grew one fire at a time, and every one of them asks
 * WHETHER a corpus could be read:
 *   F-2213-1  reviewsSource   (main's review list vs a walked working tree)
 *   F-2214-1  the CLI catch   (a crash must not exit 0 with empty stdout)
 *   F-2219-1  goalsSource     (goal leaves present vs absent)
 *   F-2222-2  the STALENESS   (present, readable, complete-looking, and WRONG)
 *
 * Three of this tool's four inputs are TRACKED files -- the masters in `tasks/`,
 * the trace dirs under `tasks/`, and `tasks/goals.json` -- so a linked worktree
 * holds all three FROZEN at whatever commit that lane sits on. A stale checkout
 * passes every test above: the files exist, they enumerate, nothing throws, the
 * sets are non-empty, and BOTH source declarations read healthy.
 *
 * MEASURED s2223 on the live board, same binary, ninety seconds apart:
 *   repo root        -> TOTAL 1125 · SHIPPED 704 · NO-TRACE  66 ->   1 candidate
 *   worktrees/lane-c -> TOTAL 1122 · SHIPPED 695 · NO-TRACE 343 -> 268 candidates
 * at identical rc=0, with `reviewsSource: "main"` (correct -- git reaches main from
 * inside a worktree) and `goalsSource: "goals"` (correct -- goals.json is tracked
 * and present there). A 268x inflation of the queue-me set, wearing two healthy
 * declarations. That is the Mistake #8 / 824k Flail polarity, and it is the largest
 * blast radius this lineage has measured: F-2219-1's was 8x, F-2213-1's was ONE.
 *
 * THE FIXTURE MAKES THE INFLATION REAL, and getting that right is the whole design:
 * the shipped evidence must live in a STALE corpus. Putting it in `reviews/` proves
 * nothing, because `git ls-tree main` reaches main's reviews from inside a worktree
 * -- that corpus is the one that is NOT stale. So the fixture ships its master via a
 * `goals.json` leaf added to main AFTER the worktree branches. From main the master
 * reads SHIPPED and there is nothing to queue; from the worktree it reads NO-TRACE
 * and the tool hands out a licence to re-derive already-merged work.
 *
 * Every red arm below was proven by manufacturing the defect on a scratch copy.
 * Arms 5-8 are REVERSE CONTROLS, and each catches exactly one over-general cure:
 *   flag every repo               -> reds 5 and 6 (an ordinary subdirectory is fine)
 *   treat git's exit 128 as a fault -> reds 7 (all 12 legacy fixtures are non-git)
 *   collapse 2 into 1             -> reds 2
 *   fix the exit code, not the banner -> reds 1 (advisory mode is the mode in use)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = path.join(HERE, 'master-shipped-classifier.mjs');

/** The OBSERVABLE, not the blob. s2222's guard first asserted that the words "LINKED
 *  WORKTREE" appeared SOMEWHERE in stdout -- and a partial cure that fixed only the
 *  exit code still passed, because the words survived in a declaration line while the
 *  BANNER named the wrong cause. These match whole banner openings instead. */
const LINKED_BANNER = /⛔ CANNOT VERIFY — DO NOT QUEUE off this run\. This root is a LINKED WORKTREE/;
const ANY_REFUSAL = /⛔ CANNOT VERIFY/;

function git(cwd, args) {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return (r.stdout || '').trim();
}

function run(cwd, args = []) {
  const r = spawnSync('node', [TOOL, ...args], { cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

const json = (res) => JSON.parse(res.out);

function seedBoard(root) {
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'alpha.md'), '# alpha — a slice\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ children: [] }, null, 2));
}

const leaf = (id, taskFile) => ({
  id,
  taskFile,
  status: 'merged',
  mergeHash: 'a'.repeat(40),
});

/**
 * A real git repo whose main worktree has SHIPPED `alpha` via a goals.json leaf, plus
 * a linked worktree whose checkout of tasks/ predates that leaf. Both boards exist,
 * both read fine, one is simply older -- the live shape exactly.
 */
function repoWithWorktree(t) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'msc-worktree-'));
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  const main = path.join(base, 'main');
  fs.mkdirSync(main, { recursive: true });
  seedBoard(main);

  git(main, ['init', '-q', '-b', 'main']);
  git(main, ['config', 'user.email', 'fire@example.com']);
  git(main, ['config', 'user.name', 'fire']);
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'base: alpha is queued, nothing ships it yet']);

  // The linked worktree branches from that STALE commit.
  const wt = path.join(base, 'lane-x');
  git(main, ['worktree', 'add', '-q', '-b', 'lane-x', wt]);

  // Only NOW does main ship alpha and gain beta, so the two boards diverge exactly
  // as the live board does: main TOTAL 2 / 0 candidates, worktree TOTAL 1 / 1.
  fs.writeFileSync(path.join(main, 'tasks', 'beta.md'), '# beta — another slice\n');
  fs.writeFileSync(
    path.join(main, 'tasks', 'goals.json'),
    JSON.stringify({ children: [leaf('alpha', 'alpha.md'), leaf('beta', 'beta.md')] }, null, 2),
  );
  git(main, ['add', '-A']);
  git(main, ['commit', '-q', '-m', 'alpha and beta ship']);

  return { main, wt };
}

/** An ordinary git repo (a MAIN worktree) holding one genuinely unshipped master. */
function plainRepo(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msc-plain-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  seedBoard(root);
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.email', 'fire@example.com']);
  git(root, ['config', 'user.name', 'fire']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'base']);
  return root;
}

/** The shape all 12 legacy tests in this family use: a non-git scratch root. */
function nonGitRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'msc-nongit-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  seedBoard(root);
  return root;
}

// ---------------------------------------------------------------------------
// THE DEFECT — a stale-but-readable board, on both observables.
// ---------------------------------------------------------------------------

test('a linked worktree REFUSES in ADVISORY mode — the mode actually in use', (t) => {
  const { main, wt } = repoWithWorktree(t);

  // CONTROL FIRST (F-2215-1). A control whose failure mode is silence cannot be told
  // from the silence it measures, so prove the fixture really does invert the licence
  // before believing anything about the banner.
  const truth = json(run(main, ['--json']));
  assert.equal(truth.verdicts.length, 2, 'control invalid — main should see both masters');
  assert.equal(truth.counts.CANDIDATES, 0, 'control invalid — main has nothing to queue');

  const stale = json(run(wt, ['--json']));
  assert.equal(stale.verdicts.length, 1, 'control invalid — the worktree should be the older, narrower board');
  assert.equal(stale.counts.CANDIDATES, 1, 'control invalid — the worktree must actually inflate the queue-me set');
  // The two healthy declarations that hide the staleness. If these ever stop reading
  // healthy the fixture has stopped reproducing the finding, and the arm below is moot.
  assert.equal(stale.reviewsSource, 'main', 'control invalid — reviewsSource should still read healthy');
  assert.equal(stale.goalsSource, 'goals', 'control invalid — goalsSource should still read healthy');

  assert.match(run(wt).out, LINKED_BANNER, 'a stale lane board handed out a queue licence with no refusal');
});

test('--strict from a linked worktree exits 2 ("could not answer"), never 1', (t) => {
  const { wt } = repoWithWorktree(t);
  assert.equal(run(wt, ['--strict']).rc, 2);
});

test('the machine channel names the tree when it is a linked worktree', (t) => {
  const { wt } = repoWithWorktree(t);
  const res = json(run(wt, ['--json']));
  assert.equal(res.corpusTree, 'linked-worktree');
  assert.match(res.corpusTreeDetail, /main/, 'the refusal must say where the real board lives');
});

test('the machine channel declares the tree ALWAYS, including the happy path', (t) => {
  const { main } = repoWithWorktree(t);
  // F-2208-1: a field that appears only on failure re-creates the ambiguity it removes.
  assert.equal(json(run(main, ['--json'])).corpusTree, 'main');
});

// ---------------------------------------------------------------------------
// REVERSE CONTROLS — each catches exactly one cure pitched a level too general.
// ---------------------------------------------------------------------------

test('REVERSE CONTROL: the MAIN worktree of a real repo does not refuse', (t) => {
  const { main } = repoWithWorktree(t);
  const res = run(main);
  assert.doesNotMatch(res.out, ANY_REFUSAL, 'flagging every git repo would refuse on the ordinary path');
  assert.equal(res.rc, 0);
});

test('REVERSE CONTROL: an ordinary SUBDIRECTORY of the main worktree does not refuse', (t) => {
  const { main } = repoWithWorktree(t);
  // `--root` names the tree; running from a subdirectory must not change the verdict.
  // A linked worktree's gitdir differs from --git-common-dir; a subdirectory's does not.
  const res = run(path.join(main, 'tasks'), ['--root', main]);
  assert.doesNotMatch(res.out, ANY_REFUSAL);
  assert.equal(json(run(path.join(main, 'tasks'), ['--root', main, '--json'])).corpusTree, 'main');
});

test('REVERSE CONTROL: a non-git scratch root still behaves exactly as the 12 legacy fixtures expect', (t) => {
  const root = nonGitRoot(t);
  // git exits 128 ("not a repository") here. That is LAWFUL, not a fault: treating it
  // as unverifiable would red every pre-existing test in this family at once.
  const res = run(root);
  assert.doesNotMatch(res.out, ANY_REFUSAL);
  assert.equal(res.rc, 0);
  assert.equal(json(run(root, ['--json'])).corpusTree, 'main');
});

test('REVERSE CONTROL: --strict on a real main board with a candidate still exits 1, not 2', (t) => {
  const root = plainRepo(t);
  // 2 outranks 1, but it must not SWALLOW it: an honest candidate on a good board is
  // still "answered, and the answer refuses".
  const res = run(root, ['--strict']);
  assert.equal(json(run(root, ['--json'])).counts.CANDIDATES, 1, 'control invalid — fixture should hold a candidate');
  assert.equal(res.rc, 1);
});
