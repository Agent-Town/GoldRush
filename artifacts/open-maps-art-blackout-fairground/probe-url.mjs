import { chromium } from '@playwright/test';
const base = 'http://127.0.0.1:5460';
const urls = [
  '/?contract=e3-blackout-ridge',
  '/?era=3&contract=e3-blackout-ridge',
  '/?era=3&contract=e3-fairground',
  '/?era=3&contract=e3-fairground&tier=full',
];
const browser = await chromium.launch({ channel: 'chromium' });
for (const u of urls) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  try {
    await page.goto(base + u);
    await page.waitForFunction(() => document.querySelector('#game-canvas')?.dataset.terrain3dPilotState === 'ready', null, { timeout: 90000 });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => ({ id: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId, wheel: !!window.__THREE_GAME_DIAGNOSTICS__?.fairground, lm: document.querySelector('#game-canvas').dataset.terrain3dPilotLandmarks }));
    console.log(u, JSON.stringify(info), 'errors', errs.length);
  } catch (e) { console.log(u, 'FAIL', e.message.slice(0, 120)); }
  await page.close();
}
await browser.close();
