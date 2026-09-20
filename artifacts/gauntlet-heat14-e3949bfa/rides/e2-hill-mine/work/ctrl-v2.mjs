// e2-hill-mine controller v2. One cause, several faces, changed from v1:
//
//   v1 held a PERFECT fort to wave 11 (9 standing, 0 wrecked, hero 175/175)
//   and lost 250 of 464 worksHp inside wave 12 alone, dying at w13. The cause
//   is hp per gold: turret 50 base (cap 3x), beacon 40 (cap 4x), against
//   palisade 60 base +8/wave to a 5x cap -- for TEN GOLD. Timber is 5-10x the
//   hp per gold, and every wrecker on this board is a steam_wrecker out of the
//   single north gate (0,46). So a timber line on the NORTH FACE is the shield
//   the fort never had, and it is cheaper than the two beacons it replaces.
//
//   Also cured: v1 burned all five hero posts to UNREACHABLE_TERRAIN in 0.4s
//   (a landmark blocks z 9..11 around the claim; (+-2,9) refused for builds too).
//   Phase 1 now emits NO MOVE_HERO at all -- the hero already stands where the
//   fort wants it -- and the kite posts are blacklisted by coordinate, never by
//   an index that marches off the end of the list.

const BLAST = { x: 0, z: 1 };                       // on the rail line, ~11 from the hero's start
const KITE = [                                       // inside turret cover (range 16 from x=+-9)
  [{ x: -12, z: 13 }, { x: 12, z: 13 }],
  [{ x: -14, z: 12 }, { x: 14, z: 12 }],
  [{ x: -10, z: 14 }, { x: 10, z: 14 }],
];

const LADDER = [
  'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'turret',
  // the shield, landing ~wave 8-11 (later = tougher: hp scales at build time)
  ...Array(14).fill('palisade'),
  'sentry_beacon', 'sentry_beacon',
  ...Array(20).fill('palisade'),                     // unbounded surplus sink
];

const SPOTS = {
  turret: [
    { x: -6, z: 9 }, { x: 6, z: 9 }, { x: -9, z: 9 }, { x: 9, z: 9 },
    { x: -12, z: 9 }, { x: 12, z: 9 }, { x: -7, z: 10 }, { x: 7, z: 10 },
  ],
  sentry_beacon: [
    { x: -4, z: 12 }, { x: 4, z: 12 }, { x: -8, z: 12 }, { x: 8, z: 12 },
    { x: -6, z: 14 }, { x: 6, z: 14 }, { x: -11, z: 12 }, { x: 11, z: 12 },
  ],
  // North face, rotationSteps 1 => 3 wide in x, 1 deep in z: pieces at spacing 3
  // sit exactly edge-to-edge (the placement test is a strict AABB `<`).
  palisade: [
    ...[-15, -12, -9, -6, -3, 3, 6, 9, 12, 15].map((x) => ({ x, z: 15 })),
    ...[-15, -12, -9, -6, -3, 3, 6, 9, 12, 15].map((x) => ({ x, z: 16 })),
    ...[-18, -21, 18, 21].map((x) => ({ x, z: 15 })),
    ...[-15, -12, -9, -6, -3, 3, 6, 9, 12, 15].map((x) => ({ x, z: 13 })),
  ],
};
const PAL_ROT = 1;

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i;
const blacklist = new Set();
const heroBlack = new Set();
const key = (p) => `${p.x},${p.z}`;

let costsById = null;
let kiteLeg = 0;

export default function controller(view) {
  const now = view.now;

  // The secure boundary accepts exactly ONE order; any other array is refused
  // whole, burns the choice clock and desyncs the replay (gen 84, on e2-incline).
  // Silence takes the `bank` default and cannot be rejected.
  if (now.pendingSecure) return null;

  if (!costsById) {
    costsById = {};
    for (const b of (view.stablePrefix.mechanics.buildables || [])) costsById[b.id] = b.costs || [];
  }

  for (const rec of (now.orders || [])) {
    const o = rec.order || {};
    if (rec.status !== 'failed') continue;
    const why = `${rec.reason || ''} ${rec.detail || ''}`;
    if (!GROUND.test(why)) continue;                 // insufficient_gold poisons nothing
    if (o.verb === 'BUILD' && o.where) blacklist.add(key(o.where));
    if (o.verb === 'MOVE_HERO' && o.pos) heroBlack.add(key(o.pos));
  }

  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const gold = now.gold || 0;
  const hp = now.hero ? now.hero.hp : 100;
  const maxHp = now.hero ? now.hero.maxHp : 100;
  const hpFrac = maxHp > 0 ? hp / maxHp : 1;
  const wrecked = (now.works && now.works.wrecked) || 0;
  const wave = now.wave || 0;
  const hx = now.hero ? now.hero.x : -4;
  const hz = now.hero ? now.hero.z : 12;

  const orders = [];

  // 1. Draft first under replace semantics; plating first, heal second.
  if (now.pendingOffer && now.pendingOffer.length) {
    const score = (o) => {
      const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
      if (/plating|max hp|maxhp|armor|armour|tough|vitality/.test(s)) return 100;
      if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
      if (/damage|spark|coil|tap|bolt|blast|power/.test(s)) return 60;
      if (/fire rate|rate|haste/.test(s)) return 50;
      return 10;
    };
    orders.push({ verb: 'PICK_UPGRADE', id: [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0].id });
  }

  // 2. Free supplementary damage; returns {} either way, so one tick at most.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: Math.max(-9, Math.min(9, hx)), z: BLAST.z } });
  }

  // 3. The mend, UNGATED, above everything that travels. Free when nothing is
  //    within 10 of the Prospector (returns null; the record stays pending).
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  // 4. Kite. The hero outruns everything here (6.0 against rail_tough 3.0 and
  //    steam_wrecker 2.0), and a parked hero is what died at w13. Legs stay
  //    inside turret cover so the guns kill the pursuit, and within ~10 of half
  //    the fort so the Prospector's repair sweep still reaches it.
  //    Phase 1 emits NO hero order: the hero already stands where the fort is,
  //    and every post near the claim refuses UNREACHABLE_TERRAIN.
  const kiting = wave >= 12 || hpFrac < 0.6;
  if (kiting) {
    const pair = KITE.find((p) => !heroBlack.has(key(p[0])) && !heroBlack.has(key(p[1]))) || KITE[0];
    let target = pair[kiteLeg % 2];
    if (Math.hypot(hx - target.x, hz - target.z) <= 1.5) { kiteLeg++; target = pair[kiteLeg % 2]; }
    for (const p of [target, ...KITE.flat()]) {
      if (heroBlack.has(key(p))) continue;
      orders.push({ verb: 'MOVE_HERO', pos: p });
      break;
    }
  }

  // 5. ONE ladder rung: next unsatisfied, priced at its LIVE instance
  //    (costs[standing]), emitted only when already affordable. One ordinal per
  //    id. A rung with no candidates left is RETIRED, never allowed to stall
  //    the rungs behind it.
  const seen = {};
  let rung = null;
  for (const id of LADDER) {
    seen[id] = (seen[id] || 0) + 1;
    const built = byKind[id] || 0;
    if (built >= seen[id]) continue;
    const costs = costsById[id] || [];
    const cost = built < costs.length ? costs[built] : costs[costs.length - 1];
    if (!Number.isFinite(cost)) continue;
    const spot = (SPOTS[id] || []).find((p) => !blacklist.has(key(p)));
    if (!spot) continue;
    rung = { id, cost, spot };
    break;
  }
  if (rung && gold >= rung.cost) {
    const o = { verb: 'BUILD', what: rung.id, where: rung.spot, when: { goldGte: rung.cost } };
    if (rung.id === 'palisade') o.rotationSteps = PAL_ROT;
    orders.push(o);
  }

  // 6. Turret tier 2 (x1.4 damage x1.18 fire rate = x1.65 dps) on the only works
  //    that reach the rail. CONTEXT_ACTION does not travel (interactRadius 1.6),
  //    so it needs MOVE_HERO in front -- a traveller, so never while the fort is
  //    losing works and never during the kite.
  if (!kiting && gold >= 220 && wrecked === 0 && hpFrac > 0.8) {
    const t = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked && e.position);
    if (t) {
      const d = Math.hypot(hx - t.position.x, hz - t.position.z);
      if (d <= 1.4) orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t.index } });
      else orders.push({ verb: 'MOVE_HERO', pos: { x: t.position.x, z: t.position.z + 1.1 } });
    }
  }

  // 7. Harvest tail. Inactive seams publish x/z/anchorIndex as null and ONE
  //    non-finite number refuses the whole array silently -- filter first.
  const live = (now.seams || []).filter(
    (s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z),
  );
  const ranked = live
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - hx, s.z - hz) }))
    .sort((a, b) => a.d - b.d);

  if (ranked.length) {
    const BLOCK = 6;                                  // 30 capacity / 5 a pan
    let i = 0;
    while (orders.length < 32) {
      orders.push({ verb: 'HARVEST', seam: ranked[Math.floor(i / BLOCK) % ranked.length].id });
      i++;
    }
  } else {
    // No live seam: keep naming the nearest ANCHOR so the failing order parks the
    // worker where the gold comes back, rather than emptying the array.
    const anchors = (view.stablePrefix.map || {}).seams || [];
    const near = anchors
      .map((a) => ({ id: a.id, d: Math.hypot(a.x - hx, a.z - hz) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near) while (orders.length < 32) orders.push({ verb: 'HARVEST', seam: near.id });
  }

  return orders.slice(0, 32);
}
