import fs from 'node:fs';
import { execSync } from 'node:child_process';

const stamp = execSync('date "+%Y-%m-%dT%H:%MZ"').toString().trim();
const body = fs.readFileSync('artifacts/s1378-handoff.txt', 'utf8').replace(/\n+$/, '');
const p = 'STATUS.md';
const L = fs.readFileSync(p, 'utf8').split('\n');

if (!L[0].includes('(s1378 fire) ACTIVE')) { console.log('ABORT: line-1 is not my lock: ' + L[0].slice(0, 80)); process.exit(1); }
const lock = L[0];
L[0] = 'Last updated: ' + stamp + ' s1378 handoff, lock CLEARED — ' + body;
L.splice(1, 0, '- **s1378 lock (line-1 archive):** ' + lock);
fs.writeFileSync(p, L.join('\n'));
console.log('handoff written, stamp=' + stamp);
