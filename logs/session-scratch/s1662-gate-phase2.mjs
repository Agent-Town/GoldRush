// s1662 gate phase 2: build, plus an INDEPENDENT proof that the new ratchet bites.
// The runner reported a red-then-green transcript; a new guard is invisible to the
// battery that ships it, so the drain re-derives the red rather than inheriting it.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cwd = '/Users/robin/Claude/Projects/Gold Rush/gate-s1662b';
const SIM = `${cwd}/src/sim/HeadlessContractSim.ts`;

const run = (label, cmd, args) => {
  const t0 = Date.now();
  let rc = 0, out = '';
  try { out = execFileSync(cmd, args, { cwd, encoding: 'utf8', timeout: 900000 }); }
  catch (e) { rc = e.status ?? 'ERR'; out = (e.stdout || '') + (e.stderr || ''); }
  const keep = out.split('\n').filter((l) => /^. (tests|pass|fail|skip)|AssertionError|built in|modules transformed|error|not ok|\+ e2-/.test(l)).slice(0, 12);
  console.log(`\n=== ${label} === rc=${rc}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(keep.join('\n') || out.split('\n').slice(-6).join('\n'));
  return rc;
};

run('npm run build', 'nice', ['-n', '19', 'npm', 'run', 'build']);

// --- ratchet bite proof ---
const original = readFileSync(SIM, 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
console.log('\nHeadlessContractSim.ts sha256[0:16] before =', sha(original));

const block = `  'e2-incline': {
    reason: 'Measured modeless idle run reached the wave ceiling without a lawful terminal because no weapon reaches the railcar.',
    citation: 'F-E2S-3',
  },
`;
if (!original.includes(block)) throw new Error('exemption block not found verbatim — cannot manufacture the defect');
writeFileSync(SIM, original.replace(block, ''));
run('ratchet WITH e2-incline exemption DELETED (expect RED)', 'nice', ['-n', '19', 'node', '--test', 'scripts/door-admission-ratchet.test.mjs']);

writeFileSync(SIM, original);
const after = readFileSync(SIM, 'utf8');
console.log('\nrestored byte-identical =', after === original, '· sha256[0:16] after =', sha(after));
run('ratchet RESTORED (expect GREEN)', 'nice', ['-n', '19', 'node', '--test', 'scripts/door-admission-ratchet.test.mjs']);
