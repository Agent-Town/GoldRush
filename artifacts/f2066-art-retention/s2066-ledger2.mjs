import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const stgText = fs.readFileSync('worktrees/art/assets/LEDGER.md', 'utf8');
const mainText = execFileSync('git', ['show', 'main:assets/LEDGER.md'], { encoding: 'utf8', maxBuffer: 1 << 28 });
// Compare by ROW KEY (first table cell) rather than whole-line text.
function rows(t) {
  const m = new Map();
  for (const l of t.split('\n')) {
    if (!l.startsWith('|')) continue;
    const cells = l.split('|').map(c => c.trim());
    const key = cells[1];
    if (!key || key === 'Slot' || /^-+$/.test(key)) continue;
    m.set(key, l.trim());
  }
  return m;
}
const S = rows(stgText), M = rows(mainText);
console.log('staging rows:', S.size, ' main rows:', M.size);
const missing = [...S.keys()].filter(k => !M.has(k));
console.log('\nROW KEYS present in staging but ABSENT from main:', missing.length);
for (const k of missing) console.log('   |', k);
const differ = [...S.keys()].filter(k => M.has(k) && M.get(k) !== S.get(k));
console.log('\nROW KEYS in BOTH but with different text:', differ.length);
for (const k of differ.slice(0, 8)) {
  console.log('   KEY:', k);
  console.log('     stg :', S.get(k).slice(0, 190));
  console.log('     main:', M.get(k).slice(0, 190));
}
// non-table prose lines unique to staging
const mainSet = new Set(mainText.split('\n').map(l => l.trim()));
const prose = stgText.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('|') && !mainSet.has(l));
console.log('\nNON-TABLE staging lines absent from main:', prose.length);
for (const l of prose.slice(0, 10)) console.log('   |', l.slice(0, 160));
