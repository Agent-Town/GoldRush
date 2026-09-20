// Gen 115 controller — e5-flotilla.
// The map: every corsair walks the STRAGGLER hull (living hull furthest from centroid).
// Centroid (0,23); kitchen-scow (-26,21) and still-room (26,21) tie at d^2=680, and the
// straggler reduce uses strict >, so the FIRST wins: kitchen-scow is the straggler all run.
// ADR-005 moved the gun: HeadlessContractSim:632/644 getPos => hero.group.position, so the
// 24 dps Spark Rig (r10) now rides the body MOVE_HERO steers. Park it 6wu off the hull,
// which is also the gold-seam-1 anchor, so the Prospector pans with zero commute.
// handleEnemyContact is skipped while deepwater.diagnostics.flotilla exists -> hero is
// invulnerable, hp is decoration, plating is worth zero. Score the draft for DAMAGE.
// REANCHOR on a hull id nudges it toward the centroid and FLIPS the straggler to a hull
// 52wu from my guns (gen 21). Issue none.

const HULL = { x: -26, z: 21 };
const POSTS = [
  { x: -26, z: 15 }, { x: -26, z: 14 }, { x: -24, z: 15 },
  { x: -26, z: 13 }, { x: -22, z: 16 }, { x: -20, z: 18 },
];

// Free deck weapons. turret -> harpoonBallista (r14) on the pad that sits exactly on the
// straggler; sentry_beacon -> depthChargeRack (r12) on still-room, insurance for the
// straggler flip if kitchen-scow is ever lost.
const DECKS = [
  { padId: 'kitchen-scow', buildingId: 'turret' },
  { padId: 'still-room-barge', buildingId: 'sentry_beacon' },
];

// Cap raisers, if the hull decks take a build at all (gen 21 measured open water refusing).
const CAPS = [
  { what: 'stockpile', where: { x: -26, z: 19 } },
  { what: 'stockpile', where: { x: -28, z: 23 } },
  { what: 'stockpile', where: { x: 0, z: 25 } },
  { what: 'stockpile', where: { x: -24, z: 18 } },
];

const placedDecks = new Set();
const groundBlack = new Set();
let postIdx = 0;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/damage|spark|coil|tap|heavy|power|bolt/.test(s)) v += 100;
  if (/rate|fire|speed|cadence|quick/.test(s)) v += 80;
  if (/range|reach/.test(s)) v += 40;
  if (/blast|charge|cooldown/.test(s)) v += 35;
  if (/gold|pan|luck|seam/.test(s)) v += 20;
  if (/plating|maxhp|health|dressing|heal|regen|armor/.test(s)) v += 1; // hero cannot be hit here
  return v;
}

export default function controller(view) {
  const now = view.now || {};
  if (now.pendingSecure) return null; // silence banks the default and cannot be rejected

  const out = [];

  // 1. draft first, under replace semantics
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage; returns {} on success AND failure, safe above the traveller
  if (now.blastReadyInMs === 0) out.push({ verb: 'BLAST_AT', pos: { x: HULL.x, z: HULL.z } });

  // 3. free deck arsenal. BOAT_BUILD runs immediately and its record is spent, so track
  //    placement locally and re-emit until the view confirms it (a lost pad re-reads unoccupied).
  const boat = new Set((now.deepwater?.boatBuildings || []).map(b => b.padId));
  for (const d of DECKS) {
    if (boat.has(d.padId)) { placedDecks.add(d.padId); continue; }
    if (placedDecks.has(d.padId)) continue;
    out.push({ verb: 'BOAT_BUILD', padId: d.padId, buildingId: d.buildingId });
  }

  // 4. the post. Emit ONCE, drop when parked, and advance the index only on an actual
  //    UNREACHABLE record (gen 112 carried the first clause without the second and lost the lever).
  for (const rec of (now.orders || [])) {
    if (rec.order?.verb === 'MOVE_HERO' && rec.status === 'failed' && /UNREACHABLE/i.test(rec.reason || '')) {
      if (postIdx < POSTS.length - 1) postIdx += 1;
    }
  }
  const post = POSTS[postIdx];
  const hx = now.hero?.x, hz = now.hero?.z;
  const parked = Number.isFinite(hx) && Number.isFinite(hz) && Math.hypot(hx - post.x, hz - post.z) < 0.8;
  if (!parked) out.push({ verb: 'MOVE_HERO', pos: post });

  // 5. cap raisers, cheap probes. GROUND refusals poison the coordinate; ECONOMY ones never do.
  for (const rec of (now.orders || [])) {
    const o = rec.order;
    if (o?.verb === 'BUILD' && rec.status === 'failed') {
      const why = (rec.reason || '') + (rec.detail || '');
      if (!/insufficient_gold/i.test(why)) groundBlack.add(`${o.where.x},${o.where.z}`);
    }
  }
  const stock = (now.works?.byKind?.stockpile) || 0;
  if (stock < 2) {
    let emitted = 0;
    for (const c of CAPS) {
      if (emitted >= 2) break;
      if (groundBlack.has(`${c.where.x},${c.where.z}`)) continue;
      out.push({ verb: 'BUILD', what: c.what, where: c.where, when: { goldGte: 60 } });
      emitted += 1;
    }
  }

  // 6. the tail IS the economy and the clock. Filter the published nulls first: an inactive
  //    seam carries x/z/anchorIndex all null and one non-finite number refuses the whole array.
  const seams = (now.seams || []).filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  const ranked = seams.sort((a, b) =>
    Math.hypot(a.x - post.x, a.z - post.z) - Math.hypot(b.x - post.x, b.z - post.z));
  if (ranked.length) {
    const near = ranked[0];
    for (let i = 0; i < 8 && out.length < 31; i++) out.push({ verb: 'HARVEST', seam: near.id });
    if (ranked[1] && Math.hypot(ranked[1].x - post.x, ranked[1].z - post.z) < 24) {
      for (let i = 0; i < 4 && out.length < 31; i++) out.push({ verb: 'HARVEST', seam: ranked[1].id });
    }
  } else {
    // never let the tail empty: name an anchor anyway so the failing order parks the worker
    for (const s of (now.seams || [])) {
      if (out.length < 31) out.push({ verb: 'HARVEST', seam: s.id });
    }
  }

  return out.slice(0, 32);
}
