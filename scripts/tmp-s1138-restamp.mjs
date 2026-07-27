import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).trim();

lines[0] = `ACTIVE ${stamp} (s1138 fire) — drained vp-02f (eb387ec4); lane-a's town-t6 output next`;
writeFileSync(p, lines.join('\n'));
console.log('restamped:', stamp);
