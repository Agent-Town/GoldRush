// A close, HUD-free look at the wheel so its SHAPE can be judged against
// assets/raw/plate-contract-e3-fairground.png. Not an acceptance shot (the acceptance shots are the
// plain boots in before/ and after/); this is the eyes-on the concept comparison needs.
//
//   PROBE_BASE=... PHASE=after node artifacts/post-open-maps-correctives/wheel-closeup.mjs
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.env.PROBE_BASE ?? 'http://127.0.0.1:5312';
const phase = process.env.PHASE ?? 'after';
const out = `artifacts/post-open-maps-correctives/${phase}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
try {
  for (const vp of [
    { name: 'desktop', viewport: { width: 1280, height: 800 }, isMobile: false },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true },
  ]) {
    const page = await browser.newPage({ viewport: vp.viewport, isMobile: vp.isMobile, hasTouch: vp.isMobile, deviceScaleFactor: 1 });
    await page.goto(`${base}/?debug&nowaves&nolevel&nokill&nopause&tier=full&contract=e3-fairground&seed=poc-closeup`);
    await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 40, null, { timeout: 120000 });
    const begin = page.getByTestId('contract-briefing-dismiss');
    if (await begin.isVisible().catch(() => false)) await begin.click();
    const wheel = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__.fairground);
    for (const back of [9, 14]) {
      await page.evaluate(({ x, z, b }) => window.__GR_TEST__.teleport(x, z + b), { x: wheel.x, z: wheel.z, b: back });
      await page.waitForTimeout(1400);
      await page.evaluate(() => { for (const sel of ['#hud', '#touch-controls', '#debug-panel']) { const el = document.querySelector(sel); if (el) el.style.visibility = 'hidden'; } });
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${out}/wheel-closeup-${back}back-${vp.name}.png` });
      await page.evaluate(() => { for (const sel of ['#hud', '#touch-controls', '#debug-panel']) { const el = document.querySelector(sel); if (el) el.style.visibility = ''; } });
    }
    console.log('closeup', vp.name, 'written');
    await page.close();
  }
} finally {
  await browser.close();
}
