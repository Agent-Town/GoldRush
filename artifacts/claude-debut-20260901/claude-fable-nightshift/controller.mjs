#!/usr/bin/env node
// claude-fable-5 rider controller for e1-night-shift.
// Usage: node controller.mjs <seed> <tapePath> [logPath]
// Spawns gr-sim, answers each view with one standing-orders array.
//
// Strategy v1 (era 5, fresh board):
// - Fort: the-claim proven coordinates transferred (same tile geography, gone dark).
// - Demolish the 7 pre-placed wrecked lanterns early (refund + unlocks REPAIR_UNDER,
//   whose find() picks lanterns first because they head the buildings array).
// - Sluices are the economy (0.6 g/s each); tier-2 them mid-game (1.7x yield).
// - Beacons deny the +18% dark-speed buff near the fort; blast weapon from wave 6.
// - Bank at the wave-25 secure boundary.
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const seed = process.argv[2] ?? 'e1-night-shift-01';
const tape = process.argv[3] ?? `artifacts/claude-fable-nightshift/${seed}-attempt.tape.json`;
const logPath = process.argv[4] ?? `artifacts/claude-fable-nightshift/${seed}-decisions.jsonl`;
writeFileSync(logPath, '');

const CLAIM = { x: 0, z: 12 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Build ladder: strict priority, gate = cost (skipped while unaffordable).
const LADDER = [
  { what: 'sluice', where: { x: 7, z: 7 }, gold: 40 },
  { what: 'turret', where: { x: 3, z: 8 }, gold: 50 },
  { what: 'sluice', where: { x: -7, z: 7 }, gold: 40 },
  { what: 'turret', where: { x: -3, z: 8 }, gold: 70 },
  { what: 'sentry_beacon', where: { x: 0, z: 7 }, gold: 25 },
  { what: 'palisade', where: { x: 0, z: 10 }, gold: 10 },
  { what: 'palisade', where: { x: 6, z: 11 }, gold: 10 },
  { what: 'palisade', where: { x: -6, z: 11 }, gold: 10 },
  { what: 'turret', where: { x: 5, z: 15 }, gold: 95 },
  { what: 'turret', where: { x: -4, z: 14 }, gold: 125 },
  { what: 'sentry_beacon', where: { x: 0, z: 19 }, gold: 35 },
  { what: 'palisade', where: { x: 3, z: 18 }, gold: 10 },
];
// Sluice #3 candidates, tried in order after a failure of the previous.
const SLUICE3 = [{ x: 10, z: 7 }, { x: 4, z: 7 }, { x: -10, z: 7 }, { x: 0, z: 5 }];
// Late luxuries.
const STOCKPILES = [{ x: 6, z: 18 }, { x: -3, z: 18 }];

const PREF_UPGRADES = ['prospectors_luck', 'beacon_dynamo', 'tinkers_plating'];
const BAD_UPGRADES = ['pan_legend', 'spring_heels'];

// Pre-placed lantern coordinates (wrecked at run start). Index 0 is the probe.
const LANTERNS = [
  { x: 0, z: 16 }, { x: -16, z: 18 }, { x: 16, z: 18 },
  { x: -22, z: -12 }, { x: 22, z: -12 }, { x: -10, z: -24 }, { x: 10, z: -24 },
];

let lanternDemolishAllowed = null; // decided solely by the wave-0 probe result
let sluice3Attempt = 0;

const child = spawn('node', [
  'scripts/gr-sim.mjs', '--contract', 'e1-night-shift', '--seed', seed, '--tape', tape,
], { cwd: '/private/tmp/heat8-4675cfd7', stdio: ['pipe', 'pipe', 'pipe'] });

let stderrBuf = '';
child.stderr.on('data', (d) => {
  stderrBuf += d.toString();
  const lines = stderrBuf.split('\n');
  stderrBuf = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    appendFileSync(logPath, JSON.stringify({ stderr: line }) + '\n');
    if (line.includes('rejected orders')) {
      // Fail-safe: install a harvest-only array so the run never stalls on a refusal.
      send(fallbackOrders());
    }
  }
});

let outBuf = '';
child.stdout.on('data', (d) => {
  outBuf += d.toString();
  const lines = outBuf.split('\n');
  outBuf = lines.pop();
  for (const line of lines) {
    if (!line.trim()) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.schema === 'goldrush.view.v1') {
      const orders = decide(msg);
      appendFileSync(logPath, JSON.stringify({
        wave: msg.now?.wave, gold: msg.now?.gold, heroHp: msg.now?.hero?.hp,
        works: msg.now?.works?.standing, threats: msg.now?.threats?.alive, orders,
      }) + '\n');
      send(orders);
    } else if ('secured' in msg) {
      appendFileSync(logPath, JSON.stringify({ outcome: msg }) + '\n');
      console.log('OUTCOME ' + JSON.stringify(msg));
    }
  }
});
child.on('exit', (code) => { console.log('sim exit', code); process.exit(0); });

function send(orders) {
  child.stdin.write(JSON.stringify(orders) + '\n');
}

let cachedSeamTargets = [['gold-seam-2', 8], ['gold-seam-1', 6]];
function fallbackOrders() {
  const out = [];
  for (const [id, n] of cachedSeamTargets) for (let i = 0; i < n; i++) out.push({ verb: 'HARVEST', seam: id });
  return out.slice(0, 32);
}

function decide(view) {
  const now = view.now;
  const wave = now.wave ?? 0;
  const gold = now.gold ?? 0;
  const orders = [];

  // Secure boundary: bank it. Nothing else matters.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // Live draft: pick by preference.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    let pick = PREF_UPGRADES.find((p) => ids.includes(p));
    if (!pick) pick = ids.find((i) => !BAD_UPGRADES.includes(i));
    if (!pick) pick = ids[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick });
  }

  // Weapon: blast from wave 6.
  if (wave >= 6 && now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const entries = now.works?.entries ?? [];
  const lanternWrecks = entries.filter((e) => e.id === 'lantern_post' && e.wrecked
    && LANTERNS.some((L) => dist(L, e.position) < 1.0));

  // Probe verdict: at the first wave-1+ view, the wave-0 target's absence answers it.
  if (lanternDemolishAllowed === null && wave >= 1) {
    lanternDemolishAllowed = !lanternWrecks.some((e) => dist(e.position, LANTERNS[0]) < 1.0);
    appendFileSync(logPath, JSON.stringify({ note: 'lantern demolish probe', allowed: lanternDemolishAllowed }) + '\n');
  }

  // Learn sluice-3 spot failures from the order snapshot.
  for (const r of now.orders ?? []) {
    if (r.status !== 'failed') continue;
    const o = r.order ?? r;
    if (o.verb === 'BUILD' && o.what === 'sluice' && sluice3Attempt < SLUICE3.length
      && Math.abs((o.where?.x ?? 99) - SLUICE3[sluice3Attempt].x) < 0.5
      && Math.abs((o.where?.z ?? 99) - SLUICE3[sluice3Attempt].z) < 0.5) {
      sluice3Attempt += 1;
      appendFileSync(logPath, JSON.stringify({ note: 'sluice3 spot failed', reason: r.reason }) + '\n');
    }
  }

  // Wave 0: probe demolish on the nearest lantern before anything else (gold is 0 anyway).
  if (wave === 0) {
    const t = lanternWrecks.find((e) => dist(e.position, LANTERNS[0]) < 1.0);
    if (t) {
      orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: 'lantern_post', index: t.index } });
    }
  }

  // Builds: next few unbuilt ladder items (existence checked against live works).
  const built = (want) => entries.some((e) => e.id === want.what && dist(e.position, want.where) < 1.2);
  const pendingBuilds = LADDER.filter((w) => !built(w));
  for (const w of pendingBuilds.slice(0, 3)) {
    orders.push({ verb: 'BUILD', what: w.what, where: w.where, when: { goldGte: w.gold } });
  }
  // Sluice #3 at the current candidate spot once both proven sluices exist.
  const sluiceCount = entries.filter((e) => e.id === 'sluice' && !e.wrecked).length;
  if (sluiceCount >= 2 && entries.filter((e) => e.id === 'sluice').length < 3 && sluice3Attempt < SLUICE3.length) {
    orders.push({ verb: 'BUILD', what: 'sluice', where: SLUICE3[sluice3Attempt], when: { goldGte: 40 } });
  }
  // Stockpiles when flush or late.
  const stockCount = entries.filter((e) => e.id === 'stockpile').length;
  if ((gold >= 160 || wave >= 18) && stockCount < 2 && pendingBuilds.length <= 2) {
    orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCKPILES[stockCount], when: { goldGte: 60 } });
  }

  // Tier upgrades (one per view, adjacency via a MOVE_TO ahead of the action).
  const tierTargets = [];
  if (wave >= 7) for (const e of entries) {
    if (e.id === 'sluice' && e.tier === 1 && !e.wrecked) tierTargets.push({ e, cost: 120 });
  }
  if (wave >= 12) for (const e of entries) {
    if (e.id === 'turret' && e.tier === 1 && !e.wrecked && e.position.z <= 9) tierTargets.push({ e, cost: 150 });
  }
  if (wave >= 16) for (const e of entries) {
    if (e.id === 'turret' && e.tier === 1 && !e.wrecked) tierTargets.push({ e, cost: 150 });
  }
  const affordable = tierTargets.find((t) => gold >= t.cost + 40);
  if (affordable && wave >= 1) {
    orders.push({ verb: 'MOVE_TO', pos: { x: affordable.e.position.x, z: affordable.e.position.z } });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: affordable.e.id, index: affordable.e.index } });
  }

  // Lantern demolition chain (below builds/upgrades: it fills gold-poor stretches).
  if (wave >= 1 && wave <= 8 && lanternDemolishAllowed && lanternWrecks.length) {
    const maxHops = wave <= 2 ? 1 : 3;
    const from = { x: now.prospector?.x ?? 0, z: now.prospector?.z ?? 12 };
    const remaining = [...lanternWrecks];
    let cursor = from;
    for (let hop = 0; hop < maxHops && remaining.length; hop++) {
      remaining.sort((a, b) => dist(cursor, a.position) - dist(cursor, b.position));
      const t = remaining.shift();
      orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: 'lantern_post', index: t.index } });
      cursor = t.position;
    }
  }

  // Standing repair — only once every pre-placed lantern is gone.
  if (lanternDemolishAllowed && lanternWrecks.length === 0) {
    const hurt = entries.some((e) => e.maxHp > 0 && (e.wrecked || e.hp / e.maxHp < 0.6));
    if (hurt) orders.push({ verb: 'REPAIR_UNDER', pct: 60 });
  }

  // Harvest block: nearest active seams to the claim, over-asked.
  const active = (now.seams ?? []).filter((s) => s.active && s.x !== null)
    .sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  const targets = [];
  if (active[0]) targets.push([active[0].id, 8]);
  if (active[1]) targets.push([active[1].id, 6]);
  if (targets.length) cachedSeamTargets = targets;
  const room = 32 - orders.length;
  let added = 0;
  for (const [id, n] of targets) {
    for (let i = 0; i < n && added < room; i++) { orders.push({ verb: 'HARVEST', seam: id }); added += 1; }
  }

  return orders.slice(0, 32);
}

setTimeout(() => {
  appendFileSync(logPath, JSON.stringify({ note: 'controller wall timeout' }) + '\n');
  child.kill('SIGKILL');
  process.exit(1);
}, 19 * 60 * 1000);
