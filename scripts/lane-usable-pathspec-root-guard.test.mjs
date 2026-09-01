// F-2221-1 (s2221) — THE RUN-SURFACE PANEL MUST NEVER READ AN UNMATCHED PATHSPEC
// AS "byte-identical to main".
//
// `lane-usable.mjs` is the instrument §2E MANDATES before any refill, and the
// LANE-SAFETY LAW exists because refilling over unmerged work destroyed w1-03 and
// polish-02 (Mistake #2, the Reset Massacre). Two of its git calls — and ONLY two
// — carry a PATHSPEC:
//
//     git diff --name-only <branch> main -- src e2e functions scripts …   (surfaceDrift)
//     git diff --name-only <branch> main -- tasks                          (ledgerDrift)
//
// A pathspec is resolved relative to the process CWD, while `--name-only` OUTPUT
// is repo-relative. That asymmetry is the entire defect: from any subdirectory the
// pathspecs match nothing, git exits 0 WITH EMPTY STDERR, both functions return
// [], and report() prints
//
//     "✅ …but NONE of it is run-surface: src/ e2e/ functions/ scripts/ and the
//      configs are byte-identical to main. The gap is bookkeeping only — nothing
//      here can stop a task running."
//
// — an affirmative all-clear asserting a comparison it never made. It also
// SUPPRESSES the package.json warning at the drift branch, which the F-1343-2
// comment in the subject calls "a false-green hazard invisible to every existing
// probe". This is the streak's usual empty-corpus shape (F-2217-1, F-2218-1) with
// the worst polarity yet: prior instances narrowed to empty and printed the SHAPE
// of good news; this one narrows to empty and prints good news IN WORDS.
//
// WHY EVERY CENSUS IN THE LINEAGE MISSED IT. s2212–s2219 are keyed on a `catch`
// (nothing throws here), s2218 on a guard-keyed empty (`existsSync ? … : []` —
// there is no guard here either), and s2220 on the cwd — but s2220's own proposed
// key was the TOKEN `process.cwd()`. Measured s2221: the two files F-2220-1 cured
// contained ZERO occurrences of that token BEFORE the cure, and across all 326
// non-test scripts the token appears in 7.3% of files with an implicit corpus root
// versus 8.7% of the rest. The token tracks an author who THOUGHT about the root;
// the defect is the DEFAULT, which is written by saying nothing at all.
//
// Measured before the cure, ground truth = 15 lanes whose run-surface HAS moved:
//     repo root                        -> 15 drift sections, 0 greens, rc=0, 422 lines
//     scripts/ | src/ | docs/ | assets -> 0 drift sections, 15 greens, rc=0, 272 lines
//     a subdirectory of a LANE WORKTREE-> 0 drift sections, 15 greens, rc=0, 272 lines
// Same rc, no stderr: the machine channel cannot tell the two apart, and the human
// channel is inverted rather than merely quiet.
//
// SEVERITY, STATED HONESTLY: LATENT in the prescribed invocation. §2E says to run
// this from the repo root, the VERDICT WORD and the EXIT CODE are cwd-invariant
// (both measured — lane-a reads HOLDS byte-identically from three cwds), and the
// safety question "would a reset LOSE anything?" was never wrong. What inverts is
// the advisory panel a fire reads to decide whether a lane's gates can be trusted.
//
// EVERY RED ARM BELOW WAS PROVEN BY MANUFACTURING THE DEFECT, never by reading.
// THE REVERSE CONTROL MATTERS MOST: the obvious over-general cure — forcing
// `cwd: repoRoot()` inside git() itself, AFTER the `...opts` spread — passes every
// defect arm and is CATASTROPHIC, because dirt() and cure() pass their own
// `cwd: <lane worktree>` and would be silently re-pointed at MAIN. `cure()` runs
// `reset --hard main`. That is the Reset Massacre with a green suite attesting to
// it, so arm 6 asserts worktree scoping survives.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'lane-usable.mjs');
const RESIDUE = path.join(HERE, 'lane-residue.mjs');

const GREEN = /NONE of it is run-surface/;
const DRIFT = /run-surface drift:/;
const LEDGER = /ledger drift:/;

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, GIT_AUTHOR_NAME: 'g', GIT_AUTHOR_EMAIL: 'g@x', GIT_COMMITTER_NAME: 'g', GIT_COMMITTER_EMAIL: 'g@x' },
  });
}

/**
 * A fixture repo carrying one lane whose run-surface AND ledger have both moved on
 * main. The lane is ahead=0 / behind=1, which is the ONLY state that reaches the
 * drift panel: report() attaches it to USABLE with behind > 0.
 *
 * `dirtyLane` makes the lane worktree dirty instead, which is the state arm 6 needs
 * — a DIRTY verdict proves dirt() is still reading the worktree and not main.
 */
function fixture(t, { dirtyLane = false, ledgerOnly = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2221-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  git(['init', '-b', 'main', '-q', root], os.tmpdir());
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.writeFileSync(path.join(root, 'README.md'), 'base\n');
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), 'base\n');
  git(['add', 'README.md', 'tasks/BACKLOG.md'], root);
  git(['commit', '-qm', 'base'], root);

  git(['branch', 'lane/x'], root);
  git(['worktree', 'add', '-q', path.join(root, 'worktrees', 'lane-x'), 'lane/x'], root);

  if (dirtyLane) {
    fs.writeFileSync(path.join(root, 'worktrees', 'lane-x', 'README.md'), 'lane hand-edit\n');
    return root;
  }

  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'note.md'), 'keeps docs/ a real dir\n');
  fs.writeFileSync(path.join(root, 'tasks', 'ledger.md'), 'moved\n');

  // report() calls ledgerDrift ONLY when surfaceDrift came back empty, so the two
  // pathspecs cannot be exercised by one fixture. `ledgerOnly` moves main on tasks/
  // and docs/ alone — docs/ is excluded from RUN_SURFACE BY DESIGN (F-1343-2), so
  // the surface stays clean and the ledger branch becomes reachable.
  const staged = ['tasks/ledger.md', 'docs/note.md'];
  if (!ledgerOnly) {
    fs.writeFileSync(path.join(root, 'src', 'foo.ts'), 'export const foo = 1\n');
    staged.push('src/foo.ts');
  }
  git(['add', ...staged], root);
  git(['commit', '-qm', 'main moves ahead'], root);
  return root;
}

/**
 * A runnable copy of the subject with `edit` applied to its source. lane-residue.mjs
 * travels with it because the subject imports it relatively; both land OUTSIDE the
 * repo under test, so no arm can leave scratch on a run surface (F-1665-1).
 */
function variantOf(t, edit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f2221-v-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.copyFileSync(RESIDUE, path.join(dir, 'lane-residue.mjs'));
  const src = fs.readFileSync(SUBJECT, 'utf8');
  const out = edit(src);
  assert.notEqual(out, src, 'variant edit matched nothing — the arm would silently test the cured file');
  const p = path.join(dir, 'lane-usable.mjs');
  fs.writeFileSync(p, out);
  return p;
}

function run(script, cwd, args = ['--all']) {
  const r = spawnSync(process.execPath, [script, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}

// The pre-cure source: both pathspec'd calls with no cwd option at all.
const strippedAnchor = (src) =>
  src
    .replace("git(['diff', '--name-only', branch, 'main', '--', ...RUN_SURFACE], { cwd: repoRoot() })", "git(['diff', '--name-only', branch, 'main', '--', ...RUN_SURFACE])")
    .replace("git(['diff', '--name-only', branch, 'main', '--', 'tasks'], { cwd: repoRoot() })", "git(['diff', '--name-only', branch, 'main', '--', 'tasks'])");

test('VALIDITY + arm 1: at the repo root the cured subject reports the drift that exists', (t) => {
  const root = fixture(t);
  const r = run(SUBJECT, root);
  assert.equal(r.rc, 0, r.err);
  assert.ok(r.out.length > 0, 'subject produced no stdout — the arm did not really run');
  assert.match(r.out, DRIFT, 'main moved src/foo.ts; the panel must say so');
  assert.match(r.out, /src\/foo\.ts/);
  assert.doesNotMatch(r.out, GREEN, 'the all-clear must not appear when the run surface HAS moved');
});

test('arm 2: the cured subject is byte-identical from a subdirectory', (t) => {
  const root = fixture(t);
  const atRoot = run(SUBJECT, root);
  for (const sub of ['src', 'docs', 'tasks', path.join('worktrees', 'lane-x')]) {
    const r = run(SUBJECT, path.join(root, sub));
    assert.equal(r.rc, atRoot.rc, `rc drifted from ${sub}`);
    assert.equal(r.out, atRoot.out, `stdout drifted from ${sub} — the corpus narrowed with the cwd`);
  }
});

test('arm 3 (THE DEFECT): pre-cure, a subdirectory turns real drift into the all-clear', (t) => {
  const root = fixture(t);
  const pre = variantOf(t, strippedAnchor);

  const atRoot = run(pre, root);
  assert.match(atRoot.out, DRIFT, 'control: pre-cure at the ROOT is still correct, so the arm isolates cwd alone');

  const fromSub = run(pre, path.join(root, 'src'));
  assert.equal(fromSub.rc, atRoot.rc, 'the machine channel cannot tell them apart — that is the finding');
  assert.match(fromSub.out, GREEN, 'pre-cure from a subdirectory prints the affirmative all-clear');
  assert.doesNotMatch(fromSub.out, DRIFT, 'pre-cure from a subdirectory loses the drift section entirely');
});

test('arm 4: the ledger pathspec is anchored too — fix the CLASS, not the instance', (t) => {
  const root = fixture(t, { ledgerOnly: true });
  // Isolate ledgerDrift: anchor stays on surfaceDrift, is stripped from ledgerDrift only.
  const pre = variantOf(t, (src) =>
    src.replace("git(['diff', '--name-only', branch, 'main', '--', 'tasks'], { cwd: repoRoot() })", "git(['diff', '--name-only', branch, 'main', '--', 'tasks'])"));

  const curedFromSub = run(SUBJECT, path.join(root, 'docs'));
  assert.match(curedFromSub.out, LEDGER, 'cured: tasks/ledger.md moved, so the ledger panel must appear');
  assert.match(curedFromSub.out, /tasks\/ledger\.md/);

  const preFromSub = run(pre, path.join(root, 'docs'));
  assert.ok(preFromSub.out.length > 0, 'validity: the pre-cure arm really ran');
  assert.match(preFromSub.out, GREEN, 'control: the surface anchor is intact, so the all-clear is correct here');
  assert.doesNotMatch(preFromSub.out, LEDGER, 'pre-cure: the tasks/ pathspec matched nothing from a subdirectory');
});

test('arm 5: the anchor is repoRoot(), not the script directory', (t) => {
  const root = fixture(t);
  // import.meta.url is the WRONG anchor here: this file diffs REFS and needs a valid
  // repo root. A copy living outside the repo under test must still be correct when
  // run from inside it — which it can only be by resolving the root from git.
  const copy = variantOf(t, (src) => `${src}\n// s2221 arm 5: relocated copy, semantics unchanged\n`);
  const fromRoot = run(copy, root);
  const fromSub = run(copy, path.join(root, 'src'));
  assert.equal(fromRoot.rc, 0, fromRoot.err);
  assert.match(fromRoot.out, DRIFT);
  assert.equal(fromSub.out, fromRoot.out, 'a relocated copy must resolve the root from git, not from its own path');
});

test('REVERSE CONTROL, arm 6: curing inside git() must not re-point dirt()/cure() at main', (t) => {
  const root = fixture(t, { dirtyLane: true });

  const cured = run(SUBJECT, root);
  assert.match(cured.out, /tracked-dirt=1/, 'validity: the fixture lane really is dirty');
  assert.match(cured.out, /DIRTY/, 'a hand-edited lane worktree must read DIRTY');

  // The over-general cure: force the root for EVERY git call, after the opts spread,
  // so dirt()'s and cure()'s own `cwd: <worktree>` is silently overridden.
  //
  // Resolved WITHOUT repoRoot(): routing git() through repoRoot() recurses (repoRoot
  // calls tryGit calls git calls repoRoot…) and the variant dies on a stack overflow.
  // That crash would make this arm pass for the WRONG REASON — a control whose failure
  // mode is silence cannot be told from the silence it measures (F-2215-1) — so the
  // variant below resolves the root once, up front, and genuinely mis-scopes.
  const overGeneral = variantOf(t, (src) =>
    src.replace(
      "return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts })",
      "const forced = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()\n" +
        "  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts, cwd: forced })"));

  const broken = run(overGeneral, root);
  assert.equal(broken.rc, cured.rc, 'validity: the over-general arm ran to the same exit code — it did not crash');
  assert.ok(broken.out.length > 0, 'validity: the over-general arm produced output — it really ran');
  assert.match(broken.out, /lane-x/, 'validity: it got far enough to classify the lane');
  assert.doesNotMatch(
    broken.out,
    /tracked-dirt=1/,
    'this arm exists to FAIL if the over-general cure ever becomes the shipped one: it hides lane dirt behind a clean-looking verdict, and cure() would then reset --hard the MAIN worktree',
  );
});
