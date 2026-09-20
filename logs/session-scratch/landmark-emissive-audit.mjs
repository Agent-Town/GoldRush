// Is the per-contract landmark paint actually REACHING the materials? Reads the pilot's published
// per-mount emissiveIntensity range and compares it against what the contract's table asks for.
// Reads only.
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const MAPS = [
  { id: 'the-claim', epoch: 'epoch-1-gold-rush', wants: 'LANDMARK_EMISSIVE 1.45 on all five' },
  { id: 'e1-baron', epoch: 'epoch-1-gold-rush', wants: 'LANDMARK_PAINT 1.7/1.9/2.1/3.4 by mount' },
  { id: 'e1-dry-gulch', epoch: 'epoch-1-gold-rush', wants: 'isolated_spring 2.1, rest 3' },
  { id: 'e2-hill-mine', epoch: 'epoch-2-steamworks', wants: 'this shift U3' },
];
const browser = await chromium.launch({ channel: 'chromium' });
for (const map of MAPS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(`${BASE}/?debug&epoch=${map.epoch}&contract=${map.id}&nolevel&seed=audit`);
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    return canvas?.dataset.terrain3dPilotLandmarkLoadState === 'mounted';
  }, undefined, { timeout: 180000 });
  await page.waitForTimeout(800);
  const read = await page.evaluate(() => {
    const d = document.querySelector('canvas')?.dataset ?? {};
    return { published: d.terrain3dPilotLandmarkEmissive, materials: JSON.parse(d.terrain3dPilotLandmarkMaterials ?? '[]') };
  });
  console.log(`\n=== ${map.id} ===  table says ${read.published}   (wants: ${map.wants})`);
  for (const entry of read.materials) {
    console.log(`  ${entry.id.padEnd(34)} materials ${entry.total}  emissiveIntensity ${JSON.stringify(entry.emissiveIntensity)}`);
  }
  await page.close();
}
await browser.close();
