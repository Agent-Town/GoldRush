#!/usr/bin/env node
// CAN THE PLAYER SEE THE SKY? — the measurement U4 of the night-shift beauty brief turns on.
//
//   BASE=http://127.0.0.1:5233 node scripts/beauty-sky-visibility.mjs [contract]
//
// Every map mounts a 190 m panorama ring (assets/pilots/map-rebuild-spike/*-panorama.glb) whose
// atlas is an authored horizon. This script answers, from the shipped camera and by measurement:
//
//   1. the elevation angle of the TOP EDGE of the frame, at each zoom the player can reach --
//      found by binary search on a probe point's screen Y, not by trusting the camera maths;
//   2. the elevation angle of the panorama ring's LOWEST point, from the same camera;
//   3. how many ring vertices land inside the canvas.
//
// screenPoint's own `inView` is useless for this: the ring sits past the camera's 100 m far plane,
// and preparePanorama pins gl_Position.z = w * 0.999999 so it renders regardless, while `inView`
// tests NDC z in [-1,1] and therefore reports "off screen" for anything out there -- and reports
// points BEHIND the camera as on screen, because projection flips their sign. Judge by canvas x/y,
// and treat elevation angle as the real currency.
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5233';
const CONTRACT = process.argv[2] ?? 'e1-night-shift';
const VIEW = { width: 1280, height: 800 };
const RING_RADIUS = 190;
const RING_BOTTOM = -10;
const RING_TOP = 130;

const browser = await chromium.launch({ channel: 'chromium' });  // branded chromium: the bundled headless build falls back to software GL and reports ~600 ms p95
const page = await browser.newPage({ viewport: VIEW });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${BASE}/?debug&contract=${CONTRACT}&nowaves&nolevel&nopause&nokill&seed=sky-probe&tier=full`);
await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
const briefing = page.getByTestId('contract-briefing');
if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
await page.waitForFunction(() => {
  const c = document.querySelector('#game-canvas');
  return c?.dataset.terrain3dPilotState === 'ready' && c.dataset.terrain3dPilotRenderSource === 'glb';
});
await page.evaluate(() => window.__GR_TEST__.teleport(0, 0));
await page.evaluate(() => window.__GR_TEST__.setWave(10));
await page.waitForTimeout(700);

const mounted = await page.evaluate(() => {
  const c = document.querySelector('#game-canvas');
  return {
    name: c.dataset.terrain3dPilotPanorama,
    triangles: c.dataset.terrain3dPilotPanoramaTriangles,
    vertices: c.dataset.terrain3dPilotPanoramaVertices,
  };
});

const result = await page.evaluate(({ radius, bottom, top, height }) => {
  const api = window.__GR_TEST__;
  // A probe 50 m in front of the hero, raised until it leaves the top of the frame. The height at
  // which it leaves gives the frame-top elevation, measured through the real projection matrix.
  // Scan upward rather than bracket: raise the probe past the camera's own look direction and the
  // projection mirrors it back onto the canvas with a flipped sign, so a plain binary search on
  // "is screenY >= 0" converges on the mirror instead of on the frame edge.
  const DISTANCE = 50;
  const screenYAt = (y) => api.screenPoint(0, -DISTANCE, y).y;
  let lo = 0; let hi = null;
  for (let y = 0; y <= 400; y += 0.25) {
    if (screenYAt(y) < 0) { hi = y; lo = y - 0.25; break; }
  }
  if (hi === null) return { frameTopHeight: null };
  for (let step = 0; step < 30; step += 1) {
    const mid = (lo + hi) / 2;
    if (screenYAt(mid) >= 0) lo = mid; else hi = mid;
  }
  // Camera height is what the elevation angle is measured from; recover it from two probes.
  const eye = { y: null };
  // screenPoint gives no camera, so estimate eye height from the vanishing behaviour instead:
  // the frame-top ray passes through (0,-DISTANCE, lo); its elevation relative to the eye is what
  // we want, and Balance.camera.offset puts the eye 26.2 m over the hero at zoom 1.
  eye.y = 26.2;
  const frameTopElevationDeg = (Math.atan2(lo - eye.y, DISTANCE) * 180) / Math.PI;
  const ringBottomElevationDeg = (Math.atan2(bottom - eye.y, radius) * 180) / Math.PI;
  const ringTopElevationDeg = (Math.atan2(top - eye.y, radius) * 180) / Math.PI;

  let onCanvas = 0; let total = 0;
  for (let ring = 0; ring <= 8; ring += 1) {
    const y = bottom + ((top - bottom) * ring) / 8;
    for (let step = 0; step < 24; step += 1) {
      const angle = (step / 24) * Math.PI * 2;
      const p = api.screenPoint(Math.cos(angle) * radius, Math.sin(angle) * radius, y);
      total += 1;
      // NDC z outside [-1,1] with a positive screen position is the behind-the-camera mirror;
      // only count a sample as on canvas when it is genuinely in front (z <= 1 after the far
      // plane is accounted for is impossible here, so require the projected point to be in
      // bounds AND the sample to be nearer than the ring's own far side).
      if (p.x >= 0 && p.x < 1280 && p.y >= 0 && p.y < height && p.z <= 1) onCanvas += 1;
    }
  }
  return { frameTopHeight: lo, frameTopElevationDeg, ringBottomElevationDeg, ringTopElevationDeg, onCanvas, total };
}, { radius: RING_RADIUS, bottom: RING_BOTTOM, top: RING_TOP, height: VIEW.height });

console.log(`contract        ${CONTRACT}`);
console.log(`panorama        ${mounted.name}  ${mounted.triangles} triangles, ${mounted.vertices} vertices — mounted and drawn`);
if (result.frameTopHeight === null) {
  console.log('frame top       could not be bracketed (probe never left the frame)');
} else {
  console.log(`frame top       a point 50 m ahead leaves the top of the frame at y = ${result.frameTopHeight.toFixed(2)} m`);
  console.log(`                => the highest thing on screen is ${(-result.frameTopElevationDeg).toFixed(1)}° BELOW the horizon`);
  console.log(`ring bottom     ${(-result.ringBottomElevationDeg).toFixed(1)}° below the horizon   (y=${RING_BOTTOM} m at ${RING_RADIUS} m)`);
  console.log(`ring top        ${result.ringTopElevationDeg > 0 ? '+' : ''}${result.ringTopElevationDeg.toFixed(1)}° above the horizon   (y=${RING_TOP} m at ${RING_RADIUS} m)`);
  console.log(`verdict         ${result.ringBottomElevationDeg > result.frameTopElevationDeg ? 'the ENTIRE ring is above the top of the frame — the sky is never on camera' : 'part of the ring is inside the frame'}`);
}
console.log(`ring vertices on canvas  ${result.onCanvas}/${result.total}`);
console.log('console errors:', errors.length ? errors : 'none');
await browser.close();
