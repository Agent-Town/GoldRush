import fs from 'node:fs';
const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const prev = lines[0];
const stamp = process.argv[2];
lines[0] = `ACTIVE ${stamp} (s1039 fire) — close the perf-05 hold: contention-cancelling A/B of :231 ttiMs against main while lane-c still holds the CPU`;
// find the first law/archive bullet line to insert the archive above
let i = 1;
while (i < lines.length && lines[i].trim() === '') i++;
lines.splice(i, 0, `- **s1038 handoff (line-1 archive):** ${prev}`, '');
fs.writeFileSync(P, lines.join('\n'));
console.log('locked; archived prev line-1 at index', i);
