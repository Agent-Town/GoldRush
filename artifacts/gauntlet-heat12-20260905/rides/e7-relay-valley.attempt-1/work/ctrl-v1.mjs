// e7-relay-valley controller v1
// Map facts (measured/source-read):
//  - claim + welded hero at (0,12), maxHp 100. Prospector is the order actor and is untargetable.
//  - the ONLY buildable ground is four relay-site zones at z 36..46 (x -50..-40,-30..-20,20..30,40..50),
//    >=31.2wu from the hero: nothing built can defend the claim (turret range 16, beacon 8).
//  - roster: rogue_automaton (contact 1.0) + data_rustler (thief, contact 0.8). NO wreckers ->
//    nothing I build can ever be attacked.
//  - E7 latch: secure needs now.playbookUse.objectiveMet -> a relay site lit BY A RUNNING PROGRAM.
//    E7PlaybookLatch.syncProgramRelays(running, works): any standing turret/sentry_beacon inside a
//    relay-site rectangle lights it WHILE a program holds the wheel. So: build one 25g beacon in a
//    zone, then PLAYBOOK_USE once. runningProgram is cleared by my next submission, so the use must
//    happen after the beacon stands.
//  - secureWave falls through to Balance.run.secureWave = 20 -> 600s.
//  - envelope: twist.clockTicks 18000 -> maxTicks 18002, maxEntries 3601, maxTapeBytes 592544.
//    Blank-line the secure boundary anyway (records no entry, banks by default).

const RELAY_SPOT = { x: 24, z: 40 }; // inside relay-site-r3 (x 20..30, z 36..46)

const PICK_SCORE = {
  tinkers_plating: 100,   // +25 maxHp AND heals 25
  field_dressing: 95,     // filler, INFINITE stacks, heals 0.3*maxHp -> the late-game sustain engine
  split_spark: 82,        // +1 spark per volley
  heavy_spark: 72,        // +30% damage
  double_tap_coil: 66,    // +25% fire rate
  long_resonator: 52,     // +20% range: kill before contact
  sharpen: 46,
  powder_charge: 40,
  wide_ring: 38,
  quick_fuse: 36,
  assay_bonus: 30,
  prospectors_luck: 20,
  pan_legend: 18,
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

function nearestSeam(now, from) {
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  if (!live.length) return null;
  live.sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z));
  return live[0];
}

let usedPlaybook = false;
let probed = false;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null; // blank line: no tape entry, banks by default

  const orders = [];

  // Replace semantics: the pick goes first so it owns the tick and everything else is resent under it.
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });
  }

  // Free AoE on the scrum that is standing on the hero. One per submission (the record is consumed).
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const beacons = (now.works?.byKind?.sentry_beacon) ?? 0;

  // The E7 objective, once and only once.
  if (!usedPlaybook && beacons >= 1) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'relay' });
    usedPlaybook = true;
  }

  // The one build that matters: a powered work inside a relay site.
  if (beacons < 1) {
    orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: RELAY_SPOT, when: { goldGte: 25 } });
  }

  // One-shot buildability probe near the claim: if this lands, the map is fortifiable after all.
  if (!probed) {
    probed = true;
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 17 }, when: { goldGte: 40 } });
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 20 }, when: { goldGte: 45 } });
  }

  // Income tail. HARVEST always returns, so nothing after it runs this tick; it is the anchor.
  const seam = nearestSeam(now, now.prospector ?? { x: 0, z: 12 });
  if (seam) for (let i = 0; i < 8; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  else orders.push({ verb: 'HOLD', pos: { x: now.hero.x + 4, z: now.hero.z } });

  return orders;
}
