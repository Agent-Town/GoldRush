#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [, , contract, seed, attempt, tapePath, logPath] = process.argv;

if (!contract || !seed || !attempt || !tapePath || !logPath) {
  console.error("usage: rider-driver.mjs <contract> <seed> <attempt> <tapePath> <logPath>");
  process.exit(64);
}

mkdirSync(dirname(resolve(tapePath)), { recursive: true });
mkdirSync(dirname(resolve(logPath)), { recursive: true });

const startedAt = Date.now();
const log = createWriteStream(logPath, { flags: "w" });
const child = spawn(
  "node",
  ["scripts/gr-sim.mjs", "--contract", contract, "--seed", seed, "--tape", resolve(tapePath)],
  { cwd: "/tmp/heat2-b42c0fbc", stdio: ["pipe", "pipe", "pipe"] },
);

let stdoutBuf = "";
let stderrBuf = "";
let lineNo = 0;
let lastOutcome = null;
let terminalView = null;
let sent = 0;

child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  stderrBuf += chunk;
  log.write(JSON.stringify({ type: "stderr", chunk }) + "\n");
});

child.stdout.setEncoding("utf8");
child.stdout.on("data", (chunk) => {
  stdoutBuf += chunk;
  for (;;) {
    const ix = stdoutBuf.indexOf("\n");
    if (ix < 0) break;
    const raw = stdoutBuf.slice(0, ix).trim();
    stdoutBuf = stdoutBuf.slice(ix + 1);
    if (!raw) continue;
    handleLine(raw);
  }
});

child.on("close", (code, signal) => {
  const wallSeconds = (Date.now() - startedAt) / 1000;
  const summary = {
    contract,
    seed,
    attempt: Number(attempt),
    code,
    signal,
    sent,
    wallSeconds,
    outcome: lastOutcome,
    terminalView,
    stderrTail: stderrBuf.slice(-4000),
  };
  log.write(JSON.stringify({ type: "summary", summary }) + "\n");
  log.end();
  writeFileSync(logPath.replace(/\.ndjson$/, ".summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
});

function handleLine(raw) {
  lineNo += 1;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    log.write(JSON.stringify({ type: "stdout-raw", lineNo, raw }) + "\n");
    return;
  }
  log.write(JSON.stringify({ type: "stdout-json", lineNo, value: parsed }) + "\n");
  if (parsed?.schema === "goldrush.view.v1") {
    if (isTerminalView(parsed)) terminalView = summarizeView(parsed);
    const orders = makeOrders(parsed);
    child.stdin.write(JSON.stringify(orders) + "\n\n");
    sent += 1;
    log.write(JSON.stringify({ type: "orders", sent, orders }) + "\n");
  } else {
    lastOutcome = parsed;
  }
}

function isTerminalView(view) {
  return Boolean(view?.now?.pendingSecure || view?.now?.terminal || view?.now?.outcome);
}

function summarizeView(view) {
  return {
    wave: view.now?.wave,
    hp: view.now?.hero?.hp,
    gold: view.now?.gold,
    pendingSecure: view.now?.pendingSecure ?? null,
    threats: view.now?.threats ?? null,
    score: view.now?.score ?? null,
  };
}

function makeOrders(view) {
  const now = view.now ?? {};
  if (now.pendingSecure) return [{ verb: "SECURE_CHOICE", choice: "bank" }];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    return makeContractOrders(view);
  }

  return makeContractOrders(view);
}

function makeContractOrders(view) {
  if (contract === "e2-hill-mine") return hillMineOrders(view);
  if (contract === "e1-night-shift") return nightShiftOrders(view);
  return claimOrders(view);
}

function pickUpgrade(offers, now = {}) {
  const ranked = [...offers].sort((a, b) => upgradeScore(b, now) - upgradeScore(a, now));
  return ranked[0] ?? offers[0];
}

function upgradeScore(offer, now = {}) {
  const hay = `${offer.id ?? ""} ${offer.name ?? ""} ${offer.effectText ?? ""}`.toLowerCase();
  let score = 0;
  const hurt = (now.hero?.hp ?? 100) < Math.max(75, (now.hero?.maxHp ?? 100) * 0.75);
  if (hurt && (hay.includes("heal") || hay.includes("health") || hay.includes("hp") || hay.includes("plating"))) score += 180;
  if (hay.includes("turret")) score += 80;
  if (hay.includes("spark") || hay.includes("rig")) score += 70;
  if (hay.includes("blast")) score += 65;
  if (hay.includes("damage")) score += 50;
  if (hay.includes("range")) score += 45;
  if (hay.includes("cooldown")) score += 42;
  if (hay.includes("repair")) score += 40;
  if (hay.includes("slow") || hay.includes("sentry")) score += 35;
  if (hay.includes("seam") || hay.includes("gold") || hay.includes("harvest")) score += 25;
  if (hay.includes("health") || hay.includes("hp")) score += 20;
  return score;
}

function claimOrders(view) {
  const claim = view.stablePrefix.map.claim;
  const station = { x: claim.x, z: claim.z - 1 };
  const desired = [
    build("palisade", claim.x, claim.z - 4),
    build("palisade", claim.x + 4, claim.z),
    build("palisade", claim.x - 4, claim.z),
    build("sentry_beacon", claim.x, claim.z - 8),
    build("turret", claim.x, claim.z - 2),
    build("palisade", claim.x, claim.z + 4),
    build("sentry_beacon", claim.x + 8, claim.z),
    build("sentry_beacon", claim.x - 8, claim.z),
    build("palisade", claim.x + 4, claim.z - 4),
    build("palisade", claim.x - 4, claim.z - 4),
    build("turret", claim.x + 5, claim.z - 1),
    build("turret", claim.x - 5, claim.z - 1),
    build("sentry_beacon", claim.x, claim.z + 8),
    build("turret", claim.x, claim.z + 5),
  ];
  return frontierOrders(view, station, desired, { repairPct: 76, harvestBursts: 18 });
}

function nightShiftOrders(view) {
  const claim = view.stablePrefix.map.claim;
  const station = { x: claim.x, z: claim.z - 1 };
  const desired = [
    build("palisade", claim.x, claim.z - 4),
    build("palisade", claim.x + 4, claim.z),
    build("palisade", claim.x - 4, claim.z),
    build("turret", claim.x, claim.z - 2),
    build("palisade", claim.x, claim.z + 4),
    build("turret", claim.x + 5, claim.z - 1),
    build("turret", claim.x - 5, claim.z - 1),
    build("sentry_beacon", claim.x, claim.z - 6),
    build("sentry_beacon", claim.x + 6, claim.z),
    build("sentry_beacon", claim.x - 6, claim.z),
    build("sentry_beacon", claim.x, claim.z + 8),
  ];
  return frontierOrders(view, station, desired, { repairPct: 100, harvestBursts: 18, weapon: "rig", explicitBlast: true, kite: true });
}

function hillMineOrders(view) {
  const claim = view.stablePrefix.map.claim;
  const station = { x: claim.x, z: claim.z - 1 };
  const hasTurret = (view.now?.works?.entries ?? []).some((entry) => entry.id === "turret" && !entry.wrecked);
  if (!hasTurret) {
    const orders = [];
    if ((view.now?.threats?.alive ?? 0) > 0 && (view.now?.blastReadyInMs ?? 1) === 0) orders.push({ verb: "BLAST_AT", pos: blastPoint(view, view.now?.threats?.edge) });
    orders.push({ verb: "SET_WEAPON", weapon: "rig" });
    const seams = harvestQueue(activeSeams(view, station)).slice(0, 12);
    for (const seam of seams) orders.push({ verb: "HARVEST", seam: seam.id });
    orders.push({ verb: "MOVE_TO", pos: station });
    orders.push({ verb: "BUILD", what: "turret", where: { x: claim.x, z: claim.z - 2 }, when: { goldGte: 50 } });
    orders.push({ verb: "BUILD", what: "palisade", where: { x: claim.x, z: claim.z - 4 }, when: { goldGte: 10 } });
    orders.push({ verb: "BUILD", what: "palisade", where: { x: claim.x + 4, z: claim.z }, when: { goldGte: 10 } });
    orders.push({ verb: "HOLD", pos: station });
    return orders.slice(0, 32);
  }
  const desired = [
    build("palisade", claim.x, claim.z - 4),
    build("palisade", claim.x + 4, claim.z),
    build("palisade", claim.x - 4, claim.z),
    build("palisade", claim.x, claim.z + 4),
    build("turret", claim.x + 5, claim.z - 1),
    build("turret", claim.x - 5, claim.z - 1),
    build("turret", claim.x, claim.z + 5),
    build("sentry_beacon", claim.x, claim.z + 4),
    build("sentry_beacon", claim.x + 5, claim.z),
    build("sentry_beacon", claim.x - 5, claim.z),
    build("boiler_house", claim.x, claim.z),
  ];
  return frontierOrders(view, station, desired, { repairPct: 78, harvestBursts: 18 });
}

function frontierOrders(view, station, desired, options) {
  const now = view.now ?? {};
  const orders = [];
  const edge = now.threats?.edge;
  if (options.explicitBlast !== false && (now.threats?.alive ?? 0) > 0 && (now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: "BLAST_AT", pos: blastPoint(view, edge) });
  }
  orders.push({ verb: "SET_WEAPON", weapon: options.weapon ?? "rig" });
  if (options.repairPct != null && shouldRepairNow(view, options.repairPct)) {
    orders.push({ verb: "REPAIR_UNDER", pct: options.repairPct });
  }

  const missing = desired.filter((target) => isBuildable(view, target.what) && !hasWorkNear(now.works?.entries, target));
  const plannedCounts = new Map();
  const seams = activeSeams(view, station);
  const combatPos = options.kite ? kitePoint(view, station) : station;
  if (((now.threats?.alive ?? 0) > 0 && now.threats?.state === "active") || (now.needsRider && (now.threats?.alive ?? 0) > 0) || ((now.hero?.hp ?? 100) < 50 && (now.threats?.alive ?? 0) > 0) || (options.kite && (now.threats?.alive ?? 0) >= 10)) {
    orders.push({ verb: "MOVE_TO", pos: combatPos });
    for (const target of combatBuilds(view, missing, station)) {
      if (orders.length >= 31) break;
      const plannedIndex = plannedCounts.get(target.what) ?? countWorks(now.works?.entries, target.what);
      plannedCounts.set(target.what, plannedIndex + 1);
      orders.push({ verb: "MOVE_TO", pos: nearBuild(target.where, station) });
      orders.push({ verb: "BUILD", what: target.what, where: target.where, when: { goldGte: costFor(view, target.what, plannedIndex) } });
    }
    orders.push({ verb: "HOLD", pos: combatPos });
    return orders.slice(0, 32);
  }

  const harvestBursts = Math.max(options.harvestBursts, missing.length * 3);
  const planned = [];
  const harvests = harvestQueue(seams);
  if (options.kite) orders.push({ verb: "FALLBACK_IF", threat: { enemiesGte: 8 }, pos: combatPos });

  for (let i = 0; i < harvestBursts && planned.length < 24; i += 1) {
      const seam = harvests[i % Math.max(harvests.length, 1)];
      if (seam) planned.push({ verb: "HARVEST", seam: seam.id });
      if (options.repairRoute && i % 4 === 1) {
        const repairTarget = repairTargets(view, options.repairRoute, station)[Math.floor(i / 4)];
        if (repairTarget) {
          planned.push({ verb: "MOVE_TO", pos: nearBuild(repairTarget.position, station) });
          planned.push({ verb: "REPAIR_UNDER", pct: 100 });
        }
      }
      if (i % 2 === 1) {
      const target = missing[Math.floor(i / 2)];
      if (target) {
        const plannedIndex = plannedCounts.get(target.what) ?? countWorks(now.works?.entries, target.what);
        plannedCounts.set(target.what, plannedIndex + 1);
        planned.push({ verb: "MOVE_TO", pos: nearBuild(target.where, station) });
        planned.push({ verb: "BUILD", what: target.what, where: target.where, when: { goldGte: costFor(view, target.what, plannedIndex) } });
      }
    }
  }

  for (const order of planned) {
    if (orders.length >= 31) break;
    orders.push(order);
  }
  orders.push({ verb: "HOLD", pos: station });
  return orders.slice(0, 32);
}

function shouldRepairNow(view) {
  const gold = view.now?.gold ?? 0;
  if (gold < 8) return false;
  const here = view.now?.prospector ?? view.now?.hero ?? { x: 0, z: 0 };
  return (view.now?.works?.entries ?? []).some((entry) => {
    const pos = entry.position ?? entry.pos ?? entry.where ?? entry;
    return (entry.hp ?? 0) < (entry.maxHp ?? 0) && dist(here, pos) <= 5;
  });
}

function repairTargets(view, id, station) {
  return (view.now?.works?.entries ?? [])
    .filter((entry) => entry.id === id && (entry.hp ?? 0) < (entry.maxHp ?? 0) && entry.position)
    .sort((a, b) => dist(a.position, station) - dist(b.position, station))
    .slice(0, 4);
}

function combatBuilds(view, missing, station) {
  const gold = view.now?.gold ?? 0;
  const priority = { turret: 5, sentry_beacon: 4, lantern_post: 3, boiler_house: 3, palisade: 2, sluice: 1 };
  return [...missing]
    .sort((a, b) => (priority[b.what] ?? 0) - (priority[a.what] ?? 0))
    .filter((target) => dist(target.where, station) <= 6)
    .filter((target) => costFor(view, target.what) <= gold)
    .slice(0, 2);
}

function nearBuild(where, station) {
  const d = dist(where, station);
  if (d <= 2.5) return station;
  const t = 2.5 / d;
  return {
    x: round2(where.x + (station.x - where.x) * t),
    z: round2(where.z + (station.z - where.z) * t),
  };
}

function build(what, x, z) {
  return { what, where: { x: round2(x), z: round2(z) } };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function isBuildable(view, id) {
  return (view.stablePrefix?.mechanics?.buildables ?? []).some((b) => b.id === id);
}

function countWorks(entries = [], id) {
  return entries.filter((entry) => (entry.id ?? entry.kind ?? entry.what) === id).length;
}

function costFor(view, id, index = countWorks(view.now?.works?.entries, id)) {
  const meta = (view.stablePrefix?.mechanics?.buildables ?? []).find((b) => b.id === id);
  if (!meta) return 10;
  if (meta.costs?.[index] != null) return meta.costs[index];
  const last = meta.costs?.[meta.costs.length - 1] ?? meta.cost ?? 10;
  return last;
}

function hasWorkNear(entries = [], target) {
  return entries.some((entry) => {
    const id = entry.id ?? entry.kind ?? entry.what;
    const pos = entry.position ?? entry.pos ?? entry.where ?? entry;
    return id === target.what && dist(pos, target.where) <= 1.25;
  });
}

function activeSeams(view, point) {
  const seams = (view.now?.seams ?? []).filter((seam) => seam.active && seam.remaining > 0 && typeof seam.x === "number" && typeof seam.z === "number");
  seams.sort((a, b) => dist(a, point) - dist(b, point));
  return seams;
}

function harvestQueue(seams) {
  const out = [];
  for (const seam of seams) {
    const count = Math.max(1, Math.floor((seam.remaining ?? 5) / 5));
    for (let i = 0; i < count; i += 1) out.push(seam);
  }
  return out;
}

function dist(a, b) {
  const ax = a?.x ?? 0;
  const az = a?.z ?? 0;
  const bx = b?.x ?? 0;
  const bz = b?.z ?? 0;
  return Math.hypot(ax - bx, az - bz);
}

function blastPoint(view, edge) {
  const h = view.now?.hero ?? view.now?.prospector ?? { x: 0, z: 0 };
  const gate = gateVector(view, edge, h);
  if (gate) return { x: round2((h.x ?? 0) + gate.x * 8), z: round2((h.z ?? 0) + gate.z * 8) };
  const offsets = {
    north: { x: 0, z: -8 },
    south: { x: 0, z: 8 },
    east: { x: 8, z: 0 },
    west: { x: -8, z: 0 },
  };
  const o = offsets[edge] ?? { x: 0, z: 0 };
  return { x: round2((h.x ?? 0) + o.x), z: round2((h.z ?? 0) + o.z) };
}

function kitePoint(view, station) {
  const h = view.now?.hero ?? view.now?.prospector ?? station;
  const edge = view.now?.threats?.edge;
  const gate = gateVector(view, edge, h);
  if (gate) return { x: round2((h.x ?? station.x) - gate.x * 9), z: round2((h.z ?? station.z) - gate.z * 9) };
  const offsets = {
    north: { x: 0, z: 9 },
    south: { x: 0, z: -9 },
    east: { x: -9, z: 0 },
    west: { x: 9, z: 0 },
  };
  const o = offsets[edge] ?? { x: 0, z: -7 };
  return { x: round2((h.x ?? station.x) + o.x), z: round2((h.z ?? station.z) + o.z) };
}

function gateVector(view, edge, from) {
  if (!edge) return null;
  const gates = (view.stablePrefix?.map?.spawnGates ?? []).filter((gate) => gate.edge === edge && typeof gate.x === "number" && typeof gate.z === "number");
  if (!gates.length) return null;
  const center = gates.reduce((acc, gate) => ({ x: acc.x + gate.x / gates.length, z: acc.z + gate.z / gates.length }), { x: 0, z: 0 });
  const dx = center.x - (from.x ?? 0);
  const dz = center.z - (from.z ?? 0);
  const d = Math.hypot(dx, dz);
  if (!d) return null;
  return { x: dx / d, z: dz / d };
}
