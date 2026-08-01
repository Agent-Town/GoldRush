// s1347 measurement for F-1347-1: how often does a ledger row cite a file by BARE
// BASENAME, and can that basename be resolved to exactly one tracked path?
// Run: node archive/scratch/s1347-basename-census.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { probeRow } from '../../scripts/row-quote-currency.mjs';
import { scan } from '../../scripts/findings-state-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean);
const byBase = new Map();
for (const p of tracked) {
  const b = p.split('/').pop();
  if (!byBase.has(b)) byBase.set(b, []);
  byBase.get(b).push(p);
}
const dupes = [...byBase.values()].filter((v) => v.length > 1).length;
console.log(`tracked files ${tracked.length} | distinct basenames ${byBase.size} | basenames with >1 path ${dupes}`);

const text = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
const lines = text.split('\n');
const openLines = new Set();
for (const [, st] of scan(text)) for (const ln of st.open) openLines.add(ln);

let cited = 0, missing = 0, unique = 0, ambiguous = 0, untrackable = 0;
const resolved = [];
for (const ln of [...openLines].sort((a, b) => a - b)) {
  const res = probeRow(lines[ln - 1]);
  cited += res.paths.length;
  for (const m of res.missingPaths) {
    missing++;
    const base = m.split('/').pop();
    const cands = byBase.get(base) || [];
    if (cands.length === 1) { unique++; resolved.push(`${m} -> ${cands[0]}`); }
    else if (cands.length > 1) { ambiguous++; resolved.push(`${m} -> AMBIGUOUS(${cands.length}): ${cands.join(',')}`); }
    else { untrackable++; resolved.push(`${m} -> NO TRACKED FILE`); }
  }
}
console.log(`\ncitations on open rows ${cited} | unresolved ${missing}`);
console.log(`  of the unresolved: unique-basename ${unique} | ambiguous ${ambiguous} | no tracked file ${untrackable}`);
console.log('\n' + resolved.join('\n'));
