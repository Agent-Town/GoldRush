/**
 * desk-birth-guard.test.mjs — arms for "did an owner-gated row filed this window
 * reach a desk AT ALL?" (F-1541-2, built s1542).
 *
 * The two claims that matter are the SELECTOR's precision and the guard's
 * ability to fire. Both are driven by the REAL rows the s1542 pricing measured
 * (artifacts/f1541-2-pricing/), not by invented prose: the two true hits
 * (F-AH-1, F-BAL-1) and the two rows the loose selector got wrong (F-FD3-1,
 * F-ER02-11). A selector validated only on text its author wrote is a selector
 * validated against its author's imagination.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyse,
  addedRows,
  deskTail,
  gateOf,
  isLockLine,
  isOwnerGate,
  notOwed,
  rowId,
} from './desk-birth-guard.mjs';

const HEADER = "🔺 **OWNER'S DESK — n awaiting a word.**";
const handoff = (tail) => `Last updated: 2026-08-08T05:26Z s1541 handoff, lock CLEARED — ${tail}`;

// --- REAL GATE TEXT, quoted from tasks/BACKLOG.md ---------------------------
// The two the guard must catch:
const G_BAL1 = 'GATE: owner word (or the census A/B) rules it; until then the finding stands OPEN.**';
const G_AH1 =
  'GATE: MP-07a merged (mixed room refuses cleanly or rides declared), owner answers mp-07 ratification Q1-Q3.**';
// The two the LOOSE selector got wrong — gates that turn on a DRAIN or on being
// fire-authorable, whose prose merely mentions the owner:
const G_FD31 =
  'GATE: none — this is fire-authorable**, being a firewall lift rather than a design fork; the shape has ' +
  'a precedent, and the owner has already ruled the class once.';
const G_ER0211 =
  'GATE: drain when lane-b reports; `now.prospector` present on both doors, `agent-view` 5/5 per project ' +
  'at `--workers=1`, and no owner action is implied.';

test('the SELECTOR admits an owner ACT and refuses a gate that merely says the word', () => {
  // This is the whole 2-of-20 false-positive result from the s1542 pricing,
  // asserted rather than remembered.
  assert.equal(isOwnerGate(G_BAL1), true, 'F-BAL-1 is a pure owner fork');
  assert.equal(isOwnerGate(G_AH1), true, 'F-AH-1 carries an owner half');
  assert.equal(isOwnerGate(G_FD31), false, 'a fire-authorable gate is not owed to Robin');
  assert.equal(isOwnerGate(G_ER0211), false, 'a drain gate is not owed to Robin');
});

// --- F-1551-4: a NEGATED gate is a disclaimer, not an assertion --------------
// Every string below is REAL gate text quoted from tasks/BACKLOG.md, and the
// first one is the row that found the bug: F-1550-1's gate, on a row the fire
// had just CLOSED as merged, read as owner-gated and failed that fire's handoff.
// The old corpus scored "0 in 15" because it contained no negated gate at all —
// a tightened predicate inherits its corpus's blind spots, and "0 in 15" reads
// like a completeness claim when it is a sample.
const G_NEGATED = [
  'GATE: none — no spec, design fork or owner ruling needed.',
  'GATE: none — no spec, design fork or owner word needed.',
  'GATE: none — no owner ruling, no code change.',
  'GATE: none — test-tooling only, no spec or owner ruling needed.',
  'GATE: none — this is a measurement, not an owner decision — any fire can run it.',
];

test('a NEGATED owner gate is a disclaimer and must NOT flag (F-1551-4)', () => {
  for (const g of G_NEGATED) {
    assert.equal(isOwnerGate(g), false, `negated gate read as owner-gated: ${g}`);
  }
});

test('negation handling does not disarm the guard — every positive still flags', () => {
  // The violation arm. A predicate that returns false for everything would pass
  // the test above, so the cure is only proved by BOTH directions holding.
  assert.equal(isOwnerGate(G_BAL1), true, 'a pure owner fork must survive the negation rule');
  assert.equal(isOwnerGate(G_AH1), true, 'an owner half must survive the negation rule');
  assert.equal(
    isOwnerGate('GATE: owner word on (c) alone unblocks it under §7.4.'),
    true,
    'an unqualified owner word must still flag',
  );
});

test('a negation is scoped to its own sentence, so a mixed gate keeps its owner half', () => {
  // F-1268-4's real shape: the measurement needs nobody, the follow-up needs Robin.
  // Checking only the FIRST owner verb would let the negated clause hide the positive one.
  const mixed =
    'GATE: none for the measurement — no owner ruling needed. If the reading lands in the ' +
    '~7–12× row, the plist edit that follows needs an owner decision.';
  assert.equal(isOwnerGate(mixed), true, 'a later positive clause must not be masked by an earlier disclaimer');
});

test('the selector reads the other real owner-gate phrasings on the board', () => {
  for (const g of [
    'GATE: OWNER — a scope question, not a bug report.',
    'GATE: OWNER, one word — the standing prohibition forbids it.',
    'GATE: closes on one owner word; the four FORBIDDEN GREENS in the master stand.',
    'GATE: closes when the owner answers (1)–(4); until then no BT-04 master may be authored.',
    'GATE: closes on an attended or owner ruling, not on a green.',
    'GATE: retires when the owner picks window or rate-limit (and names N).',
    'GATE: owner playtest — watch Twin Banks bandit pathing once and say whether the braid still stalls.',
  ]) {
    assert.equal(isOwnerGate(g), true, `must read: ${g}`);
  }
});

test('and refuses the fire-actionable phrasings that sit beside them', () => {
  for (const g of [
    'GATE: none — CURED; rides the next deploy.',
    'GATE: all four merged in ladder order.',
    'GATE: drain when lane-c reports the done-move; the new arm is the deliverable.',
    'GATE: closed — no live surface now asserts the retired mapping.',
    'GATE: the cross-lane grafts land without a hand-resolved conflict.',
  ]) {
    assert.equal(isOwnerGate(g), false, `must refuse: ${g}`);
  }
});

test('a row is keyed by the id it INTRODUCES, not one its prose cites', () => {
  assert.equal(rowId('🔺 **F-BAL-1 (attended 2026-08-08) — a thing.** cites F-1096-2 later.'), 'F-BAL-1');
  assert.equal(rowId('🔺 **`rf-34-hero-y-restore-roundtrip` OPEN** — the fork s1104 merged.'),
    'rf-34-hero-y-restore-roundtrip');
  // the alpha families the s1533 widening exists for
  assert.equal(rowId('🔺 **F-MILK-SS-3 (attended) — three fields, four claimed.**'), 'F-MILK-SS-3');
});

test('gateOf takes the LAST gate clause, since row prose quotes earlier ones', () => {
  const row = 'body quoting an old **GATE: drain when lane-b reports.** then its own GATE: owner word rules it.';
  assert.equal(isOwnerGate(gateOf(row)), true);
});

test('MANUFACTURED DEFECT — an owner-gated row filed with no desk mention is named', () => {
  // A passing guard never executes its violation path, so a green is not evidence
  // about the red (the s1299/s1300 standard).
  const r = analyse(
    handoff(`${HEADER} 🔺 **F-1000-1 OPEN — something else.**`),
    [`🔺 **F-BAL-1 (attended 2026-08-08) — securable with zero orders.** ${G_BAL1}`],
  );
  assert.equal(r.kind, 'window');
  assert.deepEqual(r.missing.map((m) => m.id), ['F-BAL-1']);
});

test('THE REAL s1540->s1541 EVENT: both undesked owner rows are caught, the six others are not', () => {
  // Ground truth from the s1541 handoff, which found these by hand: seven
  // attended rows were filed on 2026-08-08; SIX were correctly absent from the
  // desk because their gates name a cure master or a fire-actionable condition,
  // and TWO carried an owner word. The guard must reproduce that split exactly —
  // a guard that flags all seven would be worse than none.
  const filed = [
    `🔺 **F-BAL-1 (attended) — zero-order secure.** ${G_BAL1}`,
    `🔺 **F-AH-1 (attended) — rooms diverge.** ${G_AH1}`,
    '🔺 **F-DOOR-1 (attended) — the door is quiet.** GATE: f-door-1 merged.',
    '🔺 **F-DOOR-2 (attended) — a refused build says only FAILED.** GATE: f-door-2 merged; two different lines.',
    '🔺 **F-DOOR-3 (attended) — folded into the door-doc duty.** GATE: none — folded.',
    '🔺 **F-E2S-1 (attended) — the wave ceiling.** GATE: f-e2s-1 merged.',
    '🔺 **F-DOOR-4 (attended) — bench advertised five contracts.** GATE: none — CURED; rides the next deploy.',
  ];
  const r = analyse(handoff(`${HEADER} 🔺 **F-1167-1 OPEN — a fork.**`), filed);
  assert.equal(r.qualifying.length, 2, 'exactly the two owner-gated rows qualify');
  assert.deepEqual(r.missing.map((m) => m.id).sort(), ['F-AH-1', 'F-BAL-1']);
});

test('...and once they are ON the desk, the same window passes', () => {
  const filed = [
    `🔺 **F-BAL-1 (attended) — zero-order secure.** ${G_BAL1}`,
    `🔺 **F-AH-1 (attended) — rooms diverge.** ${G_AH1}`,
  ];
  const r = analyse(
    handoff(`${HEADER} 🔺 **F-BAL-1 OPEN — newly declared.** 🔺 **F-AH-1's OWNER HALF OPEN.**`),
    filed,
  );
  assert.deepEqual(r.missing, []);
});

test('the desk is the LAST desk word, so an upstream PROSE mention does not satisfy it', () => {
  // The item is named early, in the narrative, and the desk itself does not carry
  // it. That is precisely the routing F-1472-1 measured and the desk exists to fix.
  const line = handoff(
    `I filed F-BAL-1 this fire and thought about the OWNER'S DESK. ${HEADER} 🔺 **F-1167-1 OPEN**`,
  );
  const r = analyse(line, [`🔺 **F-BAL-1 (attended) — x.** ${G_BAL1}`]);
  assert.deepEqual(r.missing.map((m) => m.id), ['F-BAL-1']);
});

test('DESK-NOT-OWED excuses an id, and is scoped so it cannot cover an unrelated one', () => {
  const filed = [
    `🔺 **F-BAL-1 (attended) — x.** ${G_BAL1}`,
    `🔺 **F-AH-1 (attended) — y.** ${G_AH1}`,
  ];
  const excused = analyse(
    handoff(`${HEADER} 🔺 **F-1167-1 OPEN** DESK-NOT-OWED: F-BAL-1 — already desked as F-MSD-9. ` +
            'DESK-NOT-OWED: F-AH-1 — superseded by mp-07a.'),
    filed,
  );
  assert.deepEqual(excused.missing, []);

  // One acknowledgement must not cover a second id that merely appears later on
  // the line. Asserted on notOwed directly: routing the claim through analyse()
  // cannot test it, because any id sitting in the desk TAIL is satisfied by
  // membership before the escape hatch is ever consulted — the first draft of
  // this arm made exactly that mistake and passed for the wrong reason.
  assert.equal(notOwed('DESK-NOT-OWED: F-BAL-1 — ruled.', 'F-BAL-1'), true);
  assert.equal(notOwed('DESK-NOT-OWED: F-BAL-1 — ruled.', 'F-AH-1'), false);
  assert.equal(
    notOwed('DESK-NOT-OWED: F-BAL-1 — ruled.' + ' filler'.repeat(90) + ' F-AH-1', 'F-AH-1'),
    false,
    'an id 400+ chars past the mark is not covered by it',
  );

  // And an unexcused, undesked row still fails while its neighbour is excused.
  const partial = analyse(
    handoff(`${HEADER} 🔺 **F-1167-1 OPEN** DESK-NOT-OWED: F-BAL-1 — already desked as F-MSD-9.`),
    filed,
  );
  assert.deepEqual(partial.missing.map((m) => m.id), ['F-AH-1']);
});

test('SKIPS mid-fire on an ACTIVE lock, so drain batteries are unaffected', () => {
  assert.equal(isLockLine('ACTIVE 2026-08-08T06:33Z (s1542 fire) — doing work'), true);
  assert.equal(isLockLine('Last updated: … s1541 handoff, lock CLEARED — done'), false);
  assert.equal(analyse('ACTIVE 2026-08-08T06:33Z (s1542 fire) — x', []).kind, 'lock');
});

test('REFUSES rather than greening when line-1 carries no desk at all', () => {
  const r = analyse(handoff('work happened, no desk written.'), [
    `🔺 **F-BAL-1 (attended) — x.** ${G_BAL1}`,
  ]);
  assert.equal(r.kind, 'no-desk', 'a pass here would mean "I compared against nothing"');
});

test('the backtick header is readable here too — the three desk parsers stay in step', () => {
  // F-1542-1. If this guard's DESK_WORD ever drifts from its two siblings, an
  // owner row would read as undesked purely because of an apostrophe.
  assert.notEqual(deskTail('🔺 **OWNER`S DESK — 8 awaiting a word.** 🔺 **F-1-1**'), null);
  const r = analyse(
    handoff('🔺 **OWNER`S DESK — 1 awaiting a word.** 🔺 **F-BAL-1 OPEN**'),
    [`🔺 **F-BAL-1 (attended) — x.** ${G_BAL1}`],
  );
  assert.deepEqual(r.missing, []);
});

test('addedRows reads the ledger glyphs and ignores diff noise', () => {
  const diff = [
    '+++ b/tasks/BACKLOG.md',
    '+🔺 **F-1-1 (s1) — a new fork.** GATE: owner word rules it.',
    '+✅ **F-2-2 (s1) — cured.** GATE: none.',
    '+',
    '+some ordinary added prose that is not a row',
    '-🔺 **F-3-3 — a REMOVED row must not count.**',
    ' 🔺 **F-4-4 — context, not added.**',
  ].join('\n');
  const rows = addedRows(diff);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map(rowId), ['F-1-1', 'F-2-2']);
});
