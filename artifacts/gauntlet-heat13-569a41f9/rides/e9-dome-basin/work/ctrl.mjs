// gen79 controller — the gen-6->78 skeleton, retargeted to the post-ADR-005 grammar.
// Central move: the hero is no longer welded to the undefendable claim at (0,12).
// All three live seams sit INSIDE the seed-rows-footing build zone (x 18..44, z -32..-18),
// so walk the hero into the seam pocket and build the fort around the body that must live.

const SECURE_TIME = 600;
const BANK_CAP = 200;

// home posts, tried in order; advance ONLY on a refusal (never a shuttle ladder)
const HOME_POSTS = [
  { x: 28, z: -26 }, { x: 28, z: -25 }, { x: 27, z: -26 },
  { x: 29, z: -26 }, { x: 28, z: -27 }, { x: 26, z: -24 },
];

// more candidates than slots; ladder is cumulatively gated
const TURRET_SPOTS = [
  { x: 24, z: -22 }, { x: 32, z: -22 }, { x: 24, z: -30 }, { x: 32, z: -30 },
  { x: 20, z: -26 }, { x: 36, z: -26 }, { x: 28, z: -20 }, { x: 28, z: -31 },
  { x: 20, z: -21 }, { x: 36, z: -21 }, { x: 21, z: -30 }, { x: 38, z: -29 },
];
const BEACON_SPOTS = [
  { x: 26, z: -24 }, { x: 30, z: -24 }, { x: 26, z: -28 }, { x: 30, z: -28 },
  { x: 24, z: -26 }, { x: 32, z: -26 }, { x: 26, z: -20 }, { x: 30, z: -20 },
  { x: 24, z: -19 }, { x: 33, z: -19 }, { x: 22, z: -24 }, { x: 34, z: -24 },
];
const PALI_SPOTS = [];
for (let x = 19; x <= 43; x += 4) for (const z of [-19, -31]) PALI_SPOTS.push({ x, z });
for (const x of [19, 43]) for (let z = -30; z <= -20; z += 4) PALI_SPOTS.push({ x, z });

const LADDER = [
  { id: 'turret', spots: TURRET_SPOTS }, { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS }, { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS }, { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'turret', spots: TURRET_SPOTS }, { id: 'sentry_beacon', spots: BEACON_SPOTS },
  { id: 'sentry_beacon', spots: BEACON_SPOTS }, { id: 'sentry_beacon', spots: BEACON_SPOTS },
];
const TIER_COST = [0, 150, 300];

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (p) => `${p.x},${p.z}`;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|dressing|health|max hp|maxhp|vitality|tough|armor|armour/.test(s)) v += 100;
  if (/heal|regen|mend/.test(s)) v += 60;
  if (/damage|spark|coil|powder|blast|tap|pierce/.test(s)) v += 30;
  if (/range|rate|reload|speed/.test(s)) v += 15;
  if (/pan|gold|luck|prospect/.test(s)) v += 3;
  return v;
}

export function makeController() {
  const bad = new Set();          // GROUND refusals only: poison the coordinate
  const tries = new Map();        // patience budget per coordinate
  let homeIdx = 0;
  let lastSig = null;
  let lastSubmitT = -99;
  let panRate = 0;

  return function controller(view, state) {
    const now = view.now;
    const sp = view.stablePrefix;

    // ---- 1. secure boundary: blank line banks it for free and keeps the last order inside the envelope
    if (now.pendingSecure) return null;

    const t = now.timers?.runSeconds ?? 0;
    const hero = now.hero || { x: 0, z: 12, hp: 100, maxHp: 100 };
    const gold = now.gold ?? 0;
    const panned = now.score?.goldPanned ?? 0;
    if (t > 30) panRate = panned / t;

    // ---- refusal harvesting: GROUND poisons the coordinate, ECONOMY never does
    for (const rec of (now.orders || [])) {
      if (rec.status !== 'failed') continue;
      const o = rec.order || {};
      const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
      if (o.verb === 'BUILD' && o.where) {
        if (/insufficient_gold/.test(reason)) continue;              // transient — retry, poison nothing
        if (/out_of_zone|collision|cap_reached|unreachable|terrain|out_of_reach/.test(reason)) {
          const k = key(o.where);
          tries.set(k, (tries.get(k) || 0) + 1);
          if ((tries.get(k) || 0) >= 2) bad.add(k);
        }
      }
      if (o.verb === 'MOVE_HERO' && /unreachable|terrain/.test(reason)) {
        if (homeIdx < HOME_POSTS.length - 1) homeIdx += 1;
      }
    }

    const orders = [];

    // ---- 2. the draft, first, under replace semantics
    if (now.pendingOffer && now.pendingOffer.length) {
      const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // ---- 3. free blast damage: returns {} on success AND failure, so safe above the traveller
    if ((now.blastReadyInMs ?? 1) === 0) {
      const tx = hero.x + (0 - hero.x) * 0.12, tz = hero.z + (12 - hero.z) * 0.12;
      if (Number.isFinite(tx) && Number.isFinite(tz)) orders.push({ verb: 'BLAST_AT', pos: { x: +tx.toFixed(2), z: +tz.toFixed(2) } });
    }

    const home = HOME_POSTS[homeIdx];
    const entries = now.works?.entries || [];
    const byKind = now.works?.byKind || {};
    const buildables = sp.mechanics?.buildables || [];
    const costOf = (id) => {
      const b = buildables.find((x) => x.id === id);
      if (!b) return Infinity;
      const n = byKind[id] || 0;
      const caps = b.costs || [];
      if (n >= (b.maxCount ?? 0)) return Infinity;
      return caps[Math.min(n, caps.length - 1)] ?? Infinity;
    };

    // ---- 4. the ladder: emit only rungs already affordable, cumulatively gated
    const wanted = [];
    const counts = {};
    let cum = 0;
    for (const rung of LADDER) {
      const b = buildables.find((x) => x.id === rung.id);
      const have = (byKind[rung.id] || 0) + (counts[rung.id] || 0);
      if (!b || have >= (b.maxCount ?? 0)) continue;
      const c = (b.costs || [])[Math.min(have, (b.costs || []).length - 1)] ?? Infinity;
      cum += c;
      const spot = rung.spots.find((s) => {
        const k = key(s);
        if (bad.has(k)) return false;
        if (wanted.some((w) => key(w.where) === k)) return false;
        return !entries.some((e) => e.position && d(e.position, s) < 1.5);
      });
      if (!spot) continue;
      counts[rung.id] = (counts[rung.id] || 0) + 1;
      wanted.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: Math.round(cum) } });
      if (wanted.length >= 4) break;
    }
    const ladderDone = wanted.length === 0;

    // ---- bank gate: on a fixed-wave secure gold is the ONLY free axis. Applies LATE only,
    // and is suspended whenever the hero is actually taking damage (gen76: a dead run banks nothing).
    const hurt = (hero.hp / (hero.maxHp || 100)) < 0.92;
    const canAfford = (c) => hurt || t < SECURE_TIME - 140
      || ((gold - c) + panRate * Math.max(0, SECURE_TIME - t) >= BANK_CAP + 5);

    let steered = false;
    // ---- 5. capped-purse sink: tier-2 turrets. CONTEXT_ACTION does not travel (reach 1.6).
    if (ladderDone) {
      const up = entries.find((e) => (e.id === 'turret' || e.id === 'sentry_beacon') && !e.wrecked
        && TIER_COST[Math.max(1, e.tier || 1)] && gold >= TIER_COST[Math.max(1, e.tier || 1)]
        && canAfford(TIER_COST[Math.max(1, e.tier || 1)]) && e.position);
      if (up) {
        const ux = up.position.x, uz = up.position.z;
        const len = Math.hypot(home.x - ux, home.z - uz) || 1;
        const px = ux + (home.x - ux) / len * 0.7, pz = uz + (home.z - uz) / len * 0.7;
        if (Number.isFinite(px) && Number.isFinite(pz)) {
          orders.push({ verb: 'MOVE_HERO', pos: { x: +px.toFixed(2), z: +pz.toFixed(2) } });
          orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: up.id, index: up.index } });
          steered = true;
        }
      }
    }

    // ---- 6. hold the post. ONE MOVE_HERO, dropped once parked (never a shuttle).
    if (!steered && d(hero, home) > 1.0) orders.push({ verb: 'MOVE_HERO', pos: home });

    for (const w of wanted) if (canAfford(w.when.goldGte)) orders.push(w);

    // ---- 7. mend: bounded to the hero's own sweep since ADR-005, so it cannot walk the map
    if ((now.works?.wrecked ?? 0) > 0 || (now.works?.standing ?? 0) > 0) orders.push({ verb: 'REPAIR_UNDER', pct: 90 });

    // ---- 8. overflow sink once the ladder and tiers are spent
    if (ladderDone && gold >= 10 && !canAfford(10) === false) {
      const b = buildables.find((x) => x.id === 'palisade');
      const have = byKind.palisade || 0;
      if (b && have < (b.maxCount ?? 0) && canAfford(10)) {
        const spot = PALI_SPOTS.find((s) => !bad.has(key(s)) && !entries.some((e) => e.position && d(e.position, s) < 2.2));
        if (spot) orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
      }
    }

    // ---- 9. the tail: drain the nearest live seam in a block. Number.isFinite before ANY sort.
    const live = (now.seams || []).filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z));
    live.sort((a, b) => d({ x: a.x, z: a.z }, hero) - d({ x: b.x, z: b.z }, hero));
    const room = 32 - orders.length;
    if (live.length && room > 0) {
      const block = Math.max(3, Math.floor(room / Math.min(3, live.length)));
      outer: for (const s of live.slice(0, 3)) {
        for (let i = 0; i < block; i++) {
          if (orders.length >= 32) break outer;
          orders.push({ verb: 'HARVEST', seam: s.id });
        }
      }
      while (orders.length < 32) orders.push({ verb: 'HARVEST', seam: live[0].id });
    }

    // ---- reel budget: resubmit on a real plan change, a draining worklist, or a slow heartbeat
    const pendingHarvest = (now.orders || []).filter((o) => o.order?.verb === 'HARVEST' && o.status === 'pending').length;
    const sig = JSON.stringify(orders.filter((o) => o.verb !== 'HARVEST'));
    const changed = sig !== lastSig;
    if (!changed && pendingHarvest >= 5 && (t - lastSubmitT) < 6) return null;
    lastSig = sig; lastSubmitT = t;
    return orders.slice(0, 32);
  };
}
