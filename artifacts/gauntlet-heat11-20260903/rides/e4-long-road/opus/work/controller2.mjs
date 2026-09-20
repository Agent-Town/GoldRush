#!/usr/bin/env node
// Claude Opus 5 — generation 18 — e4-long-road controller v2 (fort-first).
//
// Tune 1 proved the errand: grade the long road, harvest 3 tar nodes, park the Prospector at
// EXACTLY (190,0) (Embodiment.ts:272 snaps; HOLD re-issues movement every tick so it never drifts),
// then HAUL. The Hauler lands on the point and MotorSocket:345 latches leaderDistance 370/370.
// A fuel-limited short final step can leave it 0.093 short (lead 369.907) — a second HAUL on the
// next view costs 0.005 fuel and closes it. Cost: 23.097 of 36 fuel. That half is SOLVED.
//
// Tune 1 also proved the real wall: the hero is welded to (-180,0), NO build zone is within 32wu of
// it, and with the Prospector spending the whole opening on the errand the run reached wave 5 with
// gold 0 and zero works. The hero alone dies at t=164.
//
// v2: the fort goes up FIRST, at the WEST way-station (x -148..-124, z -22..-6). That box is the
// only build ground either approach lane crosses: enemies from the gates at (0,+/-46) converge on
// (-180,0), so at x=-136 the south stream sits at z=-11 (inside the box) and the graded road they
// prefer (enemyRouteCostMultiplier 0.25) runs z=0 just north of it. Turrets on the box's north edge
// (z=-6, range 16) cover both. The errand waits until the fort stands.

import { spawn } from 'node:child_process';
import fs from 'node:fs';

const [tape, logPath, errandWaveArg] = process.argv.slice(2);
const ERRAND_WAVE = Number(errandWaveArg ?? 5);

const log = [];
const say = (...a) => log.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '));

function scoreUpgrade(o) {
  const t = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let s = 0;
  if (/plating|max hp|maxhp|health|vitality|armou?r|tough/.test(t)) s += 100;
  if (/heal|regen|mend/.test(t)) s += 60;
  if (/blast/.test(t)) s += 45;
  if (/radius|splash|area/.test(t)) s += 30;
  if (/damage|dmg|spark|coil|tap|power/.test(t)) s += 25;
  if (/rate|fire|cooldown/.test(t)) s += 20;
  if (/gold|pan|seam/.test(t)) s += 5;
  return s;
}

const mv = (x, z) => ({ verb: 'MOVE_TO', pos: { x, z } });
// A 0.5s tar harvest inside harvestRange 1.35, built out of one-tick MOVE_TO hops.
const dwell = (n) => [mv(n.x, n.z), mv(n.x + 0.9, n.z), mv(n.x, n.z), mv(n.x, n.z + 0.9), mv(n.x, n.z),
  mv(n.x - 0.9, n.z), mv(n.x, n.z), mv(n.x, n.z - 0.9), mv(n.x, n.z)];

// West way-station. Turrets hug the north edge (z=-6) so their 16wu reach crosses the road at z=0.
const TURRETS = [
  { x: -136, z: -6.5 }, { x: -146, z: -6.5 }, { x: -126, z: -6.5 }, { x: -141, z: -13 },
  { x: -131, z: -13 }, { x: -136, z: -19 }, { x: -147, z: -13 }, { x: -125, z: -13 },
];
const BEACONS = [
  { x: -131, z: -6.5 }, { x: -141, z: -6.5 }, { x: -146, z: -13 }, { x: -127, z: -19 },
  { x: -136, z: -13 }, { x: -145, z: -19 }, { x: -130, z: -19 }, { x: -124.5, z: -6.5 },
  { x: -148, z: -19 }, { x: -141, z: -19 },
];
const T_COST = [50, 70, 95, 125];
const B_COST = [25, 35, 45, 55, 75, 95];

function emitBuilds(now, out) {
  const entries = (now.works && now.works.entries) || [];
  const taken = entries.map((e) => e.position);
  const free = (slots) => slots.filter((s) => !taken.some((p) => Math.hypot(p.x - s.x, p.z - s.z) < 1.5));
  const byKind = (now.works && now.works.byKind) || {};
  let nT = byKind.turret || 0;
  let nB = byKind.sentry_beacon || 0;
  let purse = now.gold;
  let count = 0;
  const tf = free(TURRETS);
  const bf = free(BEACONS);
  let ti = 0, bi = 0;
  // Turrets first: 57 dps for 50g beats a beacon's ~30 for 25g. Only emit what is affordable NOW
  // (gen-17) so no gate fires at an arbitrary later tick and drags the worker off a seam.
  while (nT < 4 && purse >= T_COST[nT] && tf[ti] && count < 4) {
    out.push({ verb: 'BUILD', what: 'turret', where: tf[ti], when: { goldGte: T_COST[nT] } });
    purse -= T_COST[nT]; nT++; ti++; count++;
  }
  while (nB < 6 && purse >= B_COST[nB] && bf[bi] && count < 5) {
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: bf[bi], when: { goldGte: B_COST[nB] } });
    purse -= B_COST[nB]; nB++; bi++; count++;
  }
  return count;
}

const FORT = { x: -136, z: -10 };

function panOrders(now, out, budget) {
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (!live.length || budget <= 0) return;
  live.sort((a, b) => Math.hypot(a.x - FORT.x, a.z - FORT.z) - Math.hypot(b.x - FORT.x, b.z - FORT.z));
  const a = live[0], b = live[1] || live[0];
  // Stack on the NEAREST seam; the seams here are 40-100wu out, so this is a far economy (gen-15):
  // stack by seam, do not rotate. A few orders on the runner-up buy decision points when it empties.
  for (let i = 0; i < budget; i++) out.push({ verb: 'HARVEST', seam: i < budget - 3 ? a.id : b.id });
}

let errandStarted = false;

function decide(view) {
  const now = view.now;
  const out = [];
  if (now.pendingSecure) { say('SECURE at wave', now.wave); return [{ verb: 'SECURE_CHOICE', choice: 'bank' }]; }
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((x, y) => scoreUpgrade(y) - scoreUpgrade(x))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  const wantWeapon = now.wave >= 3 ? 'blast' : 'rig';
  if (now.weapon !== wantWeapon) out.push({ verb: 'SET_WEAPON', weapon: wantWeapon });

  const m = now.motor;
  const road = m.roads.corridors.find((c) => c.id === m.objective.corridorId);
  const unfuelled = m.fuel.nodes.filter((n) => !n.harvested);
  const stop = m.objective.stop;
  const p = now.prospector;

  // The road is graded from its west stake, 8wu from the hero's own feet: free, and mandatory
  // (380wu ungraded costs ~123 fuel against a 36-fuel run).
  if (!road.graded) {
    out.push(mv(road.start.x, road.start.z));
    out.push({ verb: 'GRADE' });
  }

  if (!m.objective.arrived) {
    if (errandStarted || now.wave >= ERRAND_WAVE) {
      errandStarted = true;
      for (const n of unfuelled) out.push(...dwell(n));
      const ready = road.graded && unfuelled.length === 0;
      const parked = Math.abs(p.x - stop.x) < 1e-9 && Math.abs(p.z - stop.z) < 1e-9;
      if (ready && parked) {
        say('HAUL dispatch @w' + now.wave, 'fuel', m.fuel.stored, 'tar', m.fuel.tar, 'lead', m.convoy.leaderDistance);
        out.push({ verb: 'HAUL' });
      }
      out.push({ verb: 'HOLD', pos: { x: stop.x, z: stop.z } });
      return out.slice(0, 32);
    }
  }

  // Fort phase (before the errand, and again after it if the Prospector is back in the west).
  const built = emitBuilds(now, out);
  if (built) say('build w' + now.wave, 'gold', now.gold);
  const room = 32 - out.length - 1;
  panOrders(now, out, Math.max(0, Math.min(room, 22)));
  out.push({ verb: 'HOLD', pos: FORT });
  return out.slice(0, 32);
}

const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e4-long-road', '--seed', 'e4-long-road-01',
  '--difficulty', 'trail', '--tape', tape], { stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '', outcome = null, views = 0, errBuf = '';
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line.startsWith('{')) continue;
    let v; try { v = JSON.parse(line); } catch { continue; }
    if (!v.now) { outcome = v; say('OUTCOME', JSON.stringify(v)); continue; }
    views++;
    const n = v.now, mo = n.motor;
    say(`view#${views} w${n.wave} t=${n.timers.runSeconds} hp=${n.hero.hp}/${n.hero.maxHp} lvl${n.hero.level}`
      + ` alive=${n.threats.alive} gold=${n.gold} panned=${n.score ? n.score.goldPanned : '?'}`
      + ` graded=${mo.roads.graded.length} fuel=${mo.fuel.stored}/tar${mo.fuel.tar}`
      + ` veh=${mo.vehicle.state}@${mo.vehicle.x.toFixed(3)} lead=${mo.convoy.leaderDistance.toFixed(3)}`
      + ` arrived=${mo.objective.arrived} prosp=${n.prospector.x.toFixed(3)},${n.prospector.z.toFixed(3)}`
      + ` works=${JSON.stringify(n.works.byKind || {})} whp=${n.works.hp ? JSON.stringify(n.works.hp) : ''}`);
    const orders = decide(v);
    say('  -> ' + JSON.stringify(orders));
    child.stdin.write(JSON.stringify(orders) + '\n');
  }
});
child.stderr.on('data', (c) => { errBuf += c.toString(); });
child.on('close', (code) => {
  say('exit', code, 'stderr', errBuf.slice(-300));
  fs.writeFileSync(logPath, log.join('\n'));
  console.log(JSON.stringify(outcome || { secured: false, error: 'no outcome', code }));
});
