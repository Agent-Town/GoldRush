#!/usr/bin/env node
/**
 * claude-opus-5 — e2-hill-mine rider.  worldModel: sim-import (declared).
 *
 * Spawns `node scripts/gr-sim.mjs --contract e2-hill-mine --seed <seed> --tape <path>` and answers
 * each JSON view line on stdout with one standing-order array on stdin.
 *
 * THE MAP FACTS THIS PLAN IS BUILT ON (all read from the sim source before riding):
 *  1. SECURE = KILL THE RAILCAR. autoSecureWaveForRun returns MAX_SAFE_INTEGER while
 *     `twist.baron && !baronBeaten`, so outliving wave 12 secures nothing. Ceiling = 12+6 = w18.
 *  2. The railcar is three scripted components on rail route 0 ((-46,-2)..(46,-2)), and
 *     Enemy.advanceScriptedRoute REVERSES the route at each end — it shuttles and never leaves.
 *     Component HP at w12 = 25.2 * 1.115^12 * 12.5 * {0.9,1.25,0.85} ~= 3489 total.
 *  3. THE HERO NEVER WALKS. HeadlessContractSim feeds it IDLE_INTENTS; only the Prospector moves.
 *     The claim landmark is a 3.36-half-extent square at (0,12) (+0.58 pad), so the hero is
 *     depenetrated onto its west face and stands at ~(-3.94, 12) all run. Rig/blast range is 10,
 *     the rail is 13+ away: the hero can NEVER touch the railcar. TURRETS ARE THE ONLY WEAPON
 *     THAT REACHES IT (beacons are range 8 and get no high-ground bonus).
 *  4. Buildable ground in base-t1 = x[-30,30] z[8,16] MINUS the landmark box |x|<3.94 &
 *     8.06<z<15.94. z=8 and z=16 rows are clear all the way across; z=8 also maximises rail
 *     coverage (29wu per turret, LOS clear, effRange 16.58).
 *  5. sluice and assay_office are 'river-adjacent'; the river ends at z=5, pad is 2, build zones
 *     start at z=8 — so NEITHER IS PLACEABLE HERE. The economy is seam panning only.
 *  6. HARVEST is one machine tick per order (5g, needs the Prospector within 1.6 and still);
 *     standing on a seam also pays passively. prospectors_luck (+10 capacity, -5s respawn, x2)
 *     is therefore the strongest economy card on the board.
 */
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const flag = (name) => process.argv.includes(`--${name}`);
const SEED = arg('seed', 'e2-hill-mine-01');
const TAPE = arg('tape', `artifacts/claude-opus-hillmine/tape-${SEED}.json`);
const LOG = TAPE.replace(/\.json$/, '.log');

writeFileSync(LOG, '');
const log = (s) => { appendFileSync(LOG, `${s}\n`); };

const CLAIM = { x: 0, z: 12 };
const HERO = { x: -3.94, z: 12 };          // where depenetration parks the immobile hero
const T1_Z = 8;

const CFG = {
  turrets: (arg('turretx', '-8,8,-24,24')).split(',').map((x) => ({ x: Number(x), z: Number(arg('turretz', T1_Z)) })),
  // REPAIR_UNDER picks the FIRST damaged work in registry order and sentry_beacon is registry
  // index 0 while turret is index 5 — every standing beacon therefore eats repair orders (and
  // gold) ahead of the turrets that are the only thing that can reach the railcar. Keep it lean.
  beacons: [{ x: -5, z: 9 }, { x: -5, z: 12 }, { x: -5, z: 15 }, { x: -8, z: 11 }, { x: -8, z: 14 }, { x: 0, z: 8 }]
    .slice(0, Number(arg('nbeacon', 2))),
  stockpiles: [{ x: -14, z: 15 }, { x: 14, z: 15 }],
  repairPct: Number(arg('repairPct', 80)),
  repairMinGold: Number(arg('repairMinGold', 25)),
  repairFirstWave: Number(arg('repairFirstWave', 7)),
  upgradeReserve: Number(arg('upgradeReserve', 0)),
  nstock: Number(arg('nstock', 0)),
  weaponSwitchWave: Number(arg('weaponSwitchWave', 3)),
  tier3: !flag('notier3'),
  tierTurrets: !flag('notier'),
  palisades: flag('pal'),
};

// ── build ladder: (what, where, gate on how many turrets already stand)
function ladder(built, costOf) {
  const nT = built.turret?.length ?? 0;
  const nB = built.sentry_beacon?.length ?? 0;
  const nS = built.stockpile?.length ?? 0;
  const nP = built.palisade?.length ?? 0;
  const rungs = [];
  const turret = (i) => ({ what: 'turret', ...CFG.turrets[i], cost: costOf('turret', i) });
  const beacon = (i) => ({ what: 'sentry_beacon', ...CFG.beacons[i], cost: costOf('sentry_beacon', i) });

  // two rail turrets first — they are both the claim guard and the whole anti-railcar battery
  for (let i = nT; i < Math.min(2, CFG.turrets.length); i += 1) rungs.push(turret(i));
  // beacons are ~6x more gold-efficient than a tier-2 turret for close defence, and they slow
  const NB = CFG.beacons.length;
  for (let i = nB; i < Math.min(2, NB) && nT >= 2; i += 1) rungs.push(beacon(i));
  if (nT >= 2) for (let i = Math.max(nT, 2); i < 3 && i < CFG.turrets.length; i += 1) rungs.push(turret(i));
  for (let i = Math.max(nB, 2); i < Math.min(4, NB) && nT >= 3; i += 1) rungs.push(beacon(i));
  if (nT >= 3) for (let i = Math.max(nT, 3); i < CFG.turrets.length; i += 1) rungs.push(turret(i));
  // Stockpiles are OFF by default: they are registry index 3 (ahead of turret index 5) so every
  // chewed stockpile eats a repair order the turrets needed, they are thief bait, and the 200 bank
  // cap already covers a 150 tier-2. Measured t05: both stockpiles wrecked, all four turrets down.
  for (let i = nS; i < CFG.nstock; i += 1) rungs.push({ what: 'stockpile', ...CFG.stockpiles[i], cost: costOf('stockpile', i) });
  // TIER-2 TURRETS OUTRANK LATE BEACONS: only turrets reach the rail, and the rail is the secure.
  if (nT >= 4 && turretsBelowTier(built, 2) > 0) return rungs;
  for (let i = Math.max(nB, 4); i < NB && nT >= 4; i += 1) rungs.push(beacon(i));
  if (CFG.palisades && nT >= 4) {
    const wall = palisadeWall();
    for (let i = nP; i < wall.length; i += 1) rungs.push({ ...wall[i], what: 'palisade', cost: 10 });
  }
  if (nT >= 4 && nS < 2 && CFG.tier3) rungs.push({ what: 'stockpile', ...CFG.stockpiles[1], cost: costOf('stockpile', nS) });
  return rungs;
}

const turretsBelowTier = (built, tier) => (built.turret ?? []).filter((e) => !e.wrecked && (e.tier ?? 1) < tier).length;

/** A screen west of the hero: the only face of the claim landmark an enemy can reach it from. */
function palisadeWall() {
  const out = [];
  for (let z = 8; z <= 16; z += 2) out.push({ x: -6, z, rotationSteps: 1 });
  for (const x of [-4, -2, 0, 2]) out.push({ x, z: 8, rotationSteps: 0 });
  for (const x of [-4, -2, 0, 2]) out.push({ x, z: 16, rotationSteps: 0 });
  return out;
}

// Economy first (prospectors_luck doubles seam yield AND halves respawn), then the blast line —
// the hero is a static claim guard inside a swarm, so AoE beats the single-target rig, and every
// rig card (heavy_spark / double_tap / split_spark / long_resonator) is dead weight once we switch.
// spring_heels moves the HERO's moveSpeedMult, and the hero never moves: it is worthless here.
const UPGRADE_PREF = (arg('pref', [
  'prospectors_luck', 'pan_legend', 'powder_charge', 'quick_fuse', 'tinkers_plating',
  'wide_ring', 'beacon_dynamo', 'assay_bonus', 'field_dressing', 'auto_pan',
  'heavy_spark', 'double_tap_coil', 'split_spark', 'sharpen', 'long_resonator', 'spring_heels',
].join(','))).split(',');

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (w) => `${w.what}@${w.x},${w.z}`;

let COSTS = {};
const dead = new Set();          // build targets that failed permanently — never re-issue them

function orders(view) {
  const now = view.now;
  const out = [];
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    out.push({ verb: 'PICK_UPGRADE', id: UPGRADE_PREF.find((id) => ids.includes(id)) ?? ids[0] });
  }
  out.push({ verb: 'SET_WEAPON', weapon: now.wave >= CFG.weaponSwitchWave ? 'blast' : 'rig' });

  const built = {};
  for (const e of (now.works?.entries ?? [])) (built[e.id] ??= []).push(e);
  const costOf = (id, n) => { const a = COSTS[id] ?? []; return a[n] ?? a[a.length - 1] ?? 999; };

  const rungs = ladder(built, costOf).filter((w) => !dead.has(key(w)));
  for (const w of rungs.slice(0, 5)) {
    out.push({
      verb: 'BUILD', what: w.what, where: { x: w.x, z: w.z }, when: { goldGte: w.cost },
      ...(w.rotationSteps !== undefined ? { rotationSteps: w.rotationSteps } : {}),
    });
  }

  // tier upgrades — CONTEXT_ACTION does NOT imply travel (range 1.6 off the Prospector), so walk first
  if (CFG.tierTurrets && (built.turret?.length ?? 0) >= CFG.turrets.length) {
    const maxTier = CFG.tier3 ? 3 : 2;
    const cand = (built.turret ?? [])
      .map((e, i) => ({ e, idx: e.index ?? i, tier: e.tier ?? 1 }))
      .filter((c) => c.tier < maxTier && !c.e.wrecked)
      .sort((a, b) => a.tier - b.tier)[0];
    if (cand && now.gold >= (cand.tier === 1 ? 150 : 300) + CFG.upgradeReserve) {
      const p = { x: cand.e.x ?? 0, z: cand.e.z ?? T1_Z };
      out.push({ verb: 'MOVE_TO', pos: { x: p.x, z: p.z + 1.2 } });
      out.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: cand.idx } });
    }
  }

  // REPAIR: one order == one FULL, instant repair of one work (BuildSystem.repair sets hp=maxHp,
  // clears `wrecked` and RE-REGISTERS the shooter) for ceil(cost * min(0.4, 0.25*missing)) gold.
  // The wave-9..18 board wrecks faster than one repair per decision window can mend, and a wrecked
  // turret is zero rail damage — so the repair block is deep and sits AHEAD of panning from the
  // wave the railcar's arrival starts to matter.
  const damaged = (now.works?.entries ?? []).filter((e) => e.wrecked || (e.maxHp > 0 && (e.hp / e.maxHp) * 100 < CFG.repairPct)).length;
  const canRepair = now.gold >= CFG.repairMinGold;
  const frontRepairs = canRepair ? Math.min(damaged, now.wave >= CFG.repairFirstWave ? 8 : 2) : 0;
  for (let i = 0; i < frontRepairs; i += 1) out.push({ verb: 'REPAIR_UNDER', pct: CFG.repairPct });

  // HARVEST: one machine tick each (5g); the Prospector must be within 1.6 and still.
  // ROUND-ROBIN, not one block per seam. A seam drained to zero respawns at a DIFFERENT anchor
  // after its wait, and `HARVEST seam:<id>` resolves that seam's position LIVE — so a second and
  // third pass over the same ids walks the Prospector back to whatever has refilled instead of
  // parking it on a dead hole for the rest of the wave (the wave-4 measurement: 14 idle seconds,
  // zero income, both seams flat). An order aimed at a dead seam fails in one tick and, as a
  // surprise, buys a fresh view — so a wasted pass costs a tick and pays a decision point.
  const pros = now.prospector ?? HERO;
  const seams = (now.seams ?? []).filter((s) => s.active && s.x !== null)
    .sort((a, b) => dist(pros, a) - dist(pros, b));
  const tailRepairs = canRepair ? Math.min(Math.max(0, damaged - frontRepairs), 4) : 0;
  let budget = Math.max(0, 30 - out.length - tailRepairs);
  for (let pass = 0; pass < 3 && budget > 0; pass += 1) {
    for (const s of seams) {
      if (budget <= 0) break;
      const cap = pass === 0 ? (s.remaining ?? 30) : 50;
      const ticks = Math.min(pass === 0 ? 10 : 6, Math.ceil(cap / 5), budget);
      for (let i = 0; i < ticks; i += 1) out.push({ verb: 'HARVEST', seam: s.id });
      budget -= ticks;
    }
  }
  for (let i = 0; i < tailRepairs; i += 1) out.push({ verb: 'REPAIR_UNDER', pct: CFG.repairPct });
  const park = seams.slice().sort((a, b) => (b.remaining ?? 0) - (a.remaining ?? 0))[0] ?? { x: -14, z: 20 };
  out.push({ verb: 'HOLD', pos: { x: park.x, z: park.z } });
  // A rejected array installs NOTHING and the door re-serves the same view, so an order carrying a
  // non-finite number would spin the transport forever. Drop anything malformed before it ships.
  const finite = (v) => typeof v === 'number' && Number.isFinite(v);
  const ok = (o) => {
    if (o.where && !(finite(o.where.x) && finite(o.where.z))) return false;
    if (o.pos && !(finite(o.pos.x) && finite(o.pos.z))) return false;
    if (o.verb === 'HARVEST' && typeof o.seam !== 'string') return false;
    return true;
  };
  return out.filter(ok).slice(0, 32);
}

// ─────────────────────────────────────────────────────────── transport
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', 'e2-hill-mine', '--seed', SEED, '--tape', TAPE], {
  cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'],
});
let buf = '';
let outcome = null;
let turns = 0;
child.stderr.on('data', (d) => log(`[err] ${String(d).trim()}`));
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
    if (!line.trim()) continue;
    let msg; try { msg = JSON.parse(line); } catch { log(`[unparsed] ${line.slice(0, 200)}`); continue; }
    if (!msg.now) { outcome = msg; log(`OUTCOME ${JSON.stringify(msg)}`); continue; }
    if (msg.stablePrefix?.mechanics?.buildables) {
      for (const b of msg.stablePrefix.mechanics.buildables) COSTS[b.id] = b.costs;
    }
    turns += 1;
    const n = msg.now;
    for (const o of (n.orders ?? [])) {
      if (o.status === 'failed' && o.order?.verb === 'BUILD' && /UNREACHABLE|out_of_zone|collision/.test(o.reason ?? '')) {
        dead.add(`${o.order.what}@${o.order.where.x},${o.order.where.z}`);
      }
    }
    const tiers = (n.works?.entries ?? []).map((e) => `${e.id.slice(0, 3)}${e.index}:t${e.tier ?? 1}${e.wrecked ? 'W' : `:${Math.round((e.hp / e.maxHp) * 100)}%`}`).join(',');
    log(`w${n.wave} t=${n.timers?.runSeconds}s gold=${n.gold} hp=${n.hero?.hp}/${n.hero?.maxHp} lvl=${n.hero?.level}`
      + ` heroXZ=${n.hero?.x?.toFixed?.(1)},${n.hero?.z?.toFixed?.(1)} prosXZ=${n.prospector?.x?.toFixed?.(1)},${n.prospector?.z?.toFixed?.(1)}`
      + ` panned=${n.score?.goldPanned} alive=${n.threats?.alive} wreckers=${n.threats?.wreckers}`
      + ` works[${n.works?.standing}/${n.works?.wrecked}] [${tiers}]`
      + ` seams=${(n.seams ?? []).filter((s) => s.active).map((s) => `${s.id}@${s.remaining}`).join(',')}`
      + `${n.pendingOffer ? ` OFFER=${n.pendingOffer.map((o) => o.id)}` : ''}${n.pendingSecure ? ' PENDING_SECURE' : ''}`);
    const failed = (n.orders ?? []).filter((o) => o.status === 'failed');
    if (failed.length) log(`   FAILED: ${failed.map((o) => `${o.order?.verb}${o.order?.what ? `/${o.order.what}` : ''}@${JSON.stringify(o.order?.where ?? o.order?.pos ?? o.order?.seam ?? '')} ${o.reason}`).join(' | ').slice(0, 700)}`);
    if (msg.terminal || n.runState === 'dead') continue;
    let arr;
    try { arr = orders(msg); } catch (e) { log(`[plan error] ${e.stack}`); arr = [{ verb: 'HOLD', pos: HERO }]; }
    log(`   -> ${JSON.stringify(arr)}`);
    child.stdin.write(`${JSON.stringify(arr)}\n`);
  }
});
child.on('close', (code) => {
  log(`exit=${code} turns=${turns} dead=${[...dead].join(' ')}`);
  console.log(JSON.stringify({ seed: SEED, exit: code, turns, outcome }));
});
