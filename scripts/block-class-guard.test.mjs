// F-1383-1 (s1383) — GUARD: every blocked goal leaf must DECLARE which kind of refusal it is.
//
// WHY THIS EXISTS. `status:"blocked"` is overloaded across two opposite refusals: an OWNER fork
// (only Robin lifts it) and a fire-recorded GATE-SIDE readiness hold (no owner word will ever
// lift it — it is lifted by satisfying the stated condition). Until s1383 the only discriminator
// was free prose inside `blockedReason`, and prose is exactly what gets rewritten and omitted:
// s1381's handoff records flipping "all three" of its leaves to blocked with an explicit
// "GATE-SIDE HOLD, NOT AN OWNER GATE" reason "so the next fire cannot misread them as owner
// forks". MEASURED s1383: the label reached TWO of the three. The leaf it missed —
// e1-authored-bundle-validation — is the one the next two handoffs each named as the #1 priority
// and "the cheapest real merge on the board", and drain-block-check then asserted
// "A block is lifted by the OWNER" on its behalf. The board's cheapest merge sat frozen behind a
// label nobody intended to apply.
//
// This guard makes the omission impossible to repeat silently: a prose sentence can be dropped by
// a rewrite without anything noticing, a missing REQUIRED FIELD reds the battery.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const VALID = new Set(['owner-fork', 'gate-side', 'disputed']);

// This guard's local schema assertions belong to the checkout being tested. Its drain cross-checks
// do too, but drain-block-check correctly refuses to answer from a frozen linked-worktree board.
// Declare that collision instead of comparing local leaves with main's different denominator.
const LINKED_WORKTREE = (() => {
  const opts = { encoding: 'utf8' };
  const gitDir = spawnSync('git', ['rev-parse', '--absolute-git-dir'], opts);
  const common = spawnSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], opts);
  return gitDir.status === 0 && common.status === 0 && gitDir.stdout.trim() !== common.stdout.trim();
})();

const LINKED_SKIP =
  'DECLARED SKIP: this assertion compares the local goals board with drain-block-check; ' +
  'a linked worktree is frozen and that tool correctly refuses it. Re-run from the main worktree.';

let lastVisited = 0;

function blockedLeaves() {
  const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
  const out = [];
  let visited = 0;
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    visited += 1;
    if (n.status === 'blocked') out.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: g.goals || [] });
  lastVisited = visited;
  return out;
}

test('every blocked leaf declares a valid blockClass', () => {
  const leaves = blockedLeaves();
  // F-1657-4 (s1657): the canary asserts the WALKER is healthy, not that the board is unhappy.
  // It used to be `leaves.length > 0` — "expected at least one blocked leaf; walker may be
  // broken" — which conflates two different facts. s1657 lifted the LAST blocked leaf
  // (f1643-2's gate-side hold, both its conditions finally met) and this guard went red on a
  // board that was simply clean: zero blocked leaves is the state the factory is TRYING to
  // reach, and a guard that reds on success teaches fires to avoid discharging blocks.
  // The walker is still proven — a broken traversal visits nothing and still reds here — but
  // an empty blocked set is now lawful and the class check below is vacuously true.
  assert.ok(lastVisited > 1, `walker visited ${lastVisited} node(s); traversal looks broken`);
  const bad = leaves.filter((l) => !VALID.has(l.blockClass));
  assert.deepStrictEqual(
    bad.map((l) => `${l.id} -> ${JSON.stringify(l.blockClass)}`),
    [],
    `blocked leaves must declare blockClass (${[...VALID].join(' | ')}). ` +
      `An undeclared block is reported to every fire as OWNER-gated, which parks fire-fixable ` +
      `work on a desk forever — the failure mode that once cost 19 days.`
  );
});

// A "disputed" leaf is a leaf whose own reason asserts BOTH readings. It is a real state, but it
// is an unresolved one: it should be surfaced for an attended ruling, not left to accumulate.
test('disputed leaves are surfaced, not silently accumulated', () => {
  const disputed = blockedLeaves().filter((l) => l.blockClass === 'disputed');
  assert.ok(
    disputed.length <= 2,
    `${disputed.length} leaves are blockClass="disputed" (${disputed.map((l) => l.id).join(', ')}). ` +
      `Each one is a leaf whose own text claims to be both owner-gated and fire-fixable; ` +
      `they need an attended ruling, not another carry.`
  );
});

// F-1597-1 (s1597) — THE TWO DENOMINATORS MUST AGREE, OR ONE OF THEM IS LYING.
//
// This file's walker (above) deliberately does NOT require a taskFile, so it has always seen every
// blocked leaf. `drain-block-check.mjs` — the §3.0 first-command-of-every-drain guard — collected
// only nodes with a string taskFile, because that is what distinguishes a leaf from a parent goal.
// So the two guards read one tree through two denominators and NOTHING compared them: measured
// s1597, this file saw 5 blocked leaves and `--all` reported 4. The missing leaf,
// bt-04-homestead-automation, carries FOUR unanswered owner forks and the sentence "DO NOT QUEUE
// without a fresh owner ruling on all four forks" — and both the drain path and the --queue path
// answered `? UNKNOWN` at rc=0 for every spelling of a bt-04 master, which §3.0 states in terms
// "reads as permission ... the precise failure §3.0 exists to prevent".
//
// The lesson is not "that leaf was mis-registered" — it was registered exactly as intended, for
// visibility, and had a valid blockClass, so THIS file passed it and the board read green. The
// lesson is that a guard's green is only worth its denominator, and two guards over one subject
// must be tied together or they drift apart silently. This test is that tie.
test('every blocked leaf is visible to the §3.0 drain guard (denominator parity)', (t) => {
  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);
  const mine = blockedLeaves();
  // Same-tree assertion: both this walker and the child read the current main worktree's board.
  // Pointing only the child at main would compare two denominators and manufacture a verdict.
  const r = spawnSync('node', ['scripts/drain-block-check.mjs', '--all'], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
  const m = /Scanned \d+ goal leaves — (\d+) BLOCKED/.exec(r.stdout || '');
  assert.ok(m, `--all did not print its census; got: ${(r.stdout || r.stderr || '').slice(0, 200)}`);
  assert.strictEqual(
    Number(m[1]),
    mine.length,
    `this guard sees ${mine.length} blocked leaves but drain-block-check --all reports ${m[1]}. ` +
      `A blocked leaf invisible to that script cannot stop a drain or a queue, so the block is ` +
      `decorative — F-1597-1. Fix the collector's denominator, never this assertion.`
  );
});

// Every blocked leaf must be REACHABLE by the name a fire would actually type. An unkeyed leaf is
// matched by its id (F-1597-1); a keyed one by its taskFile. Either way the answer must be rc=1.
test('every blocked leaf refuses the drain under the name a fire would type', (t) => {
  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);
  for (const leaf of blockedLeaves()) {
    const needle = leaf.taskFile || leaf.id;
    // Same-tree assertion: the local leaf's typed name is checked against that same main board.
    // A linked worktree cannot lawfully supply drain-block-check's board, so it is declared above.
    const r = spawnSync('node', ['scripts/drain-block-check.mjs', needle], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
    assert.strictEqual(
      r.status,
      1,
      `"${needle}" (leaf ${leaf.id}) is status="blocked" but drain-block-check exited ${r.status}. ` +
        `rc=0 on this path is an affirmative-looking clearance over an owner-reserved fork.`
    );
  }
});

// Integration: the print branch must actually differ by class. A field nothing reads is decoration.
test('drain-block-check prints class-specific verdicts, and gate-side is not called owner debt', (t) => {
  const gateSide = blockedLeaves().find((l) => l.blockClass === 'gate-side' && l.taskFile);
  if (!gateSide) return; // no gate-side leaf on the board right now; nothing to assert
  if (LINKED_WORKTREE) return t.skip(LINKED_SKIP);
  // Same-tree assertion: wording is checked for the local gate-side leaf on the same main board.
  // This spawn did not red at s2272 only because that frozen board had no gate-side leaf to reach it.
  const r = spawnSync('node', ['scripts/drain-block-check.mjs', gateSide.taskFile], {
    timeout: 240_000, killSignal: 'SIGKILL',
    encoding: 'utf8',
  });
  assert.strictEqual(r.status, 1, 'a blocked leaf must still refuse the drain with rc=1');
  assert.match(r.stdout, /blockClass=gate-side/, 'the verdict must name the class it applied');
  assert.doesNotMatch(
    r.stdout,
    /lifted by the OWNER/,
    'a gate-side hold must NOT be reported as owner debt — that is the whole defect F-1383-1 cured'
  );
});
