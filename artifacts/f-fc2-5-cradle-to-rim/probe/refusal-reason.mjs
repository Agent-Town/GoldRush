// F-FC2-5 scope 1 — the refusal, verbatim.
// Runs three decisions of the crossing ride and prints the standing-orders log, plus
// `Terrain.sample().walkable` along the ride's walk line, so the refusal has a named cause.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const read = (relative) => readFileSync(new URL(`../../../${relative}`, import.meta.url), 'utf8');
const bundle = JSON.parse(read('assets/contracts/epoch-8-orbital/contracts.json')).contracts;
const manifestOf = (id) => bundle.find((entry) => entry.id === id);

const location = new URL('http://gr-sim.local/?debug&contract=e8-far-side&seed=e8-far-side-01');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
const { snapshotStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
const { landmarkBlockersFor } = await vite.ssrLoadModule('/src/world/LandmarkCollision.ts');

const tile = manifestOf('e8-far-side').tileParams;
const zone = tile.probeRecoveryZones[0];

console.log('== blockers for e8-far-side ==');
for (const b of landmarkBlockersFor('e8-far-side')) {
  console.log(`  ${b.id} at (${b.x}, ${b.z}) half ${b.halfX.toFixed(3)} x ${b.halfZ.toFixed(3)}`);
}

console.log('== Terrain.sample().walkable along x=0, z=36..58 ==');
const line = [];
for (let z = 36; z <= 58; z += 0.5) line.push(`${z}:${Terrain.sample(0, z).walkable ? 'W' : '.'}`);
console.log('  ' + line.join(' '));
console.log(`  zone centre (0,45) walkable = ${Terrain.sample(0, 45).walkable}`);

const sim = new HeadlessContractSim({ contractId: 'e8-far-side', seed: 'e8-far-side-01' });
sim.hero.applyStats(10_000, 1);
sim.hero.heal(10_000);
let turn = sim.currentTurn();
for (let d = 0; d < 3; d += 1) {
  const now = turn.view.now;
  const orders = [];
  if (now.probeRecovery && !now.probeRecovery.recovered) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
  orders.push({ verb: 'MOVE_HERO', pos: { x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 } });
  const res = sim.submitOrders(orders);
  console.log(`== decision ${d}: submit ok=${res.outcome.ok} hero=(${sim.hero.group.position.x.toFixed(2)}, ${sim.hero.group.position.z.toFixed(2)}) ==`);
  turn = sim.advanceToTurn();
  const snap = snapshotStandingOrders();
  console.log(`  hero after step = (${sim.hero.group.position.x.toFixed(2)}, ${sim.hero.group.position.z.toFixed(2)})`);
  console.log('  orders: ' + JSON.stringify(snap.orders));
  console.log('  log: ' + JSON.stringify(snap.log?.slice(-6)));
}
await vite.close();
