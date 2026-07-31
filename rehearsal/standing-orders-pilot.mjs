// THE REFLEX CLOCK — the code half of the TWO CLOCKS (specs/agent-play/README.md).
// Runs at ~8 Hz on REAL input only: WASD on the hero, real mouse on the canvas, real clicks on the
// HUD. It never reads sim internals for decisions beyond what the game publishes to every page in
// window.__THREE_GAME_DIAGNOSTICS__, and it never touches __GR_TEST__ (which does not exist in
// these boots — no ?debug). It executes THE PLAN the command clock hands it; it never invents one.

import { SNAPSHOT_FN } from './standing-orders-rider.mjs';

export const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
const ARRIVE = 0.9;
const PAN_RADIUS = 1.35; // Balance.goldSeam pan radius is 1.6; sit inside it with margin
// Ranked by measured epoch-1 deltas (src/game/Upgrades.ts): a second bolt per volley is the biggest
// single dps step, then raw damage, then fire rate; survivability next; economy last.
const UPGRADE_PREFERENCE = [
  'split_spark', 'heavy_spark', 'double_tap_coil', 'chain_spark_arc', 'long_resonator',
  'tinkers_plating', 'field_dressing', 'beacon_dynamo', 'beacon_handoff', 'sharpen',
  'powder_charge', 'wide_ring', 'quick_fuse', 'prospectors_luck', 'rich_seam_pact',
  'pan_legend', 'auto_pan', 'assay_bonus', 'spring_heels',
];
// Eight standing places on a ring around the working middle of the claim. Under fire the reflex
// clock walks to the pole furthest from the telegraphed edge; enemies at 2.7 wu/s cannot hold a
// hero at 6.0, so they string out and arrive one at a time into auto-fire range.
const POLE_CENTER = { x: 0, z: 3 };
const POLE_RADIUS = 13;
const POLES = Array.from({ length: 8 }, (_, i) => ({
  x: POLE_CENTER.x + Math.cos((i * Math.PI) / 4) * POLE_RADIUS,
  z: POLE_CENTER.z + Math.sin((i * Math.PI) / 4) * POLE_RADIUS,
}));
const EDGE_VEC = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } };

export function newPilotState() {
  return {
    held: new Set(),
    aim: null,            // { px, py, world, def, forOrderId }
    jacobian: null,       // screen->world linearisation, recalibrated whenever the hero moves
    jacobianAt: null,
    seamIndex: 0,
    lastSeamSwitch: 0,
    lastHp: undefined,
    lastHpDropAt: -1e9,
    damageTaken: 0,
    underFire: false,
    pole: null,
    poleChosenAt: -1e9,
    stallSince: null,
    stallHeals: 0,
    upgradesTaken: [],
    buildAttempts: [],
    log: [],
    kiteAngle: null,
    stagedFor: null,
    lastStageFail: null,
  };
}

export async function snapshot(page) {
  return page.evaluate(SNAPSHOT_FN);
}

// ---------------------------------------------------------------- input primitives

export async function applyKeys(page, pilot, wanted) {
  for (const key of KEYS) {
    if (wanted.has(key) && !pilot.held.has(key)) {
      await page.keyboard.down(key);
      pilot.held.add(key);
    } else if (!wanted.has(key) && pilot.held.has(key)) {
      await page.keyboard.up(key);
      pilot.held.delete(key);
    }
  }
}

export async function releaseAll(page, pilot) {
  await applyKeys(page, pilot, new Set());
}

function keysToward(hero, target) {
  const wanted = new Set();
  if (!hero || !target) return wanted;
  const dx = target.x - hero.x;
  const dz = target.z - hero.z;
  if (Math.hypot(dx, dz) < ARRIVE) return wanted;
  if (dz < -0.35) wanted.add('KeyW');
  if (dz > 0.35) wanted.add('KeyS');
  if (dx < -0.35) wanted.add('KeyA');
  if (dx > 0.35) wanted.add('KeyD');
  return wanted;
}

// ---------------------------------------------------------------- movement policy

/** The only threat sensor a non-debug page has: our own health. enemiesAlive is a scalar and there
 *  are no enemy positions in the published diagnostics, so "am I being touched?" is measured by
 *  hp going down, and "where are they?" is inferred from the telegraphed spawn edge. */
export function observe(pilot, s, now = Date.now()) {
  if (pilot.lastHp !== undefined && s.hp < pilot.lastHp - 0.01) {
    pilot.lastHpDropAt = now;
    pilot.damageTaken = (pilot.damageTaken ?? 0) + (pilot.lastHp - s.hp);
  }
  pilot.lastHp = s.hp;
  pilot.underFire = now - (pilot.lastHpDropAt ?? -1e9) < 1900;
  if (pilot.underFire && now - (pilot.poleChosenAt ?? -1e9) > 2600) {
    pilot.pole = choosePole(s, pilot);
    pilot.poleChosenAt = now;
  }
  return pilot.underFire;
}

function choosePole(s, pilot) {
  const hero = s.hero ?? POLE_CENTER;
  const from = EDGE_VEC[s.edge] ?? null;
  let best = null;
  for (const [i, p] of POLES.entries()) {
    if (pilot.pole === i) continue;
    const travel = dist(p, hero);
    // Prefer a pole we can reach quickly that also runs AGAINST the telegraphed spawn edge.
    const awayScore = from ? -((p.x - POLE_CENTER.x) * from.x + (p.z - POLE_CENTER.z) * from.z) / POLE_RADIUS : 0;
    const score = awayScore * 9 - Math.abs(travel - 12) * 0.6;
    if (!best || score > best.score) best = { i, score };
  }
  return best ? best.i : 0;
}

function kiteTarget(s, pilot) {
  const idx = pilot.pole ?? choosePole(s, pilot);
  pilot.pole = idx;
  const p = POLES[idx];
  return { x: clamp(p.x, -23, 23), z: clamp(p.z, -23, 23) };
}

function pickSeam(s, pilot) {
  const live = s.seams.filter((n) => n.active && n.remaining > 2);
  if (live.length === 0) return null;
  if (s.riderHarvest) {
    const named = live.find((n) => n.id === s.riderHarvest);
    if (named) return named;
  }
  const hero = s.hero ?? { x: 0, z: 0 };
  const from = EDGE_VEC[s.edge] ?? null;
  // Nearest live seam, with a standing preference for the working middle (where our works are) and
  // a penalty for walking INTO the edge the game just telegraphed.
  return live
    .slice()
    .sort((a, b) => score(a) - score(b))[0];
  function score(n) {
    const toward = from ? ((n.x - POLE_CENTER.x) * from.x + (n.z - POLE_CENTER.z) * from.z) / POLE_RADIUS : 0;
    return dist(n, hero) + dist(n, POLE_CENTER) * 0.35 + Math.max(0, toward) * 6;
  }
}

/** Standing orders that speak about POSITION command the embodiment; the reflex clock mirrors them
 *  onto the hero, which is what "the reflex layer executes the plan at tick rate" has to mean. */
function orderStation(s) {
  const live = s.orders.filter((o) => o.status === 'pending' || o.status === 'active');
  const fallback = live.find((o) => o.verb === 'FALLBACK_IF');
  if (fallback && s.enemies >= (fallback.order.threat?.enemiesGte ?? 1e9)) return { pos: fallback.order.pos, why: 'FALLBACK_IF' };
  const hold = live.find((o) => o.verb === 'HOLD');
  if (hold) return { pos: hold.order.pos, why: 'HOLD' };
  const move = live.find((o) => o.verb === 'MOVE_TO' && o.status !== 'done');
  if (move) return { pos: move.order.pos, why: 'MOVE_TO' };
  return null;
}

export function decideMovement(s, pilot) {
  // Staging holds the hero still so the parked mouse keeps meaning the same acre. It yields to
  // contact — a rider who dies mid-placement places nothing — unless the trigger is seconds away.
  const committed = pilot.stagedFor && (!pilot.underFire || (s.nextWaveInSim > 0 && s.nextWaveInSim < 3));
  if (committed) return { target: pilot.stagedFor.stand, stop: true, why: 'stage:' + pilot.stagedFor.def };
  // Being touched beats every other consideration: break contact first, think second.
  if (pilot.underFire) return { target: kiteTarget(s, pilot), stop: false, why: 'break-contact:pole' + pilot.pole };
  // CAUTION IN THE LATE WAVES. Panning means standing still, and standing still inside a 30-strong
  // pulse is how the gulch rider died at wave 18 of 20 with the works still standing. Past a full
  // field the purse is no longer the binding constraint — the works are already bought — so stop
  // trading health for gold: only work a seam under pressure while still near full.
  const hpPct = s.maxHp > 0 ? s.hp / s.maxHp : 1;
  if (hpPct < 0.45) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:hurt' };
  if (s.enemies >= 24 && hpPct < 0.8) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:swarm' };
  // Gold with nothing left to buy is not worth a single hit point. Once the plan is fully spent or
  // dead, the rider stops working seams under pressure and just survives the clock out.
  const buying = s.orders.some((o) => o.verb === 'BUILD' && (o.status === 'pending' || o.status === 'active'));
  if (!buying && s.enemies >= 12) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:nothing-to-buy' };
  const station = orderStation(s);
  if (station) return { target: station.pos, stop: true, why: 'order:' + station.why };
  const seam = pickSeam(s, pilot);
  if (seam) return { target: { x: seam.x, z: seam.z }, stop: true, why: 'pan:' + seam.id, seam: seam.id };
  // No live seam: stand in the middle where the works cover us and let auto-fire work.
  return { target: POLE_CENTER, stop: true, why: 'hold-middle' };
}

// ---------------------------------------------------------------- build staging (the aim)

// Cost curves mirror src/game/buildables.ts:200-206 (round-up-to-5 growth) so the reflex clock can
// tell "we can afford this" without reading anything the game does not publish.
const CURVE = { sentry_beacon: { base: 25, growth: 1.3 }, turret: { base: 50, growth: 1.35 } };
const FLAT = { palisade: 10, sluice: 40, stockpile: 60, assay_office: 80, lantern_post: 15, boiler_house: 70, decoy_shed: 20, capacitor_bank: 75 };
const COUNT_FIELD = { sentry_beacon: 'beacons', turret: 'turrets', palisade: 'palisades', sluice: 'sluices', stockpile: 'stockpiles' };

export function costOf(def, s) {
  if (CURVE[def]) {
    const n = s.build[COUNT_FIELD[def]] ?? 0;
    return Math.ceil((CURVE[def].base * CURVE[def].growth ** n) / 5) * 5;
  }
  return FLAT[def] ?? 40;
}

function conditionMet(when, s) {
  if (!when) return true;
  if (Number.isFinite(when.goldGte)) return s.gold >= when.goldGte;
  if (Number.isFinite(when.waveGte)) return s.wave >= when.waveGte;
  return true;
}

/** Which pending BUILD will the executor fire NEXT — which is not the same as which is first in
 *  the list. StandingOrdersExecutor.execute walks the records in order but SKIPS any BUILD whose
 *  condition is unmet, so a cheap order sitting fifth fires before an expensive one sitting first.
 *  Parking the mouse on the list head would leave that firing unstaged, and an unstaged BUILD is a
 *  dead BUILD. So: the first order whose condition is already true, else whichever is closest to
 *  becoming true. */
export function nextBuildOrder(s) {
  const pending = s.orders.filter((o) => o.verb === 'BUILD' && (o.status === 'pending' || o.status === 'active'));
  if (pending.length === 0) return null;
  const met = pending.find((o) => conditionMet(o.order.when, s));
  if (met) return met;
  const gap = (o) => {
    const w = o.order.when ?? {};
    if (Number.isFinite(w.goldGte)) return Math.max(0, w.goldGte - s.gold);
    if (Number.isFinite(w.waveGte)) return Math.max(0, (w.waveGte - s.wave - 1) * 30 + s.nextWaveInSim) * 3.3;
    return 0;
  };
  return pending.slice().sort((a, b) => gap(a) - gap(b))[0];
}

export function armWindow(order, s) {
  const when = order.order.when ?? {};
  // THE PRE-ARM RULE (learned the hard way, the-claim attempt 1): a command clock that takes ~57s
  // to answer a 30s wave CANNOT be relied on to arrive before its own trigger. Three orders fired
  // on the tick they were submitted, found no build menu open, and died 'build-mode-off'. So the
  // reflex layer arms the moment the purse could pay for the thing, not when the trigger says so.
  if (s.gold >= costOf(order.order.what, s)) return { arm: true, why: 'affordable-now' };
  if (Number.isFinite(when.waveGte)) {
    if (s.wave >= when.waveGte) return { arm: true, why: 'wave-due' };
    if (s.wave === when.waveGte - 1 && s.nextWaveInSim <= 11) return { arm: true, why: 'wave-imminent' };
    return { arm: false, why: 'wave-far' };
  }
  if (Number.isFinite(when.goldGte)) {
    const cost = costOf(order.order.what, s);
    if (s.gold >= Math.max(0, Math.min(when.goldGte, cost) - 20)) return { arm: true, why: 'gold-near' };
    return { arm: false, why: 'gold-far' };
  }
  return { arm: true, why: 'unconditional' };
}

/** Where the hero must stand to place the rider's cell, and what cell it can actually reach from
 *  there. Two hard constraints collide: the aim is only stable while the hero is STILL, and the
 *  purse only grows while the hero is still ON A LIVE SEAM. Seams cycle, so a cell that was
 *  seam-adjacent at the gate can be stranded ten waves later — and a stranded gold-triggered BUILD
 *  is self-blocking: it freezes the hero on ground that pays nothing, waiting for gold only panning
 *  could bring (the-claim attempt 3 lost two whole waves to exactly this, goldDelta 0).
 *  So: stand on a seam that PAYS, and aim at the closest point to the rider's cell still inside
 *  placeRadius of that seam. The rider's intent (a turret covering this quarter) survives; the
 *  exact acre is the reflex layer's business — which is what the two clocks are FOR. Every
 *  relocation is recorded as requested-vs-placed. */
export function standPointFor(where, s) {
  const live = s.seams.filter((n) => n.active && n.remaining > 2);
  const near = live.filter((n) => dist(n, where) <= 5.2).sort((a, b) => dist(a, where) - dist(b, where))[0];
  if (near) return { x: near.x, z: near.z, seam: near.id, aimAt: where, relocated: false };
  const hero = s.hero ?? { x: 0, z: 0 };
  const best = live.slice().sort((a, b) => dist(a, hero) + dist(a, where) - (dist(b, hero) + dist(b, where)))[0];
  if (!best) return { x: where.x, z: where.z + 3, seam: null, aimAt: where, relocated: false };
  const d = dist(best, where) || 1;
  const r = Math.min(5, d);
  const aimAt = {
    x: Math.round(best.x + ((where.x - best.x) / d) * r),
    z: Math.round(best.z + ((where.z - best.z) / d) * r),
  };
  return { x: best.x, z: best.z, seam: best.id, aimAt, relocated: true, movedBy: Number(dist(aimAt, where).toFixed(1)) };
}

async function readGhost(page) {
  return page.evaluate(() => {
    const b = (window.__THREE_GAME_DIAGNOSTICS__ || {}).build || {};
    return { pos: b.ghostPos || null, valid: b.ghostValid === true, mode: b.mode === true, sel: b.selectedBuildable || null };
  });
}

async function probe(page, px, py, settle = 90) {
  await page.mouse.move(px, py);
  await page.waitForTimeout(settle);
  return readGhost(page);
}

/** Linearise screen->world for the CURRENT camera pose. Must be redone whenever the hero moves,
 *  because the camera rides the hero: the same pixel is a different acre a second later. */
export async function calibrate(page, box) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height * 0.5;
  const span = 140;
  const p0 = await probe(page, cx, cy);
  const p1 = await probe(page, cx + span, cy);
  const p2 = await probe(page, cx, cy + span);
  if (!p0.pos || !p1.pos || !p2.pos) return null;
  const j = {
    origin: { px: cx, py: cy, x: p0.pos.x, z: p0.pos.z },
    dxdpx: (p1.pos.x - p0.pos.x) / span,
    dzdpx: (p1.pos.z - p0.pos.z) / span,
    dxdpy: (p2.pos.x - p0.pos.x) / span,
    dzdpy: (p2.pos.z - p0.pos.z) / span,
  };
  const det = j.dxdpx * j.dzdpy - j.dxdpy * j.dzdpx;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return null;
  j.det = det;
  return j;
}

export function screenFor(j, world) {
  const dx = world.x - j.origin.x;
  const dz = world.z - j.origin.z;
  const dpx = (dx * j.dzdpy - dz * j.dxdpy) / j.det;
  const dpy = (dz * j.dxdpx - dx * j.dzdpx) / j.det;
  return { px: j.origin.px + dpx, py: j.origin.py + dpy };
}

/** Park the real mouse on `where` (or the nearest legal cell) and leave it there. */
export async function stageAim(page, pilot, box, order, s, aimAt) {
  const def = order.order.what;
  const where = aimAt ?? order.order.where;
  if (!pilot.jacobian) {
    pilot.jacobian = await calibrate(page, box);
    if (!pilot.jacobian) return { ok: false, why: 'calibration-failed' };
  }
  const j = pilot.jacobian;
  const ring = [
    { x: 0, z: 0 }, { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 },
    { x: 1, z: 1 }, { x: -1, z: 1 }, { x: 1, z: -1 }, { x: -1, z: -1 },
    { x: 2, z: 0 }, { x: -2, z: 0 }, { x: 0, z: 2 }, { x: 0, z: -2 },
    { x: 2, z: 2 }, { x: -2, z: -2 }, { x: 2, z: -2 }, { x: -2, z: 2 },
    { x: 3, z: 0 }, { x: -3, z: 0 }, { x: 0, z: 3 }, { x: 0, z: -3 },
  ];
  let best = null;
  for (const off of ring) {
    const target = { x: where.x + off.x, z: where.z + off.z };
    const aim = screenFor(j, target);
    if (!Number.isFinite(aim.px) || !Number.isFinite(aim.py)) continue;
    if (aim.px < box.x + 8 || aim.px > box.x + box.width - 8) continue;
    if (aim.py < box.y + 8 || aim.py > box.y + box.height - 8) continue;
    const g = await probe(page, aim.px, aim.py, 80);
    if (!g.pos) continue;
    const err = dist(g.pos, target);
    if (err > 1.6) continue; // the linearisation drifted; let the caller recalibrate
    if (g.valid) {
      best = { px: aim.px, py: aim.py, world: g.pos, offset: off, snapped: dist(g.pos, where) };
      break;
    }
    if (!best) best = null;
  }
  if (!best) return { ok: false, why: 'no-valid-cell' };
  await page.evaluate((aim) => {
    window.__RIDER__.aim = { clientX: aim.px, clientY: aim.py };
    window.__RIDER__.aimWorld = aim.world;
  }, { px: best.px, py: best.py, world: best.world });
  pilot.aim = { ...best, def, forOrderId: order.id };
  return { ok: true, ...best };
}

export async function clearAim(page, pilot) {
  pilot.aim = null;
  pilot.stagedFor = null;
  await page.evaluate(() => {
    if (window.__RIDER__) {
      window.__RIDER__.aim = null;
      window.__RIDER__.aimWorld = null;
    }
  });
}

const readBuildUi = () => {
  const b = (window.__THREE_GAME_DIAGNOSTICS__ || {}).build || {};
  const menu = document.querySelector('[data-testid="hud-build-menu"]');
  return { mode: b.mode === true, sel: b.selectedBuildable || null, menuHidden: !menu || menu.hasAttribute('hidden') };
};

/** Arm the build menu on `def`, and do NOT trust one pass to do it.
 *  The menu has two independent states and they come apart: clicking outside it calls
 *  collapseBuildMenu, which folds the tiles away while LEAVING placement armed (Game.ts:6980).
 *  A folded tile is display:none, so a tile click is a silent no-op — and the selection stays on
 *  whatever was built last. That is exactly how six beacon orders on the gulch fired against a
 *  mouse still armed for a turret and died 'wrong-selection:turret'. So: re-open the menu until the
 *  tiles are really on screen, then click, then VERIFY the selection actually moved. */
export async function armBuildMenu(page, def) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const state = await page.evaluate(readBuildUi);
    if (state.mode && state.sel === def) return state;
    if (state.menuHidden) {
      const toggle = page.getByTestId('hud-build');
      if ((await toggle.count()) > 0) await toggle.first().click({ timeout: 3000 }).catch(() => {});
      else await page.keyboard.press('KeyB');
      await page.waitForTimeout(150);
      continue;
    }
    if (!state.mode) {
      await page.keyboard.press('KeyB');
      await page.waitForTimeout(150);
      continue;
    }
    const tile = page.getByTestId(`hud-build-tile-${def}`);
    if ((await tile.count()) === 0) return state;
    await tile.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(150);
  }
  return page.evaluate(readBuildUi);
}

// ---------------------------------------------------------------- overlays

export async function handleLevelUp(page, pilot, hpPct = 1) {
  const cards = page.locator('[data-testid^="upgrade-card-"]:not([hidden])');
  const n = await cards.count();
  if (n === 0) return null;
  const ids = [];
  for (let i = 0; i < n; i += 1) ids.push((await cards.nth(i).getAttribute('data-upgrade-id')) ?? `card-${i}`);
  let pick = 0;
  // Damage wins runs, but only for a rider who is still alive to deal it: when the ledger is short
  // of health, the plating and the bandage come first.
  const order = hpPct < 0.6 ? ['tinkers_plating', 'field_dressing', ...UPGRADE_PREFERENCE] : UPGRADE_PREFERENCE;
  outer: for (const want of order) {
    for (let i = 0; i < ids.length; i += 1) {
      if (ids[i] && ids[i].toLowerCase().includes(want)) { pick = i; break outer; }
    }
  }
  await cards.nth(pick).click({ force: true, timeout: 5000 }).catch(() => {});
  pilot.upgradesTaken.push({ offered: ids, took: ids[pick] });
  await page.waitForTimeout(200);
  return ids[pick];
}

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
