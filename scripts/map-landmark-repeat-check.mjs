// PROBE_BASE=http://127.0.0.1:5269 node scripts/map-landmark-repeat-check.mjs
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { resolveBase } from '../rehearsal/base-url.mjs';

const base = resolveBase('PROBE_BASE', { root: process.cwd() });
const browser = await chromium.launch({ channel: 'chromium' });
try {
  for (const mobile of [false, true]) {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route(/\/src\/world\/Terrain3dClaimPilot\.ts(?:\?.*)?$/, async route => {
      const response = await route.fetch();
      let body = await response.text();
      const needle = 'host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);';
      assert.ok(body.includes(needle));
      body = body.replace(needle, `mounts.push({ ...mounts[0], id: 'repeat-test', position: [mounts[0].position[0] + 20, mounts[0].position[1], mounts[0].position[2]] });\n${needle}`);
      body = body.replace('landmarks = nextLandmarks;', 'landmarks = nextLandmarks; globalThis.__repeatLandmarks = nextLandmarks;');
      await route.fulfill({ response, body });
    });
    await page.goto(`${base}/?debug&nowaves&nospawn&nolevel&contract=e8-mare-claim`);
    await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    const result = await page.evaluate(() => {
      const models = globalThis.__repeatLandmarks.children;
      const first = models[0], repeated = models.find(model => model.name === 'repeat-test');
      const materials = model => { const found = new Set(); model?.traverse(node => { for (const material of [node.material].flat()) if (material) found.add(material); }); return found; };
      const firstMaterials = materials(first);
      return { expected: Number(document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkExpected), actual: models.length,
        distinct: first !== repeated, offset: repeated.position.x - first.position.x,
        sharedMaterials: [...materials(repeated)].some(material => firstMaterials.has(material)) };
    });
    console.log(JSON.stringify({ mobile, ...result, errors }));
    assert.equal(result.actual, result.expected, 'repeated asset must not reparent its first mount');
    assert.equal(result.distinct, true);
    assert.equal(result.offset, 20);
    assert.equal(result.sharedMaterials, false, 'mount-specific paint must not leak into another placement');
    assert.deepEqual(errors, []);
    await page.close();
  }
} finally { await browser.close(); }
