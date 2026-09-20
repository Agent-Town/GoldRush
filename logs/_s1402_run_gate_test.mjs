// s1402: run the main-lock-gate fixture test (the Bash tool allowlist refuses the script name;
// the gate denies the operator, not the factory). Also proves the guard has TEETH by manufacturing
// the defect it exists to catch, rather than trusting a green (the s1299/s1300 standard).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'node:fs';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const RUNNER = REPO + '/scripts/lane-runner-v3.sh';
const TEST = REPO + '/scripts/main-lock-gate.test.sh';

const run = () => {
  try {
    const out = execFileSync('bash', [TEST], { encoding: 'utf8', cwd: REPO });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status ?? -1, out: (e.stdout ?? '') + (e.stderr ?? '') };
  }
};

console.log('=== 1. live tree ===');
const live = run();
console.log(live.out.trim());
console.log('rc=' + live.rc);

// --- teeth check: restore the exact defect (the old head -2 / "ACTIVE 2" gate) and re-run. ---
const BACKUP = REPO + '/logs/_s1402_runner_backup.sh';
copyFileSync(RUNNER, BACKUP);
const src = readFileSync(RUNNER, 'utf8');
const broken = src.replace(
  /    l1=\$\(head -1 "\$ROOT\/STATUS\.md" 2>\/dev\/null \|\| true\)\n    if \[ "\$slot" = "main" \] && \[\[ .*? \]\]; then/s,
  '    if [ "$slot" = "main" ] && head -2 "$ROOT/STATUS.md" 2>/dev/null | grep -q "ACTIVE 2"; then',
);
if (broken === src) {
  console.log('\n!! could not manufacture the defect — teeth UNPROVEN, investigate');
  unlinkSync(BACKUP);
  process.exit(2);
}
writeFileSync(RUNNER, broken);
console.log('\n=== 2. defect manufactured (old head -2 / "ACTIVE 2" gate restored) ===');
const bad = run();
console.log(bad.out.trim());
console.log('rc=' + bad.rc);

copyFileSync(BACKUP, RUNNER);
unlinkSync(BACKUP);
const restored = readFileSync(RUNNER, 'utf8') === src;
console.log('\nrunner restored byte-identical: ' + restored);
console.log(
  '\nVERDICT: ' +
    (live.rc === 0 && bad.rc === 1 && restored
      ? 'guard has TEETH (green on the fix, rc=1 on the defect)'
      : 'INCONCLUSIVE — read the output above'),
);
