// Run: node --experimental-strip-types artifacts/asset-diet-explicit-manifest/check-baron-bake.mjs
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, meshopt } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import { Box3 } from 'three';
import { createGltfLoader } from '../../src/assets/AssetLoading.ts';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
for (const keepFloatPositions of [false, true]) {
  const document = await io.read('assets/pilots/baron-props-3d/baron-props.glb');
  // Material removal keeps this geometry probe independent of a DOM image decoder.
  for (const material of document.getRoot().listMaterials()) material.dispose();
  await document.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  if (keepFloatPositions) await document.transform(dequantize({ pattern: /^POSITION$/ }));
  const bytes = await io.writeBinary(document);
  const { scene } = await createGltfLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  scene.updateMatrixWorld(true);
  let maxError = 0;
  scene.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const expected = new Box3().setFromObject(mesh);
    // This is the existing Game.loadBaronProps3d baking operation.
    const baked = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
    baked.computeBoundingBox();
    maxError = Math.max(maxError, expected.min.distanceTo(baked.boundingBox.min), expected.max.distanceTo(baked.boundingBox.max));
    baked.dispose();
  });
  console.log(JSON.stringify({ keepFloatPositions, maxBakeBoundsError: maxError }));
  if (keepFloatPositions) assert.ok(maxError < 0.00001, 'Float32 position baking preserves the loaded world bounds');
  else assert.ok(maxError < 0.0001, 'quantized Baron geometry stays within the measured baking tolerance');
}
