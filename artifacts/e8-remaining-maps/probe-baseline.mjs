// Baseline probe: what the three sibling maps publish TODAY (before this slice).
import { createServer } from 'vite';
const IDS = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse', 'e8-mare-claim'];
console.log = () => undefined;
console.info = () => undefined;
const out = [];
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  for (const id of IDS) {
    const seed = `${id}-01`;
    const location = new URL(`http://gr-sim.local/?debug&contract=${id}&seed=${seed}`);
    globalThis.location = location;
    globalThis.window = { location };
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: id, seed });
    let turn = sim.currentTurn();
    const first = turn.view;
    for (let i = 0; i < 400 && !turn.terminal; i += 1) turn = sim.advanceToTurn();
    const outcome = sim.outcome();
    out.push({ id, gravity: first.now.gravity ?? null, air: first.now.air ?? null, lowOrbit: sim.currentTurn().view.now.lowOrbit ?? null, outcome });
  }
} finally { await vite.close(); }
process.stdout.write(JSON.stringify(out, null, 1) + '\n');
