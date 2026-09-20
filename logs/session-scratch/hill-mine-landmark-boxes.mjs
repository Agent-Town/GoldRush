// Where do the steam anchors physically sit? Loads the two hill-mine landmark bodies U4 emits from
// and reports their bounding boxes plus the highest narrow cluster in each (a chimney is the tallest
// thin thing on a boiler house), in the MOUNT's own world frame. Measured, never assumed — the
// dry-gulch spring precedent. Reads only.
import { readFileSync } from 'node:fs';
import { NodeIO } from '@gltf-transform/core';

const MOUNTS = [
  { id: 'boiler-house-site', file: 'assets/pilots/map-rebuild-spike/landmarks/hill-mine/boiler-house-site.glb', scale: 1.25, at: [0, 12] },
  { id: 'mine-mouth-and-ruined-headframe', file: 'assets/pilots/map-rebuild-spike/landmarks/hill-mine/mine-mouth-and-ruined-headframe.glb', scale: 1.35, at: [-6, 41] },
];

const io = new NodeIO();
for (const mount of MOUNTS) {
  const document = await io.readBinary(new Uint8Array(readFileSync(mount.file)));
  const box = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  // Column histogram: for every 0.5 m cell in x/z, the highest y seen. A chimney is a cell whose
  // top stands well above its neighbours.
  const columns = new Map();
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute('POSITION');
      if (!position) continue;
      const array = position.getArray();
      for (let index = 0; index < array.length; index += 3) {
        const x = array[index]; const y = array[index + 1]; const z = array[index + 2];
        box.min = [Math.min(box.min[0], x), Math.min(box.min[1], y), Math.min(box.min[2], z)];
        box.max = [Math.max(box.max[0], x), Math.max(box.max[1], y), Math.max(box.max[2], z)];
        const key = `${Math.round(x * 2) / 2},${Math.round(z * 2) / 2}`;
        columns.set(key, Math.max(columns.get(key) ?? -Infinity, y));
      }
    }
  }
  const tops = [...columns].map(([key, y]) => ({ key, y })).sort((a, b) => b.y - a.y);
  console.log(`\n=== ${mount.id} (scale ${mount.scale}, mounted at x${mount.at[0]} z${mount.at[1]}) ===`);
  console.log(`  local box  min ${box.min.map((v) => v.toFixed(2)).join(', ')}   max ${box.max.map((v) => v.toFixed(2)).join(', ')}`);
  console.log(`  world size ${(box.max[0] - box.min[0]) * mount.scale} x ${(box.max[1] - box.min[1]) * mount.scale} x ${(box.max[2] - box.min[2]) * mount.scale}`);
  console.log('  tallest columns (local x,z -> local top y):');
  for (const top of tops.slice(0, 10)) console.log(`    ${top.key.padStart(12)} -> ${top.y.toFixed(3)}`);
  const highest = tops[0];
  const [hx, hz] = highest.key.split(',').map(Number);
  console.log(`  => world anchor for the tallest column: x ${(mount.at[0] + hx * mount.scale).toFixed(2)}  z ${(mount.at[1] + hz * mount.scale).toFixed(2)}  height above mount base ${(highest.y * mount.scale).toFixed(2)}`);
}
