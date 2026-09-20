// s1588 handoff: replace line-1 with the handoff line and archive the LOCK line as a bullet.
// §4's duty is about the END STATE, so this asserts it rather than assuming: s1587's handoff
// archive must still be present exactly once when we are done (the s1472 trap was a helper
// that archived the wrong line and silently dropped its predecessor's whole handoff).
import fs from 'node:fs';

const path = 'STATUS.md';
const lines = fs.readFileSync(path, 'utf8').split('\n');
const lockLine = lines[0];

if (!lockLine.startsWith('ACTIVE')) {
  console.error('REFUSE: line 1 is not an ACTIVE lock — nothing to archive, wrong state');
  process.exit(2);
}
if (!lockLine.includes('s1588')) {
  console.error('REFUSE: line 1 is not s1588\'s lock line');
  process.exit(2);
}

const handoff = fs.readFileSync('artifacts/s1588-handoff-line1.txt', 'utf8').replace(/\n+$/, '');
lines[0] = handoff;

// Archive the lock line immediately above the predecessor's handoff archive, matching the
// house ordering (newest first).
const anchor = lines.findIndex((l, i) => i > 0 && l.startsWith('- **s1587 handoff (line-1 archive):**'));
if (anchor === -1) {
  console.error('REFUSE: s1587 handoff archive is missing — would leave a predecessor unarchived');
  process.exit(2);
}
lines.splice(anchor, 0, `- **s1588 lock line (archived):** ${lockLine}`);

fs.writeFileSync(path, lines.join('\n'));

// Assert the end state §4 actually requires.
const after = fs.readFileSync(path, 'utf8');
const count = (s) => (after.match(new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
const prev = count('s1587 handoff (line-1 archive)');
const mine = count('s1588 lock line (archived)');
console.log(`s1587 handoff archive present: ${prev} (expect 1)`);
console.log(`s1588 lock line archived     : ${mine} (expect 1)`);
console.log(after.split('\n')[0].slice(0, 120));
process.exit(prev === 1 && mine === 1 ? 0 : 1);
