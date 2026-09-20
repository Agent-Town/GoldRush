// Post-composition probe: what the three siblings publish now, and their new idle hashes.
import { createServer } from 'vite';
const IDS = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse', 'e8-mare-claim'];
console.log = () => undefined;
console.info = () => undefined;
const out = [];
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  for (const id of IDS) {
    for (const suffix of ['01', '02']) {
      const seed = `${id}-${suffix}`;
      const location = new URL(`http://gr-sim.local/?debug&contract=${id}&seed=${seed}`);
      globalThis.location = location;
      globalThis.window = { location };
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const sim = new HeadlessContractSim({ contractId: id, seed });
      let turn = sim.currentTurn();
      const first = turn.view;
      for (let i = 0; i < 400 && !turn.terminal; i += 1) turn = sim.advanceToTurn();
      out.push({ id, seed, air: suffix === '01' ? (first.now.air ?? null) : undefined, outcome: sim.outcome() });
    }
  }
} finally { await vite.close(); }
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
