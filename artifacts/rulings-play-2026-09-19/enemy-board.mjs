/**
 * F-NCS-5 — the before/after board of the E1 base enemy IN PLAY.
 *
 * Boots `e1-dry-gulch` with `?debug` (the spawn hook is debug-gated, Game.ts:454), stands four base
 * outlaws around the hero on the four cardinals so each one draws a different heading, and captures
 * the canvas. Run once before the repoint and once after; the two PNGs are the owner's eye on
 * whether the E1 base enemy is a Claim Jumper again.
 *
 *   PHASE=before node artifacts/rulings-play-2026-09-19/enemy-board.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.PROBE_BASE ?? 'http://127.0.0.1:5309';
const PHASE = process.env.PHASE ?? 'after';
const MAP = process.env.BOARD_MAP ?? 'e1-dry-gulch';
const OUT = 'artifacts/rulings-play-2026-09-19';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
await page.goto(`${BASE}/?debug&contract=${MAP}&nowaves&nolevel&nopause&nokill&nosteal&nowreck&seed=ncs5-board`);
await page.waitForFunction(() => window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations?.['char.hero']?.loaded, null, { timeout: 120_000 });
const briefing = page.getByTestId('contract-briefing-dismiss');
if (await briefing.isVisible().catch(() => false)) await briefing.click();
await page.evaluate(async () => {
  const hero = window.__THREE_GAME_DIAGNOSTICS__.heroPos;
  for (const [dx, dz] of [[-6, 0], [6, 0], [0, -6], [0, 6]]) window.__GR_TEST__.spawnEnemyAt(hero.x + dx, hero.z + dz);
});
await page.waitForTimeout(2500);
const slots = await page.evaluate(() => Object.keys(window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations ?? {}).sort());
await page.locator('#game-canvas').screenshot({ path: `${OUT}/enemy-board-${PHASE}.png` });
await browser.close();
writeFileSync(`${OUT}/enemy-board-${PHASE}.json`, JSON.stringify({ phase: PHASE, map: MAP, at: new Date().toISOString(), spriteAnimationSlots: slots, errors }, null, 1));
console.log(PHASE, 'slots:', slots.join(', '));
console.log('errors:', errors.length, errors.slice(0, 5).join(' | '));
