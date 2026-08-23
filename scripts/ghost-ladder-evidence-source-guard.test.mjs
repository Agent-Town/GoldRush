/**
 * F-2245-1 (measured and cured s2245) — `ghost-ladder-row-guard` must not compute a ghost list
 * off shipped-evidence corpora it never checked.
 *
 * `classifyRoot` returns THREE declarations -- `reviewsSource` (F-2213-1), `goalsSource`
 * (F-2219-1) and `corpusTree` (F-2222-2). s2226 carried the THIRD across to this caller and left
 * the other two discarded, which is F-2226-1's own shape on the same import, one field over.
 * Both are permissive: lost shipped-evidence drops a master SHIPPED -> NO-TRACE, which drops a
 * GHOST, and `--strict` reds only when `ghosts.length`.
 *
 * Measured s2245 with ground truth = ONE REAL GHOST and the control asserting its own validity
 * first (F-2215-1): with `git ls-tree` broken by a PATH shim the guard printed
 * `0 ghost ladder row(s).` at rc=0, BYTE-IDENTICAL on stdout and rc to a genuinely clean board,
 * while the classifier's OWN CLI refused on the identical input with rc=1.
 *
 * Every red arm below was proven by MANUFACTURING the defect on a scratch copy, and each
 * over-general cure is caught by the reverse control built for it:
 *   refuse on `reviewsSource !== 'main'` ...... reds arm 4 (a lawful non-git root)
 *   refuse on `goalsSource === 'absent'` ...... reds arm 3 (a lawful goal-less root)
 *   declare only on failure .................. reds arm 2
 *   collapse strict 2 -> 1 ................... reds arm 6
 *   declare but do NOT refuse (the partial) ... reds arms 1 and 6
 *
 * The fixture plants the reviews-axis ground truth in the corpus that ACTUALLY diverges: a
 * review committed to main and then removed from the working tree. Shipping it only on disk
 * would prove nothing, because the fallback walks exactly that disk.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const GUARD = fileURLToPath(new URL('./ghost-ladder-row-guard.mjs', import.meta.url));

const git = (cwd, ...args) => {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${r.stderr}`);
  return r;
};

/**
 * @param {object} o
 * @param {boolean} o.ghost      plant a real ghost (a shipped master a BACKLOG row still advertises)
 * @param {'review'|'goal'} o.via which shipped-evidence corpus carries it
 * @param {boolean} o.goals      write tasks/goals.json at all
 * @param {boolean} o.repo       make it a git repo (false => the lawful non-git root)
 */
function board({ ghost = true, via = 'review', goals = true, repo = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2245-'));
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# foo — the foo slice\n');
  fs.writeFileSync(
    path.join(root, 'tasks', 'BACKLOG.md'),
    ['# BACKLOG', '', '- 📋 **[foo]** the foo slice — master tasks/foo.md', ''].join('\n'),
  );
  if (goals) {
    const leaves = ghost && via === 'goal'
      ? [{ id: 'foo', taskFile: 'foo.md', status: 'merged', mergeHash: 'a'.repeat(40) }]
      : [{ id: 'unrelated', taskFile: 'other.md', status: 'planned' }];
    fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: leaves }, null, 2));
  }
  const review = path.join(root, 'reviews', 'foo.md');
  if (ghost && via === 'review') fs.writeFileSync(review, '# review of foo\n');
  if (repo) {
    git(root, 'init', '-q', '-b', 'main');
    git(root, 'config', 'user.email', 'p@e.com');
    git(root, 'config', 'user.name', 'p');
    git(root, 'add', '-A');
    git(root, 'commit', '-q', '-m', 'board');
    // THE DIVERGENCE: main HAS the review, the working tree does not. Only this makes the
    // fallback lossy, which is the whole point of the reviews axis.
    if (ghost && via === 'review') fs.rmSync(review);
  }
  return root;
}

/** A git shim that forwards everything to the real git EXCEPT `ls-tree`, which fails. */
function brokenGitPath(root) {
  const dir = path.join(root, '.shim');
  fs.mkdirSync(dir, { recursive: true });
  const real = spawnSync('which', ['git'], { encoding: 'utf8' }).stdout.trim();
  fs.writeFileSync(
    path.join(dir, 'git'),
    `#!/bin/sh\nfor a in "$@"; do [ "$a" = "ls-tree" ] && { echo "fatal: simulated" >&2; exit 1; }; done\nexec ${real} "$@"\n`,
  );
  fs.chmodSync(path.join(dir, 'git'), 0o755);
  return `${dir}:${process.env.PATH}`;
}

function run(root, { strict = true, breakGit = false, guard = GUARD } = {}) {
  const env = { ...process.env };
  if (breakGit) env.PATH = brokenGitPath(root);
  const r = spawnSync('node', [guard, '--root', root, ...(strict ? ['--strict'] : [])], {
    cwd: root, encoding: 'utf8', env,
  });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

test('1 — an unreadable review list REFUSES instead of reporting a short ghost count', () => {
  const root = board({ ghost: true, via: 'review' });
  const healthy = run(root);
  // VALIDITY FIRST (F-2215-1): the arm is worthless unless the ghost is really there to lose.
  assert.equal(healthy.rc, 1, 'ground truth: the healthy arm must FIND the ghost');
  assert.match(healthy.out, /GHOST line 3/);

  const broken = run(root, { breakGit: true });
  assert.equal(broken.rc, 2, 'a crashed review list must refuse with 2, not green at 0');
  assert.match(broken.out, /CANNOT VERIFY/);
});

test('2 — the shipped-evidence corpora are DECLARED on the happy path, not only on failure', () => {
  const root = board({ ghost: false });
  assert.match(run(root).out, /shipped-evidence corpora: reviews main, goals goals/);
});

test('3 — an ABSENT goals.json is DECLARED and does NOT refuse (a lawful routine state)', () => {
  const root = board({ ghost: false, goals: false });
  const r = run(root);
  assert.match(r.out, /goals absent/, 'the missing corpus must be named');
  assert.notEqual(r.rc, 2, 'absence is lawful — refusing here would red on ordinary work');
});

test('4 — a lawful non-git root does NOT refuse (the walk is the honest source there)', () => {
  const root = board({ ghost: false, repo: false });
  const r = run(root);
  assert.match(r.out, /reviews worktree/);
  assert.notEqual(r.rc, 2, 'a non-git root is where all 12 legacy classifier fixtures live');
});

test('5 — REVERSE CONTROL: a genuinely clean board says nothing extra and exits 0', () => {
  const r = run(board({ ghost: false }));
  assert.equal(r.rc, 0);
  assert.match(r.out, /0 ghost ladder row\(s\)\./);
  assert.doesNotMatch(r.out, /CANNOT VERIFY/);
});

test('6 — the refusal is 2 ("could not answer"), never 1 ("answered, and it refuses")', () => {
  const root = board({ ghost: true, via: 'review' });
  const broken = run(root, { breakGit: true });
  assert.equal(broken.rc, 2);
  // 1 is what a COMPLETE answer that found ghosts returns; conflating them loses the distinction
  // drain-block-check, dry-board-probe and master-shipped-classifier all carry.
  assert.notEqual(broken.rc, 1);
});

test('7 — the refusal reaches STDOUT, where an output-classifying caller reads it (F-2211-1)', () => {
  const root = board({ ghost: true, via: 'review' });
  const broken = run(root, { breakGit: true });
  assert.match(broken.out, /CANNOT VERIFY/, 'an empty stdout reads as silence, not as a refusal');
});

test('8 — a ghost carried ONLY by goals.json is still found, and losing that corpus is declared', () => {
  const withGoals = board({ ghost: true, via: 'goal' });
  const found = run(withGoals);
  assert.equal(found.rc, 1, 'ground truth: the goals-only ghost must be found');
  assert.match(found.out, /GHOST line 3/);

  // Same board, goals corpus removed: the count silently drops to 0, so the DECLARATION is the
  // only thing that separates this from a clean board. It must say so.
  fs.rmSync(path.join(withGoals, 'tasks', 'goals.json'));
  const lost = run(withGoals);
  assert.match(lost.out, /0 ghost ladder row\(s\)\./);
  assert.match(lost.out, /goals absent/);
});
