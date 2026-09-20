// THE INCOME CEILING PROBE — the measurement the cap override has to be chosen against.
//
// It answers one question and nothing else: HOW MUCH GOLD CAN THIS MAP EARN BY t = 180, the wave-6
// latch deadline? `now.score.goldPanned` is cumulative and survives spending, so the curve is
// readable even though the probe buys the two cheap base beacons — it must, or the hero dies at
// t ~ 105 with nothing built and the curve stops before the deadline it is measuring.
//
// Everything else is the best line the mechanics allow: prospecting-first draft (+10 seam capacity
// and -5 s respawn is worth more than any weapon while a clock runs), chase the live seams
// nearest-first, drain each with six HARVESTs plus a seventh that fails on purpose to raise the
// `order_failure` surprise that hands the rider its next turn, and wait ON an empty anchor so a
// seam respawning underfoot is banked passively with no order at all.
const DEFEND = [{ id: 'w-base', x: -12, z: -36 }, { id: 'e-base', x: 12, z: -36 }];
const ANCHORS = [{ x: -34, z: 30 }, { x: -22, z: 34 }, { x: 22, z: 34 }, { x: 34, z: 30 }];
const DRAFT = ['prospectors_luck', 'tinkers_plating', 'field_dressing', 'iron_lungs', 'heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pick(offer) {
  for (const id of DRAFT) {
    const found = offer.find((o) => o.id === id);
    if (found) return found.id;
  }
  return offer[0].id;
}

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: pick(n.pendingOffer) });
  if (n.blastReadyInMs === 0 && n.hero) out.push({ verb: 'BLAST_AT', pos: { x: n.hero.x, z: n.hero.z + 4 } });

  const beacons = (n.works?.entries || []).filter((e) => e.id === 'sentry_beacon' && !e.wrecked);
  for (const site of DEFEND) {
    if (!beacons.some((b) => d(b.position, site) <= 2.5)) {
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: site.x, z: site.z }, when: { goldGte: 60 } });
    }
  }

  const live = (n.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = n.prospector && Number.isFinite(n.prospector.x) ? n.prospector : { x: 0, z: -44 };
  live.sort((a, b) => d(a, pros) - d(b, pros));
  for (const s of live) {
    for (let j = 0; j < 7 && out.length < 31; j += 1) out.push({ verb: 'HARVEST', seam: s.id });
  }
  const from = live.length ? live[live.length - 1] : pros;
  const empty = ANCHORS.filter((a) => !live.some((s) => d(s, a) < 2)).sort((a, b) => d(a, from) - d(b, from));
  out.push({ verb: 'HOLD', pos: empty.length ? empty[0] : { x: from.x, z: from.z } });
  return out.slice(0, 32);
}
