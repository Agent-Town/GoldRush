// gen-128 controller for e4-dust-flats / e4-dust-flats-01, era 6.
// Phase A: one self-draining errand array (tar zigs -> stake -> GRADE -> HAUL -> railhead -> HAUL -> home).
// Phase B: the gen-6->127 skeleton, with a 4-turret ring at r=17.692 (crane-safe: 24-17.692=6.308 > reach 6).

const HOME = { x: 0, z: 14 };            // 2 north turrets at 12.04 (<16); 10 wu of orbit clearance
const STAKE = [{ x: 0, z: 12 }, { x: 1.8, z: 12 }];      // camp-to-railhead start, gradeReach 2.5
const RAILHEAD = [{ x: 0, z: 71 }, { x: 1.6, z: 70.6 }]; // inside stopReach 2.5, off the marker
const NODES = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }]; // west-first = 44 wu

// r = sqrt(144+169) = 17.692 -> crane margin 6.308; arc half-angle 41.8 deg each (~334 of the lap)
const RING = [
  [{ x: 12, z: 13 }, { x: 13, z: 12 }, { x: 11, z: 14 }],
  [{ x: -12, z: 13 }, { x: -13, z: 12 }, { x: -11, z: 14 }],
  [{ x: 12, z: -13 }, { x: 13, z: -12 }, { x: 11, z: -14 }],
  [{ x: -12, z: -13 }, { x: -13, z: -12 }, { x: -11, z: -14 }],
];
const BEACONS = [{ x: 4, z: 15 }, { x: -4, z: 15 }, { x: 0, z: 18 }, { x: 6, z: 11 }];

// The cheapest gun first: 25 g lands a beacon ~20 s before the first 50 g turret could,
// and an unattended hero dies at wave 2 here (published null floor w2/79.0 s).
const LADDER = [
  { id: 'sentry_beacon', spots: [{ x: 0, z: 17 }, { x: 2, z: 17 }, { x: -2, z: 17 }], core: true },
  { id: 'sentry_beacon', spots: [{ x: 4, z: 12 }, { x: 5, z: 13 }], core: true },
  ...RING.map((spots) => ({ id: 'turret', spots, core: true })),
  ...BEACONS.map((p) => ({ id: 'sentry_beacon', spots: [p], core: false })),
];

const HARD_STOP = 330;      // no BUILD at all after this; let the purse refill for the wave-14 bank
const bad = new Set();      // GROUND refusals only (poison the coordinate)
let errandDone = false;

const key = (p) => `${p.x},${p.z}`;
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function zig(n) {
  return [{ x: n.x, z: n.z }, { x: n.x - 1.1, z: n.z }, { x: n.x + 1.0, z: n.z }]
    .map((p) => ({ verb: 'MOVE_HERO', pos: p }));
}

function scoreOffer(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|armou?r|max ?hp|toughness|vitality/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
  if (/damage|spark|coil|tap|bolt|blast/.test(s)) return 60;
  return 10;
}

export default function decide(view, n) {
  const now = view.now || {};
  const orders = [];

  // --- secure boundary: SILENCE. Cannot be rejected; takes the bank default. ---
  if (now.pendingSecure) return null;

  // --- draft first, under replace semantics ---
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = now.pendingOffer.slice().sort((a, b) => scoreOffer(b) - scoreOffer(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // --- learn GROUND refusals from the view (ECONOMY refusals poison nothing) ---
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const r = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (/insufficient|gold/.test(r)) continue;            // transient: retry, poison nothing
    if (/zone|reach|collision|terrain|unreachable|cap/.test(r)) bad.add(key(o.where));
  }

  const t = now.timers?.runSeconds ?? 0;
  const hero = now.hero || {};
  const motor = now.motor || {};
  const arrived = !!motor.objective?.arrived;
  if (arrived) errandDone = true;

  // ============ PHASE A: the errand, one self-draining array ============
  if (!errandDone) {
    const fuel = motor.fuel || {};
    for (const nd of (fuel.nodes || NODES)) {
      if (nd.harvested) continue;
      orders.push(...zig(nd));
    }
    const graded = (motor.roads?.corridors || []).find((c) => c.id === 'camp-to-railhead')?.graded;
    if (!graded) {
      for (const s of STAKE) orders.push({ verb: 'MOVE_HERO', pos: s });
      orders.push({ verb: 'GRADE' });
      orders.push({ verb: 'HAUL' });                       // stage the Hauler at the road's start
    }
    for (const r of RAILHEAD) orders.push({ verb: 'MOVE_HERO', pos: r });
    orders.push({ verb: 'HAUL' });                         // drive it up the graded road
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
    // NEVER gate the fort behind the errand: the ladder rides in this phase too.
    orders.push(...ladder(view, now, t));
    // tail so the array never ends empty and the Prospector keeps earning
    orders.push(...harvestTail(now, 32 - orders.length));
    return orders.slice(0, 32);
  }

  // ============ PHASE B: the fort ============
  // free damage, above anything that travels (BLAST_AT returns {} either way)
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: HOME.x, z: HOME.z + 6 } });

  // come home ABOVE the ladder and the tail, only when actually displaced
  if (hero.x != null && d2(hero, HOME) > 1.2) orders.push({ verb: 'MOVE_HERO', pos: HOME });

  orders.push(...ladder(view, now, t));
  orders.push(...harvestTail(now, 32 - orders.length));
  return orders.slice(0, 32);
}

// one ladder, ONE ordinal per id, priced at its live instance; retire a rung with no ground left
function ladder(view, now, t) {
  if (t >= HARD_STOP) return [];
  const hero = now.hero || {};
  const byKind = now.works?.byKind || {};
  const costsOf = (id) => (view.stablePrefix?.mechanics?.buildables || [])
    .find((b) => b.id === id)?.costs || [];
  const seen = {};
  const hurt = (hero.maxHp ? hero.hp / hero.maxHp : 1) < 0.60;
  for (const rung of LADDER) {
    const ord = (seen[rung.id] = (seen[rung.id] || 0) + 1);
    if (!rung.core && !hurt) continue;                    // surplus fort stays behind the latch
    const standing = byKind[rung.id] || 0;
    if (standing >= ord) continue;                        // this rung is already satisfied
    const spot = rung.spots.find((p) => !bad.has(key(p)));
    if (!spot) continue;                                  // no ground left: RETIRE, never stall
    const cost = costsOf(rung.id)[standing];
    if (cost == null || (now.gold || 0) < cost) return []; // plan-time affordability
    return [{ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cost } }];
  }
  return [];
}

function harvestTail(now, room) {
  if (room <= 0) return [];
  const hero = now.hero || {};
  const live = (now.seams || []).filter(
    (s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const out = [];
  if (!live.length) {
    // never let the tail be empty: name a seam anyway so the failing order parks the worker
    const any = (now.seams || [])[0];
    if (any) for (let i = 0; i < Math.min(room, 6); i++) out.push({ verb: 'HARVEST', seam: any.id });
    return out;
  }
  const anchor = hero.x != null ? hero : HOME;
  live.sort((a, b) => d2(anchor, a) - d2(anchor, b));
  // drain the nearest seam in a block before walking; alternate with the runner-up
  const chain = live.length > 1 ? [live[0], live[1]] : [live[0]];
  let i = 0;
  while (out.length < room) {
    const s = chain[Math.floor(i / 7) % chain.length];
    out.push({ verb: 'HARVEST', seam: s.id });
    i++;
  }
  return out;
}
