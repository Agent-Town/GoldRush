#!/usr/bin/env node
// U4 capture loop for e1-night-shift: the four scripted light moments, desktop and 390 px mobile,
// plus the numbers that decide whether a sky repaint changed anything the player can see.
//
//   BASE=http://127.0.0.1:5233 node scripts/beauty-night-sky-board.mjs <tag>
//
// Shots land in reviews/shots-beauty-night-r2/<tag>/. Rendering-only: it drives the shipped debug
// harness, changes no balance, and asserts nothing — it reports.
//
// The sky band is measured, not eyeballed. The panorama ring is 190 m out, past the camera's far
// plane, and preparePanorama pins gl_Position.z = w * 0.999999 so it draws anyway; screenPoint's
// inView therefore lies about it. What is reported instead is the top strip of the frame — the only
// place the ring can land from this camera — sampled for mean colour and for pin-dot count.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5233';
const TAG = process.argv[2] ?? 'current';
const SHOT_DIR = path.resolve('reviews/shots-beauty-night-r2', TAG);
const HERO = [12, 12];
const WANTED_POSTS = 7;
const LANTERN_SITES = (() => {
  const sites = [];
  for (const radius of [8, 13, 18]) {
    for (let step = 0; step < 12; step += 1) {
      const angle = (step / 12) * Math.PI * 2;
      sites.push([
        Math.round((HERO[0] + Math.cos(angle) * radius) * 10) / 10,
        Math.round((HERO[1] + Math.sin(angle) * radius) * 10) / 10,
      ]);
    }
  }
  return sites;
})();

const MOMENTS = [
  ['01-day', 1],
  ['02-dusk', 8],
  ['03-dark', 10],
  ['04-dawn', 25],
];

// The ring can only reach the top of the frame from this camera; that strip is where a sky upgrade
// either exists or does not. Fraction of frame height.
const SKY_STRIP = 0.25;

function skyStats(buffer) {
  const png = PNG.sync.read(buffer);
  const rows = Math.max(1, Math.round(png.height * SKY_STRIP));
  let r = 0; let g = 0; let b = 0; let count = 0;
  let peak = -1; let peakPx = [0, 0, 0]; let peakPos = [0, 0];
  const lumaOf = (rr, gg, bb) => 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  const lumas = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const offset = (y * png.width + x) * 4;
      const px = [png.data[offset], png.data[offset + 1], png.data[offset + 2]];
      const luma = lumaOf(...px);
      r += px[0]; g += px[1]; b += px[2]; count += 1;
      lumas.push(luma);
      if (luma > peak) { peak = luma; peakPx = px; peakPos = [x, y]; }
    }
  }
  lumas.sort((a, b2) => a - b2);
  const median = lumas[Math.floor(lumas.length / 2)];
  // A pin-dot star is a pixel far above its own strip's median. Count them; a flat gradient has none.
  const threshold = median + 12;
  const dots = lumas.filter((l) => l > threshold).length;
  return {
    strip: `${png.width}x${rows}`,
    mean: `${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)}`,
    meanLuma: +(lumas.reduce((a, b2) => a + b2, 0) / lumas.length).toFixed(2),
    medianLuma: +median.toFixed(2),
    peakLuma: +peak.toFixed(1),
    peakPx: peakPx.join(','),
    peakPos: peakPos.join(','),
    brightPixels: dots,
    brightShare: +((dots / lumas.length) * 100).toFixed(3),
  };
}

async function capture(project, viewport, extra) {
  const browser = await chromium.launch({ channel: 'chromium' });  // branded chromium: the bundled headless build falls back to software GL and reports ~600 ms p95
  const context = await browser.newContext({ viewport, ...extra });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=beauty-night-shift&tier=full`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotRenderSource === 'glb';
  });
  await page.evaluate(([x, z]) => window.__GR_TEST__.teleport(x, z), HERO);
  const posts = await page.evaluate(({ sites, wanted }) => {
    const api = window.__GR_TEST__;
    api.grantGold(5000);
    for (let index = 0; index < 7; index += 1) api.repair('lantern_post', index);
    let placed = 0;
    for (const [x, z] of sites) {
      if (placed >= wanted) break;
      if (api.placeFree('lantern_post', x, z)) placed += 1;
    }
    return placed;
  }, { sites: LANTERN_SITES, wanted: WANTED_POSTS });

  const rows = [];
  await mkdir(SHOT_DIR, { recursive: true });
  for (const [moment, wave] of MOMENTS) {
    await page.evaluate((target) => window.__GR_TEST__.setWave(target), wave);
    await page.waitForTimeout(700);
    const frameP95Ms = await page.evaluate(async () => {
      const samples = [];
      let previous = performance.now();
      for (let index = 0; index < 180; index += 1) {
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
        const now = performance.now();
        samples.push(now - previous);
        previous = now;
      }
      samples.sort((a, b) => a - b);
      return samples[Math.floor(samples.length * 0.95)] ?? 0;
    });
    const diagnostics = await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      const canvas = document.querySelector('#game-canvas');
      return {
        phase: d?.lighting?.nightShift?.phase,
        darkness: d?.lighting?.nightShift?.darkness,
        drawCalls: d?.renderer?.calls,
        triangles: d?.renderer?.triangles,
        panoramaTriangles: Number(canvas?.dataset.terrain3dPilotPanoramaTriangles ?? 0),
        panoramaVertices: Number(canvas?.dataset.terrain3dPilotPanoramaVertices ?? 0),
        pilotState: canvas?.dataset.terrain3dPilotState,
      };
    });
    await page.evaluate((hide) => {
      const canvas = document.querySelector('#game-canvas');
      if (!canvas) return;
      for (const element of document.querySelectorAll('body *')) {
        if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
        element.style.visibility = hide ? 'hidden' : '';
      }
    }, true);
    const shot = path.join(SHOT_DIR, `${project}-${moment}.png`);
    const buffer = await page.locator('#game-canvas').screenshot({ path: shot });
    await page.evaluate(() => {
      for (const element of document.querySelectorAll('body *')) element.style.visibility = '';
    });
    rows.push({ moment, project, frameP95Ms: Math.round(frameP95Ms * 100) / 100, ...diagnostics, sky: skyStats(buffer) });
  }
  await browser.close();
  return { rows, errors, posts };
}

const desktop = await capture('desktop-chrome', { width: 1280, height: 800 }, {});
const mobile = await capture('mobile-chrome', { width: 390, height: 844 }, { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } });
const all = { tag: TAG, posts: { desktop: desktop.posts, mobile: mobile.posts }, rows: [...desktop.rows, ...mobile.rows], errors: [...desktop.errors, ...mobile.errors] };
await writeFile(path.join(SHOT_DIR, 'metrics.json'), `${JSON.stringify(all, null, 2)}\n`);
for (const row of all.rows) {
  console.log(
    `${row.project.padEnd(14)} ${row.moment.padEnd(9)} p95 ${String(row.frameP95Ms).padStart(6)}ms  ` +
    `calls ${String(row.drawCalls).padStart(4)}  darkness ${row.darkness}  ` +
    `sky mean ${row.sky.mean.padEnd(12)} luma ${String(row.sky.meanLuma).padStart(6)}  ` +
    `peak ${String(row.sky.peakLuma).padStart(5)} @${row.sky.peakPos.padEnd(9)} bright ${String(row.sky.brightPixels).padStart(6)} (${row.sky.brightShare}%)`,
  );
}
console.log(`posts placed: desktop ${all.posts.desktop}, mobile ${all.posts.mobile} (want ${WANTED_POSTS})`);
console.log('console errors:', all.errors.length ? all.errors : 'none');
