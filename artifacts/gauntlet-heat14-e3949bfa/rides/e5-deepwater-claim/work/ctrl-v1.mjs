// generation 114 — e5-deepwater-claim controller v1
// Secure: kill 2 paddles (110 hp each) -> act 2 -> kill hold (140 hp). A dredge_queen defeat
// before wave 12 is RECORDED but does not secure (HeadlessContractSim:2390); the run then
// secures at the wave-12 boundary (t=272.000) because the boss is beaten. So waves=12 and
// timeAlive=272.000 are PINNED and GOLD IS THE ONLY FREE RANKING AXIS.
//
// Post: 5 units NORTH of a wreck site. North matters: the act-2 swat only fires where
// dz = hero.z - anchor.z <= 0 (DredgeQueenBossSystem:315), so a post north of the anchor is
// exempt by geometry. 5 units also clears the range-zero volley deadlock and keeps every
// component inside the rig's range 10.

const SITES = [
  { x: -36, z: -24 }, { x: -18, z: -30 }, { x: 0, z: -22 }, { x: 20, z: -34 }, { x: 36, z: -20 },
];
// Candidate posts, furthest-south first. If the hero cannot swim off the claim-boat deck the
// ladder walks back north until something is walkable, and the table shows exactly where it stopped.
const POSTS = [
  { x: 0, z: -17 }, { x: 0, z: -12 }, { x: 0, z: -5 },
  { x: 0, z: 5 }, { x: 0, z: 15 }, { x: 0, z: 22 },
];

const SECURE_T = 272.0;
const LOOT = 40;            // holdLoot 5 x lootGoldPerUnit 8, spilled on the kill
const BASE_CAP = 200;
const SP_BONUS = 150;
const SP_COST = 60;

function scoreUpgrade(u) {
  const s = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
  if (/plating|max hp|maxhp|health|vitality|tough/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 80;
  if (/damage|spark|coil|tap|power/.test(s)) return 60;
  if (/rate|speed|reload|haste/.test(s)) return 50;
  return 10;
}

export default function controller(view, S, row) {
  const n = view.now;
  const t = (n.timers && n.timers.runSeconds) ?? 0;

  // --- secure boundary: answer with SILENCE. Any non-SECURE_CHOICE array is refused while
  // pendingSecure stands, and refused submissions are invisible to the tape but visible to the
  // sim, which desynchronises the replay. A blank line records no entry and takes `bank`.
  if (n.pendingSecure) return null;

  S.postIdx ??= 0;
  S.spBuilt ??= 0;
  S.spWanted ??= 0;
  S.lastPan ??= 0;
  S.blacklist ??= new Set();

  // --- read our own order records: advance the post only on a REAL unreachable refusal
  for (const rec of (n.orders || [])) {
    const o = rec.order || rec;
    if (o.verb === 'MOVE_HERO' && rec.status === 'failed') {
      const why = String(rec.reason || '');
      if (/UNREACHABLE/i.test(why)) {
        S.postIdx = Math.min(S.postIdx + 1, POSTS.length - 1);
        S.lastRefusal = why;
      }
    }
    if (o.verb === 'BUILD' && rec.status === 'failed') {
      const why = String(rec.reason || '');
      // GROUND refusals poison the coordinate; ECONOMY refusals retry and poison nothing.
      if (/out_of_zone|collision|terrain|cap_reached|UNREACHABLE/i.test(why)) S.blacklist.add(o.what + ':' + o.where.x + ',' + o.where.z);
    }
  }

  const post = POSTS[S.postIdx];
  const hx = n.hero.x, hz = n.hero.z;
  const atPost = Math.hypot(hx - post.x, hz - post.z) < 0.9;

  const boss = (n.deepwater && n.deepwater.dredgeQueenBoss) || {};
  const beaten = boss.act === 3 || boss.crewQuit === true;

  // --- economy projection: pick the stockpile count that maximises the BANKED purse.
  // build 60 -> +150 cap is +90 net only if the surplus would otherwise pin at the cap.
  const panned = (n.score && n.score.goldPanned) || 0;
  const rate = t > 20 ? panned / t : 0;               // biased low (misses loot) => protective
  const remain = Math.max(0, SECURE_T - t);
  const grossProj = panned + rate * remain + (beaten ? 0 : LOOT);
  const banked = (k) => Math.min(BASE_CAP + SP_BONUS * k, grossProj - SP_COST * k - 22 * k);
  if (t > 30) {
    let best = 0;
    for (const k of [1, 2]) if (banked(k) > banked(best)) best = k;
    S.spWanted = Math.max(S.spWanted, best);          // monotone: never un-decide
  }
  S.spBuilt = ((n.works && n.works.byKind && n.works.byKind.stockpile) || 0);

  const orders = [];

  // 1. draft first (replace semantics) — plating-first scorer, never offer[0]
  if (n.pendingOffer && n.pendingOffer.length) {
    const pick = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick.id });
  }

  // 2. free supplementary damage — returns {} on success AND failure, so it belongs above
  //    the traveller and can never own the tick.
  if (n.blastReadyInMs === 0 && !beaten && boss.anchor) {
    const d = Math.hypot(hx - boss.anchor.x, hz - boss.anchor.z);
    if (d <= 9.5) orders.push({ verb: 'BLAST_AT', pos: { x: boss.anchor.x, z: boss.anchor.z } });
  }

  // 3. hold the ground the gun stands on. Emit ONCE and drop when parked — a ladder of posts
  //    re-issued every view is a shuttle that ping-pongs the body and freezes the economy.
  if (!atPost) orders.push({ verb: 'MOVE_HERO', pos: { x: post.x, z: post.z } });

  // 4. the cap-raisers. One trip, both rungs, cumulatively gated so a rung cannot fire early.
  //    The roster is one id (corsair_skiff) with NO thief flag, so a standing till invites nothing.
  const spots = [{ x: 0, z: 30 }, { x: 3, z: 29 }, { x: -3, z: 29 }, { x: 3, z: 32 }, { x: -3, z: 32 }, { x: 0, z: 27 }];
  if (S.spWanted > S.spBuilt) {
    const owed = S.spWanted - S.spBuilt;
    let placed = 0;
    for (const sp of spots) {
      if (placed >= owed) break;
      const key = 'stockpile:' + sp.x + ',' + sp.z;
      if (S.blacklist.has(key)) continue;
      orders.push({ verb: 'BUILD', what: 'stockpile', where: { x: sp.x, z: sp.z }, when: { goldGte: SP_COST * (owed - placed) } });
      placed++;
    }
  }

  // 5. the tail IS the economy and the clock. Alternating blocks of six across the nearest live
  //    seams: a seam holds 30 (six 1.5 s pans) then respawns for 20 s, so the far half keeps
  //    working while the near one refills. Inactive seams publish x/z/anchorIndex as NULL and one
  //    non-finite number refuses the WHOLE array silently.
  const live = (n.seams || [])
    .filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ ...s, d: Math.hypot(s.x - post.x, s.z - post.z) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 2);

  const room = 32 - orders.length;
  if (live.length && room > 0) {
    const chain = [];
    for (let b = 0; chain.length < room; b++) {
      const s = live[b % live.length];
      for (let k = 0; k < 6 && chain.length < room; k++) chain.push({ verb: 'HARVEST', seam: s.id });
    }
    orders.push(...chain);
  }

  return orders.slice(0, 32);
}
