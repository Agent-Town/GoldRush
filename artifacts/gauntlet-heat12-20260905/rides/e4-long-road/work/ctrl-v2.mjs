// e4-long-road controller v1 — heat 12.
// Shape: GRADE the long road at its west stake first (free, 10wu from the hero),
// raise a 4-work fort on the west way-station's north edge, then run the motor errand
// (3 tar nodes -> park on (190,0) -> HAUL until convoy.arrived), then pan out the clock.
const STOP = { x: 190, z: 0 };
const GRADE_STAKE = { x: -190, z: 0 };
const ERRAND_WAVE = 6;

// west-way-station box: x -148..-124, z -22..-6. North edge reaches the road (z=0) with range 16.
const LADDER = [
  { what: 'turret', cost: 50, spots: [{ x: -146, z: -6.5 }, { x: -144, z: -8 }, { x: -140, z: -6.5 }] },
  { what: 'turret', cost: 70, spots: [{ x: -136, z: -6.5 }, { x: -134, z: -8 }, { x: -132, z: -6.5 }] },
  { what: 'sentry_beacon', cost: 25, spots: [{ x: -141, z: -6.5 }, { x: -141, z: -8 }, { x: -143, z: -9 }] },
  { what: 'turret', cost: 95, spots: [{ x: -128, z: -6.5 }, { x: -126, z: -8 }, { x: -130, z: -9 }] },
  { what: 'sentry_beacon', cost: 35, spots: [{ x: -131, z: -6.5 }, { x: -131, z: -8 }, { x: -129, z: -9 }] },
  { what: 'sentry_beacon', cost: 45, spots: [{ x: -147, z: -10 }, { x: -145, z: -11 }, { x: -143, z: -12 }] },
];

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const PLATING = ['tinkers_plating', 'field_dressing', 'iron_lungs'];

function scoreUpgrade(id) {
  if (PLATING.includes(id)) return 100;
  if (/plating|dressing|vitality|health|hp|armor/.test(id)) return 90;
  if (/spark|tap|coil|powder|split|charge|damage/.test(id)) return 50;
  return 10;
}

function dwell(n) {
  return [
    { verb: 'MOVE_TO', pos: { x: n.x, z: n.z } },
    { verb: 'MOVE_TO', pos: { x: n.x + 0.9, z: n.z } },
    { verb: 'MOVE_TO', pos: { x: n.x, z: n.z } },
    { verb: 'MOVE_TO', pos: { x: n.x, z: n.z + 0.9 } },
    { verb: 'MOVE_TO', pos: { x: n.x, z: n.z } },
  ];
}

export default function controller(view, S, viewNo) {
  const now = view.now || {};
  if (now.pendingSecure) return null; // blank line: default `bank`, no tape entry

  S.blacklist = S.blacklist || new Set();
  for (const rec of now.orders || []) {
    if (rec.status === 'failed' && rec.order && rec.order.verb === 'BUILD' && rec.order.where) {
      const r = String(rec.reason || '');
      if (/UNREACHABLE|out_of_zone|collision|terrain/i.test(r)) {
        S.blacklist.add(`${rec.order.where.x},${rec.order.where.z}`);
      }
    }
  }

  const out = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b.id) - scoreUpgrade(a.id))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const motor = now.motor || {};
  const roads = (motor.roads && motor.roads.corridors) || [];
  const longRoad = roads.find(c => c.id === 'the-long-road');
  const graded = !!(longRoad && longRoad.graded);
  const arrived = !!(motor.objective && motor.objective.arrived);
  const pros = now.prospector || { x: 0, z: 0 };
  const nodes = (motor.fuel && motor.fuel.nodes) || [];
  const unharvested = nodes.filter(n => !n.harvested);

  // 1. The road is the map: 380 ungraded units cost ~123 fuel against a 36-fuel run.
  if (!graded) {
    out.push({ verb: 'MOVE_TO', pos: GRADE_STAKE });
    out.push({ verb: 'GRADE' });
  }

  const errand = !arrived && graded && now.wave >= ERRAND_WAVE;

  if (errand) {
    if (unharvested.length) {
      const ordered = [...unharvested].sort((a, b) => (a.x - b.x));
      for (const n of ordered) out.push(...dwell(n));
      out.push({ verb: 'MOVE_TO', pos: STOP });
      out.push({ verb: 'HOLD', pos: STOP });
    } else if (d(pros, STOP) < 1.0) {
      out.push({ verb: 'HAUL' });
      out.push({ verb: 'HOLD', pos: STOP });
    } else {
      out.push({ verb: 'MOVE_TO', pos: STOP });
      out.push({ verb: 'HOLD', pos: STOP });
    }
    return out.slice(0, 32);
  }

  // 2. Fort: one BUILD trip in flight, re-issued verbatim until works.entries shows it standing.
  const entries = (now.works && now.works.entries) || [];
  for (const rung of LADDER) {
    const filled = rung.spots.filter(s => entries.some(e => e.position && d(e.position, s) < 1.5));
    if (filled.length) continue;
    const spot = rung.spots.find(s => !S.blacklist.has(`${s.x},${s.z}`));
    if (!spot) continue;
    out.push({ verb: 'BUILD', what: rung.what, where: spot, when: { goldGte: rung.cost } });
    break;
  }

  // 3. Free supplementary damage on the scrum standing on the welded hero.
  if (now.blastReadyInMs === 0 && now.hero) {
    out.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z + 4 } });
  }

  // 4. Economy: drain one seam in a block before walking to the next.
  let seams = (now.seams || []).filter(s => s.active !== false);
  const near = seams.filter(s => s.x <= -110);
  if (near.length) seams = near;
  const ranked = [...seams].sort((a, b) => d(pros, a) - d(pros, b));
  const room = 30 - out.length;
  if (ranked.length && room > 0) {
    const per = 7;
    let k = 0;
    for (const s of ranked) {
      for (let i = 0; i < per && k < room; i++, k++) out.push({ verb: 'HARVEST', seam: s.id });
    }
  }
  out.push({ verb: 'HOLD', pos: ranked.length ? { x: ranked[0].x, z: ranked[0].z } : { x: pros.x, z: pros.z } });
  return out.slice(0, 32);
}
