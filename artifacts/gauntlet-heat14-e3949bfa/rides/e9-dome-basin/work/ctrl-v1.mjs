// generation 113 — e9-dome-basin controller v1.
// The gen-6->112 skeleton, retargeted. The one thing this board does differently:
// the claim is NOT a loss condition (endReason literals are only preserve_fell /
// vent_guttered), and all four harvestAnchors sit INSIDE the seed-rows-footing
// build zone -- so the hero walks off the claim into the seam pocket and the fort,
// the economy and the defended body collapse into one place.
//
// Gold plan, decided BEFORE the first order (gens 85/105/106: the ride that gets
// the receipt is the ride that sets the row):
//   secureWave is silent -> Balance.run.secureWave 20 -> 600 s, waves and timeAlive
//   both pinned, so the purse at the secure tick is the ONLY free ranking axis.
//   The cap is 200 and the only lever that raises it is `stockpile`, which is also
//   the ONLY thing that arms this roster's thief: claimGold() returns 0 unless
//   holding.kind === 'stockpile'. No stockpile => goldStolen 0 for the whole run.
//   Declined (gen 106 measured 435 gold lost to exactly this trade). Cap 200, bank it.
//   Income ~2.2 g/s in the pocket, so a hard build stop at t=460 leaves 140 s to
//   refill 200 from empty -- spend freely until then, nothing after.

const POST = { x: 28, z: -25 };
const POSTS = [{ x: 28, z: -25 }, { x: 28, z: -24 }, { x: 27, z: -26 }, { x: 30, z: -25 }, { x: 25, z: -25 }];
const HARD_STOP = 460;     // no BUILD at all after this (a flat floor cannot be argued with)
const SECURE_T = 600;
const CAP = 200;

// seed-rows-footing: x 18..44, z -32..-18.  Seams (obstacles) at
// (22,-28) (28,-22) (34,-28) (40,-22).
const TURRET_SPOTS = [
  { x: 21, z: -22 }, { x: 35, z: -22 }, { x: 28, z: -19 }, { x: 37, z: -27 },
  { x: 24, z: -19 }, { x: 32, z: -19 }, { x: 20, z: -26 }, { x: 38, z: -31 },
];
const BEACON_SPOTS = [
  { x: 25, z: -25 }, { x: 31, z: -25 }, { x: 28, z: -28 }, { x: 25, z: -20 },
  { x: 31, z: -20 }, { x: 28, z: -31 }, { x: 22, z: -24 }, { x: 34, z: -24 },
  { x: 24, z: -30 }, { x: 32, z: -30 },
];
const PAL_SPOTS = [];
for (const x of [20, 24, 32, 36, 40]) PAL_SPOTS.push({ x, z: -19 });
for (const z of [-20, -24, -28, -32]) PAL_SPOTS.push({ x: 42, z });
for (const x of [20, 24, 32, 36, 40]) PAL_SPOTS.push({ x, z: -31 });
for (const z of [-22, -26, -30]) PAL_SPOTS.push({ x: 19, z });

// ONE ladder, ONE ordinal per id. Strategy order (interleaved), never price order.
const LADDER = [];
LADDER.push({ id: 'turret', spots: TURRET_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
LADDER.push({ id: 'turret', spots: TURRET_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
LADDER.push({ id: 'turret', spots: TURRET_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
LADDER.push({ id: 'turret', spots: TURRET_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
LADDER.push({ id: 'sentry_beacon', spots: BEACON_SPOTS });
for (let i = 0; i < PAL_SPOTS.length; i += 1) LADDER.push({ id: 'palisade', spots: PAL_SPOTS });

const blacklist = new Set();   // "x,z" GROUND refusals only
const retired = new Set();     // ladder indices with no candidates left
let postIdx = 0;
let seamCursor = 0;
let seamBlock = 0;

const key = (p) => `${p.x},${p.z}`;
const d2 = (a, b) => (a.x - b.x) ** 2 + ((a.z ?? a.y) - (b.z ?? b.y)) ** 2;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  if (/plat|armor|armour|tough|vital|max\s*hp|hardy/.test(s)) return 100;
  if (/heal|regen|mend|dressing|recover|bandage/.test(s)) return 80;
  if (/damage|spark|coil|tap|power|crit/.test(s)) return 40;
  return 10;
}

export default function controller(view) {
  const now = view.now || {};

  // 1. Secure boundary: SILENCE. Banks the default, cannot be rejected, keeps the
  //    replay from diverging (gen 84).
  if (now.pendingSecure) return null;

  const t = (now.timers && (now.timers.runSeconds ?? now.timers.simTimeSeconds)) ?? 0;
  const gold = now.gold ?? 0;
  const works = now.works || {};
  const byKind = works.byKind || {};
  const entries = works.entries || [];
  const hero = now.hero || {};
  const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;

  // --- harvest the refusal records: GROUND poisons a coordinate, ECONOMY poisons nothing.
  let heroUnreachable = false;
  for (const rec of (now.orders || [])) {
    const o = rec.order || {};
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (rec.status !== 'failed') continue;
    if (o.verb === 'BUILD' && o.where) {
      if (/out_of_zone|collision|cap_reached|UNREACHABLE|out_of_reach/i.test(reason)) blacklist.add(key(o.where));
      // insufficient_gold: poison nothing, retry.
    }
    if (o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(reason)) heroUnreachable = true;
  }
  if (heroUnreachable && postIdx < POSTS.length - 1) postIdx += 1;

  const orders = [];

  // 2. Draft first under replace semantics.
  const offer = now.pendingOffer;
  if (offer && offer.length) {
    const best = offer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. Free blast: returns {} on success AND failure, so it is safe above the traveller.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: POST.x, z: POST.z + 4 } });
  }

  // 4. Hero post: emitted ONCE and dropped when parked; index advances only on a
  //    real UNREACHABLE record (never a ladder of candidates -- gen 68's shuttle).
  const post = POSTS[postIdx];
  if (hero.x == null || d2(hero, post) > 1.0) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: post.x, z: post.z } });
  }

  // 5. Mend. The repair sweep is bounded to the Spark Rig radius around the
  //    Prospector, and the Prospector lives at the seams -- which on this map are
  //    INSIDE the fort, so the sweep covers it. Mend a real hole, never a scratch
  //    (gen 104's 2-gold dribble), and never when it would strand the purse below
  //    a cap that refuses partial credits (gen 102).
  const wrecked = works.wrecked ?? 0;
  const nearCap = CAP - gold < 6;
  const closing = t > SECURE_T - 30;
  if (gold >= 35 && !nearCap && (!closing || wrecked > 0)) {
    orders.push({ verb: 'REPAIR_UNDER', pct: wrecked > 0 ? 99 : 70 });
  }

  // 6. ONE build per array: the head rung of ONE ladder, priced at its LIVE instance.
  if (t < HARD_STOP) {
    const mech = (view.stablePrefix && view.stablePrefix.mechanics) || {};
    const priceOf = (id, n) => {
      const b = (mech.buildables || []).find((x) => x.id === id);
      if (!b || !b.costs || !b.costs.length) return Infinity;
      return b.costs[Math.min(n, b.costs.length - 1)];
    };
    const capOf = (id) => {
      const b = (mech.buildables || []).find((x) => x.id === id);
      return b && b.maxCount != null ? b.maxCount : 0;
    };
    const seen = Object.create(null);           // ordinal per id, ONE counter
    for (let i = 0; i < LADDER.length; i += 1) {
      const rung = LADDER[i];
      seen[rung.id] = (seen[rung.id] || 0) + 1;
      if (retired.has(i)) continue;
      const standing = byKind[rung.id] || 0;
      if (standing >= seen[rung.id]) continue;   // this rung is already satisfied
      if (standing >= capOf(rung.id)) { retired.add(i); continue; }
      // pick a spot: not blacklisted, not already occupied by a standing work
      const spot = rung.spots.find((p) => {
        if (blacklist.has(key(p))) return false;
        return !entries.some((e) => e.position && d2(e.position, p) < 4.0);
      });
      if (!spot) { retired.add(i); continue; }   // RETIRE, never stall the rungs behind it
      const cost = priceOf(rung.id, standing);
      if (gold >= cost) {
        orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cost } });
      }
      break;                                      // head rung only
    }
  }

  // 7. Harvest tail. An inactive seam publishes x/z/anchorIndex as null and ONE
  //    non-finite number refuses the whole array silently -- filter first, sort after.
  const live = (now.seams || []).filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => d2(a, post) - d2(b, post));
  const room = 32 - orders.length;
  if (live.length) {
    if (seamBlock >= 7) { seamBlock = 0; seamCursor += 1; }
    for (let k = 0; k < room; k += 1) {
      const s = live[(seamCursor + Math.floor(k / 7)) % live.length];
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
    seamBlock += 1;
  } else {
    // never emit an empty array; hold the ground we already occupy
    orders.push({ verb: 'MOVE_HERO', pos: { x: post.x, z: post.z } });
  }

  return orders.slice(0, 32);
}
