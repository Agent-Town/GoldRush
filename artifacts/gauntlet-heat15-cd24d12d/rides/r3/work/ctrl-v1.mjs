// Generation 136 controller — e5-regatta, era 6 pin #30 (the boat tree).
//
// LAW READ FROM SOURCE BEFORE THE FIRST ORDER:
//  * RegattaRaceSystem.advance returns early at `wave >= secureWave(12)` -> the course FREEZES at
//    t=272. Race is a distance-over-time budget; time does not rank (272 is pinned by the secure).
//  * Six gates: five authored beacons then the heroStart stake, each radius 6 (DEFAULT_GATE_RADIUS).
//  * FORFEIT INVARIANT: ClaimBoat.stepAshore requires `!navigable(point)`; navigable is the hull's
//    water rect = union of boat-travel regions inset by CLAIM_BOAT_HULL_RADIUS 14.25 -> +/-49.75.
//    So EVERY waypoint inside +/-44 is navigable, can never be a step ashore, and can never forfeit.
//    A bug inside that invariant is a slow run; a bug outside it is a dead run.
//  * The view is FLAT (`now.regatta.{boat,nextBuoy,buoysPassed,state,finished,forfeited}`), NOT the
//    engine's nested AgentRegattaSource type. Gen 134 lost a lap reading `now.regatta.race`.
const CLAMP = 44;
const GATES = [
  { id: 'start-beacon', x: -49, z: 0 },
  { id: 'northwest-checkpoint', x: -28, z: 38 },
  { id: 'midcourse-checkpoint', x: 0, z: 18 },
  { id: 'northeast-checkpoint', x: 28, z: 38 },
  { id: 'finish-beacon', x: 49, z: 0 },
  { id: 'claim-boat', x: -49, z: 0 },
];
// Aim 4.5 inside each disc toward the NEXT gate: clears the buoy's landmark pad, leaves the hull
// already pointed onward, and stays deep inside radius 6 so the gate scores on disc entry.
const AIM = (() => {
  const out = [];
  for (let i = 0; i < GATES.length; i += 1) {
    const g = GATES[i];
    const n = GATES[i + 1];
    let ax = g.x; let az = g.z;
    if (n) {
      const dx = n.x - g.x; const dz = n.z - g.z;
      const len = Math.hypot(dx, dz) || 1;
      ax = g.x + (dx / len) * 4.5; az = g.z + (dz / len) * 4.5;
    } else {
      ax = g.x + 4.5; az = g.z; // last gate: aim course-ward, off the stake's own pad
    }
    out.push({ id: g.id, x: Math.max(-CLAMP, Math.min(CLAMP, +ax.toFixed(3))), z: Math.max(-CLAMP, Math.min(CLAMP, +az.toFixed(3))) });
  }
  return out;
})();

const mv = (p) => ({ verb: 'MOVE_HERO', pos: { x: p.x, z: p.z } });

export function makeController() {
  const st = { samples: 0, capProbed: false, probedWater: false, probedAshore: false, probedNotAboard: false, seamIds: [], notes: [] };

  return function controller(view, row) {
    const now = view.now || {};
    const r = now.regatta || {};
    const boat = r.boat || {};
    const t = now.timers?.runSeconds ?? 0;
    const gold = now.gold ?? 0;

    // A live draft is worth answering: free and it never defaults a pick.
    const pick = (now.pendingOffer || [])[0];

    // The secure boundary: silence takes the `bank` default, cannot be REJECTED (a rejected
    // in-window submission is invisible to the tape and visible to the sim -> replay divergence).
    if (now.pendingSecure) { st.notes.push(`t=${t} SECURE window -> silence (bank)`); return null; }

    const live = (now.seams || []).filter((s) => s && s.active !== false
      && Number.isFinite(s.x) && Number.isFinite(s.z) && typeof s.id === 'string');
    if (live.length) st.seamIds = live.map((s) => s.id);

    // ---------------- PHASE A: the race ----------------
    if (!r.finished && !r.forfeited && r.nextBuoy) {
      const idx = GATES.findIndex((g) => g.id === r.nextBuoy.id);
      if (idx < 0) { st.notes.push(`t=${t} UNKNOWN nextBuoy ${r.nextBuoy.id} -> silence`); return null; }
      const chain = [];
      // Boarding is a CROSSING of the rail: the hero boots ON the deck, so step OFF over the beam
      // and back ON. Deck box at hull (-49,0) is x[-53.4,-44.6] z[-14.25,14.25].
      if (!boat.aboard) chain.push(mv({ x: -42, z: -6 }), mv({ x: -47, z: 6 }));
      for (let i = idx; i < AIM.length; i += 1) chain.push(mv(AIM[i]));

      // One leading bogus HARVEST buys a surprise view ~1 tick later (a failing order yields the
      // tick, so the waypoint still runs). Distinct id each time = a new failure = a new view.
      // Used only on the last leg, to sample hull position+speed and pin the WITHHELD finish second.
      const onLastLeg = r.nextBuoy.id === 'claim-boat';
      if (onLastLeg && st.samples < 9) {
        st.samples += 1;
        chain.unshift({ verb: 'HARVEST', seam: `gr136-sample-${st.samples}` });
      }
      if (pick) chain.unshift({ verb: 'PICK_UPGRADE', id: pick });
      st.notes.push(`t=${t} race idx=${idx} next=${r.nextBuoy.id} orders=${chain.length}`);
      return chain.slice(0, 32);
    }

    if (r.forfeited) { st.notes.push(`t=${t} FORFEITED — invariant breached`); return null; }

    // ---------------- PHASE B: the purse ----------------
    // Gold is the only axis with anything on it; the cap is 200 (no stockpile ground on this map,
    // re-probed below). The finish gate IS the start stake, so the course returns the hull to the
    // seam field: race with waypoints only, then drop every MOVE_HERO and pan.
    const orders = [];
    if (pick) orders.push({ verb: 'PICK_UPGRADE', id: pick });

    // Cap probes, once: does ANY path raise bankCap here? (BuildSystem.addCapSource is the only
    // caller; a boat pad records a building in a Map and never touches it. Measure, do not infer.)
    if (!st.capProbed) {
      st.capProbed = true;
      orders.push({ verb: 'BOAT_BUILD', padId: 'bow', buildingId: 'stockpile' });
      orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: -50, z: 2 }, when: { goldGte: 60 } });
      orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: -47, z: -2 }, when: { goldGte: 60 } });
      st.notes.push(`t=${t} cap probes emitted`);
    }

    // The two published boat refusals, provoked ONLY once the purse is capped and the race is
    // finished — after `finishedAt` is set `advance` returns early, so a forfeit is unreachable.
    const capped = gold >= 200;
    if (capped && t > 228 && !st.probedWater && boat.aboard) {
      st.probedWater = true;
      // Aboard + non-navigable (|z|>49.75) + far beyond the 6.4 gangway => not a step ashore.
      orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 62 } });
      st.notes.push(`t=${t} UNREACHABLE_WATER probe from boat (${boat.x},${boat.z})`);
    } else if (capped && t > 240 && st.probedWater && !st.probedAshore && boat.aboard) {
      st.probedAshore = true;
      // Deliberate step ashore OVER THE SIDE: beyond the clamp, outside the deck box, inside 6.4.
      const bx = boat.x ?? -49; const bz = boat.z ?? 0;
      let p = null;
      const cands = [
        { x: bx - 5.2, z: bz }, { x: bx + 5.2, z: bz },
        { x: bx, z: bz + 5.2 }, { x: bx, z: bz - 5.2 },
        { x: bx + 5.0, z: bz + 3.6 }, { x: bx - 5.0, z: bz - 3.6 },
      ];
      for (const c of cands) {
        const nonNav = Math.abs(c.x) > 49.75 || Math.abs(c.z) > 49.75;
        const outDeck = Math.abs(c.x - bx) > 4.4 || Math.abs(c.z - bz) > 14.25;
        if (nonNav && outDeck && Math.hypot(c.x - bx, c.z - bz) <= 6.4) { p = c; break; }
      }
      if (p) { orders.push({ verb: 'MOVE_HERO', pos: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) } }); st.notes.push(`t=${t} step-ashore probe ${JSON.stringify(p)} from (${bx},${bz})`); }
      else st.notes.push(`t=${t} no legal step-ashore point from (${bx},${bz})`);
    } else if (capped && t > 252 && !st.probedNotAboard && !boat.aboard) {
      st.probedNotAboard = true;
      orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 0 } });
      st.notes.push(`t=${t} NOT_ABOARD probe hero=(${now.hero?.x},${now.hero?.z}) boat=(${boat.x},${boat.z})`);
    }

    // The tail IS the economy. Drain one seam in a block before walking to the next; an inactive
    // seam publishes x/z/anchorIndex as null and one non-finite number refuses the whole array.
    const hx = now.hero?.x ?? -49; const hz = now.hero?.z ?? 0;
    const ranked = live.slice().sort((a, b) => Math.hypot(a.x - hx, a.z - hz) - Math.hypot(b.x - hx, b.z - hz));
    const room = 32 - orders.length;
    if (ranked.length) {
      const per = Math.max(4, Math.floor(room / Math.min(3, ranked.length)));
      for (let i = 0; i < Math.min(3, ranked.length) && orders.length < 32; i += 1) {
        for (let k = 0; k < per && orders.length < 32; k += 1) orders.push({ verb: 'HARVEST', seam: ranked[i].id });
      }
    } else {
      // No seam live: keep naming known ids anyway so the failing order holds the clock where the
      // gold will come back, rather than leaving an empty array.
      for (const id of st.seamIds.slice(0, 3)) {
        for (let k = 0; k < 6 && orders.length < 32; k += 1) orders.push({ verb: 'HARVEST', seam: id });
      }
    }
    st.notes.push(`t=${t} pan gold=${gold} live=${ranked.length} orders=${orders.length}`);
    return orders.length ? orders.slice(0, 32) : null;
  };
}
