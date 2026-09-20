#!/usr/bin/env node
// Gold Rush heat-12 — e7-echo-canyon controller. Author: claude-opus-5 (generation 44).
// worldModel: sim-import
//
// The map moved this week: E7PlaybookLatch.allowsSecure({fieldedMirrors}) > 0 for objective
// 'mirror'.  So the secure needs (a) 20 waves of survival and (b) at least one mirrored squad
// actually FIELDED.  A squad fields on the wave AFTER a successful PLAYBOOK_USE.
//
// The tape's SHAPE decides what the copy is (BroadcastMirror.shapeOfTape):
//   builds -> wrecker; otherwise thief.  turret/BLAST_AT/SET_WEAPON blast -> hunts at range 18.
// This board's own roster carries no wrecker (data_rustler is thief:true, which forces
// wrecker=false in Enemy.ts), so a wrecker mirror would be the ONLY thing on the map able to
// eat my works.  Therefore: discharge the objective from a HARVEST-ONLY tape recorded in the
// wave-0 array, before a single BUILD is ever submitted.  The copy comes back as two thieves.

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const WS = '/private/tmp/heat12-038cc280/artifacts/heat12/opus/e7-echo-canyon';
const CONTRACT = 'e7-echo-canyon';
const SEED = 'e7-echo-canyon-01';

const tag = process.argv[2] || 'tune-1';
const scored = process.argv[3] === 'scored';
const tapePath = path.join(WS, `${tag}-tape.json`);
const logPath = path.join(WS, `${tag}-log.ndjson`);

// ---------------------------------------------------------------- placement
const CLAIM = { x: 0, z: 12 };
// canyon-floor-yard: x -30..30, z -42..10.  Turret range 16 from z=9 reaches z=25.
const TURRET_CANDS = [
  [0, 9], [-10, 9], [10, 9], [-5, 9], [5, 9],
  [-15, 9], [15, 9], [0, 5], [-10, 5], [10, 5], [-20, 9], [20, 9],
];
// Beacon radius 8 must cover the welded hero at (0,12): |x| <= sqrt(64-4) = 7.74 on the z=10 line.
const BEACON_CANDS = [
  [0, 10], [-3, 10], [3, 10], [-6, 10], [6, 10],
  [-1.5, 10], [1.5, 10], [-4.5, 10], [4.5, 10],
  [0, 7], [-3, 7], [3, 7], [-6, 7], [6, 7], [0, 3], [-6, 3], [6, 3],
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---------------------------------------------------------------- upgrade scorer
// Plating first (gen 6/14/31): free maxHp is the cheapest margin on the board.
function scoreUpgrade(u) {
  const t = `${u.id} ${u.name} ${u.effectText}`.toLowerCase();
  let s = 0;
  if (/plating|max health|maximum health|max hp|vitality|tough/.test(t)) s += 100;
  if (/dressing|heal|regen|restore/.test(t)) s += 70;
  if (/damage|spark|bolt|volley|power/.test(t)) s += 40;
  if (/fire rate|rate of fire|cooldown|reload|tap/.test(t)) s += 35;
  if (/range|reach/.test(t)) s += 15;
  if (/pan|gold|luck|seam|prospect/.test(t)) s += 5;
  if (/speed|heels|move/.test(t)) s += 3;
  return s;
}

// ---------------------------------------------------------------- controller
const blacklist = new Set();
const stall = new Map();
let lastSig = null;
let usedPlaybook = false;
const rows = [];

function seamChain(now, slots) {
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  if (live.length === 0) return [];
  live.sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  // Stack the near seam; only chain to a second seam if it is close to the first (gen 15/38).
  const chosen = [live[0]];
  for (const s of live.slice(1)) {
    if (dist(s, chosen[0]) <= 30 && chosen.length < 2) chosen.push(s);
  }
  const out = [];
  let i = 0;
  while (out.length < slots) {
    out.push({ verb: 'HARVEST', seam: chosen[i % chosen.length].id });
    i += 1;
    if (chosen.length > 1 && i % 6 === 0) continue;
  }
  return out;
}

function buildRungs(now) {
  const byKind = now.works?.byKind || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const entries = now.works?.entries || [];
  const taken = new Set(entries.map((e) => `${e.position?.x},${e.position?.z}`));

  const rungs = [];
  for (let i = nT; i < 4; i += 1) rungs.push({ what: 'turret', cost: TURRET_COSTS[i], cands: TURRET_CANDS });
  for (let i = nB; i < 6; i += 1) rungs.push({ what: 'sentry_beacon', cost: BEACON_COSTS[i], cands: BEACON_CANDS });

  // Non-decreasing price prefix (gen 9): a cheap rung can never starve an expensive one.
  const out = [];
  let prev = -1;
  const usedHere = new Set();
  for (const r of rungs) {
    if (r.cost < prev) break;
    prev = r.cost;
    const spot = r.cands.find((c) => {
      const k = `${c[0]},${c[1]}`;
      return !taken.has(k) && !blacklist.has(`${r.what}@${k}`) && !usedHere.has(k);
    });
    if (!spot) continue;
    usedHere.add(`${spot[0]},${spot[1]}`);
    out.push({ verb: 'BUILD', what: r.what, where: { x: spot[0], z: spot[1] }, when: { goldGte: r.cost } });
    if (out.length >= 4) break;
  }
  return out;
}

function harvestRefusalSweep(now) {
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD') continue;
    const reason = String(rec.reason || '');
    const key = `${o.what}@${o.where?.x},${o.where?.z}`;
    const n = (stall.get(key) || 0) + 1;
    stall.set(key, n);
    if (/out_of_zone|collision|UNREACHABLE|out of buildable|cap_reached/i.test(reason) || n >= 3) {
      blacklist.add(key);
    }
  }
}

function decide(view) {
  const now = view.now;

  // 1) the secure boundary: a blank line lets the `bank` default fire without recording an
  //    entry, which keeps the last accepted order off the terminal tick (F-HEAT11-1's lesson).
  if (now.pendingSecure) return null;

  harvestRefusalSweep(now);

  const orders = [];

  // 2) the draft owns the tick (replace semantics): pick first, then resend everything.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3) THE ERA'S ERRAND, once, from a build-free tape.  Recorded at submit time from THIS very
  //    array (PLAYBOOK_USE is stripped from the recording), fired on the next tick, mirrored on
  //    the next wave.  No BUILD, no BLAST_AT, no SET_WEAPON in the array that carries it.
  const met = now.playbookUse?.objectiveMet === true || (now.broadcastMirror?.squadsFielded || 0) > 0;
  const wantPlaybook = !usedPlaybook && !met && (now.playbookUse?.uses || 0) === 0;
  if (wantPlaybook) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'echo-once' });
    orders.push(...seamChain(now, 24));
    orders.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z - 2 } });
    usedPlaybook = true;
    return orders.slice(0, 32);
  }

  // 4) the ladder, one non-decreasing prefix.
  orders.push(...buildRungs(now));

  // 5) the tail: pan, and never let the array be empty (gen 42's wipe).
  const slots = Math.max(0, 31 - orders.length);
  orders.push(...seamChain(now, slots));
  orders.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z - 2 } });
  return orders.slice(0, 32);
}

// ---------------------------------------------------------------- transport
const child = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath,
], { cwd: '/private/tmp/heat12-038cc280', stdio: ['pipe', 'pipe', 'pipe'] });

let buf = '';
let stderr = '';
let outcome = null;
let calls = 0;
child.stderr.on('data', (d) => { stderr += d; });

child.stdout.on('data', (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      const now = msg.now;
      rows.push({
        t: now.timers?.runSeconds, w: now.wave, gold: now.gold, panned: now.score?.goldPanned,
        hp: now.hero?.hp, maxHp: now.hero?.maxHp, lvl: now.hero?.level,
        alive: now.threats?.alive, wrecked: now.works?.wrecked, standing: now.works?.standing,
        byKind: now.works?.byKind,
        mirror: now.broadcastMirror && {
          uses: now.broadcastMirror.recordedUses, fielded: now.broadcastMirror.squadsFielded,
          bodies: now.broadcastMirror.bodiesFielded, pending: now.broadcastMirror.pending.length,
        },
        pb: now.playbookUse && {
          met: now.playbookUse.objectiveMet, uses: now.playbookUse.uses,
          running: now.playbookUse.runningProgram, last: now.playbookUse.last,
          refusals: now.playbookUse.refusals,
        },
        secure: !!now.pendingSecure,
      });
      let out;
      try { out = decide(msg); } catch (e) { out = null; rows.push({ ERR: String(e && e.stack || e) }); }
      if (out === null) {
        child.stdin.write('\n');
      } else {
        const sig = JSON.stringify(out);
        if (sig === lastSig) { child.stdin.write('\n'); }
        else { lastSig = sig; calls += 1; child.stdin.write(sig + '\n'); }
      }
    } else if (typeof msg.secured === 'boolean') {
      outcome = msg;
    }
  }
});

child.on('close', () => {
  fs.writeFileSync(logPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  fs.writeFileSync(path.join(WS, `${tag}-stderr.txt`), stderr);
  let env = null;
  try {
    const tape = JSON.parse(fs.readFileSync(tapePath, 'utf8'));
    const entries = tape.inputLog?.entries || [];
    env = {
      durationTicks: tape.inputLog?.durationTicks,
      lastEntryTick: entries.length ? entries[entries.length - 1].t : null,
      entryCount: entries.length,
      bytes: fs.statSync(tapePath).size,
      ceilingBytes: 16 + Math.ceil(18000 / 5) * 160,
    };
  } catch { /* no tape */ }
  const last = rows[rows.length - 1] || {};
  const summary = { tag, scored, outcome, envelope: env, lastRow: last, callsSubmitted: calls };
  fs.writeFileSync(path.join(WS, `${tag}-summary.json`), JSON.stringify(summary, null, 2));

  // THE INTERMEDIATE-RESULTS LAW: (over)write the best-so-far row after EVERY run.
  const outPath = path.join(WS, 'gauntlet-outcome.json');
  let best = null;
  try { best = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch { /* first run */ }
  const runsSoFar = (best?.runsSoFar || 0) + 1;
  const scoredAttempts = (best?.scoredAttempts || 0) + (scored ? 1 : 0);
  const rank = (o) => (o ? [o.secured ? 1 : 0, o.waves || 0, o.gold || 0, o.timeMs || 0] : [0, 0, 0, 0]);
  const better = (a, b) => {
    const ra = rank(a); const rb = rank(b);
    for (let i = 0; i < ra.length; i += 1) { if (ra[i] !== rb[i]) return ra[i] > rb[i]; }
    return false;
  };
  const prevOutcome = best?.secured !== undefined
    ? { secured: best.secured, waves: best.waves, timeMs: best.timeMs, gold: best.gold, kills: best.kills, calls: best.calls, eventLogHash: best.eventLogHash }
    : null;
  const take = outcome && (!prevOutcome || better(outcome, prevOutcome));
  const row = take
    ? { ...outcome, tape: tapePath, scored, envelope: env }
    : { ...prevOutcome, tape: best?.tape, scored: best?.scored, envelope: best?.envelope };
  fs.writeFileSync(outPath, JSON.stringify({
    ...row,
    runsSoFar, scoredAttempts,
    worldModel: 'sim-import',
    contract: CONTRACT, seed: SEED, difficulty: 'trail',
  }, null, 2) + '\n');

  console.log(JSON.stringify(summary));
});
