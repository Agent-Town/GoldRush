// e4-boneyard controller — gen-127
// Two-leg tow errand (hero aims HAUL; the hulk's landmark blocker forces a standoff ladder),
// then camp fort + far-seam economy. Gold caps at 200 (no stockpile: claimGold only pays a
// stockpile holding, so a till is the sole switch that arms this thief-only roster).

const HULK = { x: -18, z: -8 };
const CORRIDOR_START = { x: -8, z: -38 };
const TAR = [{ x: 12, z: -8 }, { x: 0, z: -8 }, { x: -12, z: -8 }];
const POST = { x: -2, z: -42 };
const POST_ALTS = [POST, { x: -4, z: -41 }, { x: 2, z: -43 }, { x: -6, z: -42 }];

// walkable ring around the hulk: blocked where |dx|<2.333 AND |dz|<1.759 (footprint 3.895x2.621
// at scale 0.9 => half 1.753x1.179, padded by hero radius 0.5 + 0.08). Need dist <= 2.5 for
// MOTOR_STOP_REACH. The north/south band is ~0.74 thick; east/west is only 0.167.
const STANDOFF = [
  { x: -18, z: -10.1 }, { x: -17.3, z: -10.15 }, { x: -18.7, z: -10.15 },
  { x: -18, z: -5.9 }, { x: -17.3, z: -5.85 }, { x: -18.7, z: -5.85 },
  { x: -18, z: -10.35 },
];
const DELIVER = [
  { x: -8, z: -38 }, { x: -8.6, z: -37.4 }, { x: -7.4, z: -38.6 }, { x: -9.2, z: -38 },
];

const LADDER = [
  { id: 'turret', spots: [{ x: -6, z: -41 }, { x: 4, z: -41 }, { x: -9, z: -43 }] },
  { id: 'turret', spots: [{ x: 4, z: -41 }, { x: -6, z: -45 }, { x: 7, z: -43 }] },
  { id: 'sentry_beacon', spots: [{ x: -2, z: -45 }, { x: -5, z: -44 }, { x: 1, z: -44 }] },
  { id: 'turret', spots: [{ x: -6, z: -45 }, { x: 4, z: -45 }, { x: -11, z: -41 }] },
  { id: 'sentry_beacon', spots: [{ x: 1, z: -40 }, { x: -5, z: -40 }, { x: 3, z: -44 }] },
  { id: 'turret', spots: [{ x: 4, z: -45 }, { x: -11, z: -45 }, { x: 9, z: -41 }] },
  { id: 'sentry_beacon', spots: [{ x: -5, z: -44 }, { x: 2, z: -42 }, { x: -1, z: -46 }] },
];
const HARD_BUILD_STOP = 230;   // purse must refill to the 200 cap by t=360

const badSpot = new Set();     // GROUND refusals only (never insufficient_gold)
let heroIdx = 0, delivIdx = 0, postIdx = 0;
let lastSig = null, lastSubT = -99;

function score(u) {
  const s = ((u.name || '') + ' ' + (u.effectText || '') + ' ' + u.id).toLowerCase();
  if (/plating|armou?r|max hp|maxhp|vitality|tough/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
  if (/damage|spark|coil|tap|power|bolt/.test(s)) return 60;
  if (/rate|speed|reload|haste/.test(s)) return 50;
  return 10;
}

function costOf(sp, id, standing) {
  const b = (sp.mechanics?.buildables ?? []).find((x) => x.id === id);
  if (!b) return null;
  const arr = b.costs ?? [];
  if (standing >= (b.maxCount ?? 99)) return null;
  const c = arr[Math.min(standing, arr.length - 1)];
  return Number.isFinite(c) ? c : null;
}

export default function controller(view) {
  const now = view.now, sp = view.stablePrefix;
  const t = now.timers?.runSeconds ?? 0;

  // secure boundary: silence. Takes the bank default, cannot be rejected, keeps the reel clean.
  if (now.pendingSecure) return null;

  const out = [];
  if (now.pendingOffer?.length) {
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const mo = now.motor?.objective ?? {};
  const arrived = mo.arrived === true;
  const hitched = mo.hitched === true;

  // ---- record GROUND refusals (never ECONOMY) -------------------------------
  for (const r of now.orders ?? []) {
    if (r.status !== 'failed') continue;
    const why = (r.reason || '') + ' ' + (r.detail || '');
    const o = r.order || {};
    if (o.verb === 'BUILD' && o.where && /out_of_zone|collision|cap_reached|UNREACHABLE|terrain/i.test(why)) {
      badSpot.add(`${o.where.x},${o.where.z}`);
    }
    if (o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(why)) {
      const p = o.pos || {};
      if (!arrived && !hitched && Math.abs(p.z + 10.1) < 5 && Math.abs(p.x + 18) < 3) heroIdx++;
      else if (!arrived && hitched) delivIdx++;
      else postIdx++;
    }
  }

  // ---- phase A/B: the errand ------------------------------------------------
  if (!arrived) {
    if (!hitched) {
      const nodes = now.motor?.fuel?.nodes ?? [];
      TAR.forEach((n, i) => {
        if (nodes[i]?.harvested) return;
        out.push({ verb: 'MOVE_HERO', pos: { x: n.x, z: n.z } });
        out.push({ verb: 'MOVE_HERO', pos: { x: n.x, z: n.z - 1.1 } });
        out.push({ verb: 'MOVE_HERO', pos: { x: n.x, z: n.z + 1.0 } });
      });
      for (let i = heroIdx; i < Math.min(heroIdx + 4, STANDOFF.length); i++) {
        out.push({ verb: 'MOVE_HERO', pos: STANDOFF[i] });
      }
      out.push({ verb: 'HAUL' });
    } else {
      for (let i = delivIdx; i < Math.min(delivIdx + 3, DELIVER.length); i++) {
        out.push({ verb: 'MOVE_HERO', pos: DELIVER[i] });
      }
      out.push({ verb: 'HAUL' });
    }
  } else {
    // ---- phase C: post + fort ---------------------------------------------
    const h = now.hero;
    const post = POST_ALTS[Math.min(postIdx, POST_ALTS.length - 1)];
    if (h && Math.hypot(h.x - post.x, h.z - post.z) > 1.0) {
      out.push({ verb: 'MOVE_HERO', pos: post });
    }
    if (now.blastReadyInMs === 0 && h) {
      out.push({ verb: 'BLAST_AT', pos: { x: post.x, z: post.z + 6 } });
    }
    // plan-time-affordable batch, cumulative gates: a cheap rung cannot steal from a dear one,
    // and one 53wu trip home buys the whole batch.
    if (t < HARD_BUILD_STOP) {
      const byKind = now.works?.byKind ?? {};
      const seen = {};
      let cum = 0;
      for (const rung of LADDER) {
        const ord = (seen[rung.id] = (seen[rung.id] ?? 0) + 1);
        const standing = byKind[rung.id] ?? 0;
        if (standing >= ord) continue;                       // already satisfied
        const c = costOf(sp, rung.id, standing);
        if (c === null) continue;                            // rung retired (cap) — never stall
        const spot = rung.spots.find((s) => !badSpot.has(`${s.x},${s.z}`));
        if (!spot) continue;                                 // no candidates left — retire, advance
        if (cum + c > (now.gold ?? 0)) break;
        cum += c;
        out.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cum } });
      }
    }
  }

  // ---- harvest tail: the clock and the economy ------------------------------
  const CLUSTER = { x: -38.8, z: -7 };
  const live = (now.seams ?? [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => Math.hypot(a.x - CLUSTER.x, a.z - CLUSTER.z) - Math.hypot(b.x - CLUSTER.x, b.z - CLUSTER.z));
  const pick = live.slice(0, 2);
  const room = 32 - out.length;
  if (pick.length && room > 0) {
    const BLOCK = 6;
    for (let i = 0; i < room; i++) {
      const seam = pick[Math.floor(i / BLOCK) % pick.length];
      out.push({ verb: 'HARVEST', seam: seam.id });
    }
  } else if (room > 0) {
    out.push({ verb: 'HARVEST', seam: 'gold-seam-1' });      // terminal anchor, never an empty array
  }

  const arr = out.slice(0, 32);
  // cheap dedupe: hold the reel down without ever starving a draining worklist
  const sig = JSON.stringify(arr);
  const draining = arr.some((o) => o.verb === 'HARVEST' || o.verb === 'MOVE_HERO' || o.verb === 'HAUL');
  if (sig === lastSig && !draining && t - lastSubT < 4) return null;
  lastSig = sig; lastSubT = t;
  return arr;
}
