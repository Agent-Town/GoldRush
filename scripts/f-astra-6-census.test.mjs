import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import * as THREE from 'three';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
after(() => vite.close());
const { createOpaquePropBatch } = await vite.ssrLoadModule('/src/town/OpaquePropBatchPilot.ts');

function camera(x) {
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 20);
  cam.position.set(x, 0, 5);
  cam.lookAt(x, 0, 0);
  cam.updateMatrixWorld(true);
  return cam;
}
function draw(mesh, cam) {
  mesh.onBeforeRender(null, null, cam);
  return [...mesh.geometry.index.array.slice(0, mesh.geometry.drawRange.count)];
}

test('opaque batching refuses transparency and alpha testing, including opacity-one transparent materials', () => {
  const part = { geometry: new THREE.BoxGeometry(), matrix: new THREE.Matrix4() };
  for (const material of [new THREE.MeshBasicMaterial({ transparent: true }), new THREE.MeshBasicMaterial({ alphaTest: 0.1 })]) {
    assert.throws(() => createOpaquePropBatch([part], material), /transparent or alpha-tested/);
  }
});

test('per-prop bounds cull and restore the same geometry through camera moves and building clearings', () => {
  let cleared = false;
  const source = new THREE.BoxGeometry();
  const batch = createOpaquePropBatch([
    { geometry: source, matrix: new THREE.Matrix4(), hidden: () => cleared },
    { geometry: source, matrix: new THREE.Matrix4().makeTranslation(100, 0, 0) },
  ], new THREE.MeshStandardMaterial());
  batch.updateMatrixWorld(true);
  const originalBounds = batch.geometry.boundingSphere.clone();
  assert.deepEqual(draw(batch, camera(0)), Array.from({ length: 36 }, (_, i) => i));
  assert.deepEqual(draw(batch, camera(100)), Array.from({ length: 36 }, (_, i) => i + 36));
  assert.equal(draw(batch, camera(50)).length, 0);
  assert.equal(draw(batch, camera(0)).length, 36);
  cleared = true;
  assert.equal(draw(batch, camera(0)).length, 0);
  cleared = false;
  assert.equal(draw(batch, camera(0)).length, 36);
  assert.ok(batch.geometry.boundingSphere.equals(originalBounds), 'full bounds must not shrink to the last visible subset');
  assert.equal(source.index.count, 36, 'the shared source geometry is unchanged');
});

test('shadow and color cameras select independent prop sets, then restore the next color draw', () => {
  const source = new THREE.BoxGeometry();
  const batch = createOpaquePropBatch([
    { geometry: source, matrix: new THREE.Matrix4() },
    { geometry: source, matrix: new THREE.Matrix4().makeTranslation(100, 0, 0) },
  ], new THREE.MeshStandardMaterial());
  batch.updateMatrixWorld(true);
  const color = camera(0), shadow = camera(100);
  const expected = draw(batch, color);
  batch.onBeforeShadow(null, batch, color, shadow);
  assert.equal(batch.geometry.index.getX(0), 36);
  assert.deepEqual(draw(batch, color), expected);
});

test('batch transforms preserve source positions and UV coordinates', () => {
  const source = new THREE.BoxGeometry().toNonIndexed();
  const matrix = new THREE.Matrix4().compose(new THREE.Vector3(4, 2, -3), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.7), new THREE.Vector3(2, 2, 2));
  const batch = createOpaquePropBatch([{ geometry: source, matrix }], new THREE.MeshStandardMaterial());
  const actual = batch.geometry.attributes.position;
  for (let i = 0; i < actual.count; i++) {
    const expected = new THREE.Vector3().fromBufferAttribute(source.attributes.position, i).applyMatrix4(matrix);
    assert.ok(expected.distanceTo(new THREE.Vector3().fromBufferAttribute(actual, i)) < 1e-6);
  }
  assert.deepEqual(batch.geometry.attributes.uv.array, source.attributes.uv.array);
});
