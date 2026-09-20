// e3-blackout-ridge controller. Pocket = ridge-line zone (x 8..34, z 20..40):
// hero start (24,30) and all three harvest anchors live inside it.
// No turret / lantern_post on this roster (twist.powerGrid filters them).

const HOME = [{ x: 24, z: 30 }, { x: 23, z: 29 }, { x: 25, z: 31 }, { x: 22, z: 32 }];

const LADDER = [
  { id: 'palisade', cost: 10, spots: [[30, 26], [31, 30], [30, 34]] },
  { id: 'palisade', cost: 10, spots: [[31, 30], [30, 34], [27, 37]] },
  { id: 'sentry_beacon', cost: 55, spots: [[28, 30], [24, 34], [20, 28], [28, 34], [26, 27]] },
  { id: 'palisade', cost: 10, spots: [[30, 34], [27, 37], [23, 37]] },
  { id: 'palisade', cost: 10, spots: [[27, 37], [23, 37], [19, 36]] },
  { id: 'sentry_beacon', cost: 75, spots: [[24, 34], [20, 28], [28, 34], [20, 32], [26, 27]] },
  { id: 'palisade', cost: 10, spots: [[23, 37], [19, 36], [16, 32]] },
  { id: 'palisade', cost: 10, spots: [[19, 36], [16, 32], [17, 27]] },
  { id: 'sentry_beacon', cost: 95, spots: [[20, 28], [28, 34], [20, 32], [26, 27], [22, 24]] },
  { id: 'stockpile', cost: 60, spots: [[22, 26], [26, 33], [21, 33], [27, 27]] },
  { id: 'stockpile', cost: 60, spots: [[26, 33], [21, 33], [27, 27], [22, 26]] },
  { id: 'palisade', cost: 10, spots: [[16, 32], [17, 27], [21, 23]] },
  { id: 'palisade', cost: 10, spots: [[17, 27], [21, 23], [26, 22]] },
  { id: 'palisade', cost: 10, spots: [[21, 23], [26, 22], [32, 22]] },
  { id: 'palisade', cost: 10, spots: [[26, 22], [32, 22], [33, 38]] },
  { id: 'palisade', cost: 10, spots: [[32, 22], [33, 38], [13, 30]] },
];

const STOP_BUILD_AT = 300; // secure at 360s; let the purse refill for the row
const GROUND = /out_of_zone|collision|out_of_reach|cap_reached|UNREACHABLE|terrain|not legal/i;

function scoreUpgrade(o) {
  const s = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let v = 0;
  if (/plating|armou?r|tough|vital|hearty|hardy/.test(s)) v += 100;
  if (/max ?hp|maximum health|max health/.test(s)) v += 90;
  if (/dressing|regen|heal|mend|recover|field/.test(s)) v += 60;
  if (/spark|damage|coil|tap|volley|blast|rig|shot/.test(s)) v += 40;
  if (/range|fire rate|cooldown|reload/.test(s)) v += 20;
  if (/pan|gold|luck|prospect|heel|speed|seam/.test(s)) v -= 15;
  return v;
}

export function makeController() {
  const built = new Array(LADDER.length).fill(false);
  const dead = new Set(); // poisoned "id@x,z"
  let homeIdx = 0;

  return function controller(view) {
    const now = view.now;

    // secure boundary: silence only. A rejected array here burns the choice clock.
    if (now.pendingSecure) return null;

    // learn from refusals
    for (const rec of now.orders || []) {
      const o = rec.order || rec;
      const reason = String(rec.reason || rec.detail || '');
      if (rec.status !== 'failed') continue;
      if (o.verb === 'BUILD' && o.where && GROUND.test(reason)) {
        dead.add(`${o.what}@${o.where.x},${o.where.z}`);
      }
      if (o.verb === 'MOVE_HERO' && /UNREACHABLE_TERRAIN/.test(reason)) {
        homeIdx = Math.min(homeIdx + 1, HOME.length - 1);
      }
    }

    // reconcile what actually stands
    const byKind = (now.works && now.works.byKind) || {};
    const standing = { ...byKind };
    standing.sentry_beacon = Math.max(0, (standing.sentry_beacon || 0) - 3); // three pre-placed trunk frames
    standing.lantern_post = 0;
    const wantCount = {};
    for (let i = 0; i < LADDER.length; i++) {
      const r = LADDER[i];
      wantCount[r.id] = (wantCount[r.id] || 0) + 1;
      if (!built[i] && (standing[r.id] || 0) >= wantCount[r.id]) built[i] = true;
    }

    const orders = [];

    // 1. draft first (replace semantics: the pick owns the tick, everything else is resent under it)
    if (now.pendingOffer && now.pendingOffer.length) {
      let best = now.pendingOffer[0], bs = -1e9;
      for (const o of now.pendingOffer) { const s = scoreUpgrade(o); if (s > bs) { bs = s; best = o; } }
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    const hero = now.hero || { x: 24, z: 30 };

    // 2. free damage window (returns {} either way, safe above the traveller)
    if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: hero.x + 2, z: hero.z + 2 } });

    // 3. knockback correction — emitted once, dropped when parked
    const home = HOME[homeIdx];
    const dh = Math.hypot(hero.x - home.x, hero.z - home.z);
    if (dh > 1.0) orders.push({ verb: 'MOVE_HERO', pos: home });

    // 4. mend: bounded to the rig radius since ADR-005, so it never walks the map
    orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

    // 5. ladder: next unbuilt rungs, cumulatively gated so a cheap rung cannot
    //    steal gold an expensive one is waiting for. Hard stop before the bank.
    const t = (now.timers && now.timers.runSeconds) || 0;
    if (t < STOP_BUILD_AT) {
      let cum = 0, emitted = 0;
      for (let i = 0; i < LADDER.length && emitted < 4; i++) {
        if (built[i]) continue;
        const r = LADDER[i];
        const spot = r.spots.find((s) => !dead.has(`${r.id}@${s[0]},${s[1]}`));
        if (!spot) { built[i] = true; continue; } // rung out of ground: retire it, never stall behind it
        cum += r.cost;
        orders.push({ verb: 'BUILD', what: r.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: cum } });
        emitted++;
      }
    }

    // 6. the tail: drain the nearest live seam in a block before walking to the next.
    //    Inactive seams publish null coordinates — one non-finite number refuses the whole array.
    const pros = now.prospector || hero;
    const live = (now.seams || [])
      .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
      .map((s) => ({ ...s, d: Math.hypot(s.x - pros.x, s.z - pros.z) }))
      .sort((a, b) => a.d - b.d);
    const slots = 31 - orders.length;
    const block = 7;
    for (let k = 0; k < slots; k++) {
      const s = live[Math.floor(k / block) % Math.max(1, live.length)];
      if (!s) break;
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
    // terminal anchor that cannot be filtered away
    if (orders.length === 0) orders.push({ verb: 'MOVE_HERO', pos: home });

    return orders.slice(0, 32);
  };
}
