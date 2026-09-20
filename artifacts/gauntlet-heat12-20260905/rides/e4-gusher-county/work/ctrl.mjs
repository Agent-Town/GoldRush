// e4-gusher-county controller. worldModel: sim-import
const W = 'camp-to-west-lease', E = 'camp-to-east-lease', N = 'camp-to-north-lease';
const CORR = [W, E, N];                       // closure pick order: corridorIds[cycle % 3]
const HEAD = { [W]: { x: -50, z: -40 }, [E]: { x: 48, z: -38 }, [N]: { x: 0, z: 46 } };
const STAKE = { [W]: { x: -12, z: -8 }, [E]: { x: 12, z: -8 }, [N]: { x: 0, z: 8 } };
const TAR = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }];
const PSPEED = 4.8;

const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const mv = (p) => ({ verb: 'MOVE_TO', pos: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) } });

// closure schedule: storm covers t mod 30 in [10,22); the closed lease is CORR[floor(t/30)%3]
function closedAt(t) {
  const cyc = Math.floor(t / 30), tm = t - cyc * 30;
  return (tm >= 10 && tm < 22) ? CORR[((cyc % 3) + 3) % 3] : null;
}
function leaseSafe(id, t0, t1) {
  for (let t = t0; t <= t1; t += 0.4) if (closedAt(t) === id) return false;
  return closedAt(t1) !== id;
}

// ---- build ladder -------------------------------------------------------
const T_SPOTS = [{ x: -8, z: -4 }, { x: 8, z: -4 }, { x: 0, z: 4 }, { x: 0, z: -12 },
{ x: -13, z: 1 }, { x: 13, z: 1 }, { x: -13, z: -9 }, { x: 13, z: -9 }, { x: 0, z: 11 }, { x: -6, z: -16 }];
const B_SPOTS = [{ x: -4, z: 1 }, { x: 4, z: 1 }, { x: -4, z: -9 }, { x: 4, z: -9 },
{ x: -9, z: 4 }, { x: 9, z: 4 }, { x: -9, z: -11 }, { x: 9, z: -11 }, { x: 5, z: 6 }, { x: -5, z: 6 }];
const LADDER = ['turret', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'sentry_beacon'];
const GROUND_FAIL = /out_of_zone|collision|out_of_reach|cap_reached|terrain|UNREACHABLE/i;

const PLATING = /plating|dressing|vigor|hardy|constitution|health|armor|armour|tough/i;

export function makeController(log) {
  const blacklist = new Set();
  let lastArr = null;

  return function controller(view) {
    const now = view.now;
    const m = now.motor;
    const t = m.weather.simTime;
    const orders = [];

    // secure boundary: blank line -> configured default (bank), one fewer entry
    if (now.pendingSecure) { log({ t, event: 'secure-blank' }); return '\n'; }

    // learn refused coordinates (ground refusals only; never on insufficient_gold)
    for (const rec of (now.orders || [])) {
      const o = rec.order || rec;
      if (rec.status === 'failed' && o && o.verb === 'BUILD' && o.where) {
        const reason = `${rec.reason || ''} ${rec.detail || ''}`;
        if (GROUND_FAIL.test(reason)) blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
      }
    }

    // 1. upgrade draft first (replace semantics)
    if (now.pendingOffer && now.pendingOffer.length) {
      let pick = now.pendingOffer[0];
      for (const o of now.pendingOffer) {
        if (PLATING.test(o.name + ' ' + (o.effectText || '') + ' ' + o.id)) { pick = o; break; }
      }
      orders.push({ verb: 'PICK_UPGRADE', id: pick.id });
    }

    // 2. free supplementary blast at the scrum on the welded hero
    if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: -1 } });

    // ---------------- errand ----------------
    const errandDone = !!m.objective.arrived;
    let p = { x: now.prospector.x, z: now.prospector.z };
    let clock = t;
    const walk = (to) => { const s = d2(p, to) / PSPEED; clock += s; p = { x: to.x, z: to.z }; return s; };

    if (!errandDone) {
      const nodes = m.fuel.nodes;
      const graded = new Set(m.roads.graded && m.roads.graded.length ? m.roads.graded : m.roads.corridors.filter(c => c.graded).map(c => c.id));
      let placed = 0;
      // phase 0: tar + grades, route (-12,-8) -> (0,-8) -> (12,-8) -> (0,8)
      const phase0 = [
        { pos: TAR[0], node: 0, grade: W },
        { pos: TAR[1], node: 1, grade: null },
        { pos: TAR[2], node: 2, grade: E },
        { pos: STAKE[N], node: -1, grade: N },
      ];
      let phase0Pending = false;
      for (const st of phase0) {
        const needTar = st.node >= 0 && nodes[st.node] && !nodes[st.node].harvested;
        const needGrade = st.grade && !graded.has(st.grade);
        if (!needTar && !needGrade) continue;
        phase0Pending = true;
        orders.push(mv(st.pos)); walk(st.pos);
        if (needTar) { // dwell: 0.9 out and back on two axes keeps the body inside harvestRange 1.35
          orders.push(mv({ x: st.pos.x + 0.9, z: st.pos.z }));
          orders.push(mv(st.pos));
          orders.push(mv({ x: st.pos.x, z: st.pos.z + 0.9 }));
          orders.push(mv(st.pos));
          clock += 0.9;
        }
        if (needGrade) { orders.push({ verb: 'GRADE' }); clock += 0.2; }
        placed++;
        if (orders.length > 22) break;
      }

      if (!phase0Pending || orders.length <= 24) {
        // errand steps
        const dl = new Set(m.objective.delivered || []);
        const veh = m.vehicle;
        const vp = veh.target && Number.isFinite(veh.target.x) ? veh.target : { x: veh.x, z: veh.z };
        const at = (q) => d2(vp, q) < 3.0;
        const STEPS = [
          { wp: STAKE[W], lease: null },              // 0 stage
          { wp: HEAD[W], lease: W },                  // 1 deliver west
          { wp: STAKE[W], lease: null },              // 2 home
          { wp: STAKE[N], lease: null },              // 3 cross to north stake
          { wp: HEAD[N], lease: N },                  // 4 deliver north
          { wp: STAKE[N], lease: null },              // 5 home
          { wp: STAKE[E], lease: null },              // 6 cross to east stake
          { wp: HEAD[E], lease: E },                  // 7 deliver east
        ];
        let idx;
        if (!dl.has(W)) idx = at(STAKE[W]) ? 1 : 0;
        else if (!dl.has(N)) idx = at(HEAD[W]) ? 2 : at(STAKE[W]) ? 3 : at(STAKE[N]) ? 4 : 2;
        else if (!dl.has(E)) idx = at(HEAD[N]) ? 5 : at(STAKE[N]) ? 6 : at(STAKE[E]) ? 7 : 5;
        else idx = 8;

        // opportunistic pan: after the west delivery the Prospector is standing between
        // the seed's only two near-neighbour seams; 60 gold buys the opening turret.
        if (idx === 2 && now.gold < 60 && p.x < -20) {
          const west = (now.seams || []).filter(s => s.active && s.x < -20)
            .sort((a, b) => d2(p, a) - d2(p, b));
          for (const s of west.slice(0, 2)) {
            for (let i = 0; i < 7; i++) orders.push({ verb: 'HARVEST', seam: s.id });
            walk({ x: s.x, z: s.z }); clock += 10;
          }
        }

        let stalled = false;
        for (let i = idx; i < STEPS.length && orders.length < 30 && !stalled; i++) {
          const st = STEPS[i];
          orders.push(mv(st.wp));
          const wt = walk(st.wp);
          if (st.lease) {
            const drive = d2(STAKE[st.lease], HEAD[st.lease]) / 22.5 + 1.0;
            if (!leaseSafe(st.lease, clock - 0.5, clock + drive + 1.5)) {
              // hard gate on the disaster: a closed lease takes no delivery and carries no road
              orders.push({ verb: 'HOLD', pos: { x: +st.wp.x.toFixed(3), z: +st.wp.z.toFixed(3) } });
              log({ t, event: 'closure-hold', lease: st.lease, at: +clock.toFixed(1) });
              stalled = true; break;
            }
          }
          orders.push({ verb: 'HAUL' });
          clock += 3;
        }
        if (stalled) return finish(orders, log, view);
      }
    }

    // ---------------- economy + fort ----------------
    const byKind = now.works.byKind || {};
    const nT = byKind.turret || 0, nB = byKind.sentry_beacon || 0;
    const costs = {};
    for (const b of (view.stablePrefix.mechanics.buildables || [])) costs[b.id] = b.costs;
    let ct = nT, cb = nB, cum = 0, built = 0;
    const usedT = new Set(), usedB = new Set();
    for (const e of (now.works.entries || [])) {
      const key = `${e.position ? e.position.x : e.x},${e.position ? e.position.z : e.z}`;
      (e.id === 'turret' ? usedT : usedB).add(key);
    }
    for (const kind of LADDER) {
      if (orders.length >= 29) break;
      const isT = kind === 'turret';
      const n = isT ? ct : cb;
      const arr = costs[kind] || (isT ? [50, 70, 95, 125] : [25, 35, 45, 55, 75, 95]);
      if (n >= arr.length) continue;
      const price = arr[n];
      if (cum + price > now.gold) break;                 // plan-time affordability, cumulative
      const spots = isT ? T_SPOTS : B_SPOTS;
      const spot = spots.find(s => !blacklist.has(`${kind}@${s.x},${s.z}`) &&
        !(isT ? usedT : usedB).has(`${s.x},${s.z}`));
      if (!spot) { if (isT) ct++; else cb++; continue; }
      (isT ? usedT : usedB).add(`${spot.x},${spot.z}`);
      cum += price; if (isT) ct++; else cb++; built++;
      orders.push({ verb: 'BUILD', what: kind, where: spot, when: { goldGte: cum } });
    }

    // tier upgrades once the ladder is out of stock and the purse is filling
    if (built === 0 && now.gold >= 150 && orders.length < 27) {
      const ents = (now.works.entries || []).map((e, i) => ({ e, i }))
        .filter(({ e }) => e.id === 'turret' && (e.tier || 1) < 2 && !e.wrecked);
      if (ents.length) {
        const tgt = ents[0].e;
        const pos = tgt.position || { x: tgt.x, z: tgt.z };
        orders.push(mv(pos));
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: tgt.index != null ? tgt.index : ents[0].i } });
      }
    }

    // harvest tail: drain the nearest seam in a block before walking to the next
    const act = (now.seams || []).filter(s => s.active);
    const pp = { x: now.prospector.x, z: now.prospector.z };
    act.sort((a, b) => d2(pp, a) - d2(pp, b));
    const chain = [];
    if (act.length) {
      chain.push(act[0]);
      const near = act.slice(1).sort((a, b) => d2(act[0], a) - d2(act[0], b));
      if (near.length) chain.push(near[0]);
      chain.push(act[0]);
    }
    for (const s of chain) {
      for (let i = 0; i < 7 && orders.length < 31; i++) orders.push({ verb: 'HARVEST', seam: s.id });
    }
    // terminal anchor that cannot be filtered away
    if (orders.length < 32) {
      const a = act[0] || { x: 0, z: -4 };
      orders.push({ verb: 'HOLD', pos: { x: +a.x.toFixed(2), z: +a.z.toFixed(2) } });
    }
    return finish(orders, log, view);
  };

  function finish(orders, log, view) {
    const arr = orders.slice(0, 32);
    const n = view.now;
    log({
      t: +n.motor.weather.simTime.toFixed(1), w: n.wave, hp: n.hero.hp, lvl: n.hero.level,
      gold: n.gold, pan: n.score && n.score.goldPanned, alive: n.threats.alive,
      tar: n.motor.fuel.tar, drawn: +n.motor.fuel.drawn.toFixed(2),
      graded: n.motor.roads.corridors.filter(c => c.graded).map(c => c.id.slice(5, 10)),
      deliv: n.motor.objective.delivered, veh: [+n.motor.vehicle.x.toFixed(1), +n.motor.vehicle.z.toFixed(1)],
      pros: [+n.prospector.x.toFixed(1), +n.prospector.z.toFixed(1)],
      works: n.works.byKind, closed: n.motor.roads.closed,
      ord: arr.map(o => o.verb).join(','),
    });
    return JSON.stringify(arr) + '\n';
  }
}
