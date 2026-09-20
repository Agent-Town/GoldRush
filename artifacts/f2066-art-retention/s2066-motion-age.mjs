import fs from 'node:fs';
import path from 'node:path';
const root = 'worktrees/art/assets/motion-pilot';
const out = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.isFile()) { const s = fs.statSync(p); out.push({ p, m: s.mtimeMs, sz: s.size }); }
  }
}
walk(root);
out.sort((a, b) => b.m - a.m);
const iso = ms => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
console.log('files:', out.length, ' totalMB:', (out.reduce((t, f) => t + f.sz, 0) / 1048576).toFixed(2));
console.log('NEWEST 5:');
for (const f of out.slice(0, 5)) console.log('  ', iso(f.m), f.p);
console.log('OLDEST 3:');
for (const f of out.slice(-3)) console.log('  ', iso(f.m), f.p);
// histogram by day
const byDay = new Map();
for (const f of out) { const d = iso(f.m).slice(0, 10); byDay.set(d, (byDay.get(d) || 0) + 1); }
console.log('BY DAY:');
for (const [d, n] of [...byDay].sort()) console.log('  ', d, n);
