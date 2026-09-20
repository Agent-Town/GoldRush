// e5-deepwater-claim controller v1 — "park on the tour"
//
// Findings that shape it:
//  - secure = wave>=12 AND the Dredge-Queen beaten (HeadlessContractSim:1095 autoSecureWaveForRun
//    returns MAX_SAFE_INTEGER while twist.baron && !baronBeaten).
//  - the kill = 2 paddles (110hp ea) -> act 2 spawns `hold` (140hp, group
//    e5-deepwater-claim:dredge-queen-hold) -> kill it (bossKillSecuresRun).
//  - THE GUN RIDES THE PROSPECTOR: heroShooter.getPos = deepwater ? prospector.position : hero.
//    Spark Rig = 12 dmg @ 2/s = 24 dps, range 10. So standing next to the boss kills it.
//  - the boss tours the five wreck sites in reverse order, dwelling 2 claw cycles (5s) then
//    repositioning at speed 10. Parking on one site brings it to me ~every 40s.
//  - idle survives to the wave-18 ceiling untouched, so survival is not the problem.

const PARK = { x: 0, z: -22 };          // wreck site w3-pylon-barge, central on the tour
const PARK_R = 6;                        // only harvest seams essentially under my feet

export default function controller(view) {
  const now = view.now;

  // pendingSecure accepts exactly ONE order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // PICK_UPGRADE owns the tick and REPLACE semantics wipe everything, so it goes first
  // and every standing order is resent under it (gen-5).
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });
  }

  // Free gold: pan any live seam that sits under the park spot. Never name a seam that
  // would walk me off the tour stop — travel is real and the gun travels with me.
  const here = (now.seams || []).filter(s => s.active && s.x !== null &&
    Math.hypot(s.x - PARK.x, s.z - PARK.z) <= PARK_R);
  for (let i = 0; i < 20 && here.length; i += 1) {
    orders.push({ verb: 'HARVEST', seam: here[i % here.length].id });
  }

  // The anchor: HOLD is persistent and always actionable, so it must be last.
  orders.push({ verb: 'HOLD', pos: PARK });
  return orders.slice(0, 32);
}

// Score the offer; never take offer[0] blind (gen-14). Survival is the only measured
// failure mode on this map, so plating outranks damage, and damage outranks utility.
function pick(offer) {
  const score = (o) => {
    const t = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
    let s = 0;
    if (/plating|health|hp|armou?r|vital|tough|hardy/.test(t)) s += 100;
    if (/heal|regen|mend/.test(t)) s += 60;
    if (/damage|spark|coil|tap|power|strike/.test(t)) s += 40;
    if (/rate|speed|cadence|reload|cool/.test(t)) s += 25;
    if (/range|reach/.test(t)) s += 20;
    return s;
  };
  let best = offer[0];
  for (const o of offer) if (score(o) > score(best)) best = o;
  return best.id;
}
