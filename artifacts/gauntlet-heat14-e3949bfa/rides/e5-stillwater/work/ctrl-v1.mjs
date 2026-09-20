// Gen-131 controller for e5-stillwater / e5-stillwater-01, era 6.
// Line inherited from generation 66 (secured w12/360/200g), re-verified against this run's view 0.
//
// THE MAP: noise_hunt. steer() scriptMoveTo's every living machine_leviathan at the trail point,
// and the roster's only depth traveller is that one id, so a sustained trail redirects the WHOLE
// board. The trail is the loudest audible source; the sources ride the boat's anchor; harpoon-reload
// (r14) runs for 3s after every ballista fire, so the loop is self-sustaining once a deck gun has
// targets in range. REANCHOR to shelf-watch (36,30) — loud, outside both quiet zones, 36wu east of
// the hero — pulls the trailed pack clear of the body instead of nudging it.
//
// THE STRIKE SELECTOR decides placement: strike() hits decks.reduce(nearest to trail x/z), and the
// emitters sit at anchor+(0,-4) [harpoon-reload] and anchor+(-3,-1) [air-pump]. bow is nearest under
// either, port second, starboard last — so two 0-gold palisades on bow/port are pure sacrificial
// deck mass and the ballista on starboard is struck last. (gen 22 lost the run with the gun on bow.)
//
// BOTH ERA VERBS ARE FREE: BOAT_BUILD and REANCHOR cost no gold and have no range check.
// Zero MOVE_HERO: the hero starts at (0,30) = the lagoon anchor, has no drift, so silence IS the
// hold, and the unemployed Prospector drifts to the hero — exactly where the retired HOLD parked it.

const PLACEMENTS = [
  { padId: 'bow', buildingId: 'palisade' },   // sacrificial: nearest the emitter under both
  { padId: 'port', buildingId: 'palisade' },  // sacrificial: second nearest
  { padId: 'starboard', buildingId: 'turret' } // the ballista: last in the distance ordering
];

export default function controller(view, S) {
  const n = view.now || {};
  const dw = n.deepwater || {};
  const nh = dw.noiseHunt || {};

  // --- secure boundary: SILENCE. Takes the configured `bank` default, cannot be REJECTED
  // (a refused in-window submission is invisible to the tape and visible to the sim, which is
  // how gen 84 nearly lost an admissible reel), and keeps the last accepted order well inside
  // the tick envelope. 19th contract running. ---
  if (n.pendingSecure) return { line: '\n' };

  if (!S.placed) S.placed = new Set();   // track what WE placed; a knocked-out pad re-reads as
                                          // unoccupied while placeBoatBuilding refuses it by rule
  const orders = [];

  // 1. draft first, under replace semantics. Plating-first scorer.
  const offer = n.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    const score = (u) => {
      const s = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
      if (/plating|max hp|maxhp|vigor|tough/.test(s)) return 100;
      if (/dressing|heal|regen|mend/.test(s)) return 90;
      if (/spark|damage|coil|tap|volley/.test(s)) return 70;
      return 10;
    };
    const best = [...offer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage. BLAST_AT returns {} on success AND failure, so it is safe
  // anywhere and belongs above anything that travels.
  if (n.blastReadyInMs === 0) {
    const a = dw.anchor || { x: 0, z: 30 };
    orders.push({ verb: 'BLAST_AT', pos: { x: a.x, z: a.z - 6 } });
  }

  // 3. the deck. Place in distance order so the ballista lands on the pad struck last.
  for (const p of PLACEMENTS) {
    if (S.placed.has(p.padId)) continue;
    const pad = (dw.pads || []).find((q) => q.id === p.padId);
    if (!pad || pad.occupied) continue;
    orders.push({ verb: 'BOAT_BUILD', padId: p.padId, buildingId: p.buildingId });
    S.placed.add(p.padId);
  }

  // 4. ONE cooldown-gated era action per view, gated on the LIVE precondition, never on my clock.
  // gen 22 paid a run to learn a t=0 reanchor lights nothing: no pack yet, the engine window
  // expires, and the trail drops. Carry the CONDITION, not the timestamp.
  const trailLit = nh.trail && nh.trail.target != null;
  const gunUp = S.placed.has('starboard');
  if (!S.reanchored && dw.anchor?.id === 'lagoon' && trailLit && gunUp && (n.threats?.alive ?? 0) >= 6) {
    orders.push({ verb: 'REANCHOR', anchorId: 'shelf-watch' });
    S.reanchored = true;
  }

  // 5. the tail: the economy AND the clock. A failing HARVEST is free (the Prospector already
  // stands where it pans) and its refusal buys a decision point.
  // An INACTIVE seam publishes x/z/anchorIndex as null — one non-finite number refuses the WHOLE
  // array silently and the run looks like it is ignoring you. Filter finiteness before any sort.
  const live = (n.seams || []).filter(
    (s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z)
  );
  const room = 31 - orders.length;
  if (live.length && room > 0) {
    // Drain one seam in a block before walking to the next: a 30-capacity seam is six 5-gold pans,
    // and these two anchors sit ~19wu apart, so alternating per-order is a commute generator.
    const BLOCK = 6;
    const chain = [];
    for (let i = 0; chain.length < room; i++) {
      const seam = live[Math.floor(i / BLOCK) % live.length];
      chain.push({ verb: 'HARVEST', seam: seam.id });
    }
    orders.push(...chain);
  } else if (room > 0) {
    // No live seam this instant: keep naming a known id so the failing order parks the worker
    // where the gold comes back, rather than emitting a short array.
    const any = (n.seams || [])[0];
    if (any) for (let i = 0; i < Math.min(room, 4); i++) orders.push({ verb: 'HARVEST', seam: any.id });
  }

  return { orders: orders.slice(0, 32) };
}
