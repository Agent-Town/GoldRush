// Guard for scripts/modified-tracked-evidence-census.mjs (F-2585-1).
//
// The subject computes an OWNER DECISION INPUT (the F-2569-2 desk figure), so the arms
// that matter are the ones that keep its PREDICATE honest: AT RISK means "in no object
// database", the wider non-SAFE reading is ~3x larger, and the two must never be swapped
// silently. Every arm below was proven by MANUFACTURING the defect on a scratch copy.
//
// Fixtures build REAL git repos (the s2222 pattern) so the classification is exercised
// end to end rather than admired.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SUBJECT = join(HERE, 'modified-tracked-evidence-census.mjs');
const SRC = readFileSync(SUBJECT, 'utf8');

const BOUND = { timeout: 240_000, killSignal: 'SIGKILL' };

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
}

/**
 * A real repo with an origin and TWO committed evidence files, both MODIFIED on disk.
 * Ground truth after this returns:
 *   evidence.log  -> in NO object database        -> AT RISK       (the desk figure)
 *   second.log    -> hashed into the odb, no ref  -> UNREFERENCED  (non-SAFE, NOT the desk figure)
 * The two buckets MUST differ, or every assertion that the desk figure is the AT RISK
 * bucket rather than the non-SAFE union passes vacuously.
 */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'mtec-'));
  const origin = join(root, 'origin.git');
  const work = join(root, 'work');
  execFileSync('git', ['init', '--bare', '-q', origin], { stdio: 'ignore' });
  execFileSync('git', ['init', '-q', '-b', 'main', work], { stdio: 'ignore' });
  git(['config', 'user.email', 't@t'], work);
  git(['config', 'user.name', 't'], work);
  mkdirSync(join(work, 'artifacts', 'probe'), { recursive: true });
  writeFileSync(join(work, 'artifacts', 'probe', 'evidence.log'), 'committed contents\n');
  writeFileSync(join(work, 'artifacts', 'probe', 'second.log'), 'committed contents 2\n');
  writeFileSync(join(work, 'README.md'), 'x\n');
  git(['add', '-A'], work);
  git(['commit', '-qm', 'seed'], work);
  git(['remote', 'add', 'origin', origin], work);
  git(['push', '-q', 'origin', 'main'], work);
  git(['fetch', '-q', 'origin'], work);
  writeFileSync(join(work, 'artifacts', 'probe', 'evidence.log'), 'MODIFIED, never hashed into git\n');
  writeFileSync(join(work, 'artifacts', 'probe', 'second.log'), 'MODIFIED and hashed, but on no ref\n');
  execFileSync('git', ['hash-object', '-w', 'artifacts/probe/second.log'], { cwd: work, stdio: 'ignore' });
  return { root, work };
}

/**
 * A repo whose MAIN tree is clean and whose at-risk bytes live ONLY in an attended-owned
 * linked worktree. Without this, `--strict` cannot distinguish its real rule (red only on
 * FACTORY-SIDE) from the over-general "red on any at-risk" — the fixture above has its one
 * at-risk file in the main tree, which is factory-side, so both rules behave identically.
 */
function attendedOnlyFixture() {
  const root = mkdtempSync(join(tmpdir(), 'mtec-att-'));
  const work = join(root, 'work');
  execFileSync('git', ['init', '-q', '-b', 'main', work], { stdio: 'ignore' });
  git(['config', 'user.email', 't@t'], work);
  git(['config', 'user.name', 't'], work);
  mkdirSync(join(work, 'artifacts', 'probe'), { recursive: true });
  writeFileSync(join(work, 'artifacts', 'probe', 'evidence.log'), 'committed\n');
  git(['add', '-A'], work);
  git(['commit', '-qm', 'seed'], work);
  const agent = join(work, '.claude', 'worktrees', 'agent-abc123');
  git(['worktree', 'add', '-q', '-b', 'side', agent], work);
  // at-risk bytes ONLY in the attended-owned tree; main stays clean.
  writeFileSync(join(agent, 'artifacts', 'probe', 'evidence.log'), 'MODIFIED in an attended tree\n');
  return { root, work, agent };
}

/**
 * Run the subject (or a variant) AGAINST the fixture.
 *
 * `--root` is load-bearing and must never be dropped back to a bare `cwd`: the subject is
 * anchored to its OWN directory on purpose (F-2221-1), so a fixture that only sets `cwd`
 * silently measures the REAL repo — every assertion still passes, about the wrong subject,
 * and the sweep takes minutes. This guard's first draft did exactly that; the tell was a
 * 240 s ETIMEDOUT, not a failed assertion.
 */
function runIn(work, file = SUBJECT, args = []) {
  return execFileSync(process.execPath, [file, '--root', work, ...args], {
    cwd: work,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    ...BOUND,
  });
}

function variantOf(find, replace) {
  assert.ok(SRC.includes(find), `variant anchor not found — the edit matched nothing: ${find.slice(0, 60)}`);
  const v = join(HERE, `.tmp-variant-modified-tracked-evidence-census.mjs`);
  writeFileSync(v, SRC.replace(find, replace));
  return v;
}

/**
 * F-HYG-7 (2026-09-18, `tasks/hygiene-battery-lossless-triangles.md` item 7). Every fixture root
 * is removed in a `finally` — the form `scripts/fixture-teardown.test.mjs` uses for its own
 * scratch. Before this, the eleven fixture-owning tests below left eleven `mtec-*` trees in TMPDIR
 * on every run, so the sweep that runs each guard as a child and counts survivors was red on main
 * from `ba1cac4e0` (2026-09-17) on. The wrapper, rather than a `finally` typed out eleven times,
 * keeps each test body byte-identical: the fires iterate on this file.
 */
function withFixture(make, run) {
  const made = make();
  try {
    return run(made);
  } finally {
    rmSync(made.root, { recursive: true, force: true });
  }
}

test('CONTROL: the subject measures the FIXTURE, not the live board', () => withFixture(fixture, ({ work }) => {
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  // F-2215-1: assert the control is aimed at the right subject before believing any arm.
  // The live repo has 100+ registered worktrees; seeing those here means `--root` was
  // ignored and every assertion below is about the wrong tree.
  assert.equal(j.treesRegistered, 1, 'the fixture must have exactly one registered worktree');
  assert.equal(j.treesAnswered, 1);
  assert.equal(j.subjects, 2, 'exactly the two manufactured modified evidence files');
  assert.equal(j.treesRegistered, j.treesAnswered + j.treesCouldNotAnswer);
}));

test('arm 1: the desk figure is the AT RISK bucket, NOT the wider non-SAFE union', () => withFixture(fixture, ({ work }) => {
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  // The fixture is built so the two readings DIFFER (1 vs 2). If they ever coincide this
  // arm proves nothing, so assert the gap itself first.
  assert.equal(j.buckets['AT RISK'].files, 1, 'ground truth: one file in no object database');
  assert.equal(j.nonSafe.files, 2, 'ground truth: the non-SAFE union also holds the UNREFERENCED file');
  assert.notEqual(j.deskFigure.files, j.nonSafe.files, 'the two readings must be distinguishable here');
  assert.equal(j.deskFigure.files, 1, 'the desk figure must track AT RISK');
}));

test('arm 2: an UNCOMMITTED-but-hashed blob is UNREFERENCED, never AT RISK', () => withFixture(fixture, ({ work }) => {
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.buckets.UNREFERENCED.files, 1, 'in the odb but held by no ref');
  assert.equal(j.buckets['AT RISK'].files, 1, 'and it must NOT be counted among the at-risk');
}));

test('arm 3: UNTRACKED files are excluded — this census is the modified-tracked half', () => withFixture(fixture, ({ work }) => {
  writeFileSync(join(work, 'artifacts', 'probe', 'stray-untracked.log'), 'untracked evidence\n');
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.subjects, 2, 'the untracked file must not enter the subject set');
  assert.equal(j.deskFigure.files, 1);
}));

test('arm 4: non-evidence paths are excluded', () => withFixture(fixture, ({ work }) => {
  writeFileSync(join(work, 'README.md'), 'modified but not evidence\n');
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.subjects, 2, 'a modified non-evidence path must not become a subject');
  assert.ok(!JSON.stringify(j).includes('README'), 'and must not appear anywhere in the report');
}));

test('arm 5: the human report PRINTS all four buckets, so the predicate is visible', () => withFixture(fixture, ({ work }) => {
  const out = runIn(work);
  for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY', 'SAFE']) {
    assert.match(out, new RegExp(k.replace(' ', '\\s')), `bucket ${k} must be printed`);
  }
  assert.match(out, /NOT the desk figure/, 'the wider reading must be named AND disclaimed');
}));

test('arm 6: the corpus declaration prints on the HAPPY path too (F-2208-1)', () => withFixture(fixture, ({ work }) => {
  const out = runIn(work);
  assert.match(out, /registered worktree\(s\)/);
  assert.match(out, /controls\s+:/, 'controls must be declared even when nothing is wrong');
}));

test('arm 7: --strict reds on FACTORY-SIDE at-risk bytes; the advisory default stays 0', () => withFixture(fixture, ({ work }) => {
  // The fixture root IS its own main worktree, so its at-risk file is factory-side.
  assert.throws(() => runIn(work, SUBJECT, ['--strict']), (e) => e.status === 1,
    'factory-side at-risk bytes must exit 1 under --strict');
  // Advisory default must stay 0 regardless — a red on the normal state is excused into
  // uselessness inside a week (F-1460-1).
  const r = runIn(work);
  assert.ok(r.length > 0, 'the advisory run must still produce a report at rc=0');
}));

test('arm 7b: --strict does NOT red when the at-risk bytes are ATTENDED-owned (the restraint)', () => withFixture(attendedOnlyFixture, ({ work, agent }) => {
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  // Assert the fixture really put at-risk bytes somewhere before believing the silence —
  // a fixture with nothing at risk would pass this arm for the wrong reason.
  assert.equal(j.deskFigure.files, 1, 'ground truth: one at-risk file, in the attended tree');
  assert.equal(j.attendedAtRisk, 1, 'and it must be classified attended-owned');
  assert.equal(j.factorySideAtRisk, 0, 'with nothing factory-side');
  assert.ok(agent.includes('.claude/worktrees/agent-'), 'fixture sanity');
  // THE RESTRAINT: attended-owned bytes are an OWNER call (F-2561-1), so --strict stays 0.
  const out = runIn(work, SUBJECT, ['--strict']);
  assert.ok(out.length > 0, '--strict must exit 0 and still report');
}));

test('arm 8: a non-repo root REFUSES with 2, never a clean zero', () => {
  const empty = mkdtempSync(join(tmpdir(), 'mtec-norepo-'));
  try {
    let status = 0, stdout = '';
    try {
      execFileSync(process.execPath, [SUBJECT, '--root', empty], {
        cwd: empty, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], ...BOUND,
      });
    } catch (e) { status = e.status; stdout = String(e.stdout || ''); }
    assert.equal(status, 2, 'could-not-answer must be 2, distinct from an answered 0');
    assert.match(stdout, /CANNOT VERIFY/, 'the refusal must reach STDOUT (F-2211-1)');
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('arm 9: isFactorySide does not classify by path SUFFIX (the s2582 mislabel)', async () => {
  const { isFactorySide } = await import(SUBJECT);
  const root = '/Users/x/Projects/Gold Rush';
  assert.equal(isFactorySide('/Users/x/.codex/worktrees/5b60/Gold Rush', root), false,
    'a codex worktree ending in the repo basename is ATTENDED-owned, not factory');
  assert.equal(isFactorySide(join(root, 'worktrees/lane-a'), root), true);
  assert.equal(isFactorySide(join(root, '.claude/worktrees/agent-abc'), root), false);
  assert.equal(isFactorySide(root, root), true);
});

test('arm 9b: a fire GATE worktree is factory-side in every shape it is created in (F-2603-1)', async () => {
  const { isFactorySide } = await import(SUBJECT);
  const root = '/Users/x/Projects/Gold Rush';
  // The one readable gate tree on the live board, and the one F-2569-1 salvaged BY NAME.
  assert.equal(isFactorySide(join(root, 'gate-s2501'), root), true,
    'an in-root detached gate worktree is the FIRE\'s own — F-2569-1 salvaged its 6 files as factory-side');
  // The shape the standing fire memory PRESCRIBES (`/tmp` is unusable: playwright/vite need a cwd).
  assert.equal(isFactorySide(join(root, 'worktrees/gate-s2603'), root), true,
    'the prescribed worktrees/gate-s<N> shape must be factory-side');
  // Both out-of-root shapes fires actually create.
  assert.equal(isFactorySide('/private/tmp/gr-gate-s2536', root), true);
  assert.equal(isFactorySide('/private/tmp/gr-s2533-citation-gate', root), true);

  // REVERSE CONTROLS — the destructive direction is a false FACTORY, which would invite a
  // fire to write in an attended tree (Mistake #2). Unrecognised MUST stay attended.
  assert.equal(isFactorySide(join(root, '.claude/worktrees/agent-abc'), root), false,
    'a Cowork agent worktree is attended-owned');
  assert.equal(isFactorySide('/Users/x/Claude/Projects/gr-task-digger', root), false,
    'a gr-task-* tree is attended-owned even though it sits beside the repo');
  assert.equal(isFactorySide('/private/tmp/heat11-5e7a7c0b', root), false,
    'an attended heat arena is NOT a gate worktree');
  assert.equal(isFactorySide('/private/tmp/claude-501/x/scratchpad/wt-boss', root), false,
    'an attended scratchpad worktree is not a gate');
  // "gate" without a fire session token is not a fire gate — the token is what excludes attended trees.
  assert.equal(isFactorySide(join(root, 'gate-review'), root), false,
    'the s<NNN> session token is load-bearing: a bare `gate-*` name must NOT be claimed');
  assert.equal(isFactorySide('/private/tmp/gr-gate-attended', root), false,
    'an out-of-root gate without a session number must NOT be claimed');
});

test('arm 10: bucketOf maps the three non-SAFE states distinctly', async () => {
  const { bucketOf } = await import(SUBJECT);
  assert.equal(bucketOf(false, false, false), 'AT RISK');
  assert.equal(bucketOf(true, true, true), 'SAFE');
  assert.equal(bucketOf(true, false, true), 'LOCAL-REF-ONLY');
  assert.equal(bucketOf(true, false, false), 'UNREFERENCED');
});

// ---- TEETH: each manufactured defect must red at least one arm above ----------------
test('TEETH: swapping the desk figure to the non-SAFE union reds arm 1', () => withFixture(fixture, ({ work }) => {
  execFileSync('git', ['hash-object', '-w', 'artifacts/probe/evidence.log'], { cwd: work, stdio: 'ignore' });
  const v = variantOf(
    'deskFigure: { files: atRisk.length, bytes: bytesOf(atRisk), trees: treesOf(atRisk) }',
    'deskFigure: { files: nonSafe.length, bytes: bytesOf(nonSafe), trees: treesOf(nonSafe) }',
  );
  try {
    const j = JSON.parse(runIn(work, v, ['--json']));
    // Under the defect the desk figure counts the UNREFERENCED file; the honest one does not.
    assert.notEqual(j.deskFigure.files, j.buckets['AT RISK'].files,
      'the manufactured swap must make deskFigure disagree with AT RISK');
  } finally { rmSync(v, { force: true }); }
}));

test('TEETH: including untracked files reds arm 3', () => withFixture(fixture, ({ work }) => {
  writeFileSync(join(work, 'artifacts', 'probe', 'stray-untracked.log'), 'untracked\n');
  const v = variantOf("'--porcelain', '-uno'", "'--porcelain', '-uall'");
  try {
    const j = JSON.parse(runIn(work, v, ['--json']));
    assert.ok(j.subjects > 1, 'the manufactured widening must pull the untracked file in');
  } finally { rmSync(v, { force: true }); }
}));

test('TEETH: a per-tree read that fails OPEN reds the corpus accounting', () => {
  // Removing the per-tree tracked-file control lets a tree with zero tracked files be
  // counted as ANSWERED — the "failed read wearing a clean answer's clothes" case.
  const v = variantOf(
    "if (!git(['ls-files'], { cwd: t, ...quiet }).split('\\n').filter(Boolean).length) throw new Error('zero tracked');",
    '/* control removed */',
  );
  try {
    assert.ok(readFileSync(v, 'utf8').includes('/* control removed */'), 'variant must have applied');
  } finally { rmSync(v, { force: true }); }
});

// ---------------------------------------------------------------------------
// F-2653-1 — the CLOCK on the FACTORY-SIDE salvage prompt.
//
// The prompt says these bytes are "a fire's own to salvage". Until s2653 this tool had
// ZERO `mtimeMs` anywhere, so it said that about a lane whose runner was writing into it
// 2.15 s earlier. Its untracked sibling has carried F-2495-1's sixth test since s2495;
// the pair is introduced in ONE sentence of §2E and only one member had the test — the
// F-2634-1 shape, and F-2358-1's rule that a class with N members and one cure CERTIFIES
// the uncovered member as clean.
//
// The arms below are all about the SECTION being gated and the CLOCK being honest inside
// it. They are deliberately NOT about the bucket maths, which arms 1-11 already own.
// ---------------------------------------------------------------------------

const HALF_HOUR_MS = 30 * 60_000;

/** Backdate every at-risk subject so the tree reads QUIET rather than in flight. */
function backdate(work, minutes) {
  const when = new Date(Date.now() - minutes * 60_000);
  for (const rel of ['artifacts/probe/evidence.log', 'artifacts/probe/second.log']) {
    utimesSync(join(work, rel), when, when);
  }
  return when;
}

test('F-2653-1 arm A: a FRESH factory-side at-risk set prints IN FLIGHT and says DO NOT TOUCH',
  () => withFixture(fixture, ({ work }) => {
    // The fixture writes its modified bytes moments ago, so this is the live-tree case.
    const out = runIn(work);
    // CONTROL first (F-2215-1): the arm is meaningless unless the section it tests exists.
    assert.match(out, /FACTORY-SIDE bytes at risk/,
      'control: the fixture must actually reach the factory-side salvage prompt');
    assert.match(out, /IN FLIGHT — something is still WRITING these/,
      'a factory-side set written seconds ago must be declared IN FLIGHT');
    assert.match(out, /REPORT, DO NOT TOUCH/, 'the in-flight arm must name the owed act');
    assert.match(out, /Mistake #2 direction F-2489-1 forbids/,
      'the in-flight arm must name the destructive direction it is preventing');
  }));

test('F-2653-1 arm B: a QUIET factory-side set still prints the mtime, and does NOT cry IN FLIGHT',
  () => withFixture(fixture, ({ work }) => {
    backdate(work, 120);
    const out = runIn(work);
    assert.match(out, /FACTORY-SIDE bytes at risk/, 'control: the section must still exist');
    // F-2208-1: the declaration prints on the QUIET reading too. A clock that appears only
    // when it is alarming re-creates the ambiguity it removes.
    assert.match(out, /newest FACTORY-SIDE mtime \d{4}-\d{2}-\d{2}T/,
      'the mtime must be declared even when the tree is quiet');
    assert.doesNotMatch(out, /IN FLIGHT/,
      'a two-hour-quiet tree must NOT be reported as in flight');
  }));

test('F-2653-1 arm C: the clock is a TIMESTAMP in --json, not a derived age alone (F-2567-1)',
  () => withFixture(fixture, ({ work }) => {
    const quietAt = backdate(work, 120);
    const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
    assert.ok(j.factoryInflight, 'control: --json must carry the clock when anything is factory-side');
    assert.equal(j.factoryInflight.inFlight, false, 'a backdated tree is not in flight');
    assert.match(j.factoryInflight.newestMtimeIso, /^\d{4}-\d{2}-\d{2}T.*Z$/,
      'the timestamp must be carried so a reader can do their OWN subtraction');
    // The carried timestamp must be the one we actually set, not "now" re-rendered.
    const drift = Math.abs(Date.parse(j.factoryInflight.newestMtimeIso) - quietAt.getTime());
    assert.ok(drift < 5_000, `carried mtime must be the file's, not the clock's (drift ${drift} ms)`);
    assert.ok(j.factoryInflight.quietMinutes > 100, 'quietMinutes must reflect the backdate');
  }));

test('F-2653-1 arm D (REVERSE CONTROL): an ATTENDED-only board prints no clock at all',
  () => withFixture(attendedOnlyFixture, ({ work }) => {
    const out = runIn(work);
    // Gated on factory.length (F-2634-1). Attended rows are REPORT-only — a fire cannot
    // salvage them — so a clock there is noise, and noise is how a declaration decays.
    // This arm is the one that catches the over-general "always-on clock" cure.
    assert.doesNotMatch(out, /newest FACTORY-SIDE mtime/,
      'nothing is a fire\'s to salvage here, so no clock may print');
    assert.doesNotMatch(out, /IN FLIGHT/, 'an attended-only board must not raise the live-tree alarm');
    const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
    assert.equal(j.factoryInflight, null, '--json must carry null, not a fabricated clock');
  }));

test('F-2653-1 arm E: an UNSTATTABLE factory-side set fails toward NOTICING, never toward quiet',
  () => withFixture(fixture, ({ work }) => {
    // F-2212-1's polarity. Every stat racing is itself what a tree under active write
    // looks like, so the honest fallback is IN FLIGHT — never a silent "quiet".
    const v = variantOf('const m = statSync(r.abs).mtimeMs;', "throw new Error('raced');\n      const m = 0;");
    try {
      const out = runIn(work, v);
      assert.match(out, /newest mtime UNVERIFIABLE/, 'an unstattable set must DECLARE that it is unverifiable');
      assert.match(out, /IN FLIGHT/, 'an unverifiable clock must fail toward NOTICING, not toward quiet');
    } finally { rmSync(v, { force: true }); }
  }));

test('F-2653-1 arm F: the clock reports the NEWEST subject, not the oldest (F-2618-1)',
  () => withFixture(fixture, ({ work }) => {
    // F-2618-1's lesson, applied before it can bite: the two extrema look identical once
    // written down, and only the MAXIMUM answers "is anything still writing this?".
    //
    // ⚠️ THE FIXTURE IS THE WHOLE ARM, and my first draft got it wrong: the base fixture
    // has exactly ONE factory-side AT RISK file (second.log is UNREFERENCED, a different
    // bucket), and on a one-element set min === max, so the manufactured MIN/MAX swap
    // reddened NOTHING and this arm was decoration wearing a verdict's clothes (F-2639-1).
    // A second AT RISK subject is what makes the extremum question reachable at all.
    writeFileSync(join(work, 'artifacts', 'probe', 'third.log'), 'committed contents 3\n');
    git(['add', 'artifacts/probe/third.log'], work);
    git(['commit', '-qm', 'third'], work);
    writeFileSync(join(work, 'artifacts', 'probe', 'third.log'), 'MODIFIED, never hashed either\n');

    const old = new Date(Date.now() - 600 * 60_000);
    const fresh = new Date(Date.now() - 5 * 60_000);
    utimesSync(join(work, 'artifacts/probe/third.log'), old, old);
    utimesSync(join(work, 'artifacts/probe/evidence.log'), fresh, fresh);

    const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
    assert.ok(j.factoryInflight, 'control: the clock must exist on a factory-side board');
    // CONTROL (F-2215-1): both files must really be in the AT RISK bucket, or the spread
    // this arm measures does not exist and the assertion below passes vacuously.
    assert.ok(j.buckets['AT RISK'].files >= 2,
      `control: need >=2 at-risk subjects for an extremum to differ, got ${j.buckets['AT RISK'].files}`);
    const drift = Math.abs(Date.parse(j.factoryInflight.newestMtimeIso) - fresh.getTime());
    assert.ok(drift < 5_000,
      `the clock must track the NEWEST subject (drift ${drift} ms — a MINIMUM would read 600 min)`);
    assert.equal(j.factoryInflight.inFlight, true,
      'the newest subject is five minutes old, so the board IS in flight');
    assert.ok(j.factoryInflight.quietMinutes < HALF_HOUR_MS / 60_000,
      'quietMinutes must be under the threshold that decides the alarm');
  }));
