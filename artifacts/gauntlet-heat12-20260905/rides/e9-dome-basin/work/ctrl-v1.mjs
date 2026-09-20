// e9-dome-basin controller v1 — THE TWO-SIDED BAIT (the run gen 40 named and never fired).
//
// Geometry: claim+welded hero (0,12). Spawn ring r26 through gates north/west/east
//   => spawn points (0,38), (-26,12), (26,12).
// nearestBuilding counts the claim, so a bait only baits when it beats the claim's 26:
//   east pad corner (28,8)  -> 4.47 from east spawn  (owns the east lane)
//   west pad corner (-28,6) -> 6.32 from west spawn  (owns the west lane)
//   north: nearest zone corner is 34.7 vs claim 26 -> UNBAITABLE, hero's problem.
// A TURRET on those corners both baits its lane AND covers the spawn point (range 16),
// so it kills what it lures instead of being chewed. Gen 40 built a palisade WALL on the
// east pad only; this rides turrets+beacons on BOTH corners.
//
// Roster: feral_terraformer (wrecker, slow 0.6) / claim_jump_prospect_drone (thief, fast 1.1).
// No stockpile => thief target register is empty => drones pursue the hero. Plating first.

const CLAIM = { x: 0, z: 12 };

// Candidates, spaced >=4 apart (palisade footprints overlap at 2), nearest-spawn first.
const EAST = [[28,8],[32,8],[28,4],[36,8],[32,4],[40,8],[28,0],[36,4],[40,4],[28,-4]];
const WEST = [[-28,6],[-32,6],[-28,2],[-36,6],[-32,2],[-40,6],[-28,-2],[-36,2],[-40,2],[-28,-6]];

// Ladder: alternate sides so neither lane is naked; batched per side at plan time.
const LADDER = [
  { what:'turret',        side:'E', cost:50  },
  { what:'sentry_beacon', side:'E', cost:25  },
  { what:'turret',        side:'W', cost:70  },
  { what:'sentry_beacon', side:'W', cost:35  },
  { what:'turret',        side:'E', cost:95  },
  { what:'sentry_beacon', side:'E', cost:45  },
  { what:'turret',        side:'W', cost:125 },
  { what:'sentry_beacon', side:'W', cost:55  },
  { what:'sentry_beacon', side:'E', cost:75  },
  { what:'sentry_beacon', side:'W', cost:95  },
];
// Surplus sink after the ladder: palisade bait mass, alternating sides.
const PAL = [];
for (let i = 0; i < 14; i++) PAL.push({ what:'palisade', side: i % 2 ? 'W' : 'E', cost: 10 });

const badSpot = new Set();   // GROUND refusals only (never insufficient_gold — gen 51)
let submissions = 0;
const MAX_SUBMISSIONS = 150; // byte budget: cap 576,176 B at ~3 KB/entry

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (w, x, z) => `${w}@${x},${z}`;

function scoreUpgrade(o) {
  const s = ((o.id||'') + ' ' + (o.name||'') + ' ' + (o.effectText||'')).toLowerCase();
  let v = 0;
  if (/plating|armou?r|max hp|maxhp|health|vital|tough|hearty/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 90;
  if (/damage|spark|tap|coil|power|volley|pierce/.test(s)) v += 40;
  if (/rate|speed|fire|reload|cool/.test(s)) v += 30;
  if (/gold|luck|pan|seam|prospect/.test(s)) v += 5;
  return v;
}

export function decide(view) {
  const now = view.now;

  // Secure boundary: answer with a BLANK LINE. gr-sim records no entry, the configured
  // `bank` default fires, and the last accepted order stays inside the tick envelope.
  if (now.pendingSecure) return null;

  if (submissions >= MAX_SUBMISSIONS && !now.pendingOffer) return null;

  const orders = [];
  const gold = now.gold ?? 0;
  const entries = now.works?.entries ?? [];

  // --- refusal blacklist, partitioned GROUND vs ECONOMY (gen 51) ---
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
    const why = String(rec.reason || rec.detail || '');
    if (/insufficient_gold/i.test(why)) continue;          // transient: poison NOTHING
    if (/out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i.test(why))
      badSpot.add(key(o.what, o.where.x, o.where.z));
  }

  // 1) draft first, under REPLACE semantics
  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2) free supplementary damage into the scrum standing on the welded hero
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { ...CLAIM } });

  // --- occupancy: which candidate coords already carry a work ---
  const taken = new Set();
  for (const e of entries) {
    const p = e.position || e;
    if (p && Number.isFinite(p.x)) taken.add(`${Math.round(p.x)},${Math.round(p.z)}`);
  }
  const free = (side, what) => {
    const list = side === 'E' ? EAST : WEST;
    for (const [x, z] of list) {
      if (taken.has(`${x},${z}`)) continue;
      if (badSpot.has(key(what, x, z))) continue;
      return { x, z };
    }
    return null;
  };
  const built = {};
  for (const e of entries) built[e.id] = (built[e.id] || 0) + 1;

  // 3) the ladder: find the next unbuilt rung, then batch every FOLLOWING rung on the
  //    SAME side under cumulative gating, so one commute lands the whole affordable batch.
  const want = { turret: 0, sentry_beacon: 0, palisade: 0 };
  const plan = [...LADDER, ...PAL];
  let nextIdx = -1;
  for (let i = 0; i < plan.length; i++) {
    want[plan[i].what]++;
    if ((built[plan[i].what] || 0) < want[plan[i].what]) { nextIdx = i; break; }
  }
  let ladderDone = false;
  if (nextIdx < 0) ladderDone = true;
  else {
    const side = plan[nextIdx].side;
    const localTaken = new Set(taken);
    let cum = 0, placed = 0;
    for (let i = nextIdx; i < plan.length && placed < 4; i++) {
      if (plan[i].side !== side) continue;
      cum += plan[i].cost;
      if (cum > gold) break;                        // plan-time affordability only
      const list = side === 'E' ? EAST : WEST;
      let spot = null;
      for (const [x, z] of list) {
        if (localTaken.has(`${x},${z}`)) continue;
        if (badSpot.has(key(plan[i].what, x, z))) continue;
        spot = { x, z }; break;
      }
      if (!spot) break;
      localTaken.add(`${spot.x},${spot.z}`);
      orders.push({ verb:'BUILD', what: plan[i].what, where: spot, when: { goldGte: cum } });
      placed++;
    }
    // If nothing was affordable, still park the cheapest next rung so it fires on arrival.
    if (placed === 0) {
      const spot = free(plan[nextIdx].side, plan[nextIdx].what);
      if (spot) orders.push({ verb:'BUILD', what: plan[nextIdx].what, where: spot,
                              when: { goldGte: plan[nextIdx].cost } });
    }
    if ((built.turret || 0) >= 4 && (built.sentry_beacon || 0) >= 6) ladderDone = true;
  }

  // 4) mend the bait — gated on the gold it will need when it ARRIVES (gen 40)
  const damaged = entries.some(e => e.wrecked || (e.hp != null && e.maxHp && e.hp < e.maxHp * 0.6));
  if (damaged && gold >= 30) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 60 });
    orders.push({ verb: 'REPAIR_UNDER', pct: 60 });
  }

  // 5) capped-purse sink: turret tier upgrade. CONTEXT_ACTION does not travel.
  if (ladderDone && gold >= 150) {
    const t = entries.find(e => e.id === 'turret' && (e.tier == null || e.tier < 2));
    if (t && t.position) {
      orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade',
                    target: { id: 'turret', index: t.index } });
    }
  }

  // 6) the tail: drain the nearest live seam in a BLOCK before walking (gen 47).
  //    Emitted UNCONDITIONALLY and never filtered to empty (gen 42/51) — the failures
  //    are the clock, and they cost nothing where the Prospector already stands.
  const pro = now.prospector || CLAIM;
  const all = now.seams || [];
  const live = all.filter(s => s.active && Number.isFinite(s.x))
                  .sort((a, b) => d(pro, a) - d(pro, b));
  const chain = live.length ? live : all;
  const slots = Math.max(0, 30 - orders.length);
  const per = 7;
  for (let i = 0; i < slots; i++) {
    const s = chain[Math.floor(i / per) % chain.length];
    orders.push({ verb: 'HARVEST', seam: s.id });
  }
  if (orders.length === 0) orders.push({ verb: 'HOLD', pos: { ...CLAIM } });

  submissions++;
  return orders.slice(0, 32);
}
