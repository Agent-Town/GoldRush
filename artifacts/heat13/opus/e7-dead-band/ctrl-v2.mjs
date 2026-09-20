// heat13 opus e7-dead-band controller v1 — post-ADR-005 grammar (no MOVE_TO / HOLD / FALLBACK_IF).
// Shape: PICK_UPGRADE first (replace semantics) -> PLAYBOOK_USE until the refusal latches the
// secure gate -> BLAST_AT when ready -> cumulative-gated ladder -> tier-2 sink -> HARVEST tail.
// Blank line at pendingSecure (banks for free, keeps last order inside the tick envelope).

const CLAIM = { x: 0, z: 12 };
const CAP = 200;               // bank cap; gold is the only free ranking axis at a fixed-wave secure
const STOP_SPENDING_AT = 500;  // s — leave ~100s of panning to refill the purse to the cap

// candidate spots, more than slots, all inside dead-band-yard (x -30..30, z -42..12)
const TURRET_SPOTS = [
  { x: -9, z: 9 }, { x: 9, z: 9 }, { x: -9, z: 3 }, { x: 9, z: 3 },
  { x: -14, z: 8 }, { x: 14, z: 8 }, { x: 0, z: 1 }, { x: -4, z: -2 }, { x: 4, z: -2 },
];
// beacon radius is 8, so every beacon spot must sit within 8 of the body it defends
const BEACON_SPOTS = [
  { x: -4, z: 10 }, { x: 4, z: 10 }, { x: 0, z: 7 }, { x: -6, z: 6 }, { x: 6, z: 6 },
  { x: -7, z: 11 }, { x: 7, z: 11 }, { x: -2, z: 5 }, { x: 2, z: 5 }, { x: 0, z: 11 },
];
// screen spots on the west and east approaches, spaced 4 apart so their 3-deep footprints clear
const PALISADE_SPOTS = [
  { x: -10, z: 12 }, { x: 10, z: 12 }, { x: -14, z: 12 }, { x: 14, z: 12 },
  { x: -12, z: 8 }, { x: 12, z: 8 }, { x: -18, z: 12 }, { x: 18, z: 12 },
  { x: -16, z: 8 }, { x: 16, z: 8 }, { x: -12, z: 4 }, { x: 12, z: 4 },
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const TIER_COST = [0, 150, 300];

const GROUND_REASON = /out_of_zone|collision|out_of_reach|cap_reached|UNREACHABLE|outside/i;
const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max health|maxhp|health|vitality|hardy/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
  if (/spark|damage|coil|tap|volley|power/.test(s)) v += 40;
  if (/rate|speed|fire/.test(s)) v += 25;
  if (/range|reach/.test(s)) v += 15;
  if (/luck|pan|gold|seam/.test(s)) v += 5;
  return v;
}

export default function controller(view) {
  const now = view.now || {};

  // 1. Secure boundary: answer with silence. gr-sim records no entry, the bank default fires,
  //    and the last accepted order stays inside the tick envelope (F-HEAT11-1).
  if (now.pendingSecure) return null;

  const orders = [];
  const gold = now.gold || 0;
  const t = now.timers?.runSeconds || 0;
  const entries = now.works?.entries || [];
  const byKind = now.works?.byKind || {};

  // learn refused GROUND coordinates from the view's own order records (never on insufficient_gold)
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o?.verb !== 'BUILD' || !o.where) continue;
    if (rec.status !== 'failed') continue;
    const why = `${rec.reason || ''} ${rec.detail || ''}`;
    if (/insufficient_gold/i.test(why)) continue;
    if (GROUND_REASON.test(why)) blacklist.add(key(o.where));
  }

  // 2. draft first — it costs no gold and it is the whole survival budget
  const offer = now.pendingOffer || [];
  if (offer.length) {
    const best = offer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. THE CONTRACT: the Dead Band's secure gate is a COUNTED REFUSAL. One PLAYBOOK_USE, refused
  //    signal-suppressed before the NOTHING_RECORDED branch is ever reached, latches it forever.
  const pb = now.playbookUse;
  if (pb && pb.declared && !pb.objectiveMet) {
    orders.push({ verb: 'PLAYBOOK_USE', name: `dead-band-${(pb.uses || 0) + (pb.refusals?.suppressed || 0) + 1}` });
  }

  // 4. free supplementary damage into the scrum standing on the hero
  if (now.blastReadyInMs === 0 && typeof now.hero?.x === 'number') {
    orders.push({ verb: 'BLAST_AT', pos: { x: round1(now.hero.x), z: round1(now.hero.z + 2) } });
  }

  // 5. the ladder — interleaved turret/beacon, cumulatively gated so a cheap rung can never take
  //    gold an expensive one is waiting for. Only rungs affordable at plan time are emitted.
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const usedSpots = new Set(entries.map((e) => key({ x: round1(e.position?.x ?? e.x), z: round1(e.position?.z ?? e.z) })));
  const rungs = [];
  let ti = nT, bi = nB;
  while (ti < 4 || bi < 6) {
    // turrets first while any remain: 57 dps flat beats a beacon's ~13 at wave 1
    if (ti < 4 && (bi >= 6 || ti <= bi - 1 || ti < 2)) { rungs.push({ what: 'turret', cost: TURRET_COSTS[ti], i: ti }); ti += 1; }
    else if (bi < 6) { rungs.push({ what: 'sentry_beacon', cost: BEACON_COSTS[bi], i: bi }); bi += 1; }
    else break;
  }
  let cum = 0;
  let placedT = nT, placedB = nB;
  const taken = new Set();
  for (const r of rungs) {
    cum += r.cost;
    if (cum > gold) break;                       // plan-time affordability
    if (t > STOP_SPENDING_AT) break;
    const pool = r.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = pool.find((p) => !blacklist.has(key(p)) && !usedSpots.has(key(p)) && !taken.has(key(p)));
    if (!spot) continue;
    taken.add(key(spot));
    orders.push({ verb: 'BUILD', what: r.what, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    if (r.what === 'turret') placedT += 1; else placedB += 1;
  }

  // 6. the sink: a purse pinned at the cap switches panning OFF (Economy refuses the credit), so
  //    keep it moving until the endgame, then stop and let it refill to the cap for the ranked
  //    purse. CONTEXT_ACTION does not travel and reaches only `Balance.demolish.interactRadius`
  //    1.6 from the work: v1 parked the hero 1.71 out and every upgrade answered "not legal here".
  const ladderDone = nT >= 4 && nB >= 6;
  let heroBusy = false;
  if (ladderDone && t < STOP_SPENDING_AT) {
    const up = entries.find((e) => e.id === 'turret' && TIER_COST[Math.max(1, e.tier || 1)] && gold >= TIER_COST[Math.max(1, e.tier || 1)]);
    if (up) {
      const p = up.position || up;
      const d = dist(p, CLAIM) || 1;
      // stand 0.7 out along the claim-ward side: 0.7 + the 0.5 arrival radius is still inside 1.6
      const toward = { x: p.x + ((CLAIM.x - p.x) / d) * 0.7, z: p.z + ((CLAIM.z - p.z) / d) * 0.7 };
      orders.push({ verb: 'MOVE_HERO', pos: { x: round1(toward.x), z: round1(toward.z) } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
      heroBusy = true;
    }
  }

  // 6b. come home. The fort is a ring around the CLAIM and the hero is what the whole board walks
  //     at, so a hero left standing at a turret 7.6 units out is a hero fighting outside its own
  //     beacon cover. v1's return order sat behind the harvest chain and never ran.
  const hero = { x: now.hero?.x ?? CLAIM.x, z: now.hero?.z ?? CLAIM.z };
  if (!heroBusy && dist(hero, CLAIM) > 0.6) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  // 6c. overflow sink. Palisades are 10g of indestructible screen on this board — the roster is
  //     one `data_rustler`, `thief: true` forces `wrecker = false`, so nothing can attack a work
  //     (0 wrecked across 81 views of tune-1). Only fires when the purse would otherwise pin at
  //     the cap and stop crediting pans, so it can only spend gold that was already dead.
  if (ladderDone && t < STOP_SPENDING_AT && gold >= 185 && (byKind.palisade || 0) < 24) {
    const ring = PALISADE_SPOTS.filter((p) => !blacklist.has(key(p)) && !usedSpots.has(key(p)) && !taken.has(key(p)));
    let spend = 0;
    for (const p of ring) {
      spend += 10;
      if (spend > gold - 150) break;   // never starve a pending tier upgrade
      if (orders.length >= 20) break;
      taken.add(key(p));
      orders.push({ verb: 'BUILD', what: 'palisade', where: { x: p.x, z: p.z }, when: { goldGte: spend } });
    }
  }

  // 7. the tail: drain the nearest live seam in a block before walking to the next.
  //    An inactive seam publishes x/z as null — one non-finite number refuses the WHOLE array.
  const seams = (now.seams || [])
    .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  const room = 31 - orders.length;
  if (room > 0) {
    if (seams.length) {
      const blocks = [[seams[0], Math.min(8, room)]];
      if (seams[1]) blocks.push([seams[1], 6]);
      if (seams[2]) blocks.push([seams[2], 4]);
      let left = room;
      for (const [s, n] of blocks) {
        for (let i = 0; i < n && left > 0; i++) { orders.push({ verb: 'HARVEST', seam: s.id }); left -= 1; }
      }
    }
    // terminal anchor that can never be filtered away and cannot block the tail: the hero's own feet
    if (orders.length < 32) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  return orders.slice(0, 32);
}

function round1(n) { return Math.round(n * 10) / 10; }
