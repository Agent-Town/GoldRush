// e3-canyon-works controller v2
// tune-1 measured: the hero CANNOT cross the dam channel (UNREACHABLE_APPROACH at (0,4)) and it
// survives to the wave-20 ceiling parked on the south bank at z ~= -8. So: hero holds the bank,
// the Prospector (invulnerable, and it can cross) pans the north seams and tours the six pylon
// sites. Suffix-gated so the whole 240g chain lands in ONE descent before the wave-8 latch.
// Boss (wave 14, rail route 1, pursuitRange 0) walks down past three west pylon beacons.

const PYLONS = [
  { x: -28, z: 8 }, { x: -24, z: -20 }, { x: -12, z: -36 },
  { x: 12, z: -36 }, { x: 24, z: -20 }, { x: 28, z: 8 },
];
const LADDER = [25, 30, 35, 45, 50, 55];

// proven-walkable, proven-survivable posts (the hero physically stood at both in tune-1)
const POSTS = [{ x: 0, z: -8 }, { x: -13, z: -8 }];
const BOSS_POSTS = [{ x: -13, z: -26 }, { x: -13, z: -18 }];

const PLATE = /plating|dressing|vitality|hardy|tough|grit|bulwark/i;
const DPS = /spark|coil|resonator|fuse|split|volley|arc|charge|ring/i;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

let shuffle = 0;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null;      // blank line -> default 'bank', cheapest reel

  const o = [];
  const hero = { x: now.hero.x, z: now.hero.z };
  const wave = now.wave || 0;

  if (now.pendingOffer && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const c of now.pendingOffer) {
      const t = `${c.id} ${c.name} ${c.effectText || ''}`;
      const s = PLATE.test(t) ? 100 : DPS.test(t) ? 50 : 10;
      if (s > bs) { bs = s; best = c; }
    }
    o.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // free blast every ready window (returns {} either way, safe anywhere in the array)
  if (now.blastReadyInMs === 0) {
    o.push({ verb: 'BLAST_AT', pos: { x: +hero.x.toFixed(2), z: +(hero.z - 4).toFixed(2) } });
  }

  // --- the objective: six beacons on the pylon sites, whole chain funded before the first step
  const standing = (now.works.entries || []).filter(e => e.id === 'sentry_beacon' && !e.wrecked);
  const remain = PYLONS.filter(p => !standing.some(e => dist(e.position, p) < 2.4));
  const nBuilt = (now.works.byKind || {}).sentry_beacon || 0;
  const done = now.canyonConnect && now.canyonConnect.complete;
  if (remain.length && !done) {
    const prices = remain.map((_, k) => LADDER[Math.min(LADDER.length - 1, nBuilt + k)]);
    let suffix = prices.reduce((a, b) => a + b, 0);
    remain.forEach((p, k) => {
      o.push({ verb: 'BUILD', what: 'sentry_beacon', where: p, when: { goldGte: suffix } });
      suffix -= prices[k];
    });
  }

  // --- the hero: one short leg per view, below the builds so a tour is never interrupted
  const posts = wave >= 13 ? BOSS_POSTS : POSTS;
  const post = posts[(shuffle++) % posts.length];
  if (dist(hero, post) > 1) o.push({ verb: 'MOVE_HERO', pos: post });

  // --- the economy: drain one live seam in a block before walking to the next
  const live = (now.seams || []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const ids = live.length ? live.map(s => s.id) : ['gold-seam-1', 'gold-seam-2'];
  let k = 0;
  while (o.length < 32) {
    o.push({ verb: 'HARVEST', seam: ids[Math.floor(k / 6) % ids.length] });
    k++;
  }
  return o.slice(0, 32);
}
