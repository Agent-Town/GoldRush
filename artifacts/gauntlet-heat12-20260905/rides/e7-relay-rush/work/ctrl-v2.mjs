#!/usr/bin/env node
// e7-relay-rush controller v2 — gen 43.
// Two secure gates:
//   (1) interferenceFront: >=3 of 4 relay sites lit at the arrival of front 3 (t=270).
//   (2) playbookLatch 'suspended': interferenceFront.refusals.playbooks > 0 — the wall must catch
//       a RUNNING program (syncProgramSuspension:2973) or refuse a use made under the band (:2828).
// v1 lesson: PLAYBOOK_USE is an ORDINARY tick record (StandingOrders.ts:430), so a persistent HOLD
// ahead of it owns every tick and it is never reached. It goes FIRST.
// v1 lesson 2: the armed blank-line window must close on the crossing it armed for, or a missed
// catch freezes the worker for the rest of the run (goldPanned flat at 170, dead at wave 6).
import { spawn } from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';

const TAPE = process.argv[2];
const LOG = process.argv[3] || null;

const CLAIM = { x: -25, z: 41 };

const LADDER = [
  { id: 'turret', cost: 50, spots: [{ x: -25, z: 38 }, { x: -22, z: 38 }, { x: -28, z: 38 }] },
  { id: 'sentry_beacon', cost: 25, spots: [{ x: -45, z: 41 }, { x: -45, z: 39 }, { x: -44, z: 43 }] },
  { id: 'sentry_beacon', cost: 35, spots: [{ x: 25, z: 41 }, { x: 25, z: 39 }, { x: 26, z: 43 }] },
  { id: 'turret', cost: 70, spots: [{ x: -29, z: 42 }, { x: -29, z: 44 }, { x: -28, z: 45 }] },
  { id: 'turret', cost: 95, spots: [{ x: -21, z: 42 }, { x: -21, z: 44 }, { x: -22, z: 45 }] },
  { id: 'sentry_beacon', cost: 45, spots: [{ x: 45, z: 41 }, { x: 45, z: 39 }, { x: 44, z: 43 }] },
  { id: 'turret', cost: 125, spots: [{ x: -25, z: 45 }, { x: -24, z: 45 }, { x: -26, z: 44 }] },
  { id: 'sentry_beacon', cost: 55, spots: [{ x: -28, z: 40 }, { x: -29, z: 39 }, { x: -27, z: 37 }] },
  { id: 'sentry_beacon', cost: 75, spots: [{ x: -22, z: 40 }, { x: -21, z: 39 }, { x: -23, z: 37 }] },
  { id: 'sentry_beacon', cost: 95, spots: [{ x: -25, z: 43 }, { x: -27, z: 43 }, { x: -23, z: 43 }] },
];

const blacklist = new Set();
const key = (p) => `${p.x},${p.z}`;

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
function rungDone(rung, standing) {
  return standing.some((w) => w.id === rung.id
    && rung.spots.some((s) => Math.hypot(w.x - s.x, w.z - s.z) < 2.5));
}
function nextRung(now) {
  const standing = built(now);
  for (const rung of LADDER) {
    if (rungDone(rung, standing)) continue;
    const spot = rung.spots.find((s) => !blacklist.has(key(s)));
    if (!spot) continue;
    return { rung, spot };
  }
  return null;
}
function harvestChain(now, room) {
  const live = (now.seams || []).filter((s) => s.active !== false);
  if (live.length === 0) return [];
  const near = [...live].sort((a, b) =>
    Math.hypot(a.x - CLAIM.x, a.z - CLAIM.z) - Math.hypot(b.x - CLAIM.x, b.z - CLAIM.z));
  // STACK the nearest seam; do not chain. The other three anchors are 20/50/70 wu away, so
  // alternating buys a commute per pan (v2 measured 0.45 g/s doing exactly that).
  const out = [];
  const n = Math.max(0, room - 1);
  for (let i = 0; i < n; i++) out.push({ verb: 'HARVEST', seam: near[0].id });
  return out;
}

let armed = false;
let armedAtFront = -1;
let objectiveDone = false;
let lastSig = null;
let submissions = 0;
const trace = [];

function buildArray(now, front) {
  const orders = [];
  // FIRST: an ordinary record, so nothing persistent may stand ahead of it.
  if (!objectiveDone && !armed && front
      && (front.phase === 'crossing' || front.secondsToNextFront <= 31)) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'p' });
    armed = true;
    armedAtFront = front.frontsCompleted;
  }
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });
  const nx = nextRung(now);
  if (nx && now.gold >= nx.rung.cost) {
    orders.push({ verb: 'BUILD', what: nx.rung.id, where: nx.spot, when: { goldGte: nx.rung.cost } });
  }
  for (const h of harvestChain(now, 31 - orders.length)) orders.push(h);
  orders.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z - 6 } });
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

  // Learn refused coordinates from the view's own order records (gen 35).
  for (const r of now.orders?.orders || []) {
    if (r.status === 'failed' && r.order?.verb === 'BUILD' && r.order.where
        && /out_of_zone|collision|out_of_reach|UNREACHABLE/i.test(r.reason || '')) {
      blacklist.add(key(r.order.where));
    }
  }

  trace.push({
    t: now.timers.runSeconds, w: now.wave, gold: now.gold, panned: now.score.goldPanned,
    hp: now.hero.hp, max: now.hero.maxHp, alive: now.threats.alive,
    lit: front?.litCount, resolved: front?.deadlineResolved, litAt: front?.litAtDeadline,
    frontMet: front?.objectiveMet, mutedRef: front?.refusals?.playbooks,
    pbMet: pb?.objectiveMet, running: pb?.runningProgram, susp: pb?.programSuspensions,
    runs: pb?.programRuns, uses: pb?.uses, last: pb?.last?.reason || (pb?.last?.ok ? 'ok' : null),
    works: now.works.standing, wrecked: now.works.wrecked, armed,
  });

  if (now.pendingSecure) { sim.stdin.write('\n'); return; }

  if (armed && !objectiveDone) {
    // Close the window on the crossing we armed for, so a missed catch cannot freeze the run.
    if (front && front.frontsCompleted > armedAtFront && front.phase !== 'crossing') armed = false;
    else { sim.stdin.write('\n'); return; }
  }

  const orders = buildArray(now, front);
  const sig = JSON.stringify(orders);
  const pending = (now.orders?.orders || []).filter((r) => r.status === 'pending').length;
  if (sig === lastSig && pending > 4 && !now.pendingOffer) { sim.stdin.write('\n'); return; }
  lastSig = sig;
  submissions++;
  sim.stdin.write(JSON.stringify(orders) + '\n');
});

sim.on('close', () => {
  if (LOG) fs.writeFileSync(LOG, JSON.stringify({ outcome, submissions, trace }, null, 1));
  console.log(JSON.stringify(outcome));
  const last = trace[trace.length - 1] || {};
  console.error(`views=${trace.length} subs=${submissions} lit=${last.lit} frontMet=${last.frontMet} pbMet=${last.pbMet} susp=${last.susp} runs=${last.runs} uses=${last.uses} mutedRef=${last.mutedRef} last=${last.last}`);
});
