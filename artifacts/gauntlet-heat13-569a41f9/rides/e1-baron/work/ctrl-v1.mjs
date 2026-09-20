// e1-baron controller. Post-ADR-005 grammar (MOVE_HERO; no MOVE_TO/HOLD/FALLBACK_IF).
//
// The contract: autoSecureWaveForRun returns MAX_SAFE_INTEGER while (twist.baron && !baronBeaten),
// so THE SECURE IS THE KILL. Ceiling is wave 20 + BOSS_GRACE_WAVES(6) = 26.
// Baron: hpScale 240 at wave 20 => ~25.2 * 1.115^19 * 240 ~= 47,900 hp.
// Baron speed 2.7 * 1.3(cap) * 0.75 = 2.63 wu/s vs hero 6.0 -> kiteable.
// Enemy.shouldPursueHero: within heroPursuitRange(18) the baron walks the HERO and does not
// target turrets (only a palisade that blocks the route). So: keep the hero inside 18 and
// outside contact, and the turrets shoot a boss that never reaches them.

const CLAIM = { x: 0, z: 12 };

const TURRETS = [
  { x: 0, z: 9 }, { x: -4, z: 12 }, { x: 4, z: 12 }, { x: 0, z: 15 },
  { x: -3, z: 9 }, { x: 3, z: 9 }, { x: -4, z: 15 }, { x: 4, z: 15 },
  { x: 0, z: 7 }, { x: -6, z: 12 }, { x: 6, z: 12 }, { x: 0, z: 17 },
];
const BEACONS = [
  { x: -2, z: 17 }, { x: 2, z: 17 }, { x: -6, z: 15 }, { x: 6, z: 15 },
  { x: -6, z: 9 }, { x: 6, z: 9 }, { x: 0, z: 19 }, { x: -8, z: 12 },
  { x: 8, z: 12 }, { x: -2, z: 7 }, { x: 2, z: 7 }, { x: 0, z: 20 },
];

const GROUND_REASONS = /out_of_zone|collision|cap_reached|UNREACHABLE|terrain|out_of_reach/i;

export default function make(opts = {}) {
  const KITE = opts.kite !== false;
  const KITE_FROM_WAVE = opts.kiteFromWave ?? 19;
  const P = opts.kiteCenter ?? { x: 0, z: 24 };   // kite about a point |P-CLAIM| from the fort
  const R = opts.kiteRadius ?? 6;
  const PALISADES = opts.palisades ?? false;
  const RING = opts.ring ?? false;
  const RING_R = opts.ringR ?? 13;
  const RING_N = opts.ringN ?? 24;
  const RING_FROM_WAVE = opts.ringFromWave ?? 14;

  const bad = new Set();
  const tries = new Map();
  const rows = [];
  let lastPan = 0, lastPanT = 0, rate = 1.5;

  const key = (p) => `${p.x},${p.z}`;

  function pickSpots(cands, want, entries) {
    const used = entries.map((e) => e.position || e);
    const out = [];
    for (const c of cands) {
      if (out.length >= want) break;
      if (bad.has(key(c))) continue;
      if (used.some((u) => Math.hypot((u.x ?? 0) - c.x, (u.z ?? 0) - c.z) < 1.6)) continue;
      out.push(c);
    }
    return out;
  }

  return {
    note(v) {
      const n = v.now || {};
      const t = +(n.timers?.runSeconds ?? 0);
      const surprises = [];
      for (const w of (v.appendLog || []).slice(-3)) {
        for (const s of (w.surprises || [])) surprises.push(s.type || s.kind || String(s).slice(0, 40));
      }
      const row = {
        t: +t.toFixed(1), w: n.wave,
        hp: +(n.hero?.hp ?? 0).toFixed(1), mx: n.hero?.maxHp, lv: n.hero?.level,
        hx: +(n.hero?.x ?? 0).toFixed(1), hz: +(n.hero?.z ?? 0).toFixed(1),
        g: n.gold, pan: n.score?.goldPanned,
        al: n.threats?.alive, wr: n.threats?.wreckers,
        st: n.works?.standing, wk: n.works?.wrecked,
        T: n.works?.byKind?.turret ?? 0, B: n.works?.byKind?.sentry_beacon ?? 0,
        tiers: (n.works?.entries || []).filter((e) => e.id === 'turret').map((e) => e.tier).join(''),
        sp: [...new Set(surprises)].slice(0, 4).join(','),
      };
      rows.push(row);
      return row;
    },

    decide(v) {
      const n = v.now || {};
      const t = +(n.timers?.runSeconds ?? 0);
      const wave = n.wave ?? 0;
      const gold = n.gold ?? 0;
      const entries = n.works?.entries || [];

      // measured pan rate
      const pan = n.score?.goldPanned ?? 0;
      if (t > lastPanT + 5) { const dr = (pan - lastPan) / (t - lastPanT); if (dr > 0) rate = 0.7 * rate + 0.3 * dr; lastPan = pan; lastPanT = t; }

      // refusal blacklist: GROUND poisons the coordinate, ECONOMY never does.
      for (const rec of (n.orders || [])) {
        const o = rec.order || rec;
        if (rec.status !== 'failed' || o.verb !== 'BUILD' || !o.where) continue;
        const reason = `${rec.reason || ''} ${rec.detail || ''}`;
        if (/insufficient_gold/i.test(reason)) continue;
        if (GROUND_REASONS.test(reason)) {
          const k = key(o.where);
          tries.set(k, (tries.get(k) || 0) + 1);
          if (tries.get(k) >= 2) bad.add(k);
        }
      }

      if (n.pendingSecure) return { blank: true };   // default bank, costs no entry

      const orders = [];

      // 1. DRAFT first — replace semantics mean the pick must own the array's head.
      if (n.pendingOffer?.length) {
        const mx = n.hero?.maxHp ?? 100;
        const score = (o) => {
          const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
          let k = 0;
          if (/plating|max health|maximum health|toughness|armor/.test(s)) k += mx < 175 ? 100 : 20;
          if (/dressing|heal|regen|mend/.test(s)) k += 45;
          if (/damage|spark|coil|tap|power|bolt/.test(s)) k += 60;
          if (/rate|speed of fire|cooldown/.test(s)) k += 40;
          if (/gold|pan|luck|fortune/.test(s)) k += 5;
          return k;
        };
        const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
        orders.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      // 2. Free damage whenever the charge is ready.
      if ((n.blastReadyInMs ?? 1) === 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: n.hero?.x ?? CLAIM.x, z: (n.hero?.z ?? CLAIM.z) - 6 } });
      }

      const nT = entries.filter((e) => e.id === 'turret' && !e.wrecked).length;
      const nB = entries.filter((e) => e.id === 'sentry_beacon' && !e.wrecked).length;
      const boss = wave >= KITE_FROM_WAVE;

      // 3. THE KITE. From the taunt wave on, the hero stops being furniture: a chain of
      //    MOVE_HERO waypoints self-sequences (each blocks until arrival, then hands off the
      //    tick), so one array drives an unattended orbit. The baron converges on the orbit
      //    centre P, |P-CLAIM| away from the guns, inside turret range and out of contact.
      if (boss && KITE) {
        // A TRUE ORBIT, walked in order. Stepping the angle by more than one point per leg
        // makes a star polygon whose chords cross the centre — which is exactly where a pursuer
        // converges, so the "kite" walks the hero through the baron. Go round in sequence.
        // PHASE THE CHAIN ON THE CLOCK, NOT THE ARRAY INDEX. Surprise views arrive every ~0.2s in
        // the boss wave and every accepted array REPLACES the whole set, so a chain that always
        // starts at waypoint 0 re-walks its first leg forever and the orbit never advances.
        // Deriving the opening angle from runSeconds makes each resubmission continue the circle.
        const PTS = opts.kitePoints ?? 8;
        const legs = opts.kiteLegs ?? 20;
        const lap = opts.kiteLapSeconds ?? 9;
        const a0 = (t / lap) * Math.PI * 2;
        // A walking MOVE_HERO owns the tick, so anything below the chain never runs. Interleave
        // the ring's mend through the orbit: each drained record hands the next MOVE_HERO a fresh
        // chance to keep the hero ahead of the baron, and the leash gets repaired mid-fight.
        for (let i = 1; i <= legs; i += 1) {
          const a = a0 + (i / PTS) * Math.PI * 2;
          orders.push({ verb: 'MOVE_HERO', pos: { x: +(P.x + R * Math.cos(a)).toFixed(2), z: +(P.z + R * Math.sin(a)).toFixed(2) } });
          if (RING && i % 3 === 0) orders.push({ verb: 'REPAIR_UNDER', pct: 95 });
        }
      }

      // 3b. THE LEASH. Enemy.ts:955 — a wrecker pursuing the hero retargets to any palisade that
      //     BLOCKS the route, and HeadlessContractSim:2450 suppresses the rocket volley whenever
      //     the baron is within wreck reach of a building. A ring outside the guns therefore stops
      //     the baron, silences its rockets, and holds it in turret range (there is no
      //     line-of-sight term in this engine, so timber never shadows a turret).
      // The ring must be MAINTAINED THROUGH the fight, not merely raised before it: it is the
      // leash and the rocket silencer, and a wrecked frame is neither. Mending revives it for 25%
      // of cost, and the wrecked frame still holds the ground.
      if (RING && wave >= RING_FROM_WAVE) {
        const held = new Set(entries.filter((e) => e.id === 'palisade').map((e) => key({ x: Math.round(e.position?.x ?? 0), z: Math.round(e.position?.z ?? 0) })));
        let placed = 0;
        for (let i = 0; i < RING_N && placed < (opts.ringPerView ?? 6); i += 1) {
          const a = (i / RING_N) * Math.PI * 2;
          const w = { x: +(CLAIM.x + RING_R * Math.cos(a)).toFixed(0), z: +(CLAIM.z + RING_R * Math.sin(a)).toFixed(0) };
          const k = key(w);
          if (bad.has(k) || held.has(k)) continue;
          orders.push({ verb: 'BUILD', what: 'palisade', where: { x: +w.x, z: +w.z }, when: { goldGte: 10 } });
          placed += 1;
        }
        // mending revives a wrecked frame for 25% of cost; the ring is the fight's clock.
        orders.push({ verb: 'REPAIR_UNDER', pct: 95 });
      }

      // 4. Ladder — interleaved by dps/gold, cumulatively gated so a cheap rung can never
      //    steal gold an expensive one is waiting for. Stop buying once the boss is due.
      if (!boss) {
        const TCOST = [50, 70, 95, 125];
        const BCOST = [25, 35, 45, 55, 75, 95];
        const plan = [];
        let ti = nT, bi = nB;
        while (ti < 4 || bi < 6) {
          const tc = ti < 4 ? TCOST[ti] : Infinity;
          const bc = bi < 6 ? BCOST[bi] : Infinity;
          // turret first on ties: range 16 vs beacon radius 8, and only range reaches the kite point
          if (tc <= bc) { plan.push({ id: 'turret', cost: tc, n: ti }); ti += 1; }
          else { plan.push({ id: 'sentry_beacon', cost: bc, n: bi }); bi += 1; }
        }
        const tSpots = pickSpots(TURRETS, 4, entries);
        const bSpots = pickSpots(BEACONS, 6, entries);
        let ts = 0, bs = 0, cum = 0;
        for (const rung of plan) {
          cum += rung.cost;
          if (cum > gold) break;                     // plan-time affordable only
          const where = rung.id === 'turret' ? tSpots[ts++] : bSpots[bs++];
          if (!where) continue;
          orders.push({ verb: 'BUILD', what: rung.id, where, when: { goldGte: cum } });
        }

        // 5. The capped-purse sink: tier 2 is 150g for x1.4 damage x1.18 fire rate (x1.65 dps).
        //    CONTEXT_ACTION does not travel and reaches 1.6 world units, so it needs MOVE_HERO
        //    in front of it at a FIXED 0.7 offset (a fraction-of-distance offset overshoots).
        if (nT >= 4 && nB >= 6 && gold >= 150) {
          const low = entries
            .map((e, i) => ({ e, i }))
            .filter(({ e }) => e.id === 'turret' && !e.wrecked && (e.tier ?? 1) < 2)
            .sort((a, b) => (a.e.tier ?? 1) - (b.e.tier ?? 1))[0];
          if (low) {
            const p = low.e.position || low.e;
            const dx = CLAIM.x - p.x, dz = CLAIM.z - p.z;
            const d = Math.hypot(dx, dz) || 1;
            orders.push({ verb: 'MOVE_HERO', pos: { x: +(p.x + (dx / d) * 0.7).toFixed(2), z: +(p.z + (dz / d) * 0.7).toFixed(2) } });
            orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: low.e.index ?? low.i } });
          }
        }

        if (PALISADES && nT >= 4 && nB >= 6 && gold >= 60) {
          const ux = (P.x - CLAIM.x), uz = (P.z - CLAIM.z);
          const d = Math.hypot(ux, uz) || 1;
          for (let i = -3; i <= 3; i += 1) {
            const px = CLAIM.x + (ux / d) * 9 + (-uz / d) * i * 2.6;
            const pz = CLAIM.z + (uz / d) * 9 + (ux / d) * i * 2.6;
            const w = { x: +px.toFixed(1), z: +pz.toFixed(1) };
            if (!bad.has(key(w))) orders.push({ verb: 'BUILD', what: 'palisade', where: w, when: { goldGte: 10 } });
          }
        }
      }

      // 6. Economy tail. Inactive seams publish x/z/anchorIndex as NULL — one non-finite number
      //    refuses the whole array silently, so filter on Number.isFinite before any sort.
      //    Drain ONE seam in a block before walking; a round-robin is a commute generator.
      const live = (n.seams || [])
        .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
        .map((s) => ({ ...s, d: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
        .sort((a, b) => a.d - b.d);

      const room = 32 - orders.length;
      if (live.length && room > 0) {
        const near = live.slice(0, 2);
        for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: near[Math.floor(i / 7) % near.length].id });
      }

      if (orders.length > 32) orders.length = 32;
      // never ship an empty array: [] wipes all orders.
      if (!orders.length) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
      return orders;
    },
    rows,
  };
}
