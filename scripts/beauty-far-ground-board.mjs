#!/usr/bin/env node
// THE FAR GROUND BOARD — the four E1 maps' visible horizon band, at the shipped camera, both
// viewports, with the numbers that decide keep-or-revert.
//
//   GR_BASE=http://127.0.0.1:5341 node scripts/beauty-far-ground-board.mjs <arm> [contract ...]
//
//   <arm> = before | after   (before appends ?horizonApron=off, which is the shipped A/B switch)
//
// Shots land in reviews/shots-beauty-far-ground/<arm>/<map>-<viewport>-<pose>.png, metrics in
// .../metrics-<arm>.json. Adapted from scripts/beauty-night-sky-board.mjs (its canvas-only capture
// and p95 loop) and scripts/beauty-atmos-board.mjs.
//
// WHAT IT MEASURES, and why this band and not the top strip the night board used: the far ground is
// not a fixed strip. scripts/beauty-far-ground.mjs measured, per pose, which rows of the frame the
// apron and the tile's far edge occupy — at the boot pose the top of the frame is MID-TILE terrain,
// at z 0 it is the tile's far edge, and only past z -10 does the apron enter. So the band is
// reported at three widths (top 12 / 25 / 33 % of the frame) and every row of every table says which.
//
// p95 on this box is contended and swings; draw calls and triangles are the trustworthy signals.
// Both arms are captured minutes apart from the same dev server, and the p95 loop is run three times
// per shot with the least-contended window kept (the atmospherics shift's method, reviews/
// beauty-atmos.md section 5).
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import sharp from 'sharp';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5341';
const ARM = process.argv[2] ?? 'after';
const CONTRACTS = process.argv.slice(3).length ? process.argv.slice(3) : ['the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'];
const ART_KEY = { 'the-claim': 'the-claim', 'e1-dry-gulch': 'dry-gulch', 'e1-twin-banks': 'twin-banks', 'e1-baron': 'baron' };
const OUT = path.resolve('reviews/shots-beauty-far-ground', ARM);
const BANDS = [0.12, 0.25, 0.33];

// The poses the far-ground probe showed to be the ones that matter: the frame the player boots into,
// the fresh-eye judge camera every E1 brief names, and the three that walk the horizon into frame.
const POSES = [
  ['boot', null],
  ['fresh-eye', 8.65],
  ['centre', 0],
  ['push', -10],
  ['far-half', -22],
  ['far-edge', -30],
];

const VIEWPORTS = [
  ['desktop-chrome', { viewport: { width: 1280, height: 800 } }],
  ['mobile-chrome', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
];

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Mean/stdev luminance, mean rgb and colour-bucket count over the top `fraction` of the frame. */
function bandStats(png, fraction) {
  const rows = Math.max(1, Math.round(png.height * fraction));
  let r = 0; let g = 0; let b = 0; let n = 0; let sum = 0; let sumSq = 0;
  const buckets = new Set();
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
      const l = luma(...px);
      r += px[0]; g += px[1]; b += px[2]; n += 1; sum += l; sumSq += l * l;
      buckets.add((px[0] >> 5) * 64 + (px[1] >> 5) * 8 + (px[2] >> 5));
    }
  }
  const mean = sum / n;
  return {
    rows,
    meanLuma: +mean.toFixed(2),
    stdevLuma: +Math.sqrt(Math.max(0, sumSq / n - mean * mean)).toFixed(2),
    meanRgb: `${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)}`,
    colourBuckets: buckets.size,
  };
}

async function capture(contract, viewportName, options) {
  const browser = await chromium.launch({ channel: 'chromium' });  // branded chromium: the bundled headless build falls back to software GL and reports ~600 ms p95
  const context = await browser.newContext(options);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => localStorage.clear());
  const flag = ARM === 'before' ? '&horizonApron=off' : '';
  await page.goto(`${BASE}/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&nosteal&nowreck&timescale=1&seed=far-ground&tier=full${flag}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 120_000 });
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#game-canvas');
    return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.terrain3dPilotRenderSource === 'glb';
  }, undefined, { timeout: 120_000 });
  const gate = await page.evaluate(() => {
    const c = document.querySelector('#game-canvas');
    return {
      apron: c?.dataset.terrain3dPilotHorizonApron,
      continuation: c?.dataset.terrain3dPilotContinuation,
      landmarks: c?.dataset.terrain3dPilotLandmarks,
      nightPools: c?.dataset.terrain3dPilotNightPools,
      nightShiftEnabled: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift?.enabled ?? null,
    };
  });

  const rows = [];
  await mkdir(OUT, { recursive: true });
  for (const [pose, z] of POSES) {
    if (z !== null) await page.evaluate((pz) => window.__GR_TEST__.teleport(0, pz), z);
    const from = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
    await page.waitForFunction((start) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > start + 150, from, { timeout: 90_000 });
    // Three consecutive windows, least-contended kept: this box also runs the factory's fires.
    const p95s = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      p95s.push(await page.evaluate(async () => {
        const samples = [];
        let previous = performance.now();
        for (let index = 0; index < 120; index += 1) {
          await new Promise((resolve) => requestAnimationFrame(() => resolve()));
          const now = performance.now();
          samples.push(now - previous);
          previous = now;
        }
        samples.sort((a, b) => a - b);
        return samples[Math.floor(samples.length * 0.95)] ?? 0;
      }));
    }
    const diagnostics = await page.evaluate(() => {
      const d = window.__THREE_GAME_DIAGNOSTICS__;
      return { drawCalls: d?.renderer?.calls, triangles: d?.renderer?.triangles, programs: d?.renderer?.programs };
    });
    // Canvas-only: the HUD's teal and the build bar are not the horizon.
    await page.evaluate(() => {
      const canvas = document.querySelector('#game-canvas');
      for (const element of document.querySelectorAll('body *')) {
        if (element === canvas || element.contains(canvas) || canvas.contains(element)) continue;
        element.style.visibility = 'hidden';
      }
    });
    const file = path.join(OUT, `${ART_KEY[contract] ?? contract}-${viewportName}-${pose}.png`);
    // Captured at the device pixel ratio (Pixel 5 is 2.75x, i.e. 1072x2320) and written at CSS
    // size. Nothing downstream reads a mobile shot above 390 px, and the untrimmed set was 291 MB
    // of evidence on a branch — which is the shape that silently kills a push (the pack dies on
    // the remote and git can still report exit 0). The CENSUS runs on the in-memory buffer above,
    // so the numbers are the full-resolution frame's; only the picture on disk is compacted.
    const buffer = await page.locator('#game-canvas').screenshot();
    // Desktop is captured at 1280x800 (the viewport every number above was measured at) and STORED
    // at 0.75 of it: a far-ground haze band is judged over the top quarter of the frame, and 960 px
    // carries that at a third of the bytes. Prior beauty shifts kept 14-22 MB of shots; the
    // untrimmed set here was 291 MB.
    const css = options.viewport ?? { width: 1280, height: 800 };
    const store = viewportName.startsWith('desktop')
      ? { width: Math.round(css.width * 0.75), height: Math.round(css.height * 0.75) }
      : css;
    await sharp(buffer).resize(store.width, store.height).png({ compressionLevel: 9 }).toFile(file);
    await page.evaluate(() => { for (const element of document.querySelectorAll('body *')) element.style.visibility = ''; });
    const png = PNG.sync.read(buffer);
    rows.push({
      contract,
      viewport: viewportName,
      pose,
      z,
      frameP95Ms: +Math.min(...p95s).toFixed(2),
      p95Samples: p95s.map((v) => +v.toFixed(2)),
      ...diagnostics,
      bands: Object.fromEntries(BANDS.map((f) => [`top${Math.round(f * 100)}`, bandStats(png, f)])),
      shot: path.relative(process.cwd(), file),
    });
  }
  await browser.close();
  return { gate, rows, errors };
}

const all = { arm: ARM, base: BASE, rows: [], gates: {}, errors: [] };
for (const contract of CONTRACTS) {
  for (const [viewportName, options] of VIEWPORTS) {
    const { gate, rows, errors } = await capture(contract, viewportName, options);
    all.gates[`${contract}/${viewportName}`] = gate;
    all.rows.push(...rows);
    all.errors.push(...errors.map((e) => `${contract}/${viewportName}: ${e}`));
    for (const row of rows) {
      console.log(
        `${ARM.padEnd(6)} ${(ART_KEY[contract] ?? contract).padEnd(11)} ${viewportName.padEnd(14)} ${row.pose.padEnd(9)} ` +
        `p95 ${String(row.frameP95Ms).padStart(6)}ms  calls ${String(row.drawCalls).padStart(4)}  tris ${String(row.triangles).padStart(7)}  ` +
        `top25 luma ${String(row.bands.top25.meanLuma).padStart(6)} sd ${String(row.bands.top25.stdevLuma).padStart(5)} rgb ${row.bands.top25.meanRgb.padEnd(12)} buckets ${row.bands.top25.colourBuckets}`,
      );
    }
  }
}
await mkdir(OUT, { recursive: true });
await writeFile(path.resolve('reviews/shots-beauty-far-ground', `metrics-${ARM}.json`), `${JSON.stringify(all, null, 2)}\n`);
console.log('\ngates:', JSON.stringify(all.gates, null, 1));
console.log('console errors:', all.errors.length ? all.errors : 'none');
