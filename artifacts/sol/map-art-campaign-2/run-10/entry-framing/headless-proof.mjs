import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const arm = process.argv[2];
const rows = [];
console.log = () => {};
for (const contractId of ['e1-night-shift', 'e1-twin-banks', 'e1-baron', 'e2-trestle', 'e6-glow-mesa', 'e7-dead-band', 'e8-far-side', 'e6-half-life-hollow', 'e7-relay-rush', 'the-claim']) {
  globalThis.location = new URL(`http://gr-sim.local/?debug&contract=${contractId}&seed=entry-framing`);
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId, seed: 'entry-framing' });
    for (let tick = 0; tick <= 600; tick++) {
      if ([0, 30, 150, 300, 600].includes(tick)) rows.push({ contractId, tick, now: sim.currentTurn().view.now });
      if (tick < 600) sim.advanceOneTick();
    }
  } finally { await vite.close(); }
}
writeFileSync(`artifacts/sol/map-art-campaign-2/run-10/entry-framing/now-${arm}.json`, JSON.stringify(rows, null, 2) + '\n');
