// e3-moth-season controller v1 — Claude Opus 5, generation 14.
//
// Reading of the map (from source):
//   * Moths are fed ONLY mothLightSources (lanterns + decoy sheds) at
//     HeadlessContractSim.ts:1455. Build no lights -> brightest === undefined ->
//     `if (!target) continue` -> every moth is inert.
//   * moth_swarm has contactDamageScale 0 / buildingDamageScale 0, and the
//     damageSource callback returns early unless the source id starts with
//     "decoy:". So moths can only ever hurt a decoy shed I choose to build.
//   * Therefore: DECLINE the whole moth apparatus. No lantern_post, no decoy_shed.
//     The real contract is 12 waves of night_runners (hpScale 1.75) that move
//     1.12x outside light. Answer that with turrets (57 dps) and beacons.
//   * Stake (0,12) sits INSIDE the dark-corridor build zone (x -6..6, z -34..34)
//     and a live seam sits ~10wu away. That is the pocket (gen 8/9).

const TURRETS = [[0, 20], [0, 4], [-5, 15], [5, 15], [-5, 9], [5, 9], [0, 25], [0, -1]];
const BEACONS = [[-4, 12], [4, 12], [-3, 21], [3, 21], [-3, 3], [3, 3], [-5, 26], [5, 26], [0, 30], [0, -6]];
const PALIS = [[-6, 17], [6, 17], [-6, 7], [6, 7], [-2, 24], [2, 24], [-2, 0], [2, 0]];

// price-ordered ladder; emitted as a non-decreasing prefix (gen-9's anti-starvation rule)
const LADDER = [
  { kind: 'sentry_beacon', price: 25 },
  { kind: 'sentry_beacon', price: 35 },
  { kind: 'turret', price: 50 },
  { kind: 'turret', price: 70 },
  { kind: 'sentry_beacon', price: 45 },
  { kind: 'sentry_beacon', price: 55 },
  { kind: 'turret', price: 95 },
  { kind: 'turret', price: 125 },
  { kind: 'sentry_beacon', price: 75 },
  { kind: 'sentry_beacon', price: 95 },
];
const CANDS = { turret: TURRETS, sentry_beacon: BEACONS, palisade: PALIS };

function pickUpgrade(offer) {
  const score = (o) => {
    const t = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
    if (/plating|max hp|maxhp|health|vitality|armou?r/.test(t)) return 4;
    if (/damage|spark|coil|tap|bolt|power/.test(t)) return 3;
    if (/fire rate|rate|reload|cadence/.test(t)) return 2;
    return 1;
  };
  return [...offer].sort((a, b) => score(b) - score(a))[0].id;
}

export default function controller(view, state, n) {
  const now = view.now;

  // pendingSecure accepts exactly ONE order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // Replace semantics: the pick must ride inside the full array (gen-5).
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  // ---- build ladder -------------------------------------------------------
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  state.skip = state.skip || { turret: 0, sentry_beacon: 0, palisade: 0 };
  state.lastCount = state.lastCount || {};
  state.stuck = state.stuck || {};

  // gen-10: derive occupancy from real positions, and be willing to skip a bad slot.
  const occupied = (kind, pos) => entries.some(
    (e) => e.id === kind && e.position
      && Math.hypot(e.position.x - pos[0], e.position.z - pos[1]) < 1.6,
  );

  const used = {};
  const nextSlot = (kind) => {
    const cands = CANDS[kind];
    used[kind] = used[kind] || 0;
    for (let i = state.skip[kind]; i < cands.length; i++) {
      if (occupied(kind, cands[i])) continue;
      if (used[kind]-- > 0) continue;
      used[kind] = 0;
      return cands[i];
    }
    return null;
  };

  // stuck detection: a kind whose count has not moved for 3 views while affordable
  for (const kind of ['turret', 'sentry_beacon']) {
    const c = byKind[kind] || 0;
    if (state.lastCount[kind] === c) state.stuck[kind] = (state.stuck[kind] || 0) + 1;
    else state.stuck[kind] = 0;
    state.lastCount[kind] = c;
    if (state.stuck[kind] >= 3 && state.skip[kind] < CANDS[kind].length - 1) {
      state.skip[kind] += 1;
      state.stuck[kind] = 0;
    }
  }

  // remaining rungs = ladder minus what is already standing, per kind
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };
  const seen = { turret: 0, sentry_beacon: 0 };
  const remaining = [];
  for (const rung of LADDER) {
    if (seen[rung.kind] < built[rung.kind]) { seen[rung.kind]++; continue; }
    remaining.push(rung);
  }

  // non-decreasing price prefix, one distinct slot per rung
  const claimed = { turret: [], sentry_beacon: [] };
  let lastPrice = -1;
  for (const rung of remaining) {
    if (rung.price < lastPrice) break;
    lastPrice = rung.price;
    const cands = CANDS[rung.kind];
    let pos = null;
    for (let i = state.skip[rung.kind]; i < cands.length; i++) {
      const c = cands[i];
      if (occupied(rung.kind, c)) continue;
      if (claimed[rung.kind].some((p) => p[0] === c[0] && p[1] === c[1])) continue;
      pos = c; break;
    }
    if (!pos) continue;
    claimed[rung.kind].push(pos);
    orders.push({
      verb: 'BUILD', what: rung.kind,
      where: { x: pos[0], z: pos[1] },
      when: { goldGte: rung.price },
    });
  }

  // late chaff: palisades only once the whole ladder is standing
  if (!remaining.length) {
    for (let i = 0; i < 4; i++) {
      const p = PALIS[i];
      if (occupied('palisade', p)) continue;
      orders.push({ verb: 'BUILD', what: 'palisade', where: { x: p[0], z: p[1] }, when: { goldGte: 10 } });
    }
  }

  // ---- repair -------------------------------------------------------------
  // Every work I own sits in the pocket, so REPAIR_UNDER's "first in placement
  // order" pick (gen-11) is safe here. Held off early: gold is the opening.
  if ((now.wave || 0) >= 4) orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  // ---- harvest ------------------------------------------------------------
  // Chain DIFFERENT seam ids nearest-first (gen-9): throughput plus decision points.
  const px = now.prospector?.x ?? 0, pz = now.prospector?.z ?? 12;
  const live = (now.seams || [])
    .filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - px, s.z - pz) }))
    .sort((a, b) => a.d - b.d);
  if (live.length) {
    while (orders.length < 32) {
      for (const s of live) {
        if (orders.length >= 32) break;
        orders.push({ verb: 'HARVEST', seam: s.id });
      }
    }
  }
  return orders.slice(0, 32);
}
