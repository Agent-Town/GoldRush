#!/usr/bin/env node
// claude-opus-5 rider — the-claim / e1-the-claim-01
//
// A node driver: spawns gr-sim, reads one goldrush.view.v1 per line on stdout, answers each
// with exactly one standing-orders JSON array on stdin. Nothing else touches the game.
//
// THE POLICY, in one breath:
//   The hero never moves (it takes IDLE_INTENTS) and every enemy walks at it, so the claim is
//   a siege. The Prospector is the only body a rider can move: it pans the seams and walks the
//   fort up around the hero's stake. Orders are evaluated in array order and the first
//   ACTIONABLE order owns the tick, so the array is a priority ladder:
//     PICK_UPGRADE (only while an offer is live) -> BUILD ladder (each gated on its real price)
//     -> REPAIR_UNDER -> HARVEST the live seams -> HOLD.
//   A BUILD whose gold condition is unmet is not actionable, so it falls through to panning;
//   the moment the price is met the same order walks the Prospector to the stake and builds.
//
// Usage: node rider.mjs --tape <path> [--label name] [--seed s] [--contract c]

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};

const CWD = '/tmp/heat8-4675cfd7';
const CONTRACT = arg('contract', 'the-claim');
const SEED = arg('seed', 'e1-the-claim-01');
const TAPE = arg('tape', null);
const LABEL = arg('label', 'run');
const LOG = arg('log', null);

// ---------------------------------------------------------------------------
// THE FORT. Sites verified buildable against Terrain.isBuildable (probe-terrain.mjs):
// the river band is z in [-5,5], its shallows z = +/-6, and three landmark blockers stand at
// the headframe (-13,-8.8), the claim house (10.5,14.5) and the working camp (-8.5,16.5).
// Every stake below is bank ground, clear of all three, and >= 2.8wu from its neighbours so
// the build system's overlap test cannot refuse it.
// The hero stands at (0,12); turret range is 16wu and beacon range 8wu, so a tight ring
// around the stake means every approach is under fire for its whole last 16 metres.
// ---------------------------------------------------------------------------
const LADDERS = {
  // v1: the proving ladder — four turrets and six beacons, nothing else. Secured with the
  // hero untouched, but the 200g pan cap bound from t=249 and every later bite was refused.
  v1: [
    { what: 'turret', where: { x: 0, z: 8 } },      // the ford watch: reaches z = -8 down the crossing
    { what: 'sentry_beacon', where: { x: -3, z: 10 } },
    { what: 'sentry_beacon', where: { x: 3, z: 10 } },
    { what: 'turret', where: { x: 5, z: 13 } },
    { what: 'sentry_beacon', where: { x: -3, z: 15 } },
    { what: 'turret', where: { x: -5, z: 13 } },
    { what: 'sentry_beacon', where: { x: 3, z: 15 } },
    { what: 'sentry_beacon', where: { x: -8, z: 12 } },
    { what: 'turret', where: { x: 0, z: 17 } },
    { what: 'sentry_beacon', where: { x: 7, z: 10 } },
  ],
  // v2: same guns, then two Stockpile Yards. Each lifts the pan cap by 150, so the last three
  // waves of panning land in the bank instead of being refused as gold_capped.
  v2: [
    { what: 'turret', where: { x: 0, z: 8 } },
    { what: 'sentry_beacon', where: { x: -3, z: 10 } },
    { what: 'sentry_beacon', where: { x: 3, z: 10 } },
    { what: 'turret', where: { x: 5, z: 13 } },
    { what: 'sentry_beacon', where: { x: -3, z: 15 } },
    { what: 'turret', where: { x: -5, z: 13 } },
    { what: 'sentry_beacon', where: { x: 3, z: 15 } },
    { what: 'turret', where: { x: 0, z: 17 } },
    { what: 'stockpile', where: { x: -6, z: 9 } },
    { what: 'stockpile', where: { x: 6, z: 7 } },
    { what: 'sentry_beacon', where: { x: -8, z: 12 } },
    { what: 'sentry_beacon', where: { x: 7, z: 10 } },
  ],
  // v3: v2 without the last two beacons — 170g that stays in the bank if the guns hold.
  v3: [
    { what: 'turret', where: { x: 0, z: 8 } },
    { what: 'sentry_beacon', where: { x: -3, z: 10 } },
    { what: 'sentry_beacon', where: { x: 3, z: 10 } },
    { what: 'turret', where: { x: 5, z: 13 } },
    { what: 'sentry_beacon', where: { x: -3, z: 15 } },
    { what: 'turret', where: { x: -5, z: 13 } },
    { what: 'sentry_beacon', where: { x: 3, z: 15 } },
    { what: 'turret', where: { x: 0, z: 17 } },
    { what: 'stockpile', where: { x: -6, z: 9 } },
    { what: 'stockpile', where: { x: 6, z: 7 } },
  ],
  // v4: guns first. A turret is 52 damage at 1.1/s over 16wu for 50g; a beacon is 10+0.75/wave
  // at 1.2/s over 8wu for 25g. Per gold the turret wins outright, so the beacons stop being an
  // opening move and become the tail of the ladder.
  v4: [
    { what: 'turret', where: { x: 0, z: 8 } },
    { what: 'turret', where: { x: 5, z: 13 } },
    { what: 'turret', where: { x: -5, z: 13 } },
    { what: 'turret', where: { x: 0, z: 17 } },
    { what: 'stockpile', where: { x: -6, z: 9 } },
    { what: 'stockpile', where: { x: 6, z: 7 } },
    { what: 'sentry_beacon', where: { x: -3, z: 10 } },
    { what: 'sentry_beacon', where: { x: 3, z: 10 } },
  ],
  // v6: four guns and two yards, nothing else — every other coin stays in the bank.
  v6: [
    { what: 'turret', where: { x: 0, z: 8 } },
    { what: 'turret', where: { x: 5, z: 13 } },
    { what: 'turret', where: { x: -5, z: 13 } },
    { what: 'turret', where: { x: 0, z: 17 } },
    { what: 'stockpile', where: { x: -6, z: 9 } },
    { what: 'stockpile', where: { x: 6, z: 7 } },
  ],
};
const FORT = LADDERS[arg('ladder', 'v2')] ?? LADDERS.v2;
const GREED = arg('greed', 'on');              // off | on (once the guns stand) | all
const UPSTOCK = Number(arg('upstock', '0'));   // stockpile yards to raise to tier 2 (+90 cap each, 110g)
const TIER3 = Number(arg('tier3', '0'));       // yards to carry on to tier 3 (+120 more cap, 260g)
const KEEP = Number(arg('keep', '0'));         // gold left in the nearest seam to feed the passive clock

// Spare stakes, used only when a planned one is refused (collision / out_of_zone).
const SPARES = {
  turret: [{ x: -3, z: 19 }, { x: 8, z: 17 }, { x: -9, z: 9 }, { x: 4, z: 7 }],
  sentry_beacon: [{ x: 0, z: 19 }, { x: 6, z: 16 }, { x: -6, z: 16 }, { x: 5, z: 8 }, { x: -6, z: 8 }],
  stockpile: [{ x: -9, z: 12 }, { x: 9, z: 12 }, { x: -3, z: 7 }, { x: 3, z: 19 }],
};

const UPGRADE_RANK = [
  'tinkers_plating',   // +25 max hp AND heal 25 — the hero's hp IS the loss condition
  'split_spark',       // +1 bolt per volley: the single biggest early dps step
  'double_tap_coil',   // +25% fire rate
  'heavy_spark',       // +30% damage
  'long_resonator',    // +20% range/bolt speed
  'prospectors_luck',  // seam capacity +10, respawn -5
  'beacon_dynamo',
  'sharpen',
  'pan_legend',
  'assay_bonus',
  'field_dressing',
  'spring_heels',
  'powder_charge',
  'quick_fuse',
  'wide_ring',
];

// Once the guns are up and the hero is untouched, safety is over-served and the seam ledger
// is the only thing left to improve, so the draft leans on capacity and cash.
const UPGRADE_RANK_GREEDY = [
  'prospectors_luck',  // seam capacity +10, respawn -5: straight income
  'assay_bonus',       // +15 gold
  'tinkers_plating',
  'pan_legend',
  'split_spark',
  'double_tap_coil',
  'heavy_spark',
  'long_resonator',
  'beacon_dynamo',
  'sharpen',
  'field_dressing',
  'spring_heels',
  'powder_charge',
  'quick_fuse',
  'wide_ring',
];

const state = {
  refused: new Set(),   // "kind@x,z" stakes the build system has refused
  turns: 0,
  log: [],
};

const key = (b) => `${b.what}@${b.where.x},${b.where.z}`;

function costsFor(view, kind) {
  const def = view.stablePrefix.mechanics.buildables.find((b) => b.id === kind);
  return def ? { costs: def.costs, max: def.maxCount } : { costs: [0], max: 0 };
}

// The Nth instance of a growing-price buildable costs costs[N-1]; past the published array the
// curve continues rounded UP to 5 (costRule "ceil-to-5"). Only used as a `when.goldGte` gate.
function priceOf(view, kind, indexFromNow) {
  const { costs } = costsFor(view, kind);
  const n = (view.now.works.byKind?.[kind] ?? 0) + indexFromNow;
  return n < costs.length ? costs[n] : Math.ceil((costs[costs.length - 1] * 1.35) / 5) * 5;
}

function standingAt(view, kind, where) {
  const entries = view.now.works.entries ?? [];
  return entries.some((e) => e.id === kind
    && Math.abs((e.x ?? e.position?.x ?? 1e9) - where.x) < 0.6
    && Math.abs((e.z ?? e.position?.z ?? 1e9) - where.z) < 0.6);
}

// Read the accepted-order snapshot for BUILD stakes the game refused, so the next array
// spends its slot on a different stake instead of re-asking for the same rejection.
function noteRefusals(view) {
  for (const rec of view.now.orders ?? []) {
    const o = rec.order ?? rec;
    if (o?.verb !== 'BUILD' || rec.status !== 'failed') continue;
    const reason = String(rec.reason ?? '');
    if (/insufficient_gold/.test(reason)) continue;   // not the stake's fault
    state.refused.add(`${o.what}@${o.where.x},${o.where.z}`);
  }
}

function nextStakes(view, want) {
  const out = [];
  const perKind = { turret: 0, sentry_beacon: 0 };
  const taken = new Set();
  for (const plan of FORT) {
    if (out.length >= want) break;
    if (standingAt(view, plan.what, plan.where)) continue;
    let where = plan.where;
    if (state.refused.has(key(plan))) {
      const pool = SPARES[plan.what] ?? [];
      where = pool.find((p) => !state.refused.has(`${plan.what}@${p.x},${p.z}`)
        && !taken.has(`${plan.what}@${p.x},${p.z}`)
        && !standingAt(view, plan.what, p));
      if (!where) continue;
    }
    const { max } = costsFor(view, plan.what);
    const already = view.now.works.byKind?.[plan.what] ?? 0;
    if (already + perKind[plan.what] >= max) continue;
    taken.add(`${plan.what}@${where.x},${where.z}`);
    out.push({
      verb: 'BUILD',
      what: plan.what,
      where,
      when: { goldGte: priceOf(view, plan.what, perKind[plan.what]) },
    });
    perKind[plan.what] += 1;
  }
  return out;
}

function pickUpgrade(view) {
  const offer = view.now.pendingOffer;
  if (!Array.isArray(offer) || offer.length === 0) return null;
  const ids = offer.map((o) => o.id);
  const hero = view.now.hero;
  // A hurt hero takes the bandage before it takes damage it will not live to use.
  if (hero.hp / hero.maxHp < 0.6) {
    for (const id of ['tinkers_plating', 'field_dressing']) if (ids.includes(id)) return id;
  }
  const gunsUp = GREED === 'all'
    || ((view.now.works.byKind?.turret ?? 0) >= 3 && hero.hp >= hero.maxHp);
  const rank = GREED !== 'off' && gunsUp ? UPGRADE_RANK_GREEDY : UPGRADE_RANK;
  for (const id of rank) if (ids.includes(id)) return id;
  return ids[0];
}

// HARVEST is a machine tick: each accepted order takes one 5g bite out of the named seam and
// then reports done, so N orders drain N bites. One order past the seam's remaining gold fails
// with INVALID_TARGET, which raises the ordinary order-failure surprise — and a surprise is a
// fresh view. That is the wake-up: the array drains every live seam and then asks for orders
// again, instead of idling until the next wave horn.
function liveSeams(view) {
  return (view.now.seams ?? [])
    .filter((s) => s.active && s.x !== null && s.remaining > 0)
    .map((s) => ({ ...s, d: Math.hypot(s.x - view.now.prospector.x, s.z - view.now.prospector.z) }))
    .sort((a, b) => a.d - b.d);
}

function harvestOrders(seams, budget) {
  const out = [];
  for (const seam of seams) {
    const bites = Math.ceil(seam.remaining / 5);
    const n = Math.min(bites + 1, budget - out.length);
    for (let i = 0; i < n; i += 1) out.push({ verb: 'HARVEST', seam: seam.id });
    if (out.length >= budget) break;
  }
  return out;
}

function orderFor(view) {
  const now = view.now;

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  noteRefusals(view);
  const orders = [];
  const pick = pickUpgrade(view);
  if (pick) orders.push({ verb: 'PICK_UPGRADE', id: pick });

  const stakes = nextStakes(view, 4);
  orders.push(...stakes);
  if ((now.works.standing ?? 0) + (now.works.wrecked ?? 0) > 0) orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  // Raising a Stockpile Yard to tier 2 buys +90 of pan cap for 110g. CONTEXT_ACTION carries no
  // travel of its own and the build system wants the Prospector within 1.6wu, so the walk is
  // ordered explicitly: MOVE_TO the yard, then the action fires on the tick after arrival.
  if (stakes.length === 0 && UPSTOCK > 0 && now.gold >= 130) {
    const all = (now.works.entries ?? []).filter((e) => e.id === 'stockpile' && !e.wrecked);
    const raised = all.filter((e) => (e.tier ?? 1) >= 2).length;
    const yards = raised >= UPSTOCK
      ? (TIER3 > 0 && now.gold >= 280
        ? all.filter((e) => (e.tier ?? 1) === 2).slice(0, TIER3)
        : [])
      : all.filter((e) => (e.tier ?? 1) < 2);
    for (const yard of yards) {
      orders.push({ verb: 'MOVE_TO', pos: { x: yard.position.x, z: yard.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'stockpile', index: yard.index } });
      break;   // one yard per turn; the next view re-reads the tier before spending again
    }
  }

  // THE RESERVE. Seams respawn on their own clock, but a view only arrives at a wave horn or a
  // surprise — so a board drained flat sleeps while the ground refills. Holding the nearest live
  // seam back and standing on it keeps the passive channel paying 5g every 1.5s, which keeps the
  // tripwire below firing, which keeps the views coming: a self-winding clock made of nothing but
  // published mechanics. Every other live seam is drained by order on the spot.
  // THE RESERVE. Seams respawn on their own clock, but a view only arrives at a wave horn or a
  // surprise — so a board drained flat sleeps while the ground refills. Leaving a few coins in
  // the nearest seam and standing on it keeps the passive channel paying 5g every 1.5s, which
  // keeps the clock tripwires below firing, which keeps the views coming.
  const seams = liveSeams(view);
  const reserve = KEEP > 0 && seams.length > 0 && seams[0].remaining > KEEP ? seams[0] : null;
  const toDrain = reserve ? seams.slice(1) : seams;
  const wires = KEEP > 0 ? 4 : 1;
  const room = 31 - wires - orders.length - (reserve ? 6 : 0);
  const harvest = harvestOrders(toDrain, Math.max(0, room));
  // The reserve is bitten down to KEEP and no further: the rest is left for the passive channel.
  if (reserve) {
    const take = Math.floor((reserve.remaining - KEEP) / 5);
    for (let i = 0; i < Math.min(take, 6); i += 1) harvest.push({ verb: 'HARVEST', seam: reserve.id });
  }
  orders.push(...harvest);

  // THE TRIPWIRE. A BUILD aimed at the ford is refused by the terrain the instant its gold
  // condition is met, and an order failure is a surprise, and a surprise is a fresh view. It
  // costs nothing and never places anything. Set above the gold this turn's own bites will
  // raise, it becomes a clock: the next view arrives when the reserve seam's passive channel
  // has paid out, instead of at the next wave horn with the ground standing full.
  const bites = 5 * harvest.length;
  const spend = stakes.reduce((sum, o) => sum + (o.when.goldGte <= now.gold + bites ? o.when.goldGte : 0), 0);
  const base = now.gold + bites - spend + 5;
  // Wire 0 fires the moment this turn's bites land: an immediate re-look, so a seam that
  // respawned mid-drain is not left standing until the horn. The rest are the passive clock.
  orders.push({ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 0 }, when: { goldGte: now.gold + 5 } });
  for (let i = 1; i < wires; i += 1) {
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 0 }, when: { goldGte: Math.min(999999, Math.max(base, now.gold + 10) + (i - 1) * 5) } });
  }

  // Where the Prospector waits: on the reserve seam if there is one, else on a seam anchor no
  // live seam is using, so a respawn there is panned passively without an order.
  let hold = reserve ? { x: reserve.x, z: reserve.z } : null;
  if (!hold) {
    const live = new Set((now.seams ?? []).filter((s) => s.active && s.x !== null).map((s) => `${s.x},${s.z}`));
    const openAnchor = (view.stablePrefix.map.seams ?? [])
      .filter((a) => !live.has(`${a.x},${a.z}`))
      .map((a) => ({ a, d: Math.hypot(a.x - 0, a.z - 12) }))
      .sort((x, y) => x.d - y.d)[0];
    hold = openAnchor ? { x: openAnchor.a.x, z: openAnchor.a.z } : { x: 0, z: 10 };
  }
  orders.push({ verb: 'HOLD', pos: hold });

  return orders.slice(0, 32);
}

// ---------------------------------------------------------------------------

const args = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED];
if (TAPE) args.push('--tape', TAPE);

const child = spawn('node', args, { cwd: CWD, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', (d) => { stderr += d; });
child.stdin.on('error', () => undefined);

const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
let outcome = null;

rl.on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.schema !== 'goldrush.view.v1') { outcome = msg; return; }

  state.turns += 1;
  const orders = orderFor(msg);
  state.log.push({
    turn: state.turns,
    t: msg.now.timers.runSeconds,
    wave: msg.now.wave,
    gold: msg.now.gold,
    hp: msg.now.hero.hp,
    maxHp: msg.now.hero.maxHp,
    works: msg.now.works.byKind,
    standing: msg.now.works.standing,
    threats: msg.now.threats.alive,
    seams: (msg.now.seams ?? []).filter((s) => s.active).map((s) => `${s.id}:${s.remaining}@${s.x},${s.z}`),
    offer: msg.now.pendingOffer?.map((o) => o.id),
    needsRider: msg.now.needsRider,
    score: msg.now.score,
    failed: (msg.now.orders ?? []).filter((r) => r.status === 'failed').map((r) => `${r.order?.verb}:${r.reason}`),
    sent: orders,
  });
  child.stdin.write(`${JSON.stringify(orders)}\n`);
});

child.on('close', (code) => {
  const report = {
    label: LABEL, contract: CONTRACT, seed: SEED, tape: TAPE,
    exit: code, outcome, turns: state.turns,
    refused: [...state.refused],
    stderr: stderr.trim().split('\n').slice(-6),
    log: state.log,
  };
  if (LOG) writeFileSync(LOG, JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ label: LABEL, exit: code, outcome, turns: state.turns, refused: report.refused }, null, 1));
});
