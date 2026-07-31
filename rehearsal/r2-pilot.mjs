// THE REFLEX CLOCK, round 2. Real input only: WASD on the hero and real clicks on the HUD.
//
// WHAT CHANGED SINCE ROUND 1. Round 1's reflex layer had to AIM: it calibrated screen->world,
// parked the real mouse on a cell, opened the build menu and clicked. None of that exists here,
// because the shipped adapter places through BuildSystem.confirmPlacement (Game.ts:2067) — no
// menu, no ghost, no pointer. Four whole classes of rig defect (R-SO-2/3/4 and the calibration
// drift) are deleted by the re-land.
//
// What replaces them is ONE constraint, read at source and load-bearing for every plan in this
// round: BuildSystem.computeValid measures placeRadius FROM THE HERO
// (BuildSystem.ts:1479-1487, `origin = this.heroPosition`, which Game wires to
// `actionActorPosition` = the player's actor, not the Prospector). Turret and beacon placeRadius
// are both 6 (Balance.ts:522/543). So a BUILD order fires successfully only if the PLAYER'S OWN
// BODY is within 6 wu of the rider's cell at the instant the condition turns true — and
// StandingOrdersExecutor.execute gives each order EXACTLY ONE ATTEMPT (StandingOrders.ts:190-194:
// condition met -> place -> done|failed, no retry). The reflex layer's whole job is therefore to
// be standing there before the trigger, not after it. That is round 1's F-SO-5 promoted from an
// optimisation to a survival rule.

export const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
const ARRIVE = 0.9;
// Ranked by measured epoch-1 deltas (src/game/Upgrades.ts): a second bolt per volley is the biggest
// single dps step, then raw damage, then fire rate; survivability next; economy last.
const UPGRADE_PREFERENCE = [
  'split_spark', 'heavy_spark', 'double_tap_coil', 'chain_spark_arc', 'long_resonator',
  'tinkers_plating', 'field_dressing', 'beacon_dynamo', 'beacon_handoff', 'sharpen',
  'powder_charge', 'wide_ring', 'quick_fuse', 'prospectors_luck', 'rich_seam_pact',
  'pan_legend', 'auto_pan', 'assay_bonus', 'spring_heels',
];
const POLE_CENTER = { x: 0, z: 3 };
const POLE_RADIUS = 13;
const POLES = Array.from({ length: 8 }, (_, i) => ({
  x: POLE_CENTER.x + Math.cos((i * Math.PI) / 4) * POLE_RADIUS,
  z: POLE_CENTER.z + Math.sin((i * Math.PI) / 4) * POLE_RADIUS,
}));
const EDGE_VEC = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, east: { x: 1, z: 0 }, west: { x: -1, z: 0 } };
const PLACE_RADIUS = 6;      // Balance.turret/beacon.placeRadius, read at source
const STAND_MARGIN = 1.6;    // stand this far inside the radius so a step of drift cannot void it

export function newPilotState() {
  return {
    held: new Set(),
    lastHp: undefined,
    lastHpDropAt: -1e9,
    damageTaken: 0,
    underFire: false,
    pole: null,
    poleChosenAt: -1e9,
    stallSince: null,
    stallHeals: 0,
    detourUntil: 0,
    detourSign: 1,
    upgradesTaken: [],
    stationLog: [],
    guardLog: [],
    standingFor: null,
    standKey: null,
    standSinceT: 0,
  };
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

export function keysFor(hero, target) {
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

// ---------------------------------------------------------------- threat sensing

/** The only threat sensor a non-debug page has: our own health. enemiesAlive is a scalar and there
 *  are no enemy positions in the published diagnostics (F-SO-15, unchanged this round), so
 *  "am I being touched?" is measured by hp going down. */
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

function pickSeam(s) {
  const live = s.seams.filter((n) => n.active && n.remaining > 2);
  if (live.length === 0) return null;
  const hero = s.hero ?? { x: 0, z: 0 };
  const from = EDGE_VEC[s.edge] ?? null;
  return live.slice().sort((a, b) => score(a) - score(b))[0];
  function score(n) {
    const toward = from ? ((n.x - POLE_CENTER.x) * from.x + (n.z - POLE_CENTER.z) * from.z) / POLE_RADIUS : 0;
    return dist(n, hero) + dist(n, POLE_CENTER) * 0.35 + Math.max(0, toward) * 6;
  }
}

// ---------------------------------------------------------------- the price list (not in THE VIEW)

// Cost curves mirror src/game/buildables.ts (round-up-to-5 growth). THE VIEW still carries no price
// list, no caps and no buildability map (F-SO-13, unchanged), so the reflex clock computes them and
// hands them to the command clock out of band. Declared, not hidden.
const CURVE = { sentry_beacon: { base: 25, growth: 1.3 }, turret: { base: 50, growth: 1.35 } };
const FLAT = { palisade: 10, sluice: 40, stockpile: 60, assay_office: 80, lantern_post: 15, boiler_house: 70, decoy_shed: 20, capacitor_bank: 75 };
const COUNT_FIELD = { sentry_beacon: 'beacons', turret: 'turrets', palisade: 'palisades', sluice: 'sluices', stockpile: 'stockpiles' };
export const MAX_COUNT = { turret: 4, sentry_beacon: 6, sluice: 3, palisade: 48, stockpile: 2 };

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

/** Which pending BUILD will the executor fire NEXT — not the same as which is first in the list.
 *  StandingOrdersExecutor.execute walks records in order but SKIPS any BUILD whose condition is
 *  unmet, so a cheap order sitting fifth fires before an expensive one sitting first (F-SO-8,
 *  still true and still undocumented). */
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

/** Be in place BEFORE the trigger. One attempt is all an order gets. */
export function armWindow(order, s) {
  const when = order.order.when ?? {};
  const cost = costOf(order.order.what, s);
  if (s.gold >= cost - 30) return { arm: true, why: 'affordable-soon' };
  if (Number.isFinite(when.waveGte)) {
    if (s.wave >= when.waveGte - 1) return { arm: true, why: 'wave-near' };
    return { arm: false, why: 'wave-far' };
  }
  if (Number.isFinite(when.goldGte)) {
    if (s.gold >= when.goldGte - 30) return { arm: true, why: 'gold-near' };
    return { arm: false, why: 'gold-far' };
  }
  return { arm: true, why: 'unconditional' };
}

/** Where the hero must stand so the rider's cell is inside placeRadius when the order fires.
 *  Prefer a live seam inside that circle: standing somewhere that pays keeps the purse climbing
 *  toward the very gold trigger we are waiting on. Round 1's staging deadlock (R-SO-4) was exactly
 *  this failure — freezing the hero on ground that earns nothing, waiting for gold. */
export function standPointFor(where, s) {
  const reach = PLACE_RADIUS - STAND_MARGIN;
  const live = s.seams.filter((n) => n.active && n.remaining > 2);
  const onSeam = live.filter((n) => dist(n, where) <= reach).sort((a, b) => dist(a, s.hero ?? n) - dist(b, s.hero ?? n))[0];
  if (onSeam) return { x: onSeam.x, z: onSeam.z, seam: onSeam.id, pays: true };
  // No paying ground inside the circle: stand on the near rim, facing where we came from.
  const hero = s.hero ?? { x: 0, z: 0 };
  const d = dist(hero, where);
  if (d <= reach) return { x: hero.x, z: hero.z, seam: null, pays: false };
  const k = (reach - 0.6) / d; // walk in along hero->cell and stop on the near rim of the circle
  return { x: where.x + (hero.x - where.x) * k, z: where.z + (hero.z - where.z) * k, seam: null, pays: false };
}

// ---------------------------------------------------------------- movement policy

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
  const hpPct = s.maxHp > 0 ? s.hp / s.maxHp : 1;
  const build = nextBuildOrder(s);
  const arm = build ? armWindow(build, s) : { arm: false };
  const when = build?.order.when ?? {};
  const met = build ? conditionMet(when, s) : false;
  const stand = build ? standPointFor(build.order.where, s) : null;
  // A wave trigger is a CLOCK: the reflex layer can see it coming and be standing there when it
  // turns, and it costs only the last few seconds of panning to do so. A gold trigger is not — see
  // below.
  const waveImminent = Number.isFinite(when.waveGte)
    && s.wave >= when.waveGte - 1 && s.nextWaveInSim > 0 && s.nextWaveInSim <= 9;

  // (1) ABOUT TO FIRE. One attempt, no retry: if the condition is true the order goes on the next
  // sim tick wherever the hero happens to be, so being in the circle outranks everything.
  if (build && (met || waveImminent)) {
    const key = `${build.id}:${met ? 'met' : 'imm'}`;
    if (pilot.standKey !== key) { pilot.standKey = key; pilot.standSinceT = s.t; }
    // THE BARRIER WATCHDOG. A satisfied BUILD fires on the next sim tick — unless something ahead
    // of it in the list is returning a result every tick and starving it (a HOLD does exactly
    // that). Waiting forever for an order that structurally cannot fire is how a reflex layer
    // stands still and dies, so: eight seconds, then resume play and record it.
    if (!(met && s.t - pilot.standSinceT > 8)) {
      pilot.standingFor = { id: build.id, def: build.order.what, where: build.order.where, stand, why: met ? 'condition-met' : 'wave-imminent' };
      return { target: { x: stand.x, z: stand.z }, stop: true, why: `stand:${build.order.what}:${met ? 'met' : 'imminent'}`, seam: stand.seam };
    }
    if (!pilot.guardLog.some((g) => g.id === build.id)) {
      pilot.guardLog.push({ id: build.id, at: Number(s.t.toFixed(1)), wave: s.wave, gold: s.gold, heroToCell: Number(dist(s.hero ?? { x: 0, z: 0 }, build.order.where).toFixed(2)), why: 'condition met for >8s and the order never fired — starved by an earlier order' });
    }
  }
  pilot.standingFor = null;
  if (pilot.underFire) return { target: kiteTarget(s, pilot), stop: false, why: 'break-contact:pole' + pilot.pole };
  if (hpPct < 0.45) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:hurt' };
  if (s.enemies >= 24 && hpPct < 0.8) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:swarm' };
  const buying = s.orders.some((o) => o.verb === 'BUILD' && (o.status === 'pending' || o.status === 'active'));
  if (!buying && s.enemies >= 12) return { target: kiteTarget(s, pilot), stop: false, why: 'kite:nothing-to-buy' };

  // (2) EARN WHERE YOU MUST BUILD. THE UNSATISFIABLE-ORDER LAW, learned by killing a rider:
  // a gold-triggered BUILD whose cell has NO live seam inside the placement circle cannot be
  // served at all. The purse only rises where the hero stands on a seam; standing on dead ground
  // inside the circle freezes it, so the trigger it is waiting for never arrives — and waiting
  // there is also how the rider dies (experiment E2: parked 96 s, purse pegged at 30, killed at
  // wave 5). So the reflex layer takes the stand point ONLY when that ground still pays. When it
  // does not, it keeps panning and lets the order fire where it will: the loss is the rider's
  // plan, not the rider's life.
  if (build && arm.arm && stand?.pays) {
    pilot.standingFor = { id: build.id, def: build.order.what, where: build.order.where, stand, why: arm.why };
    return { target: { x: stand.x, z: stand.z }, stop: true, why: `stand:${build.order.what}:${arm.why}`, seam: stand.seam };
  }
  const station = orderStation(s);
  if (station) return { target: station.pos, stop: true, why: 'order:' + station.why };
  const seam = pickSeam(s);
  if (seam) return { target: { x: seam.x, z: seam.z }, stop: true, why: 'pan:' + seam.id, seam: seam.id };
  return { target: POLE_CENTER, stop: true, why: 'hold-middle' };
}

// ---------------------------------------------------------------- overlays

export async function handleLevelUp(page, pilot, hpPct = 1) {
  const cards = page.locator('[data-testid^="upgrade-card-"]:not([hidden])');
  const n = await cards.count();
  if (n === 0) return null;
  const ids = [];
  for (let i = 0; i < n; i += 1) ids.push((await cards.nth(i).getAttribute('data-upgrade-id')) ?? `card-${i}`);
  let pick = 0;
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
