// v2: does the distant relay-site build ground do anything for a welded hero?
import { pickUpgrade } from './ctrl-v1.mjs';

// Closest legal points to the claim (0,12): zones r2 (x -30..-20) and r3 (x 20..30), z 36..46.
const LADDER = [
  { what: 'turret', where: { x: 20, z: 36 }, price: 50 },
  { what: 'turret', where: { x: -20, z: 36 }, price: 70 },
  { what: 'turret', where: { x: 24, z: 36 }, price: 95 },
  { what: 'turret', where: { x: -24, z: 36 }, price: 125 },
  { what: 'sentry_beacon', where: { x: 22, z: 36 }, price: 25 },
  { what: 'sentry_beacon', where: { x: -22, z: 36 }, price: 35 },
  { what: 'sentry_beacon', where: { x: 26, z: 36 }, price: 45 },
  { what: 'sentry_beacon', where: { x: -26, z: 36 }, price: 55 },
  { what: 'sentry_beacon', where: { x: 28, z: 38 }, price: 75 },
  { what: 'sentry_beacon', where: { x: -28, z: 38 }, price: 95 },
];

export default function controller(view, state) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const o = [];
  const pick = pickUpgrade(now);
  if (pick) o.push({ verb: 'PICK_UPGRADE', id: pick });
  o.push({ verb: 'SET_WEAPON', weapon: 'rig' });

  // Build ladder: one affordable rung per view, chosen from what is actually standing.
  const built = now.works.byKind || {};
  const nT = built.turret || 0, nB = built.sentry_beacon || 0;
  let done = 0;
  for (const r of LADDER) {
    const have = r.what === 'turret' ? nT : nB;
    const idx = LADDER.filter((x) => x.what === r.what).indexOf(r);
    if (idx < have) { done++; continue; }
    if (now.gold >= r.price) o.push({ verb: 'BUILD', what: r.what, where: r.where, when: { goldGte: r.price } });
    break;
  }

  const hx = now.hero.x, hz = now.hero.z;
  const ring = [[0, 0], [0, 3], [3, 0], [0, -3], [-3, 0], [2, 2], [-2, 2], [2, -2], [-2, -2]];
  for (const [dx, dz] of ring) o.push({ verb: 'BLAST_AT', pos: { x: hx + dx, z: hz + dz } });

  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (live.length) {
    const px = now.prospector.x, pz = now.prospector.z;
    live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
    const n = Math.max(0, 31 - o.length);
    for (let i = 0; i < n; i++) o.push({ verb: 'HARVEST', seam: live[0].id });
  }
  return o.slice(0, 32);
}
