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
