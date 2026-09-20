/**
 * E10S-2 evidence probe — the determinism table and the engine hash, produced by the engines
 * themselves rather than transcribed. Run from the repo root:
 *
 *   node artifacts/e10s-2-squall/determinism-probe.mjs > artifacts/e10s-2-squall/determinism.json
 *
 * Two INDEPENDENT `HeadlessContractSim` runs of `e10-ember-shore`, each stepped 3,100 fixed ticks
 * (103.3s, one full squall cycle plus its rollover), reporting the phase transition log and the
 * run's `eventLogHash`. The browser's third column is `e2e/e10-ember-shore-squall.spec.ts`, which
 * asserts the same tick table through `Game`'s own update path.
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const SEED = 'e10-ember-shore-squall-probe';
const TICKS = 3_100;

const location = new URL(`http://e10s2.probe/?debug&contract=${CONTRACT}&seed=${SEED}`);
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const say = console.log;
console.log = console.info = console.debug = () => undefined;
let report;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { computeEngineHash } = await import(new URL('../../scripts/assay-replay-agent.mjs', import.meta.url));
  const sample = (squall) => ({
    ticks: squall.tick,
    phase: squall.phase,
    cycle: squall.cycle,
    squallsStarted: squall.squallsStarted,
    squallsCompleted: squall.squallsCompleted,
    transitions: squall.transitions,
  });

  // A — the CLOCK, sampled at a fixed tick count through the engine's own step. This is the
  // column the browser spec is compared against.
  const clock = [1, 2].map((run) => {
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED, admissionProbe: true });
    for (let tick = 0; tick < TICKS; tick += 1) sim.advanceOneTick();
    return { run, ...sample(sim.currentTurn().view.now.squall) };
  });

  // B — the WHOLE IDLE RUN, to its own terminal, for the `eventLogHash` the scheduler now rides.
  // Idle: no orders are ever submitted, which is the null-floor policy this map has no row for.
  const idle = [1, 2].map((run) => {
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED, admissionProbe: true });
    let turn = sim.currentTurn();
    for (let decisions = 0; decisions < 500 && !turn.terminal; decisions += 1) turn = sim.advanceToTurn();
    const outcome = sim.outcome();
    return { run, terminal: turn.terminal, ...sample(turn.view.now.squall), outcome };
  });

  const same = (rows, key) => JSON.stringify(rows[0][key]) === JSON.stringify(rows[1][key]);
  report = {
    contract: CONTRACT,
    seed: SEED,
    stepSeconds: 1 / 30,
    clockTicks: TICKS,
    identical: same(clock, 'transitions')
      && same(idle, 'transitions')
      && same(idle, 'outcome'),
    clock,
    idle,
    engineHash: await computeEngineHash(root),
  };
} finally {
  await vite.close();
}
say(JSON.stringify(report, null, 2));
