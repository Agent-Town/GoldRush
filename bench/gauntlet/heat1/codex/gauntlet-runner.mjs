#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simPath = resolve(__dirname, 'scripts/gr-sim.mjs');

// Track built state across views
let built = { sentry: 0, sluice: 0, turret: 0, stockpile: 0, palisade: 0 };

function makeOrders(now) {
  const gold = now.gold;
  const hero = now.hero;
  const bk = now.works.byKind || {};
  const seams = now.seams;

  // Sync our tracker with actual state
  const have = {
    sentry: bk.sentry_beacon || 0,
    sluice: bk.sluice || 0,
    turret: bk.turret || 0,
    stockpile: bk.stockpile || 0,
    palisade: bk.palisade || 0,
  };

  const orders = [];

  // Build plan - only ONE build at a time
  // Priority: turret (early defense), sluice (income), sentry (cheap defense)
  const plan = [
    { target: 'turret', count: 1, what: 'turret', where: { x: 0, z: 12.5 }, cost: 50 },
    { target: 'turret', count: 2, what: 'turret', where: { x: -3, z: 10 }, cost: 70 },
    { target: 'sentry', count: 1, what: 'sentry_beacon', where: { x: 0, z: 14 }, cost: 25 },
    { target: 'sluice', count: 1, what: 'sluice', where: { x: -6, z: 5.5 }, cost: 40 },
    { target: 'sentry', count: 2, what: 'sentry_beacon', where: { x: -4, z: 10 }, cost: 35 },
    { target: 'sluice', count: 2, what: 'sluice', where: { x: 0, z: 5.5 }, cost: 40 },
    { target: 'sentry', count: 3, what: 'sentry_beacon', where: { x: 4, z: 10 }, cost: 45 },
    { target: 'sluice', count: 3, what: 'sluice', where: { x: 6, z: 5.5 }, cost: 40 },
    { target: 'stockpile', count: 1, what: 'stockpile', where: { x: 0, z: 16 }, cost: 60 },
    { target: 'palisade', count: 1, what: 'palisade', where: { x: -2, z: 14.5 }, cost: 10 },
    { target: 'palisade', count: 2, what: 'palisade', where: { x: 2, z: 14.5 }, cost: 10 },
    { target: 'palisade', count: 3, what: 'palisade', where: { x: -2, z: 10 }, cost: 10 },
    { target: 'palisade', count: 4, what: 'palisade', where: { x: 2, z: 10 }, cost: 10 },
  ];

  // Find first unbuilt
  let nb = null;
  for (const p of plan) {
    if ((have[p.target] || 0) < p.count) { nb = p; break; }
  }

  if (nb) {
    orders.push({ verb: 'BUILD', what: nb.what, where: nb.where, when: { goldGte: nb.cost } });
  }

  // HARVEST active seams
  for (const s of seams) if (s.active) orders.push({ verb: 'HARVEST', seam: s.id });

  // FALLBACK only when hero is very low
  if (hero.hp < 10) orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 3 }, pos: { x: 0, z: 12 } });

  // MOVE to seam area for harvest
  orders.push({ verb: 'MOVE_TO', pos: { x: -9, z: 6.7 } });
  orders.push({ verb: 'HOLD', pos: { x: -9, z: 6.7 } });

  return orders;
}

async function runOnce() {
  return new Promise((resolve) => {
    const sim = spawn('node', [simPath, '--contract', 'the-claim', '--seed', 'e1-the-claim-02'], {
      stdio: ['pipe', 'pipe', 'pipe'], cwd: __dirname,
    });

    let buf = '', outcome = null;

    sim.stdout.on('data', (d) => {
      buf += d.toString();
      while (buf.includes('\n')) {
        const i = buf.indexOf('\n');
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let v;
        try { v = JSON.parse(line); } catch { continue; }
        if (v.secured !== undefined) { outcome = v; sim.stdin.end(); return; }
        if (v.schema !== 'goldrush.view.v1') continue;

        const n = v.now;
        const bk = n.works.byKind || {};
        const ks = Object.entries(bk).map(e => `${e[0]}:${e[1]}`).join(',') || '.';
        process.stderr.write(`W${n.wave} g=${n.gold} hp=${n.hero.hp}/${n.hero.maxHp} en=${n.threats.alive} w=${n.works.standing} [${ks}]\n`);
        sim.stdin.write(JSON.stringify(makeOrders(n)) + '\n');
      }
    });

    sim.stderr.on('data', (d) => {
      const m = d.toString();
      if (m.includes('rejected')) process.stderr.write('REJ: ' + m);
    });

    sim.on('exit', () => {
      if (outcome) resolve(outcome);
      else {
        try { resolve(JSON.parse(buf.trim().split('\n').filter(Boolean).pop() || '{}')); }
        catch { resolve({ secured: false, waves: 0, gold: 0, kills: 0, timeMs: 0 }); }
      }
    });
    sim.on('error', () => resolve({ secured: false, waves: 0, gold: 0, kills: 0, timeMs: 0 }));
  });
}

for (let i = 1; i <= 10; i++) {
  process.stderr.write(`\n=== ATTEMPT ${i} ===\n`);
  built = { sentry: 0, sluice: 0, turret: 0, stockpile: 0, palisade: 0 };
  const r = await runOnce();
  process.stderr.write(`RESULT: secured=${r.secured} waves=${r.waves} gold=${r.gold} kills=${r.kills} timeMs=${r.timeMs}\n`);
  if (r.secured) {
    process.stdout.write(JSON.stringify(r) + '\n');
    process.exit(0);
  }
}

process.stdout.write(JSON.stringify({ secured: false, waves: 0, gold: 0, kills: 0, timeMs: 0 }) + '\n');
process.exit(1);
