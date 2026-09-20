#!/usr/bin/env node
// Relay Rush controller — generation 33, Claude Opus 5.
// worldModel: sim-import (read InterferenceFrontSystem, HeadlessContractSim, Balance, gr-sim).
//
// THE CONTRACT, in two clauses:
//   (a) survive to wave 20 (no twist.secureWave -> Balance.run.secureWave = 20, t = 600s), and
//   (b) InterferenceFrontSystem.objectiveMet: 3 of the 4 relay sites must carry a STANDING
//       turret or sentry_beacon at the instant the THIRD front arrives, t = 270.000s exactly.
//       The latch is one-way: miss it and the run is unsecurable at every later wave.
//
// Claim/hero stake sits inside relay-site-r2 (-25,41), so r2 is lit by the fort itself.
// r1 (-45,41) is a 20wu walk; r3 (25,41) is 50wu; r4 (45,41) is 70wu.

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO = '/tmp/heat11-5e7a7c0b';
const WS = `${REPO}/artifacts/heat11/opus/e7-relay-rush`;
const CONTRACT = 'e7-relay-rush';
const SEED = 'e7-relay-rush-01';

const tapeArg = process.argv[2] ?? 'tune-1-tape.json';
const scored = process.argv[3] === 'scored';
const tapePath = `${WS}/${tapeArg}`;

// ---------------------------------------------------------------- the ladder
// Ordered rungs. Each one is re-issued verbatim until works.entries shows it standing.
// LIGHT rungs carry the objective; they are deliberately cheap beacons bought early.
const LADDER = [
  { what: 'turret',        x: -25, z: 45, cost: 50,  tag: 'fort' },
  { what: 'turret',        x: -29, z: 38, cost: 70,  tag: 'fort' },
  { what: 'sentry_beacon', x: -45, z: 41, cost: 25,  tag: 'LIGHT-r1' },
  { what: 'sentry_beacon', x:  25, z: 41, cost: 35,  tag: 'LIGHT-r3' },
  { what: 'turret',        x: -21, z: 38, cost: 95,  tag: 'fort' },
  { what: 'sentry_beacon', x:  45, z: 41, cost: 45,  tag: 'LIGHT-r4' },
  { what: 'turret',        x: -29, z: 44, cost: 125, tag: 'fort' },
  { what: 'sentry_beacon', x: -21, z: 44, cost: 55,  tag: 'fort' },
  { what: 'sentry_beacon', x: -25, z: 37, cost: 75,  tag: 'fort' },
  { what: 'sentry_beacon', x: -21, z: 41, cost: 95,  tag: 'fort' },
  // chaff: palisades are 10g flat and soak the approach from the north edge.
  { what: 'palisade', x: -33, z: 41, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -17, z: 41, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -25, z: 47, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -30, z: 47, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -20, z: 47, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -33, z: 45, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -17, z: 45, cost: 10, tag: 'chaff' },
  { what: 'palisade', x: -33, z: 37, cost: 10, tag: 'chaff' },
];

// Attempts spent re-issuing one rung before we skip past it (gen-10: never park on a refusal).
const RUNG_PATIENCE = 6;

const dist = (a, b, x, z) => Math.hypot(a - x, b - z);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  if (/plat|armou?r|max hp|maxhp|health|tough|hardy|vital/.test(s)) return 100;
  if (/dressing|heal|regen|mend/.test(s)) return 60;
  if (/spark|damage|coil|tap|rate|fire/.test(s)) return 40;
  if (/pan|gold|prospect/.test(s)) return 20;
  return 10;
}

const built = new Set();       // ladder indices confirmed standing
const tries = new Map();       // ladder index -> re-issue count
const log = [];

function nextRung(now) {
  const entries = now.works?.entries ?? [];
  for (let i = 0; i < LADDER.length; i += 1) {
    if (built.has(i)) continue;
    const r = LADDER[i];
    const standing = entries.some((e) => {
      const p = e.position ?? e;
      const fam = e.family ?? e.kind ?? e.id;
      return fam === r.what && dist(p.x, p.z, r.x, r.z) < 1.6;
    });
    if (standing) { built.add(i); continue; }
    if ((tries.get(i) ?? 0) >= RUNG_PATIENCE) continue;
    return i;
  }
  return -1;
}

function harvestChain(now) {
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  if (live.length === 0) return [];
  const p = now.prospector ?? { x: -25, z: 41 };
  live.sort((a, b) => dist(a.x, a.z, p.x, p.z) - dist(b.x, b.z, p.x, p.z));
  const orders = [];
  // A seam holds 30 gold at 5 per 1.5s tick -> six pans empties it. Stack the near seam,
  // then the next one, then come back: the array is a worklist that drains, and the pans
  // that fail on a depleted seam buy extra views (order_failure surprises).
  const ring = [live[0], live[1] ?? live[0], live[0], live[2] ?? live[0]];
  for (const s of ring) {
    for (let k = 0; k < 6; k += 1) orders.push({ verb: 'HARVEST', seam: s.id });
  }
  return orders;
}

function decide(view) {
  const now = view.now;

  // pendingSecure accepts exactly one order and refuses anything else (StandingOrders:178).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // Exactly one build trip in flight. Plan-time affordability only (gen-28): a gold-gated
  // rung fires at an arbitrary later tick and drags the worker off a seam mid-pan.
  const idx = nextRung(now);
  if (idx >= 0 && (now.gold ?? 0) >= LADDER[idx].cost) {
    const r = LADDER[idx];
    tries.set(idx, (tries.get(idx) ?? 0) + 1);
    orders.push({ verb: 'BUILD', what: r.what, where: { x: r.x, z: r.z }, when: { goldGte: r.cost } });
  }

  // Falls through for free when nothing qualifies; keeps the lights re-lit when they take hits.
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  orders.push(...harvestChain(now));
  return orders;
}

// ---------------------------------------------------------------- the ride
const child = spawn('node', ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED, '--tape', tapePath], {
  cwd: REPO, stdio: ['pipe', 'pipe', 'inherit'],
});

const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
let last = null;
let views = 0;

for await (const line of rl) {
  const t = line.trim();
  if (!t.startsWith('{')) continue;
  let msg;
  try { msg = JSON.parse(t); } catch { continue; }
  if (msg.schema !== 'goldrush.view.v1') { last = msg; continue; }
  views += 1;
  const n = msg.now;
  const f = n.interferenceFront ?? {};
  log.push({
    v: views, t: n.timers?.runSeconds, wave: n.wave, gold: n.gold, hp: n.hero?.hp, maxHp: n.hero?.maxHp,
    alive: n.threats?.alive, standing: n.works?.standing, wrecked: n.works?.wrecked,
    byKind: n.works?.byKind, lit: f.litCount, sites: (f.sites ?? []).map((s) => (s.lit ? s.id.slice(-2) : '--')).join(','),
    fronts: f.frontsArrived, met: f.objectiveMet, resolved: f.deadlineResolved, litAtDeadline: f.litAtDeadline,
    built: built.size, next: nextRung(n),
  });
  if (n.needsRider === undefined && msg.appendLog === undefined) { /* nothing */ }
  const orders = decide(msg);
  child.stdin.write(`${JSON.stringify(orders)}\n`);
}

child.stdin.end();
await new Promise((r) => child.on('close', r));

const outcome = last ?? { secured: false, note: 'no outcome line' };
console.log('OUTCOME', JSON.stringify(outcome));
writeFileSync(`${WS}/${tapeArg.replace('.json', '')}-log.json`, JSON.stringify(log, null, 1));

// THE INTERMEDIATE-RESULTS LAW: best-so-far, rewritten after every run.
const outPath = `${WS}/gauntlet-outcome.json`;
let prev = null;
try { prev = JSON.parse(readFileSync(outPath, 'utf8')); } catch { /* first run */ }
const rank = (o) => (o?.secured ? 1e9 : 0) + (o?.timeMs ?? 0) / 1000;
const runsSoFar = (prev?.runsSoFar ?? 0) + 1;
const scoredAttempts = (prev?.scoredAttempts ?? 0) + (scored ? 1 : 0);
const better = !prev || rank(outcome) >= rank(prev.outcome);
const rec = better
  ? { outcome, tape: resolve(tapePath), scored, runsSoFar, scoredAttempts, worldModel: 'sim-import' }
  : { ...prev, runsSoFar, scoredAttempts };
writeFileSync(outPath, JSON.stringify(rec, null, 2));
console.log('views', views, 'built', built.size, 'tape', tapePath);
console.log(JSON.stringify(log.filter((r, i) => i % 4 === 0 || r.fronts >= 3).slice(-24)));
