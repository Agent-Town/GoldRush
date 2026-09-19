import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type OpaquePropPart = {
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  hidden?: () => boolean;
};

/** Static opaque props only. Each prop keeps a bound, so merging does not submit off-camera
 * geometry. Index compaction happens before each color/shadow draw: three uploads the index in
 * renderBufferDirect, whereas instanceMatrix changes in onBeforeRender arrive one frame late.
 * The full geometry bounds stay conservative when a camera or building clearing changes. */
export function createOpaquePropBatch(parts: readonly OpaquePropPart[], material: THREE.Material): THREE.Mesh {
  if (material.transparent || material.alphaTest > 0) throw new Error('Opaque prop batches cannot contain transparent or alpha-tested materials');
  if (!parts.length) throw new Error('An opaque prop batch needs geometry');
  const transformed = parts.map(part => {
    const geometry = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
    return geometry.applyMatrix4(part.matrix);
  });
  const geometry = mergeGeometries(transformed);
  if (!geometry) {
    transformed.forEach(part => part.dispose());
    throw new Error('Opaque prop attributes must match');
  }
  let offset = 0;
  const ranges = transformed.map((part, index) => {
    part.computeBoundingSphere();
    const range = { start: offset, count: part.getAttribute('position').count,
      sphere: part.boundingSphere!.clone(), hidden: parts[index]!.hidden };
    offset += range.count;
    part.dispose();
    return range;
  });
  const IndexArray = offset > 65535 ? Uint32Array : Uint16Array;
  const allIndices = new IndexArray(offset);
  for (let index = 0; index < offset; index++) allIndices[index] = index;
  const index = new THREE.BufferAttribute(allIndices.slice(), 1).setUsage(THREE.DynamicDrawUsage);
  geometry.setIndex(index);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const mesh = new THREE.Mesh(geometry, material);
  const frustum = new THREE.Frustum();
  const clip = new THREE.Matrix4();
  const worldSphere = new THREE.Sphere();
  const visible = new Uint8Array(ranges.length).fill(1);
  const nextVisible = new Uint8Array(ranges.length);
  const cull = (camera: THREE.Camera): void => {
    frustum.setFromProjectionMatrix(clip.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse), camera.coordinateSystem);
    let changed = false;
    let count = 0;
    for (let part = 0; part < ranges.length; part++) {
      const range = ranges[part]!;
      const keep = !range.hidden?.() && frustum.intersectsSphere(worldSphere.copy(range.sphere).applyMatrix4(mesh.matrixWorld));
      nextVisible[part] = Number(keep);
      changed ||= nextVisible[part] !== visible[part];
      if (keep) count += range.count;
    }
    if (changed) {
      let target = 0;
      for (let part = 0; part < ranges.length; part++) {
        if (!nextVisible[part]) continue;
        const range = ranges[part]!;
        index.array.set(allIndices.subarray(range.start, range.start + range.count), target);
        target += range.count;
      }
      visible.set(nextVisible);
      index.needsUpdate = true;
    }
    geometry.setDrawRange(0, count);
    mesh.userData.opaquePropsVisible = nextVisible.reduce((sum, value) => sum + value, 0);
  };
  mesh.userData.opaqueProps = parts.length;
  mesh.onBeforeRender = (_renderer, _scene, camera) => cull(camera);
  mesh.onBeforeShadow = (_renderer, _object, _camera, shadowCamera) => cull(shadowCamera);
  return mesh;
}
