// e8-mare-claim controller — generation 111.
//
// The contract: wave-20 / 600 s default secure (twist declares no secureWave), ANDed with
// now.air.regolith.complete — four DISTINCT regolith grounds worked, at most one credited per
// 120 s window, each while THE HERO'S suit holds air (E8AtmosphereSystem.notePan reads
// suitForActor(0) = the hero; owner directive 2026-09-07). The Prospector's hands pan; her lungs
// pay. So: park her inside the dome-cluster-pad-center's breathing ellipse and dispatch it out.
//
// Roster is scrap_corsair + sun_glare_shambler: NO wrecker, NO thief (Balance.e8Roster). Nothing
// can be wrecked and nothing stolen, so REPAIR_UNDER and palisade chaff are dead weight and the
// stockpile is a SAFE +150 cap each. Gold is the only free ranking axis at a fixed-wave secure.

const POST = { x: 0, z: 3 };           // inside the radius-6 breathing ellipse, 3 north of centre
const SECURE_T = 600;
const HARD_BUILD_FLOOR = 540;          // no BUILD after this EXCEPT for a dying run (see below)
const BASE_CAP = 200;
const STOCK_BONUS = 150;

// tune-1 measured the whole contract: the era gate closed at t=366 with zero breathless pans and
// the hero still died at w19/587 with 470 gold idle, because the last 270 gold of fort sat behind
// an `urgent` latch that armed at t=504 — four seconds AFTER the hard floor had shut. A gate that
// hoards gold for a score while the fort is short hoards it for a run that dies. So the whole
// ten-work fort is CORE now, interleaved so dps ramps with the wave, and the floor yields to a
// dying run. Gold is the ranked axis, but a dead run banks nothing.
const CORE = ['turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon',
  'turret', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'stockpile', 'stockpile'];
const EMERGENCY = [];

// More candidate spots than slots. Turrets (range 16) ring the pad; beacons (radius 8) and
// stockpiles sit close in. Nothing within 1.5 of POST.
const SPOTS = {
  turret: [[-5, -5], [5, -5], [-5, 5], [5, 5], [-5, 0], [5, 0], [0, -5], [-5, -2], [5, 2], [-3, -5], [3, -5], [-5, 2], [5, -2]],
  sentry_beacon: [[-3, 0], [3, 0], [0, -3], [-2, -2], [2, -2], [-2, 2], [2, 2], [-4, 0], [4, 0], [0, -4], [-4, -3], [4, -3], [-1, -5], [1, -5]],
  stockpile: [[-2, 0], [2, 0], [0, -2], [-1, -3], [1, -3], [-3, -3], [3, -3], [-3, 2], [3, 2]],
};

const banned = new Set();   // GROUND refusals only: poison the coordinate
const placed = [];          // what I have built, by id
let rateSeen = 0;

const key = (id, p) => `${id}@${p[0]},${p[1]}`;

function costOf(view, id, standing) {
  const b = (view.stablePrefix.mechanics.buildables || []).find(x => x.id === id);
  if (!b) return Infinity;
  const c = b.costs || [];
  if (standing < c.length) return c[standing];
  const last = c[c.length - 1] ?? 50;
  return Math.ceil((last * 1.3) / 5) * 5;
}
function maxOf(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find(x => x.id === id);
  return b ? (b.maxCount ?? 0) : 0;     // field is maxCount, not max (gen 76)
}

// Pick the first unsatisfied rung of a ladder. ordinal counts rungs of that id walked past, so a
// rung is satisfied when *I* have built that many; pre-placed furniture is not mine (gen 102).
function nextRung(view, ladder, mineCount) {
  const seen = {};
  for (const id of ladder) {
    seen[id] = (seen[id] || 0) + 1;
    if ((mineCount[id] || 0) >= seen[id]) continue;
    return { id, ordinal: seen[id] };
  }
  return null;
}

function pickSpot(view, id) {
  const standing = (view.now.works.byKind || {})[id] || 0;
  if (standing >= maxOf(view, id)) return null;
  const taken = new Set((view.now.works.entries || []).map(e => `${Math.round(e.position?.x ?? e.x)},${Math.round(e.position?.z ?? e.z)}`));
  for (const p of SPOTS[id] || []) {
    if (banned.has(key(id, p))) continue;
    if (taken.has(`${p[0]},${p[1]}`)) continue;
    return p;
  }
  return null;   // no candidates left -> caller RETIRES this rung, never stalls behind it (gen 81)
}

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plating|max health|maxhp|vitality|tough|armou?r/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 80;
  if (/spark|damage|tap|coil|fire rate|power/.test(s)) return 50;
  if (/range|reach/.test(s)) return 30;
  return 10;
}

export default function decide(view) {
  const n = view.now;

  // Secure boundary: answer with SILENCE. It banks the configured default, cannot be REJECTED
  // (a rejected array inside the choice window is invisible to the tape and visible to the sim,
  // which desynchronises the replay), and keeps the last accepted order inside the envelope.
  if (n.pendingSecure) return null;

  const t = n.timers?.runSeconds ?? 0;
  const gold = n.gold ?? 0;
  const pan = n.score?.goldPanned ?? 0;
  const air = n.air || {};
  const reg = air.regolith || {};
  const worked = new Set(reg.worked || []);
  const out = [];

  // 1. Draft first, under replace semantics. Plating-first scorer.
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const best = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage. BLAST_AT returns {} on success AND failure, so it is safe above
  //    the travellers. 2.4x lob arc => 24 m reach on this map.
  if ((n.blastReadyInMs ?? 1) === 0) {
    out.push({ verb: 'BLAST_AT', pos: { x: POST.x, z: POST.z + 2 } });
  }

  // 3. Come-home guard ABOVE everything that travels. Under knockbackScale 1.3 and floaty gravity
  //    a scrum can throw the hero clean out of her own air, and an empty suit is 5 hp/s.
  out.push({ verb: 'MOVE_HERO', pos: { x: POST.x, z: POST.z } });

  // Track refusals from the view's own order records: GROUND poisons the coordinate,
  // ECONOMY (insufficient_gold) poisons nothing and retries (gen 51).
  for (const rec of n.orders || []) {
    const o = rec.order || rec;
    if (rec.status !== 'failed' || o.verb !== 'BUILD') continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (/insufficient_gold/.test(reason)) continue;
    if (o.where) banned.add(key(o.what, [o.where.x, o.where.z]));
  }

  // Reconcile what I actually own from the live view.
  const mine = {};
  for (const id of Object.keys(SPOTS)) mine[id] = (n.works.byKind || {})[id] || 0;

  // Live cap: only UNWRECKED stockpiles raise it (nothing wrecks here, but count honestly).
  const liveStock = (n.works.entries || []).filter(e => e.id === 'stockpile' && !e.wrecked).length;
  const cap = BASE_CAP + STOCK_BONUS * liveStock;

  const rate = t > 40 ? pan / t : 1.2;   // biased LOW on purpose: errs toward banking the cap
  if (rate > rateSeen) rateSeen = rate;

  // 4. One BUILD rung. Emergency half sits behind a pressure latch so a comfortable run BANKS it.
  const hpFrac = (n.hero?.hp ?? 1) / (n.hero?.maxHp ?? 1);
  const urgent = hpFrac < 0.80 || (n.works?.standing ?? 0) < 3;
  let rung = nextRung(view, CORE, mine);
  const fromEmergency = false;
  // The floor holds the score on a comfortable run and yields to one that is dying.
  const floorOk = t < HARD_BUILD_FLOOR || hpFrac < 0.60;
  if (rung && floorOk) {
    // retire a rung with no candidates left rather than stalling the rungs behind it (gen 81)
    let spot = pickSpot(view, rung.id);
    if (!spot) {
      const ladder = fromEmergency ? [...CORE, ...EMERGENCY] : CORE;
      const skipped = ladder.filter(x => x !== rung.id);
      const alt = nextRung(view, skipped, mine);
      if (alt) { rung = alt; spot = pickSpot(view, alt.id); }
    }
    if (spot) {
      const price = costOf(view, rung.id, mine[rung.id] || 0);
      const projected = (gold - price) + rateSeen * Math.max(0, SECURE_T - t);
      const pinning = gold >= cap - 5;               // at the cap income is already refused: spend
      const earlyCore = t < 430 && !fromEmergency;   // the fort has to exist at all, and in time
      const bankOk = projected >= cap + 10;
      if (gold >= price && (earlyCore || pinning || urgent || bankOk)) {
        out.push({ verb: 'BUILD', what: rung.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: price } });
      }
    }
  }

  // 5. The harvest tail IS the economy, the regolith gate, and the clock.
  //    Fresh-ground-first while this window has not credited; nearest otherwise.
  const live = (n.seams || [])
    .filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ ...s, d: Math.hypot(s.x - POST.x, s.z - POST.z) }));
  live.sort((a, b) => a.d - b.d);

  const needGround = !reg.complete && (reg.creditedThisWindow ?? 0) === 0;
  const fresh = live.filter(s => Number.isFinite(s.anchorIndex) && !worked.has(s.anchorIndex));
  const chain = [];
  if (needGround && fresh.length) {
    // Drain the fresh ground in a block so the credit lands this window.
    for (let i = 0; i < 7; i++) chain.push(fresh[0].id);
    for (const s of live) if (s.id !== fresh[0].id) for (let i = 0; i < 6; i++) chain.push(s.id);
  } else {
    for (const s of live) for (let i = 0; i < 7; i++) chain.push(s.id);
  }
  if (!chain.length && live.length) chain.push(live[0].id);

  // Interleave a re-arming MOVE_HERO every three pans. A `done` record is skipped forever, so
  // re-arming means MORE RECORDS, not more submissions: each drained pan hands the next
  // MOVE_HERO a fresh chance to notice she has been flung out of her air and walk her back.
  let k = 0;
  for (const seam of chain) {
    if (out.length >= 31) break;
    out.push({ verb: 'HARVEST', seam });
    if (++k % 3 === 0 && out.length < 31) out.push({ verb: 'MOVE_HERO', pos: { x: POST.x, z: POST.z } });
  }
  // Terminal anchor that cannot be filtered away.
  if (out.length < 32) out.push({ verb: 'MOVE_HERO', pos: { x: POST.x, z: POST.z } });

  return out.slice(0, 32);
}
