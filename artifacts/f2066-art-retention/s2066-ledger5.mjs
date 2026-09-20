import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const stgText = fs.readFileSync('worktrees/art/assets/LEDGER.md', 'utf8');
const mainFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', 'main', 'assets/'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean));

function expand(p) {
  const m = p.match(/^(.*?)\{([^}]*)\}(.*)$/);
  if (!m) return [p];
  return m[2].split(',').flatMap(part => expand(m[1] + part.trim() + m[3]));
}

let totalRefs = 0, onMain = 0;
const missing = [];
for (const l of stgText.split('\n')) {
  if (!l.startsWith('|')) continue;
  const key = l.split('|')[1]?.trim() || '';
  if (!key || key === 'Slot' || /^-+$/.test(key)) continue;
  const raw = [...l.matchAll(/`([^`]*assets\/[^`]+?\.(?:png|mp4|json))`/g)].map(m => m[1]);
  for (const r of raw) {
    for (const p of expand(r)) {
      const norm = p.replace(/^.*?(assets\/)/, '$1');
      totalRefs++;
      if (mainFiles.has(norm)) onMain++;
      else missing.push({ key, norm });
    }
  }
}
console.log('staging-ledger asset references (brace-expanded):', totalRefs);
console.log('  present on main:', onMain);
console.log('  ABSENT from main:', missing.length);
for (const m of missing) console.log('   ', m.norm, '   <-', m.key.slice(0, 55));
