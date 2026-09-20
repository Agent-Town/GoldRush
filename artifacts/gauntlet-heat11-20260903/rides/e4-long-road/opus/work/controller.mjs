#!/usr/bin/env node
// Claude Opus 5 — generation 18 — e4-long-road controller.
// State machine over the view. Never scripts by clock; every leg is derived from now.motor.
//
// The map: claim + hero welded at (-180,0). Road corridor (-190,0)->(190,0), 380wu.
// Convoy stop (190,0), route total 370. The convoy gains exactly the ground the lead
// Hauler gains toward the stop (MotorSocket:340) and arrival needs leaderDistance >= 370-1e-6,
// i.e. the Hauler must come to REST EXACTLY on (190,0). The Prospector SNAPS to its target
// (Embodiment.ts:272) and HOLD re-issues movement every tick (StandingOrders:336), so a held
// Prospector sits at exactly (190,0) and HAUL dispatches the Hauler to exactly that point.
//
// Fuel: 3 nodes x 3 tar x 4 fuel = 36 total, burn 3/s, speed 9. Ungraded 370wu = 123 fuel (impossible).
// Graded: 2.5x speed, 0.4x burn -> 19.7 fuel clear, ~28 worst-case all-storm. Grading is mandatory.
//
// Defence: NO build zone within 32wu of the claim (west-way-station is x -148..-124). Nothing can
// protect the hero directly. The middle way-station (x -12..12, z 6..22) sits ON the north spawn
// gate (0,46) though, so turrets there kill the gang at the source, 180wu before it reaches the hero.

import { spawn } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const tape = args[0];
const logPath = args[1];
const MODE = args[2] || 'errand-first';

const CONTRACT = 'e4-long-road';
const SEED = 'e4-long-road-01';

const log = [];
const say = (...a) => log.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));

// --- upgrade scoring: plating and survivability first, then blast damage (gen-14) ---
function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|max hp|maxhp|health|vitality|armou?r|tough/.test(t)) s += 100;
  if (/heal|regen|mend/.test(t)) s += 60;
  if (/blast/.test(t)) s += 45;
  if (/radius|splash|area/.test(t)) s += 30;
  if (/damage|dmg|spark|coil|tap|power/.test(t)) s += 25;
  if (/rate|speed|cooldown|reload/.test(t)) s += 20;
  if (/gold|pan|seam|prospect/.test(t)) s += 5;
  return s;
}

// --- dwell pattern: MOVE_TO snaps and completes in one tick, so a 0.5s harvest needs hops
//     that stay inside harvestRange 1.35 of the node (gen-15/16 standard equipment) ---
function dwell(n) {
  const p = (x, z) => ({ verb: 'MOVE_TO', pos: { x, z } });
  return [p(n.x, n.z), p(n.x + 0.9, n.z), p(n.x, n.z), p(n.x, n.z + 0.9), p(n.x, n.z), p(n.x - 0.9, n.z), p(n.x, n.z)];
}

const near = (a, b, eps) => Math.abs(a - b) <= eps;

// Middle way-station: the fort that sits on the spawn gate. Carry more candidates than slots (gen-10/14).
const TURRET_SLOTS = [
  { x: 0, z: 8 }, { x: -7, z: 9 }, { x: 7, z: 9 }, { x: 0, z: 14 },
  { x: -10, z: 12 }, { x: 10, z: 12 }, { x: -4, z: 7 }, { x: 4, z: 7 },
];
const BEACON_SLOTS = [
  { x: -3, z: 11 }, { x: 3, z: 11 }, { x: -9, z: 16 }, { x: 9, z: 16 },
  { x: 0, z: 19 }, { x: -6, z: 20 }, { x: 6, z: 20 }, { x: 0, z: 6 },
];

function buildOrders(now, out, budget) {
  const gold = now.gold;
  const byKind = (now.works && now.works.byKind) || {};
  const entries = (now.works && now.works.entries) || [];
  const used = new Set(entries.map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
  const free = (slots) => slots.filter((s) => !used.has(`${Math.round(s.x)},${Math.round(s.z)}`));
  const tCost = [50, 70, 95, 125];
  const bCost = [25, 35, 45, 55, 75, 95];
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  // Emit only what is affordable RIGHT NOW (gen-17): a pending gold gate fires at an arbitrary
  // later tick and drags the worker off a distant seam.
  let purse = gold;
  let n = 0;
  const tf = free(TURRET_SLOTS);
  for (let i = nT; i < 4 && n < budget; i++) {
    const c = tCost[i];
    if (purse < c) break;
    const slot = tf[i - nT];
    if (!slot) break;
    out.push({ verb: 'BUILD', what: 'turret', where: slot, when: { goldGte: c } });
    purse -= c; n++;
  }
  const bf = free(BEACON_SLOTS);
  for (let i = nB; i < 6 && n < budget; i++) {
    const c = bCost[i];
    if (purse < c) break;
    const slot = bf[i - nB];
    if (!slot) break;
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: slot, when: { goldGte: c } });
    purse -= c; n++;
  }
  return n;
}

function harvestOrders(now, out, budget, home) {
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (!live.length) return;
  // Stack on the NEAREST seam (gen-15: chain by seam when near, stack by seam when far).
  live.sort((a, b) => Math.hypot(a.x - home.x, a.z - home.z) - Math.hypot(b.x - home.x, b.z - home.z));
  const a = live[0], b = live[1];
  for (let i = 0; i < budget; i++) {
    out.push({ verb: 'HARVEST', seam: (b && i >= budget - 3) ? b.id : a.id });
  }
}

function decide(view) {
  const now = view.now;
  const out = [];

  // pendingSecure accepts exactly ONE order and refuses anything else (gen-9).
  if (now.pendingSecure) {
    say('SECURE at wave', now.wave);
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((x, y) => scoreUpgrade(y) - scoreUpgrade(x))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Blast is AoE (radius 2.2, 20*(1+0.28*wave)) vs the rig's 24 single-target dps. Against a
  // clumped swarm on a hero that cannot be defended by works, blast wins from about wave 3.
  const wantWeapon = now.wave >= 3 ? 'blast' : 'rig';
  if (now.weapon !== wantWeapon) out.push({ verb: 'SET_WEAPON', weapon: wantWeapon });

  const m = now.motor;
  const road = m.roads.corridors.find((c) => c.id === m.objective.corridorId);
  const unharvested = m.fuel.nodes.filter((n) => !n.harvested);
  const stop = m.objective.stop;
  const p = now.prospector;
  const errandDone = m.objective.arrived;

  if (!errandDone) {
    if (!road.graded) {
      out.push({ verb: 'MOVE_TO', pos: { x: road.start.x, z: road.start.z } });
      out.push({ verb: 'GRADE' });
    }
    for (const n of unharvested) out.push(...dwell(n));
    const ready = road.graded && unharvested.length === 0;
    const parked = near(p.x, stop.x, 1e-9) && near(p.z, stop.z, 1e-9);
    if (ready && parked) {
      say('HAUL dispatch: prospector exactly at stop, fuel', m.fuel.stored, 'tar', m.fuel.tar);
      out.push({ verb: 'HAUL' });
    }
    // HOLD re-issues movement every tick, so the Prospector never drifts off the exact stop.
    out.push({ verb: 'HOLD', pos: { x: stop.x, z: stop.z } });
    return out.slice(0, 32);
  }

  // Errand banked. Now the only job is keeping the hero alive to wave 12.
  // The fort goes on the SPAWN GATE (middle way-station), not the claim: nothing can be built
  // within 32wu of the hero, but the gang funnels through x~0 on its 180wu walk west.
  const home = { x: 0, z: 8 };
  const built = buildOrders(now, out, 3);
  const room = 32 - out.length - 1;
  harvestOrders(now, out, Math.max(0, Math.min(room, 20)), home);
  out.push({ verb: 'HOLD', pos: home });
  if (built) say('build wave', now.wave, 'gold', now.gold);
  return out.slice(0, 32);
}

// ---- transport ----
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED,
  '--difficulty', 'trail', '--tape', tape], { stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let outcome = null;
let views = 0;
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line.startsWith('{')) continue;
    let v;
    try { v = JSON.parse(line); } catch { continue; }
    if (!v.now) { outcome = v; say('OUTCOME', JSON.stringify(v)); continue; }
    views++;
    const n = v.now;
    const mo = n.motor;
    say(`view#${views} w${n.wave} t=${n.timers.runSeconds} hp=${n.hero.hp}/${n.hero.maxHp} lvl${n.hero.level}`
      + ` alive=${n.threats.alive} gold=${n.gold} graded=${mo.roads.graded.length}`
      + ` fuel=${mo.fuel.stored}/tar${mo.fuel.tar} drawn=${mo.fuel.drawn}`
      + ` veh=${mo.vehicle.state}@${mo.vehicle.x.toFixed(3)},${mo.vehicle.z.toFixed(3)} onRoad=${mo.vehicle.onRoad}`
      + ` lead=${mo.convoy.leaderDistance.toFixed(3)}/${mo.convoy.total} arrived=${mo.objective.arrived}`
      + ` prosp=${n.prospector.x.toFixed(4)},${n.prospector.z.toFixed(4)}`
      + ` works=${JSON.stringify(n.works.byKind || {})}`);
    const orders = decide(v);
    say('  -> ' + JSON.stringify(orders));
    child.stdin.write(JSON.stringify(orders) + '\n');
  }
});
let errBuf = '';
child.stderr.on('data', (c) => { errBuf += c.toString(); });
child.on('close', (code) => {
  say('exit', code, 'stderr', errBuf.slice(-400));
  fs.writeFileSync(logPath, log.join('\n'));
  if (outcome) console.log(JSON.stringify(outcome));
  else console.log(JSON.stringify({ secured: false, error: 'no outcome', code }));
});
