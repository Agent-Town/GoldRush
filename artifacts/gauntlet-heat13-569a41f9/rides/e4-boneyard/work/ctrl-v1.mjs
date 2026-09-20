// e4-boneyard controller, post-ADR-005 grammar (MOVE_HERO / HARVEST / BUILD / HAUL only).
//
// The contract: secure = wave 12 AND now.motor.objective.arrived (a two-leg tow).
// Ranking: waves and timeAlive are pinned by the fixed wave-12 secure, so GOLD (cap 200) is the
// only free axis. Plan: discharge the errand in the opening quiet, fort the claim, then stop
// spending in time for the purse to refill to the 200 cap before the bank.

const CLAIM = { x: 0, z: -44 };
const HULK_STANDOFF = 1.5;      // hero stands this far south of the hulk; MOTOR_STOP_REACH is 2.5
const NODE_ZIG = 1.3;           // e4Fuel.harvestRange is 1.35; a zig at 1.3 stays inside the disc
const MAX_ORDERS = 32;
const STOP_BUILDING_AT = 258;   // leave >=100s for the purse to climb back to the 200 cap

// Ladder: strategy order (turrets carry 57 dps at range 16; beacons 8wu slow), price ascending
// inside each family. Costs read live from mechanics.buildables[].costs indexed past what stands.
const LADDER = [
  { id: 'turret' }, { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'turret' }, { id: 'sentry_beacon' }, { id: 'turret' },
  { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
];

// More candidate spots than slots; GROUND refusals poison a spot, ECONOMY refusals never do.
const SPOTS = {
  turret: [
    { x: -7, z: -39 }, { x: 7, z: -39 }, { x: 0, z: -37 }, { x: -14, z: -41 },
    { x: 14, z: -41 }, { x: -13, z: -37 }, { x: 13, z: -37 }, { x: 0, z: -50 },
  ],
  sentry_beacon: [
    { x: -4, z: -42 }, { x: 4, z: -42 }, { x: 0, z: -47 }, { x: -5, z: -46 },
    { x: 5, z: -46 }, { x: -1, z: -40 }, { x: -9, z: -44 }, { x: 9, z: -44 },
  ],
};

const GROUND_REASONS = ['out_of_zone', 'collision', 'cap_reached', 'UNREACHABLE', 'outside'];
const poisoned = new Set();
const tries = new Map();

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
function finite(p) { return p && Number.isFinite(p.x) && Number.isFinite(p.z); }

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  let s = 0;
  if (/plating|health|max hp|maxhp|vigor|dressing|tough|hearty|constitution/.test(t)) s += 100;
  if (/heal|regen|recover/.test(t)) s += 60;
  if (/damage|spark|coil|tap|power|bolt/.test(t)) s += 40;
  if (/rate|speed|reload|cadence/.test(t)) s += 25;
  if (/range|reach/.test(t)) s += 15;
  return s;
}

function readRefusals(now) {
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !finite(o.where)) continue;
    const reason = String(rec.reason || '');
    if (/insufficient_gold/i.test(reason)) continue;
    if (GROUND_REASONS.some((r) => reason.includes(r))) poisoned.add(`${o.what}@${o.where.x},${o.where.z}`);
  }
}

function nextSpot(kind, taken) {
  for (const p of SPOTS[kind]) {
    const key = `${kind}@${p.x},${p.z}`;
    if (poisoned.has(key)) continue;
    if (taken.has(`${p.x},${p.z}`)) continue;
    const n = (tries.get(key) || 0);
    if (n >= 6) { poisoned.add(key); continue; }
    return { p, key };
  }
  return null;
}

export default function control(view, table) {
  const now = view.now;
  const t = now.timers?.simTimeSeconds ?? now.timers?.elapsedSeconds ?? 0;

  // The secure boundary: a blank line records no tape entry and takes the configured `bank`.
  if (now.pendingSecure) {
    table.push({ t, note: 'secure-boundary blank line', gold: now.gold });
    return null;
  }

  readRefusals(now);

  const orders = [];
  const motor = now.motor;
  const obj = motor?.objective;

  // 1. The draft. First under replace semantics; a plating-first scorer, never offer[0].
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. The errand — a state machine over the view, never over my own clock.
  let phase = 'fort';
  if (motor && obj && !obj.arrived) {
    const hero = { x: now.hero.x, z: now.hero.z };
    const stopStart = motor.roads.corridors.find((c) => c.id === obj.corridorId)?.start ?? { x: -8, z: -38 };
    if (!obj.hitched) {
      phase = 'tar+hitch';
      // Tar nodes: both bodies harvest, and the hero is the one I can position. Visit the
      // unharvested ones greedily nearest-first, dwelling long enough for harvestSeconds 0.5.
      const nodes = (motor.fuel.nodes || []).filter((n) => !n.harvested && finite(n));
      const remaining = nodes.slice();
      let from = hero;
      while (remaining.length && orders.length < 20) {
        remaining.sort((a, b) => dist(from, a) - dist(from, b));
        const n = remaining.shift();
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x + NODE_ZIG, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x - NODE_ZIG, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x + NODE_ZIG, z: n.z } });
        from = n;
      }
      const hulk = obj.hulk;
      orders.push({ verb: 'MOVE_HERO', pos: { x: hulk.x, z: hulk.z - HULK_STANDOFF } });
      orders.push({ verb: 'HAUL' });
      // Pre-position for leg two while the Hauler drives to the hitch; the dispatch point is
      // captured at HAUL time, so walking away cannot redirect it.
      orders.push({ verb: 'MOVE_HERO', pos: { x: stopStart.x, z: stopStart.z } });
    } else {
      phase = 'deliver';
      orders.push({ verb: 'MOVE_HERO', pos: { x: stopStart.x, z: stopStart.z } });
      orders.push({ verb: 'HAUL' });
      orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    }
  } else {
    // 3. Home. Free insurance: completes in one tick where the hero already stands.
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  // 4. The ladder — only rungs whose CUMULATIVE cost the purse already covers, so one trip to
  // camp lands the whole batch and nothing fires early or stalls the Prospector at the claim.
  let built = 0;
  if (phase === 'fort' && t < STOP_BUILDING_AT) {
    const byKind = now.works?.byKind || {};
    const entries = now.works?.entries || [];
    const taken = new Set(entries.map((e) => `${Math.round(e.position?.x ?? e.x)},${Math.round(e.position?.z ?? e.z)}`));
    const counts = {};
    const costOf = (id, n) => {
      const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
      const costs = b?.costs || [];
      return costs[Math.min(n, costs.length - 1)] ?? b?.cost ?? 9999;
    };
    let purse = now.gold;
    for (const rung of LADDER) {
      if (orders.length >= MAX_ORDERS - 8) break;
      const standing = (byKind[rung.id] ?? 0) + (counts[rung.id] ?? 0);
      const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === rung.id);
      if (b && standing >= (b.maxCount ?? 99)) { counts[rung.id] = standing - (byKind[rung.id] ?? 0); continue; }
      const price = costOf(rung.id, standing);
      if (purse < price) break;
      const spot = nextSpot(rung.id, taken);
      if (!spot) break;
      tries.set(spot.key, (tries.get(spot.key) || 0) + 1);
      taken.add(`${spot.p.x},${spot.p.z}`);
      orders.push({ verb: 'BUILD', what: rung.id, where: spot.p, when: { goldGte: price } });
      counts[rung.id] = (counts[rung.id] ?? 0) + 1;
      purse -= price;
      built += 1;
    }
  }

  // 5. The tail: drain one seam in a block before walking to the next. Inactive seams publish
  // null coordinates, and one non-finite number refuses the whole array.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = { x: now.prospector?.x ?? CLAIM.x, z: now.prospector?.z ?? CLAIM.z };
  const chain = [];
  const pool = live.slice();
  let from = pros;
  while (pool.length && chain.length < 4) {
    pool.sort((a, b) => dist(from, a) - dist(from, b));
    const s = pool.shift();
    chain.push(s);
    from = s;
  }
  let i = 0;
  while (orders.length < MAX_ORDERS && chain.length) {
    const s = chain[Math.floor(i / 6) % chain.length];
    orders.push({ verb: 'HARVEST', seam: s.id });
    i += 1;
  }
  if (orders.length === 0) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });

  table.push({
    t: Number(t.toFixed(1)), w: now.wave, gold: now.gold, pan: now.score?.goldPanned,
    hp: `${Math.round(now.hero.hp)}/${now.hero.maxHp}`, hero: `${now.hero.x.toFixed(0)},${now.hero.z.toFixed(0)}`,
    alive: now.threats?.alive, works: now.works?.byKind, wrecked: now.works?.wrecked,
    phase, built, orders: orders.length,
    fuel: motor ? { st: motor.fuel.stored, tar: motor.fuel.tar, nodes: motor.fuel.harvestedNodes, drawn: motor.fuel.drawn } : null,
    tow: obj ? { hitched: obj.hitched, arrived: obj.arrived, veh: `${motor.vehicle.x.toFixed(1)},${motor.vehicle.z.toFixed(1)}:${motor.vehicle.state}` } : null,
    fails: (now.orders || []).filter((r) => r.status === 'failed').slice(0, 3).map((r) => `${r.order?.verb}:${String(r.reason || '').slice(0, 48)}`),
  });

  return orders.slice(0, MAX_ORDERS);
}
