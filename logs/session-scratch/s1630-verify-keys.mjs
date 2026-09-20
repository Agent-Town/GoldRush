import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = R + '/worktrees/lane-a';
const BIG = { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
const g = (...a) => execFileSync('git', a, { ...BIG, cwd: R });
const gl = (...a) => execFileSync('git', a, { ...BIG, cwd: LANE });

const SEQ = 'm1-06 cap fixtures follow the three-stack ceiling';

// the SEQUENCING LAW key — grep git log BY PATTERN (git-side, not a 1MB pipe)
const inLane = gl('log', '--oneline', '--grep=' + SEQ).trim().split('\n').filter(Boolean).length;
const inMain = g('log', '--oneline', '--grep=' + SEQ).trim().split('\n').filter(Boolean).length;
console.log('SEQUENCING key "' + SEQ + '"');
console.log('  hits on main       :', inMain, '(need >= 1)');
console.log('  hits in refreshed lane:', inLane, '(need >= 1)');

const specPath = LANE + '/e2e/m1-06-level-up-choices.spec.ts';
const laneLines = fs.readFileSync(specPath, 'utf8').split('\n');
const mainLines = g('show', 'main:e2e/m1-06-level-up-choices.spec.ts').split('\n');
const at = (arr, n) => (arr[n - 1] || '').trim();

console.log('\n--- cited coordinates: lane vs main ---');
for (const n of [177, 194, 195, 196, 197, 201, 236, 239]) {
  const l = at(laneLines, n);
  const m = at(mainLines, n);
  console.log('  :' + n, l === m ? 'MATCH  ' + l.slice(0, 66) : 'DIFFER lane=' + JSON.stringify(l) + ' main=' + JSON.stringify(m));
}

const cfgLane = fs.readFileSync(LANE + '/playwright.config.ts', 'utf8').split('\n');
const cfgMain = g('show', 'main:playwright.config.ts').split('\n');
console.log('  playwright.config.ts:49', at(cfgLane, 49) === at(cfgMain, 49) ? 'MATCH  ' + at(cfgLane, 49) : 'DIFFER');

const body = fs.readFileSync(specPath, 'utf8');
console.log('\n--- pre-cure counts in the lane (the runner will change these) ---');
console.log('  setTimeout occurrences :', (body.match(/setTimeout/g) || []).length, '(expect 1; must become 2)');
console.log('  "baseHits \\* 2" count   :', (body.match(/baseHits \* 2/g) || []).length, '(expect 1; must stay 1 and unchanged)');
console.log('  "double_tap_coil: 5"    :', (body.match(/double_tap_coil: 5/g) || []).length, '(expect 0 — f1628-3 landed)');
