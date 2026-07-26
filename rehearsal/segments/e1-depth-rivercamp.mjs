// E1 DEPTH — THE RIVER CAMP PROBE. One question, asked honestly:
//
//   "Can a player win a release map by wading into the river and standing still?"
//
// Why it is worth asking (all ✓ VERIFIED at source before this was written):
//   Terrain.ts:214   the hero may walk DEEP water when the tile is
//                    `frontier-river-claim` and tile.water.heroCanWadeDeep — which
//                    manifest.json:217 sets true. Three of the five E1 release maps
//                    ride that tile: the-claim, e1-night-shift, e1-baron.
//   Game.ts:6536     deep water DISARMS both hero weapons outside epoch-5
//                    ("Wet powder." — Game.ts:6523). That is the intended price.
//   e2e/task-025-bandits-dont-swim.spec.ts  enemies do not enter deep water; they
//                    cross at fords. So the price buys total safety.
//   Game.ts:4532     the run is secured by REACHING secureWave — not by clearing.
// If all four hold at once, the price is not a price: you trade an offense you
// don't need for a safety that wins. This probe pays the price and sees.
//
// DRIVING: WASD only, then NOTHING. No teleport, no grantGold, no setBalance, no
// placeFree. Cited assists are the same two the review declares: ?contract= (a
// door) and timescale (a uniform sim multiplier — here it only compresses the
// waiting, which is the whole point of the test).
//
// usage: node rehearsal/segments/e1-depth-rivercamp.mjs <contract> <label> <timescale> <budget-min>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveBase } from '../base-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = resolveBase('E1_BASE', { root: ROOT });
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-e1-depth');
const DATA_DIR = path.join(ROOT, 'e1-review-video', 'profiles');

const CONTRACT = process.argv[2] ?? 'the-claim';
const LABEL = process.argv[3] ?? `camp-${CONTRACT}`;
const TIMESCALE = Number(process.argv[4] ?? 3);
const BUDGET_MIN = Number(process.argv[5] ?? 10);
// A deep-river spot away from the ford: probes in Game.ts:4375 say (-12, 0) is
// 'river' and (0, 0) is 'ford'. The ford is a crossing structure — enemies use
// it and it does NOT disarm (Game.ts:6538) — so camping there proves nothing.
const CAMP = [Number(process.env.CAMP_X ?? -12), Number(process.env.CAMP_Z ?? 0)];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(SHOT_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

const context = await chromium.launchPersistentContext(path.join(DATA_DIR, `${LABEL}-fresh`), {
  channel: 'chromium', headless: true, viewport: { width: 1280, height: 720 },
});
const page = context.pages()[0] ?? (await context.newPage());
const errors = { console: [], page: [] };
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('ws://127.0.0.1')) errors.console.push(m.text()); });
page.on('pageerror', (e) => errors.page.push(e.message));
const shot = async (n) => { try { await page.screenshot({ path: path.join(SHOT_DIR, `${n}.png`) }); } catch { /* best effort */ } };

const url = `/?debug&contract=${CONTRACT}&timescale=${TIMESCALE}&seed=camp-${LABEL}`;
console.log(`[${LABEL}] boot ${BASE}${url}`);
const startedAt = Date.now();
await page.goto(BASE + url);
for (let i = 0; i < 200; i += 1) {
  if (await page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10)) break;
  await wait(200);
}
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await wait(300);

const read = () => page.evaluate(() => {
  const g = window.__THREE_GAME_DIAGNOSTICS__;
  const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
  return {
    wave: g?.ui?.wave, hp: g?.hp, maxHp: g?.maxHp, enemies: g?.enemiesAlive, state: g?.state,
    zone: g?.terrain?.playerZone ?? null, heroPos: g?.heroPos ?? null, kills: g?.kills ?? 0,
    secured: g?.run?.secured ?? false, secureWave: g?.run?.secureWave ?? null, rush: g?.run?.rush ?? false,
    announcement: g?.ui?.announcement ?? null, gold: g?.ui?.gold ?? 0,
    upgradeOpen: overlay?.classList.contains('upgrade-overlay--visible') === true && overlay.getAttribute('aria-hidden') === 'false',
  };
});

// ---- LEG 1: WALK IN. Real WASD, no teleport.
let arrived = false;
for (let step = 0; step < 220 && !arrived; step += 1) {
  const d = await read();
  if (d.upgradeOpen) { await page.keyboard.press('Digit1'); await wait(150); continue; }
  if (d.state === 'dead') break;
  if (d.zone === 'river') { arrived = true; break; }
  const h = d.heroPos ?? { x: 0, z: 0 };
  const dx = CAMP[0] - h.x, dz = CAMP[1] - h.z;
  const key = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'KeyD' : 'KeyA') : (dz > 0 ? 'KeyS' : 'KeyW');
  await page.keyboard.down(key); await wait(220); await page.keyboard.up(key);
}
const at = await read();
console.log(`[${LABEL}] walked in: zone=${at.zone} pos=${at.heroPos?.x?.toFixed(1)},${at.heroPos?.z?.toFixed(1)} wave=${at.wave} hp=${Math.round(at.hp)} (${Math.round((Date.now() - startedAt) / 1000)}s)`);
await shot(`${LABEL}-01-waded-in`);
if (!arrived) console.log(`[${LABEL}] NOTE: never reached deep river — this map may not permit deep wading.`);

// ---- LEG 2: STAND STILL. Nothing is pressed from here on except level-up picks,
// which the game HALTS for (it will not advance without an answer).
const samples = [];
let hpMin = at.hp ?? 0, lastWave = -1, outcome = 'budget';
let wetPowder = 0;
const deadline = Date.now() + BUDGET_MIN * 60_000;
while (Date.now() < deadline) {
  const d = await read();
  if (!d || d.wave === undefined) { outcome = 'diagnostics-lost'; break; }
  if (d.upgradeOpen) { await page.keyboard.press('Digit1'); await wait(150); continue; }
  if (d.announcement === 'Wet powder.') wetPowder += 1;
  hpMin = Math.min(hpMin, d.hp);
  if (d.wave !== lastWave) {
    samples.push({ wave: d.wave, hp: Math.round(d.hp), enemies: d.enemies, zone: d.zone, kills: d.kills, gold: d.gold, atSec: Math.round((Date.now() - startedAt) / 1000) });
    console.log(`[${LABEL}] wave ${d.wave}${d.secureWave ? '/' + d.secureWave : ''} hp=${Math.round(d.hp)}/${d.maxHp} enemies=${d.enemies} zone=${d.zone} kills=${d.kills}`);
    lastWave = d.wave;
  }
  if (d.secured) { outcome = 'secured'; console.log(`[${LABEL}] SECURED at wave ${d.wave} WITHOUT MOVING (hp ${Math.round(d.hp)}/${d.maxHp}, kills ${d.kills})`); await shot(`${LABEL}-02-secured`); break; }
  if (d.state === 'dead' || d.hp <= 0) { outcome = 'dead'; console.log(`[${LABEL}] DIED at wave ${d.wave}`); await shot(`${LABEL}-02-died`); break; }
  await wait(900);
}
const end = await read();
await shot(`${LABEL}-03-final`);
const report = {
  label: LABEL, contract: CONTRACT, base: BASE, url, timescale: TIMESCALE, camp: CAMP,
  reachedDeepRiver: arrived, campZone: at.zone, campPos: at.heroPos,
  outcome, wavesReached: lastWave, hpStart: at.hp, hpMin, hpEnd: end.hp, kills: end.kills,
  wetPowderAnnouncements: wetPowder, wallSeconds: Math.round((Date.now() - startedAt) / 1000),
  samples, errors,
};
writeFileSync(path.join(SHOT_DIR, `${LABEL}-report.json`), JSON.stringify(report, null, 2));
console.log(`\n[${LABEL}] ===== ${outcome} | waves ${lastWave} | hp ${Math.round(at.hp)}->${Math.round(end.hp)} (min ${Math.round(hpMin)}) | kills ${end.kills} | wet-powder ticks ${wetPowder} =====`);
console.log(`[${LABEL}] errors: console=${errors.console.length} page=${errors.page.length}`);
await context.close();
