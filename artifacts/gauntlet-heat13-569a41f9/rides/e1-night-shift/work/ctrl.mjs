// Gen-76 controller for e1-night-shift, seed 01, trail.
// Post-ADR-005 grammar: MOVE_HERO is the only positioning verb; MOVE_TO/HOLD/FALLBACK_IF are gone.
// Contract: secureWave 25 => 750 s. Claim (0,12). Hero starts on the claim and wants to stay.
// 7 pre-placed WRECKED lantern_posts fill 7 of lantern_post's 8 slots (gen-56's fatal ladder bug:
// lantern rungs that can never retire keep ladderDone false and withhold the tier-2 sink forever).

const HOME = { x: 0, z: 12 };
const CAP = 200;
const SECURE_T = 750;

// --- fort geometry -----------------------------------------------------------------
// turret range 16, sentry_beacon radius 8 (must CONTAIN the hero at (0,12)).
// Enemies ring-spawn at radius 26 around the claim from N/S/E/W; the south stream must
// use the single ford at x in [-3,3], so a turret low on z owns that funnel.
const TURRET_SPOTS = [
  { x: 0, z: 6 }, { x: -6, z: 12 }, { x: 6, z: 12 }, { x: 0, z: 19 },
  { x: -5, z: 7 }, { x: 5, z: 7 }, { x: -5, z: 17 }, { x: 5, z: 17 },
  { x: 0, z: 4 }, { x: -9, z: 10 }, { x: 9, z: 10 }, { x: 0, z: 21 },
];
const BEACON_SPOTS = [
  { x: -3, z: 9 }, { x: 3, z: 9 }, { x: -3, z: 15 }, { x: 3, z: 15 },
  { x: -7, z: 15 }, { x: 7, z: 15 }, { x: -7, z: 9 }, { x: 7, z: 9 },
  { x: 0, z: 9.5 }, { x: -4.5, z: 12 }, { x: 4.5, z: 12 }, { x: 0, z: 18 },
  { x: -8, z: 12 }, { x: 8, z: 12 }, { x: -2, z: 18.5 }, { x: 2, z: 18.5 },
];
const PALISADES = [];
for (const r of [10, 13]) {
  const n = r === 10 ? 16 : 20;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    PALISADES.push({ x: +(HOME.x + r * Math.cos(a)).toFixed(2), z: +(HOME.z + r * Math.sin(a)).toFixed(2) });
  }
}

// price curves straight off the view's own buildables block, indexed past what stands.
function costOf(view, id, count) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
  if (!b) return Infinity;
  const c = b.costs;
  return count < c.length ? c[count] : c[c.length - 1];
}
function maxOf(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
  // the field is `maxCount`. Reading `b.max` yields undefined, `n < undefined` is false,
  // and the whole ladder silently never emits a single BUILD (measured: tune-1, w5, zero works).
  if (!b) return 0;
  return b.maxCount ?? b.max ?? 0;
}

const UPGRADE_RANK = [
  [/plating|armor|hearty|vitality|bulwark/i, 100],
  [/dressing|mend|heal|regen|salve|poultice/i, 95],
  [/spark|coil|tap|damage|bolt|volley|power/i, 60],
  [/rate|reload|quick|swift/i, 55],
  [/range|reach/i, 40],
  [/luck|pan|prospector|seam|gold/i, 20],
  [/heels|speed|stride/i, 10],
];
function scoreUpgrade(u) {
  const s = `${u.id} ${u.name} ${u.effectText || ''}`;
  for (const [re, v] of UPGRADE_RANK) if (re.test(s)) return v;
  return 30;
}

export function makeController(opts = {}) {
  const cfg = {
    palisades: true,
    tierSink: true,
    repair: true,
    submitFloor: 4.0,
    bankGate: true,
    ...opts,
  };
  const banned = new Set();          // GROUND refusals only
  const tries = new Map();           // patience budget per coordinate
  let lastSig = null;
  let lastSubmit = -99;
  const log = [];

  return function controller(view) {
    const now = view.now;
    const t = now.timers?.runSeconds ?? 0;

    // secure boundary: blank line -> the configured `bank` default fires, no entry recorded.
    if (now.pendingSecure) { lastSubmit = t; return null; }

    // --- harvest GROUND refusals from the accepted-order records --------------------
    for (const rec of now.orders || []) {
      const o = rec.order || rec;
      if (o.verb !== 'BUILD' || rec.status !== 'failed') continue;
      const reason = `${rec.reason || ''} ${rec.detail || ''}`;
      const key = `${o.what}@${o.where.x},${o.where.z}`;
      if (/insufficient_gold/i.test(reason)) continue;            // ECONOMY: retry, poison nothing
      const n = (tries.get(key) || 0) + 1;
      tries.set(key, n);
      if (n >= 2) banned.add(key);                                 // GROUND: poison the coordinate
    }

    const entries = now.works?.entries || [];
    const standing = entries.filter((e) => !e.wrecked);
    const countOf = (id) => standing.filter((e) => e.id === id).length;
    // lantern_post's cap is consumed by the seven pre-placed wrecks; count ALL of them.
    const allOf = (id) => entries.filter((e) => e.id === id).length;
    const occupied = new Set(entries.map((e) => `${e.position.x.toFixed(2)},${e.position.z.toFixed(2)}`));

    const nT = countOf('turret'), nB = countOf('sentry_beacon'), nP = countOf('palisade');
    const gold = now.gold ?? 0;
    const rate = t > 30 ? Math.max(0.6, (now.score?.goldPanned ?? 0) / t) : 1.6;
    // Bank gate: gold is the only free ranking axis at a fixed-wave secure, so late spending is
    // banked instead. BUT securing outranks gold absolutely and a dead run banks nothing - tune-2
    // died at t=704 of 750 with this gate refusing 10-gold palisades through the whole death
    // window. Survival buys its way past it whenever the hero is actually taking damage.
    const hpFrac = (now.hero?.hp ?? 1) / (now.hero?.maxHp ?? 1);
    const canSpend = (C) => !cfg.bankGate || hpFrac < 0.92 ||
      (gold - C) + rate * (SECURE_T - t) >= CAP + 5;

    const orders = [];

    // 1. the draft owns the tick first (replace semantics wipe a lone PICK_UPGRADE otherwise)
    if (now.pendingOffer && now.pendingOffer.length) {
      const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 2. free supplementary damage; BLAST_AT returns {} either way so it never eats the tick
    if ((now.blastReadyInMs ?? 1) === 0) {
      orders.push({ verb: 'BLAST_AT', pos: { x: HOME.x, z: HOME.z - 4 } });
    }

    // 3. a hero outside its own beacon ring is the run. Correct high, above every travelling verb.
    const hx = now.hero?.x ?? HOME.x, hz = now.hero?.z ?? HOME.z;
    const drift = Math.hypot(hx - HOME.x, hz - HOME.z);
    let heroBusy = false;
    if (drift > 1.2) { orders.push({ verb: 'MOVE_HERO', pos: HOME }); heroBusy = true; }

    // 4. the ladder, in strategy order, one affordable rung at a time.
    const tCost = costOf(view, 'turret', nT), bCost = costOf(view, 'sentry_beacon', nB);
    const wantT = nT < maxOf(view, 'turret'), wantB = nB < maxOf(view, 'sentry_beacon');
    // Turrets are 57 dps at range 16 against a beacon's ~13-30 at radius 8, so the expensive
    // rung leads; the beacons follow because they are the only LIGHT on a map whose wreckers
    // move 1.18x outside it. Order the rungs, then fall through if the leading one cannot place.
    const ladder = [];
    if (wantT && gold >= tCost && canSpend(tCost)) ladder.push(['turret', tCost, TURRET_SPOTS]);
    if (wantB && gold >= bCost && canSpend(bCost) && (nT >= 2 || !wantT || gold >= tCost + bCost))
      ladder.push(['sentry_beacon', bCost, BEACON_SPOTS]);

    let built = 0;
    for (const [id, cost, spots] of ladder) {
      let placedForRung = 0;
      for (const s of spots) {
        const key = `${id}@${s.x},${s.z}`;
        if (banned.has(key)) continue;
        if (occupied.has(`${s.x.toFixed(2)},${s.z.toFixed(2)}`)) continue;
        orders.push({ verb: 'BUILD', what: id, where: s, when: { goldGte: cost } });
        built++;
        if (++placedForRung >= 2) break;   // one fallback coordinate, no more
      }
      if (built >= 2) break;               // a second rung only when the first could not place
    }

    const ladderDone = !wantT && !wantB;
    const nextRungCost = wantT ? tCost : (wantB ? bCost : 0);

    // 5. the capped-purse sink: turret tier 2. CONTEXT_ACTION does not travel and reaches 1.6,
    //    so it needs MOVE_HERO in front of it (offset a fixed 0.7 toward the claim, never a
    //    fraction of a varying distance - gen 65 lost a ride to a 1.71 wu park).
    if (cfg.tierSink && ladderDone && !heroBusy) {
      const low = standing.filter((e) => e.id === 'turret' && (e.tier ?? 1) < 2)
        .sort((a, b) => Math.hypot(a.position.x - hx, a.position.z - hz) - Math.hypot(b.position.x - hx, b.position.z - hz))[0];
      const tierCost = 150;
      if (low && gold >= tierCost && canSpend(tierCost)) {
        const p = low.position;
        const d = Math.hypot(HOME.x - p.x, HOME.z - p.z) || 1;
        const park = { x: +(p.x + (HOME.x - p.x) / d * 0.7).toFixed(2), z: +(p.z + (HOME.z - p.z) / d * 0.7).toFixed(2) };
        orders.push({ verb: 'MOVE_HERO', pos: park });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: low.index } });
        orders.push({ verb: 'MOVE_HERO', pos: HOME });
      }
    }

    // 6. mending. REPAIR_UNDER is now bounded to the Spark Rig's radius around the Prospector
    //    (ADR-005 stage 2), which drifts to the hero - so it is a LOCAL sweep and cheap in feet.
    //    It also relights the pre-placed lantern at (0,16), 4 wu out, for 8 gold.
    //    Spend only SURPLUS above the next unbought rung, so relighting seven cold lanterns at
    //    8 gold apiece can never delay the first turret.
    if (cfg.repair && gold >= nextRungCost + 25) orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

    // 7. overflow: timber. Chaff that blocks routes and eats hits, and keeps the purse moving
    //    (a full purse REFUSES the credit, so a pinned bank switches panning off entirely).
    if (cfg.palisades && ladderDone) {
      const pCost = costOf(view, 'palisade', nP);
      const spare = gold - (standing.some((e) => e.id === 'turret' && (e.tier ?? 1) < 2) ? 150 : 0);
      if (nP < maxOf(view, 'palisade') && spare >= pCost && canSpend(pCost)) {
        let added = 0;
        for (const s of PALISADES) {
          const key = `palisade@${s.x},${s.z}`;
          if (banned.has(key)) continue;
          if (occupied.has(`${s.x.toFixed(2)},${s.z.toFixed(2)}`)) continue;
          orders.push({ verb: 'BUILD', what: 'palisade', where: s, when: { goldGte: pCost } });
          if (++added >= 4) break;
        }
      }
    }

    // 8. the tail: drain ONE seam in a block before walking. Inactive seams publish
    //    x/z/anchorIndex as null and one non-finite number refuses the WHOLE array silently.
    const live = (now.seams || []).filter(
      (s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z),
    );
    if (live.length) {
      live.sort((a, b) => Math.hypot(a.x - hx, a.z - hz) - Math.hypot(b.x - hx, b.z - hz));
      const room = 31 - orders.length;
      const block = Math.max(0, Math.min(room, 24));
      // A seam holds 30 gold (six 1.5 s pans) then respawns for 20 s, and a HARVEST on a
      // depleted seam FAILS PERMANENTLY for the life of the array. Alternate blocks of six so
      // the far seam carries the tail while the near one refills, instead of one 62/38 split
      // whose whole near-half dies the moment that seam empties.
      const near = live[0], far = live[1] || live[0];
      for (let i = 0; i < block; i++) {
        orders.push({ verb: 'HARVEST', seam: Math.floor(i / 6) % 2 === 0 ? near.id : far.id });
      }
    }

    // never send [] - that wipes the order set. A MOVE_HERO onto the body's own ground
    // completes on the first tick and falls through, so it is a free terminal anchor.
    if (!orders.length) orders.push({ verb: 'MOVE_HERO', pos: HOME });

    // reel budget: answer only on a real change of plan, or on an adaptive floor.
    const sig = JSON.stringify(orders.map((o) => [o.verb, o.what || o.action || o.seam || o.id, o.where || o.pos]));
    const changed = sig !== lastSig;
    if (!changed && t - lastSubmit < cfg.submitFloor) return null;
    lastSig = sig; lastSubmit = t;
    log.push({ t: +t.toFixed(1), w: now.wave, g: gold, nT, nB, nP, n: orders.length });
    return orders.slice(0, 32);
  };
}
