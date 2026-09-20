// e3-moth-season controller, new (post-ADR-005) grammar.
// Era gate: one sentry_beacon within 2.5 of the pylon site (0,-14) latches
// canyonConnect ONE-WAY (HeadlessContractSim:2705). 25 gold buys it forever.
// Fort: sentry_beacon only (powerGrid filters turret out of the roster).
// Claim (0,12) sits INSIDE the dark-corridor build zone, so the fort rings the hero.

const CLAIM = { x: 0, z: 12 };
const PYLON = { x: 0, z: -14 };

// Fort candidates: dark-corridor is x -6..6, z -34..34. Beacon radius 8, so
// everything here covers the hero at (0,12). More candidates than slots.
const FORT = [
  { x: 0, z: 16 }, { x: -4, z: 10 }, { x: 4, z: 10 }, { x: -4, z: 15 },
  { x: 4, z: 15 }, { x: 0, z: 19 }, { x: -5, z: 6 }, { x: 5, z: 6 },
  { x: -5, z: 18 }, { x: 5, z: 18 }, { x: 0, z: 9 }, { x: -3, z: 20 },
  { x: 3, z: 20 }, { x: -6, z: 13 }, { x: 6, z: 13 },
];
// Late chaff/sink: palisades absorb saboteurs and keep the purse off the 200 cap
// (a pinned purse refuses credits, which switches panning off).
const CHAFF = [
  { x: -2, z: 4 }, { x: 2, z: 4 }, { x: -2, z: 22 }, { x: 2, z: 22 },
  { x: -5, z: 2 }, { x: 5, z: 2 }, { x: -5, z: 24 }, { x: 5, z: 24 },
  { x: 0, z: 2 }, { x: 0, z: 24 }, { x: -6, z: 8 }, { x: 6, z: 8 },
];

const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const GROUND_FAILS = /out_of_zone|collision|cap_reached|UNREACHABLE|out_of_reach/i;

function d(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|armor|armour|vitality|max hp|maxhp|health|tough|hearty/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
  if (/spark|damage|coil|tap|power|pierce|burst/.test(s)) v += 40;
  if (/rate|speed|fire|reload|cadence/.test(s)) v += 30;
  if (/gold|pan|luck|prospect|seam/.test(s)) v += 5;
  return v;
}

export default function decide(view, st) {
  const n = view.now;

  // Secure boundary: a blank line records no tape entry and takes the `bank`
  // default for free (keeps the last accepted order inside the tick envelope).
  if (n.pendingSecure) return '\n';

  if (!st.init) {
    st.init = true;
    st.blacklist = new Set();   // GROUND refusals only
    st.tries = {};              // per-coordinate patience budget
    st.lastSig = null;
  }

  // Harvest refusals are ordinary (a drained seam); only poison BUILD ground.
  for (const rec of n.orders || []) {
    const o = rec.order || rec;
    if (o && o.verb === 'BUILD' && rec.status === 'failed' && rec.reason) {
      if (GROUND_FAILS.test(rec.reason)) st.blacklist.add(`${o.where.x},${o.where.z}`);
      // insufficient_gold is TRANSIENT: poison nothing, retry (gen-51).
    }
  }

  const orders = [];

  // 1. Draft first — replace semantics mean the pick must own the array's head.
  if (n.pendingOffer && n.pendingOffer.length) {
    const best = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage into the scrum standing on the hero.
  if (n.blastReadyInMs === 0 && n.hero) {
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 10 } });
  }

  // 3. Build ladder. Cumulative gating: rung i waits for the cost of rungs 0..i,
  // so a cheap rung can never steal gold an expensive one is waiting for.
  const entries = n.works?.entries || [];
  const beacons = entries.filter((e) => e.id === 'sentry_beacon');
  const nBeacon = beacons.length;
  const gateLatched = n.canyonConnect?.complete === true;

  const rungs = [];
  // Rung 0 is ALWAYS the era gate while it is open: 25 gold, one-way, permanent.
  if (!gateLatched && nBeacon < 6 && !st.blacklist.has(`${PYLON.x},${PYLON.z}`)) {
    rungs.push({ what: 'sentry_beacon', where: PYLON, cost: BEACON_COSTS[nBeacon] ?? 95 });
  }
  // Then the fort, cheapest legal free slot first.
  const taken = new Set(entries.map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
  let idx = nBeacon + (gateLatched ? 0 : 1);
  for (const c of FORT) {
    if (rungs.length >= 3) break;
    const key = `${c.x},${c.z}`;
    if (st.blacklist.has(key) || taken.has(key)) continue;
    if (idx > 5) break;
    rungs.push({ what: 'sentry_beacon', where: c, cost: BEACON_COSTS[idx] ?? 95 });
    idx++;
  }
  // Surplus sink once the beacon ladder is capped: chaff keeps the purse moving
  // (gold pinned at the 200 cap refuses credits and stops the economy dead).
  if (nBeacon >= 6) {
    const nPal = entries.filter((e) => e.id === 'palisade').length;
    let placed = 0;
    for (const c of CHAFF) {
      if (placed >= 3) break;
      const key = `${c.x},${c.z}`;
      if (st.blacklist.has(key) || taken.has(key)) continue;
      rungs.push({ what: 'palisade', where: c, cost: 10 });
      placed++;
    }
    void nPal;
  }
  let cum = 0;
  for (const r of rungs) {
    cum += r.cost;
    orders.push({ verb: 'BUILD', what: r.what, where: r.where, when: { goldGte: cum } });
  }

  // 4. Mending is now bounded to the human radius, so it costs no long commute.
  if ((n.works?.wrecked || 0) > 0 || (n.works?.hp || 0) < (n.works?.maxHp || 0)) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 65 });
  }

  // 5. Harvest tail. Seams re-anchor and an INACTIVE seam publishes x/z as null,
  // so a non-finite coordinate would refuse the whole array: filter on isFinite.
  const live = (n.seams || [])
    .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, dc: d(s, CLAIM) }))
    .sort((a, b) => a.dc - b.dc);

  const slots = Math.max(0, 31 - orders.length);
  if (live.length) {
    // Drain one seam in a block before walking to the next (a 30-capacity seam is
    // six 1.5s pans; rotating per-pan is a commute generator).
    let i = 0;
    outer: while (i < slots) {
      for (const s of live) {
        for (let k = 0; k < 6 && i < slots; k++, i++) {
          orders.push({ verb: 'HARVEST', seam: s.id });
        }
        if (i >= slots) break outer;
      }
    }
  }

  // 6. Terminal anchor that cannot be filtered away: if every seam is dark, keep
  // the hero parked at the claim so the array is never empty ([] wipes orders).
  if (orders.length === 0) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  return orders.slice(0, 32);
}
