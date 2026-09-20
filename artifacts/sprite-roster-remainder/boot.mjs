// Plain-boot probe: the town and the four era arenas the master names, desktop and 390 px,
// counting console errors, page errors and failed requests. No ?debug harness beyond what the
// arena URL needs to select its contract.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.GOLD_RUSH_REVIEW_URL ?? 'http://127.0.0.1:5400';
const out = 'artifacts/sprite-roster-remainder/boot';
fs.mkdirSync(out, { recursive: true });

const TARGETS = [
  ['town', '/'],
  ['e6-half-life-hollow', '/?epoch=epoch-6-atomic&contract=e6-half-life-hollow&nolevel&nopause'],
  ['e7-relay-rush', '/?epoch=epoch-7-signal&contract=e7-relay-rush&nolevel&nopause'],
  ['e8-eclipse', '/?epoch=epoch-8-orbital&contract=e8-eclipse&nolevel&nopause'],
  ['e9-dome-basin', '/?epoch=epoch-9-redfields&contract=e9-dome-basin&nolevel&nopause'],
];

const browser = await chromium.launch();
const rows = [];
for (const [width, height] of [[1280, 800], [390, 844]]) {
  for (const [name, url] of TARGETS) {
    const page = await browser.newPage({ viewport: { width, height } });
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => pageErrors.push(String(e.message)));
    page.on('requestfailed', (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText ?? ''}`));
    await page.goto(`${base}${url}${url.includes('?') ? '&' : '?'}seed=roster-remainder`, { waitUntil: 'load' });
    try {
      const begin = page.getByRole('button', { name: 'Begin', exact: true });
      if (await begin.count()) await begin.click({ timeout: 8000 });
    } catch { /* the arenas boot straight in */ }
    await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 60, null, { timeout: 120000 });
    await page.waitForTimeout(2500);
    const file = path.join(out, `${name}-${width}.png`);
    await page.screenshot({ path: file });
    rows.push({ target: name, width, consoleErrors, pageErrors, failedRequests, screenshot: file });
    console.log(`${name.padEnd(22)} ${String(width).padStart(4)}  console ${consoleErrors.length}  page ${pageErrors.length}  failedRequests ${failedRequests.length}`);
    for (const e of [...consoleErrors, ...pageErrors, ...failedRequests].slice(0, 5)) console.log('    ', e.slice(0, 200));
    await page.close();
  }
}
fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(rows, null, 2) + '\n');
await browser.close();
const bad = rows.filter((r) => r.consoleErrors.length || r.pageErrors.length || r.failedRequests.length);
console.log(bad.length ? `NOT CLEAN: ${bad.length} of ${rows.length} boots carry errors` : `CLEAN: ${rows.length} boots, zero console/page/request errors`);
