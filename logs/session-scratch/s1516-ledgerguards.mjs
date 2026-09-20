// F-1300-4: test:ledger-guards as the LAST act of any fire that wrote a ledger row.
// The drain battery ran on the MERGED tree, which by construction precedes this fire's own
// bookkeeping commits — so it was structurally incapable of seeing a defect I was about to add.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npm', ['run', 'test:ledger-guards'], {
  cwd: '/Users/robin/Claude/Projects/Gold Rush', encoding: 'utf8', timeout: 900_000,
});
const out = (r.stdout || '') + (r.stderr || '');
console.log('rc =', r.status);
for (const line of out.split('\n')) {
  const t = line.trim();
  if (/^ℹ (tests|pass|fail|cancelled|skipped) /.test(t)) console.log('  ', t);
  if (/^(✖|not ok )/.test(t)) console.log('  RED:', t.slice(0, 130));
}
if (r.status !== 0) console.log('\n--- tail ---\n' + out.split('\n').slice(-25).join('\n'));
