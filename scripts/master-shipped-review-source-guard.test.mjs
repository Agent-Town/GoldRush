// F-2213-1 — master-shipped-classifier must never substitute a DIFFERENT evidence corpus in
// silence.
//
// `mainReviews()` asks git what MAIN has shipped. Its old bare `catch` fell back to walking the
// working tree's `reviews/` -- a different question, answered silently. Measured s2213 the two
// arms agree exactly on main (955/955) but the walk is 32 paths SHORT in worktrees/lane-a and
// gains nothing, so the substitution loses SHIPPED evidence one-directionally and drops masters
// into `CANDIDATES`: the Mistake #8 polarity (the 824k Flail), in the sibling of the very arm
// F-2212-1 cured one file over.
//
// The fallback is nonetheless load-bearing: all 12 tests in master-shipped-classifier.test.mjs
// build a non-git mkdtemp root, so `main` does not resolve and the walk IS the truthful source
// there. The cure is therefore a DISCRIMINATOR, and these arms pin both directions of it.
//
// Every red arm below was proven by manufacturing the defect on a throwaway repo -- a passing
// guard never executes its violation path, so its green is no evidence about its red.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

import { classifyRoot } from './master-shipped-classifier.mjs';

const git = (cwd, ...args) => spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });

// A real repo whose `main` carries a review that ships the master, and whose WORKING TREE has
// had that review removed. The two corpora therefore disagree by exactly one file -- which is
// the whole finding in miniature.
function repoFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2213-guard-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  spawnSync('git', ['init', '-q', '-b', 'main', root], { encoding: 'utf8' });
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# a master with no banner\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [] }));
  fs.writeFileSync(path.join(root, 'reviews', 'foo.md'), 'evidence\n');
  git(root, 'add', '-A');
  git(root, '-c', 'user.email=a@b', '-c', 'user.name=n', 'commit', '-qm', 'init');
  // main still has reviews/foo.md; the working tree no longer does.
  fs.rmSync(path.join(root, 'reviews', 'foo.md'));
  return root;
}

// Put a shim `git` first on PATH for the duration of one call.
function withGit(script, run) {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 's2213-bin-'));
  fs.writeFileSync(path.join(bin, 'git'), script);
  fs.chmodSync(path.join(bin, 'git'), 0o755);
  const saved = process.env.PATH;
  process.env.PATH = `${bin}:${saved}`;
  try {
    return run();
  } finally {
    process.env.PATH = saved;
    fs.rmSync(bin, { recursive: true, force: true });
  }
}

test('CONTROL: with healthy git the corpus is MAIN, and main ships the master', (t) => {
  const root = repoFixture(t);
  const result = classifyRoot(root);
  assert.equal(result.reviewsSource, 'main');
  assert.equal(result.reviewsOk, true);
  assert.equal(result.verdicts[0].verdict, 'SHIPPED');
  assert.equal(result.counts.CANDIDATES, 0);
});

test('F-2213-1: a broken ls-tree is NOT silently answered by the working tree', (t) => {
  const root = repoFixture(t);
  // rev-parse still works, so `main` demonstrably exists; only the listing fails. This is the
  // documented trigger shape: maxBuffer/load kills the big call and leaves the small one alone.
  const result = withGit(
    '#!/bin/sh\nfor a in "$@"; do [ "$a" = "ls-tree" ] && exit 128; done\nexec /usr/bin/git "$@"\n',
    () => classifyRoot(root),
  );
  assert.equal(result.reviewsOk, false, 'a failed ls-tree must not report ok');
  assert.equal(result.reviewsSource, 'unverifiable');
  // Pre-cure this returned the walk silently, so the master fell to NO-TRACE and became a
  // CANDIDATE with nothing said. The verdict may still degrade -- what must not happen is that
  // it degrades WITHOUT the corpus being marked unverifiable.
  assert.equal(result.verdicts[0].verdict, 'NO-TRACE');
  assert.equal(result.counts.CANDIDATES, 1);
});

test('F-2213-1: an unspawnable git is a crash, not "no main here"', (t) => {
  const root = repoFixture(t);
  // The discriminator must not be satisfiable by breaking git ENTIRELY -- that would just move
  // the silent substitution one call earlier, from ls-tree to rev-parse.
  const result = withGit('#!/bin/sh\nexit 3\n', () => classifyRoot(root));
  assert.equal(result.reviewsOk, false);
  assert.equal(result.reviewsSource, 'unverifiable');
});

test('REVERSE CONTROL: a non-git root still walks the working tree, silently and OK', (t) => {
  // git exits 128 here (measured s2213: "not a git repository"). This is where all 12 existing
  // guard tests live; a cure that refuses on ANY non-zero exit would red every one of them.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2213-plain-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# a master with no banner\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [] }));
  fs.writeFileSync(path.join(root, 'reviews', 'foo.md'), 'evidence\n');
  const result = classifyRoot(root);
  assert.equal(result.reviewsOk, true, 'a non-git root is not a failure');
  assert.equal(result.reviewsSource, 'worktree');
  assert.equal(result.verdicts[0].verdict, 'SHIPPED', 'the walk must still ship the master');
});

test('REVERSE CONTROL: a repo with no `main` branch is also legitimate, not unverifiable', (t) => {
  // rev-parse exits 1 with empty stderr here (measured s2213) -- indistinguishable from a
  // verdict by exit code alone, which is exactly why the codes are enumerated rather than
  // lumped into `status !== 0`.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2213-nomain-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  spawnSync('git', ['init', '-q', '-b', 'other', root], { encoding: 'utf8' });
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'foo.md'), '# a master with no banner\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({ goals: [] }));
  fs.writeFileSync(path.join(root, 'reviews', 'foo.md'), 'evidence\n');
  const result = classifyRoot(root);
  assert.equal(result.reviewsOk, true);
  assert.equal(result.reviewsSource, 'worktree');
  assert.equal(result.verdicts[0].verdict, 'SHIPPED');
});

test('F-2213-1: the 1 MiB default maxBuffer is a growth-keyed trap, and is not in force', (t) => {
  // Measured s2213: the live `ls-tree ... -- reviews` output is 152,901 bytes over 3,081 paths,
  // 14.6% of node's 1 MiB execFileSync default, and it grows by a line every drain. Under the
  // default this call throws once the corpus outgrows it -- silently, into the walk. Here the
  // shim emits ~1.5 MiB of listing to prove the ceiling is no longer near.
  const root = repoFixture(t);
  const big = '#!/bin/sh\n'
    + 'for a in "$@"; do\n'
    + '  if [ "$a" = "ls-tree" ]; then\n'
    + '    i=0; while [ $i -lt 12000 ]; do\n'
    + '      echo "reviews/pad-$i-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.md"\n'
    + '      i=$((i+1)); done\n'
    + '    echo "reviews/foo.md"; exit 0\n'
    + '  fi\n'
    + 'done\n'
    + 'exec /usr/bin/git "$@"\n';
  const result = withGit(big, () => classifyRoot(root));
  assert.equal(result.reviewsOk, true, 'a >1 MiB listing must not degrade the corpus');
  assert.equal(result.reviewsSource, 'main');
  assert.equal(result.verdicts[0].verdict, 'SHIPPED');
});
