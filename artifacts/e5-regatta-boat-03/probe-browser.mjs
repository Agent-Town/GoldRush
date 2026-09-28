// E5 Regatta slice 3 — the BROWSER half of the "both engines publish the same block" claim.
// Boots a plain dev server page on 5336, boards the boat through the ?debug seam (the same act
// the headless probe performs by setting the hero's position), and captures `now.regatta` off the
// live browser view `window.__GR_AGENT__.view`.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5336';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
try {
  await page.goto(`${BASE}/?debug&contract=e5-regatta&seed=e5-regatta-01`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__GR_AGENT__ && 'view' in window.__GR_AGENT__), null, { timeout: 120_000 });
  await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.regatta), null, { timeout: 120_000 });
  const boot = await page.evaluate(() => JSON.parse(JSON.stringify(window.__GR_AGENT__.view.now.regatta)));
  const version = await page.evaluate(() => window.__GR_AGENT__.view.viewVersion);
  // Board exactly as the headless probe does: off the deck, then onto it, one fixed step apart.
  await page.evaluate(() => { window.__GR_TEST__.setManualSim(true); });
  for (const spot of [{ x: -40, z: 0 }, { x: -49, z: 6 }]) {
    await page.evaluate(({ x, z }) => { window.__GR_TEST__.teleport(x, z); window.__GR_TEST__.advanceSim(1 / 30); }, spot);
  }
  const aboard = await page.evaluate(() => JSON.parse(JSON.stringify(window.__GR_AGENT__.view.now.regatta)));
  const control = await page.evaluate(() => JSON.parse(JSON.stringify({ deepwaterClaimBoat: window.__THREE_GAME_DIAGNOSTICS__.deepwaterClaim.boat.motion })));
  const out = { base: BASE, viewVersion: version, boot, aboard, control, consoleErrors: errors };
  writeFileSync(new URL('./browser-view-sample.json', import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
  console.log(JSON.stringify(out, null, 2));
} finally {
  await browser.close();
}
