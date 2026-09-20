// e8-far-side controller.
// Board facts (all read from view 0 / source):
//  - claim/hero start (0,-36); landing yard x[-24,24] z[-48,-30] is BOTH the build zone and the
//    only pressurised ground; crater x[-14,14] z[38,52].
//  - crossing: 4 credits, one per 120 s window, hero body, 60 s suit, 5 hp/s when empty.
//    windows open at t = 0,120,240,360,480 -> take the trip at each window's first view.
//  - probe recovery gates the secure too: CONTEXT_ACTION recover from inside the crater.
//  - roster is one id, sun_glare_shambler: no wrecker, no thief. Works cannot be attacked and gold
//    cannot be stolen -> REPAIR_UNDER is dead weight, stockpile is safe.
//  - hero 6.0 u/s against enemy 2.7*0.72 = 1.94 -> the hero outruns everything 3:1. Kiting is a
//    shutout; it costs the tick (a walking MOVE_HERO owns it, so nothing pans or builds).

const YARD = { minX: -24, maxX: 24, minZ: -48, maxZ: -30 };
const HOME = { x: 0, z: -40 };
const CRATER_AIM = { x: 0, z: 42 };

// Kite line along the yard's south side, inside the beacon row's radius-8 cover.
const KITE = [{ x: -20, z: -44 }, { x: 20, z: -44 }];

const TURRET_SPOTS = [
  { x: -14, z: -33 }, { x: -5, z: -33 }, { x: 5, z: -33 }, { x: 14, z: -33 },
  { x: -19, z: -33 }, { x: 19, z: -33 }, { x: -9, z: -36 }, { x: 9, z: -36 },
];
const BEACON_SPOTS = [
  { x: -18, z: -43 }, { x: -11, z: -43 }, { x: -4, z: -43 }, { x: 4, z: -43 },
  { x: 11, z: -43 }, { x: 18, z: -43 },
  { x: -15, z: -46 }, { x: -7, z: -46 }, { x: 7, z: -46 }, { x: 15, z: -46 },
  { x: -21, z: -40 }, { x: 21, z: -40 },
];
const STOCKPILE_SPOTS = [
  { x: -21, z: -46 }, { x: 21, z: -46 }, { x: -22, z: -36 }, { x: 22, z: -36 },
];
// Palisades: a north-facing screen with a deliberate corridor at x = 0 for the errand.
const PALISADE_SPOTS = [];
for (const z of [-31, -34]) {
  for (const x of [-22, -18, -14, -10, -6, 6, 10, 14, 18, 22]) PALISADE_SPOTS.push({ x, z });
}

// One ladder, strategy order. Beacons lead: generation 67 measured beacons-first at w14/443 s
// against turrets-first at w12/364 s on this seed, because the thing that dies here is the hero
// and a radius-8 beacon sits on top of her where a range-16 turret covers ground.
const LADDER = [
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'stockpile', spots: STOCKPILE_SPOTS },
  { id: 'stockpile', spots: STOCKPILE_SPOTS },
];
for (let i = 0; i < 16; i += 1) LADDER.push({ id: 'palisade', spots: PALISADE_SPOTS });

const GROUND_REASONS = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|terrain/i;
const ECON_REASONS = /insufficient_gold/i;

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plating|max hp|maxhp|tough|vigor|armor|armour/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
  if (/damage|spark|coil|tap|power/.test(s)) return 60;
  if (/fire rate|rate|haste|cool/.test(s)) return 50;
  return 10;
}

export default function controller(view, state) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};

  if (!state.init) {
    state.init = true;
    state.badSpots = new Set();
    state.costs = {};
    for (const b of (sp.mechanics && sp.mechanics.buildables) || []) state.costs[b.id] = b.costs || [];
    state.maxCount = {};
    for (const b of (sp.mechanics && sp.mechanics.buildables) || []) state.maxCount[b.id] = b.maxCount ?? 0;
    state.retired = new Set();
  }

  // Silence at the secure boundary: takes the configured bank default, records no entry, and
  // cannot be REJECTED (a refused in-window submission is invisible to the tape and visible to
  // the sim, which is how a clean reel desynchronises on replay).
  if (now.pendingSecure) return null;

  // Refusal blacklist, partitioned. GROUND poisons the coordinate; ECONOMY poisons nothing.
  for (const rec of (now.orders || [])) {
    const o = rec.order || {};
    if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
    const reason = String(rec.reason || rec.detail || '');
    if (ECON_REASONS.test(reason)) continue;
    if (GROUND_REASONS.test(reason) || reason) state.badSpots.add(`${o.where.x},${o.where.z}`);
  }

  const t = (now.timers && (now.timers.runSeconds ?? now.timers.simTimeSeconds)) ?? 0;
  const wave = now.wave ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero || { x: 0, z: -36, hp: 100, maxHp: 100 };
  const hpFrac = (hero.maxHp ? hero.hp / hero.maxHp : 1);
  const air = now.air || {};
  const cross = air.crossing || {};
  const credited = cross.credited ?? 0;
  const required = cross.required ?? 4;
  const thisWindow = cross.creditedThisWindow ?? 0;
  const probe = now.probeRecovery || {};
  const byKind = (now.works && now.works.byKind) || {};

  const orders = [];

  // 1. Draft first, under replace semantics.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage. BLAST_AT returns {} on success AND failure, so it is safe
  //    anywhere and belongs ABOVE the traveller.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: Math.round(hero.x), z: Math.round(hero.z) + 4 } });
  }

  // 3. THE ERRAND. One self-draining round trip per window, taken at the window's first view.
  //    Both era gates ride on it: the crossing credit and the one-time probe recovery.
  const owesCrossing = credited < required;
  const tripDue = owesCrossing && thisWindow === 0;
  const outside = hero.z > YARD.maxZ;
  if (tripDue) {
    orders.push({ verb: 'MOVE_HERO', pos: CRATER_AIM });
    if (!probe.recovered) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  } else if (outside) {
    // Credit banked (or window spent) while still out there: come home to air, above everything.
    if (!probe.recovered && hero.z >= 38) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // 4. KITE PHASE. The hero outruns the roster 3:1, so once the fort stands the cheapest defence
  //    is to never be standing. It costs the tick, so it is gated behind the pressure knee.
  const coreDone = (byKind.sentry_beacon || 0) >= 6 && (byKind.turret || 0) >= 4;
  const kiting = !tripDue && !outside && (coreDone || wave >= 14 || hpFrac < 0.30);
  if (kiting) {
    const legs = coreDone || wave >= 14 ? 8 : 2;
    let near = dist(hero, KITE[0]) < dist(hero, KITE[1]) ? 1 : 0;
    for (let i = 0; i < legs; i += 1) { orders.push({ verb: 'MOVE_HERO', pos: KITE[near] }); near ^= 1; }
  }

  // 5. ONE ladder, ONE ordinal per id, priced at its live instance. A rung with no candidate
  //    spots left is RETIRED rather than left to stall the rungs behind it.
  const filled = ((now.works && now.works.entries) || []).map((e) => e.position).filter(Boolean);
  const taken = (sp2) => filled.some((p) => Math.hypot(p.x - sp2.x, p.z - sp2.z) < 1.6);
  let cumulative = 0;
  let emitted = 0;
  const seen = {};
  for (let i = 0; i < LADDER.length; i += 1) {
    const rung = LADDER[i];
    seen[rung.id] = (seen[rung.id] || 0) + 1;
    if (state.retired.has(i)) continue;
    const standing = byKind[rung.id] || 0;
    if (standing >= seen[rung.id]) continue;
    const cap = state.maxCount[rung.id] ?? 0;
    if (standing >= cap) { state.retired.add(i); continue; }
    const costs = state.costs[rung.id] || [];
    const cost = costs[Math.min(standing, costs.length - 1)] ?? 9999;
    const spot = rung.spots.find((s) => !state.badSpots.has(`${s.x},${s.z}`) && !taken(s));
    if (!spot) { state.retired.add(i); continue; }
    // Hard build floor: nothing bought in the closing window, so the purse can refill toward cap.
    if (t > 545) break;
    if (gold < cumulative + cost) break;
    cumulative += cost;
    orders.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cumulative } });
    emitted += 1;
    if (emitted >= 2) break;
  }

  // 6. Gold sink once the core stands: turret tier 2 (x1.4 damage, x1.18 fire rate).
  //    CONTEXT_ACTION does not travel, so it needs a MOVE_HERO onto the work first. Only while
  //    parked (never during a trip or a kite), and only when it is already affordable.
  if (!tripDue && !outside && !kiting && t < 540) {
    const entries = (now.works && now.works.entries) || [];
    const t1 = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2);
    if (t1 && gold >= 150 && t1.position) {
      const p = t1.position;
      const toward = { x: p.x + (HOME.x - p.x) * 0.1, z: p.z + (HOME.z - p.z) * 0.1 };
      const len = Math.hypot(toward.x - p.x, toward.z - p.z) || 1;
      const stand = { x: +(p.x + (toward.x - p.x) / len * 0.9).toFixed(2), z: +(p.z + (toward.z - p.z) / len * 0.9).toFixed(2) };
      orders.push({ verb: 'MOVE_HERO', pos: stand });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t1.index } });
    }
  }

  // 7. Park at home when nothing else wants the hero, so the suit refills and the Prospector
  //    drifts into the fort. Emitted once; it completes and falls through.
  if (!tripDue && !outside && !kiting && dist(hero, HOME) > 1.0) {
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // 8. Harvest tail. An inactive seam publishes x/z/anchorIndex as null and one non-finite number
  //    refuses the WHOLE array silently, so finiteness is filtered before any sort.
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => dist(a, HOME) - dist(b, HOME));
  if (live.length) {
    const order = [];
    for (let b = 0; b < 6 && orders.length + order.length < 32; b += 1) {
      const s = live[b % live.length];
      for (let k = 0; k < 6; k += 1) order.push({ verb: 'HARVEST', seam: s.id });
    }
    for (const o of order) { if (orders.length >= 32) break; orders.push(o); }
  }

  return orders.slice(0, 32);
}
