// e1-dry-gulch controller — claude-opus-5, heat 11.
// Map facts (from stablePrefix, seed e1-dry-gulch-01):
//   claim (0,12) · spawn edges N/S/E/W · seam anchors 0..5 · spring (-18,-18)
//   turret 50/70/95/125 (max 4, range 16) · beacon 25/35/45/55/75/95 (max 6, radius 8)
//   bankCap 200 · secureWave 20 · wave ceiling 22 · seam yield x1.4
// Loss condition observed in the idle probe: hero_down (works start at 0 hp/0 standing).
// So this is hero survival, and the fort exists to thin the swarm that chases him.

export const CLAIM = { x: 0, z: 12 };

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

export function makePolicy(cfg) {
  const {
    turretSlots,
    beaconSlots,
    buildOrder,          // array of {kind, slot} in priority order
    repairPct = 60,
    harvestMaxDist = Infinity,
    homePos = CLAIM,
    upgradePrefs = [],
    blast = false,
  } = cfg;

  const failedTargets = new Set();   // "kind@x,z" that failed UNREACHABLE
  const trace = [];

  function key(kind, p) { return `${kind}@${p.x},${p.z}`; }

  const policy = (view) => {
    const now = view.now;

    // Harvest failures / build failures reported on the previous accepted set.
    for (const rec of now.orders ?? []) {
      const o = rec.order ?? rec;
      if (rec.status === 'failed' && o && o.verb === 'BUILD' && o.where) {
        if (String(rec.reason ?? '').includes('UNREACHABLE')) failedTargets.add(key(o.what, o.where));
      }
    }

    // The secure boundary: only SECURE_CHOICE runs while pendingSecure is live.
    if (now.pendingSecure) {
      trace.push({ w: now.wave, t: now.timers.runSeconds, act: 'SECURE bank' });
      return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
    }

    const orders = [];

    // The draft owns the tick when live; put it first (gen-5 lesson: and resend the rest).
    if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
      const ids = now.pendingOffer.map((o) => o.id);
      let pick = ids[0];
      for (const p of upgradePrefs) if (ids.includes(p)) { pick = p; break; }
      orders.push({ verb: 'PICK_UPGRADE', id: pick });
      trace.push({ w: now.wave, t: now.timers.runSeconds, act: 'PICK ' + pick, offer: ids });
    }

    // Standing build ladder: unbuilt slots only, gated on their own live price.
    const byKind = now.works?.byKind ?? {};
    const haveT = byKind.turret ?? 0;
    const haveB = byKind.sentry_beacon ?? 0;
    let tIdx = haveT;
    let bIdx = haveB;
    for (const step of buildOrder) {
      if (step.kind === 'turret') {
        if (tIdx >= turretSlots.length || tIdx >= TURRET_COSTS.length) continue;
        const where = turretSlots[tIdx];
        if (failedTargets.has(key('turret', where))) { tIdx += 1; continue; }
        orders.push({ verb: 'BUILD', what: 'turret', where, when: { goldGte: TURRET_COSTS[tIdx] } });
        tIdx += 1;
      } else {
        if (bIdx >= beaconSlots.length || bIdx >= BEACON_COSTS.length) continue;
        const where = beaconSlots[bIdx];
        if (failedTargets.has(key('sentry_beacon', where))) { bIdx += 1; continue; }
        orders.push({ verb: 'BUILD', what: 'sentry_beacon', where, when: { goldGte: BEACON_COSTS[bIdx] } });
        bIdx += 1;
      }
      if (orders.length >= 24) break;
    }

    // Mend what is standing; falls through when nothing qualifies.
    if ((now.works?.standing ?? 0) > 0 || (now.works?.wrecked ?? 0) > 0) {
      orders.push({ verb: 'REPAIR_UNDER', pct: repairPct });
    }

    // Work: nearest LIVE seam only. A HARVEST naming a dead seam burns the tick.
    const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
    live.sort((a, b) => dist(a, homePos) - dist(b, homePos) || (a.id < b.id ? -1 : 1));
    const seam = live[0];
    if (seam && dist(seam, homePos) <= harvestMaxDist) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }

    if (blast && now.blastReadyInMs === 0 && now.threats.alive > 6) {
      orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
    }

    // Anchor: only reached when nothing above is actionable.
    orders.push({ verb: 'HOLD', pos: homePos });

    trace.push({
      w: now.wave, t: now.timers.runSeconds, hp: now.hero.hp, g: now.gold,
      thr: now.threats.alive, works: `${now.works?.standing ?? 0}/${now.works?.wrecked ?? 0}`,
      T: haveT, B: haveB, seam: seam ? `${seam.id}@${dist(seam, homePos).toFixed(0)}` : 'none',
      n: orders.length,
    });
    return orders;
  };

  policy.trace = trace;
  policy.failed = failedTargets;
  return policy;
}
