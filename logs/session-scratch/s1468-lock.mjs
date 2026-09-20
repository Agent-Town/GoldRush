// s1468: take the fire lock. Reads STATUS.md, archives line-1, writes new ACTIVE line-1.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const P = 'STATUS.md';
const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
const lines = readFileSync(P, 'utf8').split('\n');
const prev = lines[0];
writeFileSync('logs/session-scratch/s1468-prev-line1.txt', prev + '\n');

const intent = 'lane-b finishing f1467-1-alpha-recipe-ab; drain it, then board duties';
lines[0] = `ACTIVE ${stamp} (s1468 fire) — ${intent}`;
// archive previous line-1 as a bullet immediately after line-1 (house convention)
lines.splice(1, 0, `- **s1467 handoff (line-1 archive):** ${prev}`);
writeFileSync(P, lines.join('\n'));
console.log('stamp', stamp);
console.log('new line1:', lines[0]);
