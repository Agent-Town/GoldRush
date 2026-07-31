// THE STANDING-ORDERS REHEARSAL, ROUND 2 — loop harness (TASK.md 2026-07-31).
//
// THE HONEST-PLAY GATE, enforced in code below (unchanged from round 1, absolute):
//   * no ?debug, no ?timescale, no ?preset — every boot is a plain "/" and every contract is
//     launched from the town board, so window.__GR_TEST__ never exists (asserted each tick);
//   * difficulty is chosen through the real Settings UI and asserted from diagnostics;
//   * fresh profile per campaign (a brand-new browser profile directory AND a new game ledger);
//   * the permission rung is EARNED by securing claims and read back from the game, never set.
//
// ROUND 2'S OWN LAW: every agent verb goes through the SHIPPED surface. This harness constructs
// no ToolSurface and implements no game verb (see r2-shipped.mjs for how the shipped object is
// obtained and why a handle has to be obtained at all). The only place a mouse touches the build
// menu is the BANK runs, where the rung is still 0 and no order is submittable at all — that is a
// player buying a turret with a mouse, which is what a player does.
//
// Modes:
//   probe                    shakedown: the road, the capture, the ladder, THE VIEW, a trap order
//   bank  <count>            play the-claim to earn agent-track rungs (no rider calls)
//   play  <contract> [cad]   the metered rehearsal: the rider commands at wave boundaries
//
// Rider handoff is file-based (the command clock is an LLM in another process):
//   rehearsal/so-runs/<campaign>/<contract>/view-<seq>.json    written by the harness
//   rehearsal/so-runs/<campaign>/<contract>/orders-<seq>.json  written by the rider

import { chromium } from 'playwright';
import { mkdirSync, renameSync, appendFileSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CAPTURE_SCRIPT, SNAPSHOT_FN, SURFACE_PROVENANCE_FN, VIEW_FN } from './r2-shipped.mjs';
import {
  newPilotState, applyKeys, releaseAll, decideMovement, handleLevelUp, observe, keysFor,
  nextBuildOrder, costOf, dist, MAX_COUNT,
} from './r2-pilot.mjs';
// Player-side building with a real mouse — BANK RUNS ONLY (rung 0, nothing is submittable).
import { calibrate, screenFor, armBuildMenu } from './standing-orders-pilot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SO2_BASE ?? 'http://127.0.0.1:5290';
const CAMPAIGN = process.env.SO2_CAMPAIGN ?? 'r2a';
const PROFILE_NAME = process.env.SO2_PROFILE ?? 'Rider';
const TOWN_NAME = process.env.SO2_TOWN ?? 'Rider Creek';
const DIFFICULTY = process.env.SO2_DIFFICULTY ?? 'trail';
const PROFILE_DIR = path.join(ROOT, `rehearsal-profile-${CAMPAIGN}`);
const VIDEO_DIR = path.join(ROOT, 'rehearsal-video');
const VIDEO_TMP = path.join(VIDEO_DIR, `.tmp-${CAMPAIGN}`);
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-standing-orders-r2');
const RUN_ROOT = path.join(ROOT, 'rehearsal', 'so-runs', CAMPAIGN);
const VIDEO_LOG = path.join(VIDEO_DIR, 'standing-orders-r2-segments.jsonl');

const TICK_MS = 130;
const ORDER_POLL_MS = 1400;
const RIDER_WAIT_MS = Number(process.env.SO2_RIDER_WAIT ?? 420_000);

const say = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

// ------------------------------------------------------------------ browser

async function openSession(name) {
  mkdirSync(VIDEO_TMP, { recursive: true });
  mkdirSync(SHOT_DIR, { recursive: true });
  mkdirSync(RUN_ROOT, { recursive: true });
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: VIDEO_TMP, size: { width: 1280, height: 720 } },
  });
  await context.addInitScript({ content: CAPTURE_SCRIPT });
  const page = context.pages()[0] ?? (await context.newPage());
  page.on('dialog', (d) => d.accept().catch(() => {}));
  const errors = { console: [], page: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() !== 'error') return;
    if (t.includes('127.0.0.1:5290') && t.includes('net::')) return;
    errors.console.push(t);
  });
  page.on('pageerror', (e) => errors.page.push(e.message));
  const startedAt = Date.now();
  await page.goto(BASE + '/');
  const finish = async (note) => {
    const video = page.video();
    await context.close();
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    let file = null;
    if (video) {
      const raw = await video.path();
      file = path.join(VIDEO_DIR, `${name}.webm`);
      renameSync(raw, file);
    }
    appendFileSync(VIDEO_LOG, JSON.stringify({ segment: name, seconds, file: file ? path.basename(file) : null, note, at: new Date().toISOString() }) + '\n');
    say(`segment ${name}: ${seconds}s  consoleErrors=${errors.console.length} pageErrors=${errors.page.length}`);
    if (errors.console.length) say('  console:', JSON.stringify(errors.console.slice(0, 6)));
    if (errors.page.length) say('  page:', JSON.stringify(errors.page.slice(0, 6)));
    return { seconds, file, errors };
  };
  return { context, page, errors, finish };
}

async function visible(page, id) {
  const l = page.getByTestId(id);
  if ((await l.count()) === 0) return false;
  return l.first().isVisible().catch(() => false);
}

const townFrames = (page) => page.evaluate(() => (window.__GR_TOWN_DIAGNOSTICS__ || {}).frame ?? -1);
const gameFrames = (page) => page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ || {}).frame ?? -1);

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

// ------------------------------------------------------------------ the honest road to a contract

/** The road, measured rather than assumed (a first pass set no difficulty at all and the honesty
 *  gate caught it): a fresh browser profile boots to the FIRST-LEDGER create form — the start menu
 *  exists behind it but its buttons are covered — and submitting that form drops you STRAIGHT INTO
 *  TOWN. There is no start menu on the way. So the only legal route to the difficulty select is:
 *  name the town, walk back out through `town-exit` to the start menu, Profile -> the select ->
 *  Done, then Enter Town again. The preset is a per-profile datum (ProfileStorage's
 *  PROFILE_DATA_KEYS), which is also why campaign B has to earn its own rung from zero. No ?preset. */
async function toTown(page, { profileName, townName, difficulty }) {
  let difficultyDone = difficulty === 'trail';
  let exits = 0;
  for (let i = 0; i < 140; i += 1) {
    if (!difficultyDone && (await visible(page, 'profile-difficulty'))) {
      const select = page.getByTestId('profile-difficulty').first();
      await select.selectOption(difficulty);
      await page.waitForTimeout(400);
      const chosen = await select.inputValue();
      if (chosen !== difficulty) throw new Error(`difficulty select refused ${difficulty} (shows ${chosen})`);
      const back = page.getByTestId('profile-back');
      if ((await back.count()) > 0) await back.first().click();
      else await page.getByTestId('profile-start').first().click();
      await page.waitForTimeout(1000);
      difficultyDone = true;
      say(`  difficulty set through the Profiles UI: ${difficulty}`);
      continue;
    }
    if ((await townFrames(page)) > 10) {
      const nameInput = page.getByTestId('town-name-input');
      if ((await visible(page, 'town-name-input')) && (await nameInput.first().isEnabled())) {
        await nameInput.first().fill(townName);
        await page.getByTestId('town-name-submit').click();
        await page.waitForTimeout(1800);
        continue;
      }
      if (!difficultyDone) {
        if (exits > 4) throw new Error('could not reach the Profiles screen from town');
        exits += 1;
        await dismissBeats(page);
        await page.getByTestId('town-exit').click({ force: true }).catch(() => {});
        await page.waitForTimeout(1400);
        continue;
      }
      return true;
    }
    // The first-ledger form has no difficulty select; the profiles LIST form does. Only the first
    // one should ever be filled, or the campaign quietly grows a second ledger.
    if ((await visible(page, 'profile-create-form')) && !(await visible(page, 'profile-difficulty'))) {
      await page.getByTestId('profile-name-input').first().fill(profileName);
      await page.getByTestId('profile-create').click();
      await page.waitForTimeout(1200);
      continue;
    }
    if (!difficultyDone && (await visible(page, 'start-menu-profile'))) {
      await page.getByTestId('start-menu-profile').click();
      await page.waitForTimeout(900);
      continue;
    }
    if (await visible(page, 'start-menu-enter-town')) {
      await page.getByTestId('start-menu-enter-town').click();
      await page.waitForTimeout(1200);
      continue;
    }
    if (await visible(page, 'story-beat-card')) {
      await page.mouse.click(6, 6);
      await page.waitForTimeout(250);
      continue;
    }
    await page.waitForTimeout(400);
  }
  throw new Error('never reached town');
}

async function dismissBeats(page) {
  for (let i = 0; i < 20; i += 1) {
    if (!(await visible(page, 'story-beat-card'))) return;
    await page.mouse.click(6, 6);
    await page.waitForTimeout(220);
  }
}

async function openBoard(page) {
  await dismissBeats(page);
  if (await visible(page, 'contract-board')) return true;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await hold(page, 'KeyA', 850);
    await hold(page, 'KeyW', 850);
    await page.waitForTimeout(250);
    const prompt = await page.evaluate(() => (window.__GR_TOWN_DIAGNOSTICS__ || {}).activePrompt ?? null);
    if (prompt === 'tavern') {
      await page.getByTestId('town-open-board').click();
      await page.waitForTimeout(700);
      if (await visible(page, 'contract-board')) return true;
    }
    await hold(page, 'KeyD', 400);
    await hold(page, 'KeyS', 400);
  }
  throw new Error('could not open the contract board');
}

async function launchContract(page, contractId) {
  await openBoard(page);
  const launch = page.getByTestId(`contract-launch-${contractId}`);
  if ((await launch.count()) === 0) {
    const cards = await page.locator('[data-testid^="contract-card-"]').evaluateAll((els) =>
      els.map((e) => ({ id: e.getAttribute('data-contract-id'), locked: e.getAttribute('data-contract-locked') })));
    throw new Error(`no launch button for ${contractId}; board shows ${JSON.stringify(cards)}`);
  }
  if (await launch.first().isDisabled()) throw new Error(`${contractId} is LOCKED on the board — earn its unlock first`);
  await launch.first().click();
  for (let i = 0; i < 120; i += 1) {
    if ((await gameFrames(page)) > 10) break;
    await page.waitForTimeout(400);
  }
  if ((await gameFrames(page)) <= 10) throw new Error('contract never booted');
  for (let i = 0; i < 12; i += 1) {
    if (await visible(page, 'contract-briefing-dismiss')) {
      await page.getByTestId('contract-briefing-dismiss').click();
      await page.waitForTimeout(300);
      break;
    }
    await page.waitForTimeout(250);
  }
  await dismissBeats(page);
  // the surface is built during Game.beginRun; give the capture hook a beat to see it
  for (let i = 0; i < 40; i += 1) {
    if (await page.evaluate(() => !!window.__R2_SURFACE__)) break;
    await page.waitForTimeout(200);
  }
  const boot = await page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__ || {};
    return {
      contract: d.contract ? d.contract.activeId : null,
      fallbackReason: d.contract ? d.contract.fallbackReason ?? null : null,
      secureWave: d.contract ? d.contract.secureWave : null,
      difficulty: d.difficultyPreset || null,
      hasGrTest: typeof window.__GR_TEST__ !== 'undefined',
      hasGrAgent: typeof window.__GR_AGENT__ !== 'undefined',
      search: window.location.search,
      meta: (() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } })(),
    };
  });
  boot.surface = await page.evaluate(SURFACE_PROVENANCE_FN);
  return boot;
}

function assertHonest(boot, contractId) {
  if (boot.hasGrTest) throw new Error('HONESTY GATE: __GR_TEST__ exists — a debug param leaked in');
  if (boot.hasGrAgent) throw new Error('HONESTY GATE: __GR_AGENT__ exists — ?debug leaked in');
  if (boot.difficulty !== DIFFICULTY) throw new Error(`HONESTY GATE: difficulty is ${boot.difficulty}, expected ${DIFFICULTY}`);
  if (contractId && boot.contract !== contractId) throw new Error(`contract fell back to ${boot.contract} (${boot.fallbackReason})`);
  if (!boot.surface?.captured) throw new Error('SHIPPED-PIPELINE GATE: no production surface was captured');
  if (boot.surface.surfacePermissionLevel !== boot.surface.diagnosticsPermissionLevel) {
    throw new Error(`SHIPPED-PIPELINE GATE: surface rung ${boot.surface.surfacePermissionLevel} != game rung ${boot.surface.diagnosticsPermissionLevel}`);
  }
}

// ------------------------------------------------------------------ end-of-run handling

async function backToTown(page, secured) {
  const pilot = newPilotState();
  await releaseAll(page, pilot);
  if (secured) {
    for (let i = 0; i < 40; i += 1) {
      if (await visible(page, 'bank-secured-claim')) {
        await page.getByTestId('bank-secured-claim').click({ force: true }).catch(() => {});
        await page.waitForTimeout(700);
        break;
      }
      await page.waitForTimeout(300);
    }
  }
  for (let i = 0; i < 30; i += 1) {
    if (await visible(page, 'research-card-0')) {
      await page.getByTestId('research-card-0').click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    if (await visible(page, 'stake-again')) break;
    await page.waitForTimeout(250);
  }
  for (let i = 0; i < 50; i += 1) {
    const btn = page.getByTestId('stake-again');
    if ((await btn.count()) > 0) {
      const label = (await btn.first().textContent()) ?? '';
      if (!secured || /town/i.test(label)) {
        await btn.first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(1200);
        break;
      }
    }
    await page.waitForTimeout(300);
  }
  for (let i = 0; i < 60; i += 1) {
    if ((await townFrames(page)) > 10) return true;
    if (await visible(page, 'start-menu-enter-town')) {
      await page.getByTestId('start-menu-enter-town').click();
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(400);
  }
  return false;
}

// ------------------------------------------------------------------ BANK runs: a player with a mouse

// Signal Turrets are ~2.3x the damage per gold of Sentry Beacons, so the house saves for turrets
// first and only spends on beacons once the turret bench is full or the purse is deep.
const HOUSE_PLAN = [
  { def: 'turret', max: 4, hold: 0 },
  { def: 'sentry_beacon', max: 6, hold: 60 },
];

async function houseBuild(page, pilot, s, box) {
  const counts = { turret: s.build.turrets, sentry_beacon: s.build.beacons };
  for (const step of HOUSE_PLAN) {
    if ((counts[step.def] ?? 0) >= step.max) continue;
    const spare = counts.turret >= 4 ? 0 : step.hold;
    if (s.gold < costOf(step.def, s) + spare) continue;
    const armed = await armBuildMenu(page, step.def);
    if (!armed.mode || armed.sel !== step.def) return { ok: false, why: 'menu', def: step.def };
    const j = await calibrate(page, box);
    if (!j) return { ok: false, why: 'calibration', def: step.def };
    const hero = s.hero ?? { x: 0, z: 0 };
    const middle = { x: 0, z: 3 };
    const ring = [];
    for (let r = 2; r <= 5; r += 1) {
      for (let a = 0; a < 8; a += 1) {
        ring.push({ x: Math.round(hero.x + Math.cos((a * Math.PI) / 4) * r), z: Math.round(hero.z + Math.sin((a * Math.PI) / 4) * r) });
      }
    }
    ring.sort((a, b) => dist(a, middle) - dist(b, middle));
    for (const target of ring) {
      const aim = screenFor(j, target);
      if (!Number.isFinite(aim.px) || aim.px < box.x + 8 || aim.px > box.x + box.width - 8) continue;
      if (!Number.isFinite(aim.py) || aim.py < box.y + 8 || aim.py > box.y + box.height - 8) continue;
      await page.mouse.move(aim.px, aim.py);
      await page.waitForTimeout(80);
      const g = await page.evaluate(() => {
        const b = (window.__THREE_GAME_DIAGNOSTICS__ || {}).build || {};
        return { pos: b.ghostPos || null, valid: b.ghostValid === true };
      });
      if (!g.valid) continue;
      await page.mouse.click(aim.px, aim.py); // a real click, exactly as a player places
      await page.waitForTimeout(150);
      const after = await page.evaluate((def) => {
        const b = (window.__THREE_GAME_DIAGNOSTICS__ || {}).build || {};
        return def === 'turret' ? b.turrets : b.beacons;
      }, step.def);
      return { ok: (after ?? 0) > (counts[step.def] ?? 0), def: step.def, world: g.pos };
    }
    return { ok: false, why: 'no-valid-cell', def: step.def };
  }
  return null;
}

// ------------------------------------------------------------------ the rider handoff

function riderFiles(dir, seq) {
  const n = String(seq).padStart(2, '0');
  return { view: path.join(dir, `view-${n}.json`), orders: path.join(dir, `orders-${n}.json`) };
}

async function pollOrders(page) {
  const r = await page.evaluate(() => {
    const s = window.__R2_SURFACE__;
    if (!s) return null;
    const t0 = performance.now();
    const receipt = s.tools.view();
    const ms = performance.now() - t0;
    window.__R2_ORDERS__ = receipt.outcome.result;
    return { orders: receipt.outcome.result, buildMs: Math.round(ms * 100) / 100 };
  });
  return r;
}

// ------------------------------------------------------------------ the run loop

async function runContract(page, opts) {
  const { contractId, mode, dir, cadence = 1, maxSeconds = 2400, houseBuilds, campaignLog } = opts;
  const pilot = newPilotState();
  const box = (await page.locator('#game-canvas').boundingBox()) ?? { x: 0, y: 0, width: 1280, height: 720 };
  const meter = {
    calls: 0, viewBytes: [], cumulativeBytes: 0, latencies: [], submissions: [], missed: 0,
    pollCount: 0, pollMsTotal: 0, pollMsMax: 0,
  };
  const almanacLog = [];
  const waveLog = [];
  const orderEvents = [];   // every status transition the SHIPPED executor published
  const rangeGuard = [];    // BUILDs whose condition was met while the hero stood out of range
  let seq = 0;
  let lastWave = -1;
  let lastCallWave = -99;
  let lastSurpriseCall = -1e9;
  let lastHouseBuild = -1e9;
  let lastPoll = 0;
  let lastLoggedSeq = 0;
  const seenStatus = new Map();
  const preFire = new Map();   // orderId -> the last reflex-rate sample taken while it was pending
  const started = Date.now();
  let outcome = 'running';
  let lastSnapshot = null;
  const honesty = { grTestSeen: false, grAgentSeen: false, searchSeen: new Set(), surfaceSeq: null };

  const keepPlaying = async (ms) => {
    const until = Date.now() + ms;
    while (Date.now() < until) {
      await tickOnce();
      if (outcome !== 'running') return false;
      await page.waitForTimeout(TICK_MS);
    }
    return outcome === 'running';
  };

  async function refreshOrders(s) {
    const r = await pollOrders(page);
    if (!r) return;
    meter.pollCount += 1;
    meter.pollMsTotal += r.buildMs;
    meter.pollMsMax = Math.max(meter.pollMsMax, r.buildMs);
    for (const rec of r.orders.orders ?? []) {
      const key = `${rec.id}:${rec.status}:${rec.reason ?? ''}`;
      if (seenStatus.has(key)) continue;
      seenStatus.set(key, true);
      orderEvents.push({
        at: s?.t ?? null, wave: s?.wave ?? null, id: rec.id, verb: rec.order.verb,
        what: rec.order.what ?? rec.order.seam ?? rec.order.sluice ?? null,
        where: rec.order.where ?? rec.order.pos ?? null, when: rec.order.when ?? null,
        status: rec.status, reason: rec.reason ?? null,
        gold: s?.gold ?? null, works: s ? { t: s.build.turrets, b: s.build.beacons, p: s.build.palisades } : null,
        heroToCell: s?.hero && rec.order.where ? Number(dist(s.hero, rec.order.where).toFixed(2)) : null,
        // The executor's own reason is the same six words for every rejection ("FAILED: BUILD
        // action was rejected."), so the state at the LAST TICK BEFORE the fire is the only way to
        // say which of gold / range / ground / cap actually killed it. Sampled at reflex rate.
        preFire: preFire.get(rec.id) ?? null,
        buildReason: s?.build?.reason ?? null,
      });
    }
    for (const ev of r.orders.log ?? []) {
      if (ev.seq <= lastLoggedSeq) continue;
      lastLoggedSeq = ev.seq;
      if (ev.type === 'surprise') {
        orderEvents.push({ at: s?.t ?? null, wave: s?.wave ?? null, id: ev.orderId ?? null, surprise: ev.surprise, reason: ev.reason ?? null });
      }
    }
  }

  async function tickOnce() {
    const s = await page.evaluate(SNAPSHOT_FN);
    lastSnapshot = s;
    if (s.hasGrTest) honesty.grTestSeen = true;
    if (s.hasGrAgent) honesty.grAgentSeen = true;
    honesty.searchSeen.add(s.search);
    observe(pilot, s);
    if (s.runState === 'levelup') {
      const took = await handleLevelUp(page, pilot, s.maxHp > 0 ? s.hp / s.maxHp : 1);
      if (took) say(`  level-up: took ${took}`);
      return s;
    }
    if (s.secured) { outcome = 'secured'; return s; }
    if (s.runState === 'dead') { outcome = 'dead'; return s; }

    if (mode !== 'bank' && Date.now() - lastPoll > ORDER_POLL_MS) {
      lastPoll = Date.now();
      await refreshOrders(s);
    }

    // THE RANGE GUARD, recorded not fixed: an order whose condition is already true while the hero
    // is outside placeRadius is one tick from dying, and there is nothing the reflex layer can do
    // about it — the executor fires on the next sim tick and never tries again.
    for (const o of s.orders) {
      if (o.verb !== 'BUILD' || (o.status !== 'pending' && o.status !== 'active') || !s.hero) continue;
      preFire.set(o.id, {
        t: Number(s.t.toFixed(2)), wave: s.wave, gold: s.gold,
        heroToCell: Number(dist(s.hero, o.order.where).toFixed(2)),
        cost: costOf(o.order.what, s), runState: s.runState,
        count: s.build[{ turret: 'turrets', sentry_beacon: 'beacons', palisade: 'palisades', sluice: 'sluices' }[o.order.what] ?? 'turrets'] ?? null,
      });
    }
    const nb = nextBuildOrder(s);
    if (nb && s.hero) {
      const d = dist(s.hero, nb.order.where);
      const met = nb.order.when?.goldGte !== undefined ? s.gold >= nb.order.when.goldGte : s.wave >= (nb.order.when?.waveGte ?? 0);
      if (met && d > 6) rangeGuard.push({ at: s.t, wave: s.wave, id: nb.id, def: nb.order.what, distance: Number(d.toFixed(2)), gold: s.gold });
    }

    if (houseBuilds && s.t - lastHouseBuild > 3 && !pilot.underFire) {
      const r = await houseBuild(page, pilot, s, box);
      if (r) {
        lastHouseBuild = s.t;
        if (r.ok) say(`  house build: ${r.def} at ${JSON.stringify(r.world)}`);
      }
    }

    const decision = decideMovement(s, pilot);
    let steer = keysFor(s.hero, decision.target);
    // THE PARALYSED-DRIVER WATCHDOG (rig defect R1, 2026-07-22; reproduced twice in round 1). A
    // movement controller that does not measure its own speed is lying to you.
    if (steer.size > 0 && s.speed < 0.08) {
      if (pilot.stallSince === null || pilot.stallSince === undefined) pilot.stallSince = s.t;
      else if (s.t - pilot.stallSince > 0.8) {
        pilot.detourUntil = s.t + 1.6;
        pilot.detourSign = (pilot.detourSign ?? 1) * -1;
        pilot.stallHeals = (pilot.stallHeals ?? 0) + 1;
        pilot.stallSince = null;
        await releaseAll(page, pilot);
        if (pilot.stallHeals <= 3 || pilot.stallHeals % 25 === 0) {
          say(`  watchdog: hero pinned with keys held — sliding (#${pilot.stallHeals})`);
        }
      }
    } else {
      pilot.stallSince = null;
    }
    if (pilot.detourUntil && s.t < pilot.detourUntil && s.hero) {
      const dx = decision.target.x - s.hero.x;
      const dz = decision.target.z - s.hero.z;
      const len = Math.hypot(dx, dz) || 1;
      steer = keysFor(s.hero, {
        x: s.hero.x + (-dz / len) * 4 * pilot.detourSign,
        z: s.hero.z + (dx / len) * 4 * pilot.detourSign,
      });
    }
    await applyKeys(page, pilot, steer);
    return s;
  }

  async function callRider(s, trigger) {
    const payload = await page.evaluate(VIEW_FN);
    const view = payload.view ?? null;
    const orders = payload.orders ?? null;
    const bytes = view ? JSON.stringify(view).length : 0;
    meter.calls += 1;
    meter.viewBytes.push(bytes);
    meter.cumulativeBytes += bytes;
    almanacLog.push({ seq, wave: s.wave, at: s.t, almanac: view?.almanac ?? null, works: s.build, gold: s.gold, hp: s.hp });
    const files = riderFiles(dir, seq);
    writeFileSync(files.view, JSON.stringify({
      seq,
      calledAt: new Date().toISOString(),
      trigger,
      runSeconds: s.t,
      wave: s.wave,
      permissionRung: s.perm,
      meter: { calls: meter.calls, viewBytes: bytes, cumulativeViewBytes: meter.cumulativeBytes, viewBuildMs: payload.buildMs },
      pilotReport: pilotReport(s, pilot),
      ordersSnapshot: orders,
      view,
    }, null, 1));
    say(`RIDER CALL ${seq} (wave ${s.wave}, t=${s.t.toFixed(1)}s, rung ${s.perm}, view ${bytes}B in ${payload.buildMs}ms) -> ${path.basename(files.view)}`);
    return files;
  }

  async function awaitRiderOrders(files) {
    const start = Date.now();
    while (Date.now() - start < RIDER_WAIT_MS) {
      if (existsSync(files.orders)) {
        let parsed = null;
        try {
          parsed = JSON.parse(readFileSync(files.orders, 'utf8'));
        } catch {
          if (!(await keepPlaying(600))) return null;
          continue;
        }
        const latency = Date.now() - start;
        meter.latencies.push(latency);
        // "No change" must be sayable WITHOUT resubmitting: et.goldrush.orders REPLACES the whole
        // record set (StandingOrders.ts:126), so restating a plan resets every 'done' order back to
        // pending and buys everything twice (F-SO-7, unchanged).
        if (parsed.hold === true) {
          meter.submissions.push({ seq: parsed.seq ?? null, latencyMs: latency, orders: [], note: parsed.note ?? null, receipt: { ok: true, held: true } });
          renameSync(files.orders, files.orders.replace(/\.json$/, '.consumed.json'));
          say(`  rider answered in ${(latency / 1000).toFixed(1)}s -> HOLD (plan unchanged, nothing submitted)`);
          return meter.submissions.at(-1);
        }
        const receipt = await page.evaluate((o) => window.__R2_SURFACE__.tools.submit_orders(o), parsed.orders ?? []);
        meter.submissions.push({
          seq: parsed.seq ?? null, latencyMs: latency, orders: parsed.orders ?? [],
          note: parsed.note ?? null, receipt: receipt.outcome,
        });
        renameSync(files.orders, files.orders.replace(/\.json$/, '.consumed.json'));
        say(`  rider answered in ${(latency / 1000).toFixed(1)}s -> ${JSON.stringify(receipt.outcome).slice(0, 200)}`);
        await refreshOrders(lastSnapshot);
        return meter.submissions.at(-1);
      }
      if (!(await keepPlaying(500))) { say('  run decided while the rider was thinking'); return null; }
    }
    say('  RIDER TIMEOUT — continuing on the standing plan');
    meter.missed += 1;
    return null;
  }

  while (Date.now() - started < maxSeconds * 1000) {
    const s = await tickOnce();
    if (outcome !== 'running') break;
    honesty.surfaceSeq = await page.evaluate(() => window.__R2_SURFACE_SEQ__ ?? null);

    if (s.wave !== lastWave) {
      // seams sampled per wave: the identity question (F-SO-12) needs a time series, not a snapshot
      if (lastWave >= 0) waveLog.push({ wave: lastWave, endedAt: s.t, gold: s.gold, hp: s.hp, works: s.build.turrets + s.build.beacons, enemies: s.enemies, kills: s.kills, seams: s.seams.map((n) => ({ id: n.id, active: n.active, x: n.x, z: n.z, remaining: n.remaining })) });
      lastWave = s.wave;
    }

    if (mode === 'play') {
      const boundary = s.wave !== lastCallWave && (s.wave === 0 || s.wave - lastCallWave >= cadence);
      const surprise = s.needsRider && s.t - lastSurpriseCall > 25;
      if (seq === 0 || boundary || surprise) {
        const trigger = seq === 0 ? 'run-start' : boundary ? `wave-${s.wave}` : 'surprise';
        const files = await callRider(s, trigger);
        lastCallWave = s.wave;
        if (surprise) lastSurpriseCall = s.t;
        await awaitRiderOrders(files);
        seq += 1;
      }
    }
    await page.waitForTimeout(TICK_MS);
  }

  await releaseAll(page, pilot);
  if (mode !== 'bank') await refreshOrders(lastSnapshot);
  const final = await page.evaluate(VIEW_FN).catch(() => ({ view: null, orders: null }));
  const result = {
    contractId,
    campaign: CAMPAIGN,
    mode,
    outcome,
    difficultyRequested: DIFFICULTY,
    seconds: Math.round((Date.now() - started) / 1000),
    finalWave: lastSnapshot?.wave ?? null,
    secureWave: lastSnapshot?.secureWave ?? null,
    hp: lastSnapshot?.hp ?? null,
    gold: lastSnapshot?.gold ?? null,
    kills: lastSnapshot?.kills ?? null,
    works: lastSnapshot?.build ?? null,
    permissionRung: lastSnapshot?.perm ?? null,
    difficulty: lastSnapshot?.difficulty ?? null,
    honesty: {
      grTestSeen: honesty.grTestSeen, grAgentSeen: honesty.grAgentSeen,
      searches: [...honesty.searchSeen], surfaceSeq: honesty.surfaceSeq,
    },
    meter,
    orderEvents,
    rangeGuard,
    guardLog: pilot.guardLog,
    almanacLog,
    waveLog,
    upgrades: pilot.upgradesTaken,
    watchdogKeyResets: pilot.stallHeals ?? 0,
    damageTaken: Math.round(pilot.damageTaken ?? 0),
    finalView: final.view ?? null,
    finalOrders: final.orders ?? null,
  };
  if (campaignLog) writeFileSync(campaignLog, JSON.stringify(result, null, 1));
  return { result, pilot };
}

function pilotReport(s, pilot) {
  const live = s.seams.filter((n) => n.active);
  return {
    // THE VIEW still carries no price list, no caps and no coordinates for live seams
    // (F-SO-12/13). The reflex clock hands the command clock the numbers it cannot otherwise know.
    priceOfNext: {
      turret: costOf('turret', s), sentry_beacon: costOf('sentry_beacon', s),
      palisade: costOf('palisade', s), sluice: costOf('sluice', s),
    },
    capsRemaining: {
      turret: MAX_COUNT.turret - s.build.turrets,
      sentry_beacon: MAX_COUNT.sentry_beacon - s.build.beacons,
      sluice: MAX_COUNT.sluice - s.build.sluices,
    },
    placeRadiusFromHero: s.build.placeRadius ?? 6,
    hero: s.hero,
    prospector: s.prospector,
    heroHp: `${Math.round(s.hp)}/${Math.round(s.maxHp)}`,
    gold: s.gold,
    bankCap: s.bankCap,
    enemiesAlive: s.enemies,
    telegraphedEdge: s.edge,
    waveState: s.waveState,
    nextWaveInSeconds: Number((s.nextWaveInSim ?? 0).toFixed(1)),
    works: { turrets: s.build.turrets, beacons: s.build.beacons, sluices: s.build.sluices, palisades: s.build.palisades },
    liveSeams: live.map((n) => ({ id: n.id, x: n.x, z: n.z, remaining: n.remaining })),
    upgradesTaken: pilot.upgradesTaken.map((u) => u.took),
    standingFor: pilot.standingFor,
    reflexNote:
      'The reflex clock walks the hero (WASD), pans by standing inside a live seam, kites when hurt, ' +
      'takes level-up cards, and — because BuildSystem measures placeRadius (6wu) FROM THE HERO and each ' +
      'order gets exactly ONE attempt — walks the hero inside that circle BEFORE the trigger turns true. ' +
      'It never chooses what to build, where, or when.',
  };
}

// ------------------------------------------------------------------ modes

async function main() {
  const [mode, arg1, arg2] = process.argv.slice(2);
  mkdirSync(RUN_ROOT, { recursive: true });

  if (mode === 'probe') {
    const session = await openSession(`r2-probe-${CAMPAIGN}`);
    const { page } = session;
    const out = { campaign: CAMPAIGN, difficulty: DIFFICULTY };
    try {
      await toTown(page, { profileName: PROFILE_NAME, townName: TOWN_NAME, difficulty: DIFFICULTY });
      out.boot = await launchContract(page, arg1 ?? 'the-claim');
      say('boot: ' + JSON.stringify({ ...out.boot, surface: undefined }));
      say('surface: ' + JSON.stringify(out.boot.surface));
      assertHonest(out.boot, arg1 ?? 'the-claim');
      // 1. THE LADDER, unfaked: what does the game refuse at the rung it actually gave us?
      out.refusals = await page.evaluate(() => {
        const s = window.__R2_SURFACE__;
        return {
          hold: s.tools.submit_orders([{ verb: 'HOLD', pos: { x: 0, z: 8 } }]).outcome,
          harvest: s.tools.submit_orders([{ verb: 'HARVEST', seam: 'gold-seam-1' }]).outcome,
          build: s.tools.submit_orders([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 8 }, when: { waveGte: 1 } }]).outcome,
          panDirect: s.tools.pan_at('gold-seam-1').outcome,
          placeDirect: s.tools.place_building('turret', { x: 0, z: 8 }, 0).outcome,
        };
      });
      say('refusals: ' + JSON.stringify(out.refusals));
      // 2. THE VIEW, byte-measured, straight off the shipped surface
      const v = await page.evaluate(VIEW_FN);
      out.viewBytes = JSON.stringify(v.view).length;
      out.viewBuildMs = v.buildMs;
      out.viewKeys = Object.keys(v.view);
      out.now = v.view.now;
      out.almanac = v.view.almanac;
      writeFileSync(path.join(RUN_ROOT, 'probe-view.json'), JSON.stringify(v.view, null, 1));
      out.honesty = { hasGrTest: out.boot.hasGrTest, hasGrAgent: out.boot.hasGrAgent, search: out.boot.search };
      // 3. THE TRAP PAIR, at whatever rung the game actually gave us. Two BUILDs that differ in one
      //    number: order A's gold trigger is BELOW the turret's price, order B's is exactly at it.
      //    If the pipeline is honest, A dies the moment its trigger turns true (the game will not
      //    sell a 50g turret to a 30g purse) and B lands. Nothing here is set up — the purse is
      //    filled by panning, with the hero walking on real keys.
      if ((out.boot.surface?.surfacePermissionLevel ?? 0) >= 3) {
        const seam = (await page.evaluate(SNAPSHOT_FN)).seams.find((n) => n.active) ?? { x: 0, z: 0 };
        const cellA = { x: Math.round(seam.x) + 2, z: Math.round(seam.z) + 1 };
        const cellB = { x: Math.round(seam.x) - 2, z: Math.round(seam.z) - 1 };
        out.trap = {
          plan: [
            { verb: 'BUILD', what: 'turret', where: cellA, when: { goldGte: 30 } },
            { verb: 'BUILD', what: 'turret', where: cellB, when: { goldGte: 50 } },
          ],
        };
        out.trap.receipt = await page.evaluate((o) => window.__R2_SURFACE__.tools.submit_orders(o), out.trap.plan);
        say('trap submitted: ' + JSON.stringify(out.trap.receipt.outcome));
        const { result } = await runContract(page, {
          contractId: arg1 ?? 'the-claim', mode: 'watch', dir: RUN_ROOT, cadence: 999, houseBuilds: false,
          maxSeconds: 150, campaignLog: path.join(RUN_ROOT, 'probe-trap.json'),
        });
        out.trap.events = result.orderEvents;
        out.trap.outcome = result.outcome;
        out.trap.works = result.works && { turrets: result.works.turrets, beacons: result.works.beacons };
        say('trap events: ' + JSON.stringify(result.orderEvents));
      }
      await page.screenshot({ path: path.join(SHOT_DIR, `probe-${CAMPAIGN}.png`) });
    } catch (err) {
      out.error = String((err && err.stack) || err);
      say('PROBE ERROR: ' + out.error);
    } finally {
      writeFileSync(path.join(RUN_ROOT, 'probe.json'), JSON.stringify(out, null, 1));
      await session.finish('probe');
    }
    return;
  }

  // Three cheap decisive tests of the shipped order semantics, on a throwaway contract. Each one
  // isolates a single variable and is decided by the executor's own published status log.
  if (mode === 'experiments') {
    const session = await openSession(`r2-experiments-${CAMPAIGN}`);
    const { page } = session;
    const out = { campaign: CAMPAIGN, difficulty: DIFFICULTY, phases: [] };
    const submit = (orders) => page.evaluate((o) => window.__R2_SURFACE__.tools.submit_orders(o), orders);
    const watch = async (seconds, tag) => {
      const { result } = await runContract(page, {
        contractId: 'the-claim', mode: 'watch', dir: RUN_ROOT, houseBuilds: false,
        maxSeconds: seconds, campaignLog: path.join(RUN_ROOT, `experiment-${tag}.json`),
      });
      return result;
    };
    try {
      await toTown(page, { profileName: PROFILE_NAME, townName: TOWN_NAME, difficulty: DIFFICULTY });
      out.boot = await launchContract(page, 'the-claim');
      assertHonest(out.boot, 'the-claim');
      say(`EXPERIMENTS: rung ${out.boot.surface.surfacePermissionLevel}`);

      // Cells are chosen from a LIVE seam so the reflex layer can stand in the placement circle
      // and keep panning at the same time — the only arrangement in which a gold-triggered BUILD
      // is satisfiable at all (see r2-pilot's unsatisfiable-order law). |z| >= 6 keeps them off the
      // river band, which Terrain.isBuildable refuses (-5 <= z <= 5).
      const live = (await page.evaluate(SNAPSHOT_FN)).seams.filter((n) => n.active && Math.abs(n.z) >= 6);
      const anchor = live[0] ?? { x: -2, z: -7 };
      const sx = Math.round(anchor.x);
      const sz = Math.round(anchor.z);
      say(`experiment anchor seam: ${JSON.stringify(anchor)}`);

      // E1 — THE PRICE TRAP. Two BUILDs differing in one number: order A's gold trigger is BELOW
      // the turret's price, order B's is at it. A rider that sets a trigger it can afford to REACH
      // but not to SPEND destroys its own order, because a BUILD gets exactly one attempt.
      const s0 = await page.evaluate(SNAPSHOT_FN);
      const cellA = { x: sx + 2, z: sz };
      const cellB = { x: sx - 2, z: sz };
      const e1 = { name: 'price-trap', plan: [
        { verb: 'BUILD', what: 'turret', where: cellA, when: { goldGte: 30 } },
        { verb: 'BUILD', what: 'turret', where: cellB, when: { goldGte: 50 } },
      ], costAtSubmit: costOf('turret', s0) };
      e1.receipt = (await submit(e1.plan)).outcome;
      say('E1 submitted: ' + JSON.stringify(e1.receipt));
      const r1 = await watch(75, 'e1');
      e1.events = r1.orderEvents;
      e1.works = { turrets: r1.works?.turrets, beacons: r1.works?.beacons };
      out.phases.push(e1);
      say('E1 events: ' + JSON.stringify(r1.orderEvents.filter((e) => e.status)));

      // E3 — the same two orders, reversed. If the only difference in outcome is list position,
      // the barrier is proved by construction and not by argument.
      const s3 = await page.evaluate(SNAPSHOT_FN);
      // The SAME cell for both orderings, so list position is the only variable between E3 and E2.
      const cellC = { x: sx, z: sz + (sz > 0 ? 1 : -1) };
      const cellD = { x: sx + (sz > 0 ? 3 : -3), z: sz + (sz > 0 ? 1 : -1) };
      const e3 = { name: 'barrier-build-first', plan: [
        { verb: 'BUILD', what: 'turret', where: cellC, when: { goldGte: 5 } },
        { verb: 'HOLD', pos: { x: sx, z: sz } },
      ], trigger: 5, costAtSubmit: costOf('turret', s3), goldAtSubmit: s3.gold };
      e3.receipt = (await submit(e3.plan)).outcome;
      say(`E3 submitted (gold ${s3.gold}, cost ${costOf('turret', s3)}): ` + JSON.stringify(e3.receipt));
      const r3 = await watch(45, 'e3');
      e3.events = r3.orderEvents;
      e3.works = { turrets: r3.works?.turrets, beacons: r3.works?.beacons };
      out.phases.push(e3);
      say('E3 events: ' + JSON.stringify(r3.orderEvents.filter((e) => e.status)));

      // E2 — THE BARRIER. StandingOrdersExecutor.tick returns on the FIRST order that produces a
      // result, and HOLD produces one every tick forever (it has no completion condition). So an
      // affordable BUILD sitting after a HOLD can never fire. Same plan, two orderings.
      const s2 = await page.evaluate(SNAPSHOT_FN);
      const trigger = 5; // already true at submission, so "pending" cannot be blamed on the purse
      const e2 = { name: 'barrier-hold-first', plan: [
        { verb: 'HOLD', pos: { x: sx, z: sz } },
        { verb: 'BUILD', what: 'turret', where: cellD, when: { goldGte: trigger } },
      ], trigger, costAtSubmit: costOf('turret', s2), goldAtSubmit: s2.gold };
      e2.receipt = (await submit(e2.plan)).outcome;
      say(`E2 submitted (gold ${s2.gold}, cost ${costOf('turret', s2)}): ` + JSON.stringify(e2.receipt));
      const r2 = await watch(60, 'e2');
      e2.events = r2.orderEvents;
      e2.finalOrders = r2.finalOrders;
      e2.goldAtEnd = r2.gold;
      e2.goldSeries = (r2.waveLog ?? []).map((w) => ({ wave: w.wave, gold: w.gold }));
      e2.works = { turrets: r2.works?.turrets, beacons: r2.works?.beacons };
      e2.barrierWatchdog = r2.guardLog ?? null;
      out.phases.push(e2);
      say('E2 events: ' + JSON.stringify(r2.orderEvents.filter((e) => e.status)) + ' goldEnd=' + r2.gold + ' turrets=' + r2.works?.turrets);

      await page.screenshot({ path: path.join(SHOT_DIR, `experiments-${CAMPAIGN}.png`) });
    } catch (err) {
      out.error = String((err && err.stack) || err);
      say('EXPERIMENTS ERROR: ' + out.error);
    } finally {
      writeFileSync(path.join(RUN_ROOT, 'experiments.json'), JSON.stringify(out, null, 1));
      await session.finish('experiments');
    }
    return;
  }

  if (mode === 'bank') {
    const target = Number(arg1 ?? 3);
    const session = await openSession(`r2-bank-${CAMPAIGN}`);
    const { page } = session;
    const summary = [];
    try {
      await toTown(page, { profileName: PROFILE_NAME, townName: TOWN_NAME, difficulty: DIFFICULTY });
      for (let i = 0; i < target * 3; i += 1) {
        const before = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } });
        if ((before?.tracks?.agent ?? 0) >= target) { say(`agent track ${before.tracks.agent} >= ${target} — banking done`); break; }
        const boot = await launchContract(page, 'the-claim');
        say(`BANK RUN ${i + 1}: difficulty=${boot.difficulty} meta=${JSON.stringify(boot.meta?.tracks)} search="${boot.search}" __GR_TEST__=${boot.hasGrTest} rung=${boot.surface?.surfacePermissionLevel}`);
        assertHonest(boot, 'the-claim');
        const { result } = await runContract(page, {
          contractId: 'the-claim', mode: 'bank', dir: RUN_ROOT, houseBuilds: true, maxSeconds: 900,
          campaignLog: path.join(RUN_ROOT, `bank-${i + 1}.json`),
        });
        summary.push({ run: i + 1, outcome: result.outcome, wave: result.finalWave, seconds: result.seconds, rung: result.permissionRung, works: result.works && { t: result.works.turrets, b: result.works.beacons } });
        say(`BANK RUN ${i + 1}: ${result.outcome} at wave ${result.finalWave} in ${result.seconds}s`);
        await page.screenshot({ path: path.join(SHOT_DIR, `bank-${CAMPAIGN}-${i + 1}-${result.outcome}.png`) });
        if (!(await backToTown(page, result.outcome === 'secured'))) throw new Error('could not get back to town');
        const meta = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } });
        say(`  meta now: ${JSON.stringify(meta?.tracks)}`);
        summary[summary.length - 1].meta = meta?.tracks ?? null;
        writeFileSync(path.join(RUN_ROOT, 'bank-summary.json'), JSON.stringify(summary, null, 1));
      }
    } finally {
      writeFileSync(path.join(RUN_ROOT, 'bank-summary.json'), JSON.stringify(summary, null, 1));
      await session.finish(`bank x${target}`);
    }
    return;
  }

  if (mode === 'play') {
    const contractId = arg1 ?? 'the-claim';
    const cadence = Number(arg2 ?? 1);
    const dir = path.join(RUN_ROOT, contractId);
    mkdirSync(dir, { recursive: true });
    const session = await openSession(`r2-play-${contractId}-${CAMPAIGN}`);
    const { page } = session;
    try {
      await toTown(page, { profileName: PROFILE_NAME, townName: TOWN_NAME, difficulty: DIFFICULTY });
      const boot = await launchContract(page, contractId);
      say(`PLAY: contract=${boot.contract} difficulty=${boot.difficulty} secureWave=${boot.secureWave} meta=${JSON.stringify(boot.meta?.tracks)} search="${boot.search}" rung=${boot.surface?.surfacePermissionLevel}`);
      assertHonest(boot, contractId);
      writeFileSync(path.join(dir, 'boot.json'), JSON.stringify(boot, null, 1));
      await page.screenshot({ path: path.join(SHOT_DIR, `play-${CAMPAIGN}-${contractId}-boot.png`) });
      const { result } = await runContract(page, {
        contractId, mode: 'play', dir, cadence, houseBuilds: false, maxSeconds: 2400,
        campaignLog: path.join(dir, 'result.json'),
      });
      say(`PLAY ${contractId}: ${result.outcome} at wave ${result.finalWave} after ${result.seconds}s; rider calls=${result.meter.calls}`);
      await page.screenshot({ path: path.join(SHOT_DIR, `play-${CAMPAIGN}-${contractId}-${result.outcome}.png`) });
      if (result.outcome === 'secured') await backToTown(page, true);
    } finally {
      await session.finish(`play ${contractId}`);
    }
    return;
  }

  throw new Error(`unknown mode "${mode}" — use: probe | bank <count> | play <contract> [cadence]`);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});
