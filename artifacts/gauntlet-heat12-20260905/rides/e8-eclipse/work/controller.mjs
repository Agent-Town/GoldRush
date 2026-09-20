// e8-eclipse controller, generation 49.
// Contract shape (read from src/systems/E8SuitAirSystem.ts + the manifest):
//   - claim/hero welded at (0,12); ALL near build ground is the dome-cluster pads, z in [-6,6].
//   - roster has no wrecker and no thief -> nothing can be attacked, no gold stolen.
//   - secure gate = regolith.worked >= 1 (a pan on suit air) AND, once the eclipse has landed,
//     eclipse.groundsWorkedAfter >= 1 (another pan on suit air SINCE the shadow).
//   - eclipse lands at wave ceil(secureWave/2) = 10; it takes every dome offline except the
//     reserve (dome-cluster-pad-center, x/z in [-6,6]), which is the only place the suit refills.

const RESERVE = { x: 0, z: 3.5 }; // well inside dome-cluster-pad-center (x,z in [-6,6])

// Ladder: interleaved so damage lands early; cumulative gating so a cheap rung can never steal
// gold an expensive one is waiting for. Prices from stablePrefix.mechanics.buildables.
const LADDER = [
  { what: 'turret', cost: 50 },
  { what: 'sentry_beacon', cost: 25 },
  { what: 'turret', cost: 70 },
  { what: 'sentry_beacon', cost: 35 },
  { what: 'turret', cost: 95 },
  { what: 'sentry_beacon', cost: 45 },
  { what: 'turret', cost: 125 },
  { what: 'sentry_beacon', cost: 55 },
  { what: 'sentry_beacon', cost: 75 },
  { what: 'sentry_beacon', cost: 95 },
];

// More candidates than slots (gen-10/14/35). Beacon radius 8 from a hero at z=12 needs |x|<=5.29
// on the z=6 line; the turret's 16 reaches from further back.
const SPOTS = {
  sentry_beacon: [
    { x: 0, z: 6 }, { x: -1.5, z: 6 }, { x: 1.5, z: 6 }, { x: -3, z: 6 }, { x: 3, z: 6 },
    { x: -5, z: 6 }, { x: 5, z: 6 }, { x: 0, z: 4.5 }, { x: -2, z: 4.5 }, { x: 2, z: 4.5 },
  ],
  turret: [
    { x: -6, z: 2 }, { x: 6, z: 2 }, { x: -3, z: 1 }, { x: 3, z: 1 },
    { x: 0, z: 0 }, { x: -6, z: 5 }, { x: 6, z: 5 }, { x: -9, z: 2 }, { x: 9, z: 2 },
  ],
};

const TIER_COST = { turret: [0, 150, 300], sentry_beacon: [0] };

const PLATING = /plating|dressing|vital|health|hp|armor|armour|tough|hardy/i;
const DAMAGE = /spark|damage|coil|tap|power|volley|shot|blast/i;

export function makeController() {
  const blacklist = new Set();   // "what@x,z" refused
  const attempts = new Map();    // patience budget per spot
  let lastSeamId = null;
  let seamBlock = 0;

  return function decide(view) {
    const now = view.now;

    // 1. Secure boundary: a BLANK LINE. gr-sim records no entry, the configured `bank` default
    //    fires, durationTicks stays inside the envelope (F-HEAT11-1), and the reel stays small.
    if (now.pendingSecure) return null;

    const orders = [];

    // 2. PICK_UPGRADE first under REPLACE semantics.
    if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
      const scored = now.pendingOffer.map((o) => {
        const s = `${o.id} ${o.name} ${o.effectText || ''}`;
        return { id: o.id, score: PLATING.test(s) ? 3 : DAMAGE.test(s) ? 2 : 1 };
      }).sort((a, b) => b.score - a.score);
      orders.push({ verb: 'PICK_UPGRADE', id: scored[0].id });
    }

    // 3. Free supplementary damage: a 2.4x lob costs nothing and has no cooldown conflict.
    if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 16 } });

    // 4. The build ladder: only rungs we can pay for RIGHT NOW, cumulatively gated.
    const byKind = (now.works && now.works.byKind) || {};
    const entries = (now.works && now.works.entries) || [];
    for (const rec of now.orders || []) {
      const o = rec && rec.order;
      if (!o || o.verb !== 'BUILD' || !o.where) continue;
      const key = `${o.what}@${o.where.x},${o.where.z}`;
      if (rec.status === 'failed') {
        const n = (attempts.get(key) || 0) + 1;
        attempts.set(key, n);
        if (n >= 3) blacklist.add(key);
      }
    }
    const built = {};
    for (const k of Object.keys(SPOTS)) built[k] = byKind[k] || 0;
    const taken = new Set(entries.map((e) => e.position ? `${e.id}@${round(e.position.x)},${round(e.position.z)}` : ''));

    const pending = [];
    const counter = { turret: built.turret, sentry_beacon: built.sentry_beacon };
    let cum = 0;
    for (const rung of LADDER) {
      const have = counter[rung.what];
      const idx = LADDER.filter((r) => r.what === rung.what).indexOf(rung);
      if (idx < have) continue;              // this rung already stands
      const spot = SPOTS[rung.what].find((p) => {
        const key = `${rung.what}@${p.x},${p.z}`;
        return !blacklist.has(key) && !taken.has(`${rung.what}@${round(p.x)},${round(p.z)}`)
          && !pending.some((q) => q.what === rung.what && q.where.x === p.x && q.where.z === p.z);
      });
      if (!spot) continue;
      cum += rung.cost;
      if (now.gold < cum) break;             // plan-time affordability, cumulative
      pending.push({ verb: 'BUILD', what: rung.what, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
      counter[rung.what] += 1;
      if (pending.length >= 4) break;
    }
    orders.push(...pending);

    // 5. The capped-purse sink: tier upgrades once the ladder is done. CONTEXT_ACTION does not
    //    travel, so it needs a MOVE_TO in front of it (gen 29/35/45).
    // Fire it as soon as the turret ladder stands, and hold the same cumulative discipline: only
    // spend on a tier once the pending rungs are already covered. Waiting for the last two beacons
    // (75 g and 95 g, the worst dps-per-gold on the board) cost tune-1 two upgrades and the run.
    // Gate on the cost of the rungs actually EMITTED, never on `cum` — `cum` carries the rung the
    // loop broke on, and against a 200 bank cap that made this sink unreachable for the whole of
    // tune-2 (0 CONTEXT_ACTION orders emitted in 89 arrays, ~600 gold of dps never bought).
    // Builds take priority within a view; if none is affordable this view and 150 is in hand, spend
    // it. Always reachable under the 200 bank cap, and it can never starve the ladder.
    if (built.turret >= 4 && pending.length === 0 && now.gold >= 150) {
      const up = entries.find((e) => e.id === 'turret' && !e.wrecked
        && TIER_COST.turret[Math.max(1, e.tier || 1)] !== undefined
        && now.gold >= TIER_COST.turret[Math.max(1, e.tier || 1)]);
      if (up && up.position) {
        orders.push({ verb: 'MOVE_TO', pos: { x: up.position.x, z: up.position.z } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
      }
    }

    // 6. THE AIR PHASE. Everything above is the ordinary map; this is the era gate.
    const air = now.air;
    const ecl = air && air.eclipse;
    const suit = air ? air.suit.seconds : 60;
    const needBefore = air ? (air.regolith.worked.length < air.regolith.required) : false;
    const needAfter = ecl ? (ecl.requiredAfter > 0 && ecl.groundsWorkedAfter < ecl.requiredAfter) : false;

    let domeHold = false;
    if (needAfter) {
      if (!ecl.arrived) {
        // Pre-charge only on the doorstep of the shadow (it lands at wave 10 = ceil(20/2)),
        // so the economy keeps running until then. One wave of panning is the whole cost.
        if (now.wave >= 9 && suit < 55) domeHold = true;
      } else {
        // The shadow has landed. Refill at the reserve, then walk out and pan once on that air.
        if (suit < 14) domeHold = true;
      }
    }

    if (domeHold) {
      orders.push({ verb: 'HOLD', pos: RESERVE });
      return orders.slice(0, 32);
    }

    // 7. The economy tail. Drain ONE seam in a block before walking to the next (gen 15/47):
    //    a round-robin chain is a commute generator when the seams are 12-34 units out.
    const live = (now.seams || []).filter((s) => s.active !== false)
      .map((s) => ({ ...s, d: Math.hypot(s.x - 0, s.z - 12) }))
      .sort((a, b) => a.d - b.d);
    if (live.length > 0) {
      let pick = live[0];
      if (lastSeamId && live.some((s) => s.id === lastSeamId) && seamBlock < 3) {
        pick = live.find((s) => s.id === lastSeamId);
        seamBlock += 1;
      } else {
        lastSeamId = pick.id;
        seamBlock = 0;
      }
      // FILL THE ARRAY. One HARVEST is one 1.5 s pan tick (5 gold); ten of them is fifteen seconds
      // of work against a thirty-second wave, which is exactly the 60 g/wave ceiling tune-1 hit.
      const room = 31 - orders.length;
      for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: pick.id });
    }

    // 8. A terminal anchor that cannot be filtered away, so the array is never [] (gen 42).
    orders.push({ verb: 'HOLD', pos: { x: -1.8, z: 11 } });
    return orders.slice(0, 32);
  };
}

function round(v) { return Math.round(v * 100) / 100; }
