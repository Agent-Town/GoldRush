import { execFileSync } from 'node:child_process';

const R = '/Users/robin/Claude/Projects/Gold Rush';
const g = (...a) => execFileSync('git', a, { encoding: 'utf8', cwd: R });

g('add', 'tasks/lane-f1630-1-m1-06-weighting-timeout.md', 'tasks/goals.json', 'tasks/BACKLOG.md');

const msg = [
  'task: f1630-1 — m1-06 investment-weighting needs 27.2s of a 30s budget; give it the 45s its LIGHTER sibling already has (fire-authored s1630, goal-registered, self-measured)',
  '',
  'Authored from F-1630-1, which this same fire measured at the f1628-3 drain -- so the',
  'evidence is first-hand, not inherited: 4 pages x 140 rolls on the global 30s default',
  '(playwright.config.ts:49) needing 27.2s = 90.7% of budget. Times out in the fire shell',
  'inside the suite AND solo (not contention); passes at a lifted clock, proving the',
  'assertions are correct. The one-page sibling at :236 already carries setTimeout(45_000).',
  '',
  "The master's real design problem, and why it is written the way it is (F-1590-1/F-1592-1):",
  'THE RUNNER CANNOT OBSERVE THIS RED. The lane shell passes the test at 30s -- that same',
  'runner scored the suite 24/24 there. A before/after cure claim would therefore be vacuous',
  'or invented, so the master forbids one, forbids the measured-unreliable CPU-hog lever, and',
  'instead asks the runner to prove the LEVER by manufacturing a sub-duration timeout, report',
  'the lane-shell durations the finding lacks, and state plainly what its shell cannot verify.',
  'The acceptance measurement is assigned to the DRAIN, which runs where the red lives.',
  '',
  'Firewall bars the baseHits*2 assertion, the 40/40/40/20 sample sizes (shrinking them would',
  "weaken the ratio assertion under cover of a perf fix), f1628-3's fresh fixtures, and the",
  'GLOBAL timeout -- raising that would hand every test in the suite a longer leash to hide in.',
].join('\n');

execFileSync('git', ['commit', '-m', msg], { cwd: R });
console.log('committed:', g('log', '-1', '--format=%h').trim());
