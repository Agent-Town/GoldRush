#!/usr/bin/env node
// Opus 5 gen-15 controller — e4-boneyard (E4 Motor Frontier, `tow` errand).
// Usage: node ride.mjs <tapePath> [--log logPath]
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const tape = process.argv[2];
const logPath = process.argv[3] ?? tape.replace(/\.json$/, '.log.json');

const HULK = { x: -18, z: -8 };
const STOP = { x: -8, z: -38 };           // gate end of gate-to-west-rows
const TAR = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }];

// Turret slots inside build zone `gate-camp` (x -22..22, z -56..-34), north face of the stake (0,-44).
const TURRETS = [
  { x: 0, z: -37 }, { x: -13, z: -38 }, { x: 13, z: -38 },
  { x: -6, z: -35 }, { x: 6, z: -35 }, { x: 0, z: -41 },
];
const BEACONS = [
  { x: -5, z: -40 }, { x: 5, z: -40 }, { x: 0, z: -34 },
  { x: -16, z: -42 }, { x: 16, z: -42 }, { x: -10, z: -46 }, { x: 10, z: -46 },
];
const PALIS = [];
for (let i = 0; i < 12; i += 1) {
  const a = (Math.PI * i) / 11 - Math.PI / 2; // north half-ring, radius 9 around the stake
  PALIS.push({ x: +(0 + 9 * Math.sin(a)).toFixed(2), z: +(-44 + 9 * Math.cos(a)).toFixed(2) });
}

const dwell = (p) => [
  { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
  { verb: 'MOVE_TO', pos: { x: p.x + 1, z: p.z } },
  { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
  { verb: 'MOVE_TO', pos: { x: p.x, z: p.z + 1 } },
  { verb: 'MOVE_TO', pos: { x: p.x, z: p.z } },
];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pickUpgrade(offer) {
  const score = (u) => {
    const t = `${u.id} ${u.name} ${u.effectText ?? ''}`.toLowerCase();
    let s = 0;
    if (/plating|health|hp|vitality|tough|armor|armour/.test(t)) s += 100;
    if (/heal|regen|mend/.test(t)) s += 60;
    if (/damage|spark|coil|tap|power|burst/.test(t)) s += 40;
    if (/range|reach/.test(t)) s += 25;
    if (/rate|fire|speed/.test(t)) s += 20;
    if (/gold|pan|seam|yield/.test(t)) s += 10;
    return s;
  };
  return [...offer].sort((a, b) => score(b) - score(a))[0].id;
}

// Ordered ladder, cheapest-first inside each rung class; emitted as a non-decreasing price prefix.
function ladder(now) {
  const entries = now.works.entries ?? [];
  const taken = entries.map((e) => ({ x: e.position?.x ?? e.x, z: e.position?.z ?? e.z }));
  const free = (p) => !taken.some((t) => Number.isFinite(t.x) && dist(t, p) < 3);
  const nT = now.works.byKind?.turret ?? 0;
  const nB = now.works.byKind?.sentry_beacon ?? 0;
  const nP = now.works.byKind?.palisade ?? 0;
  const tCost = [50, 70, 95, 125];
  const bCost = [25, 35, 45, 55, 75, 95];

  // ONE TRIP HOME BUYS THE WHOLE BATCH. The seam is ~50wu from the camp, so a build order that
  // fires the instant gold crosses its own price is a commute generator (gen-13). Gate rung i on
  // the SUFFIX SUM of the batch from i onward (gen-12), so the Prospector only walks home when the
  // whole trip is funded, and then spends straight down the batch without a second commute.
  const batch = [];
  const slots = TURRETS.filter(free);
  for (let i = nT; i < 4 && batch.length < 2; i += 1) {
    const s = slots[batch.length];
    if (s) batch.push({ what: 'turret', cost: tCost[i], where: s });
  }
  if (nT >= 2 && nB < 6) {
    const bs = BEACONS.filter(free);
    for (let i = nB; i < 6 && batch.length < 3; i += 1) {
      const s = bs[batch.length - 2];
      if (s) batch.push({ what: 'sentry_beacon', cost: bCost[i], where: s });
    }
  }
  if (nT >= 1 && nP < 8) {
    for (const s of PALIS.filter(free).slice(0, Math.max(0, 4 - batch.length))) {
      batch.push({ what: 'palisade', cost: 10, where: s });
    }
  }
  const out = [];
  for (let i = 0; i < batch.length; i += 1) {
    const suffix = batch.slice(i).reduce((a, b) => a + b.cost, 0);
    out.push({ verb: 'BUILD', what: batch[i].what, where: { x: batch[i].where.x, z: batch[i].where.z }, when: { goldGte: suffix } });
  }
  return out;
}

// A seam holds 30 gold and a pan is 5, so SIX orders on the SAME id empty it before the walk is
// paid for a second time (gen-7). Rotating by distance every order ping-pongs the Prospector
// between 50wu seams and banks one pan a wave, which is what killed tune-1.
function harvestChain(now, n) {
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x));
  if (!live.length) return [];
  const p = now.prospector ?? { x: 0, z: -44 };
  const sorted = [...live].sort((a, b) => dist(p, a) - dist(p, b));
  const out = [];
  let k = 0;
  while (out.length < n) {
    const s = sorted[k % sorted.length];
    for (let j = 0; j < 6 && out.length < n; j += 1) out.push({ verb: 'HARVEST', seam: s.id });
    k += 1;
  }
  return out;
}

const state = { phase: 'errand', views: 0 };

function decide(view) {
  const now = view.now;
  state.views += 1;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const head = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    head.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  const m = now.motor;
  const obj = m?.objective ?? {};

  // --- Leg 1: tar, then the hulk, then HAUL (the hitch).
  if (m && !obj.hitched && !obj.arrived) {
    const orders = [...head];
    const unharvested = (m.fuel?.nodes ?? TAR).filter((n) => !n.harvested);
    const p = now.prospector ?? { x: 0, z: -44 };
    // Visit unharvested tar nodes, nearest-first from the Prospector, west/middle before east.
    const route = [...unharvested].sort((a, b) => dist(p, a) - dist(p, b));
    for (const n of route) orders.push(...dwell({ x: n.x, z: n.z }));
    orders.push({ verb: 'MOVE_TO', pos: HULK });
    orders.push({ verb: 'HAUL' });
    orders.push(...harvestChain(now, 4));
    return orders.slice(0, 32);
  }

  // --- Leg 2: grade the gate road, stand at the stop, HAUL the boiler home.
  if (m && obj.hitched && !obj.arrived) {
    const orders = [...head];
    orders.push({ verb: 'MOVE_TO', pos: STOP });
    if (!(m.roads?.graded ?? []).includes(m.objective.corridorId)) orders.push({ verb: 'GRADE' });
    orders.push({ verb: 'HAUL' });
    orders.push(...ladder(now));
    orders.push(...harvestChain(now, 8));
    return orders.slice(0, 32);
  }

  // --- Errand done: fort and pan to wave 12.
  const orders = [...head, ...ladder(now), { verb: 'REPAIR_UNDER', pct: 55 }];
  orders.push(...harvestChain(now, 32 - orders.length));
  return orders.slice(0, 32);
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e4-boneyard', '--seed', 'e4-boneyard-01',
  '--difficulty', 'trail', '--tape', tape];
const child = spawn('node', args, { stdio: ['pipe', 'pipe', 'inherit'] });
let buf = '';
const log = [];
child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    let v; try { v = JSON.parse(line); } catch { continue; }
    if (!v.now) { log.push({ outcome: v }); fs.writeFileSync(logPath, JSON.stringify(log, null, 1)); console.log('OUTCOME ' + JSON.stringify(v)); continue; }
    const orders = decide(v);
    const n = v.now;
    log.push({
      w: n.wave, t: n.timers.runSeconds, hp: n.hero.hp, maxHp: n.hero.maxHp, gold: n.gold,
      alive: n.threats.alive, works: n.works.byKind, lvl: n.hero.level,
      motor: n.motor ? { hitched: n.motor.objective.hitched, arrived: n.motor.objective.arrived, fuel: n.motor.fuel.stored, tar: n.motor.fuel.tar, harv: n.motor.fuel.harvestedNodes, veh: n.motor.vehicle.state, vx: n.motor.vehicle.x, vz: n.motor.vehicle.z, graded: n.motor.roads.graded, wx: n.motor.weather.phase } : null,
      orders: orders.length,
    });
    console.error(`w${n.wave} t${n.timers.runSeconds} hp${n.hero.hp}/${n.hero.maxHp} g${n.gold} alive${n.threats.alive} ` +
      (n.motor ? `hitch=${n.motor.objective.hitched} arr=${n.motor.objective.arrived} fuel=${n.motor.fuel.stored} tar=${n.motor.fuel.tar} nodes=${n.motor.fuel.harvestedNodes} veh=${n.motor.vehicle.state}@${n.motor.vehicle.x},${n.motor.vehicle.z} ` : '') +
      `works=${JSON.stringify(n.works.byKind)} orders=${orders.length}`);
    child.stdin.write(JSON.stringify(orders) + '\n');
  }
});
child.on('close', (c) => { fs.writeFileSync(logPath, JSON.stringify(log, null, 1)); process.exit(c ?? 0); });
