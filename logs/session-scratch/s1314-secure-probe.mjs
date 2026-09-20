// s1314 probe 2: with the pin lifted, does a SECURED run score correctly on the-claim?
// Idle policy always dies before wave 10, so temporarily lower the-claim's secureWave
// to 2 and confirm secured:true + a run_secured event. Both files restored byte-exact.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SIM = 'src/sim/HeadlessContractSim.ts';
const CONTRACTS = 'assets/contracts/epoch-1-frontier/contracts.json';

const origSim = fs.readFileSync(SIM);
const origContracts = fs.readFileSync(CONTRACTS);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const h0 = { sim: sha(origSim), contracts: sha(origContracts) };
console.log('orig sha256:', JSON.stringify(h0, null, 0));

const NEEDLE = 'if (contractId !== SUPPORTED_CONTRACT) {';
const simText = origSim.toString('utf8');
if (!simText.includes(NEEDLE)) {
  console.log('SIM NEEDLE ABSENT — abort, nothing written');
  process.exit(2);
}

// Lower ONLY the-claim's secureWave, by parsing rather than string-hacking.
const doc = JSON.parse(origContracts.toString('utf8'));
const list = Array.isArray(doc) ? doc : doc.contracts;
const claim = (Array.isArray(list) ? list : Object.values(list)).find((c) => c && c.id === 'the-claim');
if (!claim) {
  console.log('the-claim NOT FOUND in manifest — abort, nothing written');
  process.exit(2);
}
console.log('the-claim secureWave before:', claim.twist.secureWave);
claim.twist.secureWave = 2;

try {
  fs.writeFileSync(
    SIM,
    simText.replace(NEEDLE, "if (contractId !== SUPPORTED_CONTRACT && contractId !== 'the-claim') {"),
  );
  fs.writeFileSync(CONTRACTS, JSON.stringify(doc, null, 2));

  const run = spawnSync(
    'node',
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy', 'idle'],
    { encoding: 'utf8', timeout: 280000, maxBuffer: 268435456 },
  );
  const out = (run.stdout || '').trim().split('\n').filter(Boolean);
  console.log(`\n=== the-claim @ secureWave=2 === rc=${run.status} lines=${out.length}`);
  console.log('LAST:', (out[out.length - 1] || '(no stdout)').slice(0, 500));
  // Look for the securing signal in any emitted record.
  const secured = out.some((line) => /"secured"\s*:\s*true|run_secured/.test(line));
  console.log('SECURED SIGNAL PRESENT:', secured);
  const err = (run.stderr || '')
    .split('\n')
    .filter((line) => line && !/ExperimentalWarning|trace-warnings/.test(line));
  console.log('stderr:', err.slice(-4).join(' | ').slice(0, 600));
} finally {
  fs.writeFileSync(SIM, origSim);
  fs.writeFileSync(CONTRACTS, origContracts);
  const h1 = { sim: sha(fs.readFileSync(SIM)), contracts: sha(fs.readFileSync(CONTRACTS)) };
  console.log('\nrestored:', JSON.stringify(h1, null, 0));
  console.log('MATCH sim=', h1.sim === h0.sim, ' contracts=', h1.contracts === h0.contracts);
}
