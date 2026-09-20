// s1516: RE-PROVE the manufactured-defect arms (s1299/s1301 standard).
// Revert ONLY the guard to main's blob inside the gate worktree, run the citation test file,
// expect RED, then restore BYTE-IDENTICALLY and verify by hash.
import { execSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const GATE = '/Users/robin/Claude/Projects/Gold Rush/gate-s1516';
const GUARD = `${GATE}/scripts/citation-title-guard.mjs`;
const MAIN = '303b3c8f4';
const hash = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);

const fixed = fs.readFileSync(GUARD);
const fixedHash = hash(GUARD);
console.log('fixed guard sha256/16 =', fixedHash);

function runCitationTests(label) {
  const r = spawnSync(process.execPath, ['--test', 'scripts/citation-title-guard.test.mjs'], {
    cwd: GATE, encoding: 'utf8', timeout: 300_000,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const grab = (k) => (out.match(new RegExp(`^# ${k} (\\d+)`, 'm')) || [])[1] ?? '?';
  console.log(`\n[${label}] rc=${r.status}  tests=${grab('tests')} pass=${grab('pass')} fail=${grab('fail')}`);
  const failed = out.split('\n').filter((l) => /^not ok \d+/.test(l.trim()));
  failed.forEach((l) => console.log('    RED:', l.trim().slice(0, 100)));
  return { rc: r.status, failed };
}

// ---- ARM A: the fixed code (control) ----
runCitationTests('FIXED (control)');

// ---- ARM B: revert ONLY the guard to main's blob ----
const mainBlob = execSync(`git show ${MAIN}:scripts/citation-title-guard.mjs`, { cwd: GATE, encoding: 'buffer' });
fs.writeFileSync(GUARD, mainBlob);
console.log('\nreverted guard to main blob; sha256/16 =', hash(GUARD));
const red = runCitationTests('OLD GUARD (violation path)');

// ---- restore, byte-identically ----
fs.writeFileSync(GUARD, fixed);
const restoredHash = hash(GUARD);
console.log('\nrestored guard sha256/16 =', restoredHash, restoredHash === fixedHash ? 'BYTE-IDENTICAL ✓' : 'MISMATCH ✗');
console.log('git status in gate:', execSync('git status --porcelain scripts/', { cwd: GATE, encoding: 'utf8' }).trim() || '(clean)');
console.log('\nVERDICT:', red.rc !== 0 ? 'ARMS GO RED against the old behaviour ✓' : 'ARMS DID NOT RED ✗ — they are not evidence');
