// F-2214-1 — a CRASHED master-shipped-classifier run must never exit like a clean board.
//
// F-2213-1 landed a `--strict` refusal for an unverifiable review corpus. That refusal lives
// INSIDE the CLI's `try`, and the `catch` beneath it set `process.exitCode = 0` unconditionally
// -- so ANY throw skipped the refusal entirely and the process exited 0 with an EMPTY stdout,
// byte-identical to a genuinely clean board. The cure landed one fire earlier was bypassed by
// the arm one line below it; it is F-2208-1's defect one file over, for the third fire running.
//
// The triggers are mundane, not exotic. `classifyRoot` throws on a malformed or mid-splice
// `tasks/goals.json` (fires splice that file every drain, per the Goal Registration Law), on a
// `--root` aimed one directory off, and on a master renamed between `readdirSync` and
// `readFileSync` by a concurrent drain. Two of the three are manufactured below.
//
// HOW THIS WAS FOUND, because the method is the reusable half: s2212 censused the class with a
// file-level `grep -c catch`; s2213 sharpened that to "a spawn sitting LEXICALLY inside a
// `try {`" and measured 26 files. Both tests are blind to a spawn reached through a same-file
// wrapper -- `classifyRoot` calls `mainReviews`, which spawns -- so this catch was invisible to
// the very census that cured this file. Resolving wrappers transitively adds 13 files the
// lexical test cannot see, and this one is in the file the census had just finished curing.
//
// WHAT MUST NOT CHANGE, and it is why half these arms are reverse controls: the DEFAULT mode is
// advisory on purpose ("never block a drain on our own absence"). An over-general cure --
// rethrowing, or refusing on every catch -- passes every crash arm below while breaking that,
// and would make this tool able to stop a drain by its own failure. Arms 3 and 4 are the ones
// that fail on such a cure.
//
// Every red arm was proven by manufacturing the defect on scratch copies, and the measurement
// CORRECTED MY OWN PREDICTION, which is reported rather than quietly fixed:
//   * PRE-CURE (the defect verbatim) -- I predicted it would red arms 1, 2, 5, 6 and leave both
//     reverse controls green. Measured: it reds FIVE of six, arm 3 included, because arm 3 also
//     asserts the crash BANNER prints, and the pre-cure catch printed only to stderr. Only arm 4
//     (a healthy board) survives. So arm 3 is doing two jobs, and only its exit-code half is a
//     pure reverse control.
//   * OVER-GENERAL (`process.exitCode = 2` on every catch, both modes) -- reds exactly arms 3
//     and 6, and passes all four crash arms. That is the whole reason the reverse controls
//     exist: a cure one level too general scores green on every arm that names the finding
//     while quietly giving this advisory tool the power to block a drain by its own failure.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./master-shipped-classifier.mjs', import.meta.url));

const HEALTHY_GOALS = JSON.stringify({ id: 'root', children: [] });
// A leaf that ships the only master, so the board holds zero candidates.
const CLEAN_GOALS = JSON.stringify({
  id: 'root',
  children: [{ id: 'demo', taskFile: 'demo-slice.md', status: 'merged', mergeHash: 'a'.repeat(40) }],
});

// A non-git root: `main` does not resolve, so mainReviews() walks the working tree and says so.
// That is the F-2213-1 discriminator behaving correctly and is deliberately NOT the subject here.
function rootFixture(t, { goals = HEALTHY_GOALS } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2214-guard-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks'), { recursive: true });
  fs.mkdirSync(path.join(root, 'reviews'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'demo-slice.md'), '# a banked master\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), goals);
  return root;
}

// An empty directory: `tasks/` is absent, so readdirSync throws ENOENT. The realistic cause is
// a `--root` one directory off -- the same trigger citation-title-guard names for its own refusal.
function rootlessFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2214-guard-empty-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function run(root, ...extra) {
  const r = spawnSync('node', [SCRIPT, '--root', root, ...extra], { encoding: 'utf8' });
  return { rc: r.status, out: r.stdout, err: r.stderr };
}

test('a crashed --strict run refuses (2) rather than exiting like a clean board (0)', (t) => {
  // Malformed goals.json: classifyRoot throws at JSON.parse.
  const crashed = run(rootFixture(t, { goals: '{"id":"root","children":[' }), '--strict');
  const clean = run(rootFixture(t, { goals: CLEAN_GOALS }), '--strict');

  assert.equal(clean.rc, 0, 'control: a genuinely clean board exits 0 under --strict');
  assert.notEqual(
    crashed.rc,
    clean.rc,
    'a crashed --strict run exited identically to a clean board — F-2213-1\'s refusal was bypassed',
  );
  assert.equal(crashed.rc, 2, '"could not answer" is 2, the drain-block-check / dry-board-probe convention');
});

test('a crashed run names itself on STDOUT, not only on stderr', (t) => {
  // F-2211-1: a caller that classifies by stdout reads an empty string from a crashed run and
  // buckets it as silence. The exit code is the machine half; this is the other half.
  const crashed = run(rootFixture(t, { goals: '{"id":"root","children":[' }), '--strict');
  assert.match(crashed.out, /⛔ CANNOT VERIFY/, 'crash banner must reach stdout');
  assert.match(crashed.out, /Unexpected end of JSON input/, 'the banner must name the cause');
  assert.notEqual(crashed.out.trim(), '', 'stdout must never be empty on a crash');
});

test('REVERSE CONTROL — a crashed DEFAULT run stays advisory (0), never blocking a drain', (t) => {
  // The retired comment protected exactly this: "advisory: never block a drain on our own
  // absence". A cure that rethrows, or that refuses on every catch, reds here while passing
  // every crash arm above.
  const crashed = run(rootFixture(t, { goals: '{"id":"root","children":[' }));
  assert.equal(crashed.rc, 0, 'default mode must remain advisory even when the classifier crashes');
  assert.match(crashed.out, /⛔ CANNOT VERIFY/, 'advisory does not mean silent — the banner still prints');
});

test('REVERSE CONTROL — a clean board under --strict still exits 0', (t) => {
  const clean = run(rootFixture(t, { goals: CLEAN_GOALS }), '--strict');
  assert.equal(clean.rc, 0, 'an over-general cure that refuses on anything unusual breaks the working path');
  assert.doesNotMatch(clean.out, /CANNOT VERIFY — DO NOT QUEUE off this run/, 'no crash banner on a healthy run');
});

test('"could not answer" (2) stays distinct from "answered, and the answer refuses" (1)', (t) => {
  // F-2213-1's arm: a master with no shipping evidence is a CANDIDATE, which refuses with 1.
  // Collapsing the two codes would make a crash indistinguishable from a real finding.
  const candidates = run(rootFixture(t), '--strict');
  const crashed = run(rootFixture(t, { goals: '{"id":"root","children":[' }), '--strict');
  assert.equal(candidates.rc, 1, 'a real candidate still refuses with 1');
  assert.equal(crashed.rc, 2, 'a crash refuses with 2');
  assert.notEqual(candidates.rc, crashed.rc, 'the two refusals must not collapse into one code');
});

test('the second manufactured trigger — a --root one directory off — also refuses', (t) => {
  // A different throw site (readdirSync, not JSON.parse), so this pins the catch rather than
  // one unlucky parse.
  const off = run(rootlessFixture(t), '--strict');
  assert.equal(off.rc, 2, 'tasks/ absent must refuse under --strict');
  assert.match(off.out, /⛔ CANNOT VERIFY/);
  assert.equal(run(rootlessFixture(t)).rc, 0, 'and stay advisory by default');
});
