import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { audit, parseGlb, metricsFromGltf } from './glb-contract-guard.mjs';
const root = new URL('../', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
test('Claim Boat candidate preserves its pinned source, export and clear authored pad contract', async () => {
  const path = 'assets/pilots/claim-boat-3d/claim-boat.glb';
  const contract = JSON.parse(await readFile(new URL('assets/pilots/claim-boat-3d/claim-boat-contract.json', root)));
  const bytes = await readFile(new URL(path, root));
  assert.equal(sha(bytes), contract.sha256);
  for (const [source, expected] of Object.entries(contract.sourceHashes)) {
    assert.equal(sha(await readFile(new URL(source, root))), expected, source);
  }
  const metrics = metricsFromGltf(parseGlb(bytes));
  assert.equal(metrics.meshes, contract.meshCount);
  assert.equal(metrics.materials, contract.materialCount);
  assert.equal(metrics.triangles, contract.triangles);
  assert.ok(metrics.triangles <= 22000);
  assert.equal(metrics.nonFiniteAttributes, 0);
  const result = await audit({ root: decodeURIComponent(root.pathname), assets: [{ path, family: 'props' }], baseline: { grandfathered: [] } });
  assert.deepEqual(result.live, []);
  assert.deepEqual(result.rows[0].record.textures.map(({width,height})=>[width,height]), [[512,512]]);
  assert.equal(contract.deckClearanceSamples.length, 196);
  assert.ok(contract.deckClearanceSamples.every(row => row.topY >= .77 && row.topY <= .85));
});

test('Flotilla exports match three authored hull identities with compliant textures and clear pads', async () => {
  const contract = JSON.parse(await readFile(new URL('assets/pilots/flotilla-3d/flotilla-contract.json', root)));
  const gameplay = JSON.parse(await readFile(new URL('assets/contracts/epoch-5-deepwater/contracts.json', root)));
  const hulls = gameplay.contracts.find(c => c.id === 'e5-flotilla').tileParams.flotilla.hulls;
  assert.deepEqual(contract.hulls.map(h => [h.id,h.district,h.radius]), hulls.map(h => [h.id,h.district,h.radius]));
  for (const [source, expected] of Object.entries(contract.sourceHashes)) assert.equal(sha(await readFile(new URL(source, root))), expected, source);
  for (const hull of contract.hulls) {
    const path = `assets/pilots/flotilla-3d/${hull.id}.glb`, bytes = await readFile(new URL(path, root));
    assert.equal(sha(bytes), hull.sha256);
    const parsed = parseGlb(bytes), metrics = metricsFromGltf(parsed);
    assert.equal(parsed.json.meshes.length, 1);
    assert.equal(metrics.meshes, 2); assert.equal(metrics.materials, 2);
    assert.equal(metrics.triangles, hull.triangles); assert.ok(metrics.triangles <= 12000);
    assert.equal(metrics.nonFiniteAttributes, 0);
    const result = await audit({root:decodeURIComponent(root.pathname),assets:[{path,family:'props'}],baseline:{grandfathered:[]}});
    assert.deepEqual(result.live, []);
    assert.deepEqual(result.rows[0].record.textures.map(({width,height})=>[width,height]), [[512,512]]);
    assert.equal(hull.clearance.length, 25); assert.ok(hull.clearance.every(p => p.topY >= .79 && p.topY <= .83));
    assert.ok(hull.deckOutline.every(p => Math.hypot(...p) <= hull.radius));
    for (let i=0;i<hull.deckOutline.length;i++) {
      const a=hull.deckOutline[i],b=hull.deckOutline[(i+1)%hull.deckOutline.length],c=hull.deckOutline[(i+2)%hull.deckOutline.length];
      assert.ok((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) < 0,'deck must remain convex and clockwise for the runtime height query');
    }
  }
});
