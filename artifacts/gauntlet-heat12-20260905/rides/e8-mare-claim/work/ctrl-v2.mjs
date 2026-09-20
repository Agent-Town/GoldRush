// e8-mare-claim controller v2 — heat 12, generation 39.
// v1 measured w19 / 584.1s and died with gold PINNED at the 200 cap for the last 107 seconds,
// because `tier` is 1-BASED on works.entries: my upgrade gate asked for 300 gold (tier index 1)
// when the real next-tier price is Balance.tiers.turret[tier].cost = 150. Zero tier upgrades
// fired and ~250 gold of income was banked into a full purse and lost.
// v2: correct tier arithmetic, strategic (turret-first) ladder, and a working refusal blacklist
// (v1 read rec.verb; the record actually nests the order under rec.order).

const HERO = { x: 0, z: 12 };

const BEACON_SLOTS = [
  [0, 6], [-3, 6], [3, 6], [-5, 6], [5, 6], [-1.5, 6], [1.5, 6],
  [0, 4], [-2, 4], [2, 4], [-6, 6], [6, 6], [-4, 5], [4, 5],
];
const TURRET_SLOTS = [
  [-6, 2], [6, 2], [-3, 1], [3, 1],
  [-6, -1], [6, -1], [0, 0], [-12, 4], [12, 4], [0, -3],
];

const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const TURRET_COSTS = [50, 70, 95, 125];
// Balance.tiers.turret = [{cost:0},{cost:150},{cost:300}]; works.entries[].tier is 1-based,
// so a tier-1 turret's next step costs TURRET_TIER_COST[1] = 150.
const TURRET_TIER_COST = [0, 150, 300];
const MAX_TURRET_TIER = 3;

// Strategic order: the turret's flat 57 dps beats a beacon's (10 + 0.75*wave) * 1.2 until late,
// so the expensive rung leads (gen-7). The emitter then truncates at the first price DECREASE
// (gen-9), which keeps a cheap rung from ever starving an expensive one.
const LADDER = [
  { kind: 'turret', n: 0 },
  { kind: 'sentry_beacon', n: 0 }, { kind: 'turret', n: 1 },
  { kind: 'sentry_beacon', n: 1 }, { kind: 'turret', n: 2 },
  { kind: 'sentry_beacon', n: 2 }, { kind: 'turret', n: 3 },
  { kind: 'sentry_beacon', n: 3 }, { kind: 'sentry_beacon', n: 4 },
  { kind: 'sentry_beacon', n: 5 },
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(id, hero, cfg) {
  const hurt = (hero.maxHp || 0) - (hero.hp || 0);
  switch (id) {
    case 'field_dressing': return hurt >= (cfg.healAt ?? 25) ? 200 : 8;
    case 'tinkers_plating': return 150;
    // income compounds into turret tiers, which is where this run's margin lives.
    case 'prospectors_luck': return 130;
    case 'pan_legend': return 125;
    case 'spring_heels': return 100;
    case 'heavy_spark': return 90;
    case 'double_tap_coil': return 88;
    case 'beacon_dynamo': return 87;
    case 'split_spark': return 86;
    case 'long_resonator': return 60;
    case 'powder_charge': return 45;
    case 'sharpen': return 45;
    case 'quick_fuse': return 42;
    case 'wide_ring': return 42;
    case 'assay_bonus': return 30;
    default: return 35;
  }
}

export function makeDecide(cfg = {}) {
  const blacklist = new Set();
  const attempts = new Map();

  return function decide(view) {
    const now = view.now;

    // Blank-line the secure boundary: keeps the last recorded entry strictly under the
    // flat 18000-tick envelope this secureWave-silent contract gets (F-HEAT11-1 cure).
    if (now.pendingSecure) return null;

    for (const rec of now.orders || []) {
      const o = rec.order || {};
      if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
        blacklist.add(`${o.what}:${o.where.x},${o.where.z}`);
      }
    }

    const orders = [];

    if (now.pendingOffer && now.pendingOffer.length) {
      let best = now.pendingOffer[0], bs = -1;
      for (const o of now.pendingOffer) {
        const s = scoreUpgrade(o.id, now.hero, cfg);
        if (s > bs) { bs = s; best = o; }
      }
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    if (cfg.blastFrom !== undefined) {
      const want = (now.threats?.alive ?? 0) >= cfg.blastFrom ? 'blast' : 'rig';
      if (now.weapon !== want) orders.push({ verb: 'SET_WEAPON', weapon: want });
    }
    if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

    // --- build ladder -------------------------------------------------------
    const byKind = now.works?.byKind || {};
    const entries = now.works?.entries || [];
    const takenPos = new Set(entries.map((e) => `${e.id}:${e.position?.x},${e.position?.z}`));
    const rungs = [];
    for (const rung of LADDER) {
      const built = rung.kind === 'turret' ? (byKind.turret || 0) : (byKind.sentry_beacon || 0);
      if (rung.n < built) continue;
      const costs = rung.kind === 'turret' ? TURRET_COSTS : BEACON_COSTS;
      const slots = rung.kind === 'turret' ? TURRET_SLOTS : BEACON_SLOTS;
      let where = null;
      for (const s of slots) {
        const key = `${rung.kind}:${s[0]},${s[1]}`;
        if (blacklist.has(key) || takenPos.has(key)) continue;
        if ((attempts.get(key) || 0) > 8) continue;
        if (rungs.some((r) => r.key === key)) continue;
        where = s; break;
      }
      if (!where) continue;
      rungs.push({
        kind: rung.kind, where,
        cost: costs[Math.min(rung.n, costs.length - 1)],
        key: `${rung.kind}:${where[0]},${where[1]}`,
      });
    }
    // longest non-decreasing-price prefix, capped.
    const emit = [];
    for (const r of rungs) {
      if (emit.length && r.cost < emit[emit.length - 1].cost) break;
      emit.push(r);
      if (emit.length >= (cfg.buildSlots ?? 3)) break;
    }
    for (const r of emit) {
      attempts.set(r.key, (attempts.get(r.key) || 0) + 1);
      orders.push({
        verb: 'BUILD', what: r.kind,
        where: { x: r.where[0], z: r.where[1] },
        when: { goldGte: r.cost },
      });
    }

    // --- the capped purse's only sink: turret tiers -------------------------
    // CONTEXT_ACTION does not travel and MOVE_TO snaps exactly onto its target, so the
    // pair works inside one array (drift is 0.093 wu/tick vs interactRadius 1.6).
    if (rungs.length === 0) {
      let target = null, lowest = 99;
      for (const e of entries) {
        if (e.id !== 'turret') continue;
        const tier = e.tier ?? 1;
        if (tier < MAX_TURRET_TIER && tier < lowest) { lowest = tier; target = e; }
      }
      if (target && now.gold >= TURRET_TIER_COST[lowest]) {
        orders.push({ verb: 'MOVE_TO', pos: { x: target.position.x, z: target.position.z } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: target.index } });
      }
    }

    // --- income -------------------------------------------------------------
    const prosp = now.prospector || HERO;
    const live = (now.seams || []).filter((s) => s.active && s.x !== null)
      .sort((a, b) => dist(a, prosp) - dist(b, prosp));
    const depth = cfg.harvestDepth ?? 6;
    const budget = 32 - orders.length;
    if (live.length) {
      const chain = [];
      for (let round = 0; round < 5 && chain.length < budget; round++) {
        const s = live[round % live.length];
        for (let k = 0; k < depth && chain.length < budget; k++) chain.push({ verb: 'HARVEST', seam: s.id });
      }
      orders.push(...chain);
    } else {
      orders.push({ verb: 'HOLD', pos: { x: 0, z: 9 } });
    }

    return orders.slice(0, 32);
  };
}

export const decide = makeDecide({});
