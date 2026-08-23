// desk-carryforward-ack-token-guard — a DESK-DROPPED acknowledgement excuses a
// drop only when it names that id as a WHOLE TOKEN.
//
// F-2231-1 (s2231), executing the aim s2230 handed forward and marked priced but
// UNMEASURED for reachability: "acknowledged() still substring-tests inside its
// 400-char DESK-DROPPED window, so an acknowledgement naming a LONGER id would
// excuse a shorter one — check the reachability before spending a fire on it."
// Checked. It is narrow but REAL, and it is the third file in this family to carry
// the same permissive prefix hazard (F-2229-1 in the ledger row key, F-2230-1 in
// the birth guard's two stacked tests).
//
// THE HAZARD IS PERMISSIVE, AND IT LANDS ON THIS GUARD'S WHOLE REASON FOR EXISTING:
// `.includes` is prefix-tolerant, so a clause naming a LONGER id answers for a
// SHORTER one that left the desk in silence — the exact failure F-1533-1 was built
// to catch, when ten items went out of one desk with no closure and no sentence
// saying why, among them a 527.89 MB retention hole.
//
// PROVEN BY MANUFACTURING, not by a green — each arm asserts it reached kind:'desk'
// with the right id in `dropped`, because an arm that never reaches the branch it
// measures is decoration (s2226) and a green that means "the fixture missed" is
// indistinguishable from a green that means "the code is right" (F-2215-1):
//   - drop F-2131-1, acknowledge only `F-2131-1b` -> as shipped NOT FLAGGED. Both
//     are real ids; F-2131-1b is one of the four live sub-ids F-2230-1 enumerated.
//   - drop F-1260-3, window merely says "F-1260-3s numbering collision"
//     -> as shipped NOT FLAGGED. A PROSE INFLECTION of an id excuses its own silent
//     drop, and fires write those constantly.
//
// SEVERITY, STATED HONESTLY AND NOT INFLATED: LATENT. Replaying all 1,150 keyable
// archived desks in STATUS.md through the exported core, substring and whole-token
// agree on 24 of 24 real acknowledgements out of 4,448 dropped ids — ZERO
// disagreements — so every verdict this guard has ever printed was TRUE. Reachability
// is narrow but real: of the 205 distinct desk ids ever seen, 4 are shadowed by an
// id-shaped token that really occurs on a desk line (F-2131-1 by F-2131-1a and
// F-2131-1b, plus F-1260-3 and F-1210-5 by their own prose inflections). The defect
// is that the guard could not tell you when that stopped being true.
//
// THE RESIDUE IS DELIBERATE AND MEASURED — F-2231-2, arm 6 below. The 400-char
// window admits a CROSS-REFERENCE, and whole-token does NOT cure that. Do not
// "fix" it by narrowing the window without re-reading that arm's comment: the
// measurement refutes the obvious cure.
//
// Run: node --test scripts/desk-carryforward-ack-token-guard.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { analyse, acknowledged } from './desk-carryforward-guard.mjs';
import { carriesId } from './desk-birth-guard.mjs';

const BACKLOG = '# BACKLOG\n(no closures here — a closure would excuse a drop for a different reason)\n';

// Render each item the way a real desk does: F-IDs bolded, slugs BACKTICKED —
// deskItems keys a slug only inside backticks, so a bolded slug keys nothing and
// the fixture would silently test an empty desk. Caught by verdict()'s
// reachability assertion on this file's first run, which is what it is for.
const desk = (items) =>
  `🔺 **OWNER'S DESK — ${items.length} awaiting a word.** ` +
  items.map((i) => (/^F-/.test(i) ? `🔺 **${i}** awaiting a word` : `🔺 \`${i}\` awaiting a word`)).join(' ');

/** A two-desk STATUS fixture: this fire's line-1, then the previous fire's archive. */
function status(liveItems, prevItems, ack = '') {
  const line1 = `Last updated: 2026-08-23T00:00Z s999 handoff, lock CLEARED — did things. ${ack}${desk(liveItems)}`;
  const prev = `- **s998 handoff (line-1 archive):** Last updated: 2026-08-22T00:00Z s998 handoff, lock CLEARED — did things. ${desk(prevItems)}`;
  return [line1, prev].join('\n');
}

/**
 * Assert the fixture reached the branch under test before reading its verdict.
 * s2227's trap: a SKIP is not silence, it DEFEATS the agreeing-silences rule by
 * satisfying it. Here a lock line or an unparsed desk would yield a kind that
 * never evaluates acknowledged() at all.
 */
function verdict(statusText, id) {
  const r = analyse(statusText, BACKLOG);
  assert.equal(r.kind, 'desk', `fixture did not reach kind='desk' (got '${r.kind}')`);
  assert.ok(r.dropped.includes(id), `fixture did not drop ${id} (dropped: ${r.dropped.join(', ') || 'none'})`);
  return { flagged: r.silent.includes(id), result: r };
}

test('a sub-id acknowledgement does NOT excuse the parent it merely prefixes', () => {
  // F-2131-1b is a real live sub-id. Acknowledging it says nothing about F-2131-1.
  const s = status(['F-9000-1'], ['F-9000-1', 'F-2131-1'],
    'DESK-DROPPED: F-2131-1b — closed by the 08-22 sweep. ');
  assert.equal(verdict(s, 'F-2131-1').flagged, true,
    'F-2131-1 left the desk in silence and must be FLAGGED');
});

test('a prose inflection of an id does NOT excuse that id', () => {
  // "F-1260-3s numbering collision" really occurs on a desk line in STATUS.md.
  const s = status(['F-9000-1'], ['F-9000-1', 'F-1260-3'],
    'DESK-DROPPED: F-8888-8 — closed; F-1260-3s numbering collision unrepaired. ');
  assert.equal(verdict(s, 'F-1260-3').flagged, true,
    'F-1260-3 left the desk in silence and must be FLAGGED');
});

test('REVERSE CONTROL — a genuine acknowledgement of the exact id still excuses it', () => {
  // The whole point of the mark. If this reds, the cure has been over-generalised
  // into a guard that reds on lawful handoffs and gets routed around (F-1460-1).
  const s = status(['F-9000-1'], ['F-9000-1', 'F-2131-1'],
    'DESK-DROPPED: F-2131-1 — ruled 08-22 and executing. ');
  assert.equal(verdict(s, 'F-2131-1').flagged, false,
    'an explicit acknowledgement must EXCUSE the drop');
});

test('REVERSE CONTROL — ordinary desk markup around the id must still count as named', () => {
  // The measured asymmetry of carriesId (F-2230-1): a first draft excluded "-" on
  // the LEADING side too and reddened its own ordinary-markup control, because a
  // hyphen-adjacent or bolded mention of a genuinely named id then reads ABSENT.
  // Real acknowledgements are written "DESK-DROPPED: F-1167-1** — ruled ...".
  for (const ack of [
    'DESK-DROPPED: **F-1167-1** — ruled "Prefetch wins". ',
    'DESK-DROPPED: F-1167-1** — ruled "Prefetch wins". ',
    'DESK-DROPPED: `F-1167-1` — ruled "Prefetch wins". ',
    'DESK-DROPPED: 1 — by discharge — F-1167-1 (ruled, so nothing awaits a word). ',
  ]) {
    const s = status(['F-9000-1'], ['F-9000-1', 'F-1167-1'], ack);
    assert.equal(verdict(s, 'F-1167-1').flagged, false, `markup form must still excuse: ${ack}`);
  }
});

test('REVERSE CONTROL — a backticked SLUG item is excused by naming it, not by a longer slug', () => {
  const named = status(['F-9000-1'], ['F-9000-1', 'rf-34-hero-y-restore-roundtrip'],
    'DESK-DROPPED: `rf-34-hero-y-restore-roundtrip` — re-keyed from F-1096-2. ');
  assert.equal(verdict(named, 'rf-34-hero-y-restore-roundtrip').flagged, false,
    'naming the slug must excuse it');

  const longer = status(['F-9000-1'], ['F-9000-1', 'rf-34-hero-y-restore-roundtrip'],
    'DESK-DROPPED: `rf-34-hero-y-restore-roundtrip-v2` — a different thread. ');
  assert.equal(verdict(longer, 'rf-34-hero-y-restore-roundtrip').flagged, true,
    'a LONGER slug must not answer for the shorter one');
});

test('F-2231-2 RESIDUE, DELIBERATE — a cross-reference in another clause still excuses', () => {
  // Modelled verbatim on s2160's real line. This is NOT cured, and the obvious cure
  // is REFUTED BY MEASUREMENT: 21 of 24 real acknowledgements sit at offset 14 (the
  // "DESK-DROPPED: " template), but THREE sit at 51, 67 and 166 — s1590's compound
  // "F-1589-5** (cured ...) **and F-1589-4**" and s1593's count-first "DESK-DROPPED:
  // 2, both by discharge ... — F-1590-1 ... and F-1590-2". Narrowing the window to a
  // subject zone would false-red 12.5% of real acknowledgements (F-1460-1), and a
  // cross-reference and a compound acknowledgement are the SAME BYTES, so no parser
  // can separate them — this file's own header reached that conclusion about aliases.
  // Ask the FIRE, not the parser. This arm PINS the boundary so a later fire cannot
  // narrow the window without confronting the measurement.
  const s = status(['F-9000-1'], ['F-9000-1', 'F-2090-1'],
    'DESK-DROPPED: F-2131-1 — ruled 08-22 and executing — F-2131-1b + F-2090-1, "flip the stakes". ');
  assert.equal(verdict(s, 'F-2090-1').flagged, false,
    'KNOWN RESIDUE (F-2231-2): a whole-token cross-reference still excuses. If this ' +
    'arm reds, someone narrowed the window — re-read the offsets measurement first.');
});

test('acknowledged() uses the SHARED whole-token predicate, not a private copy', () => {
  // F-2227-1 measured that four independent copies of an id predicate is HOW it
  // drifted. If this file grows its own containment test again, these disagree.
  const cases = [
    ['DESK-DROPPED: F-2131-1b — closed. ', 'F-2131-1', false],
    ['DESK-DROPPED: F-2131-1 — closed. ', 'F-2131-1', true],
    ['DESK-DROPPED: **F-2131-1** — closed. ', 'F-2131-1', true],
    ['DESK-DROPPED: F-1260-3s collision. ', 'F-1260-3', false],
  ];
  for (const [line1, id, expected] of cases) {
    assert.equal(acknowledged(line1, id), expected, `acknowledged mismatch: ${line1} / ${id}`);
    assert.equal(carriesId(line1, id), expected, `carriesId disagrees — predicates have drifted: ${line1} / ${id}`);
  }
});

test('the window bound still applies — a mark cannot reach an id 400+ chars away', () => {
  // The window is a real bound, not decoration. Assert it survives the cure, so a
  // future edit that drops the slice() and scans the whole line is caught here.
  const far = `DESK-DROPPED: F-8888-8 — closed.${' filler.'.repeat(80)} F-7777-7 mentioned far away. `;
  assert.ok(far.indexOf('F-7777-7') > 400, 'fixture must place the id beyond the window');
  assert.equal(acknowledged(far, 'F-7777-7'), false,
    'an id beyond the 400-char window is NOT acknowledged');
  assert.equal(acknowledged(far, 'F-8888-8'), true, 'the clause subject still is');
});
