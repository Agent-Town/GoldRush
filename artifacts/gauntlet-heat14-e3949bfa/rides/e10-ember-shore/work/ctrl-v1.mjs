// e10-ember-shore controller v1
// Contract: keep the last warm vent alight. warmth 100, -4/s ONLY while a squall blows.
// STOKE = CONTEXT_ACTION{action:'stoke'}, 15 gold -> +40 warmth (cap 100), radius 4 of vent,
// reach measured at the HERO. Secure = wave 12 AND alight AND squallsCompleted >= 1.
// Squall cycle 101s: calm 60 / telegraph 8 / squall 25 / recover 8. First squall at t=68.
//
// Order model (verified in src/agent/StandingOrders.ts): every executed record owns its tick
// (`if (result) return result` and every branch returns an object), and a record that goes
// done/failed is skipped forever. So an array is a worklist that drains one record per tick,
// except HARVEST which holds the tick while it walks and pans. That makes HARVEST the natural
// PAD: interleaving STOKE between HARVESTs gives a stoke attempt every ~pad-seconds without
// needing a view. Any order failure raises an order_failure surprise -> a view on the next tick,
// so a collapsing pad chain self-reports instead of bursting.

const VENT = { x: 3, z: -10 };
const STOKE_COST = 15;
const STOKE_BAND = 58;      // stoke when warmth <= this (full 40 value, no waste)
const EMERGENCY = 34;       // head-of-array stoke, no questions
const PAD_SECONDS = 1.5;    // measured guess; logged so v2 can correct it
const MAX_STOKES_PER_ARRAY = 3;
const RESERVE = 45;         // never spend the last 3 stokes on anything else

// Fort inside `last-warm-vent-site` (x -2..8, z -16..-4). Vent at (3,-10).
const LADDER = [
  { id: 'turret', spots: [[0, -7], [6, -13], [6, -7], [0, -13], [1, -6], [7, -10], [-1, -10], [3, -15]] },
  { id: 'sentry_beacon', spots: [[1, -12], [5, -8], [1, -8], [5, -12], [3, -6], [3, -14], [-1, -7], [7, -14]] },
  { id: 'turret', spots: [[6, -13], [6, -7], [0, -13], [1, -6], [7, -10], [-1, -10], [3, -15]] },
  { id: 'sentry_beacon', spots: [[5, -8], [1, -8], [5, -12], [3, -6], [3, -14], [-1, -7], [7, -14]] },
  { id: 'stockpile', spots: [[2, -12], [4, -8], [2, -8], [4, -12], [0, -10], [6, -10]] },
  { id: 'turret', spots: [[6, -7], [0, -13], [1, -6], [7, -10], [-1, -10], [3, -15]] },
  { id: 'sentry_beacon', spots: [[1, -8], [5, -12], [3, -6], [3, -14], [-1, -7], [7, -14]] },
  { id: 'stockpile', spots: [[4, -8], [2, -8], [4, -12], [0, -10], [6, -10]] },
  { id: 'turret', spots: [[0, -13], [1, -6], [7, -10], [-1, -10], [3, -15]] },
  { id: 'sentry_beacon', spots: [[5, -12], [3, -6], [3, -14], [-1, -7], [7, -14]] },
  { id: 'sentry_beacon', spots: [[3, -6], [3, -14], [-1, -7], [7, -14]] },
  { id: 'sentry_beacon', spots: [[3, -14], [-1, -7], [7, -14]] },
];

const badSpot = new Set();   // GROUND refusals only (never insufficient_gold)
const seenReason = new Set();
let ladderIdx = 0;
let lastPlanNote = '';
const stokeLog = [];

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|tough|hardy|vitality/.test(s)) v += 100;
  if (/heal|regen|mend|dressing|recover/.test(s)) v += 80;
  if (/damage|spark|coil|tap|power|blast/.test(s)) v += 40;
  if (/rate|speed|fire|haste/.test(s)) v += 25;
  if (/gold|pan|luck|prospector/.test(s)) v += 10;
  return v;
}

export default function controller(view) {
  const now = view.now || {};
  if (now.pendingSecure) return { line: '\n', note: 'SECURE:blank' };

  const t = now.timers?.runSeconds ?? 0;
  const pr = (now.emberShore || {}).preserve || {};
  const sq = now.squall || {};
  const warmth = typeof pr.warmth === 'number' ? pr.warmth : 100;
  const gold = now.gold ?? 0;
  const blowing = sq.phase === 'squall';
  const hero = now.hero || {};
  const dh = Math.hypot((hero.x ?? VENT.x) - VENT.x, (hero.z ?? VENT.z) - VENT.z);

  // absorb refusals from the last array
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const r = String(rec.reason || '');
    const o = rec.order || {};
    if (o.verb === 'BUILD' && /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable|out_of_reach/i.test(r)) {
      badSpot.add(`${o.what}@${o.where?.x},${o.where?.z}`);
    }
    if (o.verb === 'CONTEXT_ACTION') seenReason.add(r.slice(0, 40));
  }

  const orders = [];
  const push = (o) => { if (orders.length < 32) orders.push(o); };

  // 1. draft first (replace semantics)
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. knockback guard: the stoke disc is radius 4, measured at the hero.
  if (dh > 1.2) push({ verb: 'MOVE_HERO', pos: { x: VENT.x, z: VENT.z } });

  // 3. emergency stoke
  let stokesPlanned = 0;
  if (warmth <= EMERGENCY && gold >= STOKE_COST) { push({ verb: 'CONTEXT_ACTION', action: 'stoke' }); stokesPlanned++; }
  // 3b. band stoke
  else if (warmth <= STOKE_BAND && gold >= STOKE_COST) { push({ verb: 'CONTEXT_ACTION', action: 'stoke' }); stokesPlanned++; }

  // 4. free blast
  if ((now.blastReadyInMs ?? 1) === 0) push({ verb: 'BLAST_AT', pos: { x: VENT.x, z: VENT.z - 2 } });

  // 5. one ladder rung, plan-time affordable, behind the stoke reserve
  const byKind = now.works?.byKind || {};
  const built = (id) => byKind[id] || 0;
  const bcost = {};
  for (const b of (view.stablePrefix?.mechanics?.buildables || [])) bcost[b.id] = b.costs || [];
  const seen = {};
  let rung = null;
  for (let i = 0; i < LADDER.length; i++) {
    const r = LADDER[i];
    seen[r.id] = (seen[r.id] || 0) + 1;
    if (built(r.id) >= seen[r.id]) continue;              // already satisfied by a standing instance
    const cost = (bcost[r.id] || [])[built(r.id)] ?? 9999;
    const spot = r.spots.find((s) => !badSpot.has(`${r.id}@${s[0]},${s[1]}`));
    if (!spot) continue;                                   // rung retired, never stalls the ladder
    if (gold - cost < RESERVE) break;                      // reserve the stoke money
    rung = { id: r.id, spot, cost };
    break;
  }
  if (rung) push({ verb: 'BUILD', what: rung.id, where: { x: rung.spot[0], z: rung.spot[1] }, when: { goldGte: rung.cost } });

  // 6. tail: harvest pads, with STOKE tripwires laid on the warmth clock.
  const live = (now.seams || []).filter((s) => s.active !== false
    && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pp = now.prospector || {};
  const px = Number.isFinite(pp.x) ? pp.x : VENT.x, pz = Number.isFinite(pp.z) ? pp.z : VENT.z;
  live.sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz));
  const chain = live.length ? [live[0].id, live[0].id, live[0].id, live[1]?.id ?? live[0].id] : [];

  // when does warmth next reach the band?
  let padsToFirst = 99;
  if (blowing) padsToFirst = Math.max(0, Math.round(((warmth - STOKE_BAND) / 4) / PAD_SECONDS));
  else if (sq.phase === 'telegraph') {
    const toSquall = sq.secondsToNextPhase ?? 8;
    padsToFirst = Math.round((toSquall + Math.max(0, (warmth - STOKE_BAND) / 4)) / PAD_SECONDS);
  }
  const padsBetween = Math.max(2, Math.round((40 / 4) / PAD_SECONDS));   // ~10s of decay

  let ci = 0, pads = 0, laid = 0;
  const nextSeam = () => chain.length ? chain[(ci++) % chain.length] : null;
  while (orders.length < 32) {
    if (padsToFirst < 99 && laid < MAX_STOKES_PER_ARRAY - stokesPlanned
        && pads >= padsToFirst + laid * padsBetween) {
      push({ verb: 'CONTEXT_ACTION', action: 'stoke' });
      laid++;
      continue;
    }
    const s = nextSeam();
    if (!s) break;
    push({ verb: 'HARVEST', seam: s });
    pads++;
  }
  if (!orders.length) push({ verb: 'MOVE_HERO', pos: { x: VENT.x, z: VENT.z } });

  const note = `w${warmth} ${sq.phase} g${gold} stk${(pr.stoke || {}).uses ?? 0} p1=${padsToFirst} laid=${laid}${rung ? ' B:' + rung.id : ''}`;
  lastPlanNote = note;
  return { line: JSON.stringify(orders), note };
}
