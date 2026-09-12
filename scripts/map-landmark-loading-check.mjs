// Run against this checkout's dev server: PROBE_BASE=http://127.0.0.1:5267 node scripts/map-landmark-loading-check.mjs
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { resolveBase } from '../rehearsal/base-url.mjs';

const base = resolveBase('PROBE_BASE', { root: process.cwd() });
const production = process.env.PROBE_PRODUCTION === '1';
const out = `artifacts/map-art-repairs-20260908/deepwater${production ? '-production' : ''}`;
mkdirSync(out, { recursive: true });
const mounts = JSON.parse(readFileSync('assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json')).landmarkMounts;
const browser = await chromium.launch({ channel: 'chromium' });
const results = [];
try {
  for (const mobile of [false, true]) for (const id of ['e5-deepwater-claim', 'e5-stillwater', 'e5-flotilla', 'the-claim']) {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    const loadedUrls = [];
    page.on('response', response => { if (response.ok() && /\.glb(?:\?|$)/.test(response.url())) loadedUrls.push(response.url()); });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto(`${base}/?debug&era=${id === 'the-claim' ? 1 : 5}&contract=${id}&nowaves&nolevel&nokill&nopause&tier=full`);
      await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.frame > 10);
      const begin = page.getByTestId('contract-briefing-dismiss');
      if (await begin.isVisible()) await begin.click();
      await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted');
      const result = await page.evaluate(async ({ id, production }) => {
        const urls = production ? [] : await (await import('/src/world/Terrain3dClaimPilot.ts')).contractPrefetchUrls(id);
        return { active: window.__GR_TEST__.activeContract().id, dataset: { ...document.querySelector('#game-canvas').dataset }, urls };
      }, { id, production });
      assert.equal(result.active, id);
      assert.equal(result.dataset.terrain3dPilotLandmarkSkipped, '0');
      assert.equal(result.dataset.terrain3dPilotState, 'ready');
      assert.equal(Number(result.dataset.terrain3dPilotLandmarks), id === 'the-claim' ? 5 : mounts.length);
      if (id !== 'the-claim') for (const mount of mounts) {
        if (!production) assert.ok(result.urls.some(url => url.includes(mount.asset)), `prefetch missing ${mount.id}`);
        const stem = mount.asset.split('/').pop().replace(/\.glb$/, '');
        assert.ok(loadedUrls.some(url => url.includes(stem)), `runtime request missing ${mount.id}`);
      }
      assert.deepEqual(errors, []);
      const shot = `${id}-${mobile ? 'mobile' : 'desktop'}.png`;
      await page.screenshot({ path: `${out}/${shot}` });
      const stations = [];
      if (id === 'e5-deepwater-claim') for (const mount of JSON.parse(result.dataset.terrain3dPilotLandmarkMounts)) {
        await page.evaluate(({ x, z }) => window.__GR_TEST__.teleport(x, z - 6), mount);
        const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
        await page.waitForFunction(frame => window.__THREE_GAME_DIAGNOSTICS__.frame >= frame + 8, frame);
        const station = `${mount.id}-${mobile ? 'mobile' : 'desktop'}.png`;
        await page.screenshot({ path: `${out}/${station}` });
        stations.push({ ...mount, shot: station });
      }
      assert.deepEqual(errors, []);
      results.push({ id, mobile, production, result, loadedUrls, errors, shot, stations });
      console.log('PASS', id, mobile ? 'mobile' : 'desktop', result.dataset.terrain3dPilotLandmarks, 'mounts');
    } finally { await page.close(); }
  }
} finally {
  writeFileSync(`${out}/checks.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
