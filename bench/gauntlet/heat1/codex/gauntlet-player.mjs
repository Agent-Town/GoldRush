#!/usr/bin/env node

// Gauntlet player — read from sim (stdin), write orders (stdout).
import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

async function play() {
  let outcome = null;
  
  for await (const line of rl) {
    let view;
    try {
      view = JSON.parse(line);
    } catch {
      process.stderr.write('Bad JSON from sim: ' + line.slice(0, 80) + '\n');
      process.exit(1);
    }
    
    // Check if this is the final outcome line
    if (view.secured !== undefined || view.eventLogHash !== undefined) {
      outcome = view;
      process.stderr.write(`\n=== OUTCOME: secured=${outcome.secured} waves=${outcome.waves} gold=${outcome.gold} kills=${outcome.kills} timeMs=${outcome.timeMs}\n`);
      break;
    }
    
    if (view.schema !== 'goldrush.view.v1') {
      process.stderr.write('Unexpected schema: ' + view.schema + '\n');
      continue;
    }
    
    const now = view.now;
    const wave = now.wave;
    const gold = now.gold;
    const hero = now.hero;
    const alive = now.threats.alive;
    const byKind = now.works.byKind;
    const seams = now.seams;
    const needsRider = now.needsRider;
    
    process.stderr.write(`W${wave} g=${gold} hp=${hero.hp}/${hero.maxHp} en=${alive} stands=${now.works.standing} state=${now.threats.state} rider=${needsRider}\n`);
    
    const orders = [];
    
    // --- HARVEST active seams ---
    for (const s of seams) {
      if (s.active) {
        orders.push({ verb: "HARVEST", seam: s.id });
      }
    }
    
    // --- BUILD infrastructure ---
    const sluiceCount = byKind.sluice || 0;
    const palisadeCount = byKind.palisade || 0;
    const sentryCount = byKind.sentry_beacon || 0;
    const turretCount = byKind.turret || 0;
    const stockpileCount = byKind.stockpile || 0;
    
    // Sluices on river line (z=0)
    const sluicePositions = [{ x: -6, z: 0 }, { x: 6, z: 0 }];
    for (let i = sluiceCount; i < sluicePositions.length; i++) {
      orders.push({ verb: "BUILD", what: "sluice", where: sluicePositions[i], when: { goldGte: 40 } });
    }
    
    // Palisade wall south of claim (toward river)
    const paliSpots = [
      { x: -2, z: 9 }, { x: 2, z: 9 },
      { x: -2, z: 6 }, { x: 2, z: 6 },
      { x: -1, z: 3 }, { x: 1, z: 3 },
      { x: -3, z: 12 }, { x: 3, z: 12 },
      { x: -4, z: 10 }, { x: 4, z: 10 },
    ];
    for (let i = palisadeCount; i < paliSpots.length; i++) {
      orders.push({ verb: "BUILD", what: "palisade", where: paliSpots[i], when: { goldGte: 10 } });
    }
    
    // Sentry beacons for fire support
    const sentrySpots = [
      { x: 0, z: 14 }, { x: -4, z: 10 }, { x: 4, z: 10 },
    ];
    for (let i = sentryCount; i < sentrySpots.length; i++) {
      const cost = Math.ceil(25 * Math.pow(1.3, i));
      orders.push({ verb: "BUILD", what: "sentry_beacon", where: sentrySpots[i], when: { goldGte: cost } });
    }
    
    // Turrets
    const turretSpots = [
      { x: -1, z: 12 }, { x: 1, z: 12 },
    ];
    for (let i = turretCount; i < turretSpots.length; i++) {
      const cost = Math.ceil(50 * Math.pow(1.35, i));
      orders.push({ verb: "BUILD", what: "turret", where: turretSpots[i], when: { goldGte: cost } });
    }
    
    // REPAIR if damaged
    if (now.works.hp > 0 && now.works.maxHp > 0) {
      const pct = Math.round((now.works.hp / now.works.maxHp) * 100);
      if (pct < 60) {
        orders.push({ verb: "REPAIR_UNDER", pct: 60 });
      }
    }
    
    // FALLBACK if hero low
    if (hero.hp < 40) {
      orders.push({ verb: "FALLBACK_IF", threat: { enemiesGte: 3 }, pos: { x: 0, z: 12 } });
    }
    
    // MOVE to defensive position near claim but closer to river
    orders.push({ verb: "MOVE_TO", pos: { x: 0, z: 8 } });
    
    // Persistent hold at that position
    orders.push({ verb: "HOLD", pos: { x: 0, z: 8 } });
    
    process.stdout.write(JSON.stringify(orders) + '\n');
  }
  
  if (!outcome) {
    process.stderr.write('No outcome received from sim\n');
    process.exit(1);
  }
}

play().catch(e => { process.stderr.write('Player error: ' + e.stack + '\n'); process.exit(1); });
