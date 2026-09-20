// THE ATMOSPHERICS SHIFT — probe 1: how much SKY-SPACE does the town camera actually contain?
// F-BT-2 reverted a sky dome as "+3 draw calls for zero pixels". Before building three skies I
// measure the void myself instead of inheriting the arithmetic (CLAUDE.md Mistake #4).
// Method: ?townSkyProbe paints scene.background magenta and kills fog, so every pixel that is
// pure magenta is a pixel NO geometry covers — i.e. a pixel a sky could own.
//   node logs/session-scratch/atmos-town-cone.mjs
import { chromium, devices } from 'playwright';
import { PNG } from 'pngjs';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5301';

const SEED = () => {
  localStorage.clear();
  sessionStorage.clear();
  const profile = {
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
  };
  localStorage.setItem('gold-rush:profiles.v2', JSON.stringify(profile));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
  for (const key of ['gold-rush:profile.robin:gr.meta.v1', 'gr.meta.v1']) localStorage.setItem(key, meta);
  for (const key of ['gold-rush:profile.robin:gold-rush:town-name', 'gold-rush:town-name']) localStorage.setItem(key, 'Quartz Hill');
  for (const key of ['gold-rush:profile.robin:gold-rush:first-claim-done', 'gold-rush:first-claim-done']) localStorage.setItem(key, '1');
};

async function boot(context, query) {
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.error('[console]', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.error('[pageerror]', String(e).slice(0, 400)));
  await page.addInitScript(SEED);
  await page.goto(`${BASE}/`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 });
  await page.evaluate((url) => history.replaceState({ goldRushScene: 'town' }, '', url), `/${query}`);
  await page.reload();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const data = document.querySelector('#game-canvas')?.dataset ?? {};
      const ids = (data.town3dPilotLoadedIds ?? '').split(',').filter(Boolean);
      return data.town3dPilotState === 'lite' || (ids.length >= 7 && data.town3dPlazaPropsState === 'loaded');
    },
    undefined,
    { timeout: 60_000 },
  );
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.elapsed ?? 0) > 4, undefined, { timeout: 60_000 });
  return page;
}

// Magenta rows, top-down: the shape of the void, not just its area.
function analyse(buffer) {
  const png = PNG.sync.read(buffer);
  const { width, height, data } = png;
  let total = 0;
  const rowCounts = [];
  for (let y = 0; y < height; y += 1) {
    let row = 0;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      // ACES + exposure 0.75 tone-maps the clear colour, so #ff00ff does NOT arrive as 255/0/255.
      // Hue is what survives: red and blue both high, green far below both.
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 90 && b > 90 && g < r * 0.45 && g < b * 0.45) row += 1;
    }
    rowCounts.push(row);
    total += row;
  }
  let lastVoidRow = -1;
  for (let y = height - 1; y >= 0; y -= 1) if (rowCounts[y] > 0) { lastVoidRow = y; break; }
  const fullRows = rowCounts.filter((n) => n === width).length;
  return {
    width,
    height,
    voidPixels: total,
    voidPercent: +((total / (width * height)) * 100).toFixed(2),
    // How far down the frame any void reaches, as a fraction of frame height (0 = top edge).
    voidReachesDownTo: lastVoidRow < 0 ? null : +((lastVoidRow / height) * 100).toFixed(1),
    fullWidthVoidRows: fullRows,
    voidBandHeightPx: lastVoidRow + 1,
  };
}

const browser = await chromium.launch();
const out = {};

for (const [label, opts] of [
  ['desktop', { viewport: { width: 1280, height: 800 } }],
  ['mobile', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
]) {
  const context = await browser.newContext(opts);
  const page = await boot(context, '?townSkyProbe');
  const rows = [];
  const sweep = [];
  for (const z of [2, -2, -6, -9, -11, -13, -14.5]) {
    sweep.push([`z${z}-default`, 0, z, 0.85]);
    sweep.push([`z${z}-widest`, 0, z, 1.1]);
  }
  sweep.push(['nw-corner-default', -13, -13, 0.85], ['plaza-0.62', 0, 2.6, 0.62], ['closest-0.36', -4.9, -4.9, 0.36]);
  for (const [name, x, z, zoom] of sweep) {
    await page.evaluate(({ x, z, zoom }) => {
      const t = window.__GR_TOWN_DIAGNOSTICS__;
      t.teleport(x, z);
      if (zoom) t.camera.setZoom(zoom);
    }, { x, z, zoom });
    await page.waitForTimeout(2200);
    const shot = await page.screenshot({ path: `logs/session-scratch/cone-${label}-${name}.png` });
    const cam = await page.evaluate(() => {
      const t = window.__GR_TOWN_DIAGNOSTICS__;
      const canvas = document.querySelector('#game-canvas');
      return {
        probeArmed: canvas?.dataset.townSkyProbe ?? 'OFF',
        plate: canvas?.dataset.town3dPlateState ?? '?',
        framing: t.camera.framingDistanceScale,
        dist: t.camera.currentDistance,
        calls: t.renderer.calls,
        tris: t.renderer.triangles,
        cone: window.__GR_TOWN_CONE__ ? window.__GR_TOWN_CONE__() : null,
      };
    });
    rows.push({ name, hero: [x, z], ...cam, ...analyse(shot) });
  }
  out[label] = rows;
  await context.close();
}

console.log(JSON.stringify(out, null, 2));
await browser.close();
