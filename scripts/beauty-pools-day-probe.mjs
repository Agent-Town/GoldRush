#!/usr/bin/env node
// Day no-regression probe: the grade is structurally zero at darkness 0 (amount = strength x
// mask x darkness); this measures it — same six ground points at wave 1, grade ON vs
// ?nopoolgrade OFF, same browser. Sprites/water animate in real time so the comparison is
// median-of-9x9 over 5 frames per point, expected equal within 1 quantisation step.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const BASE = 'http://127.0.0.1:5261';
const POINTS = [[2, 16], [0, 16], [5, 16], [12, 12], [14.5, 12], [-8, 4]];

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function bootArm(flag) {
  await page.goto(`${BASE}/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=pool-day&tier=full${flag ? '&nopoolgrade' : ''}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const briefing = page.getByTestId('contract-briefing');
  if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  await page.waitForFunction(() => {
    const c = document.querySelector('#game-canvas');
    return c?.dataset.terrain3dPilotState === 'ready' && c.dataset.terrain3dPilotRenderSource === 'glb';
  });
  await page.evaluate(() => {
    window.__GR_TEST__.teleport(6, 12);
    const canvas = document.querySelector('#game-canvas');
    for (const el of document.querySelectorAll('body *')) {
      if (el === canvas || el.contains(canvas) || canvas.contains(el)) continue;
      el.style.visibility = 'hidden';
    }
  });
  await page.waitForTimeout(400);
}

async function sample() {
  const screenPoints = await page.evaluate((pts) => pts.map(([x, z]) => {
    const api = window.__GR_TEST__;
    const s = api.screenPoint(x, z, api.terrainVisualY(x, z, 0.03));
    return { x, z, sx: s.x, sy: s.y, inView: s.inView };
  }), POINTS);
  const canvas = page.locator('#game-canvas');
  const box = await canvas.boundingBox();
  const frames = [];
  for (let i = 0; i < 5; i += 1) {
    frames.push(PNG.sync.read(await canvas.screenshot()));
    await page.waitForTimeout(140);
  }
  return screenPoints.map((p) => {
    if (!p.inView) return { ...p, rgb: null };
    const per = frames.map((png) => {
      const cx = Math.round(p.sx * png.width / box.width);
      const cy = Math.round(p.sy * png.height / box.height);
      const rs = [], gs = [], bs = [];
      for (let y = cy - 4; y <= cy + 4; y += 1) for (let x = cx - 4; x <= cx + 4; x += 1) {
        const o = (y * png.width + x) * 4;
        rs.push(png.data[o]); gs.push(png.data[o + 1]); bs.push(png.data[o + 2]);
      }
      const mid = (l) => l.sort((a, b) => a - b)[Math.floor(l.length / 2)];
      return [mid(rs), mid(gs), mid(bs)];
    });
    const ch = (i) => per.map((f) => f[i]).sort((a, b) => a - b)[2];
    return { x: p.x, z: p.z, rgb: [ch(0), ch(1), ch(2)] };
  });
}

await bootArm(false);
const on = await sample();
await bootArm(true);
const off = await sample();
let worst = 0;
for (let i = 0; i < on.length; i += 1) {
  const a = on[i].rgb, b = off[i].rgb;
  const delta = a && b ? Math.max(...a.map((v, c) => Math.abs(v - b[c]))) : NaN;
  worst = Math.max(worst, delta || 0);
  console.log(`(${on[i].x},${on[i].z})  ON ${a?.join(',')}  OFF ${b?.join(',')}  maxΔ ${delta}`);
}
console.log(`worst channel delta: ${worst} (expect <=1)`);
await browser.close();
process.exit(worst <= 1 ? 0 : 1);
