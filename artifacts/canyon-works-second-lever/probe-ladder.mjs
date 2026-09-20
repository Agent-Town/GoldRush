// A one-shot probe: is the authored ladder live in BOTH engines and on the card?
import { createServer } from 'vite';
const location = new URL('http://canyon-second-lever.probe/?debug');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const { beaconCost } = await vite.ssrLoadModule('/src/game/buildables.ts');

  const contract = loadContract('e3-canyon-works');
  console.log('authored ladder      :', JSON.stringify(contract.twist.economy.beaconLadder));
  console.log('authored bankCap     :', contract.twist.economy.bankCap);
  console.log('authored connect     :', JSON.stringify(contract.twist.powerGrid.connect));
  const m = deriveMechanicsManifest(contract);
  const beacon = m.buildables.find((b) => b.id === 'sentry_beacon');
  console.log('published costs      :', JSON.stringify(beacon.costs), 'cost0 =', beacon.cost, 'costRule =', beacon.costRule);
  console.log('published total      :', beacon.costs.reduce((a, b) => a + b, 0));
  const ladderRule = m.rules.find((r) => r.id === 'contract_beacon_ladder');
  console.log('ladder rule          :', JSON.stringify(ladderRule));
  const connectRule = m.rules.find((r) => r.id === 'connect_objective');
  console.log('connect rule         :', JSON.stringify(connectRule?.data));

  // A control contract must be untouched.
  const control = deriveMechanicsManifest(loadContract('e3-blackout-ridge'));
  const cb = control.buildables.find((b) => b.id === 'sentry_beacon');
  console.log('CONTROL blackout-ridge costs:', JSON.stringify(cb?.costs), 'ladder rule:', control.rules.some((r) => r.id === 'contract_beacon_ladder'));
  console.log('default curve        :', JSON.stringify(Array.from({ length: 6 }, (_, i) => beaconCost(i))));

  // THE SIM: what does it actually charge? Place beacons free-of-charge is not a price test, so ask
  // the build system through the same seam the BUILD verb uses.
  const sim = new HeadlessContractSim({ contractId: 'e3-canyon-works', seed: 'e3-canyon-works-01', admissionProbe: true });
  const charged = [];
  for (let i = 0; i < 6; i += 1) charged.push(sim.build.diagnostics.buildables.find((b) => b.id === 'sentry_beacon')?.cost ?? null);
  console.log('sim diagnostics cost0:', JSON.stringify(charged[0]));
  console.log('sim bankCap          :', sim.economy.bankCap);
} finally {
  await vite.close();
}
