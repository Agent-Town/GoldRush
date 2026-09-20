// s1516: capture the NAMES of the arms that red against the old guard (for the review file).
import { execSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';

const GATE = '/Users/robin/Claude/Projects/Gold Rush/gate-s1516';
const GUARD = `${GATE}/scripts/citation-title-guard.mjs`;
const hash = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').slice(0, 16);

const fixed = fs.readFileSync(GUARD);
const fixedHash = hash(GUARD);

const mainBlob = execSync('git show 303b3c8f4:scripts/citation-title-guard.mjs', { cwd: GATE, encoding: 'buffer' });
fs.writeFileSync(GUARD, mainBlob);

const r = spawnSync(process.execPath, ['--test', 'scripts/citation-title-guard.test.mjs'], {
  cwd: GATE, encoding: 'utf8', timeout: 300_000,
});
const out = (r.stdout || '') + (r.stderr || '');
console.log('rc =', r.status);
for (const line of out.split('\n')) {
  const t = line.trim();
  if (/^ℹ (tests|pass|fail|skipped|cancelled) /.test(t)) console.log('  ', t);
  if (/^✖/.test(t) || /^not ok/.test(t)) console.log('  RED:', t.slice(0, 110));
}

fs.writeFileSync(GUARD, fixed);
console.log('\nrestored:', hash(GUARD) === fixedHash ? 'BYTE-IDENTICAL ✓' : 'MISMATCH ✗');
console.log('gate status:', execSync('git status --porcelain scripts/', { cwd: GATE, encoding: 'utf8' }).trim() || '(clean)');
