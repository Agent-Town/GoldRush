import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const R = '/Users/robin/Claude/Projects/Gold Rush';
const LANE = R + '/worktrees/lane-a';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8', cwd: R });
const gl = (...a) => execFileSync('git', a, { encoding: 'utf8', cwd: LANE });

// 1. commit the citation fix (:200 -> :201) BEFORE refreshing the lane
g('add', 'tasks/lane-f1630-1-m1-06-weighting-timeout.md');
execFileSync('git', ['commit', '-m',
  'task: f1630-1 citation fix — the ratio assertion is at :201, not :200\n\n' +
  'Caught by measuring instead of trusting my own draft: the very fire that spent its drain\n' +
  'documenting that citations rot wrote a coordinate one line off. Fixed before dispatch, so\n' +
  'the runner reads a firewall it can actually verify.'
], { cwd: R });
console.log('citation fix committed:', g('log', '-1', '--format=%h').trim());

// 2. refresh the lane to main (ahead=0, so nothing can be lost; verified by lane-usable)
console.log('lane before:', gl('log', '-1', '--format=%h').trim());
gl('checkout', '-B', 'lane/a', 'main');
gl('clean', '-fd');
console.log('lane after :', gl('log', '-1', '--format=%h').trim());
console.log('main..lane/a:', JSON.stringify(g('log', '--oneline', 'main..lane/a')));
console.log('lane..main  :', JSON.stringify(g('log', '--oneline', 'lane/a..main')));

// 3. verify every key the master tells the runner to check — in the REFRESHED lane
const spec = LANE + '/e2e/m1-06-level-up-choices.spec.ts';
const lines = fs.readFileSync(spec, 'utf8').split('\n');
const at = (n) => (lines[n - 1] || '').trim();

console.log('\n--- keys in the refreshed lane ---');
// the SEQUENCING LAW grep (this is the one that gates the runner's STOP)
const logOut = gl('log', '--oneline');
const seqHits = logOut.split('\n').filter((l) => l.includes('m1-06 cap fixtures follow the three-stack ceiling')).length;
console.log('SEQUENCING key hits in lane git log:', seqHits, '(must be >= 1)');

console.log(':177  ', at(177).slice(0, 80));
console.log(':194  ', at(194));
console.log(':197  ', at(197));
console.log(':201  ', at(201));
console.log(':236  ', at(236).slice(0, 70));
console.log(':239  ', at(239));
const cfg = fs.readFileSync(LANE + '/playwright.config.ts', 'utf8').split('\n');
console.log('cfg:49', (cfg[48] || '').trim());
console.log('setTimeout count in spec:', (fs.readFileSync(spec, 'utf8').match(/setTimeout/g) || []).length, '(expect 1 pre-cure)');

// and the same keys on main, so a mismatch is attributable
const mainSpec = g('show', 'main:e2e/m1-06-level-up-choices.spec.ts').split('\n');
const mAt = (n) => (mainSpec[n - 1] || '').trim();
console.log('\n--- same keys on main (must match the lane exactly) ---');
for (const n of [177, 194, 197, 201, 236, 239]) {
  const same = mAt(n) === at(n);
  console.log(':' + n, same ? 'MATCH' : 'DIFFER -> ' + JSON.stringify(mAt(n)));
}
