import { createServer } from 'vite';
const contractId = 'e8-mare-claim';
const seed = 'e8-mare-claim-01';
const location = new URL(`http://gr-sim.local/?debug&contract=${contractId}&seed=${seed}`);
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId, seed });
  const snap = sim.harvestSnapshot ?? sim.harvest?.snapshot;
  console.log('activeNodes:', JSON.stringify(snap.activeNodes.map((n) => ({ id: n.id, a: n.anchorIndex, x: Math.round(n.position.x), z: Math.round(n.position.z), rem: n.remaining, active: n.active }))));
  const turn = sim.currentTurn();
  console.log('turn keys:', Object.keys(turn));
  const view = turn.view ?? turn;
  console.log('now keys:', Object.keys(view?.now ?? {}));
  console.log('now.air:', JSON.stringify(view?.now?.air));
  console.log('now.gravity:', JSON.stringify(view?.now?.gravity));
  console.log('now.prospector:', JSON.stringify(view?.now?.prospector));
  console.log('now.seams:', JSON.stringify(view?.now?.seams));
  console.log('viewVersion:', view?.viewVersion, 'schema:', view?.schema);
} finally { await vite.close(); }
