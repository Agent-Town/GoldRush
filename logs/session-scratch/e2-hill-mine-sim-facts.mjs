// Read the SIM's own declarations for e2-hill-mine, so the render dressing can be keyed to them
// rather than guessed. Reads only; writes nothing anywhere.
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

const facts = await page.evaluate(async () => {
  const Terrain = await Function('return import("/src/world/Terrain.ts")')();
  const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  const heightAt = window.__GR_TEST__?.terrainHeight;
  const sampleRow = (z) => Array.from({ length: 13 }, (_, i) => {
    const x = -48 + i * 8;
    const cell = Terrain.sample(x, z);
    return { x, zone: cell.zone, h: +(Terrain.sampleHeight(x, z) ?? 0).toFixed(3) };
  });
  return {
    hasRiverWater: Terrain.hasRiverWater?.(),
    river: Terrain.riverGeometry?.(),
    fords: Terrain.fordRanges?.(),
    visualWaterHalfWidth: Terrain.visualWaterHalfWidth?.(),
    depths: { river: Terrain.waterDepth?.('river'), ford: Terrain.waterDepth?.('ford') },
    nodeAnchors: Terrain.nodeAnchors,
    waterSources: Terrain.waterSources?.(),
    rails: diagnostics?.terrain?.rails,
    waterDiag: diagnostics?.terrain?.water,
    heightProbes: {
      gallery: [-24, -12, -4, 0, 4, 12, 24].map((x) => ({ x, y: +(Terrain.sampleHeight(x, 0) ?? 0).toFixed(3), zone: Terrain.sample(x, 0).zone })),
      acrossZ: [-8, -6, -4, -2, 0, 2, 4, 6, 8].map((z) => ({ z, y: +(Terrain.sampleHeight(0, z) ?? 0).toFixed(3), zone: Terrain.sample(0, z).zone })),
      upZ: [0, 6, 12, 18, 24, 30, 36, 42].map((z) => ({ z, y: +(Terrain.sampleHeight(0, z) ?? 0).toFixed(3), zone: Terrain.sample(0, z).zone })),
    },
    rowZ0: sampleRow(0),
    heightAtAvailable: typeof heightAt,
  };
});
console.log(JSON.stringify(facts, null, 2));
await browser.close();
