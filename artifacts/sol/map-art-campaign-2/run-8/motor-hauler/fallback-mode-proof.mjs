import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chromium' }), rows = [];
try {
  for (const width of [1280, 390]) for (const mode of ['terrain2d', 'lite']) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 } });
    const requests = [], errors = [];
    page.on('request', request => { if (request.url().includes('motor-hauler.glb')) requests.push(request.url()); });
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5303/?debug&contract=e4-boneyard&epoch=epoch-4-motor&nowaves&nolevel&nopause&' + (mode === 'lite' ? 'tier=lite' : 'terrain2d&tier=full'));
    await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.frame > 10);
    const proof = await page.evaluate(async () => {
      const { Vehicle } = await import('/src/entities/Vehicle.ts');
      const vehicle = new Vehicle({ draw: amount => amount }, { start: { x: 0, z: 0 } });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = { source: vehicle.group.userData.bodySource, children: vehicle.group.children.length };
      vehicle.dispose();
      return result;
    });
    assert.deepEqual(proof, { source: 'placeholder', children: 3 });
    assert.deepEqual(requests, []); assert.deepEqual(errors, []);
    rows.push({ width, mode, ...proof, requests, errors });
    writeFileSync('artifacts/sol/map-art-campaign-2/run-8/motor-hauler/fallback-mode-proof.json', JSON.stringify(rows, null, 2) + '\n');
    console.log(width, mode, 'fallback without GLB PASS'); await page.close();
  }
} finally { await browser.close(); }
