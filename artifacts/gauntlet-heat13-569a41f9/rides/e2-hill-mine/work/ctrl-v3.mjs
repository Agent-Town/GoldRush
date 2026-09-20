// e2-hill-mine controller. Secure = railcar KILL (twist.baron + secureWave 12 =>
// autoSecureWaveForRun returns MAX while !baronBeaten). Ceiling wave 18.
// New this era: MOVE_HERO. The rail runs at z~0; the hero used to be welded at (0,12).

const CLAIM = { x: 0, z: 12 };

// base-t1 build zone: x -30..30, z 8..16. Turret range 16 reaches the rail (z~0) from z<=10.
const TURRETS = [
  { x: -8, z: 10 }, { x: 8, z: 10 }, { x: -3, z: 9 }, { x: 3, z: 9 },
  { x: -12, z: 10 }, { x: 12, z: 10 }, { x: -6, z: 9 }, { x: 6, z: 9 },
  { x: -8, z: 13 }, { x: 8, z: 13 }, { x: -14, z: 12 }, { x: 14, z: 12 },
  { x: 0, z: 9 }, { x: -16, z: 10 }, { x: 16, z: 10 }, { x: -4, z: 15 },
];
const BEACONS = [
  { x: -6, z: 14 }, { x: 6, z: 14 }, { x: -13, z: 13 }, { x: 13, z: 13 },
  { x: 0, z: 16 }, { x: -6, z: 10 }, { x: 6, z: 10 }, { x: -10, z: 16 },
  { x: 10, z: 16 }, { x: -18, z: 12 }, { x: 18, z: 12 }, { x: 0, z: 8 },
];
const PALIS = [];
for (let x = -20; x <= 20; x += 4) PALIS.push({ x, z: 16 });
for (let x = -20; x <= 20; x += 4) PALIS.push({ x, z: 8 });

// Hero rail post candidates: ford is x in [-4,4] (halfWidth 4); rail z ~ 0.
// Ordered most-aggressive first; an unwalkable MOVE_HERO fails in one tick and yields.
const RAILPOST = [
  { x: 0, z: 6 }, { x: 0, z: 5 }, { x: 0, z: 7 }, { x: 2, z: 6 }, { x: -2, z: 6 },
  { x: 0, z: 8 }, { x: 0, z: 9 },
];

const PLATING = ['tinkers_plating', 'field_dressing', 'iron_lining', 'bulwark'];

function scoreOffer(o) {
  const s = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let v = 0;
  if (/plating|max health|maxhp|health|vitality|armor|armour|tough/.test(s)) v += 100;
  if (/heal|dressing|regen|mend/.test(s)) v += 80;
  if (PLATING.some((p) => (o.id || '').includes(p))) v += 60;
  if (/damage|spark|coil|bolt|power|blast/.test(s)) v += 40;
  if (/fire rate|rate|speed of fire|cadence/.test(s)) v += 30;
  if (/range/.test(s)) v += 15;
  if (/gold|pan|luck|seam/.test(s)) v += 5;
  return v;
}

export default function make() {
  const badSpot = new Set(); // GROUND refusals only
  let railPostIdx = 0;

  const key = (p) => `${p.x},${p.z}`;
  // A spot is taken if a standing work already sits on it. Derive occupancy from the
  // view, never from what the controller merely asked for (gen-10 slot-skipper).
  const taken = (entries, s) => entries.some((e) => e.position
    && Math.hypot(e.position.x - s.x, e.position.z - s.z) < 1.6);

  return {
    onView(v, rows) {
      const n = v.now;
      const t = n.timers?.runSeconds ?? 0;
      const wave = n.wave ?? 0;
      const gold = n.gold ?? 0;
      const entries = n.works?.entries ?? [];
      const byKind = n.works?.byKind ?? {};
      const hero = n.hero ?? {};
      const hp = hero.hp ?? 0, maxHp = hero.maxHp ?? 100;

      rows.push(JSON.stringify({
        t: +t.toFixed(1), w: wave, hp: +hp.toFixed(0), mx: maxHp,
        hx: +(hero.x ?? 0).toFixed(1), hz: +(hero.z ?? 0).toFixed(1),
        g: gold, pan: n.score?.goldPanned, al: n.threats?.alive,
        T: byKind.turret || 0, B: byKind.sentry_beacon || 0, P: byKind.palisade || 0,
        wr: n.works?.wrecked || 0,
        tiers: entries.filter((e) => (e.tier || 1) > 1).length,
        ps: n.pendingSecure ? 1 : 0,
      }));

      // Secure boundary: answer with a blank line -> default bank, records no entry.
      if (n.pendingSecure) return null;

      // Harvest refusal blacklist: read GROUND refusals off the accepted order records.
      for (const rec of (n.orders || [])) {
        if (rec.status !== 'failed') continue;
        const o = rec.order || rec;
        const r = String(rec.reason || rec.detail || '');
        if (o.verb !== 'BUILD' || !o.where) continue;
        if (/insufficient_gold|insufficient/i.test(r)) continue; // ECONOMY: retry, poison nothing
        badSpot.add(key(o.where));
      }

      const orders = [];

      // 1. Draft first (replace semantics).
      const offer = n.pendingOffer;
      if (offer && offer.length) {
        let best = offer[0], bv = -1;
        for (const o of offer) { const s = scoreOffer(o); if (s > bv) { bv = s; best = o; } }
        orders.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      // 2. Boss phase: walk the hero to the rail cut. The railcar rides railRouteIndex 0
      //    at z ~ 0 with pursuitRange 0, so it never chases; standing beside the rail is
      //    the only way a hero weapon can reach it at all.
      const bossPhase = wave >= 11;
      const post = RAILPOST[Math.min(railPostIdx, RAILPOST.length - 1)];
      if (bossPhase) {
        // ONE post, not a ladder. attempt-1 emitted every remaining candidate, so each
        // MOVE_HERO completed and handed the tick to the next: the hero shuttled between
        // z 5.6 and 7.8 forever, every tick was owned by a walk, and panning and repair
        // both froze (pan flat at 660 from t=377). Advance the index only on a real refusal,
        // and drop the order entirely once the hero is parked so the rest of the array runs.
        for (const rec of (n.orders || [])) {
          const o = rec.order || rec;
          if (o.verb === 'MOVE_HERO' && rec.status === 'failed') {
            const i = RAILPOST.findIndex((p) => p.x === o.pos?.x && p.z === o.pos?.z);
            if (i >= 0 && i >= railPostIdx) railPostIdx = i + 1;
          }
        }
        const p = RAILPOST[Math.min(railPostIdx, RAILPOST.length - 1)];
        if (Math.hypot((hero.x ?? 0) - p.x, (hero.z ?? 0) - p.z) > 1.0) {
          orders.push({ verb: 'MOVE_HERO', pos: p });
        }
      }

      // 3. Free blast every ready window.
      if ((n.blastReadyInMs ?? 1) === 0) {
        const hx = hero.x ?? 0, hz = hero.z ?? 12;
        // Boss phase: sweep the rail line in front of the hero (blast reach 10).
        const target = bossPhase ? { x: Math.round(hx), z: Math.max(-2, Math.round(hz) - 6) }
                                 : { x: Math.round(hx), z: Math.round(hz) };
        orders.push({ verb: 'BLAST_AT', pos: target });
      }

      // 4. Ladder: turrets first (range 16 is the only thing that reaches the rail from the
      //    fort), then beacons, plan-time affordable only, cumulative-gated.
      const nT = byKind.turret || 0, nB = byKind.sentry_beacon || 0, nP = byKind.palisade || 0;
      const TC = [50, 70, 95, 125], BC = [25, 35, 45, 55, 75, 95];
      const ladder = [];
      if (nT < 4) ladder.push({ what: 'turret', cost: TC[nT], spots: TURRETS });
      if (nB < 6 && nT >= 2) ladder.push({ what: 'sentry_beacon', cost: BC[nB], spots: BEACONS });
      let budget = gold;
      for (const rung of ladder) {
        if (budget < rung.cost) break;
        const spot = rung.spots.find((s) => !badSpot.has(key(s)) && !taken(entries, s));
        if (!spot) break;
        orders.push({ verb: 'BUILD', what: rung.what, where: spot, when: { goldGte: rung.cost } });
        budget -= rung.cost;
      }

      // 5. Tier-2 turret sink once the turret ladder caps: 150g for x1.4 damage x1.18 rate.
      //    CONTEXT_ACTION does not travel; pair it with MOVE_HERO (interact radius 1.6).
      if (false) {
        const tgt = entries.find((e) => e.id === 'turret' && (e.tier || 1) < 2 && !e.wrecked);
        if (tgt && tgt.position) {
          const px = tgt.position.x, pz = tgt.position.z;
          const dx = CLAIM.x - px, dz = CLAIM.z - pz;
          const L = Math.hypot(dx, dz) || 1;
          orders.push({ verb: 'MOVE_HERO', pos: { x: +(px + (dx / L) * 0.7).toFixed(2), z: +(pz + (dz / L) * 0.7).toFixed(2) } });
          orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: tgt.index } });
        }
      }

      // 6. Overflow sink: palisades once both ladders cap (keeps the purse from pinning,
      //    and steam_wrecker chews timber instead of turrets).
      if (nT >= 4 && nB >= 6 && nP < 48 && gold >= 10 && budget >= 10) {
        const spot = PALIS.find((s) => !badSpot.has(key(s)) && !taken(entries, s));
        if (spot) orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
      }

      // 7. Repair (now bounded to the rig radius around the Prospector, so it cannot
      //    walk the map). Only when there is money for it.
      orders.push({ verb: 'REPAIR_UNDER', pct: 95 });
      orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

      // 8. Harvest tail: drain one live seam in a block, then the next. Inactive seams
      //    publish x/z as null and one non-finite number refuses the WHOLE array.
      const px = n.prospector?.x ?? hero.x ?? 0, pz = n.prospector?.z ?? hero.z ?? 12;
      const live = (n.seams || [])
        .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
        .sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
      const room = 32 - orders.length;
      if (live.length && room > 0) {
        const blk = Math.max(1, Math.min(7, Math.floor(room / Math.max(1, Math.min(2, live.length)))));
        outer: for (let s = 0; s < live.length; s++) {
          for (let i = 0; i < blk; i++) {
            if (orders.length >= 32) break outer;
            orders.push({ verb: 'HARVEST', seam: live[s].id });
          }
        }
        while (orders.length < 32) orders.push({ verb: 'HARVEST', seam: live[0].id });
      }

      return orders.slice(0, 32);
    },
  };
}
