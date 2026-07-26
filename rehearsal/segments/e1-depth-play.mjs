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
import { resolveBase } from '../base-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// This driver once defaulted to 5241, which turned out to be served by
// `worktrees/lane-a` (verified with `lsof -a -p <pid> -d cwd`), i.e. ANOTHER
// lane's tree. A run against it measures somebody else's code and attributes it
// to this branch: Mistake #12 (gate contamination) wearing a play-session coat.
// The resolver now enforces that E1_BASE belongs to THIS checkout before playing.
const BASE = resolveBase('E1_BASE', { root: ROOT });
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
/** World->screen via the engine's own projection (__GR_TEST__.screenPoint).
 * Perception only: it tells the driver where a thing IS on screen, exactly as a
 * sighted player reads it.
 *
 * SIGNATURE IS (x, z, y) — Game.ts:1667 `screenPoint: (x, z, y = 0.8) =>
 * new THREE.Vector3(x, y, z).project(camera)`. Every e2e spec calls it that way
 * (e2e/run3d-interaction.spec.ts:35, e2e/e1-dry-gulch.spec.ts:66, ...).
 * The first version of this driver tried `sp(wx, 0, wz)` first — which resolves
 * to world (x=wx, y=wz, z=0), i.e. it aimed every build at the z=0 LINE, which
 * on the-claim is the RIVER (e2e/m1-05-sentry-beacon-build.spec.ts:83 teleports
 * to (-12, 0) precisely to prove the river rejects placement). It returned
 * finite numbers, so the correct 2-arg fallback was never reached: 0/49 builds.
 * That was the whole `ghostValid` defect. */
async function screenFor(x, z, y = 0) {
  return page.evaluate(([wx, wz, wy]) => {
    const sp = window.__GR_TEST__?.screenPoint;
    if (!sp) return null;
    try {
      const r = sp(wx, wz, wy);
      if (r && Number.isFinite(r.x) && Number.isFinite(r.y)) return { x: r.x, y: r.y, inView: r.inView !== false };
    } catch { /* projection unavailable */ }
    return null;
  }, [x, z, y]);
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

/** The ring a player's eye actually sweeps: hero-local world points, near first.
 * BuildSystem.ts:1391-1394 caps the ghost at placeRadius (6 m for every E1
 * buildable — Balance.ts beacon/turret/lanternPost/decoyShed placeRadius: 6), so
 * anything past ~5.5 m is wasted motion. */
function buildRing(hero, phase) {
  const spots = [];
  for (const r of [3.2, 4.8]) {
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2 + phase;
      spots.push([hero.x + Math.cos(a) * r, hero.z + Math.sin(a) * r]);
    }
  }
  return spots;
}

async function tryBuild(buildId, worldSpots) {
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
  // Slide the preview over hero-local ground until the engine stops calling it
  // red. This is the player's move, and it is also the honest terrain probe:
  // whatever the last rejection was, it was the ENGINE's rejection.
  let aim = null;
  let lastGhost = null;
  for (const [wx, wz] of worldSpots) {
    const pt = await screenFor(wx, wz, 0);
    if (!pt || !pt.inView) continue;
    await page.mouse.move(pt.x, pt.y);
    await wait(70);
    const g = await page.evaluate(() => {
      const b = window.__THREE_GAME_DIAGNOSTICS__?.build;
      return b ? { valid: b.ghostValid === true, x: b.ghostPos?.x, z: b.ghostPos?.z } : null;
    });
    if (g) lastGhost = g;
    if (g?.valid) { aim = pt; break; }
  }
  if (!aim) {
    await leaveBuildMode();
    return { built: false, why: `no legal ghost in ${worldSpots.length} hero-local spots (last ghost ${lastGhost ? `${lastGhost.x?.toFixed(1)},${lastGhost.z?.toFixed(1)}` : 'n/a'})`, ...before };
  }
  // Enter places. (e2e/m1-05-sentry-beacon-build.spec.ts:42,53 and
  // e2e/m2-01-build-menu.spec.ts:87 — 'Space' does nothing here; the first
  // driver pressed Space, so even a legal ghost would never have been placed.)
  await page.keyboard.press('Enter');
  await wait(200);
  const midCount = await page.evaluate((id) => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables?.find((x) => x.id === id)?.count ?? -1, buildId);
  if (midCount <= before.count) { await page.mouse.click(aim.x, aim.y); await wait(220); }
  const after = await page.evaluate((id) => {
    const b = window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables?.find((x) => x.id === id);
    return { count: b?.count ?? -1, gold: window.__THREE_GAME_DIAGNOSTICS__?.ui?.gold ?? 0, buildMode: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMode ?? false };
  }, buildId);
  if (after.buildMode) await leaveBuildMode();
  return { built: after.count > before.count, before: before.count, after: after.count, goldBefore: before.gold, goldAfter: after.gold, at: lastGhost };
}

/** ESCAPE IS THE PAUSE KEY. `Hud.ts:194` — the pause button carries
 * aria-keyshortcuts="P Escape". The first leg-2 driver pressed Escape after every
 * failed build to leave build mode; when build mode was already closed that
 * PAUSED THE GAME, and the Baron run then sat frozen at wave 4 for three minutes
 * looking exactly like a hang. Leave build mode by toggling KeyB, and only ever
 * press Escape when the diagnostics say build mode is genuinely open. */
async function leaveBuildMode() {
  for (let i = 0; i < 3; i += 1) {
    const state = await page.evaluate(() => ({
      build: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMode ?? false,
      paused: window.__THREE_GAME_DIAGNOSTICS__?.ui?.paused ?? false,
    }));
    if (!state.build && !state.paused) return;
    await page.keyboard.press(state.paused ? 'KeyP' : 'KeyB');
    await wait(120);
  }
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
const zoneTicks = {};       // where the hero actually stood, per wave
let seamTarget = null;      // the seam we are committed to (see the pan branch)
let seamStuck = 0;
let seamLastDist = Infinity;
let pauseRecoveries = 0;   // stray-Escape pauses the driver had to undo
let waveStart = Date.now();
let peakEnemies = 0;
let sawRush = false;
const fpsSamples = [];
const deadline = Date.now() + BUDGET_MIN * 60_000;

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
      paused: u.paused ?? false, buildMode: u.buildMode ?? false,
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
      // WHERE THE PLAYER IS STANDING, in the engine's own words (Game.ts:4363).
      // 'bank' | 'shallows' | 'river' | 'ford' | 'out'. This is the single most
      // telling gap-hunting datum on a river map: deep water disarms the hero
      // (Game.ts:6536) and bandits don't swim, so time spent in 'river' is time
      // spent neither fighting nor being fought.
      zone: g.terrain?.playerZone ?? null,
    };
  });
  if (!d) { outcome = 'diagnostics-lost'; break; }

  // 1. Level-up: take a REAL pick from the REAL offer, with the preference a
  //    competent Trail player has: this hero fights with the AUTO-AIMED rig, so
  //    rig damage/rate/volley first, then survivability, then economy; the two
  //    blast upgrades last because the Blast is cursor-aimed and this driver
  //    cannot aim it. Offer AND pick are logged every time, so a dominant
  //    strategy shows up as a pattern in the telemetry rather than being
  //    manufactured by the driver taking slot 1 forever.
  // 0. PAUSE GUARD. A paused sim reads exactly like a hung game: waves stop,
  //    telemetry freezes, the driver keeps politely trying. Never let that be
  //    mistaken for a map finding (§4 of the review).
  if (d.paused) {
    pauseRecoveries += 1;
    await page.keyboard.press('KeyP');
    await wait(200);
    continue;
  }

  if (d.upgradeOpen) {
    const PREF = ['heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator',
      'tinkers_plating', 'prospectors_luck', 'pan_legend', 'beacon_dynamo', 'spring_heels'];
    const offer = Array.isArray(d.offer) ? d.offer.map((o) => (typeof o === 'string' ? o : o?.id)) : [];
    let ix = 0;
    for (const want of PREF) { const at = offer.indexOf(want); if (at >= 0) { ix = at; break; } }
    upgradesTaken.push({ wave: d.wave, level: d.level, offer, took: offer[ix] ?? null });
    await page.keyboard.press(`Digit${ix + 1}`);
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
    if (lastWave >= 0) {
      const row = perWave[perWave.length - 1];
      if (row) row.zones = { ...zoneTicks };
    }
    waveStart = Date.now(); peakEnemies = 0; idleTicks = 0; liveTicks = 0;
    for (const k of Object.keys(zoneTicks)) delete zoneTicks[k];
    perWave.push({
      wave: d.wave, hpIn: Math.round(d.hp), maxHp: d.maxHp, goldIn: d.gold, level: d.level,
      panned: d.panned, sluiced: d.sluiced, seamsUp: (d.seams ?? []).length,
      // WHERE the wave was fought. Without this a frozen hp column is unreadable:
      // you cannot tell a safe pocket from a driver stuck against impassable water.
      at: d.heroPos ? { x: +d.heroPos.x.toFixed(1), z: +d.heroPos.z.toFixed(1) } : null,
      seamAt: (d.seams ?? []).map((s) => `${s.x.toFixed(0)},${s.z.toFixed(0)}`).join(' | '),
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
  if (d.zone) zoneTicks[d.zone] = (zoneTicks[d.zone] ?? 0) + 1;
  const affordable = d.buildables.filter((b) => b.afford && b.count < b.max);
  const seamsOpen = (d.seams ?? []).length > 0;
  if (!affordable.length && !seamsOpen) idleTicks += 1;

  // 5. Build when we can — defence first, then economy. (Honest: real gold.)
  const turret = affordable.find((b) => b.id === 'turret' || b.id === 'sentry_beacon');
  const sluice = affordable.find((b) => b.id === 'sluice');
  const anyBuild = turret ?? sluice ?? affordable[0];
  if (anyBuild && tick % 6 === 0) {
    // BuildSystem.ts:1391-1394 — the ghost must lie within placeRadius OF THE
    // HERO. So a build is always hero-local: sweep the ring, rotated each time
    // so repeated builds fan out instead of stacking on one arc.
    const heroNow = d.heroPos ?? { x: 0, z: 0 };
    spotIx += 1;
    const r = await tryBuild(anyBuild.id, buildRing(heroNow, spotIx * 0.7));
    buildLog.push({ wave: d.wave, id: anyBuild.id, ...r });
    if (r.built) console.log(`[${LABEL}]   built ${anyBuild.id} (gold ${r.goldBefore}->${r.goldAfter})`);
    else if (buildLog.filter((b) => !b.built).length <= 4) console.log(`[${LABEL}]   build ${anyBuild.id} FAILED: ${r.why ?? `count ${r.before}->${r.after}`}`);
  }

  // 6. NEVER IDLE — THE REAL LOOP a competent Trail player runs.
  //    The numbers this policy is built on (all read from Balance.ts):
  //      Spark Rig  dmg 12, fireRate 2/s, range 10, AUTO-AIMED  -> ~0.66 kills/s
  //      enemy      hp 25.2, contact 8 dmg / 0.8 s, speed 2.7 (hero 6.0)
  //      seam       tickGold 5 / 1.5 s, capacity 30, channelRange 1.6
  //    So: one rig cannot out-kill a wave — the map is WON WITH GOLD, and gold
  //    is won by STANDING STILL on a seam while the rig works. A driver that
  //    flees whenever anything is near (the first version: 246 kite ticks of
  //    311, 20 gold in six waves) is not playing this game, it is avoiding it.
  //    Kite only when the contact rate would actually kill: badly hurt, or a
  //    real crowd inside contact range.
  const hero = d.heroPos ?? { x: 0, z: 0 };
  const foes = d.foes ?? [];
  const ranked = foes
    .map((f) => ({ ...f, dist: Math.hypot(f.x - hero.x, f.z - hero.z) }))
    .sort((a, b) => a.dist - b.dist);
  const near = ranked[0] ?? null;
  const crowd = ranked.filter((f) => f.dist < 2.8).length;
  const hpFrac = d.hp / Math.max(1, d.maxHp);
  // Kiting is TIME-BOXED: a real player breaks contact, then goes back to work.
  // Unbounded fleeing is a driver degeneracy (it stalemates), not play.
  const kiteBudgetLeft = consecutiveKite < 6;
  const pressed = near && kiteBudgetLeft && (crowd >= 3 || (hpFrac < 0.45 && near.dist < 6));

  consecutiveKite = pressed ? consecutiveKite + 1 : 0;
  if (pressed) {
    // Break contact directly away from the pressure (mean of the crowd, not the
    // single nearest — otherwise you sidestep one enemy into four).
    const mass = ranked.slice(0, Math.max(1, crowd));
    const cx = mass.reduce((s, f) => s + f.x, 0) / mass.length;
    const cz = mass.reduce((s, f) => s + f.z, 0) / mass.length;
    const ax = hero.x - cx, az = hero.z - cz;
    const key = Math.abs(ax) > Math.abs(az) ? (ax > 0 ? 'KeyD' : 'KeyA') : (az > 0 ? 'KeyS' : 'KeyW');
    await hold(page, key, 240);
    kiteTicks += 1;
  } else if (seamsOpen) {
    // COMMIT TO ONE SEAM until it is worked out or proves unreachable.
    // Re-picking "nearest" every tick is a driver degeneracy, not play: with two
    // seams roughly equidistant the hero ping-pongs between them forever. In the
    // first leg-2 runs that cost 688 of 784 ticks walking and 22 panning, and it
    // pinned every map at exactly 90 gold (3 seams x capacity 30) — a DRIVER
    // ceiling that would have been misread as a map economy ceiling.
    const seams = d.seams.map((s) => ({ ...s, dist: Math.hypot(s.x - hero.x, s.z - hero.z) }));
    let target = seamTarget && seams.find((s) => s.id === seamTarget);
    if (target && (seamStuck > 14 || target.remaining <= 0)) { target = null; seamTarget = null; }
    if (!target) {
      target = seams.sort((a, b) => a.dist - b.dist)[0];
      seamTarget = target.id; seamStuck = 0; seamLastDist = target.dist;
    }
    if (target.dist > 1.3) {
      // no progress this tick => count it; a seam across impassable water is a
      // seam a player would give up on (this driver has no pathfinding).
      if (target.dist > seamLastDist - 0.25) seamStuck += 1; else seamStuck = 0;
      seamLastDist = target.dist;
      await moveToward(target.x, target.z, 200);
    } else { seamStuck = 0; await wait(420); panTicks += 1; }   // stand still => channel
  } else {
    await hold(page, ['KeyD', 'KeyS', 'KeyA', 'KeyW'][tick % 4], 200);
  }
  // Weapon: stay on the auto-aimed rig. The Blast is cursor-aimed
  // (Balance.blast.aimMode: 'cursor') and this driver's cursor is parked
  // wherever the last build ghost was — toggling to it would be a driver
  // handicap, not play. Toggled once early so the arsenal root is exercised.
  if (tick === 40) await page.keyboard.press('KeyQ'), await wait(120), await page.keyboard.press('KeyQ');
  fpsSamples.push({ t: Date.now(), frame: d.frame });
  tick += 1;
  await wait(90);
}

const finalRow = perWave[perWave.length - 1];
if (finalRow) { finalRow.wallSeconds = Math.round((Date.now() - waveStart) / 1000); finalRow.peakEnemies = peakEnemies; finalRow.idleFrac = liveTicks ? +(idleTicks / liveTicks).toFixed(2) : null; finalRow.zones = { ...zoneTicks }; }

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
  label: LABEL, contract: CONTRACT, base: BASE, url, timescale: TIMESCALE, viewport: VIEWPORT,
  difficulty: boot.difficulty, secureWave: boot.secureWave, startGold: boot.startGold,
  firstRun, boot, outcome, wallSeconds: Math.round((Date.now() - startedAt) / 1000),
  wavesReached: lastWave, sawRush, fpsEstimate: fps,
  driver: { ticks: tick, kiteTicks, panTicks, pauseRecoveries },
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
