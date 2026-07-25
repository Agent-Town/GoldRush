// E1 DEPTH — honest-play probe, one map per invocation.
// TASK.md (2026-07-25 night): "REALLY PLAYED at Trail difficulty, no debug assists".
// Extends the repaired rehearsal rig's driving grammar (hold(), upgrade picks,
// the never-idle law) with: a FRESH PROFILE per map, an honest build loop
// (pointer preview + confirm — no placeFree), honest economy (no grantGold),
// honest levelling (no maxUpgrades), and per-wave telemetry for gap-hunting.
//
// THE ONLY CITED ASSISTS (declared in the review, nothing else):
//   1. `?contract=<id>` — a DOOR, not a power: reaches maps whose unlock ladder
//      (science>=3, 2-secured, ...) cannot be walked inside tonight's window.
//   2. `timescale` — uniform sim-time multiplier (Game.ts:2312 simDelta = delta *
//      simTimeScale). Compresses wall clock only; for a scripted driver it makes
//      play HARDER (coarser reactions per sim-second), so it never flatters.
// No maxUpgrades / grantGold / placeFree / setWave / setBalance / teleport.
import { chromium } from 'playwright';
import { mkdirSync, renameSync, appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BASE = process.env.E1_BASE ?? 'http://127.0.0.1:5241';
const VIDEO_DIR = path.join(ROOT, 'e1-review-video');
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-e1-depth');
const DATA_DIR = path.join(ROOT, 'e1-review-video', 'profiles');

const CONTRACT = process.argv[2] ?? 'the-claim';
const LABEL = process.argv[3] ?? CONTRACT;
const TIMESCALE = Number(process.argv[4] ?? 3);
const BUDGET_MIN = Number(process.argv[5] ?? 12);
const VIEWPORT = process.argv[6] === 'mobile' ? { width: 390, height: 844 } : { width: 1280, height: 720 };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function poll(fn, { timeout = 20_000, interval = 150, label = 'poll' } = {}) {
  const deadline = Date.now() + timeout;
  let last;
  while (Date.now() < deadline) {
    try { last = await fn(); if (last) return last; } catch { /* transient */ }
    await wait(interval);
  }
  throw new Error(`${label}: timeout after ${timeout}ms (last=${JSON.stringify(last)})`);
}

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await wait(ms);
  await page.keyboard.up(key);
}

mkdirSync(VIDEO_DIR, { recursive: true });
mkdirSync(SHOT_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

// FRESH PROFILE per map: a brand-new user-data-dir = first-boot feel, greenhorn
// offer, Trail default (ProfileStorage.ts:26 DEFAULT_DIFFICULTY_PRESET='trail').
const profileDir = path.join(DATA_DIR, `${LABEL}-${process.env.E1_PROFILE_TAG ?? 'fresh'}`);
const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chromium',
  headless: true,
  viewport: VIEWPORT,
  recordVideo: { dir: path.join(VIDEO_DIR, '.tmp'), size: VIEWPORT },
});
const page = context.pages()[0] ?? (await context.newPage());
page.on('dialog', (d) => d.accept().catch(() => {}));
const errors = { console: [], page: [] };
page.on('console', (m) => {
  const t = m.text();
  if (m.type() === 'error' && !t.includes('ws://127.0.0.1') && t !== 'Failed to load resource: net::ERR_CONNECTION_REFUSED')
    errors.console.push(t);
});
page.on('pageerror', (e) => errors.page.push(e.message));

const shot = async (name) => {
  try { await page.screenshot({ path: path.join(SHOT_DIR, `${name}.png`) }); console.log(`  shot: ${name}.png`); }
  catch (e) { console.log(`  shot FAILED ${name}: ${e.message}`); }
};

const url = `/?debug&contract=${CONTRACT}&timescale=${TIMESCALE}&seed=e1-depth-${LABEL}`;
console.log(`[${LABEL}] boot ${url}  viewport=${VIEWPORT.width}x${VIEWPORT.height}`);
const startedAt = Date.now();
await page.goto(BASE + url);

// ---- FRESH-PROFILE SEAM: the start menu / greenhorn offer. Answer it like a
// player who declines the training wheels => Trail (the task's difficulty).
const firstRun = { sawStartMenu: false, sawGreenhornOffer: false, greenhornCopy: null, trailGuideBeats: [] };
try {
  await poll(async () => await page.getByTestId('start-menu-enter-town').isVisible().catch(() => false),
    { timeout: 8_000, label: 'start menu' });
  firstRun.sawStartMenu = true;
  await shot(`${LABEL}-00-start-menu`);
  const offer = await page.evaluate(() => {
    const el = document.querySelector('[name="greenhornOffer"]');
    if (!el) return null;
    const box = el.closest('fieldset, .start-menu__block, section, div');
    return box ? box.textContent.replace(/\s+/g, ' ').trim().slice(0, 400) : 'present (no container text)';
  });
  if (offer) { firstRun.sawGreenhornOffer = true; firstRun.greenhornCopy = offer; }
  // Decline greenhorn -> Trail (StartMenu.ts:235: 'yes' => greenhorn, else trail)
  await page.evaluate(() => {
    const no = Array.from(document.querySelectorAll('[name="greenhornOffer"]'))
      .find((i) => i.value !== 'yes');
    if (no) { no.checked = true; no.dispatchEvent(new Event('change', { bubbles: true })); }
  });
} catch { console.log('  (no start menu on this door — contract door boots straight in)'); }

await poll(() => page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10),
  { timeout: 45_000, label: 'game frames' });

const boot = await page.evaluate(() => {
  const g = window.__THREE_GAME_DIAGNOSTICS__;
  const brief = document.querySelector('[data-testid="contract-briefing"]');
  return {
    contract: g?.contract?.activeId ?? null,
    difficulty: g?.difficultyPreset ?? null,
    secureWave: g?.run?.secureWave ?? null,
    briefing: brief ? brief.textContent.replace(/\s+/g, ' ').trim().slice(0, 700) : null,
    buildables: (g?.ui?.buildables ?? []).map((b) => ({ id: b.id, cost: b.cost, max: b.maxCount })),
    startGold: g?.ui?.gold ?? null,
  };
});
console.log(`[${LABEL}] contract=${boot.contract} difficulty=${boot.difficulty} secureWave=${boot.secureWave} startGold=${boot.startGold}`);
console.log(`[${LABEL}] buildables: ${JSON.stringify(boot.buildables)}`);
if (boot.briefing) console.log(`[${LABEL}] briefing: ${boot.briefing}`);
await shot(`${LABEL}-01-briefing`);
await page.getByTestId('contract-briefing-dismiss').click().catch(() => {});
await wait(400);
await shot(`${LABEL}-02-first-look`);

// ---- HONEST BUILD: pointer preview + confirm. Verified by a count delta.
const canvasBox = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});

/** World->screen via the engine's own projection (__GR_TEST__.screenPoint).
 * Perception only: it tells the driver where a thing IS on screen, exactly as a
 * sighted player reads it. Falls back to a centre offset if unavailable. */
async function screenFor(x, z) {
  const pt = await page.evaluate(([wx, wz]) => {
    const sp = window.__GR_TEST__?.screenPoint;
    if (!sp) return null;
    for (const args of [[wx, 0, wz], [wx, wz]]) {
      try {
        const r = sp(...args);
        if (r && Number.isFinite(r.x) && Number.isFinite(r.y)) return { x: r.x, y: r.y };
      } catch { /* try next shape */ }
    }
    return null;
  }, [x, z]);
  return pt;
}

/** Walk the hero toward a world point with real WASD holds.
 * Axis mapping confirmed from the rig's pilotBoss: KeyD=+x, KeyA=-x, KeyS=+z, KeyW=-z. */
async function moveToward(tx, tz, ms = 220) {
  const hero = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos ?? null);
  if (!hero) { await hold(page, 'KeyW', ms); return null; }
  const dx = tx - hero.x, dz = tz - hero.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 1.2) return { dist, arrived: true };
  const key = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 'KeyD' : 'KeyA') : (dz > 0 ? 'KeyS' : 'KeyW');
  await hold(page, key, ms);
  return { dist, arrived: false, key };
}

async function tryBuild(buildId, screenDx, screenDy, worldSpot = null) {
  const before = await page.evaluate((id) => {
    const b = window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables?.find((x) => x.id === id);
    return { count: b?.count ?? -1, gold: window.__THREE_GAME_DIAGNOSTICS__?.ui?.gold ?? 0, afford: b?.canAfford ?? false, cost: b?.cost ?? 0 };
  }, buildId);
  if (!before.afford) return { built: false, why: `cannot afford (gold=${before.gold} cost=${before.cost})`, ...before };
  await page.keyboard.press('KeyB');
  await wait(140);
  const idx = await page.evaluate((id) => {
    const list = window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables ?? [];
    return list.findIndex((x) => x.id === id);
  }, buildId);
  if (idx >= 0) { await page.keyboard.press(`Digit${idx + 1}`); await wait(120); }
  // Aim the ghost, then NUDGE until the engine says the spot is legal — this is
  // exactly the player's move: slide the preview until it stops being red.
  let aim = null;
  if (worldSpot) aim = await screenFor(worldSpot[0], worldSpot[1]);
  if (!aim && canvasBox) aim = { x: canvasBox.x + canvasBox.w / 2 + screenDx, y: canvasBox.y + canvasBox.h / 2 + screenDy };
  let valid = false;
  const NUDGES = [[0, 0], [26, 0], [-26, 0], [0, 22], [0, -22], [40, 26], [-40, 26], [52, -18], [-52, -18], [0, 46]];
  for (const [nx, ny] of NUDGES) {
    if (!aim) break;
    await page.mouse.move(aim.x + nx, aim.y + ny);
    await wait(110);
    valid = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build?.ghostValid === true);
    if (valid) { aim = { x: aim.x + nx, y: aim.y + ny }; break; }
  }
  if (!valid) {
    await page.keyboard.press('Escape');
    await wait(90);
    return { built: false, why: 'no legal ghost spot found in 10 nudges', ...before };
  }
  await page.keyboard.press('Space');
  await wait(220);
  const midCount = await page.evaluate((id) => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables?.find((x) => x.id === id)?.count ?? -1, buildId);
  if (midCount <= before.count && aim) { await page.mouse.click(aim.x, aim.y); await wait(220); }
  const after = await page.evaluate((id) => {
    const b = window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables?.find((x) => x.id === id);
    return { count: b?.count ?? -1, gold: window.__THREE_GAME_DIAGNOSTICS__?.ui?.gold ?? 0, buildMode: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMode ?? false };
  }, buildId);
  if (after.buildMode) { await page.keyboard.press('Escape'); await wait(100); }
  return { built: after.count > before.count, before: before.count, after: after.count, goldBefore: before.gold, goldAfter: after.gold };
}

// ---- THE PLAY LOOP
const perWave = [];
const upgradesTaken = [];
const buildLog = [];
const announcements = [];
let lastWave = -1;
let outcome = 'budget-exhausted';
let tick = 0;
let idleTicks = 0;          // ticks with NO affordable build AND no seam to work
let liveTicks = 0;
let kiteTicks = 0;          // ticks spent breaking contact
let consecutiveKite = 0;    // time-box so fleeing can't become a stalemate
let panTicks = 0;           // ticks spent standing on a seam, panning
let waveStart = Date.now();
let peakEnemies = 0;
let sawRush = false;
const fpsSamples = [];
const deadline = Date.now() + BUDGET_MIN * 60_000;

// Ring of build spots around centre (screen-space offsets), tried in order.
const SPOTS = [[-140, 60], [140, 60], [-140, -40], [140, -40], [0, 120], [-240, 20], [240, 20], [0, -110], [-60, 160], [60, 160]];
let spotIx = 0;

while (Date.now() < deadline) {
  const d = await page.evaluate(() => {
    const g = window.__THREE_GAME_DIAGNOSTICS__;
    if (!g) return null;
    const overlay = document.querySelector('[data-testid="upgrade-overlay"]');
    const upgradeOpen = overlay?.classList.contains('upgrade-overlay--visible') === true && overlay.getAttribute('aria-hidden') === 'false';
    const u = g.ui ?? {};
    return {
      wave: u.wave, waveState: u.waveState, hp: g.hp, maxHp: g.maxHp, gold: u.gold, level: u.level,
      enemies: g.enemiesAlive, state: g.state, secured: g.run?.secured ?? false, rush: g.run?.rush ?? false,
      secureWave: g.run?.secureWave ?? null, announcement: u.announcement, announcementKind: u.announcementKind,
      upgradeOpen, offer: g.progression?.offer ?? null, stacks: g.progression?.stacks ?? null,
      buildables: (u.buildables ?? []).map((b) => ({ id: b.id, cost: b.cost, count: b.count, afford: b.canAfford, max: b.maxCount })),
      frame: g.frame, elapsed: g.elapsed, timeAlive: g.timeAlive,
      heroPos: g.heroPos ?? null, kills: g.kills ?? null,
      goldPanned: g.goldPanned ?? null,
      panned: g.economy?.summary?.panned ?? null, sluiced: g.economy?.summary?.sluiced ?? null,
      channeling: g.harvest?.channeling ?? false, channelProgress: g.harvest?.progress ?? 0,
      seams: (g.harvest?.activeNodes ?? []).filter((n) => n.active)
        .map((n) => ({ id: n.id, x: n.position.x, z: n.position.z, remaining: n.remaining })),
      // the player's eyes: where the pressure is right now
      foes: (window.__GR_TEST__?.enemyPositions?.() ?? []).map((e) => ({ x: e.x, z: e.z })),
    };
  });
  if (!d) { outcome = 'diagnostics-lost'; break; }

  // 1. Level-up: take a REAL pick from the REAL offer (policy: first offer, but
  //    logged so a dominant-strategy pattern shows up in the telemetry).
  if (d.upgradeOpen) {
    const pick = Array.isArray(d.offer) && d.offer.length ? d.offer[0] : null;
    upgradesTaken.push({ wave: d.wave, level: d.level, offer: d.offer, took: pick });
    await page.keyboard.press('Digit1');
    await wait(180);
    continue;
  }

  // 2. Wave transition bookkeeping
  if (d.wave !== lastWave) {
    if (lastWave >= 0) {
      const secs = Math.round((Date.now() - waveStart) / 1000);
      const row = perWave[perWave.length - 1];
      if (row) { row.wallSeconds = secs; row.peakEnemies = peakEnemies; row.idleFrac = liveTicks ? +(idleTicks / liveTicks).toFixed(2) : null; }
    }
    waveStart = Date.now(); peakEnemies = 0; idleTicks = 0; liveTicks = 0;
    perWave.push({
      wave: d.wave, hpIn: Math.round(d.hp), maxHp: d.maxHp, goldIn: d.gold, level: d.level,
      panned: d.panned, sluiced: d.sluiced, seamsUp: (d.seams ?? []).length,
      builds: d.buildables.filter((b) => b.count > 0).map((b) => `${b.id}x${b.count}`).join(' ') || 'none',
    });
    console.log(`[${LABEL}] wave ${d.wave}${d.secureWave ? '/' + d.secureWave : ''} hp=${Math.round(d.hp)}/${d.maxHp} gold=${d.gold} panned=${d.panned} lvl=${d.level} enemies=${d.enemies} seams=${(d.seams ?? []).length} builds=${perWave[perWave.length - 1].builds}`);
    lastWave = d.wave;
    if (d.wave === 1) await shot(`${LABEL}-03-wave1`);
    if (d.wave === 5) await shot(`${LABEL}-04-wave5`);
    if (d.wave === 10) await shot(`${LABEL}-05-wave10`);
    if (d.wave === 15) await shot(`${LABEL}-06-wave15`);
    if (d.wave === 20) await shot(`${LABEL}-07-wave20`);
  }
  if (d.announcement && !announcements.some((a) => a.text === d.announcement)) {
    announcements.push({ wave: d.wave, text: d.announcement, kind: d.announcementKind });
    console.log(`[${LABEL}]   ANNOUNCE w${d.wave} (${d.announcementKind}): ${d.announcement}`);
  }
  if (d.enemies > peakEnemies) peakEnemies = d.enemies;
  if (d.rush && !sawRush) { sawRush = true; console.log(`[${LABEL}]   RUSH ENGAGED at wave ${d.wave}`); await shot(`${LABEL}-08-rush`); }

  // 3. Outcomes
  if (d.secured && !sawRush) {
    outcome = 'secured';
    console.log(`[${LABEL}] SECURED at wave ${d.wave} (hp ${Math.round(d.hp)}/${d.maxHp}, ${Math.round((Date.now() - startedAt) / 1000)}s wall)`);
    await shot(`${LABEL}-09-secured`);
    const office = await page.evaluate(() => document.querySelector('[data-testid="claim-office"]')?.textContent?.replace(/\s+/g, ' ').slice(0, 400) ?? null);
    if (office) console.log(`[${LABEL}]   office card: ${office}`);
    break;
  }
  if (d.state === 'dead' || d.hp <= 0) {
    outcome = 'dead';
    console.log(`[${LABEL}] DIED at wave ${d.wave} (${Math.round((Date.now() - startedAt) / 1000)}s wall)`);
    await shot(`${LABEL}-09-death`);
    break;
  }

  // 4. THE DECISION: is there anything meaningful to do this tick?
  //    "Meaningful" = an affordable build OR a reachable seam to work. A tick
  //    with neither is a DEAD tick — this is the dead-minutes instrument.
  liveTicks += 1;
  const affordable = d.buildables.filter((b) => b.afford && b.count < b.max);
  const seamsOpen = (d.seams ?? []).length > 0;
  if (!affordable.length && !seamsOpen) idleTicks += 1;

  // 5. Build when we can — defence first, then economy. (Honest: real gold.)
  const turret = affordable.find((b) => b.id === 'turret' || b.id === 'sentry_beacon');
  const sluice = affordable.find((b) => b.id === 'sluice');
  const anyBuild = turret ?? sluice ?? affordable[0];
  if (anyBuild && tick % 6 === 0) {
    // BuildSystem.ts:1391-1394 — the ghost must lie within placeRadius OF THE
    // HERO. So a build is always hero-local: offset a couple of metres and nudge.
    const hero = d.heroPos ?? { x: 0, z: 0 };
    const off = [[2.5, 2.5], [-2.5, 2.5], [2.5, -2.5], [-2.5, -2.5], [3.5, 0], [0, 3.5], [-3.5, 0], [0, -3.5]][spotIx % 8];
    const worldSpot = [hero.x + off[0], hero.z + off[1]];
    const [dx, dy] = SPOTS[spotIx % SPOTS.length];
    spotIx += 1;
    const r = await tryBuild(anyBuild.id, dx, dy, worldSpot);
    buildLog.push({ wave: d.wave, id: anyBuild.id, ...r });
    if (r.built) console.log(`[${LABEL}]   built ${anyBuild.id} (gold ${r.goldBefore}->${r.goldAfter})`);
    else if (buildLog.filter((b) => !b.built).length <= 4) console.log(`[${LABEL}]   build ${anyBuild.id} FAILED: ${r.why ?? `count ${r.before}->${r.after}`}`);
  }

  // 6. NEVER IDLE — THE REAL LOOP a competent Trail player runs:
  //    KITE when pressed (auto-fire does the damage; survival is footwork),
  //    PAN in the gaps (HarvestSystem.ts:355 — you must be SLOWER than
  //    Balance.goldSeam.slowSpeed to channel, i.e. actually stand still),
  //    and never stand still when nothing is worth standing for.
  const hero = d.heroPos ?? { x: 0, z: 0 };
  const foes = d.foes ?? [];
  const near = foes
    .map((f) => ({ ...f, dist: Math.hypot(f.x - hero.x, f.z - hero.z) }))
    .sort((a, b) => a.dist - b.dist)[0] ?? null;
  const hurt = d.hp / Math.max(1, d.maxHp) < 0.55;
  // Kiting is TIME-BOXED: a real player breaks contact, then goes back to work.
  // Unbounded fleeing is a driver degeneracy (it stalemates), not play.
  const kiteBudgetLeft = consecutiveKite < 8;
  const pressed = near && (near.dist < (hurt ? 9 : 5.5)) && kiteBudgetLeft;

  if (pressed) {
    consecutiveKite += 1;
  } else {
    consecutiveKite = 0;
  }
  if (pressed) {
    // Break contact directly away from the nearest threat.
    const ax = hero.x - near.x, az = hero.z - near.z;
    const key = Math.abs(ax) > Math.abs(az) ? (ax > 0 ? 'KeyD' : 'KeyA') : (az > 0 ? 'KeyS' : 'KeyW');
    await hold(page, key, 240);
    kiteTicks += 1;
  } else if (seamsOpen) {
    // Nearest active seam — walk to it, then STAND STILL and pan it dry.
    const target = d.seams
      .map((s) => ({ ...s, dist: Math.hypot(s.x - hero.x, s.z - hero.z) }))
      .sort((a, b) => a.dist - b.dist)[0];
    if (target.dist > 1.3) await moveToward(target.x, target.z, 200);
    else { await wait(420); panTicks += 1; }   // stand still => channel
  } else {
    await hold(page, ['KeyD', 'KeyS', 'KeyA', 'KeyW'][tick % 4], 200);
  }
  if (tick % 9 === 0) await page.keyboard.press('KeyQ'); // exercise both arsenal roots
  fpsSamples.push({ t: Date.now(), frame: d.frame });
  tick += 1;
  await wait(90);
}

const finalRow = perWave[perWave.length - 1];
if (finalRow) { finalRow.wallSeconds = Math.round((Date.now() - waveStart) / 1000); finalRow.peakEnemies = peakEnemies; finalRow.idleFrac = liveTicks ? +(idleTicks / liveTicks).toFixed(2) : null; }

await wait(1200);
await shot(`${LABEL}-10-final`);
const end = await page.evaluate(() => {
  const g = window.__THREE_GAME_DIAGNOSTICS__;
  return {
    run: g?.run ?? null, wave: g?.ui?.wave, gold: g?.ui?.gold, level: g?.ui?.level,
    kills: g?.kills ?? null, xpAudit: g?.xpAudit ?? null, stacks: g?.progression?.stacks ?? null,
    arsenal: g?.arsenal ? { turretKills: g.arsenal.turretKills, blastKills: g.arsenal.blastKills, toggles: g.arsenal.weaponToggles } : null,
    office: document.querySelector('[data-testid="claim-office"]')?.textContent?.replace(/\s+/g, ' ').slice(0, 400) ?? null,
    deathOverlay: document.querySelector('[data-testid="death-overlay"]')?.textContent?.replace(/\s+/g, ' ').slice(0, 300) ?? null,
  };
});

// wall-clock FPS estimate from frame counter deltas
let fps = null;
if (fpsSamples.length > 4) {
  const a = fpsSamples[1], b = fpsSamples[fpsSamples.length - 1];
  fps = +(((b.frame - a.frame) / ((b.t - a.t) / 1000))).toFixed(1);
}

const report = {
  label: LABEL, contract: CONTRACT, url, timescale: TIMESCALE, viewport: VIEWPORT,
  difficulty: boot.difficulty, secureWave: boot.secureWave, startGold: boot.startGold,
  firstRun, boot, outcome, wallSeconds: Math.round((Date.now() - startedAt) / 1000),
  wavesReached: lastWave, sawRush, fpsEstimate: fps,
  driver: { ticks: tick, kiteTicks, panTicks },
  perWave, upgradesTaken, buildLog, announcements, end, errors,
};
writeFileSync(path.join(SHOT_DIR, `${LABEL}-report.json`), JSON.stringify(report, null, 2));

console.log(`\n[${LABEL}] ===== OUTCOME: ${outcome} | waves reached ${lastWave} | wall ${report.wallSeconds}s | fps~${fps} =====`);
console.log(`[${LABEL}] builds attempted=${buildLog.length} succeeded=${buildLog.filter((b) => b.built).length}`);
console.log(`[${LABEL}] upgrades taken=${upgradesTaken.length} :: ${upgradesTaken.map((u) => u.took).join(', ')}`);
console.log(`[${LABEL}] end: ${JSON.stringify(end).slice(0, 900)}`);
console.log(`[${LABEL}] errors: console=${errors.console.length} page=${errors.page.length}`);
if (errors.console.length) console.log('  console:', JSON.stringify(errors.console.slice(0, 6), null, 1));
if (errors.page.length) console.log('  page:', JSON.stringify(errors.page.slice(0, 6), null, 1));

const video = page.video();
await context.close();
if (video) {
  try { const raw = await video.path(); renameSync(raw, path.join(VIDEO_DIR, `${LABEL}.webm`)); } catch { /* best effort */ }
}
appendFileSync(path.join(VIDEO_DIR, 'segments.jsonl'), JSON.stringify({ label: LABEL, outcome, waves: lastWave, at: new Date().toISOString() }) + '\n');
