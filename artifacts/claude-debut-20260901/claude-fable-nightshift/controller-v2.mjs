#!/usr/bin/env node
// claude-fable-5 rider controller v2 for e1-night-shift.
// v1 died w23/25: three north-yard builds (turret(5,15), palisade(3,18), stockpile(6,18))
// failed placement forever; each view-replacement re-armed them, so the prospector
// walk-fail-looped all run, starving upgrades, repairs, and panning, with gold pinned
// at the 200 cap from wave 9. v2: failure blacklisting + alternates, upgrades/repairs
// above builds, early stockpiles, and a capped-gold dump into beacons/palisades.
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const seed = process.argv[2] ?? 'e1-night-shift-01';
const tape = process.argv[3] ?? `artifacts/claude-fable-nightshift/${seed}-v2.tape.json`;
const logPath = process.argv[4] ?? `artifacts/claude-fable-nightshift/${seed}-v2-decisions.jsonl`;
writeFileSync(logPath, '');

const CLAIM = { x: 0, z: 12 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (what, w) => `${what}@${w.x},${w.z}`;

// Core ladder: alternates tried after 2 recorded failures of the spot before.
const LADDER = [
  { what: 'sluice', spots: [{ x: 7, z: 7 }, { x: 4, z: 7 }], gold: 40 },
  { what: 'turret', spots: [{ x: 3, z: 8 }, { x: 4, z: 10 }], gold: 50 },
  { what: 'sluice', spots: [{ x: -7, z: 7 }, { x: -4, z: 7 }], gold: 40 },
  { what: 'turret', spots: [{ x: -3, z: 8 }, { x: -4, z: 10 }], gold: 70 },
  { what: 'sentry_beacon', spots: [{ x: 0, z: 7 }, { x: 0, z: 6 }], gold: 25 },
  { what: 'palisade', spots: [{ x: 0, z: 10 }], gold: 10 },
  { what: 'palisade', spots: [{ x: 6, z: 11 }], gold: 10 },
  { what: 'palisade', spots: [{ x: -6, z: 11 }], gold: 10 },
  { what: 'turret', spots: [{ x: -4, z: 14 }, { x: -8, z: 13 }], gold: 95 },
  { what: 'turret', spots: [{ x: 5, z: 15 }, { x: 8, z: 13 }, { x: 2, z: 17 }, { x: -2, z: 5 }], gold: 125 },
  { what: 'stockpile', spots: [{ x: 6, z: 18 }, { x: -3, z: 18 }, { x: 11, z: 10 }, { x: -11, z: 10 }], gold: 60 },
  { what: 'sentry_beacon', spots: [{ x: 0, z: 19 }, { x: -1, z: 20 }], gold: 35 },
  { what: 'stockpile', spots: [{ x: -3, z: 18 }, { x: -11, z: 10 }, { x: 11, z: 10 }, { x: 2, z: 20 }], gold: 60 },
  { what: 'sluice', spots: [{ x: 10, z: 7 }, { x: 4, z: 7 }, { x: -10, z: 7 }, { x: 0, z: 5 }], gold: 40 },
];
// Capped-gold dumps (only when flush): more beacons, then ablative palisades.
const BEACON_DUMP = [{ x: 8, z: 9 }, { x: -8, z: 9 }, { x: 3, z: 20 }, { x: -5, z: 19 }];
const PALISADE_DUMP = [
  { x: 2, z: 20 }, { x: -2, z: 20 }, { x: 8, z: 15 }, { x: -8, z: 15 },
  { x: 4, z: 6 }, { x: -4, z: 6 }, { x: 9, z: 12 }, { x: -9, z: 12 },
];

const PREF_UPGRADES = ['prospectors_luck', 'beacon_dynamo', 'tinkers_plating', 'field_dressing', 'double_tap_coil', 'quick_fuse'];
const BAD_UPGRADES = ['pan_legend', 'spring_heels'];
const LANTERNS = [
  { x: 0, z: 16 }, { x: -16, z: 18 }, { x: 16, z: 18 },
  { x: -22, z: -12 }, { x: 22, z: -12 }, { x: -10, z: -24 }, { x: 10, z: -24 },
];

let lanternDemolishAllowed = null;
const buildFails = new Map(); // key(what@x,z) -> failure count
const spotCursor = new Map(); // ladder row index -> current spot index
const dumpFails = new Map();

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
    if (line.includes('rejected orders')) send(fallbackOrders());
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

function send(orders) { child.stdin.write(JSON.stringify(orders) + '\n'); }

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

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // Learn from failed records BEFORE composing (log every failure reason once).
  for (const r of now.orders ?? []) {
    if (r.status !== 'failed') continue;
    const o = r.order ?? r;
    if (o.verb === 'BUILD' && o.where) {
      const k = key(o.what, o.where);
      const n = (buildFails.get(k) ?? 0) + 1;
      buildFails.set(k, n);
      if (n <= 2) appendFileSync(logPath, JSON.stringify({ failed: k, n, reason: r.reason }) + '\n');
    } else if (o.verb === 'CONTEXT_ACTION') {
      appendFileSync(logPath, JSON.stringify({ failedCtx: o.action, target: o.target, reason: r.reason }) + '\n');
      if (o.action === 'upgrade' && o.target) {
        const k = `up:${o.target.id}:${o.target.index}`;
        dumpFails.set(k, (dumpFails.get(k) ?? 0) + 1);
      }
    }
  }
  const blocked = (what, w) => (buildFails.get(key(what, w)) ?? 0) >= 2;

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    let pick = PREF_UPGRADES.find((p) => ids.includes(p));
    if (!pick) pick = ids.find((i) => !BAD_UPGRADES.includes(i));
    if (!pick) pick = ids[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick });
  }
  if (wave >= 6 && now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const entries = now.works?.entries ?? [];
  const lanternWrecks = entries.filter((e) => e.id === 'lantern_post' && e.wrecked
    && LANTERNS.some((L) => dist(L, e.position) < 1.0));
  if (lanternDemolishAllowed === null && wave >= 1) {
    lanternDemolishAllowed = !lanternWrecks.some((e) => dist(e.position, LANTERNS[0]) < 1.0);
    appendFileSync(logPath, JSON.stringify({ note: 'lantern demolish probe', allowed: lanternDemolishAllowed }) + '\n');
  }

  if (wave === 0) {
    const t = lanternWrecks.find((e) => dist(e.position, LANTERNS[0]) < 1.0);
    if (t) {
      orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: 'lantern_post', index: t.index } });
    }
  }

  // Tier upgrades: ABOVE builds so a failing build can never starve them.
  // Stockpiles raise the cap, so turret t2 from wave 10, sluice t2 from wave 6.
  const tierTargets = [];
  if (wave >= 6) for (const e of entries) {
    if (e.id === 'sluice' && e.tier === 1 && !e.wrecked) tierTargets.push({ e, cost: 120 });
  }
  if (wave >= 10) for (const e of entries) {
    if (e.id === 'turret' && e.tier === 1 && !e.wrecked) tierTargets.push({ e, cost: 150 });
  }
  if (wave >= 15) for (const e of entries) {
    if (e.id === 'turret' && e.tier === 2 && !e.wrecked) tierTargets.push({ e, cost: 300 });
  }
  const affordable = tierTargets.find((t) => gold >= t.cost + 30
    && (dumpFails.get(`up:${t.e.id}:${t.e.index}`) ?? 0) < 3);
  if (affordable && wave >= 1) {
    orders.push({ verb: 'MOVE_TO', pos: { x: affordable.e.position.x, z: affordable.e.position.z } });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: affordable.e.id, index: affordable.e.index } });
  }

  // Standing repair above builds once the lantern trap is cleared.
  if (lanternDemolishAllowed && lanternWrecks.length === 0 && wave >= 4) {
    const hurt = entries.some((e) => e.maxHp > 0 && (e.wrecked || e.hp / e.maxHp < 0.5));
    if (hurt) orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
  }

  // Ladder builds with blacklist-driven alternates (send up to 3).
  const claimed = new Set(); // avoid two ladder rows resolving to one existing work
  const resolveSpot = (row, idx) => {
    let cursor = spotCursor.get(idx) ?? 0;
    while (cursor < row.spots.length && blocked(row.what, row.spots[cursor])) cursor += 1;
    spotCursor.set(idx, cursor);
    return row.spots[cursor];
  };
  const pending = [];
  for (let i = 0; i < LADDER.length; i++) {
    const row = LADDER[i];
    // Row satisfied if any spot has a live matching work not claimed by an earlier row.
    const hit = row.spots.map((s) => entries.find((e) => e.id === row.what && dist(e.position, s) < 1.2
      && !claimed.has(`${e.id}:${e.index}`))).find(Boolean);
    if (hit) { claimed.add(`${hit.id}:${hit.index}`); continue; }
    const spot = resolveSpot(row, i);
    if (spot) pending.push({ what: row.what, where: spot, gold: row.gold });
  }
  for (const w of pending.slice(0, 3)) {
    orders.push({ verb: 'BUILD', what: w.what, where: w.where, when: { goldGte: w.gold } });
  }

  // Capped-gold dump: when flush and the core ladder is done, add beacons then palisades.
  if (pending.length === 0 && gold >= 150) {
    const beaconCount = entries.filter((e) => e.id === 'sentry_beacon').length;
    const nextBeacon = BEACON_DUMP.find((s) => !blocked('sentry_beacon', s)
      && !entries.some((e) => e.id === 'sentry_beacon' && dist(e.position, s) < 1.2));
    if (beaconCount < 6 && nextBeacon) {
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: nextBeacon, when: { goldGte: 95 } });
    } else {
      const nextPal = PALISADE_DUMP.find((s) => !blocked('palisade', s)
        && !entries.some((e) => e.id === 'palisade' && dist(e.position, s) < 1.2));
      if (nextPal) orders.push({ verb: 'BUILD', what: 'palisade', where: nextPal, when: { goldGte: 10 } });
    }
  }

  // Lantern demolition chain fills quiet stretches (waves 1-8).
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

  // Harvest block: nearest active seams to the claim.
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
