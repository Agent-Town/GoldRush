// s1468: run nul-audit on main and independently byte-scan the review file s1467 claimed cured.
import { spawnSync } from 'node:child_process';
import { readFileSync as rf } from 'node:fs';

const r = spawnSync('node', ['scripts/nul-audit.mjs'], { encoding: 'utf8' });
console.log('=== nul-audit rc=' + r.status + ' ===');
console.log((r.stdout || '').slice(-3000));
if (r.stderr) console.log('STDERR:', r.stderr.slice(-1500));

// independent byte scan of the named file
const f = 'reviews/f1465-1-nul-delimiters.md';
try {
  const buf = rf(f);
  let n = 0, offs = [];
  for (let i = 0; i < buf.length; i++) if (buf[i] === 0) { n++; if (offs.length < 10) offs.push(i); }
  console.log(`=== byte scan ${f}: ${n} NUL bytes, offsets ${JSON.stringify(offs)} ===`);
} catch (e) { console.log('byte scan failed:', e.message); }
