// Generation 109 controller — e7-relay-valley, era 6, seed 01.
// The gen-6→108 skeleton retargeted, plus the one thing this board does
// differently: the `relay` playbook latch (a powered work standing inside an
// authored relay-site rect WHILE a program holds the wheel).
//
// Board facts measured this ride (idle probe + contract JSON):
//   claim (0,12) · hero 400/400 (twist.hero.maxHpBonus 300) · lossStakes []
//   → the claim is NOT a loss condition, so the hero may leave it.
//   Build ground is ONLY the four relay sites at z 36..46 (+ a bridge strip),
//   nearest point 31.24 wu from the claim against turret range 16: nothing can
//   defend the claim. So WALK THE HERO INTO A RELAY SITE and fort around it —
//   the fort then lights the site for free and the era gate is a side effect.
//   Roster (rogue_automaton, data_rustler) carries NO wrecker → works cannot be
//   attacked; data_rustler is a thief, and with no stockpile standing
//   nearestGoldHolding is empty so thieves fall through to hero pursuit.
//   → decline the stockpile (gen 106 measured 435 g stolen on a thief roster);
//     the live bank cap is therefore the default 200, and gold is the ONLY free
//     ranking axis (waves 20 and timeAlive 600.000 are pinned by the gate).

const POST_LIST = [
  { x: 24, z: 41 }, { x: 24, z: 43 }, { x: 26, z: 41 }, { x: 22, z: 41 },
  { x: 24, z: 39 }, { x: -25, z: 41 }, { x: -25, z: 39 }, { x: 0, z: 12 },
];

const RELAY_SITES = [
  { id: 'relay-site-r1', minX: -50, maxX: -40, minZ: 36, maxZ: 46 },
  { id: 'relay-site-r2', minX: -30, maxX: -20, minZ: 36, maxZ: 46 },
  { id: 'relay-site-r3', minX: 20, maxX: 30, minZ: 36, maxZ: 46 },
  { id: 'relay-site-r4', minX: 40, maxX: 50, minZ: 36, maxZ: 46 },
];

// Integer lattice inside relay-site-r3, south rows first (shortest Prospector
// trip from the valley seams), skipping the hero's own row z=41.
function candidatesFor(post) {
  const pts = [];
  const xs = post.x > 0 ? [23, 25, 21, 27, 29] : [-23, -25, -21, -27, -29];
  for (const z of [37, 39, 43, 45]) for (const x of xs) pts.push({ x, z });
  return pts.filter((p) => Math.hypot(p.x - post.x, p.z - post.z) > 1.5);
}

const CAP = 200;            // no stockpile → default bank cap
const HARD_STOP = 430;      // no BUILD after this, bypassed only under real danger
const SECURE_T = 600;

// strategy order, NOT price order (gen 39): the era-gate beacon, then turrets.
const CORE = ['sentry_beacon', 'turret', 'turret', 'sentry_beacon', 'turret', 'turret'];
const EMERGENCY = ['sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon'];

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i;

export default {
  newState() {
    return {
      postIdx: 0, poisoned: new Set(), retired: new Set(), pbName: null,
      pbTried: 0, held: false, seamBlock: 0, baseKinds: null, lastMet: false,
    };
  },

  decide(view, s) {
    const n = view.now;
    const sp = view.stablePrefix;
    const t = n.timers?.runSeconds ?? 0;

    // 1) SECURE WINDOW: silence. It cannot be REJECTED (a refused array inside
    // the choice window is invisible to the tape and visible to the sim, so the
    // replay diverges — gen 84), it banks the configured default for free, and
    // it keeps the last accepted order inside the tick envelope.
    if (n.pendingSecure) return null;

    const post = POST_LIST[Math.min(s.postIdx, POST_LIST.length - 1)];
    const hero = { x: n.hero.x, z: n.hero.z };
    const parked = Math.hypot(hero.x - post.x, hero.z - post.z) < 0.9;

    // --- read refusals: partition GROUND (poison the coordinate) from ECONOMY
    // (insufficient_gold — retry, poison nothing). gen 51.
    for (const rec of (n.orders || [])) {
      const o = rec.order || {};
      const why = `${rec.reason || ''} ${rec.detail || ''}`;
      if (rec.status !== 'failed') continue;
      if (o.verb === 'BUILD' && o.where && GROUND.test(why)) {
        s.poisoned.add(`${o.what}@${o.where.x},${o.where.z}`);
      }
      if (o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(why)) {
        if (s.postIdx < POST_LIST.length - 1) s.postIdx += 1;
      }
    }

    const orders = [];

    // 2) DRAFT FIRST under replace semantics (gen 5): a lone PICK_UPGRADE wipes
    // the standing set, so the pick owns the head and everything is resent.
    if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
      const score = (o) => {
        const s2 = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
        if (/plating|dressing|armou?r|max ?hp|health|vital|hide|toughen/.test(s2)) return 100;
        if (/heal|regen|mend/.test(s2)) return 80;
        if (/spark|damage|tap|coil|volley|rate|pierce/.test(s2)) return 60;
        if (/range|reach/.test(s2)) return 40;
        return 10;
      };
      const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 3) THE ERA GATE. A powered work standing inside a relay-site rect lights
    // that site on any step where runningProgram !== null. So: get the work
    // standing with ordinary orders (they are the demonstration), then name a
    // fresh tape — PLAYBOOK_USE records every array already submitted and
    // installs it, which sets runningProgram and lights the site one step later.
    const pb = n.playbookUse || {};
    const met = pb.objectiveMet === true;
    if (met) s.lastMet = true;
    const litWork = (n.works?.entries || []).some((e) => {
      if (e.wrecked) return false;
      if (!['turret', 'sentry_beacon'].includes(e.id)) return false;
      const p = e.position || {};
      if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) return false;
      return RELAY_SITES.some((r) => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ);
    });
    if (!met && pb.declared) {
      // Hold the wheel with SILENCE: any ACCEPTED ordinary submission clears
      // runningProgram. A blank line records no tape entry at all — but it also
      // DEFAULTS a live draft, so never hold while an offer is on the table.
      if (pb.runningProgram && !s.held && !orders.length) {
        s.held = true;
        return null;
      }
      if (litWork && s.pbTried < 6) {
        s.pbTried += 1;
        s.held = false;
        s.pbName = `relay-valley-${s.pbTried}`;
        orders.push({ verb: 'PLAYBOOK_USE', name: s.pbName });
      }
    }

    // 4) BLAST_AT above the traveller: it returns {} on success AND failure, so
    // it never owns the tick (gen 108). Enemies converge on the hero.
    if ((n.blastReadyInMs ?? 1) === 0) {
      orders.push({ verb: 'BLAST_AT', pos: { x: +hero.x.toFixed(2), z: +(hero.z - 1).toFixed(2) } });
    }

    // 5) MOVE_HERO: emitted ONCE and dropped when parked (gen 68/79 — a ladder
    // of posts is a shuttle that ping-pongs the hero and freezes the economy).
    if (!parked) orders.push({ verb: 'MOVE_HERO', pos: post });

    // 6) THE LADDER — one head rung at a time, priced at its LIVE instance off
    // buildables[].costs[standingOfThatId] (gen 73), with the ordinal counted as
    // rungs-walked-past of that id (gen 99/102: never standing + walkedPast).
    const byKind = n.works?.byKind || {};
    if (!s.baseKinds) s.baseKinds = { ...byKind };
    const bl = {};
    for (const b of (sp.mechanics?.buildables || [])) bl[b.id] = b;
    const standing = (id) => byKind[id] || 0;
    const costOf = (id) => {
      const b = bl[id]; if (!b) return Infinity;
      const i = Math.min(standing(id), (b.costs || []).length - 1);
      return (b.costs || [])[i] ?? Infinity;
    };

    const hpFrac = n.hero.maxHp ? n.hero.hp / n.hero.maxHp : 1;
    const danger = hpFrac < 0.70 || (n.works?.standing ?? 0) < 2;
    const desperate = hpFrac < 0.45;
    const rate = Math.max(0.7, (n.score?.goldPanned ?? 0) / Math.max(t, 20));
    const remaining = Math.max(0, SECURE_T - t);

    // Which rungs are owed? Walk the strategy list, counting ordinals per id.
    const ord = {};
    const owed = [];
    const list = CORE.concat(danger ? EMERGENCY : []);
    for (let i = 0; i < list.length; i += 1) {
      const id = list[i];
      ord[id] = (ord[id] || 0) + 1;
      if (s.retired.has(`${id}#${ord[id]}`)) continue;
      if (standing(id) >= ord[id]) continue;
      owed.push({ id, ordinal: ord[id] });
    }

    if (owed.length && t < HARD_STOP + (desperate ? 170 : 0)) {
      const { id, ordinal } = owed[0];
      const cost = costOf(id);
      const cands = candidatesFor(post).filter((p) => !s.poisoned.has(`${id}@${p.x},${p.z}`));
      if (!cands.length) {
        s.retired.add(`${id}#${ordinal}`);          // gen 81: RETIRE, never stall
      } else if (Number.isFinite(cost) && standing(id) < (bl[id]?.maxCount ?? 0)) {
        // BANK GATE: allow only if the purse can still refill past the cap.
        // Bypassed under real danger; the HARD_STOP above is a flat floor that
        // cannot be argued with (gen 85/101).
        const projected = (n.gold - cost) + rate * remaining;
        if (danger || projected >= CAP + 25) {
          orders.push({ verb: 'BUILD', what: id, where: cands[0], when: { goldGte: cost } });
        }
      }
    }

    // 7) THE TAIL — the income and the clock. Rank LIVE seams by distance to the
    // hero, drain the nearest in a block, alternate with the runner-up so the
    // far half keeps working while the near one refills (gen 76). An inactive
    // seam publishes x/z/anchorIndex as null and ONE non-finite number refuses
    // the WHOLE array silently (gen 59), so filter on Number.isFinite first.
    const live = (n.seams || [])
      .filter((sm) => sm.active !== false && Number.isFinite(sm.x) && Number.isFinite(sm.z))
      .map((sm) => ({ id: sm.id, d: Math.hypot(sm.x - hero.x, sm.z - hero.z) }))
      .sort((a, b) => a.d - b.d);

    const slots = 32 - orders.length;
    if (live.length && slots > 0) {
      const a = live[0].id;
      const b = live[1] ? live[1].id : live[0].id;
      const BLK = 7;
      for (let i = 0; i < slots; i += 1) {
        const useA = Math.floor(i / BLK) % 2 === 0;
        orders.push({ verb: 'HARVEST', seam: useA ? a : b });
      }
    } else if (slots > 0) {
      // No live seam this instant: keep naming the nearest known seam id anyway
      // so the failing order parks the worker where the gold comes back, and
      // keeps emitting the surprise views that are my decision points.
      const anyId = (n.seams || [])[0]?.id;
      if (anyId) for (let i = 0; i < Math.min(slots, 8); i += 1) orders.push({ verb: 'HARVEST', seam: anyId });
    }

    if (!orders.length) return null;
    return orders.slice(0, 32);
  },
};
