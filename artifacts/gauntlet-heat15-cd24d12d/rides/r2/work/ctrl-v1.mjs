// heat15 opus r2 — e5-regatta controller v1
//
// Field names taken ONLY from the raw view-0 dump (probe-idle-view0.json):
//   now.regatta = { boat:{id,x,z,heading,speed,aboard}, nextBuoy:{id,x,z,radius},
//                   buoysPassed:[], state, finished, forfeited, fastWaterMultiplier }
// FLAT. There is no now.regatta.race — that was generation 134's lap-doubling bug.
//
// Forfeit invariant: stepAshore needs a point that is NOT navigable water. The hull's
// clamp is pond/2 - hullRadius = 128/2 - 14.25 = 49.75 on both axes. Every waypoint
// below sits well inside +-44, so it is navigable and can never be a step ashore.
// That makes the terminal failure structurally unreachable rather than carefully avoided.

const GATE_ORDER = ['start-beacon', 'northwest-checkpoint', 'midcourse-checkpoint',
  'northeast-checkpoint', 'finish-beacon', 'claim-boat'];

// gate + ~4-5 units toward the NEXT gate: inside radius 6 so the mark scores, off the
// landmark pad the buoy anchor occupies, and inward from the rim on the two eastern marks.
const AIM = {
  'northwest-checkpoint': { x: -24.6, z: 35.6 },
  'midcourse-checkpoint': { x: 3.4, z: 20.4 },
  'northeast-checkpoint': { x: 30.0, z: 34.3 },
  'finish-beacon': { x: 44.0, z: 0 },     // 5.0 from the mark, 5.75 inside the clamp
  'claim-boat': { x: -44.0, z: 0 },       // 5.0 from the mark, approached from the east
};

// Generation 134 measured this pair boarding at t=2.73 on this exact engine hash:
// step off the deck over the beam, then back across the rail. Boarding is a CROSSING.
const BOARD = [{ x: -42, z: -6 }, { x: -47, z: 6 }];

const mh = p => ({ verb: 'MOVE_HERO', pos: { x: p.x, z: p.z } });

// stockpile probes: the one declared build zone is claim-boat-deck-mask
// x[-54,-44] z[-5,5]. Vary BOTH axes; a refused BUILD yields the tick and costs nothing.
const PROBES = [
  { x: -46, z: 2 }, { x: -52, z: -2 }, { x: -50, z: 4 },
  { x: -48, z: -4 }, { x: -45, z: 0 }, { x: -53, z: 3 },
];

export default function ctrl(view) {
  const now = view.now || {};
  const r = now.regatta || {};
  const out = [];

  // The secure boundary takes silence: the bank default cannot be rejected, so the
  // replay cannot diverge the way a refused in-window submission makes it diverge.
  if (now.pendingSecure) return null;

  // Draft first under replace semantics; plating/heal first, else the offer's head.
  const offer = now.pendingOffer || [];
  if (offer.length) {
    const score = o => {
      const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
      if (/plating|armou?r|max ?hp|vitality/.test(s)) return 100;
      if (/dressing|heal|regen|mend/.test(s)) return 90;
      if (/damage|spark|coil|tap/.test(s)) return 50;
      return 10;
    };
    out.push({ verb: 'PICK_UPGRADE', id: [...offer].sort((a, b) => score(b) - score(a))[0].id });
  }

  const finished = r.finished === true;

  if (!finished) {
    // ---- RACE. Emit ONLY the remaining marks, indexed off the view's own nextBuoy.
    // Idempotent by construction: it cannot re-run a mark already rounded.
    if (r.boat && r.boat.aboard !== true) for (const p of BOARD) out.push(mh(p));
    let from = 1;
    const nid = r.nextBuoy && r.nextBuoy.id;
    const idx = GATE_ORDER.indexOf(nid);
    if (idx >= 0) from = Math.max(1, idx);
    else if (Array.isArray(r.buoysPassed)) from = Math.max(1, r.buoysPassed.length);
    for (let i = from; i < GATE_ORDER.length; i++) {
      const a = AIM[GATE_ORDER[i]];
      if (a) out.push(mh(a));
    }
    return out.slice(0, 32);
  }

  // ---- PAN. The finish mark IS the start stake, so the hull parks on the seam field.
  // Drop every MOVE_HERO: an active one owns the tick and nothing behind it can work.
  const gold = now.gold ?? 0;
  const stock = (now.works && now.works.byKind && now.works.byKind.stockpile) || 0;
  if (stock < 2) {
    for (const p of PROBES.slice(0, 5)) {
      out.push({ verb: 'BUILD', what: 'stockpile', where: { x: p.x, z: p.z }, when: { goldGte: 60 } });
    }
  }

  // Live seams only, and an inactive seam publishes x/z/anchorIndex as null: one
  // non-finite number refuses the WHOLE array, silently.
  const seams = (now.seams || []).filter(s =>
    s && s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z) && s.id);
  const boat = r.boat || {};
  const hx = Number.isFinite(boat.x) ? boat.x : (now.hero?.x ?? -49);
  const hz = Number.isFinite(boat.z) ? boat.z : (now.hero?.z ?? 0);
  seams.sort((a, b) => Math.hypot(a.x - hx, a.z - hz) - Math.hypot(b.x - hx, b.z - hz));

  const room = 32 - out.length;
  if (seams.length) {
    // Drain the nearest seam in a block before walking to the next: a seam holds 30
    // gold (six 1.5s pans) and respawns in 20s, and these sit 4-6 units apart.
    const BLOCK = 6;
    for (let k = 0; out.length < 32; k++) {
      const s = seams[Math.floor(k / BLOCK) % seams.length];
      out.push({ verb: 'HARVEST', seam: s.id });
    }
  } else if (room > 0) {
    // No live seam right now: still name the nearest ANCHOR's id so the failing order
    // parks the worker where the gold will come back, rather than emitting nothing.
    const any = (now.seams || []).find(s => s && s.id);
    if (any) for (let i = 0; i < room; i++) out.push({ verb: 'HARVEST', seam: any.id });
  }
  return out.slice(0, 32);
}
