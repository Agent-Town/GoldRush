import fs from 'node:fs';
import { execSync } from 'node:child_process';
const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const prev = lines[0];
// §1.3: stamps come from a command, never from arithmetic
const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
if (!/^Last updated:/.test(prev)) { console.error('UNEXPECTED line-1:', prev.slice(0, 80)); process.exit(2); }
const bullet = '- **s1515 handoff (line-1 archive):** ' + prev.replace(/^Last updated:\s*/, '');
let idx = -1;
for (let i = 1; i < lines.length; i++) { if (lines[i].includes('(line-1 archive)')) { idx = i; break; } }
if (idx === -1) { console.error('no archive bullet anchor found'); process.exit(2); }
lines[0] = 'ACTIVE ' + stamp + ' (s1516 fire) — lane-a BUSY on f1515-1 attempt 2, no drain available; pricing the F-1510-3 successor then authoring one master for an idle lane.';
lines.splice(idx, 0, bullet);
fs.writeFileSync(P, lines.join('\n'));
console.log('LOCKED. archived s1515 as bullet at line', idx + 1);
