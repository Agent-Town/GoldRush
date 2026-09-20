#!/usr/bin/env node
// Twin Banks controller — Claude Fable 5, heat 11 (gen 7).
// Deterministic standing-orders rider for e1-twin-banks. Ladder adapted from the
// gen-6 dry-gulch first-secure: builds in gate order, REPAIR_UNDER, harvest chain
// nearest-active (same-bank first), HOLD home. Sluices are this map's authored
// economy (3g/5s beside the river, legal only on the z=±7 line).
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { appendFileSync } from 'node:fs';

const logPath = process.argv[5];
const log = (s) => { if (logPath) appendFileSync(logPath, s + '\n'); };

const [contract, seed, tapePath] = [process.argv[2] ?? 'e1-twin-banks', process.argv[3] ?? 'e1-twin-banks-01', process.argv[4]];
const args = ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed];
if (tapePath) args.push('--tape', tapePath);
const sim = spawn('node', args, { cwd: '/private/tmp/heat11-5e7a7c0b', stdio: ['pipe', 'pipe', 'pipe'] });
sim.stderr.on('data', (d) => process.stderr.write(d));

const HOME = { x: -7, z: -9 }; // prospector's rest spot: OUTSIDE the sealed hero ring, by the sluice line
// [kind, x, z, goldGate] — array order is priority; gates are instance prices
// (ceil-to-5 curves) except beacons 4-6 and stockpiles, deliberately gated high
// so turrets outrank them during the climb.
const LADDER = [
  ['palisade', 0, -9.3, 10, 0],
  ['palisade', 2.7, -12, 10, 1],
  ['palisade', 0, -14.7, 10, 0],
  ['palisade', -2.7, -12, 10, 1],
  ['turret', -3, -8.5, 50],
  ['sluice', -6, -7, 50],
  ['turret', 3, -8.5, 70],
  ['sluice', 6, -7, 70],
  ['turret', -3, -15.5, 95],
  ['sluice', -12, -7, 95],
  ['turret', 3, -15.5, 125],
  ['sentry_beacon', 0, -17.5, 130],
  ['sentry_beacon', 5, -9, 130],
  ['sentry_beacon', -5, -15, 150],
  ['stockpile', -3, -19, 180],
  ['stockpile', 3, -19, 180],
];
const PICK_PREF = ['prospectors_luck', 'double_tap_coil', 'heavy_spark', 'tinkers_plating', 'split_spark', 'quick_fuse', 'powder_charge', 'wide_ring', 'long_resonator', 'beacon_dynamo'];

let lastKey = null;
let repeats = 0;
let sent = 0;

function ordersFor(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const key = JSON.stringify([now.wave, now.timers?.runSeconds, now.threats?.spawnedTotal, now.gold]);
  if (key === lastKey) { repeats += 1; } else { repeats = 0; lastKey = key; }
  if (repeats >= 1) {
    // Same view re-served: previous array was rejected. Degrade to minimal legal.
    if (now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: pickId(now.pendingOffer) }];
    return [{ verb: 'HOLD', pos: HOME }];
  }

  const out = [];
  if (now.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: pickId(now.pendingOffer) });

  // Prune builds already standing/wrecked, counted per kind in ladder order.
  const counts = {};
  for (const entry of now.works?.entries ?? []) {
    const id = entry.id ?? entry.kind;
    counts[id] = (counts[id] ?? 0) + 1;
  }
  const seen = {};
  for (const [kind, x, z, gate, rot] of LADDER) {
    seen[kind] = (seen[kind] ?? 0) + 1;
    if (seen[kind] <= (counts[kind] ?? 0)) continue;
    const order = { verb: 'BUILD', what: kind, where: { x, z }, when: { goldGte: gate } };
    if (rot !== undefined) order.rotationSteps = rot;
    out.push(order);
  }

  out.push({ verb: 'REPAIR_UNDER', pct: 70 });

  const px = now.prospector?.x ?? HOME.x;
  const pz = now.prospector?.z ?? HOME.z;
  const active = (now.seams ?? []).filter((s) => s.active && s.x !== null);
  const dist = (s) => Math.hypot(s.x - px, s.z - pz);
  const south = active.filter((s) => s.z < 0).sort((a, b) => dist(a) - dist(b));
  const north = active.filter((s) => s.z >= 0).sort((a, b) => dist(a) - dist(b));
  for (const s of [...south, ...north]) out.push({ verb: 'HARVEST', seam: s.id });

  out.push({ verb: 'HOLD', pos: HOME });
  return out.slice(0, 32);
}

function pickId(offer) {
  for (const want of PICK_PREF) if (offer.some((o) => o.id === want)) return want;
  return offer[0].id;
}

const rl = createInterface({ input: sim.stdout });
rl.on('line', (line) => {
  let obj;
  try { obj = JSON.parse(line); } catch { return; }
  if (obj && obj.schema && String(obj.schema).startsWith('goldrush.view')) {
    const n = obj.now;
    log(JSON.stringify({
      w: n.wave, t: n.timers?.runSeconds, gold: n.gold, heroHp: n.hero?.hp,
      works: n.works?.byKind, standing: n.works?.standing, wrecked: n.works?.wrecked,
      alive: n.threats?.alive, edge: n.threats?.edge,
      offer: n.pendingOffer?.map((o) => o.id), secure: n.pendingSecure ?? null,
      surprises: obj.appendLog?.at(-1)?.surprises, lastWave: obj.appendLog?.at(-1),
    }));
    const orders = ordersFor(obj);
    log('ORDERS ' + JSON.stringify(orders));
    try {
      if (sim.stdin.writable) { sim.stdin.write(JSON.stringify(orders) + '\n'); sent += 1; }
    } catch { /* terminal view: sim no longer awaits orders */ }
    return;
  }
  // Terminal outcome line.
  process.stdout.write(JSON.stringify({ outcome: obj, arraysSent: sent }) + '\n');
  sim.stdin.end();
});
sim.on('exit', (code) => process.exit(code ?? 0));
