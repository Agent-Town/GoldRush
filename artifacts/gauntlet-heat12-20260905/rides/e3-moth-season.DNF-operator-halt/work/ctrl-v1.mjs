// e3-moth-season controller v1 — post-powerGrid rewrite.
// Facts established from source before writing:
//  * twist.powerGrid exists -> MechanicsManifest filters BOTH `turret` and `lantern_post`
//    out of the roster (MechanicsManifest.ts:823,828). Only sentry_beacon/palisade/sluice/
//    stockpile/assay_office/decoy_shed are buildable. No water -> no sluice.
//  * The secure is CONJUNCTIVE: HeadlessContractSim:2089
//    `(!twist.powerGrid.connect || canyonConnectCompletedByDeadline) && ...`
//    A sentry_beacon within 2.5wu of the pylon site (0,-14) brings `corridor-pylon` online
//    (syncContractPowerGrid:2364), which powers `corridor-gallery` -> powered 1 >= required 1.
//    The latch is ONE-WAY at-or-before wave 12, so the beacon may die afterwards.
//  * The claim (0,12) sits INSIDE the `dark-corridor` build zone (x -6..6, z -34..34), so the
//    fort can ring the welded hero directly. Spawn edges are north/south, ring radius 26.
//  * Moths do zero contact/building damage; they only dim lights and eat decoy sheds.
//    The only real threats are night_runner (hpScale 1.75) and fevered_saboteur (wrecker, w>=4).

const CLAIM = { x: 0, z: 12 };

// ---- build ladder ------------------------------------------------------------------
// rung = { what, cands: [...], cost }  cost is the *published* cost curve entry.
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

// slot 0 must be the pylon; every later slot rings the claim inside beacon range 8.
const BEACON_SLOTS = [
  [{ x: 0, z: -12 }, { x: 0, z: -13 }, { x: 1, z: -13 }, { x: -1, z: -13 }, { x: 0, z: -15 }, { x: 2, z: -14 }],
  [{ x: 0, z: 10 }, { x: 0, z: 9 }, { x: -1, z: 10 }, { x: 1, z: 10 }, { x: 0, z: 15 }],
  [{ x: -4, z: 13 }, { x: -5, z: 13 }, { x: -4, z: 14 }, { x: -5, z: 15 }, { x: -4, z: 16 }],
  [{ x: 4, z: 13 }, { x: 5, z: 13 }, { x: 4, z: 14 }, { x: 5, z: 15 }, { x: 4, z: 16 }],
  [{ x: -4, z: 9 }, { x: -5, z: 9 }, { x: -4, z: 17 }, { x: -5, z: 18 }, { x: -3, z: 17 }],
  [{ x: 4, z: 9 }, { x: 5, z: 9 }, { x: 4, z: 17 }, { x: 5, z: 18 }, { x: 3, z: 17 }],
];

// palisade bait/blocker rows across the corridor, north and south of the beacon ring.
const PAL = [];
for (const z of [21, 25, 1, -3, 29, -7, 17, 5]) {
  for (const x of [-5, -2.5, 0, 2.5, 5]) {
    if (Math.abs(x) < 1.6 && Math.abs(z - 6) < 3.2) continue; // clear the pre-placed lantern
    PAL.push({ x, z });
  }
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

const PICK_ORDER = [
  'tinkers_plating',   // +25 maxHp +25 heal, 3 stacks — the survival lever
  'beacon_dynamo',     // +30% beacon fire rate, 2 stacks — beacons are the ONLY buildable gun here
  'heavy_spark',       // +30% hero damage
  'double_tap_coil',   // +25% hero fire rate
  'field_dressing',    // filler heal 30% maxHp
  'split_spark',
  'powder_charge',
  'long_resonator',
  'prospectors_luck',
  'wide_ring',
  'quick_fuse',
  'sharpen',
  'assay_bonus',
];

function pick(offer, hero) {
  // when badly hurt, a heal outranks everything
  if (hero && hero.maxHp && hero.hp / hero.maxHp < 0.45) {
    const fd = offer.find((o) => o.id === 'field_dressing');
    if (fd) return fd.id;
  }
  for (const id of PICK_ORDER) {
    const hit = offer.find((o) => o.id === id);
    if (hit) return hit.id;
  }
  return offer[0].id;
}

export function decide(view, st) {
  const now = view.now;
  if (!st.init) {
    st.init = true;
    st.black = new Set();       // refused coordinates "what@x,z"
    st.tries = new Map();       // patience budget per coordinate
    st.palIdx = 0;
  }

  // --- learn from the last array's order records: blacklist coordinates that refused -----
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    const key = `${o.what}@${o.where.x},${o.where.z}`;
    if (rec.status === 'failed') {
      const n = (st.tries.get(key) || 0) + 1;
      st.tries.set(key, n);
      const why = String(rec.reason || '');
      // insufficient_gold is not a placement fault; everything else is
      if (/collision|out_of_zone|out_of_reach|UNREACHABLE|cap_reached/i.test(why) || n >= 4) st.black.add(key);
    }
  }

  // --- terminal / secure boundary --------------------------------------------------------
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // 1. the draft owns the tick first (replace semantics: everything else is resent below)
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer, now.hero) });
  }

  // 2. free damage: the blast is thrown from the HERO, and every non-moth converges on it.
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z - 4 } });
  }

  // 3. the build ladder ------------------------------------------------------------------
  const entries = now.works.entries || [];
  const beacons = entries.filter((e) => e.id === 'sentry_beacon');
  const built = new Set(entries.map((e) => `${e.id}@${e.position.x},${e.position.z}`));
  const nBeacon = beacons.length;

  const rungs = [];
  // beacon slots, in order; skip a slot whose primary AND alternates are all blacklisted/taken
  let slotCursor = 0;
  for (let s = 0; s < BEACON_SLOTS.length && rungs.length < 3; s++) {
    if (s < nBeacon && st.filled && st.filled[s]) continue;
    // treat slots as an ordered list of remaining ones: count how many beacons stand
    if (s < nBeacon) continue;
    const cand = BEACON_SLOTS[s].find((c) => {
      const k = `sentry_beacon@${c.x},${c.z}`;
      if (st.black.has(k) || built.has(k)) return false;
      return true;
    });
    if (!cand) continue;
    rungs.push({ what: 'sentry_beacon', where: cand, cost: BEACON_COSTS[Math.min(s, 5)] });
    slotCursor = s;
  }

  // palisades once the beacon ladder is done (or capped)
  if (nBeacon >= 6) {
    let added = 0;
    for (const p of PAL) {
      if (added >= 3) break;
      const k = `palisade@${p.x},${p.z}`;
      if (st.black.has(k) || built.has(k)) continue;
      rungs.push({ what: 'palisade', where: p, cost: 10 });
      added++;
    }
  }

  // non-decreasing price prefix, plan-time affordable at the head
  let gold = now.gold;
  let emitted = 0;
  for (const r of rungs) {
    if (emitted >= 3) break;
    orders.push({ verb: 'BUILD', what: r.what, where: r.where, when: { goldGte: r.cost } });
    emitted++;
  }

  // 4. the harvest tail: chain the live seams nearest the Prospector, six pans each ---------
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  const from = now.prospector || CLAIM;
  live.sort((a, b) => dist(from, a) - dist(from, b));
  const chain = live.slice(0, 3);
  const slots = 32 - orders.length;
  outer: while (orders.length < 32) {
    for (const s of chain) {
      for (let i = 0; i < 6; i++) {
        if (orders.length >= 32) break outer;
        orders.push({ verb: 'HARVEST', seam: s.id });
      }
    }
    if (!chain.length) break;
  }

  return orders;
}
