// e7-relay-valley controller v3 + KITING (hero-move-verb, owner ruling 2026-09-06).
//
// A copy of `artifacts/relay-valley-winnable/ctrl-v3.mjs` with ONE addition and a switch, so the
// two arms are the same policy and the difference is attributable. Everything above the kite block
// is v3 verbatim: the turret at relay-site-r3, the stockpile decoy at r4, the pool-shortening pick
// table, the seam-nearest-the-claim panning, the free BLAST_AT into the scrum.
//
// WHY KITING BELONGS HERE MORE THAN ANYWHERE. `reviews/relay-valley-winnable.md` filed F-RVW-6
// against this exact map: "the hero is welded because no verb in the agent union moves it. A human
// kites; a rider cannot. That asymmetry, not this map, is why 'no building reaches the hero' is
// fatal". F-RVW-5 measured the wall it produces: at wave 18 the board holds 57 live enemies, 37 of
// them thieves, against one welded hero, and the hero loses its whole pool inside one wave. The
// answer shipped then was hit points (`twist.hero.maxHpBonus = 300`). This arm asks what the other
// answer is worth.
//
// THE KITE. Four points on the SOUTH shore, the one edge with no spawn gate (`lanes.spawnEdges` is
// north/west/east), well clear of the four relay sites (all at z 36..46) and of the two near
// harvest anchors at z 18. Legs are walked as a circuit from whichever point the hero is nearest,
// and only while the hero is genuinely in danger: `Balance.hero.speed` is 6.0 against an outlaw's
// 2.7, so a hero that is WALKING is not caught, but a hero that walks is also not shooting, and on
// this map the welded hero is most of the run's damage. Measured on the Ember Shore first: kiting
// on a threat count rather than on hit points cost more kills than it saved hit points and ended
// the run EARLIER (`artifacts/hero-move-verb/ladder.json`).

const RELAY = { x: 24, z: 40 };        // relay-site-r3
const STOCKPILE = { x: 45, z: 41 };    // relay-site-r4, 49wu from the claim
const CLAIM = { x: 0, z: 12 };

const KITE_RING = [
  { x: 0, z: -12 },
  { x: -22, z: -26 },
  { x: 22, z: -26 },
  { x: 0, z: -40 },
];
const KITE_HP = Number(process.env.GR_KITE_HP ?? 0.6);
const KITE_LEGS = Number(process.env.GR_KITE_LEGS ?? 4);
const KITE_ON = process.env.GR_KITE !== '0';

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

function pick(offer) {
  let best = offer[0], bestScore = -1;
  for (const o of offer) {
    const s = PICK_SCORE[o.id] ?? 10;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function kiteLegs(hero, count) {
  let start = 0;
  let near = Infinity;
  for (let i = 0; i < KITE_RING.length; i += 1) {
    const away = dist(KITE_RING[i], hero);
    if (away < near) { near = away; start = i; }
  }
  const legs = [];
  for (let i = 1; i <= count; i += 1) legs.push(KITE_RING[(start + i) % KITE_RING.length]);
  return legs;
}

let usedPlaybook = false;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null; // blank line: records no tape entry, banks by default

  const orders = [];
  const kind = now.works?.byKind ?? {};

  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });
  }
  // Free AoE straight into the scrum standing on the hero. One per submission.
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

  // THE ONE ADDITION. Placed after the build orders and before the income tail, because an ACTIVE
  // MOVE_HERO owns the executor's tick and would otherwise delay the turret this run is built on;
  // and before the closing HOLD, because nothing after a HOLD ever runs.
  const kiting = KITE_ON && now.hero.hp < now.hero.maxHp * KITE_HP;
  if (kiting) for (const leg of kiteLegs(now.hero, KITE_LEGS)) orders.push({ verb: 'MOVE_HERO', pos: leg });

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
