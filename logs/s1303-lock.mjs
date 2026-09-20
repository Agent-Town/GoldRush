import { readFileSync, writeFileSync } from 'node:fs';

const P = 'STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const prev = lines[0];

const stamp = process.argv[2];
const intent = process.argv[3];

lines[0] = `Last updated: ACTIVE ${stamp} (s1303 fire) — ${intent}`;

// archive the previous line-1 as a bullet, placed immediately above the newest existing bullet
let insertAt = lines.findIndex((l, i) => i > 0 && l.startsWith('- **s'));
if (insertAt < 0) insertAt = 2;
lines.splice(insertAt, 0, `- **s1302 handoff (line-1 archive):** ${prev}`);

writeFileSync(P, lines.join('\n'));
console.log('line-1 rewritten; archived previous at bullet index', insertAt);
