// e5-stillwater controller v2 — THE FORTRESS AT LAGOON.
//
// v1 finding: the lure at `shelf-watch` cannot be SUSTAINED from a cold start. REANCHOR runs the
// engine for only 6s (NOISE_HUNT_RULES.engineSeconds) and the ballista needs an enemy inside r14
// to clatter, so the trail dropped 8s later with the wave still crossing the map. Meanwhile the
// boat's guns had ridden the anchor 36wu east, leaving the hero at (0,30) with nothing: hp
// 100 -> 28 -> 0 inside one wave, 0 kills.
//
// The correction: the deck guns ARE the hero's defence, so the boat stays at `lagoon` (0,30),
// on the hero. The leviathans were always walking at the hero; trailing them to the same point
// costs nothing and now three deck guns plus the Prospector's Spark Rig meet them there instead
// of the rig alone (idle: rig only, dead at wave 3).
//
// Deck integrity is affordable by the author's own measurement (NoiseHuntSystem.ts:150): a full
// twelve-wave lure costs 76-77 strikes across three pads, leaving one standing at ~57-60 of 96.

const LURE_ANCHOR = null; // stay on the initial `lagoon` anchor: guns ride the hero
const PROSPECTOR_POST = { x: -4, z: 27 }; // beside the hero, OFF the trail point (0,26): range zero never fires

const PAD_PLAN = [
  { padId: 'bow', buildingId: 'turret' },          // -> harpoonBallista r14
  { padId: 'port', buildingId: 'sentry_beacon' },  // -> depthChargeRack r12 (silent)
  { padId: 'starboard', buildingId: 'sentry_beacon' },
];

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
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scorePick(b) - scorePick(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const dw = now.deepwater || {};
  const pads = dw.pads || [];
  for (const plan of PAD_PLAN) {
    const pad = pads.find(p => p.id === plan.padId);
    if (pad && !pad.occupied) orders.push({ verb: 'BOAT_BUILD', padId: plan.padId, buildingId: plan.buildingId });
  }

  if (LURE_ANCHOR && dw.anchor && dw.anchor.id !== LURE_ANCHOR) {
    orders.push({ verb: 'REANCHOR', anchorId: LURE_ANCHOR });
  }

  orders.push({ verb: 'HOLD', pos: PROSPECTOR_POST });
  return orders;
}
