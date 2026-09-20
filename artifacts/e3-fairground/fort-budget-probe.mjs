#!/usr/bin/env node

/**
 * THE FORT BUDGET PROBE — how much gold e3-fairground actually costs to hold (2026-08-20).
 *
 * It answers ONE question the public-verb prover could not: given the SAME fort the prover buys
 * (a radius-8 palisade ring plus four sentry beacons) and the SAME upgrade priority, how much
 * income per second does a rider need before the run secures? Balance is UNMODIFIED — the only
 * thing granted is gold, at a fixed rate, which is exactly the quantity under test.
 *
 * MEASURED (both bench seeds, wave ceiling 480s):
 *   0.75 g/s, repair<40%  -> 01 wave 10 unsecured        · 02 wave 12 SECURED (285 gold of repairs)
 *   1.00 g/s, repair<40%  -> 01 wave 12 SECURED (379)    · 02 wave 12 SECURED (379)
 *   1.50 g/s, repair<40%  -> 01 wave 12 SECURED (535)    · 02 wave 12 SECURED (538)
 *   2.00 g/s, repair<100% -> 01 wave 12 SECURED (718)    · 02 wave 12 SECURED (717)
 * In every SECURED row the wheel finished spinning and all three crowds had crossed. So the
 * contract IS securable on unmodified balance: the standing bar is ~320 gold of construction plus
 * ~1 gold/second of repair, and what the prover cannot yet do is EARN that while walking a single
 * Prospector between a seam ring 32 units north and a fort 32 units south.
 *
 * Usage: node artifacts/e3-fairground/fort-budget-probe.mjs
 */

import { createServer } from 'vite';

const ROOT = process.cwd();
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
globalThis.location = new URL('http://gr-sim.local/?debug&contract=e3-fairground');
globalThis.window = { location: globalThis.location };
const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

const P = (x, z, r = 0) => ['palisade', x, z, r];
const B = (x, z) => ['sentry_beacon', x, z, 0];
function ring(radius, step, cz = -30) {
  const plan = [];
  for (let x = -radius; x <= radius; x += step) { plan.push(P(x, cz - radius, 1)); plan.push(P(x, cz + radius, 1)); }
  for (let z = cz - radius + step; z <= cz + radius - step; z += step) { plan.push(P(-radius, z, 0)); plan.push(P(radius, z, 0)); }
  return plan;
}
const PLAN = [...ring(8, 4), B(-4, -26), B(4, -26), B(-4, -34), B(4, -34)];
const PRIORITY = ['tinkers_plating', 'heavy_spark', 'double_tap_coil', 'split_spark', 'beacon_dynamo', 'field_dressing', 'sharpen', 'long_resonator'];
try {
  for (const gps of [0.75, 1, 1.5, 2]) {
    for (const pct of [40, 100]) {
      const row = [];
      for (const seed of ['e3-fairground-01', 'e3-fairground-02']) {
        const sim = new HeadlessContractSim({ contractId: 'e3-fairground', seed, admissionProbe: true });
        for (const [id, x, z, rot] of PLAN) sim.build.placeFree(id, { x, z }, rot ?? 0);
        let granted = 0;
        for (let tick = 0; tick < 30 * 480 && !sim.isTerminal; tick += 1) {
          sim.step();
          const offer = sim.progression.offer;
          if (offer) sim.progression.applyUpgrade(PRIORITY.find((id) => offer.some((d) => d.id === id)) ?? offer[0].id);
          if (tick % 30 === 0) {
            sim.economy.apply({ id: `grant-${tick}`, at: sim.timeAlive, type: 'gold_granted', source: 'debug', amount: gps });
            granted += gps;
            for (const b of sim.build.diagnostics.hp) {
              if (b.wrecked || (b.hp / b.maxHp) * 100 < pct) sim.build.repairBuilding(b.id, b.index, sim.timeAlive, { x: b.position.x, z: b.position.z });
            }
          }
        }
        const f = sim.crowdFlocks.diagnostics;
        const out = sim.isTerminal ? sim.outcome() : { waves: sim.waves.diagnostics.wave, secured: false, gold: sim.economy.gold };
        row.push(`${seed.slice(-2)}:w${String(out.waves).padStart(2)}/${sim.ferrisWheel.diagnostics.spinning ? 'spin' : 'STOP'}/[${f.flocks.map((x) => x.crossings)}]/spend${Math.round(granted - out.gold)}${out.secured ? '/SECURED' : ''}`);
      }
      console.log(`gps=${gps} pct=${pct}  ${row.join('  ')}`);
    }
  }
} finally {
  await vite.close();
}
