// e5-stillwater controller v3 — BOOTSTRAP THE LURE, THEN CARRY IT EAST.
//
// Two measured findings drive this:
//   v1 (w1, 0 kills): reanchoring to `shelf-watch` at t=0 fails because NOTHING is on the board.
//     An untrailed leviathan pursues the hero, so it never enters the ballista's r14, so the
//     ballista never clatters, so no trail is ever born. The 6s engine burst had no one to grab.
//   v2 (w4, 64 kills): at `lagoon` the ballista bootstraps instantly and the trail is then held
//     PERMANENTLY by reload clatter alone (73 fires, trail=harpoon-reload from wave 1 to death).
//     But the trail sits on the hero, so it concentrates every leviathan onto the body I must keep
//     alive. Deck integrity was never the constraint: 19 strikes of a 96-point pad.
//
// So the lure is real and self-sustaining once lit; it just has to be lit where the enemies are
// and then MOVED. Hold `lagoon` until leviathans are actually on the board and engaged, then
// REANCHOR to `shelf-watch` (36,30): the engine's r24 burst — the loudest source — grabs every
// living head and walks it 36wu east, clear of the hero, where the ballista re-engages and the
// reload clatter takes the trail back over.
const BOOTSTRAP_ALIVE = 8;      // enemies that must be on the board before the boat moves
const LURE_ANCHOR = 'shelf-watch';
const HOME_POST = { x: -4, z: 27 };   // beside the hero, off the lagoon trail point (0,26)
const LURE_POST = { x: 36, z: 20 };   // 6wu off the shelf-watch trail point: never range zero

const PAD_PLAN = [
  { padId: 'bow', buildingId: 'turret' },          // -> harpoonBallista r14: the gun AND the lure
  { padId: 'port', buildingId: 'sentry_beacon' },  // -> depthChargeRack r12 (silent, 12 munitions total)
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

  const alive = (now.threats && now.threats.alive) || 0;
  const atLure = dw.anchor && dw.anchor.id === LURE_ANCHOR;
  const lit = !!(dw.noiseHunt && dw.noiseHunt.trail && dw.noiseHunt.trail.target);

  // One cooldown-gated action per view (gen-21). Move only once the lure is lit and crewed.
  if (!atLure && lit && alive >= BOOTSTRAP_ALIVE) {
    orders.push({ verb: 'REANCHOR', anchorId: LURE_ANCHOR });
  }

  orders.push({ verb: 'HOLD', pos: atLure ? LURE_POST : HOME_POST });
  return orders;
}
