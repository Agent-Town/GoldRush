// F-ASTRA-10 (docs/reviews/2026-09-05-astra-3d-review.md §4): `visualY` used to lerp bilinearly
// over a cell's four corners while the mesh draws two triangles across ONE diagonal. Those are
// different surfaces, and Astra's own centroid sweep of the four terrains measured the gap at up
// to 0.6667 units on the Mare, which is where feet float or sink.
//
// This guard reproduces that measurement against the REAL shipped sampler (`bakeHeightGrid`, SSR
// loaded out of src/world/Terrain3dClaimPilot.ts, not a copy) and pins the cure: at every triangle
// centroid of every one of the four GLBs, the sampled height must equal the drawn height. The OLD
// bilinear formula below is the pre-fix code, kept ONLY as the baseline that makes the table
// meaningful; production no longer contains it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// The project vite config supplies the `__GR_RELEASE_E1__` define the module tree needs; a
// bare `configFile: false` server cannot load it.
const vite = await createServer({ root: ROOT, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
after(() => vite.close());
const { bakeHeightGrid } = await vite.ssrLoadModule('/src/world/Terrain3dClaimPilot.ts');

const TERRAINS = [
  { name: 'The Claim', asset: 'the-claim-terrain.glb', astraMax: 0.0253, astraP95: 0.00072 },
  { name: 'Twin Banks', asset: 'twin-banks-terrain.glb', astraMax: 0.0230, astraP95: 0.00196 },
  { name: 'Hill Mine', asset: 'hill-mine-terrain.glb', astraMax: 0.1033, astraP95: 0.00025 },
  { name: 'Mare Claim', asset: 'mare-claim-terrain.glb', astraMax: 0.6667, astraP95: 0.00346 },
];
const EXACT = 1e-6;

const COMPONENT = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const ELEMENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

/** Minimal binary-glTF reader: the JSON chunk, the BIN chunk, and the one terrain primitive. */
function readTerrainGlb(asset) {
  const file = readFileSync(new URL(`../assets/pilots/map-rebuild-spike/${asset}`, import.meta.url));
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  assert.equal(view.getUint32(0, true), 0x46546c67, `${asset} is not a GLB`);
  let offset = 12;
  let json;
  let bin;
  while (offset < file.byteLength) {
    const length = view.getUint32(offset, true);
    const kind = view.getUint32(offset + 4, true);
    const start = offset + 8;
    if (kind === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(file.subarray(start, start + length)));
    if (kind === 0x004e4942) bin = file.subarray(start, start + length);
    offset = start + length;
  }
  const read = (index) => {
    const accessor = json.accessors[index];
    const bufferView = json.bufferViews[accessor.bufferView];
    const Ctor = COMPONENT[accessor.componentType];
    const per = ELEMENTS[accessor.type];
    const base = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
    const stride = bufferView.byteStride;
    if (stride && stride !== per * Ctor.BYTES_PER_ELEMENT) {
      const out = new Ctor(accessor.count * per);
      for (let element = 0; element < accessor.count; element += 1) {
        out.set(new Ctor(bin.buffer, bin.byteOffset + base + element * stride, per), element * per);
      }
      return out;
    }
    return new Ctor(bin.buffer, bin.byteOffset + base, accessor.count * per);
  };
  const primitive = json.meshes[0].primitives[0];
  const node = json.nodes[json.scenes[json.scene ?? 0].nodes[0]];
  return { position: read(primitive.attributes.POSITION), index: read(primitive.indices), node };
}

/** The same THREE object graph `installLoaded` hands the sampler, built from the GLB by hand. */
function mount({ position, index, node }) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(position), 3));
  geometry.setIndex(new THREE.BufferAttribute(index.slice(), 1));
  const model = new THREE.Object3D();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  if (node.matrix) mesh.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));
  else {
    if (node.translation) mesh.position.fromArray(node.translation);
    if (node.rotation) mesh.quaternion.fromArray(node.rotation);
    if (node.scale) mesh.scale.fromArray(node.scale);
  }
  model.add(mesh);
  model.updateMatrixWorld(true);
  return { model, bounds: new THREE.Box3().setFromObject(model) };
}

/**
 * The pre-fix sampler, verbatim in behaviour: a bilinear lerp over the cell's four corners,
 * ignoring which way the mesh actually split the cell. Baseline only.
 */
function bilinearHeightGrid(model, bounds) {
  const mesh = model.getObjectByProperty('isMesh', true);
  const position = mesh.geometry.getAttribute('position');
  const segments = Math.round(Math.sqrt(position.count)) - 1;
  const width = segments + 1;
  const stepX = (bounds.max.x - bounds.min.x) / segments;
  const stepZ = (bounds.max.z - bounds.min.z) / segments;
  const heights = new Float32Array(width * width);
  const point = new THREE.Vector3();
  model.updateMatrixWorld(true);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    point.fromBufferAttribute(position, vertex);
    mesh.localToWorld(point);
    const column = Math.round((point.x - bounds.min.x) / stepX);
    const row = Math.round((point.z - bounds.min.z) / stepZ);
    heights[row * width + column] = point.y;
  }
  return (x, z) => {
    const gx = THREE.MathUtils.clamp((x - bounds.min.x) / stepX, 0, segments);
    const gz = THREE.MathUtils.clamp((z - bounds.min.z) / stepZ, 0, segments);
    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);
    const x1 = Math.min(x0 + 1, segments);
    const z1 = Math.min(z0 + 1, segments);
    const north = THREE.MathUtils.lerp(heights[z0 * width + x0], heights[z0 * width + x1], gx - x0);
    const south = THREE.MathUtils.lerp(heights[z1 * width + x0], heights[z1 * width + x1], gx - x0);
    return THREE.MathUtils.lerp(north, south, gz - z0);
  };
}

function percentile(sorted, fraction) {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))))];
}

/**
 * Every triangle centroid, both samplers. A triangle is planar, so the drawn height at its
 * centroid is exactly the mean of its three corner heights: no tolerance is being smuggled in.
 */
function sweep(model, bounds, index, sampler) {
  const mesh = model.getObjectByProperty('isMesh', true);
  const position = mesh.geometry.getAttribute('position');
  const point = new THREE.Vector3();
  const world = new Float64Array(position.count * 3);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    point.fromBufferAttribute(position, vertex);
    mesh.localToWorld(point);
    world[vertex * 3] = point.x;
    world[vertex * 3 + 1] = point.y;
    world[vertex * 3 + 2] = point.z;
  }
  const errors = new Float64Array(index.length / 3);
  let worst = { error: -1, x: 0, z: 0 };
  for (let triangle = 0; triangle < errors.length; triangle += 1) {
    const a = index[triangle * 3], b = index[triangle * 3 + 1], c = index[triangle * 3 + 2];
    const x = (world[a * 3] + world[b * 3] + world[c * 3]) / 3;
    const y = (world[a * 3 + 1] + world[b * 3 + 1] + world[c * 3 + 1]) / 3;
    const z = (world[a * 3 + 2] + world[b * 3 + 2] + world[c * 3 + 2]) / 3;
    const error = Math.abs(sampler(x, z) - y);
    errors[triangle] = error;
    if (error > worst.error) worst = { error, x, z };
  }
  const sorted = Float64Array.prototype.slice.call(errors).sort();
  return { max: worst.error, p95: percentile(sorted, 0.95), worst, triangles: errors.length, bounds };
}

test('the height sampler lands on the drawn triangles, not near them (F-ASTRA-10)', () => {
  const rows = [];
  for (const terrain of TERRAINS) {
    const glb = readTerrainGlb(terrain.asset);
    const { model, bounds } = mount(glb);
    const old = sweep(model, bounds, glb.index, bilinearHeightGrid(model, bounds));
    const next = sweep(model, bounds, glb.index, bakeHeightGrid(model, { bounds }));
    rows.push({ terrain, old, next });

    // The cure: the sample IS the rendered surface, everywhere.
    assert.ok(
      next.max <= EXACT,
      `${terrain.name}: new sampler off the drawn surface by ${next.max} at (${next.worst.x}, ${next.worst.z})`,
    );
    // And the harness really is measuring what Astra measured: reproduce the published max
    // within 1% before believing the zero above.
    assert.ok(
      Math.abs(old.max - terrain.astraMax) <= Math.max(0.01 * terrain.astraMax, 1e-4),
      `${terrain.name}: old max ${old.max} does not reproduce Astra's ${terrain.astraMax}`,
    );
    assert.ok(old.max > next.max, `${terrain.name}: the old sampler was already exact, nothing was fixed`);
  }

  const cell = (value) => String(value).padEnd(11);
  console.log('\n  centroid discrepancy vs the drawn triangles (every triangle of every terrain)');
  console.log(`  ${'terrain'.padEnd(12)}${'triangles'.padEnd(11)}${'old max'.padEnd(11)}${'old p95'.padEnd(11)}${'new max'.padEnd(11)}${'new p95'.padEnd(11)}worst point (x, z)`);
  for (const { terrain, old, next } of rows) {
    console.log(
      `  ${terrain.name.padEnd(12)}${cell(old.triangles)}${cell(old.max.toFixed(6))}${cell(old.p95.toFixed(6))}`
      + `${cell(next.max.toExponential(2))}${cell(next.p95.toExponential(2))}`
      + `(${old.worst.x.toFixed(3)}, ${old.worst.z.toFixed(3)})`,
    );
  }
  console.log('');
});

test('the diagonal is read from the index buffer, never assumed', () => {
  // One cell, corners (0,0)=0, (1,0)=10, (0,1)=10, (1,1)=0. The two diagonals disagree about the
  // cell centre by the full relief: the main split reads 5 there, the anti split also 5, but the
  // quarter points separate them. Sample a point that only the drawn triangle can explain.
  const corners = [
    [0, 0, 0], [1, 10, 0],
    [0, 10, 1], [1, 0, 1],
  ];
  const build = (index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(corners.flat()), 3));
    geometry.setIndex(index);
    const model = new THREE.Object3D();
    model.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
    model.updateMatrixWorld(true);
    return bakeHeightGrid(model, { bounds: new THREE.Box3().setFromObject(model) });
  };
  // Vertices are 0=(0,0) 1=(1,0) 2=(0,1) 3=(1,1) in (column,row).
  const main = build([0, 1, 3, 0, 3, 2]); // split (0,0)..(1,1)
  const anti = build([0, 1, 2, 1, 3, 2]); // split (1,0)..(0,1)

  // (0.75, 0.5) misses BOTH diagonals, so the two topologies put it on genuinely different
  // planes: the main split's lower half, and the anti split's upper half.
  assert.equal(main(0.75, 0.5), 2.5); // plane through (0,0)=0, (1,0)=10, (1,1)=0
  assert.equal(anti(0.75, 0.5), 7.5); // plane through (1,0)=10, (0,1)=10, (1,1)=0
  // A point ON the shared anti diagonal must read the same from either of its triangles.
  assert.equal(anti(0.75, 0.25), 10);

  // Corners are shared by both splits and must agree exactly with the mesh.
  for (const [x, y, z] of corners) {
    assert.equal(main(x, z), y);
    assert.equal(anti(x, z), y);
  }
});

test('a cell the mesh never split, or split both ways, is rejected rather than guessed', () => {
  const positions = Float32Array.from([0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1]);
  const bake = (index) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(index);
    const model = new THREE.Object3D();
    model.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial()));
    model.updateMatrixWorld(true);
    return () => bakeHeightGrid(model, { bounds: new THREE.Box3().setFromObject(model) });
  };
  assert.throws(bake([0, 1, 3]), /incomplete terrain topology/); // one triangle, half a cell
  assert.throws(bake([0, 1, 3, 0, 1, 2]), /invalid terrain topology/); // the two disagree
  assert.throws(bake([0, 1, 1, 0, 3, 2]), /invalid terrain topology/); // degenerate, no diagonal
});
