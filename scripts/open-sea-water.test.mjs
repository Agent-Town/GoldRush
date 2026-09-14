import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import * as THREE from 'three';
const pending = [];
globalThis.__seaTestLoad = slot => new Promise(resolve => pending.push({ slot, resolve }));
const oldDocument = globalThis.document;
globalThis.document = { createElement: () => ({ getContext: () => new Proxy({}, { get: () => () => {} }) }) };
const vite = await createServer({ configFile: false, plugins: [{ name: 'sea-test-assets', enforce: 'pre',
  resolveId(id, importer) { if (id === '../assets/generated' && importer?.endsWith('/Water.ts')) return '\0sea-test-assets'; },
  load(id) { if (id === '\0sea-test-assets') return 'export const loadGeneratedTexture = slot => globalThis.__seaTestLoad(slot)'; },
}], server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
after(async () => { await vite.close(); globalThis.document = oldDocument; delete globalThis.__seaTestLoad; });
const { createSculptWater } = await vite.ssrLoadModule('/src/world/Water.ts');
const config = { ford: false, openSea: true, riverHalfWidth: 64, visualHalfWidth: 190, lengthHalf: 190, fadeStart: 183,
  fordHalfWidth: 0, riverDepth: 4, fordDepth: 0, wadeDepth: 1, deepDepth: 8, anchors: [], depthTest: true,
  surfaceY: 0, centerZ: 0, halfLength: 190, heightAt: () => -4, deepMeters: 8, shoreMeters: 0.5 };

test('sea texture has a disposable local sampler; late loading cannot resurrect a disposed surface', async () => {
  const sea = createSculptWater(config), material = sea.mesh.material, fallback = material.map;
  let fallbackDisposed = 0, sourceDisposed = 0, viewDisposed = 0;
  fallback.addEventListener('dispose', () => fallbackDisposed++);
  const source = new THREE.Texture({ width: 448, height: 448 });
  source.addEventListener('dispose', () => sourceDisposed++);
  assert.equal(pending[0].slot, 'terrain.e5.open_sea');
  pending.shift().resolve(source); await Promise.resolve();
  assert.notEqual(material.map, source); assert.equal(material.map.source, source.source);
  assert.equal(material.map.wrapS, THREE.RepeatWrapping); assert.equal(material.map.wrapT, THREE.RepeatWrapping);
  assert.equal(source.wrapS, THREE.ClampToEdgeWrapping); assert.equal(fallbackDisposed, 1);
  assert.equal(material.depthTest, true); assert.equal(material.depthWrite, false);
  material.map.addEventListener('dispose', () => viewDisposed++);
  const shader = { uniforms: {}, vertexShader: '#include <common>\n#include <uv_vertex>', fragmentShader: '#include <common>\n#include <map_fragment>' };
  material.onBeforeCompile(shader, {});
  assert.equal(shader.uniforms.waterBedMap.value.image.width, 512);
  assert.equal(shader.uniforms.waterBedMap.value.image.height, 512);
  assert.match(shader.fragmentShader, /flowUv = vWaterWorld \/ 20\.0/);
  assert.match(shader.fragmentShader, /fordBand = max\(waterFord, 0\.0\)/);
  sea.dispose(); assert.equal(viewDisposed, 1); assert.equal(sourceDisposed, 0);
  const late = createSculptWater(config), deadMap = late.mesh.material.map;
  late.dispose(); pending.shift().resolve(source); await Promise.resolve();
  assert.equal(late.mesh.material.map, deadMap); assert.equal(sourceDisposed, 0);
  const river = createSculptWater({ ...config, openSea: false });
  assert.equal(pending[0].slot, 'terrain.river'); pending.shift().resolve(null); await Promise.resolve();
  assert.notEqual(river.mesh.material.customProgramCacheKey(), material.customProgramCacheKey());
  shader.fragmentShader = '#include <common>\n#include <map_fragment>';
  shader.vertexShader = '#include <common>\n#include <uv_vertex>';
  river.mesh.material.onBeforeCompile(shader, {});
  assert.equal(shader.uniforms.waterBedMap.value.image.height, 64);
  assert.doesNotMatch(shader.fragmentShader, /flowUv = vWaterWorld \/ 20\.0/);
  river.dispose();
});
