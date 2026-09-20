// s1225 — take the lock without retyping a 15k-char line-1.
// Moves the prior line-1 down as a byte-exact archive bullet.
import fs from 'fs';

const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');

// 1. lift the s1225 lock text out of the bullet slot it was drafted into
const bulletIdx = lines.findIndex(l => l.startsWith('- **s1225 ACTIVE lock (line-1 archive):**'));
if (bulletIdx === -1) throw new Error('s1225 draft bullet not found');
const myLock = lines[bulletIdx].replace('- **s1225 ACTIVE lock (line-1 archive):** ', '');
lines.splice(bulletIdx, 2); // the bullet + its trailing blank

// 2. archive the old line-1 byte-exact, install the new one
const old = lines[0];
if (!old.startsWith('Last updated: 2026-07-29T21:49Z s1224 handoff')) {
  throw new Error('unexpected line-1: ' + old.slice(0, 80));
}
lines[0] = myLock;
lines.splice(2, 0, '- **s1224 handoff (line-1 archive):** ' + old, '');

fs.writeFileSync(p, lines.join('\n'));
console.log('new line-1:', lines[0].slice(0, 130));
console.log('archive @3:', lines[2].slice(0, 90));
