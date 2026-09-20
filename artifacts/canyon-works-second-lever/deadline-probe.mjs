// THE DEADLINE, MEASURED. `HeadlessContractSim.syncCanyonConnectObjective` sets `failed` on the
// first tick after the deadline wave; the view log a scripted ride prints is one row per TURN, so
// it can only bracket that instant. This probe steps the sim tick by tick with an unkillable hero
// and NO beacons, and records the exact tick, run-second and wave at which the latch flips — the
// number the briefing card and the tour plan are both written against.
//
//   node artifacts/canyon-works-second-lever/deadline-probe.mjs
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';

const location = new URL('http://canyon-deadline.probe/?debug');
globalThis.location = location;
globalThis.window = { location };
console.log = () => undefined;
console.info = () => undefined;
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let out;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const contract = loadContract('e3-canyon-works');
  const sim = new HeadlessContractSim({ contractId: 'e3-canyon-works', seed: 'e3-canyon-works-01', mode: 'escort' });
  sim.hero.applyStats(100_000, 1);
  sim.hero.heal(100_000);
  const read = () => sim.surface.tools.get_state().outcome.state.canyonConnect;
  const waveStarts = new Map();
  let flip = null;
  const maxTicks = 30 * 60 * 12; // twelve minutes of run time is far past any wave-9 boundary
  for (let tick = 0; tick < maxTicks; tick += 1) {
    const wave = sim.waves.diagnostics.wave;
    if (!waveStarts.has(wave)) waveStarts.set(wave, +sim.timeAlive.toFixed(2));
    const before = read();
    if (before.failed) { flip = flip ?? { tick, runSeconds: +sim.timeAlive.toFixed(2), wave, state: before }; break; }
    sim.step();
    sim.hero.heal(100_000);
  }
  out = {
    contract: 'e3-canyon-works',
    seed: 'e3-canyon-works-01',
    authored: { required: contract.twist.powerGrid.connect.required, byWave: contract.twist.powerGrid.connect.byWave },
    latchFailedAt: flip,
    waveStarts: [...waveStarts].map(([wave, runSeconds]) => ({ wave, runSeconds })),
  };
} finally {
  await vite.close();
}
writeFileSync(new URL('./deadline-probe.json', import.meta.url), `${JSON.stringify(out, null, 1)}\n`);
process.stdout.write(`${JSON.stringify(out, null, 1)}\n`);
