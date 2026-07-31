// THE STANDING-ORDERS REHEARSAL — loop harness (TASK.md 2026-07-30, branch rehearsal/standing-orders).
//
// THE HONEST-PLAY GATE, enforced in code below:
//   * no ?debug, no ?timescale, no ?preset — every boot is a plain "/" and every contract is
//     launched from the town board, so window.__GR_TEST__ never exists (asserted each tick);
//   * Trail difficulty (the default of the founding radio) — asserted from diagnostics;
//   * fresh profile per campaign (a brand-new browser profile directory);
//   * the permission rung is EARNED by securing claims and read back from the game, never set;
//   * gameplay input is WASD + real mouse + real HUD clicks; orders flow through the real
//     StandingOrdersExecutor via et.goldrush.orders and are read back via et.goldrush.view.
//
// Modes:
//   bank  <count>            play the-claim autonomously to earn agent-track rungs (no rider calls)
//   play  <contract> [opts]  the metered rehearsal: the rider commands at wave boundaries
//
// Rider handoff is file-based (the command clock is an LLM in another process):
//   runs/<campaign>/<contract>/view-<seq>.json   written by the harness, read by the rider
//   runs/<campaign>/<contract>/orders-<seq>.json written by the rider, consumed by the harness

import { chromium } from 'playwright';
import { mkdirSync, renameSync, appendFileSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RIDER_SCRIPT } from './standing-orders-rider.mjs';
import {
  newPilotState, snapshot, applyKeys, releaseAll, decideMovement, nextBuildOrder, armWindow,
  standPointFor, stageAim, clearAim, armBuildMenu, handleLevelUp, calibrate, screenFor, dist, costOf,
  observe,
} from './standing-orders-pilot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.SO_BASE ?? 'http://127.0.0.1:5241';
const CAMPAIGN = process.env.SO_CAMPAIGN ?? 'so-1';
const PROFILE_DIR = path.join(ROOT, `rehearsal-profile-${CAMPAIGN}`);
const VIDEO_DIR = path.join(ROOT, 'rehearsal-video');
const VIDEO_TMP = path.join(VIDEO_DIR, '.tmp-so');
const SHOT_DIR = path.join(ROOT, 'reviews', 'shots-standing-orders');
const RUN_ROOT = path.join(ROOT, 'rehearsal', 'so-runs', CAMPAIGN);
const VIDEO_LOG = path.join(VIDEO_DIR, 'standing-orders-segments.jsonl');

const TICK_MS = 130;
const RIDER_WAIT_MS = Number(process.env.SO_RIDER_WAIT ?? 300_000);

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
  const page = context.pages()[0] ?? (await context.newPage());
  page.on('dialog', (d) => d.accept().catch(() => {}));
  const errors = { console: [], page: [] };
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() !== 'error') return;
    if (t.includes('127.0.0.1:5241') && t.includes('net::')) return;
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

const seen = (page, id) => page.getByTestId(id).count().then((n) => n > 0);

async function visible(page, id) {
  const l = page.getByTestId(id);
  if ((await l.count()) === 0) return false;
  return l.first().isVisible().catch(() => false);
}

async function townFrames(page) {
  return page.evaluate(() => (window.__GR_TOWN_DIAGNOSTICS__ || {}).frame ?? -1);
}

async function gameFrames(page) {
  return page.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__ || {}).frame ?? -1);
}

async function hold(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

// ------------------------------------------------------------------ the honest road to a contract

async function toTown(page, profileName, townName) {
  for (let i = 0; i < 60; i += 1) {
    if ((await townFrames(page)) > 10) {
      const nameInput = page.getByTestId('town-name-input');
      if ((await visible(page, 'town-name-input')) && (await nameInput.first().isEnabled())) {
        await nameInput.first().fill(townName);
        await page.getByTestId('town-name-submit').click();
        // the founding beat holds the card (disabled) for ~900ms before it closes itself
        await page.waitForTimeout(1800);
        continue;
      }
      return true;
    }
    if (await visible(page, 'profile-create-form')) {
      await page.getByTestId('profile-name-input').fill(profileName);
      // greenhornOffer defaults to "no" => TRAIL. Assert rather than assume.
      const yes = page.locator('input[name="greenhornOffer"][value="yes"]');
      if ((await yes.count()) > 0 && (await yes.isChecked())) {
        await page.locator('input[name="greenhornOffer"][value="no"]').check();
      }
      await page.getByTestId('profile-create').click();
      await page.waitForTimeout(900);
      continue;
    }
    if (await visible(page, 'start-menu-enter-town')) {
      await page.getByTestId('start-menu-enter-town').click();
      await page.waitForTimeout(900);
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
  for (let attempt = 0; attempt < 4; attempt += 1) {
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
  const disabled = await launch.first().isDisabled();
  if (disabled) throw new Error(`${contractId} is LOCKED on the board — earn its unlock first`);
  await launch.first().click();
  for (let i = 0; i < 90; i += 1) {
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
  return page.evaluate(() => {
    const d = window.__THREE_GAME_DIAGNOSTICS__ || {};
    return {
      contract: d.contract ? d.contract.activeId : null,
      fallbackReason: d.contract ? d.contract.fallbackReason ?? null : null,
      secureWave: d.contract ? d.contract.secureWave : null,
      difficulty: d.difficultyPreset || null,
      hasGrTest: typeof window.__GR_TEST__ !== 'undefined',
      search: window.location.search,
      meta: (() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } })(),
    };
  });
}

async function installRider(page) {
  await page.addScriptTag({ type: 'module', content: RIDER_SCRIPT });
  await page.waitForFunction(() => window.__RIDER__ && window.__RIDER__.ready === true, { timeout: 15_000 });
}

// ------------------------------------------------------------------ end-of-run handling

async function bankSecuredClaim(page, pilot) {
  await releaseAll(page, pilot);
  for (let i = 0; i < 40; i += 1) {
    if (await visible(page, 'bank-secured-claim')) {
      await page.getByTestId('bank-secured-claim').click({ force: true }).catch(() => {});
      await page.waitForTimeout(700);
      break;
    }
    await page.waitForTimeout(300);
  }
  // run ledger: take a research card if offered (science is a real, legal meta gain), then town
  for (let i = 0; i < 30; i += 1) {
    if (await visible(page, 'research-card-0')) {
      await page.getByTestId('research-card-0').click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    if (await visible(page, 'stake-again')) break;
    await page.waitForTimeout(250);
  }
  for (let i = 0; i < 40; i += 1) {
    const btn = page.getByTestId('stake-again');
    if ((await btn.count()) > 0) {
      const label = (await btn.first().textContent()) ?? '';
      if (/town/i.test(label)) {
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

async function leaveDeadRun(page, pilot) {
  await releaseAll(page, pilot);
  for (let i = 0; i < 30; i += 1) {
    if (await visible(page, 'research-card-0')) {
      await page.getByTestId('research-card-0').click({ force: true }).catch(() => {});
      await page.waitForTimeout(400);
      break;
    }
    if (await visible(page, 'stake-again')) break;
    await page.waitForTimeout(250);
  }
  for (let i = 0; i < 40; i += 1) {
    const btn = page.getByTestId('stake-again');
    if ((await btn.count()) > 0) {
      await btn.first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(1200);
      break;
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

// ------------------------------------------------------------------ the autonomous house plan (BANK runs only)

// Signal Turrets are ~2.3x the damage per gold of Sentry Beacons (52x1.1 for 50g vs 10+0.75/wave
// x1.2 for 25g), so the house saves for turrets first and only spends on beacons once the turret
// bench is full or the purse is deep enough that a beacon does not delay the next turret.
const HOUSE_PLAN = [
  { def: 'turret', max: 4, hold: 0 },
  { def: 'sentry_beacon', max: 6, hold: 60 },
];

async function autoBuild(page, pilot, s, box) {
  const counts = { turret: s.build.turrets, sentry_beacon: s.build.beacons };
  for (const step of HOUSE_PLAN) {
    if ((counts[step.def] ?? 0) >= step.max) continue;
    const spare = counts.turret >= 4 ? 0 : step.hold;
    if (s.gold < costOf(step.def, s) + spare) continue;
    const armed = await armBuildMenu(page, step.def);
    if (!armed.mode || armed.sel !== step.def) return { ok: false, why: 'menu', def: step.def };
    pilot.jacobian = await calibrate(page, box);
    if (!pilot.jacobian) return { ok: false, why: 'calibration', def: step.def };
    const hero = s.hero ?? { x: 0, z: 0 };
    const middle = { x: 0, z: 3 };
    const ring = [];
    for (let r = 2; r <= 5; r += 1) {
      for (let a = 0; a < 8; a += 1) {
        ring.push({ x: Math.round(hero.x + Math.cos((a * Math.PI) / 4) * r), z: Math.round(hero.z + Math.sin((a * Math.PI) / 4) * r) });
      }
    }
    // Bias placement inward: a turret's 16wu reach is worth most over the ground we actually work.
    ring.sort((a, b) => dist(a, middle) - dist(b, middle));
    for (const target of ring) {
      const aim = screenFor(pilot.jacobian, target);
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
      const placed = (after ?? 0) > (counts[step.def] ?? 0);
      pilot.buildAttempts.push({ mode: 'house', def: step.def, at: s.t, wave: s.wave, world: g.pos, placed });
      return { ok: placed, def: step.def, world: g.pos };
    }
    return { ok: false, why: 'no-valid-cell', def: step.def };
  }
  return null;
}

// ------------------------------------------------------------------ the rider handoff (PLAY runs only)

function riderFiles(dir, seq) {
  return { view: path.join(dir, `view-${String(seq).padStart(2, '0')}.json`), orders: path.join(dir, `orders-${String(seq).padStart(2, '0')}.json`) };
}

async function readView(page) {
  return page.evaluate(() => {
    const s = window.__RIDER_SURFACE__;
    const receipt = s.tools.view();
    return { view: receipt.outcome.state, orders: receipt.outcome.result };
  });
}

async function callRider(page, dir, seq, s, meter, extra) {
  const { view, orders } = await readView(page);
  const bytes = JSON.stringify(view).length;
  meter.calls += 1;
  meter.viewBytes.push(bytes);
  meter.cumulativeBytes += bytes;
  const files = riderFiles(dir, seq);
  const payload = {
    seq,
    calledAt: new Date().toISOString(),
    trigger: extra.trigger,
    runSeconds: s.t,
    wave: s.wave,
    permissionRung: s.perm,
    meter: { calls: meter.calls, viewBytes: bytes, cumulativeViewBytes: meter.cumulativeBytes },
    pilotReport: extra.pilotReport,
    ordersSnapshot: orders,
    view,
  };
  writeFileSync(files.view, JSON.stringify(payload, null, 1));
  say(`RIDER CALL ${seq} (wave ${s.wave}, t=${s.t.toFixed(1)}s, rung ${s.perm}, view ${bytes}B) -> ${path.basename(files.view)}`);
  return { files, view, bytes };
}

async function awaitRiderOrders(page, files, meter, pilot, keepPlaying) {
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
      // "No change" must be sayable WITHOUT resubmitting: et.goldrush.orders REPLACES the whole
      // record set, so restating a plan resets every 'done' order back to pending and re-fires it.
      if (parsed.hold === true) {
        meter.latencies.push(latency);
        meter.submissions.push({ seq: parsed.seq ?? null, latencyMs: latency, orders: [], note: parsed.note ?? null, receipt: { ok: true, held: true } });
        renameSync(files.orders, files.orders.replace(/\.json$/, '.consumed.json'));
        say(`  rider answered in ${(latency / 1000).toFixed(1)}s -> HOLD (plan unchanged)`);
        return meter.submissions[meter.submissions.length - 1];
      }
      const receipt = await page.evaluate((o) => window.__RIDER_SURFACE__.tools.submit_orders(o), parsed.orders ?? []);
      meter.latencies.push(latency);
      const record = {
        seq: parsed.seq ?? null,
        latencyMs: latency,
        orders: parsed.orders ?? [],
        note: parsed.note ?? null,
        receipt: receipt.outcome,
      };
      meter.submissions.push(record);
      renameSync(files.orders, files.orders.replace(/\.json$/, '.consumed.json'));
      say(`  rider answered in ${(latency / 1000).toFixed(1)}s -> ${JSON.stringify(receipt.outcome).slice(0, 160)}`);
      return record;
    }
    if (!(await keepPlaying(500))) { say('  run decided while the rider was thinking'); return null; }
  }
  say('  RIDER TIMEOUT — continuing on the standing plan');
  meter.missed += 1;
  return null;
}

// ------------------------------------------------------------------ the run loop

async function runContract(page, opts) {
  const {
    contractId, mode, dir, cadence = 1, maxSeconds = 1500, autoBuildEnabled, campaignLog,
  } = opts;
  const pilot = newPilotState();
  const canvas = page.locator('#game-canvas');
  const box = (await canvas.boundingBox()) ?? { x: 0, y: 0, width: 1280, height: 720 };
  const meter = { calls: 0, viewBytes: [], cumulativeBytes: 0, latencies: [], submissions: [], missed: 0 };
  const almanacLog = [];
  const waveLog = [];
  let seq = 0;
  let lastWave = -1;
  let lastCallWave = -99;
  let lastSurpriseCall = -1e9;
  let lastAutoBuild = -1e9;
  const started = Date.now();
  let outcome = 'running';
  let lastSnapshot = null;
  let honesty = { grTestSeen: false, grAgentSeen: false, searchSeen: new Set() };

  // The reflex clock does NOT stop while the command clock thinks — that is the whole point of the
  // two clocks. It returns false the moment the run is decided, so the wait unblocks immediately.
  const keepPlaying = async (ms) => {
    const until = Date.now() + ms;
    while (Date.now() < until) {
      await tickOnce();
      if (outcome !== 'running') return false;
      await page.waitForTimeout(TICK_MS);
    }
    return outcome === 'running';
  };

  async function tickOnce() {
    const s = await snapshot(page);
    lastSnapshot = s;
    if (s.hasGrTest) honesty.grTestSeen = true;
    if (s.hasGrAgent) honesty.grAgentSeen = true;
    honesty.searchSeen.add(s.search);
    observe(pilot, s);
    await verifyPlacements(page, s, pilot);
    if (s.runState === 'levelup') {
      const took = await handleLevelUp(page, pilot, s.maxHp > 0 ? s.hp / s.maxHp : 1);
      if (took) say(`  level-up: took ${took}`);
      return s;
    }
    if (s.secured) { outcome = 'secured'; return s; }
    if (s.runState === 'dead') { outcome = 'dead'; return s;

    }
    // ---- reflex clock -------------------------------------------------
    const build = nextBuildOrder(s);
    if (build) {
      const win = armWindow(build, s);
      const stand = standPointFor(build.order.where, s);
      const hero = s.hero ?? { x: 0, z: 0 };
      const atStand = dist(hero, stand) < 1.4 && s.speed < 0.5;
      // THE STAGING DEADLOCK, guarded: a gold-triggered order whose stand point is not a live seam
      // freezes the hero somewhere that earns nothing, so the trigger it is waiting for can never
      // arrive. Only commit to standing if we can still earn there, or the trigger is seconds away.
      const goldTrigger = build.order.when?.goldGte;
      const earnsWhileStaged = stand.seam !== null;
      const triggerImminent = Number.isFinite(goldTrigger) ? s.gold >= goldTrigger - 8 : true;
      const stale = pilot.stagedSince && s.t - pilot.stagedSince > 40 && !earnsWhileStaged;
      if (!win.arm || (!earnsWhileStaged && !triggerImminent) || stale) {
        if (pilot.stagedFor) { await clearAim(page, pilot); pilot.stagedSince = null; }
        if (stale) pilot.log.push({ t: s.t, wave: s.wave, unstaged: build.id, why: 'stale-stage' });
      } else {
        if (!pilot.stagedFor || pilot.stagedFor.orderId !== build.id) pilot.stagedSince = s.t;
        pilot.stagedFor = { def: build.order.what, stand, orderId: build.id };
        // The camera rides the hero, so a parked pointer slowly means a different acre. Re-stage
        // whenever the ghost has walked off the cell we aimed at.
        const drift = pilot.aim && s.build.ghostPos ? dist(s.build.ghostPos, pilot.aim.world) : 0;
        const needStage = atStand && (!pilot.aim || pilot.aim.forOrderId !== build.id || drift > 1.2);
        if (needStage) {
          await releaseAll(page, pilot);
          const armed = await armBuildMenu(page, build.order.what);
          if (armed.mode && armed.sel === build.order.what) {
            pilot.jacobian = await calibrate(page, box);
            const staged = await stageAim(page, pilot, box, build, s, stand.aimAt);
            pilot.log.push({
              t: s.t, wave: s.wave, stage: build.id, def: build.order.what,
              requested: build.order.where, standSeam: stand.seam,
              relocated: stand.relocated === true, movedBy: stand.movedBy ?? 0, ...staged,
            });
            say(`  staged ${build.order.what} for ${build.id}: ${staged.ok ? `cell ${JSON.stringify(staged.world)}${stand.relocated ? ` [RELOCATED ${stand.movedBy}wu from ${JSON.stringify(build.order.where)} to keep panning]` : ''}` : 'FAILED ' + staged.why}`);
          } else {
            pilot.lastStageFail = 'menu';
          }
        }
      }
    } else if (pilot.stagedFor) {
      await clearAim(page, pilot);
      pilot.stagedSince = null;
    }

    // Build whenever the purse allows and nothing is touching us — NOT "when the field is quiet".
    // Bank run 1 died at wave 6 with the purse pegged at its 200 cap because it gated on
    // enemiesAlive < 8, a condition that never returns after wave 2.
    if (autoBuildEnabled && s.t - lastAutoBuild > 3 && !pilot.underFire) {
      const r = await autoBuild(page, pilot, s, box);
      if (r) {
        lastAutoBuild = s.t;
        if (r.ok) say(`  house build: ${r.def} at ${JSON.stringify(r.world)}`);
      }
    }

    const decision = decideMovement(s, pilot);
    const wanted = keysFor(s.hero, decision.target);
    // THE PARALYSED-DRIVER WATCHDOG. The 2026-07-22 rehearsal lost every boss fight to a driver
    // that believed it was steering while the hero stood still (rig defect R1). This one measures
    // instead of believing: if keys are held and the hero is not moving, the pilot's idea of the
    // keyboard has drifted from the page's. Drop every key and re-press. On e1-dry-gulch attempt 1
    // the hero sat at (-1.6127478622542708, -3.0727872384939183) — identical to sixteen decimal
    // places — for fifty seconds and two whole waves while the harness thought it was walking.
    let steer = wanted;
    if (wanted.size > 0 && s.speed < 0.08) {
      if (pilot.stallSince === null || pilot.stallSince === undefined) pilot.stallSince = s.t;
      else if (s.t - pilot.stallSince > 0.8) {
        // A straight-line seek has no idea what a wall is, and the claim wears a ring of eight
        // territory palisades. Pressing W into one produces exactly this: keys held, speed 0,
        // forever — the hero sat at z=-3.0 for two whole waves, 3.4wu short of the seam it was
        // walking to, because nothing ever told it to step sideways. Alternate the slide direction
        // so it peels off the obstacle instead of leaning on it.
        pilot.detourUntil = s.t + 1.6;
        pilot.detourSign = (pilot.detourSign ?? 1) * -1;
        pilot.stallHeals = (pilot.stallHeals ?? 0) + 1;
        pilot.stallSince = null;
        await releaseAll(page, pilot);
        if (pilot.stallHeals <= 3 || pilot.stallHeals % 25 === 0) {
          say(`  watchdog: hero pinned with keys held — sliding ${pilot.detourSign > 0 ? 'left' : 'right'} (#${pilot.stallHeals})`);
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

  function keysFor(hero, target) {
    const wanted = new Set();
    if (!hero || !target) return wanted;
    const dx = target.x - hero.x;
    const dz = target.z - hero.z;
    if (Math.hypot(dx, dz) < 0.9) return wanted;
    if (dz < -0.35) wanted.add('KeyW');
    if (dz > 0.35) wanted.add('KeyS');
    if (dx < -0.35) wanted.add('KeyA');
    if (dx > 0.35) wanted.add('KeyD');
    return wanted;
  }

  while (Date.now() - started < maxSeconds * 1000) {
    const s = await tickOnce();
    if (outcome !== 'running') break;

    if (s.wave !== lastWave) {
      if (lastWave >= 0) waveLog.push({ wave: lastWave, endedAt: s.t, gold: s.gold, hp: s.hp, works: s.build.turrets + s.build.beacons, enemies: s.enemies });
      lastWave = s.wave;
    }

    if (mode === 'play') {
      const boundary = s.wave !== lastCallWave && (s.wave === 0 || s.wave - lastCallWave >= cadence);
      const surprise = s.needsRider && s.t - lastSurpriseCall > 25;
      if (seq === 0 || boundary || surprise) {
        const trigger = seq === 0 ? 'run-start' : boundary ? `wave-${s.wave}` : 'surprise';
        const { view } = await readViewSafe(page);
        almanacLog.push({ seq, wave: s.wave, at: s.t, almanac: view?.almanac ?? null, works: s.build, gold: s.gold, hp: s.hp });
        const riderBuilds = await page.evaluate(() => (window.__RIDER__ ? window.__RIDER__.builds : []));
        const pilotReport = buildPilotReport(s, pilot, riderBuilds);
        const { files } = await callRider(page, dir, seq, s, meter, { trigger, pilotReport });
        lastCallWave = s.wave;
        if (surprise) lastSurpriseCall = s.t;
        await awaitRiderOrders(page, files, meter, pilot, keepPlaying);
        seq += 1;
      }
    }
    await page.waitForTimeout(TICK_MS);
  }

  await releaseAll(page, pilot);
  const finalView = await readViewSafe(page);
  const riderAudit = await page.evaluate(() => ({
    builds: window.__RIDER__ ? window.__RIDER__.builds : [],
    actions: window.__RIDER__ ? window.__RIDER__.actions : [],
  }));
  const result = {
    contractId,
    mode,
    outcome,
    seconds: Math.round((Date.now() - started) / 1000),
    finalWave: lastSnapshot?.wave ?? null,
    secureWave: lastSnapshot?.secureWave ?? null,
    hp: lastSnapshot?.hp ?? null,
    gold: lastSnapshot?.gold ?? null,
    kills: lastSnapshot?.kills ?? null,
    works: lastSnapshot?.build ?? null,
    permissionRung: lastSnapshot?.perm ?? null,
    difficulty: lastSnapshot?.difficulty ?? null,
    honesty: { grTestSeen: honesty.grTestSeen, grAgentSeen: honesty.grAgentSeen, searches: [...honesty.searchSeen] },
    meter,
    almanacLog,
    waveLog,
    upgrades: pilot.upgradesTaken,
    watchdogKeyResets: pilot.stallHeals ?? 0,
    stageLog: pilot.log,
    buildAttempts: pilot.buildAttempts,
    riderAudit,
    finalView: finalView.view ?? null,
    finalOrders: finalView.orders ?? null,
  };
  if (campaignLog) writeFileSync(campaignLog, JSON.stringify(result, null, 1));
  return { result, pilot };
}

const COUNT_FIELD = {
  sentry_beacon: 'beacons', palisade: 'palisades', sluice: 'sluices',
  stockpile: 'stockpiles', turret: 'turrets', boiler_house: 'boilerHouses',
};

/** The ground truth the adapter could not see: one published frame after a click, did the count
 *  actually move? Written back into the audit so the review reports what happened, not what was
 *  hoped. A false here is a real defect and says so out loud. */
async function verifyPlacements(page, s, pilot) {
  const pending = await page.evaluate(() => {
    const b = window.__RIDER__ ? window.__RIDER__.builds : [];
    return b.map((e, i) => ({ i, def: e.def, preCount: e.preCount, verified: e.verified, result: e.result, at: e.at }))
      .filter((e) => e.result === 'clicked' && e.verified === null);
  });
  for (const p of pending) {
    if (s.t - p.at < 0.25) continue; // give the game a frame to publish
    const field = COUNT_FIELD[p.def];
    const now = field ? (s.build[field] ?? 0) : 0;
    const ok = now > (p.preCount ?? 0);
    await page.evaluate(({ i, ok, now }) => {
      const e = window.__RIDER__.builds[i];
      if (e) { e.verified = ok; e.countAfter = now; e.result = ok ? 'placed' : 'clicked-but-not-placed'; }
    }, { i: p.i, ok, now });
    if (!ok) say(`  !! placement NOT confirmed: ${p.def} (count still ${now}) — receipt said ok`);
    pilot.buildAttempts.push({ mode: 'order', def: p.def, at: p.at, verified: ok, countAfter: now });
  }
}

async function readViewSafe(page) {
  try {
    return await readView(page);
  } catch (err) {
    return { view: null, orders: null, error: String(err) };
  }
}

function buildPilotReport(s, pilot, riderBuilds = []) {
  return {
    // THE VIEW carries no price list and no buildability map, so the reflex clock hands the command
    // clock the two things it cannot otherwise know before it names a cell and a gold trigger.
    priceOfNext: {
      turret: costOf('turret', s), sentry_beacon: costOf('sentry_beacon', s),
      palisade: costOf('palisade', s), sluice: costOf('sluice', s), stockpile: costOf('stockpile', s),
    },
    capsRemaining: { turret: 4 - s.build.turrets, sentry_beacon: 6 - s.build.beacons, sluice: 3 - s.build.sluices },
    lastPlacements: riderBuilds.slice(-4),
    hero: s.hero,
    heroHp: `${s.hp}/${s.maxHp}`,
    speed: Number(s.speed.toFixed(2)),
    gold: s.gold,
    bankCap: s.bankCap,
    enemiesAlive: s.enemies,
    telegraphedEdge: s.edge,
    waveState: s.waveState,
    nextWaveInSeconds: Number((s.nextWaveInSim ?? 0).toFixed(1)),
    works: { turrets: s.build.turrets, beacons: s.build.beacons, sluices: s.build.sluices, palisades: s.build.palisades },
    nextCost: s.build.nextCost,
    liveSeams: s.seams.filter((n) => n.active).map((n) => ({ id: n.id, x: n.x, z: n.z, remaining: n.remaining })),
    upgradesTaken: pilot.upgradesTaken.map((u) => u.took),
    lastStagings: pilot.log.slice(-3),
    reflexNote:
      'The reflex clock walks the hero (WASD), pans seams by standing still inside 1.35wu, kites when hurt, ' +
      'takes level-up cards, and parks the real mouse on the next pending BUILD cell. It does NOT choose what to build.',
  };
}

// ------------------------------------------------------------------ modes

async function main() {
  const [mode, arg1, arg2] = process.argv.slice(2);
  mkdirSync(RUN_ROOT, { recursive: true });

  if (mode === 'bank') {
    // Bank RUNGS, not runs: keep playing The Claim until the agent track has earned the rung the
    // standing-orders DSL needs (BUILD/HARVEST = 3). Every point is a real secured claim.
    const target = Number(arg1 ?? 3);
    const session = await openSession(`so-bank-${CAMPAIGN}`);
    const { page } = session;
    const summary = [];
    try {
      await toTown(page, 'Rider', 'Rider Creek');
      for (let i = 0; i < target * 3; i += 1) {
        const before = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('gr.meta.v1') || 'null'); } catch { return null; } });
        if ((before?.tracks?.agent ?? 0) >= target) { say(`agent track ${before.tracks.agent} >= ${target} — banking done`); break; }
        const boot = await launchContract(page, 'the-claim');
        say(`BANK RUN ${i + 1}/${target}: contract=${boot.contract} difficulty=${boot.difficulty} meta=${JSON.stringify(boot.meta?.tracks)} search="${boot.search}" __GR_TEST__=${boot.hasGrTest}`);
        if (boot.hasGrTest) throw new Error('HONESTY GATE: __GR_TEST__ exists — a debug param leaked in');
        if (boot.difficulty !== 'trail') throw new Error(`HONESTY GATE: difficulty is ${boot.difficulty}, not trail`);
        await installRider(page);
        const { result } = await runContract(page, {
          contractId: 'the-claim', mode: 'bank', dir: RUN_ROOT, autoBuildEnabled: true, maxSeconds: 900,
          campaignLog: path.join(RUN_ROOT, `bank-${i + 1}.json`),
        });
        summary.push({ run: i + 1, outcome: result.outcome, wave: result.finalWave, seconds: result.seconds, works: result.works && { t: result.works.turrets, b: result.works.beacons } });
        say(`BANK RUN ${i + 1}: ${result.outcome} at wave ${result.finalWave} in ${result.seconds}s`);
        await page.screenshot({ path: path.join(SHOT_DIR, `bank-${i + 1}-${result.outcome}.png`) });
        const home = result.outcome === 'secured' ? await bankSecuredClaim(page, newPilotState()) : await leaveDeadRun(page, newPilotState());
        if (!home) throw new Error('could not get back to town');
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

  if (mode === 'probe') {
    // A short shakedown: the honest road, the transport, the ladder, and one real placement.
    const session = await openSession(`so-probe-${CAMPAIGN}`);
    const { page } = session;
    const out = {};
    try {
      await toTown(page, 'Rider', 'Rider Creek');
      out.boot = await launchContract(page, arg1 ?? 'the-claim');
      say('boot: ' + JSON.stringify(out.boot));
      await installRider(page);
      out.riderReady = await page.evaluate(() => window.__RIDER__.ready === true);
      // 1. the ladder, unfaked: what does the game say our rung is, and does it refuse us?
      out.denied = await page.evaluate(() =>
        window.__RIDER_SURFACE__.tools.submit_orders([{ verb: 'HOLD', pos: { x: 0, z: 8 } }]).outcome);
      out.deniedBuild = await page.evaluate(() =>
        window.__RIDER_SURFACE__.tools.submit_orders([{ verb: 'BUILD', what: 'turret', where: { x: 0, z: 8 }, when: { waveGte: 1 } }]).outcome);
      // 2. THE VIEW, byte-measured
      const v = await readView(page);
      out.viewBytes = JSON.stringify(v.view).length;
      out.viewKeys = Object.keys(v.view);
      out.almanac = v.view.almanac;
      out.stablePrefix = v.view.stablePrefix;
      out.now = v.view.now;
      writeFileSync(path.join(RUN_ROOT, 'probe-view.json'), JSON.stringify(v.view, null, 1));
      // 3. can the reflex clock actually pan and build with real input?
      const pilot = newPilotState();
      const box = (await page.locator('#game-canvas').boundingBox()) ?? { x: 0, y: 0, width: 1280, height: 720 };
      const t0 = Date.now();
      let s = await snapshot(page);
      while (Date.now() - t0 < 60_000 && s.gold < 55) {
        if (s.runState === 'levelup') await handleLevelUp(page, pilot);
        const d = decideMovement(s, pilot);
        const wanted = new Set();
        const dx = d.target.x - (s.hero?.x ?? 0);
        const dz = d.target.z - (s.hero?.z ?? 0);
        if (Math.hypot(dx, dz) >= 0.9) {
          if (dz < -0.35) wanted.add('KeyW');
          if (dz > 0.35) wanted.add('KeyS');
          if (dx < -0.35) wanted.add('KeyA');
          if (dx > 0.35) wanted.add('KeyD');
        }
        await applyKeys(page, pilot, wanted);
        await page.waitForTimeout(140);
        s = await snapshot(page);
      }
      await releaseAll(page, pilot);
      out.pannedGold = s.gold;
      out.pannedIn = Math.round((Date.now() - t0) / 1000);
      out.build = await autoBuild(page, pilot, s, box);
      out.afterBuild = (await snapshot(page)).build;
      out.honesty = { hasGrTest: s.hasGrTest, hasGrAgent: s.hasGrAgent, search: s.search, perm: s.perm };
      await page.screenshot({ path: path.join(SHOT_DIR, 'probe.png') });
    } catch (err) {
      out.error = String((err && err.stack) || err);
    } finally {
      writeFileSync(path.join(RUN_ROOT, 'probe.json'), JSON.stringify(out, null, 1));
      say('PROBE: ' + JSON.stringify({ ...out, stablePrefix: undefined, now: undefined, almanac: undefined, viewKeys: undefined }, null, 1));
      await session.finish('probe');
    }
    return;
  }

  if (mode === 'play') {
    const contractId = arg1 ?? 'the-claim';
    const cadence = Number(arg2 ?? 1);
    const dir = path.join(RUN_ROOT, contractId);
    mkdirSync(dir, { recursive: true });
    const session = await openSession(`so-play-${contractId}-${CAMPAIGN}`);
    const { page } = session;
    try {
      await toTown(page, 'Rider', 'Rider Creek');
      const boot = await launchContract(page, contractId);
      say(`PLAY: contract=${boot.contract} difficulty=${boot.difficulty} secureWave=${boot.secureWave} meta=${JSON.stringify(boot.meta?.tracks)} search="${boot.search}" __GR_TEST__=${boot.hasGrTest}`);
      if (boot.contract !== contractId) throw new Error(`contract fell back to ${boot.contract} (${boot.fallbackReason})`);
      if (boot.hasGrTest) throw new Error('HONESTY GATE: __GR_TEST__ exists');
      if (boot.difficulty !== 'trail') throw new Error(`HONESTY GATE: difficulty is ${boot.difficulty}`);
      writeFileSync(path.join(dir, 'boot.json'), JSON.stringify(boot, null, 1));
      await installRider(page);
      await page.screenshot({ path: path.join(SHOT_DIR, `play-${contractId}-boot.png`) });
      const { result } = await runContract(page, {
        contractId, mode: 'play', dir, cadence, autoBuildEnabled: false, maxSeconds: 2400,
        campaignLog: path.join(dir, 'result.json'),
      });
      say(`PLAY ${contractId}: ${result.outcome} at wave ${result.finalWave} after ${result.seconds}s; rider calls=${result.meter.calls}`);
      await page.screenshot({ path: path.join(SHOT_DIR, `play-${contractId}-${result.outcome}.png`) });
      if (result.outcome === 'secured') await bankSecuredClaim(page, newPilotState());
    } finally {
      await session.finish(`play ${contractId}`);
    }
    return;
  }

  throw new Error(`unknown mode "${mode}" — use: bank <count> | play <contract> [cadence]`);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});
