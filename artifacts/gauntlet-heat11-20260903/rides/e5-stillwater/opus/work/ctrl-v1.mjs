// e5-stillwater controller v1 — THE LURE.
//
// NoiseHuntSystem.steer(): while a trail exists, EVERY living machine_leviathan is
// scriptMoveTo'd at the trail point. The roster has exactly one enemy id, so a sustained
// trail redirects the entire board. Strikes only reduce deck integrity (96/pad x 3 pads);
// "the hero is never struck".
//
// So: move the boat (and every machine that rides it) to `shelf-watch` (36,30) — the anchor
// authored to be loud AND 36wu clear of the hero at (0,30) — and hold a permanent trail there.
//   * REANCHOR runs the engine 6s (r24) -> bootstraps the trail.
//   * BOAT_BUILD turret -> harpoonBallista (r14); every shot clatters 3s (r14 >= audible 12),
//     so the gun sustains its own lure. sentry_beacon -> depthChargeRack (silent, free damage).
//   * BOAT_BUILD costs no gold and has no range check.
// Prospector carries the Spark Rig on deepwater (HeadlessContractSim:469) — park it 6wu off
// the convergence point (never ON it: emitVolley returns false at range zero).

const LURE_ANCHOR = 'shelf-watch';
const PROSPECTOR_POST = { x: 36, z: 20 };

// Deck loadout: one turret (the ballista = the lure), two beacons (racks + strike buffer).
const PAD_PLAN = [
  { padId: 'bow', buildingId: 'turret' },
  { padId: 'port', buildingId: 'sentry_beacon' },
  { padId: 'starboard', buildingId: 'sentry_beacon' },
];

// Never offer[0] (gen-14). Plating first: the hero is the only losable body here.
function scorePick(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|health|hp|vigor|tough|armou?r|constitution/.test(t)) s += 100;
  if (/regen|heal|mend/.test(t)) s += 60;
  if (/spark|damage|coil|tap|volley|power/.test(t)) s += 40;
  if (/range|reach/.test(t)) s += 25;
  if (/speed|haste/.test(t)) s += 10;
  return s;
}

export default function controller(view) {
  const now = view.now;

  // pendingSecure accepts EXACTLY one order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // Draft first in the array so it owns the tick; everything still wanted is resent below.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scorePick(b) - scorePick(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const dw = now.deepwater || {};
  const pads = dw.pads || [];

  // Free levers first — occupy every empty pad.
  for (const plan of PAD_PLAN) {
    const pad = pads.find(p => p.id === plan.padId);
    if (pad && !pad.occupied) orders.push({ verb: 'BOAT_BUILD', padId: plan.padId, buildingId: plan.buildingId });
  }

  // Carry the boat, its machines and its guns out to the lure station.
  if (dw.anchor && dw.anchor.id !== LURE_ANCHOR) {
    orders.push({ verb: 'REANCHOR', anchorId: LURE_ANCHOR });
  }

  // The rig rides the worker: hold it on the convergence point, offset to avoid range zero.
  orders.push({ verb: 'HOLD', pos: PROSPECTOR_POST });
  return orders;
}
