// Opus 5, generation 13 — e3-fairground controller v4: bait AT the seam, zero detour, so the
// wheel armour lands at t~14 instead of t~20 — ahead of the first wrecking crew.
//
// THE OPENING IS ONE ARRAY. Views arrive at t=0.0 and then not again until t=22.1 — and the
// wheel, whose first scratch is permanent, takes its first wrecker hit at t~20. So the array sent
// at tick zero must, unattended, walk to a seam, earn ten gold, walk back and put a palisade
// between the west/east spawn ring and the Fair Wheel. v2 waited for gold at view 0 and issued
// the build at view 1: five seconds too late, every time.
//
// The bait spot is derived, not authored: ~9u from the stake ON THE LINE to the seam the
// Prospector is already walking to, so the detour is the shortest one that still beats the wheel
// (18u from a west spawn against the wheel's 46u).

const STAKE = { x: 0, z: -30 };
const RING = [180, 0, 90, 135, 45, 225, 315, 270].map((deg) => {
  const r = (deg * Math.PI) / 180;
  return { x: r1(STAKE.x + 8 * Math.cos(r)), z: r1(Math.max(-37.6, STAKE.z + 8 * Math.sin(r))) };
});
const BEACONS = [{ x: 0, z: -26 }, { x: -4, z: -30 }, { x: 4, z: -30 }, { x: 0, z: -34 }, { x: -3, z: -27 }, { x: 3, z: -27 }];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

function r1(v) { return Number(v.toFixed(1)); }
function near(a, b) { return Math.hypot(a.x - b.x, a.z - b.z) < 1.8; }

export function decide(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });

  const entries = now.works?.entries ?? [];
  const gold = now.gold ?? 0;
  const at = (spot) => entries.find((e) => e.position && near(e.position, spot));
  const placed = entries.length;
  const hurt = entries.some((e) => e.wrecked || e.hp < 0.6 * e.maxHp);

  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const p = now.prospector ?? STAKE;
  live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));

  if (placed === 0) {
    // THE WHEEL'S ARMOUR, and it has to fit inside one unattended array. Bait on the line to the
    // seam so the round trip is the shortest that still puts a building between the spawn ring
    // and the dynamo; a second one behind it so one wrecking crew cannot re-expose the wheel.
    const seam = live[0] ?? { x: 0, z: -38 };
    const d = Math.hypot(seam.x - STAKE.x, seam.z - STAKE.z) || 1;
    const bait = { x: r1(seam.x - Math.sign(seam.x||1) * 2), z: r1(seam.z + 2) };
    orders.push({ verb: 'BUILD', what: 'palisade', where: bait, when: { goldGte: 10 } });
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: r1(-bait.x), z: r1(2 * STAKE.z - bait.z) }, when: { goldGte: 10 } });
  } else {
    // One trip-order per array: mend first (25% of cost revives even a wrecked frame), then grow
    // the ring, then the beacon ladder. Everything below is the panning worklist.
    let trip = null;
    if (hurt && gold >= 8) trip = { verb: 'REPAIR_UNDER', pct: 60 };
    else if (placed < RING.length + 2 && gold >= 25) {
      const spot = RING.find((s) => !at(s));
      if (spot) trip = { verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } };
    } else {
      const n = BEACONS.filter((s) => at(s)).length;
      const cost = BEACON_COSTS[Math.min(n, 5)];
      const spot = BEACONS.find((s) => !at(s));
      if (spot && gold >= cost + 15) trip = { verb: 'BUILD', what: 'sentry_beacon', where: spot, when: { goldGte: cost } };
    }
    if (trip) orders.push(trip);
  }

  const room = Math.min(30, 32 - orders.length);
  if (live.length) for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: live[i % live.length].id });
  else for (const s of (now.seams ?? []).slice(0, 6)) orders.push({ verb: 'HARVEST', seam: s.id });
  return orders.slice(0, 32);
}

function pickUpgrade(offer) {
  const rank = (o) => {
    const s = `${o.id} ${o.name} ${o.effectText ?? ''}`.toLowerCase();
    if (/plating|maxhp|max hp|health|vitality|tough|armor|armour/.test(s)) return 0;
    if (/spark|coil|damage|tap|fire rate|firerate/.test(s)) return 1;
    if (/pan|gold|luck|yield|seam/.test(s)) return 2;
    if (/ring|range|radius|reach/.test(s)) return 3;
    return 4;
  };
  return [...offer].sort((a, b) => rank(a) - rank(b))[0].id;
}
