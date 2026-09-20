// s1402: second teeth probe. The first manufactured defect tripped the STRUCTURAL head-2 check
// before any fixture ran, so it proved only that half. This one keeps `head -1` and breaks only
// the STRING match (back to the literal "ACTIVE 2"), which is the false-release direction — the
// one that would put the runner and a fire on main's tree at the same time.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const RUNNER = REPO + '/scripts/lane-runner-v3.sh';
const TEST = REPO + '/scripts/main-lock-gate.test.sh';
const BACKUP = REPO + '/logs/_s1402_runner_backup2.sh';

const run = () => {
  try { return { rc: 0, out: execFileSync('bash', [TEST], { encoding: 'utf8', cwd: REPO }) }; }
  catch (e) { return { rc: e.status ?? -1, out: (e.stdout ?? '') + (e.stderr ?? '') }; }
};

copyFileSync(RUNNER, BACKUP);
const src = readFileSync(RUNNER, 'utf8');
const broken = src.replace(
  '[[ "$l1" == *ACTIVE* && "$l1" != *"lock CLEARED"* ]]',
  '[[ "$l1" == *"ACTIVE 2"* ]]',
);
if (broken === src) { console.log('!! could not manufacture'); unlinkSync(BACKUP); process.exit(2); }
writeFileSync(RUNNER, broken);

const bad = run();
console.log('=== string defect only (head -1 kept, match back to "ACTIVE 2") ===');
console.log(bad.out.trim());
console.log('rc=' + bad.rc);

copyFileSync(BACKUP, RUNNER);
unlinkSync(BACKUP);
console.log('\nrunner restored byte-identical: ' + (readFileSync(RUNNER, 'utf8') === src));
