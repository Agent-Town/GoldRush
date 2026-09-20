// Before/after capture harness for tasks/post-open-maps-correctives.md (items 1-3).
// Adapted from artifacts/open-maps-art-blackout-fairground/capture.mjs (the task the findings
// came from), with three additions this task needs:
//   * the HUD rectangle set is SPLIT into `persistent` (the cards a player always has) and
//     `announcement` (`.hud__wave`, which is opacity:0 until `.hud--announcement-visible` and
//     therefore only on screen while a wave banner runs). The 2026-09-18 review's 54.7 % / 37.5 %
//     / 23.4 % numbers are measured against the UNION; this harness reports both so the lever can
//     be chosen against the right one.
//   * `renderCensus()` (draw calls / triangles) on the debug boot.
//   * `p95Runs` frame-time samples, N per boot, because the host is bimodal (~9 / ~16 ms).
//
//   PROBE_BASE=http://127.0.0.1:5312 PHASE=before node artifacts/post-open-maps-correctives/capture.mjs
//
// Writes only under artifacts/post-open-maps-correctives/<PHASE>/.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5312';
const phase = process.env.PHASE ?? 'before';
const only = process.env.ONLY_MAP ?? '';
const p95Runs = Number(process.env.P95_RUNS ?? 0);
const out = `artifacts/post-open-maps-correctives/${phase}`;
/**
 * THE ACCEPTANCE STATION, DECLARED. Every landmark is stationed 14 world units back from its mount
 * and judged from there; that distance is the acceptance, the way `playability-secure.spec.ts`
 * declares its play strategy, and a number measured from a different stand-off is a number about a
 * different picture (F-POC-2: "the framed apex is a function of the stand-off — 11.4 m at 8 back
 * … 5.25 at 20 back", `reviews/post-open-maps-correctives.md`).
 */
const BACK = 14;
/**
 * THE WHEEL'S STATION — RE-DECLARED 2026-09-19 from `BACK + 6` (20 back) to `BACK` (14), the
 * station every other landmark is accepted at.
 *
 * Owner ruling 2026-09-19, verbatim: "I agree with all your recommendations on the decisions - good
 * work", taking option (a) on the desk register's F-POC-4 row — *accept the wheel at the 14-back
 * station like every landmark and re-declare the acceptance*, against (b) moving or shrinking the
 * 390 px top cards. The desk's reason, in its own words: "The HUD is a bigger change to make for a
 * capture harness's sake."
 *
 * WHAT WAS WRONG. F-POC-4 measured the rebuilt wheel as covered 61.5 % by the 390 px HUD cards and
 * 39.1 % on desktop — but it measured it from 20 back while its ten neighbours were judged from 14,
 * so the wheel was being asked to fit a frame nothing else was fitting. The extra six units were
 * never a ruling; they were in the harness to stop an 8.3 m apex clipping before the wheel was
 * rebuilt (F-OMB-2/-3 brought it inside the frame and made it 31 % narrower). The HUD is untouched
 * by this change, exactly as the ruling says.
 */
const WHEEL_BACK = Number(process.env.WHEEL_BACK ?? BACK);
mkdirSync(out, { recursive: true });

const packOf = (map) =>
  JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/landmarks/${map}/${map}-landmark-pack-contract.json`, 'utf8'));
// The RUNTIME reads landmarkMounts from the terrain contract (Terrain3dClaimPilot.landmarkMountsFor),
// not from the pack; the pack carries a mirrored copy. Station geometry must follow the runtime's.
const mountsOf = (map, contractId) => {
  const terrain = JSON.parse(readFileSync(`assets/pilots/map-rebuild-spike/${map}-terrain-contract.json`, 'utf8'));
  const pack = packOf(map);
  return { mounts: terrain.landmarkMounts, assets: pack.assets, contractId };
};

const MAPS = [
  { id: 'e3-blackout-ridge', pack: 'blackout-ridge' },
  { id: 'e3-fairground', pack: 'fairground' },
].filter((m) => !only || m.pack === only);

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
];

function coveredFraction(box, rects) {
  if (box.w < 0 || box.h <= 0) return 0;
  const steps = 64;
  let hit = 0;
  for (let iy = 0; iy < steps; iy += 1)
    for (let ix = 0; ix < steps; ix += 1) {
      const px = box.x + ((ix + 0.5) / steps) * Math.max(box.w, 0.001);
      const py = box.y + ((iy + 0.5) / steps) * box.h;
      if (rects.some((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h)) hit += 1;
    }
  return hit / (steps * steps);
}

const hudRects = async (page) =>
  page.evaluate(() => {
    const roots = [document.querySelector('#hud'), document.querySelector('#touch-controls')].filter(Boolean);
    const rects = [];
    const visit = (el, announcement) => {
      if (!(el instanceof HTMLElement)) return;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return;
      const cls = el.className?.toString?.() ?? '';
      const isAnnouncement = announcement || cls.includes('hud__wave');
      const r = el.getBoundingClientRect();
      const painted = style.backgroundColor !== 'rgba(0, 0, 0, 0)' || (el.children.length === 0 && el.textContent?.trim());
      if (r.width > 4 && r.height > 4 && painted) rects.push({ tag: el.tagName.toLowerCase(), cls: cls.slice(0, 48), announcement: isAnnouncement, x: r.x, y: r.y, w: r.width, h: r.height });
      for (const child of el.children) visit(child, isAnnouncement);
    };
    for (const root of roots) visit(root, false);
    return rects;
  });

const bbox = (pts) => {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
};

async function frameP95(page, frames = 180) {
  return page.evaluate((sampleCount) => new Promise((resolve) => {
    const samples = [];
    let previous = performance.now();
    const tick = (now) => {
      samples.push(now - previous);
      previous = now;
      if (samples.length < sampleCount) return requestAnimationFrame(tick);
      samples.sort((a, b) => a - b);
      resolve(Number(samples[Math.floor((samples.length - 1) * 0.95)].toFixed(2)));
    };
    requestAnimationFrame(tick);
  }), frames);
}

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const map of MAPS) {
    const pack = mountsOf(map.pack, map.id);
    for (const vp of VIEWPORTS) {
      // ---- 1. PLAIN boot: native launch seam, no ?debug. ----
      let plainHud = [];
      {
        const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
        await page.goto(`${base}/`);
        await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 60000 });
        await page.evaluate(async (id) => {
          const unlock = await import('/src/meta/ContractUnlock.ts');
          const families = await import('/src/meta/ContractFamilies.ts');
          unlock.setPreviewUnlockAll(true);
          families.stagePlayerContractLaunch(id);
        }, map.id);
        await page.goto(`${base}/?contract=${map.id}&seed=poc-${phase}`);
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', null, { timeout: 120000 });
        const begin = page.getByTestId('contract-briefing-dismiss');
        if (await begin.isVisible().catch(() => false)) await begin.click();
        await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 60000 });
        await page.waitForTimeout(1500);
        const shot = `${map.pack}-plain-${vp.name}.png`;
        await page.screenshot({ path: `${out}/${shot}` });
        plainHud = await hudRects(page);
        const dataset = await page.evaluate(() => ({ ...document.querySelector('#game-canvas').dataset }));
        const info = await page.evaluate(() => ({ activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId, fallback: window.__THREE_GAME_DIAGNOSTICS__?.contract?.fallbackReason ?? null, wheel: window.__THREE_GAME_DIAGNOSTICS__?.fairground ?? null, testHook: typeof window.__GR_TEST__ }));
        rows.push({ map: map.id, pack: map.pack, viewport: vp.name, boot: 'plain', shot, errors, hudRects: plainHud, info,
          dataset: { landmarks: dataset.terrain3dPilotLandmarks, expected: dataset.terrain3dPilotLandmarkExpected, skipped: dataset.terrain3dPilotLandmarkSkipped, state: dataset.terrain3dPilotState, loadState: dataset.terrain3dPilotLandmarkLoadState, skirtBlend: dataset.terrain3dPilotSkirtBlend } });
        console.log('PLAIN', map.pack, vp.name, 'active=', info.activeId, 'wheel=', !!info.wheel, 'landmarks=', dataset.terrain3dPilotLandmarks, 'errors=', errors.length);
        await page.close();
      }
      const persistentHud = plainHud.filter((r) => !r.announcement);

      // ---- 2. DEBUG boot: stations + screen geometry. ----
      {
        const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
        const errors = [];
        page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
        await page.goto(`${base}/?debug&nowaves&nolevel&nokill&nopause&tier=full&contract=${map.id}&seed=poc-${phase}`);
        await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotLandmarkLoadState === 'mounted', null, { timeout: 120000 });
        const begin = page.getByTestId('contract-briefing-dismiss');
        if (await begin.isVisible().catch(() => false)) await begin.click();
        await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 60000 });
        const wheel = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.fairground ?? null);

        const stations = [];
        const settle = async () => {
          const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.frame);
          await page.waitForFunction((f) => window.__THREE_GAME_DIAGNOSTICS__.frame >= f + 24, frame, { timeout: 30000 });
          await page.waitForTimeout(600);
        };
        const score = (box) => ({
          box,
          overlapPlain: Number(coveredFraction(box, plainHud).toFixed(4)),
          overlapPersistent: Number(coveredFraction(box, persistentHud).toFixed(4)),
        });

        for (const mount of pack.mounts) {
          const asset = pack.assets[mount.id];
          const top = asset.bounds.max[2] * (mount.scale?.[1] ?? 1);
          const halfX = Math.max(Math.abs(asset.bounds.min[0]), Math.abs(asset.bounds.max[0])) * (mount.scale?.[0] ?? 1);
          await page.evaluate(({ x, z, back }) => { window.__GR_TEST__.teleport(x, z + back); }, { x: mount.position[0], z: mount.position[2], back: BACK });
          await settle();
          const pts = await page.evaluate(({ x, z, top, halfX }) => ({
            base: window.__GR_TEST__.screenPoint(x, z, 0),
            apex: window.__GR_TEST__.screenPoint(x, z, top),
            left: window.__GR_TEST__.screenPoint(x - halfX, z, top / 2),
            right: window.__GR_TEST__.screenPoint(x + halfX, z, top / 2),
          }), { x: mount.position[0], z: mount.position[2], top, halfX });
          const file = `${map.pack}-station-${mount.id}-${vp.name}.png`;
          await page.screenshot({ path: `${out}/${file}` });
          // The line box (apex..base) is the 2026-09-18 review's own metric; the wide box adds the
          // body's measured horizontal extent so the number means "the body", not "a vertical hair".
          const line = bbox([pts.apex, pts.base]);
          const wide = bbox([pts.apex, pts.base, pts.left, pts.right]);
          stations.push({ id: mount.id, file, back: BACK, top, scale: mount.scale ?? [1, 1, 1], ...pts,
            ...score(line), wide: score(wide) });
        }

        if (wheel) {
          await page.evaluate(({ x, z, back }) => { window.__GR_TEST__.teleport(x, z + back); }, { x: wheel.x, z: wheel.z, back: WHEEL_BACK });
          await settle();
          // THE WHEEL'S OWN GEOMETRY, RE-BASED 2026-09-19 (F-RP-5). These defaults still described
          // the PRE-REBUILD wheel (`hub` 6.2, `r` 5), so a run that did not pass the env overrides
          // measured an apex the shipped wheel does not have: -66.6 px against the +10.9 the
          // 2026-09-18 `after/` arm recorded by passing `WHEEL_HUB=3.49 WHEEL_RADIUS=3.515` on the
          // command line. The numbers now come from `src/entities/FerrisWheel.ts` itself — `HUB`
          // 3.49 and `CAR_RADIUS` = `RIM` 2.63 + 0.5 + 0.385 lantern roof = 3.515, the topmost
          // lantern's own roof line, which is what F-OMB-2/-3 framed. An override still wins, so
          // the old station's numbers stay reproducible.
          const s = Number(process.env.WHEEL_SCALE ?? 0.74);
          const hub = Number(process.env.WHEEL_HUB ?? 3.49);
          const r = Number(process.env.WHEEL_RADIUS ?? 3.515);
          const pts = await page.evaluate(({ x, z, s, hub, r }) => {
            const sp = (dx, dy) => window.__GR_TEST__.screenPoint(x + dx, z, dy);
            return { apex: sp(0, (hub + r) * s), hub: sp(0, hub * s), foot: sp(0, 0), left: sp(-r * s, hub * s), right: sp(r * s, hub * s) };
          }, { x: wheel.x, z: wheel.z, s, hub, r });
          const file = `${map.pack}-station-ferris-wheel-${vp.name}.png`;
          await page.screenshot({ path: `${out}/${file}` });
          const box = bbox([pts.apex, pts.foot, pts.left, pts.right]);
          stations.push({ id: 'ferris-wheel', file, back: WHEEL_BACK, wheelLevers: { s, hub, r }, ...pts, ...score(box) });
        }

        const census = await page.evaluate(() => window.__GR_TEST__.renderCensus?.() ?? null);
        const p95 = [];
        for (let i = 0; i < p95Runs; i += 1) p95.push(await frameP95(page));
        rows.push({ map: map.id, pack: map.pack, viewport: vp.name, boot: 'debug', errors, wheel, stations,
          renderer: census?.renderer ?? null, scene: census ? { singletonMeshes: census.scene.singletonMeshes, instancedMeshes: census.scene.instancedMeshes } : null, p95 });
        console.log('DEBUG', map.pack, vp.name, 'stations=', stations.length, 'calls=', census?.renderer?.calls, 'errors=', errors.length, 'p95=', p95.join('/'));
        await page.close();
      }
    }
  }
} finally {
  writeFileSync(`${out}/checks.json`, JSON.stringify(rows, null, 2));
  await browser.close();
}
