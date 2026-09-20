// Does the water say what the SIM says? Samples the rendered pixel at world points across and along
// the flooded gallery: the declared ford (|x| <= 4) must read warmer and lighter than the channel,
// the wet edges must ramp rather than cut, and the painted-dry ground either side must stay dry.
// Reads only.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
// Hero parked far off the band so no body or its shadow lands in the samples.
await page.goto(`${BASE}/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nolevel&seed=waterscan`);
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return canvas?.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
}, undefined, { timeout: 180000 });
await page.waitForTimeout(1200);
const begin = page.getByTestId('contract-briefing-dismiss');
if (await begin.count()) await begin.click().catch(() => {});
await page.evaluate(() => window.__GR_TEST__?.teleport?.(0, 14));
await page.waitForTimeout(2600);

const surfaceY = Number(await page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotSculptWaterY ?? '0'));
const probes = await page.evaluate(async ([sy]) => {
  const out = [];
  // ACROSS: fixed x well away from the boiler house, walking z through the band.
  for (const x of [-30, -18, 0, 18]) {
    for (let z = -9; z <= 9; z += 0.5) {
      const p = window.__GR_TEST__?.screenPoint?.(x, z, sy + 0.01);
      out.push({ kind: 'across', x, z, sx: p?.x ?? null, sy: p?.y ?? null });
    }
  }
  // ALONG the channel centre: ford band vs open channel.
  for (let x = -40; x <= 40; x += 2) {
    const p = window.__GR_TEST__?.screenPoint?.(x, 1.6, sy + 0.01);
    out.push({ kind: 'along', x, z: 1.6, sx: p?.x ?? null, sy: p?.y ?? null });
  }
  return out;
}, [surfaceY]);

const png = PNG.sync.read(await page.screenshot());
const at = (sx, sy) => {
  const x = Math.round(sx); const y = Math.round(sy);
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return null;
  const i = (y * png.width + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const rows = [];
for (const probe of probes) {
  if (probe.sx === null) continue;
  const rgb = at(probe.sx, probe.sy);
  if (!rgb) continue;
  rows.push({ ...probe, rgb, luma: +(0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(1), warm: rgb[0] - rgb[2] });
}
console.log(`surfaceY ${surfaceY}`);
console.log('--- ACROSS (z sweep) ---');
for (const x of [-30, -18, 0, 18]) {
  const line = rows.filter((r) => r.kind === 'across' && r.x === x)
    .map((r) => `${r.z}:${r.luma}/${r.warm}`).join(' ');
  console.log(`x=${x}  ${line}`);
}
console.log('--- ALONG (x sweep at z=1.6; |x|<=4 is the declared ford) ---');
console.log(rows.filter((r) => r.kind === 'along').map((r) => `${r.x}:${r.luma}/${r.warm}`).join(' '));
await browser.close();
