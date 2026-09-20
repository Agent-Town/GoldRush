import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, execSync } from 'node:child_process';

const mainFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', 'main', 'assets/motion-pilot/'], { encoding: 'utf8', maxBuffer: 1 << 28 }).split('\n').filter(Boolean);
const bySub = new Map();
for (const f of mainFiles) {
  const sub = f.split('/')[2] || '(root)';
  bySub.set(sub, (bySub.get(sub) || 0) + 1);
}
console.log('MAIN tracks assets/motion-pilot/ :', mainFiles.length, 'files');
for (const [s, n] of [...bySub].sort((a, b) => b[1] - a[1])) console.log('   ', s, n);

const root = 'worktrees/art/assets/motion-pilot';
const stg = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.isFile()) stg.push(p);
  }
})(root);
const sBy = new Map();
for (const f of stg) {
  const sub = f.split('/')[4] || '(root)';
  const e = sBy.get(sub) || { n: 0, sz: 0 };
  e.n++; e.sz += fs.statSync(f).size;
  sBy.set(sub, e);
}
console.log('\nSTAGING worktrees/art/assets/motion-pilot/ :', stg.length, 'files');
for (const [s, e] of [...sBy].sort((a, b) => b[1].sz - a[1].sz)) {
  console.log('   ', s, e.n, 'files', (e.sz / 1048576).toFixed(1), 'MB', '| main tracks this subtree:', bySub.has(s) ? bySub.get(s) + ' files' : 'NO');
}

console.log('\n--- the 2 uncontrolled ledger refs ---');
for (const p of ['char-jumper-sheet-rotation2.png', 'plate-e3-boss-crawler.png']) {
  let r = '';
  try { r = execSync('git log --all --oneline --diff-filter=A -- "**/' + p + '" | head -2', { encoding: 'utf8' }).trim(); } catch { r = 'ERR'; }
  console.log(p, '=>', r || '(in NO git ref)');
}
