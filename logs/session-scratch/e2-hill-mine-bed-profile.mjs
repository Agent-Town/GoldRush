// Fine profile of the baked sculpt bed across the flooded gallery, so U1's water line is measured
// off the terrain rather than guessed. Reads only.
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`${BASE}/?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine&nolevel&seed=facts`);
await page.waitForFunction(() => {
  const canvas = document.querySelector('canvas');
  return canvas?.dataset.terrain3dPilotState && canvas.dataset.terrain3dPilotState !== 'loading';
}, undefined, { timeout: 180000 });
await page.waitForTimeout(1200);

const out = await page.evaluate(async () => {
  const Terrain = await Function('return import("/src/world/Terrain.ts")')();
  const h = (x, z) => +(Terrain.sampleHeight(x, z) ?? 0).toFixed(3);
  const zone = (x, z) => Terrain.sample(x, z).zone;
  const profile = (x) => {
    const rows = [];
    for (let z = -16; z <= 16; z += 1) rows.push(`z${z}:${h(x, z)}/${zone(x, z)[0]}`);
    return rows.join(' ');
  };
  const bandMinMax = () => {
    let min = Infinity; let max = -Infinity; const at = {};
    for (let x = -46; x <= 46; x += 2) {
      for (let z = -10; z <= 10; z += 0.5) {
        const y = Terrain.sampleHeight(x, z) ?? 0;
        if (y < min) { min = y; at.min = [x, z]; }
        if (y > max) { max = y; at.max = [x, z]; }
      }
    }
    return { min: +min.toFixed(4), max: +max.toFixed(4), at };
  };
  // How much of the visual quad (|z| <= 10) would be under a candidate surface?
  const coverage = (surfaceY) => {
    let wet = 0; let dry = 0; let deepest = 0;
    const wetZ = new Set();
    for (let x = -46; x <= 46; x += 2) {
      for (let z = -10; z <= 10; z += 0.5) {
        const y = Terrain.sampleHeight(x, z) ?? 0;
        if (y < surfaceY) { wet += 1; wetZ.add(z); deepest = Math.max(deepest, surfaceY - y); }
        else dry += 1;
      }
    }
    const zs = [...wetZ].sort((a, b) => a - b);
    return { surfaceY, wetPct: +((wet / (wet + dry)) * 100).toFixed(1), deepest: +deepest.toFixed(3), wetZRange: [zs[0], zs[zs.length - 1]] };
  };
  return {
    profileX0: profile(0),
    profileXm24: profile(-24),
    profileX24: profile(24),
    profileXm44: profile(-44),
    bandMinMax: bandMinMax(),
    coverage: [-0.07, 0.0, 0.06, 0.12, 0.18, 0.24, 0.3].map(coverage),
    // What the claim's own heuristic would pick here.
    claimHeuristic: (() => {
      const channel = []; const ford = [];
      for (let x = -46; x <= 46; x += 1) {
        for (const z of [-3.5, -2, -1, 0, 1, 2, 3.5]) (Math.abs(x) <= 4 ? ford : channel).push(Terrain.sampleHeight(x, z) ?? 0);
      }
      const median = (v) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)];
      const channelBed = median(channel); const fordBed = median(ford);
      return { channelBed, fordBed, pick: Math.min(channelBed + 0.42, fordBed + 0.11) };
    })(),
  };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
