/**
 * MEASURE FIRST, PER BODY — where the HUMAN body actually stands on an Orbital ride.
 *
 *   node artifacts/e8-air-logical/measure-body.mjs <contractId> <tapePath> [outName]
 *
 * WHY THIS PROBE EXISTS. `artifacts/e8-air-wall-all-maps/measure-ride.mjs` samples the air
 * consumer's own dials, and every one of those dials is measured against the PROSPECTOR
 * (`E8AtmosphereSystem.update` and `E8SuitAirSystem.update` are both handed
 * `this.prospector.position`; `suit.body` is the literal `'prospector'`). The owner's 2026-09-07
 * directive is about HUMANS, and the human body on these maps is the hero — so the number nobody
 * had was: how much of a securing ride does the HERO spend outside pressurised ground?
 *
 * It reads, and never writes: the replay session applies the tape's own order stream and this probe
 * only samples positions. The replay's `eventLogHash` is compared with the tape's own on every run,
 * because a replay that does not reproduce the ride is not a measurement of it.
 *
 * WHAT IT RECORDS, once a second at the sim's fixed 1/30 s step: both bodies' positions, which
 * authored rectangle (if any) each stands in, and the consumer's own suit dial beside them — so the
 * two can be compared tick for tick.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(root, 'artifacts/e8-air-logical');
const SAMPLE_EVERY = 30;

const contractId = process.argv[2];
const tapeArg = process.argv[3];
const outName = process.argv[4] ?? `body-${contractId}`;
if (!contractId || !tapeArg) {
  process.stderr.write('Usage: node artifacts/e8-air-logical/measure-body.mjs <contractId> <tapePath> [outName]\n');
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

const inside = (zone, point) => point.x >= zone.minX && point.x <= zone.maxX && point.z >= zone.minZ && point.z <= zone.maxZ;

let report;
try {
  const { AgentTapeReplaySession } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const contract = loadContract(contractId);
  const tile = contract.tileParams;
  const zones = [
    ...(tile.buildZones ?? []),
    ...(tile.orbitalScaffoldZones ?? []),
    ...(tile.probeRecoveryZones ?? []),
  ];
  // Today's shelters, derived exactly as the two consumers derive them (read, never re-invented):
  // `suit-timer` maps take the `dome-cluster` build pads; `suit-only` maps take their authored
  // scaffolds, else the build zone holding the run's own start stake.
  const startStake = tile.stakeMarkers?.find((marker) => marker.heroStart) ?? null;
  const scaffolds = tile.orbitalScaffoldZones ?? [];
  const shelters = tile.atmosphere?.outsideDomes === 'suit-timer'
    ? (tile.buildZones ?? []).filter(({ id }) => id.startsWith('dome-cluster'))
    : scaffolds.length > 0
      ? scaffolds
      : (tile.buildZones ?? []).filter((zone) => startStake !== null && inside(zone, startStake));

  const session = new AgentTapeReplaySession(tape);
  const sim = session.sim;
  const consumer = sim.atmosphere?.isDeclared ? sim.atmosphere : sim.suitAir?.isDeclared ? sim.suitAir : null;
  const samples = [];
  let steps = 0;
  const sample = () => {
    const seconds = Number((steps / 30).toFixed(3));
    const hero = sim.hero.group.position;
    const agent = sim.prospector.position;
    const heroPoint = { x: Number(hero.x.toFixed(2)), z: Number(hero.z.toFixed(2)) };
    const agentPoint = { x: Number(agent.x.toFixed(2)), z: Number(agent.z.toFixed(2)) };
    const air = consumer ? consumer.diagnostics : null;
    samples.push({
      t: seconds,
      wave: sim.waves.diagnostics.wave,
      hero: heroPoint,
      heroHp: Number(sim.hero.hp.toFixed(1)),
      heroShelter: shelters.find((zone) => inside(zone, heroPoint))?.id ?? null,
      heroZone: zones.find((zone) => inside(zone, heroPoint))?.id ?? null,
      agent: agentPoint,
      agentShelter: shelters.find((zone) => inside(zone, agentPoint))?.id ?? null,
      agentZone: zones.find((zone) => inside(zone, agentPoint))?.id ?? null,
      ...(air ? { suitSeconds: air.suit.seconds, inDome: air.suit.inDome } : {}),
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
  const heroOut = samples.filter((entry) => entry.heroShelter === null).length;
  const agentOut = samples.filter((entry) => entry.agentShelter === null).length;
  const heroLongestOut = longestRun(samples.map((entry) => entry.heroShelter === null));
  report = {
    contract: contractId,
    seed: tape.seed,
    tape: path.relative(root, tapePath),
    reproducedTape: result.eventLogHash === tape.eventLogHash,
    replayRefusal,
    tapeEventLogHash: tape.eventLogHash ?? null,
    replayEventLogHash: result.eventLogHash,
    outcome: result.outcome,
    shelters: shelters.map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })),
    sampledSeconds: samples.length - 1,
    hero: {
      secondsOutsideShelter: heroOut,
      secondsInsideShelter: samples.length - heroOut,
      longestUnbrokenSecondsOutside: heroLongestOut,
      startedInside: samples[0].heroShelter !== null,
      distinctZones: [...new Set(samples.map((entry) => entry.heroZone).filter(Boolean))],
    },
    prospector: {
      secondsOutsideShelter: agentOut,
      secondsInsideShelter: samples.length - agentOut,
      distinctZones: [...new Set(samples.map((entry) => entry.agentZone).filter(Boolean))],
    },
    air: consumer ? consumer.diagnostics : null,
    samples,
  };
} finally {
  Object.assign(console, quiet);
  await vite.close();
}

function longestRun(flags) {
  let best = 0;
  let run = 0;
  for (const flag of flags) {
    run = flag ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

await writeFile(path.join(OUT_DIR, `${outName}.json`), `${JSON.stringify(report, null, 2)}\n`);
const { hero, prospector } = report;
process.stdout.write([
  `${report.contract} / ${report.seed} · tape ${report.reproducedTape ? 'REPRODUCED' : 'NOT REPRODUCED'}`,
  `  outcome secured=${report.outcome.secured} waves=${report.outcome.waves} t=${report.outcome.timeAlive}`,
  `  shelters: ${report.shelters.map((zone) => zone.id).join(', ') || '(none)'}`,
  `  HERO       outside ${hero.secondsOutsideShelter}/${report.sampledSeconds}s · longest unbroken ${hero.longestUnbrokenSecondsOutside}s · started ${hero.startedInside ? 'INSIDE' : 'OUTSIDE'} · zones ${hero.distinctZones.join('|') || '(none)'}`,
  `  PROSPECTOR outside ${prospector.secondsOutsideShelter}/${report.sampledSeconds}s · zones ${prospector.distinctZones.join('|') || '(none)'}`,
  '',
].join('\n'));
