// Probe A-max: v3 plus EVERYTHING the claim-side buildZone can buy — a gun over the weld and a
// palisade screen around it. Prices lever (a) at its ceiling; if this does not secure, (a) is dead.
const RELAY = { x: 24, z: 40 };
const STOCKPILE = { x: 45, z: 41 };
const CLAIM = { x: 0, z: 12 };
const GUNS = [{ x: 0, z: 20 }, { x: -6, z: 6 }, { x: 6, z: 6 }];
// A screen on the three open sides of the weld, inside the probe zone, clear of the landmark at z=18.
const SCREEN = [
  { x: -6, z: 20 }, { x: 6, z: 20 }, { x: -9, z: 14 }, { x: 9, z: 14 },
  { x: -9, z: 8 }, { x: 9, z: 8 }, { x: -3, z: 4 }, { x: 3, z: 4 },
  { x: -9, z: 20 }, { x: 9, z: 20 },
];

const PICK_SCORE = {
  tinkers_plating: 100, field_dressing: 96, split_spark: 82, heavy_spark: 72,
  double_tap_coil: 66, long_resonator: 52, sharpen: 46, powder_charge: 40,
  wide_ring: 38, quick_fuse: 36, assay_bonus: 32, prospectors_luck: 28,
  pan_legend: 26, spring_heels: 14, beacon_dynamo: 4,
};
function pick(offer) {
  let best = offer[0], bestScore = -1;
  for (const o of offer) { const s = PICK_SCORE[o.id] ?? 10; if (s > bestScore) { bestScore = s; best = o; } }
  return best.id;
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
let usedPlaybook = false;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null;
  const orders = [];
  const kind = now.works?.byKind ?? {};
  if (now.pendingOffer && now.pendingOffer.length) orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });

  const turrets = kind.turret ?? 0;
  if (!usedPlaybook && turrets >= 1) { orders.push({ verb: 'PLAYBOOK_USE', name: 'relay' }); usedPlaybook = true; }
  if (turrets < 1) orders.push({ verb: 'BUILD', what: 'turret', where: RELAY, when: { goldGte: 50 } });
  else if (turrets - 1 < GUNS.length) orders.push({ verb: 'BUILD', what: 'turret', where: GUNS[turrets - 1], when: { goldGte: 70 } });

  const pals = kind.palisade ?? 0;
  if (pals < SCREEN.length) {
    for (let i = pals; i < Math.min(SCREEN.length, pals + 4); i += 1) {
      orders.push({ verb: 'BUILD', what: 'palisade', where: SCREEN[i], when: { goldGte: 10 } });
    }
  }
  if ((kind.stockpile ?? 0) < 1) orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCKPILE, when: { goldGte: 60 } });

  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x))
    .sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  if (live.length) {
    const near = live.filter((s) => dist(s, live[0]) <= 25);
    const room = 30 - orders.length - 1;
    for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: near[i % near.length].id });
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 12, z: 18 } });
  }
  return orders;
}
