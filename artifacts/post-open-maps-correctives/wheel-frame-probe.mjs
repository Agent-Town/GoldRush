// F-OMB-3: what world height at the Fairground's standard wheel station still projects INSIDE the
// frame? The review quotes apex y = -70.2 (390 px) / -66.5 (desktop) for the shipped
// (hub 6.2 + radius 5) x scale 0.74 = 8.288 m apex. Perspective is not linear in world height, so
// this sweeps the actual projection instead of extrapolating a px/m slope.
//
//   PROBE_BASE=http://127.0.0.1:5312 node artifacts/post-open-maps-correctives/wheel-frame-probe.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5312';
const out = 'artifacts/post-open-maps-correctives/work';
mkdirSync(out, { recursive: true });
const BACK = 20; // the capture harness's wheel station: (wheel.x, wheel.z + 14 + 6)

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const vp of [
    { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
  ]) {
    const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
    await page.goto(`${base}/?debug&nowaves&nolevel&nokill&nopause&tier=full&contract=e3-fairground&seed=poc-wheelframe`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 120000 });
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible().catch(() => false)) await begin.click();
    const wheel = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.fairground);
    await page.evaluate(({ x, z, back }) => window.__GR_TEST__.teleport(x, z + back), { x: wheel.x, z: wheel.z, back: BACK });
    await page.waitForTimeout(1200);
    const sweep = await page.evaluate(({ x, z }) => {
      const list = [];
      for (let h = 0; h <= 10.01; h += 0.25) {
        const p = window.__GR_TEST__.screenPoint(x, z, h);
        list.push({ h: Number(h.toFixed(2)), y: Number(p.y.toFixed(1)), x: Number(p.x.toFixed(1)), inView: p.inView });
      }
      return list;
    }, { x: wheel.x, z: wheel.z });
    // widest half-width still on screen, sampled at the hub height
    const widths = await page.evaluate(({ x, z }) => {
      const list = [];
      for (let r = 0; r <= 6.01; r += 0.5) {
        const l = window.__GR_TEST__.screenPoint(x - r, z, 4);
        const rr = window.__GR_TEST__.screenPoint(x + r, z, 4);
        list.push({ r: Number(r.toFixed(2)), left: Number(l.x.toFixed(1)), right: Number(rr.x.toFixed(1)) });
      }
      return list;
    }, { x: wheel.x, z: wheel.z });
    const firstInside = sweep.filter((s) => s.y >= 0).at(-1);
    const margin8 = sweep.filter((s) => s.y >= 8).at(-1);
    rows.push({ viewport: vp.name, wheel, sweep, widths, tallestAtY0: firstInside, tallestAtY8: margin8 });
    console.log(vp.name, 'tallest apex with y>=0:', JSON.stringify(firstInside), ' y>=8:', JSON.stringify(margin8));
    await page.close();
  }
} finally {
  writeFileSync(`${out}/wheel-frame-probe.json`, JSON.stringify(rows, null, 2));
  await browser.close();
}
