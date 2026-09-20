/**
 * E10S-3 evidence probe — the consumer's state table, the Law 2 terminals, the determinism table
 * and the engine hash, produced by the engine itself rather than transcribed. From the repo root:
 *
 *   node artifacts/e10s-3-preserve/determinism-probe.mjs > artifacts/e10s-3-preserve/determinism.json
 *
 * Four measurements, each answering one line of `tasks/e10s-3-preserve-consumer.md`:
 *
 *  A. THE STATE TABLE — one `HeadlessContractSim` run of `e10-ember-shore` sampled at the ticks the
 *     squall's own phase table names (`scripts/e10-squall-scheduler.test.mjs`), so warmth can be
 *     read against the phase that is draining it rather than against the clock.
 *  B. LAW 2 — the IDLE policy on both bench seeds (`e10-ember-shore-01`/`-02`), ridden to its own
 *     terminal with no orders ever submitted. It must not secure, and it must die; which of the two
 *     honest terminals fired is reported rather than assumed.
 *  C. DETERMINISM — every run above is performed TWICE and compared field for field.
 *  D. A STOKED VENT — the same seed with the minimum public-verb play that answers the squall
 *     (walk to the vent, stoke), to measure whether the spec's defaults make the vent keepable.
 *     This is a MEASUREMENT, not a tuning: the numbers are the contract's, untouched.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const SEEDS = [`${CONTRACT}-01`, `${CONTRACT}-02`];
const SAMPLE_TICKS = [1, 1801, 2041, 2400, 2790, 2791, 3031, 5071, 5821];
const TICKS = 3_100;

const location = new URL(`http://e10s3.probe/?debug&contract=${CONTRACT}&seed=${SEEDS[0]}`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const say = console.log;
console.log = console.info = console.debug = () => undefined;
let report;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { computeEngineHash } = await import(new URL('../../scripts/assay-replay-agent.mjs', import.meta.url));

  const open = (seed) => new HeadlessContractSim({ contractId: CONTRACT, seed, admissionProbe: true });
  const readVent = (sim) => sim.currentTurn().view.now.emberShore?.preserve ?? null;
  const readSquall = (sim) => sim.currentTurn().view.now.squall ?? null;

  // A — the state table, sampled through the engine's own fixed step.
  const stateTable = (seed) => {
    const sim = open(seed);
    const rows = [];
    for (let tick = 1; tick <= TICKS; tick += 1) {
      sim.advanceOneTick();
      if (!SAMPLE_TICKS.includes(tick)) continue;
      const vent = readVent(sim);
      const squall = readSquall(sim);
      rows.push({
        tick,
        phase: squall?.phase ?? null,
        blowing: squall?.blowing ?? null,
        warmth: vent?.warmth ?? null,
        alight: vent?.alight ?? null,
        guttered: vent?.guttered ?? null,
        decaying: vent?.decaying ?? null,
        squallsSurvived: vent?.squallsSurvived ?? null,
        pressShare: vent?.motePressure.pressShare ?? null,
        objectiveMet: vent?.objectiveMet ?? null,
      });
      if (vent?.guttered) break;
    }
    return rows;
  };

  // B/C — the idle floor on both seeds, twice each.
  const idle = SEEDS.flatMap((seed) => [1, 2].map((run) => {
    const sim = open(seed);
    let turn = sim.currentTurn();
    for (let decisions = 0; decisions < 800 && !turn.terminal; decisions += 1) turn = sim.advanceToTurn();
    const outcome = sim.outcome();
    const vent = turn.view.now.emberShore?.preserve ?? null;
    const squall = turn.view.now.squall ?? null;
    return {
      seed,
      run,
      terminal: turn.terminal,
      secured: outcome.secured,
      waves: outcome.waves,
      timeMs: outcome.timeMs,
      gold: outcome.gold,
      kills: outcome.kills,
      eventLogHash: outcome.eventLogHash,
      endReason: outcome.endReason ?? null,
      squallsStarted: squall?.squallsStarted ?? null,
      squallsCompleted: squall?.squallsCompleted ?? null,
      warmth: vent?.warmth ?? null,
      guttered: vent?.guttered ?? null,
      gutteredAtSeconds: vent?.gutteredAtSeconds ?? null,
      stokes: vent?.stoke.uses ?? null,
      objectiveMet: vent?.objectiveMet ?? null,
    };
  }));

  // D — the stoked vent. The minimum honest play with PUBLIC VERBS: STOKE FIRST (skill.md: "the
  // first actionable order owns that tick", so a persistent HOLD must come AFTER it, not before),
  // then HOLD at the vent so the Prospector stays inside the disc. Every refusal is counted rather
  // than swallowed, which is what makes this a measurement: where the vent cannot be kept, the
  // counters say WHY. No gold is minted anywhere (F-1741).
  const stokeOrders = (at) => [
    { verb: 'CONTEXT_ACTION', action: 'stoke' },
    { verb: 'HOLD', pos: { x: at.x, z: at.z } },
  ];
  const stoked = [1, 2].map((run) => {
    const sim = open(SEEDS[0]);
    const vent = readVent(sim);
    const at = vent?.position ?? { x: 0, z: 0 };
    sim.submitOrders(stokeOrders(at));
    let turn = sim.currentTurn();
    for (let decisions = 0; decisions < 800 && !turn.terminal; decisions += 1) {
      turn = sim.advanceToTurn();
      if (!turn.terminal) sim.submitOrders(stokeOrders(at));
    }
    const outcome = sim.outcome();
    const final = turn.view.now.emberShore?.preserve ?? null;
    return {
      run,
      terminal: turn.terminal,
      secured: outcome.secured,
      waves: outcome.waves,
      eventLogHash: outcome.eventLogHash,
      endReason: outcome.endReason ?? null,
      warmth: final?.warmth ?? null,
      guttered: final?.guttered ?? null,
      stokes: final?.stoke.uses ?? null,
      refusals: final?.stoke.refusals ?? null,
      squallsSurvived: final?.squallsSurvived ?? null,
      objectiveMet: final?.objectiveMet ?? null,
    };
  });

  const table = SEEDS.map((seed) => ({ seed, runs: [stateTable(seed), stateTable(seed)] }));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const omitRun = ({ run, ...rest }) => rest;
  report = {
    contract: CONTRACT,
    seeds: SEEDS,
    stepSeconds: 1 / 30,
    sampledTicks: SAMPLE_TICKS,
    identical: table.every(({ runs }) => same(runs[0], runs[1]))
      && SEEDS.every((seed) => {
        const [first, second] = idle.filter((row) => row.seed === seed);
        return same(omitRun(first), omitRun(second));
      })
      && same(omitRun(stoked[0]), omitRun(stoked[1])),
    stateTable: table.map(({ seed, runs }) => ({ seed, rows: runs[0] })),
    idle,
    stoked,
    engineHash: await computeEngineHash(root),
  };
} finally {
  await vite.close();
}
say(JSON.stringify(report, null, 2));
