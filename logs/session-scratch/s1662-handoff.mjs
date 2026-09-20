// s1662 handoff: rewrite line 1, archive my own lock line AND restore s1661's
// handoff line-1, which I dropped when I took the lock (§4 — the duty is about the
// END STATE, and the trap is archiving the wrong line). Verifies the count before writing.
// Usage: node s1662-handoff.mjs <path-to-handoff-line1.txt>
import { readFileSync, writeFileSync } from 'node:fs';

const line1Path = process.argv[2];
if (!line1Path) throw new Error('usage: node s1662-handoff.mjs <handoff-line1.txt>');
const newLine1 = readFileSync(line1Path, 'utf8').replace(/\n+$/, '');
if (newLine1.includes('\n')) throw new Error('handoff line-1 must be ONE line');

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');

const myLock = lines[0];
if (!myLock.startsWith('ACTIVE') || !myLock.includes('s1662')) {
  throw new Error('line 1 is not my ACTIVE lock: ' + myLock.slice(0, 80));
}
const s1661Handoff = readFileSync('logs/session-scratch/s1661-line1.txt', 'utf8').replace(/\n+$/, '');
if (!s1661Handoff.includes('s1661 handoff')) throw new Error('saved s1661 line-1 does not look like a handoff');

const rest = lines.slice(1);
const out = [
  newLine1,
  `- **s1662 lock (line-1 archive):** ${myLock}`,
  `- **s1661 handoff (line-1 archive):** ${s1661Handoff}`,
  ...rest,
];

const text = out.join('\n');
// §4's explicit check, run BEFORE writing rather than hoped for after.
const count = (m) => (text.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
const n1661 = count('s1661 handoff (line-1 archive)');
if (n1661 !== 1) throw new Error(`s1661 handoff archive count = ${n1661}, expected 1`);
const n1660 = count('s1660 handoff (line-1 archive)');
if (n1660 !== 1) throw new Error(`s1660 handoff archive count = ${n1660}, expected 1 (must not be disturbed)`);

writeFileSync(P, text);
console.log('handoff written · s1661 handoff archived exactly once · s1660 archive intact · line-1 chars =', newLine1.length);
