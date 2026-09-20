// THE ATMOSPHERICS SHIFT — baron probe: which horizon surface, if any, reaches the run frame?
// F-BEAUTY-BARON-3 says the U5 panorama is unreachable at the shipped run camera. Attempt two
// must know which surface to aim at instead, so ?horizonProbe paints the PANORAMA magenta and
// the sculpt CONTINUATION cyan and this counts both at poses a player can actually reach.
//   node logs/session-scratch/atmos-baron-horizon.mjs
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5301';
const CONTRACT = process.env.GR_CONTRACT ?? 'e1-baron';

function count(buffer) {
  const png = PNG.sync.read(buffer);
  let panorama = 0;
  let apron = 0;
  let apronTopRow = -1;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      const r = png.data[i];
      const g = png.data[i + 1];
      const b = png.data[i + 2];
      // ACES washes an emissive primary toward pastel, so classify by HUE MARGIN, not by
      // absolute channels: the first cut demanded r < g*0.55 and scored a full-frame cyan apron
      // as 0.00%.
      if (r - g > 26 && b - g > 26) panorama += 1;
      else if (g - r > 22 && b - r > 22) { apron += 1; if (apronTopRow < 0) apronTopRow = y; }
    }
  }
  const total = png.width * png.height;
  return {
    panoramaPct: +((panorama / total) * 100).toFixed(2),
    apronPct: +((apron / total) * 100).toFixed(2),
    apronTopRowPct: apronTopRow < 0 ? null : +((apronTopRow / png.height) * 100).toFixed(1),
  };
}

async function boot(context) {
  const page = await context.newPage();
  page.on('pageerror', (e) => console.error('[pageerror]', String(e).slice(0, 200)));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`${BASE}/?debug&horizonProbe&contract=${CONTRACT}&timescale=1&nolevel&nowaves&nosteal&nowreck&nokill&tier=full&seed=atmos-horizon`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 90_000 });
  await page.waitForFunction(
    () => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready',
    undefined,
    { timeout: 90_000 },
  );
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  await page.addStyleTag({ content: '.lil-gui { display: none !important; }' });
  return page;
}

async function settle(page, frames) {
  const from = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
  await page.waitForFunction(([start, count]) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > start + count, [from, frames], { timeout: 60_000 });
}

const browser = await chromium.launch();
const rows = [];
for (const [label, opts] of [
  ['desktop', { viewport: { width: 1280, height: 800 } }],
  ['mobile', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
]) {
  const context = await browser.newContext(opts);
  const page = await boot(context);
  const gate = await page.evaluate(() => ({
    source: document.querySelector('#game-canvas')?.dataset.terrain3dPilotRenderSource,
    landmarks: document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarks,
    continuation: document.querySelector('#game-canvas')?.dataset.terrain3dPilotContinuation,
  }));
  for (const [name, z] of [
    ['home-bank +20', 20],
    ['fresh-eye +8.65', 8.65],
    ['ford 0', 0],
    ['crossing -10', -10],
    ['far-bank -22', -22],
    ['far-edge -30', -30],
  ]) {
    await page.evaluate((pz) => window.__GR_TEST__?.teleport(0, pz), z);
    await settle(page, 240);
    const shot = await page.screenshot({ path: `logs/session-scratch/baron-${label}-${z}.png` });
    rows.push({ label, name, ...gate, ...count(shot) });
  }
  await context.close();
}
console.log(JSON.stringify(rows, null, 2));
await browser.close();
