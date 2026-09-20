// e10-last-claim controller v1 — THE BOX.
// Finding: HeadlessContractSim:1475 `nearestBuilding: () => this.preserve?.active ? this.preserve : ...`
// Every wrecker walks straight at the warm vent (0,50); my own works cannot bait them.
// Wreckers do NOT gap-flow around palisades (Enemy.ts:686 excludes wreckers) but ARE
// physically blocked by them (resolveBlocker). A CLOSED palisade box around the vent is a
// permanent shutout: they slide along the wall forever and never come within reach 1.1.
// Only `unraveled_machine` (wrecker) can damage the preserve; static motes chase the hero.

const PAL = [
  // south wall first (main approach), then flanks, then north
  { x: 0, z: 47, r: 1 },
  { x: -3, z: 47, r: 1 },
  { x: 3, z: 47, r: 1 },
  { x: -4, z: 49, r: 0 },
  { x: 4, z: 49, r: 0 },
  { x: -4, z: 51, r: 0 },
  { x: 4, z: 51, r: 0 },
  { x: 0, z: 53, r: 1 },
  { x: -3, z: 53, r: 1 },
  { x: 3, z: 53, r: 1 },
];

const TURRETS = [
  { x: -6, z: 45, cost: 50 },
  { x: 6, z: 45, cost: 70 },
  { x: -10, z: 44, cost: 95 },
  { x: 10, z: 44, cost: 125 },
];

function scoreOffer(o) {
  const t = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let s = 0;
  if (/plating|health|hp|vitality|tough|armor|armour/.test(t)) s += 100;
  if (/heal|regen|dressing/.test(t)) s += 40;
  if (/damage|spark|coil|tap|power|bolt/.test(t)) s += 30;
  if (/rate|speed|fire/.test(t)) s += 20;
  if (/range/.test(t)) s += 10;
  return s;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    let best = now.pendingOffer[0];
    let bs = -1;
    for (const o of now.pendingOffer) { const s = scoreOffer(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const entries = (now.works && now.works.entries) || [];
  const placed = entries.filter((e) => !e.wrecked || e.wrecked === false);
  const has = (site, kind) => entries.some((e) => (e.id === kind || e.family === kind)
    && e.position && dist(e.position, site) < 0.9);

  // --- palisade box, suffix-sum gated so one trip home buys the whole remaining batch
  const missing = PAL.filter((p) => !has(p, 'palisade'));
  const nMiss = missing.length;
  missing.forEach((p, i) => {
    orders.push({
      verb: 'BUILD', what: 'palisade', where: { x: p.x, z: p.z },
      when: { goldGte: 10 * (nMiss - i) }, rotationSteps: p.r,
    });
  });

  // --- turrets only once the box is closed
  if (nMiss === 0) {
    const missT = TURRETS.filter((t) => !has(t, 'turret'));
    let suffix = 0;
    const gates = missT.map((t) => (suffix += t.cost));
    missT.forEach((t, i) => {
      orders.push({
        verb: 'BUILD', what: 'turret', where: { x: t.x, z: t.z },
        when: { goldGte: gates[gates.length - 1] - (i > 0 ? gates[i - 1] : 0) },
      });
    });
  }

  // --- economy: chain the two nearest live seams, stacked
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  const pros = now.prospector || { x: 0, z: 50 };
  live.sort((a, b) => dist(a, pros) - dist(b, pros));
  const budget = 31 - orders.length;
  if (live.length) {
    const chain = [];
    const a = live[0], b = live[1] || live[0];
    while (chain.length < budget) {
      for (let i = 0; i < 6 && chain.length < budget; i++) chain.push({ verb: 'HARVEST', seam: a.id });
      for (let i = 0; i < 6 && chain.length < budget; i++) chain.push({ verb: 'HARVEST', seam: b.id });
    }
    orders.push(...chain);
  } else {
    orders.push({ verb: 'HOLD', pos: { x: -6, z: 46 } });
  }
  void placed;
  return orders.slice(0, 32);
}
