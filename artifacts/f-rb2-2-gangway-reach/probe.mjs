// Scratch measurement for F-RB2-2 (not committed): the geometry both probes see.
import { createServer } from 'vite';

const ROOT = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/wt-rb2/';
const CONTRACT = 'e5-regatta';
const SEED = 'e5-regatta-01';

const location = new URL(`http://regatta-boat.test/?debug&contract=${CONTRACT}`);
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
  const boat = sim.deepwater.tile.boat;
  const motion = () => sim.deepwater.tile.snapshot().boat.motion;
  const walkable = (x, z) => x >= Terrain.bounds.minX + Balance.hero.radius
    && x <= Terrain.bounds.maxX - Balance.hero.radius
    && z >= Terrain.bounds.minZ + Balance.hero.radius
    && z <= Terrain.bounds.maxZ - Balance.hero.radius
    && Terrain.sample(x, z).walkable;

  console.error('terrain bounds', JSON.stringify(Terrain.bounds), 'hero radius', Balance.hero.radius);
  console.error('hull water', JSON.stringify(boat.water));

  // Board her.
  for (const spot of [{ x: -40, z: 0 }, { x: -49, z: 6 }]) {
    sim.hero.group.position.set(spot.x, sim.hero.group.position.y, spot.z);
    sim.advanceOneTick();
  }
  console.error('aboard?', boat.aboard, 'at', JSON.stringify(motion()));

  const probes = [[0, 1, 'keel/north'], [1, 0, 'beam/east'], [1, 1, 'diagonal'], [-1, 0, 'beam/west']];
  const B = { maxX: 4.4, maxZ: 14.25 }, PLANK = 2;
  for (const [ix, iy, label] of probes) {
    const len = Math.hypot(ix, iy), ux = ix / len, uz = iy / len;
    const tx = ux > 0 ? B.maxX / ux : ux < 0 ? -B.maxX / ux : Infinity;
    const tz = uz > 0 ? B.maxZ / uz : uz < 0 ? -B.maxZ / uz : Infinity;
    const oldReach = Math.min(tx, tz) + PLANK;
    const newReach = B.maxX + PLANK;
    console.error(`${label}: OLD reach ${oldReach.toFixed(2)} m from the anchor · NEW ${newReach.toFixed(2)} m`);
  }

  // Sail her to the north clamp with a rider order, then measure the rim.
  sim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -20, z: 49.5 } }]);
  for (let i = 0; i < 4000 && !sim.isTerminal; i += 1) {
    sim.advanceOneTick();
    const o = sim.standingOrdersSnapshot().orders.at(-1);
    if (o?.status === 'done' || o?.status === 'failed') break;
  }
  const m = motion();
  console.error('at the north rim:', JSON.stringify({ x: Number(m.x.toFixed(3)), z: Number(m.z.toFixed(3)), aboard: m.aboard }));
  const bowProbeOld = { x: m.x, z: m.z + 16.25 };
  const bowRim3 = { x: m.x, z: m.z + 14.25 + 3 };
  const beam15 = { x: m.x - 4.4 - 1.5, z: m.z };
  for (const [label, p] of [['old bow probe (+16.25)', bowProbeOld], ['rim 3 m past the bow', bowRim3], ['1.5 m off the port rail', beam15]]) {
    console.error(`${label} (${p.x.toFixed(2)}, ${p.z.toFixed(2)}): navigable=${boat.navigable(p.x, p.z)} contains=${boat.contains(p.x, p.z)} walkable=${walkable(p.x, p.z)} dist-from-anchor=${Math.hypot(p.x - m.x, p.z - m.z).toFixed(2)} withinGangplank(current)=${boat.withinGangplank(p.x, p.z)} stepAshore(current)=${boat.stepAshore(p, walkable)}`);
  }
  // Where does walkable ground actually start north of the hull?
  for (let d = 0; d <= 22; d += 1) {
    const z = m.z + d;
    console.error(`  north +${d}: z=${z.toFixed(2)} navigable=${boat.navigable(m.x, z)} walkable=${walkable(m.x, z)}`);
  }
  // ...and west of a hull at the west clamp.
  for (let d = 0; d <= 12; d += 1) {
    const x = m.x - d;
    console.error(`  west  -${d}: x=${x.toFixed(2)} navigable=${boat.navigable(x, m.z)} walkable=${walkable(x, m.z)}`);
  }
} finally {
  await vite.close();
}
