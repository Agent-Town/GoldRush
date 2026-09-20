#!/usr/bin/env node
// Claude Fable 5 — gen 6 controller for e1-dry-gulch (E1, secureWave 20, all-edge spawns).
// Deterministic standing-orders policy over the gr-sim NDJSON door.
// Usage: node controller.mjs <tape-path> [--weapon rig|blast] [--label name]
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { writeFileSync, appendFileSync } from 'node:fs';

const WS = '/tmp/heat11-5e7a7c0b/artifacts/heat11/fable/e1-dry-gulch';
const REPO = '/private/tmp/heat11-5e7a7c0b';
const tapePath = process.argv[2] ?? `${WS}/tune-untitled.json`;
const weaponArg = process.argv.includes('--weapon') ? process.argv[process.argv.indexOf('--weapon') + 1] : 'rig';
const label = process.argv.includes('--label') ? process.argv[process.argv.indexOf('--label') + 1] : 'run';
const logPath = `${WS}/${label}-log.txt`;
writeFileSync(logPath, `# ${label} weapon=${weaponArg} tape=${tapePath}\n`);
const log = (s) => appendFileSync(logPath, s + '\n');

// --- The plan -----------------------------------------------------------
// Claim/hero at (0,12). Enemies from all four edges converge on the hero.
// Fort: 4 turrets ringing the hero (16wu range covers every approach),
// beacons to slow, stockpiles late for score. Sluices skipped: the lone
// spring is at (-18,-18), 34wu from the fort — dead ground with 4-edge spawns.
// Each entry: kind, gate (goldGte), candidate sites (fallbacks on collision).
const PLAN = [
  { key: 'T1', kind: 'turret', gate: 50, sites: [{ x: 3, z: 8.5 }, { x: 4.5, z: 9 }, { x: 3, z: 7 }] },
  { key: 'B1', kind: 'sentry_beacon', gate: 25, sites: [{ x: 0, z: 8 }, { x: -1.5, z: 7.5 }, { x: 1.5, z: 6.5 }] },
  { key: 'T2', kind: 'turret', gate: 70, sites: [{ x: -3, z: 15.5 }, { x: -4.5, z: 15 }, { x: -3, z: 17 }] },
  { key: 'T3', kind: 'turret', gate: 95, sites: [{ x: -3, z: 8.5 }, { x: -4.5, z: 9 }, { x: -3, z: 7 }] },
  { key: 'T4', kind: 'turret', gate: 125, sites: [{ x: 3, z: 15.5 }, { x: 4.5, z: 15 }, { x: 3, z: 17 }] },
  { key: 'B2', kind: 'sentry_beacon', gate: 35, sites: [{ x: 0, z: 16 }, { x: 1.5, z: 16.5 }, { x: -1.5, z: 17 }] },
  { key: 'B3', kind: 'sentry_beacon', gate: 45, sites: [{ x: -6, z: 12 }, { x: -6.5, z: 10.5 }, { x: -7, z: 13 }] },
  { key: 'B4', kind: 'sentry_beacon', gate: 55, sites: [{ x: 6, z: 12 }, { x: 6.5, z: 10.5 }, { x: 7, z: 13 }] },
  { key: 'S1', kind: 'stockpile', gate: 150, sites: [{ x: 0, z: 19 }, { x: 2, z: 19.5 }, { x: -2, z: 19.5 }] },
  { key: 'S2', kind: 'stockpile', gate: 150, sites: [{ x: 0, z: 5 }, { x: 2, z: 4.5 }, { x: -2, z: 4.5 }] },
];
const PICK_PREFS = ['prospectors_luck', 'beacon_dynamo', 'tinkers_plating'];
const HOME = { x: 0, z: 10 };

const state = {
  done: new Set(),       // plan keys confirmed built
  siteIdx: new Map(),    // plan key -> current candidate index
  gateBump: new Map(),   // plan key -> raised gate after insufficient_gold
  weaponSet: false,
  views: 0,
  sent: 0,
  lastRejectKey: null,
};

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function currentSite(entry) {
  const idx = state.siteIdx.get(entry.key) ?? 0;
  return entry.sites[Math.min(idx, entry.sites.length - 1)];
}

function buildOrderFor(entry) {
  const site = currentSite(entry);
  const gate = state.gateBump.get(entry.key) ?? entry.gate;
  return { verb: 'BUILD', what: entry.kind, where: { x: site.x, z: site.z }, when: { goldGte: gate } };
}

// Reconcile plan against the view: which builds landed, which failed and why.
function reconcile(view) {
  const byKind = view.now.works?.byKind ?? {};
  const counts = {};
  for (const entry of PLAN) {
    if (state.done.has(entry.key)) { counts[entry.kind] = (counts[entry.kind] ?? 0) + 1; }
  }
  // Mark plan entries done in order until kind counts match the world.
  for (const entry of PLAN) {
    if (state.done.has(entry.key)) continue;
    const worldCount = byKind[entry.kind] ?? 0;
    const claimed = counts[entry.kind] ?? 0;
    if (claimed < worldCount) {
      state.done.add(entry.key);
      counts[entry.kind] = claimed + 1;
    }
  }
  // Read failures from the accepted-orders snapshot.
  for (const rec of view.now.orders ?? []) {
    const o = rec.order ?? rec;
    if ((o.verb ?? rec.verb) !== 'BUILD' || rec.status !== 'failed') continue;
    const what = o.what ?? rec.what; const where = o.where ?? rec.where;
    const entry = PLAN.find((p) => !state.done.has(p.key) && p.kind === what
      && Math.abs(currentSite(p).x - where.x) < 0.01 && Math.abs(currentSite(p).z - where.z) < 0.01);
    if (!entry) continue;
    const reason = String(rec.reason ?? rec.detail ?? '');
    if (/insufficient_gold/i.test(reason)) {
      const costs = view.stablePrefix.mechanics.buildables.find((b) => b.id === entry.kind)?.costs ?? [];
      const count = view.now.works?.byKind?.[entry.kind] ?? 0;
      const next = costs[Math.min(count, costs.length - 1)] ?? entry.gate;
      state.gateBump.set(entry.key, Math.max(next, entry.gate) + 10);
      log(`  gate-bump ${entry.key} -> ${state.gateBump.get(entry.key)} (${reason.slice(0, 80)})`);
    } else if (/collision|out_of_zone|UNREACHABLE|out_of_reach/i.test(reason)) {
      const idx = (state.siteIdx.get(entry.key) ?? 0) + 1;
      state.siteIdx.set(entry.key, idx);
      log(`  site-shift ${entry.key} -> candidate ${idx} (${reason.slice(0, 80)})`);
    }
  }
}

function decide(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    let pick = PICK_PREFS.find((p) => ids.includes(p));
    if (!pick) pick = ids.find((id) => /rig|damage|blast/i.test(id)) ?? ids[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick });
    log(`  draft: offered [${ids.join(', ')}] -> ${pick}`);
  }
  if (!state.weaponSet && weaponArg === 'blast') {
    orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
    state.weaponSet = true;
  }
  for (const entry of PLAN) {
    if (state.done.has(entry.key)) continue;
    if ((state.siteIdx.get(entry.key) ?? 0) >= entry.sites.length) continue; // exhausted
    orders.push(buildOrderFor(entry));
  }
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
  // Harvest priority: nearest active seam to the prospector, rest as fallbacks.
  const pos = now.prospector ?? HOME;
  const active = (now.seams ?? []).filter((s) => s.active && s.x != null)
    .sort((a, b) => dist(pos, a) - dist(pos, b));
  for (const seam of active.slice(0, 4)) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'HOLD', pos: HOME });
  return orders.slice(0, 32);
}

// --- Transport ----------------------------------------------------------
const child = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'e1-dry-gulch-01',
  '--difficulty', 'trail', '--tape', tapePath,
], { cwd: REPO, stdio: ['pipe', 'pipe', 'pipe'] });

let outcome = null;
const stderrTail = [];
createInterface({ input: child.stderr }).on('line', (l) => {
  stderrTail.push(l); if (stderrTail.length > 40) stderrTail.shift();
  if (/rejected orders/.test(l)) log(`STDERR ${l}`);
});

createInterface({ input: child.stdout }).on('line', (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { log(`UNPARSED: ${line.slice(0, 200)}`); return; }
  if (msg.schema === 'goldrush.view.v1') {
    state.views += 1;
    const n = msg.now;
    const key = `${n.wave}:${n.timers?.runSeconds}`;
    log(`view ${state.views}: wave=${n.wave} t=${n.timers?.runSeconds} gold=${n.gold} heroHp=${n.hero?.hp} works=${n.works?.standing} alive=${n.threats?.alive} offer=${n.pendingOffer ? 'Y' : '-'} secure=${n.pendingSecure ? 'Y' : '-'}`);
    reconcile(msg);
    let answer;
    if (state.lastRejectKey === key) {
      // Same instant re-served: our last array was rejected. Degrade safely.
      answer = n.pendingSecure ? [{ verb: 'SECURE_CHOICE', choice: 'bank' }] : [{ verb: 'HOLD', pos: HOME }];
      log('  degrade: resend minimal set after rejection');
    } else {
      answer = decide(msg);
    }
    state.lastRejectKey = key;
    state.sent += 1;
    child.stdin.write(JSON.stringify(answer) + '\n');
  } else if ('secured' in msg) {
    outcome = msg;
    log(`OUTCOME ${JSON.stringify(msg)}`);
  }
});

child.on('close', (code) => {
  const summary = { label, weapon: weaponArg, tape: tapePath, exit: code, views: state.views, sent: state.sent, outcome };
  writeFileSync(`${WS}/${label}-summary.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
  if (!outcome) console.error('NO OUTCOME; stderr tail:\n' + stderrTail.join('\n'));
});
