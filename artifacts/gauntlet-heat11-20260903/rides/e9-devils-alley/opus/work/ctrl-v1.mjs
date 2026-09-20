// e9-devils-alley controller v1.
// Map: claim (0,12). Hero welded there. Only build ground near it is `center-anchor-bay`
// (x -10..10, z -8..8). Dust-devil corridors sweep z=-26/0/+26 with column radius 4, but a work
// inside anchor-center's hold (circle r8 at (0,0)) is NEVER lifted. So every coordinate below
// satisfies x^2+z^2 <= 64 -> relocation-proof by construction, and still inside turret range 16
// of the claim.
// Secure: twist declares no secureWave -> Balance.run.secureWave = 20 (t=600s).

const SECURE_MODE = process.env.GR_SECURE_MODE || 'explicit'; // 'explicit' | 'silent'

// Ladder: (kind, x, z). Ordered by value. Extra candidates past the cap so a refused
// coordinate is skipped rather than parking the ladder (gen-10/14 lesson).
const TURRETS = [
  [0, 8], [-6, 5], [6, 5], [0, 2],
  [-3, 7], [3, 7], [-7, 2], [7, 2], [0, -5], [-5, -4], [5, -4],
];
const BEACONS = [
  [-3, 7], [3, 7], [-7, 2], [7, 2], [-4, -3], [4, -3],
  [0, -6], [-8, 0], [8, 0], [0, 5], [-6, -6], [6, -6], [-9, 3], [9, 3],
];
const TCOST = [50, 70, 95, 125];
const BCOST = [25, 35, 45, 55, 75, 95];

// Priority interleave: turrets lead (57dps/50g beats a beacon's ~30dps/25g), but the first two
// cheap beacons ride early because the slow field is what keeps the hero alive in waves 2-5.
const PLAN = [
  { k: 'turret', i: 0 }, { k: 'sentry_beacon', i: 0 }, { k: 'turret', i: 1 },
  { k: 'sentry_beacon', i: 1 }, { k: 'turret', i: 2 }, { k: 'sentry_beacon', i: 2 },
  { k: 'turret', i: 3 }, { k: 'sentry_beacon', i: 3 }, { k: 'sentry_beacon', i: 4 },
  { k: 'sentry_beacon', i: 5 },
];

const PLATING = /plating|armor|armour|vitality|hearty|hp|health|tough|constitution/i;
const DAMAGE = /spark|damage|coil|tap|power|volley|heavy/i;

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || ''));
  if (PLATING.test(s)) return 3;
  if (DAMAGE.test(s)) return 2;
  return 1;
}

export default function controller(view) {
  const n = view.now;

  // A secure boundary accepts exactly one SECURE_CHOICE and nothing else.
  if (n.pendingSecure) {
    if (SECURE_MODE === 'silent') return '';       // blank line: no tape entry recorded
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }

  const orders = [];

  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // --- build ladder: emit only what is affordable at plan time (gen-17/28) ---
  const byKind = (n.works && n.works.byKind) || {};
  const entries = (n.works && n.works.entries) || [];
  const used = new Set(entries.filter((e) => !e.wrecked)
    .map((e) => `${e.id}:${Math.round(e.position.x)},${Math.round(e.position.z)}`));
  const haveT = byKind.turret || 0;
  const haveB = byKind.sentry_beacon || 0;
  let gold = n.gold || 0;
  let nT = haveT, nB = haveB;
  const builds = [];
  for (const step of PLAN) {
    if (step.k === 'turret') {
      if (step.i < haveT) continue;
      if (nT >= 4) continue;
      const cost = TCOST[nT];
      if (gold < cost) break;
      // first unoccupied candidate at or after this rung
      const spot = TURRETS.find((p) => !used.has(`turret:${p[0]},${p[1]}`));
      if (!spot) continue;
      used.add(`turret:${spot[0]},${spot[1]}`);
      builds.push({ verb: 'BUILD', what: 'turret', where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } });
      gold -= cost; nT += 1;
    } else {
      if (step.i < haveB) continue;
      if (nB >= 6) continue;
      const cost = BCOST[nB];
      if (gold < cost) break;
      const spot = BEACONS.find((p) => !used.has(`sentry_beacon:${p[0]},${p[1]}`)
        && !used.has(`turret:${p[0]},${p[1]}`));
      if (!spot) continue;
      used.add(`sentry_beacon:${spot[0]},${spot[1]}`);
      builds.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } });
      gold -= cost; nB += 1;
    }
  }
  orders.push(...builds);

  // --- economy: stack HARVEST on the nearest live seams to the claim ---
  const seams = (n.seams || []).filter((s) => s.active !== false);
  const px = (n.prospector && n.prospector.x) || 0;
  const pz = (n.prospector && n.prospector.z) || 12;
  const ranked = seams.slice().sort((a, b) =>
    Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const room = 32 - orders.length;
  if (ranked.length && room > 0) {
    // 6 pans empties a 30-capacity seam; two seams deep, then round-robin the tail.
    const chain = [];
    for (let k = 0; k < 6; k++) chain.push(ranked[0].id);
    if (ranked[1]) for (let k = 0; k < 6; k++) chain.push(ranked[1].id);
    if (ranked[2]) for (let k = 0; k < 6; k++) chain.push(ranked[2].id);
    if (ranked[3]) for (let k = 0; k < 6; k++) chain.push(ranked[3].id);
    for (let k = 0; k < room && k < chain.length; k++) {
      orders.push({ verb: 'HARVEST', seam: chain[k] });
    }
  }
  return orders.slice(0, 32);
}
