import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const outgoing = lines[0];
// §1.3: stamps come from a COMMAND, never arithmetic. Local `date`, matching the
// three most recent fires' convention (the trailing Z is the known mislabel).
import { spawnSync } from 'node:child_process';
const stamp = spawnSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).stdout.trim();
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) throw new Error('bad stamp: ' + stamp);
lines[0] = `Last updated: ${stamp} s1252 fire, lock ACTIVE — board dry; sweeping the VACUOUS-PASS CLASS F-1251-2 named (a guard that prints an all-clear over a subject it never read) across the gate guards, by RUNNING each against an empty/missing subject rather than grepping for the shape.`;
// archive outgoing line-1 in the SAME edit that writes the lock (s1251 lesson I)
lines.splice(2, 0, `- **s1251 handoff (line-1 archive):** ${outgoing}`, '');
writeFileSync(p, lines.join('\n'));
console.log('line1 rewritten; archived outgoing len=' + outgoing.length);
