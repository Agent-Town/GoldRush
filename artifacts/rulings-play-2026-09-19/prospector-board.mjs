/**
 * F-SSL-3 — the prospector coats IN PLAY, before and after.
 *
 * The two regenerations (`char-prospector-{complainant,gilded}-sheet-hover8`) are player SKINS
 * (`src/game/ProspectorSkin.ts`), owned through the wardrobe, so "in play" means granting the coat
 * and looking at the agent on the claim. This boots each coat in turn, stands the Prospector beside
 * the hero, captures the canvas, and reads back the sheet the animator actually resolved and the
 * on-screen height of the agent's drawn sprite.
 *
 *   PHASE=before node artifacts/rulings-play-2026-09-19/prospector-board.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.PROBE_BASE ?? 'http://127.0.0.1:5309';
const PHASE = process.env.PHASE ?? 'after';
const OUT = 'artifacts/rulings-play-2026-09-19';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const rows = [];
const errors = [];
for (const skin of ['stock', 'complainant', 'gilded']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => errors.push(`${skin} pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${skin} console: ${m.text()}`); });
  await page.goto(`${BASE}/`);
  await page.evaluate(({ skin }) => {
    localStorage.setItem('gr.prospector.skins-owned.v1', JSON.stringify(['stock', 'complainant', 'gilded']));
    localStorage.setItem('gr.prospector.skin.v1', skin);
  }, { skin });
  await page.goto(`${BASE}/?debug&contract=the-claim&nowaves&nolevel&nopause&seed=fssl3-board`);
  await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.prospector_agent']?.loaded, null, { timeout: 120_000 });
  const briefing = page.getByTestId('contract-briefing-dismiss');
  if (await briefing.isVisible().catch(() => false)) await briefing.click();
  await page.waitForTimeout(1500);
  const read = await page.evaluate(() => {
    const sa = window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.prospector_agent'];
    return { loaded: sa?.loaded ?? null, frameKey: sa?.frameKey ?? null, clip: sa?.clip ?? null, frameCount: sa?.frameCount ?? null,
      agent: window.__THREE_GAME_DIAGNOSTICS__.agent?.embodiment?.position ?? null };
  });
  await page.locator('#game-canvas').screenshot({ path: `${OUT}/prospector-board-${skin}-${PHASE}.png` });
  rows.push({ skin, ...read });
  await page.close();
}
await browser.close();
writeFileSync(`${OUT}/prospector-board-${PHASE}.json`, JSON.stringify({ phase: PHASE, at: new Date().toISOString(), rows, errors }, null, 1));
for (const row of rows) console.log(PHASE, row.skin, JSON.stringify(row));
console.log('errors:', errors.length, errors.slice(0, 5).join(' | '));
