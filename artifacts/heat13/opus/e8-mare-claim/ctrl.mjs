// heat13 e8-mare-claim controller — 1:1 grammar (MOVE_HERO / HARVEST / BUILD / PICK_UPGRADE /
// BLAST_AT / CONTEXT_ACTION). No MOVE_TO, no HOLD, no FALLBACK_IF.
//
// THE MAP'S ASK (measured, not inherited):
//   twist.atmosphere = { regolithRequired: 4, regolithWindowWaves: 4, suitSeconds: 60,
//                        harmPerSecond: 5, pressurisedZoneIds: [3 dome-cluster pads] }
//   The suit is the HERO's (E8HumanSuit). Outside a dome it drains 1/s; at 0 it charges 5 hp/s.
//   notePan(anchorIndex) credits a ground only while HER suit holds air, at most ONE FRESH ground
//   per window (4 waves x 30 s = 120 s). So: park the hero inside a dome pad (she breathes, and
//   the pads are ALSO the only build zones near her), and let the Prospector walk the regolith.
//   Four distinct anchorIndexes across four distinct windows opens the secure.

const DOMES = {
  'dome-cluster-pad-west': { x: -18, z: 0 },
  'dome-cluster-pad-center': { x: 0, z: 0 },
  'dome-cluster-pad-east': { x: 18, z: 0 },
};

// Ladder: interleave turret/beacon so dps lands early; cumulative gating so a cheap rung can never
// steal gold an expensive one is waiting for. More candidates than slots (gen 10/14/35).
const LADDER = [
  { what: 'turret', cost: 50 }, { what: 'sentry_beacon', cost: 25 },
  { what: 'turret', cost: 70 }, { what: 'sentry_beacon', cost: 35 },
  { what: 'turret', cost: 95 }, { what: 'sentry_beacon', cost: 45 },
  { what: 'turret', cost: 125 }, { what: 'sentry_beacon', cost: 55 },
  { what: 'sentry_beacon', cost: 75 }, { what: 'sentry_beacon', cost: 95 },
];
const SPOTS = {
  turret: [[-13, 3], [13, 3], [-13, -3], [13, -3], [-18, 4], [18, 4], [-18, -4], [18, -4], [-22, 0], [22, 0], [-16, 0], [16, 0]],
  sentry_beacon: [[0, 5], [5, 1], [-5, 1], [0, -5], [5, 5], [-5, 5], [4, -4], [-4, -4], [5, -2], [-5, -2], [2, 5], [-2, -5]],
};
// GROUND refusals poison a coordinate; ECONOMY refusals never do (gen 51).
const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  if (/plating|dressing|vital|max health|maxhp|hit points|armor|armour/.test(s)) return 100;
  if (/heal|regen|life/.test(s)) return 80;
  if (/damage|spark|coil|tap|power|pierce/.test(s)) return 50;
  if (/rate|speed|cool/.test(s)) return 40;
  return 10;
}

export default function ctrl(view, S) {
  const now = view.now;
  if (!S.init) {
    S.init = true; S.bad = new Set(); S.sig = null; S.lastT = -99; S.subs = 0;
    S.home = 'dome-cluster-pad-center';
  }
  const t = now.timers?.runSeconds ?? 0;

  // Secure boundary: blank line. gr-sim records no entry, the configured `bank` default fires,
  // and the last accepted order stays well inside the tick envelope (F-HEAT11-1).
  if (now.pendingSecure) return null;

  const air = now.air || {};
  const reg = air.regolith || {};
  const worked = new Set(reg.worked || []);
  const hero = now.hero || { x: 0, z: 12 };

  // ---- 1. hero home: the dome with the most air, preferring the one we already hold -------------
  const domes = (air.domes || []).filter((d) => DOMES[d.id]);
  const dist=(p)=>Math.hypot(p.x-hero.x,p.z-hero.z);
  let home = domes.find((d) => d.id === S.home);
  if (!home || home.air < 0.4) {
    const best = domes.filter((d)=>d.air>0.35).sort((a,b)=>dist(DOMES[a.id])-dist(DOMES[b.id]))[0]
      || domes.slice().sort((a,b)=>b.air-a.air)[0];
    if (best) { home = best; S.home = best.id; }
  }
  const homePos = DOMES[S.home] || DOMES['dome-cluster-pad-center'];

  // ---- 2. refusal blacklist from the view's own order records (never on insufficient_gold) ------
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o && o.verb === 'BUILD' && o.where) {
      const why = `${rec.reason || ''} ${rec.detail || ''}`;
      if (GROUND.test(why)) S.bad.add(`${o.what}@${o.where.x},${o.where.z}`);
    }
  }

  // ---- 3. ladder state from works.entries (never from our own counter) --------------------------
  const entries = (now.works?.entries || []).filter((e) => !e.wrecked);
  const built = {};
  for (const e of entries) built[e.id] = (built[e.id] || 0) + 1;
  const used = new Set(entries.map((e) => `${e.id}@${Math.round(e.position?.x)},${Math.round(e.position?.z)}`));
  const want = {};
  const pending = [];
  for (const rung of LADDER) {
    want[rung.what] = (want[rung.what] || 0) + 1;
    if (want[rung.what] <= (built[rung.what] || 0)) continue;
    const spot = SPOTS[rung.what].find((p) => !S.bad.has(`${rung.what}@${p[0]},${p[1]}`)
      && !used.has(`${rung.what}@${p[0]},${p[1]}`)
      && !pending.some((q) => q.what === rung.what && q.p[0] === p[0] && q.p[1] === p[1]));
    if (spot) pending.push({ what: rung.what, cost: rung.cost, p: spot });
  }
  // plan-time affordability with CUMULATIVE gating
  const builds = [];
  let cum = 0;
  for (const b of pending) {
    cum += b.cost;
    if (cum > now.gold) break;
    builds.push({ verb: 'BUILD', what: b.what, where: { x: b.p[0], z: b.p[1] }, when: { goldGte: cum } });
  }
  const ladderDone = pending.length === 0;

  // ---- 4. the gold sink: turret tier 2 (Math.max(1,tier) indexes correctly either convention) ---
  let sink = null;
  if (ladderDone && now.gold >= 150) {
    const idx = (now.works?.entries || []).findIndex((e) => e.id === 'turret' && !e.wrecked && (e.tier ?? 1) < 2);
    if (idx >= 0) {
      const e = now.works.entries[idx];
      sink = { pos: e.position, order: { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: idx } } };
    }
  }

  // ---- 5. the regolith chain: FRESH grounds first, then nearest ---------------------------------
  const live = (now.seams || []).filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z)
    && Number.isInteger(s.anchorIndex));
  const pros = now.prospector || homePos;
  const d2 = (s) => (s.x - pros.x) ** 2 + (s.z - pros.z) ** 2;
  const fresh = live.filter((s) => !worked.has(s.anchorIndex)).sort((a, b) => d2(a) - d2(b));
  const stale = live.filter((s) => worked.has(s.anchorIndex)).sort((a, b) => d2(a) - d2(b));
  const needGround = !reg.complete && (reg.creditedThisWindow ?? 0) === 0 && fresh.length > 0;

  // ---- assemble; array order IS the policy -----------------------------------------------------
  const orders = [];
  if (now.pendingOffer?.length) {
    const best = now.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: hero.x, z: hero.z + 8 } });
  // MOVE_HERO owns the tick WHILE WALKING and falls through the instant it arrives (status done).
  const heroTarget = sink ? sink.pos : homePos;
  orders.push({ verb: 'MOVE_HERO', pos: { x: heroTarget.x, z: heroTarget.z } });
  if (sink) orders.push(sink.order);
  for (const b of builds) orders.push(b);

  // harvest tail: sized to outlast the view gap. A failing HARVEST is free (the Prospector is
  // already standing there) and buys a decision point.
  const chain = [];
  const push = (s, k) => { for (let i = 0; i < k; i++) chain.push({ verb: 'HARVEST', seam: s.id }); };
  if (needGround) push(fresh[0], 7);
  for (const s of fresh.slice(needGround ? 1 : 0)) push(s, 5);
  for (const s of stale) push(s, 6);
  if (chain.length === 0 && live.length) push(live[0], 4);
  const NUDGE = [[0,0],[0.4,0],[0,0.4],[-0.4,0],[0,-0.4],[0.3,0.3],[-0.3,0.3],[0.3,-0.3],[-0.3,-0.3],[0.42,0.1],[-0.42,0.1],[0.1,0.42],[0.1,-0.42],[-0.1,0.42],[-0.1,-0.42],[0.2,0.2]];
  let k = 0;
  for (const o of chain) {
    if (orders.length >= 31) break;
    const g = NUDGE[k % NUDGE.length]; k += 1;
    orders.push({ verb: 'MOVE_HERO', pos: { x: homePos.x + g[0], z: homePos.z + g[1] } });
    orders.push(o);
  }

  // ---- reel budget: resubmit only on a real change of plan, else blank-line the view ------------
  const sig = JSON.stringify([
    orders.map((o) => [o.verb, o.what, o.seam, o.id, o.where?.x, o.where?.z, o.pos?.x, o.pos?.z, o.action]),
  ]);
  if (sig === S.sig && (t - S.lastT) < 2.5 && !now.pendingOffer?.length) return null;
  S.sig = sig; S.lastT = t; S.subs += 1;
  return orders;
}
