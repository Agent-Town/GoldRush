// Gen 107 — e7-echo-canyon. The gen-6→106 skeleton, retargeted, plus the one thing this board
// does differently: the era gate is a MIRROR of my own tape, so the tape is a design surface.
//
// Era gate: E7PlaybookLatch.allowsSecure('mirror') === fieldedMirrors > 0.
// BroadcastMirror.shapeOfTape: wrecker = (tape contains any BUILD); hunts = (turret BUILD |
// BLAST_AT | SET_WEAPON blast); count = clamp(2 + floor(actingEntries/4), 2, 4); hpScale *= 1+0.1*repeat.
// Neither roster entry (rogue_automaton, data_rustler[thief]) is a wrecker — so a careless
// demonstration would ADD the one enemy class this board otherwise lacks. Record quiet.

const QUIET_NAME = 'echo-canyon-quiet-pan';
const SECURE_T = 600;
const HARD_BUILD_STOP = 520;      // no BUILD at all after this, bypasses included
const BANK_GATE_FROM = 300;       // arithmetic gate only late in the run
const SEAM_REACH = 34;            // prefer seams inside this of the post; fall back to nearest LIVE

// Ladder in STRATEGY order (never price order): turrets are ~57dps, beacons ~13-30.
// No stockpile: data_rustler is thief:true and the mirror is a thief too — a stockpile is what
// makes nearestGoldHolding non-empty and converts every thief from hero-chaser to gold-grabber
// (gen 106 measured -435 gold on e7-dead-band's thief-only roster).
const LADDER = [
  { id: 'turret' }, { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'turret' }, { id: 'turret' }, { id: 'sentry_beacon' },
  { id: 'sentry_beacon' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
];

// canyon-floor-yard: x -30..30, z -42..10. Claim ~ (0,12), 2wu north of the yard edge.
// Turret range 16 from the z=9 line covers the claim and both canyon mouths.
// Beacon radius 8 reaches a hero at (0,12) only from |x| <= 7.4 on z=9.
const TURRET_SPOTS = [
  [0, 9], [-8, 9], [8, 9], [-4, 9], [4, 9], [-14, 9], [14, 9],
  [-11, 8], [11, 8], [0, 7], [-18, 9], [18, 9], [-6, 6], [6, 6],
];
const BEACON_SPOTS = [
  [-3, 10], [3, 10], [-6, 9], [6, 9], [0, 10], [-2, 8], [2, 8],
  [-5, 7], [5, 7], [0, 5], [-7, 10], [7, 10], [-1, 6], [1, 6], [-3, 4], [3, 4],
];

const PLATING = /plating|dressing|vigor|hearty|tough|armor|armour|bulwark|hide/i;
const DAMAGE = /spark|tap|coil|damage|volley|heavy|pierce/i;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`;
  if (PLATING.test(s)) return 100;
  if (DAMAGE.test(s)) return 50;
  return 10;
}

// A live seam publishes finite x/z; an INACTIVE one publishes x/z/anchorIndex as null, and one
// non-finite number refuses the WHOLE array silently.
function liveSeams(now) {
  return (now.seams || []).filter((s) =>
    s && s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z) && typeof s.id === 'string');
}

export function makeController() {
  let phase = 0;
  const built = { turret: 0, sentry_beacon: 0, palisade: 0 };   // only MY builds
  const ground = new Set();       // poisoned coordinates (out_of_zone/collision/terrain/cap)
  const tries = new Map();        // per-rung patience
  let retired = new Set();        // ladder indices with no candidates left
  let maxGold = 0;
  let panRate = 1.2;
  let usedPlaybook = false;
  let lastPanT = 0, lastPan = 0;

  function costOf(view, id, standing) {
    const b = (view.stablePrefix?.mechanics?.buildables || []).find((x) => x.id === id);
    if (!b || !Array.isArray(b.costs)) return 9999;
    const i = Math.min(standing, b.costs.length - 1);
    return b.costs[i] ?? 9999;
  }
  function capOf(view, id) {
    const b = (view.stablePrefix?.mechanics?.buildables || []).find((x) => x.id === id);
    return b?.maxCount ?? 0;
  }

  // The quiet demonstration: HARVEST only. No BUILD (would make the mirror a WRECKER on a board
  // with none), no BLAST_AT / SET_WEAPON blast (would make it HUNT from 18wu), no MOVE_HERO.
  function quietPan(now) {
    const seams = liveSeams(now);
    const out = [];
    if (seams.length) {
      seams.sort((a, b) => Math.hypot(a.x, a.z - 12) - Math.hypot(b.x, b.z - 12));
      for (let k = 0; k < 8; k++) out.push({ verb: 'HARVEST', seam: seams[Math.min(k >> 2, seams.length - 1)].id });
    } else {
      out.push({ verb: 'HARVEST', seam: 'gold-seam-1' });
    }
    return out;
  }

  return {
    decide(view, row) {
      const now = view.now || {};
      const t = now.timers?.runSeconds ?? 0;
      const gold = now.gold ?? 0;
      maxGold = Math.max(maxGold, gold);
      const pan = now.score?.goldPanned ?? 0;
      if (t > lastPanT + 20) { panRate = Math.max(0.5, (pan - lastPan) / (t - lastPanT)); lastPanT = t; lastPan = pan; }

      // 1. The secure boundary is answered with SILENCE. It banks the configured default, cannot be
      //    REJECTED (a rejected array inside the choice window is invisible to the tape and visible
      //    to the sim, so the replay diverges — gen 84), and keeps the last order inside the envelope.
      if (now.pendingSecure) return null;

      // 2. Phase 0: the demonstration. One array, quiet.
      if (phase === 0) { phase = 1; return quietPan(now); }

      // 3. Phase 1: record + use in one order. Earliest legal moment => repeat 0, hpScale 1,
      //    2 bodies (MIN_SQUAD), thief, no rove, no hunt. The cheapest legal shadow.
      if (phase === 1) {
        phase = 2;
        usedPlaybook = true;
        return [{ verb: 'PLAYBOOK_USE', name: QUIET_NAME }, ...quietPan(now)];
      }

      // 4. Phase 2+: ordinary play. The wheel comes back on this submission.
      const orders = [];

      // Draft first under replace semantics; plating-first scorer (maxHp 100 -> 175).
      if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
        const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
        orders.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      // Free supplementary damage. BLAST_AT returns {} on success AND failure, so it is safe
      // anywhere and belongs ABOVE any travelling verb. Safe now: the tape is already recorded.
      if ((now.blastReadyInMs ?? 1) === 0) {
        orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 6 } });
      }

      // Displacement guard only — the hero starts on the claim, has no drift, so silence IS the
      // hold, and the unemployed Prospector drifts to the hero (where HOLD used to park it).
      const hx = now.hero?.x ?? 0, hz = now.hero?.z ?? 12;
      if (Number.isFinite(hx) && Number.isFinite(hz) && Math.hypot(hx - 0, hz - 12) > 1.2) {
        orders.push({ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } });
      }

      // Refusal blacklist, partitioned: GROUND poisons the coordinate, ECONOMY never does.
      for (const rec of (now.orders || [])) {
        const o = rec?.order || rec;
        if (!o || o.verb !== 'BUILD' || rec.status !== 'failed') continue;
        const why = String(rec.reason || rec.detail || '');
        if (/insufficient_gold/i.test(why)) continue;              // transient — retry, poison nothing
        if (o.where) ground.add(`${o.what}@${o.where.x},${o.where.z}`);
      }

      // Track what I have actually built (never conflate with pre-placed / map furniture).
      const byKind = now.works?.byKind || {};
      for (const k of Object.keys(built)) built[k] = byKind[k] ?? built[k];

      // One head rung, plan-time affordable. Ordinal accounting: skip rungs already satisfied by
      // MY standing instances; price the first unsatisfied one at costs[standing].
      const ordinal = { turret: 0, sentry_beacon: 0, palisade: 0 };
      let rung = null, rungIdx = -1;
      for (let i = 0; i < LADDER.length; i++) {
        const id = LADDER[i].id;
        ordinal[id] += 1;
        if (retired.has(i)) continue;
        const standing = byKind[id] ?? 0;
        if (standing >= ordinal[id]) continue;                     // already satisfied
        if (standing >= capOf(view, id)) { retired.add(i); continue; }
        rung = id; rungIdx = i; break;
      }

      const wantBuild = rung && t < HARD_BUILD_STOP;
      if (wantBuild) {
        const price = costOf(view, rung, byKind[rung] ?? 0);
        // Bank gate, armed late only: gold is the ONLY free ranking axis (waves and timeAlive are
        // pinned by the wave-20 secure). Allow the spend only if the purse can still refill.
        const cap = Math.max(200, maxGold);
        const runway = Math.max(0, SECURE_T - t);
        const bankOk = t < BANK_GATE_FROM || ((gold - price) + panRate * runway >= cap + 5);
        if (gold >= price && bankOk) {
          const spots = rung === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
          const occupied = new Set((now.works?.entries || [])
            .map((e) => `${Math.round(e.position?.x ?? e.x ?? 999)},${Math.round(e.position?.z ?? e.z ?? 999)}`));
          const pick = spots.find(([x, z]) =>
            !ground.has(`${rung}@${x},${z}`) && !occupied.has(`${x},${z}`));
          if (pick) {
            orders.push({ verb: 'BUILD', what: rung, where: { x: pick[0], z: pick[1] }, when: { goldGte: price } });
            const n = (tries.get(rungIdx) ?? 0) + 1;
            tries.set(rungIdx, n);
            if (n > 8) retired.add(rungIdx);                       // patience budget
          } else {
            retired.add(rungIdx);                                  // RETIRE, never stall the rungs behind it
          }
        }
      }

      // Harvest tail — the economy and the clock. Prefer seams inside SEAM_REACH of the post, but
      // ALWAYS fall back to the nearest LIVE seam when the cap admits none (gen 101: a reach cap
      // that excludes every live seam turns the tail into a no-op and freezes the purse).
      const seams = liveSeams(now);
      if (seams.length) {
        const ranked = [...seams].sort((a, b) =>
          Math.hypot(a.x - 0, a.z - 12) - Math.hypot(b.x - 0, b.z - 12));
        const near = ranked.filter((s) => Math.hypot(s.x - 0, s.z - 12) <= SEAM_REACH);
        const chain = (near.length ? near : ranked).slice(0, 2);
        const room = 32 - orders.length;
        // Drain one seam in a block of 7 before walking to the next.
        for (let k = 0; k < room; k++) {
          const s = chain[Math.min(Math.floor(k / 7), chain.length - 1)];
          orders.push({ verb: 'HARVEST', seam: s.id });
        }
      } else if (orders.length < 32) {
        orders.push({ verb: 'HARVEST', seam: 'gold-seam-1' });
      }

      return orders.slice(0, 32);
    },
  };
}
