// THE ONE-DESCENT LINE, on the REPRICED ladder. Byte-for-byte the controller
// `artifacts/canyon-works-bank-cap/ctrl-onedescent.mjs` rode against the 330 g ladder, with ONE
// change: `COSTS` now states this claim's authored prices (`twist.economy.beaconLadder`). The
// policy is deliberately unchanged so the two rides are comparable — the only moving parts are
// the prices the engine charges and the deadline the latch enforces.
//
// Two trips down the switchbacks total, not one per pair of beacons:
//
//   trip 1 (t ~ 20): the two BASE pylons, 25 + 30 = 55 g, bought from the first seam sweep. They
//     are two of the six the latch needs AND the only defence the hero gets — a policy that hoards
//     the whole ladder instead dies at t ~ 106 with nothing built (measured, `viewlog-tour-v2`).
//     Both are placed on ONE descent by suffix-gating the pair (`goldGte` 55 then 30).
//   trip 2: the remaining four (35 + 45 + 50 + 55 = 185 g), the descent the two levers exist to
//     make reachable inside the deadline.
//
// Everything else as `ctrl-ceiling.mjs`: prospecting-first draft, chase the live seams, a seventh
// HARVEST per seam that fails on purpose to raise the wake-up surprise, and a wait ON an empty
// anchor so a respawn underfoot is banked passively.
const BASE = [{ id: 'w-base', x: -12, z: -36 }, { id: 'e-base', x: 12, z: -36 }];
const REST = [
  { id: 'w-rim', x: -28, z: 8 },
  { id: 'w-switch', x: -24, z: -20 },
  { id: 'e-switch', x: 24, z: -20 },
  { id: 'e-rim', x: 28, z: 8 },
];
const ANCHORS = [{ x: -34, z: 30 }, { x: -22, z: 34 }, { x: 22, z: 34 }, { x: 34, z: 30 }];
const COSTS = [25, 30, 35, 45, 50, 55];
const DRAFT = ['prospectors_luck', 'tinkers_plating', 'field_dressing', 'iron_lungs', 'heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pick(offer) {
  for (const id of DRAFT) {
    const found = offer.find((o) => o.id === id);
    if (found) return found.id;
  }
  return offer[0].id;
}

function route(todo, from) {
  const left = todo.slice();
  const out = [];
  let at = from;
  while (left.length) {
    left.sort((a, b) => d(a, at) - d(b, at));
    const next = left.shift();
    out.push(next);
    at = next;
  }
  return out;
}

/** Suffix-gate a run of builds so ONE trip buys all of them: rung i waits for rungs i..end. */
function gated(sites, built, out) {
  const costs = sites.map((_s, i) => COSTS[Math.min(COSTS.length - 1, built + i)]);
  let suffix = costs.reduce((a, b) => a + b, 0);
  sites.forEach((site, i) => {
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: site.x, z: site.z }, when: { goldGte: suffix } });
    suffix -= costs[i];
  });
}

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: pick(n.pendingOffer) });
  if (n.blastReadyInMs === 0 && n.hero) out.push({ verb: 'BLAST_AT', pos: { x: n.hero.x, z: n.hero.z + 4 } });

  const beacons = (n.works?.entries || []).filter((e) => e.id === 'sentry_beacon' && !e.wrecked);
  const standing = (site) => beacons.some((b) => d(b.position, site) <= 2.5);
  const built = beacons.length;
  const baseTodo = BASE.filter((s) => !standing(s));
  const restTodo = REST.filter((s) => !standing(s));

  const pros = n.prospector && Number.isFinite(n.prospector.x) ? n.prospector : { x: 0, z: -44 };
  if (baseTodo.length) gated(route(baseTodo, pros), built, out);
  else if (restTodo.length) gated(route(restTodo, pros), built, out);

  const live = (n.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => d(a, pros) - d(b, pros));
  for (const s of live) {
    for (let j = 0; j < 7 && out.length < 31; j += 1) out.push({ verb: 'HARVEST', seam: s.id });
  }
  const from = live.length ? live[live.length - 1] : pros;
  const empty = ANCHORS.filter((a) => !live.some((s) => d(s, a) < 2)).sort((a, b) => d(a, from) - d(b, from));
  out.push({ verb: 'HOLD', pos: empty.length ? empty[0] : { x: from.x, z: from.z } });
  return out.slice(0, 32);
}
