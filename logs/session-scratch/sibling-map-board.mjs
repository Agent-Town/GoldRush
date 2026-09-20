// F-BHM-1's blast radius, photographed. The duplicate keepLandmarkPaintReadable call reset every
// per-contract landmark intensity to 3, so removing it CHANGES three signed-off maps back to what
// their own reviews said they would be. This captures the same framings from whichever tree it is
// pointed at, so the control (base main) and the fix can be paired. Reads only.
// Usage: BASE=http://127.0.0.1:5272 LABEL=control node logs/session-scratch/sibling-map-board.mjs
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5271';
const LABEL = process.env.LABEL ?? 'scratch';
const OUT = path.resolve('artifacts/beauty-e2-hill-mine/siblings', LABEL);
mkdirSync(OUT, { recursive: true });

const MAPS = [
  { id: 'the-claim', epoch: 'epoch-1-gold-rush', hero: [8, 12] },
  { id: 'e1-baron', epoch: 'epoch-1-gold-rush', hero: [0, -6] },
  { id: 'e1-dry-gulch', epoch: 'epoch-1-gold-rush', hero: [0, 0] },
];
const browser = await chromium.launch({ channel: 'chromium' });
const report = [];
for (const map of MAPS) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`${BASE}/?debug&epoch=${map.epoch}&contract=${map.id}&nolevel&nowaves&seed=fbhm1-${map.id}`);
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', undefined, { timeout: 180000 });
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.count()) await begin.click().catch(() => {});
  await page.evaluate(([x, z]) => window.__GR_TEST__?.teleport?.(x, z), map.hero);
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, `${map.id}.png`) });
  report.push({
    map: map.id,
    materials: JSON.parse(await page.evaluate(() => document.querySelector('canvas')?.dataset.terrain3dPilotLandmarkMaterials ?? '[]')),
    consoleErrors: errors,
  });
  await page.close();
}
await browser.close();
writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map((r) => ({ map: r.map, errors: r.consoleErrors.length })), null, 1));
