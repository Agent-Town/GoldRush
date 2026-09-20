// THE ATMOSPHERICS SHIFT — the change→render→compare loop for ?townSky=a|b|c.
// Shoots one framing per variant so a look can be judged in seconds, then reports the sky
// diagnostics and the fraction of pixels that differ from the unflagged frame.
//   node logs/session-scratch/atmos-sky-look.mjs [heroZ] [zoom] [query]
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';

const BASE = process.env.GR_BASE ?? 'http://127.0.0.1:5301';
const HERO_Z = Number(process.argv[2] ?? -13);
const ZOOM = Number(process.argv[3] ?? 0.85);
const EXTRA = process.argv[4] ?? '';

const SEED = () => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('gold-rush:profiles.v2', JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }],
  }));
  const meta = JSON.stringify({ version: 1, tracks: { territory: 3, science: 0, hero: 0, agent: 0 } });
  for (const k of ['gold-rush:profile.robin:gr.meta.v1', 'gr.meta.v1']) localStorage.setItem(k, meta);
  for (const k of ['gold-rush:profile.robin:gold-rush:town-name.v1', 'gold-rush:town-name.v1']) localStorage.setItem(k, 'Quartz Hill');
  for (const k of ['gold-rush:profile.robin:gold-rush:first-claim.v1', 'gold-rush:first-claim.v1']) localStorage.setItem(k, 'done');
};

async function shoot(context, query, file) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => { errors.push('PAGEERROR ' + String(e).slice(0, 300)); console.error('[pageerror]', String(e).slice(0, 300)); });
  await page.addInitScript(SEED);
  await page.goto(`${BASE}/`);
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 });
  await page.evaluate((url) => history.replaceState({ goldRushScene: 'town' }, '', url), `/${query}`);
  await page.reload();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 2, undefined, { timeout: 60_000 });
  await page.waitForFunction(() => {
    const d = document.querySelector('#game-canvas')?.dataset ?? {};
    const ids = (d.town3dPilotLoadedIds ?? '').split(',').filter(Boolean);
    return d.town3dPilotState === 'lite' || (ids.length >= 7 && d.town3dPlazaPropsState === 'loaded');
  }, undefined, { timeout: 60_000 });
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.elapsed ?? 0) > 7, undefined, { timeout: 60_000 });
  // Teleport, then PROVE it took. A single fire-and-forget teleport silently lost the control
  // column to the plaza once, which turned a 0% diff into an 82% one.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.evaluate(({ z, zoom }) => {
      const t = window.__GR_TOWN_DIAGNOSTICS__;
      t.teleport(0, z);
      t.camera.setZoom(zoom);
    }, { z: HERO_Z, zoom: ZOOM });
    await page.waitForTimeout(900);
    const at = await page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__.player.z);
    if (Math.abs(at - HERO_Z) < 0.3) break;
  }
  await page.waitForFunction(
    ({ z, zoom }) => {
      const t = window.__GR_TOWN_DIAGNOSTICS__;
      return Math.abs(t.player.z - z) < 0.3 && Math.abs(t.camera.framingDistanceScale - zoom) < 0.01
        && Math.abs(t.camera.actualDistance - t.camera.targetDistance) < 0.05;
    },
    { z: HERO_Z, zoom: ZOOM },
    { timeout: 30_000 },
  );
  await page.waitForTimeout(2500);
  const buf = await page.screenshot({ path: file });
  const info = await page.evaluate(() => {
    const t = window.__GR_TOWN_DIAGNOSTICS__;
    return { sky: t.sky, tier: t.ambientDust.tier, calls: t.renderer.calls, tris: t.renderer.triangles, geometries: t.renderer.geometries, textures: t.renderer.textures };
  });
  await page.close();
  return { buf, info, errors };
}

// Whole-frame diffs are contaminated: a bark card is ~6% of the frame and the cast walks, so
// two shots of the SAME build came back 8 points apart. The sky band is the only region under
// test, so the verdict number is the diff over the top 40% of rows; the full-frame number is
// kept beside it as the noise floor.
function diff(a, b, topFraction = 1) {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  const rows = Math.round(pa.height * topFraction);
  let n = 0;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < pa.width; x += 1) {
      const i = (y * pa.width + x) * 4;
      if (Math.abs(pa.data[i] - pb.data[i]) > 6 || Math.abs(pa.data[i + 1] - pb.data[i + 1]) > 6 || Math.abs(pa.data[i + 2] - pb.data[i + 2]) > 6) n += 1;
    }
  }
  return +((n / (pa.width * rows)) * 100).toFixed(2);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const out = {};
let baseline = null;
const shots = {};
for (const variant of ['off', 'c', 'a', 'b']) {
  const query = variant === 'off' ? ('?townSky=off' + (EXTRA ? EXTRA.replace('?','&') : '')) : `?townSky=${variant}${EXTRA ? EXTRA.replace('?', '&') : ''}`;
  const file = `logs/session-scratch/look-${variant}.png`;
  const { buf, info, errors } = await shoot(context, query, file);
  if (variant === 'off') baseline = buf;
  shots[variant] = buf;
  out[variant] = {
    ...info,
    vsOff: variant === 'off' ? 0 : diff(baseline, buf, 0.4),
    vsOffFull: variant === 'off' ? 0 : diff(baseline, buf),
    // vs c isolates what the GEOMETRY does: c carries the sky ramp and nothing else, so anything
    // left over is the belt or the ring earning (or not earning) its own draw call.
    vsSkyOnly: variant === 'off' || variant === 'c' ? null : diff(shots.c, buf, 0.4),
    errors: errors.length ? errors : undefined,
  };
  console.log(variant.padEnd(4), 'calls=' + String(info.calls).padStart(3), 'tris=' + String(info.tris).padStart(6),
    'tier=' + (info.tier ?? '?'), 'skyTris=' + String(info.sky.triangles).padStart(5),
    'topPitch=' + info.sky.topEdgePitchDeg, 'beyond=' + info.sky.beyondPlate,
    '| skyBand%=' + String(out[variant].vsOff).padStart(6) + ' full%=' + String(out[variant].vsOffFull).padStart(6), 'vsSkyOnly%=' + String(out[variant].vsSkyOnly).padStart(6),
    errors.length ? 'ERRORS ' + errors[0] : '');
}
writeFileSync('logs/session-scratch/atmos-sky-look.json', JSON.stringify({ heroZ: HERO_Z, zoom: ZOOM, out }, null, 2));
await browser.close();
