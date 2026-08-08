#!/usr/bin/env node

import { createInterface } from 'node:readline';

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

async function play() {
  let outcome = null;
  
  for await (const line of rl) {
    let view;
    try { view = JSON.parse(line); } catch { continue; }
    
    if (view.secured !== undefined) {
      outcome = view;
      break;
    }
    if (view.schema !== 'goldrush.view.v1') continue;
    
    const now = view.now;
    const wave = now.wave;
    const gold = now.gold;
    const hero = now.hero;
    const byKind = now.works.byKind || {};
    const seams = now.seams || [];
    
    process.stderr.write(`W${wave} g=${gold} hp=${hero.hp}/${hero.maxHp} en=${now.threats.alive} st=${now.works.standing}\n`);
    
    const orders = [];
    
    // 1. HARVEST both active seams (they'll auto-respawn)
    for (const s of seams) {
      if (s.active) orders.push({ verb: "HARVEST", seam: s.id });
    }
    
    // 2. BUILD orders - list ALL desired builds, each with goldGte condition
    //    The engine evaluates them each tick; when gold is sufficient, the BUILD fires
    
    // Palisades - cheap wall (10g each, max 48)
    const paliPositions = [
      { x: -2, z: 9.5 }, { x: 2, z: 9.5 },
      { x: -3.5, z: 12 }, { x: 3.5, z: 12 },
      { x: -2, z: 14.5 }, { x: 2, z: 14.5 },
      { x: -4, z: 10.5 }, { x: 4, z: 10.5 },
      { x: -2, z: 6.5 }, { x: 2, z: 6.5 },
      { x: -1, z: 16.5 }, { x: 1, z: 16.5 },
    ];
    const paliCount = byKind.palisade || 0;
    for (let i = paliCount; i < paliPositions.length; i++) {
      orders.push({ verb: "BUILD", what: "palisade", where: paliPositions[i], when: { goldGte: 10 } });
    }
    
    // Sentry beacons (cost: 25, 35, 45, 55, 75, 95 per costs array)
    const sentryPositions = [
      { x: 0, z: 14 },
      { x: -4, z: 10 },
      { x: 4, z: 10 },
      { x: 0, z: 17 },
    ];
    const sentryCosts = [25, 35, 45, 55, 75, 95];
    const sentryCount = byKind.sentry_beacon || 0;
    for (let i = sentryCount; i < sentryPositions.length; i++) {
      orders.push({ verb: "BUILD", what: "sentry_beacon", where: sentryPositions[i], when: { goldGte: sentryCosts[i] || 25 } });
    }
    
    // Sluices (40g each, max 3, river-adjacent z~7)
    const sluicePositions = [
      { x: -6, z: 7 },
      { x: 0, z: 7 },
      { x: 6, z: 7 },
    ];
    const sluiceCount = byKind.sluice || 0;
    for (let i = sluiceCount; i < sluicePositions.length; i++) {
      orders.push({ verb: "BUILD", what: "sluice", where: sluicePositions[i], when: { goldGte: 40 } });
    }
    
    // Stockpile (60g each, max 2, cap bonus +150)
    const stockpileCount = byKind.stockpile || 0;
    if (stockpileCount < 1) {
      orders.push({ verb: "BUILD", what: "stockpile", where: { x: 0, z: 16 }, when: { goldGte: 60 } });
    }
    if (stockpileCount < 2) {
      orders.push({ verb: "BUILD", what: "stockpile", where: { x: 0, z: 18 }, when: { goldGte: 60 } });
    }
    
    // Turrets (cost: 50, 70, 95, 125 per costs array)
    const turretPositions = [
      { x: 0, z: 12.5 },
      { x: -1.5, z: 11 },
      { x: 1.5, z: 11 },
      { x: 0, z: 15 },
    ];
    const turretCosts = [50, 70, 95, 125];
    const turretCount = byKind.turret || 0;
    for (let i = turretCount; i < turretPositions.length; i++) {
      orders.push({ verb: "BUILD", what: "turret", where: turretPositions[i], when: { goldGte: turretCosts[i] || 50 } });
    }
    
    // 3. REPAIR if damaged
    if (now.works.hp > 0 && now.works.maxHp > 0) {
      const pct = Math.round((now.works.hp / now.works.maxHp) * 100);
      if (pct < 40) {
        orders.push({ verb: "REPAIR_UNDER", pct: 70 });
      }
    }
    
    // 4. FALLBACK if hero low
    if (hero.hp < 30) {
      orders.push({ verb: "FALLBACK_IF", threat: { enemiesGte: 3 }, pos: { x: 0, z: 12 } });
    }
    
    // 5. HOLD at defensive position
    orders.push({ verb: "HOLD", pos: { x: 0, z: 12 } });
    
    process.stdout.write(JSON.stringify(orders) + '\n');
  }
  
  process.stderr.write(`Outcome: secured=${outcome?.secured}\n`);
  if (!outcome) process.exit(1);
}

play().catch(e => { process.stderr.write('Error: ' + e.stack + '\n'); process.exit(1); });
