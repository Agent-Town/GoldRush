// s1516: pick the lane for the F-1510-3 successor.
// F-1320-2: name the commit the task depends on and PROVE the lane has it.
// The cure touches exactly three files; a lane is fit only if its blobs for those
// files already match main (otherwise the runner edits a stale subject).
import { execSync } from 'node:child_process';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const sh = (c) => execSync(c, { cwd: REPO, encoding: 'utf8' }).trim();

const FILES = [
  'playwright.config.ts',
  'scripts/suite-red-inventory.mjs',
  'scripts/suite-red-inventory.test.mjs',
];

// The dependency commit: the newest commit on main touching any of the three.
const dep = sh(`git log -1 --format=%H main -- ${FILES.join(' ')}`);
console.log('dependency commit (newest main commit touching the cure surface):');
console.log('  ', dep, sh(`git log -1 --format=%s ${dep}`).slice(0, 90));
console.log();

for (const branch of ['lane/b', 'lane/c', 'lane/d']) {
  let hasDep;
  try {
    sh(`git merge-base --is-ancestor ${dep} ${branch}`);
    hasDep = true;
  } catch {
    hasDep = false;
  }
  const mismatched = FILES.filter((f) => {
    const a = sh(`git rev-parse main:${f}`);
    const b = sh(`git rev-parse ${branch}:${f}`);
    return a !== b;
  });
  console.log(
    `${branch}  has-dep=${hasDep ? 'YES' : 'NO '}  cure-surface-matches-main=${
      mismatched.length === 0 ? 'ALL 3 ✓' : `STALE: ${mismatched.join(', ')}`
    }`,
  );
}
