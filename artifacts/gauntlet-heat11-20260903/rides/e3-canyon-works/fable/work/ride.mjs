#!/usr/bin/env node
// Claude Fable 5 — e3-canyon-works controller (gen 12, heat 11)
// Deterministic NDJSON rider for gr-sim. worldModel: sim-import.
// Plan: south-first beacon ladder (instances 1-4 = 25/35/45/55 south sites within the
// 200 pan cap, rims last at 75/95 beside the north seams), hero box palisades mid-trip,
// draft economy (prospectors_luck/pan_legend/assay_bonus) as deadline slack, latch by
// end of wave 6, then cage the west chain and let the wave-14 crawler dock under
// beacon fire. Bank at pendingSecure.
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const TAPE = process.argv[2] ?? 'artifacts/heat11/fable/e3-canyon-works/tune-1.json';
const LOG = TAPE.replace(/\.json$/, '.log');
const log = (s) => appendFileSync(LOG, s + '\n');

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e3-canyon-works', '--seed', 'e3-canyon-works-01', '--tape', TAPE], { stdio: ['pipe', 'pipe', 'pipe'] });

// ---- map constants (from contracts.json + Balance, sim-import) ----
const HERO = { x: 0, z: -44 };
const SOUTH_SITES = [
  { x: -24, z: -20 }, // west-switch  (instance 1, 25g)
  { x: -12, z: -36 }, // west-base    (instance 2, 35g)
  { x: 12, z: -36 },  // east-base    (instance 3, 45g)
  { x: 24, z: -20 },  // east-switch  (instance 4, 55g)
];
const RIM_SITES = [
  { x: -28, z: 8 },   // west-rim
  { x: 28, z: 8 },    // east-rim
];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const HERO_BOX = [
  { x: 0, z: -41.8 }, { x: 0, z: -46.2 }, { x: -2.2, z: -44 }, { x: 2.2, z: -44 },
];
const HERO_BOX_OUTER = [
  { x: -1.9, z: -41.6 }, { x: 1.9, z: -41.6 }, { x: -1.9, z: -46.4 }, { x: 1.9, z: -46.4 },
];
const CAGE = [ // shield west base+switch beacons from the north approach
  { x: -12, z: -33.2 }, { x: -14.8, z: -34.6 }, { x: -24, z: -17.2 }, { x: -26.4, z: -18.8 },
];
const RAIL_BLOCKERS = [ // on rail span switch->base, inside a beacon's range 8
  { x: -21.6, z: -23.2 }, { x: -20.4, z: -24.8 }, { x: -15.6, z: -31.2 }, { x: -13.8, z: -33.4 },
];
const ZONES = [
  { minX: -36, maxX: 36, minZ: -52, maxZ: -28 },
  { minX: -30, maxX: -8, minZ: -26, maxZ: -12 },
  { minX: 8, maxX: 30, minZ: -26, maxZ: -12 },
  { minX: -42, maxX: -16, minZ: 7, maxZ: 40 },
  { minX: 16, maxX: 42, minZ: 7, maxZ: 40 },
];
const inZone = (x, z) => ZONES.some((r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ);
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---- persistent flags (monotone; deterministic) ----
let southbound = false;
let rejectStreak = 0;
let lastKey = '';
let views = 0;

const PRE_RANK = ['prospectors_luck', 'pan_legend', 'assay_bonus', 'spring_heels', 'tinkers_plating', 'powder_charge', 'wide_ring', 'quick_fuse', 'field_dressing', 'sharpen'];
const POST_RANK = ['tinkers_plating', 'beacon_dynamo', 'powder_charge', 'wide_ring', 'quick_fuse', 'assay_bonus', 'field_dressing', 'sharpen', 'prospectors_luck', 'pan_legend', 'spring_heels'];

function pickUpgrade(now, postLatch) {
  const offer = now.pendingOffer;
  if (!offer || offer.length === 0) return null;
  const ids = offer.map((o) => o.id);
  const hp = now.hero?.hp ?? 100;
  if (hp < 55) {
    for (const id of ['field_dressing', 'tinkers_plating']) if (ids.includes(id)) return id;
  }
  const rank = postLatch ? POST_RANK : PRE_RANK;
  for (const id of rank) if (ids.includes(id)) return id;
  return ids[0];
}

function builtAt(now, kind, site, tol = 2.4) {
  const entries = now.works?.entries ?? [];
  return entries.some((e) => e.id === kind && !e.wrecked && Math.hypot(e.position.x - site.x, e.position.z - site.z) <= tol);
}
function countKind(now, kind) {
  return (now.works?.entries ?? []).filter((e) => e.id === kind && !e.wrecked).length;
}

function activeSeams(now) {
  return (now.seams ?? []).filter((s) => s.active && s.x !== null && s.z !== null);
}

function probeSite(camp) {
  // nearest out-of-zone spot beside the camp seam (drain-alarm; certainly-illegal ground)
  const cands = [
    { x: camp.x + 5.4, z: camp.z }, { x: camp.x - 5.4, z: camp.z },
    { x: camp.x, z: camp.z - 5.4 }, { x: camp.x, z: camp.z + 5.4 },
    { x: camp.x + 6.4, z: camp.z }, { x: camp.x - 6.4, z: camp.z },
    { x: camp.x, z: camp.z - 6.4 },
  ];
  for (const c of cands) if (!inZone(c.x, c.z) && Math.abs(c.x) < 47 && Math.abs(c.z) < 55) return c;
  return null;
}

function harvestOrders(now, orders, preferWest) {
  const pos = now.prospector ?? HERO;
  let seams = activeSeams(now);
  if (seams.length === 0) { orders.push({ verb: 'HOLD', pos: { x: -28, z: 32 } }); return; }
  seams = seams.slice().sort((a, b) => {
    if (preferWest) {
      const aw = a.x < 0 ? 0 : 1; const bw = b.x < 0 ? 0 : 1;
      if (aw !== bw) return aw - bw;
    }
    return dist(a, pos) - dist(b, pos);
  });
  const camp = seams[0];
  const probe = probeSite(camp);
  if (probe && (now.gold ?? 0) < 190) {
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: probe.x, z: probe.z }, when: { goldGte: Math.min(999999, Math.floor((now.gold ?? 0) + 8)) } });
  }
  for (const s of seams.slice(0, 3)) orders.push({ verb: 'HARVEST', seam: s.id });
  orders.push({ verb: 'HOLD', pos: { x: camp.x, z: camp.z } });
}

function decide(view) {
  const now = view.now;
  const connect = now.canyonConnect ?? { complete: false, failed: false };
  const orders = [];

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  const pick = pickUpgrade(now, connect.complete);
  if (pick) orders.push({ verb: 'PICK_UPGRADE', id: pick });

  const beacons = countKind(now, 'sentry_beacon');
  const gold = now.gold ?? 0;
  const wave = now.wave ?? 0;

  if (!connect.complete && !connect.failed) {
    // ---- pre-latch ----
    if (!southbound && (gold >= 196 || (wave >= 5 && gold >= 160))) southbound = true;

    if (!southbound && beacons === 0) {
      harvestOrders(now, orders, false);
      return orders;
    }

    if (beacons < 4) {
      // south trip: build 4 south beacons in ladder order + hero box between the base pair
      let idx = 0;
      for (let i = 0; i < SOUTH_SITES.length; i += 1) {
        const site = SOUTH_SITES[i];
        if (builtAt(now, 'sentry_beacon', site)) continue;
        const cost = BEACON_COSTS[Math.min(beacons + idx, 5)];
        idx += 1;
        orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: site.x, z: site.z }, when: { goldGte: cost } });
        if (i === 1) {
          for (const p of HERO_BOX) {
            if (!builtAt(now, 'palisade', p, 1.2)) orders.push({ verb: 'BUILD', what: 'palisade', where: { x: p.x, z: p.z }, when: { goldGte: 10 } });
          }
        }
      }
      if (idx === 0 && beacons < 4) {
        // all four south sites show built but count says otherwise (wreck?) — fall through
      }
      harvestOrders(now, orders, false);
      return orders;
    }

    // rims phase: nearest rim first; instance costs 75 then 95
    const pos = now.prospector ?? HERO;
    const rims = RIM_SITES.filter((s) => !builtAt(now, 'sentry_beacon', s))
      .sort((a, b) => dist(a, pos) - dist(b, pos));
    let n = beacons;
    for (const site of rims) {
      const cost = BEACON_COSTS[Math.min(n, 5)];
      n += 1;
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: site.x, z: site.z }, when: { goldGte: cost } });
    }
    harvestOrders(now, orders, false);
    return orders;
  }

  // ---- post-latch (or failed: ride on for the tape anyway) ----
  const palisadeBuilds = [];
  for (const p of HERO_BOX) {
    if (!builtAt(now, 'palisade', p, 1.2)) palisadeBuilds.push({ p, wave: 7 });
  }
  for (const p of CAGE) {
    if (!builtAt(now, 'palisade', p, 1.2)) palisadeBuilds.push({ p, wave: 8 });
  }
  for (const p of HERO_BOX_OUTER) {
    if (!builtAt(now, 'palisade', p, 1.2)) palisadeBuilds.push({ p, wave: 8 });
  }
  for (const p of RAIL_BLOCKERS) {
    if (!builtAt(now, 'palisade', p, 1.2)) palisadeBuilds.push({ p, wave: 12 });
  }
  for (const b of palisadeBuilds) {
    if (wave >= b.wave) orders.push({ verb: 'BUILD', what: 'palisade', where: { x: b.p.x, z: b.p.z }, when: { goldGte: 10 } });
  }
  harvestOrders(now, orders, true);
  return orders.slice(0, 32);
}

// ---- transport ----
let buf = '';
let outcome = null;
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { log(`UNPARSED: ${line.slice(0, 200)}`); continue; }
    if (msg.schema === 'goldrush.view.v1') {
      views += 1;
      const key = `${msg.now?.wave}:${msg.now?.timers?.runSeconds}`;
      let orders;
      if (key === lastKey) {
        rejectStreak += 1;
      } else {
        rejectStreak = 0; lastKey = key;
      }
      if (rejectStreak >= 2) {
        orders = msg.now?.pendingSecure ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : [{ verb: 'HOLD', pos: { x: Math.round(msg.now?.prospector?.x ?? 0), z: Math.round(msg.now?.prospector?.z ?? 0) } }];
      } else {
        orders = decide(msg);
      }
      log(`t=${msg.now?.timers?.runSeconds} w=${msg.now?.wave} gold=${msg.now?.gold} hp=${msg.now?.hero?.hp}/${msg.now?.hero?.maxHp} beacons=${countKind(msg.now, 'sentry_beacon')} pal=${countKind(msg.now, 'palisade')} conn=${JSON.stringify(msg.now?.canyonConnect)} offer=${(msg.now?.pendingOffer ?? []).map((o) => o.id).join(',') || '-'} threats=${msg.now?.threats?.alive} -> ${JSON.stringify(orders)}`);
      child.stdin.write(JSON.stringify(orders) + '\n');
    } else if (Object.prototype.hasOwnProperty.call(msg, 'secured')) {
      outcome = msg;
      log(`OUTCOME: ${JSON.stringify(msg)}`);
      console.log(JSON.stringify(msg));
    }
  }
});
child.stderr.on('data', (d) => log(`STDERR: ${String(d).trim()}`));
child.on('close', (code) => {
  if (!outcome) console.log(JSON.stringify({ error: 'no outcome', code }));
  process.exit(0);
});
