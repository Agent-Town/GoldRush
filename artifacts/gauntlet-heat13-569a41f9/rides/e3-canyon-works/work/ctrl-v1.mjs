// e3-canyon-works controller v1
// Plan: hero + Prospector go NORTH across the river to the west seams (behind a moat,
// 74wu from the southern spawn ring). Pan to 240g, then one southward tour builds all six
// pylon beacons (suffix-gated) before wave 8 latches the connect objective. Hero parks on
// rail route 1 so the wave-14 Rival Dynamo Crawler walks into its guns.

const PYLONS = [
  { x: -28, z: 8 },   // west rim
  { x: -24, z: -20 }, // west switch
  { x: -12, z: -36 }, // west base
  { x: 12, z: -36 },  // east base
  { x: 24, z: -20 },  // east switch
  { x: 28, z: 8 },    // east rim
];
const LADDER = [25, 30, 35, 45, 50, 55];

const HOME = { x: -30, z: 26 };          // on rail route 1, between the two west seams
const KITE = [                            // shuffle posts, all north bank near the seams
  { x: -36, z: 22 }, { x: -24, z: 32 }, { x: -34, z: 34 }, { x: -22, z: 22 },
];
const NORTH_PATH = [{ x: 0, z: -18 }, { x: 0, z: 4 }, { x: -14, z: 14 }, HOME];

const PLATE = /plating|dressing|vitality|hardy|tough|grit|bulwark/i;
const DPS = /spark|coil|resonator|fuse|split|volley|arc|charge/i;

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
let lastHp = null;
let kiteIx = 0;

export default function controller(view) {
  const now = view.now;
  const o = [];

  if (now.pendingSecure) return null; // blank line: default 'bank', keeps the reel small

  // 1. draft, plating first
  if (now.pendingOffer && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const c of now.pendingOffer) {
      const t = `${c.id} ${c.name} ${c.effectText || ''}`;
      const s = PLATE.test(t) ? 100 : DPS.test(t) ? 50 : 10;
      if (s > bs) { bs = s; best = c; }
    }
    o.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const hero = { x: now.hero.x, z: now.hero.z };

  // 2. free blast whenever ready, aimed just off the hero (safe anywhere: returns {})
  if (now.blastReadyInMs === 0) {
    o.push({ verb: 'BLAST_AT', pos: { x: +(hero.x).toFixed(2), z: +(hero.z + 3).toFixed(2) } });
  }

  // 3. transit: walk the hero north through the ford before anything else
  const north = hero.z > 12;
  if (!north) {
    for (const p of NORTH_PATH) o.push({ verb: 'MOVE_HERO', pos: p });
    // the Prospector drifts along behind; nothing else can run while it walks
    return o.slice(0, 32);
  }

  // 4. beacon tour — emit only when the WHOLE remaining chain is affordable (suffix gate)
  const standing = (now.works.entries || []).filter(e => e.id === 'sentry_beacon' && !e.wrecked);
  const built = PYLONS.map(p => standing.some(e => dist(e.position, p) < 2.4));
  const remainIx = PYLONS.map((_, i) => i).filter(i => !built[i]);
  const nBuilt = (now.works.byKind || {}).sentry_beacon || 0;
  if (remainIx.length) {
    // rung prices for the remaining builds, starting from the current count
    const prices = remainIx.map((_, k) => LADDER[Math.min(LADDER.length - 1, nBuilt + k)]);
    let suffix = prices.reduce((a, b) => a + b, 0);
    remainIx.forEach((pi, k) => {
      o.push({ verb: 'BUILD', what: 'sentry_beacon', where: PYLONS[pi], when: { goldGte: suffix } });
      suffix -= prices[k];
    });
  }

  // 5. interleaved kite + harvest tail
  const live = (now.seams || []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(a, HOME) - dist(b, HOME));
  const hurt = lastHp !== null && now.hero.hp < lastHp - 1;
  lastHp = now.hero.hp;

  const panBlock = hurt ? 2 : 4;
  const legs = hurt ? 4 : 2;
  const seamIds = live.length ? live.map(s => s.id) : ['gold-seam-1'];
  let si = 0;
  for (let L = 0; L < legs && o.length < 30; L++) {
    const post = L === 0 && dist(hero, HOME) > 3 ? HOME : KITE[(kiteIx++) % KITE.length];
    o.push({ verb: 'MOVE_HERO', pos: post });
    for (let p = 0; p < panBlock && o.length < 31; p++) {
      o.push({ verb: 'HARVEST', seam: seamIds[si % seamIds.length] });
      if ((p + 1) % 3 === 0) si++;
    }
  }
  // unconditional tail so the array can never drain to nothing
  while (o.length < 32) o.push({ verb: 'HARVEST', seam: seamIds[(si++) % seamIds.length] });

  return o.slice(0, 32);
}
