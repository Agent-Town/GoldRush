// e5-stillwater controller v1 — post-ADR-005 grammar (no MOVE_TO / HOLD / FALLBACK_IF).
//
// THE MAP: NoiseHuntSystem.steer() scriptMoveTo's EVERY living machine_leviathan at the trail
// point; the roster's only depth traveller is that id, so a sustained trail redirects the whole
// board. The trail is the loudest audible noise source, and every source rides the boat's ANCHOR
// (world = anchor + authored offset). The strike can only reduce DECK integrity (never the hero)
// and it selects the deck NEAREST the trailed emitter.
//
// THE PLAN (gen 22/46's line, unchanged in its bones):
//   1. three BOAT_BUILDs: palisade on bow, palisade on port (pure sacrificial deck mass — the
//      strike selector's two nearest pads under BOTH trail emitters), turret on starboard (the
//      harpoon ballista, r14, and the FARTHEST pad from either emitter: 5.83 / 6.32 wu).
//   2. HARVEST engages the pan channel -> air-pump runs -> trail lights at the anchor and the
//      pack gathers on the boat.
//   3. once the pack is gathered and the ballista stands, REANCHOR to `shelf-watch` (36,30):
//      6 s of engine noise + the 8 s trail hold carries the whole pack 36 wu EAST, clear of a
//      hero that never moves, and the ballista relights the trail with its 3 s reload clatter
//      the moment a head is inside r14. Self-sustaining from there.
//   4. pan for the rest of the run. Gold is the ONLY free ranking axis at a fixed wave-12
//      secure, and the bank cap is 200.
//
// THE HERO NEVER MOVES. It has no drift (StandingOrders:37-45), so silence IS a hold, and the
// unemployed Prospector drifts to it — which is where HOLD used to park it anyway.

const PAD_PLAN = [
  { padId: 'bow', buildingId: 'palisade' },
  { padId: 'port', buildingId: 'palisade' },
  { padId: 'starboard', buildingId: 'turret' },
];
const LURE_ANCHOR = 'shelf-watch';
const MAX_ORDERS = 32;
const PANS_PER_SEAM = 7; // capacity 30 / 5 gold a pan, +1 so the block over-drains rather than under

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  if (/plating|max hp|maxhp|health|vitality|tough|armor|armour/.test(t)) return 100;
  if (/dressing|heal|regen|mend/.test(t)) return 80;
  if (/damage|spark|coil|tap|power|crit/.test(t)) return 50;
  if (/rate|speed|reload|cooldown/.test(t)) return 40;
  return 10;
}

export default function controller(view, state) {
  const now = view.now || {};

  // The secure window accepts exactly one SECURE_CHOICE and nothing else; a blank line records
  // no tape entry at all and lets the configured `bank` default fire. Free, and it keeps the
  // last accepted order well inside the tick envelope.
  if (now.pendingSecure) return null;

  state.placed = state.placed || new Set();
  const dw = now.deepwater || {};
  const anchor = dw.anchor || { id: 'lagoon', x: 0, z: 30 };
  const noise = dw.noiseHunt || {};
  const trail = noise.trail || {};

  const orders = [];

  // 1. draft first — replace semantics mean the pick has to own the head of the array and
  //    everything still wanted is resent under it.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage. BLAST_AT answers {} on success AND on failure, so it never
  //    owns a tick away from the work below it.
  if (now.blastReadyInMs === 0 && now.hero) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z - 4 } });
  }

  // 3. the deck. Track placements LOCALLY: `pads[].occupied` re-reads false for a knocked-out
  //    pad, and re-issuing there is refused by rule (lostHullPads).
  for (const plan of PAD_PLAN) {
    if (state.placed.has(plan.padId)) continue;
    const pad = (dw.pads || []).find((p) => p.id === plan.padId);
    if (pad && pad.occupied) { state.placed.add(plan.padId); continue; }
    orders.push({ verb: 'BOAT_BUILD', padId: plan.padId, buildingId: plan.buildingId });
  }

  // 4. the lure. Gate on the LIVE precondition, never on a clock: a t=0 reanchor lights nothing
  //    (gen 22 measured it), because an untrailed leviathan walks at the hero and there is no
  //    pack at the boat to carry east yet.
  const starboardUp = state.placed.has('starboard')
    || (dw.pads || []).some((p) => p.id === 'starboard' && p.occupied);
  if (!state.reanchored
    && anchor.id === 'lagoon'
    && starboardUp
    && trail.target
    && (now.threats?.alive || 0) >= 6) {
    orders.push({ verb: 'REANCHOR', anchorId: LURE_ANCHOR });
    state.reanchoredPending = true;
  }
  if (anchor.id === LURE_ANCHOR) state.reanchored = true;

  // 5. the economy, and the thing that keeps the pump running. Seams publish x/z/anchorIndex as
  //    NULL when inactive — a non-finite number refuses the WHOLE array and installs none of it.
  const p = now.prospector || { x: 0, z: 30 };
  const seams = (now.seams || [])
    .filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => dist(a, p) - dist(b, p));
  outer:
  for (const s of seams) {
    for (let i = 0; i < PANS_PER_SEAM; i += 1) {
      if (orders.length >= MAX_ORDERS) break outer;
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  }

  if (!orders.length) return null;
  return orders.slice(0, MAX_ORDERS);
}
