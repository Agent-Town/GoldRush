// Independent re-proof of the s1299/s1301 standard: the two NEW arms must go RED
// against the OLD guard. Reverts only scripts/citation-title-guard.mjs to main's
// blob inside the gate worktree, runs the citation test file, restores byte-identically.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const cwd = process.argv[2];
const GUARD = 'scripts/citation-title-guard.mjs';
const sh = (c, opts = {}) => execSync(c, { cwd, encoding: 'utf8', maxBuffer: 1 << 26, ...opts });

const now = fs.readFileSync(`${cwd}/${GUARD}`);
const old = sh(`git show main:${GUARD}`);

function runCitationTest(label) {
  console.log(`\n=== ${label} ===`);
  try {
    const out = sh(`node --test ${GUARD.replace('.mjs', '.test.mjs')}`, { stdio: 'pipe' });
    console.log(out.split('\n').filter((l) => /code span|apostrophe|^ℹ (tests|pass|fail)/.test(l)).join('\n'));
    console.log('RC=0');
  } catch (e) {
    const out = e.stdout || '';
    console.log(out.split('\n').filter((l) => /code span|apostrophe|^ℹ (tests|pass|fail)/.test(l)).join('\n'));
    console.log('RC=' + (e.status ?? 1));
  }
}

runCitationTest('ARM A — NEW tests against NEW guard (expect green)');
fs.writeFileSync(`${cwd}/${GUARD}`, old);
runCitationTest('ARM B — NEW tests against OLD guard (expect the 2 new arms RED)');
fs.writeFileSync(`${cwd}/${GUARD}`, now);
const restored = fs.readFileSync(`${cwd}/${GUARD}`);
console.log('\nrestored byte-identical:', Buffer.compare(now, restored) === 0);
console.log('git status of guard:', JSON.stringify(sh(`git status --porcelain ${GUARD}`)));
