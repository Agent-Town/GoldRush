// e3-canyon-works controller v3, generation 103 — the synthesis of what tune-1 and tune-2 proved.
//  tune-1 (hero welded at the claim, 0,-44): 0.54 g/s, hero dead at wave 5.
//  tune-2 (hero walked to the south riverbank, z=-8): hero SURVIVED to the wave-20 ceiling at
//         109/125 with zero works standing -- but its MOVE_HERO ladder kept re-issuing
//         unreachable north waypoints that stayed `active` and owned every tick, so the
//         Prospector never panned once: pan=0 across the whole 600 seconds.
//  MEASURED on era 6, confirming generation 80: the hero CANNOT cross the ford
//         (UNREACHABLE_APPROACH at x=0). The river is a hero wall and a Prospector door.
// v3: one MOVE_HERO target only, dropped the instant the hero is parked, so HARVEST owns the
//     tick; the post is the proven-safe riverbank, which also HALVES the drift the unemployed
//     Prospector makes toward the hero between seam respawns.

const PYLONS = [
  { x: 28, z: 8 },     // pylon-east-rim
  { x: 24, z: -20 },   // pylon-east-switch
  { x: 12, z: -36 },   // pylon-east-base
  { x: -12, z: -36 },  // pylon-west-base
  { x: -24, z: -20 },  // pylon-west-switch
  { x: -28, z: 8 },    // pylon-west-rim  (22.8wu from the live seams)
];
const BEACON_COSTS = [25, 30, 35, 45, 50, 55];                 // twist.economy.beaconLadder
const SUFFIX = BEACON_COSTS.map((_, i) => BEACON_COSTS.slice(i).reduce((a, b) => a + b, 0));

const POSTS = [{ x: -26, z: -8 }, { x: -14, z: -8 }, { x: 0, z: -8 }, { x: 0, z: -24 }];
let postIdx = 0;
let tick = 0;
// tune-2 measured it: a hero that KEEPS MOVING on the riverbank is never touched (84/100 flat
// for 450s under 62 enemies), a parked one at the same post dies at wave 5. Oscillate.
const KITE = [{ x: -26, z: -8 }, { x: -14, z: -8 }];

const RING = [
  { x: -26, z: -12 }, { x: -20, z: -12 }, { x: -30, z: -12 }, { x: -26, z: -16 },
  { x: -20, z: -16 }, { x: -30, z: -16 }, { x: -20, z: -20 }, { x: -29, z: -20 },
  { x: -16, z: -14 }, { x: -30, z: -24 }, { x: -24, z: -24 }, { x: -16, z: -20 },
];
const GROUND = /out_of_zone|out_of_reach|collision|unreachable|terrain|cap_reached|not legal/i;
const ban = new Set();
const key = (p) => `${p.x},${p.z}`;

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
  if (n.pendingSecure) return '\n';   // silence banks the default and cannot be REJECTED

  // read refusals: GROUND poisons the coordinate, ECONOMY poisons nothing
  for (const rec of (n.orders || [])) {
    const o = rec.order || rec;
    if (!o || rec.status !== 'failed') continue;
    const r = String(rec.reason || rec.detail || '');
    if (o.verb === 'BUILD' && o.what === 'palisade' && GROUND.test(r) && o.where) ban.add(key(o.where));
    if (o.verb === 'MOVE_HERO' && o.pos && postIdx < POSTS.length - 1 &&
        Math.abs(o.pos.x - POSTS[postIdx].x) < 0.01 && Math.abs(o.pos.z - POSTS[postIdx].z) < 0.01) postIdx++;
  }

  const out = [];
  const gold = n.gold ?? 0;
  const byKind = n.works?.byKind || {};
  const nBeacon = byKind.sentry_beacon || 0;
  const nPal = byKind.palisade || 0;
  const cc = n.canyonConnect || {};
  const chainDone = nBeacon >= 6 || cc.complete === true;
  const hx = n.hero?.x ?? 0, hz = n.hero?.z ?? -44;
  const P = POSTS[postIdx];
  const atPost = Math.hypot(hx - P.x, hz - P.z) < 2.0;

  // 1. draft first, under replace semantics
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    if (best?.id) out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage; returns {} either way, safe above a traveller
  if ((n.blastReadyInMs ?? 1) === 0) {
    out.push({ verb: 'BLAST_AT', pos: { x: +hx.toFixed(2), z: +(hz + 4).toFixed(2) } });
  }

  // 3. hero ground: exactly ONE target, emitted only while the body is off it.
  tick++;
  const kiting = postIdx === 0 && atPost;
  const kiteOrder = { verb: 'MOVE_HERO', pos: KITE[tick % 2] };
  // alternate the ARRAY SHAPE so neither job starves the other: odd views kite first,
  // even views pan first. A walking MOVE_HERO owns the tick, so it cannot sit above the
  // tail every view (that is what froze tune-2's purse at pan=0).
  const heroFirst = kiting && (tick % 2 === 1);
  if (!atPost) out.push({ verb: 'MOVE_HERO', pos: P });
  else if (heroFirst) out.push(kiteOrder);

  // 4. THE OBJECTIVE. Plan-time affordability -- nothing is emitted until the whole remaining
  //    trip is paid for, which is what stops a cheap rung firing early (tune-1's leak).
  //    All six land in ONE descent and the latch is one-way at or before wave 8.
  if (!chainDone && gold >= SUFFIX[nBeacon]) {
    for (let i = nBeacon; i < 6; i++) {
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: PYLONS[i], when: { goldGte: SUFFIX[i] } });
    }
  }

  // 5. surplus sink: the cheap unbounded blockade (no turret on a powerGrid map), never
  //    allowed to delay the chain.
  const spare = chainDone ? gold : gold - SUFFIX[nBeacon];
  if (spare >= 20 && nPal < RING.length) {
    const taken = (p) => (n.works?.entries || []).some(e => e.position &&
      Math.abs(e.position.x - p.x) < 1.2 && Math.abs(e.position.z - p.z) < 1.2);
    let e = 0;
    for (const p of RING) {
      if (e >= 4) break;
      if (ban.has(key(p)) || taken(p)) continue;
      out.push({ verb: 'BUILD', what: 'palisade', where: p,
                 when: { goldGte: (chainDone ? 0 : SUFFIX[nBeacon]) + 10 * (e + 1) } });
      e++;
    }
  }

  if ((n.works?.wrecked ?? 0) > 0 && gold >= 20) out.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 6. the tail IS the economy and the clock; never filtered to empty, finite coords only
  const seams = n.seams || [];
  const live = seams.filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const px = n.prospector?.x ?? hx, pz = n.prospector?.z ?? hz;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const ids = [];
  if (live[0]) for (let i = 0; i < 6; i++) ids.push(live[0].id);
  if (live[1]) for (let i = 0; i < 6; i++) ids.push(live[1].id);
  for (let r = 0; r < 4; r++) for (const s of seams) ids.push(s.id);
  for (const id of ids) { if (out.length >= 30) break; out.push({ verb: 'HARVEST', seam: id }); }
  if (kiting && !heroFirst) out.push(kiteOrder);

  return JSON.stringify(out.slice(0, 32)) + '\n';
}
