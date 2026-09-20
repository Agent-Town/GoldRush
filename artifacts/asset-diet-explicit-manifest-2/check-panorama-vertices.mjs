import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const evidence = 'artifacts/asset-diet-explicit-manifest-2';
const rows = JSON.parse(readFileSync(`${evidence}/built-inventory.json`)).filter(({ family }) => family === 'panoramas');
const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage();
  await page.route('**/asset-diet-probe.html', (route) => route.fulfill({ body: '<!doctype html><body>model probe', contentType: 'text/html' }));
  await page.route('**/asset-diet-probe-model/*', (route) => {
    const [index, arm] = new URL(route.request().url()).pathname.split('/').at(-1).split('-');
    const row = rows[Number(index)];
    return route.fulfill({ body: readFileSync(arm === 'source' ? row.source : `dist/${row.dist}`), contentType: 'model/gltf-binary' });
  });
  await page.goto('http://127.0.0.1:5197/asset-diet-probe.html');
  const results = await page.evaluate(async (rows) => {
    const { createGltfLoader } = await import('/src/assets/AssetLoading.ts');
    const results = [];
    for (const [index, row] of rows.entries()) {
      const result = { source: row.source };
      for (const arm of ['source', 'built']) {
        const gltf = await createGltfLoader().parseAsync(await (await fetch(`/asset-diet-probe-model/${index}-${arm}`)).arrayBuffer(), '');
        let meshes = 0, triangles = 0, vertices = 0;
        const materials = new Set();
        gltf.scene.traverse((node) => {
          if (!node.isMesh) return;
          meshes++;
          const positions = node.geometry.getAttribute('position');
          const unique = new Set();
          for (let i = 0; i < positions.count; i++) unique.add(`${positions.getX(i)},${positions.getY(i)},${positions.getZ(i)}`);
          vertices += unique.size;
          triangles += (node.geometry.index?.count ?? positions.count) / 3;
          for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
          node.geometry.dispose();
        });
        result[arm === 'source' ? 'original' : arm] = { meshes, triangles, vertices, materials: materials.size };
        for (const material of materials) { material.map?.image?.close?.(); material.map?.dispose(); material.dispose(); }
      }
      results.push(result);
    }
    return results;
  }, rows);
  writeFileSync(`${evidence}/panorama-vertices.json`, `${JSON.stringify(results, null, 2)}\n`);
  for (const row of results) if (row.original.vertices !== row.built.vertices) console.log(`${row.source}: unique vertices ${row.original.vertices} -> ${row.built.vertices}`);
  assert.equal(results.length, 32);
  for (const row of results) assert.deepEqual(row.built, row.original, row.source);
  console.log(`Measured ${results.length} panoramas through the real shared browser loader.`);
} finally {
  await browser.close();
}
