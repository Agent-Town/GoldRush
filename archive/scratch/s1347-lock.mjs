// s1347 generalisation of s1346-lock.mjs: the archive LABEL is now an argument
// rather than a hard-coded session number. s1346's copy said "s1345 handoff" in
// its source while being run by s1346 — harmless there (it archived s1345's line),
// but a fire that copied it blindly would mislabel its own archive bullet.
// Usage: node archive/scratch/s1347-lock.mjs "<new line-1>" "<archive bullet label>"
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const prev = lines[0];
if (!prev.startsWith('Last updated:') && !prev.startsWith('ACTIVE ')) {
  console.error('UNEXPECTED line-1:', prev.slice(0, 80));
  process.exit(2);
}
const newLine1 = process.argv[2];
const label = process.argv[3];
if (!newLine1 || !label) { console.error('need <line-1> <label>'); process.exit(2); }
const archive = '- **' + label + ' (line-1 archive):** ' + prev;
lines.splice(0, 1, newLine1, archive);
writeFileSync(p, lines.join('\n'));
console.log('OK. new line-1 len', newLine1.length, '| archived prev len', prev.length, 'as', label);
