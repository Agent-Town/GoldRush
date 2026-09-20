// e7-relay-rush controller — generation 108, era 6.
//
// TWO GATES (both ANDed into autoSecureWaveForRun):
//   1. interferenceFront.objectiveAllowsSecure — 3 of 4 relay sites carry a standing
//      turret/sentry_beacon at the ARRIVAL of front 3 (t = 270.0), sampled once, latched.
//   2. playbookLatch.allowsSecure({mutedUses}) — interferenceFront.refusals.playbooks > 0,
//      which is incremented either by a PLAYBOOK_USE made while the hero stands under the
//      band, or by syncProgramSuspension catching a RUNNING program at the hero.
//
// Band schedule, closed form: front k arrives at 90k; centre sweeps -60 -> +60 over 20 s at
// 6 wu/s. A body at x is muted while |x - centre| <= 6, i.e. for s in [(x+54)/6, (x+66)/6]
// after arrival. Hero starts at (-25, 41) inside relay-site-r2 => window 4.833..6.833 s
// after each front, i.e. t = 94.833..96.833 on front 1.

const CLAIM = { x: -25, z: 41 };
const CADENCE = 90, CROSSING = 20, HALF = 6, BAND_MIN = -54, BAND_MAX = 54;
const SECURE_TIME = 600;
const HARD_BUILD_STOP = 470;   // stop spending; ~130 s to refill the 200 cap
const BANK_CAP = 200;

function bandCenterAt(t) {
  const arrived = Math.floor(t / CADENCE);
  if (arrived < 1) return null;
  const since = t - arrived * CADENCE;
  if (since >= CROSSING) return null;
  const from = BAND_MIN - HALF, to = BAND_MAX + HALF;
  return from + (to - from) * (since / CROSSING);
}
// next instant >= t at which a body at x is under the band
function nextMuteWindow(t, x) {
  const lo = (x + 54) / 6, hi = (x + 66) / 6;           // seconds after a front's arrival
  for (let k = Math.max(1, Math.floor(t / CADENCE)); k < 12; k++) {
    const start = k * CADENCE + lo, end = k * CADENCE + hi;
    if (end > t) return { start, end };
  }
  return null;
}

// ---- the ladder. buildZones are ONLY the four relay sites, so every build is in one. ----
// Lights first (cheap beacons), then the r2 fort around the claim.
const LADDER = [
  { id: 'sentry_beacon', spots: [[-25, 43], [-27, 43], [-23, 43], [-27, 39], [-23, 39]] },   // lights r2
  { id: 'turret',        spots: [[-25, 38], [-27, 38], [-23, 38], [-28, 41], [-22, 41]] },   // claim gun
  { id: 'sentry_beacon', spots: [[-45, 41], [-45, 39], [-43, 41], [-47, 41], [-45, 43]] },   // lights r1
  { id: 'sentry_beacon', spots: [[25, 41], [25, 39], [27, 41], [23, 41], [25, 43]] },        // lights r3
  { id: 'turret',        spots: [[-28, 44], [-22, 44], [-28, 38], [-22, 38], [-29, 41]] },
  { id: 'sentry_beacon', spots: [[-27, 41], [-23, 41], [-25, 45], [-28, 42], [-22, 42]] },
  { id: 'turret',        spots: [[-22, 44], [-28, 44], [-25, 45], [-21, 41], [-29, 44]] },
  { id: 'sentry_beacon', spots: [[-23, 45], [-27, 45], [-29, 38], [-21, 38], [-25, 36]] },
  { id: 'turret',        spots: [[-29, 38], [-21, 38], [-29, 45], [-21, 45], [-26, 36]] },
  { id: 'sentry_beacon', spots: [[-21, 44], [-29, 41], [-24, 36], [-28, 36], [-22, 36]] },
];
const GROUND_REFUSALS = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i;

export function createController(log = () => {}) {
  const blacklist = new Set();       // "id@x,z" coordinates the GROUND refused
  const retired = new Set();         // ladder rungs with no candidates left
  const built = [];                  // rungs I have landed, in order
  let playbookAttempts = 0;
  let lastRate = 1.6;

  function costOf(view, id, instance) {
    const b = (view.stablePrefix?.mechanics?.buildables ?? []).find((e) => e.id === id);
    const costs = b?.costs ?? [];
    if (instance < costs.length) return costs[instance];
    const last = costs.length ? costs[costs.length - 1] : 50;
    return Math.ceil((last * Math.pow(1.3, instance - costs.length + 1)) / 5) * 5;
  }
  function maxCountOf(view, id) {
    const b = (view.stablePrefix?.mechanics?.buildables ?? []).find((e) => e.id === id);
    return Number.isFinite(b?.maxCount) ? b.maxCount : 99;
  }

  function scoreUpgrade(o) {
    const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
    if (/plating|dressing|vital|max health|maxhp|armou?r|tough|hearty/.test(s)) return 100;
    if (/heal|regen|mend/.test(s)) return 70;
    if (/damage|spark|coil|tap|power|burst/.test(s)) return 50;
    if (/rate|speed|reload|cool/.test(s)) return 40;
    return 10;
  }

  return function decide(view) {
    const now = view.now ?? {};
    const t = now.timers?.runSeconds ?? 0;
    const gold = now.gold ?? 0;
    const panned = now.score?.goldPanned ?? 0;
    const hero = now.hero ?? {};
    const hx = Number.isFinite(hero.x) ? hero.x : CLAIM.x;
    const hz = Number.isFinite(hero.z) ? hero.z : CLAIM.z;
    const pb = now.playbookUse ?? null;
    const front = now.interferenceFront ?? null;

    // --- the secure boundary: SILENCE. It banks the default, cannot be rejected (so the
    // replay cannot diverge on refused submissions), and costs no entry.
    if (now.pendingSecure) { log({ t, note: 'secure-boundary: blank line' }); return null; }

    // --- ERA GATE: keep the wheel with a running program until the wall catches it.
    const met = pb ? pb.objectiveMet === true : true;
    if (!met && pb && pb.runningProgram) {
      log({ t, note: `holding program ${pb.runningProgram} for the front` });
      return null;                                     // blank line == the program keeps the wheel
    }

    const orders = [];

    // 1. draft first, under replace semantics
    if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
      const pick = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: pick.id });
    }

    // 2. free supplementary damage; returns {} either way so it is safe above a traveller
    if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: hx, z: hz + 1 } });

    // 3. the era gate
    if (!met && pb) {
      const win = nextMuteWindow(t, hx);
      const centre = bandCenterAt(t);
      const underBandNow = centre !== null && Math.abs(hx - centre) <= HALF
        && hz >= -54 && hz <= 54;
      // Fire when the hero is under the band RIGHT NOW (the use itself is refused `muted`
      // before the NOTHING_RECORDED branch, so it counts on the way through), or shortly
      // before a window so the program is running when the wall arrives.
      if (underBandNow || (win && win.start > t && win.start - t <= 20)) {
        playbookAttempts += 1;
        orders.push({ verb: 'PLAYBOOK_USE', name: `relay-rush-${playbookAttempts}` });
        log({ t, note: `PLAYBOOK_USE relay-rush-${playbookAttempts} (underBand=${underBandNow}, window=${win ? win.start.toFixed(2) : 'n/a'})` });
      }
    }

    // 4. one BUILD rung — the next unsatisfied one, priced at its live instance, affordable now.
    const entries = now.works?.entries ?? [];
    const standing = {};
    for (const e of entries) standing[e.id] = (standing[e.id] ?? 0) + 1;
    const ordinal = {};
    let rung = null;
    for (let i = 0; i < LADDER.length; i++) {
      const r = LADDER[i];
      ordinal[r.id] = (ordinal[r.id] ?? 0) + 1;
      if (retired.has(i)) continue;
      if ((standing[r.id] ?? 0) >= ordinal[r.id]) continue;      // already satisfied
      if ((standing[r.id] ?? 0) >= maxCountOf(view, r.id)) { retired.add(i); continue; }
      const spot = r.spots.find(([x, z]) => !blacklist.has(`${r.id}@${x},${z}`));
      if (!spot) { retired.add(i); continue; }                    // RETIRE, never stall the ladder
      rung = { i, id: r.id, spot, cost: costOf(view, r.id, standing[r.id] ?? 0) };
      break;
    }
    // bank gate: gold is the ONLY free ranking axis here (waves 20 and time 600 are pinned).
    // Spend freely early; stop dead at the hard floor so ~2 g/s refills the 200 cap.
    if (panned > 0 && t > 30) lastRate = Math.max(0.6, panned / t);
    const remaining = Math.max(0, SECURE_TIME - t);
    const canRefill = (gold - (rung?.cost ?? 0)) + lastRate * remaining >= BANK_CAP + 5;
    const thin = (now.works?.standing ?? 0) < 4 || (hero.hp ?? 100) < (hero.maxHp ?? 100) * 0.7;
    const lightsOwed = front ? (front.litCount ?? 0) < (front.relayTarget ?? 3) && !front.deadlineResolved : false;
    if (rung && t < HARD_BUILD_STOP && gold >= rung.cost && (canRefill || thin || lightsOwed)) {
      orders.push({ verb: 'BUILD', what: rung.id, where: { x: rung.spot[0], z: rung.spot[1] }, when: { goldGte: rung.cost } });
    }

    // 5. displacement guard — the hero must hold (-25,41) to meet the band; free when parked
    if (Math.hypot(hx - CLAIM.x, hz - CLAIM.z) > 1.2) orders.push({ verb: 'MOVE_HERO', pos: { ...CLAIM } });

    // 6. the harvest tail — the economy AND the clock (each failure buys a decision point)
    const seams = (now.seams ?? []).filter((s) => s && s.active !== false
      && Number.isFinite(s.x) && Number.isFinite(s.z));
    const near = seams.filter((s) => Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) <= 26);
    const pool = (near.length ? near : seams)
      .sort((a, b) => Math.hypot(a.x - CLAIM.x, a.z - CLAIM.z) - Math.hypot(b.x - CLAIM.x, b.z - CLAIM.z));
    const room = 32 - orders.length;
    if (pool.length) {
      const block = 7;
      for (let i = 0; i < room; i++) {
        const s = pool[Math.floor(i / block) % pool.length];
        orders.push({ verb: 'HARVEST', seam: s.id });
      }
    } else if (orders.length === 0) {
      orders.push({ verb: 'MOVE_HERO', pos: { ...CLAIM } });     // never send []
    }

    // record ground refusals from the view's own order records
    for (const rec of now.orders ?? []) {
      const o = rec.order ?? rec;
      if (o?.verb !== 'BUILD' || rec.status !== 'failed') continue;
      const why = `${rec.reason ?? ''} ${rec.detail ?? ''}`;
      if (GROUND_REFUSALS.test(why)) blacklist.add(`${o.what}@${o.where?.x},${o.where?.z}`);
    }

    log({
      t: +t.toFixed(2), w: now.wave, gold, pan: panned, stolen: now.score?.goldStolen ?? 0,
      hp: `${Math.round(hero.hp ?? 0)}/${hero.maxHp ?? 0}`, alive: now.threats?.alive,
      wr: now.threats?.wreckers, th: now.threats?.thieves,
      works: `${now.works?.standing ?? 0}/${now.works?.wrecked ?? 0}`,
      lit: front ? `${front.litCount}/${front.relayTarget}` : '-',
      dl: front ? `${front.deadlineResolved}:${front.litAtDeadline}` : '-',
      pbMet: pb?.objectiveMet, prog: pb?.runningProgram, susp: pb?.programSuspensions,
      muted: pb?.refusals?.muted, orders: orders.length,
    });
    return orders;
  };
}
