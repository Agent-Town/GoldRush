import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = 'http://127.0.0.1:5271';
const OUT = 'artifacts/beauty-e2-hill-mine/escort';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
for (const arm of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${BASE}/?debug&contract=e2-hill-mine&mode=escort&nowaves&nolevel&nopause&nosteal&seed=e2-escort${arm === 'nobeauty' ? '&nobeauty' : ''}`);
  await page.waitForFunction(() => window.__GR_TEST__?.escort()?.enabled === true, undefined, { timeout: 180000 });
  await page.waitForTimeout(2000);
  const begin = page.getByTestId('contract-briefing-dismiss');
  if (await begin.count()) await begin.click().catch(() => {});
  await page.waitForTimeout(1200);
  const cart = await page.evaluate(() => window.__GR_TEST__?.escort());
  await page.evaluate((c) => window.__GR_TEST__?.teleport?.(c.x + 1.5, c.z + 7), cart);
  await page.waitForTimeout(3000);
  const after = await page.evaluate(() => window.__GR_TEST__?.escort());
  await page.screenshot({ path: `${OUT}/desktop-chrome-${arm}.png` });
  console.log(arm, JSON.stringify({ state: after.state, x: +after.x.toFixed(1), z: +after.z.toFixed(1), errors: errors.length }));
  await page.close();
}
await browser.close();
