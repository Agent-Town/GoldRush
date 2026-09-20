#!/usr/bin/env node
// Gold Rush gauntlet heat 11 — e4-gusher-county — claude-opus-5, generation 17.
// Controller: a state machine over now.motor (deliveries errand) + camp fort + far-seam economy.
import { spawn } from 'node:child_process';
import process from 'node:process';

const TAPE = process.argv[2] || 'artifacts/heat11/opus/e4-gusher-county/tune-1-tape.json';
const SEED = process.argv[3] || 'e4-gusher-county-01';

const WEST = 'camp-to-west-lease', EAST = 'camp-to-east-lease', NORTH = 'camp-to-north-lease';
// Delivery order is a fuel decision, not a taste. Open-country crossings cost 6x graded road per
// unit, and the last lease needs no return leg: west -> north -> east puts 42wu of open crossing in
// the tank instead of 46, and spends the un-returned leg on the longest road (46.9 vs 38).
const ORDER = [WEST, NORTH, EAST];
const HEAD = { [WEST]: { x: -50, z: -40 }, [EAST]: { x: 48, z: -38 }, [NORTH]: { x: 0, z: 46 } };
const START = { [WEST]: { x: -12, z: -8 }, [EAST]: { x: 12, z: -8 }, [NORTH]: { x: 0, z: 8 } };

const CAMP = { x: 0, z: -4 };
// Ten candidates for four turret slots (gen-14: carry more candidates than rungs).
const TURRETS = [{ x: -9, z: -4 }, { x: 9, z: -4 }, { x: 0, z: 5 }, { x: 0, z: -13 },
  { x: -9, z: 5 }, { x: 9, z: 5 }, { x: -9, z: -13 }, { x: 9, z: -13 }, { x: -15, z: -4 }, { x: 15, z: -4 }];
const BEACONS = [{ x: -5, z: -9 }, { x: 5, z: -9 }, { x: -5, z: 2 }, { x: 5, z: 2 },
  { x: -14, z: 2 }, { x: 14, z: 2 }, { x: -14, z: -11 }, { x: 14, z: -11 }, { x: 0, z: -18 }, { x: 0, z: 10 }];
const PALIS = [];
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  PALIS.push({ x: Math.round((CAMP.x + Math.cos(a) * 7) * 10) / 10, z: Math.round((CAMP.z + Math.sin(a) * 7) * 10) / 10 });
}
for (let i = 0; i < 16; i++) {
  const a = ((i + 0.5) / 16) * Math.PI * 2;
  PALIS.push({ x: Math.round((CAMP.x + Math.cos(a) * 11) * 10) / 10, z: Math.round((CAMP.z + Math.sin(a) * 11) * 10) / 10 });
}

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const mv = (p) => ({ verb: 'MOVE_TO', pos: { x: p.x, z: p.z } });

function dwell(p) {
  return [mv(p), mv({ x: p.x + 0.9, z: p.z }), mv(p), mv({ x: p.x, z: p.z - 0.9 }), mv(p)];
}

function pickUpgrade(offer) {
  const score = (u) => {
    const t = `${u.name || ''} ${u.effectText || ''}`.toLowerCase();
    let s = 0;
    if (/plating|max hp|maxhp|health|vitality|armor|armour|tough|hardy/.test(t)) s += 10;
    if (/regen|heal|mend|recover/.test(t)) s += 6;
    if (/damage|spark|coil|tap|blast|power/.test(t)) s += 4;
    if (/fire rate|rate|range|reload|cooldown/.test(t)) s += 3;
    if (/gold|pan|seam|harvest|nugget/.test(t)) s += 2;
    return s;
  };
  const sorted = offer.slice().sort((a, b) => score(b) - score(a) || String(a.id).localeCompare(String(b.id)));
  return sorted[0].id;
}

function costsFor(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
  return b ? { costs: b.costs || [b.cost], max: b.maxCount ?? 99 } : null;
}

function freeSlot(candidates, occupied, minGap = 3.0) {
  for (const c of candidates) {
    if (!occupied.some((o) => d(o, c) < minGap)) return c;
  }
  return null;
}

// Build rungs we can already afford at plan time: no pending gate can drag the Prospector home.
function buildOrders(view) {
  const now = view.now;
  const entries = (now.works && now.works.entries) || [];
  const occupied = entries.filter((e) => !e.wrecked).map((e) => ({ x: e.position ? e.position.x : e.x, z: e.position ? e.position.z : e.z }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
  const byKind = (now.works && now.works.byKind) || {};
  const out = [];
  let gold = now.gold || 0;

  const t = costsFor(view, 'turret');
  const b = costsFor(view, 'sentry_beacon');
  const p = costsFor(view, 'palisade');

  const nT = byKind.turret || 0, nB = byKind.sentry_beacon || 0, nP = byKind.palisade || 0;
  const tCost = t && nT < t.max ? (t.costs[nT] ?? t.costs[t.costs.length - 1]) : Infinity;
  const bCost = b && nB < b.max ? (b.costs[nB] ?? b.costs[b.costs.length - 1]) : Infinity;
  const pCost = p && nP < p.max ? 10 : Infinity;

  // Turrets lead (57 dps / 50g beats a beacon's ~30 dps / 25g).
  if (gold >= tCost) {
    const slot = freeSlot(TURRETS, occupied, 4.0);
    if (slot) { out.push({ verb: 'BUILD', what: 'turret', where: slot, when: { goldGte: tCost } }); occupied.push(slot); gold -= tCost; }
  }
  // A beacon only ever spends surplus ABOVE the next turret (gen-6: gate the cheap rung on the dear one).
  if (gold >= bCost && (gold - bCost >= (Number.isFinite(tCost) ? tCost : 0) || !Number.isFinite(tCost))) {
    const slot = freeSlot(BEACONS, occupied, 3.5);
    if (slot) { out.push({ verb: 'BUILD', what: 'sentry_beacon', where: slot, when: { goldGte: bCost } }); occupied.push(slot); gold -= bCost; }
  }
  // Palisades are chaff and route blockers; they eat only what neither gun rung wants.
  const reserve = Number.isFinite(tCost) ? tCost : (Number.isFinite(bCost) ? bCost : 0);
  let made = 0;
  while (gold - pCost >= reserve && made < 3 && Number.isFinite(pCost)) {
    const slot = freeSlot(PALIS, occupied, 2.6);
    if (!slot) break;
    out.push({ verb: 'BUILD', what: 'palisade', where: slot, when: { goldGte: pCost } });
    occupied.push(slot); gold -= pCost; made++;
  }
  return out;
}

function harvestOrders(view, from, budget) {
  const seams = (view.now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  if (!seams.length || budget <= 0) return [];
  const sorted = seams.slice().sort((a, b) => d(from, a) - d(from, b) || String(a.id).localeCompare(String(b.id)));
  const out = [];
  for (const s of sorted) {
    if (out.length >= budget) break;
    const n = Math.min(6, Math.max(1, Math.ceil((s.remaining ?? 30) / 5)), budget - out.length);
    for (let i = 0; i < n; i++) out.push({ verb: 'HARVEST', seam: s.id });
    if (out.length >= budget) break;
  }
  return out;
}

// The closure clock, read straight off WeatherSystem.sample + MotorSocket.syncClosures. Driving a
// CLOSED lease is the whole contract's trap: the road bonus vanishes, so 38wu costs 12.7 fuel of a
// 36-fuel run instead of 2.0, and a storm on top of that makes it 18.
const AUTHORED = [WEST, EAST, NORTH];
const isStormAt = (t) => { const w = t - Math.floor(t / 30) * 30; return w >= 10 && w < 22; };
const closedAt = (t) => (isStormAt(t) ? AUTHORED[Math.floor(t / 30) % 3] : null);
function windowClearOfClosure(t0, t1, lease) {
  for (let t = t0; t <= t1 + 0.5; t += 0.5) if (closedAt(t) === lease) return false;
  return true;
}
function windowClearOfStorm(t0, t1) {
  for (let t = t0; t <= t1 + 0.5; t += 0.5) if (isStormAt(t)) return false;
  return true;
}

function plan(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const out = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    out.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  const m = now.motor;
  let where = { x: now.prospector.x, z: now.prospector.z };
  let holding = null;

  const dry = m && m.fuel.stored <= 0.01 && m.fuel.tar <= 0 && (m.fuel.nodes || []).every((n) => n.harvested);
  if (m && !m.objective.arrived && !dry) {
    const nodes = m.fuel.nodes || [];
    const graded = new Set((m.roads.corridors || []).filter((c) => c.graded).map((c) => c.id));
    const delivered = new Set(m.objective.delivered || []);
    const next = ORDER.find((id) => !delivered.has(id));
    const veh = { x: m.vehicle.x, z: m.vehicle.z };
    const SPEED = 4.4;
    let clock = m.weather.simTime;
    const walkTo = (p) => { clock += d(where, p) / SPEED; where = { x: p.x, z: p.z }; };
    // A haul only rides if the whole drive window is legal: never a closed lease (6x cost), and no
    // storm on the long open crossings while there is still run left to wait in.
    const haulOk = (from, to, lease) => {
      const dist = d(from, to);
      const onRoad = lease && graded.has(lease);
      const dur = (onRoad ? dist / 22.5 : dist / 9) / 0.7 + 0.5;
      // Closure is a hard block: a washed-out lease costs six times the graded rate.
      if (lease && !windowClearOfClosure(clock, clock + dur, lease)) return false;
      // Storm is only a 1.43x tax, so hold for it ONLY when we are already standing on the stake and
      // the prediction is exact; a guessed walk time deadlocked the whole errand for 170 seconds.
      const reliable = clock - m.weather.simTime < 1.5;
      if (!lease && dist > 8 && now.wave < 9 && reliable && !windowClearOfStorm(clock, clock + dur)) return false;
      clock += dur;
      return true;
    };

    // Opening tour: three tar nodes at the camp line, east road graded on the way past.
    const tour = [1, 2, 0];
    for (const i of tour) {
      const n = nodes[i];
      if (!n) continue;
      if (!n.harvested) { out.push(...dwell(n)); walkTo(n); clock += 1.4; }
      if (i === 2 && !graded.has(EAST)) {
        if (d(where, START[EAST]) > 0.5) { out.push(mv(START[EAST])); walkTo(START[EAST]); }
        out.push({ verb: 'GRADE' });
      }
    }

    if (next) {
      let live = true;
      // 1. A Hauler resting at a delivered head comes home down its own road before striking out.
      for (const id of ORDER) {
        if (delivered.has(id) && d(veh, HEAD[id]) < 8) {
          out.push(mv(START[id])); walkTo(START[id]);
          if (haulOk(veh, START[id], id)) { out.push({ verb: 'HAUL' }); veh.x = START[id].x; veh.z = START[id].z; }
          else live = false;
          break;
        }
      }
      // 2. Camp is the only place worth spending gold, and this is when we stand in it.
      if (d(where, CAMP) < 26) out.push(...buildOrders(view));
      // 3. Stage at the next road's head, grading it first if it is raw.
      if (live && (d(veh, START[next]) > 0.5 || !graded.has(next))) {
        if (d(where, START[next]) > 0.5) { out.push(mv(START[next])); walkTo(START[next]); }
        if (!graded.has(next)) { out.push({ verb: 'GRADE' }); graded.add(next); }
        if (d(veh, START[next]) > 0.5) {
          if (haulOk(veh, START[next], null)) { out.push({ verb: 'HAUL' }); veh.x = START[next].x; veh.z = START[next].z; }
          else live = false;
        }
      }
      // 4. Drive the graded lease and deliver.
      if (live) {
        out.push(mv(HEAD[next])); walkTo(HEAD[next]);
        if (!haulOk(veh, HEAD[next], next)) holding = { x: where.x, z: where.z };
      else out.push({ verb: 'HAUL' });
      } else holding = { x: where.x, z: where.z };
    }
  } else {
    if (d(where, CAMP) < 30) out.push(...buildOrders(view));
    else out.push(...buildOrders(view));
  }

  out.push({ verb: 'REPAIR_UNDER', pct: 55 });
  // Waiting out a closure means STANDING on the stake, not wandering 55wu to a seam and back.
  if (holding) { out.push({ verb: 'HOLD', pos: holding }); return out.slice(0, 32); }
  const budget = Math.max(0, 31 - out.length);
  out.push(...harvestOrders(view, where, Math.min(budget, 14)));
  return out.slice(0, 32);
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e4-gusher-county', '--seed', SEED, '--tape', TAPE];
const child = spawn('node', args, { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
let last = null;
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let v;
    try { v = JSON.parse(line); } catch { continue; }
    if (v && v.now) {
      last = v;
      const orders = plan(v);
      const mm = v.now.motor;
      process.stderr.write(`[w${v.now.wave} t${(mm && mm.weather.simTime.toFixed(1)) || '?'} ${mm ? mm.weather.phase : ''}] gold=${v.now.gold} hp=${v.now.hero.hp}/${v.now.hero.maxHp} thr=${v.now.threats.alive} works=${JSON.stringify(v.now.works.byKind)} fuel=${mm ? `${mm.fuel.stored.toFixed(1)}/t${mm.fuel.tar} drawn${mm.fuel.drawn.toFixed(1)}` : ''} veh=${mm ? `${mm.vehicle.state}@${mm.vehicle.x.toFixed(0)},${mm.vehicle.z.toFixed(0)}` : ''} del=${mm ? mm.objective.delivered.length : ''} n=${orders.length}\n`);
      child.stdin.write(`${JSON.stringify(orders)}\n`);
    } else {
      console.log(`OUTCOME ${JSON.stringify(v)}`);
    }
  }
});
child.on('close', (code) => {
  if (last) console.log(`LAST wave=${last.now.wave} gold=${last.now.gold} hp=${last.now.hero.hp} motor=${JSON.stringify(last.now.motor ? last.now.motor.objective : null)}`);
  process.exit(code || 0);
});
