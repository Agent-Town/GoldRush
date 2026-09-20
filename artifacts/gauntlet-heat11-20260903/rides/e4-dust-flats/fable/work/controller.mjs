// e4-dust-flats controller v2 — Claude Fable 5, gauntlet heat 11, generation 16.
// Deterministic: every decision is a pure function of the current view.
// v2 changes after tune-1 (died w1/31.4s): NO SET_WEAPON blast (auto-blast killed 5
// in 31s where the idle rig killed 34 in 79s — this map's gangs stream, not clump);
// beacon,beacon,turret opening ladder; errand deferred until two turrets stand
// (boss at wave 14 ~t460 leaves ~250s of slack); explicit BLAST_AT only when the
// cooldown is ready and threats press the hero.
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const tapePath = process.argv[2] ?? 'tune-tape.json';
const REPO = '/private/tmp/heat11-b118c4d2';
const sim = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', 'e4-dust-flats', '--seed', 'e4-dust-flats-01', '--tape', tapePath,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

const PLAN = [
  { kind: 'palisade', x: 0, z: 10.5 },
  { kind: 'palisade', x: -2.5, z: 7 },
  { kind: 'turret', x: 0, z: 17 },
  { kind: 'sentry_beacon', x: 3, z: 10 },
  { kind: 'turret', x: -11, z: 12.5 },
  { kind: 'turret', x: 11, z: 12.5 },
  { kind: 'sentry_beacon', x: -5, z: 6 },
  { kind: 'turret', x: 3, z: 11 },
  { kind: 'sentry_beacon', x: 5, z: 5 },
];
const PREFS = [
  'tinkers_plating', 'double_tap_coil', 'prospectors_luck', 'heavy_spark',
  'quick_fuse', 'split_spark', 'long_resonator', 'beacon_dynamo',
  'pan_legend', 'powder_charge', 'wide_ring', 'spring_heels',
];
const TAR_ORDER = [[0, -8], [-12, -8], [12, -8]];
const CAMP = { x: 0, z: 8 };

let buf = '';
sim.stdout.on('data', (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i);
    buf = buf.slice(i + 1);
    if (line.trim()) onLine(line.trim());
  }
});
sim.stderr.on('data', (d) => process.stderr.write(d));
sim.on('exit', (code) => process.exit(code ?? 0));

function onLine(line) {
  let v;
  try { v = JSON.parse(line); } catch { return; }
  if (v.schema !== 'goldrush.view.v1') {
    console.log(JSON.stringify(v));
    return;
  }
  const n = v.now;
  appendFileSync(`${tapePath}.views.ndjson`, JSON.stringify({
    w: n.wave, t: n.timers?.runSeconds, gold: n.gold, hp: n.hero?.hp,
    threats: n.threats?.alive, works: (n.works?.entries ?? []).map((e) => `${e.id}@${Math.round(e.hp)}`),
    arrived: n.motor?.objective?.arrived, offer: n.pendingOffer?.map((o) => o.id),
    secure: Boolean(n.pendingSecure), seams: (n.seams ?? []).filter((s) => s.active).map((s) => `${s.id}:${s.remaining}@${s.x},${s.z}`),
    append: v.appendLog?.slice(-1),
  }) + '\n');
  const orders = decide(v);
  sim.stdin.write(JSON.stringify(orders) + '\n');
}

function dist(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }

// Prefer seams that keep the Prospector near home: raw distance plus a 0.7x
// penalty on distance-from-camp, so the far corner fields lose to any northern
// respawn unless nothing nearer is active.
function nearestSeam(now) {
  const p = now.prospector ?? CAMP;
  let best = null;
  for (const s of now.seams ?? []) {
    if (!s.active || !(s.remaining > 0) || typeof s.x !== 'number') continue;
    const score = dist(p.x, p.z, s.x, s.z) + 0.7 * dist(CAMP.x, CAMP.z, s.x, s.z);
    if (!best || score < best.score) best = { s, score };
  }
  return best?.s ?? null;
}

function decide(v) {
  const now = v.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    orders.push({ verb: 'PICK_UPGRADE', id: PREFS.find((p) => ids.includes(p)) ?? ids[0] });
  }
  if ((now.threats?.alive ?? 0) >= 3 && (now.blastReadyInMs ?? 0) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CAMP.x, z: CAMP.z } });
  }

  const motor = now.motor;
  const gold = now.gold ?? 0;
  const entries = now.works?.entries ?? [];
  const builtBy = {};
  for (const e of entries) builtBy[e.id] = (builtBy[e.id] ?? 0) + 1;
  const costsBy = {};
  for (const b of v.stablePrefix.mechanics?.buildables ?? []) costsBy[b.id] = b.costs ?? [];

  const errandDone = motor?.objective?.arrived === true;
  const dispatch = motor?.vehicle?.dispatch ?? null;
  const goingRailhead = dispatch !== null && dispatch.z > 40;
  const turretCount = builtBy.turret ?? 0;

  if (!errandDone && !goingRailhead && (turretCount >= 3 || (now.wave ?? 0) >= 9)) {
    return orders.concat(errandOrders(now, motor), harvestTail(now));
  }

  // Economy + fort ladder (also runs while the Hauler drives its last leg solo).
  let next = null;
  const seen = {};
  for (const item of PLAN) {
    const ordinal = seen[item.kind] ?? 0;
    seen[item.kind] = ordinal + 1;
    if (ordinal >= (builtBy[item.kind] ?? 0)) { next = { ...item, ordinal }; break; }
  }
  if (next) {
    const cost = costsBy[next.kind]?.[next.ordinal];
    if (typeof cost === 'number') {
      orders.push({ verb: 'BUILD', what: next.kind, where: { x: next.x, z: next.z }, when: { goldGte: cost } });
    }
  }
  const s = nearestSeam(now);
  orders.push(alarm(now, s, gold));
  orders.push({ verb: 'REPAIR_UNDER', pct: (now.wave ?? 0) >= 13 ? 70 : 40 });
  return orders.concat(harvestTail(now));
}

function errandOrders(now, motor) {
  const orders = [];
  const graded = (motor?.roads?.graded ?? []).includes('camp-to-railhead');
  const tarNodes = motor?.fuel?.nodes ?? [];
  if (!graded) {
    orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
    orders.push({ verb: 'GRADE' });
  }
  for (const [nx, nz] of TAR_ORDER) {
    const rec = tarNodes.find((n) => n.x === nx && n.z === nz);
    if (rec && !rec.harvested) {
      orders.push({ verb: 'MOVE_TO', pos: { x: nx, z: nz } });
      orders.push({ verb: 'MOVE_TO', pos: { x: nx + 0.6, z: nz } });
      orders.push({ verb: 'MOVE_TO', pos: { x: nx, z: nz } });
    }
  }
  if ((motor?.vehicle?.dispatch ?? null) === null) {
    orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
    orders.push({ verb: 'HAUL' });
  }
  orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 72 } });
  orders.push({ verb: 'HAUL' });
  return orders;
}

function harvestTail(now) {
  const s = nearestSeam(now);
  if (s) {
    return [
      { verb: 'HARVEST', seam: s.id },
      { verb: 'HOLD', pos: { x: s.x, z: s.z } },
    ];
  }
  return [{ verb: 'HOLD', pos: { x: CAMP.x, z: CAMP.z } }];
}

// Drain-alarm probe: a sluice on a waterless map always fails, so this fires an
// order-failure surprise view the moment the gate crosses (at seam-drain when the
// seam is nearly empty). Zero travel: sited at the Prospector's feet.
function alarm(now, seam, gold) {
  const p = now.prospector ?? CAMP;
  const step = seam ? Math.max(1, Math.min(10, seam.remaining)) : 10;
  return {
    verb: 'BUILD', what: 'sluice',
    where: { x: Math.round(p.x * 10) / 10, z: Math.round(p.z * 10) / 10 },
    when: { goldGte: Math.min(1000000, gold + step) },
  };
}
