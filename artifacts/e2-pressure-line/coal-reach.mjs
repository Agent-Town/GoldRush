#!/usr/bin/env node

/**
 * THE COAL-REACH PROBE (2026-08-21) — diagnostic, never admission evidence.
 *
 * The owner's ruling gives `e2-incline` and `e2-trestle` a pressure line. `PressureSystem.ts:23`
 * puts the three coal seams at three FIXED world positions on every map — they are not contract
 * data — so the first thing a pressure line has to survive on a new map is the plain question:
 * can a body walk to those coordinates at all, and does the boiler burn what it brings back?
 *
 * This probe answers exactly that and nothing else. It boots the sim, buys the hero out of the
 * fight (the same `applyStats`/`heal`/`sparkRig` rig `e2e/er01-e2-census.spec.ts` uses, for the
 * same reason: to take survival out of the measurement), plants two boiler houses by the same
 * `placeFree` seam the census uses, then drives the Prospector to each seam with the PUBLIC `HOLD`
 * verb and reports which seams were cut and how much pressure the boilers made from them.
 *
 * A run that secures proves nothing here. A run that cuts 3/3 seams proves the line is PHYSICALLY
 * REACHABLE — which is a different claim from "the map is winnable", and the two must not be mixed.
 *
 * Usage: node artifacts/e2-pressure-line/coal-reach.mjs [--contract <id>] [--seed <seed>]
 */

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const valueOf = (flag) => (args.indexOf(flag) >= 0 ? args[args.indexOf(flag) + 1] : undefined);
const contractId = valueOf('--contract') ?? 'e2-incline';
const seed = valueOf('--seed') ?? `${contractId}-01`;
const maxTurns = Number(valueOf('--max-turns') ?? 400);

/** Filled from the running sim: `twist.coalSeams` when authored, the module constant otherwise. */
let SEAMS = [];

globalThis.location = new URL(`http://gr-coal-reach.local/?debug&contract=${contractId}&seed=${seed}`);
const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  // Console stays silenced for the whole run — `Game`'s performance-tier banner fires on sim boot
  // and would land in the middle of this probe's one JSON line. The trace uses the raw streams.
  Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });

  const sim = new HeadlessContractSim({ contractId, seed, admissionProbe: true });
  sim.hero.applyStats(100_000, 1);
  sim.hero.heal(100_000);
  const boilers = [-4, 4].map((x) => sim.build.placeFree('boiler_house', { x, z: 12 }, 0));
  SEAMS = sim.pressure.diagnostics.seams.map((seam) => ({ x: seam.x, z: seam.z }));

  let index = 0;
  let dwell = 0;
  let turn = sim.currentTurn();
  let turns = 0;
  const arrivals = [];
  while (!turn.terminal && turns < maxTurns && index < SEAMS.length) {
    const now = turn.view.now;
    const target = SEAMS[index];
    const pros = now.prospector ?? { x: now.hero.x, z: now.hero.z };
    const gap = Math.hypot(pros.x - target.x, pros.z - target.z);
    const cut = sim.pressure.diagnostics.seams[index].harvested;
    if (cut) {
      arrivals.push({ seam: index, turn: turns, wave: now.wave, gap: Number(gap.toFixed(2)) });
      index += 1;
      dwell = 0;
    } else dwell = gap <= 1.4 ? dwell + 1 : 0;
    const receipt = sim.submitOrders([{ verb: 'HOLD', pos: target }]);
    if (!receipt.outcome.ok) throw new Error(`orders rejected: ${receipt.outcome.reason}`);
    process.stderr.write(`t${turns} w${now.wave} seam${index} pros=(${pros.x.toFixed(1)},${pros.z.toFixed(1)})`
      + ` gap=${gap.toFixed(1)} dwell=${dwell} coal=${sim.pressure.diagnostics.coal}`
      + ` cut=${sim.pressure.diagnostics.seams.map((s) => (s.harvested ? 1 : 0)).join('')}`
      + ` pressure=${sim.pressure.stored}\n`);
    turn = sim.advanceToTurn();
    turns += 1;
  }
  const diagnostics = sim.pressure.diagnostics;
  process.stdout.write(`${JSON.stringify({
    schema: 'goldrush.e2coalreach.v1',
    contractId,
    seed,
    seamSource: diagnostics.seamSource,
    turns,
    boilersPlaced: boilers,
    seamsCut: diagnostics.seams.filter((entry) => entry.harvested).length,
    seams: diagnostics.seams.map((entry) => ({ x: entry.x, z: entry.z, harvested: entry.harvested })),
    arrivals,
    coalInBunker: diagnostics.coal,
    pressureStored: sim.pressure.stored,
    vents: diagnostics.vents,
    terminal: turn.terminal,
    // The probe stops the moment the third seam is cut, so the contract is normally still running:
    // `outcome()` throws before terminal by design and reachability is not an outcome claim.
    outcome: turn.terminal ? sim.outcome() : null,
  })}\n`);
} finally {
  Object.assign(console, originalConsole);
  await vite.close();
}
