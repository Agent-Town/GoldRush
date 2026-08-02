#!/usr/bin/env node
/**
 * MEASURE A LANDMARK'S PAINTED POOL — the two numbers `LIVE_SPRING_POND_CONTRACTS` needs.
 *
 * `Terrain3dClaimPilot` mounts a live water surface over the pool a landmark body already paints,
 * and it has to land ON that paint: a surface even 5 cm low is hidden by the body's own depth write
 * and the map silently keeps its dead cyan smudge (that happened, and the pond looked mounted
 * because its reeds were visible). The pool is a flat cap inside a one-mesh body, so it cannot be
 * found by name — it is found by geometry: horizontal triangles near the axis, below the rim.
 *
 *   node scripts/beauty-spring-pool.mjs assets/pilots/map-rebuild-spike/landmarks/dry-gulch/isolated_spring.glb
 *
 * Prints the cap's local surfaceY and the radius its stones start covering, i.e. exactly the
 * `{ surfaceY, radius }` pair to paste. Re-run after any rebuild of the landmark pack.
 */
import { NodeIO } from '@gltf-transform/core';

const file = process.argv[2];
if (!file) {
  console.error('usage: beauty-spring-pool.mjs <landmark.glb>');
  process.exit(2);
}

const document = await new NodeIO().read(file);
const primitives = document.getRoot().listMeshes().flatMap((mesh) => mesh.listPrimitives());
if (primitives.length !== 1) {
  console.log(`note: ${primitives.length} primitives — the pack law expects 1 mesh / 1 material.`);
}

const rows = [];
for (const primitive of primitives) {
  const position = primitive.getAttribute('POSITION')?.getArray();
  const indices = primitive.getIndices()?.getArray();
  if (!position || !indices) continue;
  let bodyTop = -Infinity;
  for (let index = 1; index < position.length; index += 3) bodyTop = Math.max(bodyTop, position[index]);

  // A pool cap is horizontal, sits in the bottom quarter of the body, and straddles the axis.
  const flatHeights = [];
  let capVertexRadius = 0;
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    const corners = [0, 1, 2].map((corner) => {
      const base = indices[triangle + corner] * 3;
      return [position[base], position[base + 1], position[base + 2]];
    });
    const heights = corners.map(([, y]) => y);
    if (Math.max(...heights) - Math.min(...heights) > 0.02) continue;
    if (Math.max(...heights) > bodyTop * 0.35) continue;
    const centreX = (corners[0][0] + corners[1][0] + corners[2][0]) / 3;
    const centreZ = (corners[0][2] + corners[1][2] + corners[2][2]) / 3;
    if (Math.hypot(centreX, centreZ) > bodyTop) continue;
    flatHeights.push(heights[0]);
    for (const [x, , z] of corners) capVertexRadius = Math.max(capVertexRadius, Math.hypot(x, z));
  }
  if (!flatHeights.length) continue;
  flatHeights.sort((a, b) => a - b);
  rows.push({
    surfaceY: round(flatHeights[Math.floor(flatHeights.length / 2)]),
    capRadius: round(capVertexRadius),
    capTriangles: flatHeights.length,
    bodyTop: round(bodyTop),
  });
}

if (!rows.length) {
  console.error('no flat pool cap found — this body may not paint a pool at all.');
  process.exit(1);
}
for (const row of rows) {
  console.log(
    `surfaceY ${row.surfaceY}  capRadius ${row.capRadius}  (${row.capTriangles} flat triangles, body top ${row.bodyTop})`,
  );
  console.log(
    `  suggested: { surfaceY: ${row.surfaceY}, radius: ${round(row.capRadius * 0.84)} }` +
    '  — radius backed off inside the stone ring; confirm against the spring shot.',
  );
}

function round(value) {
  return Math.round(value * 10_000) / 10_000;
}
