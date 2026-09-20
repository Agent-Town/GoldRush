// s1314 control: are the 4 bt-01-tiers reds PRE-EXISTING, or did the bt-02b merge cause them?
// Reverts the merge's three behavioural files to the merge-base, re-runs ONLY the two named
// assertions, then restores every file byte-exact (sha256-verified).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

const BASE = '625831a875e3707695d734fdf06a2a26df5c512f';
const FILES = ['src/systems/BuildSystem.ts', 'src/game/Balance.ts', 'e2e/bt-01-tiers.spec.ts'];
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const before = Object.fromEntries(FILES.map((f) => [f, sha(f)]));
console.log('post-merge sha256:', JSON.stringify(before, null, 2));

const GREP = 'Enter tears down after clicking upgrade|insufficient gold leaves tier and gold unchanged';

try {
  execSync(`git checkout ${BASE} -- ${FILES.join(' ')}`, { stdio: 'inherit' });
  console.log('\n--- reverted to merge-base; running the two named assertions ---\n');
  const run = spawnSync(
    'npx',
    ['playwright', 'test', 'e2e/bt-01-tiers.spec.ts', '--workers=1', '--reporter=line', '-g', GREP],
    { encoding: 'utf8', timeout: 900000, maxBuffer: 268435456 },
  );
  const out = `${run.stdout || ''}${run.stderr || ''}`;
  console.log('CONTROL rc=', run.status);
  console.log(
    out
      .split('\n')
      .filter((l) => /passed|failed|✘|✓|Error|expect/.test(l))
      .slice(-25)
      .join('\n'),
  );
} finally {
  execSync(`git checkout HEAD -- ${FILES.join(' ')}`, { stdio: 'inherit' });
  const after = Object.fromEntries(FILES.map((f) => [f, sha(f)]));
  const match = FILES.every((f) => before[f] === after[f]);
  console.log('\nrestored MATCH =', match);
  if (!match) console.log('MISMATCH', JSON.stringify(after, null, 2));
}
