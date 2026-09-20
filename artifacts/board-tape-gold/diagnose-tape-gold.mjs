#!/usr/bin/env node

/**
 * F-2464 DIAGNOSIS INSTRUMENT — replays one heat-12 agent tape and reports the gold the county
 * COULD publish at each of the three candidate ticks the master names:
 *
 *   secure tick      — the tick `run_secured` fires (the claim is won)
 *   end of run       — the terminal tick of the replay as the county replays it (bank default)
 *   end of overtime  — the terminal tick when the same order stream is replayed with the rush
 *                      default installed (`boot.overtime`), i.e. the run keeps playing past secure
 *
 * and, at each, BOTH quantities the codebase currently calls "gold":
 *
 *   held   = `economy.gold`         (spendable purse — what `outcome().gold` rounds, HeadlessContractSim.ts:2016)
 *   panned = `summarizeLog().panned` (lifetime earnings — what the secure snapshot floors, HeadlessContractSim.ts:2032)
 *
 * Read-only: it boots the same engine the assayer boots and never posts anything.
 *
 * Usage: node artifacts/board-tape-gold/diagnose-tape-gold.mjs <submission.json> [--overtime]
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function installLocationShim(tape) {
  const location = new URL('http://gr-sim.local/');
  location.searchParams.set('debug', '');
  location.searchParams.set('contract', tape.contract);
  location.searchParams.set('seed', tape.seed);
  globalThis.location = location;
  globalThis.window = { location };
}

const inputPath = process.argv[2];
const overtime = process.argv.includes('--overtime');
if (!inputPath) {
  process.stderr.write('Usage: diagnose-tape-gold.mjs <submission.json|reel.json> [--overtime]\n');
  process.exit(1);
}

const payload = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
const tape = payload?.tape ?? payload?.reel ?? payload;
const declared = payload?.score ?? null;

installLocationShim(tape);
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const quiet = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;
let out;
try {
  const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const { summarizeLog } = await vite.ssrLoadModule('/src/game/Economy.ts');

  const session = new AgentTapeReplaySession(tape);
  // `private` is a TypeScript-only marker; the property is an ordinary field at runtime.
  const sim = session.sim;
  if (overtime) sim.boot.overtime = true;

  const purse = () => ({
    held: sim.economy.gold,
    panned: summarizeLog(sim.economy.log).panned,
    spent: summarizeLog(sim.economy.log).spent,
  });

  let secure = null;
  let steps = 0;
  const ceiling = session.durationTicks + 18_000;
  while (!session.complete && steps < ceiling) {
    session.advanceOneTick();
    steps += 1;
    if (!secure && sim.bankedSecuredSnapshot) {
      secure = {
        tick: session.tick,
        timeAlive: sim.timeAlive,
        wave: sim.waves.diagnostics.wave,
        bankedSecuredSnapshot: sim.bankedSecuredSnapshot,
        purse: purse(),
      };
    }
  }

  const endPurse = purse();
  let result = null;
  let resultError = null;
  try { result = session.result(); } catch (error) { resultError = error instanceof Error ? error.message : String(error); }

  out = {
    tape: { id: tape.id, contract: tape.contract, seed: tape.seed, eventLogHash: tape.eventLogHash, outcome: tape.outcome },
    declaredScore: declared,
    mode: overtime ? 'rush-default (overtime)' : 'bank-default (the county replay)',
    steps,
    complete: session.complete,
    secureTick: secure,
    endOfRun: {
      tick: session.tick,
      timeAlive: sim.timeAlive,
      wave: sim.waves.diagnostics.wave,
      purse: endPurse,
      secureChoice: sim.secureChoice,
      securedWave: sim.securedWave,
    },
    replayResult: result,
    resultError,
  };
} finally {
  Object.assign(console, quiet);
  await vite.close();
}
process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
