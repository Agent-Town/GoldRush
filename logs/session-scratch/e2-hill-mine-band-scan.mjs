// WHERE IS THE BLACK BAND, IN WORLD Z? Projects world points into the run-camera frame and reads
// the rendered pixel under each, so U1's water line is fitted to the paint that is actually dark
// rather than to a guess. Reads only.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`${BASE}/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nolevel&seed=facts`);
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return canvas?.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
}, undefined, { timeout: 180000 });
await page.waitForTimeout(1200);
const begin = page.getByTestId('contract-briefing-dismiss');
if (await begin.count()) await begin.click().catch(() => {});
await page.evaluate(() => window.__GR_TEST__?.teleport?.(0, 12));
await page.waitForTimeout(2600);

const points = await page.evaluate(async () => {
  const Terrain = await Function('return import("/src/world/Terrain.ts")')();
  const out = [];
  for (let z = -20; z <= 20; z += 0.5) {
    for (const x of [-24, 0, 24]) {
      const y = Terrain.sampleHeight(x, z) ?? 0;
      const screen = window.__GR_TEST__?.screenPoint?.(x, z, y);
      out.push({ x, z, y: +y.toFixed(3), sx: screen?.x ?? null, sy: screen?.y ?? null, inView: screen?.inView ?? null });
    }
  }
  return out;
});

const buffer = await page.screenshot();
const png = PNG.sync.read(buffer);
const sample = (sx, sy) => {
  const x = Math.round(sx); const y = Math.round(sy);
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return null;
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const rows = new Map();
for (const point of points) {
  if (point.sx === null) continue;
  const rgb = sample(point.sx, point.sy);
  if (!rgb) continue;
  const luma = +(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(1);
  if (!rows.has(point.z)) rows.set(point.z, []);
  rows.get(point.z).push(`x${point.x}:${rgb.join(',')} L${luma}`);
}
console.log(`canvas ${png.width}x${png.height}`);
for (const [z, list] of [...rows].sort((a, b) => a[0] - b[0])) {
  const y = points.find((p) => p.z === z && p.x === 0);
  console.log(`z=${String(z).padStart(6)}  bedY=${String(y?.y).padStart(7)}  screen=(${Math.round(y?.sx ?? -1)},${Math.round(y?.sy ?? -1)})  ${list.join('  |  ')}`);
}
await browser.close();
