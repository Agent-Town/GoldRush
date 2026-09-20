#!/usr/bin/env node

/**
 * IDLE-FLOOR PROBE for the pool-recycle prototype (owner-gated, F-CAP-2).
 *
 * Mirrors `scripts/gr-sim.mjs`'s solo `--policy=idle` driver EXACTLY — same location shim,
 * same wave ceiling, same terminal loop, same `sim.outcome()` — with ONE addition: the boot
 * carries `admissionProbe: true`, so the three REFUSED maps (showroom / picnic /
 * half-life-hollow) can be measured without being admitted. `null-floor-anchors.mjs` cannot
 * see them for exactly that reason: they are absent from `supportedContractIds()`.
 *
 * It also reports the pool census the floors file has no column for — alive, exhausted,
 * capacity, and the wave at which the 96-slot pool first saturated — because THAT is the
 * quantity under test.
 *
 * Usage: node artifacts/proto-pool-recycle/idle-probe.mjs --contract <id> --seed <seed>
 * Prints ONE json line on stdout.
 */

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 1) {
  const match = /^--([^=]+)=(.*)$/.exec(args[i]);
  const key = match?.[1] ?? args[i].replace(/^--/, '');
  options[key] = match?.[2] ?? args[++i];
}
if (!options.contract || !options.seed) throw new Error('Usage: idle-probe --contract <id> --seed <seed>');

const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', options.contract);
location.searchParams.set('seed', options.seed);
globalThis.location = location;
globalThis.window = { location };

const originalConsole = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

const root = fileURLToPath(new URL('../..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({
    contractId: options.contract,
    seed: options.seed,
    admissionProbe: true,
  });

  // Verbatim from gr-sim.mjs: F-E2S-1 boss grace, AP-15 overtime bound.
  const BOSS_GRACE_WAVES = 6;
  const secureWave = sim.manifest.twist.secureWave ?? 20;
  const waveCeiling = sim.manifest.twist.baron
    ? Math.max(secureWave, sim.manifest.twist.baron.wave) + BOSS_GRACE_WAVES
    : secureWave + 2;
  const OVERTIME_CEILING_WAVES = 50;
  Object.assign(console, originalConsole);

  // TS `private` is compile-time only; a probe may read the pool census the view omits.
  const pool = sim.enemies;
  const capacity = pool.capacity;
  const census = { alivePeak: 0, exhaustedPeak: 0, saturatedFirstWave: null, saturatedTurns: 0, turns: 0 };
  const sampleCensus = (wave) => {
    const alive = pool.activeCount;
    const exhausted = sim.atomic?.exhaustedCount() ?? 0;
    census.alivePeak = Math.max(census.alivePeak, alive);
    census.exhaustedPeak = Math.max(census.exhaustedPeak, exhausted);
    census.turns += 1;
    if (alive >= capacity) {
      census.saturatedTurns += 1;
      if (census.saturatedFirstWave === null) census.saturatedFirstWave = wave;
    }
  };

  let turn = sim.currentTurn();
  let endReason;
  while (true) {
    const rushing = turn.view.now.overtime === true;
    const overtimeCeiling = rushing && sim.bankedSecureWave !== null
      && turn.view.now.wave >= sim.bankedSecureWave + OVERTIME_CEILING_WAVES;
    if (!turn.terminal && (overtimeCeiling || (!rushing && turn.view.now.wave >= waveCeiling))) {
      sim.hero.hp = 0;
      sim.dead = true;
      endReason = overtimeCeiling ? 'overtime-ceiling' : 'wave-ceiling';
      turn = sim.currentTurn();
    }
    sampleCensus(turn.view.now.wave);
    if (turn.terminal) break;
    turn = sim.advanceToTurn();
  }

  const outcome = sim.outcome();
  process.stdout.write(`${JSON.stringify({
    contract: options.contract,
    seed: options.seed,
    policy: 'idle',
    secured: outcome.secured,
    waves: outcome.waves,
    kills: outcome.kills,
    gold: outcome.gold,
    timeMs: outcome.timeMs,
    eventLogHash: outcome.eventLogHash,
    endReason: endReason ?? outcome.endReason ?? null,
    poolCapacity: capacity,
    aliveEnd: pool.activeCount,
    alivePeak: census.alivePeak,
    exhaustedEnd: sim.atomic?.exhaustedCount() ?? 0,
    exhaustedPeak: census.exhaustedPeak,
    poolSaturatedFromWave: census.saturatedFirstWave,
    poolSaturatedTurns: census.saturatedTurns,
    turns: census.turns,
  })}\n`);
} finally {
  Object.assign(console, originalConsole);
  await vite.close();
}
