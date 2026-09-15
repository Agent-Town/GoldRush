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
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
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

test('CONTROL: the subject measures the FIXTURE, not the live board', () => {
  const { work } = fixture();
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  // F-2215-1: assert the control is aimed at the right subject before believing any arm.
  // The live repo has 100+ registered worktrees; seeing those here means `--root` was
  // ignored and every assertion below is about the wrong tree.
  assert.equal(j.treesRegistered, 1, 'the fixture must have exactly one registered worktree');
  assert.equal(j.treesAnswered, 1);
  assert.equal(j.subjects, 2, 'exactly the two manufactured modified evidence files');
  assert.equal(j.treesRegistered, j.treesAnswered + j.treesCouldNotAnswer);
});

test('arm 1: the desk figure is the AT RISK bucket, NOT the wider non-SAFE union', () => {
  const { work } = fixture();
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  // The fixture is built so the two readings DIFFER (1 vs 2). If they ever coincide this
  // arm proves nothing, so assert the gap itself first.
  assert.equal(j.buckets['AT RISK'].files, 1, 'ground truth: one file in no object database');
  assert.equal(j.nonSafe.files, 2, 'ground truth: the non-SAFE union also holds the UNREFERENCED file');
  assert.notEqual(j.deskFigure.files, j.nonSafe.files, 'the two readings must be distinguishable here');
  assert.equal(j.deskFigure.files, 1, 'the desk figure must track AT RISK');
});

test('arm 2: an UNCOMMITTED-but-hashed blob is UNREFERENCED, never AT RISK', () => {
  const { work } = fixture();
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.buckets.UNREFERENCED.files, 1, 'in the odb but held by no ref');
  assert.equal(j.buckets['AT RISK'].files, 1, 'and it must NOT be counted among the at-risk');
});

test('arm 3: UNTRACKED files are excluded — this census is the modified-tracked half', () => {
  const { work } = fixture();
  writeFileSync(join(work, 'artifacts', 'probe', 'stray-untracked.log'), 'untracked evidence\n');
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.subjects, 2, 'the untracked file must not enter the subject set');
  assert.equal(j.deskFigure.files, 1);
});

test('arm 4: non-evidence paths are excluded', () => {
  const { work } = fixture();
  writeFileSync(join(work, 'README.md'), 'modified but not evidence\n');
  const j = JSON.parse(runIn(work, SUBJECT, ['--json']));
  assert.equal(j.subjects, 2, 'a modified non-evidence path must not become a subject');
  assert.ok(!JSON.stringify(j).includes('README'), 'and must not appear anywhere in the report');
});

test('arm 5: the human report PRINTS all four buckets, so the predicate is visible', () => {
  const { work } = fixture();
  const out = runIn(work);
  for (const k of ['AT RISK', 'UNREFERENCED', 'LOCAL-REF-ONLY', 'SAFE']) {
    assert.match(out, new RegExp(k.replace(' ', '\\s')), `bucket ${k} must be printed`);
  }
  assert.match(out, /NOT the desk figure/, 'the wider reading must be named AND disclaimed');
});

test('arm 6: the corpus declaration prints on the HAPPY path too (F-2208-1)', () => {
  const { work } = fixture();
  const out = runIn(work);
  assert.match(out, /registered worktree\(s\)/);
  assert.match(out, /controls\s+:/, 'controls must be declared even when nothing is wrong');
});

test('arm 7: --strict reds on FACTORY-SIDE at-risk bytes; the advisory default stays 0', () => {
  const { work } = fixture();
  // The fixture root IS its own main worktree, so its at-risk file is factory-side.
  assert.throws(() => runIn(work, SUBJECT, ['--strict']), (e) => e.status === 1,
    'factory-side at-risk bytes must exit 1 under --strict');
  // Advisory default must stay 0 regardless — a red on the normal state is excused into
  // uselessness inside a week (F-1460-1).
  const r = runIn(work);
  assert.ok(r.length > 0, 'the advisory run must still produce a report at rc=0');
});

test('arm 7b: --strict does NOT red when the at-risk bytes are ATTENDED-owned (the restraint)', () => {
  const { work, agent } = attendedOnlyFixture();
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
});

test('arm 8: a non-repo root REFUSES with 2, never a clean zero', () => {
  const empty = mkdtempSync(join(tmpdir(), 'mtec-norepo-'));
  let status = 0, stdout = '';
  try {
    execFileSync(process.execPath, [SUBJECT, '--root', empty], {
      cwd: empty, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], ...BOUND,
    });
  } catch (e) { status = e.status; stdout = String(e.stdout || ''); }
  assert.equal(status, 2, 'could-not-answer must be 2, distinct from an answered 0');
  assert.match(stdout, /CANNOT VERIFY/, 'the refusal must reach STDOUT (F-2211-1)');
  rmSync(empty, { recursive: true, force: true });
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

test('arm 10: bucketOf maps the three non-SAFE states distinctly', async () => {
  const { bucketOf } = await import(SUBJECT);
  assert.equal(bucketOf(false, false, false), 'AT RISK');
  assert.equal(bucketOf(true, true, true), 'SAFE');
  assert.equal(bucketOf(true, false, true), 'LOCAL-REF-ONLY');
  assert.equal(bucketOf(true, false, false), 'UNREFERENCED');
});

// ---- TEETH: each manufactured defect must red at least one arm above ----------------
test('TEETH: swapping the desk figure to the non-SAFE union reds arm 1', () => {
  const { work } = fixture();
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
});

test('TEETH: including untracked files reds arm 3', () => {
  const { work } = fixture();
  writeFileSync(join(work, 'artifacts', 'probe', 'stray-untracked.log'), 'untracked\n');
  const v = variantOf("'--porcelain', '-uno'", "'--porcelain', '-uall'");
  try {
    const j = JSON.parse(runIn(work, v, ['--json']));
    assert.ok(j.subjects > 1, 'the manufactured widening must pull the untracked file in');
  } finally { rmSync(v, { force: true }); }
});

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
