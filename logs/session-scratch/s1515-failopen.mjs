// Does the TITLE_DECL pollution make the guard FAIL OPEN — i.e. is any live
// CARRIES-TITLE verdict carried by a string that is NOT a test title at all?
// Uses the guard copy's `carried` field, which is the exact string the guard accepted.
import fs from 'node:fs';
import path from 'node:path';
import { scan } from './s1515-guard-copy.mjs';

const DECL = /^\s*(?:test|it)((?:\.\w+)*)\s*\(\s*(['"`])([\s\S]*?)\2/gm;
const REAL = new Set(['', '.skip', '.only', '.fixme', '.slow', '.describe', '.describe.skip',
  '.describe.only', '.describe.serial', '.describe.parallel', '.describe.configure', '.fail']);

const pollutedBySpec = new Map();
for (const f of fs.readdirSync('e2e').filter((x) => x.endsWith('.spec.ts'))) {
  const text = fs.readFileSync(path.join('e2e', f), 'utf8');
  DECL.lastIndex = 0;
  let m;
  const set = new Set();
  while ((m = DECL.exec(text))) if (!REAL.has(m[1])) set.add(m[3]);
  if (set.size) pollutedBySpec.set('e2e/' + f, set);
}

const rows = scan();
const carriers = rows.filter((r) => r.verdict === 'CARRIES-TITLE');
console.log('CARRIES-TITLE rows:', carriers.length);

const failOpen = [];
for (const r of carriers) {
  const bad = pollutedBySpec.get(r.spec);
  if (bad && bad.has(r.carried)) failOpen.push(r);
}
console.log('\n=== FAIL-OPEN CHECK ===');
console.log('rows whose accepted title is NOT a test title:', failOpen.length);
for (const r of failOpen.slice(0, 10)) {
  console.log(`  ${r.file}:${r.mdLine}  ${r.spec}  carried=${JSON.stringify(r.carried)}`);
}

// Second axis: how many polluted strings are even ELIGIBLE (>=12 chars, the QUOTED floor)?
let eligible = 0;
for (const set of pollutedBySpec.values()) for (const s of set) if (s.length >= 12 && s.length <= 160) eligible++;
console.log('\npolluted strings long enough to be captured at all (>=12 chars):', eligible);
console.log(failOpen.length === 0
  ? '\nVERDICT: pollution is LATENT, not live — no citation currently exploits it.'
  : '\nVERDICT: pollution is LIVE — the guard is passing citations that name no test.');
