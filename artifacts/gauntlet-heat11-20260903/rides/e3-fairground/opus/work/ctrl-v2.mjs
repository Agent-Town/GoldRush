// Opus 5, generation 13 — e3-fairground controller v2.
//
// v1's finding: gold, not defence, is the binding constraint. Fourteen pending BUILD orders each
// grabbed the tick the instant gold crossed 10, so the Prospector spent 100 seconds commuting and
// banked 50 gold. And the wheel died the moment the LAST standing palisade was wrecked — proof
// that a live building anywhere near the stake is the wheel's whole armour (wreckers seek the
// nearest building; a stake-side wall is 18u from a west spawn against the wheel's 46u).
//
// v2: at most ONE trip-order per view, decided here rather than by a race of gold gates, and
// REPAIR_UNDER as the wall engine — mending a wrecked palisade costs 25% of 10 gold, against 10
// for a rebuild, and it revives wrecked works instead of leaving dead frames on the ring.

const STAKE = { x: 0, z: -30 };
const RING = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
  const r = (deg * Math.PI) / 180;
  return { x: r1(STAKE.x + 8 * Math.cos(r)), z: r1(Math.max(-37.6, STAKE.z + 8 * Math.sin(r))) };
});
// Ring build order: the two faces the wreckers actually come from, then the north gate's line.
const RING_ORDER = [4, 0, 2, 3, 1, 5, 7, 6].map((i) => RING[i]);
const BEACONS = [{ x: 0, z: -26 }, { x: -4, z: -30 }, { x: 4, z: -30 }, { x: 0, z: -34 }, { x: -3, z: -27 }, { x: 3, z: -27 }];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

function r1(v) { return Number(v.toFixed(1)); }
function near(a, b) { return Math.hypot(a.x - b.x, a.z - b.z) < 1.8; }

export function decide(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const head = [];
  if (now.pendingOffer && now.pendingOffer.length) head.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });

  const entries = now.works?.entries ?? [];
  const gold = now.gold ?? 0;
  const at = (spot) => entries.find((e) => e.position && near(e.position, spot));
  const liveAt = (spot) => { const e = at(spot); return e && !e.wrecked && e.hp > 0; };
  const ringUp = RING.filter(liveAt).length;
  const ringPlaced = RING.filter((s) => at(s)).length;
  const beaconsPlaced = BEACONS.filter((s) => at(s)).length;
  const hurt = entries.some((e) => e.wrecked || e.hp < 0.6 * e.maxHp);

  // ONE trip-order per array, chosen here. Everything below it is the panning worklist, and the
  // Prospector returns to it the moment the trip completes.
  let trip = null;
  if (ringPlaced === 0 && gold >= 10) {
    trip = { verb: 'BUILD', what: 'palisade', where: RING_ORDER[0], when: { goldGte: 10 } };
  } else if (hurt && gold >= 12) {
    trip = { verb: 'REPAIR_UNDER', pct: 60 };
  } else if (ringPlaced < RING.length && gold >= 30) {
    const spot = RING_ORDER.find((s) => !at(s));
    if (spot) trip = { verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } };
  } else if (beaconsPlaced < BEACONS.length) {
    const cost = BEACON_COSTS[Math.min(beaconsPlaced, 5)];
    if (gold >= cost + 15) {
      const spot = BEACONS.find((s) => !at(s));
      if (spot) trip = { verb: 'BUILD', what: 'sentry_beacon', where: spot, when: { goldGte: cost } };
    }
  }
  if (trip) head.push(trip);

  // The worklist tail: pan, chained nearest-first across the live seams so an emptying seam never
  // dead-ends the array (gen-9). Only 1-3 seams are live at a time on this map.
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const p = now.prospector ?? STAKE;
  live.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
  const orders = head.slice();
  const room = Math.min(30, 32 - orders.length);
  if (live.length) for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: live[i % live.length].id });
  else orders.push({ verb: 'HOLD', pos: { x: 0, z: -26 } });
  return orders.slice(0, 32);
}

function pickUpgrade(offer) {
  // The hero is a fixed gun everything walks at, and gold is this map's binding constraint:
  // survivability, then rig damage, then the pan economy.
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
