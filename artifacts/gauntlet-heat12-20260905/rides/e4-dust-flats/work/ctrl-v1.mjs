// e4-dust-flats controller v1 — heat 12, generation 51
// Secure = wave>=12 AND baronBeaten (Land-Yacht, wave 14) AND motor haul arrived.
// Errand: 3 tar nodes -> GRADE camp-to-railhead at (0,12) -> HAUL stage -> walk (0,72) -> HAUL.
// Fort: 4 turrets on radius 17.7 (arc-optimal vs orbit R=24, r=16; and 24-17.7=6.3 > craneReach 6),
//       then beacons hugging the welded hero at the claim (0,8).

const CLAIM = { x: 0, z: 8 };
const ROAD_START = { x: 0, z: 12 };
const RAILHEAD = { x: 0, z: 72 };
const CORRIDOR = 'camp-to-railhead';
const R = 17.7;
const K = R / Math.SQRT2; // 12.516

const TURRET_SPOTS = [
  { x: K, z: K }, { x: -K, z: K }, { x: K, z: -K }, { x: -K, z: -K },
  { x: R, z: 0 }, { x: -R, z: 0 }, { x: 0, z: R }, { x: 0, z: -R },
  { x: 14, z: 14 }, { x: -14, z: 14 },
];
const BEACON_SPOTS = [
  { x: 0, z: 14 }, { x: 6, z: 10 }, { x: -6, z: 10 }, { x: 0, z: 2 },
  { x: 8, z: 4 }, { x: -8, z: 4 }, { x: 5, z: 15 }, { x: -5, z: 15 },
  { x: 10, z: 8 }, { x: -10, z: 8 },
];

// price-ordered ladder, strategy-ordered: all four turrets, with two cheap beacons early for dps.
const LADDER = [
  { what: 'turret', cost: 50 },
  { what: 'sentry_beacon', cost: 25 },
  { what: 'turret', cost: 70 },
  { what: 'sentry_beacon', cost: 35 },
  { what: 'turret', cost: 95 },
  { what: 'turret', cost: 125 },
  { what: 'sentry_beacon', cost: 45 },
  { what: 'sentry_beacon', cost: 55 },
  { what: 'sentry_beacon', cost: 75 },
  { what: 'sentry_beacon', cost: 95 },
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const near = (a, b, r) => dist(a, b) <= r;

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plat|tough|max hp|maxhp|health|vital|hardy|armor|armour/.test(t)) s += 100;
  if (/dressing|heal|regen|mend|recover/.test(t)) s += 80;
  if (/damage|spark|coil|tap|bolt|power|dps|fire rate|rate of fire|heavy/.test(t)) s += 40;
  if (/range|reach|pierce|chain/.test(t)) s += 25;
  if (/blast|charge|cooldown/.test(t)) s += 20;
  if (/gold|luck|pan|seam|haul|speed|heels|boots/.test(t)) s -= 10;
  return s;
}

export default function controller(view, state, i) {
  const now = view.now;
  const orders = [];

  // pendingSecure accepts exactly one order and nothing else.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // replace semantics: the pick must own the top of the array.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1e9;
    for (const o of now.pendingOffer) { const s = scoreUpgrade(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const m = now.motor;
  const pros = now.prospector || CLAIM;

  // ---- the errand, derived from the view every time (never from my own clock) ----
  if (m && !m.objective.arrived) {
    const unharvested = (m.fuel.nodes || []).filter(n => !n.harvested);
    const tankOk = (m.fuel.stored + m.fuel.tar * 4 + m.fuel.drawn) >= 24;
    for (const n of unharvested) {
      if (tankOk && unharvested.indexOf(n) >= 2) break; // 2 nodes = 24 fuel is already enough
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x, z: n.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x + 1.2, z: n.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x, z: n.z + 1.2 } });
    }
    const graded = (m.roads.graded || []).includes(CORRIDOR)
      || (m.roads.corridors || []).some(c => c.id === CORRIDOR && c.graded);
    if (!graded) {
      orders.push({ verb: 'MOVE_TO', pos: ROAD_START });
      orders.push({ verb: 'GRADE' });
    }
    const v = m.vehicle;
    if (!near(v, ROAD_START, 3.5) && v.z < 14) {
      orders.push({ verb: 'MOVE_TO', pos: ROAD_START });
      orders.push({ verb: 'HAUL' });
    }
    orders.push({ verb: 'MOVE_TO', pos: RAILHEAD });
    orders.push({ verb: 'HAUL' });
  }

  // ---- free supplementary damage ----
  if (now.blastReadyInMs === 0 && now.threats.alive > 2) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 6 } });
  }

  // ---- the ladder: next unbuilt rungs, prefix-cumulative gates, capped under the bank cap ----
  state.blacklist = state.blacklist || new Set();
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      state.blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
    }
  }
  const entries = now.works.entries || [];
  const used = new Set(entries.map(e => `${Math.round(e.position?.x ?? e.x)},${Math.round(e.position?.z ?? e.z)}`));
  const counts = { turret: 0, sentry_beacon: 0 };
  for (const e of entries) if (counts[e.id] !== undefined) counts[e.id]++;

  const pending = { turret: 0, sentry_beacon: 0 };
  let cum = 0, emitted = 0;
  for (const rung of LADDER) {
    const already = counts[rung.what] + pending[rung.what];
    const spots = rung.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = spots.find(s => !used.has(`${Math.round(s.x)},${Math.round(s.z)}`)
      && !state.blacklist.has(`${rung.what}@${s.x},${s.z}`));
    if (!spot) continue;
    if (already >= (rung.what === 'turret' ? 4 : 6)) continue;
    cum += rung.cost;
    if (cum > 195) break;
    orders.push({ verb: 'BUILD', what: rung.what, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    used.add(`${Math.round(spot.x)},${Math.round(spot.z)}`);
    pending[rung.what]++;
    if (++emitted >= 3) break;
  }

  // ---- the tail: drain the nearest live seam in a block ----
  const live = (now.seams || []).filter(s => s.active && Number.isFinite(s.x));
  if (live.length) {
    live.sort((a, b) => dist(a, pros) - dist(b, pros));
    const seam = live[0];
    const room = 31 - orders.length;
    for (let k = 0; k < room; k++) orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  // terminal anchor that cannot be filtered away
  orders.push({ verb: 'HOLD', pos: live.length ? { x: live[0].x, z: live[0].z } : CLAIM });

  return orders.slice(0, 32);
}
