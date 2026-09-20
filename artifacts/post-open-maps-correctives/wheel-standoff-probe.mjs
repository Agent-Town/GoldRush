// How high can the wheel stand and still be inside the frame, as a function of where the player
// stands? The camera is pitched down, so a point FARTHER from the player sits HIGHER on screen —
// which is why the landmark stations (14 back) frame a 6.4 m arch while the wheel station
// (20 back) clips an 8.3 m apex. This sweeps stand-off x apex height on both viewports.
//
//   PROBE_BASE=http://127.0.0.1:5312 node artifacts/post-open-maps-correctives/wheel-standoff-probe.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5312';
const out = 'artifacts/post-open-maps-correctives/work';
mkdirSync(out, { recursive: true });
const STANDOFFS = [8, 10, 12, 14, 16, 18, 20, 24];

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
try {
  for (const vp of [
    { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
  ]) {
    const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
    await page.goto(`${base}/?debug&nowaves&nolevel&nokill&nopause&tier=full&contract=e3-fairground&seed=poc-standoff`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 120000 });
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible().catch(() => false)) await begin.click();
    const wheel = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.fairground);
    for (const back of STANDOFFS) {
      await page.evaluate(({ x, z, b }) => window.__GR_TEST__.teleport(x, z + b), { x: wheel.x, z: wheel.z, b: back });
      await page.waitForTimeout(900);
      const row = await page.evaluate(({ x, z }) => {
        const out = { ceiling: null, at8288: null, foot: null };
        out.foot = Number(window.__GR_TEST__.screenPoint(x, z, 0).y.toFixed(1));
        out.at8288 = Number(window.__GR_TEST__.screenPoint(x, z, 8.288).y.toFixed(1));
        for (let h = 12; h >= 0; h -= 0.05) {
          if (window.__GR_TEST__.screenPoint(x, z, h).y >= 8) { out.ceiling = Number(h.toFixed(2)); break; }
        }
        return out;
      }, { x: wheel.x, z: wheel.z });
      rows.push({ viewport: vp.name, back, ...row });
      console.log(vp.name, 'back', back, 'foot y', row.foot, '| apex 8.288 m -> y', row.at8288, '| tallest apex with y>=8:', row.ceiling, 'm');
    }
    await page.close();
  }
} finally {
  writeFileSync(`${out}/wheel-standoff-probe.json`, JSON.stringify(rows, null, 2));
  await browser.close();
}
