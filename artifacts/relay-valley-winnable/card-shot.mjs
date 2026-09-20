// Plain boot, no ?debug: does a first-time player read the claim-grit rule on the card?
// Desktop and 390px mobile, scaled screenshots, console/page errors counted.
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(fileURLToPath(new URL('.', import.meta.url)));
const BASE = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5306';
const URL_ = `${BASE}/?contract=e7-relay-valley`;
const log = [];

const browser = await chromium.launch({ channel: 'chromium' });
for (const [name, opts] of [
  ['desktop-chrome', { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }],
  ['mobile-chrome', { ...devices['Pixel 5'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 }],
]) {
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  const card = page.locator('[data-testid="contract-briefing"]');
  await card.waitFor({ state: 'attached', timeout: 30_000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="contract-briefing-rules"]');
    return !!el && el.textContent.trim().length > 0;
  }, undefined, { timeout: 30_000 });
  const rules = await page.locator('[data-testid="contract-briefing-rules"] li').allTextContents();
  const visibleAtRead = await card.isVisible();
  await page.screenshot({ path: path.join(OUT, `card-${name}.png`), scale: 'css' });
  // A beat later, to record F-CWBC-2's desktop disappearance honestly.
  await page.waitForTimeout(2000);
  const visibleAfter2s = await card.isVisible();
  await page.screenshot({ path: path.join(OUT, `card-${name}-plus2s.png`), scale: 'css' });
  log.push({ project: name, visibleAtRead, visibleAfter2s, rules, consoleErrors: errors });
  await context.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'card-shots.log'), JSON.stringify(log, null, 2) + '\n');
console.log(JSON.stringify(log, null, 2));
