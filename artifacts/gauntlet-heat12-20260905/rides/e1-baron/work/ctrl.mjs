// e1-baron controller — gen 55.
// Secure = kill the Baron at wave 20 (bossKillSecuresRun; autoSecureWaveForRun holds the gate shut
// while twist.baron && !baronBeaten). He has pursuitRange 18 and walks the hero welded at (0,12),
// so the whole contract is: fund the biggest ring of guns that reaches (0,12) before wave 20.
// River band is z in [-5,5]; everything here lives on the north bank.

const CLAIM = { x: 0, z: 12 };

// More candidates than slots; the refusal blacklist strikes GROUND refusals only (gen 51).
const TURRET_SPOTS = [
  [0, 20], [-8, 16], [8, 16], [-8, 8], [8, 8],
  [-13, 12], [13, 12], [-12, 18], [12, 18], [-5, 22], [5, 22], [0, 24],
];
// Beacon radius is 8, so every beacon must sit within 8wu of the claim to touch the Baron.
const BEACON_SPOTS = [
  [-4, 15], [4, 15], [-4, 9], [4, 9], [0, 17], [-6, 12],
  [6, 12], [-2, 18], [2, 18], [-7, 14], [7, 14], [0, 8],
];

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const TURRET_TIER2 = 150;

// Plating first: on a 100-maxHp hero facing a 5x-contact Baron, hit points are the margin.
function scoreUpgrade(u) {
  const s = `${u.id} ${u.name || ''} ${u.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|armou?r|max health|maxhp|hit points|toughness|vitality/.test(s)) v += 100;
  if (/heal|dressing|regen|mend|recover/.test(s)) v += 70;
  if (/damage|spark|coil|tap|power|bolt|volley/.test(s)) v += 40;
  if (/fire rate|rate of fire|cooldown|reload|haste/.test(s)) v += 35;
  if (/range|reach/.test(s)) v += 20;
  if (/blast|charge|radius/.test(s)) v += 18;
  if (/gold|luck|pan|seam|prospect|carry/.test(s)) v += 5;
  if (/speed|heels|boots|move/.test(s)) v += 3;
  return v;
}

const GROUND_REFUSALS = /out_of_zone|collision|out_of_reach|cap_reached|unreachable|terrain|outside/i;

export function makeController() {
  const blacklist = new Set();          // "kind@x,z" struck for GROUND reasons only
  const attempts = new Map();           // patience budget per spot
  let lastSig = null;
  let lastWave = -1;

  return function decide(view) {
    const now = view.now || {};

    // pendingSecure: answer with a blank line. The configured `bank` default fires for free and
    // the reel never records an entry on the terminal instant (F-HEAT11-1).
    if (now.pendingSecure) return null;

    // Learn from the view's own order records which coordinates the GROUND refuses.
    for (const rec of (now.orders || [])) {
      const o = rec && rec.order;
      if (!o || o.verb !== 'BUILD' || rec.status !== 'failed') continue;
      const reason = `${rec.reason || ''} ${rec.detail || ''}`;
      if (!GROUND_REFUSALS.test(reason)) continue;      // insufficient_gold poisons nothing
      if (o.where) blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
    }

    const gold = now.gold || 0;
    const entries = (now.works && now.works.entries) || [];
    const byKind = (now.works && now.works.byKind) || {};
    const nT = byKind.turret || 0;
    const nB = byKind.sentry_beacon || 0;

    const occupied = new Set(entries.map((e) => {
      const p = e.position || e;
      return `${Math.round((p.x ?? 0) * 2)},${Math.round((p.z ?? 0) * 2)}`;
    }));

    const orders = [];

    // 1. Draft first — replace semantics means the pick must own the array's head.
    if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
      const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 2. Free damage. One attempt per array; a cooldown refusal costs nothing and buys a view.
    if ((now.blastReadyInMs || 0) === 0) {
      orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 7 } });
    }

    // 3. Capped-purse sink: tier-2 turrets once the ladder is done. CONTEXT_ACTION does not
    //    travel, so it needs a MOVE_TO in front of it (gen 48). Gate on STATE, not a gold
    //    instant that a draining purse never presents at a view boundary (gen 49).
    // Use the ENTRY'S OWN id, never a literal — gen 39 lost a run to a tier index and I am not
    // going to lose one to a name. Prefer the highest-maxHp untiered work (the turrets).
    const ladderDone = nT >= 4 && nB >= 6;
    if (ladderDone && gold >= TURRET_TIER2) {
      const cands = entries
        .filter((e) => !e.wrecked && (e.tier || 1) < 2 && e.id !== 'palisade')
        .sort((a, b) => (b.maxHp || 0) - (a.maxHp || 0));
      if (cands.length) {
        const e = cands[0];
        const p = e.position || { x: 0, z: 12 };
        orders.push({ verb: 'MOVE_TO', pos: { x: p.x, z: p.z } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: e.id, index: e.index } });
      }
    }

    // 4. The ladder. Turrets and beacons interleaved by dps-per-gold, cumulative-gated so a
    //    cheap rung can never steal the gold an expensive one is waiting for.
    const ladder = [];
    for (let i = nT; i < 4; i += 1) ladder.push({ kind: 'turret', cost: TURRET_COSTS[i], rank: i * 2 });
    for (let i = nB; i < 6; i += 1) ladder.push({ kind: 'sentry_beacon', cost: BEACON_COSTS[i], rank: i * 2 + 1 });
    ladder.sort((a, b) => a.rank - b.rank);

    let cum = 0;
    let emitted = 0;
    for (const rung of ladder) {
      if (emitted >= 3) break;
      cum += rung.cost;
      const spots = rung.kind === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
      let placed = null;
      for (const [x, z] of spots) {
        const key = `${rung.kind}@${x},${z}`;
        if (blacklist.has(key)) continue;
        if (occupied.has(`${Math.round(x * 2)},${Math.round(z * 2)}`)) continue;
        if ((attempts.get(key) || 0) > 8) { blacklist.add(key); continue; }
        placed = { x, z, key };
        break;
      }
      if (!placed) continue;
      attempts.set(placed.key, (attempts.get(placed.key) || 0) + 1);
      occupied.add(`${Math.round(placed.x * 2)},${Math.round(placed.z * 2)}`);
      orders.push({
        verb: 'BUILD',
        what: rung.kind,
        where: { x: placed.x, z: placed.z },
        when: { goldGte: cum },
      });
      emitted += 1;
    }

    // 5. Mend, but only when the money to mend with already exists — a travelling verb that
    //    fails walks the worker off the seam for nothing (gen 40/42).
    const wHp = (now.works && now.works.hp) || 0;
    const wMax = (now.works && now.works.maxHp) || 0;
    if (gold >= 40 && wMax > 0 && wHp < wMax * 0.85) {
      orders.push({ verb: 'REPAIR_UNDER', pct: 70 });
    }

    // 6. The economy tail. Two anchors sit ~9-10wu from the claim on the north bank; drain one
    //    seam in a block before walking, and never let the tail filter itself empty.
    const live = (now.seams || []).filter((s) => s.active && s.x !== null && s.z !== null);
    const px = (now.prospector && now.prospector.x) || CLAIM.x;
    const pz = (now.prospector && now.prospector.z) || CLAIM.z;
    const d2 = (s, x, z) => (s.x - x) ** 2 + (s.z - z) ** 2;
    const ranked = live.slice().sort((a, b) => d2(a, px, pz) - d2(b, px, pz));
    const room = 31 - orders.length;
    if (ranked.length && room > 0) {
      const perSeam = 7;
      let n = 0;
      for (let pass = 0; pass < 4 && n < room; pass += 1) {
        const s = ranked[pass % ranked.length];
        for (let k = 0; k < perSeam && n < room; k += 1) {
          orders.push({ verb: 'HARVEST', seam: s.id });
          n += 1;
        }
      }
    }

    // 7. Terminal anchor that cannot be filtered away.
    if (orders.length < 32) orders.push({ verb: 'HOLD', pos: { x: -2, z: 11 } });

    // Reel budget: resubmit only when the plan actually changes or a new wave needs a refilled
    // worklist; answer every other view with a blank line (gen 40 — this is the reel_too_large cure).
    const sig = JSON.stringify(orders);
    const wave = now.wave;
    if (sig === lastSig && wave === lastWave) return null;
    lastSig = sig;
    lastWave = wave;
    return orders.slice(0, 32);
  };
}
