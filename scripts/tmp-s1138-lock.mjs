import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const old = lines[0];
// §1.3: stamps come from a command, never from arithmetic
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();

lines[0] = `ACTIVE ${stamp} (s1138 fire) — board dry except live lane-b (vp-02f); re-measuring F-1137-4 before authoring its corrective`;

const idx = lines.findIndex((l, i) => i > 0 && l.trim() === '');
lines.splice(idx + 1, 0, `- **s1137 handoff (line-1 archive):** ${old}`, '');

writeFileSync(p, lines.join('\n'));
console.log('lock written:', stamp);
