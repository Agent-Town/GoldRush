// Did the re-export MOVE THE MESH? Compares vertex Y between the shipped hill-mine terrain GLB and
// the freshly built one at the same grid coordinates. The contract's triangle/vertex/bounds counts
// cannot see this: a recipe that changed its height function keeps every count identical and only
// the geometry moves. Reads only.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';

const io = new NodeIO();
const load = async (bytes) => {
  const document = await io.readBinary(new Uint8Array(bytes));
  const primitive = document.getRoot().listMeshes()[0].listPrimitives()[0];
  return primitive.getAttribute('POSITION').getArray();
};

const shipped = await load(execSync('git show HEAD~1:assets/pilots/map-rebuild-spike/hill-mine-terrain.glb', { maxBuffer: 1 << 30 }));
const rebuilt = await load(readFileSync('assets/pilots/map-rebuild-spike/hill-mine-terrain.glb'));
console.log('vertex counts', shipped.length / 3, rebuilt.length / 3);

let moved = 0; let maxDelta = 0; let sumDelta = 0; let atMax = null;
for (let index = 0; index < shipped.length; index += 3) {
  const dy = Math.abs(shipped[index + 1] - rebuilt[index + 1]);
  const dxz = Math.abs(shipped[index] - rebuilt[index]) + Math.abs(shipped[index + 2] - rebuilt[index + 2]);
  if (dy > 1e-6) { moved += 1; sumDelta += dy; if (dy > maxDelta) { maxDelta = dy; atMax = [shipped[index], shipped[index + 2], shipped[index + 1], rebuilt[index + 1]]; } }
  if (dxz > 1e-6) console.log('PLANAR MOVE at index', index / 3);
}
console.log('vertices whose Y moved:', moved, `(${((moved / (shipped.length / 3)) * 100).toFixed(2)}%)`);
console.log('mean |dY| over moved:', moved ? (sumDelta / moved).toFixed(6) : 0, ' max |dY|:', maxDelta.toFixed(6));
if (atMax) console.log(`worst at x ${atMax[0].toFixed(2)} z ${atMax[1].toFixed(2)}: shipped ${atMax[2].toFixed(6)} -> rebuilt ${atMax[3].toFixed(6)}`);

// The spec's own sample points.
const probe = (x, z) => {
  let best = Infinity; let sy = 0; let ry = 0;
  for (let index = 0; index < shipped.length; index += 3) {
    const d = Math.hypot(shipped[index] - x, shipped[index + 2] - z);
    if (d < best) { best = d; sy = shipped[index + 1]; ry = rebuilt[index + 1]; }
  }
  return { x, z, shipped: +sy.toFixed(6), rebuilt: +ry.toFixed(6), dist: +best.toFixed(3) };
};
for (const [x, z] of [[0, -18], [-24, 0], [0, 14], [24, 26], [28, 40]]) console.log(JSON.stringify(probe(x, z)));
