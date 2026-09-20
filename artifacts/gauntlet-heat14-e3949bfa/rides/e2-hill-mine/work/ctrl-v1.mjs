// e2-hill-mine controller v1 — generation-6..123 skeleton, retargeted.
//
// The contract: secure IS the railcar kill (twist.baron, hpScale 12.5, three
// components ~3,129 hp at wave 12). Enemy.ts:1254 reverses the scripted route,
// so the railcar PATROLS route 0 ((-46,-2)..(0,0)..(46,-2)) at 1.9 u/s.
// Four turrets (range 16) on the z=9 line sit 9 off the rail => 26.5 units of
// track each => ~2,480 damage per pass. The damage closes on pass two.
// Therefore the whole problem is keeping four turrets alive to wave 12 against
// steam_wrecker (buildingDamageScale 2.5) out of the north gate (0,46).
//
// REPAIR_UNDER (StandingOrders.ts:543) searches within Balance.sparkRig.range
// (10) of the PROSPECTOR and returns null - free, record stays pending - when
// nothing is in range. The Prospector drifts to the hero. So: park the hero in
// the fort, clamp every work inside 10 of that post, and carry the mend ungated.

const HERO = { x: 0, z: 9 };          // 9 off the rail (rig range 10), inside the fort
const BLAST_AT = { x: 0, z: 1 };      // on the rail line, 8 from the post: rail toughs + the railcar

// Ladder in STRATEGY order (never price order). Turrets are the boss-killer AND
// 57.2 dps against a beacon's ~13 at wave 1; beacons interleave so dps lands early.
const LADDER = [
  'turret', 'sentry_beacon', 'turret', 'sentry_beacon',
  'turret', 'sentry_beacon', 'turret',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon',
];

// More candidate spots than slots. All clamped inside 10 of HERO so the
// Prospector's repair sweep covers the whole fort when it is home.
const SPOTS = {
  turret: [
    { x: -6, z: 9 }, { x: -2, z: 9 }, { x: 2, z: 9 }, { x: 6, z: 9 },
    { x: -9, z: 9 }, { x: 9, z: 9 }, { x: -4, z: 10 }, { x: 4, z: 10 },
    { x: 0, z: 9 }, { x: -7, z: 11 }, { x: 7, z: 11 },
  ],
  sentry_beacon: [
    { x: -4, z: 12 }, { x: 4, z: 12 }, { x: -8, z: 12 }, { x: 8, z: 12 },
    { x: 0, z: 14 }, { x: -6, z: 14 }, { x: 6, z: 14 }, { x: -2, z: 13 },
    { x: 2, z: 13 }, { x: -9, z: 14 }, { x: 9, z: 14 }, { x: 0, z: 11 },
  ],
};

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i;
const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;

let costsById = null;
let parked = false;
let heroIdx = 0;
const HERO_POSTS = [HERO, { x: 0, z: 10 }, { x: -2, z: 10 }, { x: 2, z: 10 }, { x: 0, z: 11 }];

export default function controller(view) {
  const now = view.now;

  // The secure boundary accepts exactly ONE order (SECURE_CHOICE) and refuses
  // any other array whole, burning the choice clock and desyncing the replay
  // (gen 84, learned on e2-incline). Silence takes the `bank` default and
  // cannot be rejected.
  if (now.pendingSecure) return null;

  if (!costsById) {
    costsById = {};
    for (const b of (view.stablePrefix.mechanics.buildables || [])) costsById[b.id] = b.costs || [];
  }

  // Refusal blacklist, partitioned: GROUND poisons the coordinate,
  // ECONOMY (insufficient_gold) poisons nothing and retries (gen 51).
  for (const rec of (now.orders || [])) {
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const why = `${rec.reason || ''} ${rec.detail || ''}`;
    if (rec.status === 'failed' && GROUND.test(why)) blacklist.add(key(o.where));
  }

  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const gold = now.gold || 0;
  const hp = now.hero ? now.hero.hp : 100;
  const maxHp = now.hero ? now.hero.maxHp : 100;
  const hpFrac = maxHp > 0 ? hp / maxHp : 1;
  const wrecked = (now.works && now.works.wrecked) || 0;

  const orders = [];

  // 1. Draft first under replace semantics. Plating-first scorer: survival is
  //    the binding constraint on every ride this map has ever seen.
  if (now.pendingOffer && now.pendingOffer.length) {
    const score = (o) => {
      const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
      if (/plating|max hp|maxhp|armor|armour|tough|vitality/.test(s)) return 100;
      if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
      if (/damage|spark|coil|tap|bolt|blast|power/.test(s)) return 60;
      if (/fire rate|rate|speed|haste/.test(s)) return 50;
      return 10;
    };
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage, above the traveller. Returns {} either way,
  //    so it costs exactly one tick.
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: BLAST_AT });

  // 3. The mend, UNGATED and above everything that travels. Free when nothing
  //    is within 10 of the Prospector (returns null, record stays pending).
  //    Several records so successive mends can fire inside one array.
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  // 4. Hero post: emitted ONCE and dropped when parked; the index advances only
  //    on a real UNREACHABLE record (never a ladder - gen 68 measured a ladder
  //    as a shuttle that ping-pongs the body and freezes the economy).
  const hx = now.hero ? now.hero.x : 0;
  const hz = now.hero ? now.hero.z : 12;
  for (const rec of (now.orders || [])) {
    if ((rec.order || {}).verb === 'MOVE_HERO' && rec.status === 'failed' &&
        /UNREACHABLE/i.test(`${rec.reason || ''}`)) {
      heroIdx = Math.min(heroIdx + 1, HERO_POSTS.length - 1);
    }
  }
  const post = HERO_POSTS[heroIdx];
  const dHero = Math.hypot(hx - post.x, hz - post.z);
  if (dHero > 1.0) parked = false;
  if (!parked) {
    orders.push({ verb: 'MOVE_HERO', pos: post });
    if (dHero <= 1.0) parked = true;
  }

  // 5. ONE ladder rung: the next unsatisfied one, priced at its LIVE instance
  //    (costs[standing]) and emitted only when already affordable. One ordinal
  //    per id - never `built + rungsWalkedPast`, which double-counts (gen 99).
  const seen = {};
  let rung = null;
  for (const id of LADDER) {
    seen[id] = (seen[id] || 0) + 1;
    const built = byKind[id] || 0;
    if (built >= seen[id]) continue;          // already satisfied by a standing work
    const cost = (costsById[id] || [])[built];
    if (!Number.isFinite(cost)) continue;     // cap reached: retire the rung, don't stall
    const spot = (SPOTS[id] || []).find((p) => !blacklist.has(key(p)));
    if (!spot) continue;                      // out of candidates: RETIRE, never stall (gen 81)
    rung = { id, cost, spot };
    break;
  }
  const ladderDone = rung === null;
  if (rung && gold >= rung.cost) {
    orders.push({ verb: 'BUILD', what: rung.id, where: rung.spot, when: { goldGte: rung.cost } });
  }

  // 6. Gold sink: turret tier 2 is x1.4 damage x1.18 fire rate = x1.65 dps, on
  //    the only works that can reach the rail. CONTEXT_ACTION does not travel
  //    (interactRadius 1.6), so it needs MOVE_HERO in front - and that is a
  //    traveller, so it is gated on a fort that is not currently losing works.
  if (ladderDone && gold >= 150 && wrecked === 0 && hpFrac > 0.55) {
    const t = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked);
    if (t && t.position) {
      const d = Math.hypot(hx - t.position.x, hz - t.position.z);
      if (d > 1.2) orders.push({ verb: 'MOVE_HERO', pos: { x: t.position.x, z: t.position.z - 1.0 } });
      else orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t.index } });
      parked = false;
    }
  }

  // 7. Harvest tail. Inactive seams publish x/z/anchorIndex as null and one
  //    non-finite number refuses the WHOLE array silently - filter first.
  //    Drain one seam in a block of six (30 capacity / 5 a pan) before walking.
  const live = (now.seams || []).filter(
    (s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z),
  );
  const ranked = live
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - post.x, s.z - post.z) }))
    .sort((a, b) => a.d - b.d);

  const room = 31 - orders.length;
  if (ranked.length && room > 0) {
    const BLOCK = 6;
    let i = 0;
    while (orders.length < 31) {
      const s = ranked[Math.floor(i / BLOCK) % ranked.length];
      orders.push({ verb: 'HARVEST', seam: s.id });
      i++;
    }
  } else if (room > 0) {
    // No live seam: keep naming the nearest ANCHOR so the failing order parks
    // the worker where the gold will come back, instead of emptying the array.
    const anchors = ((view.stablePrefix.map || {}).seams || []);
    const near = anchors
      .map((a) => ({ id: a.id, d: Math.hypot(a.x - post.x, a.z - post.z) }))
      .sort((a, b) => a.d - b.d)[0];
    if (near) while (orders.length < 31) orders.push({ verb: 'HARVEST', seam: near.id });
  }

  return orders.slice(0, 32);
}
