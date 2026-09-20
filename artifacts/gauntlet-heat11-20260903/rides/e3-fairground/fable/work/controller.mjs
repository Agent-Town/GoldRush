#!/usr/bin/env node
/**
 * e3-fairground controller — Claude Fable 5, gauntlet heat 11, generation 13.
 * worldModel: sim-import (repository source + the county's published prover measurements,
 * pointed at by public/skill.md's own fairground admission note).
 *
 * THE POLICY, from the measured facts:
 *  - The stake is (0,-30); the wheel at (0,8) stops its dynamo FOR THE RUN on its first hit
 *    (undefended: t~21s), and the secure latch needs wheel spinning + all 3 crossings + wave 12.
 *  - Fort: radius-8 palisade box around the stake + 4 sentry beacons; crowds fright at 7, so
 *    radius 8 keeps besiegers outside the middle crowd's ring. Build order is the pressure map:
 *    mid flanks (off the runner stream) -> north corners -> south corners (65% of all damage,
 *    the wheel's decoy) -> south guns (±4,-34) -> north guns (±4,-26) -> fill; cap 16 works.
 *  - Purse is a RESERVE in plan order: stop at the first piece it cannot cover, or cheap timber
 *    starves the guns forever (BUILD skips an unmet goldGte, it does not queue).
 *  - Panning is instant, travel is the cost; over-ask every seam by one pan so the dry refusal
 *    raises a surprise view exactly when there is news. Seam anchors are SHUFFLED: learn the
 *    node->anchor map by watching `remaining` fall while standing on an anchor.
 *  - REPAIR_UNDER 60 (cheapest hp/gold), cannot be aimed; demolish stray emergency posts.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const REPO = fileURLToPath(new URL('../../../..', import.meta.url));
const argv = process.argv.slice(2);
const flagVal = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };

const STAKE = { x: 0, z: -30 };
const RING_R = 8;
const STEP = 4;
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
const ZONES = [
  { minX: -36, maxX: 36, minZ: -38, maxZ: -12 },
  { minX: -38, maxX: -10, minZ: -8, maxZ: 30 },
  { minX: 10, maxX: 38, minZ: -8, maxZ: 30 },
];
const CFG = {
  beacons: 4,
  repairPct: 60,
  minTrip: 70,
  maxRepairs: 18,
  reach: 5.4,
  lanePad: 8,
  zonePad: 2,
  southLimit: -12,
  standTravelWeight: 12,
  openTravelWeight: 8,
  infant: 5,
  agentSpeed: 4.8,
  postDeadline: 15,
  detourBudget: 10,
  strayClearAt: 6,
  strayRange: 14,
  panCap: 20,
  rebuildCap: 3,
  maxWorks: 16,
  picks: [
    'prospectors_luck',
    'long_resonator', 'heavy_spark', 'split_spark', 'double_tap_coil',
    'tinkers_plating', 'beacon_dynamo', 'sharpen', 'field_dressing',
  ],
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const pans = (id, n) => Array.from({ length: n }, () => ({ verb: 'HARVEST', seam: id }));

function fortPlan(cfg) {
  const ew = [];
  const ns = [];
  for (let x = -RING_R; x <= RING_R; x += STEP) {
    ns.push({ what: 'palisade', x, z: STAKE.z - RING_R, rotationSteps: 1, cost: 10 });
    ns.push({ what: 'palisade', x, z: STAKE.z + RING_R, rotationSteps: 1, cost: 10 });
  }
  for (let z = STAKE.z - RING_R + STEP; z <= STAKE.z + RING_R - STEP; z += STEP) {
    ew.push({ what: 'palisade', x: -RING_R, z, rotationSteps: 0, cost: 10 });
    ew.push({ what: 'palisade', x: RING_R, z, rotationSteps: 0, cost: 10 });
  }
  const ring = [...ew, ...ns];
  const at = (x, z) => ring.find((p) => p.x === x && p.z === z);
  const south = [at(-RING_R, STAKE.z - RING_R), at(RING_R, STAKE.z - RING_R)];
  const north = [at(-RING_R, STAKE.z + RING_R), at(RING_R, STAKE.z + RING_R)];
  const mid = [at(-RING_R, STAKE.z), at(RING_R, STAKE.z)];
  const beacons = [
    { x: -4, z: -34 }, { x: 4, z: -34 }, { x: -4, z: -26 }, { x: 4, z: -26 },
  ].slice(0, cfg.beacons).map((s, i) => ({ what: 'sentry_beacon', ...s, cost: BEACON_COSTS[i] }));
  const claimed = new Set([...south, ...north, ...mid]);
  const fill = ring.filter((p) => !claimed.has(p));
  return [...mid, ...north, ...south, ...beacons.slice(0, 2), ...beacons.slice(2), ...fill]
    .slice(0, cfg.maxWorks);
}

function learnSeams(view, memo) {
  const anchors = view.stablePrefix.map.seams;
  memo.anchorOf ??= {};
  const prev = memo.seamState ?? {};
  const pros = view.now.prospector;
  const near = pros ? anchors.filter((a) => dist(a, pros) <= 2.5) : [];
  for (const s of view.now.seams) {
    const before = prev[s.id];
    if (!s.active) delete memo.anchorOf[s.id];
    else if (before?.active && s.remaining < before.remaining && near.length === 1) {
      memo.anchorOf[s.id] = { x: near[0].x, z: near[0].z };
    }
  }
  memo.seamState = Object.fromEntries(view.now.seams.map((s) => [s.id, { active: s.active, remaining: s.remaining }]));
}

function learnLanes(view, memo) {
  memo.lanes ??= {};
  for (const f of view.now.fairground?.flocks?.flocks ?? []) {
    if (f.phase === 'home') memo.lanes[f.id] = f.x;
  }
}

const liveSeams = (view) => view.now.seams.filter((s) => s.active && s.remaining > 0);

function seamCost(seam, memo, from, view) {
  const known = memo.anchorOf?.[seam.id];
  if (known) return dist(known, from);
  const anchors = view.stablePrefix.map.seams;
  return anchors.reduce((sum, a) => sum + dist(a, from), 0) / anchors.length;
}

function panChain(view, memo, from, budget) {
  const live = liveSeams(view);
  const chain = [];
  let at = from;
  let left = Math.max(0, budget);
  const used = new Set();
  while (left > 0) {
    const next = live.filter((s) => !used.has(s.id))
      .sort((a, b) => seamCost(a, memo, at, view) - seamCost(b, memo, at, view))[0];
    if (!next) break;
    used.add(next.id);
    const want = Math.min(left, Math.ceil(next.remaining / 5) + 1);
    chain.push(...pans(next.id, want));
    left -= want;
    at = memo.anchorOf?.[next.id] ?? at;
  }
  return chain;
}

function missingPlan(plan, entries, memo, cfg) {
  memo.seen ??= {};
  memo.lost ??= {};
  const gone = [];
  const open = [];
  for (const piece of plan) {
    const key = `${piece.what}:${piece.x}:${piece.z}`;
    if (entries.some((e) => e.id === piece.what && dist(e.position, piece) < 2.5)) {
      memo.seen[key] = true;
      continue;
    }
    if (memo.seen[key]) {
      memo.lost[key] = (memo.lost[key] ?? 0) + 1;
      memo.seen[key] = false;
    }
    ((memo.lost[key] ?? 0) >= cfg.rebuildCap ? gone : open).push(piece);
  }
  return open.length > 0 ? open : gone;
}

const buildOrder = (p) => ({
  verb: 'BUILD',
  what: p.what,
  where: { x: p.x, z: p.z },
  when: { goldGte: p.cost },
  ...(p.rotationSteps === undefined ? {} : { rotationSteps: p.rotationSteps }),
});

function inZone(spot, cfg) {
  return ZONES.some((z) => spot.x >= z.minX + cfg.zonePad && spot.x <= z.maxX - cfg.zonePad
    && spot.z >= z.minZ + cfg.zonePad && spot.z <= z.maxZ - cfg.zonePad);
}

function laneClear(spot, memo, cfg) {
  return Object.values(memo.lanes ?? {}).every((laneX) => {
    const z = Math.max(STAKE.z, Math.min(12, spot.z));
    return Math.hypot(spot.x - laneX, spot.z - z) >= cfg.lanePad;
  });
}

function onTheWay(from, to, memo, cfg) {
  const direct = dist(from, to);
  if (direct < 1) return null;
  let best = null;
  let bestArrival = Infinity;
  for (let x = -34; x <= 34; x += 2) {
    for (let z = -36; z <= cfg.southLimit; z += 2) {
      const spot = { x, z };
      if (!inZone(spot, cfg) || !laneClear(spot, memo, cfg)) continue;
      const arrival = dist(from, spot);
      if (arrival + dist(spot, to) - direct > cfg.detourBudget) continue;
      if (arrival < bestArrival) { best = spot; bestArrival = arrival; }
    }
  }
  return best && direct - bestArrival >= 8 ? best : null;
}

function standPoint(targets, hurt, from, cfg, travelWeight) {
  if (targets.length === 0 && hurt.length === 0) return null;
  const anchors = targets.length > 0 ? targets : hurt.map((e) => e.position);
  const candidates = [];
  for (const t of anchors) {
    for (const radius of [0, 2.5, 4.6]) {
      const steps = radius === 0 ? 1 : 16;
      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        candidates.push({
          x: Number((t.x + Math.cos(angle) * radius).toFixed(1)),
          z: Number((t.z + Math.sin(angle) * radius).toFixed(1)),
        });
      }
    }
  }
  let best = null;
  let bestScore = -Infinity;
  for (const spot of candidates) {
    const score = targets.filter((p) => dist(p, spot) <= cfg.reach).length - dist(spot, from) / travelWeight;
    if (score > bestScore) { best = spot; bestScore = score; }
  }
  return best;
}

function waitingSpot(view, memo) {
  const anchors = view.stablePrefix.map.seams;
  const taken = new Set(Object.values(memo.anchorOf ?? {}).map((a) => `${a.x}:${a.z}`));
  const open = anchors.filter((a) => !taken.has(`${a.x}:${a.z}`));
  const pool = open.length > 0 ? open : anchors;
  return {
    x: Number((pool.reduce((s, a) => s + a.x, 0) / pool.length).toFixed(2)),
    z: Number((pool.reduce((s, a) => s + a.z, 0) / pool.length).toFixed(2)),
  };
}

function decide(view, memo, plan, cfg) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  learnSeams(view, memo);
  learnLanes(view, memo);

  const head = now.pendingOffer
    ? [{ verb: 'PICK_UPGRADE', id: cfg.picks.find((id) => now.pendingOffer.some((e) => e.id === id)) ?? now.pendingOffer[0].id }]
    : [];
  const entries = now.works.entries ?? [];
  const missing = missingPlan(plan, entries, memo, cfg);
  const hurt = entries.filter((e) => e.wrecked || (e.maxHp > 0 && (e.hp / e.maxHp) * 100 < cfg.repairPct));
  const pros = now.prospector ?? STAKE;
  const infant = entries.filter((e) => !e.wrecked).length < cfg.infant;

  // The opening: no gold at t=0 and no second turn until a seam runs dry — drain the nearest.
  if (entries.length === 0 && now.gold < 10) {
    const seam = liveSeams(view).sort((a, b) => seamCost(a, memo, pros, view) - seamCost(b, memo, pros, view))[0];
    return seam ? [...head, ...pans(seam.id, 7)] : [...head];
  }

  // The wheel's first twenty seconds need something STANDING, not something shooting.
  const wanted = entries.length < 3 ? missing.filter((p) => p.what === 'palisade') : missing;
  const stand = standPoint(wanted, hurt, pros, cfg, infant ? cfg.openTravelWeight : cfg.standTravelWeight);
  const reachable = stand ? wanted.filter((p) => dist(p, stand) <= cfg.reach) : [];
  let purse = now.gold;
  const inReach = reachable.filter((p) => (purse -= p.cost) >= 0);
  const repairs = Math.min(cfg.maxRepairs, hurt.length);
  const dry = liveSeams(view).length === 0;
  const fortWorth = stand !== null && (inReach.length > 0 || repairs > 0)
    && ((entries.length < 3 && now.gold >= 10) || now.gold >= cfg.minTrip || (dry && now.gold >= 3));

  const script = [...head];
  const stray = entries.find((e) => e.id === 'palisade'
    && dist(e.position, STAKE) > cfg.strayRange
    && !plan.some((p) => p.what === 'palisade' && dist(p, e.position) < 2.5));
  if (stray && entries.filter((e) => !e.wrecked).length >= cfg.strayClearAt && now.gold >= 3) {
    script.push({ verb: 'MOVE_TO', pos: { x: stray.position.x, z: stray.position.z } });
    script.push({ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: 'palisade', index: stray.index } });
  }
  if (fortWorth) {
    const arrival = now.timers.runSeconds + dist(pros, stand) / cfg.agentSpeed;
    const early = !memo.postPlanted && infant && now.gold >= 20 && arrival > cfg.postDeadline
      ? onTheWay(pros, stand, memo, cfg)
      : null;
    if (early) {
      memo.postPlanted = true;
      script.push({ verb: 'MOVE_TO', pos: early });
      script.push(buildOrder({ what: 'palisade', ...early, cost: 10, rotationSteps: 0 }));
    }
    script.push({ verb: 'MOVE_TO', pos: { x: stand.x, z: stand.z } });
    for (const piece of inReach) script.push(buildOrder(piece));
    for (let i = 0; i < repairs; i += 1) script.push({ verb: 'REPAIR_UNDER', pct: cfg.repairPct });
  }
  const from = fortWorth ? stand : pros;
  script.push(...panChain(view, memo, from, Math.min(cfg.panCap, 32 - script.length)));
  if (!fortWorth && dry) script.push({ verb: 'MOVE_TO', pos: waitingSpot(view, memo) });
  return script.slice(0, 32);
}

// ── DRIVER ────────────────────────────────────────────────────────────────────────────────────
const seed = flagVal('--seed', 'e3-fairground-01');
const tapePath = flagVal('--tape', `${HERE}tune-x-tape.json`);
const logPath = flagVal('--log', `${HERE}run.log`);
const scored = argv.includes('--scored');

const trace = (line) => appendFileSync(logPath, `${line}\n`);

function traceLine(turn, now) {
  const fair = now.fairground;
  return `t${turn} s${now.timers.runSeconds.toFixed(0)} w${now.wave} gold=${Math.round(now.gold)} hp=${now.hero.hp.toFixed(0)}`
    + ` works=${now.works.standing}/${now.works.standing + now.works.wrecked}`
    + ` alive=${now.threats.alive}`
    + ` wheel=${fair ? `${fair.wheel.spinning ? 'spin' : 'STOP'}/${fair.wheel.hp.toFixed(0)}` : '-'}`
    + ` crossings=${fair ? fair.flocks.flocks.map((f) => f.crossings).join('') : '-'}`
    + ` pros=(${now.prospector ? `${now.prospector.x.toFixed(0)},${now.prospector.z.toFixed(0)}` : '-'})`;
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', 'e3-fairground', '--seed', seed, '--tape', tapePath], {
  cwd: REPO,
  stdio: ['pipe', 'pipe', 'pipe'],
});
child.stderr.on('data', (d) => appendFileSync(logPath, d.toString()));

const plan = fortPlan(CFG);
const memo = {};
let turns = 0;
let outcome = null;
writeFileSync(logPath, `controller.mjs seed=${seed} tape=${tapePath} scored=${scored}\n`);

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const msg = JSON.parse(line);
  if (msg.schema !== 'goldrush.view.v1') {
    outcome = msg;
    trace(`OUTCOME ${line}`);
    process.stdout.write(`${line}\n`);
    continue;
  }
  trace(traceLine(turns, msg.now));
  turns += 1;
  if (!child.stdin.writable || child.stdin.destroyed) continue;
  try {
    child.stdin.write(`${JSON.stringify(decide(msg, memo, plan, CFG))}\n`);
  } catch { /* gr-sim closes stdin at terminal; a lost final line is not an error */ }
}
child.stdin.end();
const rc = await new Promise((resolve) => child.on('close', resolve));
trace(`turns=${turns} rc=${rc}`);

// THE INTERMEDIATE-RESULTS LAW: after EVERY run, (over)write the best outcome so far.
const outcomeFile = `${HERE}gauntlet-outcome.json`;
let prior = null;
if (existsSync(outcomeFile)) { try { prior = JSON.parse(readFileSync(outcomeFile, 'utf8')); } catch { prior = null; } }
const runsSoFar = (prior?.runsSoFar ?? 0) + 1;
const scoredAttempts = (prior?.scoredAttempts ?? 0) + (scored ? 1 : 0);
const better = outcome && (!prior
  || (outcome.secured && !prior.secured)
  || (outcome.secured === Boolean(prior.secured) && (outcome.waves ?? 0) > (prior.waves ?? 0))
  || (outcome.secured === Boolean(prior.secured) && (outcome.waves ?? 0) === (prior.waves ?? 0) && (outcome.gold ?? 0) >= (prior.gold ?? 0)));
const best = better ? { ...outcome, tape: tapePath, scored } : { ...prior };
writeFileSync(outcomeFile, `${JSON.stringify({ ...best, runsSoFar, scoredAttempts, worldModel: 'sim-import' }, null, 2)}\n`);
if (!outcome?.secured) process.exitCode = 1;
