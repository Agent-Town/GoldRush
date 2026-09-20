#!/usr/bin/env node
// e7-relay-rush controller — gen 43.
// Two secure gates:
//   (1) interferenceFront: >=3 of 4 relay sites lit at the arrival of front 3 (t=270).
//   (2) playbookLatch 'suspended': interferenceFront.refusals.playbooks > 0, i.e. the wall must
//       catch a RUNNING program (HeadlessContractSim.syncProgramSuspension:2966-2983) or refuse a
//       PLAYBOOK_USE issued under the band (usePlaybook:2828).
// Strategy for (2): arm the program just before a front arrives, then answer with blank lines so
// no ordinary submission takes the wheel back; the band sweeps every x from -60 to +60 in 20s at
// 6wu/s against a 4.8wu/s worker, so a running program cannot escape it.
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';

const TAPE = process.argv[2];
const LOG = process.argv[3] || null;

const CLAIM = { x: -25, z: 41 };

// Ladder in STRATEGY order (gen 39: never sort by price). Rung 1 defends AND lights r2 (the claim
// sits inside relay-site-r2). Rungs 2-4 are the cheap distant lights that discharge gate (1).
const LADDER = [
  { id: 'turret', cost: 50, spots: [{ x: -25, z: 38 }, { x: -22, z: 38 }, { x: -28, z: 38 }] },
  { id: 'sentry_beacon', cost: 25, spots: [{ x: -45, z: 41 }, { x: -45, z: 39 }, { x: -44, z: 43 }] },
  { id: 'sentry_beacon', cost: 35, spots: [{ x: 25, z: 41 }, { x: 25, z: 39 }, { x: 26, z: 43 }] },
  { id: 'sentry_beacon', cost: 45, spots: [{ x: 45, z: 41 }, { x: 45, z: 39 }, { x: 44, z: 43 }] },
  { id: 'turret', cost: 70, spots: [{ x: -29, z: 42 }, { x: -29, z: 44 }, { x: -28, z: 45 }] },
  { id: 'turret', cost: 95, spots: [{ x: -21, z: 42 }, { x: -21, z: 44 }, { x: -22, z: 45 }] },
  { id: 'turret', cost: 125, spots: [{ x: -25, z: 45 }, { x: -24, z: 45 }, { x: -26, z: 44 }] },
  { id: 'sentry_beacon', cost: 55, spots: [{ x: -28, z: 40 }, { x: -29, z: 39 }, { x: -27, z: 37 }] },
  { id: 'sentry_beacon', cost: 75, spots: [{ x: -22, z: 40 }, { x: -21, z: 39 }, { x: -23, z: 37 }] },
  { id: 'sentry_beacon', cost: 95, spots: [{ x: -25, z: 43 }, { x: -27, z: 43 }, { x: -23, z: 43 }] },
];

const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;

// Plating first: the cheapest margin on the board and it costs no gold (gen 14/24).
function scoreUpgrade(u) {
  const t = `${u.id} ${u.name} ${u.effectText}`.toLowerCase();
  let s = 0;
  if (/plating|max hp|maxhp|health|vitality|tough/.test(t)) s += 100;
  if (/dressing|heal|regen|mend/.test(t)) s += 60;
  if (/damage|spark|coil|tap|power|volley/.test(t)) s += 40;
  if (/fire rate|reload|rate/.test(t)) s += 30;
  if (/range/.test(t)) s += 15;
  if (/gold|luck|pan/.test(t)) s += 2;
  return s;
}

function built(now) {
  const out = [];
  for (const e of now.works.entries || []) {
    if (e.wrecked) continue;
    out.push({ id: e.id || e.family || e.kind, x: e.position?.x, z: e.position?.z });
  }
  return out;
}

// A rung is DONE when a standing work of its kind occupies one of its spots (within 2wu).
function rungDone(rung, standing) {
  return standing.some((w) => w.id === rung.id
    && rung.spots.some((s) => Math.hypot(w.x - s.x, w.z - s.z) < 2.5));
}

function nextRung(now) {
  const standing = built(now);
  const counts = {};
  for (const w of standing) counts[w.id] = (counts[w.id] || 0) + 1;
  for (const rung of LADDER) {
    if (rungDone(rung, standing)) continue;
    const spot = rung.spots.find((s) => !blacklist.has(key(s)));
    if (!spot) continue;
    return { rung, spot };
  }
  return null;
}

function harvestChain(now) {
  const live = (now.seams || []).filter((s) => s.active !== false);
  if (live.length === 0) return [];
  const near = [...live].sort((a, b) =>
    Math.hypot(a.x - CLAIM.x, a.z - CLAIM.z) - Math.hypot(b.x - CLAIM.x, b.z - CLAIM.z));
  const out = [];
  // Stack the nearest seam (gen 15: stack when far, and every seam here is a real commute).
  for (let i = 0; i < 10; i++) out.push({ verb: 'HARVEST', seam: near[0].id });
  if (near[1]) for (let i = 0; i < 4; i++) out.push({ verb: 'HARVEST', seam: near[1].id });
  return out;
}

let armed = false;      // a program has been asked for and we are waiting for the wall
let objectiveDone = false;
let lastSig = null;
let submissions = 0;
const trace = [];

function buildArray(now, front, pb) {
  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });

  const nx = nextRung(now);
  if (nx && now.gold >= nx.rung.cost) {
    orders.push({ verb: 'BUILD', what: nx.rung.id, where: nx.spot, when: { goldGte: nx.rung.cost } });
  }
  for (const h of harvestChain(now)) { if (orders.length < 30) orders.push(h); }
  // Terminal anchor: an array must never be filterable to empty (gen 42).
  orders.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z - 6 } });

  // Arm the program on the last view before a front arrives, so it is running when the wall sweeps.
  if (!objectiveDone && !armed && front && (front.phase === 'crossing' || front.secondsToNextFront <= 31)) {
    if (orders.length >= 32) orders.pop();
    orders.push({ verb: 'PLAYBOOK_USE', name: 'p' });
    armed = true;
  }
  return orders.slice(0, 32);
}

const args = ['scripts/gr-sim.mjs', '--contract', 'e7-relay-rush', '--seed', 'e7-relay-rush-01'];
if (TAPE) args.push('--tape', TAPE);
const sim = spawn('node', args, { stdio: ['pipe', 'pipe', 'inherit'] });
const rl = readline.createInterface({ input: sim.stdout });

let outcome = null;
rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.schema !== 'goldrush.view.v1') { outcome = msg; return; }
  const now = msg.now;
  const front = now.interferenceFront;
  const pb = now.playbookUse;
  if (pb && pb.objectiveMet) objectiveDone = true;

  trace.push({
    t: now.timers.runSeconds, w: now.wave, gold: now.gold, panned: now.score.goldPanned,
    hp: now.hero.hp, max: now.hero.maxHp, alive: now.threats.alive,
    lit: front?.litCount, resolved: front?.deadlineResolved, litAt: front?.litAtDeadline,
    frontMet: front?.objectiveMet, mutedRef: front?.refusals?.playbooks,
    pbMet: pb?.objectiveMet, running: pb?.runningProgram, susp: pb?.programSuspensions,
    runs: pb?.programRuns, last: pb?.last?.reason || (pb?.last?.ok ? 'ok' : null),
    works: now.works.standing, wrecked: now.works.wrecked,
  });

  // Secure boundary: blank line banks by default and records NO entry (envelope + byte insurance).
  if (now.pendingSecure) { sim.stdin.write('\n'); return; }

  // While waiting for the wall to catch the program, do not take the wheel back.
  if (armed && !objectiveDone) { sim.stdin.write('\n'); return; }

  const orders = buildArray(now, front, pb);
  const sig = JSON.stringify(orders);
  const drained = (now.orders?.orders || []).filter((r) => r.status === 'pending' || r.status === 'active').length;
  if (sig === lastSig && drained > 3 && !now.pendingOffer) { sim.stdin.write('\n'); return; }
  lastSig = sig;
  submissions++;
  sim.stdin.write(JSON.stringify(orders) + '\n');
});

sim.on('close', () => {
  const summary = { outcome, submissions, trace };
  if (LOG) fs.writeFileSync(LOG, JSON.stringify(summary, null, 1));
  console.log(JSON.stringify(outcome));
  const last = trace[trace.length - 1] || {};
  console.error(`views=${trace.length} subs=${submissions} lit=${last.lit} frontMet=${last.frontMet} pbMet=${last.pbMet} susp=${last.susp} runs=${last.runs} mutedRef=${last.mutedRef}`);
});
