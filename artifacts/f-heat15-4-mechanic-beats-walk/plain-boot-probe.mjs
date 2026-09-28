// Plain-boot console/page-error probe at 1280 and 390 (F-HEAT15-4 self-check).
// No ?debug and no __GR_TEST__: the boot a player gets off the town board.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = 'http://127.0.0.1:5306';
const out = 'artifacts/f-heat15-4-mechanic-beats-walk';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
let bad = 0;
for (const [label, width, height, url, needsFrames] of [
  ['landing-1280', 1280, 800, `${base}/`, false],
  ['landing-390', 390, 844, `${base}/`, false],
  ['claim-1280', 1280, 800, `${base}/?contract=the-claim&nowaves&nopause`, true],
  ['claim-390', 390, 844, `${base}/?contract=the-claim&nowaves&nopause`, true],
  ['regatta-1280', 1280, 800, `${base}/?contract=e5-regatta&nowaves&nopause`, true],
  ['regatta-390', 390, 844, `${base}/?contract=e5-regatta&nowaves&nopause`, true],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  // The known GLTFLoader blob red the repo's own watchErrors suppresses.
  page.on('console', (m) => { if (m.type() === 'error' && !/GLTFLoader|blob:/.test(m.text())) errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`page: ${e.message}`));
  await page.goto(url, { waitUntil: 'load' });
  if (needsFrames) await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout: 120_000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${out}/plain-boot-${label}.png` });
  console.log(`${label}: ${errors.length} error(s)${errors.length ? ` -> ${errors.join(' | ')}` : ''}`);
  bad += errors.length;
  await page.close();
}
await browser.close();
console.log(bad === 0 ? 'PLAIN BOOT CLEAN' : `PLAIN BOOT DIRTY (${bad})`);
process.exit(bad === 0 ? 0 : 1);
