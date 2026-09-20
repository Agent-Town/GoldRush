#!/usr/bin/env node
// e4-boneyard controller v2 — Claude Fable 5, gauntlet heat 11 (gen 15).
// Tow errand first (grade west road, harvest 3 tar nodes, hitch boiler, deliver to gate),
// then seam-channel economy funding a 4-turret fort at the fixed hero (0,-44), bank at w12.
// Pacing: MOVE_TO leads (walks silently, owns ticks); a GRADE order behind it fails exactly
// at arrival -> order-failure surprise view. Economy dwell uses a zero-cost sluice-probe
// BUILD at the Prospector's feet (no water on this map, always fails) gated goldGte gold+10.
// v2 fixes: SET_WEAPON only when weapon !== blast (resending it walks the Prospector to the
// hero every array — tune-1 died to that churn).
// Usage: node controller.mjs <tapePath> [viewLogPath]
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { appendFileSync, writeFileSync } from 'node:fs';

const tapePath = process.argv[2];
const viewLog = process.argv[3] || null;
if (!tapePath) { console.error('need tape path'); process.exit(2); }

const HERO = { x: 0, z: -44 };
const HULK = { x: -18, z: -8 };
const GATE_STOP = { x: -8, z: -38 };
const TAR_ROUTE = [ { x: 0, z: -8 }, { x: 12, z: -8 }, { x: -12, z: -8 } ];
const TURRETS = [ { x: -4, z: -41 }, { x: 4, z: -41 }, { x: -4, z: -48 }, { x: 4, z: -48 } ];
const BEACONS = [ { x: 0, z: -38 }, { x: -7, z: -45 }, { x: 7, z: -45 }, { x: 0, z: -50 }, { x: -3, z: -35 }, { x: 3, z: -35 } ];
const PALISADES = [ { x: -11, z: -40 }, { x: -11, z: -45 }, { x: 11, z: -40 }, { x: 11, z: -45 }, { x: -11, z: -50 }, { x: 11, z: -50 } ];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const PICK_PREF = ['prospectors_luck', 'beacon_dynamo', 'tinkers_plating', 'heavy_spark', 'powder_charge', 'wide_ring', 'quick_fuse', 'split_spark', 'double_tap_coil', 'long_resonator'];
const PICK_AVOID = new Set(['pan_legend', 'spring_heels']);

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const round1 = (n) => Math.round(n * 10) / 10;

let tripKey = '';
let tripSince = 0;
let nudge = 0;

function pickId(offer) {
  for (const want of PICK_PREF) { const hit = offer.find(o => o.id === want); if (hit) return hit.id; }
  const ok = offer.find(o => !PICK_AVOID.has(o.id));
  return (ok || offer[0]).id;
}

function countKind(works, kind) {
  const bk = works.byKind?.[kind];
  if (bk !== undefined && bk !== null) return typeof bk === 'number' ? bk : (bk.standing ?? bk.count ?? 0);
  return (works.entries || []).filter(e => (e.id || e.kind) === kind).length;
}
function missing(what, sites, costs, have, from, to) {
  const out = [];
  for (let i = Math.max(have, from); i < to && i < sites.length; i++) out.push({ what, where: sites[i], cost: costs[i] });
  return out;
}

function buildOrders(v) {
  const works = v.now.works || { byKind: {}, entries: [] };
  const nT = countKind(works, 'turret');
  const nB = countKind(works, 'sentry_beacon');
  const nP = countKind(works, 'palisade');
  const trips = [
    { items: missing('turret', TURRETS, TURRET_COSTS, nT, 0, 1) },
    { items: [...missing('turret', TURRETS, TURRET_COSTS, nT, 1, 2), ...missing('sentry_beacon', BEACONS, BEACON_COSTS, nB, 0, 1)] },
    { items: [...missing('turret', TURRETS, TURRET_COSTS, nT, 2, 3), ...missing('sentry_beacon', BEACONS, BEACON_COSTS, nB, 1, 2)] },
    { items: [...missing('turret', TURRETS, TURRET_COSTS, nT, 3, 4), ...missing('sentry_beacon', BEACONS, BEACON_COSTS, nB, 2, 3)] },
    { items: missing('sentry_beacon', BEACONS, BEACON_COSTS, nB, 3, 4) },
    { items: missing('sentry_beacon', BEACONS, BEACON_COSTS, nB, 4, 6) },
  ];
  const cur = trips.find(t => t.items.length > 0);
  const orders = [];
  if (cur) {
    const key = cur.items.map(i => i.what + i.where.x + ',' + i.where.z).join('|');
    const t = v.now.timers?.runSeconds ?? 0;
    if (key !== tripKey) { tripKey = key; tripSince = t; nudge = 0; }
    else if (t - tripSince > 50 && (v.now.gold ?? 0) > cur.items.reduce((s, i) => s + i.cost, 0) + 20) { nudge += 1; tripSince = t; }
    const gate = cur.items.reduce((s, i) => s + i.cost, 0);
    for (const i of cur.items) {
      const w = nudge === 0 ? i.where : { x: round1(i.where.x + Math.sign(HERO.x - i.where.x || 1) * 1.5 * nudge), z: round1(i.where.z + Math.sign(HERO.z - i.where.z || 1) * 1.5 * nudge) };
      orders.push({ verb: 'BUILD', what: i.what, where: w, when: { goldGte: gate } });
    }
  } else if (nP < PALISADES.length) {
    for (let i = nP; i < PALISADES.length; i++) orders.push({ verb: 'BUILD', what: 'palisade', where: PALISADES[i], when: { goldGte: 10 } });
  }
  return orders;
}

function decide(v) {
  const now = v.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }]; // single-element only (gen-6 law)
  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) orders.push({ verb: 'PICK_UPGRADE', id: pickId(now.pendingOffer) });
  if (now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' }); // travels to hero: send once

  const m = now.motor;
  const pros = now.prospector || now.hero;
  const obj = m?.objective;
  const fuel = m?.fuel;
  const veh = m?.vehicle;
  const roads = m?.roads;
  const storm = m?.weather?.phase === 'storm';
  const westGraded = roads ? roads.graded.includes('gate-to-west-rows') : true;

  if (obj && !obj.arrived) {
    // ERRAND PHASE. MOVE_TO leads (silent walk); GRADE behind it pings at arrival.
    let target = null;
    if (!westGraded) {
      target = GATE_STOP;
    } else {
      const nodes = fuel?.nodes || [];
      const unharvested = TAR_ROUTE.filter(t => nodes.some(n => !n.harvested && d(n, t) < 1));
      if (unharvested.length > 0 && !obj.hitched) {
        target = unharvested[0];
      } else {
        const stop = obj.hitched ? (obj.stop || GATE_STOP) : (obj.hulk ? { x: obj.hulk.x, z: obj.hulk.z } : HULK);
        target = stop;
        const stored = fuel?.stored ?? 0;
        const need = obj.hitched ? (storm ? 18 : 11) : (storm ? 20 : 13);
        const atStop = veh && d(veh, stop) <= 1.5;
        const driving = veh && veh.state === 'driving';
        if (pros && d(pros, stop) <= 1.2 && stored >= need && !driving && !atStop) {
          orders.push({ verb: 'HAUL' });
        }
      }
    }
    if (target) orders.push({ verb: 'MOVE_TO', pos: { x: target.x, z: target.z } });
    orders.push({ verb: 'GRADE' }); // real order pre-grade; arrival/dwell pinger after
    if (target) orders.push({ verb: 'HOLD', pos: { x: target.x, z: target.z } });
    return orders;
  }

  // ECONOMY PHASE
  for (const b of buildOrders(v)) orders.push(b);
  orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
  const seams = (now.seams || []).filter(s => s.active && s.x !== null && (s.remaining ?? 1) > 0);
  if (seams.length && pros) {
    seams.sort((a, b) => d(a, pros) - d(b, pros));
    const s0 = seams[0];
    orders.push({ verb: 'MOVE_TO', pos: { x: s0.x, z: s0.z } });
    // dwell alarm: illegal-anywhere sluice at my own feet, fires a failure view each +10 gold
    orders.push({ verb: 'BUILD', what: 'sluice', where: { x: round1(s0.x), z: round1(s0.z) }, when: { goldGte: Math.min(1000000, Math.floor(now.gold ?? 0) + 10) } });
    orders.push({ verb: 'HARVEST', seam: s0.id });
    if (seams[1]) orders.push({ verb: 'HARVEST', seam: seams[1].id });
    orders.push({ verb: 'HOLD', pos: { x: s0.x, z: s0.z } });
  } else {
    orders.push({ verb: 'MOVE_TO', pos: { x: HERO.x, z: HERO.z - 6 } });
    orders.push({ verb: 'GRADE' }); // idle pinger so a seam respawn is caught quickly
    orders.push({ verb: 'HOLD', pos: { x: HERO.x, z: HERO.z - 6 } });
  }
  return orders.slice(0, 32);
}

// ---- transport ----
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e4-boneyard', '--seed', 'e4-boneyard-01', '--tape', tapePath], {
  cwd: '/private/tmp/heat11-b118c4d2', stdio: ['pipe', 'pipe', 'pipe'],
});
let outcome = null;
let views = 0;
const rl = createInterface({ input: child.stdout });
rl.on('line', (line) => {
  if (!line.startsWith('{')) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.schema === 'goldrush.view.v1') {
    views++;
    if (viewLog) { try { appendFileSync(viewLog, line + '\n'); } catch {} }
    try {
      const orders = decide(msg);
      child.stdin.write(JSON.stringify(orders) + '\n');
    } catch (e) {
      console.error('controller error:', e.message);
      child.stdin.write('[{"verb":"HOLD","pos":{"x":0,"z":-50}}]\n');
    }
  } else if (msg.secured !== undefined) {
    outcome = msg;
    console.log('OUTCOME ' + JSON.stringify(msg));
  }
});
let errTail = [];
const rlErr = createInterface({ input: child.stderr });
rlErr.on('line', (l) => { errTail.push(l); if (errTail.length > 20) errTail.shift(); });
child.on('close', (code) => {
  console.log('exit', code, 'views', views);
  if (errTail.length) console.log('STDERR-TAIL\n' + errTail.join('\n'));
  writeFileSync(tapePath + '.outcome.json', JSON.stringify({ outcome, views, exit: code }, null, 2));
  process.exit(outcome && outcome.secured ? 0 : 1);
});
