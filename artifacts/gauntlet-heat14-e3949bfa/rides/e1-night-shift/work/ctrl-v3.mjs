// e1-night-shift controller v1 — gen 123
// Board facts (measured/read this ride):
//   claim + hero (0,12); river z in [-5,5], shallows to 6.25, bank beyond; ford x in [-3,3].
//   riverBlocksEnemies: true -> south spawns funnel through the ford; N/E/W come overland.
//   sluice legal line: isBuildable wants 'bank' (|z|>6.25) AND isWaterSourceAdjacent pad 2 (|z|<=7) => z = 7.
//   7 pre-placed WRECKED lantern_post fill 7 of maxCount 8 -> build none; REPAIR_UNDER relights (0,16) for 8g.
//   secureWave 25 (750 s). Marathon: income compounds, so sluices are the biggest lever gen 56 never pulled.
//   No stockpile: cap 200 never binds on a starved purse, and a standing till arms every thief.

const CLAIM = { x: 0, z: 12 };

// ---- ladder: strategy order, one rung emitted at a time -------------------
// turret 50/70/95/125 (r16, 57dps) | beacon 25/35/45/55/75/95 (r8 + LIGHT) | sluice 40 x3 | palisade 10 x48
const LADDER = [
  { id: 'turret' },                       // a gun by ~t25
  { id: 'sluice' }, { id: 'sluice' }, { id: 'sluice' },  // 1.8 g/s for 120g, paid back ~10x over 750s
  { id: 'sentry_beacon' },
  { id: 'turret' },
  { id: 'sentry_beacon' },
  { id: 'turret' },
  { id: 'sentry_beacon' },
  { id: 'turret' },
  { id: 'sentry_beacon' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
];
for (let i = 0; i < 34; i += 1) LADDER.push({ id: 'palisade' });

// candidate spots, more than slots. GROUND refusals poison a spot; ECONOMY refusals do not.
const SPOTS = {
  // turrets: cover the claim AND the ford mouth (0,6) inside range 16
  turret: [
    { x: -5, z: 10 }, { x: 5, z: 10 }, { x: -5, z: 14 }, { x: 5, z: 14 },
    { x: -8, z: 12 }, { x: 8, z: 12 }, { x: 0, z: 9 }, { x: 0, z: 16 },
    { x: -8, z: 9 }, { x: 8, z: 9 },
  ],
  // beacons: radius 8 must REACH the hero at (0,12); light + slow
  sentry_beacon: [
    { x: -3, z: 9 }, { x: 3, z: 9 }, { x: -3, z: 15 }, { x: 3, z: 15 },
    { x: -6, z: 12 }, { x: 6, z: 12 }, { x: 0, z: 18 }, { x: -6, z: 16 },
    { x: 6, z: 16 }, { x: -6, z: 8 }, { x: 6, z: 8 },
  ],
  // sluices: the z = 7 line only, spread, behind the turret line, clear of the ford
  sluice: [
    { x: -11, z: 7 }, { x: 11, z: 7 }, { x: -15, z: 7 }, { x: 15, z: 7 },
    { x: -8, z: 7 }, { x: 8, z: 7 }, { x: -19, z: 7 }, { x: 19, z: 7 },
    { x: -11, z: -7 }, { x: 11, z: -7 },
  ],
  // palisades: tight arc on the overland (N/E/W) approaches, rot-1 walls / rot-0 flanks.
  // south is deliberately left open: the river already narrows it to the ford, and my
  // worker needs that crossing for the south-bank seams.
  palisade: [
    { x: -3, z: 18, r: 1 }, { x: 0, z: 18, r: 1 }, { x: 3, z: 18, r: 1 },
    { x: -6, z: 18, r: 1 }, { x: 6, z: 18, r: 1 },
    { x: -7, z: 15, r: 0 }, { x: 7, z: 15, r: 0 },
    { x: -7, z: 12, r: 0 }, { x: 7, z: 12, r: 0 },
    { x: -7, z: 9, r: 0 }, { x: 7, z: 9, r: 0 },
    { x: -9, z: 18, r: 1 }, { x: 9, z: 18, r: 1 },
    { x: -10, z: 15, r: 0 }, { x: 10, z: 15, r: 0 },
    { x: -10, z: 12, r: 0 }, { x: 10, z: 12, r: 0 },
    { x: -10, z: 9, r: 0 }, { x: 10, z: 9, r: 0 },
    { x: -12, z: 18, r: 1 }, { x: 12, z: 18, r: 1 },
    { x: -3, z: 21, r: 1 }, { x: 0, z: 21, r: 1 }, { x: 3, z: 21, r: 1 },
    { x: -6, z: 21, r: 1 }, { x: 6, z: 21, r: 1 }, { x: -9, z: 21, r: 1 }, { x: 9, z: 21, r: 1 },
    { x: -13, z: 15, r: 0 }, { x: 13, z: 15, r: 0 },
    { x: -13, z: 12, r: 0 }, { x: 13, z: 12, r: 0 },
    { x: -13, z: 9, r: 0 }, { x: 13, z: 9, r: 0 },
    { x: -15, z: 18, r: 1 }, { x: 15, z: 18, r: 1 },
    { x: -3, z: 24, r: 1 }, { x: 0, z: 24, r: 1 }, { x: 3, z: 24, r: 1 },
    { x: -6, z: 24, r: 1 }, { x: 6, z: 24, r: 1 },
    { x: -16, z: 15, r: 0 }, { x: 16, z: 15, r: 0 },
    { x: -16, z: 12, r: 0 }, { x: 16, z: 12, r: 0 },
    { x: -16, z: 9, r: 0 }, { x: 16, z: 9, r: 0 },
  ],
};

const GROUND_REASONS = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|terrain/i;
const key = (s) => `${s.x},${s.z}`;

function scoreUpgrade(u) {
  const t = `${u.id} ${u.name} ${u.effectText}`.toLowerCase();
  if (/plating|max hp|maxhp|vital|tough|hearty/.test(t)) return 100;   // survivability first
  if (/dressing|heal|regen|mend|recover|patch/.test(t)) return 90;     // the endgame on a hero_down board
  if (/spark|damage|coil|tap|volley|fire rate|firerate|rate/.test(t)) return 60;
  if (/range|pierce|crit/.test(t)) return 50;
  if (/beacon|turret|work/.test(t)) return 35;
  return 20;
}

export default function controller(view, S) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};

  // one-time init
  if (!S.init) {
    S.init = true;
    S.poison = new Set();
    S.tries = Object.create(null);
    S.retired = new Set();
    S.lastSig = null;
    S.lastT = -99;
    S.builds = (sp.mechanics?.buildables || []).reduce((m, b) => (m[b.id] = b, m), {});
    // pre-placed instances of each id, so a ladder rung is never satisfied by the map's own furniture
    S.pre = Object.create(null);
    for (const p of (sp.map?.prePlacedBuildables || sp.mechanics?.interactables || [])) {
      const id = p.id; const n = p.count ?? 1;
      S.pre[id] = (S.pre[id] || 0) + n;
    }
  }

  // 1. SECURE BOUNDARY: silence. It takes the bank default, cannot be rejected, and keeps
  //    the replay in step (a refused in-window array is invisible to the tape, visible to the sim).
  if (now.pendingSecure) return null;

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const orders = [];

  // 2. DRAFT first, under replace semantics.
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. Free supplementary damage; returns {} either way so it never owns the tick.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z - 3 } });
  }

  // 4. Ungated mend. ADR-005 stage 2 bounds REPAIR_UNDER to the rig radius around the
  //    Prospector (which drifts to the hero), so it cannot walk off the claim any more.
  //    It also relights the pre-placed lantern at (0,16), 4 units away, for 8 gold.
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 4b. GOLD SINK. At the cap, income is already being refused, so spending is free.
  //     Gated to a calm window so a traveller never pre-empts the mend under pressure.
  const entries = now.works?.entries || [];
  const hpFrac = (now.hero?.maxHp ? (now.hero.hp ?? 0) / now.hero.maxHp : 1);
  const myWrecked = Math.max(0, (now.works?.wrecked || 0) - (S.pre.lantern_post || 0));
  const calm = myWrecked <= 1 && hpFrac > 0.70;
  const upgradable = entries
    .filter((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked && e.position)
    .sort((a, b) => Math.hypot(a.position.x, a.position.z - 12) - Math.hypot(b.position.x, b.position.z - 12));
  S.tierDone = entries.filter((e) => e.id === 'turret' && (e.tier ?? 1) > 1).length;
  let travelling = false;
  if (calm && gold >= 150 && upgradable.length && t < 660) {
    const tgt = upgradable[0];
    // stand 0.7 claim-ward of the work: inside interactRadius 1.6, clear of its footprint
    const dx = CLAIM.x - tgt.position.x, dz = CLAIM.z - tgt.position.z;
    const len = Math.hypot(dx, dz) || 1;
    orders.push({ verb: 'MOVE_HERO', pos: { x: +(tgt.position.x + (dx / len) * 0.7).toFixed(2), z: +(tgt.position.z + (dz / len) * 0.7).toFixed(2) } });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: tgt.index } });
    travelling = true;
  } else if (Math.hypot((now.hero?.x ?? 0) - CLAIM.x, (now.hero?.z ?? 12) - CLAIM.z) > 0.8) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });   // come home, above the ladder
  }

  // 5. Ladder: read refusals from the view, then emit exactly ONE rung.
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || !o.where) continue;
    if (rec.status !== 'failed' && rec.status !== 'rejected') continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (/insufficient_gold/i.test(reason)) continue;           // ECONOMY: retry, poison nothing
    if (GROUND_REASONS.test(reason)) S.poison.add(key(o.where)); // GROUND: poison the coordinate
    else {
      const k = key(o.where);
      S.tries[k] = (S.tries[k] || 0) + 1;
      if (S.tries[k] >= 4) S.poison.add(k);
    }
  }

  const byKind = now.works?.byKind || {};
  const placed = Object.create(null);           // instances I own, excluding the map's furniture
  for (const [id, n] of Object.entries(byKind)) placed[id] = Math.max(0, n - (S.pre[id] || 0));
  const standingAll = (id) => byKind[id] || 0;  // what the cost curve is indexed by

  const HARD_STOP = t > 690;                    // last minute: hold gold for mends, not new works
  const seen = Object.create(null);
  for (let i = 0; i < LADDER.length; i += 1) {
    const rung = LADDER[i];
    const id = rung.id;
    seen[id] = (seen[id] || 0) + 1;
    if (S.retired.has(i)) continue;
    if ((placed[id] || 0) >= seen[id]) continue;          // this rung is already satisfied by MY work
    const def = S.builds[id];
    if (!def) { S.retired.add(i); continue; }
    const cap = (def.maxCount ?? 99) - (S.pre[id] || 0);  // pre-placed eat the cap
    if (seen[id] > cap) { S.retired.add(i); continue; }
    const costs = def.costs || [];
    const cost = costs[Math.min(standingAll(id), costs.length - 1)] ?? 9999;
    const spot = (SPOTS[id] || []).find((s) => !S.poison.has(key(s)));
    if (!spot) { S.retired.add(i); continue; }            // no ground left: RETIRE, never stall
    if (HARD_STOP || travelling) break;
    if (gold >= cost) {                                    // plan-time affordability
      const o = { verb: 'BUILD', what: id, where: { x: spot.x, z: spot.z }, when: { goldGte: cost } };
      if (spot.r !== undefined) o.rotationSteps = spot.r;
      orders.push(o);
    }
    break;                                                 // exactly one rung in flight
  }

  // 6. Harvest tail: the economy AND the clock. Inactive seams publish x/z/anchorIndex as
  //    null, and one non-finite number refuses the whole array silently.
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, d: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
    .sort((a, b) => a.d - b.d);

  const room = 31 - orders.length;
  if (live.length && room > 0) {
    const chain = [];
    const pair = live.slice(0, 2);
    // blocks of six, alternating: a seam holds 30 gold (six 1.5 s pans) and respawns in 20 s,
    // so a block drains the near seam while the far one refills.
    for (let b = 0; b < 8 && chain.length < room; b += 1) {
      const s = pair[b % pair.length];
      for (let k = 0; k < 6 && chain.length < room; k += 1) chain.push({ verb: 'HARVEST', seam: s.id });
    }
    orders.push(...chain);
  } else if (room > 0) {
    // no live seam: keep naming the nearest ANCHOR's seam anyway so the failing order parks
    // the worker where the gold will come back, instead of leaving an empty tail.
    orders.push({ verb: 'HARVEST', seam: (now.seams?.[0]?.id) || 'gold-seam-1' });
  }

  // 7. Submission floor: blank-line an unchanged plan. Keeps the reel small without costing play.
  const sig = JSON.stringify(orders);
  const urgent = (now.pendingOffer && now.pendingOffer.length) || (now.works?.wrecked || 0) > 0;
  if (sig === S.lastSig && !urgent && t - S.lastT < 3.5) return null;
  S.lastSig = sig; S.lastT = t;
  return orders.slice(0, 32);
}
