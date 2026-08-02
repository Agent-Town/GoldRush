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

function blockedLeaves() {
  const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
  const out = [];
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.status === 'blocked') out.push(n);
    for (const k of [].concat(n.subgoals || [], n.tasks || [])) walk(k);
  })({ subgoals: g.goals || [] });
  return out;
}

test('every blocked leaf declares a valid blockClass', () => {
  const leaves = blockedLeaves();
  assert.ok(leaves.length > 0, 'expected at least one blocked leaf; walker may be broken');
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

// Integration: the print branch must actually differ by class. A field nothing reads is decoration.
test('drain-block-check prints class-specific verdicts, and gate-side is not called owner debt', () => {
  const gateSide = blockedLeaves().find((l) => l.blockClass === 'gate-side' && l.taskFile);
  if (!gateSide) return; // no gate-side leaf on the board right now; nothing to assert
  const r = spawnSync('node', ['scripts/drain-block-check.mjs', gateSide.taskFile], {
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
