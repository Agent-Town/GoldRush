import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
const location = new URL('http://probe.test/?debug&contract=e7-relay-rush&seed=e7-relay-rush-01');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const tape = JSON.parse(readFileSync('artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json', 'utf8'));
  const virgin = new HeadlessContractSim({ contractId: tape.contract, seed: tape.seed });
  const a = JSON.stringify(tape.runStart, null, 1).split('\n');
  const b = JSON.stringify(virgin.runStart, null, 1).split('\n');
  console.log('declared lines', a.length, 'virgin lines', b.length);
  const max = Math.max(a.length, b.length);
  let shown = 0;
  for (let i = 0; i < max && shown < 40; i += 1) {
    if (a[i] !== b[i]) { console.log(`line ${i}: declared=${a[i]} | virgin=${b[i]}`); shown += 1; }
  }
  console.log('--- top-level keys declared:', Object.keys(tape.runStart).sort().join(','));
  console.log('--- top-level keys virgin  :', Object.keys(virgin.runStart).sort().join(','));
} finally { await vite.close(); }
