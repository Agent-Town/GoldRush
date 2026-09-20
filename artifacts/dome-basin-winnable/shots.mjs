import { chromium } from '@playwright/test';
const OUT = 'artifacts/dome-basin-winnable/shots';
const BASE = 'http://127.0.0.1:5308';
const views = [['desktop', 1280, 720], ['mobile', 390, 844]];
const browser = await chromium.launch();
for (const [name, width, height] of views) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/?contract=e9-dome-basin&seed=e9-dome-basin-01`, { waitUntil: 'load' });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${OUT}/${name}-dome-basin-plain-boot.png`, scale: 'css' });
  console.log(`${name} ${width}x${height} consoleErrors=${errors.length}`, errors.slice(0, 4));
  await page.close();
}
await browser.close();
