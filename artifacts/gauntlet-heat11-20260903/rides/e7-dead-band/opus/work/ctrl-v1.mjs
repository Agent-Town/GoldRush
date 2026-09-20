// The Dead Band controller v1.
// Map: claim (0,12), hero welded there. Build zone `dead-band-yard` x -30..30, z -42..12.
// Enemies: data_rustler only — thief:true, so NOT a wrecker: works are never swung at.
// Ladder: 4 turrets (50/70/95/125) then 6 beacons (25/35/45/55/75/95), emitted as a
// non-decreasing price prefix so no cheap rung can starve an expensive one.

const TURRETS = [
  { x: -8, z: 8 }, { x: 8, z: 8 }, { x: -8, z: 1 }, { x: 8, z: 1 },
  { x: 0, z: 4 }, { x: -14, z: 6 }, { x: 14, z: 6 }, { x: 0, z: -3 },
  { x: -14, z: -1 }, { x: 14, z: -1 },
];
const BEACONS = [
  { x: -4, z: 10 }, { x: 4, z: 10 }, { x: -12, z: 11 }, { x: 12, z: 11 },
  { x: 0, z: 8 }, { x: -4, z: 3 }, { x: 4, z: 3 }, { x: -18, z: 8 },
  { x: 18, z: 8 }, { x: 0, z: 12 }, { x: -20, z: 2 }, { x: 20, z: 2 },
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

const state = { stall: {}, lastCounts: {} };

function scoreOffer(o) {
  const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let s = 0;
  if (/plating|health|max hp|maxhp|vital|hearty|tough|armor|armour/.test(t)) s += 100;
  if (/heal|regen|mend/.test(t)) s += 40;
  if (/damage|spark|coil|bolt|power|strike/.test(t)) s += 30;
  if (/fire rate|rate|cadence|tap|rapid|speed/.test(t)) s += 25;
  if (/range/.test(t)) s += 15;
  if (/gold|pan|seam|harvest/.test(t)) s += 10;
  return s;
}

// Occupied test against live works positions, so a rung skips a slot already taken.
function occupied(entries, p) {
  return entries.some((e) => {
    const q = e.position || e.pos || e;
    if (!q || typeof q.x !== 'number') return false;
    return Math.hypot(q.x - p.x, (q.z ?? q.y) - p.z) < 3.0;
  });
}

function nextSlot(kind, cands, entries, count) {
  const skip = state.stall[kind] || 0;
  let seen = 0;
  for (const c of cands) {
    if (occupied(entries, c)) continue;
    if (seen < skip) { seen++; continue; }
    return c;
  }
  return cands[cands.length - 1];
}

export default function controller(view) {
  const now = view.now;

  // pendingSecure accepts exactly one order and refuses anything else.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreOffer(b) - scoreOffer(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const works = now.works || {};
  const byKind = works.byKind || {};
  const entries = works.entries || [];
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;

  // Stall detection: if a rung's count has not moved while gold covered it, rotate candidates.
  const key = nT < TURRET_COSTS.length ? 'turret' : 'sentry_beacon';
  const have = key === 'turret' ? nT : nB;
  const price = key === 'turret' ? TURRET_COSTS[nT] : BEACON_COSTS[nB];
  if (state.lastCounts[key] === have && now.gold >= (price ?? 1e9)) {
    state.stall[key] = (state.stall[key] || 0) + 1;
  }
  state.lastCounts[key] = have;

  // Non-decreasing price prefix: turret ladder first, beacons only once turrets are done.
  const built = [];
  if (nT < TURRET_COSTS.length) {
    let idx = 0;
    for (let i = nT; i < TURRET_COSTS.length; i++) {
      const slot = nextSlot('turret', TURRETS.slice(idx), entries.concat(built), i);
      idx = TURRETS.indexOf(slot) + 1;
      built.push({ position: slot });
      orders.push({ verb: 'BUILD', what: 'turret', where: slot, when: { goldGte: TURRET_COSTS[i] } });
    }
  } else if (nB < BEACON_COSTS.length) {
    let idx = 0;
    for (let i = nB; i < BEACON_COSTS.length; i++) {
      const slot = nextSlot('sentry_beacon', BEACONS.slice(idx), entries.concat(built), i);
      idx = BEACONS.indexOf(slot) + 1;
      built.push({ position: slot });
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: slot, when: { goldGte: BEACON_COSTS[i] } });
    }
  }

  // Harvest tail: nearest active seams from where the Prospector stands, stacked per seam.
  const p = now.prospector || { x: 0, z: 12 };
  const seams = (now.seams || []).filter((s) => s.active && typeof s.x === 'number');
  seams.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
  const room = 32 - orders.length;
  const plan = [];
  if (seams.length) {
    const per = 7;
    for (let round = 0; plan.length < room; round++) {
      const s = seams[Math.min(round, seams.length - 1)];
      for (let k = 0; k < per && plan.length < room; k++) plan.push({ verb: 'HARVEST', seam: s.id });
      if (round >= seams.length - 1 && seams.length > 1) {
        // rotate back through the near seams rather than dying on one depleted id
        for (let k = 0; k < per && plan.length < room; k++) plan.push({ verb: 'HARVEST', seam: seams[0].id });
      }
      if (round > 6) break;
    }
  }
  orders.push(...plan);
  return orders.slice(0, 32);
}
