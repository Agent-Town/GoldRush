// e5-stillwater controller v1 — the noise lure, re-derived for the crewed storm.
//
// THE MAP (verified in source this ride):
//   NoiseHuntSystem.steer() scriptMoveTo's every living `machine_leviathan` at the trail point.
//   The trail is the loudest audible noise source; `harpoon-reload` (r14) runs for 3s after every
//   harpoonBallista fire, so a deck ballista with targets in range holds the trail forever.
//   The sources ride the boat anchor. `shelf-watch` (36,30) is 36wu from the welded hero (0,30)
//   and clears both quiet zones -> a trailed pack is pulled OFF the body it was walking at.
//   The strike only damages the deck NEAREST the trail emitter (anchor+(0,-4) = bow's neighbour),
//   so bow + port are sacrificial pads (32 strikes each at 3 dmg / 96 integrity) and the ballista
//   goes on starboard, which only starts taking hits after ~64 strikes.
//
// WHAT CHANGED THIS WEEK (assets/engine-era.json + the manifest):
//   corsairWaveSize 0 -> 1 makes `deepwaterStormCarriesCorsairs` true, and the weather block went
//   from stormSeconds 0.25 to a real 32s cycle. But `deepwaterStormDisablesScheduledWaves` is
//   `carriesCorsairs && !tileParams.stillwater` -> FALSE here, so the ordinary wave scheduler still
//   runs (wave 12 at t=360). The corsairs are scripted straight across the board west->east at
//   z=0 (DeepwaterSocket:263) and recycled at x>=62; they never turn on the hero at z=30.

const LAYOUT = [
  ['bow', 'sentry_beacon'],   // depth-charge rack; nearest the emitter, dies first (sacrificial)
  ['port', 'palisade'],       // pure deck mass, second in line
  ['starboard', 'turret'],    // the harpoon ballista - the loop's single point of failure
];

const PLATING = ['tinkers_plating', 'field_dressing', 'iron_lungs', 'second_wind'];

function pickUpgrade(offer) {
  let best = offer[0];
  let bestScore = -1;
  for (const o of offer) {
    const id = String(o.id || '');
    const text = `${id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
    let s = 0;
    if (PLATING.includes(id)) s = 100;
    else if (/health|hp|heal|plating|armou?r|vital/.test(text)) s = 90;
    else if (/damage|spark|coil|volley|fire rate|pierce|blast/.test(text)) s = 60;
    else if (/range|speed|move/.test(text)) s = 30;
    else s = 10;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

const MAX_ORDERS = 32;

export default function controller(view, st) {
  const now = view.now;

  // The secure boundary: answer with a blank line. gr-sim records no entry, the frozen boundary
  // does not advance the clock, and the configured `bank` default secures the run.
  if (now.pendingSecure) return null;

  const dw = now.deepwater;
  const out = [];

  if (now.pendingOffer && now.pendingOffer.length) {
    out.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  // --- the lure ---------------------------------------------------------
  const occupied = new Set((dw?.boatBuildings ?? []).map((b) => b.padId));
  for (const [padId, buildingId] of LAYOUT) {
    if (!occupied.has(padId)) out.push({ verb: 'BOAT_BUILD', padId, buildingId });
  }

  const nh = dw?.noiseHunt;
  const trailLive = !!(nh && nh.trail && nh.trail.target !== null);
  const anchorId = dw?.anchor?.id;
  // Gate the move on the LIVE precondition, never on a clock: the pack has to be held and the
  // ballista has to be the thing holding it, or the boat carries a trail nobody is following.
  if (anchorId === 'lagoon' && trailLive && now.threats.alive >= 8 && occupied.has('starboard')) {
    out.push({ verb: 'REANCHOR', anchorId: 'shelf-watch' });
    st.reanchoredAt = now.timers.runSeconds;
  }

  // --- the purse --------------------------------------------------------
  // Panning is a HAND pan (`panAt`): it never engages the harvest channel, so the `air-pump`
  // machine stays silent and the Prospector's errand cannot disturb the trail. The Prospector
  // cannot be hit either (contact resolves on the hero), so the 60wu commute is free once the
  // pack is lured east.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const p = now.prospector || { x: 0, z: 30 };
  const capped = now.gold >= 200;
  let panning = false;
  if (live.length && !capped) {
    panning = true;
    live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
    const room = Math.max(0, MAX_ORDERS - out.length - 1);
    // Stack the nearest seam, then chain the rest: a stacked chain drains at one pan tick per
    // order, and a failed pan on a drained seam is a free decision point (the Prospector is
    // already standing there).
    for (let i = 0; i < room; i += 1) {
      const seam = live[Math.floor(i / 6) % live.length];
      out.push({ verb: 'HARVEST', seam: seam.id });
    }
  }

  // Terminal anchor order that can never be filtered away (gen 42's `[]`-is-a-wipe lesson).
  const park = panning ? { x: live[0].x, z: live[0].z + 2 } : { x: 2, z: 33 };
  out.push({ verb: 'HOLD', pos: park });

  // A drained worklist must be refilled, so an array carrying HARVEST is always resubmitted.
  // Everything else dedupes to a blank line: no tape entry, no bytes, no terminal-tick risk.
  const sig = JSON.stringify(out);
  if (!panning && sig === st.lastSig) return null;
  st.lastSig = sig;
  return out.slice(0, MAX_ORDERS);
}
