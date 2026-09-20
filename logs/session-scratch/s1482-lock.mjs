import fs from 'node:fs';
const P = 'STATUS.md';
const raw = fs.readFileSync(P, 'utf8');
const lines = raw.split('\n');
fs.writeFileSync('logs/session-scratch/s1481-line1.txt', lines[0] + '\n');
import { execSync } from 'node:child_process';
// F-1039-2: stamp comes from a COMMAND, never arithmetic.
const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
lines[0] = `ACTIVE ${stamp} (s1482 fire) — triage: board quiet, all queues empty; settle F-1398-1 predicate or close the smallest real finding.`;
fs.writeFileSync(P, lines.join('\n'));
console.log('saved prior line-1 bytes:', fs.statSync('logs/session-scratch/s1481-line1.txt').size);
console.log('new line-1:', lines[0]);
