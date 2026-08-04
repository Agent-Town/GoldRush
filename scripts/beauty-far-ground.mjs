#!/usr/bin/env node
// THE FAR GROUND — where is the horizon a player can actually see, per map, in metres and pixels?
//
//   BASE=http://127.0.0.1:5341 node scripts/beauty-far-ground.mjs [contract ...]
//
// Adapted from scripts/beauty-sky-visibility.mjs (the night-shift r2 instrument) and
// logs/session-scratch/atmos-baron-horizon.mjs (the atmospherics probe). Three things it does that
// neither of those did:
//
//  1. THE FRAME TOP IS MEASURED AT THE RING'S OWN RADIUS, IN METRES. sky-visibility raised a probe
//     50 m ahead and converted to an angle using an ASSUMED eye height of 26.2 m — and measured the
//     distance from the HERO, while the eye stands 18.3 m further back, so its angle is short. Here
//     the probe rides at the panorama's real foot radius (read from the GLB, not from a constant),
//     so the answer is a straight comparison of two heights at one radius: "the frame top passes
//     through y = H at r = R; the ring's foot is at y = F". No trigonometry, no assumed eye.
//  2. THE ELEVATION ANGLE IS RECOVERED FROM TWO PROBES, not from Balance constants: two points on
//     the same frame-top ray give its slope directly, whatever the eye height and zoom happen to be.
//  3. THE SURFACES ARE COUNTED, not argued about. `?farGroundProbe` (src/world/HorizonApron.ts)
//     flattens the panorama to magenta, the sculpt continuation to cyan and the terrain tile to
//     green, tone-mapping exempt, so a screenshot is a census.
//
// screenPoint().inView is useless out here and says so in both of its callers: the ring sits past
// the camera's 100 m far plane while preparePanorama pins gl_Position.z = w * 0.999999 so it renders
// anyway, and inView tests NDC z in [-1,1]. Judge by canvas x/y only.
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5341';
const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.env.GR_OUT ?? resolve(ROOT, 'artifacts/beauty-far-ground');
const CONTRACTS = process.argv.slice(2).length ? process.argv.slice(2) : ['the-claim', 'e1-dry-gulch', 'e1-twin-banks', 'e1-baron'];
const SHOT = process.env.GR_SHOTS === '0' ? false : true;
// `solo` hides the terrain and the apron: the positive control for a 0.00% panorama reading.
const MODE = process.env.GR_PROBE_MODE === 'solo' ? 'solo' : 'on';

// contract id -> the map key the art pipeline uses for its GLB/atlas filenames.
const ART_KEY = { 'the-claim': 'the-claim', 'e1-dry-gulch': 'dry-gulch', 'e1-twin-banks': 'twin-banks', 'e1-baron': 'baron', 'e1-night-shift': 'night-shift' };

const POSES = [
  ['boot', null],
  ['home +20', 20],
  ['fresh-eye +8.65', 8.65],
  ['centre 0', 0],
  ['push -10', -10],
  ['far-half -22', -22],
  ['far-edge -30', -30],
];

const VIEWPORTS = [
  ['desktop', { viewport: { width: 1280, height: 800 } }],
  ['mobile', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
];

// ---------------------------------------------------------------------------------------------
// THE RING, READ FROM THE GLB ITSELF (no constants, no contract prose)
// ---------------------------------------------------------------------------------------------

/** Minimal GLB reader: the JSON chunk is all we need — accessor min/max are mandatory on POSITION. */
function glbJson(path) {
  const buffer = readFileSync(path);
  if (buffer.readUInt32LE(0) !== 0x46546c67) throw new Error(`not a GLB: ${path}`);
  let offset = 12;
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    if (type === 0x4e4f534a) return JSON.parse(buffer.subarray(offset + 8, offset + 8 + length).toString('utf8'));
    offset += 8 + length + ((4 - (length % 4)) % 4);
  }
  throw new Error(`no JSON chunk: ${path}`);
}

/**
 * The ring's own extent. glTF is Y-up and the exporter writes POSITION min/max per accessor, so the
 * ring's lowest point and its widest/narrowest radius come out of the header without touching a
 * single vertex buffer. Radius is bounded rather than exact (a box bound cannot see the circle's
 * waist), so the FOOT radius is taken from the panorama contract's own measured projection block
 * and cross-checked against the box.
 */
function ringExtent(artKey) {
  const json = glbJson(resolve(ROOT, `assets/pilots/map-rebuild-spike/${artKey}-panorama.glb`));
  let lowest = Number.POSITIVE_INFINITY;
  let highest = Number.NEGATIVE_INFINITY;
  let widest = 0;
  for (const mesh of json.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      const accessor = json.accessors?.[primitive.attributes?.POSITION];
      if (!accessor?.min || !accessor?.max) continue;
      lowest = Math.min(lowest, accessor.min[1]);
      highest = Math.max(highest, accessor.max[1]);
      widest = Math.max(widest, Math.abs(accessor.min[0]), Math.abs(accessor.max[0]), Math.abs(accessor.min[2]), Math.abs(accessor.max[2]));
    }
  }
  const contract = JSON.parse(readFileSync(resolve(ROOT, `assets/pilots/map-rebuild-spike/${artKey}-panorama-contract.json`), 'utf8'));
  return {
    lowestY: lowest,
    highestY: highest,
    boxRadius: widest,
    footRadius: contract.projection?.ridgeFootRadiusMeters ?? widest,
    skyRadius: contract.projection?.skyRingRadiusMeters ?? widest,
    vertices: contract.vertices,
    triangles: contract.triangles,
    atlasBytes: contract.files?.atlas?.bytes ?? null,
  };
}

// ---------------------------------------------------------------------------------------------
// THE CENSUS
// ---------------------------------------------------------------------------------------------

/**
 * Classify by HUE MARGIN plus a PRIMARY FLOOR, never by absolute channels alone. Green and cyan both
 * satisfy g > r, so green is tested first on its blue deficit; magenta is the only hue with both r
 * and b over g. The probe materials are toneMapped:false, so a real hit is a near-primary: measured
 * apron (50,214,211), terrain (45,228,18).
 *
 * The floor is load-bearing and was added after a first pass without it. Margin alone scored 30
 * pixels of the enemy sprite's plum shading (113,41,83) as PANORAMA and 49 pixels of twin-banks'
 * teal scatter (52,117,95) as APRON — a phantom 0.01% of ring, at rows 78-83% of the frame, where
 * no sky ring can physically be. Both die on `high >= 120`.
 */
const PRIMARY_FLOOR = 120;
const HUE_MARGIN = 60;

function census(buffer, skipTopRows = 0) {
  const png = PNG.sync.read(buffer);
  const seen = { panorama: 0, apron: 0, terrain: 0 };
  const rows = { panorama: [-1, -1], apron: [-1, -1], terrain: [-1, -1] };
  for (let y = skipTopRows; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      const r = png.data[i];
      const g = png.data[i + 1];
      const b = png.data[i + 2];
      let hit = null;
      if (r >= PRIMARY_FLOOR && b >= PRIMARY_FLOOR && r - g > HUE_MARGIN && b - g > HUE_MARGIN) hit = 'panorama';
      else if (g >= PRIMARY_FLOOR && g - r > HUE_MARGIN && g - b > HUE_MARGIN) hit = 'terrain';
      else if (g >= PRIMARY_FLOOR && b >= PRIMARY_FLOOR && g - r > HUE_MARGIN && b - r > HUE_MARGIN) hit = 'apron';
      if (!hit) continue;
      seen[hit] += 1;
      if (rows[hit][0] < 0) rows[hit][0] = y;
      rows[hit][1] = y;
    }
  }
  const total = png.width * (png.height - skipTopRows);
  const pct = (n) => +((n / total) * 100).toFixed(2);
  const rowPct = (row) => (row < 0 ? null : +((row / png.height) * 100).toFixed(1));
  return {
    panoramaPct: pct(seen.panorama),
    apronPct: pct(seen.apron),
    terrainPct: pct(seen.terrain),
    apronRowsPct: [rowPct(rows.apron[0]), rowPct(rows.apron[1])],
    terrainRowsPct: [rowPct(rows.terrain[0]), rowPct(rows.terrain[1])],
    panoramaRowsPct: [rowPct(rows.panorama[0]), rowPct(rows.panorama[1])],
  };
}

// ---------------------------------------------------------------------------------------------

async function boot(context, contract, extra = '') {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`${BASE}/?debug&farGroundProbe=${MODE}&contract=${contract}&timescale=1&nolevel&nowaves&nosteal&nowreck&nokill&tier=full&seed=far-ground${extra}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 120_000 });
  await page.waitForFunction(
    () => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready',
    undefined,
    { timeout: 120_000 },
  );
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  // The HUD's own teal counts as apron under any hue test. Hide the whole overlay rather than
  // masking rows: the atmospherics probe carried a 1.3% floor from exactly this and had to
  // caveat every number it published.
  await page.addStyleTag({ content: '.lil-gui, #hud, #touch-controls { display: none !important; }' });
  return { page, errors };
}

async function settle(page, frames = 180) {
  const from = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
  await page.waitForFunction(([start, n]) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > start + n, [from, frames], { timeout: 90_000 });
}

/**
 * Where does the top edge of the frame pass, in metres, at a given radius directly ahead (-z)?
 * Scan up, then bisect. Scanning matters: raise a probe past the camera's own look direction and
 * the projection mirrors it back onto the canvas with a flipped sign, so a bare binary search on
 * "is screenY >= 0" converges on the mirror instead of on the frame edge.
 */
async function frameTopHeightAt(page, radius) {
  return page.evaluate((r) => {
    const api = window.__GR_TEST__;
    const at = (y) => api.screenPoint(0, -r, y).y;
    let lo = null;
    let hi = null;
    for (let y = -600; y <= 160; y += 0.5) {
      if (at(y) < 0) { hi = y; lo = y - 0.5; break; }
    }
    if (hi === null) return null;
    for (let step = 0; step < 40; step += 1) {
      const mid = (lo + hi) / 2;
      if (at(mid) >= 0) lo = mid; else hi = mid;
    }
    return lo;
  }, radius);
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];

for (const contract of CONTRACTS) {
  const artKey = ART_KEY[contract] ?? contract;
  const ring = ringExtent(artKey);
  for (const [viewport, options] of VIEWPORTS) {
    const context = await browser.newContext(options);
    const { page, errors } = await boot(context, contract);
    const gate = await page.evaluate(() => {
      const c = document.querySelector('#game-canvas');
      return {
        source: c?.dataset.terrain3dPilotRenderSource,
        state: c?.dataset.terrain3dPilotState,
        probe: c?.dataset.terrain3dPilotFarGroundProbe,
        continuation: c?.dataset.terrain3dPilotContinuation,
        apron: c?.dataset.terrain3dPilotHorizonApron,
        landmarks: c?.dataset.terrain3dPilotLandmarks,
        panorama: c?.dataset.terrain3dPilotPanorama,
        panoramaVertices: c?.dataset.terrain3dPilotPanoramaVertices,
      };
    });

    // --- the geometry of seeing, measured at the ring's own radius ---
    await page.evaluate(() => window.__GR_TEST__.teleport(0, 0));
    await settle(page, 60);
    const atFoot = await frameTopHeightAt(page, ring.footRadius);
    const atSky = await frameTopHeightAt(page, ring.skyRadius);
    const nearA = await frameTopHeightAt(page, 40);
    const nearB = await frameTopHeightAt(page, 120);
    // Two points on one ray -> its slope, with no assumed eye height and no assumed zoom.
    const slope = nearA !== null && nearB !== null ? (nearB - nearA) / (120 - 40) : null;
    const frameTopDeg = slope === null ? null : (Math.atan(slope) * 180) / Math.PI;
    // Recover the eye height the ray implies, as a cross-check on Balance.camera.offset (26.2).
    const impliedEyeY = slope === null ? null : nearA - slope * (40 + 18.3);

    const poses = [];
    for (const [name, z] of POSES) {
      if (z !== null) await page.evaluate((pz) => window.__GR_TEST__.teleport(0, pz), z);
      await settle(page, 150);
      const file = `${OUT}/probe${MODE === 'solo' ? '-solo' : ''}-${artKey}-${viewport}-${name.replace(/[^a-z0-9+-]+/gi, '_')}.png`;
      const shot = await page.screenshot();
      // The census reads the full-resolution buffer; the file is written at CSS size so a mobile
      // probe frame is 390 px rather than 1072 px. Same reason as the board: evidence weight.
      if (SHOT) await sharp(shot).resize(options.viewport.width, options.viewport.height).png({ compressionLevel: 9 }).toFile(file);
      poses.push({ pose: name, z, ...census(shot), shot: SHOT ? file.replace(`${ROOT}/`, '') : null });
    }
    await context.close();

    report.push({
      contract,
      viewport,
      gate,
      ring,
      frameTop: {
        heightAtFootRadiusM: atFoot === null ? null : +atFoot.toFixed(2),
        heightAtSkyRadiusM: atSky === null ? null : +atSky.toFixed(2),
        ringFootY: ring.lowestY,
        // Positive = the ring's foot stands this far ABOVE the top edge of the frame at its own
        // radius, i.e. it is off the top of the screen by that many metres.
        footAboveFrameTopM: atFoot === null ? null : +(ring.lowestY - atFoot).toFixed(2),
        elevationDeg: frameTopDeg === null ? null : +frameTopDeg.toFixed(2),
        impliedEyeY: impliedEyeY === null ? null : +impliedEyeY.toFixed(2),
      },
      poses,
      errors,
    });
    console.log(JSON.stringify(report.at(-1), null, 1));
  }
}

writeFileSync(`${OUT}/far-ground-probe${MODE === 'solo' ? '-solo' : ''}.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nwrote ${OUT}/far-ground-probe${MODE === 'solo' ? '-solo' : ''}.json`);
await browser.close();
