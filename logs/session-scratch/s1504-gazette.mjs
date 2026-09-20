import fs from 'node:fs';
const p = 'marketing/outbox/gazette-queue.md';
const item = `
## The practice yard finally says what it teaches
Every contract card on the tavern board told a prospector what waited inside it — every card but one. The Drill Yard, the ground built for a first-timer, was the only card that showed nothing at all.
It now speaks like the rest: the corner of the river claim it borrows, what stands in the yard, and its two goals and three plain rules — pull the assay-tent lever for practice gold, ring the bell for one small wave, and nothing in the yard reaches the county ledger.
The card reads the same on a small screen as on a wide one, with the rules legible and the gate to the yard unhidden.
merge abcfffb88127640c1709d6ec37033e84f9106ced · reviews/f1501-1-drill-yard-briefing.md · reviews/shots-f1501-1/ (desktop 1280 + mobile 390)
NO OWNER CHOICE — this closes a gap against your own agent-play ruling rather than opening a question. Worth knowing what the drain would not claim: the yard's own test still asserts the card stays silent, so that test is red on the board today and a correction is already queued behind this.
`;
const text = fs.readFileSync(p, 'utf8');
if (text.includes('The practice yard finally says what it teaches')) {
  console.log('already present — no dupe written');
} else {
  fs.writeFileSync(p, text.replace(/\s*$/, '\n') + item);
  console.log('gazette item appended');
}
