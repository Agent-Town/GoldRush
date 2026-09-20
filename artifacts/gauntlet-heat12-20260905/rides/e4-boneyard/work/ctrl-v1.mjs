// e4-boneyard controller v1 — heat 12, generation 52.
// Shape: motor errand first (tar tour -> hitch -> deliver), then fort + far-seam economy.
const CLAIM = { x: 0, z: -44 };
const HULK = { x: -18, z: -8 };
const GATE = { x: -8, z: -38 };

const TURRETS = [
  { x: -7, z: -38 }, { x: 7, z: -38 }, { x: 0, z: -36 },
  { x: -14, z: -40 }, { x: 14, z: -40 }, { x: -7, z: -34 }, { x: 7, z: -34 },
];
const BEACONS = [
  { x: -5, z: -41 }, { x: 5, z: -41 }, { x: -5, z: -47 }, { x: 5, z: -47 },
  { x: -10, z: -44 }, { x: 10, z: -44 },
];

const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|dressing|vigor|max health|maxhp|health|hp\b|armou?r|toughen/.test(s)) return 3;
  if (/spark|damage|tap|coil|rate|fire/.test(s)) return 2;
  return 1;
}

// dwell: five MOVE_TOs that keep the body inside harvestRange 1.35 for ~0.8s
function dwell(p) {
  return [
    { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
    { verb: 'MOVE_TO', pos: { x: p.x + 0.9, z: p.z } },
    { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
    { verb: 'MOVE_TO', pos: { x: p.x, z: p.z + 0.9 } },
    { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
  ];
}

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return { blank: true };

  const out = [];

  // 1. draft first, under replace semantics
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free damage
  if (now.blastReadyInMs === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: -38 } });

  // 3. refusal blacklist from the view's own order records
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      const r = `${rec.reason || ''} ${rec.detail || ''}`;
      if (!/insufficient_gold/i.test(r)) blacklist.add(key(o.where));
    }
  }

  // 4. the motor errand
  const m = now.motor;
  const obj = m?.objective;
  let errandBusy = false;
  if (obj && !obj.arrived) {
    errandBusy = true;
    if (!obj.hitched) {
      for (const node of m.fuel.nodes) {
        if (!node.harvested) out.push(...dwell(node));
      }
      out.push({ verb: 'MOVE_TO', pos: { x: HULK.x, z: HULK.z } });
      out.push({ verb: 'HAUL' });
      out.push({ verb: 'HOLD', pos: { x: HULK.x, z: HULK.z } });
    } else {
      out.push({ verb: 'MOVE_TO', pos: { x: GATE.x, z: GATE.z } });
      out.push({ verb: 'HAUL' });
      // hold the dispatch point one beat, then fall through to the economy
      out.push({ verb: 'MOVE_TO', pos: { x: GATE.x + 0.6, z: GATE.z } });
      out.push({ verb: 'MOVE_TO', pos: { x: GATE.x, z: GATE.z } });
    }
  }

  // 5. the ladder — one batch in flight, suffix-gated so a single trip home buys it all
  const byKind = now.works?.byKind || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const wave = now.wave || 0;
  if (!errandBusy && wave <= 9) {
    let batch = null;
    if (nT < 1) batch = [{ what: 'turret', cost: 50, cands: TURRETS }];
    else if (nT < 3) {
      batch = [];
      if (nT < 2) batch.push({ what: 'turret', cost: 70, cands: TURRETS });
      batch.push({ what: 'turret', cost: 95, cands: TURRETS });
    } else if (nB < 2) {
      batch = [];
      if (nB < 1) batch.push({ what: 'sentry_beacon', cost: 25, cands: BEACONS });
      batch.push({ what: 'sentry_beacon', cost: 35, cands: BEACONS });
    }
    if (batch && batch.length) {
      // suffix sums: rung i gated on the cost of rungs i..end, so the batch opens as one trip
      const suffix = [];
      let acc = 0;
      for (let i = batch.length - 1; i >= 0; i--) { acc += batch[i].cost; suffix[i] = acc; }
      const taken = new Set(
        (now.works?.entries || []).map((e) => key({ x: Math.round(e.position?.x ?? e.x), z: Math.round(e.position?.z ?? e.z) })),
      );
      for (let i = 0; i < batch.length; i++) {
        const spot = batch[i].cands.find((c) => !blacklist.has(key(c)) && !taken.has(key(c)));
        if (!spot) continue;
        taken.add(key(spot));
        out.push({ verb: 'BUILD', what: batch[i].what, where: { x: spot.x, z: spot.z }, when: { goldGte: suffix[i] } });
      }
    }
  }

  // 6. the economy: drain the near seam cluster in blocks, never round-robin across the map
  const live = (now.seams || []).filter((s) => s.active && s.x !== null && s.z !== null);
  if (live.length) {
    const sorted = [...live].sort((a, b) => d(a, CLAIM) - d(b, CLAIM));
    const A = sorted[0];
    const rest = sorted.filter((s) => s.id !== A.id).sort((a, b) => d(a, A) - d(b, A));
    const B = rest[0];
    const room = 30 - out.length;
    const per = B ? Math.max(2, Math.floor(room / 3)) : Math.max(2, room - 1);
    for (let i = 0; i < per; i++) out.push({ verb: 'HARVEST', seam: A.id });
    if (B) {
      for (let i = 0; i < per; i++) out.push({ verb: 'HARVEST', seam: B.id });
      for (let i = 0; i < per && out.length < 31; i++) out.push({ verb: 'HARVEST', seam: A.id });
    }
    out.push({ verb: 'HOLD', pos: { x: A.x, z: A.z } });
  } else {
    out.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z + 4 } });
  }

  return out.slice(0, 32);
}
