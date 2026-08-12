import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin });
const buildSpots = {
  turret: [{ x: 2, z: 10 }, { x: -2, z: 10 }, { x: 2, z: 14 }, { x: -2, z: 14 }],
  sentry_beacon: [{ x: 0, z: 9 }, { x: 0, z: 15 }, { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 3, z: 16 }, { x: -3, z: 16 }],
  palisade: [{ x: -4, z: 12 }, { x: 4, z: 12 }, { x: -4, z: 15 }, { x: 4, z: 15 }, { x: -4, z: 9 }, { x: 4, z: 9 }],
};

for await (const line of rl) {
  let view;
  try {
    view = JSON.parse(line);
  } catch {
    continue;
  }
  if (view?.schema !== 'goldrush.view.v1') break;
  console.log(JSON.stringify(ordersFor(view)));
}

function ordersFor(view) {
  const { now, stablePrefix } = view;
  if (now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: bestUpgrade(now.pendingOffer.map(({ id }) => id), now.wave) }];
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const claim = stablePrefix.map.claim;
  const orders = [];
  const entries = now.works.entries;
  const gold = now.gold;
  const buildables = new Map((stablePrefix.mechanics.buildables ?? []).map((item) => [item.id, item]));

  if (gold >= 20 && entries.some((entry) => entry.maxHp > 0 && (entry.wrecked || entry.hp / entry.maxHp < 0.7))) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 70 });
  }
  orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 3 }, pos: claim });
  if (now.threats.alive > 0 && now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const target = nextBuild(entries, buildables, gold);
  if (target) {
    orders.push({ verb: 'MOVE_TO', pos: target.where });
    orders.push({ verb: 'BUILD', what: target.what, where: target.where, when: { goldGte: target.cost } });
  }

  const weapon = now.wave >= 6 ? 'blast' : 'rig';
  if (now.weapon !== weapon) orders.push({ verb: 'SET_WEAPON', weapon });

  if (!target) {
    const seam = now.seams.filter((entry) => entry.active).sort((a, b) => b.remaining - a.remaining)[0];
    if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  orders.push({ verb: 'HOLD', pos: claim });
  return orders;
}

function nextBuild(entries, buildables, gold) {
  const beacons = entries.filter((entry) => entry.id === 'sentry_beacon').length;
  const turrets = entries.filter((entry) => entry.id === 'turret').length;
  const priority = beacons < 2 ? ['sentry_beacon'] : turrets < 4 ? ['turret'] : ['sentry_beacon', 'palisade'];
  for (const what of priority) {
    const def = buildables.get(what);
    const spots = buildSpots[what];
    if (!def || !spots) continue;
    const built = entries.filter((entry) => entry.id === what).length;
    const cost = def.costs?.[built] ?? def.cost;
    const where = spots.find((spot) => entries.every((entry) => Math.hypot(entry.position.x - spot.x, entry.position.z - spot.z) > 1.5));
    if (where && gold >= cost) return { what, where, cost };
  }
  return null;
}

function bestUpgrade(ids, wave) {
  const blast = ['powder_charge', 'quick_fuse', 'wide_ring'];
  const rig = ['split_spark', 'double_tap_coil', 'heavy_spark', 'long_resonator', 'tinkers_plating', 'prospectors_luck', 'pan_legend', 'beacon_dynamo'];
  return [...(wave >= 6 ? blast : rig), ...rig, ...blast].find((id) => ids.includes(id)) ?? ids[0];
}
