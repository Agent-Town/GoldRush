// e7-relay-valley controller v4 — the rider's v3, with ONE change: it reads the published claim-kit
//
// Measured ladder: idle w2/79s -> v1 w13/398.5s -> v2 (thief decoy) w14/429.9s.
// The run is a pure attrition race: a welded 175-hp hero that no building can reach, against
// ~1.1 hp/s of contact damage from wave 11 on. The only unbounded HP source in the game is
// `field_dressing` (filler, INFINITE stacks, heals 0.3*maxHp), and `Progression.rollOffer` only
// offers fillers once fewer than three NON-filler cards remain eligible. So the run is won by
// reaching pool exhaustion before t=600.
//
// THREE CHANGES FROM v2:
//  1. TURRET, not sentry_beacon, for the relay objective. `Progression.eligibleDefs` drops
//     `beacon_dynamo` while `getBeaconCount() <= 0`, so building a beacon ADDS TWO junk cards to
//     the pool I am trying to empty. A turret lights a relay site exactly as well
//     (`POWERED_RELAY_KINDS = ['turret','sentry_beacon']`) and keeps the pool two picks shorter.
//  2. The stockpile decoy stays (v2's proven +30s): it is the only registered gold holding, so it
//     is what stops every `data_rustler` falling through to hero pursuit.
//  3. Panning fixed. v2 round-robined live seams that sit 45wu apart, so the Prospector spent the
//     run walking (285 gold in 430s = 0.66 g/s against a 3.3 g/s pan rate). Stack on the seam
//     nearest the CLAIM, only chain a second one if it is genuinely close, and park there.

const RELAY = { x: 24, z: 40 };        // relay-site-r3
const STOCKPILE = { x: 45, z: 41 };    // relay-site-r4, 49wu from the claim
const CLAIM = { x: 0, z: 12 };

const PICK_SCORE = {
  tinkers_plating: 100,
  field_dressing: 96,
  split_spark: 82,
  heavy_spark: 72,
  double_tap_coil: 66,
  long_resonator: 52,
  sharpen: 46,
  powder_charge: 40,
  wide_ring: 38,
  quick_fuse: 36,
  assay_bonus: 32,      // gold now: feeds the decoy, which is the damage lever
  prospectors_luck: 28, // +10 seam capacity, -5s respawn: also the decoy
  pan_legend: 26,
  spring_heels: 14,
  beacon_dynamo: 4,
};

function pick(offer, hero) {
  // The claim kit heals 0.3*maxHp. Above 70% the bandage overflows, so the patent is worth more.
  const bandageLands = hero.hp <= hero.maxHp * 0.7;
  let best = offer[0], bestScore = -1;
  for (const o of offer) {
    let s = PICK_SCORE[o.id] ?? 10;
    if (o.id === 'field_dressing' && !bandageLands) s = 1;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

let usedPlaybook = false;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null; // blank line: records no tape entry, banks by default

  const orders = [];
  const kind = now.works?.byKind ?? {};

  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer, now.hero) });
  }
  // Free AoE straight into the scrum standing on the welded hero. One per submission.
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const turrets = kind.turret ?? 0;
  if (!usedPlaybook && turrets >= 1) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'relay' });
    usedPlaybook = true;
  }
  if (turrets < 1) {
    orders.push({ verb: 'BUILD', what: 'turret', where: RELAY, when: { goldGte: 50 } });
  }
  if ((kind.stockpile ?? 0) < 1) {
    orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCKPILE, when: { goldGte: 60 } });
  }

  // Income tail. The holding's amount IS economy.gold, so panning keeps the decoy alive; and the
  // seams that matter are the two anchors 6.3wu from the claim, never the two 47wu ones.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x))
    .sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  if (live.length) {
    const near = live.filter((s) => dist(s, live[0]) <= 25);
    const room = 30 - orders.length - 1;
    for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: near[i % near.length].id });
    // Park on the seam so a depleted chain does not drift the Prospector back to the hero.
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 12, z: 18 } });
  }

  return orders;
}
