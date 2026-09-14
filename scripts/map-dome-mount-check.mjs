// PROBE_BASE=http://127.0.0.1:5269 node scripts/map-dome-mount-check.mjs
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { resolveBase } from '../rehearsal/base-url.mjs';
const base = resolveBase('PROBE_BASE', { root: process.cwd() });
const out = 'artifacts/map-art-repairs-20260908/mare-dome-factory-01';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const mobile of [false, true]) for (const contract of ['e8-mare-claim', 'e8-eclipse', 'e8-far-side']) {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route(/\/src\/world\/Terrain3dClaimPilot\.ts(?:\?.*)?$/, async route => {
      const response = await route.fetch(), body = await response.text();
      assert.ok(body.includes('landmarks = nextLandmarks;'));
      await route.fulfill({ response, body: body.replace('landmarks = nextLandmarks;', 'landmarks = nextLandmarks; globalThis.__domeMounts = nextLandmarks; globalThis.__domePrefetch = contractPrefetchUrls;') });
    });
    await page.goto(`${base}/?debug&nowaves&nospawn&nolevel&contract=${contract}`);
    await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
    const result = await page.evaluate(async contract => {
      const models = globalThis.__domeMounts.children;
      const domes = models.filter(m => m.name.endsWith('-air-pad-dome'));
      const materials = domes.map(model => { const found = new Set(); model.traverse(n => { for (const m of [n.material].flat()) if (m) found.add(m); }); return [...found]; });
      const urls = await globalThis.__domePrefetch(contract);
      return { total: models.length, domes: domes.map(m => ({ id: m.name, x: m.position.x, z: m.position.z })), materialCounts: materials.map(m => m.length), independent: new Set(materials.flat()).size === materials.flat().length, prefetchedDome: urls.some(url => url.includes('air-pad-dome')), errors: document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarkErrors };
    }, contract);
    rows.push({ contract, mobile, ...result, errors });
    await writeFile(`${out}/mounts.json`, JSON.stringify(rows, null, 2));
    const expected = contract === 'e8-far-side' ? 0 : 3;
    assert.equal(result.total, 5 + expected);
    assert.equal(result.domes.length, expected);
    assert.equal(result.prefetchedDome, expected > 0);
    assert.equal(result.independent, true);
    assert.deepEqual(result.materialCounts, Array(expected).fill(2));
    if (expected) assert.deepEqual(result.domes.map(m => m.x).sort((a,b) => a-b), [-18, 0, 18]);
    assert.deepEqual(errors, []);
    await page.getByTestId('contract-briefing-dismiss').click();
    await page.screenshot({ path: `${out}/${contract}-${mobile ? 'mobile' : 'desktop'}.png` });
    console.log(contract, mobile ? 'mobile' : 'desktop', 'pass');
    await page.close();
  }
} finally { await browser.close(); }
