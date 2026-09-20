// e4-gusher-county controller — post-ADR-005 grammar (MOVE_HERO aims GRADE/HAUL)
const CAP = 32;
const HERO_SPEED = 6.0;
const LEASES = [                       // index matches twist.deliveries.corridorIds order (closure clock)
  { id: 'camp-to-west-lease',  start: { x: -12, z: -8 }, end: { x: -50, z: -40 } },
  { id: 'camp-to-east-lease',  start: { x: 12,  z: -8 }, end: { x: 48,  z: -38 } },
  { id: 'camp-to-north-lease', start: { x: 0,   z: 8  }, end: { x: 0,   z: 46 } },
];
const ORDER = [0, 2, 1];               // W -> N -> E : cheapest tour (25.9 fuel of 36)
const PARK = { x: -46, z: -42 };       // west-lease build zone, 10wu from both live seams
const WEST_SPOTS = [
  { x: -44, z: -38 }, { x: -50, z: -44 }, { x: -52, z: -38 }, { x: -42, z: -44 },
  { x: -46, z: -36 }, { x: -46, z: -48 }, { x: -38, z: -42 }, { x: -54, z: -44 },
  { x: -36, z: -36 }, { x: -50, z: -34 }, { x: -40, z: -40 }, { x: -52, z: -48 },
];
const CAMP_SPOTS = [
  { x: 6, z: -4 }, { x: -6, z: -4 }, { x: 0, z: 2 }, { x: 0, z: -10 },
  { x: 10, z: 0 }, { x: -10, z: 0 }, { x: 8, z: -10 }, { x: -8, z: -10 },
];
const STOP_BUILDING_AT = 265;

let blacklist = new Set();
let tries = new Map();
let groundBad = 0;

const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const walkT = (d) => d / HERO_SPEED + 0.4;
const closedAt = (idx, t) => {
  const c = Math.floor(t / 30) % 3, w = t - Math.floor(t / 30) * 30;
  return c === idx && w >= 10 && w < 22;
};
const badWindow = (idx, t, dur) => {
  for (let s = -0.5; s <= dur + 2; s += 0.5) if (closedAt(idx, t + s)) return true;
  return false;
};
const key = (p) => `${p.x},${p.z}`;

export default function controller(view, table) {
  const now = view.now;
  const m = now.motor;
  const t = m?.weather?.simTime ?? now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero;
  const panned = now.score?.goldPanned ?? 0;
  const obj = m.objective;

  table.push(`t=${t.toFixed(1)} w=${now.wave} hp=${hero.hp.toFixed(0)}/${hero.maxHp} g=${gold} pan=${panned}`
    + ` hero=(${hero.x.toFixed(1)},${hero.z.toFixed(1)}) veh=${m.vehicle.state}@(${m.vehicle.x.toFixed(0)},${m.vehicle.z.toFixed(0)})`
    + ` tar=${m.fuel.tar}/${m.fuel.stored} drawn=${m.fuel.drawn.toFixed(1)} nodes=${m.fuel.nodes.map(n=>n.harvested?1:0).join('')}`
    + ` graded=[${m.roads.graded}] deliv=[${obj.delivered}] arr=${obj.arrived}`
    + ` alive=${now.threats.alive} works=${JSON.stringify(now.works.byKind)} wrecked=${now.works.wrecked ?? 0}`);

  // record refusals
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      const r = String(rec.reason || rec.detail || '');
      if (/insufficient_gold|gold/i.test(r)) continue;              // ECONOMY: retry, poison nothing
      const k = key(o.where);
      tries.set(k, (tries.get(k) || 0) + 1);
      if (tries.get(k) >= 2) { blacklist.add(k); groundBad++; }     // GROUND: poison the coordinate
    }
  }

  if (now.pendingSecure) return '\n';                                // blank line banks for free

  const A = [];
  const push = (o) => { if (A.length < CAP) A.push(o); };

  // 1. draft first (replace semantics) — plating-first scorer
  if (now.pendingOffer && now.pendingOffer.length) {
    const score = (u) => {
      const s = ((u.name || '') + ' ' + (u.effectText || '') + ' ' + (u.id || '')).toLowerCase();
      let v = 0;
      if (/plating|max hp|maxhp|health|vitality|hearty|tough/.test(s)) v += 100;
      if (/dressing|heal|regen|mend/.test(s)) v += 60;
      if (/damage|spark|coil|tap|bolt|volley|power/.test(s)) v += 30;
      if (/rate|speed|reload|quick/.test(s)) v += 20;
      return v;
    };
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. the errand — a predictive, self-draining chain replanned from live state every view
  let pos = { x: hero.x, z: hero.z };
  let clock = t;
  const move = (p) => { push({ verb: 'MOVE_HERO', pos: { x: +p.x.toFixed(2), z: +p.z.toFixed(2) } }); clock += walkT(d2(pos, p)); pos = { x: p.x, z: p.z }; };

  if (!obj.arrived) {
    const veh = m.vehicle;
    const inFlight = veh.target && veh.state !== 'idle' && veh.state !== 'arrived';
    const pending = inFlight ? veh.target : null;
    const claimed = (p) => pending && Math.hypot(pending.x - p.x, pending.z - p.z) < 3;
    const haul = (dest) => { if (!claimed(dest)) push({ verb: 'HAUL' }); clock += 0.2; };

    // 2a. fuel nodes + grades, east -> west (ends at the west stake)
    const need = 3 - m.fuel.nodes.filter((n) => n.harvested).length;
    const nodesEW = m.fuel.nodes.map((n, i) => ({ ...n, i })).sort((a, b) => b.x - a.x);
    for (const n of nodesEW) {
      if (n.harvested) continue;
      move({ x: n.x - 1.25, z: n.z });
      move({ x: n.x, z: n.z - 1.2 });
      move({ x: n.x - 1.25, z: n.z });
      clock += 0.6;
      for (const [li, L] of LEASES.entries()) {
        if (!m.roads.graded.includes(L.id) && d2(pos, L.start) <= 2.4) { push({ verb: 'GRADE' }); clock += 0.15; }
      }
    }
    if (need > 0 && m.fuel.tar + m.fuel.stored / 4 < 1) { /* nothing yet */ }

    // 2b. deliveries, W -> N -> E, with a hard closure gate on every road drive
    const todo = ORDER.filter((i) => !obj.delivered.includes(LEASES[i].id));
    for (let k = 0; k < todo.length; k++) {
      const li = todo[k];
      const L = LEASES[li];
      const roadLen = d2(L.start, L.end);
      const driveT = roadLen / 15.75;                       // storm-safe on-road estimate
      const vehNearStart = d2(m.vehicle, L.start) < 3 || claimed(L.start);
      // stage the Hauler at the corridor stake
      if (!vehNearStart || A.length === 0) {
        move(L.start);
        if (!m.roads.graded.includes(L.id)) { push({ verb: 'GRADE' }); clock += 0.15; }
        haul(L.start);
      } else if (!m.roads.graded.includes(L.id)) {
        move(L.start); push({ verb: 'GRADE' }); clock += 0.15;
      }
      // deliver: walk to the head, stall out of any closure, then dispatch
      move(L.end);
      if (badWindow(li, clock, driveT)) {
        let target = clock;
        while (badWindow(li, target, driveT)) target += 1;
        const gap = Math.max(0, target - clock);
        const back = Math.min(30, Math.max(3, (gap * HERO_SPEED) / 2));
        const ux = (L.start.x - L.end.x) / roadLen, uz = (L.start.z - L.end.z) / roadLen;
        move({ x: L.end.x + ux * back, z: L.end.z + uz * back });
        move(L.end);
      }
      haul(L.end);
      // call it home along the same road before striking out for the next lease
      if (k < todo.length - 1) {
        move(L.start);
        if (badWindow(li, clock, driveT)) {
          let target = clock;
          while (badWindow(li, target, driveT)) target += 1;
          const gap = Math.max(0, target - clock);
          const back = Math.min(30, Math.max(3, (gap * HERO_SPEED) / 2));
          const ux = (L.end.x - L.start.x) / roadLen, uz = (L.end.z - L.start.z) / roadLen;
          move({ x: L.start.x + ux * back, z: L.start.z + uz * back });
          move(L.start);
        }
        haul(L.start);
      }
    }
  }

  // 3. park in the west lease beside the seams once the errand is done
  const useWest = groundBad < 6;
  if (obj.arrived) move(useWest ? PARK : { x: 0, z: -4 });

  // 4. build ladder — cumulative gate, more candidates than slots, GROUND blacklist
  const spots = useWest ? WEST_SPOTS : CAMP_SPOTS;
  const bk = now.works.byKind || {};
  const buildables = Object.fromEntries((view.stablePrefix.mechanics.buildables || []).map((b) => [b.id, b]));
  const taken = new Set((now.works.entries || []).map((e) => key(e.position || e)));
  if (obj.arrived && t < STOP_BUILDING_AT && A.length < CAP - 3) {
    const plan = [];
    let nT = bk.turret || 0, nB = bk.sentry_beacon || 0;
    const seq = ['turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'turret', 'sentry_beacon'];
    let cum = 0;
    for (const id of seq) {
      const b = buildables[id]; if (!b) continue;
      const cnt = id === 'turret' ? nT : nB;
      if (cnt >= b.maxCount) continue;
      const cost = b.costs[Math.min(cnt, b.costs.length - 1)];
      cum += cost;
      if (cum > gold) break;                                     // plan-time affordability
      const spot = spots.find((s) => !blacklist.has(key(s)) && !taken.has(key(s)) && !plan.some((p) => key(p.where) === key(s)));
      if (!spot) break;
      plan.push({ verb: 'BUILD', what: id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
      if (id === 'turret') nT++; else nB++;
    }
    for (const p of plan) push(p);
  }

  // 5. free supplementary damage
  if ((now.blastReadyInMs ?? 1) === 0) push({ verb: 'BLAST_AT', pos: { x: +(hero.x).toFixed(2), z: +(hero.z + 3).toFixed(2) } });

  // 6. harvest tail — one seam drained in a block before walking; finite coords only
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const from = now.prospector || hero;
  live.sort((a, b) => d2(from, a) - d2(from, b));
  const room = CAP - A.length;
  if (room > 0 && live.length) {
    let i = 0;
    while (A.length < CAP) {
      const s = live[Math.min(Math.floor(i / 7), live.length - 1)];
      push({ verb: 'HARVEST', seam: s.id });
      i++;
      if (i > 40) break;
    }
  }
  if (!A.length) return '\n';
  return A;
}
