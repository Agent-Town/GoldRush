// F-FC2-5 scope 2 — is the rim point walkable ground, and does the body float or sink?
// Samples `Terrain.sample().walkable` and `Terrain.visualY()` over the cradle's 5.04 x 3.6
// footprint at the old mount (0,45) and the candidate rim mounts, with the cradle ABSENT from
// the registry so the terrain answers for itself.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const location = new URL('http://gr-sim.local/?debug&contract=e8-far-side&seed=e8-far-side-01');
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
const { landmarkBlockersFor } = await vite.ssrLoadModule('/src/world/LandmarkCollision.ts');

const r3 = (v) => Math.round(v * 1000) / 1000;
console.log(`hero radius = ${Balance.hero.radius}; blocker pad = ${r3(Balance.hero.radius + 0.08)}`);
console.log('registry blockers: ' + landmarkBlockersFor('e8-far-side').map((b) => b.id).join(', '));
const visualY = Terrain.visualY ?? Terrain.heightAt ?? null;
console.log('visualY fn present = ' + (typeof visualY === 'function'));

const HALF_X = 5.04 / 2;
const HALF_Z = 3.6 / 2;
for (const [cx, cz] of [[0, 45], [0, 50.5], [0, 36.2]]) {
  const ys = [];
  let unwalkable = 0;
  let cells = 0;
  for (let x = cx - HALF_X; x <= cx + HALF_X + 1e-9; x += HALF_X / 2) {
    for (let z = cz - HALF_Z; z <= cz + HALF_Z + 1e-9; z += HALF_Z / 2) {
      cells += 1;
      if (!Terrain.sample(x, z).walkable) unwalkable += 1;
      if (typeof visualY === 'function') ys.push(visualY(x, z));
    }
  }
  const min = ys.length ? Math.min(...ys) : NaN;
  const max = ys.length ? Math.max(...ys) : NaN;
  console.log(`mount (${cx}, ${cz}): ${cells - unwalkable}/${cells} footprint cells walkable; visualY ${r3(min)}..${r3(max)} (span ${r3(max - min)}), centre ${r3(typeof visualY === 'function' ? visualY(cx, cz) : NaN)}`);
}

console.log('== walkable, x=0, z=30..60 (cradle absent) ==');
const line = [];
for (let z = 30; z <= 60; z += 0.5) line.push(`${z}:${Terrain.sample(0, z).walkable ? 'W' : '.'}`);
console.log('  ' + line.join(' '));
await vite.close();
