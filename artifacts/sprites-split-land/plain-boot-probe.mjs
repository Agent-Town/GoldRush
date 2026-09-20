#!/usr/bin/env node
// Plain boot, no ?debug, desktop + 390 px: zero console errors, zero page errors, zero failed requests.
import { chromium, devices } from 'playwright';
const BASE = process.env.GR_BASE || 'http://127.0.0.1:5340';
const viewports = [
  ['desktop', { viewport: { width: 1280, height: 800 } }],
  ['mobile390', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } }],
];
let bad = 0;
const browser = await chromium.launch();
for (const [name, opts] of viewports) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [], pageErrors = [], failed = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => failed.push(r.url() + ' ' + (r.failure()?.errorText ?? '')));
  page.on('response', (r) => { if (r.status() >= 400) failed.push(r.url() + ' HTTP ' + r.status()); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `artifacts/sprites-split-land/plain-boot-${name}.png`, fullPage: false });
  console.log(`${name}: consoleErrors=${errors.length} pageErrors=${pageErrors.length} failedRequests=${failed.length}`);
  for (const e of [...errors, ...pageErrors, ...failed].slice(0, 10)) console.log('   ' + e.slice(0, 200));
  bad += errors.length + pageErrors.length + failed.length;
  await ctx.close();
}
await browser.close();
console.log(bad === 0 ? 'PLAIN BOOT CLEAN on both viewports' : `PLAIN BOOT: ${bad} problem(s)`);
process.exit(bad === 0 ? 0 : 1);
