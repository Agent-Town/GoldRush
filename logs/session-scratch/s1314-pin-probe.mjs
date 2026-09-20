// s1314 probe: does the AP-07 contract pin guard a real gap, or is it conservatism?
// Temporarily lifts the SUPPORTED_CONTRACT pin, runs the two unsupported E1 contracts
// under the idle policy, then restores the file byte-exact (verified by sha256).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const P = 'src/sim/HeadlessContractSim.ts';
const orig = fs.readFileSync(P);
const h0 = crypto.createHash('sha256').update(orig).digest('hex');
console.log('orig sha256:', h0);

const NEEDLE = 'if (contractId !== SUPPORTED_CONTRACT) {';
const REPLACEMENT =
  "if (contractId !== SUPPORTED_CONTRACT && contractId !== 'the-claim' && contractId !== 'e1-twin-banks') {";
const text = orig.toString('utf8');
if (!text.includes(NEEDLE)) {
  console.log('PATCH NEEDLE ABSENT — abort, nothing written');
  process.exit(2);
}

const cases = [
  ['e1-dry-gulch', 'e1-dry-gulch-01'],
  ['the-claim', 'e1-the-claim-01'],
  ['the-claim', 'e1-the-claim-02'],
  ['e1-twin-banks', 'tb-probe-01'],
];

try {
  fs.writeFileSync(P, text.replace(NEEDLE, REPLACEMENT));
  for (const [contract, seed] of cases) {
    const started = Date.now();
    const run = spawnSync(
      'node',
      ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy', 'idle'],
      { encoding: 'utf8', timeout: 280000, maxBuffer: 268435456 },
    );
    const out = (run.stdout || '').trim().split('\n').filter(Boolean);
    console.log(`\n=== ${contract} / ${seed} === rc=${run.status} ms=${Date.now() - started} lines=${out.length}`);
    console.log('LAST:', (out[out.length - 1] || '(no stdout)').slice(0, 500));
    const err = (run.stderr || '')
      .split('\n')
      .filter((line) => line && !/ExperimentalWarning|trace-warnings/.test(line));
    console.log('stderr:', err.slice(-6).join(' | ').slice(0, 800));
  }
} finally {
  fs.writeFileSync(P, orig);
  const h1 = crypto.createHash('sha256').update(fs.readFileSync(P)).digest('hex');
  console.log('\nrestored sha256:', h1, 'MATCH=', h1 === h0);
}
