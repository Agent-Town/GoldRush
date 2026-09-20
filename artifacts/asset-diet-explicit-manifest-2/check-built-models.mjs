// Run after npm run build: node artifacts/asset-diet-explicit-manifest-2/check-built-models.mjs
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, matchesGlob } from 'node:path';
import sharp from 'sharp';

const manifest = JSON.parse(readFileSync('scripts/asset-diet.manifest.json'));
const sources = readdirSync('assets/pilots', { recursive: true }).filter((file) => file.endsWith('.glb')).map((file) => `assets/pilots/${file}`);
function glb(file) {
  const bytes = readFileSync(file);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, file);
  const jsonLength = bytes.readUInt32LE(12);
  return { bytes, json: JSON.parse(bytes.subarray(20, 20 + jsonLength)), binaryStart: 28 + jsonLength };
}
function shape(json) {
  return json.meshes.map((mesh) => ({
    name: mesh.name,
    morphNames: mesh.extras?.targetNames ?? [],
    primitives: mesh.primitives.map((primitive) => ({
      mode: primitive.mode ?? 4,
      indices: json.accessors[primitive.indices ?? primitive.attributes.POSITION].count,
      morphs: primitive.targets?.length ?? 0,
    })),
  }));
}
async function dimensions(model) {
  return Promise.all((model.json.images ?? []).map(async (image) => {
    const view = model.json.bufferViews[image.bufferView];
    const start = model.binaryStart + (view.byteOffset ?? 0);
    const { width, height } = await sharp(model.bytes.subarray(start, start + view.byteLength)).metadata();
    return { width, height };
  }));
}
const rows = [];
for (const file of readdirSync('dist/assets').filter((name) => name.endsWith('.glb')).sort()) {
  const name = file.replace(/-[\w-]{8}(?:-diet-[a-f0-9]{8})?\.glb$/, '.glb');
  const source = sources.find((candidate) => basename(candidate) === name);
  assert.ok(source, `source for ${file}`);
  const families = manifest.filter((entry) => entry.patterns.some((pattern) => matchesGlob(source, pattern)));
  assert.equal(families.length, 1, source);
  const before = glb(source);
  const after = glb(`dist/assets/${file}`);
  assert.deepEqual(shape(after.json), shape(before.json), `mesh names, topology, morphs: ${source}`);
  assert.deepEqual(await dimensions(after), await dimensions(before), `texture dimensions: ${source}`);
  if (families[0].compress) {
    assert.ok(after.json.extensionsRequired.includes('EXT_meshopt_compression'), `Meshopt: ${file}`);
    assert.ok((after.json.images ?? []).every((image) => image.mimeType === 'image/webp'), `WebP: ${file}`);
  } else {
    assert.deepEqual(after.bytes, before.bytes, `opt-out bytes: ${file}`);
  }
  rows.push({ source, dist: `assets/${file}`, family: families[0].family, before: before.bytes.length, after: after.bytes.length });
}
writeFileSync('artifacts/asset-diet-explicit-manifest-2/built-inventory.json', `${JSON.stringify(rows, null, 2)}\n`);
console.log(`PASS ${rows.length} GLBs: manifest coverage, Meshopt, WebP, mesh names, topology, morphs, texture dimensions`);
