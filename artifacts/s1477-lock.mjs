import fs from 'node:fs';
const stamp = process.argv[2];
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const old = lines[0];
if (!/s1476 handoff/.test(old)) { console.error('UNEXPECTED line1: ' + old.slice(0, 80)); process.exit(2); }
lines[0] = 'Last updated: ACTIVE ' + stamp + ' (s1477 fire) — dry board (all 6 queues empty, no undrained done-move, fleet USABLE); dry-board audit then standing correctives/authoring.';
lines.splice(1, 0, '- **s1476 handoff (line-1 archive):** ' + old);
fs.writeFileSync(p, lines.join('\n'));
console.log('locked ' + stamp);
