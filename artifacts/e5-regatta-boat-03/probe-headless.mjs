import { createServer } from 'vite';
const location = new URL('http://regatta-view.test/?debug&contract=e5-regatta');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId: 'e5-regatta', seed: 'e5-regatta-01' });
  console.log('BOOT:', JSON.stringify(sim.currentTurn().view.now.regatta));
  // board
  for (const spot of [{x:-40,z:0},{x:-49,z:6}]) { sim.hero.group.position.set(spot.x, sim.hero.group.position.y, spot.z); sim.advanceOneTick(); }
  console.log('ABOARD:', JSON.stringify(sim.currentTurn().view.now.regatta));
  console.log('viewVersion:', sim.currentTurn().view.viewVersion);
  // control: a contract with no raceCourse
  const claim = new HeadlessContractSim({ contractId: 'e5-deepwater-claim', seed: 'e5-deepwater-claim-01' });
  console.log('CONTROL e5-deepwater-claim regatta:', JSON.stringify(claim.currentTurn().view.now.regatta));
} finally { await vite.close(); }
