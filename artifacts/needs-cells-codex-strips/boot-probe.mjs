// Plain-boot console/page-error probe at both widths, for the three scenes this batch renders in.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const BASE = process.env.NCS_BASE ?? 'http://127.0.0.1:5305';
const OUT = 'artifacts/needs-cells-codex-strips/boot';
mkdirSync(OUT, { recursive: true });
const SCENES = [
  ['town', '/'],
  ['e1-baron', '/?contract=e1-baron'],
  ['e2-hill-mine', '/?contract=e2-hill-mine'],
];
const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
for (const [name, path] of SCENES) {
  for (const [label, width, height] of [['desktop', 1280, 800], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    const errors = [], requests = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('requestfailed', (r) => requests.push(r.url().split('/').pop() + ' ' + (r.failure()?.errorText ?? '')));
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${OUT}/${name}-${label}.png` });
    rows.push({ scene: name, view: label, errors, failedRequests: requests });
    await page.close();
  }
}
await browser.close();
for (const r of rows) console.log(`${r.scene.padEnd(14)} ${r.view.padEnd(8)} errors=${r.errors.length} failedRequests=${r.failedRequests.length}${r.errors.length ? ' :: ' + r.errors.slice(0, 3).join(' | ') : ''}`);
