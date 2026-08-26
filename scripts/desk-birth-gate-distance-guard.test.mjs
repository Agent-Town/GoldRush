// desk-birth-gate-distance-guard — F-2255-1.
//
// SUBJECT: ownerGateDecidedAt() in desk-birth-guard.mjs, and the seam it created
// at its call site in analyse() (F-2209-1: extracting a decision creates a NEW
// untested seam — the call site — so test from where the caller stands).
//
// WHY IT EXISTS. gateOf() is documented as "a row's GATE clause" and returns the
// whole row tail (last `GATE:` -> end of line); a BACKLOG row is one line of up to
// ~8k chars. So isOwnerGate() reads thousands of characters of trailing prose,
// which is exactly where past owner rulings are CITED — a RECORD wearing an
// INTENT's shape (s2247's lesson, one file over). Measured s2255 on the live
// ledger: 69 admitted rows, deciding offset p50 0 / p75 15 / p95 162, then a thin
// tail of 407 / 2971 / 3284 — and all three of the tail are FALSE POSITIVES whose
// gate clause literally opens `GATE: none`.
//
// THE LOAD-BEARING ARM IS THE REVERSE CONTROL (arms 7 and 8). The obvious "real"
// cure is to bound gateOf() or to drop far-decided rows. That is the PERMISSIVE
// direction in a gate whose whole purpose is that "an owner fork on no desk is on
// no board Robin reads": a false RED is waived with DESK-NOT-OWED in one line, a
// false GREEN is silent forever. So membership must NOT depend on the distance,
// and these arms fail if a later fire turns this declaration into a cutoff.

import test from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('./desk-birth-guard.mjs');
const { isOwnerGate, gateOf, analyse, ownerGateDecidedAt } = mod;

const DESK_LINE1 = 'Last updated: 2026-01-01T00:00Z s1 handoff, lock CLEARED — OWNER’S DESK — 0 awaiting a word.';
const row = (body) => `🔺 **F-9999-1** — a manufactured row. ${body}`;

test('a GATE: OWNER row is decided at the gate marker itself, not somewhere downstream', () => {
  const text = row('GATE: OWNER — one word picks it.');
  const gate = gateOf(text);
  assert.equal(isOwnerGate(gate), true);
  assert.equal(ownerGateDecidedAt(gate), 0, 'the ALT form matches at the GATE: marker, offset 0');
});

test('a positive owner verb is reported AT ITS OFFSET, not as a bare boolean', () => {
  const gate = gateOf(row('GATE: land it when the owner rules on the fork.'));
  const at = ownerGateDecidedAt(gate);
  assert.equal(isOwnerGate(gate), true);
  assert.ok(at > 0, `expected a positive offset, got ${at}`);
  assert.match(gate.slice(at), /^owner rules/i, 'the offset must point AT the deciding words');
});

test('a NON-owner gate reports -1 — the two functions must agree in both directions', () => {
  const gate = gateOf(row('GATE: drain when lane-b reports green.'));
  assert.equal(isOwnerGate(gate), false);
  assert.equal(ownerGateDecidedAt(gate), -1);
});

test('a NEGATED owner verb does not decide (F-1551-4 disclaimer handling is preserved)', () => {
  const gate = gateOf(row('GATE: none — no owner ruling is needed for this measurement.'));
  assert.equal(isOwnerGate(gate), false, 'a disclaimer is not a gate');
  assert.equal(ownerGateDecidedAt(gate), -1, 'and it must not report an offset either');
});

test('the NEAREST admission wins when both forms match — a far incidental cite must not mask a real gate', () => {
  // F-1608-2 / F-1120-2 are the live shape: `GATE: OWNER` at 0 PLUS a far cite.
  const gate = gateOf(row(`GATE: OWNER — one word picks it.${' filler.'.repeat(120)} the owner ruling was propagated s1655.`));
  assert.equal(ownerGateDecidedAt(gate), 0, 'reporting the far cite would slander a genuine gate as a false positive');
});

test('THE LIVE FALSE-POSITIVE SHAPE: `GATE: none` admitted by a distant recorded ruling reports a large offset', () => {
  const gate = gateOf(row(`GATE: none — this row is a completion.${' filler.'.repeat(200)} OWNER RULING PROPAGATED s1655.`));
  const at = ownerGateDecidedAt(gate);
  assert.equal(isOwnerGate(gate), true, 'it is still admitted — this cure does not change membership');
  assert.ok(at > 162, `the whole point is that this is visibly far: got ${at}`);
});

test('REVERSE CONTROL: a far-decided row still QUALIFIES — the distance must never gate membership', () => {
  const far = row(`GATE: none — this row is a completion.${' filler.'.repeat(200)} OWNER RULING PROPAGATED s1655.`);
  const result = analyse(DESK_LINE1, [far]);
  assert.equal(result.kind, 'window');
  assert.equal(result.qualifying.length, 1, 'dropping far-decided rows is the PERMISSIVE direction — forbidden');
  assert.equal(result.missing.length, 1, 'and it must still be reported as owed a desk');
});

test('REVERSE CONTROL: a NEAR-decided row is unaffected — the cure is additive, not selective', () => {
  const near = row('GATE: OWNER — one word picks it.');
  const result = analyse(DESK_LINE1, [near]);
  assert.equal(result.qualifying.length, 1);
  assert.equal(result.missing.length, 1);
});

test('THE SEAM (F-2209-1): analyse() attaches decidedAt to EVERY qualifying row', () => {
  const rows = [
    row('GATE: OWNER — one word picks it.'),
    row('GATE: land it when the owner rules on the fork.'),
    row('GATE: drain when lane-b reports green.'), // not admitted at all
  ];
  const { qualifying } = analyse(DESK_LINE1, rows);
  assert.equal(qualifying.length, 2, 'the non-owner row must not qualify');
  for (const r of qualifying) {
    assert.equal(typeof r.decidedAt, 'number', 'a qualifying row with no decidedAt makes the FAIL output print undefined');
    assert.notEqual(r.decidedAt, -1, 'a QUALIFYING row decided nowhere means the two functions have drifted apart');
  }
});

// ---------------------------------------------------------------------------
// F-2331-1 — THE SHAPE THE DISTANCE DIAGNOSTIC CANNOT SEE, AND WHY THE OBVIOUS
// CURE IS MEASURED UNSAFE.
//
// s2330 censused the "spurious GATE: from a citation" class and closed it at
// "exactly ONE live row ... s2329's instance was the only one". That census is
// DETECTOR-SCOPED: it looked for a gate clause OPENING with a backticked path.
// A sibling shape exists and it was not in the denominator — the `GATE:` TOKEN
// ITSELF inside a code span, i.e. a row QUOTING another finding's gate clause.
// Measured s2331 over the live ledger: 16 rows select such a token, and ONE
// (F-1310-1, a ✅ closed row from s1310) is ADMITTED on it.
//
// IT IS INVISIBLE TO ownerGateDecidedAt() BY CONSTRUCTION. A quoted clause head
// decides at offset 0 — and 0 is the DOMINANT HEALTHY value (51 of 73 admitted
// rows, 50 of them legitimate `GATE: OWNER …` / `GATE: owner picks …` heads).
// So the spurious admission reports the single most reassuring distance the
// diagnostic can print. Distance cannot discriminate this shape at any cutoff.
//
// AND THE ONE-CHARACTER CURE IS NOT A STRICT IMPROVEMENT — measured before it
// was proposed, not after (F-1274-2). Skipping backtick-preceded tokens changes
// the gate text of 16 rows and flips exactly TWO verdicts IN OPPOSITE
// DIRECTIONS: F-1310-1 out (correct) and F-2073-1 IN — a row whose exposed
// earlier gate is an owner ask the owner already DISCHARGED, i.e. the PERMISSIVE
// direction this file exists to refuse. The admitted COUNT is 73 before and 73
// after, so a headline-count neutrality check calls it behaviour-neutral while
// the SET changes underneath: ask for the DIFF, never the tally.
// ⚖️ SEVERITY, HONESTLY: LATENT. analyse() examines only rows BORN in the
// window, and F-1310-1 can never re-enter one. The direction is a false RED with
// a documented DESK-NOT-OWED waiver. No verdict on the live board was wrong.
// ➡️ DECLARED, NOT CURED — and the reason is measured rather than stylistic.

const quotedRow = row('It quotes a sibling clause, `GATE: owner picks (a) or (b)`, and adds nothing of its own.');
const dischargedRow = row('GATE: owner picks (a) or (b). ✅ OWNER RULED 2026-08-09. A later probe greps for `GATE:` and finds none.');

// The candidate cure, kept HERE rather than in the guard: skip a `GATE:` token
// that is lexically inside a code span.
const curedGateOf = (text) => {
  const U = text.toUpperCase();
  let i = U.lastIndexOf('GATE:');
  while (i !== -1) {
    if (text[i - 1] !== '`') return text.slice(i);
    i = U.lastIndexOf('GATE:', i - 1);
  }
  return '';
};

test('F-2331-1: a QUOTED gate clause is admitted, and reports the same offset 0 as a real one', () => {
  const gate = gateOf(quotedRow);
  assert.ok(gate.startsWith('GATE: owner picks'), 'gateOf selects the token inside the code span');
  assert.equal(isOwnerGate(gate), true, 'the quotation is admitted as an owner gate');
  assert.equal(ownerGateDecidedAt(gate), 0, 'and decides at 0 — the same value a genuine GATE: OWNER head reports');
  // The point of the arm: 0 is not evidence of a sound admission.
  assert.equal(ownerGateDecidedAt(gateOf(row('GATE: OWNER — one word picks it.'))), 0);
});

test('F-2331-1: analyse() acts on it — a quoted gate reaches `missing` and reds the fire', () => {
  const { qualifying, missing } = analyse(DESK_LINE1, [quotedRow]);
  assert.equal(qualifying.length, 1, 'the quoted row qualifies as owner-gated');
  assert.equal(missing.length, 1, 'and with no desk entry it becomes a FAIL — a false RED, not a silent green');
});

test('F-2331-1 REVERSE CONTROL: the backtick-skip cure flips verdicts BOTH ways, so it is refused', () => {
  // Direction 1 — it removes the spurious admission. This is the half that tempts.
  assert.equal(isOwnerGate(gateOf(quotedRow)), true);
  assert.equal(isOwnerGate(curedGateOf(quotedRow)), false, 'the cure drops the quoted admission');

  // Direction 2 — and it ADDS one, by exposing an earlier, already-discharged
  // owner gate. This is the permissive direction the file header forbids.
  assert.equal(isOwnerGate(gateOf(dischargedRow)), false, 'live: the trailing code span is not an owner gate');
  assert.equal(isOwnerGate(curedGateOf(dischargedRow)), true, 'cured: a discharged owner ask is newly admitted');

  // So the two changes cancel in any COUNT and do not cancel in the SET. A fire
  // that ships the cure must re-measure the flips by name, not by tally.
});

test('AGREEMENT INVARIANT over the LIVE ledger: decidedAt !== -1 exactly when isOwnerGate is true', async () => {
  // F-2228-1's lesson: two implementations of one rule drift, and the drift is
  // silent. This arm re-derives both over the real corpus rather than fixtures.
  const fs = await import('node:fs');
  const lines = fs.readFileSync(new URL('../tasks/BACKLOG.md', import.meta.url), 'utf8').split('\n');
  const rows = lines.filter((l) => /^\s*(\u{1F53A}|✅|⛔|\u{1F7E1})/u.test(l) || /\*\*F-/.test(l));
  assert.ok(rows.length > 500, `the corpus must be real, got ${rows.length} rows`);
  let admitted = 0;
  for (const text of rows) {
    const gate = gateOf(text);
    if (!gate) continue;
    const ok = isOwnerGate(gate);
    if (ok) admitted += 1;
    assert.equal(ok, ownerGateDecidedAt(gate) !== -1, `disagreement on: ${gate.slice(0, 80)}`);
  }
  assert.ok(admitted > 0, 'an agreement check over zero admissions is vacuous');
});
