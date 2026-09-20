// s1314 control 2: is m2-04-gold-stealing:211 (mobile) pre-existing, or caused by the bt-02b merge?
// Same method as control 1: revert the merge's behavioural files to the merge-base, re-run the
// single named test, restore byte-exact.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';

const BASE = '625831a875e3707695d734fdf06a2a26df5c512f';
const FILES = ['src/systems/BuildSystem.ts', 'src/game/Balance.ts', 'e2e/bt-01-tiers.spec.ts'];
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const before = Object.fromEntries(FILES.map((f) => [f, sha(f)]));

try {
  execSync(`git checkout ${BASE} -- ${FILES.join(' ')}`, { stdio: 'inherit' });
  console.log('\n--- merge-base control: thief routes around a finite palisade line ---\n');
  const run = spawnSync(
    'npx',
    [
      'playwright', 'test', 'e2e/m2-04-gold-stealing.spec.ts',
      '--workers=1', '--reporter=line', '--project=mobile-chrome',
      '-g', 'thief routes around a finite palisade line to steal',
    ],
    { encoding: 'utf8', timeout: 900000, maxBuffer: 268435456 },
  );
  const out = `${run.stdout || ''}${run.stderr || ''}`;
  console.log('CONTROL rc=', run.status);
  console.log(out.split('\n').filter((l) => /passed|failed|Error|expect|✘|✓/.test(l)).slice(-12).join('\n'));
} finally {
  execSync(`git checkout HEAD -- ${FILES.join(' ')}`, { stdio: 'inherit' });
  const after = Object.fromEntries(FILES.map((f) => [f, sha(f)]));
  console.log('\nrestored MATCH =', FILES.every((f) => before[f] === after[f]));
}
