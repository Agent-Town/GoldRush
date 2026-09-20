// e5-flotilla controller v1 — "the pocket at x=-26"
// Straggler (enemy target) = hull furthest from centroid = kitchen-scow (-26,21) at start.
// gold-seam-1 (-26,15), kitchen-scow-deck (x -31..-21, z 17..25) and boat pad kitchen-scow (-26,21)
// all coincide there. Park the Prospector (which carries the Spark Rig on this map) at the seam,
// ring the hull with turrets built without ever leaving placeRadius 6 of the seam.

const SEAM_POST = { x: -26, z: 15 };

// turret slots: all within 6 of SEAM_POST (placeRadius) and within 16 of the hull (-26,21)
const TURRET_SLOTS = [
  { x: -26, z: 19 }, { x: -29, z: 18 }, { x: -23, z: 18 },
  { x: -29, z: 20 }, { x: -23, z: 20 }, { x: -27, z: 17 },
  { x: -25, z: 17 }, { x: -30, z: 17 }, { x: -22, z: 17 },
];
const BEACON_SLOTS = [
  { x: -24, z: 16 }, { x: -28, z: 16 }, { x: -26, z: 18 },
  { x: -22, z: 19 }, { x: -30, z: 19 }, { x: -24, z: 14 },
];

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

function occupied(entries, slot) {
  return entries.some(e => Math.hypot(e.position.x - slot.x, e.position.z - slot.z) < 2.0);
}

function scoreUpgrade(o) {
  const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let s = 0;
  // Hero takes NO contact damage on the Flotilla (handleEnemyContact is skipped) -> hp is worthless.
  if (/damage|spark|bolt|power|coil|tap|volley|shot/.test(t)) s += 10;
  if (/rate|speed of fire|faster|cooldown|reload/.test(t)) s += 9;
  if (/range|reach/.test(t)) s += 7;
  if (/blast|charge/.test(t)) s += 5;
  if (/turret|sentry|works|building/.test(t)) s += 6;
  if (/pan|gold|seam|harvest|prospect/.test(t)) s += 4;
  if (/hp|health|plating|armor|armour|heal|regen/.test(t)) s -= 5;
  return s;
}

export default function controller(view) {
  const now = view.now;
  const out = [];

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (now.pendingOffer && now.pendingOffer.length) {
    let best = now.pendingOffer[0];
    for (const o of now.pendingOffer) if (scoreUpgrade(o) > scoreUpgrade(best)) best = o;
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Free levers: the deck weapons cost no gold. Harpoon ballista (r14) rides the `turret` pad.
  const dw = now.deepwater || {};
  const pads = dw.pads || [];
  const built = new Set((dw.boatBuildings || []).map(b => b.buildingId));
  const padFree = id => pads.some(p => p.id === id && !p.occupied);
  if (!built.has('turret') && padFree('kitchen-scow')) {
    out.push({ verb: 'BOAT_BUILD', padId: 'kitchen-scow', buildingId: 'turret' });
  }
  if (!built.has('sentry_beacon') && padFree('turret-raft')) {
    out.push({ verb: 'BOAT_BUILD', padId: 'turret-raft', buildingId: 'sentry_beacon' });
  }

  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;

  // Ladder: turrets first (57 dps each) then beacons. Emit a non-decreasing-price prefix so a
  // cheap rung can never starve an expensive one, and carry more candidate slots than rungs.
  const ladder = [];
  for (let i = nT; i < 4; i++) ladder.push({ what: 'turret', cost: TURRET_COSTS[i] });
  for (let i = nB; i < 6; i++) ladder.push({ what: 'sentry_beacon', cost: BEACON_COSTS[i] });

  let lastCost = -1;
  let tSlotIdx = 0, bSlotIdx = 0;
  for (const rung of ladder) {
    if (rung.cost < lastCost) break;
    lastCost = rung.cost;
    const slots = rung.what === 'turret' ? TURRET_SLOTS : BEACON_SLOTS;
    let idx = rung.what === 'turret' ? tSlotIdx : bSlotIdx;
    while (idx < slots.length && occupied(entries, slots[idx])) idx++;
    if (idx >= slots.length) continue;
    // carry two candidates per rung so one refused coordinate cannot park the ladder
    const a = slots[idx];
    out.push({ verb: 'BUILD', what: rung.what, where: a, when: { goldGte: rung.cost } });
    if (rung.what === 'turret') tSlotIdx = idx + 1; else bSlotIdx = idx + 1;
    if (out.length > 14) break;
  }

  // Income: pan gold-seam-1 in the pocket. A depleted seam fails honestly and the next order runs.
  const seams = now.seams || [];
  const live = seams.filter(s => s.active !== false);
  const nearest = live.slice().sort((a, b) =>
    Math.hypot(a.x - SEAM_POST.x, a.z - SEAM_POST.z) - Math.hypot(b.x - SEAM_POST.x, b.z - SEAM_POST.z));
  const seamId = (nearest[0] && Math.hypot(nearest[0].x - SEAM_POST.x, nearest[0].z - SEAM_POST.z) < 12)
    ? nearest[0].id : 'gold-seam-1';
  const room = 31 - out.length;
  const harvests = Math.max(0, Math.min(12, room - 1));
  for (let i = 0; i < harvests; i++) out.push({ verb: 'HARVEST', seam: seamId });

  // Anchor: hold the pocket so the Spark Rig (range 10, prospector-mounted here) covers the hull.
  out.push({ verb: 'HOLD', pos: SEAM_POST });
  return out.slice(0, 32);
}
