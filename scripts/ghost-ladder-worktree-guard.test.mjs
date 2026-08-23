/**
 * F-2226-1 (measured and cured s2226) — `ghost-ladder-row-guard` must not clear a frozen board.
 *
 * `classifyRoot` reads THREE TRACKED corpora, so a linked worktree holds them frozen at that
 * lane's commit. Fewer goal leaves -> fewer SHIPPED verdicts -> fewer ghosts, and `--strict`
 * reds only when `ghosts.length` -- so the stale board went GREEN, byte-identically to a clean
 * one, inside a guard chained bare in `test:ledger-guards`.
 *
 * Every red arm below was proven by MANUFACTURING the defect on a scratch copy, and each
 * over-general cure is caught by the reverse control built for it. The fixture plants its ground
 * truth in the corpus that ACTUALLY goes stale (s2223's rule): a `goals.json` leaf added to main
 * AFTER the worktree branches. Shipping it via `reviews/` would prove nothing, because
 * `git ls-tree main` reaches main's reviews from inside a worktree -- that corpus is the one
 * input here that is NOT stale.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const GUARD = fileURLToPath(new URL('./ghost-ladder-row-guard.mjs', import.meta.url));
const SCRIPTS = path.dirname(GUARD);
const SHIPPED_LEAF = (status = 'merged') => JSON.stringify({
  goals: [{ id: 'foo', taskFile: 'foo.md', status, mergeHash: 'a'.repeat(40) }],
});

const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r;
};

/**
 * Build a board. `shippedOnMain` decides whether main learns the master shipped AFTER the
 * worktree branches -- that gap IS the defect under test.
 */
function board({ shippedOnMain = true, worktree = true, mainGoalsRaw = null, goals = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-wt-'));
  fs.mkdirSync(path.join(root, 'tasks'));
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# foo\n');
  // The row lands BEFORE the branch, so it is identical in both trees: the ONLY variable is
  // the shipped evidence.
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# B\n\n- 📋 **[foo]** master tasks/foo.md\n');
  if (goals) fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [] }));
  git(root, 'init', '-q', '-b', 'main', '.');
  git(root, 'config', 'user.email', 'f@f');
  git(root, 'config', 'user.name', 'f');
  git(root, 'add', '-A');
  git(root, 'commit', '-qm', 'base');

  let wt = null;
  if (worktree) {
    wt = path.join(root, 'wt');
    git(root, 'worktree', 'add', '-q', wt, '-b', 'lane', 'HEAD');
  }
  if (shippedOnMain || mainGoalsRaw !== null) {
    fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), mainGoalsRaw ?? SHIPPED_LEAF());
    git(root, 'add', '-A');
    git(root, 'commit', '-qm', 'shipped');
  }
  return { root, wt, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

const run = (script, cwd) => spawnSync(process.execPath, [script, '--strict'], { cwd, encoding: 'utf8' });

/**
 * Manufacture a variant of the guard on a scratch copy inside scripts/ (so its relative import
 * resolves). ASSERTS THE EDIT MATCHED -- a variant that silently changed nothing would go green
 * having tested nothing, which is this streak's own documented trap.
 */
function variantOf(find, replace, body) {
  const src = fs.readFileSync(GUARD, 'utf8');
  assert.ok(src.includes(find), `variant anchor not found — the guard moved: ${find.slice(0, 60)}`);
  const file = path.join(SCRIPTS, `tmp-ghost-variant-${process.pid}-${Math.abs(find.length * 31 + replace.length)}.mjs`);
  fs.writeFileSync(file, src.replace(find, replace));
  try { return body(file); } finally { fs.rmSync(file, { force: true }); }
}

test('1 — DEFECT: a frozen worktree must not clear a row main records as shipped', () => {
  const b = board();
  try {
    const r = run(GUARD, b.wt);
    assert.ok(r.stdout.trim(), 'control invalid: the arm produced nothing');
    assert.match(r.stdout, /GHOST line 3 tasks\/foo\.md/);
    assert.equal(r.status, 1);
  } finally { b.cleanup(); }
});

test('2 — the ghost found from a frozen board NAMES the frozen board as the reason', () => {
  const b = board();
  try {
    const r = run(GUARD, b.wt);
    // Assert the OBSERVABLE, not the blob: the words must be on the GHOST line, not merely
    // somewhere in stdout, or a declaration-only cure passes this arm (s2222's first draft).
    const ghost = r.stdout.split('\n').find((l) => l.startsWith('GHOST'));
    assert.ok(ghost, 'no GHOST line');
    assert.match(ghost, /main:tasks\/goals\.json records this master SHIPPED/);
    assert.match(ghost, /linked-worktree/);
  } finally { b.cleanup(); }
});

test('3 — REVERSE CONTROL: main still finds an ordinary ghost the ordinary way', () => {
  const b = board();
  try {
    const r = run(GUARD, b.root);
    assert.match(r.stdout, /GHOST line 3 tasks\/foo\.md/);
    // From main the evidence is the classifier's own, NOT the cross-check's.
    assert.match(r.stdout, /goal:tasks\/goals\.json#foo/);
    assert.equal(r.status, 1);
  } finally { b.cleanup(); }
});

test('4 — REVERSE CONTROL: a genuinely clean main board stays green and invents no ghost', () => {
  const b = board({ shippedOnMain: false });
  try {
    const r = run(GUARD, b.root);
    assert.match(r.stdout, /0 ghost ladder row/);
    assert.doesNotMatch(r.stdout, /GHOST/);
    assert.equal(r.status, 0);
  } finally { b.cleanup(); }
});

test('5 — REVERSE CONTROL: a LAWFUL worktree with no ghost must NOT be flagged or refused', () => {
  // §3.0b MANDATES gating in a detached worktree and test:ledger-guards chains this guard, so a
  // fire following the law runs it from a linked worktree as ordinary prescribed work. This arm
  // exists solely to catch the cure this fire DECLINED — refusing in any linked worktree.
  const b = board({ shippedOnMain: false });
  try {
    const r = run(GUARD, b.wt);
    assert.match(r.stdout, /0 ghost ladder row/);
    assert.doesNotMatch(r.stdout, /GHOST/);
    assert.equal(r.status, 0);
  } finally { b.cleanup(); }
});

test('6 — the corpus tree is DECLARED on the happy path, not only on failure', () => {
  const b = board({ shippedOnMain: false });
  try {
    assert.match(run(GUARD, b.root).stdout, /corpus tree: main — main shipped-evidence cross-check: not-needed/);
    assert.match(run(GUARD, b.wt).stdout, /corpus tree: linked-worktree .*cross-check: main/);
  } finally { b.cleanup(); }
});

test('7 — an unreadable main corpus REFUSES with 2 ("could not answer"), never 1 or 0', () => {
  const b = board({ mainGoalsRaw: '{not json' });
  try {
    const r = run(GUARD, b.wt);
    assert.match(r.stdout, /⛔ CANNOT VERIFY/);
    assert.equal(r.status, 2, 'a non-answer must not wear the exit code of a clean refusal');
  } finally { b.cleanup(); }
});

test('8 — a non-git fixture root is LAWFUL (git 128) and behaves exactly as before', () => {
  // The 12 legacy fixtures in ghost-ladder-row-guard.test.mjs are all non-git mkdtemp roots.
  // Treating git's "not a repository" as a failure would red every one of them.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-nogit-'));
  try {
    fs.mkdirSync(path.join(root, 'tasks'));
    fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# foo\n');
    fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), '# B\n\n- 📋 **[foo]** master tasks/foo.md\n');
    fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), SHIPPED_LEAF());
    const r = spawnSync(process.execPath, [GUARD, '--root', root, '--strict'], { encoding: 'utf8' });
    assert.match(r.stdout, /GHOST line 3/);
    assert.equal(r.status, 1);
    assert.match(r.stdout, /corpus tree: main/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('10 — a worktree whose main carries NO goals.json is ABSENT, not unverifiable', () => {
  // This arm exists because the teeth run found `mainShipped`'s git-128 branch UNREACHED: arm 8
  // exercises corpusTree's OWN 128 handling in the classifier, never this one. `mainShipped` is
  // called only when the tree is NOT main, so reaching its 128 path needs a linked worktree
  // whose main has no tasks/goals.json — a lawful board, which must therefore DECLARE and not
  // refuse. An assertion no manufactured defect ever reaches is decoration.
  const b = board({ shippedOnMain: false, goals: false });
  try {
    const r = run(GUARD, b.wt);
    assert.ok(r.stdout.trim(), 'control invalid: the arm produced nothing');
    assert.match(r.stdout, /cross-check: absent/);
    assert.doesNotMatch(r.stdout, /⛔ CANNOT VERIFY/);
    assert.equal(r.status, 0, 'a lawful board with no goals.json on main must not refuse');
  } finally { b.cleanup(); }
});

test('9 — REVERSE CONTROL: the PARTIAL cure (declare, drop the cross-check) is caught', () => {
  // The variant a weaker suite passes: it declares the tree honestly and still clears the row.
  const b = board();
  try {
    variantOf(
      'const cross = tree === \'main\' ? { source: \'not-needed\', masters: new Set() } : mainShipped(root);',
      'const cross = { source: \'not-needed\', masters: new Set() };',
      (variant) => {
        const r = run(variant, b.wt);
        assert.equal(r.status, 0, 'partial cure should clear the ghost — that is what makes it partial');
        assert.doesNotMatch(r.stdout, /GHOST/);
        // ...and it still prints a declaration, which is exactly why arm 1 and not arm 6 is
        // the one that must catch it.
        assert.match(r.stdout, /corpus tree: linked-worktree/);
      },
    );
  } finally { b.cleanup(); }
});
