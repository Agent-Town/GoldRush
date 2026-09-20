// e8-far-side controller, heat 13 (post-ADR-005 grammar).
//
// Contract shape (read from source, not memory):
//   secure = wave>=20 AND probeRecovery.recovered AND suitAir.objectiveAllowsSecure
//   suitAir: crossingRequired 4 credits, at most ONE per 120 s window (crossingWindowWaves 4 x 30 s).
//   Both gates measure THE HERO (HeadlessContractSim:2069 hero.group.position, :3034 recover).
//   Shelter = far-side-landing-yard (x -24..24, z -48..-30), contains the claim/heroStart (0,-36).
//   Crater  = listening-probe-crater (x -14..14, z 38..52). 68 units of vacuum each way.
//   Suit 60 s, 1 s/s drain outside, 5 hp/s once empty. Hero 4.8 u/s; shambler speedMult 0.72.
//   Roster has no wrecker and no thief -> nothing can be attacked, nothing stolen.

const CLAIM = { x: 0, z: -36 };
const CRATER = { x: 0, z: 44 };
const YARD = { minX: -24, maxX: 24, minZ: -48, maxZ: -30 };

const TURRETS = [
  { x: 0, z: -31 }, { x: -10, z: -31 }, { x: 10, z: -31 },
  { x: -19, z: -33 }, { x: 19, z: -33 }, { x: 0, z: -41 },
  { x: -10, z: -41 }, { x: 10, z: -41 }, { x: -15, z: -31 }, { x: 15, z: -31 },
];
const BEACONS = [
  { x: -4, z: -31 }, { x: 4, z: -31 }, { x: 0, z: -30.5 },
  { x: -7, z: -36 }, { x: 7, z: -36 }, { x: -4, z: -41 },
  { x: 4, z: -41 }, { x: 0, z: -42 }, { x: -8, z: -32 }, { x: 8, z: -32 },
];
// INTERLEAVED, and that is a measurement rather than a preference. tune-2 rode turrets-first on
// the theory that 57 dps for 50 g beats a beacon's ~13-30 — and died two waves EARLIER (w12 /
// 364 s against w14 / 443 s) with a FULLER fort (4 turrets + 4 beacons standing). On this board
// the thing that dies is the hero, not the claim, and the short-radius beacons sit inside 8 units
// of the body that has to live while the turrets cover ground. Cheap cover early beats raw dps.
const LADDER = ['turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret',
  'sentry_beacon', 'turret', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'];

const PLATING = /plating|dressing|hearty|vigor|constitution|armou?r|health|hp|tough/i;
const DAMAGE = /spark|damage|coil|tap|heavy|pierce|blast|crit/i;

const inRect = (p, r) => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const fin = (n) => typeof n === 'number' && Number.isFinite(n);

export default function makeOrders(view, S) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};

  // ---- one-time setup ----
  if (!S.init) {
    S.init = true;
    S.blacklist = new Set();      // GROUND refusals only (never insufficient_gold)
    S.tries = new Map();          // patience budget per coordinate
    S.costs = {};
    for (const b of (sp.mechanics && sp.mechanics.buildables) || []) S.costs[b.id] = b.costs || [];
    S.tripDone = 0;
    S.log = [];
  }

  // ---- 1. the secure boundary: blank line banks it for free, one fewer entry,
  //         and keeps the last accepted order inside the tick envelope. ----
  if (now.pendingSecure) return null;

  const hero = now.hero || {};
  const H = { x: hero.x, z: hero.z };
  const heroOk = fin(H.x) && fin(H.z);
  const air = now.air || {};
  const suit = air.suit || {};
  const cross = air.crossing || {};
  const probe = now.probeRecovery || {};
  const t = (now.timers && now.timers.runSeconds) || 0;

  const orders = [];

  // ---- 2. the draft, first, under replace semantics. Plating first: on a map whose
  //         only survival budget is the hero's own bar, maxHp is the cheapest margin. ----
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bestScore = -1e9;
    for (const o of now.pendingOffer) {
      const txt = `${o.id} ${o.name} ${o.effectText || ''}`;
      let s = 0;
      if (PLATING.test(txt)) s += 100;
      if (DAMAGE.test(txt)) s += 40;
      if (/speed|heel|swift|boot/i.test(txt)) s += 25; // faster hero = shorter vacuum exposure
      if (/gold|luck|pan|seam/i.test(txt)) s += 5;
      if (s > bestScore) { bestScore = s; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // ---- 3. free supplementary damage. BLAST_AT returns {} on success AND failure,
  //         so it never owns the tick and is safe above the movement orders. ----
  if (now.blastReadyInMs === 0 && heroOk) {
    orders.push({ verb: 'BLAST_AT', pos: { x: +(H.x).toFixed(2), z: +(H.z + 6).toFixed(2) } });
  }

  // ---- 4. THE ERRAND. Both secure gates live at the hero's feet, so this is a
  //         MOVE_HERO round trip written as ONE draining array: walk out (blocks until
  //         arrival), recover, walk home (blocks until arrival), then the tail resumes. ----
  const inCrater = heroOk && H.x >= -14 && H.x <= 14 && H.z >= 38 && H.z <= 52;
  const needProbe = probe.declared !== false && probe.recovered === false;
  // THE HARD STOP. `objectiveAllowsSecure` is `reached >= zones && credited >= required`
  // (E8SuitAirSystem:366). tune-1 kept walking the hero into the crater after credit 4 — three
  // windowHeldEntries that banked nothing and dragged the swarm off the fort. Once both era
  // gates are shut, the hero never leaves the yard again.
  const creditsDone = (cross.credited || 0) >= (cross.required || 4)
    && (cross.reached || []).length >= (cross.zones || []).length;
  const needCross = !creditsDone;
  const windowFree = (cross.creditedThisWindow || 0) === 0;
  const airSec = fin(suit.seconds) ? suit.seconds : 60;

  // Window 0 is spent on the opening economy: the idle floor dies at w2/79 s, so the
  // first turret outranks a credit that has 120 s of window left. Later windows trip
  // the moment they open, because a missed window costs a whole 120 s.
  const windowIdx = cross.window || 0;
  // A trip takes the hero out of its own turret ring for ~32 s with the swarm in tow, so it is
  // spent out of hit points as much as out of air. Defer a wounded trip while the window still
  // has room for a later view; take it anyway once the window is nearly gone, because a missed
  // window costs 120 s and the run only holds one spare.
  const hpFrac = fin(hero.hp) && fin(hero.maxHp) && hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
  const windowLeft = 120 - (t % 120);
  const healthy = hpFrac >= 0.45 || windowLeft <= 45;
  const tripAllowed = (windowIdx > 0 || t >= 55) && healthy;
  const wantTrip = (needProbe || (needCross && windowFree)) && tripAllowed;

  if (inCrater) {
    // Already across: bank the probe and leave. Credit fired on entry.
    if (needProbe) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    S.tripDone++;
  } else if (needProbe && !needCross) {
    // Credits are in but the probe is not: one more trip, then home for good.
    orders.push({ verb: 'MOVE_HERO', pos: { x: CRATER.x, z: CRATER.z } });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  } else if (wantTrip && airSec > 34) {
    // 76 units out + 76 back at 4.8 u/s is ~32 s of a 60 s tank; refuse to start
    // a trip that the suit cannot finish rather than pay 5 hp/s at the far end.
    orders.push({ verb: 'MOVE_HERO', pos: { x: CRATER.x, z: CRATER.z } });
    if (needProbe) orders.push({ verb: 'CONTEXT_ACTION', action: 'recover' });
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  } else if (heroOk && (!inRect(H, YARD) || dist(H, CLAIM) > 1.0)) {
    // Come home / stay home. Above the tail so it corrects before the worklist owns ticks.
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  const onErrand = inCrater || (wantTrip && airSec > 34);

  // ---- 5. the ladder: plan-time affordable, cumulatively gated so a cheap rung can
  //         never take gold an expensive one is waiting for. ----
  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const taken = entries.filter(e => e && e.position).map(e => e.position);

  // GROUND refusals poison a coordinate; ECONOMY refusals (insufficient_gold) poison nothing.
  for (const rec of (now.orders || [])) {
    const o = rec && rec.order;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    const key = `${o.where.x},${o.where.z}`;
    if (rec.status === 'failed') {
      const why = `${rec.reason || ''} ${rec.detail || ''}`;
      if (/insufficient_gold/i.test(why)) continue;
      const n = (S.tries.get(key) || 0) + 1;
      S.tries.set(key, n);
      if (n >= 2 || /out_of_zone|collision|UNREACHABLE|cap_reached/i.test(why)) S.blacklist.add(key);
    }
  }

  const spotFor = (kind, reserved) => {
    const pool = kind === 'turret' ? TURRETS : BEACONS;
    for (const c of pool) {
      const key = `${c.x},${c.z}`;
      if (S.blacklist.has(key) || reserved.has(key)) continue;
      if (taken.some(p => fin(p.x) && Math.hypot(p.x - c.x, p.z - c.z) < 2.6)) continue;
      return c;
    }
    return null;
  };

  const counts = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };
  const used = { turret: 0, sentry_beacon: 0 };
  const reserved = new Set();
  let cum = 0;
  let ladderDone = true;
  const builds = [];
  for (const kind of LADDER) {
    const idx = counts[kind] + used[kind];
    const arr = S.costs[kind] || [];
    const cost = arr[idx];
    if (!fin(cost)) continue;             // past the cap for this buildable
    if (used[kind] + counts[kind] >= idx + 1 && false) continue;
    ladderDone = false;
    cum += cost;
    if ((now.gold || 0) < cum) break;     // plan-time affordability, cumulative
    const spot = spotFor(kind, reserved);
    if (!spot) { cum -= cost; continue; }
    reserved.add(`${spot.x},${spot.z}`);
    used[kind]++;
    builds.push({ verb: 'BUILD', what: kind, where: { x: spot.x, z: spot.z }, when: { goldGte: cost } });
  }
  // Ladder is finished when no rung has an affordable-in-principle price left.
  const ladderCapped = LADDER.every(k => !fin((S.costs[k] || [])[counts[k]]));

  // Builds ride BELOW the movement orders unconditionally: a trip array's MOVE_HERO(home)
  // completes mid-array, and everything under it then runs on the same standing set instead of
  // idling until the next wave boundary. Suppressing them cost tune-1 whole build windows.
  orders.push(...builds);

  // ---- 6. the sink. A capped purse switches panning OFF (Economy refuses the credit),
  //         so tier-2 is an INCOME mechanic here, not just more dps. CONTEXT_ACTION does
  //         not travel and reaches 1.6 units, so pair it with a MOVE_HERO at a fixed
  //         0.7 offset toward the claim (gen-65: a fractional offset overshoots). ----
  if (!onErrand && ladderCapped && (now.gold || 0) >= 150) {
    const up = entries.find(e => e && e.id === 'turret' && (e.tier || 1) < 2 && e.position && fin(e.position.x));
    if (up) {
      const p = up.position;
      const d = Math.hypot(CLAIM.x - p.x, CLAIM.z - p.z) || 1;
      const stand = { x: +(p.x + (CLAIM.x - p.x) / d * 0.7).toFixed(2), z: +(p.z + (CLAIM.z - p.z) / d * 0.7).toFixed(2) };
      orders.push({ verb: 'MOVE_HERO', pos: stand });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
      orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    }
  }

  // ---- 7. the harvest tail. Drain one seam in a block before walking to the next;
  //         a failing HARVEST is free (the Prospector already stands there) and its
  //         order_failure surprise is what buys decision points between wave boundaries. ----
  const seams = ((now.seams) || []).filter(s => s && s.active !== false && fin(s.x) && fin(s.z) && typeof s.id === 'string');
  const anchor = heroOk ? H : CLAIM;
  seams.sort((a, b) => dist(a, anchor) - dist(b, anchor));
  const room = 32 - orders.length;
  if (room > 0 && seams.length) {
    const block = Math.max(1, Math.min(7, Math.floor(room / Math.min(3, seams.length)) || 1));
    let n = 0;
    outer: for (const s of seams) {
      for (let i = 0; i < block; i++) {
        if (n >= room) break outer;
        orders.push({ verb: 'HARVEST', seam: s.id });
        n++;
      }
    }
  }

  if (orders.length === 0) return null;
  return orders.slice(0, 32);
}
