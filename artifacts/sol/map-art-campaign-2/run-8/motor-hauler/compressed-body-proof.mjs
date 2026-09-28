// Feed the emitted Meshopt body through the production loader, without changing the app.
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = 'artifacts/sol/map-art-campaign-2/run-8/motor-hauler';
const name = readdirSync('dist/assets').find(n => /^motor-hauler-.*\.glb$/.test(n));
assert.ok(name);
const body = readFileSync('dist/assets/' + name);
const json = JSON.parse(body.subarray(20, 20 + body.readUInt32LE(12)).toString());
assert.ok(json.extensionsUsed.includes('EXT_meshopt_compression'));
const browser = await chromium.launch({ channel: 'chromium' }), rows = [];
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 } });
    const errors = []; let requests = 0;
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/motor-hauler.glb', route => {
      requests++;
      return route.fulfill({ status: 200, contentType: 'model/gltf-binary', body });
    });
    await page.goto('http://127.0.0.1:5303/?debug&contract=e4-boneyard&epoch=epoch-4-motor&nowaves&nolevel&nopause&tier=full');
    await page.waitForFunction(() => window.__GR_TEST__ && document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    const proof = await page.evaluate(async () => {
      const { Vehicle } = await import('/src/entities/Vehicle.ts');
      const T = await import('/@id/three');
      const v = new Vehicle({ draw: amount => amount }, { start: { x: 0, z: 0 } });
      const deadline = performance.now() + 30000;
      while (v.group.userData.bodySource !== 'glb') {
        if (performance.now() > deadline) throw Error('compressed body did not load');
        await new Promise(r => setTimeout(r, 20));
      }
      let triangles = 0; const materials = new Set();
      v.group.traverse(n => {
        if (!n.isMesh) return;
        triangles += (n.geometry.index?.count ?? n.geometry.attributes.position.count) / 3;
        for (const m of Array.isArray(n.material) ? n.material : [n.material]) materials.add(m);
      });
      const bounds = new T.Box3().setFromObject(v.group), size = bounds.getSize(new T.Vector3()).toArray();
      const result = { source: v.group.userData.bodySource, triangles, materials: materials.size, emission: [...materials].map(m => m.emissiveIntensity ?? 0), size };
      v.dispose();
      return result;
    });
    assert.equal(proof.triangles, 1520);
    assert.equal(proof.materials, 5);
    assert.ok(Math.max(...proof.emission) <= 0.6);
    assert.ok(Math.abs(proof.size[0] - 2.278) < .002 && Math.abs(proof.size[2] - 3.1) < .002);
    assert.ok(requests > 0); assert.deepEqual(errors, []);
    rows.push({ width, emittedAsset: name, emittedBytes: body.length, requests, ...proof, errors });
    writeFileSync(out + '/compressed-body-proof.json', JSON.stringify(rows, null, 2) + '\n');
    console.log(width, 'compressed body PASS'); await page.close();
  }
} finally { await browser.close(); }
