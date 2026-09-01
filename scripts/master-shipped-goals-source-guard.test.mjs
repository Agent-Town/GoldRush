// F-2219-1 (s2219) — the goal-leaf corpus of `master-shipped-classifier.mjs` must DECLARE which
// source its SHIPPED evidence came from, and must NOT refuse when that corpus is lawfully absent.
//
// WHY THIS GUARD EXISTS. `verdictFor` builds SHIPPED from TWO corpora. F-2213-1 cured the reviews
// one (`mainReviews` -> {ok, source}) after measuring a ONE-verdict blast radius. The goal-leaf
// one, seventeen lines below it, stayed a bare `existsSync(p) ? goalLeaves(...) : []` -- and it
// is worth two orders of magnitude more. Measured s2219 by controlled experiment on the live
// board (same root, same masters, same reviews; the ONLY variable is this arm):
//     goals read  -> SHIPPED 704 · NO-TRACE 66 · CANDIDATES 1 · DISAGREES 97
//     goals empty -> SHIPPED 547 · NO-TRACE 85 · CANDIDATES 8 · DISAGREES 272
// i.e. 157 masters out of SHIPPED and an 8x candidate inflation, INTO the set this tool exists to
// compute -- the Mistake #8 / 824k Flail polarity. No exception is thrown anywhere on that path,
// which is why every catch-keyed census in this lineage (s2212..s2215) was structurally incapable
// of seeing it: the swallow is a GUARD, not a handler (F-2218-1).
//
// THE ARMS BELOW ARE PAIRED. Arms 1-4 red if the declaration is missing or wrong. Arms 5-6 are
// REVERSE CONTROLS: they red if the cure is one level too general -- refusing on `absent`, or
// declaring unconditionally. Both over-general cures pass every arm 1-4 and are caught only here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SCRIPT = fileURLToPath(new URL('./master-shipped-classifier.mjs', import.meta.url));
const roots = [];

// A minimal but REAL board: one master whose ONLY shipped evidence is a goal leaf. That is the
// precise population the lost corpus moves, so the fixture reaches the changed arm rather than
// merely existing near it (F-2213-1: check what your fixtures make reachable).
function board({ withGoals }) {
  const root = mkdtempSync(join(tmpdir(), 's2219-goals-'));
  roots.push(root);
  mkdirSync(join(root, 'tasks'), { recursive: true });
  writeFileSync(join(root, 'tasks', 'only-goal-evidence.md'), '# a master shipped per the goal tree\n');
  if (withGoals) {
    writeFileSync(
      join(root, 'tasks', 'goals.json'),
      JSON.stringify({
        children: [
          { id: 'g1', taskFile: 'only-goal-evidence.md', status: 'merged', mergeHash: 'a'.repeat(40) },
        ],
      }),
    );
  }
  return root;
}

const run = (root, ...args) => {
  const r = spawnSync('node', [SCRIPT, '--root', root, ...args], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20 });
  // F-2215-1: an arm that produced nothing is not a measurement. Assert validity before reading.
  assert.ok(r.stdout.length > 0, `arm produced NO stdout (rc=${r.status}) — it did not run`);
  return r;
};

test('1. goal corpus READ: the source is declared on the machine channel', () => {
  const r = run(board({ withGoals: true }), '--json');
  assert.equal(JSON.parse(r.stdout).goalsSource, 'goals');
});

test('2. goal corpus ABSENT: the machine channel says so — it is not silently the same', () => {
  const r = run(board({ withGoals: false }), '--json');
  assert.equal(JSON.parse(r.stdout).goalsSource, 'absent');
});

test('3. the two states are DISTINGUISHABLE — the pre-cure defect, stated as an assertion', () => {
  const read = JSON.parse(run(board({ withGoals: true }), '--json').stdout);
  const gone = JSON.parse(run(board({ withGoals: false }), '--json').stdout);
  assert.notEqual(read.goalsSource, gone.goalsSource);
  // and the loss is real, in the dangerous direction: SHIPPED -> candidate
  assert.equal(read.counts.SHIPPED, 1);
  assert.equal(gone.counts.SHIPPED, 0);
  assert.ok(gone.counts.CANDIDATES > read.counts.CANDIDATES, 'losing the goal corpus must inflate CANDIDATES');
});

test('4. the human channel names the loss — stdout is the advisory default\'s real interface', () => {
  // F-2210-1: asserting only the exit code tests the half nobody reads.
  const out = run(board({ withGoals: false })).stdout;
  assert.match(out, /NO goal-leaf evidence/);
  assert.match(out, /INTO the candidate set/);
});

test('5. REVERSE CONTROL — an absent goal corpus must NOT refuse (it is lawful)', () => {
  // F-2218-1's restraint: `absent` DECLARES and does not REFUSE. A root with no goals.json is
  // exactly what this file's 12 legacy fixtures use, and what `mainReviews` treats as ok
  // ('worktree'). A cure that refuses here reds every fixture and gets excused away (F-1460-1).
  const root = board({ withGoals: false });
  assert.equal(run(root).status, 0, 'default mode must stay advisory on an absent goal corpus');
  // --strict may red for CANDIDATES, but must NOT invent a second refusal code for absence.
  assert.notEqual(run(root, '--strict').status, 2, 'absence must not be escalated to CANNOT-VERIFY');
});

test('6. REVERSE CONTROL — a healthy board says nothing extra', () => {
  // Catches the other over-general cure: declaring unconditionally. That passes arms 1-4.
  const out = run(board({ withGoals: true })).stdout;
  assert.doesNotMatch(out, /NO goal-leaf evidence/);
});

test('7. the MALFORMED path is untouched and still fails LOUD (F-2214-1 not regressed)', () => {
  // The parse arm was deliberately left alone; this asserts the cure did not quietly swallow it.
  const root = board({ withGoals: true });
  writeFileSync(join(root, 'tasks', 'goals.json'), '{ this is not json');
  const r = spawnSync('node', [SCRIPT, '--root', root, '--strict'], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
  assert.equal(r.status, 2, 'a malformed goal corpus must still refuse with 2 = could not answer');
  assert.match(r.stdout, /CANNOT VERIFY/);
});

test('8. the reviews declaration still works — the sibling cure is not disturbed', () => {
  const r = run(board({ withGoals: true }), '--json');
  const parsed = JSON.parse(r.stdout);
  assert.equal(parsed.reviewsOk, true);
  assert.equal(parsed.reviewsSource, 'worktree'); // non-git fixture root, per F-2213-1
});

process.on('exit', () => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});
