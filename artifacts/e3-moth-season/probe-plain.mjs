import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript(() => localStorage.clear());
await page.goto('http://127.0.0.1:5241/?contract=e3-moth-season&seed=e3-moth-season');
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60000 });
const briefing = page.getByTestId('contract-briefing');
if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
console.log(JSON.stringify(await page.evaluate(() => ({
  activeId: window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId,
  canyon: window.__THREE_GAME_DIAGNOSTICS__?.canyonWorks,
}))));
await page.getByTestId('hud-build').click();
console.log('tiles', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-buildable-id]')].map((e) => e.getAttribute('data-buildable-id')))));
await browser.close();
