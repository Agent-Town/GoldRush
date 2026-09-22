// e5-regatta controller v1 — sail the Claim-Boat round six gates, then pan.
//
// THE CONTRACT (read from source before riding):
//   secure = wave >= 12 AND now.regatta.race.finished          HeadlessContractSim.ts:1536
//   RegattaRaceSystem.advance returns early at wave >= 12, so the COURSE FREEZES at t=272.
//   Six gates in order, each radius 6: start-beacon(-49,0), NW(-28,38), mid(0,18),
//   NE(28,38), finish-beacon(49,0), then the start stake (-49,0) as the finish line.
//   Gate 1 passes the instant a body is aboard, because the hull moors on it.
//
// THE FORFEIT, AND THE INVARIANT THAT MAKES IT IMPOSSIBLE:
//   RegattaRaceSystem.advance: racer === null after any gate has passed => FORFEIT, terminal.
//   ClaimBoat.stepAshore requires !navigable(point) — a point OUTSIDE the hull's clamp rect.
//   boatWaterFor insets the sailable union [-64,64]^2 by CLAIM_BOAT_HULL_RADIUS 14.25,
//   so the clamp is [-49.75, 49.75]^2. EVERY MOVE_HERO POINT I EMIT IS INSIDE THAT BOX,
//   therefore navigable, therefore never a step ashore, therefore never a forfeit.
//   SAFE_LIMIT below is the guard, asserted on every point before it leaves this file.
//
// LANDMARK BLOCKERS (assets/pilots/map-rebuild-spike/landmark-collision-contract.json, map
//   "regatta"), padded by Balance.hero.radius + 0.08 = 0.58 in Terrain.ts:178:
//     start-line-rig  (-49,0) rect 4.428x1.4  -> x [-51.794,-46.206] z [-1.28,1.28]
//     finish-line-rig  (49,0) rect 4.428x1.4  -> x [ 46.206, 51.794] z [-1.28,1.28]
//     buoy anchors (-28,38) (0,18) (28,38) radius 0.772 -> padded 1.352
//   MOVE_HERO checks walkable(pos) BEFORE the helm sees it, so a buoy CENTRE refuses
//   UNREACHABLE_TERRAIN. The gates are radius 6, so every waypoint is aimed off-centre.

const SAFE_LIMIT = 49.0; // strictly inside the hull clamp [-49.75, 49.75]

const BLOCKERS = [
  { kind: 'rect', x: -49, z: 0, hx: 2.794, hz: 1.28 },
  { kind: 'rect', x: 49, z: 0, hx: 2.794, hz: 1.28 },
  { kind: 'circ', x: -28, z: 38, r: 1.352 },
  { kind: 'circ', x: 0, z: 18, r: 1.352 },
  { kind: 'circ', x: 28, z: 38, r: 1.352 },
  { kind: 'rect', x: -18, z: -20, hx: 2.29, hz: 1.909 },
  { kind: 'rect', x: 18, z: -20, hx: 2.29, hz: 1.909 },
  { kind: 'rect', x: 0, z: 48, hx: 2.47, hz: 1.97 },
];

const blocked = (x, z) => BLOCKERS.some((b) => (b.kind === 'circ'
  ? Math.hypot(x - b.x, z - b.z) <= b.r + 0.25
  : Math.abs(x - b.x) <= b.hx + 0.25 && Math.abs(z - b.z) <= b.hz + 0.25));

// A waypoint is emitted only if it is navigable (no forfeit) and unblocked (no refusal).
function safe(pt, tag) {
  const ok = Number.isFinite(pt.x) && Number.isFinite(pt.z)
    && Math.abs(pt.x) <= SAFE_LIMIT && Math.abs(pt.z) <= SAFE_LIMIT && !blocked(pt.x, pt.z);
  if (!ok) throw new Error('unsafe waypoint ' + tag + ' ' + JSON.stringify(pt));
  return { verb: 'MOVE_HERO', pos: { x: pt.x, z: pt.z } };
}

// Boarding is a CROSSING of the rail (ClaimBoat.board: heroOnDeck must read false, then true).
// The hero boots ON the deck, so it must step off and back on. Deck at hull (-49,0) is
// x [-53.4,-44.6], z [-14.25,14.25]; both legs are run at z = -6 / +6 to stay clear of the
// start-line-rig's z band entirely.
const BOARD_OFF = { x: -42, z: -6 };  // off the deck to the east (x > -44.6)
const BOARD_ON = { x: -47, z: 6 };    // back onto the deck, heading roughly toward gate 2

// The racing line: 4 units from each gate centre TOWARD THE NEXT GATE, so the gate passes
// on the way in and the hull is already pointed onward when the order completes.
const LINE = [
  null,                      // gate 1 (start-beacon) passes on boarding; no waypoint needed
  { x: -24.7, z: 35.7 },     // gate 2 NW(-28,38): 4.0 from centre, bearing toward mid
  { x: 3.3, z: 20.3 },       // gate 3 mid(0,18):  4.0 from centre, bearing toward NE
  { x: 29.9, z: 34.5 },      // gate 4 NE(28,38):  4.0 from centre, bearing toward finish
  { x: 44, z: 0 },           // gate 5 finish-beacon(49,0): 5.0 from centre, clear of the rig
  { x: -44, z: 0 },          // gate 6 start stake(-49,0): 5.0 from centre, clear of the rig
];

const UP_SCORE = (id = '', name = '', text = '') => {
  const s = (id + ' ' + name + ' ' + text).toLowerCase();
  if (/plating|armou?r|toughen|vitality|max hp/.test(s)) return 100;
  if (/dressing|heal|regen|mend/.test(s)) return 90;
  if (/spark|damage|coil|tap|volley/.test(s)) return 60;
  return 10;
};

let lastSig = null;

export default function controller(view) {
  const now = view.now ?? {};

  // The secure boundary: answer with SILENCE. It takes the configured `bank` default,
  // cannot be REJECTED (a refused in-window array is invisible to the tape and visible to
  // the sim, which desynchronises the replay), and costs no entry.
  if (now.pendingSecure) { lastSig = null; return { blank: true }; }

  const r = now.regatta ?? {};
  const race = r.race ?? {};
  const boat = r.boat ?? {};
  const passed = (race.buoysPassed ?? []).length;
  const aboard = boat.aboard === true;

  const orders = [];

  // Draft first under replace semantics; only when an offer is actually live.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    const best = [...now.pendingOffer]
      .map((o, i) => ({ o, i, s: UP_SCORE(o.id, o.name, o.effectText) }))
      .sort((a, b) => b.s - a.s || a.i - b.i)[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.o.id });
  }

  const racing = !race.finished && !race.forfeited;

  if (racing) {
    // Board by crossing the rail, then run the remaining legs as one draining worklist.
    if (!aboard) {
      orders.push(safe(BOARD_OFF, 'board-off'));
      orders.push(safe(BOARD_ON, 'board-on'));
    }
    for (let i = Math.max(1, passed); i < LINE.length; i += 1) {
      if (LINE[i]) orders.push(safe(LINE[i], 'gate' + (i + 1)));
    }
  } else {
    // The course is over. The finish gate IS the start stake, so the hull has carried the
    // hero back onto the seam field: drop every MOVE_HERO (an active one owns the tick and
    // would starve the tail), let the Prospector drift in, and pan for the bank cap.
    if ((now.blastReadyInMs ?? 1) === 0) {
      const tx = Math.max(-SAFE_LIMIT, Math.min(SAFE_LIMIT, (boat.x ?? -44) - 6));
      orders.push({ verb: 'BLAST_AT', pos: { x: tx, z: boat.z ?? 0 } });
    }
    const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
    const ids = live.length ? live.map((s) => s.id) : ['gold-seam-1', 'gold-seam-2'];
    // Alternating blocks of six: the far block keeps working while the near seam refills.
    const budget = 32 - orders.length;
    outer: for (let round = 0; round < 6; round += 1) {
      for (const id of ids) {
        for (let k = 0; k < 6; k += 1) {
          if (orders.length >= budget) break outer;
          orders.push({ verb: 'HARVEST', seam: id });
        }
      }
    }
  }

  // Blank-line any view whose plan has not changed: cheaper reel, and it cannot be refused.
  const sig = JSON.stringify(orders);
  if (sig === lastSig && !now.pendingOffer) return { blank: true };
  lastSig = sig;
  return { orders: orders.slice(0, 32) };
}
