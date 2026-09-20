// e3-canyon-works controller, generation 103.
// Skeleton (gen 6 -> 102) + the one thing this board does differently:
//   the six pylon beacons are the secure gate, suffix-gated so all six land in ONE descent.

const PYLONS = [                      // tour order: west chain down, east chain up, ending near the seams
  { x: -12, z: -36 },                 // pylon-west-base
  { x: -24, z: -20 },                 // pylon-west-switch
  { x: 12, z: -36 },                  // pylon-east-base
  { x: 24, z: -20 },                  // pylon-east-switch
  { x: 28, z: 8 },                    // pylon-east-rim
  { x: -28, z: 8 },                   // pylon-west-rim  (22.8wu from the live seams)
];
const BEACON_COSTS = [25, 30, 35, 45, 50, 55];   // twist.economy.beaconLadder
const CHAIN_TOTAL = 240;

// suffix sums: nothing starts until the whole trip is funded, then it self-sequences
const SUFFIX = BEACON_COSTS.map((_, i) => BEACON_COSTS.slice(i).reduce((a, b) => a + b, 0));

// palisade ring on the claim, inside sub-hall-yard (x -36..36, z -52..-28)
const RING = [
  { x: 0, z: -38 }, { x: 5, z: -40 }, { x: -5, z: -40 }, { x: 6, z: -44 }, { x: -6, z: -44 },
  { x: 5, z: -48 }, { x: -5, z: -48 }, { x: 0, z: -50 }, { x: 10, z: -41 }, { x: -10, z: -41 },
  { x: 10, z: -47 }, { x: -10, z: -47 }, { x: 0, z: -34 }, { x: 12, z: -44 }, { x: -12, z: -44 },
  { x: 8, z: -36 }, { x: -8, z: -36 }, { x: 8, z: -52 }, { x: -8, z: -52 },
];
const HERO_POSTS = [{ x: 0, z: -44 }, { x: 0, z: -34 }];

const GROUND = /out_of_zone|out_of_reach|collision|unreachable|terrain|cap_reached|not legal/i;

const ban = new Set();          // poisoned palisade coordinates (GROUND refusals only)
let shuffle = 0;

function key(p) { return `${p.x},${p.z}`; }

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|armou?r|max health|maxhp|vitality|tough|hearty/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
  if (/health|hp\b/.test(s)) v += 40;
  if (/damage|spark|coil|tap|power|blast/.test(s)) v += 25;
  if (/rate|fire|reload|cooldown/.test(s)) v += 20;
  if (/range|reach/.test(s)) v += 10;
  if (/gold|pan|luck|seam/.test(s)) v += 5;
  return v;
}

export default function controller(view) {
  const n = view.now || {};

  // 1. secure window: silence. It banks the default, cannot be REJECTED (a rejected
  //    submission inside the choice window is invisible to the tape and visible to the
  //    sim, so the replay diverges), and keeps the last order inside the envelope.
  if (n.pendingSecure) return '\n';

  // harvest refusals are free; only poison ground for BUILD coordinates
  for (const rec of (n.orders || [])) {
    const o = rec.order || rec;
    if (o && o.verb === 'BUILD' && o.what === 'palisade' && rec.status === 'failed') {
      const r = String(rec.reason || rec.detail || '');
      if (GROUND.test(r) && o.where) ban.add(key(o.where));
    }
  }

  const out = [];
  const gold = n.gold ?? 0;
  const byKind = n.works?.byKind || {};
  const nBeacon = byKind.sentry_beacon || 0;
  const nPal = byKind.palisade || 0;
  const cc = n.canyonConnect || {};
  const chainDone = nBeacon >= 6 || cc.complete === true;

  // 2. draft first, under replace semantics; plating-first scorer
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    if (best?.id) out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. free supplementary damage; returns {} on success AND failure, safe above a traveller
  if ((n.blastReadyInMs ?? 1) === 0 && Number.isFinite(n.hero?.x)) {
    out.push({ verb: 'BLAST_AT', pos: { x: +(n.hero.x).toFixed(2), z: +(n.hero.z + 4).toFixed(2) } });
  }

  // 4. THE OBJECTIVE. Six beacons, suffix-gated -> one descent, one trip, self-sequencing.
  //    The latch is one-way at the deadline, so this outranks everything but the draft.
  if (!chainDone) {
    for (let i = nBeacon; i < 6; i++) {
      out.push({
        verb: 'BUILD', what: 'sentry_beacon',
        where: PYLONS[i], when: { goldGte: SUFFIX[i] },
      });
    }
  }

  // 5. surplus sink: the cheap unbounded blockade on the claim (no turret on a powerGrid map).
  //    Only once the chain is funded-and-placed, so a 10g rung can never starve the 240g trip.
  if (chainDone && nPal < RING.length) {
    const spots = RING.filter(p => !ban.has(key(p)));
    let emitted = 0;
    for (let i = 0; i < spots.length && emitted < 5; i++) {
      // skip spots that already carry a work
      const taken = (n.works?.entries || []).some(e =>
        e.position && Math.abs(e.position.x - spots[i].x) < 1.2 && Math.abs(e.position.z - spots[i].z) < 1.2);
      if (taken) continue;
      out.push({ verb: 'BUILD', what: 'palisade', where: spots[i], when: { goldGte: 10 * (emitted + 1) } });
      emitted++;
    }
  }

  // 6. mend: bounded to the rig radius around the Prospector since ADR-005, so it cannot
  //    walk the worker off the map. Ungated except by gold.
  if ((n.works?.wrecked ?? 0) > 0 && gold >= 15) out.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 7. hero ground. Below the builds so the objective tour is never blocked, unless the
  //    hero has been knocked well off its post.
  const hx = n.hero?.x, hz = n.hero?.z;
  const post = HERO_POSTS[shuffle % HERO_POSTS.length];
  shuffle++;
  const far = Number.isFinite(hx) ? Math.hypot(hx - post.x, hz - post.z) : 0;
  const moveOrder = { verb: 'MOVE_HERO', pos: post };
  if (far > 14) out.splice(2, 0, moveOrder); else out.push(moveOrder);

  // 8. the tail IS the economy and the clock. Never filtered to empty; finite coords only;
  //    blocks on the nearest live seam, then every id so re-anchored gold is still named.
  const seams = (n.seams || []);
  const live = seams.filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const px = n.prospector?.x ?? 0, pz = n.prospector?.z ?? 0;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const ids = [];
  if (live[0]) for (let i = 0; i < 6; i++) ids.push(live[0].id);
  if (live[1]) for (let i = 0; i < 6; i++) ids.push(live[1].id);
  for (const s of seams) ids.push(s.id);
  for (const s of seams) ids.push(s.id);
  if (!ids.length) ids.push('gold-seam-1', 'gold-seam-2', 'gold-seam-3', 'gold-seam-4');
  for (const id of ids) {
    if (out.length >= 32) break;
    out.push({ verb: 'HARVEST', seam: id });
  }

  return JSON.stringify(out.slice(0, 32)) + '\n';
}
