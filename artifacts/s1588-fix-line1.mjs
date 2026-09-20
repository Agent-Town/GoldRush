// s1588: replace line-1 ONLY (archives already correct from the handoff commit).
// Guards this against the s1472 trap by refusing unless line 1 is already s1588's handoff.
import fs from 'node:fs';

const path = 'STATUS.md';
const lines = fs.readFileSync(path, 'utf8').split('\n');

if (!lines[0].startsWith('Last updated:') || !lines[0].includes('s1588 handoff')) {
  console.error('REFUSE: line 1 is not s1588\'s handoff line — wrong state, not touching it');
  process.exit(2);
}

lines[0] = fs.readFileSync('artifacts/s1588-handoff-line1.txt', 'utf8').replace(/\n+$/, '');
fs.writeFileSync(path, lines.join('\n'));

const after = fs.readFileSync(path, 'utf8');
const count = (s) => (after.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
console.log(`s1587 handoff archive : ${count('s1587 handoff (line-1 archive)')} (expect 1)`);
console.log(`s1588 lock archived   : ${count('s1588 lock line (archived)')} (expect 1)`);
console.log(`DESK-DROPPED present  : ${count('DESK-DROPPED: F-1584-2')} (expect 1)`);
