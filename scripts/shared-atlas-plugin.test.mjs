import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { createServer } from 'vite';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
after(() => vite.close());
const { atlasHash, SharedAtlasCache, SharedAtlasPlugin } = await vite.ssrLoadModule('/src/assets/SharedAtlasPlugin.ts');
const bytes = new TextEncoder().encode('atlas');
function decoded() {
  let closed = 0;
  const texture = new THREE.Texture({ width: 1024, height: 1024, close() { closed++; } });
  return { texture, closed: () => closed };
}

test('FNV-1a 64 known vectors, full bytes, and independent BigInt reference', () => {
  assert.equal(atlasHash(new Uint8Array()), 'cbf29ce484222325');
  assert.equal(atlasHash(new TextEncoder().encode('hello')), 'a430d84680aabd0b');
  const input = Uint8Array.from({ length: 16385 }, (_, i) => (i * 137) & 255);
  let hash = 0xcbf29ce484222325n;
  for (const byte of input) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 0x100000001b3n);
  assert.equal(atlasHash(input), hash.toString(16).padStart(16, '0'));
  input[input.length - 1] ^= 1;
  assert.notEqual(atlasHash(input), hash.toString(16));
});

test('concurrent hits decode once; independent texture state shares Source until final disposal', async () => {
  const cache = new SharedAtlasCache();
  const image = decoded();
  let loads = 0;
  const decode = async () => { loads++; return image.texture; };
  const [a, b] = await Promise.all([cache.acquire(bytes, decode), cache.acquire(bytes.slice(), decode)]);
  assert.equal(loads, 1); assert.equal(cache.size, 1);
  assert.notEqual(a, b); assert.equal(a.source, b.source);
  a.wrapS = THREE.MirroredRepeatWrapping; a.colorSpace = THREE.SRGBColorSpace; a.repeat.x = 3;
  assert.notEqual(a.wrapS, b.wrapS); assert.notEqual(a.colorSpace, b.colorSpace); assert.equal(b.repeat.x, 1);
  a.dispose(); assert.equal(cache.size, 1); assert.equal(image.closed(), 0);
  a.dispose(); assert.equal(image.closed(), 0);
  b.dispose(); assert.equal(cache.size, 0); assert.equal(image.closed(), 1);
  const next = decoded();
  const c = await cache.acquire(bytes, async () => next.texture);
  assert.notEqual(c.source, a.source); c.dispose(); assert.equal(next.closed(), 1);
});

test('misses, decode failure retry, and reset during decode do not retain or resurrect entries', async () => {
  const cache = new SharedAtlasCache();
  await assert.rejects(cache.acquire(bytes, async () => { throw new Error('bad decode'); }), /bad decode/);
  assert.equal(cache.size, 0);
  const a = await cache.acquire(bytes, async () => decoded().texture);
  const b = await cache.acquire(new Uint8Array([1]), async () => decoded().texture);
  assert.notEqual(a.source, b.source); assert.equal(cache.size, 2);
  cache.clear(); assert.equal(cache.size, 0);
  await assert.rejects(cache.acquire(bytes, async () => decoded().texture), /disposed/);
  const pending = new SharedAtlasCache(), late = decoded();
  let finish;
  const result = pending.acquire(bytes, () => new Promise(resolve => { finish = resolve; }));
  await Promise.resolve(); pending.clear(); finish(late.texture);
  await assert.rejects(result, /disposed/); assert.equal(pending.size, 0); assert.equal(late.closed(), 1);
});

async function parse(cache, { wrapS = 10497, color = true, webp = false, mixed = false } = {}) {
  const gltf = {
    asset: { version: '2.0' }, buffers: [{ byteLength: 4, uri: 'data:application/octet-stream;base64,YXRsYQ==' }],
    bufferViews: [{ buffer: 0, byteLength: 4 }], images: [{ bufferView: 0, mimeType: webp ? 'image/webp' : 'image/png' }],
    textures: [{ sampler: 0, ...(webp ? { extensions: { EXT_texture_webp: { source: 0 } } } : { source: 0 }) }],
    samplers: [{ wrapS, minFilter: 9728 }],
    materials: [{ pbrMetallicRoughness: color ? { baseColorTexture: { index: 0 } } : { metallicRoughnessTexture: { index: 0 } }, ...(mixed ? { normalTexture: { index: 0 }, emissiveTexture: { index: 0, texCoord: 1 } } : {}) }],
    meshes: [{ primitives: [{ attributes: {}, material: 0 }] }], nodes: [{ mesh: 0 }], scenes: [{ nodes: [0] }], scene: 0,
    ...(webp ? { extensionsUsed: ['EXT_texture_webp'] } : {}),
  };
  const loader = new GLTFLoader();
  loader.register(parser => {
    parser.loadImageSource = async () => decoded().texture;
    return new SharedAtlasPlugin(parser, cache);
  });
  const result = await loader.parseAsync(JSON.stringify(gltf), '');
  return result.scene.children[0].material;
}

test('real GLTF parser: cross-file wrap, colorSpace, UV and WebP paths preserve independent material views', async () => {
  // Buffer loading uses the browser ProgressEvent API in the installed GLTFLoader.
  globalThis.ProgressEvent ??= class { constructor(type, init) { Object.assign(this, { type }, init); } };
  const cache = new SharedAtlasCache();
  const [a, b, c] = await Promise.all([parse(cache, { mixed: true }), parse(cache, { color: false, wrapS: 33071 }), parse(cache, { webp: true })]);
  assert.equal(cache.size, 1);
  assert.equal(a.map.source, b.metalnessMap.source); assert.equal(a.map.source, c.map.source);
  assert.equal(a.map.colorSpace, THREE.SRGBColorSpace); assert.equal(a.normalMap.colorSpace, THREE.NoColorSpace);
  assert.equal(b.metalnessMap.colorSpace, THREE.NoColorSpace);
  assert.equal(a.map.wrapS, THREE.RepeatWrapping); assert.equal(b.metalnessMap.wrapS, THREE.ClampToEdgeWrapping);
  assert.equal(a.map.generateMipmaps, false); assert.equal(a.emissiveMap.channel, 1); assert.equal(a.map.channel, 0);
  for (const material of [a, b, c]) { material.emissiveMap = material.map; for (const value of Object.values(material)) if (value?.isTexture) value.dispose(); material.dispose(); }
  assert.equal(cache.size, 0);
});

test('late town retries cannot replace or dispose the active run tracker', async () => {
  const { trackedGltfLoader, resetAssetLoading } = await vite.ssrLoadModule('/src/assets/AssetLoading.ts');
  const canvas = { dataset: {} };
  resetAssetLoading(canvas, 'the town');
  const old = trackedGltfLoader(canvas, 'the town');
  resetAssetLoading(canvas, 'the claim');
  const current = trackedGltfLoader(canvas, 'the claim');
  const image = decoded();
  function plugin(loader) {
    return loader.pluginCallbacks.at(-1)({
      json: { textures: [{ source: 0 }], images: [{ bufferView: 0, mimeType: 'image/png' }] },
      getDependency: async () => bytes.buffer,
      loadImageSource: async () => image.texture,
      loadTextureImage: async () => null,
      assignTexture: async () => null,
      associations: new Map(),
    });
  }
  const live = await plugin(current).loadTexture(0);
  const late = trackedGltfLoader(canvas, 'the town');
  await assert.rejects(plugin(old).loadTexture(0), /disposed/);
  await assert.rejects(plugin(late).loadTexture(0), /disposed/);
  assert.equal(trackedGltfLoader(canvas, 'the claim').manager, current.manager);
  assert.equal(canvas.dataset.assetLoadingLabel, 'the claim');
  assert.equal(image.closed(), 0);
  live.dispose(); assert.equal(image.closed(), 1);
});
