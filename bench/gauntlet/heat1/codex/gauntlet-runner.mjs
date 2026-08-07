#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const simPath = resolve(__dirname, 'scripts/gr-sim.mjs');

// ALL possible builds sorted by cost DESCENDING. 
// In each submission, we include every unbuilt one in this order.
// Most expensive (stockpile 60g) checks first, cheapest (palisade 10g) last.
// This means expensive fires when gold is high, cheap only when nothing expensive needs gold.
const ALL_BUILDS = [
  { what: 'stockpile',      where: { x: 0, z: 16 },   cost: 60, key: 'stockpile' },
  { what: 'turret',         where: { x: 0, z: 12.5 },  cost: 50, key: 'turret' },
  { what: 'turret',         where: { x: -3, z: 10 },   cost: 68, key: 'turret' },
  { what: 'sluice',         where: { x: -6, z: 7 },    cost: 40, key: 'sluice' },
  { what: 'sluice',         where: { x: 0, z: 7 },     cost: 40, key: 'sluice' },
  { what: 'sluice',         where: { x: 6, z: 7 },     cost: 40, key: 'sluice' },
  { what: 'sentry_beacon',  where: { x: 0, z: 14 },    cost: 25, key: 'sentry_beacon' },
  { what: 'sentry_beacon',  where: { x: -4, z: 10 },   cost: 33, key: 'sentry_beacon' },
  { what: 'sentry_beacon',  where: { x: 4, z: 10 },    cost: 42, key: 'sentry_beacon' },
  { what: 'palisade',       where: { x: -2, z: 14.5 }, cost: 10, key: 'palisade' },
  { what: 'palisade',       where: { x: 2, z: 14.5 },  cost: 10, key: 'palisade' },
  { what: 'palisade',       where: { x: -2, z: 9.5 },  cost: 10, key: 'palisade' },
  { what: 'palisade',       where: { x: 2, z: 9.5 },   cost: 10, key: 'palisade' },
  { what: 'palisade',       where: { x: -3.5, z: 12 }, cost: 10, key: 'palisade' },
  { what: 'palisade',       where: { x: 3.5, z: 12 },  cost: 10, key: 'palisade' },
];

function makeOrders(now) {
  const bk = now.works.byKind || {};
  const seams = now.seams;
  const orders = [];

  // Track how many of each type we've built (starting index)
  const counts = {};
  for (const b of ALL_BUILDS) counts[b.key] = (counts[b.key] || 0) + 1;

  // Filter to only unbuilt ones, in original cost-descending order
  const builtCounts = {};
  for (const b of ALL_BUILDS) {
    builtCounts[b.key] = (builtCounts[b.key] || 0);
    if ((bk[b.key] || 0) > builtCounts[b.key]) {
      builtCounts[b.key] += 1;
    }
  }

  const pending = ALL_BUILDS.filter(b => {
    const used = builtCounts[b.key] || 0;
    // Count how many of this type we've already used in pending list
    return false; // will rebuild properly
  });

  // Simpler: check each build in cost-descending order, include if not built
  const builtTracker = {};
  for (const b of ALL_BUILDS) {
    const have = bk[b.key] || 0;
    const included = builtTracker[b.key] || 0;
    if (included < have) {
      builtTracker[b.key] = included + 1;
    } else {
      // This one isn't built yet
      orders.push({ verb: 'BUILD', what: b.what, where: b.where, when: { goldGte: b.cost } });
      builtTracker[b.key] = (builtTracker[b.key] || 0) + 1;
    }
  }

  // HARVEST active seams
  for (const s of seams) if (s.active) orders.push({ verb: 'HARVEST', seam: s.id });

  return orders;
}

async function runOnce() {
  return new Promise((resolve) => {
    const sim = spawn('node', [simPath, '--contract', 'the-claim', '--seed', 'e1-the-claim-02'], {
      stdio: ['pipe', 'pipe', 'pipe'], cwd: __dirname,
    });

    let buf = '', outcome = null, lastWave = -1;

    sim.stdout.on('data', (d) => {
      buf += d.toString();
      while (buf.includes('\n')) {
        const i = buf.indexOf('\n');
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line) continue;
        let v;
        try { v = JSON.parse(line); } catch { continue; }
        if (v.secured !== undefined) { outcome = v; sim.stdin.end(); return; }
        if (v.schema !== 'goldrush.view.v1') continue;

        const n = v.now;
        if (n.wave !== lastWave) {
          lastWave = n.wave;
          const bk = n.works.byKind || {};
          const ks = Object.entries(bk).map(e => `${e[0]}:${e[1]}`).join(',') || '.';
          process.stderr.write(`W${n.wave} g=${n.gold} hp=${n.hero.hp}/${n.hero.maxHp} en=${n.threats.alive} w=${n.works.standing} [${ks}]\n`);
        }
        sim.stdin.write(JSON.stringify(makeOrders(n)) + '\n');
      }
    });

    sim.stderr.on('data', (d) => { const m = d.toString(); if (m.includes('rejected')) process.stderr.write('REJ: ' + m); });
    sim.on('exit', () => {
      if (outcome) resolve(outcome);
      else { try { resolve(JSON.parse(buf.trim().split('\n').filter(Boolean).pop()||'{}')); } catch { resolve({secured:false,waves:0,gold:0,kills:0,timeMs:0}); } }
    });
    sim.on('error', () => resolve({secured:false,waves:0,gold:0,kills:0,timeMs:0}));
  });
}

for (let i = 1; i <= 10; i++) {
  process.stderr.write(`\n=== ATTEMPT ${i} ===\n`);
  const r = await runOnce();
  process.stderr.write(`RESULT: secured=${r.secured} waves=${r.waves} gold=${r.gold} kills=${r.kills} timeMs=${r.timeMs}\n`);
  if (r.secured) {
    process.stdout.write(JSON.stringify(r) + '\n'); process.exit(0);
  }
}
process.stdout.write(JSON.stringify({secured:false,waves:0,gold:0,kills:0,timeMs:0}) + '\n');
process.exit(1);
