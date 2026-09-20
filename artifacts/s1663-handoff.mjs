import fs from 'node:fs';

const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const old = lines[0];
if (!old.startsWith('ACTIVE 2026-08-11T17:46Z (s1663 fire)')) {
  throw new Error(`REFUSE: line-1 is not my own lock: ${old.slice(0, 80)}`);
}
const handoff = fs.readFileSync('artifacts/s1663-handoff.txt', 'utf8').replace(/\n+$/, '');
if (handoff.includes('\n')) throw new Error('REFUSE: handoff must be exactly one line');

// Archive MY OWN lock line — never the inherited handoff bullet (F-1471-3 / s1472).
const archive = `- **s1663 lock (line-1 archive):** ${old}`;
fs.writeFileSync(P, [handoff, archive, ...lines.slice(1)].join('\n'));
console.log('ok: handoff written, own lock archived');
