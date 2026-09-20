// e6-half-life-hollow controller v1
//
// SECURE = wave >= 20 (Balance.run.secureWave; twist declares none)
//          AND HollowCrossingSystem.stage === 'complete'
//          (HeadlessContractSim.ts:1103 -> !hollowCrossing.objectiveAllowsSecure => MAX_SAFE_INTEGER)
//
// The crossing is driven by the PROSPECTOR's position (HeadlessContractSim.ts:1503) and its
// radiation damage lands on the HERO (:1504). The central causeway carries NO radiation, so the
// whole errand is two MOVE_TOs down x=0.
//   launch shelf  z -54..-40, causeway x -7..7 z -40..40  ->  z=-40 is inside BOTH,
//   so one touch of (0,-40) runs launch->crossing->extraction in a single update() call.
// Then within 6wu of the extraction stake (0,48).
//
// Income is the pen: exhausted machines captured within 2.2wu pay 1g each per 15s, forever.
// Idle banked ZERO gold in 522s while 306 machines exhausted on the board untouched.

const CLAIM = { x: 0, z: 12 };
const POST = { x: 1.5, z: 12 };      // capture post: where the machines walk to, beside the hero
const SHELF = { x: 0, z: -42 };      // solidly inside south-launch-shelf
const STAKE = { x: 0, z: 48 };       // extraction stake

// east-countdown-ground is x 8..42, z 10..26 -- the only build zone within turret range of the
// claim (nearest point (8,12) is 8wu out; turret range is 16).
const TURRET_SPOTS = [
  { x: 8, z: 12 }, { x: 8, z: 16 }, { x: 12, z: 10 }, { x: 12, z: 16 },
  { x: 9, z: 20 }, { x: 14, z: 13 }, { x: 8, z: 24 }, { x: 15, z: 19 },
];
const BEACON_SPOTS = [
  { x: 10, z: 13 }, { x: 10, z: 18 }, { x: 14, z: 16 }, { x: 8, z: 20 },
  { x: 13, z: 22 }, { x: 16, z: 12 }, { x: 11, z: 25 }, { x: 17, z: 16 },
  { x: 19, z: 12 }, { x: 16, z: 24 },
];

const LADDER = [
  { what: 'turret', price: 50 }, { what: 'turret', price: 70 },
  { what: 'turret', price: 95 }, { what: 'turret', price: 125 },
  { what: 'sentry_beacon', price: 25 }, { what: 'sentry_beacon', price: 35 },
  { what: 'sentry_beacon', price: 45 }, { what: 'sentry_beacon', price: 55 },
  { what: 'sentry_beacon', price: 75 }, { what: 'sentry_beacon', price: 95 },
];

const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z) < 2.0;

// Prefer survivability, then damage. Never offer[0] blindly (gen-11 secured at 4hp doing that).
function scoreUpgrade(u) {
  const t = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|max hp|maxhp|health|vitality|tough|armor|armour/.test(t)) s += 100;
  if (/heal|regen|mend|repair/.test(t)) s += 60;
  if (/damage|spark|dmg|power|coil|tap|blast/.test(t)) s += 40;
  if (/range|reach/.test(t)) s += 20;
  if (/fire rate|rate|speed|cadence/.test(t)) s += 25;
  if (/gold|pan|seam|income/.test(t)) s += 5;
  return s;
}

export default function controller(view) {
  const now = view.now;

  // pendingSecure accepts EXACTLY one order and refuses anything else (StandingOrders.ts:178).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // Replace semantics: the pick must own the tick, so it goes first and everything is resent.
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // --- the era's errand, derived from the view's own stage, never from my own clock ---
  const stage = now.hollowCrossing ? now.hollowCrossing.stage : 'complete';
  if (stage === 'launch') {
    orders.push({ verb: 'MOVE_TO', pos: SHELF });
    orders.push({ verb: 'MOVE_TO', pos: STAKE });
  } else if (stage === 'crossing' || stage === 'extraction') {
    orders.push({ verb: 'MOVE_TO', pos: STAKE });
  }

  // --- build ladder: next unbuilt rung onward, cut at the first price decrease (gen-9) ---
  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };
  const usedTurret = [];
  const usedBeacon = [];
  for (const e of entries) {
    const p = e.position || e;
    if (!p || typeof p.x !== 'number') continue;
    if (e.id === 'turret') usedTurret.push(p); else if (e.id === 'sentry_beacon') usedBeacon.push(p);
  }
  const freeSpot = (spots, used) => spots.find((s) => !used.some((u) => near(s, u)));

  let idx = built.turret + built.sentry_beacon;
  // ladder index: turrets first, then beacons
  idx = built.turret < 4 ? built.turret : 4 + built.sentry_beacon;
  let lastPrice = -1;
  let takenT = 0, takenB = 0;
  for (let i = idx; i < LADDER.length && orders.length < 8; i += 1) {
    const rung = LADDER[i];
    if (rung.price < lastPrice) break;              // cut at the first price decrease
    lastPrice = rung.price;
    const spots = rung.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const used = rung.what === 'turret'
      ? usedTurret.concat(TURRET_SPOTS.slice(0, 0))
      : usedBeacon;
    // skip candidates already claimed by this same array's earlier rungs
    const skip = rung.what === 'turret' ? takenT : takenB;
    const avail = spots.filter((s) => !used.some((u) => near(s, u)));
    const where = avail[skip];
    if (!where) continue;
    if (rung.what === 'turret') takenT += 1; else takenB += 1;
    orders.push({ verb: 'BUILD', what: rung.what, where, when: { goldGte: rung.price } });
  }

  // --- the income: CAPTURE owns one tick then its record is spent, so stack it ---
  const room = 31 - orders.length;
  for (let i = 0; i < room; i += 1) orders.push({ verb: 'CAPTURE' });

  // anchor last: HOLD always returns, so nothing after it would ever run
  orders.push({ verb: 'HOLD', pos: stage === 'complete' ? POST : STAKE });

  return orders.slice(0, 32);
}
