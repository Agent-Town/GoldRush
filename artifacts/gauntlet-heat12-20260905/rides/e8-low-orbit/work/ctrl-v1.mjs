// e8-low-orbit controller v1 — heat 12, the mechanic-changed sweep.
//
// THE GATE (traced in src/systems/E8SuitAirSystem.ts):
//   crossings = orbitalScaffoldZones (3 decks); shelters = the SAME 3 zones.
//   objectiveAllowsSecure := reached.size >= 3, credited on ENTRY while suit > 0.
//   Because a shelter refills the suit BEFORE noteCrossings in the same step, an entry
//   can never be breathless here (airIsWall:false => not breachable, no eclipse => never
//   offline, so every deck sits at air 1 forever). The air wall costs a WALK, not a budget.
//
// SHAPE: fort first (idle dies at t=78.3s, so standing defence is the scarce resource),
// then the crossing errand once two turrets stand, then fort + tier sinks to the cap.

const CLAIM = { x: 0, z: 12 };

// claw-carcass-yard: x -18..18, z -14..14 (contains the claim).
const TURRETS = [
  { x: -12, z: 4 }, { x: 12, z: 4 }, { x: -14, z: 12 }, { x: 14, z: 12 },
  // spares (gen-10/14/35: carry more candidates than slots, blacklist refusals)
  { x: 0, z: -2 }, { x: -15, z: 8 }, { x: 15, z: 8 }, { x: -8, z: 0 }, { x: 8, z: 0 }, { x: 0, z: 2 },
];
const BEACONS = [
  { x: -5, z: 14 }, { x: 5, z: 14 }, { x: -5, z: 8 }, { x: 5, z: 8 }, { x: 0, z: 5 }, { x: -9, z: 12 },
  { x: 9, z: 12 }, { x: -2, z: 14 }, { x: 2, z: 14 }, { x: 0, z: -6 }, { x: -11, z: 6 }, { x: 11, z: 6 },
];
// Interleaved so dps lands early but a cheap rung can never starve an expensive one
// (cumulative gating below makes the theft unreachable by construction).
const LADDER = [
  { id: 'turret', cost: 50 }, { id: 'sentry_beacon', cost: 25 },
  { id: 'turret', cost: 70 }, { id: 'sentry_beacon', cost: 35 },
  { id: 'turret', cost: 95 }, { id: 'sentry_beacon', cost: 45 },
  { id: 'turret', cost: 125 }, { id: 'sentry_beacon', cost: 55 },
  { id: 'sentry_beacon', cost: 75 }, { id: 'sentry_beacon', cost: 95 },
];
const TIER2 = 150;

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const s = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let v = 0;
  if (/plating|armou?r|hearty|tough|max health|maxhp|health/.test(s)) v += 100;
  if (/dressing|regen|heal|mend/.test(s)) v += 80;
  if (/spark|damage|coil|tap|power/.test(s)) v += 40;
  if (/rate|speed|reload|cadence/.test(s)) v += 30;
  if (/luck|pan|gold|prospect/.test(s)) v -= 20;
  return v;
}

export function makeController() {
  const blacklist = new Set();       // "id@x,z" refused placements
  const tries = new Map();           // patience budget per slot
  let lastSig = null;

  return {
    decide(view) {
      const now = view.now;

      // 1. Secure boundary: blank line. gr-sim records NO entry, the configured
      //    `bank` default fires, and the last accepted order stays well inside the
      //    tick envelope (F-HEAT11-1 lesson, sixth contract running).
      if (now.pendingSecure) { lastSig = null; return '\n'; }

      const orders = [];

      // 2. Draft first, under REPLACE semantics (gen 5).
      if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
        const best = now.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
        orders.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      // 3. Learn refusals from the view's own order records (gen 35).
      for (const rec of (now.orders || [])) {
        const o = rec.order || {};
        if (o.verb === 'BUILD' && (rec.status === 'failed' || /UNREACH|out_of_zone|collision|out_of_reach/i.test(rec.reason || ''))) {
          if (o.where) blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
        }
      }

      const entries = (now.works && now.works.entries) || [];
      const standing = entries.filter((e) => !e.wrecked);
      const nT = standing.filter((e) => e.id === 'turret').length;
      const nB = standing.filter((e) => e.id === 'sentry_beacon').length;
      const gold = now.gold || 0;
      const wave = now.wave || 0;

      const cross = now.air && now.air.crossing;
      const crossDone = !cross || cross.complete;
      const reached = new Set((cross && cross.reached) || []);

      // 4. THE ERRAND. Deferred until two turrets stand or wave 4, because the idle
      //    floor says the hero alone dies at 78s; the crossing carries no deadline.
      const errandOpen = !crossDone && (nT >= 2 || wave >= 4);
      if (errandOpen) {
        const seams = (now.seams || []).filter((s) => s.active && s.x !== null);
        const legs = [];
        if (!reached.has('west-scaffold-deck')) legs.push({ zone: 'west', pos: { x: -38, z: 2 }, seamX: -38 });
        if (!reached.has('east-scaffold-deck')) legs.push({ zone: 'east', pos: { x: 38, z: 2 }, seamX: 38 });
        if (!reached.has('claw-carcass-yard')) legs.push({ zone: 'yard', pos: { x: 0, z: 6 }, seamX: 12 });
        // nearest leg first, then the other
        const p = now.prospector || CLAIM;
        legs.sort((a, b) => d(p, a.pos) - d(p, b.pos));
        for (const leg of legs) {
          orders.push({ verb: 'MOVE_TO', pos: leg.pos });
          const s = seams.find((s) => Math.abs(s.x - leg.seamX) < 6);
          if (s) for (let i = 0; i < 5; i++) orders.push({ verb: 'HARVEST', seam: s.id });
        }
        orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 8 } });
        // tail: pan whatever is nearest home so the trip home is not idle
        const near = seams.slice().sort((a, b) => d(CLAIM, a) - d(CLAIM, b))[0];
        if (near) for (let i = 0; i < 6; i++) orders.push({ verb: 'HARVEST', seam: near.id });
        orders.push({ verb: 'HOLD', pos: { x: 0, z: 8 } });
        return emit(orders);
      }

      // 5. Free supplementary damage: the lob reaches 48m here (4.8x). Aimed OUTWARD
      //    from the claim so an orbital return re-enters further out, away from works.
      if (now.blastReadyInMs === 0 && (now.threats && now.threats.alive > 2)) {
        orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 18 } });
      }

      // 6. BUILD ladder — cumulative gating, plan-time affordable only.
      const usedT = new Set(standing.filter((e) => e.id === 'turret').map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
      const usedB = new Set(standing.filter((e) => e.id === 'sentry_beacon').map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
      const pick = (id, list, used) => {
        for (const c of list) {
          const key = `${id}@${c.x},${c.z}`;
          if (blacklist.has(key)) continue;
          if (used.has(`${c.x},${c.z}`)) continue;
          if ((tries.get(key) || 0) > 6) continue;
          return c;
        }
        return null;
      };
      let haveT = nT, haveB = nB, cum = 0, emitted = 0;
      for (const rung of LADDER) {
        const isT = rung.id === 'turret';
        if (isT ? haveT > 0 : haveB > 0) { if (isT) haveT--; else haveB--; continue; }
        cum += rung.cost;
        if (cum > gold) break;                       // plan-time affordability
        const spot = pick(rung.id, isT ? TURRETS : BEACONS, isT ? usedT : usedB);
        if (!spot) continue;
        const key = `${rung.id}@${spot.x},${spot.z}`;
        tries.set(key, (tries.get(key) || 0) + 1);
        (isT ? usedT : usedB).add(`${spot.x},${spot.z}`);
        orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
        if (++emitted >= 4) break;
      }

      // 7. THE SINK. A capped purse switches the economy off (gen 39/45): once the
      //    ladder is done, turret tier 2 at 150 is the only stock left.
      const ladderDone = nT >= 4 && nB >= 6;
      if (ladderDone && gold >= TIER2) {
        const up = entries.filter((e) => e.id === 'turret' && !e.wrecked && (e.tier || 1) < 2)[0];
        if (up) {
          orders.push({ verb: 'MOVE_TO', pos: { x: up.position.x, z: up.position.z } });
          orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
        }
      }

      // 8. Economy tail: drain ONE near seam in a block before walking (gen 15/47 —
      //    stack by seam when the seams are far, and 26wu is far against a 1.5s tick).
      const seams = (now.seams || []).filter((s) => s.active && s.x !== null);
      const ranked = seams.slice().sort((a, b) => d(CLAIM, a) - d(CLAIM, b));
      const room = 26 - orders.length;
      if (ranked.length && room > 0) {
        const primary = ranked[0];
        const n = Math.min(room - 1, 12);
        for (let i = 0; i < n; i++) orders.push({ verb: 'HARVEST', seam: primary.id });
        if (ranked[1] && orders.length < 25) orders.push({ verb: 'HARVEST', seam: ranked[1].id });
      }
      // 9. Terminal anchor that cannot be filtered away (gen 42: [] is a wipe).
      orders.push({ verb: 'HOLD', pos: { x: 0, z: 9 } });

      return emit(orders);

      function emit(arr) {
        const a = arr.slice(0, 32);
        const sig = JSON.stringify(a);
        // A draining HARVEST worklist must be resubmitted; only dedupe when the array
        // carries no draining work at all.
        const hasWork = a.some((o) => o.verb === 'HARVEST' || o.verb === 'MOVE_TO' || o.verb === 'BUILD' || o.verb === 'CONTEXT_ACTION');
        if (sig === lastSig && !hasWork) return '\n';
        lastSig = sig;
        return a;
      }
    },
  };
}
