// e4-dust-flats controller v2 — heat 12, generation 51
// v1 -> v2 fixes:
//  1. NEVER blacklist a coordinate on `insufficient_gold` (transient economics, not bad ground).
//     v1 poisoned all 20 candidate spots this way and rode 157s with 200 gold and one turret.
//  2. Gate each rung on its ACTUAL next-instance price from mechanics.buildables[].costs[count],
//     not on a nominal ladder cost. After one turret stands the next costs 70, not 50.
//  3. Pan only seams near the claim; camp on the near seam and wait out its respawn instead of
//     walking 76wu across the flat for five gold.

const CLAIM = { x: 0, z: 8 };
const ROAD_START = { x: 0, z: 12 };
const RAILHEAD = { x: 0, z: 72 };
const CORRIDOR = 'camp-to-railhead';
const R = 17.7;
const K = R / Math.SQRT2;

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
const LADDER = ['turret', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'];
const MAXC = { turret: 4, sentry_beacon: 6 };
const BANK_GATE = 195;
const SEAM_MAX_DIST = 50; // from the claim; the far pairs are 76wu and never worth the walk

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = s => `${Math.round(s.x)},${Math.round(s.z)}`;

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

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (!state.costs) {
    state.costs = {};
    for (const b of (view.stablePrefix.mechanics.buildables || [])) state.costs[b.id] = b.costs || [b.cost];
  }
  const priceOf = (kind, n) => {
    const arr = state.costs[kind] || [];
    return arr[Math.min(n, arr.length - 1)] ?? 1e9;
  };

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1e9;
    for (const o of now.pendingOffer) { const s = scoreUpgrade(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const pros = now.prospector || CLAIM;
  const m = now.motor;
  if (m && !m.objective.arrived) {
    for (const n of (m.fuel.nodes || [])) {
      if (n.harvested) continue;
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x, z: n.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x + 1.2, z: n.z } });
      orders.push({ verb: 'MOVE_TO', pos: { x: n.x, z: n.z + 1.2 } });
    }
    const graded = (m.roads.graded || []).includes(CORRIDOR)
      || (m.roads.corridors || []).some(c => c.id === CORRIDOR && c.graded);
    if (!graded) { orders.push({ verb: 'MOVE_TO', pos: ROAD_START }); orders.push({ verb: 'GRADE' }); }
    const v = m.vehicle;
    if (dist(v, ROAD_START) > 3.5 && v.z < 14) {
      orders.push({ verb: 'MOVE_TO', pos: ROAD_START });
      orders.push({ verb: 'HAUL' });
    }
    orders.push({ verb: 'MOVE_TO', pos: RAILHEAD });
    orders.push({ verb: 'HAUL' });
  }

  if (now.blastReadyInMs === 0 && now.threats.alive > 2) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 6 } });
  }

  // ---- ladder ----
  state.bad = state.bad || new Set();
  for (const rec of (now.orders || [])) {
    const o = rec.order || {};
    if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
    const r = String(rec.reason || '');
    // ONLY real ground refusals poison a coordinate. insufficient_gold is transient.
    if (/out_of_zone|collision|cap_reached|out_of_reach/.test(r)) state.bad.add(`${o.what}@${key(o.where)}`);
  }

  const entries = now.works.entries || [];
  const used = new Set(entries.map(e => key(e.position || e)));
  const counts = { turret: 0, sentry_beacon: 0 };
  for (const e of entries) if (counts[e.id] !== undefined && !e.wrecked) counts[e.id]++;

  const pend = { turret: 0, sentry_beacon: 0 };
  let cum = 0, emitted = 0;
  for (const kind of LADDER) {
    const n = counts[kind] + pend[kind];
    if (n >= MAXC[kind]) continue;
    const spot = (kind === 'turret' ? TURRET_SPOTS : BEACON_SPOTS)
      .find(s => !used.has(key(s)) && !state.bad.has(`${kind}@${key(s)}`));
    if (!spot) continue;
    cum += priceOf(kind, n);
    if (cum > BANK_GATE) break;
    orders.push({ verb: 'BUILD', what: kind, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    used.add(key(spot));
    pend[kind]++;
    if (++emitted >= 3) break;
  }

  // ---- economy ----
  // v3: NEVER filter the tail to empty. A HARVEST on a depleted seam fails where the Prospector
  // already stands: it costs nothing and BUYS THE SURPRISE VIEW that lets the ladder re-plan.
  // v2 filtered on `active`, got an empty set, stood on one HOLD for 90 seconds and froze the purse.
  // v4 SYNTHESIS: tune-1 proved a ROTATING economy (0.90 g/s) beats camping one seam (0.60 g/s),
  // because one seam supplies only 30 gold per 29s respawn. Rotate live-first, nearest-to-the-worker
  // first, and never stand still: an idle Prospector is the only thing that froze the purse.
  state.pos = state.pos || {};
  for (const s2 of (now.seams || [])) if (Number.isFinite(s2.x)) state.pos[s2.id] = { x: s2.x, z: s2.z };
  const all = (now.seams || []).filter(s2 => Number.isFinite(s2.x));
  const ranked = all.slice().sort((a, b) => {
    const sa = a.active ? 0 : 1, sb = b.active ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return dist(a, pros) - dist(b, pros);
  });
  const ids = ranked.length ? ranked.map(s2 => s2.id) : ['gold-seam-3'];
  const room = Math.max(0, 31 - orders.length);
  // drain the head seam in a block (its capacity is 30 = six pans), then offer the next ones
  for (let k = 0; k < room; k++) orders.push({ verb: 'HARVEST', seam: ids[k < 7 ? 0 : (1 + ((k - 7) % Math.max(1, ids.length - 1)))] });
  const home = state.pos[ids[0]] || { x: -18, z: 46 };
  orders.push({ verb: 'HOLD', pos: home });

  return orders.slice(0, 32);
}
