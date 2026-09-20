import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const stamp = spawnSync('date', ['+%Y-%m-%dT%H:%MZ'], { encoding: 'utf8' }).stdout.trim();
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z$/.test(stamp)) throw new Error('bad stamp: ' + stamp);

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
if (!lines[0].includes('s1252 fire, lock ACTIVE')) throw new Error('line-1 is not my lock: ' + lines[0].slice(0, 120));

lines[0] = `Last updated: ${stamp} s1252 handoff, lock CLEARED — ` + readFileSync('logs/session-scratch/s1252/line1.txt', 'utf8').trim();
writeFileSync(p, lines.join('\n'));
console.log('handoff line-1 written at ' + stamp);
