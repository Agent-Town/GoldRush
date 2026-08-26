/**
 * F-2333-1 — the two Mistake #8 instruments must refuse a MAIN worktree whose HEAD is DETACHED.
 *
 * WHY THIS GUARD EXISTS. `corpusTree` answers WHICH TREE, and both instruments used that as a
 * proxy for IS THIS BOARD FRESH. They come apart in the MAIN worktree: a detached HEAD there
 * answers 'main' — the modal healthy value, and the value a correct run prints — while
 * `tasks/goals.json` is TRACKED and therefore frozen at that commit, exactly as in the linked
 * worktree both tools have refused since F-2223-1 / F-2222-2. This is F-2332-1's finding
 * carried into the two tools where the polarity is Mistake #8 rather than desk bookkeeping.
 *
 * MEASURED s2333, ground truth = a master that IS already shipped, control asserting its own
 * validity first (F-2215-1):
 *   drain-block-check --queue, healthy main       -> `⛔ ALREADY SHIPPED`   rc=1
 *   drain-block-check --queue, linked worktree    -> `⛔ CANNOT VERIFY`     rc=2  (already cured)
 *   drain-block-check --queue, MAIN DETACHED      -> `? UNKNOWN`            rc=0  (the defect)
 * The defect arm was BYTE-IDENTICAL on stdout, stderr AND rc to a genuinely unregistered master
 * on a healthy board. For master-shipped-classifier a master shipped by its goal leaf alone went
 * SHIPPED -> NO-TRACE and INTO the candidate set, with `reviewsSource`, `goalsSource` AND
 * `corpusTree` all reporting their modal healthy value.
 *
 * THE REVERSE CONTROLS ARE THE POINT. A cure one step too general — asking `!== 'on-branch'`, or
 * refusing on any tree that claims to be main — passes every defect arm while refusing on every
 * NON-GIT fixture root, which is most of this family's legacy suites. That guard would be
 * excused into uselessness inside a week (F-1460-1, the `cross-engine` fate), so arms 3 and 7
 * assert a non-git root still answers on its counts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const DBC = path.join(SCRIPTS, 'drain-block-check.mjs');
const MSC = path.join(SCRIPTS, 'master-shipped-classifier.mjs');

/** A repo where `foo-slice.md` IS SHIPPED, plus a commit c1 predating that fact. */
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'f2333-'));
  const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' }).trim();
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  mkdirSync(path.join(root, 'reviews'), { recursive: true });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'g@g');
  git('config', 'user.name', 'guard');

  writeFileSync(path.join(root, 'tasks/foo-slice.md'), '# foo slice\n');
  writeFileSync(path.join(root, 'tasks/goals.json'), JSON.stringify(
    { version: 1, goals: [{ id: 'r', tasks: [{ id: 'other', taskFile: 'other.md', status: 'queued' }] }] }));
  git('add', '-A'); git('commit', '-qm', 'c1');
  const c1 = git('rev-parse', 'HEAD');

  // The leaf lands SHIPPED, with a mergeHash that really is an ancestor of main.
  writeFileSync(path.join(root, 'tasks/goals.json'), JSON.stringify(
    { version: 1, goals: [{ id: 'r', tasks: [
      { id: 'other', taskFile: 'other.md', status: 'queued' },
      { id: 'foo-slice', taskFile: 'foo-slice.md', status: 'merged', mergeHash: c1 },
    ] }] }));
  git('add', '-A'); git('commit', '-qm', 'c2: foo-slice SHIPPED');
  // Untracked in every arm, so they add no differential noise.
  mkdirSync(path.join(root, 'tasks/done'), { recursive: true });
  mkdirSync(path.join(root, 'tasks/running'), { recursive: true });
  return { root, c1, git, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

/** A plain non-git directory carrying the same board — the legacy-fixture shape. */
function nonGitFixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'f2333n-'));
  mkdirSync(path.join(root, 'tasks'), { recursive: true });
  mkdirSync(path.join(root, 'reviews'), { recursive: true });
  writeFileSync(path.join(root, 'tasks/foo-slice.md'), '# foo slice\n');
  writeFileSync(path.join(root, 'tasks/goals.json'), JSON.stringify(
    { version: 1, goals: [{ id: 'r', tasks: [{ id: 'foo-slice', taskFile: 'foo-slice.md', status: 'merged', mergeHash: 'a'.repeat(40) }] }] }));
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const dbc = (cwd, args, script = DBC) => {
  const r = spawnSync('node', [script, ...args], { cwd, encoding: 'utf8', timeout: 60000 });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
};
const msc = (root, args, script = MSC) => {
  const r = spawnSync('node', [script, '--root', root, ...args], { cwd: root, encoding: 'utf8', timeout: 120000, maxBuffer: 64 << 20 });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
};

// ---------------------------------------------------------------- drain-block-check

test('1. CONTROL — on a healthy main worktree the already-shipped refusal is REACHABLE', () => {
  const f = fixture();
  try {
    const r = dbc(f.root, ['--queue', 'foo-slice.md']);
    // Asserts the arm this suite is about can actually be reached in this fixture. Without it,
    // arm 2 could pass against a refusal that arrives for some unrelated fixture reason — which
    // is exactly how this finding's own first harness was invalid (s2333 method note).
    assert.equal(r.rc, 1, `expected the shipped refusal, got rc=${r.rc}: ${r.out}${r.err}`);
    assert.match(r.out, /ALREADY SHIPPED/);
  } finally { f.cleanup(); }
});

test('2. a MAIN worktree with a DETACHED HEAD refuses instead of clearing', () => {
  const f = fixture();
  try {
    f.git('checkout', '-q', '--detach', f.c1);
    const r = dbc(f.root, ['--queue', 'foo-slice.md']);
    assert.equal(r.rc, 2, `a frozen board must refuse, not answer: ${r.out}`);
    assert.match(r.out, /CANNOT VERIFY/);
    assert.match(r.out, /DETACHED/);
    // It must NEVER read as the innocent answer it used to give.
    assert.doesNotMatch(r.out, /no goal leaf matches/);
  } finally { f.cleanup(); }
});

test('3. REVERSE CONTROL — a NON-GIT root still answers on its counts (F-1460-1)', () => {
  const f = nonGitFixture();
  try {
    const r = dbc(f.root, ['--queue', 'foo-slice.md']);
    assert.notEqual(r.rc, 2, `a non-git fixture root is LAWFUL and must not be refused: ${r.out}`);
    assert.doesNotMatch(r.out, /DETACHED/);
  } finally { f.cleanup(); }
});

test('4. a LINKED worktree still names ITS OWN cause, not detachment (F-2225-1)', () => {
  const f = fixture();
  const wt = f.root + '-wt';
  try {
    f.git('worktree', 'add', '-q', '--detach', wt, f.c1);
    const r = dbc(wt, ['--queue', 'foo-slice.md']);
    assert.equal(r.rc, 2);
    assert.match(r.out, /LINKED WORKTREE/);
    // The two refusals owe DIFFERENT ACTS — re-run from main vs `git checkout main`. A collapsed
    // cure would accuse the wrong subject here.
    assert.doesNotMatch(r.out, /HEAD is DETACHED/);
  } finally { rmSync(wt, { recursive: true, force: true }); f.cleanup(); }
});

// ---------------------------------------------------------- master-shipped-classifier

test('5. CONTROL — on a healthy main worktree the classifier is silent and ships the master', () => {
  const f = fixture();
  try {
    const r = msc(f.root, ['--json']);
    const j = JSON.parse(r.out);
    assert.equal(j.headState, 'on-branch');
    assert.equal(j.counts.CANDIDATES, 0, 'a shipped master must not be a candidate on a healthy board');
    const human = msc(f.root, []);
    assert.doesNotMatch(human.out, /CANNOT VERIFY/, 'no false alarm on the healthy path');
  } finally { f.cleanup(); }
});

test('6. the classifier DECLARES and REFUSES on a detached main worktree', () => {
  const f = fixture();
  try {
    f.git('checkout', '-q', '--detach', f.c1);
    const j = JSON.parse(msc(f.root, ['--json']).out);
    assert.equal(j.headState, 'detached');
    // Cured at the BANNER too, not merely at the exit code: the default mode is advisory and
    // there the whole verdict travels on stdout (F-2210-1). This is the arm a partial cure fails.
    assert.match(msc(f.root, []).out, /CANNOT VERIFY/);
    assert.equal(msc(f.root, ['--strict']).rc, 2, '"could not answer" is 2, not 1');
  } finally { f.cleanup(); }
});

test('7. REVERSE CONTROL — the classifier does not refuse a NON-GIT root', () => {
  const f = nonGitFixture();
  try {
    const r = msc(f.root, ['--strict']);
    assert.notEqual(r.rc, 2, `a non-git fixture root is LAWFUL and must not be refused: ${r.out}`);
    assert.doesNotMatch(r.out, /HEAD is\s*\n?\s*DETACHED/);
  } finally { f.cleanup(); }
});

test('8. headState is declared on the machine channel ALWAYS, including the happy path', () => {
  const f = fixture();
  try {
    // F-2208-1: a declaration that appears only on failure re-creates the ambiguity it removes.
    assert.ok(Object.hasOwn(JSON.parse(msc(f.root, ['--json']).out), 'headState'));
  } finally { f.cleanup(); }
});

// ------------------------------------------------------------------- the predicate

test('9. headDetached maps git 128 to no-git — the arm that keeps every legacy fixture alive', async () => {
  const { headDetached } = await import('./corpus-tree.mjs');
  const f = nonGitFixture();
  try {
    assert.equal(headDetached(f.root), 'no-git');
  } finally { f.cleanup(); }
  const g = fixture();
  try {
    assert.equal(headDetached(g.root), 'on-branch');
    g.git('checkout', '-q', '--detach', g.c1);
    assert.equal(headDetached(g.root), 'detached');
  } finally { g.cleanup(); }
});

test('10. all three copies of headDetached AGREE — the anti-drift duty F-2227-1 asks for', async () => {
  // s2333's first draft imported the shared predicate instead, which is what F-2227-1 says to
  // do. The ledger battery reddened: guard fixtures copy these two files by a FIXED LIST and
  // must not copy the whole scripts/ tree (F-2284-1), so a sibling import is
  // ERR_MODULE_NOT_FOUND in 19 of them. Both files are therefore deliberately self-contained —
  // as their own `corpusTree` copies already were. The property F-2227-1 actually protects is
  // that the copies do not DRIFT, so assert that directly, behaviourally, on every state that
  // distinguishes them. Same shape as desk-lock-predicate-guard's four-way agreement check.
  const { headDetached: shared } = await import('./corpus-tree.mjs');

  const nonGit = nonGitFixture();
  const f = fixture();
  try {
    // The instruments' copies are private, so ask them through the only observable a caller
    // has: the behaviour each state produces. A drifted copy changes one of these verdicts.
    assert.equal(shared(nonGit.root), 'no-git');
    assert.equal(shared(f.root), 'on-branch');

    assert.notEqual(dbc(nonGit.root, ['--queue', 'foo-slice.md']).rc, 2, 'dbc copy drifted on no-git');
    assert.notEqual(msc(nonGit.root, ['--strict']).rc, 2, 'msc copy drifted on no-git');

    assert.equal(JSON.parse(msc(f.root, ['--json']).out).headState, 'on-branch');
    f.git('checkout', '-q', '--detach', f.c1);
    assert.equal(shared(f.root), 'detached');
    assert.equal(JSON.parse(msc(f.root, ['--json']).out).headState, 'detached', 'msc copy drifted on detached');
    assert.equal(dbc(f.root, ['--queue', 'foo-slice.md']).rc, 2, 'dbc copy drifted on detached');
  } finally { nonGit.cleanup(); f.cleanup(); }
});
