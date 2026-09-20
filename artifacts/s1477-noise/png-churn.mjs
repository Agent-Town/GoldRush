// Does the PNG half of the churn reproduce run-to-run, or is it a one-time staleness?
// Decides whether curing the JSONs actually ends the F-1407-1 churn for these two specs.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const WT = '/Users/robin/Claude/Projects/Gold Rush/gate-s1477';
const DIRS = ['artifacts/wire-crawler-3d', 'artifacts/wire-railcar-3d'];
const hashDir = (d) => Object.fromEntries(fs.readdirSync(path.join(WT, d))
  .filter((f) => f.endsWith('.png') && f.startsWith('desktop-chrome'))
  .map((f) => [d + '/' + f, crypto.createHash('sha1')
    .update(fs.readFileSync(path.join(WT, d, f))).digest('hex').slice(0, 12)]));

const snap = () => Object.assign({}, ...DIRS.map(hashDir));

const runSpec = (slice) => {
  try {
    execFileSync('npx', ['playwright', 'test', `e2e/${slice}.spec.ts`,
      '--project=desktop-chrome', '--workers=1', '--reporter=line'],
      { cwd: WT, stdio: 'pipe', encoding: 'utf8' });
    return 0;
  } catch { return 1; }
};

console.log('run A…'); DIRS.forEach((_, i) => {}); runSpec('wire-crawler-3d'); runSpec('wire-railcar-3d');
const a = snap();
console.log('run B…'); runSpec('wire-crawler-3d'); runSpec('wire-railcar-3d');
const b = snap();

let same = 0, diff = [];
for (const k of Object.keys(a)) (a[k] === b[k] ? same++ : diff.push(k));
console.log(`\nPNGs byte-identical across two consecutive runs: ${same}/${Object.keys(a).length}`);
if (diff.length) { console.log('DIFFERING:'); diff.forEach((k) => console.log(`  ${k}  ${a[k]} -> ${b[k]}`)); }
else console.log('=> PNG churn is NOT run-to-run; it is one-time staleness vs the committed copies.');
