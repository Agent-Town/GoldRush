// e1-dry-gulch controller, heat 14 / era 6.
// Ranking: secured -> waves(20, pinned) -> GOLD -> time(600, pinned).
// So gold is the only free axis. Cap = 200 + sum(round(150*capMult) per standing stockpile).
// Plan: cheap-but-sufficient fort, both cap-raisers early, sluices as an income engine,
// then a measured-rate bank gate that stops spending in time to refill the purse to the cap.

const CLAIM = { x: 0, z: 12 };
const SECURE_T = 600;
const CAP_MULT = [1, 1.6, 2.4];      // Balance.tiers.stockpile capMult by tier index (tier is 1-based)
const STOCK_TIER_COST = [0, 110, 260];

const ring = (cx, cz, r, degs) => degs.map(d => ({
  x: +(cx + r * Math.cos(d * Math.PI / 180)).toFixed(2),
  z: +(cz + r * Math.sin(d * Math.PI / 180)).toFixed(2),
}));

const BEACON_SPOTS = [
  ...ring(CLAIM.x, CLAIM.z, 4.5, [0, 90, 180, 270]),
  ...ring(CLAIM.x, CLAIM.z, 4.5, [45, 135, 225, 315]),
  ...ring(CLAIM.x, CLAIM.z, 6.5, [22, 112, 202, 292]),
];
const TURRET_SPOTS = [
  ...ring(CLAIM.x, CLAIM.z, 9, [0, 90, 180, 270]),
  ...ring(CLAIM.x, CLAIM.z, 11.5, [45, 135, 225, 315]),
  ...ring(CLAIM.x, CLAIM.z, 13, [20, 160, 200, 340]),
];
const STOCK_SPOTS = [
  ...ring(CLAIM.x, CLAIM.z, 7, [60, 120]),
  ...ring(CLAIM.x, CLAIM.z, 7, [240, 300]),
  ...ring(CLAIM.x, CLAIM.z, 5.6, [70, 110, 250, 290]),
];
// spring pond (-18,-18) r1.4; sluice needs 1.4 < hypot <= 3.4 AND bank+buildable ground.
const SLUICE_SPOTS = [
  ...ring(-18, -18, 2.7, [0, 120, 240]),
  ...ring(-18, -18, 3.2, [60, 180, 300]),
  ...ring(-18, -18, 2.2, [30, 150, 270]),
  ...ring(-18, -18, 3.0, [90, 210, 330]),
];

// Strategy-ordered ladder. core rungs always wanted; surge rungs only under real pressure.
const LADDER = [
  { what: 'turret', cost: 50, spots: TURRET_SPOTS, core: true },
  { what: 'sentry_beacon', cost: 25, spots: BEACON_SPOTS, core: true },
  { what: 'turret', cost: 70, spots: TURRET_SPOTS, core: true },
  { what: 'stockpile', cost: 60, spots: STOCK_SPOTS, core: true },
  { what: 'stockpile', cost: 60, spots: STOCK_SPOTS, core: true },
  { what: 'sluice', cost: 40, spots: SLUICE_SPOTS, core: true },
  { what: 'sluice', cost: 40, spots: SLUICE_SPOTS, core: true },
  { what: 'sluice', cost: 40, spots: SLUICE_SPOTS, core: true },
  { what: 'sentry_beacon', cost: 35, spots: BEACON_SPOTS, core: true },
  { what: 'sentry_beacon', cost: 45, spots: BEACON_SPOTS, core: true },
  { what: 'turret', cost: 95, spots: TURRET_SPOTS, core: false },
  { what: 'sentry_beacon', cost: 55, spots: BEACON_SPOTS, core: false },
  { what: 'turret', cost: 125, spots: TURRET_SPOTS, core: false },
  { what: 'sentry_beacon', cost: 75, spots: BEACON_SPOTS, core: false },
  { what: 'sentry_beacon', cost: 95, spots: BEACON_SPOTS, core: false },
];

const GROUND_FAIL = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach|OUT_OF/i;
const PLATE = /plating|dressing|vigor|hearty|tough|armor|armour|health|hp|heal/i;
const DMG = /spark|tap|coil|damage|crit|pierce|shot|rate|blast/i;

const poisoned = new Set();               // "what@x,z"
const rungDone = new Array(LADDER.length).fill(false);
let seamCursor = 0;
let blastDir = 0;
let rateHist = [];
let lastPan = 0, lastT = 0;
let upgDone = 0;

const key = (w, s) => `${w}@${s.x},${s.z}`;

function pickSpot(rung, occupied) {
  for (const s of rung.spots) {
    const k = key(rung.what, s);
    if (poisoned.has(k)) continue;
    if (occupied.has(k)) continue;
    return s;
  }
  return null;
}

export default function controller(view) {
  const now = view.now || {};
  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero || {};
  const works = now.works || {};
  const entries = works.entries || [];

  // ---- secure boundary: answer with SILENCE (records no entry, cannot be rejected)
  if (now.pendingSecure) return '\n';

  // ---- learn from the last array's refusals -------------------------------
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (!o || o.verb !== 'BUILD') continue;
    const st = String(rec.status || '');
    const why = String(rec.reason || rec.detail || '');
    if (st === 'failed' || st === 'rejected') {
      if (/insufficient_gold/i.test(why)) continue;      // ECONOMY: retry, poison nothing
      if (GROUND_FAIL.test(why) || why === '') poisoned.add(key(o.what, o.where));
    }
  }

  // ---- what is standing ----------------------------------------------------
  const occupied = new Set();
  const builtBy = {};
  let stockCapBonus = 0;
  const stockEntries = [];
  for (const e of entries) {
    const p = e.position || e.pos || {};
    if (p.x !== undefined) occupied.add(key(e.id, { x: +p.x.toFixed(2), z: +p.z.toFixed(2) }));
    builtBy[e.id] = (builtBy[e.id] || 0) + 1;
    if (e.id === 'stockpile' && !e.wrecked) {
      const tier = Math.max(1, e.tier || 1);
      stockCapBonus += Math.round(150 * (CAP_MULT[tier - 1] ?? 1));
      stockEntries.push(e);
    }
  }
  const byKind = works.byKind || {};
  const cap = 200 + stockCapBonus;

  // ---- income rate (panning only; biased LOW on purpose, which is protective)
  const pan = now.score?.goldPanned ?? 0;
  if (t > lastT + 1) {
    rateHist.push((pan - lastPan) / (t - lastT));
    if (rateHist.length > 6) rateHist.shift();
    lastPan = pan; lastT = t;
  }
  const rate = rateHist.length ? rateHist.reduce((a, b) => a + b, 0) / rateHist.length : 1.5;
  const remain = Math.max(0, SECURE_T - t);

  // ---- pressure -----------------------------------------------------------
  const hp = hero.hp ?? 100, mhp = hero.maxHp ?? 100;
  const alive = now.threats?.alive ?? 0;
  const wrecked = works.wrecked ?? 0;
  const standing = works.standing ?? 0;
  const urgent = (hp / mhp) < 0.75 || wrecked > 0 || standing < 3 || alive > 34;

  const out = [];

  // 1) draft first (replace semantics)
  const offer = now.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    let best = offer[0], bs = -1;
    for (const o of offer) {
      const txt = `${o.id} ${o.name} ${o.effectText || ''}`;
      const s = (PLATE.test(txt) ? 10 : 0) + (DMG.test(txt) ? 4 : 0);
      if (s > bs) { bs = s; best = o; }
    }
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2) free blast damage (returns {} either way, safe anywhere)
  if ((now.blastReadyInMs ?? 1) === 0) {
    const a = (blastDir++ * 67) * Math.PI / 180;
    out.push({ verb: 'BLAST_AT', pos: { x: +((hero.x ?? 0) + 6 * Math.cos(a)).toFixed(2), z: +((hero.z ?? 12) + 6 * Math.sin(a)).toFixed(2) } });
  }

  // 3) come-home guard (above every traveller)
  const dHome = Math.hypot((hero.x ?? 0) - CLAIM.x, (hero.z ?? 12) - CLAIM.z);

  // 4) cap ladder: raise the stockpiles a tier when the purse can still refill past the new cap
  let upgradeArmed = null;
  if (t > 120 && t < SECURE_T - 150 && stockEntries.length === 2 && !urgent) {
    for (const e of stockEntries) {
      const tier = Math.max(1, e.tier || 1);
      if (tier >= 3) continue;
      const price = STOCK_TIER_COST[tier];        // tier 1 -> 110, tier 2 -> 260
      if (!price || gold < price) continue;
      const newCap = cap - Math.round(150 * CAP_MULT[tier - 1]) + Math.round(150 * CAP_MULT[tier]);
      if ((gold - price) + rate * remain >= newCap + 40) {
        const p = e.position || e.pos;
        const ux = CLAIM.x - p.x, uz = CLAIM.z - p.z;
        const L = Math.hypot(ux, uz) || 1;
        upgradeArmed = { e, stand: { x: +(p.x + ux / L * 1.0).toFixed(2), z: +(p.z + uz / L * 1.0).toFixed(2) } };
        break;
      }
    }
  }

  if (upgradeArmed) {
    out.push({ verb: 'MOVE_HERO', pos: upgradeArmed.stand });
    out.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'stockpile', index: upgradeArmed.e.index } });
    upgDone++;
  } else if (dHome > 1.5) {
    out.push({ verb: 'MOVE_HERO', pos: CLAIM });
  }

  // 5) mend. Ungated early (ADR-005 bounds it to the rig radius, so it cannot walk far);
  //    late it must not nibble the banked purse for a scratch.
  if (t < SECURE_T - 70) out.push({ verb: 'REPAIR_UNDER', pct: 99 });
  else if (wrecked > 0 || hp < mhp * 0.6) out.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // 6) build ladder: plan-time-affordable batch, cumulative gating, rung retirement.
  const HARD_STOP = t > SECURE_T - 45;
  let purse = gold;
  let builds = 0;
  const used = {};                       // rungs of this kind already accounted for by standing works
  if (!HARD_STOP) {
    for (let i = 0; i < LADDER.length && builds < 4; i++) {
      const r = LADDER[i];
      const have = builtBy[r.what] || 0;
      const u = used[r.what] || 0;
      if (u < have) { used[r.what] = u + 1; rungDone[i] = true; continue; }  // already standing
      if (rungDone[i]) continue;                               // retired earlier (no ground left)
      if (!r.core && !urgent) break;                           // surge rungs wait for real pressure

      const spot = pickSpot(r, occupied);
      if (spot === null) { rungDone[i] = true; continue; }      // NO GROUND LEFT -> RETIRE, never stall
      if (purse < r.cost) break;                               // cumulative: fund in ladder order

      // bank gate: late in the run, only spend what the purse can still re-earn
      const lateGate = t > SECURE_T - 170 && !urgent
        && ((purse - r.cost) + rate * remain < cap + 10);
      if (lateGate) break;

      out.push({ verb: 'BUILD', what: r.what, where: spot, when: { goldGte: r.cost } });
      occupied.add(key(r.what, spot));
      purse -= r.cost;
      builds++;
    }
  }

  // 7) harvest tail: alternating blocks across the two nearest live seams.
  const seams = (now.seams || []).filter(s => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z));
  seams.sort((a, b) => Math.hypot(a.x - CLAIM.x, a.z - CLAIM.z) - Math.hypot(b.x - CLAIM.x, b.z - CLAIM.z));
  const chain = seams.slice(0, 2).map(s => s.id);
  const room = 31 - out.length;
  if (chain.length === 0) {
    const all = (now.seams || []).map(s => s.id);
    for (let i = 0; i < room; i++) out.push({ verb: 'HARVEST', seam: all[i % Math.max(1, all.length)] });
  } else if (chain.length === 1) {
    for (let i = 0; i < room; i++) out.push({ verb: 'HARVEST', seam: chain[0] });
  } else {
    const start = (seamCursor++) % 2;
    for (let b = 0; b * 6 < room; b++) {
      const id = chain[(start + b) % 2];
      for (let i = 0; i < 6 && out.length < 31; i++) out.push({ verb: 'HARVEST', seam: id });
    }
  }

  // terminal anchor that cannot be filtered away
  if (out.length < 32) out.push({ verb: 'HARVEST', seam: (now.seams?.[0]?.id) || 'gold-seam-1' });

  return out.slice(0, 32);
}
