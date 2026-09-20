#!/usr/bin/env node

/**
 * THE AGENT-DOOR ASSAY INSTRUMENT — replays a headless-door tape through the engine that wrote it.
 *
 * WHY THIS EXISTS (F-ASSAY-E2E-3, measured 2026-08-22). A tape whose entries carry `agent_orders`
 * was recorded by `HeadlessContractSim` through `scripts/gr-sim.mjs`; it is NOT a browser
 * recording. Replaying one in the browser instrument cannot reproduce it, and the reason is not a
 * missing wire — the two engines do not agree on the world at tick 0. Census taken on
 * `the-claim` / `e1-the-claim-01`, before any order was applied:
 *
 *   gr-sim   gold-seam-1 @anchor4 (18,-7) LIVE · gold-seam-2 @anchor1 (-9,6.7) LIVE · gold-seam-3 @anchor3 (7.5,6.5) LIVE
 *   browser  gold-seam-1 @anchor4 (18,-7) LIVE · gold-seam-2 @anchor5 (25,6.9) LIVE · gold-seam-3 DARK
 *
 * Two live seams against three, and a shared id standing at a different anchor. Every downstream
 * divergence follows from that, so a browser replay of an agent tape is not a verification of it.
 * The honest verifier for a claim is the engine that can reproduce the claim.
 *
 * WHAT IT VERIFIES. The tape declares seed + `runStart` + an order stream at fixed ticks. This
 * instrument installs the declared start, replays the stream tick-for-tick, and reports what the
 * sim actually did — the same `eventLogHash` shape the recorder wrote and the same four outcome
 * fields the worker compares. Nothing is trusted: an order the run refuses stays refused, and a
 * refusal changes the hash, which is exactly how a fabricated stream fails.
 *
 * Usage: node scripts/assay-replay-agent.mjs <reel.json>   (or import `replayAgentTape`)
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
/**
 * Anti-hang headroom for the steps a run takes while its clock is FROZEN — every pending secure
 * choice burns `Balance.offers.pickSeconds` of steps without moving `timeAlive`, so a tape's
 * `durationTicks` alone is not a bound on the work. Ten minutes of frozen steps is far past any
 * admitted contract's choice clocks; past it the instrument refuses rather than spins.
 */
const FROZEN_STEP_ALLOWANCE = 18_000;

/** A tape whose input log carries standing orders was written by the headless door, not a browser. */
export function isAgentTape(tape) {
  const streams = Array.isArray(tape?.inputLog?.streams) ? tape.inputLog.streams : [];
  const logs = [tape?.inputLog, ...streams];
  return logs.some((log) => Array.isArray(log?.entries)
    && log.entries.some((entry) => Array.isArray(entry?.a)
      && entry.a.some((action) => action !== null && typeof action === 'object' && action.kind === 'agent_orders')));
}

/**
 * Installs the module-level shims the game reads at import time, exactly as `scripts/gr-sim.mjs`
 * does, BEFORE any game module is loaded. `?debug` is what the door itself boots under.
 */
function installLocationShim(tape) {
  const location = new URL('http://gr-sim.local/');
  location.searchParams.set('debug', '');
  location.searchParams.set('contract', tape.contract);
  location.searchParams.set('seed', tape.seed);
  globalThis.location = location;
  globalThis.window = { location };
}

export async function replayAgentTape(rawTape) {
  installLocationShim(rawTape);
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null /* F-ASSAY-E2E-8: the replayer never edits files; default watching exhausts inotify on small boxes and crashed every live agent replay */ } });
  const quiet = { log: console.log, info: console.info, debug: console.debug };
  console.log = console.info = console.debug = () => undefined;
  try {
    const [
      { validateRunTape, RUN_TAPE_SIM_VERSION, agentOrdersEventLogHash },
      { snapshotStandingOrders },
      { applyDifficultyPreset, normalizeDifficultyPreset },
      { stableHash },
    ] = await Promise.all([
      vite.ssrLoadModule('/src/game/RunTape.ts'),
      vite.ssrLoadModule('/src/agent/StandingOrders.ts'),
      vite.ssrLoadModule('/src/game/Balance.ts'),
      vite.ssrLoadModule('/src/mp/LockstepClient.ts'),
    ]);

    // The county validator already ran server-side; running it again here means the instrument
    // never replays bytes it has not itself agreed are a tape (the worker feeds it raw queue rows).
    const tape = validateRunTape(rawTape);
    if (!tape) throw new Error('malformed tape');
    if (tape.simVersion !== RUN_TAPE_SIM_VERSION) throw new Error('sim version mismatch');
    if (!tape.runStart) throw new Error('legacy tape v1 is unverifiable');
    if (tape.inputLog.streams.length > 0) throw new Error('an agent tape carries no additional streams');

    // The recording applied its declared preset (gr-sim does so whenever one is named), so the
    // replay must too. `trail` is byte-identical to the shipped defaults, so the common case moves
    // nothing; `greenhorn` / `vein-hunter` genuinely change the world and must be installed.
    applyDifficultyPreset(normalizeDifficultyPreset(tape.difficulty));

    const sim = await bootDeclaredRun(vite, tape, stableHash);
    const orders = ordersByTick(tape);
    const applied = new Set();
    let steps = 0;
    while (!sim.isTerminal && steps < tape.inputLog.durationTicks + FROZEN_STEP_ALLOWANCE) {
      // A tape's `t` is a SIM-CLOCK tick, not a step index, and the two part company: while a
      // secure choice is pending the sim freezes `timeAlive` and runs the choice clock instead
      // (`HeadlessContractSim.step()` returns before `this.timeAlive += STEP_SECONDS`). Keying on
      // the sim's own clock is therefore the faithful mapping — it is the exact expression gr-sim
      // stamped each submission with (`round(sim.timeAlive * 30)`) — and it survives the freeze,
      // which a step counter does not. Submitted at the head of the tick and stepped afterwards,
      // the same order the recording used (`readOrders` answers the view, `advanceToTurn` steps).
      const tick = Math.round(sim.timeAlive * 30);
      if (!applied.has(tick)) {
        for (const order of orders.get(tick) ?? []) sim.submitOrders(order);
        applied.add(tick);
      }
      sim.advanceOneTick();
      steps += 1;
    }
    if (!sim.isTerminal) throw new Error(`tape ran out after ${steps} steps with the run still alive`);
    const unreached = [...orders.keys()].filter((tick) => !applied.has(tick));
    // Fail-honest: an order the replay never reached was never part of what this run proved.
    if (unreached.length) throw new Error(`the run ended before tick ${unreached[0]} of the order stream`);
    const outcome = sim.outcome();
    return {
      eventLogHash: agentOrdersEventLogHash(snapshotStandingOrders()),
      outcome: {
        secured: outcome.secured,
        waves: outcome.waves,
        gold: outcome.gold,
        timeAlive: outcome.timeMs / 1000,
      },
      ticks: steps,
      engine: 'headless-contract-sim',
      terminalEnemies: (sim.enemies?.all ?? []).filter((enemy) => enemy.isAlive).map((enemy) => ({
        kind: enemy.eliteKind ?? enemy.kind,
        component: enemy.bossComponentId,
        hp: Math.round(enemy.currentHp),
        x: Number(enemy.position.x.toFixed(1)),
        z: Number(enemy.position.z.toFixed(1)),
      })),
      works: (sim.build?.all ?? []).map((work) => ({ kind: work.kind, hp: Math.round(work.hp), x: work.position.x, z: work.position.z })),
    };
  } finally {
    Object.assign(console, quiet);
    await vite.close();
  }
}

/**
 * Boots the run under the progression the tape DECLARES (tape-contract §4). A virgin declaration
 * is booted with no storage at all — the exact condition the solo door records under, so the
 * replay's world is the recording's world. Anything else is installed into a scratch profile and
 * then CHECKED: a declaration this door cannot reproduce is refused rather than quietly ignored,
 * because a replay of a start state that was never installed proves nothing (law 5, fail-honest).
 */
async function bootDeclaredRun(vite, tape, stableHash) {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const boot = { contractId: tape.contract, seed: tape.seed };
  const declared = stableHash(tape.runStart);
  const virgin = new HeadlessContractSim(boot);
  if (stableHash(virgin.runStart) === declared) return virgin;

  const [{ FakeStorage }, { saveMetaProgress }, { saveResearchState }] = await Promise.all([
    vite.ssrLoadModule('/src/sim/FakeStorage.ts'),
    vite.ssrLoadModule('/src/game/MetaProgress.ts'),
    vite.ssrLoadModule('/src/meta/ResearchTree.ts'),
  ]);
  const storage = new FakeStorage();
  saveMetaProgress(storage, tape.runStart.meta);
  saveResearchState(storage, tape.runStart.research);
  const progressed = new HeadlessContractSim(boot, { storage });
  if (stableHash(progressed.runStart) !== declared) {
    throw new Error('declared runStart is not installable by this door');
  }
  return progressed;
}

function ordersByTick(tape) {
  const byTick = new Map();
  for (const entry of tape.inputLog.entries) {
    const orders = [];
    for (const action of entry.a) {
      // No silent drops: an agent tape carrying a verb this door cannot honour is refused, never
      // replayed minus the part that did not fit (Mistake #14 — reject, do not stretch).
      if (action.kind !== 'agent_orders') throw new Error(`agent tape carries a non-order action: ${action.type ?? 'unknown'}`);
      orders.push(action.orders);
    }
    if (orders.length) byTick.set(entry.t, [...(byTick.get(entry.t) ?? []), ...orders]);
  }
  return byTick;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write('Usage: node scripts/assay-replay-agent.mjs <reel.json>\n');
    process.exit(1);
  }
  try {
    const payload = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
    const replay = await replayAgentTape(payload?.reel ?? payload);
    process.stdout.write(`${JSON.stringify(replay)}\n`);
  } catch (error) {
    process.stderr.write(`assay replay failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
