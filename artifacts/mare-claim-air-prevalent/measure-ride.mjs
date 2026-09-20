/**
 * MEASURE FIRST — the suit timeline of one heat-12 E8 ride, replayed tick for tick.
 *
 *   node artifacts/mare-claim-air-prevalent/measure-ride.mjs e8-mare-claim
 *
 * WHY A REPLAY AND NOT THE RIDE'S OWN VIEW LOG. The ride's `*-views.ndjson` is sampled at TURN
 * boundaries (77 of them across 18 000 ticks on the Mare Claim), so it cannot answer "when did the
 * suit empty" to better than thirty seconds. `AgentTapeReplaySession` replays the tape through the
 * engine that wrote it and lets this probe read the air consumer's own diagnostics on any tick.
 * Nothing here changes the run: the session applies the tape's own order stream and the probe only
 * READS the consumer. The replay's `eventLogHash` and outcome are reported beside the tape's own,
 * so a reader can see the replay reproduced the ride rather than approximated it.
 *
 * ONE TAPE PER PROCESS, deliberately. `installLocationShim` must run BEFORE any game module is
 * imported (`scripts/assay-replay-agent.mjs:92`); the contract and seed a module graph was built
 * under cannot be changed afterwards. The first draft of this probe replayed all four tapes in one
 * process with no shim at all and every ride died inside two waves — a silent, believable, wrong
 * measurement. That is why the summary prints the hash comparison on every run.
 *
 * WHAT IT RECORDS: a once-a-second suit sample (air seconds, the dome the body breathes in, the
 * worked set), the second each ground was first worked, dome breach counts, and the totals the era
 * publishes (`drainedTotal`, `emptySeconds`, `runsOnAir`, `breathlessPans`).
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(root, 'artifacts/mare-claim-air-prevalent');
const SAMPLE_EVERY = 30; // one sample a second at the sim's fixed 1/30 s step.

const contractId = process.argv[2];
if (!contractId) {
  process.stderr.write('Usage: node artifacts/mare-claim-air-prevalent/measure-ride.mjs <contractId> [tapePath]\n');
  process.exit(1);
}
const tapePath = process.argv[3]
  ? path.resolve(root, process.argv[3])
  : path.join(root, 'artifacts/gauntlet-heat12-20260905/rides', contractId, 'work/attempt-1-tape.json');
const tape = JSON.parse(await readFile(tapePath, 'utf8'));

// The shims the game reads at import time, exactly as the canonical replayer installs them.
const location = new URL('http://gr-sim.local/');
location.searchParams.set('debug', '');
location.searchParams.set('contract', tape.contract);
location.searchParams.set('seed', tape.seed);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const quiet = { log: console.log, info: console.info, debug: console.debug };
console.log = console.info = console.debug = () => undefined;

let report;
try {
  const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const session = new AgentTapeReplaySession(tape);
  const sim = session.sim; // TS-private, readable at runtime; never written.
  const consumer = sim.atmosphere?.isDeclared ? sim.atmosphere : sim.suitAir?.isDeclared ? sim.suitAir : null;
  const samples = [];
  const firstWorked = new Map();
  let steps = 0;
  let firstEmptyAt = null;
  let latchClosedAt = null;
  const sample = () => {
    if (!consumer) return;
    const air = consumer.diagnostics;
    const seconds = Number((steps / 30).toFixed(3));
    for (const ground of air.regolith.worked) if (!firstWorked.has(ground)) firstWorked.set(ground, seconds);
    if (firstEmptyAt === null && air.suit.empty) firstEmptyAt = seconds;
    if (latchClosedAt === null && air.regolith.complete) latchClosedAt = seconds;
    samples.push({
      t: seconds,
      wave: sim.waves.diagnostics.wave,
      air: air.suit.seconds,
      inDome: air.suit.inDome,
      worked: air.regolith.worked.length,
      runsOnAir: air.regolith.runsOnAir,
      breathless: air.regolith.breathlessPans,
      complete: air.regolith.complete,
      ...(air.crossing ? { reached: air.crossing.reached.length } : {}),
      ...(air.eclipse ? { solar: air.eclipse.solar, after: air.eclipse.groundsWorkedAfter } : {}),
    });
  };
  sample();
  // The canonical replayer's own ceiling (`FROZEN_STEP_ALLOWANCE` = 18 000), not a tighter one: a
  // shorter loop reports "the run was still alive" for a run that simply ended a few ticks past the
  // tape's envelope, which is a different (and much milder) finding.
  while (!session.complete && steps < session.durationTicks + 18_000) {
    session.advanceOneTick();
    steps += 1;
    if (steps % SAMPLE_EVERY === 0) sample();
  }
  // A tape whose run no longer TERMINATES inside its own envelope is the ADR-004 case, not a probe
  // failure: `result()` refuses, and refusing is the finding. Recorded rather than thrown.
  let result;
  let replayRefusal = null;
  try {
    result = session.result();
  } catch (error) {
    replayRefusal = error instanceof Error ? error.message : String(error);
    const outcome = session.complete ? sim.outcome() : null;
    result = {
      eventLogHash: null,
      outcome: outcome
        ? { secured: outcome.secured, waves: outcome.waves, gold: outcome.gold, timeAlive: outcome.timeMs / 1000 }
        : { secured: false, waves: sim.waves.diagnostics.wave, gold: null, timeAlive: null },
    };
  }
  const final = consumer ? consumer.diagnostics : null;
  const withAir = samples.filter((entry) => entry.air > 0).length;
  report = {
    contract: contractId,
    seed: tape.seed,
    consumer: sim.atmosphere?.isDeclared ? 'E8AtmosphereSystem' : sim.suitAir?.isDeclared ? 'E8SuitAirSystem' : 'none',
    tape: path.relative(root, tapePath),
    // The honesty check: a replay that does not reproduce the tape is not a measurement of the ride.
    reproducedTape: result.eventLogHash === tape.eventLogHash,
    replayRefusal,
    tapeEventLogHash: tape.eventLogHash ?? null,
    replayEventLogHash: result.eventLogHash,
    replayTicks: steps,
    outcome: result.outcome,
    tapeOutcome: tape.outcome ?? null,
    air: final,
    timeline: {
      sampledSeconds: samples.length - 1,
      secondsWithAir: withAir,
      secondsEmpty: samples.length - withAir,
      firstEmptyAt,
      latchClosedAt,
      firstWorkedAt: [...firstWorked].map(([ground, at]) => ({ ground, at })).sort((a, b) => a.at - b.at),
    },
    samples,
  };
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

const out = path.join(OUT_DIR, `measure-${contractId}.json`);
await writeFile(out, `${JSON.stringify(report, null, 2)}\n`);
const { air, timeline, outcome } = report;
process.stdout.write(`${contractId} [${report.consumer}] secured=${outcome.secured} waves=${outcome.waves} gold=${outcome.gold} t=${outcome.timeAlive}s\n`);
process.stdout.write(`  replay reproduced the tape: ${report.reproducedTape} (${report.replayEventLogHash} vs ${report.tapeEventLogHash})\n`);
if (report.replayRefusal) process.stdout.write(`  REPLAY REFUSED: ${report.replayRefusal}\n`);
process.stdout.write(`  suit: ${timeline.secondsWithAir}/${timeline.sampledSeconds}s with air; first empty at ${timeline.firstEmptyAt}s; drained ${air?.suit.drainedTotal}s; empty ${air?.suit.emptySeconds}s\n`);
process.stdout.write(`  regolith: worked [${air?.regolith.worked.join(',')}] of ${air?.regolith.grounds} (required ${air?.regolith.required}); runsOnAir ${air?.regolith.runsOnAir}; breathless ${air?.regolith.breathlessPans}; latch closed at ${timeline.latchClosedAt}s\n`);
process.stdout.write(`  grounds first worked: ${timeline.firstWorkedAt.map((entry) => `#${entry.ground}@${entry.at}s`).join(' ') || 'none'}\n`);
process.stdout.write(`  domes: ${(air?.domes ?? []).map((dome) => `${dome.id} air=${dome.air} breaches=${dome.breaches}`).join(' | ')}\n`);
if (air?.crossing) process.stdout.write(`  crossing: ${air.crossing.reached.length}/${air.crossing.required} reached; breathless entries ${air.crossing.breathlessEntries}\n`);
if (air?.eclipse) process.stdout.write(`  eclipse: arrived=${air.eclipse.arrived} at wave ${air.eclipse.arrivedAtWave}; offline [${air.eclipse.offline.join(',')}]; reserve ${air.eclipse.reserve}; after ${air.eclipse.groundsWorkedAfter}/${air.eclipse.requiredAfter}\n`);
process.stdout.write(`  wrote ${path.relative(root, out)}\n`);
