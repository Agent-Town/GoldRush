// e8-far-side controller v1 — heat 12, the mechanic-changed sweep.
//
// THE MAP AS IT IS NOW (measured, not remembered):
//   · now.air is LIVE (my gen-34 ride had none). wall "suit-only", one breathing dome =
//     `far-side-landing-yard` (x -24..24, z -48..-30) which CONTAINS the claim/hero at (0,-36).
//   · TWO secure gates, both on the same rectangle `listening-probe-crater` (x -14..14, z 38..52):
//       1. probeRecovery.recovered  (CONTEXT_ACTION recover, Prospector standing in the zone)
//       2. air.crossing.complete    (E8SuitAirSystem: credit only on an ENTRY made with suit > 0)
//     A breathless entry is counted and refused; it is re-crossable, but it costs a round trip.
//   · suit 60 s, drains 1/s outside the yard, refills 4/s inside. Crater is 75 units of drain
//     from the yard edge => ~15.6 s at 4.8 wu/s. Budget is wide IF the suit is topped up first.
//   · roster is one id, no wreckers and no thieves => no work can be attacked, no gold stolen.
//     REPAIR_UNDER and palisades are dead weight; every gold goes into damage.
//   · seam anchors: (+-16,-34) INSIDE the yard (panning there refills the suit),
//                   (+-9,-22) OUTSIDE it (panning there drains it). Prefer in-yard seams.

const CLAIM = { x: 0, z: -36 };
const CRATER = { x: 0, z: 45 };
const YARD = { minX: -24, maxX: 24, minZ: -48, maxZ: -30 };

const TURRETS = [
  { x: -12, z: -31 }, { x: 12, z: -31 }, { x: -12, z: -41 }, { x: 12, z: -41 },
  { x: -18, z: -34 }, { x: 18, z: -34 }, { x: -6, z: -45 }, { x: 6, z: -45 },
];
const BEACONS = [
  { x: -5, z: -33 }, { x: 5, z: -33 }, { x: -5, z: -39 }, { x: 5, z: -39 },
  { x: 0, z: -31 }, { x: 0, z: -41 }, { x: -7, z: -36 }, { x: 7, z: -36 },
  { x: -16, z: -38 }, { x: 16, z: -38 },
];

const inYard = (p) => p.x >= YARD.minX && p.x <= YARD.maxX && p.z >= YARD.minZ && p.z <= YARD.maxZ;
const key = (p) => `${p.x},${p.z}`;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Plating first: the cheapest margin on the board and it costs no gold (gen 14/24).
function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max health|maximum health|toughness|vigor/.test(s)) v += 100;
  if (/dressing|heal|regen|mend/.test(s)) v += 60;
  if (/damage|spark|coil|tap|power|burst/.test(s)) v += 40;
  if (/rate|fire|reload|speed of fire/.test(s)) v += 30;
  if (/range|reach/.test(s)) v += 15;
  if (/luck|pan|gold|seam|prospect/.test(s)) v += 2;
  return v;
}

export default function controller(view, S, n) {
  const now = view.now;
  const pre = view.stablePrefix;
  if (!S.init) {
    S.init = true;
    S.bad = new Set();          // refusal blacklist, fed from now.orders[].reason (gen 35)
    S.lastSig = null;
    S.crossDone = false;
    S.notes = [];
    S.costs = {};
    for (const b of (pre.mechanics?.buildables || [])) S.costs[b.id] = b.costs || [];
  }

  // ── blacklist any coordinate the view says was refused ────────────────────────────────
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o && o.verb === 'BUILD' && o.where) {
      if (/UNREACHABLE|out_of_zone|collision|out_of_reach|terrain/i.test(String(rec.reason || rec.detail || ''))) {
        S.bad.add(key(o.where));
      }
    }
  }

  const air = now.air || {};
  const suit = air.suit || { seconds: 60 };
  const crossing = air.crossing || { complete: true };
  const recovered = now.probeRecovery ? now.probeRecovery.recovered : true;
  const gold = now.gold || 0;
  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const wave = now.wave || 0;

  const orders = [];

  // ── 0. the secure boundary: answer with a BLANK LINE ──────────────────────────────────
  // `twist.secureWave` is absent => wave 20 / 600 s. gr-sim records no entry for an empty
  // submission, so the configured `bank` default fires for free and the last accepted order
  // stays well inside the tick envelope (F-HEAT11-1) while the reel stays small.
  if (now.pendingSecure) return null;

  // ── 1. the draft owns the tick first (REPLACE semantics) ──────────────────────────────
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // ── 2. THE CROSSING — the whole mechanic change, and both secure gates at once ─────────
  // Cross once the turret ladder stands (marginal gold is cheapest then), or by wave 8 at the
  // latest, and only with a suit that can pay the 15.6 s of drain each way. If air is short,
  // HOLD on the claim — which is inside the one breathing dome — and refill at 4/s.
  const needCross = !recovered || !crossing.complete;
  const wantCross = needCross && (nT >= 4 || wave >= 8);
  if (wantCross) {
    if (suit.seconds < 30 && inYard(now.prospector)) {
      S.notes.push(`t=${now.timers?.runSeconds} refilling suit ${suit.seconds}`);
      orders.push({ verb: 'HOLD', pos: CLAIM });
      return orders;
    }
    orders.push({ verb: 'MOVE_TO', pos: CRATER });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: -34 } });
    // fall through to the harvest tail so the walk home ends on a seam
  }

  // ── 3. the ladder: turrets first, then beacons; one non-decreasing price prefix ────────
  // Sorted by STRATEGY, not price (gen 39): a turret is 57 dps flat, a beacon ~13 at wave 1.
  // Nothing on this board can be wrecked, so a build is a monotone investment.
  if (!wantCross) {
    const rungs = [];
    const tCost = (i) => (S.costs.turret && S.costs.turret[i]) ?? (50 + 25 * i);
    const bCost = (i) => (S.costs.sentry_beacon && S.costs.sentry_beacon[i]) ?? (25 + 10 * i);
    const used = new Set(entries.map((e) => key(e.position || e)));
    if (nT < 4) {
      for (let i = nT; i < 4; i++) {
        const spot = TURRETS.find((p) => !S.bad.has(key(p)) && !used.has(key(p)));
        if (!spot) break;
        used.add(key(spot));
        rungs.push({ verb: 'BUILD', what: 'turret', where: spot, when: { goldGte: tCost(i) } });
      }
    } else if (nB < 6) {
      for (let i = nB; i < 6; i++) {
        const spot = BEACONS.find((p) => !S.bad.has(key(p)) && !used.has(key(p)));
        if (!spot) break;
        used.add(key(spot));
        rungs.push({ verb: 'BUILD', what: 'sentry_beacon', where: spot, when: { goldGte: bCost(i) } });
      }
    }
    // truncate at the first price decrease so no cheap rung can starve an expensive one
    let cap = rungs.length;
    for (let i = 1; i < rungs.length; i++) {
      if (rungs[i].when.goldGte < rungs[i - 1].when.goldGte) { cap = i; break; }
    }
    orders.push(...rungs.slice(0, cap));

    // ── 4. the live sink: turret tier 2. `Math.max(1,tier)` indexes correctly under BOTH
    // conventions (gen 45), and CONTEXT_ACTION does not travel, so pair it with a MOVE_TO.
    if (nT >= 4 && nB >= 6) {
      const t2 = entries.filter((e) => e.id === 'turret' && (e.tier || 1) < 2)[0];
      if (t2 && gold >= 150) {
        orders.push({ verb: 'MOVE_TO', pos: { x: t2.position.x, z: t2.position.z } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t2.index } });
      }
    }
  }

  // ── 5. free supplementary damage. 2.4x lob reach = 24 m; the scrum piles on the welded hero.
  if ((now.blastReadyInMs || 0) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: -29 } });

  // ── 6. the harvest tail. Prefer IN-YARD seams: panning there tops the suit back up, which is
  // what keeps the crossing payable. Chain the rest nearest-first; the seams are 2-20 units from
  // the fort so the commute is free on this map.
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  const ranked = live.slice().sort((a, b) => {
    const ay = inYard(a) ? 0 : 1, by = inYard(b) ? 0 : 1;
    if (ay !== by) return ay - by;
    return dist(a, CLAIM) - dist(b, CLAIM);
  });
  const room = 31 - orders.length;
  for (let i = 0; i < room && ranked.length; i++) orders.push({ verb: 'HARVEST', seam: ranked[i % ranked.length].id });

  // ── 7. a terminal anchor that cannot be filtered away ([] is a wipe — gen 42) ───────────
  orders.push({ verb: 'HOLD', pos: ranked.length ? { x: ranked[0].x, z: ranked[0].z } : CLAIM });

  // ── 8. reel budget: resubmit only on a real change of plan (blank line otherwise) ────────
  const sig = JSON.stringify(orders.map((o) => [o.verb, o.what, o.where && key(o.where), o.seam, o.id, o.action]));
  const drained = orders.filter((o) => o.verb === 'HARVEST').length < 6;
  if (sig === S.lastSig && !drained && !wantCross) return null;
  S.lastSig = sig;
  return orders.slice(0, 32);
}
