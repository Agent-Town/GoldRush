// gen 121 — e10-last-claim controller v1.
//
// THE CONTRACT (read from source, not inherited):
//   secure = wave >= 8 (t=240) AND preserve.active. Ranked by preservation waves,
//   then preservation HP, then survival. GOLD DOES NOT RANK — it is fuel.
//   HeadlessContractSim:2052 `nearestBuilding` returns the preserve while active,
//   so EVERY wrecker walks the warm vent at (0,50) and nothing I build can bait.
//   Enemy.ts:687 excludes wreckers from updateGapFlow, but move() still runs
//   resolveBlocker on every palisade -> a closed ring is a permanent shutout.
//
// THE RING (AABB collision is strict `<` on halfExtents; overlapRadius is
//   sentry-beacon-only, BuildPlacement.ts:36). palisade w=1 d=3; pad = 0.68.
//   rot1 = (halfX 1.5, halfZ 0.5) -> padded x+-2.18 z+-1.18
//   rot0 = (halfX 0.5, halfZ 1.5) -> padded x+-1.18 z+-2.18
//   S/N walls: rot1 at x -3/0/3 (|dx|=3 == 3.0, no overlap; padded spans meet)
//   E/W walls: rot0 at x +-3, z 50.  Airtight box, 8 pieces, 80 gold.
//
// THE HERO stands OUTSIDE the ring at (0,44): static_mote is not a wrecker, so it
//   chases the hero and never reaches the timber; the Spark Rig (r10, 24dps) still
//   covers the whole south wall, both side walls and the vent.

const VENT = { x: 0, z: 50 };
const POSTS = [{ x: 0, z: 44 }, { x: 0, z: 43 }, { x: -1, z: 44 }, { x: 2, z: 45 }];

const RING = [
  { x: 0, z: 47, r: 1 }, { x: -3, z: 47, r: 1 }, { x: 3, z: 47, r: 1 },   // south first: main approach
  { x: 3, z: 50, r: 0 }, { x: -3, z: 50, r: 0 },                          // flanks (east/west spawn on z=50)
  { x: 0, z: 53, r: 1 }, { x: -3, z: 53, r: 1 }, { x: 3, z: 53, r: 1 },   // north
];
const RING_COST = 10 * RING.length;

// Surplus: turrets (r16, 57dps) well clear of the ring's footprints. Wreckers
// cannot target them (nearestBuilding is the vent), so they are pure insurance.
const TURRETS = [
  { x: -7, z: 47 }, { x: 7, z: 47 }, { x: -7, z: 53 }, { x: 7, z: 53 },
  { x: -7, z: 50 }, { x: 7, z: 50 }, { x: 0, z: 57 }, { x: -7, z: 44 }, { x: 7, z: 44 },
];

const GROUND_REFUSALS = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|terrain/i;

let postIdx = 0;
const poisoned = new Set();       // GROUND refusals only — never insufficient_gold
const placedRing = new Set();     // ring indices I have seen standing
let ringEmitted = false;

function key(p) { return `${p.x},${p.z}`; }

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|max hp|maxhp|vitality|tough|armor|armour/.test(s)) return 100;
  if (/heal|regen|mend|dressing|recover/.test(s)) return 80;
  if (/damage|spark|coil|tap|power|blast/.test(s)) return 50;
  if (/rate|speed|reload|cool/.test(s)) return 40;
  return 10;
}

export default function controller(view, row) {
  const now = view.now;

  // The secure boundary: answer with SILENCE. It records no tape entry, takes the
  // configured `bank` default, and CANNOT be rejected (a rejected in-window array is
  // invisible to the tape and visible to the sim, which desyncs the replay).
  if (now.pendingSecure) return null;

  const orders = [];
  const gold = now.gold ?? 0;
  const hero = now.hero || {};

  // 1. Draft first — replace semantics mean everything below must be resent anyway.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage. Returns {} on success AND failure, so it is safe
  //    above the traveller and never owns a tick it cannot use.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 47 } });
  }

  // 3. The post. Emitted ONCE and dropped when parked; the index advances only on a
  //    real UNREACHABLE record (a ladder of posts is a shuttle that freezes the economy).
  for (const rec of (now.orders || [])) {
    if (rec.order?.verb === 'MOVE_HERO' && rec.status === 'failed' && /UNREACHABLE/i.test(rec.reason || '')) {
      postIdx = Math.min(postIdx + 1, POSTS.length - 1);
    }
  }
  const post = POSTS[postIdx];
  if (Math.hypot((hero.x ?? 0) - post.x, (hero.z ?? 0) - post.z) > 0.8) {
    orders.push({ verb: 'MOVE_HERO', pos: post });
  }

  // 4. Build ladder. Learn which ring slots stand, and poison GROUND refusals only.
  const entries = now.works?.entries || [];
  for (const e of entries) {
    if (e.id === 'palisade' && e.position) {
      const i = RING.findIndex(p => Math.abs(p.x - e.position.x) < 0.6 && Math.abs(p.z - e.position.z) < 0.6);
      if (i >= 0) placedRing.add(i);
    }
  }
  for (const rec of (now.orders || [])) {
    if (rec.order?.verb === 'BUILD' && rec.status === 'failed' && rec.order.where) {
      const reason = `${rec.reason || ''} ${rec.detail || ''}`;
      if (!/insufficient_gold/i.test(reason) && GROUND_REFUSALS.test(reason)) poisoned.add(key(rec.order.where));
    }
  }

  const ringMissing = RING.map((p, i) => ({ p, i }))
    .filter(({ p, i }) => !placedRing.has(i) && !poisoned.has(key(p)));

  // PLAN-TIME AFFORDABILITY. Equal-priced rungs cannot be suffix-gated (the last rung
  // would fire on one unit). So: hold until the WHOLE batch is funded, then emit every
  // piece gated at one unit and let array order drain it in a single trip home.
  if (ringMissing.length) {
    if (ringEmitted || gold >= Math.min(RING_COST, 10 * ringMissing.length)) {
      ringEmitted = true;
      for (const { p } of ringMissing) {
        orders.push({ verb: 'BUILD', what: 'palisade', where: { x: p.x, z: p.z }, when: { goldGte: 10 }, rotationSteps: p.r });
      }
    }
  } else {
    // Ring closed. Gold no longer ranks, so spend it all on insurance.
    const nT = (now.works?.byKind?.turret) ?? 0;
    if (nT < 4) {
      const costs = [50, 70, 95, 125];
      const price = costs[Math.min(nT, costs.length - 1)];
      const cand = TURRETS.filter(t => !poisoned.has(key(t)))
        .filter(t => !entries.some(e => e.position && Math.abs(e.position.x - t.x) < 0.6 && Math.abs(e.position.z - t.z) < 0.6));
      for (const t of cand.slice(0, 4)) {
        orders.push({ verb: 'BUILD', what: 'turret', where: t, when: { goldGte: price } });
      }
    }
  }

  // 5. Re-arm the ring if anything is actually damaged. Bounded to the rig radius
  //    around the Prospector since ADR-005 stage 2, and it TRAVELS, so gate it hard.
  const wh = now.works?.hp ?? 0, wm = now.works?.maxHp ?? 0;
  if ((now.works?.wrecked ?? 0) > 0 || (wm > 0 && wh < wm * 0.8)) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 90 });
  }

  // 6. The harvest tail IS the clock as well as the economy: a HARVEST on a depleted
  //    seam fails where the Prospector already stands, costs nothing, and buys a
  //    surprise view. An inactive seam publishes x/z/anchorIndex as null and ONE
  //    non-finite number refuses the whole array silently, so filter first.
  const pro = now.prospector || { x: 0, z: 0 };
  const live = (now.seams || [])
    .filter(s => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ ...s, d: Math.hypot(s.x - pro.x, s.z - pro.z) }))
    .sort((a, b) => a.d - b.d);

  const room = 32 - orders.length;
  if (live.length && room > 0) {
    // Drain one seam in a block before walking to the next (a round-robin across
    // 34-unit gaps is a commute generator, measured twice in my notebook).
    const blocks = [];
    for (let i = 0; i < live.length && blocks.length < room; i++) {
      for (let k = 0; k < 7 && blocks.length < room; k++) blocks.push(live[i].id);
    }
    for (const id of blocks) orders.push({ verb: 'HARVEST', seam: id });
  } else if (room > 0) {
    // Never let the tail be empty: name the nearest ANCHOR anyway so the failing
    // order parks the worker where the gold will come back.
    const anchors = (view.stablePrefix?.map?.seams) || [];
    for (const a of anchors.slice(0, Math.min(room, 4))) orders.push({ verb: 'HARVEST', seam: a.id });
  }

  return orders.slice(0, 32);
}
