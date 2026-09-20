// Opus 5, generation 13 — e3-fairground controller.
//
// The map, derived from the manifest + engine:
//   stake/hero (fixed gun)      (0,-30)      spawn ring radius 26 around it (W/E/N edges)
//   Fair Wheel (megaproject)    (0,8)  240hp — ANY damage stops the dynamo for the run.
//   3 flocks home at x=-20/0/+20, z=-30; walk to copper(-20,10)/wheel(0,8)/silver(20,10)
//     and back at 3.6u/s each night (24s cycle). Any live enemy within 7u => scatter, no credit.
//   Secure = wave 12 AND wheel still spinning AND all three flocks crossed once.
//   Buildables here: palisade 10g (cap 48), sentry_beacon 25/35/45/55/75/95 (cap 6),
//     sluice/stockpile/assay_office. NO TURRET (powerGrid filters it out).
//
// The plan:
//   1. Wreckers seek the NEAREST building. With no buildings the wheel is the only one, so it
//      eats the first hit at t~22s and the run is dead. A palisade near the stake is 18u from a
//      west spawn against the wheel's 46u — so the first two palisades are the wheel's armour.
//   2. A tight palisade ring at radius 8 holds the besiegers at ~10u from the stake, which is
//      outside the flocks' 7u fright radius, so the crowds can launch at all.
//   3. Pan the nearest live seam with a stacked, seam-chained HARVEST tail.

const STAKE = { x: 0, z: -30 };
const RING_R = 8;

// Ring order: west and east faces first (the spawn edges that carry the wreckers), then north,
// then the flanks, then the south arc nothing spawns behind.
const RING_ANGLES = [180, 0, 90, 150, 30, 120, 60, 165, 15, 105, 75, 135, 45, 210, 330, 240, 300, 270];
const RING = RING_ANGLES.map((deg) => {
  const r = (deg * Math.PI) / 180;
  return {
    x: round1(STAKE.x + RING_R * Math.cos(r)),
    z: round1(clampZ(STAKE.z + RING_R * Math.sin(r))),
  };
});

const BEACONS = [{ x: 0, z: -26 }, { x: 0, z: -34 }, { x: -4, z: -30 }, { x: 4, z: -30 }];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

function round1(v) { return Number(v.toFixed(1)); }
function clampZ(z) { return Math.max(-37.6, Math.min(-12.4, z)); }
function near(a, b) { return Math.hypot(a.x - b.x, a.z - b.z) < 1.6; }

export function decide(view) {
  const now = view.now;

  // pendingSecure accepts exactly ONE order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // The draft is free money; it must own the tick, so it goes first and everything is resent under it.
  if (now.pendingOffer && now.pendingOffer.length) orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });

  const entries = now.works?.entries ?? [];
  const standing = entries.filter((e) => !e.wrecked && e.position);
  const built = (spot) => standing.some((e) => near(e.position, spot));
  const palisadesUp = standing.filter((e) => e.id === 'palisade').length;
  const beaconsUp = standing.filter((e) => e.id === 'sentry_beacon').length;

  // Mend only once the wall exists; before that every second of the Prospector's feet is the ring.
  if (palisadesUp >= 8) orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // The ring: one order per unbuilt slot, all at 10 gold. Equal prices cannot starve each other —
  // each record goes `done` and the next takes the following tick as gold allows.
  let slots = 0;
  for (const spot of RING) {
    if (slots >= 14) break;
    if (built(spot)) continue;
    orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
    slots += 1;
  }

  // Beacons after the ring: they slow and light what touches the wall. Gated on the ring being
  // up so a 25g beacon can never steal the gold a 10g wall segment still needs.
  if (palisadesUp >= 12) {
    for (let i = 0; i < BEACONS.length; i += 1) {
      if (built(BEACONS[i])) continue;
      const cost = BEACON_COSTS[Math.min(beaconsUp, BEACON_COSTS.length - 1)];
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: BEACONS[i], when: { goldGte: cost } });
      break; // one beacon rung at a time; the next view re-reads the price curve
    }
  }

  // The worklist tail: pan, chained across every live seam nearest-first so a seam that empties
  // under the Prospector does not dead-end the whole tail (gen-9).
  const live = (now.seams ?? []).filter((s) => s.active !== false);
  const p = now.prospector ?? now.hero ?? STAKE;
  live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
  const room = 31 - orders.length;
  if (live.length) {
    for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: live[i % live.length].id });
  }
  return orders.slice(0, 32);
}

function pickUpgrade(offer) {
  // gen-11 correction: picking offer[0] is a default, not a policy. The hero is a fixed gun that
  // everything walks at, so survivability first, then damage.
  const rank = (o) => {
    const s = `${o.id} ${o.name} ${o.effectText ?? ''}`.toLowerCase();
    if (/plating|health|hp|vitality|tough/.test(s)) return 0;
    if (/spark|coil|damage|tap|rate|fire/.test(s)) return 1;
    if (/range|reach/.test(s)) return 2;
    return 3;
  };
  return [...offer].sort((a, b) => rank(a) - rank(b))[0].id;
}
