// e3-canyon-works controller v2, generation 103.
// Two cures over v1, both named by v1's own per-view table:
//  (1) the suffix gate LEAKED AT THE BOTTOM (rung 5 gated at its own 55, so a 25g beacon
//      fired at 60 gold). Cure: plan-time affordability -- emit the chain only when the
//      WHOLE remaining trip is funded, then let the suffix gates self-sequence it.
//  (2) the Prospector has no park order since ADR-005: it drifts to the HERO. With the hero
//      welded south at the claim and both seams 78wu north, every respawn gap walked the
//      worker 70wu home -> 0.54 g/s. Cure: walk the HERO through the ford into the north
//      gallery, so the drifting worker stays on the gold.

const PYLONS = [                       // tour order from the north seams, ending back at them
  { x: 28, z: 8 },                     // pylon-east-rim
  { x: 24, z: -20 },                   // pylon-east-switch
  { x: 12, z: -36 },                   // pylon-east-base
  { x: -12, z: -36 },                  // pylon-west-base
  { x: -24, z: -20 },                  // pylon-west-switch
  { x: -28, z: 8 },                    // pylon-west-rim
];
const BEACON_COSTS = [25, 30, 35, 45, 50, 55];
const SUFFIX = BEACON_COSTS.map((_, i) => BEACON_COSTS.slice(i).reduce((a, b) => a + b, 0));

// staged hero route south -> north through the single ford at x=0 (halfWidth 4).
// MOVE_HERO walks a STRAIGHT LINE with no pathfinder, so the river is crossed at x=0.
const POST = { x: -26, z: 20 };        // inside west-gallery (x -42..-16, z 7..40), ~12wu from both live seams
const GATES = [
  { x: 0, z: -24 },
  { x: 0, z: -8 },
  { x: 0, z: 10 },
  { x: -14, z: 14 },
  POST,
];

const RING = [
  { x: -26, z: 16 }, { x: -22, z: 20 }, { x: -30, z: 20 }, { x: -26, z: 24 },
  { x: -22, z: 16 }, { x: -30, z: 16 }, { x: -22, z: 24 }, { x: -30, z: 24 },
  { x: -18, z: 18 }, { x: -34, z: 18 }, { x: -26, z: 12 }, { x: -26, z: 28 },
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
  if (n.pendingSecure) return '\n';     // silence banks the default and cannot be REJECTED

  for (const rec of (n.orders || [])) {
    const o = rec.order || rec;
    if (o && o.verb === 'BUILD' && o.what === 'palisade' && rec.status === 'failed') {
      if (GROUND.test(String(rec.reason || rec.detail || '')) && o.where) ban.add(key(o.where));
    }
  }

  const out = [];
  const gold = n.gold ?? 0;
  const byKind = n.works?.byKind || {};
  const nBeacon = byKind.sentry_beacon || 0;
  const nPal = byKind.palisade || 0;
  const cc = n.canyonConnect || {};
  const chainDone = nBeacon >= 6 || cc.complete === true;
  const hx = n.hero?.x ?? 0, hz = n.hero?.z ?? -44;

  // --- 1. draft first, under replace semantics
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    if (best?.id) out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // --- 2. free supplementary damage; returns {} either way, safe above a traveller
  if ((n.blastReadyInMs ?? 1) === 0) {
    out.push({ verb: 'BLAST_AT', pos: { x: +hx.toFixed(2), z: +(hz + 4).toFixed(2) } });
  }

  // --- 3. hero ground. Emit only the waypoints AHEAD of the body, so a re-issued array
  //        never walks it back south. Above the builds while still travelling.
  const heroOrders = [];
  const atPost = Math.hypot(hx - POST.x, hz - POST.z) < 2.5;
  if (!atPost) {
    for (const g of GATES) {
      if (g === POST) { heroOrders.push({ verb: 'MOVE_HERO', pos: POST }); continue; }
      if (hz < g.z - 1.5) heroOrders.push({ verb: 'MOVE_HERO', pos: g });
    }
  }

  // --- 4. THE OBJECTIVE. Plan-time affordability: nothing is emitted until the whole
  //        remaining trip is paid for, which is what stops a cheap rung firing early.
  const chainOrders = [];
  if (!chainDone && gold >= SUFFIX[nBeacon]) {
    for (let i = nBeacon; i < 6; i++) {
      chainOrders.push({ verb: 'BUILD', what: 'sentry_beacon', where: PYLONS[i], when: { goldGte: SUFFIX[i] } });
    }
  }

  if (!atPost && !chainOrders.length) out.push(...heroOrders);
  out.push(...chainOrders);
  if (!atPost && chainOrders.length) out.push(...heroOrders);
  if (atPost) out.push({ verb: 'MOVE_HERO', pos: POST });   // completes instantly, falls through

  // --- 5. surplus sink, never allowed to delay the chain
  const spare = chainDone ? gold : gold - SUFFIX[nBeacon];
  if (spare >= 20 && nPal < RING.length) {
    const taken = (p) => (n.works?.entries || []).some(e => e.position &&
      Math.abs(e.position.x - p.x) < 1.2 && Math.abs(e.position.z - p.z) < 1.2);
    let e = 0;
    for (const p of RING) {
      if (e >= 4) break;
      if (ban.has(key(p)) || taken(p)) continue;
      out.push({ verb: 'BUILD', what: 'palisade', where: p, when: { goldGte: (chainDone ? 0 : SUFFIX[nBeacon]) + 10 * (e + 1) } });
      e++;
    }
  }

  if ((n.works?.wrecked ?? 0) > 0 && gold >= 20) out.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // --- 6. the tail IS the economy and the clock; never filtered to empty, finite coords only
  const seams = n.seams || [];
  const live = seams.filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const px = n.prospector?.x ?? hx, pz = n.prospector?.z ?? hz;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const ids = [];
  if (live[0]) for (let i = 0; i < 6; i++) ids.push(live[0].id);
  if (live[1]) for (let i = 0; i < 6; i++) ids.push(live[1].id);
  for (let r = 0; r < 3; r++) for (const s of seams) ids.push(s.id);
  for (const id of ids) { if (out.length >= 32) break; out.push({ verb: 'HARVEST', seam: id }); }

  return JSON.stringify(out.slice(0, 32)) + '\n';
}
