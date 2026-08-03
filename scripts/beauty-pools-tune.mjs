#!/usr/bin/env node
// Strength sweep for the pool grade seam: one browser, one boot, live setBalance per arm.
// Samples the contaminated pale zone (d 2.5-3.5), the :435 gate points (d 2, d 11), and the
// deep-overlap point, at each poolGradeStrength.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = 'http://127.0.0.1:5261';
const STRENGTHS = [0, 0.55, 0.7, 0.8, 0.9, 1.0];
const POINTS = [
  { name: 'd2.0(:435-in)', x: 2, z: 16 },
  { name: 'd2.5-pale', x: 2.5, z: 16 },
  { name: 'd3.0-pale', x: 3, z: 16 },
  { name: 'd3.5-pale', x: 3.5, z: 16 },
  { name: 'd5.5-mid', x: 5.5, z: 16 },
  { name: 'd11(:435-out)', x: 11, z: 16 },
];

const hueOf = ([r, g, b]) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const c = max - min;
  let h;
  if (max === r) h = ((g - b) / c) % 6;
  else if (max === g) h = (b - r) / c + 2;
  else h = (r - g) / c + 4;
  return Math.round(((h * 60 + 360) % 360) * 10) / 10;
};

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(`${BASE}/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=pool-tune&tier=full`);
await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
const briefing = page.getByTestId('contract-briefing');
if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
await page.waitForFunction(() => {
  const c = document.querySelector('#game-canvas');
  return c?.dataset.terrain3dPilotState === 'ready' && c.dataset.terrain3dPilotRenderSource === 'glb';
});
await page.evaluate(() => window.__GR_TEST__.setWave(10));
await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase === 'dark');
await page.evaluate(() => {
  const api = window.__GR_TEST__;
  api.grantGold(50);
  api.teleport(0, 16);
  api.repair('lantern_post', 0);
  api.teleport(1, 17);
});
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools ?? 0) >= 2);
await page.evaluate(() => {
  const canvas = document.querySelector('#game-canvas');
  for (const el of document.querySelectorAll('body *')) {
    if (el === canvas || el.contains(canvas) || canvas.contains(el)) continue;
    el.style.visibility = 'hidden';
  }
});
await page.waitForTimeout(400);

const screenPoints = await page.evaluate((pts) => pts.map((p) => {
  const api = window.__GR_TEST__;
  const s = api.screenPoint(p.x, p.z, api.terrainVisualY(p.x, p.z, 0.03));
  return { ...p, sx: s.x, sy: s.y, inView: s.inView };
}), POINTS);

const canvas = page.locator('#game-canvas');
const box = await canvas.boundingBox();

for (const strength of STRENGTHS) {
  await page.evaluate((s) => window.__GR_TEST__.setBalance('contracts.nightShift.poolGradeStrength', s), strength);
  await page.waitForTimeout(300);
  const frames = [];
  for (let i = 0; i < 3; i += 1) {
    frames.push(PNG.sync.read(await canvas.screenshot()));
    await page.waitForTimeout(120);
  }
  const rows = screenPoints.map((p) => {
    if (!p.inView) return `${p.name.padEnd(14)} off-view`;
    const per = frames.map((png) => {
      const cx = Math.round(p.sx * png.width / box.width);
      const cy = Math.round(p.sy * png.height / box.height);
      const rs = [], gs = [], bs = [];
      for (let y = cy - 4; y <= cy + 4; y += 1) for (let x = cx - 4; x <= cx + 4; x += 1) {
        const o = (y * png.width + x) * 4;
        rs.push(png.data[o]); gs.push(png.data[o + 1]); bs.push(png.data[o + 2]);
      }
      const mid = (l) => l.sort((a, b) => a - b)[Math.floor(l.length / 2)];
      return [mid(rs), mid(gs), mid(bs)];
    });
    const ch = (i) => per.map((f) => f[i]).sort((a, b) => a - b)[1];
    const rgb = [ch(0), ch(1), ch(2)];
    const luma = ((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255).toFixed(4);
    const max = Math.max(...rgb);
    const sat = max === 0 ? 0 : ((max - Math.min(...rgb)) / max).toFixed(3);
    return `${p.name.padEnd(14)} rgb ${String(rgb.join(',')).padEnd(12)} luma ${luma} sat ${sat} hue ${hueOf(rgb)}`;
  });
  console.log(`--- strength ${strength}`);
  for (const row of rows) console.log('  ' + row);
}
console.log('console errors:', JSON.stringify(errors));
await browser.close();
