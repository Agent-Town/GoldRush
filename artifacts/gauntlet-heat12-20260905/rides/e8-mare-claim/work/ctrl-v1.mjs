// e8-mare-claim controller v1 — heat 12, generation 39.
// Facts measured/verified this ride:
//   claim/hero welded at (0,12); nearest build ground is the dome-cluster centre pad z -6..6.
//   beacon radius 8, turret range 16 -> beacons must sit within 8 wu of (0,12) to touch the
//   scrum that actually damages the hero; only the z=6 line with |x| <= 5.29 qualifies.
//   roster (Balance.e8Roster) has no wrecker and no thief -> nothing can be wrecked or stolen,
//   so REPAIR_UNDER and palisades are dead weight and every gold is offence.
//   air: regolith required = 1, so ONE pan on suit air latches the secure gate.
//   no twist.secureWave -> wave 20 / 600 s / flat 18000-tick envelope -> blank-line the secure.

const HERO = { x: 0, z: 12 };

// beacons: z=6 line, all within radius 8 of the hero; then relaxed fallbacks.
const BEACON_SLOTS = [
  [0, 6], [-3, 6], [3, 6], [-5, 6], [5, 6], [-1, 6], [1, 6],
  [0, 4], [-2, 4], [2, 4], [-6, 6], [6, 6], [-4, 5], [4, 5],
];
// turrets: range 16 reaches the hero from anywhere on the pad; keep them clear of the beacon line.
const TURRET_SLOTS = [
  [-6, 2], [6, 2], [-3, 1], [3, 1],
  [-6, -1], [6, -1], [0, 0], [-12, 4], [12, 4], [0, -3],
];

const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const TURRET_COSTS = [50, 70, 95, 125];
const TIER_COSTS = [150, 300];

// strategic priority; the emitter re-sorts the remainder ascending by price so a cheap
// rung can never starve an expensive one (gen-9 rule).
const LADDER = [
  { kind: 'turret', n: 0 }, { kind: 'sentry_beacon', n: 0 }, { kind: 'sentry_beacon', n: 1 },
  { kind: 'turret', n: 1 }, { kind: 'sentry_beacon', n: 2 }, { kind: 'sentry_beacon', n: 3 },
  { kind: 'turret', n: 2 }, { kind: 'sentry_beacon', n: 4 }, { kind: 'turret', n: 3 },
  { kind: 'sentry_beacon', n: 5 },
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(id, hpFrac, wave, cfg) {
  const early = wave < 9;
  switch (id) {
    case 'field_dressing': return hpFrac < (cfg.healBelow ?? 0.8) ? 200 : 8;
    case 'tinkers_plating': return 150;
    case 'heavy_spark': return 90;
    case 'double_tap_coil': return 88;
    case 'split_spark': return 86;
    case 'beacon_dynamo': return 84;
    case 'long_resonator': return 60;
    case 'powder_charge': return 55;
    case 'sharpen': return 50;
    case 'prospectors_luck': return early ? 70 : 25;
    case 'pan_legend': return early ? 62 : 20;
    case 'spring_heels': return early ? 58 : 18;
    case 'assay_bonus': return early ? 40 : 12;
    default: return 30;
  }
}

export function makeDecide(cfg = {}) {
  const blacklist = new Set();
  const attempts = new Map();

  return function decide(view, state, viewNo) {
    const now = view.now;

    // The secure boundary: answer with a BLANK LINE so the last recorded entry stays
    // strictly below the 18000-tick envelope (F-HEAT11-1 cure, proven gens 27/30/31/34/35/36).
    if (now.pendingSecure) return null;

    // Learn refused coordinates from the view's own order records (gen-35).
    for (const rec of now.orders || []) {
      if (rec.status === 'failed' && rec.verb === 'BUILD' && rec.where) {
        const d = String(rec.reason || rec.detail || '');
        if (/collision|out_of_zone|UNREACHABLE|out_of_reach|terrain/i.test(d)) {
          blacklist.add(`${rec.what}:${rec.where.x},${rec.where.z}`);
        }
      }
    }

    const orders = [];
    const hpFrac = now.hero.maxHp ? now.hero.hp / now.hero.maxHp : 1;

    // 1. draft first — replace semantics mean it must own the array's head.
    if (now.pendingOffer && now.pendingOffer.length) {
      let best = now.pendingOffer[0], bs = -1;
      for (const o of now.pendingOffer) {
        const s = scoreUpgrade(o.id, hpFrac, now.wave, cfg);
        if (s > bs) { bs = s; best = o; }
      }
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 2. weapon mode (only when the config asks for a switch).
    if (cfg.blastFrom !== undefined) {
      const want = (now.threats?.alive ?? 0) >= cfg.blastFrom ? 'blast' : 'rig';
      if (now.weapon !== want) orders.push({ verb: 'SET_WEAPON', weapon: want });
    }

    // 3. free supplementary damage into the scrum standing on the hero.
    if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

    // 4. build ladder — emit the remaining rungs sorted ascending by price, own-price gated.
    const byKind = now.works?.byKind || {};
    const builtB = byKind.sentry_beacon || 0;
    const builtT = byKind.turret || 0;
    const remaining = [];
    for (const rung of LADDER) {
      const built = rung.kind === 'turret' ? builtT : builtB;
      if (rung.n < built) continue;
      const costs = rung.kind === 'turret' ? TURRET_COSTS : BEACON_COSTS;
      const slots = rung.kind === 'turret' ? TURRET_SLOTS : BEACON_SLOTS;
      // pick the first non-blacklisted, non-occupied slot for this kind.
      const taken = new Set((now.works?.entries || [])
        .filter((e) => e.id === rung.kind)
        .map((e) => `${Math.round(e.position?.x ?? e.x)},${Math.round(e.position?.z ?? e.z)}`));
      let where = null;
      for (const s of slots) {
        const key = `${rung.kind}:${s[0]},${s[1]}`;
        if (blacklist.has(key)) continue;
        if (taken.has(`${Math.round(s[0])},${Math.round(s[1])}`)) continue;
        if ((attempts.get(key) || 0) > 6) continue;
        where = s; break;
      }
      if (!where) continue;
      remaining.push({ kind: rung.kind, cost: costs[Math.min(rung.n, costs.length - 1)], where });
    }
    // one candidate per rung index; dedupe positions so two rungs never fight for one slot.
    const used = new Set();
    const emit = [];
    for (const r of remaining) {
      const key = `${r.kind}:${r.where[0]},${r.where[1]}`;
      if (used.has(key)) continue;
      used.add(key);
      emit.push(r);
    }
    emit.sort((a, b) => a.cost - b.cost);
    for (const r of emit.slice(0, cfg.buildSlots ?? 5)) {
      attempts.set(`${r.kind}:${r.where[0]},${r.where[1]}`, (attempts.get(`${r.kind}:${r.where[0]},${r.where[1]}`) || 0) + 1);
      orders.push({
        verb: 'BUILD', what: r.kind,
        where: { x: r.where[0], z: r.where[1] },
        when: { goldGte: r.cost },
      });
    }

    // 5. once the ladder is complete, the capped purse's only sink is the tier upgrade.
    //    CONTEXT_ACTION does not travel, so pair it with a MOVE_TO (which snaps exactly).
    const ladderDone = emit.length === 0;
    if (ladderDone) {
      const entries = (now.works?.entries || []).map((e, i) => ({ ...e, _i: i }));
      const turrets = entries.filter((e) => e.id === 'turret');
      // upgrade the lowest-tier turret first.
      let target = null, targetTier = 99;
      for (const t of turrets) {
        const tier = t.tier ?? 0;
        if (tier < 2 && tier < targetTier) { targetTier = tier; target = t; }
      }
      if (target && now.gold >= TIER_COSTS[targetTier]) {
        const px = target.position?.x ?? target.x;
        const pz = target.position?.z ?? target.z;
        orders.push({ verb: 'MOVE_TO', pos: { x: px, z: pz } });
        orders.push({
          verb: 'CONTEXT_ACTION', action: 'upgrade',
          target: { id: 'turret', index: target.index ?? target._i },
        });
      }
    }

    // 6. income. Seams are 26-35 wu out and only two run live, so STACK on one seam
    //    (gen-15 rule for a far economy); when it depletes the block fails fast and the
    //    next block shuttles the Prospector to the other one automatically.
    const prosp = now.prospector || HERO;
    const live = (now.seams || []).filter((s) => s.active && s.x !== null)
      .sort((a, b) => dist(a, prosp) - dist(b, prosp));
    const depth = cfg.harvestDepth ?? 6;
    const budget = 32 - orders.length;
    if (live.length) {
      const chain = [];
      for (let round = 0; round < 4 && chain.length < budget; round++) {
        const s = live[round % live.length];
        for (let k = 0; k < depth && chain.length < budget; k++) {
          chain.push({ verb: 'HARVEST', seam: s.id });
        }
      }
      orders.push(...chain);
    } else {
      orders.push({ verb: 'HOLD', pos: { x: 0, z: 9 } });
    }

    return orders.slice(0, 32);
  };
}

export const decide = makeDecide({});
