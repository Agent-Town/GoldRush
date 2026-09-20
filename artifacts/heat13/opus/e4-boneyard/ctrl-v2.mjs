// e4-boneyard controller v2, post-ADR-005 grammar (MOVE_HERO / HARVEST / BUILD / HAUL only).
//
// v1 findings, all mine: (a) the hulk carries a landmark blocker 2.33 x 1.76 wide, so my single
// standoff at (-18,-9.5) answered UNREACHABLE_TERRAIN and the tow never hitched; (b) the fort was
// gated behind the errand, so the run died at wave 4 with 200 gold and zero works; (c) the seam
// chain re-sorted across the whole map and walked the Prospector 60wu for 5 gold.

const CLAIM = { x: 0, z: -44 };
const NODE_ZIG = 1.3;           // e4Fuel.harvestRange 1.35: a zig at 1.3 never leaves the disc
const MAX_ORDERS = 32;
const STOP_BUILDING_AT = 255;   // >=100s left for the purse to climb back to the 200 bank cap
const CLUSTER = 26;             // only chain a second seam this close to the first

// Standoffs around the hulk, ordered by preference. All are outside the landmark rect
// (|dx| <= 2.333 or |dz| <= 1.759 blocks) and inside MOTOR_STOP_REACH 2.5 even after the hero's
// 0.5 arrival radius. An unwalkable one fails in a tick and the array picks the next.
function standoffs(h) {
  return [
    { x: h.x, z: h.z - 1.85 }, { x: h.x, z: h.z - 2.05 },
    { x: h.x - 1.2, z: h.z - 1.95 }, { x: h.x + 1.2, z: h.z - 1.95 },
    { x: h.x, z: h.z + 1.9 }, { x: h.x - 2.45, z: h.z },
  ];
}

const LADDER = [
  { id: 'turret' }, { id: 'turret' }, { id: 'sentry_beacon' }, { id: 'turret' },
  { id: 'sentry_beacon' }, { id: 'turret' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
];

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

const GROUND = ['out_of_zone', 'collision', 'cap_reached', 'UNREACHABLE', 'outside buildable'];
const poisoned = new Set();
const tries = new Map();

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const finite = (p) => p && Number.isFinite(p.x) && Number.isFinite(p.z);

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  let s = 0;
  if (/plating|health|max hp|maxhp|vigor|dressing|tough|hearty|constitution/.test(t)) s += 100;
  if (/heal|regen|recover|mend/.test(t)) s += 60;
  if (/damage|spark|coil|tap|power|bolt/.test(t)) s += 40;
  if (/rate|reload|cadence|fire/.test(t)) s += 25;
  if (/range|reach/.test(t)) s += 15;
  return s;
}

function readRefusals(now) {
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !finite(o.where)) continue;
    const reason = String(rec.reason || '');
    if (/insufficient_gold/i.test(reason)) continue;          // ECONOMY: retry, poison nothing
    if (GROUND.some((r) => reason.includes(r))) poisoned.add(`${o.what}@${o.where.x},${o.where.z}`);
  }
}

function nextSpot(kind, taken) {
  for (const p of SPOTS[kind]) {
    const key = `${kind}@${p.x},${p.z}`;
    if (poisoned.has(key) || taken.has(`${p.x},${p.z}`)) continue;
    if ((tries.get(key) || 0) >= 6) { poisoned.add(key); continue; }
    return { p, key };
  }
  return null;
}

export default function control(view, table) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;

  if (now.pendingSecure) {                      // blank line: no tape entry, takes the `bank` default
    table.push({ t, note: 'secure-boundary blank line', gold: now.gold, wave: now.wave });
    return null;
  }

  readRefusals(now);
  const orders = [];
  const motor = now.motor;
  const obj = motor?.objective;
  let phase = 'fort';

  // 1. The draft, first under replace semantics; plating-first, never offer[0].
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. The errand: a state machine over now.motor, never over my own clock.
  if (motor && obj && !obj.arrived) {
    const hero = { x: now.hero.x, z: now.hero.z };
    const start = motor.roads.corridors.find((c) => c.id === obj.corridorId)?.start ?? { x: -8, z: -38 };
    if (!obj.hitched) {
      phase = 'tar+hitch';
      const remaining = (motor.fuel.nodes || []).filter((n) => !n.harvested && finite(n));
      let from = hero;
      while (remaining.length && orders.length < 18) {
        remaining.sort((a, b) => dist(from, a) - dist(from, b));
        const n = remaining.shift();
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x + NODE_ZIG, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x - NODE_ZIG, z: n.z } });
        orders.push({ verb: 'MOVE_HERO', pos: { x: n.x + NODE_ZIG, z: n.z } });
        from = n;
      }
      for (const p of standoffs(obj.hulk)) orders.push({ verb: 'MOVE_HERO', pos: p });
      orders.push({ verb: 'HAUL' });
      // No pre-positioning here: HAUL captures the dispatch point, but a SECOND haul issued from
      // the gate before the hitch would re-target the Hauler and lose the leg.
    } else {
      phase = 'deliver';
      orders.push({ verb: 'MOVE_HERO', pos: { x: start.x, z: start.z } });
      orders.push({ verb: 'HAUL' });
      orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    }
  } else {
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  // 3. The ladder. Only the prefix whose CUMULATIVE cost the purse already covers, so one trip to
  // camp lands the batch. Never gated behind the errand: v1 died at wave 4 with a full purse.
  let built = 0;
  if (t < STOP_BUILDING_AT) {
    const byKind = now.works?.byKind || {};
    const entries = now.works?.entries || [];
    const taken = new Set(entries.map((e) => {
      const p = e.position || e;
      return `${Math.round(p.x)},${Math.round(p.z)}`;
    }));
    const buildables = view.stablePrefix.mechanics.buildables || [];
    const counts = {};
    let purse = now.gold;
    for (const rung of LADDER) {
      if (orders.length >= MAX_ORDERS - 8) break;
      const b = buildables.find((x) => x.id === rung.id);
      const standing = (byKind[rung.id] ?? 0) + (counts[rung.id] ?? 0);
      if (b && standing >= (b.maxCount ?? 99)) continue;
      const costs = b?.costs || [];
      const price = costs[Math.min(standing, costs.length - 1)] ?? b?.cost ?? 9999;
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

  // 4. The tail. Drain one seam in a block before walking, and only chain a neighbour that is
  // actually next door: seams re-anchor on depletion and a naive nearest-first sort across ten
  // anchors walked the Prospector 60wu for five gold in v1.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = { x: now.prospector?.x ?? CLAIM.x, z: now.prospector?.z ?? CLAIM.z };
  const chain = [];
  if (live.length) {
    const pool = live.slice().sort((a, b) => dist(pros, a) - dist(pros, b));
    const head = pool.shift();
    chain.push(head);
    for (const s of pool.sort((a, b) => dist(head, a) - dist(head, b))) {
      if (chain.length >= 2) break;
      if (dist(head, s) <= CLUSTER) chain.push(s);
    }
  }
  let i = 0;
  while (orders.length < MAX_ORDERS && chain.length) {
    orders.push({ verb: 'HARVEST', seam: chain[Math.floor(i / 5) % chain.length].id });
    i += 1;
  }
  if (!orders.length) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });

  table.push({
    t: Number(t.toFixed(1)), w: now.wave, gold: now.gold, pan: now.score?.goldPanned,
    hp: `${Math.round(now.hero.hp)}/${now.hero.maxHp}`,
    hero: `${now.hero.x.toFixed(0)},${now.hero.z.toFixed(0)}`,
    pros: `${pros.x.toFixed(0)},${pros.z.toFixed(0)}`,
    alive: now.threats?.alive, works: now.works?.byKind, wrecked: now.works?.wrecked,
    phase, built, n: orders.length,
    fuel: motor ? `st${motor.fuel.stored} tar${motor.fuel.tar} n${motor.fuel.harvestedNodes} drawn${motor.fuel.drawn}` : null,
    tow: obj ? `h:${obj.hitched} a:${obj.arrived} veh:${motor.vehicle.x.toFixed(1)},${motor.vehicle.z.toFixed(1)}:${motor.vehicle.state}` : null,
    chain: chain.map((s) => `${s.id}@${s.x},${s.z}`),
    fails: (now.orders || []).filter((r) => r.status === 'failed').slice(0, 3)
      .map((r) => `${r.order?.verb}:${String(r.reason || '').slice(0, 44)}`),
  });

  return orders.slice(0, MAX_ORDERS);
}
