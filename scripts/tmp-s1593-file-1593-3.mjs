import fs from 'node:fs';

const bp = 'tasks/BACKLOG.md';
const t = fs.readFileSync(bp, 'utf8');
// A mention is not a declaration: the F-1565-2 closure CITES F-1593-3, so a bare
// substring test false-positives. Check for a row whose SUBJECT is F-1593-3.
if (t.split('\n').some((l) => /^\S*\s*\*\*F-1593-3\b/.test(l))) {
  throw new Error('REFUSE: an F-1593-3 ROW already exists');
}
if (!t.startsWith('\u{1F52C} **F-1593-2')) throw new Error('ANCHOR MISSING: expected F-1593-2 at line 1');

const row = [
  '\u{1F7E1} **F-1593-3 (s1593 2026-08-09, HIT DURING THIS FIRE’S DRY-BOARD AUDIT — A FINDING CLOSED ONLY IN ITS CHILD’S ROW STAYS OPEN TO EVERY READER, AND KEEPS ADVERTISING AN AUTHORING SLOT THAT NO LONGER EXISTS).**',
  '✓ **MEASURED, not inferred:** \`F-1565-2\` read \`OPEN, FIRE-AUTHORABLE\` with a two-part cure and \`GATE: none — fire-authorable\`, which is precisely the shape a fire hunting refill work is told to reach for. **Both halves were already discharged**: half 1 by \`9bfecb997\` (whose merged diff carries a comment naming F-1565-2 verbatim), half 2 by s1572 in a genuine launchd fire shell.',
  '\u{1F511} **The closures existed — they were written into the rows of the findings that DID the work (F-1571-1, F-1572-1), never back into the row that ASKED for it.** F-1571-1’s row literally opens by quoting F-1565-2’s cure text, so both rows were adjacent in any reader’s field of view and the parent still read OPEN.',
  '⚠️ **THIS IS NOT THE SAME DEFECT AS F-1259-2 AND THE DIFFERENCE MATTERS.** F-1259-2 is *the CODE moved underneath a finding* — nothing in the ledger records the cure, so the ledger is self-consistent while being wrong. **Here the ledger CONTAINS the closure and files it under the wrong key.** The cure for F-1259-2 (open the subject file) works but is expensive; the cure here is one edit at closure time, and a reader who only greps for state markers is defeated by both.',
  '\u{1F4A1} **The asymmetry is what makes this recur: the fire that discharges a gate is writing about ITS OWN work, and the parent row is someone else’s.** Every incentive points at the child row; nothing points back. Both the s1572 fire and the s1571 fire did exemplary work and neither closed the parent.',
  '➡️ **PRACTICE (no mechanism proposed, deliberately): when a fire satisfies a gate that ANOTHER finding stated, it edits BOTH rows in the drain commit — the child’s for the evidence, the parent’s for the state.** A closure recorded only in a child row is invisible to the audit that matters (a dry board hunting authorable work).',
  '\u{1F6AB} **NOT mechanised as a guard on purpose:** cross-row causality is a judgement (an unbounded number of rows legitimately cite each other without owing a closure), so a guard here fires constantly and gets excused into uselessness — the \`cross-engine\` fate named in F-1460-1. **The cheap real defence already exists and is \`/author-task\` §0 fact 4: open the subject file before spending your authoring slot.** It worked this fire — it is what caught this.',
  '**Non-blocking. No desk item — this is a practice note, and F-1565-2 itself is now CLOSED.**',
].join(' ');

fs.writeFileSync(bp, row + '\n' + t);
console.log('F-1593-3 filed | +' + row.length + ' chars');
