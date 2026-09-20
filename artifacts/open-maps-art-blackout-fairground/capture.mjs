// Before/after capture harness for tasks/open-maps-art-blackout-fairground.md.
// Modelled on Astra's scripts/map-landmark-loading-check.mjs and
// artifacts/map-art-repairs-20260908/fairground-presence-01/check.mjs.
//
//   PROBE_BASE=http://127.0.0.1:5460 PHASE=before node artifacts/open-maps-art-blackout-fairground/capture.mjs
//
// Writes only under artifacts/open-maps-art-blackout-fairground/<PHASE>/.
//
// Two boots per map per viewport:
//   plain — no ?debug. The native launch seam is sessionStorage 'gr.contract.launch.v1'
//           (src/meta/ContractFamilies.ts:856 + :1351 isPlayerContractLaunch), exactly what the
//           town board writes; ?contract= alone falls back to the-claim. __GR_TEST__ is absent
//           here (Game.ts:2207), so this boot yields the acceptance screenshot + the real HUD rects.
//   debug — ?debug, for __GR_TEST__.screenPoint/teleport. Screen geometry is measured here and
//           intersected against the PLAIN boot's HUD rects, so no debug-only chrome is counted.
// Screen axes: up-screen is -z, so a station stands at (x, z + BACK) to look at the landmark.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5460';
const phase = process.env.PHASE ?? 'before';
const only = process.env.ONLY_MAP ?? '';
const out = `artifacts/open-maps-art-blackout-fairground/${phase}`;
const BACK = 14;
mkdirSync(out, { recursive: true });

const packOf = (map) =>
  JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/landmarks/${map}/${map}-landmark-pack-contract.json`, 'utf8'));

const MAPS = [
  { id: 'e3-blackout-ridge', pack: 'blackout-ridge' },
  { id: 'e3-fairground', pack: 'fairground' },
].filter((m) => !only || m.pack === only);

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
];

function coveredFraction(box, rects) {
  if (box.w <= 0 || box.h <= 0) return 0;
  const steps = 64;
  let hit = 0;
  for (let iy = 0; iy < steps; iy += 1)
    for (let ix = 0; ix < steps; ix += 1) {
      const px = box.x + ((ix + 0.5) / steps) * box.w;
      const py = box.y + ((iy + 0.5) / steps) * box.h;
      if (rects.some((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h)) hit += 1;
    }
  return hit / (steps * steps);
}

const hudRects = async (page) =>
  page.evaluate(() => {
    const roots = [document.querySelector('#hud'), document.querySelector('#touch-controls')].filter(Boolean);
    const rects = [];
    const visit = (el) => {
      if (!(el instanceof HTMLElement)) return;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return;
      const r = el.getBoundingClientRect();
      const painted = style.backgroundColor !== 'rgba(0, 0, 0, 0)' || (el.children.length === 0 && el.textContent?.trim());
      if (r.width > 4 && r.height > 4 && painted) rects.push({ tag: el.tagName.toLowerCase(), cls: el.className?.toString?.().slice(0, 48) ?? '', x: r.x, y: r.y, w: r.width, h: r.height });
      for (const child of el.children) visit(child);
    };
    for (const root of roots) visit(root);
    return rects;
  });

const bbox = (pts) => {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const map of MAPS) {
    const pack = packOf(map.pack);
    for (const vp of VIEWPORTS) {
      // ---- 1. PLAIN boot: native launch seam, no ?debug. ----
      let plainHud = [];
      {
        const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
        // The town board's own two writes, made through the board's own modules: "Open every claim"
        // (ContractUnlock.setPreviewUnlockAll, owner 2026-09-05) then picking the card
        // (ContractFamilies.stagePlayerContractLaunch). No ?debug, no URL-only override.
        await page.goto(`${base}/`);
        await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 60000 });
        await page.evaluate(async (id) => {
          const unlock = await import('/src/meta/ContractUnlock.ts');
          const families = await import('/src/meta/ContractFamilies.ts');
          unlock.setPreviewUnlockAll(true);
          families.stagePlayerContractLaunch(id);
        }, map.id);
        await page.goto(`${base}/?contract=${map.id}&seed=mapart-${phase}`);
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', null, { timeout: 120000 });
        const begin = page.getByTestId('contract-briefing-dismiss');
        if (await begin.isVisible().catch(() => false)) await begin.click();
        await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 60000 });
        await page.waitForTimeout(1500);
        const shot = `${map.pack}-plain-${vp.name}.png`;
        await page.screenshot({ path: `${out}/${shot}` });
        plainHud = await hudRects(page);
        await page.evaluate(() => { for (const sel of ['#hud', '#touch-controls']) { const el = document.querySelector(sel); if (el) el.style.visibility = 'hidden'; } });
        await page.waitForTimeout(400);
        const shotNoHud = `${map.pack}-plain-${vp.name}-nohud.png`;
        await page.screenshot({ path: `${out}/${shotNoHud}` });
        const dataset = await page.evaluate(() => ({ ...document.querySelector('#game-canvas').dataset }));
        const info = await page.evaluate(() => ({ activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId, fallback: window.__THREE_GAME_DIAGNOSTICS__?.contract?.fallbackReason ?? null, wheel: window.__THREE_GAME_DIAGNOSTICS__?.fairground ?? null, testHook: typeof window.__GR_TEST__ }));
        rows.push({ map: map.id, pack: map.pack, viewport: vp.name, boot: 'plain', shot, shotNoHud, errors, hudRects: plainHud, info,
          dataset: { landmarks: dataset.terrain3dPilotLandmarks, expected: dataset.terrain3dPilotLandmarkExpected, skipped: dataset.terrain3dPilotLandmarkSkipped, state: dataset.terrain3dPilotState, loadState: dataset.terrain3dPilotLandmarkLoadState, skirtBlend: dataset.terrain3dPilotSkirtBlend } });
        console.log('PLAIN', map.pack, vp.name, 'active=', info.activeId, 'wheel=', !!info.wheel, 'landmarks=', dataset.terrain3dPilotLandmarks, 'errors=', errors.length);
        await page.close();
      }

      // ---- 2. DEBUG boot: stations + screen geometry. ----
      {
        const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
        await page.goto(`${base}/?debug&nowaves&nolevel&nokill&nopause&tier=full&contract=${map.id}&seed=mapart-${phase}`);
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 120000 });
        const begin = page.getByTestId('contract-briefing-dismiss');
        if (await begin.isVisible().catch(() => false)) await begin.click();
        await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 60000 });
        const wheel = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.fairground ?? null);
        const debugHud = await hudRects(page);

        const stations = [];
        const settle = async () => {
          const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
          await page.waitForFunction((f) => window.__THREE_GAME_DIAGNOSTICS__.frame >= f + 24, frame, { timeout: 30000 });
          await page.waitForTimeout(600);
        };

        for (const mount of pack.mounts) {
          const asset = pack.assets[mount.id];
          const top = asset.bounds.max[2] * (mount.scale?.[1] ?? 1);
          await page.evaluate(({ x, z, back }) => { window.__GR_TEST__.teleport(x, z + back); }, { x: mount.position[0], z: mount.position[2], back: BACK });
          await settle();
          const pts = await page.evaluate(({ x, z, top }) => ({
            base: window.__GR_TEST__.screenPoint(x, z, 0),
            apex: window.__GR_TEST__.screenPoint(x, z, top),
          }), { x: mount.position[0], z: mount.position[2], top });
          const file = `${map.pack}-station-${mount.id}-${vp.name}.png`;
          await page.screenshot({ path: `${out}/${file}` });
          const box = bbox([pts.apex, pts.base]);
          stations.push({ id: mount.id, file, top, ...pts, box,
            overlapPlain: Number(coveredFraction(box, plainHud).toFixed(4)),
            apexCoveredPlain: plainHud.some((r) => pts.apex.x >= r.x && pts.apex.x <= r.x + r.w && pts.apex.y >= r.y && pts.apex.y <= r.y + r.h),
            overlapDebug: Number(coveredFraction(box, debugHud).toFixed(4)) });
        }

        let wheelStation = null;
        if (wheel) {
          await page.evaluate(({ x, z, back }) => { window.__GR_TEST__.teleport(x, z + back); }, { x: wheel.x, z: wheel.z, back: BACK + 6 });
          await settle();
          // FerrisWheel.ts:36 group scale 0.74; :135 hub y 6.2; :122 ring radius 5; gondolas hang ~1.3 below the rim.
          const s = 0.74, hub = 6.2, r = 5;
          const pts = await page.evaluate(({ x, z, s, hub, r }) => {
            const sp = (dx, dy) => window.__GR_TEST__.screenPoint(x + dx, z, dy);
            return { apex: sp(0, (hub + r) * s), hub: sp(0, hub * s), foot: sp(0, 0), left: sp(-r * s, hub * s), right: sp(r * s, hub * s) };
          }, { x: wheel.x, z: wheel.z, s, hub, r });
          const file = `${map.pack}-station-ferris-wheel-${vp.name}.png`;
          await page.screenshot({ path: `${out}/${file}` });
          const box = bbox([pts.apex, pts.foot, pts.left, pts.right]);
          wheelStation = { id: 'ferris-wheel', file, ...pts, box,
            overlapPlain: Number(coveredFraction(box, plainHud).toFixed(4)),
            apexCoveredPlain: plainHud.some((rr) => pts.apex.x >= rr.x && pts.apex.x <= rr.x + rr.w && pts.apex.y >= rr.y && pts.apex.y <= rr.y + rr.h),
            overlapDebug: Number(coveredFraction(box, debugHud).toFixed(4)) };
          stations.push(wheelStation);
        }
        rows.push({ map: map.id, pack: map.pack, viewport: vp.name, boot: 'debug', errors, wheel, hudRects: debugHud, stations });
        console.log('DEBUG', map.pack, vp.name, 'stations=', stations.length, 'errors=', errors.length);
        await page.close();
      }
    }
  }
} finally {
  writeFileSync(`${out}/checks.json`, JSON.stringify(rows, null, 2));
  await browser.close();
}
