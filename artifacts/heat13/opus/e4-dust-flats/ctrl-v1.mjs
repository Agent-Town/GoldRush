// e4-dust-flats controller, heat 13 grammar (MOVE_HERO / no MOVE_TO / no HOLD).
//
// Contract: secure = wave>=12 AND motor.objective.arrived AND baron (Land-Yacht, wave 14) beaten.
// Errand: GRADE camp-to-railhead from its stake (0,12), stage the Hauler there, then HAUL to (0,70)
//   (within stopReach 2.5 of the objective stop (0,72)). GRADE and HAUL both read THE HERO'S position.
// Fuel: 3 nodes at (-12,-8),(0,-8),(12,-8); harvestRange 1.35, harvestSeconds 0.5; any body counts,
//   so the hero itself harvests them on the way south. Dwell hops because MOVE_HERO has no wait.
// Fort: Land-Yacht orbits centre (0,0) radius 24. Turret range 16 -> arc half-angle
//   acos((r^2+320)/(48r)); flat near r=15..18. Crane (act 2, after wheels die) reaches 6 from the
//   pinned boss at radius 24, one-shotting turrets, so r must be < 18. r = 15 gives 9 units of margin
//   AND still covers a hero standing at (0,0) (15 < range 16). Home = the orbit centre.

const HOME = { x: 0, z: 0 };
const TAR = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }];
const GRADE_STAKE = { x: 0, z: 11.4 };   // corridor start (0,12), gradeReach 2.5
const RAILHEAD = { x: 0, z: 70 };        // stop (0,72), stopReach 2.5

const R = 15, D = R / Math.SQRT2; // 10.607
const TURRET_SPOTS = [
  { x: D, z: D }, { x: -D, z: D }, { x: -D, z: -D }, { x: D, z: -D },
  { x: R, z: 0 }, { x: 0, z: R }, { x: -R, z: 0 }, { x: 0, z: -R },
  { x: 13.5, z: 6.5 }, { x: -13.5, z: 6.5 }, { x: -13.5, z: -6.5 }, { x: 13.5, z: -6.5 },
  { x: 6.5, z: 13.5 }, { x: -6.5, z: 13.5 }, { x: -6.5, z: -13.5 }, { x: 6.5, z: -13.5 },
];
const BEACON_SPOTS = [
  { x: 0, z: 5 }, { x: 5, z: 0 }, { x: 0, z: -5 }, { x: -5, z: 0 },
  { x: 4, z: 4 }, { x: -4, z: -4 }, { x: 4, z: -4 }, { x: -4, z: 4 },
  { x: 0, z: 8 }, { x: 8, z: 0 }, { x: 0, z: -8 }, { x: -8, z: 0 },
];

const badSpots = new Set();          // GROUND refusals only
const tries = new Map();             // per-spot patience budget
let costsByKind = null;
let lastNearIds = [];

const key = (p) => `${p.x},${p.z}`;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

function readCosts(view) {
  if (costsByKind) return costsByKind;
  costsByKind = {};
  for (const b of view.stablePrefix?.mechanics?.buildables || []) {
    costsByKind[b.id] = { costs: b.costs || [], max: b.maxCount ?? 99 };
  }
  return costsByKind;
}
function priceOf(kind, count) {
  const c = costsByKind?.[kind];
  if (!c || !c.costs.length) return kind === 'turret' ? 50 : 25;
  if (count < c.costs.length) return c.costs[count];
  let p = c.costs[c.costs.length - 1];
  for (let i = c.costs.length; i <= count; i += 1) p = Math.ceil(p * 1.35 / 5) * 5;
  return p;
}

function noteRefusals(now) {
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || rec.status !== 'failed') continue;
    const w = o.where; if (!w) continue;
    const k = `${w.x},${w.z}`;
    const reason = String(rec.reason || rec.detail || '');
    if (/insufficient_gold/i.test(reason)) continue;          // ECONOMY: retry, poison nothing
    if (/out_of_zone|collision|cap_reached|UNREACHABLE|terrain|out_of_reach/i.test(reason)) {
      badSpots.add(k); continue;
    }
    tries.set(k, (tries.get(k) || 0) + 1);
    if ((tries.get(k) || 0) >= 4) badSpots.add(k);
  }
}

function pickUpgrade(now) {
  const offer = now.pendingOffer;
  if (!offer || !offer.length) return null;
  const score = (u) => {
    const s = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
    let v = 0;
    if (/plating|max hp|maxhp|vitality|tough|hardy/.test(s)) v += 100;
    if (/dressing|heal|regen|mend|restore/.test(s)) v += 80;
    if (/spark|damage|coil|tap|power|volley|shot/.test(s)) v += 40;
    if (/rate|speed of fire|cadence|reload/.test(s)) v += 30;
    if (/range|reach/.test(s)) v += 20;
    if (/pan|gold|luck|prospect/.test(s)) v += 10;
    return v;
  };
  const best = offer.slice().sort((a, b) => score(b) - score(a))[0];
  return { verb: 'PICK_UPGRADE', id: best.id };
}

function seamTail(now, slots) {
  const out = [];
  const p = now.prospector || HOME;
  const live = (now.seams || []).filter((s) => s.active === true && fin(s.x) && fin(s.z));
  if (live.length) {
    live.sort((a, b) => dist(a, p) - dist(b, p));
    lastNearIds = live.slice(0, 3).map((s) => s.id);
    const first = live[0];
    const second = live.find((s) => s !== first && dist(s, first) <= 45);
    const nFirst = second ? Math.max(4, slots - 5) : slots;
    for (let i = 0; i < nFirst && out.length < slots; i += 1) out.push({ verb: 'HARVEST', seam: first.id });
    if (second) for (let i = 0; i < 5 && out.length < slots; i += 1) out.push({ verb: 'HARVEST', seam: second.id });
  } else {
    // Everything depleted: re-emit the last-known near ids. They fail where the Prospector already
    // stands (free, no travel) and each new failure buys a decision point.
    const ids = lastNearIds.length ? lastNearIds : ['gold-seam-1', 'gold-seam-2', 'gold-seam-3'];
    for (let i = 0; out.length < slots; i += 1) out.push({ verb: 'HARVEST', seam: ids[i % ids.length] });
  }
  return out;
}

export default function controller(view) {
  const now = view.now || {};
  if (now.pendingSecure) return null;          // blank line -> configured default (bank)
  readCosts(view);
  noteRefusals(now);

  const motor = now.motor || {};
  const obj = motor.objective || {};
  const hero = { x: now.hero?.x ?? 0, z: now.hero?.z ?? 0 };
  const orders = [];

  const up = pickUpgrade(now);
  if (up) orders.push(up);                      // draft first under replace semantics

  // ---- ERRAND PHASE: nothing else matters until the Hauler rests at the railhead ----
  if (!obj.arrived) {
    const nodes = motor.fuel?.nodes || [];
    const tar = motor.fuel?.tar ?? 0;
    const stored = motor.fuel?.stored ?? 0;
    const fuelInHand = tar * 4 + stored;
    const unharvested = TAR.filter((t, i) => !(nodes[i]?.harvested));
    const graded = (motor.roads?.corridors || []).find((c) => c.id === 'camp-to-railhead')?.graded;

    // Need ~21 fuel measured; take every node we can while cheap.
    if (unharvested.length && fuelInHand < 34) {
      for (const t of unharvested) {
        orders.push({ verb: 'MOVE_HERO', pos: { x: t.x, z: t.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: t.x + 0.5, z: t.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: t.x, z: t.z + 0.5 } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: t.x, z: t.z } });
      }
    }
    if (!graded) {
      orders.push({ verb: 'MOVE_HERO', pos: GRADE_STAKE });
      orders.push({ verb: 'GRADE' });
      orders.push({ verb: 'HAUL' });                       // stage the Hauler on the road stake
    }
    orders.push({ verb: 'MOVE_HERO', pos: RAILHEAD });
    orders.push({ verb: 'HAUL' });                         // re-issuing a short HAUL is nearly free
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
    while (orders.length < 32) orders.push({ verb: 'HARVEST', seam: (now.seams || []).find((s) => s.active && fin(s.x))?.id || 'gold-seam-1' });
    return orders.slice(0, 32);
  }

  // ---- FORT / ECONOMY PHASE ----
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: hero.x, z: hero.z + 1 } });
  if (dist(hero, HOME) > 0.6) orders.push({ verb: 'MOVE_HERO', pos: HOME });

  const entries = now.works?.entries || [];
  const counts = {};
  for (const e of entries) counts[e.id] = (counts[e.id] || 0) + 1;
  const used = new Set(entries.map((e) => `${Math.round((e.position?.x ?? e.x) * 10) / 10},${Math.round((e.position?.z ?? e.z) * 10) / 10}`));
  const occupied = (p) => entries.some((e) => {
    const ex = e.position?.x ?? e.x, ez = e.position?.z ?? e.z;
    return fin(ex) && Math.hypot(ex - p.x, ez - p.z) < 2.6;
  });

  // Ladder: four turrets (the only reach onto the radius-24 orbit AND cover for the hero at (0,0)),
  // then beacons out of surplus. Cumulative gating so a cheap rung can never steal an expensive one.
  const plan = [];
  const tMax = Math.min(4, costsByKind?.turret?.max ?? 4);
  const bMax = Math.min(6, costsByKind?.sentry_beacon?.max ?? 6);
  let tCount = counts.turret || 0, bCount = counts.sentry_beacon || 0;
  const takeSpot = (list, taken) => list.find((p) => !badSpots.has(key(p)) && !taken.has(key(p)) && !occupied(p) && !used.has(key(p)));
  const taken = new Set();
  for (let i = tCount; i < tMax; i += 1) {
    const spot = takeSpot(TURRET_SPOTS, taken); if (!spot) break;
    taken.add(key(spot)); plan.push({ kind: 'turret', spot, price: priceOf('turret', i) });
  }
  for (let i = bCount; i < bMax; i += 1) {
    const spot = takeSpot(BEACON_SPOTS, taken); if (!spot) break;
    taken.add(key(spot)); plan.push({ kind: 'sentry_beacon', spot, price: priceOf('sentry_beacon', i) });
  }
  let cum = 0;
  const buildSlots = Math.min(plan.length, 10);
  for (let i = 0; i < buildSlots; i += 1) {
    cum += plan[i].price;
    orders.push({ verb: 'BUILD', what: plan[i].kind, where: plan[i].spot, when: { goldGte: cum } });
  }

  // Capped-purse sink: tier upgrades once the ladder has nothing left to place.
  if (plan.length === 0) {
    const t2 = entries.find((e) => (e.tier ?? 1) < 2 && e.id === 'turret');
    if (t2 && (now.gold ?? 0) >= 150) {
      const ex = t2.position?.x ?? t2.x, ez = t2.position?.z ?? t2.z;
      orders.push({ verb: 'MOVE_HERO', pos: { x: ex + (ex >= 0 ? -0.7 : 0.7), z: ez + (ez >= 0 ? -0.7 : 0.7) } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: t2.id, index: t2.index } });
      orders.push({ verb: 'MOVE_HERO', pos: HOME });
    }
  }

  orders.push(...seamTail(now, Math.max(0, 32 - orders.length)));
  return orders.slice(0, 32);
}
