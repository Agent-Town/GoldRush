/**
 * MEASURE FIRST — the per-WAVE fortune of one Eclipse ride, replayed tick for tick.
 *
 *   node artifacts/eclipse-winnable/measure-ride.mjs <label> <tapePath>
 *
 * WHY A SECOND PROBE beside `artifacts/e8-air-wall-all-maps/measure-ride.mjs`: that one answers
 * "when did the suit empty", which is the AIR question, and the air question is settled (F-EAWA-1:
 * the wall is crossable and is not what kills the run). The question this slice has to answer is
 * the SURVIVAL question — at which wave does the fort stop growing, what does the board weigh by
 * then, and which wave takes the hero's last hit point — so this probe samples the fort, the
 * purse, the kills, the board and the hero once a second and folds them to one row per wave.
 *
 * It is the same instrument for both rides (heat 12's promoted attempt and the air-wall prover's
 * tape), so the two tables are comparable line for line. Nothing here changes the run: the session
 * replays the tape's own order stream and the probe only READS. The replay's `eventLogHash` is
 * printed beside the tape's own, so a reader can see the replay reproduced the ride rather than
 * approximated it (the one-tape-per-process law of the sibling probe holds here too: the location
 * shim must be installed before any game module is imported).
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(root, 'artifacts/eclipse-winnable');
const SAMPLE_EVERY = 30; // one sample a second at the sim's fixed 1/30 s step.

const label = process.argv[2];
const tapeArg = process.argv[3];
if (!label || !tapeArg) {
  process.stderr.write('Usage: node artifacts/eclipse-winnable/measure-ride.mjs <label> <tapePath>\n');
  process.exit(1);
}
const tapePath = path.resolve(root, tapeArg);
const tape = JSON.parse(await readFile(tapePath, 'utf8'));

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
  const air = () => (sim.atmosphere?.isDeclared ? sim.atmosphere : sim.suitAir?.isDeclared ? sim.suitAir : null);
  const consumer = air();
  const samples = [];
  let steps = 0;
  let solarOfflineAt = null;
  const sample = () => {
    const seconds = Number((steps / 30).toFixed(3));
    const diagnostics = consumer ? consumer.diagnostics : null;
    const works = sim.build.diagnostics.hp.filter((work) => !work.wrecked);
    const byKind = {};
    for (const work of works) byKind[work.id] = (byKind[work.id] ?? 0) + 1;
    const enemies = sim.enemies.all.filter((enemy) => enemy.isAlive);
    if (solarOfflineAt === null && diagnostics?.eclipse?.solar === 'offline') solarOfflineAt = seconds;
    samples.push({
      t: seconds,
      wave: sim.waves.diagnostics.wave,
      gold: sim.economy.gold,
      kills: sim.kills,
      heroHp: Number(sim.hero.hp.toFixed(2)),
      heroMaxHp: sim.hero.maxHp,
      threats: enemies.length,
      thieves: enemies.filter((enemy) => enemy.isThief).length,
      wreckers: enemies.filter((enemy) => enemy.isWrecker).length,
      turrets: byKind.turret ?? 0,
      beacons: byKind.sentry_beacon ?? 0,
      turretTiers: works.filter((work) => work.id === 'turret').map((work) => work.tier),
      ruined: sim.build.diagnostics.hp.filter((work) => work.wrecked).length,
      suit: diagnostics?.suit.seconds ?? null,
      worked: diagnostics?.regolith?.worked.length ?? null,
      latch: diagnostics?.regolith?.complete ?? diagnostics?.crossing?.complete ?? null,
      solar: diagnostics?.eclipse?.solar ?? null,
    });
  };
  sample();
  while (!session.complete && steps < session.durationTicks + 18_000) {
    session.advanceOneTick();
    steps += 1;
    if (steps % SAMPLE_EVERY === 0) sample();
  }
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
  // ONE ROW PER WAVE, taken at the wave's LAST sample: the question is what the fort and the hero
  // looked like when that wave was done with them, not when it started.
  const byWave = new Map();
  for (const entry of samples) byWave.set(entry.wave, entry);
  report = {
    label,
    contract: tape.contract,
    seed: tape.seed,
    tape: path.relative(root, tapePath),
    reproducedTape: result.eventLogHash === tape.eventLogHash,
    replayRefusal,
    tapeEventLogHash: tape.eventLogHash ?? null,
    replayEventLogHash: result.eventLogHash,
    outcome: result.outcome,
    tapeOutcome: tape.outcome ?? null,
    solarOfflineAt,
    perWave: [...byWave.entries()].sort((a, b) => a[0] - b[0]).map(([wave, entry]) => ({ wave, ...entry })),
    samples,
  };
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

const out = path.join(OUT_DIR, `measure-${label}.json`);
await writeFile(out, `${JSON.stringify(report, null, 2)}\n`);
const { outcome, perWave } = report;
process.stdout.write(`${label} [${report.contract}/${report.seed}] secured=${outcome.secured} waves=${outcome.waves} gold=${outcome.gold} t=${outcome.timeAlive}s\n`);
process.stdout.write(`  replay reproduced the tape: ${report.reproducedTape} (${report.replayEventLogHash} vs ${report.tapeEventLogHash})\n`);
if (report.replayRefusal) process.stdout.write(`  REPLAY REFUSED: ${report.replayRefusal}\n`);
process.stdout.write(`  solar offline at ${report.solarOfflineAt}s\n`);
process.stdout.write('  wave |     t |  gold | kills |  heroHp | threats(th/wr) | turrets(tiers) | beacons | worked | suit\n');
for (const row of perWave) {
  process.stdout.write(`  ${String(row.wave).padStart(4)} | ${String(row.t).padStart(5)} | ${String(row.gold).padStart(5)} | ${String(row.kills).padStart(5)} | ${String(row.heroHp).padStart(7)} | ${String(row.threats).padStart(3)}(${row.thieves}/${row.wreckers}) | ${row.turrets}[${row.turretTiers.join(',')}] | ${row.beacons} | ${row.worked} | ${row.suit}\n`);
}
process.stdout.write(`  wrote ${path.relative(root, out)}\n`);
