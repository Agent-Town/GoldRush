// E2 beauty-director current-state probe — fresh in-game boards for the four E2 maps.
// Rendering-only evidence gathering: boots each contract via the epoch debug door,
// begins the run, teleports the hero to the framing points, screenshots, and records
// the pilot dataset (state/renderSource/landmarks) + console errors per frame.
// Usage: BASE=http://127.0.0.1:5261 node logs/session-scratch/e2-director-probe.mjs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5261';
const OUT = new URL('../../reviews/shots-beauty2-e2-director/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const MAPS = [
  {
    id: 'e2-hill-mine',
    frames: [
      { label: 'run-camera', hero: [0, 12], settleMs: 2500 },
      { label: 'gallery-trestle', hero: [0, 8], settleMs: 1500 },
      { label: 'upper-terraces', hero: [-6, 34], settleMs: 1500 },
    ],
  },
  {
    id: 'e2-trestle',
    frames: [
      { label: 'run-camera', hero: [12, -12], settleMs: 2500 },
      { label: 'crossing-north', hero: [0, 2], settleMs: 1500 },
      { label: 'south-approach', hero: [0, -20], settleMs: 1500 },
    ],
  },
  {
    id: 'e2-pressure-garden',
    frames: [
      { label: 'run-camera', hero: [-12, 12], settleMs: 2500 },
      { label: 'water-band', hero: [0, 8], settleMs: 1500 },
      { label: 'coal-bed-terrace', hero: [0, 38], settleMs: 1500 },
    ],
  },
  {
    id: 'e2-incline',
    frames: [
      { label: 'run-camera', hero: [-24, -18], settleMs: 2500 },
      { label: 'twin-crossings', hero: [0, -2], settleMs: 1500 },
      { label: 'upper-ore-yard', hero: [0, 36], settleMs: 1500 },
    ],
  },
];

const browser = await chromium.launch();
const report = [];
for (const map of MAPS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(String(err)));
  await page.goto(`${BASE}/?debug&epoch=epoch-2-steamworks&contract=${map.id}&nolevel&seed=beauty2-${map.id}`);
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas && canvas.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
  }, undefined, { timeout: 180000 });
  await page.waitForTimeout(1500);
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.count()) await begin.click().catch(() => {});
  await page.waitForTimeout(1000);
  const dataset = await page.evaluate(() => {
    const d = document.querySelector('canvas')?.dataset ?? {};
    return {
      state: d.terrain3dPilotState,
      renderSource: d.terrain3dPilotRenderSource,
      landmarks: d.terrain3dPilotLandmarks,
      landmarkSkipped: d.terrain3dPilotLandmarkSkipped,
      landmarkEmissive: d.terrain3dPilotLandmarkEmissive,
      hiddenGroundLayers: d.terrain3dPilotHiddenGroundLayers,
    };
  });
  for (const frame of map.frames) {
    await page.evaluate(([x, z]) => window.__GR_TEST__?.teleport?.(x, z), frame.hero);
    await page.waitForTimeout(frame.settleMs);
    await page.screenshot({ path: `${OUT}${map.id}-${frame.label}.png` });
  }
  report.push({ map: map.id, dataset, consoleErrors: errors });
  await page.close();
}
await browser.close();
writeFileSync(`${OUT}probe-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
