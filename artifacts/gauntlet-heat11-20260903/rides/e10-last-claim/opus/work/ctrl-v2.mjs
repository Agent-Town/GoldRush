// e10-last-claim controller v2 — THE TIGHT BOX (60 gold).
// Only `unraveled_machine` (wrecker, waveMin 2) can damage the warm vent; HeadlessContractSim:1475
// hard-wires every wrecker's target to the preserve, so no work of mine can bait them away.
// Wreckers do not gap-flow (Enemy.ts:686) but ARE physically stopped by palisade blockers
// (Enemy.resolveBlocker), so a closed 6-palisade ring at |x|<=2, 47<=z<=53 keeps them
// >2.2wu from a vent whose swing reach is 1.1 — a permanent shutout for 60 gold.
// v1 lesson: palisade collision is a FOOTPRINT-OVERLAP test, and a suffix gate lets the
// cheapest (last) rung fire at 10 gold and burn the run in one-palisade commutes.

// rot 0 => halfX 0.5, halfZ 1.5 (long in z).  rot 1 => halfX 1.5, halfZ 0.5 (long in x).
const PAL = [
  { x: 0, z: 47, r: 1 },     // south face
  { x: -2, z: 48.5, r: 0 },  // west lower
  { x: 2, z: 48.5, r: 0 },   // east lower
  { x: -2, z: 51.5, r: 0 },  // west upper
  { x: 2, z: 51.5, r: 0 },   // east upper
  { x: 0, z: 53, r: 1 },     // north face
];
const PAL_COST = 10;

const TURRETS = [
  { x: -10, z: 46, cost: 50 },
  { x: -14, z: 49, cost: 70 },
  { x: -6, z: 45, cost: 95 },
  { x: -14, z: 53, cost: 125 },
];

function scoreOffer(o) {
  const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let s = 0;
  if (/plating|health|hp|vitality|tough|armor|armour/.test(t)) s += 100;
  if (/heal|regen|dressing/.test(t)) s += 40;
  if (/damage|spark|coil|tap|bolt/.test(t)) s += 30;
  if (/rate|fire/.test(t)) s += 20;
  return s;
}
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const o of now.pendingOffer) { const s = scoreOffer(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const entries = (now.works && now.works.entries) || [];
  const standing = (site, kind) => entries.some(
    (e) => e.id === kind && !e.wrecked && e.position && dist(e.position, site) < 0.9);

  const gold = now.gold || 0;
  const missing = PAL.filter((p) => !standing(p, 'palisade'));

  // Emit only builds affordable RIGHT NOW (plan-time affordability), suffix-gated so the
  // whole affordable batch lands on one trip home instead of one palisade per commute.
  const k = Math.min(missing.length, Math.floor(gold / PAL_COST));
  const batch = missing.slice(0, k);
  batch.forEach((p, i) => {
    orders.push({
      verb: 'BUILD', what: 'palisade', where: { x: p.x, z: p.z },
      when: { goldGte: PAL_COST * (batch.length - i) }, rotationSteps: p.r,
    });
  });

  if (missing.length === 0) {
    const missT = TURRETS.filter((t) => !standing(t, 'turret'));
    let acc = 0;
    const affordable = [];
    for (const t of missT) { if (acc + t.cost <= gold) { acc += t.cost; affordable.push(t); } else break; }
    let suffix = affordable.reduce((s, t) => s + t.cost, 0);
    for (const t of affordable) {
      orders.push({ verb: 'BUILD', what: 'turret', where: { x: t.x, z: t.z }, when: { goldGte: suffix } });
      suffix -= t.cost;
    }
    orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
  }

  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  const pros = now.prospector || { x: 0, z: 50 };
  live.sort((a, b) => dist(a, pros) - dist(b, pros));
  const budget = 31 - orders.length;
  if (live.length && budget > 0) {
    const a = live[0], b = live[1] || live[0];
    const chain = [];
    while (chain.length < budget) {
      for (let i = 0; i < 6 && chain.length < budget; i++) chain.push({ verb: 'HARVEST', seam: a.id });
      for (let i = 0; i < 6 && chain.length < budget; i++) chain.push({ verb: 'HARVEST', seam: b.id });
    }
    orders.push(...chain);
  } else {
    orders.push({ verb: 'HOLD', pos: { x: -8, z: 47 } });
  }
  return orders.slice(0, 32);
}
