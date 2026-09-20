// Gen 106 controller for e7-dead-band, seed 01, era 6.
// Contract shape (verified this ride): claim (0,12); dead-band-yard x-30..30 z-42..12 so
// build ground reaches the welded hero; roster is one data_rustler (thief:true forces
// wrecker=false, so NOTHING can be wrecked -> no REPAIR_UNDER, no palisade bait);
// no twist.secureWave -> wave 20 / 600s, clockTicks 18000; stockpile max2 @60 -> cap 500.
// Era gate: now.playbookUse.objective === 'refusal'; one PLAYBOOK_USE is REFUSED
// 'signal-suppressed' and the counted refusal IS the latch.

const CLAIM = { x: 0, z: 12 };
const SECURE_T = 600;
const BASE_CAP = 200;
const CAP_PER_STOCKPILE = 150;
const HARD_BUILD_FLOOR = 520; // no build at all past here, no bypass (gen 85/102)
const GATE_ARMS_AT = 150; // a bank gate from t=0 refuses the ladder that wins (gen 79)

// More candidate spots than slots; refusals poison GROUND causes only (gen 51).
const SPOTS = {
  turret: [[0, 10], [-10, 10], [10, 10], [-5, 4], [5, 4], [0, 2], [-15, 8], [15, 8], [-10, 0], [10, 0]],
  sentry_beacon: [[-5, 9], [5, 9], [-3, 5], [3, 5], [0, 7], [-7, 11], [7, 11], [0, 11], [-2, 9], [2, 9], [-6, 6], [6, 6]],
  stockpile: [[-4, -1], [4, -1], [0, -4], [-8, -3], [8, -3], [0, -7], [-12, -2], [12, -2]],
  palisade: [[0, 14], [-4, 14], [4, 14], [-8, 12], [8, 12], [-12, 10], [12, 10], [0, 16], [-6, 15], [6, 15]],
};

// Strategy order, not price order (gen 99). Stockpiles mid-ladder so the purse can never
// pin at 200 while income is still flowing.
const CORE = ['turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'stockpile',
  'sentry_beacon', 'turret', 'stockpile', 'sentry_beacon'];
// Surplus fort: only reachable through the pressure latch or when the gold is already dead.
const SURPLUS = ['sentry_beacon', 'sentry_beacon', 'palisade', 'palisade', 'palisade', 'palisade'];

const ground = new Set(); // poisoned coordinates, GROUND causes only
const retired = new Set(); // ladder ordinals with no candidates left (gen 81)
let lastSubmitT = -99;
let seamBlock = null;
let seamBlockLeft = 0;

function pickSpot(id, entries) {
  const taken = entries.map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`);
  for (const [x, z] of SPOTS[id] || []) {
    const k = `${id}@${x},${z}`;
    if (ground.has(k)) continue;
    if (taken.includes(`${x},${z}`)) continue;
    return { x, z };
  }
  return null;
}

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plating|health|max hp|maxhp|vigor|hearty|tough/.test(s)) return 100;
  if (/dressing|heal|regen|mend/.test(s)) return 90;
  if (/damage|spark|coil|tap|power|bolt/.test(s)) return 60;
  if (/rate|speed|reload|cadence/.test(s)) return 50;
  return 10;
}

export default function controller(view) {
  const n = view.now;
  const sp = view.stablePrefix;

  // pendingSecure: answer with SILENCE. It banks the default, cannot be REJECTED
  // (a rejected array inside the choice window desyncs the replay - gen 84), and keeps
  // the last accepted order off the terminal tick 18000 (F-HEAT11-1).
  if (n.pendingSecure) return null;

  const t = (n.timers && (n.timers.runSeconds ?? n.timers.simTimeSeconds)) || 0;
  const gold = n.gold || 0;
  const panned = (n.score && n.score.goldPanned) || 0;
  const entries = (n.works && n.works.entries) || [];
  const byKind = (n.works && n.works.byKind) || {};
  const hero = n.hero || {};
  const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;

  // Refusal blacklist, fed from the view's own order records.
  for (const rec of n.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD') continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (/insufficient_gold/.test(reason)) continue; // ECONOMY: retry, poison nothing
    if (o.where) ground.add(`${o.what}@${Math.round(o.where.x)},${Math.round(o.where.z)}`);
  }

  const stockpiles = entries.filter((e) => e.id === 'stockpile' && !e.wrecked).length;
  const cap = BASE_CAP + CAP_PER_STOCKPILE * stockpiles;
  const rate = t > 20 ? panned / t : 1.2; // exact here: panning is the whole income
  const runway = Math.max(0, SECURE_T - t);
  // Bank gate: a spend is allowed only if the purse can still refill to the cap by the
  // secure tick. Before GATE_ARMS_AT, always buy. Bypass only when the run may actually end.
  const allow = (cost) => {
    if (t >= HARD_BUILD_FLOOR) return false;
    if (t < GATE_ARMS_AT) return true;
    if (hpFrac < 0.55) return true;
    return (gold - cost) + rate * runway >= cap + 5;
  };
  // "Dead gold": the purse will overflow the cap anyway, so spending it is free.
  const deadGold = (cost) => t < HARD_BUILD_FLOOR && (gold - cost) + rate * runway >= cap + 5;

  const orders = [];

  // 1. Draft first under replace semantics.
  if (n.pendingOffer && n.pendingOffer.length) {
    const best = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. The era gate. One refusal latches it; drop the order once met.
  const pb = n.playbookUse || {};
  if (pb.declared && !pb.objectiveMet) {
    orders.push({ verb: 'PLAYBOOK_USE', name: `dead-band-${Math.max(1, n.wave || 0)}` });
  }

  // 3. Free supplementary damage. Returns {} on success AND failure, so it is safe above
  //    the traveller and never owns a tick it cannot use.
  if ((n.blastReadyInMs || 0) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 18 } });

  // 4. Displacement guard. The hero has no drift, so silence is the hold; this only ever
  //    fires if something knocks it off the claim.
  const dx = (hero.x ?? CLAIM.x) - CLAIM.x, dz = (hero.z ?? CLAIM.z) - CLAIM.z;
  if (Math.hypot(dx, dz) > 1.2) orders.push({ verb: 'MOVE_HERO', pos: CLAIM });

  // 5. The ladder: exactly ONE head rung, priced at the live instance index.
  const built = {};
  for (const e of entries) built[e.id] = (built[e.id] || 0) + 1;
  const walked = {};
  const emergency = hpFrac < 0.60;
  const ladder = CORE.concat(SURPLUS);
  for (let i = 0; i < ladder.length; i++) {
    const id = ladder[i];
    walked[id] = (walked[id] || 0) + 1;
    if (retired.has(i)) continue;
    const standing = built[id] || 0;
    if (standing >= walked[id]) continue; // this rung is already satisfied
    const def = (sp.mechanics.buildables || []).find((b) => b.id === id);
    if (!def) { retired.add(i); continue; }
    if (standing >= (def.maxCount ?? 0)) { retired.add(i); continue; }
    const cost = def.costs[Math.min(standing, def.costs.length - 1)];
    const isSurplus = i >= CORE.length;
    if (isSurplus && !(emergency || deadGold(cost))) break;
    if (gold < cost) break;              // plan-time affordability
    if (!allow(cost)) break;             // the bank gate
    const where = pickSpot(id, entries);
    if (!where) { retired.add(i); continue; } // retire, never stall the rungs behind it
    orders.push({ verb: 'BUILD', what: id, where, when: { goldGte: cost } });
    break;
  }

  // 6. The tail IS the economy and the clock. Prefer live seams near the claim, but always
  //    fall back to the nearest live one at any distance (gen 101). Filter non-finite
  //    coordinates first: an inactive seam publishes x/z/anchorIndex as null and one
  //    non-finite number refuses the WHOLE array, silently.
  const live = (n.seams || []).filter((s) => s.active !== false
    && Number.isFinite(s.x) && Number.isFinite(s.z));
  if (live.length) {
    const d = (s) => Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z);
    const near = live.filter((s) => d(s) <= 25).sort((a, b) => d(a) - d(b));
    const pool = near.length ? near : [...live].sort((a, b) => d(a) - d(b));
    if (!seamBlock || seamBlockLeft <= 0 || !pool.some((s) => s.id === seamBlock)) {
      seamBlock = pool[0].id;
      seamBlockLeft = 7;
    }
    const chain = [seamBlock, ...pool.map((s) => s.id).filter((id) => id !== seamBlock)];
    const room = 31 - orders.length;
    for (let k = 0; k < room; k++) orders.push({ verb: 'HARVEST', seam: chain[k % chain.length] });
    seamBlockLeft--;
  }

  // Reel budget: throttle resubmission unless something real changed.
  const sig = `${orders.length}|${orders[0] && orders[0].verb}|${seamBlock}|${built.turret || 0}|${built.sentry_beacon || 0}|${built.stockpile || 0}`;
  const changed = sig !== controller._sig;
  controller._sig = sig;
  if (!changed && !n.pendingOffer && t - lastSubmitT < 1.5) return null;
  lastSubmitT = t;
  return orders.slice(0, 32);
}
