/**
 * s1230-site-gate-mutation.mjs — F-1230-1 proof.
 *
 * QUESTION (s1229 note (N)(D)): is functions/ the only code tree the drain gate
 * cannot see? Candidate: site/ — deployed to players by scripts/deploy-site.sh
 * (Pages project 'agenttown'), and site/index.html:190 loads assay-office.js.
 *
 * METHOD: plant a defect in the SUBJECT (not the guard), run the CURRENT drain
 * gate line against it, read the rc column. Restore byte-identically and verify
 * by sha256 after every arm. A green over a break we planted is the only proof
 * a gate is absent.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const SUBJECT = 'site/assay-office.js';
const ORIGINAL = readFileSync(SUBJECT);
const SHA = createHash('sha256').update(ORIGINAL).digest('hex');

const ARMS = [
  {
    name: 'A: hard syntax error',
    note: 'if even this survives, nothing parses the file',
    apply: (s) => s.replace("const numberFormatter = new Intl.NumberFormat('en-US');", 'const numberFormatter = ;'),
  },
  {
    name: 'B: contract field rename',
    note: 'realistic silent defect — page shows 0 runs forever',
    apply: (s) => s.replace('stats.runs?.today)', 'stats.runs?.todayy)'),
  },
];

const GATES = [
  { label: 'npx tsc --noEmit', cmd: 'npx', args: ['tsc', '--noEmit'] },
  { label: 'npm run build', cmd: 'npm', args: ['run', '--silent', 'build'] },
  {
    label: 'run-guards --changed-since HEAD',
    cmd: 'node',
    args: ['scripts/run-guards.mjs', '--changed-since', 'HEAD'],
  },
];

function restore() {
  writeFileSync(SUBJECT, ORIGINAL);
  const now = createHash('sha256').update(readFileSync(SUBJECT)).digest('hex');
  if (now !== SHA) throw new Error(`RESTORE FAILED: ${now} !== ${SHA}`);
  return now;
}

console.log(`subject ${SUBJECT}  sha ${SHA}\n`);

try {
  for (const arm of ARMS) {
    const mutated = arm.apply(ORIGINAL.toString('utf8'));
    if (mutated === ORIGINAL.toString('utf8')) throw new Error(`arm "${arm.name}" changed NOTHING — anchor missing`);
    writeFileSync(SUBJECT, mutated);
    console.log(`=== ARM ${arm.name} (${arm.note}) ===`);
    for (const g of GATES) {
      const started = Date.now();
      const run = spawnSync(g.cmd, g.args, { encoding: 'utf8', timeout: 10 * 60 * 1000 });
      const rc = run.status === null ? `signal:${run.signal}` : run.status;
      const secs = Math.round((Date.now() - started) / 1000);
      console.log(`  ${rc === 0 ? 'GREEN' : 'RED  '}  rc=${rc}  ${secs}s  ${g.label}`);
    }
    console.log(`  restored sha ${restore()}\n`);
  }
} finally {
  restore();
}

// CONTROL: the same battery over a CLEAN tree, so a green above cannot be
// dismissed as "the battery was broken anyway".
console.log('=== CONTROL: clean tree, same battery ===');
for (const g of GATES) {
  const run = spawnSync(g.cmd, g.args, { encoding: 'utf8', timeout: 10 * 60 * 1000 });
  const rc = run.status === null ? `signal:${run.signal}` : run.status;
  console.log(`  ${rc === 0 ? 'GREEN' : 'RED  '}  rc=${rc}  ${g.label}`);
}
console.log(`final sha ${restore()}`);
