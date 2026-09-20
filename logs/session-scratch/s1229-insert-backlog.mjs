// s1229 — insert the F-1229-1 ledger entry into tasks/BACKLOG.md, newest-first,
// directly above the s1228 entry it supersedes-in-sequence. Anchors on existing
// text and throws rather than guess.
import fs from 'node:fs';

const P = 'tasks/BACKLOG.md';
const ANCHOR = '🛠️ **F-1228-1 (s1228, CURED IN THIS COMMIT)';

let s = fs.readFileSync(P, 'utf8');
const entry = fs.readFileSync('logs/session-scratch/s1229-backlog-entry.md', 'utf8').trim();

if (s.includes('F-1229-1')) throw new Error('F-1229-1 already present');
const i = s.indexOf(ANCHOR);
if (i === -1) throw new Error('anchor not found');

s = `${s.slice(0, i)}${entry}\n\n${s.slice(i)}`;
fs.writeFileSync(P, s);
console.log('inserted F-1229-1 above the s1228 entry');
