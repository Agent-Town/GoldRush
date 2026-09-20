import fs from 'node:fs';
const p = 'tasks/BACKLOG.md';
const row = fs.readFileSync('artifacts/s1378-F-1378-1-row.txt', 'utf8').replace(/\n+$/, '');
const L = fs.readFileSync(p, 'utf8').split('\n');

if (L.some(l => l.includes('F-1378-1'))) { console.log('ABORT: F-1378-1 already present'); process.exit(1); }
if (!L[9].startsWith('\u{1F7E2} **F-1377-1')) { console.log('ABORT: line 10 is not F-1377-1: ' + L[9].slice(0, 60)); process.exit(1); }

L.splice(9, 0, row, '');

const marks = [
  ['\u{1F7E2} **F-1376-1 (s1376, MEASURED',
   '✅ **F-1376-1 — CURE LANDED s1378 `782309cb` (its "§7.7 forbids it" premise REFUTED — see F-1378-1); the filed substitution text matched 0 occurrences and was corrected on landing. (s1376, MEASURED'],
  ['\u{1F7E2} **F-1375-1 (s1375, MEASURED',
   '✅ **F-1375-1 — CURE LANDED s1378 `782309cb` (its "§7.7 forbids it" premise REFUTED — see F-1378-1). (s1375, MEASURED'],
  ['\u{1F7E2} **F-1374-1 (s1374, MEASURED',
   '✅ **F-1374-1 — CURE LANDED s1378 `782309cb`; `law-pointer-guard` now REACHES both coordinates (23→25 pointers, 20→22 checked, PASS). Premise REFUTED — see F-1378-1. (s1374, MEASURED'],
];
let hits = 0;
for (let i = 0; i < L.length; i++) {
  for (const [from, to] of marks) {
    if (L[i].startsWith(from)) { L[i] = to + L[i].slice(from.length); hits++; }
  }
}
if (hits !== 3) { console.log('ABORT: retired ' + hits + '/3 rows'); process.exit(1); }

fs.writeFileSync(p, L.join('\n'));
console.log('OK: F-1378-1 inserted at line 10; 3 rows retired to ✅');
